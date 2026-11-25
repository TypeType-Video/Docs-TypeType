# Go server (experimental)

TypeType Server also exists in Go: [TypeType-Server-Go](https://github.com/TypeType-Video/TypeType-Server-Go).
It answers the same API with the same database, settings and secrets, so the web app and the
Android and TV apps work with it unchanged. It is experimental: the Kotlin server stays the
default, and you can switch back at any time.

## Before you start {#requirements}

| Resource | Amount |
| --- | --- |
| Memory | About 200 MB |
| Disk | About 30 MB for the image |

What changes on your stack: the `typetype-server` container runs the Go image. On its first
start it adds one table, `go_schema_state`, to the database and leaves everything else as it is.

Back up the database first ([Backups](./maintenance#database)) if the instance is in use.

## Switch to the Go server {#install}

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --server go
```

The installer keeps this choice on later updates. The Go server has its own versions: it
follows its latest release and ignores `--version` and `--rc`. With `--beta`, it follows its
beta images.

## Switch back {#switch-back}

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --server kotlin
```

What the Go server wrote stays readable by the Kotlin server.

## By hand {#install-by-hand}

Add `docker-compose.go.yml` to the Compose files you already use:

```sh
docker compose -f docker-compose.yml -f docker-compose.go.yml --env-file .env up -d typetype-server
```

## Good to know {#differences}

- Server logs go to the container output (`docker compose logs typetype-server`), not to files.
