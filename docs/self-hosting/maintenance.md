# Maintenance

Day-to-day operation once the stack is running.

## Updating

If you installed TypeType with the recommended installer, run it again. It updates
the stack files, preserves `.env` and the data volumes, pulls the release images,
waits for the services, and provisions any newly added Garage resources:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes
cd ~/typetype-stack
docker compose ps
```

Configured ports remain unchanged when the installer is run again. Accounts,
history, downloads, and service secrets remain in `.env` and the named volumes.

For a script-free installation, first replace the Compose and companion files with
the current release while keeping `.env`. Then validate and recreate the stack:

```sh
docker compose config -q
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
```

When upgrading from a release that did not include Garage, complete
[the manual setup](./docker-compose#manual-setup), including Part 2, once before
using downloads.

Before every update, keep the current image references and a database backup so
you can [roll back the update](./rollback) if necessary.

## Logs

```sh
docker compose logs -f typetype-server     # follow one service
docker compose logs --tail=100 typetype    # last 100 lines of the web app
docker compose logs                         # everything
```

The server logs are the place to look when extraction, accounts, or the API misbehave.

## Backups

Two stores hold everything that matters: the database and the object store.

### Database

```sh
docker compose exec -T postgres \
  pg_dump -U typetype typetype > typetype-$(date +%F).sql
```

Restore into a fresh stack:

```sh
cat typetype-YYYY-MM-DD.sql | docker compose exec -T postgres psql -U typetype typetype
```

### Object store (downloads)

The downloads are in the `garage_data` and `garage_meta` volumes. Back up the volumes
themselves (stop the stack first for a consistent copy):

```sh
docker compose down
docker run --rm -v typetype_garage_data:/data -v "$PWD":/backup busybox \
  tar czf /backup/garage-data-$(date +%F).tar.gz -C /data .
docker compose up -d
```

Adjust the volume name if your Compose project prefix differs (see it with
`docker volume ls`).

::: tip
Downloads are regenerable artifacts, so the database backup is the important one. The
`.env` file is also worth keeping, since it pins your ports and any custom values.
:::

## Stopping and starting

```sh
docker compose stop      # stop containers, keep them
docker compose start     # start them again
docker compose down      # remove containers, keep volumes (data safe)
```

## Resources

A small instance is comfortable on ~2 GB of RAM. The heaviest components are the API
server (JVM) and the database. The downloader does the most disk and network work
while jobs run; it is idle otherwise.
