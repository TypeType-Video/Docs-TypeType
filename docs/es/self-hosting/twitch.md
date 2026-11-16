# Twitch (opcional)

La compatibilidad con Twitch es un servicio opcional, publicado como
[TypeType-Live](https://github.com/TypeType-Video/TypeType-Live). Con él, los usuarios exploran los directos,
categorías y etiquetas de Twitch, ven directos, emisiones pasadas y clips, leen y escriben en el chat, y pueden
vincular su cuenta de Twitch. Las emisiones pasadas guardan su posición como cualquier otro vídeo. Twitch nunca ve su dirección IP, y su navegador nunca contacta con Twitch.

Una instancia sin él funciona exactamente igual que antes y no muestra ninguna sección de Twitch.

## Antes de empezar {#requirements}

| Recurso | Cantidad |
| --- | --- |
| Memoria | Unos 128 MB (`LIVE_MEMORY_LIMIT`) |
| Disco | Unos 10 MB para la imagen |
| TypeType | 1.18.0 o posterior, instalado con el instalador o el archivo Compose compatible |

Qué cambia en tu instancia al añadirlo:

- un contenedor nuevo, `typetype-live`;
- tres secretos nuevos en el volumen `typetype_secrets`, creados por `typetype-init`: el secreto que Server
  comparte con Live, la clave que cifra las cuentas de Twitch vinculadas y la clave que mantiene válidos los
  enlaces de reproducción tras un reinicio;
- Server se vuelve a crear con la dirección del servicio.

Los comandos de esta página usan `$STACK_DIR` para la carpeta de tu instancia:

```sh
STACK_DIR=~/typetype-stack
```

## A. Con el instalador {#install}

Ejecuta el instalador con `--twitch`, en una instancia nueva o existente:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --twitch
```

Sin `--yes`, el instalador también lo pregunta. Escribe `TWITCH_ENABLED=true` en `.env` para que las
actualizaciones siguientes mantengan Twitch.

## B. A mano {#install-by-hand}

```sh
cd "$STACK_DIR"
COMPOSE_TWITCH_FILE=docker-compose.twitch.yml ./scripts/run-stack-init.sh
docker compose -f docker-compose.yml -f docker-compose.twitch.yml up -d --wait
```

Añade `TWITCH_ENABLED=true` a `.env` si después actualizas con el instalador.

## Comprobar que funciona {#check}

Abre la instancia: la barra lateral muestra **Live**. Abre un canal en directo y su chat.

```sh
docker compose -f docker-compose.yml -f docker-compose.twitch.yml ps typetype-live
```

El contenedor debe estar `healthy`.

## Vincular una cuenta de Twitch {#link-account}

Cada usuario puede vincular su propia cuenta de Twitch desde **Live > Link a Twitch account**. TypeType muestra
un código para introducir en `twitch.tv/activate` desde cualquier dispositivo con sesión en Twitch. Una cuenta
vinculada muestra los directos seguidos, permite escribir en el chat y seguir canales, y lee el chat y los
capítulos de las emisiones pasadas con esa cuenta. Los tokens se guardan cifrados en la base de datos y nunca
llegan al navegador.

## Quitarlo {#remove}

Pon `TWITCH_ENABLED=false` en `.env`, para que una actualización no lo vuelva a añadir, y arranca la instancia
sin el archivo de Twitch:

```sh
cd "$STACK_DIR"
docker compose -f docker-compose.yml up -d --remove-orphans --wait
```

La sección de Twitch desaparece. Las cuentas vinculadas siguen cifradas en la base de datos.

## Ajustes {#settings}

| Variable | Por defecto | Función |
| --- | --- | --- |
| `TYPETYPE_LIVE_IMAGE` | sigue `TYPETYPE_VERSION` | Imagen de Live |
| `LIVE_MEMORY_LIMIT` | `128m` | Memoria máxima del contenedor |
| `LIVE_SEGMENT_CACHE` | `48MiB` | Caché compartida de segmentos de vídeo |
| `TWITCH_SERVICE_TIMEOUT_MS` | `15000` | Tiempo de espera de las llamadas de Server a Live |

## Tu propio archivo Compose {#own-compose}

Si ejecutas TypeType con tu propio archivo Compose, añade el servicio `typetype-live` de
[docker-compose.twitch.yml](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.twitch.yml)
sin publicar su puerto: solo el servidor y el contenedor web hablan con él. Sus variables están en el
[README de TypeType-Live](https://github.com/TypeType-Video/TypeType-Live).

### Conectar el servidor al servicio {#server}

| Variable | Significado |
| --- | --- |
| `TWITCH_SERVICE_URL` | Dirección del servicio, por ejemplo `http://typetype-live:8080` |
| `TWITCH_SERVICE_SECRET` | El mismo valor que `LIVE_SECRET` |
| `TWITCH_TOKEN_ENCRYPTION_KEY` | Al menos 32 caracteres aleatorios; cifra las cuentas de Twitch que vinculan los usuarios |
| `TWITCH_SERVICE_TIMEOUT_MS` | Tiempo de espera de las peticiones al servicio, `15000` por defecto |

`TWITCH_SERVICE_SECRET` y `TWITCH_TOKEN_ENCRYPTION_KEY` también aceptan una variante `_FILE`
que lee el valor de un archivo. Twitch sigue desactivado hasta que las tres primeras
variables estén definidas.

### El contenedor web {#web}

La imagen web ya envía `/live/hls/` al servicio en `typetype-live:8080`. Define
`TYPETYPE_LIVE_HOST` y `TYPETYPE_LIVE_PORT` en el contenedor web si el tuyo tiene otro nombre
u otro puerto. Solo los enlaces de vídeo firmados pasan por esa ruta; la API del servicio
sigue privada detrás del secreto compartido.
