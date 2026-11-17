# Twitch (opcional)

La compatibilidad con Twitch es un servicio opcional, publicado como
[TypeType-Live](https://github.com/TypeType-Video/TypeType-Live). Con él, los usuarios exploran los directos,
categorías y etiquetas de Twitch, ven directos, emisiones pasadas y clips, leen y escriben en el chat, y pueden
vincular su cuenta de Twitch. Las emisiones pasadas guardan su posición como cualquier otro vídeo. Twitch nunca
ve su dirección IP, y su navegador nunca contacta con Twitch.

Una instancia sin él funciona exactamente igual que antes y no muestra ninguna sección de Twitch.

## Antes de empezar {#requirements}

| Recurso | Cantidad |
| --- | --- |
| Memoria | Unos 128 MB |
| Disco | Unos 10 MB para la imagen |
| TypeType | 1.18.0 o posterior |

Qué cambia en tu instancia: un contenedor nuevo, `typetype-live`, y Server se vuelve a crear con la dirección
del servicio. Solo Server y el contenedor web hablan con él; no publiques su puerto.

## A. Con el instalador {#install}

Ejecuta el instalador con `--twitch`, en una instancia nueva o existente:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --twitch
```

El instalador crea los secretos, añade el servicio y lo mantiene en las actualizaciones siguientes.

## B. A mano {#install-by-hand}

Para quien gestiona su instancia por su cuenta, por ejemplo con Dockge.

1. Añade a `.env` tres secretos aleatorios de al menos 32 caracteres. Sirve cualquier generador de
   contraseñas; `openssl rand -hex 32` muestra uno.

   ```dotenv
   TWITCH_SERVICE_SECRET=cambia-esto-por-un-valor-aleatorio
   TWITCH_TOKEN_ENCRYPTION_KEY=cambia-esto-por-otro-valor-aleatorio
   LIVE_SIGNING_KEY=cambia-esto-por-un-tercer-valor-aleatorio
   ```

   Conserva `TWITCH_TOKEN_ENCRYPTION_KEY` cuando haya cuentas vinculadas: si cambia, los usuarios tendrán que
   vincularlas de nuevo.

2. Añade el servicio a `docker-compose.override.yml`, junto a `docker-compose.yml` (créalo si no existe; el
   instalador lo conserva en las actualizaciones):

   ```yaml
   services:
     typetype-server:
       environment:
         TWITCH_SERVICE_URL: http://typetype-live:8080
         TWITCH_SERVICE_SECRET: ${TWITCH_SERVICE_SECRET}
         TWITCH_TOKEN_ENCRYPTION_KEY: ${TWITCH_TOKEN_ENCRYPTION_KEY}

     typetype-live:
       image: ghcr.io/typetype-video/typetype-live:${TYPETYPE_VERSION:-latest}
       restart: unless-stopped
       environment:
         LIVE_SECRET: ${TWITCH_SERVICE_SECRET}
         LIVE_SIGNING_KEY: ${LIVE_SIGNING_KEY}
         LIVE_PUBLIC_BASE: /live
       mem_limit: 128m
       read_only: true
       cap_drop: [ALL]
       security_opt: ["no-new-privileges:true"]
   ```

   Durante la release candidate, la instancia sigue `TYPETYPE_VERSION=rc`, y Live también.

3. Arráncalo:

   ```sh
   docker compose up -d
   ```

   El contenedor web ya envía los enlaces de vídeo bajo `/live/` a `typetype-live:8080`. Si tu contenedor de Live
   tiene otro nombre, define `TYPETYPE_LIVE_HOST` (y `TYPETYPE_LIVE_PORT`) en el contenedor web.

## Comprobar que funciona {#check}

Abre la instancia: la barra lateral muestra **Live**. Abre un canal en directo y su chat. En la carpeta de la
instancia, `docker compose ps typetype-live` muestra el contenedor como `healthy`.

## Vincular una cuenta de Twitch {#link-account}

Cada usuario puede vincular su propia cuenta de Twitch desde **Live > Link a Twitch account**. TypeType muestra un
código para introducir en `twitch.tv/activate` desde cualquier dispositivo con sesión en Twitch. Una cuenta
vinculada muestra los directos seguidos, permite escribir en el chat y seguir canales, y lee el chat y los
capítulos de las emisiones pasadas con esa cuenta. Los tokens se guardan cifrados en la base de datos y nunca
llegan al navegador.

## Quitarlo {#remove}

Con el instalador, pon `TWITCH_ENABLED=false` en `.env` y vuelve a ejecutarlo. A mano, quita el bloque
`typetype-live` y las tres líneas `TWITCH_*` de `docker-compose.override.yml` y ejecuta
`docker compose up -d --remove-orphans`. La sección de Twitch desaparece; las cuentas vinculadas siguen cifradas
en la base de datos.

## Ajustes {#settings}

| Variable | Por defecto | Función |
| --- | --- | --- |
| `TWITCH_SERVICE_URL` | | Dirección del servicio, tal como Server la alcanza |
| `TWITCH_SERVICE_SECRET` | | Compartido por Server y Live (`LIVE_SECRET`), 32 caracteres o más |
| `TWITCH_TOKEN_ENCRYPTION_KEY` | | Cifra las cuentas de Twitch vinculadas, 32 caracteres o más |
| `LIVE_SIGNING_KEY` | aleatorio al arrancar | Mantiene válidos los enlaces de vídeo tras un reinicio, 32 caracteres o más |
| `LIVE_SEGMENT_CACHE` | `32MiB` | Memoria de los segmentos de vídeo compartidos |
| `TWITCH_SERVICE_TIMEOUT_MS` | `15000` | Tiempo de espera de las llamadas de Server a Live |

Twitch sigue apagado hasta que Server tenga las tres primeras. Cada secreto acepta también una variante `_FILE`
que lee el valor de un archivo.
