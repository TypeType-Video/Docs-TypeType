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
docker compose exec -T garage /garage -c /etc/garage.toml bucket list
docker compose exec -T garage /garage -c /etc/garage.toml key list
```

The browser uses `/api/downloader/...`; it does not need to resolve the internal
`garage` hostname. A `401 Authentication required` in Downloader logs instead means
the job's extraction request did not retain a valid user session. Include Server and
Downloader logs plus the four `/api/version/*` responses in the report.

This failure was exposed while following up
[nanhoes's iOS download report](https://github.com/TypeType-Video/TypeType/issues/116)
and then checked against the current Server-to-Downloader authorization flow.

## Remote YouTube login starts, then shows a 404

If session creation succeeds but the browser route returns `404`, the WebSocket was
probably forwarded as a normal HTTP request. Check every proxy layer for:

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $connection_upgrade;
```

Also compare a host-mounted `nginx.conf` with the current file in the central
repository. See [Remote login and WebSockets](./reverse-proxy#remote-login-and-websockets)
and the original [community diagnosis](https://github.com/TypeType-Video/TypeType/discussions/122).

## Unexpected sign-outs {#unexpected-sign-outs}

An account access token lasts one hour, but the refresh session lasts 30 days. The
Frontend refreshes automatically when an authenticated request returns `401`, so a
sign-out at the one-hour mark is not expected normal behavior.

Check:

1. The page uses HTTPS on a public domain. The refresh cookie is `Secure`.
2. `ALLOWED_ORIGINS` contains the exact browser origin.
3. Login and `/api/auth/refresh` requests include credentials and are not stripped by
   a custom proxy.
4. Server still uses the PostgreSQL volume that contains the refresh session.
5. Browser privacy settings are not rejecting the `SameSite=None` refresh cookie.

Server generates a new JWT signing secret on each start unless a custom deployment
sets `JWT_SECRET`. That invalidates the old one-hour access token, but the normal
refresh flow should recover immediately when the PostgreSQL session and refresh
cookie are still present. A restart alone should therefore not require a new login.

There is no admin setting that extends the 30-day lifetime. If the problem continues,
capture Server logs around `/auth/refresh`, the browser response status, and the
deployed revisions. Do not include the cookie or any bearer token.

This checklist follows the unexpected behavior reported by
[Toni-Vide in discussion #162](https://github.com/TypeType-Video/TypeType/discussions/162).

## A saved YouTube session stopped working after a secret change

`YOUTUBE_SESSION_ENCRYPTION_KEY` encrypts stored YouTube cookies and playback tokens.
If you change it after remote login has been used, those saved YouTube sessions can
no longer be decrypted and affected users must connect YouTube again. It does not
encrypt the TypeType account login. Pick the value once and keep it. The generated
value is preserved in `typetype_secrets`, so you usually do not need to touch it.

## Token is healthy but YouTube playback fails

`/health` proves only that the Bun service is listening. PO-token, decoder, SABR, and
remote-browser flows also require Playwright Chromium and writable runtime paths.

If you applied a custom non-root or read-only container profile, retest `/potoken`, a
normal YouTube video, a livestream, and remote login separately. An arbitrary
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
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes
cd ~/typetype-stack
docker compose ps
```

Script-free stack, after replacing the Compose and companion files with the current
release while keeping `.env`:

```sh
docker compose config -q
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
```

Your data lives in named volumes, so updates keep your accounts and history.
If a new release does not start correctly, follow [Roll back an update](./rollback)
instead of deleting containers or volumes.
