# Configuration

The supported stack reads deployment choices from `.env`. The installer creates and
updates this file for you. For a manual installation, copy `.env.example`, replace
the values called out below, and keep the file out of source control.

Not every internal service variable belongs in `.env`: the central Compose file
derives internal URLs and passes only supported settings to each container. Use a
Compose override when building a custom topology.

## Web and diagnostic ports {#ports}

| Variable | Default | Purpose |
| --- | --- | --- |
| `HOST_PORT_WEB` | `8082` | Public web container; nginx serves the app, API, WebSockets, SABR, and downloads |
| `HOST_BIND_SERVER` | `127.0.0.1` | Host address for the Server diagnostic port |
| `HOST_PORT_SERVER` | `8080` | Server diagnostic and direct API port |
| `HOST_BIND_TOKEN` | `127.0.0.1` | Host address for the Token diagnostic port |
| `HOST_PORT_TOKEN` | `8081` | Token health and version port |
| `HOST_BIND_GARAGE_S3` | `127.0.0.1` | Host address for Garage provisioning and diagnostics |
| `HOST_PORT_GARAGE_S3` | `3900` | Garage S3 port |

Only `HOST_PORT_WEB` needs public ingress. Keep the other host bindings on loopback
unless a specific trusted network needs them. Downloader, PostgreSQL, and Dragonfly
have no stable host port in the supported Compose file.

Beta uses the corresponding `HOST_PORT_*_BETA` and `HOST_BIND_*_BETA` values. See
[Beta and main](./beta-and-main).

## Allowed browser origins

| Variable | Default | Purpose |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | localhost development URLs | Comma-separated browser origins allowed to call Server |

An origin is the scheme, host, and optional port, without a path or trailing slash:

```dotenv
ALLOWED_ORIGINS=https://watch.example.com,http://192.0.2.10:8082
```

The browser origin must match exactly. A page can load normally while registration,
login, or other API actions fail with an empty `403` if this value is wrong. After a
change, recreate Server:

```sh
docker compose up -d --force-recreate typetype-server
```

