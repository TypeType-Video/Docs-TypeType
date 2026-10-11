# Authentification (OIDC)

Par défaut, TypeType utilise des comptes locaux (adresse e-mail et mot de passe). Vous
pouvez aussi brancher un fournisseur **OpenID Connect** comme Authentik, Keycloak,
Authelia ou Pocket ID, pour que les utilisateurs se connectent par authentification
unique.

C'est un réglage au niveau de l'instance. Pour le côté utilisateur, voir
[Connexion](/fr/guide/accounts#single-sign-on-oidc).

## Brancher un fournisseur {#connect-a-provider}

OIDC est activé dès que l'émetteur, l'identifiant client et le secret client sont
définis sur le **serveur API** (`typetype-server`). Le fichier Compose de base stable
ne transmet pas les variables OIDC depuis `.env` : ajoutez donc un
`docker-compose.override.yml` à côté :

```yaml
services:
  typetype-server:
    environment:
      OIDC_ISSUER: ${OIDC_ISSUER}
      OIDC_CLIENT_ID: ${OIDC_CLIENT_ID}
      OIDC_CLIENT_SECRET: ${OIDC_CLIENT_SECRET}
      OIDC_PROVIDER_NAME: ${OIDC_PROVIDER_NAME:-OIDC}
      OIDC_SCOPES: ${OIDC_SCOPES:-openid email profile}
```

Ajoutez ensuite les valeurs dans `.env` :

```dotenv
OIDC_ISSUER=https://identity.example.com
OIDC_CLIENT_ID=replace-with-client-id
OIDC_CLIENT_SECRET=replace-with-client-secret
OIDC_PROVIDER_NAME="Company login"
```

Server prend en charge ces variables :

| Variable | Requise | Défaut | Ce que c'est |
| --- | --- | --- | --- |
| `OIDC_ISSUER` | oui | - | L'URL de l'émetteur de votre fournisseur (par exemple `https://id.example.com`). `OIDC_ISSUER_URL` fonctionne aussi. |
| `OIDC_CLIENT_ID` | oui | - | L'identifiant client donné par votre fournisseur |
| `OIDC_CLIENT_SECRET` | oui | - | Le secret client donné par votre fournisseur |
| `OIDC_DISCOVERY_URL` | non | `<issuer>/.well-known/openid-configuration` | À changer seulement si la découverte se trouve ailleurs |
| `OIDC_SCOPES` | non | `openid email profile` | Portées demandées |
| `OIDC_PROVIDER_NAME` | non | `OIDC` | Nom affiché sur le bouton de connexion |

Quand elles sont définies, un bouton de connexion portant le nom `OIDC_PROVIDER_NAME`
apparaît sur la page de connexion. Appliquez l'override avec
`docker compose up -d --force-recreate typetype-server`.

## URI de redirection {#redirect-uri}

Enregistrez ces URL de rappel chez votre fournisseur :

```text
https://<your-domain>/auth/oidc/callback
dev.typetype.android://oidc/callback
```

Utilisez votre vrai domaine (ou `http://localhost:8082/auth/oidc/callback` pour un
essai local).

Le rappel appartient à la route du Frontend, pas à `/api`, et doit correspondre
exactement à la configuration du fournisseur.

## Exemples de fournisseurs testés {#tested-provider-examples}

[arcoast](https://github.com/arcoast), membre de la communauté, a testé Authelia et
Pocket ID et a publié les réglages côté fournisseur qui fonctionnent dans la
[discussion #128](https://github.com/TypeType-Video/TypeType/discussions/128).

### Pocket ID {#pocket-id}

Créez un client confidentiel avec :

| Réglage de Pocket ID | Valeur |
| --- | --- |
| Callback URL | `https://watch.example.com/auth/oidc/callback` `dev.typetype.android://oidc/callback` |
| Client launch URL | `https://watch.example.com/` |
| Public client | désactivé |
| Requires re-authentication | désactivé |
| PKCE | désactivé |
| Logout callback | vide |

Copiez l'identifiant client et le secret générés par Pocket ID dans les variables
TypeType ci-dessus, et utilisez l'URL de base de Pocket ID comme `OIDC_ISSUER`.

### Authelia {#authelia}

Créez un client Authelia confidentiel avec la même URL de rappel, les portées
`openid`, `profile` et `email`, et l'authentification `client_secret_post` sur le
point d'accès des jetons. Mettez la valeur aléatoire du secret client dans
`OIDC_CLIENT_SECRET` côté TypeType ; configurez son empreinte comme secret client
d'Authelia, selon la documentation OIDC actuelle d'Authelia.

Les formats de configuration des fournisseurs peuvent changer. Utilisez la discussion
#128 comme référence testée avec TypeType, et la documentation actuelle du fournisseur
pour son schéma exact.

## Durée de vie des sessions {#session-lifetime}

Après une connexion locale ou OIDC, le jeton d'accès dure une heure. Le navigateur
reçoit aussi un cookie de renouvellement tournant : l'expiration normale du jeton
d'accès doit donc passer inaperçue. La session de renouvellement dure 30 jours par
défaut. Définissez `AUTH_SESSION_TTL_DAYS` dans `.env` pour choisir une valeur de 1 à
365 jours :

```dotenv
AUTH_SESSION_TTL_DAYS=90
```

Cette durée s'applique aux sessions nouvellement délivrées et renouvelées. Les lignes
existantes de la base gardent leur expiration actuelle jusqu'au prochain
renouvellement ou à la prochaine connexion réussis.

Le cookie de renouvellement est `HttpOnly`, `Secure` et `SameSite=None`. Un
déploiement public a donc besoin de HTTPS, du bon `ALLOWED_ORIGINS` et d'un proxy qui
laisse intactes les requêtes avec identifiants. Voir
[Déconnexions inattendues](./troubleshooting#unexpected-sign-outs) si un utilisateur
est déconnecté alors qu'il est actif.

Pour un réseau local de confiance qui ne peut pas utiliser HTTPS, une option de
compatibilité explicite peut délivrer le cookie de renouvellement sans `Secure` et
avec `SameSite=Lax` :

```dotenv
AUTH_ALLOW_INSECURE_COOKIES=true
```

::: danger
N'activez pas cette option sur un réseau public ou non fiable. Les cookies de
renouvellement des comptes peuvent circuler en HTTP non chiffré. HTTPS reste le défaut
pris en charge.
:::

Après avoir changé l'une ou l'autre variable, recréez Server :

```sh
docker compose up -d --force-recreate typetype-server
```

Cette explication fait suite au comportement interrogé par
[Toni-Vide dans la discussion #162](https://github.com/TypeType-Video/TypeType/discussions/162) et vérifié dans le code d'authentification
actuel.

## Options de l'administrateur {#admin-options}

Deux options liées se trouvent dans la zone **Administration**, pas dans
l'environnement :

- **Désactiver la connexion locale** : l'authentification unique devient le seul moyen
  d'entrer, et personne ne peut utiliser une adresse e-mail et un mot de passe.
- **Rediriger automatiquement vers le fournisseur** : passer complètement la page de
  connexion et envoyer les utilisateurs directement chez votre fournisseur.

::: warning
Avant de désactiver la connexion locale, connectez-vous une fois avec OIDC et vérifiez
que cela fonctionne. Sinon vous pouvez vous enfermer hors de l'instance.
:::
