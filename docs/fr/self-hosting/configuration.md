# Configuration

La stack prise en charge lit les choix de déploiement dans `.env`. L'installateur crée et met à jour ce fichier pour vous. Pour une installation manuelle, copiez `.env.example`, remplacez les valeurs signalées ci-dessous et gardez le fichier hors du contrôle de version.

Toutes les variables internes des services n'ont pas leur place dans `.env` : le fichier Compose central déduit les URL internes et ne transmet à chaque conteneur que les réglages pris en charge. Utilisez un override Compose pour construire une topologie sur mesure.

## Ports web et de diagnostic {#ports}

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `HOST_PORT_WEB` | `8082` | Conteneur web public ; nginx sert l'application, l'API, les WebSockets, SABR et les téléchargements |
| `HOST_BIND_SERVER` | `127.0.0.1` | Adresse de l'hôte pour le port de diagnostic de Server |
| `HOST_PORT_SERVER` | `8080` | Port de diagnostic et d'accès direct à l'API de Server |
| `HOST_BIND_TOKEN` | `127.0.0.1` | Adresse de l'hôte pour le port de diagnostic de Token |
| `HOST_PORT_TOKEN` | `8081` | Port de santé et de version de Token |
| `HOST_BIND_GARAGE_S3` | `127.0.0.1` | Adresse de l'hôte pour le provisionnement et le diagnostic de Garage |
| `HOST_PORT_GARAGE_S3` | `3900` | Port S3 de Garage |

Seul `HOST_PORT_WEB` a besoin d'une entrée publique. Gardez les autres liaisons sur la boucle locale, sauf si un réseau de confiance précis en a besoin. Downloader, PostgreSQL et Dragonfly n'ont pas de port stable sur l'hôte dans le fichier Compose pris en charge.

La beta utilise les valeurs `HOST_PORT_*_BETA` et `HOST_BIND_*_BETA` correspondantes. Voir [Beta et main](./beta-and-main).

## Origines de navigateur autorisées {#allowed-browser-origins}

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | URL de développement en localhost | Origines de navigateur, séparées par des virgules, autorisées à appeler Server |

Une origine, c'est le schéma, l'hôte et le port éventuel, sans chemin ni barre oblique finale :

```dotenv
ALLOWED_ORIGINS=https://watch.example.com,http://192.0.2.10:8082
```

L'origine du navigateur doit correspondre exactement. Une page peut se charger normalement alors que l'inscription, la connexion ou d'autres actions de l'API échouent avec un `403` vide si cette valeur est fausse. Après un changement, recréez Server :

```sh
docker compose up -d --force-recreate typetype-server
```

