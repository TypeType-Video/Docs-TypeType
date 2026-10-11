# Limites de sécurité

TypeType manipule des données de compte, des cookies de session YouTube, de la logique
de jetons exécutée dans un navigateur, et des médias téléchargés. Cette page décrit
les limites que fournit la stack Compose prise en charge, et celles que vous devez
comprendre avant de la personnaliser.

## Services publics et internes {#public-and-internal-services}

N'exposez aux utilisateurs que le service web. La stack actuelle utilise ces limites :

| Service | Exposition par défaut sur l'hôte | Raison |
| --- | --- | --- |
| `typetype` | toutes les interfaces sur `HOST_PORT_WEB` | Web public, API, WebSocket, lecture et passerelle de téléchargement |
| `typetype-server` | `127.0.0.1:HOST_PORT_SERVER` | Contrôle de santé et diagnostic direct de l'API depuis l'hôte, optionnels |
| `typetype-token` | `127.0.0.1:HOST_PORT_TOKEN` | Diagnostic de santé depuis l'hôte, optionnel ; jamais une API publique |
| `garage` | `127.0.0.1:HOST_PORT_GARAGE_S3` | Diagnostic et provisionnement internes du stockage objet |
| Downloader, PostgreSQL, Dragonfly | réseau Compose uniquement | Aucun accès direct du navigateur ni d'Internet requis |

Le nginx fourni envoie le trafic `/api/` et `/sabr/` à Server. Server est ensuite la
passerelle vers Token et Downloader. N'exposez pas Token, Downloader, PostgreSQL ni
Dragonfly par votre proxy inverse public.

## Secrets et identifiants stockés {#secrets-and-stored-credentials}

La stack sépare trois sortes de secrets :

- `YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN` authentifie les rappels de connexion distante
  de Server vers Token.
- `YOUTUBE_SESSION_ENCRYPTION_KEY` chiffre les identifiants de session YouTube
  stockés.
- `GARAGE_RPC_SECRET` authentifie le trafic RPC du cluster Garage.

L'installateur les génère et range les valeurs YouTube dans le volume
`typetype_secrets`. Une installation manuelle doit générer un secret RPC Garage
aléatoire avant de démarrer la stack. Gardez privés le `.env`, le volume des secrets
et les sauvegardes de la base.

Changer `YOUTUBE_SESSION_ENCRYPTION_KEY` rend illisibles les sessions YouTube déjà
stockées. Changer `GARAGE_RPC_SECRET` sans tenir compte de l'état existant de Garage
peut empêcher le nœud de stockage objet de démarrer normalement.

## Limite du navigateur de Token {#token-browser-boundary}

TypeType-Token lance Chromium via Playwright pour le travail BotGuard et jetons PO, et
pour la connexion interactive optionnelle à YouTube. Traitez-le comme un service qui
fait tourner un navigateur :

- gardez-le sur le réseau Compose privé ;
- gardez le port de l'hôte lié à `127.0.0.1`, ou retirez complètement le port publié ;
- ne montez que le volume des secrets générés, en lecture seule ;
- mettez l'image à jour avec le reste de la stack ;
- ne lui donnez accès ni à des dossiers de l'hôte sans rapport, ni au socket de
  Docker.

