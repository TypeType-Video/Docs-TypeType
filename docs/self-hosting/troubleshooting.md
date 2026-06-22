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
3. Set `DOWNLOADER_S3_PUBLIC_ENDPOINT` to a URL the browser can actually reach (not
   `localhost`) when running behind a domain.

Check the object store sees your key and bucket:

```sh
docker compose exec -T garage /garage -c /etc/garage.toml bucket list
docker compose exec -T garage /garage -c /etc/garage.toml key list
```

## I changed a secret and sessions broke

`YOUTUBE_SESSION_ENCRYPTION_KEY` encrypts stored sessions. If you change it after the
app has been in use, existing sessions can no longer be decrypted and users are
signed out. Pick the value once and keep it. The automatic value never changes on its
own, so you usually do not need to touch it at all.

## Start over from scratch

::: danger This deletes your data
`down -v` removes the database, cache, and object-store volumes.
:::

```sh
docker compose down -v
docker compose up -d
```

## Updating

```sh
docker compose pull
docker compose up -d
```

Your data lives in named volumes, so updates keep your accounts and history.