Ce diagnostic a été confirmé par [le signalement du premier administrateur de hulmgulm](https://github.com/TypeType-Video/TypeType/discussions/151).

## Sessions de compte {#account-sessions}

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `AUTH_SESSION_TTL_DAYS` | `30` | Durée de vie de la session de renouvellement en jours, bornée entre `1` et `365` |
| `AUTH_ALLOW_INSECURE_COOKIES` | `false` | Autorise les cookies de renouvellement en HTTP simple avec `SameSite=Lax` |

Les jetons d'accès durent toujours une heure. Une session de renouvellement valide les renouvelle en silence : `AUTH_SESSION_TTL_DAYS` fixe donc combien de temps un compte peut rester connecté sans nouvelle connexion.

Gardez `AUTH_ALLOW_INSECURE_COOKIES=false` en HTTPS et pour tout déploiement public. Ne le mettez à `true` que lorsqu'une instance locale de confiance doit tourner en HTTP simple. Cela affaiblit la sécurité du transport ; voir [Durée de vie des sessions](./authentication#session-lifetime).

Recréez Server après avoir changé l'une ou l'autre valeur :

```sh
docker compose up -d --force-recreate typetype-server
```

## Base de données et cache {#database-and-cache}

Le service PostgreSQL fourni utilise ces valeurs :

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `POSTGRES_DB` | `typetype` | Base principale de l'application |
| `POSTGRES_USER` | `typetype` | Utilisateur PostgreSQL |
| `POSTGRES_PASSWORD` | `typetype` | Mot de passe PostgreSQL ; à remplacer pour un vrai déploiement |
| `DRAGONFLY_URL` | `redis://dragonfly:6379` | URL du cache de Server |
| `DRAGONFLY_MAX_MEMORY` | `2gb` | Mémoire que le cache peut utiliser. Plein, il oublie ses entrées les plus anciennes au lieu de refuser les nouvelles. |
| `DRAGONFLY_THREADS` | `4` | Fils d'exécution du cache. Dragonfly a besoin de 256 Mo de `DRAGONFLY_MAX_MEMORY` par fil et ne démarre pas avec moins. |

`POSTGRES_DB`, `POSTGRES_USER` et `POSTGRES_PASSWORD` sont la source de vérité au niveau de la stack. Compose en déduit les valeurs `DATABASE_*` de Server et le `DB_URL` de Downloader. Changez les valeurs PostgreSQL une seule fois, plutôt que de dupliquer un mot de passe dans plusieurs variables propres aux services.

Choisissez ces valeurs avant le premier démarrage. Une fois que PostgreSQL a initialisé son volume, changer `.env` seul ne change pas le mot de passe du rôle existant dans la base.

Cette disposition fait suite à l'incohérence relevée par [arcoast dans la discussion #123](https://github.com/TypeType-Video/TypeType/discussions/123).

Pour une base externe, définissez `DATABASE_URL`, `DATABASE_USER` et `DATABASE_PASSWORD` pour Server, et `DB_URL` pour Downloader, avec un override Compose. Dans la conception actuelle, Downloader a besoin de sa propre base `typetype_downloader`.

## Téléchargements et Garage {#downloads-and-garage}

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `DOWNLOADER_S3_ACCESS_KEY` | texte de remplacement | Clé d'accès Garage ; doit commencer par `GK` |
| `DOWNLOADER_S3_SECRET_KEY` | texte de remplacement | Secret de la clé d'accès Garage |
| `GARAGE_RPC_SECRET` | texte de remplacement | Secret RPC du cluster Garage, 32 octets en hexadécimal |

L'installateur génère les trois valeurs et provisionne le bucket. Une installation sans script doit remplacer les textes de remplacement et suivre [Installation manuelle, Partie 2](./docker-compose#part-2-object-storage-for-downloads).

Le Downloader fourni utilise `http://garage:3900` à la fois pour son client S3 et pour l'URL présignée de l'artefact. Server reconnaît ce nom d'hôte interne et relaie le fichier terminé au navigateur. Il n'y a pas de variable `DOWNLOADER_S3_PUBLIC_ENDPOINT` requise dans le `.env` pris en charge.

La génération de `GARAGE_RPC_SECRET` a été ajoutée après que [arcoast a signalé le secret manquant dans la discussion #130](https://github.com/TypeType-Video/TypeType/discussions/130).

## Configuration fournie et configuration sur mesure des services {#bundled-and-custom-service-configuration}

L'image web possède la configuration nginx prise en charge. La stack centrale ne monte pas de `nginx.conf` depuis l'hôte : les correctifs du proxy arrivent donc avec les mises à jour normales de l'image web.

Le service d'initialisation `garage-config` écrit la configuration par défaut de Garage dans le volume nommé `garage_config` uniquement quand ce volume ne contient pas déjà une configuration. Un contenu existant n'est jamais écrasé. Lors de la migration depuis une ancienne stack, l'installateur met de côté l'ancien `garage.toml` de l'hôte et le service d'initialisation l'importe à la première utilisation.

Gardez les changements voulus de nginx ou de Garage dans des fichiers séparés et montez-les par `docker-compose.override.yml`. L'installateur conserve l'override et ne remplace pas les fichiers de configuration qu'il ne gère pas. Voir [Configuration nginx ou Garage sur mesure](./docker-compose#custom-nginx-or-garage-configuration) pour un exemple.

## YouTube et Token {#youtube-and-token}

Token reste activé parce que la lecture YouTube utilise ses points d'accès pour les jetons PO, le décodeur, les sous-titres et SABR. Le drapeau suivant ne commande que la connexion distante interactive :

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `YOUTUBE_REMOTE_LOGIN_ENABLED` | `false` | Active la connexion interactive à YouTube |
| `YOUTUBE_OUTBOUND_PROXY_URL` | vide | Proxy sortant optionnel utilisé pour le trafic YouTube |
| `YOUTUBE_REMOTE_LOGIN_CALLBACK_BASE_URL` | `http://localhost:8080` | Origine interne de Server qui reçoit le rappel de fin de Token |
| `YOUTUBE_REMOTE_LOGIN_CALLBACK_ORIGIN` | `http://typetype-server:8080` | Origine interne de rappel utilisée par Token |
| `YOUTUBE_REMOTE_LOGIN_TTL_MS` | `480000` | Durée de vie demandée par Server, bornée entre 1 et 10 minutes |
| `YOUTUBE_REMOTE_LOGIN_MAX_SESSIONS` | `2` | Sessions de navigateur distant simultanées, bornées entre 1 et 8 |
| `YOUTUBE_REMOTE_LOGIN_FRAME_FPS` | `10` | Cadence de capture de la vue de connexion |
| `YOUTUBE_REMOTE_LOGIN_MAX_FRAME_BYTES` | `524288` | Taille maximale d'une image de connexion encodée |

Gardez le rappel par défaut sur une URL interne de Server. Le navigateur atteint la session de connexion par l'origine web publique et un WebSocket ; il n'appelle pas directement cette adresse de rappel.

Les deux réglages de rappel doivent utiliser la même origine interne de Server dans une stack Compose sur mesure. Donnez à `YOUTUBE_REMOTE_LOGIN_CALLBACK_BASE_URL` sur Server et à `YOUTUBE_REMOTE_LOGIN_CALLBACK_ORIGIN` sur Token le nom d'hôte et le port que Token peut joindre sur le réseau Compose, par exemple `http://typetype-server:8080`. N'utilisez l'URL web publique pour aucun des deux.

Dans le fichier Compose pris en charge, Token garde son propre plafond par défaut de huit minutes, parce que cette variable de durée n'est transmise qu'à Server. Les valeurs au-dessus de huit minutes ne prolongent donc pas la réservation effective sans une configuration de Token sur mesure.

Les stacks Compose sur mesure qui renomment le service `typetype-token` doivent définir la variable actuelle du point d'accès interne de Server, `SUBTITLE_SERVICE_URL`, ou garder `typetype-token` comme alias réseau. Voir [Noms sur mesure du service Token](./security#custom-token-service-names).

## Limites de requêtes vers YouTube {#youtube-request-limits}

Une instance joint YouTube par une seule adresse, et YouTube refuse une adresse qui demande trop : les vidéos ouvertes se mettent à échouer avec « Sign in to confirm you're not a bot », pendant plus de dix minutes. La recherche, les pages de chaînes et les pages de vidéos tolèrent bien plus que l'ouverture de vidéos.

Server lit ces valeurs dans son propre environnement. Le fichier Compose pris en charge ne les transmet pas : fixez-les avec un override Compose sur `typetype-server`.

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `YOUTUBE_OPENS_PER_MINUTE` | `0` (pas de limite) | Vidéos que toute l'instance ouvre chez YouTube en une minute. Au-delà, chaque vidéo attend son tour, 30 secondes au plus. Une vidéo que personne n'attend ne fait jamais la queue : elle part tout de suite ou pas du tout. |
| `YOUTUBE_SESSION_RENEWAL` | activé | Après trois vidéos refusées en une minute, Server demande une nouvelle session à Token, une fois, puis attend deux minutes. `off` le désactive. |
| `YOUTUBE_LIVE_PROBE` | client des directs d'abord | `after` interroge d'abord le client habituel, et le client des directs seulement pour ce qu'il dit être en direct. À utiliser sur une instance chargée : le client des directs traite une vidéo à la fois. |
| `STREAM_PREVIEWS` | activé | `off` refuse toute vidéo demandée avant que quelqu'un la regarde, par exemple au survol d'une carte. |
| `SABR_INITIALIZATION_RANGE` | activé | `off` saute une requête que YouTube refuse à chaque lecture pour certaines adresses. |
| `EXTRACTOR_SIMULTANEOUS_REQUESTS_PER_HOST` | `64` | Requêtes que l'extracteur peut avoir en cours vers un même hôte en même temps |
| `EXTRACTOR_HTTP_VERSION` | HTTP/2 | `1` utilise une requête par connexion. À utiliser si Server cesse de répondre sous une foule alors que son processeur est au repos. |
| `SUBSCRIPTION_FEED_MAX_CONCURRENT_FETCHES` | `20` | Pages de chaînes demandées en même temps quand un flux d'abonnements est construit ; ne peut qu'être abaissé |
| `SUBSCRIPTION_FEED_FRESHNESS_SECONDS` | `60` | Âge qu'un flux d'abonnements peut avoir avant que sa lecture lance un rafraîchissement ; ne peut qu'être relevé, jusqu'à un jour |
| `YOUTUBE_REQUEST_LOG` | désactivé | `1` écrit une ligne de journal par requête envoyée à YouTube. Pour le diagnostic seulement. |

```yaml
services:
  typetype-server:
    environment:
      YOUTUBE_OPENS_PER_MINUTE: "120"
      YOUTUBE_LIVE_PROBE: after
```

Enregistrez-le sous `docker-compose.override.yml` dans le dossier de la stack, puis recréez Server :

```sh
docker compose up -d --force-recreate typetype-server
```

Server ne demande jamais de lui-même à YouTube le texte d'une piste de sous-titres ; c'est l'adresse que YouTube surveille le plus étroitement.

## Service de recommandations {#recommender}

Le service de recommandations optionnel a sa propre page, avec ses prérequis et tous ses réglages : [Service de recommandations](./recommender).

## Secrets YouTube {#secrets-handled-automatically}

| Variable | Rôle |
| --- | --- |
| `YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN` | Authentifie les rappels de connexion distante entre Server et Token |
| `YOUTUBE_SESSION_ENCRYPTION_KEY` | Chiffre les identifiants de session YouTube stockés |

Le conteneur d'initialisation `typetype-secrets` les écrit dans un volume nommé privé. Des valeurs vides et les textes `SET_ME_...` font générer une valeur au premier démarrage. Fournir une vraie valeur dans `.env` remplace le fichier généré.

Ne changez pas `YOUTUBE_SESSION_ENCRYPTION_KEY` à la légère : les sessions YouTube déjà stockées ne peuvent pas être déchiffrées avec une autre clé.

## OIDC {#oidc}

Les variables OIDC sont prises en charge par Server mais ne font pas partie du `.env.example` de base. Ajoutez-les par un override Compose, comme décrit dans [Authentification (OIDC)](./authentication). Les variables de Server prises en charge sont :

- `OIDC_ISSUER` (ou `OIDC_ISSUER_URL`);
- `OIDC_CLIENT_ID`;
- `OIDC_CLIENT_SECRET`;
- en option, `OIDC_DISCOVERY_URL`, `OIDC_SCOPES` et `OIDC_PROVIDER_NAME`.

## Images de remplacement {#image-overrides}

Laissez-les vides pour suivre les étiquettes d'images normales, stable ou beta :

| Stable | Beta |
| --- | --- |
| `TYPETYPE_WEB_IMAGE` | `TYPETYPE_WEB_BETA_IMAGE` |
| `TYPETYPE_SERVER_IMAGE` | `TYPETYPE_SERVER_BETA_IMAGE` |
| `TYPETYPE_DOWNLOADER_IMAGE` | `TYPETYPE_DOWNLOADER_BETA_IMAGE` |
| `TYPETYPE_TOKEN_IMAGE` | `TYPETYPE_TOKEN_BETA_IMAGE` |
| `TYPETYPE_RECOMMENDER_IMAGE` | `TYPETYPE_RECOMMENDER_IMAGE` |

Donnez-leur des références immuables `ghcr.io/...@sha256:...` pour un retour arrière ou un déploiement figé. Voir [Revenir en arrière après une mise à jour](./rollback).

## Signalements de bugs {#bug-reports}

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `GITHUB_REPO` | `TypeType-Video/TypeType` | Dépôt visé par le lien de signalement dans l'application |
| `GITHUB_ISSUE_TEMPLATE` | `bug_report_backend.md` | Nom du fichier de modèle ajouté au lien de signalement dans l'application |

::: warning Décalage actuel avec le suivi central
Le dépôt visé et le modèle livrés ne correspondent pas actuellement : `bug_report_backend.md` existe dans TypeType-Server, pas dans le dépôt central TypeType. Le sélecteur central propose bien `bug_report.yml`, mais ce fichier est un formulaire d'issue structuré dont les champs ont leurs propres identifiants de requête ; le générateur de l'application envoie un seul `body` en Markdown. Remplacer le nom du fichier par `bug_report.yml` n'est donc pas un correctif équivalent pour le préremplissage du diagnostic.
:::

Quand vous visez un fork ou un autre dépôt, utilisez un modèle compatible avec l'URL qu'attend son parcours d'issues. Voir la limite actuelle et le chemin de signalement manuel dans [Signaler un problème](./reporting-issues#from-inside-the-app).

## Valider la configuration résolue {#validate-the-resolved-configuration}

Compose peut afficher le graphe final des services sans le démarrer :

```sh
docker compose config -q
docker compose config
```

La deuxième commande développe les variables : ne collez donc pas sa sortie en public sans en retirer les mots de passe et les secrets.

## Références {#source-references}

- [`.env.example` actuel](https://github.com/TypeType-Video/TypeType/blob/main/.env.example)
- [Environnement du Compose stable](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.yml)
- [Chargement de l'environnement de Server](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/Application.kt)
- [Configuration de la connexion distante](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/YoutubeRemoteBrowserConfig.kt)
