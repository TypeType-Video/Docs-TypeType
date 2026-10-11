# Configuración

La pila compatible lee las decisiones de despliegue de `.env`. El instalador crea y actualiza este archivo por ti. Para una instalación manual, copia `.env.example`, sustituye los valores indicados más abajo y mantén el archivo fuera del control de versiones.

No todas las variables internas de los servicios pertenecen a `.env`: el archivo Compose central deriva las URL internas y solo pasa a cada contenedor los ajustes compatibles. Usa un override de Compose para construir una topología personalizada.

## Puertos web y de diagnóstico {#ports}

| Variable | Por defecto | Función |
| --- | --- | --- |
| `HOST_PORT_WEB` | `8082` | Contenedor web público; nginx sirve la aplicación, la API, los WebSockets, SABR y las descargas |
| `HOST_BIND_SERVER` | `127.0.0.1` | Dirección del host para el puerto de diagnóstico de Server |
| `HOST_PORT_SERVER` | `8080` | Puerto de diagnóstico y de acceso directo a la API de Server |
| `HOST_BIND_TOKEN` | `127.0.0.1` | Dirección del host para el puerto de diagnóstico de Token |
| `HOST_PORT_TOKEN` | `8081` | Puerto de estado y versión de Token |
| `HOST_BIND_GARAGE_S3` | `127.0.0.1` | Dirección del host para el aprovisionamiento y el diagnóstico de Garage |
| `HOST_PORT_GARAGE_S3` | `3900` | Puerto S3 de Garage |

Solo `HOST_PORT_WEB` necesita entrada pública. Mantén los demás enlaces en la interfaz de bucle local, salvo que una red de confianza concreta los necesite. Downloader, PostgreSQL y Dragonfly no tienen un puerto estable en el host en el archivo Compose compatible.

La beta usa los valores `HOST_PORT_*_BETA` y `HOST_BIND_*_BETA` correspondientes. Consulta [Beta y main](./beta-and-main).

## Orígenes de navegador permitidos {#allowed-browser-origins}

| Variable | Por defecto | Función |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | URL de desarrollo en localhost | Orígenes de navegador, separados por comas, que pueden llamar a Server |

Un origen es el esquema, el host y el puerto opcional, sin ruta ni barra final:

```dotenv
ALLOWED_ORIGINS=https://watch.example.com,http://192.0.2.10:8082
```

El origen del navegador debe coincidir exactamente. Una página puede cargarse con normalidad mientras el registro, el inicio de sesión u otras acciones de la API fallan con un `403` vacío si este valor es incorrecto. Después de un cambio, vuelve a crear Server:

```sh
docker compose up -d --force-recreate typetype-server
```

