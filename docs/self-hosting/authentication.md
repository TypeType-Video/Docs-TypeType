# Authentication (OIDC)

By default, TypeType uses local accounts (email and password). You can also connect an
**OpenID Connect** provider such as Authentik, Keycloak, Authelia, or Pocket ID, so
users sign in with single sign-on.

This is an instance-level setup. For the user side, see
[Signing in](/guide/accounts#single-sign-on-oidc).

## Connect a provider

OIDC is enabled as soon as the issuer, client ID, and client secret are set on the
**API server** (`typetype-server`). The stable base Compose file does not forward OIDC
variables from `.env`, so add a `docker-compose.override.yml` beside it:

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

Then add the values to `.env`:

```dotenv
OIDC_ISSUER=https://identity.example.com
OIDC_CLIENT_ID=replace-with-client-id
OIDC_CLIENT_SECRET=replace-with-client-secret
OIDC_PROVIDER_NAME="Company login"
```

Server supports these variables:

| Variable | Required | Default | What it is |
| --- | --- | --- | --- |
| `OIDC_ISSUER` | yes | — | Your provider's issuer URL (e.g. `https://id.example.com`). `OIDC_ISSUER_URL` also works. |
| `OIDC_CLIENT_ID` | yes | — | The client ID from your provider |
| `OIDC_CLIENT_SECRET` | yes | — | The client secret from your provider |
| `OIDC_DISCOVERY_URL` | no | `<issuer>/.well-known/openid-configuration` | Override only if discovery lives elsewhere |
| `OIDC_SCOPES` | no | `openid email profile` | Scopes requested |
| `OIDC_PROVIDER_NAME` | no | `OIDC` | Name shown on the "Sign in with..." button |

When these are set, a **Sign in with `OIDC_PROVIDER_NAME`** button appears on the login
page. Apply the override with `docker compose up -d --force-recreate typetype-server`.

## Redirect URI

Register this callback URL with your provider:

```text
https://<your-domain>/auth/oidc/callback
```

Use your real domain (or `http://localhost:8082/auth/oidc/callback` for a local test).

The callback belongs to the Frontend route, not `/api`, and must match the provider
configuration exactly.

## Tested provider examples

Community member [arcoast](https://github.com/arcoast) tested both Authelia and
Pocket ID and published the working provider-side settings in
[discussion #128](https://github.com/TypeType-Video/TypeType/discussions/128).

### Pocket ID

Create a confidential client with:

| Pocket ID setting | Value |
| --- | --- |
| Callback URL | `https://watch.example.com/auth/oidc/callback` |
| Client launch URL | `https://watch.example.com/` |
| Public client | off |
| Requires re-authentication | off |
| PKCE | off |
| Logout callback | empty |

Copy Pocket ID's generated client ID and secret into the TypeType variables above,
and use the Pocket ID base URL as `OIDC_ISSUER`.

### Authelia

Create a confidential Authelia client with the same callback URL, scopes `openid`,
`profile`, and `email`, and `client_secret_post` token endpoint authentication. Put
the random client-secret value in TypeType's `OIDC_CLIENT_SECRET`; configure its hash
as the Authelia client secret according to Authelia's current OIDC documentation.

Provider configuration formats can change. Use discussion #128 as a tested TypeType
reference and the current provider documentation for its exact schema.

## Session lifetime

After local or OIDC login, the access token lasts one hour. The browser also receives
a rotating refresh cookie valid for 30 days, so normal access-token expiry should be
silent. There is no separate “remember me” duration setting.

The refresh cookie is `HttpOnly`, `Secure`, and `SameSite=None`. A public deployment
therefore needs HTTPS, the correct `ALLOWED_ORIGINS`, and proxy handling that keeps
credentialed requests intact. See
[Unexpected sign-outs](./troubleshooting#unexpected-sign-outs) if a user is logged out
while active.

This explanation follows the behavior questioned by
[Toni-Vide in discussion #162](https://github.com/TypeType-Video/TypeType/discussions/162)
and verified in the current authentication source.

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
