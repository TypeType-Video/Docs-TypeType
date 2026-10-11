# Revertir una actualización

TypeType puede volver a las imágenes de la aplicación que se ejecutaban antes sin
borrar sus volúmenes de datos. Prepara la información para revertir **antes** de cada
actualización; la etiqueta `latest` avanza y no sirve como referencia para volver
atrás.

::: danger Nunca borres los volúmenes
No ejecutes `docker compose down -v` ni elimines los volúmenes de PostgreSQL, Garage o
secretos. Un `docker compose down` normal los conserva.
:::

## Antes de actualizar {#before-updating}

Abre el directorio de la pila: `~/typetype-stack` salvo que hayas elegido otro, o el
directorio que contiene `docker-compose.yml` en una instalación manual. Consulta
[Elegir el directorio](./quick-start#stack-directory).

```sh
cd "$STACK_DIR"
mkdir rollback-before-update
cp .env docker-compose.yml rollback-before-update/
for file in docker-compose.arm64.yml docker-compose.override.yml nginx.conf garage.toml; do
  [ ! -f "$file" ] || cp -a "$file" rollback-before-update/
done
docker compose exec -T postgres pg_dump -U typetype typetype > rollback-before-update/typetype.sql
```

El instalador compatible hace automáticamente la parte de los archivos de la pila y
las referencias de imágenes antes de una actualización. Sus copias con marca de tiempo
se guardan en `.typetype-backups/`. Un volcado de la base de datos sigue siendo una
copia de seguridad aparte, a cargo del operador.

Anota las cuatro referencias de imagen que se están ejecutando ahora:

```sh
docker image inspect "$(docker compose images -q typetype)" --format '{{index .RepoDigests 0}}'
docker image inspect "$(docker compose images -q typetype-server)" --format '{{index .RepoDigests 0}}'
docker image inspect "$(docker compose images -q typetype-downloader)" --format '{{index .RepoDigests 0}}'
docker image inspect "$(docker compose images -q typetype-token)" --format '{{index .RepoDigests 0}}'
```

Cada comando muestra una referencia inmutable que termina en `@sha256:...`. Guarda las
cuatro salidas con la copia y etiquétalas como web, server, downloader y token.

## Restaurar la versión anterior de la aplicación {#restore-the-previous-application-version}

Para la pila actual sin eliminar sus volúmenes:

```sh
docker compose down
```

Restaura los archivos de la pila y la configuración anteriores:

```sh
cp rollback-before-update/.env .env
cp rollback-before-update/docker-compose.yml docker-compose.yml
for file in docker-compose.arm64.yml docker-compose.override.yml nginx.conf garage.toml; do
  [ ! -f "rollback-before-update/$file" ] || cp -a "rollback-before-update/$file" "$file"
done
```

Abre `.env` y asigna a estos valores las cuatro referencias anotadas antes de la
actualización:

```dotenv
TYPETYPE_WEB_IMAGE=ghcr.io/typetype-video/typetype@sha256:WEB_DIGEST
TYPETYPE_SERVER_IMAGE=ghcr.io/typetype-video/typetype-server@sha256:SERVER_DIGEST
TYPETYPE_DOWNLOADER_IMAGE=ghcr.io/typetype-video/typetype-downloader@sha256:DOWNLOADER_DIGEST
TYPETYPE_TOKEN_IMAGE=ghcr.io/typetype-video/typetype-token@sha256:TOKEN_DIGEST
```

Usa los valores completos que mostró Docker, no los marcadores de ejemplo. Después
valida la configuración restaurada y vuelve a crear la pila:

```sh
docker compose config -q
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
curl -fsS http://localhost:8080/health
curl -fsS http://localhost:8081/health
curl -fsS http://localhost:8082/api/downloader/health/deep
```

Esto cambia solo la versión de la aplicación. Las cuentas, el historial, los ajustes,
las descargas, la configuración de Garage y los secretos permanecen en los volúmenes
existentes.

## Restaurar la base de datos solo cuando haga falta {#restore-the-database-only-when-required}

No restaures la base de datos solo porque se haya revertido la aplicación. La mayoría
de las reversiones de la aplicación funcionan con los datos existentes. Restaura la
copia solo cuando las notas de la versión lo exijan o cuando el servidor anterior no
pueda arrancar con el esquema actual.

Primero para los servicios que se conectan a PostgreSQL:

```sh
docker compose stop typetype typetype-server typetype-downloader postgres-init
docker compose exec -T postgres dropdb -U typetype --if-exists typetype
docker compose exec -T postgres createdb -U typetype typetype
docker compose exec -T postgres psql -U typetype typetype < rollback-before-update/typetype.sql
docker compose up -d --wait --wait-timeout 180
```

Esto devuelve la base de datos a su estado anterior a la actualización, así que los
cambios hechos después de la copia se pierden.

## Volver a las actualizaciones normales {#return-to-normal-updates}

Cuando la versión defectuosa haya sido sustituida, quita de `.env` los cuatro valores
`TYPETYPE_*_IMAGE` o déjalos vacíos. La siguiente actualización normal volverá a seguir
las imágenes estables `latest`. Consulta [Mantenimiento](./maintenance#updating).
