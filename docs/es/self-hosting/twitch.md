# Twitch (opcional)

::: warning Solo ramas de desarrollo
El soporte de Twitch está en las ramas `dev` de TypeType-Server y TypeType-Frontend. Todavía
no forma parte de ninguna versión publicada, y la pila central no lo incluye.
:::

El soporte de Twitch es un servicio opcional, publicado como
[TypeType Live](https://github.com/TypeType-Video/TypeType-Live). Una pila sin él funciona
exactamente igual que antes: el servidor responde `404` en sus rutas de Twitch y la
aplicación web oculta la sección de Twitch.

Con él, tus usuarios ven directos, VOD y clips de Twitch a través de tu instancia. Twitch
nunca ve su dirección IP, y su navegador nunca contacta con Twitch.

## Antes de empezar {#requirements}

| Recurso | Cantidad |
| --- | --- |
| Memoria | Limitada a 128 MB, con `GOMEMLIMIT` en 100 MiB |
| Imagen | Construida desde el código fuente; todavía no hay ninguna imagen publicada |
| Red | Acceso saliente a Twitch desde el servicio |

## 1. Construir y lanzar el servicio {#service}

```sh
git clone https://github.com/TypeType-Video/TypeType-Live.git
cd TypeType-Live
docker build -t typetype-live:local .
```

Añádelo al archivo Compose de tu pila, en la misma red que el servidor y el contenedor web:

```yaml
  typetype-live:
    image: typetype-live:local
    restart: unless-stopped
    environment:
      LIVE_SECRET: ${LIVE_SECRET}
      LIVE_SIGNING_KEY: ${LIVE_SIGNING_KEY}
      LIVE_PUBLIC_BASE: /live
      LIVE_SEGMENT_CACHE: 48MiB
      GOMEMLIMIT: 100MiB
    read_only: true
    cap_drop: [ALL]
    security_opt:
      - no-new-privileges:true
    pids_limit: 128
    mem_limit: 128m
```

No publiques su puerto. Solo el servidor y el contenedor web hablan con él.

| Variable | Por defecto | Significado |
| --- | --- | --- |
| `LIVE_SECRET` | obligatoria | Compartida con el servidor, al menos 32 caracteres |
| `LIVE_SIGNING_KEY` | aleatoria al arrancar | Mantiene válidos los enlaces de vídeo firmados tras un reinicio, al menos 32 caracteres |
| `LIVE_PUBLIC_BASE` | | Prefijo público de los enlaces de vídeo, `/live` con el contenedor web de TypeType |
| `LIVE_SEGMENT_CACHE` | `32MiB` | Memoria para los segmentos de vídeo compartidos: aproximadamente canales vistos x tamaño de segmento x 6 |
| `LIVE_ADDR` | `:8080` | Dirección de escucha |
| `LIVE_LOG_LEVEL` | `info` | Nivel de registro |

## 2. Conectar el servidor al servicio {#server}

| Variable | Significado |
| --- | --- |
| `TWITCH_SERVICE_URL` | Dirección del servicio, por ejemplo `http://typetype-live:8080` |
| `TWITCH_SERVICE_SECRET` | El mismo valor que `LIVE_SECRET` |
| `TWITCH_TOKEN_ENCRYPTION_KEY` | Al menos 32 caracteres aleatorios; cifra las cuentas de Twitch que vinculan los usuarios |
| `TWITCH_SERVICE_TIMEOUT_MS` | Tiempo de espera de las peticiones al servicio, `15000` por defecto |

`TWITCH_SERVICE_SECRET` y `TWITCH_TOKEN_ENCRYPTION_KEY` también aceptan una variante `_FILE`
que lee el valor de un archivo. Twitch sigue desactivado hasta que las tres primeras
variables estén definidas.

## 3. El contenedor web {#web}

La imagen web ya envía `/live/hls/` al servicio en `typetype-live:8080`. Define
`TYPETYPE_LIVE_HOST` y `TYPETYPE_LIVE_PORT` en el contenedor web si el tuyo tiene otro nombre
u otro puerto. Solo los enlaces de vídeo firmados pasan por esa ruta; la API del servicio
sigue privada detrás del secreto compartido.

## Lo que obtienen tus usuarios {#features}

- Una sección de Twitch con directos, categorías y búsqueda.
- Directos, VOD y clips reproducidos a través de la instancia.
- El chat en directo, con insignias y emotes.
- Vincular su cuenta de Twitch con un código en twitch.tv/activate, para los directos que
  siguen, el contenido para suscriptores y enviar mensajes en el chat.
