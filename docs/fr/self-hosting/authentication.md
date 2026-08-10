# Sessions de compte

Après une connexion locale ou OIDC, le jeton d'accès TypeType est valable pendant
une heure. Une session de rafraîchissement renouvelle automatiquement ce jeton, sans
demander une nouvelle connexion.

## Durée de la session

La session de rafraîchissement dure 30 jours par défaut. Vous pouvez choisir une
durée de 1 à 365 jours dans `.env` :

```dotenv
AUTH_SESSION_TTL_DAYS=90
```

La nouvelle durée s'applique aux sessions créées ou renouvelées après le changement.
Recréez Server pour appliquer la configuration :

```sh
docker compose up -d --force-recreate typetype-server
```

## HTTPS et réseaux locaux

Par défaut, le cookie de rafraîchissement est `HttpOnly`, `Secure` et
`SameSite=None`. Utilisez HTTPS pour toute instance publique.

Sur un réseau local de confiance qui ne peut pas utiliser HTTPS, une option de
compatibilité permet au cookie de fonctionner en HTTP avec `SameSite=Lax` :

```dotenv
AUTH_ALLOW_INSECURE_COOKIES=true
```

::: danger
N'activez pas cette option sur Internet ou sur un réseau non fiable. Le cookie peut
alors circuler dans une connexion HTTP non chiffrée.
:::

Une déconnexion exactement après une heure indique généralement que le cookie de
rafraîchissement n'a pas été envoyé ou accepté. Vérifiez aussi que
`ALLOWED_ORIGINS` contient exactement l'origine du navigateur.

Le guide complet en anglais détaille
[l'authentification](/self-hosting/authentication) et le
[dépannage des déconnexions](/self-hosting/troubleshooting#unexpected-sign-outs).
