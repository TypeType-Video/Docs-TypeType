# Dépannage

Commencez par regarder ce que fait un service :

```sh
docker compose ps               # état de chaque service
docker compose logs -f <name>   # suivre un service, par exemple typetype-server
```

## Un port est déjà utilisé {#a-port-is-already-in-use}

`docker compose up` échoue avec une erreur « address already in use » ou « port is
allocated ». Un autre programme utilise ce port. Changez le `HOST_PORT_*`
correspondant dans `.env` (voir [Configuration](./configuration#ports)) et relancez
`docker compose up -d`.

## La page se charge mais les actions échouent avec des erreurs CORS ou réseau {#the-page-loads-but-actions-fail-with-cors-network-errors}

L'application web se charge, mais la connexion ou le chargement du contenu échoue.
Votre domaine manque dans `ALLOWED_ORIGINS`. Mettez-y votre vraie origine (par exemple
`https://watch.example.com`), puis `docker compose up -d`. Voir
[Proxy inverse et HTTPS](./reverse-proxy#before-you-start).

La correspondance est exacte : incluez le schéma et le port, et omettez la barre
oblique finale. Par exemple, une page ouverte sur `http://server.lan:32110` a besoin
de :

```dotenv
ALLOWED_ORIGINS=http://server.lan:32110
```

Recréez Server après avoir modifié `.env` :

```sh
docker compose up -d --force-recreate typetype-server
```

Cet échec précis du premier administrateur a été isolé avec
[hulmgulm dans la discussion #151](https://github.com/TypeType-Video/TypeType/discussions/151).

## Un service redémarre sans cesse {#a-service-keeps-restarting}

```sh
docker compose logs --tail=50 <name>
```

- `typetype-server` attend `postgres` et les conteneurs d'initialisation ; s'il
  redémarre, vérifiez que `postgres` est en bonne santé et que `DATABASE_*` est
  correct.
- `typetype` (web) dépend du serveur ; il est normal qu'il démarre quelques secondes
  après lui.

## Les téléchargements ne marchent pas {#downloads-do-not-work}

La fonction de téléchargement a besoin que le stockage objet soit configuré.
Assurez-vous d'avoir :

1. Mis de vraies valeurs pour `DOWNLOADER_S3_ACCESS_KEY` (commence par `GK`) et
   `DOWNLOADER_S3_SECRET_KEY` dans `.env`.
2. Lancé les étapes de provisionnement de Garage de
   [Installation manuelle, Partie 2](./docker-compose#part-2-object-storage-for-downloads).
3. Généré un vrai `GARAGE_RPC_SECRET` et redémarré Garage si ses journaux refusent le
   texte de remplacement.

Vérifiez que le stockage objet voit votre clé et votre bucket :

```sh
docker compose exec -T garage /garage bucket list
docker compose exec -T garage /garage key list
```

Le navigateur utilise `/api/downloader/...` ; il n'a pas besoin de résoudre le nom
d'hôte interne `garage`. Un `401 Authentication required` dans les journaux de
Downloader veut dire à la place que la requête d'extraction de la tâche n'a pas gardé
une session utilisateur valide. Joignez au signalement les journaux de Server et de
Downloader, ainsi que les cinq réponses de version des composants.

Cet échec a été mis en évidence en suivant
[le signalement de téléchargement sur iOS de nanhoes](https://github.com/TypeType-Video/TypeType/issues/116),
puis vérifié par rapport au parcours d'autorisation actuel de Server vers Downloader.

## La connexion distante à YouTube démarre, puis affiche un 404 {#remote-youtube-login-starts-then-shows-a-404}

Si la création de la session réussit mais que la route du navigateur renvoie `404`, le
WebSocket a probablement été transmis comme une requête HTTP normale. Vérifiez à
chaque couche de proxy la présence de :

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $connection_upgrade;
```

La configuration nginx prise en charge est incluse dans l'image web. Si la stack
utilise un montage sur mesure depuis l'hôte, comparez-le au fichier actuel du dépôt du
frontend. Voir
[Connexion distante et WebSockets](./reverse-proxy#remote-login-and-websockets) et le
[diagnostic d'origine de la communauté](https://github.com/TypeType-Video/TypeType/discussions/122).

## Déconnexions inattendues {#unexpected-sign-outs}

Un jeton d'accès de compte dure une heure, mais la session de renouvellement dure 30
jours par défaut. Le Frontend renouvelle automatiquement quand une requête
authentifiée renvoie `401` : une déconnexion au bout d'une heure n'est donc pas un
comportement normal attendu.

Vérifiez :

1. La page utilise HTTPS. Le cookie de renouvellement est `Secure` par défaut.
2. `ALLOWED_ORIGINS` contient l'origine exacte du navigateur.
3. Les requêtes de connexion et `/api/auth/refresh` incluent les identifiants et ne
   sont pas amputées par un proxy sur mesure.
4. Server utilise toujours le volume PostgreSQL qui contient la session de
   renouvellement.
5. Les réglages de confidentialité du navigateur ne rejettent pas le cookie de
   renouvellement `SameSite=None`.

Server génère un nouveau secret de signature JWT à chaque démarrage, sauf si un
déploiement sur mesure définit `JWT_SECRET`. Cela invalide l'ancien jeton d'accès
d'une heure, mais le renouvellement normal doit rétablir la situation aussitôt quand
la session PostgreSQL et le cookie de renouvellement sont toujours là. Un redémarrage
seul ne doit donc pas exiger une nouvelle connexion.

Pour une instance locale de confiance qui ne peut pas utiliser HTTPS, mettez
`AUTH_ALLOW_INSECURE_COOKIES=true` et recréez `typetype-server`. Cela affaiblit
volontairement la sécurité du transport des cookies et ne doit pas être utilisé sur un
réseau public ou non fiable. `AUTH_SESSION_TTL_DAYS` peut changer la durée de vie du
renouvellement, de 1 à 365 jours. Voir
[Durée de vie des sessions](./authentication#session-lifetime).

Si le problème persiste, relevez les journaux de Server autour de `/auth/refresh`, le
code de réponse dans le navigateur et les révisions déployées. N'incluez ni le cookie
ni aucun jeton.

Cette liste de vérifications fait suite au comportement inattendu signalé par
[Toni-Vide dans la discussion #162](https://github.com/TypeType-Video/TypeType/discussions/162).

## Une session YouTube enregistrée ne marche plus après un changement de secret {#a-saved-youtube-session-stopped-working-after-a-secret-change}

`YOUTUBE_SESSION_ENCRYPTION_KEY` chiffre les cookies YouTube et les jetons de lecture
stockés. Si vous la changez après que la connexion distante a servi, ces sessions
YouTube enregistrées ne peuvent plus être déchiffrées, et les utilisateurs concernés
doivent reconnecter YouTube. Elle ne chiffre pas la connexion au compte TypeType.
Choisissez la valeur une fois et gardez-la. La valeur générée est conservée dans
`typetype_secrets` : vous n'avez donc normalement pas à y toucher.

## La lecture se recharge et `/api/proxy` renvoie `422` {#playback-reloads-and-apiproxy-returns-422}

Une ancienne implémentation de la lecture envoyait des URL `googlevideo` signées par
`/api/proxy`. Ses premières requêtes de plage pouvaient renvoyer `206`, suivies de
réponses `422` contenant `{"error":"Upstream returned 403"}`. Le lecteur
reconstruisait alors la source en boucle, et Server pouvait journaliser
`ChannelWriteException` après que le navigateur avait fermé une réponse de proxy
abandonnée.

La lecture actuelle utilise une session SABR avec état et ne consomme pas ces URL de
médias signées par le même chemin tourné vers le navigateur. Si l'ancien schéma de
requêtes apparaît encore, vérifiez les cinq réponses de version des composants et
lancez :

```sh
docker compose config --images
```

Une sortie contenant `ghcr.io/priveetee/...` veut dire que le fichier Compose actif
pointe encore vers l'ancien espace de noms d'images. Suivez
[Migrer une ancienne stack Priveetee](./maintenance#migrate-an-older-priveetee-stack)
avant d'enquêter sur la connexion distante, l'adresse IP résidentielle ou le réglage
du proxy.

L'ancienne séquence d'échec et la mise à jour réussie ont été documentées par
[filippobaroni dans la discussion #133](https://github.com/TypeType-Video/TypeType/discussions/133#discussioncomment-17779201).

## Token est en bonne santé mais la lecture YouTube échoue {#token-is-healthy-but-youtube-playback-fails}

`/health` prouve seulement que le service Bun écoute. Les jetons PO, le décodeur, SABR
et le navigateur distant ont aussi besoin de Chromium via Playwright et de chemins
d'exécution inscriptibles.

Si vous avez appliqué un profil de conteneur sur mesure non root ou en lecture seule,
retestez séparément `/potoken`, une vidéo YouTube normale, un direct et la connexion
distante. Un utilisateur `nobody` arbitraire n'a pas de dossier personnel utilisable
pour le Crashpad de Chromium dans l'image actuelle. Revenez à la définition prise en
charge du service Token avant de traiter l'échec comme un bug de Server ou du Player.

Voir [Limite du navigateur de Token](./security#token-browser-boundary) et
[l'étude du conteneur par hugoghx](https://github.com/TypeType-Video/TypeType/discussions/156).

## Repartir de zéro {#start-over-from-scratch}

::: danger Ceci supprime vos données
`down -v` supprime les volumes de la base, du cache et du stockage objet.
:::

```sh
docker compose down -v
docker compose up -d
```

## Mettre à jour {#updating}

Stack gérée par l'installateur :

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes --dir "$STACK_DIR"
cd "$STACK_DIR"
docker compose ps
```

`$STACK_DIR` est le dossier de votre stack, `~/typetype-stack` sauf si vous en avez
choisi un autre : voir [Choisir le dossier](./quick-start#stack-directory).

Stack sans script, après avoir remplacé le fichier Compose et les scripts gérés par
ceux de la version actuelle, en gardant `.env` et tout override sur mesure :

```sh
docker compose config -q
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
```

Vos données vivent dans des volumes nommés : les mises à jour gardent donc vos comptes
et votre historique. Si une nouvelle version ne démarre pas correctement, suivez
[Revenir en arrière après une mise à jour](./rollback) au lieu de supprimer des
conteneurs ou des volumes.
