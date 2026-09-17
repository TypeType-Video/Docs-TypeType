# Connexion

Vos abonnements, playlists, historique, et paramètres sont liés à votre compte sur
l'instance.

## Compte local

Créez un compte avec un nom, un email, et un mot de passe, puis connectez-vous. Sur
une instance toute neuve, le **premier compte devient administrateur** (voir
[Démarrage rapide](/self-hosting/quick-start#create-the-admin-account)). Si vous
oubliez votre mot de passe, utilisez le parcours de réinitialisation depuis la page de
connexion.

![La page de connexion](/screenshot-login.png)

Le navigateur maintient automatiquement la session du compte à jour. Le jeton d'accès
de courte durée expire après une heure, tandis que la session de rafraîchissement dure
30 jours. Si vous êtes déconnecté pendant une utilisation active du site, ce n'est pas
une déconnexion normale pour inactivité ; demandez à l'opérateur de l'instance de
vérifier
[Déconnexions inattendues](/self-hosting/troubleshooting#unexpected-sign-outs).

## Authentification unique (OIDC)

Si votre instance l'a configurée, la page de connexion affiche un bouton
**Se connecter avec...** pour votre fournisseur d'identité (Google, Authentik,
Keycloak, etc.). Un seul clic vous connecte, pas de mot de passe séparé à gérer.

Selon la façon dont l'administrateur l'a configurée :

- la page peut **rediriger directement vers votre fournisseur** (pas d'écran de
  connexion du tout),
- et les **comptes locaux peuvent être désactivés**, si bien que l'authentification
  unique est le seul moyen de se connecter.

La configuration de cela se fait côté administrateur, voir
[Authentification (OIDC)](/self-hosting/authentication).

## Votre profil

Depuis votre profil, vous gérez les détails de votre compte. Les administrateurs
disposent aussi d'une zone **Admin** pour examiner les signalements de bugs et gérer
l'instance.
