# Solución de problemas

Empieza por mirar qué está haciendo un servicio:

```sh
docker compose ps               # estado de cada servicio
docker compose logs -f <name>   # seguir un servicio, por ejemplo typetype-server
```

## Un puerto ya está en uso {#a-port-is-already-in-use}

`docker compose up` falla con un error «address already in use» o «port is
allocated». Otro programa usa ese puerto. Cambia el `HOST_PORT_*` correspondiente en
`.env` (consulta [Configuración](./configuration#ports)) y vuelve a ejecutar
`docker compose up -d`.

## La página carga pero las acciones fallan con errores de CORS o de red {#the-page-loads-but-actions-fail-with-cors-network-errors}

La aplicación web carga, pero iniciar sesión o cargar contenido falla. Tu dominio
falta en `ALLOWED_ORIGINS`. Pon tu origen real (por ejemplo
`https://watch.example.com`) y después `docker compose up -d`. Consulta
[Proxy inverso y HTTPS](./reverse-proxy#before-you-start).

La coincidencia es exacta: incluye el esquema y el puerto, y omite la barra final. Por
ejemplo, una página abierta en `http://server.lan:32110` necesita:

```dotenv
ALLOWED_ORIGINS=http://server.lan:32110
```

Vuelve a crear Server después de editar `.env`:

```sh
docker compose up -d --force-recreate typetype-server
```

Este fallo concreto del primer administrador se aisló con
[hulmgulm en la discusión #151](https://github.com/TypeType-Video/TypeType/discussions/151).

## Un servicio se reinicia continuamente {#a-service-keeps-restarting}

```sh
docker compose logs --tail=50 <name>
```

- `typetype-server` espera a `postgres` y a los contenedores de inicialización; si se
  reinicia, comprueba que `postgres` está sano y que `DATABASE_*` es correcto.
- `typetype` (web) depende del servidor; es normal que arranque unos segundos después
  que él.

## Las descargas no funcionan {#downloads-do-not-work}

La función de descarga necesita que el almacén de objetos esté configurado. Asegúrate
de haber:

1. Puesto valores reales para `DOWNLOADER_S3_ACCESS_KEY` (empieza por `GK`) y
   `DOWNLOADER_S3_SECRET_KEY` en `.env`.
2. Ejecutado los pasos de aprovisionamiento de Garage de
   [Instalación manual, Parte 2](./docker-compose#part-2-object-storage-for-downloads).
3. Generado un `GARAGE_RPC_SECRET` real y reiniciado Garage si sus registros rechazan
   el marcador.

Comprueba que el almacén de objetos ve tu clave y tu bucket:

```sh
docker compose exec -T garage /garage bucket list
docker compose exec -T garage /garage key list
```

El navegador usa `/api/downloader/...`; no necesita resolver el nombre de host interno
`garage`. Un `401 Authentication required` en los registros de Downloader significa,
en cambio, que la petición de extracción del trabajo no conservó una sesión de usuario
válida. Incluye en el informe los registros de Server y Downloader, y las cinco
respuestas de versión de los componentes.

Este fallo salió a la luz al dar seguimiento al
[informe de descargas en iOS de nanhoes](https://github.com/TypeType-Video/TypeType/issues/116)
y después se contrastó con el flujo de autorización actual de Server a Downloader.

## El inicio de sesión remoto en YouTube empieza y luego muestra un 404 {#remote-youtube-login-starts-then-shows-a-404}

Si la creación de la sesión funciona pero la ruta del navegador devuelve `404`,
probablemente el WebSocket se reenvió como una petición HTTP normal. Comprueba en cada
capa de proxy que estén:

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $connection_upgrade;
```

La configuración de nginx compatible viene incluida en la imagen web. Si la pila usa
un montaje personalizado desde el host, compáralo con el archivo actual del
repositorio del frontend. Consulta
[Inicio de sesión remoto y WebSockets](./reverse-proxy#remote-login-and-websockets) y
el [diagnóstico original de la comunidad](https://github.com/TypeType-Video/TypeType/discussions/122).

## Cierres de sesión inesperados {#unexpected-sign-outs}

Un token de acceso de la cuenta dura una hora, pero la sesión de renovación dura 30
días por defecto. El Frontend renueva automáticamente cuando una petición autenticada
devuelve `401`, así que un cierre de sesión al cabo de una hora no es un comportamiento
normal esperado.

Comprueba:

1. La página usa HTTPS. La cookie de renovación es `Secure` por defecto.
2. `ALLOWED_ORIGINS` contiene el origen exacto del navegador.
3. Las peticiones de inicio de sesión y `/api/auth/refresh` incluyen credenciales y un
   proxy personalizado no las elimina.
4. Server sigue usando el volumen de PostgreSQL que contiene la sesión de renovación.
5. Los ajustes de privacidad del navegador no rechazan la cookie de renovación
   `SameSite=None`.

Server genera un nuevo secreto de firma JWT en cada arranque, salvo que un despliegue
personalizado defina `JWT_SECRET`. Eso invalida el antiguo token de acceso de una
hora, pero el flujo normal de renovación debería recuperarse de inmediato cuando la
sesión de PostgreSQL y la cookie de renovación siguen presentes. Por tanto, un
reinicio por sí solo no debería exigir un nuevo inicio de sesión.

Para una instancia local de confianza que no puede usar HTTPS, pon
`AUTH_ALLOW_INSECURE_COOKIES=true` y vuelve a crear `typetype-server`. Esto debilita
deliberadamente la seguridad del transporte de las cookies y no debe usarse en una red
pública o no confiable. `AUTH_SESSION_TTL_DAYS` puede cambiar la duración de la
renovación, de 1 a 365 días. Consulta
[Duración de la sesión](./authentication#session-lifetime).

Si el problema continúa, recoge los registros de Server alrededor de `/auth/refresh`,
el código de respuesta en el navegador y las revisiones desplegadas. No incluyas la
cookie ni ningún token.

Esta lista de comprobación responde al comportamiento inesperado del que informó
[Toni-Vide en la discusión #162](https://github.com/TypeType-Video/TypeType/discussions/162).

## Una sesión de YouTube guardada dejó de funcionar tras cambiar un secreto {#a-saved-youtube-session-stopped-working-after-a-secret-change}

`YOUTUBE_SESSION_ENCRYPTION_KEY` cifra las cookies de YouTube y los tokens de
reproducción almacenados. Si la cambias después de haber usado el inicio de sesión
remoto, esas sesiones de YouTube guardadas ya no pueden descifrarse y los usuarios
afectados deben volver a conectar YouTube. No cifra el inicio de sesión de la cuenta
de TypeType. Elige el valor una vez y consérvalo. El valor generado se guarda en
`typetype_secrets`, así que normalmente no necesitas tocarlo.

## La reproducción se recarga y `/api/proxy` devuelve `422` {#playback-reloads-and-apiproxy-returns-422}

Una implementación antigua de la reproducción enviaba URL firmadas de `googlevideo`
por `/api/proxy`. Sus primeras peticiones de rango podían devolver `206`, seguidas de
respuestas `422` que contenían `{"error":"Upstream returned 403"}`. El reproductor
reconstruía entonces la fuente una y otra vez, y Server podía registrar
`ChannelWriteException` después de que el navegador cerrara una respuesta de proxy
abandonada.

La reproducción actual usa una sesión SABR con estado y no consume esas URL de medios
firmadas por la misma ruta de cara al navegador. Si el patrón antiguo de peticiones
sigue apareciendo, comprueba las cinco respuestas de versión de los componentes y
ejecuta:

```sh
docker compose config --images
```

Una salida que contenga `ghcr.io/priveetee/...` significa que el archivo Compose
activo sigue apuntando al antiguo espacio de nombres de imágenes. Sigue
[Migrar una pila antigua de Priveetee](./maintenance#migrate-an-older-priveetee-stack)
antes de investigar el inicio de sesión remoto, la IP residencial o el ajuste del
proxy.

La antigua secuencia de fallo y la actualización correcta las documentó
[filippobaroni en la discusión #133](https://github.com/TypeType-Video/TypeType/discussions/133#discussioncomment-17779201).

## Token está sano pero la reproducción de YouTube falla {#token-is-healthy-but-youtube-playback-fails}

`/health` solo prueba que el servicio de Bun está escuchando. Los flujos de tokens PO,
decodificador, SABR y navegador remoto también necesitan Chromium con Playwright y
rutas de ejecución con escritura.

Si aplicaste un perfil de contenedor personalizado sin root o de solo lectura, vuelve
a probar por separado `/potoken`, un vídeo normal de YouTube, un directo y el inicio
de sesión remoto. Un usuario `nobody` arbitrario no tiene un directorio personal
utilizable para el Crashpad de Chromium en la imagen actual. Vuelve a la definición
compatible del servicio Token antes de tratar el fallo como un error de Server o del
Player.

Consulta [Límite del navegador de Token](./security#token-browser-boundary) y la
[investigación del contenedor de hugoghx](https://github.com/TypeType-Video/TypeType/discussions/156).

## Empezar de cero {#start-over-from-scratch}

::: danger Esto borra tus datos
`down -v` elimina los volúmenes de la base de datos, la caché y el almacén de objetos.
:::

```sh
docker compose down -v
docker compose up -d
```

## Actualizar {#updating}

Pila gestionada por el instalador:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes --dir "$STACK_DIR"
cd "$STACK_DIR"
docker compose ps
```

`$STACK_DIR` es el directorio de tu pila, `~/typetype-stack` salvo que hayas elegido
otro: consulta [Elegir el directorio](./quick-start#stack-directory).

Pila sin scripts, después de sustituir el archivo Compose y los scripts gestionados
por los de la versión actual, conservando `.env` y cualquier override personalizado:

```sh
docker compose config -q
docker compose pull
docker compose up -d --force-recreate --wait --wait-timeout 180
docker compose ps
```

Tus datos viven en volúmenes con nombre, así que las actualizaciones conservan tus
cuentas e historial. Si una versión nueva no arranca correctamente, sigue
[Revertir una actualización](./rollback) en lugar de borrar contenedores o volúmenes.
