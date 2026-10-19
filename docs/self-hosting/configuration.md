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

## Account sessions

| Variable | Default | Purpose |
| --- | --- | --- |
| `AUTH_SESSION_TTL_DAYS` | `30` | Refresh-session lifetime in days, clamped to `1`–`365` |
| `AUTH_ALLOW_INSECURE_COOKIES` | `false` | Allows refresh cookies over plain HTTP with `SameSite=Lax` |

Access tokens always last one hour. A valid refresh session renews them silently, so
`AUTH_SESSION_TTL_DAYS` controls how long an account can remain signed in without a
new login.

Keep `AUTH_ALLOW_INSECURE_COOKIES=false` for HTTPS and every public deployment. Set
it to `true` only when a trusted local-only instance must run over plain HTTP. This
weakens transport security; see [Session lifetime](./authentication#session-lifetime).

Recreate Server after changing either value:

```sh
docker compose up -d --force-recreate typetype-server
```

## Database and cache

The bundled PostgreSQL service uses these values:

| Variable | Default | Purpose |
| --- | --- | --- |
| `POSTGRES_DB` | `typetype` | Main application database |
| `POSTGRES_USER` | `typetype` | PostgreSQL user |
| `POSTGRES_PASSWORD` | `typetype` | PostgreSQL password; replace for a real deployment |
| `DRAGONFLY_URL` | `redis://dragonfly:6379` | Server cache URL |
| `DRAGONFLY_MAX_MEMORY` | `2gb` | Memory the cache may use. Full, it forgets its oldest entries instead of refusing new ones. |
| `DRAGONFLY_THREADS` | `4` | Cache threads. Dragonfly needs 256 MB of `DRAGONFLY_MAX_MEMORY` per thread and does not start with less. |

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

## Bundled and custom service configuration

The web image owns the supported nginx configuration. The central stack does not
mount `nginx.conf` from the host, so proxy fixes arrive with normal web image
updates.

The `garage-config` init service writes Garage's default configuration to the
`garage_config` named volume only when that volume does not already contain a
configuration. Existing contents are never overwritten. During migration from an
older stack, the installer stages the previous host `garage.toml` and the init
service imports it on first use.

Keep deliberate nginx or Garage changes in separate files and mount them through
`docker-compose.override.yml`. The installer preserves the override and does not
replace unmanaged configuration files. See
[Custom nginx or Garage configuration](./docker-compose#custom-nginx-or-garage-configuration)
for an example.

## YouTube and Token

Token stays enabled because YouTube playback uses its PO-token, decoder, subtitle,
and SABR endpoints. The following flag controls only interactive remote login:

| Variable | Default | Purpose |
| --- | --- | --- |
| `YOUTUBE_REMOTE_LOGIN_ENABLED` | `false` | Enables the interactive YouTube sign-in flow |
| `YOUTUBE_OUTBOUND_PROXY_URL` | empty | Optional outbound proxy used for YouTube traffic |
| `YOUTUBE_REMOTE_LOGIN_CALLBACK_BASE_URL` | `http://typetype-server:8080` | Internal Server origin that receives the Token completion callback |
| `YOUTUBE_REMOTE_LOGIN_CALLBACK_ORIGIN` | `http://typetype-server:8080` | Internal callback origin used by Token |
| `YOUTUBE_REMOTE_LOGIN_TTL_MS` | `480000` | Lifetime requested by Server, clamped to 1–10 minutes |
| `YOUTUBE_REMOTE_LOGIN_MAX_SESSIONS` | `2` | Concurrent remote browser sessions, clamped to 1–8 |
| `YOUTUBE_REMOTE_LOGIN_FRAME_FPS` | `10` | Login-view capture rate |
| `YOUTUBE_REMOTE_LOGIN_MAX_FRAME_BYTES` | `524288` | Maximum encoded login frame size |

Keep the default callback as an internal Server URL. The browser reaches the login
session through the public web origin and a WebSocket; it does not call that callback
address directly.

Both callback settings must use the same internal Server origin in a custom Compose
stack. Set `YOUTUBE_REMOTE_LOGIN_CALLBACK_BASE_URL` on Server and
`YOUTUBE_REMOTE_LOGIN_CALLBACK_ORIGIN` on Token to the hostname and port that Token
can reach on the Compose network, for example `http://typetype-server:8080`. Do not
use the public web URL for either setting.

In the supported Compose file, Token keeps its own eight-minute default cap because
this TTL variable is passed only to Server. Values above eight minutes therefore do
not extend the effective reservation without a custom Token configuration.

Custom Compose stacks that rename the `typetype-token` service must set Server's
current internal endpoint variable, `SUBTITLE_SERVICE_URL`, or keep
`typetype-token` as a network alias. See
[Custom Token service names](./security#custom-token-service-names).

## YouTube request limits {#youtube-request-limits}

An instance reaches YouTube through one address, and YouTube refuses an address that
asks too much: opened videos start failing with "Sign in to confirm you're not a
bot", for more than ten minutes. Search, channel pages and video pages tolerate far
more than opening videos does.

Server reads these values from its own environment. The supported Compose file does
not pass them: set them with a Compose override on `typetype-server`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `YOUTUBE_OPENS_PER_MINUTE` | `0` (no limit) | Videos the whole instance opens at YouTube in a minute. Over it, each video waits its turn, 30 seconds at most. A video nobody is waiting to watch never queues: it goes now or not at all. |
| `YOUTUBE_SESSION_RENEWAL` | on | After three videos refused within a minute, Server asks Token for a new session, once, then waits two minutes. `off` disables it. |
| `YOUTUBE_LIVE_PROBE` | live client first | `after` asks the usual client first and the live client only for what it says is live. Use it on a busy instance: the live client handles one video at a time. |
| `STREAM_PREVIEWS` | on | `off` refuses every video asked before anyone watches it, such as a card being hovered. |
| `SABR_INITIALIZATION_RANGE` | on | `off` skips a request that YouTube refuses on every play for some addresses. |
| `EXTRACTOR_SIMULTANEOUS_REQUESTS_PER_HOST` | `64` | Requests the extractor may have on their way to one host at once |
| `EXTRACTOR_HTTP_VERSION` | HTTP/2 | `1` uses one request per connection. Use it if Server stops answering under a crowd while its processor is idle. |
| `SUBSCRIPTION_FEED_MAX_CONCURRENT_FETCHES` | `20` | Channel pages asked at once when a subscription feed is built; can only be lowered |
| `SUBSCRIPTION_FEED_FRESHNESS_SECONDS` | `60` | How old a subscription feed may be before reading it starts a refresh; can only be raised, up to one day |
| `YOUTUBE_REQUEST_LOG` | off | `1` writes one log line per request sent to YouTube. For diagnosis only. |

```yaml
services:
  typetype-server:
    environment:
      YOUTUBE_OPENS_PER_MINUTE: "120"
      YOUTUBE_LIVE_PROBE: after
```

Save it as `docker-compose.override.yml` in the stack directory, then recreate Server:

```sh
docker compose up -d --force-recreate typetype-server
```

Server never asks YouTube for the text of a subtitle track on its own; that address
is the one YouTube guards most closely.

## Recommender {#recommender}

The optional recommender has its own page, with its requirements and every setting:
[Recommender](./recommender).

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
| `TYPETYPE_RECOMMENDER_IMAGE` | `TYPETYPE_RECOMMENDER_IMAGE` |

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