Le Compose pris en charge utilise actuellement `init: true` et `ipc: host` pour la
stabilité de Chromium. L'image publiée ne déclare pas encore le profil complet non
root, en lecture seule et sans capacités étudié dans la
[discussion #156](https://github.com/TypeType-Video/TypeType/discussions/156).

::: warning N'appliquez pas à l'aveugle un durcissement non testé
Un conteneur peut répondre à `/health` alors que `/potoken`, SABR ou la connexion
distante est cassé. Tourner sous un utilisateur `nobody` arbitraire laisse aussi
Chromium sans dossier personnel utilisable. Validez tous les parcours de Token, pas
seulement son point de santé, quand vous testez un profil de sécurité sur mesure.
:::

L'image Playwright actuelle contient un compte `pwuser`, et des tests de la communauté
ont montré qu'un `/tmp` et un `/home/pwuser` inscriptibles peuvent permettre un
système de fichiers racine en lecture seule. Cette configuration est un travail en
cours utile, mais ce n'est pas encore le défaut de la stack prise en charge, parce que
le bac à sable du navigateur, le choix IPC, les jetons PO, SABR et la connexion
distante doivent être validés ensemble.

Merci à [hugoghx](https://github.com/hugoghx) pour l'étude détaillée des limites du
conteneur et les tests reproductibles de la discussion #156.

## Noms sur mesure du service Token {#custom-token-service-names}

Le nom DNS du service dans Compose est `typetype-token`, et Server utilise
actuellement `http://typetype-token:8081` par défaut. Si une stack sur mesure renomme
ce service sans garder l'alias réseau, donnez à la variable d'environnement de Server
ci-dessous son URL interne :

```yaml
services:
  typetype-server:
    environment:
      SUBTITLE_SERVICE_URL: http://my-token-service:8081
```

`SUBTITLE_SERVICE_URL` est le nom actuel dans le code, même si Token s'occupe
désormais des jetons PO, du décodage, de SABR et de la connexion distante en plus des
sous-titres. Le Server actuel ne lit pas de variable `TOKEN_SERVICE_URL`.

Si la connexion distante utilise une adresse Token séparée, définissez aussi
`YOUTUBE_REMOTE_LOGIN_SERVICE_URL` pour Server. Dans la stack prise en charge, les
deux valeurs désignent le même service interne.

## Sessions d'authentification {#authentication-sessions}

Les connexions locales et OIDC délivrent un jeton d'accès d'une heure et une session
de renouvellement tournante valable 30 jours. La valeur de renouvellement est un
cookie `HttpOnly`, `Secure`, `SameSite=None`. Ce choix signifie que :

- JavaScript peut utiliser le jeton d'accès de courte durée mais ne peut pas lire le
  jeton de renouvellement ;
- HTTPS et une gestion correcte des identifiants et de CORS sont nécessaires sur un
  domaine public ;
- l'expiration normale d'un jeton d'accès doit déclencher un renouvellement plutôt que
  déconnecter l'utilisateur ;
- une déconnexion ou la rotation du jeton de renouvellement peut révoquer la session
  stockée.

Il n'existe pas de réglage séparé pour une durée « se souvenir de moi ». Des
déconnexions inattendues avant les 30 jours de la session de renouvellement doivent
être traitées comme un problème de cookie, d'origine, de proxy ou de session. Voir
[Dépannage](./troubleshooting#unexpected-sign-outs).

Cette explication fait suite à la question posée par
[Toni-Vide dans la discussion #162](https://github.com/TypeType-Video/TypeType/discussions/162)
et s'appuie sur le code de session actuel de Server et du Frontend.

## Secrets OIDC {#oidc-secrets}

Utilisez un client OIDC confidentiel et ne stockez son secret que dans
l'environnement de Server. Enregistrez l'URL de rappel exacte, restreignez les URI de
redirection autorisées chez le fournisseur, et vérifiez OIDC avant de désactiver la
connexion locale. Voir [Authentification (OIDC)](./authentication).

## Références {#source-references}

- [Limites des services dans le Compose stable](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.yml)
- [Image du conteneur Token](https://github.com/TypeType-Video/TypeType-Token/blob/dev/Dockerfile)
- [Implémentation du navigateur de Token](https://github.com/TypeType-Video/TypeType-Token/blob/dev/src/remote-login-browser.ts)
- [Durée de vie du jeton d'accès de Server](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/AuthAccessTokenCodec.kt)
- [Durée de vie de la session de renouvellement de Server](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/AuthTokenIssuer.kt)
- [Réglages du cookie de renouvellement](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/AuthCookieHelpers.kt)
