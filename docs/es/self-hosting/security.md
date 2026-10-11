# Límites de seguridad

TypeType maneja datos de cuentas, cookies de sesión de YouTube, lógica de tokens
ejecutada en un navegador y medios descargados. Esta página describe los límites que
ofrece la pila Compose compatible y los que debes entender antes de personalizarla.

## Servicios públicos e internos {#public-and-internal-services}

Expón a los usuarios únicamente el servicio web. La pila actual usa estos límites:

| Servicio | Exposición por defecto en el host | Motivo |
| --- | --- | --- |
| `typetype` | todas las interfaces en `HOST_PORT_WEB` | Web pública, API, WebSocket, reproducción y pasarela de descargas |
| `typetype-server` | `127.0.0.1:HOST_PORT_SERVER` | Comprobación de estado y diagnóstico directo de la API desde el host, opcionales |
| `typetype-token` | `127.0.0.1:HOST_PORT_TOKEN` | Diagnóstico de estado desde el host, opcional; nunca una API pública |
| `garage` | `127.0.0.1:HOST_PORT_GARAGE_S3` | Diagnóstico y aprovisionamiento internos del almacén de objetos |
| Downloader, PostgreSQL, Dragonfly | solo la red de Compose | No requieren acceso directo del navegador ni de Internet |

El nginx incluido envía el tráfico `/api/` y `/sabr/` a Server. Server es entonces la
pasarela hacia Token y Downloader. No expongas Token, Downloader, PostgreSQL ni
Dragonfly a través de tu proxy inverso público.

## Secretos y credenciales almacenadas {#secrets-and-stored-credentials}

La pila separa tres tipos de secretos:

- `YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN` autentica las devoluciones de llamada del
  inicio de sesión remoto de Server a Token.
- `YOUTUBE_SESSION_ENCRYPTION_KEY` cifra las credenciales de sesión de YouTube
  almacenadas.
- `GARAGE_RPC_SECRET` autentica el tráfico RPC del clúster de Garage.

El instalador los genera y guarda los valores de YouTube en el volumen
`typetype_secrets`. Las instalaciones manuales deben generar un secreto RPC de Garage
aleatorio antes de arrancar la pila. Mantén privados el `.env`, el volumen de secretos
y las copias de seguridad de la base de datos.

Cambiar `YOUTUBE_SESSION_ENCRYPTION_KEY` hace ilegibles las sesiones de YouTube ya
almacenadas. Cambiar `GARAGE_RPC_SECRET` sin tener en cuenta el estado existente de
Garage puede impedir que el nodo del almacén de objetos arranque con normalidad.

## Límite del navegador de Token {#token-browser-boundary}

TypeType-Token lanza Chromium con Playwright para el trabajo de BotGuard y tokens PO,
y para el inicio de sesión interactivo opcional en YouTube. Trátalo como un servicio
que ejecuta un navegador:

- mantenlo en la red privada de Compose;
- mantén el puerto del host enlazado a `127.0.0.1`, o quita por completo el puerto
  publicado;
- monta solo el volumen de secretos generados, en modo de solo lectura;
- actualiza la imagen junto con el resto de la pila;
- no le des acceso a directorios del host que no tengan relación, ni al socket de
  Docker.

