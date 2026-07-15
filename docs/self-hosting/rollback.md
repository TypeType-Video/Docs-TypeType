# Roll back an update

TypeType can return to previously running application images without deleting its
data volumes. Prepare the rollback information **before** each update; the `latest`
tag moves forward and is not a usable rollback reference.

::: danger Never delete the volumes
Do not run `docker compose down -v` or remove the PostgreSQL, Garage, or secrets
volumes. A normal `docker compose down` keeps them.
:::

## Before updating

Open the stack directory. Installer-managed stacks use `~/typetype-stack`; for a
manual installation, use the directory containing `docker-compose.yml`.

```sh
cd ~/typetype-stack
mkdir rollback-before-update
cp .env docker-compose.yml nginx.conf garage.toml rollback-before-update/
docker compose exec -T postgres pg_dump -U typetype typetype > rollback-before-update/typetype.sql
```

If your stack uses `docker-compose.arm64.yml`, copy that file into the same
directory too.

Record the four image references currently running:

```sh
docker image inspect "$(docker compose images -q typetype)" --format '{{index .RepoDigests 0}}'
docker image inspect "$(docker compose images -q typetype-server)" --format '{{index .RepoDigests 0}}'
docker image inspect "$(docker compose images -q typetype-downloader)" --format '{{index .RepoDigests 0}}'
docker image inspect "$(docker compose images -q typetype-token)" --format '{{index .RepoDigests 0}}'
```

Each command prints an immutable reference ending in `@sha256:...`. Keep the four
outputs with the backup and label them web, server, downloader, and token.

## Restore the previous application version

Stop the current stack without removing its volumes:

```sh
docker compose down
```

Restore the previous stack files and configuration:

```sh
cp rollback-before-update/.env .env
cp rollback-before-update/docker-compose.yml docker-compose.yml
cp rollback-before-update/nginx.conf nginx.conf
cp rollback-before-update/garage.toml garage.toml
```

Open `.env` and set these values to the four references recorded before the update:

```dotenv
TYPETYPE_WEB_IMAGE=ghcr.io/typetype-video/typetype@sha256:WEB_DIGEST
TYPETYPE_SERVER_IMAGE=ghcr.io/typetype-video/typetype-server@sha256:SERVER_DIGEST
TYPETYPE_DOWNLOADER_IMAGE=ghcr.io/typetype-video/typetype-downloader@sha256:DOWNLOADER_DIGEST
TYPETYPE_TOKEN_IMAGE=ghcr.io/typetype-video/typetype-token@sha256:TOKEN_DIGEST
```

Use the complete values printed by Docker, not the example placeholders. Then
validate the restored configuration and recreate the stack:

```sh
docker compose config -q
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
curl -fsS http://localhost:8080/health
curl -fsS http://localhost:8081/health
curl -fsS http://localhost:8082/api/downloader/health/deep
```

This changes only the application version. Accounts, history, settings, downloads,
and secrets remain in the existing volumes.

## Restore the database only when required

Do not restore the database merely because the application was rolled back. Most
application rollbacks work with the existing data. Restore the backup only when the
release notes require it or the previous server cannot start with the current schema.

First stop the services that connect to PostgreSQL:

```sh
docker compose stop typetype typetype-server typetype-downloader postgres-init
docker compose exec -T postgres dropdb -U typetype --if-exists typetype
docker compose exec -T postgres createdb -U typetype typetype
docker compose exec -T postgres psql -U typetype typetype < rollback-before-update/typetype.sql
docker compose up -d --wait --wait-timeout 180
```

This restores the database to its pre-update state, so changes made after the backup
are lost.

## Return to normal updates

After the faulty release has been replaced, remove the four `TYPETYPE_*_IMAGE`
overrides from `.env` or leave their values empty. The next normal update will then
follow the stable `latest` images again. See [Maintenance](./maintenance#updating).
