# Troubleshooting

Start by looking at what a service is doing:

```sh
docker compose ps               # state of every service
docker compose logs -f <name>   # follow one service, e.g. typetype-server
```

## A port is already in use

`docker compose up` fails with an "address already in use" or "port is allocated"
error. Another program uses that port. Change the matching `HOST_PORT_*` in `.env`
(see [Configuration](./configuration#ports)) and run `docker compose up -d` again.

## The page loads but actions fail with CORS / network errors

The web app loads, but logging in or loading content fails. Your domain is missing
from `ALLOWED_ORIGINS`. Set it to your real origin (for example
`https://watch.example.com`), then `docker compose up -d`. See
[Reverse proxy and HTTPS](./reverse-proxy#before-you-start).

The match is exact: include the scheme and port, and omit the trailing slash. For
example, a page opened at `http://server.lan:32110` needs:

```dotenv
ALLOWED_ORIGINS=http://server.lan:32110
```

Recreate Server after editing `.env`:

```sh
docker compose up -d --force-recreate typetype-server
```

This specific first-admin failure was isolated with
[hulmgulm in discussion #151](https://github.com/TypeType-Video/TypeType/discussions/151).

## A service keeps restarting

```sh
docker compose logs --tail=50 <name>
```

- `typetype-server` waits for `postgres` and the init containers; if it restarts,
  check `postgres` is healthy and `DATABASE_*` is correct.
- `typetype` (web) depends on the server; it is fine for it to start a few seconds
  after the server.

## Downloads do not work

The download feature needs the object store set up. Make sure you:

1. Set real `DOWNLOADER_S3_ACCESS_KEY` (starts with `GK`) and
   `DOWNLOADER_S3_SECRET_KEY` in `.env`.
2. Ran the Garage provisioning steps in
   [Docker Compose setup, Part 2](./docker-compose#part-2-object-storage-for-downloads).
3. Generated a real `GARAGE_RPC_SECRET` and restarted Garage if its logs reject the
   placeholder.

Check the object store sees your key and bucket:

```sh
docker compose exec -T garage /garage bucket list
docker compose exec -T garage /garage key list
```

The browser uses `/api/downloader/...`; it does not need to resolve the internal
`garage` hostname. A `401 Authentication required` in Downloader logs instead means
the job's extraction request did not retain a valid user session. Include Server and
Downloader logs plus the five component version responses in the report.

This failure was exposed while following up
[nanhoes's iOS download report](https://github.com/TypeType-Video/TypeType/issues/116)
and then checked against the current Server-to-Downloader authorization flow.

## YouTube videos fail with 503, 429, or 504 {#youtube-busy}

When YouTube blocks the instance address, rate-limits it, or does not answer in time,
Server answers with a specific status instead of a generic `502`:

| Status | Meaning |
| --- | --- |
| `503` | YouTube refuses the instance for now, often with "Sign in to confirm you're not a bot" |
| `429` | YouTube rate-limits the instance, or the `YOUTUBE_OPENS_PER_MINUTE` limit makes the video wait |
| `504` | YouTube did not answer before the extraction timeout |

`503` and `429` carry a `Retry-After` header, 60 seconds unless Server knows a better
delay. The web player waits that long, shows **The video service is busy.
Retrying…**, then tries again. While YouTube blocks the address, Server pauses its
YouTube requests, renews its session once, and resumes when the block lifts.

Check Token readiness from the host, replacing `8081` if you changed
`HOST_PORT_TOKEN`:

```sh
curl -i http://127.0.0.1:8081/ready
```

`/ready` answers `503` until Token has a warm BotGuard session and TV token. If it
stays at `503`, read the Token logs before investigating Server. If blocks keep
coming back, lower the pressure with the settings in
[YouTube request limits](./configuration#youtube-request-limits).

## Unexpected sign-outs {#unexpected-sign-outs}

An account access token lasts one hour, but the refresh session lasts 30 days by
default. The Frontend refreshes automatically when an authenticated request returns
`401`, so a sign-out at the one-hour mark is not expected normal behavior.

Check:

1. The page uses HTTPS. The refresh cookie is `Secure` by default.
2. `ALLOWED_ORIGINS` contains the exact browser origin.
3. Login and `/api/auth/refresh` requests include credentials and are not stripped by
   a custom proxy.
4. Server still uses the PostgreSQL volume that contains the refresh session.
5. Browser privacy settings are not rejecting the `SameSite=None` refresh cookie.

Server generates a new JWT signing secret on each start unless a custom deployment
sets `JWT_SECRET`. That invalidates the old one-hour access token, but the normal
refresh flow should recover immediately when the PostgreSQL session and refresh
cookie are still present. A restart alone should therefore not require a new login.

For a trusted local-only instance that cannot use HTTPS, set
`AUTH_ALLOW_INSECURE_COOKIES=true` and recreate `typetype-server`. This deliberately
weakens cookie transport security and must not be used on a public or untrusted
network. `AUTH_SESSION_TTL_DAYS` can change the refresh lifetime from 1 to 365 days.
See [Session lifetime](./authentication#session-lifetime).

If the problem continues, capture Server logs around `/auth/refresh`, the browser
response status, and the deployed revisions. Do not include the cookie or any bearer
token.

This checklist follows the unexpected behavior reported by
[Toni-Vide in discussion #162](https://github.com/TypeType-Video/TypeType/discussions/162).

## A saved YouTube session stopped working after a secret change

`YOUTUBE_SESSION_ENCRYPTION_KEY` encrypts stored YouTube cookies and playback tokens.
If you change it after viewers have connected YouTube, those saved sessions can no
longer be decrypted and affected users must connect YouTube again. It does not
encrypt the TypeType account login. Pick the value once and keep it. The generated
value is preserved in `typetype_secrets`, so you usually do not need to touch it.

## Playback reloads and `/api/proxy` returns `422`

An old playback implementation sent signed `googlevideo` URLs through `/api/proxy`.
Its first range requests could return `206`, followed by `422` responses containing
`{"error":"Upstream returned 403"}`. The player then rebuilt the source repeatedly,
and Server could log `ChannelWriteException` after the browser closed an abandoned
proxy response.

Current playback uses a stateful SABR session and does not consume those signed media
URLs through the same browser-facing path. If the old request pattern still appears,
check the five component version responses and run:

```sh
docker compose config --images
```

An output containing `ghcr.io/priveetee/...` means the active Compose file still
points to the former image namespace. Follow
[Migrate an older Priveetee stack](./maintenance#migrate-an-older-priveetee-stack)
before investigating the YouTube sign-in, the residential IP, or proxy tuning.

The old failure sequence and the successful update were documented by
[filippobaroni in discussion #133](https://github.com/TypeType-Video/TypeType/discussions/133#discussioncomment-17779201).

## Token is healthy but YouTube playback fails

`/health` proves only that the Bun service is listening. PO-token, decoder, SABR, and
YouTube sign-in flows also require Playwright Chromium and writable runtime paths.
`/ready` answers `200` only once the BotGuard session and TV token are warm.

If you applied a custom non-root or read-only container profile, retest `/potoken`, a
normal YouTube video, a livestream, and the YouTube sign-in separately. An arbitrary
`nobody` user has no usable home directory for Chromium Crashpad in the current image.
Return to the supported Token service definition before treating the failure as a
Server or Player bug.

See [Token browser boundary](./security#token-browser-boundary) and
[hugoghx's container investigation](https://github.com/TypeType-Video/TypeType/discussions/156).

## Start over from scratch

::: danger This deletes your data
`down -v` removes the database, cache, and object-store volumes.
:::

```sh
docker compose down -v
docker compose up -d
```

## Updating

Installer-managed stack:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes --dir "$STACK_DIR"
cd "$STACK_DIR"
docker compose ps
```

`$STACK_DIR` is your stack directory, `~/typetype-stack` unless you chose another
one: see [Choose the directory](./quick-start#stack-directory).

Script-free stack, after replacing the managed Compose file and scripts with the
current release while keeping `.env` and any custom override:

```sh
docker compose config -q
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
```

Your data lives in named volumes, so updates keep your accounts and history.
If a new release does not start correctly, follow [Roll back an update](./rollback)
instead of deleting containers or volumes.
