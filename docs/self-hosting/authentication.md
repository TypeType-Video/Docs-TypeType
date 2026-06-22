# Authentication (OIDC)

By default, TypeType uses local accounts (email and password). You can also connect an
**OpenID Connect** provider, Google, Authentik, Keycloak, Authelia, and so on, so users
sign in with single sign-on.

This is an instance-level setup. For the user side, see
[Signing in](/guide/accounts#single-sign-on-oidc).

## Connect a provider

OIDC is enabled as soon as the issuer, client ID, and client secret are set on the
**API server** (`typetype-server`). Add these to your `.env` and make sure they are
passed to the `typetype-server` service in your compose file:

| Variable | Required | Default | What it is |
| --- | --- | --- | --- |
| `OIDC_ISSUER` | yes | , | Your provider's issuer URL (e.g. `https://id.example.com`). `OIDC_ISSUER_URL` also works. |
| `OIDC_CLIENT_ID` | yes | , | The client ID from your provider |
| `OIDC_CLIENT_SECRET` | yes | , | The client secret from your provider |
| `OIDC_DISCOVERY_URL` | no | `<issuer>/.well-known/openid-configuration` | Override only if discovery lives elsewhere |
| `OIDC_SCOPES` | no | `openid email profile` | Scopes requested |
| `OIDC_PROVIDER_NAME` | no | `OIDC` | Name shown on the "Sign in with..." button |

When these are set, a **Sign in with `OIDC_PROVIDER_NAME`** button appears on the login
page.

## Redirect URI

Register this callback URL with your provider:

```
https://<your-domain>/auth/oidc/callback
```

Use your real domain (or `http://localhost:8082/auth/oidc/callback` for a local test).

## Admin options

Two related options live in the **Admin** area, not in the environment:

- **Disable local login**, make single sign-on the only way in, so no one can use an
  email and password.
- **Auto-redirect to the provider**, skip the login page entirely and send users
  straight to your provider.

::: warning
Before you disable local login, sign in once with OIDC and confirm it works. Otherwise
you can lock yourself out of the instance.
:::
