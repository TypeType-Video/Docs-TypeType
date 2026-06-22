# Prerequisites

You need a Linux host (a VPS or a home server) with:

- **Docker Engine** 24+ and the **Docker Compose v2** plugin (`docker compose`, not the
  old `docker-compose`).
- **git**, to clone the repository.
- **openssl**, to generate secrets. It is preinstalled on most distributions; if not,
  the commands in this guide also show a Python fallback.
- Roughly **2 GB of RAM** free and a few GB of disk for the database, cache, and the
  object store.

Check what you have:

```sh
docker --version
docker compose version
openssl version
git --version
```

If `docker compose version` fails, install the Compose plugin for your distribution
before continuing.

## Optional, for a public deployment

- A **domain name** pointing at your server.
- A reverse proxy (Caddy, nginx, or Traefik) to terminate TLS. This is covered in
  [Reverse proxy and HTTPS](./reverse-proxy). You can skip it for a purely local
  setup and reach the app on `http://localhost:8082`.

::: warning Run as a non-root user
Add your user to the `docker` group (`sudo usermod -aG docker "$USER"`, then log out
and back in) so you do not have to run every command with `sudo`.
:::
