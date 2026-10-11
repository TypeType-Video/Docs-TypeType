# Mantenimiento

La operación del día a día una vez que la pila está en marcha.

## Actualizar {#updating}

Si instalaste TypeType con el instalador recomendado, vuelve a ejecutarlo. Actualiza
los archivos de la pila que gestiona, conserva `.env`, los overrides de Compose y los
volúmenes de datos, descarga las imágenes de la versión, espera a los servicios,
verifica las versiones de los componentes y aprovisiona los recursos de Garage que se
hayan añadido:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes --dir "$STACK_DIR"
cd "$STACK_DIR"
docker compose ps
```

`$STACK_DIR` es el directorio de tu pila, `~/typetype-stack` salvo que hayas elegido
otro: consulta [Elegir el directorio](./quick-start#stack-directory).

Los puertos configurados no cambian cuando se vuelve a ejecutar el instalador. Las
cuentas, el historial, las descargas y los secretos de los servicios permanecen en
`.env` y en los volúmenes con nombre. Antes de cambiar los archivos gestionados, el
instalador crea bajo `.typetype-backups/` un directorio con marca de tiempo que
contiene los archivos anteriores de la pila y, cuando la configuración antigua es
válida, sus referencias de imágenes resueltas y en ejecución.

En una instalación sin scripts, sustituye primero el archivo Compose y los scripts por
los de la versión actual, conservando `.env`, cualquier override y la configuración
personalizada. Después valida y vuelve a crear la pila:

```sh
docker compose config -q
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
```

### Migrar una pila antigua de Priveetee {#migrate-an-older-priveetee-stack}

Las instalaciones antiguas pueden seguir usando archivos Compose que hacen referencia
a `ghcr.io/priveetee/...`. Ejecutar `docker compose pull` con esos archivos sigue
descargando el espacio de nombres de imágenes antiguo; no lleva la instancia a una
versión actual de `ghcr.io/typetype-video/...`.

Comprueba los nombres de imagen resultantes desde el directorio que contiene el
archivo Compose activo:

```sh
docker compose config --images
```

Si alguna imagen de TypeType empieza por `ghcr.io/priveetee/`, renueva una vez los
archivos de la pila. Primero conserva la configuración actual y una copia de la base
de datos:

```sh
cd "$STACK_DIR"
migration_backup="../typetype-stack-before-migration-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$migration_backup"
cp -a .env docker-compose.yml "$migration_backup"/
[ ! -f nginx.conf ] || cp -a nginx.conf "$migration_backup"/
[ ! -f garage.toml ] || cp -a garage.toml "$migration_backup"/
docker compose exec -T postgres \
  pg_dump -U typetype typetype > "$migration_backup/typetype.sql"
```

Descarga en el mismo directorio el archivo Compose y los scripts compatibles actuales.
El instalador conserva el archivo `.env` existente, el override de Compose, los
archivos no gestionados y los volúmenes con nombre, y añade las entradas necesarias
actuales:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh \
  | bash -s -- --dir "$PWD" --download-only --yes
```

::: warning Los archivos de pila personalizados se sustituyen
El comando renueva `docker-compose.yml`, `.env.example` y los scripts de la pila.
Compara la copia con marca de tiempo antes de restaurar un cambio personalizado; no
vuelvas a copiar el archivo Compose antiguo, porque eso restauraría también sus
referencias de imagen antiguas. Mantén los cambios personalizados de los servicios en
`docker-compose.override.yml`.
:::

Se guarda una copia del `nginx.conf` antiguo del host, pero la pila por defecto ya no
lo monta, porque nginx viene ahora dentro de la imagen web. Un `garage.toml` antiguo
se prepara para una importación única en el volumen `garage_config`. El inicializador
nunca sobrescribe una configuración que ya esté en ese volumen.

Valida la pila renovada e inspecciona de nuevo las imágenes:

```sh
docker compose config -q
docker compose config --images
```

Las cuatro imágenes de aplicación de TypeType deben empezar ahora por
`ghcr.io/typetype-video/`. Descárgalas y vuelve a crear los servicios sin borrar
volúmenes:

```sh
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
```

Por último, sustituye el origen de ejemplo siguiente por la URL de la instancia y
confirma las revisiones de los componentes desplegados:

```sh
curl -fsS https://watch.example.com/api/version
curl -fsS https://watch.example.com/api/version/web
curl -fsS https://watch.example.com/api/version/server
curl -fsS https://watch.example.com/api/version/token
curl -fsS https://watch.example.com/api/version/downloader
```

Este hueco de migración puntual quedó claro gracias al
[seguimiento de filippobaroni en la discusión #133](https://github.com/TypeType-Video/TypeType/discussions/133#discussioncomment-17779201).

Al actualizar desde una versión que no incluía Garage, completa una vez
[la instalación manual](./docker-compose#manual-setup), incluida la Parte 2, antes de
usar las descargas.

Antes de cada actualización, guarda las referencias de imagen actuales y una copia de
la base de datos para poder [revertir la actualización](./rollback) si hace falta.

## Registros {#logs}

```sh
docker compose logs -f typetype-server     # seguir un servicio
docker compose logs --tail=100 typetype    # las últimas 100 líneas de la aplicación web
docker compose logs                         # todo
```

Los registros del servidor son el lugar donde mirar cuando la extracción, las cuentas
o la API se comportan mal.

## Copias de seguridad {#backups}

Dos almacenes contienen todo lo importante: la base de datos y el almacén de objetos.

### Base de datos {#database}

```sh
docker compose exec -T postgres \
  pg_dump -U typetype typetype > typetype-$(date +%F).sql
```

Restaurar en una pila nueva:

```sh
cat typetype-YYYY-MM-DD.sql | docker compose exec -T postgres psql -U typetype typetype
```

### Almacén de objetos (descargas) {#object-store-downloads}

Las descargas están en los volúmenes `garage_data` y `garage_meta`. Haz copia de los
propios volúmenes (para primero la pila para obtener una copia coherente):

```sh
docker compose down
docker run --rm -v typetype_garage_data:/data -v "$PWD":/backup busybox \
  tar czf /backup/garage-data-$(date +%F).tar.gz -C /data .
docker compose up -d
```

Ajusta el nombre del volumen si el prefijo de tu proyecto de Compose es distinto
(puedes verlo con `docker volume ls`).

::: tip
Las descargas son artefactos que se pueden regenerar, así que la copia importante es
la de la base de datos. También vale la pena conservar el archivo `.env`, porque fija
tus puertos y tus valores personalizados.
:::

## Parar y arrancar {#stopping-and-starting}

```sh
docker compose stop      # parar los contenedores y conservarlos
docker compose start     # arrancarlos de nuevo
docker compose down      # eliminar los contenedores y conservar los volúmenes (datos a salvo)
```

## Recursos {#resources}

Una instancia pequeña funciona con comodidad con unos 2 GB de RAM. Los componentes más
pesados son el servidor API (JVM) y la base de datos. El descargador es el que más
disco y red usa mientras hay trabajos en curso; el resto del tiempo está inactivo.