This diagnostic was confirmed through
[hulmgulm's first-admin report](https://github.com/TypeType-Video/TypeType/discussions/151).

## Database and cache

The bundled PostgreSQL service uses these values:

| Variable | Default | Purpose |
| --- | --- | --- |
| `POSTGRES_DB` | `typetype` | Main application database |
| `POSTGRES_USER` | `typetype` | PostgreSQL user |
| `POSTGRES_PASSWORD` | `typetype` | PostgreSQL password; replace for a real deployment |
| `DRAGONFLY_URL` | `redis://dragonfly:6379` | Server cache URL |

`POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` are the stack-level source of
truth. Compose derives Server's `DATABASE_*` values and Downloader's `DB_URL` from
them. Change the PostgreSQL values once rather than duplicating a password across
several service-specific variables.

Choose these values before the first start. After PostgreSQL has initialised its
volume, changing `.env` alone does not change the password of the existing database
role.

This arrangement follows the inconsistency identified by
[arcoast in discussion #123](https://github.com/TypeType-Video/TypeType/discussions/123).

For an external database, set `DATABASE_URL`, `DATABASE_USER`, and
`DATABASE_PASSWORD` for Server and `DB_URL` for Downloader with a Compose override.
The Downloader needs its own `typetype_downloader` database in the current design.

## Downloads and Garage

| Variable | Default | Purpose |
| --- | --- | --- |
| `DOWNLOADER_S3_ACCESS_KEY` | placeholder | Garage access key; must start with `GK` |
| `DOWNLOADER_S3_SECRET_KEY` | placeholder | Garage access-key secret |
| `GARAGE_RPC_SECRET` | placeholder | 32-byte hexadecimal Garage cluster RPC secret |

The installer generates all three values and provisions the bucket. A script-free
install must replace the placeholders and complete
[Manual setup, Part 2](./docker-compose#part-2-object-storage-for-downloads).

The bundled Downloader uses `http://garage:3900` for both its S3 client and presigned
artifact URL. Server recognises that internal hostname and proxies the finished file
to the browser. There is no required `DOWNLOADER_S3_PUBLIC_ENDPOINT` variable in the
supported `.env`.

`GARAGE_RPC_SECRET` generation was added after
[arcoast raised the missing secret in discussion #130](https://github.com/TypeType-Video/TypeType/discussions/130).

## YouTube and Token

Token stays enabled because YouTube playback uses its PO-token, decoder, subtitle,
and SABR endpoints. The following flag controls only interactive remote login:

| Variable | Default | Purpose |
| --- | --- | --- |
| `YOUTUBE_REMOTE_LOGIN_ENABLED` | `false` | Enables the interactive YouTube sign-in flow |
| `YOUTUBE_OUTBOUND_PROXY_URL` | empty | Optional outbound proxy used for YouTube traffic |
| `YOUTUBE_REMOTE_LOGIN_CALLBACK_ORIGIN` | `http://typetype-server:8080` | Internal callback origin used by Token |
| `YOUTUBE_REMOTE_LOGIN_TTL_MS` | `480000` | Lifetime requested by Server, clamped to 1–10 minutes |
| `YOUTUBE_REMOTE_LOGIN_MAX_SESSIONS` | `2` | Concurrent remote browser sessions, clamped to 1–8 |
| `YOUTUBE_REMOTE_LOGIN_FRAME_FPS` | `10` | Login-view capture rate |
| `YOUTUBE_REMOTE_LOGIN_MAX_FRAME_BYTES` | `524288` | Maximum encoded login frame size |

Keep the default callback as an internal Server URL. The browser reaches the login
session through the public web origin and a WebSocket; it does not call that callback
address directly.

In the supported Compose file, Token keeps its own eight-minute default cap because
this TTL variable is passed only to Server. Values above eight minutes therefore do
not extend the effective reservation without a custom Token configuration.

Custom Compose stacks that rename the `typetype-token` service must set Server's
current internal endpoint variable, `SUBTITLE_SERVICE_URL`, or keep
`typetype-token` as a network alias. See
[Custom Token service names](./security#custom-token-service-names).

## YouTube secrets {#secrets-handled-automatically}

| Variable | Purpose |
| --- | --- |
| `YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN` | Authenticates remote-login callbacks between Server and Token |
| `YOUTUBE_SESSION_ENCRYPTION_KEY` | Encrypts stored YouTube session credentials |

The `typetype-secrets` init container writes these to a private named volume. Empty
values and the `SET_ME_...` placeholders cause a value to be generated on first
start. Supplying a real value in `.env` replaces the generated file.

Do not rotate `YOUTUBE_SESSION_ENCRYPTION_KEY` casually: existing stored YouTube
sessions cannot be decrypted with a different key.

## OIDC

OIDC variables are supported by Server but are not part of the base `.env.example`.
Add them through a Compose override as documented in
[Authentication (OIDC)](./authentication). The supported Server variables are:

- `OIDC_ISSUER` (or `OIDC_ISSUER_URL`);
- `OIDC_CLIENT_ID`;
- `OIDC_CLIENT_SECRET`;
- optional `OIDC_DISCOVERY_URL`, `OIDC_SCOPES`, and `OIDC_PROVIDER_NAME`.

## Image overrides

Leave these empty to follow the normal stable or beta image tags:

| Stable | Beta |
| --- | --- |
| `TYPETYPE_WEB_IMAGE` | `TYPETYPE_WEB_BETA_IMAGE` |
| `TYPETYPE_SERVER_IMAGE` | `TYPETYPE_SERVER_BETA_IMAGE` |
| `TYPETYPE_DOWNLOADER_IMAGE` | `TYPETYPE_DOWNLOADER_BETA_IMAGE` |
| `TYPETYPE_TOKEN_IMAGE` | `TYPETYPE_TOKEN_BETA_IMAGE` |

Set them to immutable `ghcr.io/...@sha256:...` references for a rollback or a pinned
deployment. See [Roll back an update](./rollback).

## Bug reports

| Variable | Default | Purpose |
| --- | --- | --- |
| `GITHUB_REPO` | `TypeType-Video/TypeType` | Repository targeted by the in-app report link |
| `GITHUB_ISSUE_TEMPLATE` | `bug_report_backend.md` | Template filename appended to the in-app report link |

::: warning Current central-tracker mismatch
The shipped repository target and template do not currently match:
`bug_report_backend.md` exists in TypeType-Server, not in the central TypeType
repository. The central chooser does provide `bug_report.yml`, but that file is a
structured Issue Form whose fields use their own query IDs; the in-app generator
sends one Markdown `body`. Replacing the filename with `bug_report.yml` is therefore
not an equivalent fix for the diagnostic prefill.
:::

When targeting a fork or another repository, use a template compatible with the URL
that its issue flow expects. See the current limitation and manual reporting path in
[Reporting issues](./reporting-issues#from-inside-the-app).

## Validate the resolved configuration

Compose can show the final service graph without starting it:

```sh
docker compose config -q
docker compose config
```

The second command expands variables, so do not paste its output publicly without
removing passwords and secrets.

## Source references

- [Current `.env.example`](https://github.com/TypeType-Video/TypeType/blob/main/.env.example)
- [Stable Compose environment](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.yml)
- [Server environment loading](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/Application.kt)
- [Remote-login configuration](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/YoutubeRemoteBrowserConfig.kt)