Este diagnóstico se confirmó gracias al [informe del primer administrador de hulmgulm](https://github.com/TypeType-Video/TypeType/discussions/151).

## Sesiones de cuenta {#account-sessions}

| Variable | Por defecto | Función |
| --- | --- | --- |
| `AUTH_SESSION_TTL_DAYS` | `30` | Duración de la sesión de renovación en días, acotada entre `1` y `365` |
| `AUTH_ALLOW_INSECURE_COOKIES` | `false` | Permite cookies de renovación sobre HTTP sin cifrar con `SameSite=Lax` |

Los tokens de acceso duran siempre una hora. Una sesión de renovación válida los renueva en silencio, así que `AUTH_SESSION_TTL_DAYS` controla cuánto tiempo puede una cuenta seguir con la sesión iniciada sin volver a iniciarla.

Mantén `AUTH_ALLOW_INSECURE_COOKIES=false` con HTTPS y en todo despliegue público. Ponlo en `true` solo cuando una instancia local de confianza deba funcionar sobre HTTP sin cifrar. Esto debilita la seguridad del transporte; consulta [Duración de la sesión](./authentication#session-lifetime).

Vuelve a crear Server después de cambiar cualquiera de los dos valores:

```sh
docker compose up -d --force-recreate typetype-server
```

## Base de datos y caché {#database-and-cache}

El servicio PostgreSQL incluido usa estos valores:

| Variable | Por defecto | Función |
| --- | --- | --- |
| `POSTGRES_DB` | `typetype` | Base de datos principal de la aplicación |
| `POSTGRES_USER` | `typetype` | Usuario de PostgreSQL |
| `POSTGRES_PASSWORD` | `typetype` | Contraseña de PostgreSQL; sustitúyela en un despliegue real |
| `DRAGONFLY_URL` | `redis://dragonfly:6379` | URL de la caché de Server |
| `DRAGONFLY_MAX_MEMORY` | `2gb` | Memoria que puede usar la caché. Cuando se llena, olvida sus entradas más antiguas en lugar de rechazar las nuevas. |
| `DRAGONFLY_THREADS` | `4` | Hilos de la caché. Dragonfly necesita 256 MB de `DRAGONFLY_MAX_MEMORY` por hilo y no arranca con menos. |

`POSTGRES_DB`, `POSTGRES_USER` y `POSTGRES_PASSWORD` son la fuente de verdad a nivel de la pila. Compose deriva de ellos los valores `DATABASE_*` de Server y el `DB_URL` de Downloader. Cambia los valores de PostgreSQL una sola vez, en lugar de duplicar una contraseña en varias variables específicas de cada servicio.

Elige estos valores antes del primer arranque. Una vez que PostgreSQL ha inicializado su volumen, cambiar solo `.env` no cambia la contraseña del rol existente en la base de datos.

Esta disposición responde a la incoherencia identificada por [arcoast en la discusión #123](https://github.com/TypeType-Video/TypeType/discussions/123).

Para una base de datos externa, define `DATABASE_URL`, `DATABASE_USER` y `DATABASE_PASSWORD` para Server, y `DB_URL` para Downloader, con un override de Compose. En el diseño actual, Downloader necesita su propia base de datos `typetype_downloader`.

## Descargas y Garage {#downloads-and-garage}

| Variable | Por defecto | Función |
| --- | --- | --- |
| `DOWNLOADER_S3_ACCESS_KEY` | marcador | Clave de acceso de Garage; debe empezar por `GK` |
| `DOWNLOADER_S3_SECRET_KEY` | marcador | Secreto de la clave de acceso de Garage |
| `GARAGE_RPC_SECRET` | marcador | Secreto RPC del clúster de Garage, 32 bytes en hexadecimal |

El instalador genera los tres valores y aprovisiona el bucket. Una instalación sin scripts debe sustituir los marcadores y completar [Instalación manual, Parte 2](./docker-compose#part-2-object-storage-for-downloads).

El Downloader incluido usa `http://garage:3900` tanto para su cliente S3 como para la URL prefirmada del artefacto. Server reconoce ese nombre de host interno y entrega el archivo terminado al navegador. No hay ninguna variable `DOWNLOADER_S3_PUBLIC_ENDPOINT` obligatoria en el `.env` compatible.

La generación de `GARAGE_RPC_SECRET` se añadió después de que [arcoast señalara el secreto que faltaba en la discusión #130](https://github.com/TypeType-Video/TypeType/discussions/130).

## Configuración incluida y personalizada de los servicios {#bundled-and-custom-service-configuration}

La imagen web es dueña de la configuración de nginx compatible. La pila central no monta `nginx.conf` desde el host, así que las correcciones del proxy llegan con las actualizaciones normales de la imagen web.

El servicio de inicialización `garage-config` escribe la configuración por defecto de Garage en el volumen con nombre `garage_config` solo cuando ese volumen no contiene ya una configuración. El contenido existente nunca se sobrescribe. Durante la migración desde una pila antigua, el instalador prepara el `garage.toml` anterior del host y el servicio de inicialización lo importa en el primer uso.

Mantén los cambios deliberados de nginx o Garage en archivos separados y móntalos mediante `docker-compose.override.yml`. El instalador conserva el override y no sustituye los archivos de configuración que no gestiona. Consulta [Configuración personalizada de nginx o Garage](./docker-compose#custom-nginx-or-garage-configuration) para ver un ejemplo.

## YouTube y Token {#youtube-and-token}

Token sigue activado porque la reproducción de YouTube usa sus puntos de acceso de tokens PO, decodificador, subtítulos y SABR. El siguiente indicador controla únicamente el inicio de sesión remoto interactivo:

| Variable | Por defecto | Función |
| --- | --- | --- |
| `YOUTUBE_REMOTE_LOGIN_ENABLED` | `false` | Activa el inicio de sesión interactivo en YouTube |
| `YOUTUBE_OUTBOUND_PROXY_URL` | vacío | Proxy de salida opcional usado para el tráfico de YouTube |
| `YOUTUBE_REMOTE_LOGIN_CALLBACK_BASE_URL` | `http://localhost:8080` | Origen interno de Server que recibe la devolución de llamada de finalización de Token |
| `YOUTUBE_REMOTE_LOGIN_CALLBACK_ORIGIN` | `http://typetype-server:8080` | Origen interno de devolución de llamada usado por Token |
| `YOUTUBE_REMOTE_LOGIN_TTL_MS` | `480000` | Duración solicitada por Server, acotada entre 1 y 10 minutos |
| `YOUTUBE_REMOTE_LOGIN_MAX_SESSIONS` | `2` | Sesiones simultáneas de navegador remoto, acotadas entre 1 y 8 |
| `YOUTUBE_REMOTE_LOGIN_FRAME_FPS` | `10` | Frecuencia de captura de la vista de inicio de sesión |
| `YOUTUBE_REMOTE_LOGIN_MAX_FRAME_BYTES` | `524288` | Tamaño máximo de un fotograma de inicio de sesión codificado |

Mantén la devolución de llamada por defecto como una URL interna de Server. El navegador llega a la sesión de inicio de sesión a través del origen web público y un WebSocket; no llama directamente a esa dirección de devolución.

Los dos ajustes de devolución de llamada deben usar el mismo origen interno de Server en una pila Compose personalizada. Pon en `YOUTUBE_REMOTE_LOGIN_CALLBACK_BASE_URL` en Server y en `YOUTUBE_REMOTE_LOGIN_CALLBACK_ORIGIN` en Token el nombre de host y el puerto que Token puede alcanzar en la red de Compose, por ejemplo `http://typetype-server:8080`. No uses la URL web pública para ninguno de los dos.

En el archivo Compose compatible, Token conserva su propio límite por defecto de ocho minutos, porque esta variable de duración solo se pasa a Server. Por tanto, los valores superiores a ocho minutos no alargan la reserva efectiva sin una configuración personalizada de Token.

Las pilas Compose personalizadas que cambian el nombre del servicio `typetype-token` deben definir la variable actual del punto de acceso interno de Server, `SUBTITLE_SERVICE_URL`, o mantener `typetype-token` como alias de red. Consulta [Nombres personalizados del servicio Token](./security#custom-token-service-names).

## Límites de peticiones a YouTube {#youtube-request-limits}

Una instancia llega a YouTube por una sola dirección, y YouTube rechaza una dirección que pide demasiado: los vídeos abiertos empiezan a fallar con «Sign in to confirm you're not a bot», durante más de diez minutos. La búsqueda, las páginas de canales y las páginas de vídeos toleran mucho más que abrir vídeos.

Server lee estos valores de su propio entorno. El archivo Compose compatible no los transmite: defínelos con un override de Compose sobre `typetype-server`.

| Variable | Por defecto | Función |
| --- | --- | --- |
| `YOUTUBE_OPENS_PER_MINUTE` | `0` (sin límite) | Vídeos que toda la instancia abre en YouTube en un minuto. Por encima, cada vídeo espera su turno, 30 segundos como máximo. Un vídeo que nadie está esperando nunca hace cola: sale ahora o no sale. |
| `YOUTUBE_SESSION_RENEWAL` | activado | Tras tres vídeos rechazados en un minuto, Server pide a Token una sesión nueva, una vez, y después espera dos minutos. `off` lo desactiva. |
| `YOUTUBE_LIVE_PROBE` | primero el cliente de directos | `after` pregunta primero al cliente habitual, y al cliente de directos solo para lo que este dice que está en directo. Úsalo en una instancia con mucha carga: el cliente de directos atiende un vídeo cada vez. |
| `STREAM_PREVIEWS` | activado | `off` rechaza todo vídeo pedido antes de que alguien lo vea, por ejemplo al pasar el cursor por una tarjeta. |
| `SABR_INITIALIZATION_RANGE` | activado | `off` omite una petición que YouTube rechaza en cada reproducción para algunas direcciones. |
| `EXTRACTOR_SIMULTANEOUS_REQUESTS_PER_HOST` | `64` | Peticiones que el extractor puede tener en curso hacia un mismo host a la vez |
| `EXTRACTOR_HTTP_VERSION` | HTTP/2 | `1` usa una petición por conexión. Úsalo si Server deja de responder con mucha gente mientras su procesador está inactivo. |
| `SUBSCRIPTION_FEED_MAX_CONCURRENT_FETCHES` | `20` | Páginas de canales pedidas a la vez cuando se construye un feed de suscripciones; solo puede reducirse |
| `SUBSCRIPTION_FEED_FRESHNESS_SECONDS` | `60` | Antigüedad que puede tener un feed de suscripciones antes de que leerlo inicie una actualización; solo puede aumentarse, hasta un día |
| `YOUTUBE_REQUEST_LOG` | desactivado | `1` escribe una línea de registro por cada petición enviada a YouTube. Solo para diagnóstico. |

```yaml
services:
  typetype-server:
    environment:
      YOUTUBE_OPENS_PER_MINUTE: "120"
      YOUTUBE_LIVE_PROBE: after
```

Guárdalo como `docker-compose.override.yml` en el directorio de la pila y después vuelve a crear Server:

```sh
docker compose up -d --force-recreate typetype-server
```

Server nunca pide por sí mismo a YouTube el texto de una pista de subtítulos; esa es la dirección que YouTube vigila más de cerca.

## Servicio de recomendaciones {#recommender}

El servicio de recomendaciones opcional tiene su propia página, con sus requisitos y todos sus ajustes: [Servicio de recomendaciones](./recommender).

## Secretos de YouTube {#secrets-handled-automatically}

| Variable | Función |
| --- | --- |
| `YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN` | Autentica las devoluciones de llamada del inicio de sesión remoto entre Server y Token |
| `YOUTUBE_SESSION_ENCRYPTION_KEY` | Cifra las credenciales de sesión de YouTube almacenadas |

El contenedor de inicialización `typetype-secrets` los escribe en un volumen con nombre privado. Los valores vacíos y los marcadores `SET_ME_...` hacen que se genere un valor en el primer arranque. Proporcionar un valor real en `.env` sustituye al archivo generado.

No rotes `YOUTUBE_SESSION_ENCRYPTION_KEY` a la ligera: las sesiones de YouTube ya almacenadas no pueden descifrarse con otra clave.

## OIDC {#oidc}

Server admite las variables OIDC, pero no forman parte del `.env.example` básico. Añádelas mediante un override de Compose, como se documenta en [Autenticación (OIDC)](./authentication). Las variables de Server admitidas son:

- `OIDC_ISSUER` (o `OIDC_ISSUER_URL`);
- `OIDC_CLIENT_ID`;
- `OIDC_CLIENT_SECRET`;
- opcionalmente, `OIDC_DISCOVERY_URL`, `OIDC_SCOPES` y `OIDC_PROVIDER_NAME`.

## Imágenes alternativas {#image-overrides}

Déjalas vacías para seguir las etiquetas de imagen normales, estable o beta:

| Estable | Beta |
| --- | --- |
| `TYPETYPE_WEB_IMAGE` | `TYPETYPE_WEB_BETA_IMAGE` |
| `TYPETYPE_SERVER_IMAGE` | `TYPETYPE_SERVER_BETA_IMAGE` |
| `TYPETYPE_DOWNLOADER_IMAGE` | `TYPETYPE_DOWNLOADER_BETA_IMAGE` |
| `TYPETYPE_TOKEN_IMAGE` | `TYPETYPE_TOKEN_BETA_IMAGE` |
| `TYPETYPE_RECOMMENDER_IMAGE` | `TYPETYPE_RECOMMENDER_IMAGE` |

Asígnales referencias inmutables `ghcr.io/...@sha256:...` para una vuelta atrás o un despliegue fijado. Consulta [Revertir una actualización](./rollback).

## Informes de errores {#bug-reports}

| Variable | Por defecto | Función |
| --- | --- | --- |
| `GITHUB_REPO` | `TypeType-Video/TypeType` | Repositorio al que apunta el enlace de informe dentro de la aplicación |
| `GITHUB_ISSUE_TEMPLATE` | `bug_report_backend.md` | Nombre del archivo de plantilla añadido al enlace de informe dentro de la aplicación |

::: warning Desajuste actual con el gestor central de incidencias
El repositorio de destino y la plantilla que se distribuyen no coinciden actualmente: `bug_report_backend.md` existe en TypeType-Server, no en el repositorio central TypeType. El selector central sí ofrece `bug_report.yml`, pero ese archivo es un formulario de incidencia estructurado cuyos campos usan sus propios identificadores de consulta; el generador de la aplicación envía un único `body` en Markdown. Por tanto, sustituir el nombre del archivo por `bug_report.yml` no es una corrección equivalente para el prellenado del diagnóstico.
:::

Cuando apuntes a un fork o a otro repositorio, usa una plantilla compatible con la URL que espera su flujo de incidencias. Consulta la limitación actual y la vía de informe manual en [Informar de problemas](./reporting-issues#from-inside-the-app).

## Validar la configuración resultante {#validate-the-resolved-configuration}

Compose puede mostrar el grafo final de servicios sin arrancarlo:

```sh
docker compose config -q
docker compose config
```

El segundo comando expande las variables, así que no pegues su salida en público sin quitar las contraseñas y los secretos.

## Referencias {#source-references}

- [`.env.example` actual](https://github.com/TypeType-Video/TypeType/blob/main/.env.example)
- [Entorno del Compose estable](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.yml)
- [Carga del entorno de Server](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/Application.kt)
- [Configuración del inicio de sesión remoto](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/YoutubeRemoteBrowserConfig.kt)