El Compose compatible usa actualmente `init: true` e `ipc: host` para la estabilidad
de Chromium. La imagen publicada todavía no declara el perfil completo sin root, de
solo lectura y sin capacidades investigado en la
[discusión #156](https://github.com/TypeType-Video/TypeType/discussions/156).

::: warning No apliques a ciegas un endurecimiento sin probar
Un contenedor puede responder a `/health` mientras `/potoken`, SABR o el inicio de
sesión remoto están rotos. Ejecutarlo como un usuario `nobody` arbitrario también deja
a Chromium sin un directorio personal utilizable. Valida todos los flujos de Token, no
solo su punto de estado, cuando pruebes un perfil de seguridad personalizado.
:::

La imagen actual de Playwright contiene una cuenta `pwuser`, y las pruebas de la
comunidad mostraron que un `/tmp` y un `/home/pwuser` con escritura pueden permitir un
sistema de archivos raíz de solo lectura. Esa configuración es un trabajo en curso
útil, pero todavía no es el valor por defecto de la pila compatible, porque el entorno
aislado del navegador, la elección de IPC, los tokens PO, SABR y el inicio de sesión
remoto deben validarse juntos.

Gracias a [hugoghx](https://github.com/hugoghx) por la investigación detallada de los
límites del contenedor y las pruebas reproducibles de la discusión #156.

## Nombres personalizados del servicio Token {#custom-token-service-names}

El nombre DNS del servicio en Compose es `typetype-token`, y Server usa actualmente
`http://typetype-token:8081` por defecto. Si una pila personalizada cambia el nombre
de ese servicio sin conservar el alias de red, asigna a la siguiente variable de
entorno de Server su URL interna:

```yaml
services:
  typetype-server:
    environment:
      SUBTITLE_SERVICE_URL: http://my-token-service:8081
```

`SUBTITLE_SERVICE_URL` es el nombre actual en el código, aunque Token se encarga ahora
de los tokens PO, la decodificación, SABR y el inicio de sesión remoto además de los
subtítulos. El Server actual no lee una variable `TOKEN_SERVICE_URL`.

Si el inicio de sesión remoto usa una dirección de Token distinta, define también
`YOUTUBE_REMOTE_LOGIN_SERVICE_URL` para Server. En la pila compatible ambos valores
apuntan al mismo servicio interno.

## Sesiones de autenticación {#authentication-sessions}

Los inicios de sesión locales y OIDC emiten un token de acceso de una hora y una
sesión de renovación rotativa válida durante 30 días. El valor de renovación es una
cookie `HttpOnly`, `Secure`, `SameSite=None`. Este diseño significa que:

- JavaScript puede usar el token de acceso de corta duración, pero no puede leer el
  token de renovación;
- en un dominio público hacen falta HTTPS y una gestión correcta de credenciales y
  CORS;
- la caducidad normal de un token de acceso debe provocar una renovación en lugar de
  cerrar la sesión del usuario;
- cerrar sesión o rotar el token de renovación puede revocar la sesión almacenada.

No hay un ajuste aparte para una duración de «recordarme». Los cierres de sesión
inesperados antes de los 30 días de la sesión de renovación deben diagnosticarse como
un problema de cookie, origen, proxy o sesión. Consulta
[Solución de problemas](./troubleshooting#unexpected-sign-outs).

Esta explicación responde a la pregunta planteada por
[Toni-Vide en la discusión #162](https://github.com/TypeType-Video/TypeType/discussions/162)
y se basa en el código de sesión actual de Server y del Frontend.

## Secretos de OIDC {#oidc-secrets}

Usa un cliente OIDC confidencial y guarda su secreto solo en el entorno de Server.
Registra la URL de devolución exacta, restringe las URI de redirección permitidas en
el proveedor y verifica OIDC antes de desactivar el inicio de sesión local. Consulta
[Autenticación (OIDC)](./authentication).

## Referencias {#source-references}

- [Límites de los servicios en el Compose estable](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.yml)
- [Imagen del contenedor Token](https://github.com/TypeType-Video/TypeType-Token/blob/dev/Dockerfile)
- [Implementación del navegador de Token](https://github.com/TypeType-Video/TypeType-Token/blob/dev/src/remote-login-browser.ts)
- [Duración del token de acceso de Server](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/AuthAccessTokenCodec.kt)
- [Duración de la sesión de renovación de Server](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/AuthTokenIssuer.kt)
- [Ajustes de la cookie de renovación](https://github.com/TypeType-Video/TypeType-Server/blob/dev/src/main/kotlin/dev/typetype/server/services/AuthCookieHelpers.kt)
