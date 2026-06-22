# Beta and main

TypeType is published on two channels, and you can run them side by side on the same
host.

| Channel | Branch | Images | Default ports |
| --- | --- | --- | --- |
| **main** (stable) | `main` | `ghcr.io/priveetee/typetype:latest`, `...-server:latest`, ... | web `8082`, server `8080`, token `8081`, S3 `3900` |
| **beta** | `dev` | `ghcr.io/priveetee/typetype-beta:latest`, `...-server-beta:latest`, ... | web `18082`, server `18080`, downloader `19093`, token `18081` |

CI builds the images automatically: a push to `main` updates the `:latest` images,
a push to `dev` updates the `-beta` images. So **main is the stable release** and
**beta is the preview of what is coming next**.

## When to use beta

- To try upcoming features before they reach the stable release.
- To reproduce or confirm a bug against the latest `dev` build before reporting it.

Beta can break or change without notice, keep your real data on the main channel.

## Run beta alongside main

The beta stack is defined in `docker-compose.dev.yml`. It reuses the same `.env`
(so the same secrets and database settings) but listens on the `*_BETA` ports, and it
runs under its own Compose project name so it never collides with main.

```sh
docker compose -f docker-compose.dev.yml -p typetype-beta up -d
```

- main keeps serving on `http://localhost:8082`,
- beta serves on `http://localhost:18082`.

Manage the beta stack with the same `-f`/`-p` flags:

```sh
docker compose -f docker-compose.dev.yml -p typetype-beta ps
docker compose -f docker-compose.dev.yml -p typetype-beta pull
docker compose -f docker-compose.dev.yml -p typetype-beta down
```

## Update a channel

```sh
# main
docker compose pull && docker compose up -d

# beta
docker compose -f docker-compose.dev.yml -p typetype-beta pull
docker compose -f docker-compose.dev.yml -p typetype-beta up -d
```

::: tip Ports already in use
If a `*_BETA` port is taken, change it in `.env` (see
[Configuration](./configuration#ports)) before starting the beta stack.
:::
