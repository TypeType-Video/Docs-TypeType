# Security boundaries

TypeType handles account data, YouTube session cookies, browser-executed token logic,
and downloaded media. This page describes the boundaries provided by the supported
Compose stack and the limits you should understand before customising it.

## Public and internal services

Expose only the web service to users. The current stack uses these boundaries:

| Service | Default host exposure | Reason |
| --- | --- | --- |
| `typetype` | all interfaces on `HOST_PORT_WEB` | Public web, API, WebSocket, playback, and download gateway |
| `typetype-server` | `127.0.0.1:HOST_PORT_SERVER` | Optional host-side health and direct API diagnostics |
| `typetype-token` | `127.0.0.1:HOST_PORT_TOKEN` | Optional host-side health diagnostics; never a public API |
| `garage` | `127.0.0.1:HOST_PORT_GARAGE_S3` | Internal object-store diagnostics and provisioning |
| Downloader, PostgreSQL, Dragonfly | Compose network only | No direct browser or internet access required |

The bundled nginx sends `/api/` and `/sabr/` traffic to Server. Server is then the
gateway to Token and Downloader. Do not expose Token, Downloader, PostgreSQL, or
Dragonfly through your public reverse proxy.

## Secrets and stored credentials

The stack separates three kinds of secrets:

- `YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN` authenticates Server-to-Token remote-login
  callbacks.
- `YOUTUBE_SESSION_ENCRYPTION_KEY` encrypts stored YouTube session credentials.
- `GARAGE_RPC_SECRET` authenticates Garage cluster RPC traffic.

The installer generates them and stores the YouTube values in the
`typetype_secrets` volume. Manual installs must generate a random Garage RPC secret
before starting the stack. Keep `.env`, the secrets volume, and database backups
private.

Changing `YOUTUBE_SESSION_ENCRYPTION_KEY` makes existing stored YouTube sessions
unreadable. Changing `GARAGE_RPC_SECRET` without coordinating existing Garage state
can prevent the object-store node from starting normally.

## Token browser boundary {#token-browser-boundary}

TypeType-Token launches Playwright Chromium for BotGuard/PO-token work and for the
optional interactive YouTube login. Treat it as a browser-processing service:

- keep it on the private Compose network;
- keep the host port bound to `127.0.0.1` or remove the published port entirely;
- mount only the generated secret volume read-only;
- update the image with the rest of the stack;
- do not give it access to unrelated host directories or Docker's socket.

The supported Compose currently uses `init: true` and `ipc: host` for Chromium
stability. The published image does not yet declare the full non-root, read-only,
capability-dropped profile investigated in
[discussion #156](https://github.com/TypeType-Video/TypeType/discussions/156).

::: warning Do not apply an untested hardening fragment blindly
A container can pass `/health` while `/potoken`, SABR, or remote login is broken.
Running as an arbitrary `nobody` user also leaves Chromium without a usable home
directory. Validate all Token flows, not only its health endpoint, when testing a
custom security profile.
:::

The current Playwright image contains a `pwuser` account, and community testing found
that a writable `/tmp` and `/home/pwuser` can support a read-only root filesystem.
That configuration is useful ongoing work, but it is not yet the supported stack
default because the browser sandbox, IPC choice, PO tokens, SABR, and remote-login
flows must be validated together.

Thanks to [hugoghx](https://github.com/hugoghx) for the detailed container-boundary
investigation and reproducible tests in discussion #156.

## Custom Token service names

The Compose DNS service name is `typetype-token`, and Server currently defaults to
`http://typetype-token:8081`. If a custom stack renames that service without keeping
the network alias, set the Server environment variable below to its internal URL:

```yaml
services:
  typetype-server:
    environment:
      SUBTITLE_SERVICE_URL: http://my-token-service:8081
```

`SUBTITLE_SERVICE_URL` is the current implementation name even though Token now owns
PO tokens, decoding, SABR, and remote login as well as subtitles. The current Server
does not read a `TOKEN_SERVICE_URL` variable.

If remote login uses a separate Token address, also set
`YOUTUBE_REMOTE_LOGIN_SERVICE_URL` for Server. In the supported stack both values
resolve to the same internal service.

## Authentication sessions

Local and OIDC logins issue a one-hour access token and a rotating refresh session
valid for 30 days. The refresh value is an `HttpOnly`, `Secure`, `SameSite=None`
cookie. This design means:

- JavaScript can use the short-lived access token but cannot read the refresh token;
- HTTPS and correct credential/CORS handling are required on a public domain;
- a normal access-token expiry should trigger a refresh rather than sign the user
  out;
- logout or refresh-token rotation can revoke the stored session.

There is no separate “remember me” duration setting. Unexpected sign-outs before the
30-day refresh lifetime should be diagnosed as a cookie, origin, proxy, or session
problem. See [Troubleshooting](./troubleshooting#unexpected-sign-outs).

This explanation follows the question raised by
[Toni-Vide in discussion #162](https://github.com/TypeType-Video/TypeType/discussions/162)
and the current Server and Frontend session code.

## OIDC secrets

Use a confidential OIDC client and store its secret only in the Server environment.
Register the exact callback URL, restrict allowed redirect URIs at the provider, and
verify OIDC before disabling local login. See [Authentication (OIDC)](./authentication).

## Source references

- [Stable Compose service boundaries](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.yml)
- [Token container image](https://github.com/TypeType-Video/TypeType-Token/blob/dev/Dockerfile)
- [Token browser implementation](https://github.com/TypeType-Video/TypeType-Token/blob/dev/src/remote-login-browser.ts)
- [Server access-token lifetime](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/AuthAccessTokenCodec.kt)
- [Server refresh-session lifetime](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/AuthTokenIssuer.kt)
- [Refresh-cookie settings](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/AuthCookieHelpers.kt)
