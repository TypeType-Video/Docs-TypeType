# Beta and main

TypeType is published on two channels, and you can run them side by side on the same
host.

| Channel | Branch | Images | Default ports |
| --- | --- | --- | --- |
| **main** (stable) | `main` | `ghcr.io/typetype-video/typetype:latest`, `...-server:latest`, ... | web `8082`, server `8080`, token `8081`, S3 `3900` |
| **beta** | `dev` | `ghcr.io/typetype-video/typetype-beta:latest`, `...-server-beta:latest`, ... | web `18082`, server `18080`, downloader `19093`, token `18081`, S3 `3900` |

CI builds the images automatically: a push to `main` updates the `:latest` images,
a push to `dev` updates the `-beta` images. So **main is the stable release** and
**beta is the preview of what is coming next**.

The repositories, submodule pins, image notifications, and deployments are separate
parts of the release path. Read [Branches and releases](/project/releases) when you
need exact source or image provenance.

## When to use beta

- To try upcoming features before they reach the stable release.
- To reproduce or confirm a bug against the latest `dev` build before reporting it.

Beta can break or change without notice, keep your real data on the main channel.

## Run beta alongside main

The beta stack is defined in `docker-compose.dev.yml`. When launched from the same
checkout it reads the same `.env`, including credentials and database settings, but a
different Compose project name gives it separate containers, networks, and named data
volumes. This does not isolate host ports: the packaged beta Garage default is also
`3900`, so a manual side-by-side setup must change it.

### One command (recommended)

The beta branch's install script can bring up the beta stack for you. It uses the
`dev` build, so fetch it from `dev` and pass `--beta`:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/dev/scripts/install-stack.sh | bash -s -- --beta
```

This creates `~/typetype-beta-stack`, fetches only `docker-compose.dev.yml` and its
companions, picks free `*_BETA` ports when the defaults are taken, pulls the beta
images, starts that stack, and bootstraps Garage. It is interactive by default;
add `--yes` to skip the prompts, or `--download-only` to fetch the files without
starting Docker.

### Manually

Before starting beta beside main, give Garage a free host port and allow the beta web
origin. For the packaged defaults:

```dotenv
HOST_PORT_GARAGE_S3_BETA=13900
ALLOWED_ORIGINS=http://localhost:8082,http://127.0.0.1:8082,http://localhost:18082,http://127.0.0.1:18082
```

Keep any public origins already present in `ALLOWED_ORIGINS`.

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
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes

# beta
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/dev/scripts/install-stack.sh | bash -s -- --beta --yes
```

Running the installer again keeps the channel's existing `.env`, ports, and data
volumes while refreshing the stack files and images.

::: tip Ports already in use
The installer picks free ports. For a manual launch, change every conflicting
`HOST_PORT_*_BETA` value in `.env` before starting the beta stack. In particular,
stable and beta both ship with Garage port `3900` as their default. See
[Configuration](./configuration#ports).
:::
