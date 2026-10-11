# Beta y main

TypeType se publica en dos canales, y puedes ejecutarlos uno junto al otro en el mismo
host.

| Canal | Rama | Imágenes | Puertos por defecto |
| --- | --- | --- | --- |
| **main** (estable) | `main` | `ghcr.io/typetype-video/typetype:latest`, `...-server:latest`, ... | web `8082`, servidor `8080`, token `8081`, S3 `3900` |
| **beta** | `dev` | `ghcr.io/typetype-video/typetype-beta:latest`, `...-server-beta:latest`, ... | web `18082`, servidor `18080`, descargador `19093`, token `18081`, S3 `3900` |

La CI construye las imágenes automáticamente: un push a `main` actualiza las imágenes
`:latest`, y un push a `dev` actualiza las imágenes `-beta`. Así, **main es la versión
estable** y **beta es el adelanto de lo que viene**.

Los repositorios, las fijaciones de submódulos, las notificaciones de imágenes y los
despliegues son partes distintas de la ruta de publicación. Lee
[Ramas y versiones](/es/project/releases) cuando necesites la procedencia exacta del
código o de una imagen.

## Cuándo usar la beta {#when-to-use-beta}

- Para probar funciones futuras antes de que lleguen a la versión estable.
- Para reproducir o confirmar un error con la última compilación de `dev` antes de
  informar de él.

La beta puede romperse o cambiar sin aviso: mantén tus datos reales en el canal main.

## Ejecutar la beta junto a main {#run-beta-alongside-main}

La pila beta se define en `docker-compose.dev.yml`. Cuando se lanza desde el mismo
directorio de trabajo lee el mismo `.env`, incluidas las credenciales y los ajustes de
la base de datos, pero un nombre de proyecto de Compose distinto le da contenedores,
redes y volúmenes de datos con nombre separados. Esto no aísla los puertos del host:
el puerto por defecto de Garage en la beta incluida también es `3900`, así que una
instalación manual en paralelo debe cambiarlo.

### Un comando (recomendado) {#one-command-recommended}

El script de instalación de la rama beta puede levantar la pila beta por ti. Usa la
compilación de `dev`, así que descárgalo desde `dev` y pasa `--beta`:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/dev/scripts/install-stack.sh | bash -s -- --beta
```

Esto crea `~/typetype-beta-stack`, descarga solo `docker-compose.dev.yml` y sus
archivos asociados, elige puertos `*_BETA` libres cuando los predeterminados están
ocupados, descarga las imágenes beta, arranca esa pila e inicializa Garage. Es
interactivo por defecto; añade `--yes` para saltarte las preguntas, o
`--download-only` para descargar los archivos sin arrancar Docker.

### A mano {#manually}

Antes de arrancar la beta junto a main, da a Garage un puerto libre en el host y
permite el origen web de la beta. Para los valores por defecto incluidos:

```dotenv
HOST_PORT_GARAGE_S3_BETA=13900
ALLOWED_ORIGINS=http://localhost:8082,http://127.0.0.1:8082,http://localhost:18082,http://127.0.0.1:18082
```

Conserva los orígenes públicos que ya estén en `ALLOWED_ORIGINS`.

```sh
docker compose -f docker-compose.dev.yml -p typetype-beta up -d
```

- main sigue sirviendo en `http://localhost:8082`,
- la beta sirve en `http://localhost:18082`.

Gestiona la pila beta con las mismas opciones `-f`/`-p`:

```sh
docker compose -f docker-compose.dev.yml -p typetype-beta ps
docker compose -f docker-compose.dev.yml -p typetype-beta pull
docker compose -f docker-compose.dev.yml -p typetype-beta down
```

## Actualizar un canal {#update-a-channel}

```sh
# main
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes

# beta
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/dev/scripts/install-stack.sh | bash -s -- --beta --yes
```

Volver a ejecutar el instalador conserva el `.env`, los puertos y los volúmenes de
datos existentes del canal, y actualiza los archivos de la pila y las imágenes.

::: tip Puertos ya en uso
El instalador elige puertos libres. Para un lanzamiento manual, cambia en `.env` cada
valor `HOST_PORT_*_BETA` que entre en conflicto antes de arrancar la pila beta. En
concreto, tanto la estable como la beta vienen con el puerto `3900` de Garage por
defecto. Consulta [Configuración](./configuration#ports).
:::
