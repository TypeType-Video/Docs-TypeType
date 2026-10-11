# Servicio de recomendaciones (experimental)

::: warning Experimental
El servicio de recomendaciones está en la versión 0.0.1. Sus algoritmos, sus ajustes y
los recursos que necesita todavía pueden cambiar entre actualizaciones.
:::

El servicio de recomendaciones es opcional. Se publica con el nombre
[TypeType Signals](https://github.com/TypeType-Video/TypeType-Signals). Permite que
cada usuario construya su página de inicio con un algoritmo que elige y ajusta.
Consulta [Elegir tu algoritmo](/es/guide/algorithm) para ver lo que obtienen los
usuarios.

Una pila sin él se comporta exactamente como antes y no muestra ninguna opción. Con
él, tres interruptores quedan en manos distintas:

1. tú instalas el servicio;
2. el administrador lo activa para la instancia;
3. cada usuario lo activa para sí mismo.

::: tip Nombres de la interfaz
La interfaz de TypeType todavía no está traducida al español. Los nombres de botones y
secciones se dan aquí tal como aparecen, en inglés.
:::

## Antes de empezar {#requirements}

| Recurso | Cantidad | Cómo comprobarlo |
| --- | --- | --- |
| Memoria | Alrededor de 1 GB en reposo, limitada a 2 GB por defecto (`RECOMMENDER_MEMORY_LIMIT`) | `free -h`, columna `available` |
| Disco | Alrededor de 550 MB para el modelo de lenguaje y unos 330 MB para la imagen | `df -h /var/lib/docker` |
| Red | Acceso a Internet en el primer arranque, para descargar el modelo desde Hugging Face. El servicio nunca habla con YouTube. | |
| TypeType | Una pila instalada con el instalador o con el archivo Compose compatible | `docker compose ps` en el directorio de la pila |

Lo que cambia en tu pila al añadirlo:

- un contenedor nuevo, `typetype-recommender`;
- un volumen nuevo, `recommender_models`, para el modelo;
- una base de datos nueva, `typetype_recommender`, en el PostgreSQL que ya tienes;
- el servicio `postgres` pasa de `postgres:17` a `pgvector/pgvector:pg17`, el mismo
  PostgreSQL 17 con la extensión `pgvector`, sobre el mismo volumen de datos.
  PostgreSQL se reinicia una vez: la instancia no está disponible durante unos
  segundos;
- Server se vuelve a crear con la dirección del servicio.

Tus datos existentes no se migran ni se reescriben. Aun así, haz antes una copia de
seguridad de la base de datos, como antes de cualquier cambio en la pila: consulta
[Maintenance](/self-hosting/maintenance#backups).

Los comandos de esta página usan `$STACK_DIR` para el directorio donde está tu pila.
Defínela una vez en tu terminal. `~/typetype-stack` es solo el valor por defecto del
instalador: pon el directorio que elegiste, sea cual sea. Consulta
[Choose the directory](/self-hosting/quick-start#stack-directory).

```sh
STACK_DIR=~/typetype-stack
```

Elige una de las tres formas siguientes.

## A. Instancia nueva, con el instalador {#install-new}

1. Ejecuta el instalador con el servicio de recomendaciones:

   ```sh
   curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --recommender
   ```

   Sin `--recommender`, el instalador pregunta, y responde que no si solo pulsas
   Intro:

   ```text
   [install] Optional: the recommender (experimental) lets each user pick the algorithm of their home page.
   [install] It needs about 2 GB of memory and 1 GB of disk, and downloads a language model on first start.
   Add the experimental recommender? [y/N]:
   ```

2. El instalador confirma la elección y pregunta antes de arrancar nada:

   ```text
   [install] Recommender (experimental) added to the stack.
   [install] Validating the resolved Compose stack...
   Proceed with Docker pull + startup in <tu directorio de la pila>? [y/N]:
   ```

   Responde `y`.

3. Espera. El primer arranque descarga la imagen y después el modelo. El instalador
   espera hasta 15 minutos a que todos los servicios estén sanos, en lugar de los 3
   habituales. Termina con:

   ```text
   Done. Open http://localhost:8082
   ```

4. Pasa a [Comprobar que funciona](#verify).

El instalador ha puesto `RECOMMENDER_ENABLED=true` en `.env`, así que la opción ya se
ofrece en la instancia.

## B. Instancia existente, con el instalador {#install-existing}

Vuelve a ejecutar el instalador con el directorio de tu pila. Hace una copia de los
archivos que gestiona, conserva tu `.env` y tu `docker-compose.override.yml`, y añade
el servicio de recomendaciones.

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --recommender --dir "$STACK_DIR"
```

Cuenta con unos segundos sin servicio mientras PostgreSQL y Server se reinician, y
después pasa a [Comprobar que funciona](#verify).

## C. Instancia existente, a mano {#manual}

Úsalo si gestionas la pila tú mismo, por ejemplo con Dockge.

1. Ve al directorio de la pila y comprueba que el archivo del servicio está ahí:

   ```sh
   cd "$STACK_DIR"
   ls docker-compose.recommender.yml
   ```

   Si falta, tus archivos de la pila son anteriores al servicio. Descárgalo:

   ```sh
   curl -fsSLO https://raw.githubusercontent.com/TypeType-Video/TypeType/main/docker-compose.recommender.yml
   ```

2. Indica a la pila que lo ofrezca. En `.env`, pon:

   ```dotenv
   RECOMMENDER_ENABLED=true
   ```

   Esta línea es también la que hace que el instalador conserve el servicio en una
   actualización posterior.

3. Crea la base de datos y el secreto compartido:

   ```sh
   COMPOSE_RECOMMENDER_FILE=docker-compose.recommender.yml ./scripts/run-stack-init.sh
   ```

   La salida termina con:

   ```text
   CREATE DATABASE
   CREATE EXTENSION
   ```

   En una segunda ejecución, `CREATE DATABASE` no aparece y la línea de la extensión
   indica que ya existe. Ambos casos son normales.

4. Arranca el servicio y vuelve a crear Server:

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml up -d --wait --wait-timeout 900
   ```

   En un host ARM64, nombra también el archivo ARM64, como ya haces:
   `-f docker-compose.yml -f docker-compose.arm64.yml -f docker-compose.recommender.yml`.

5. Pasa a [Comprobar que funciona](#verify).

::: warning Nombra los dos archivos a partir de ahora
Cada comando `docker compose` de esta pila debe nombrar también
`docker-compose.recommender.yml`. Un comando que solo nombra `docker-compose.yml` con
`--remove-orphans` elimina el servicio de recomendaciones.
:::

## Comprobar que funciona {#verify}

Ejecuta estos comandos desde el directorio de la pila. Todos nombran los dos archivos
Compose, sea cual sea la forma en que instalaste: `docker compose` a secas solo
conoce los servicios de `docker-compose.yml`. En un host ARM64, añade
`-f docker-compose.arm64.yml` entre los dos.

```sh
cd "$STACK_DIR"
```

1. El contenedor está sano:

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml ps typetype-recommender
   ```

   La columna `STATUS` debe decir `Up ... (healthy)`. `(health: starting)` significa
   que el modelo todavía se está descargando o cargando.

2. Su registro muestra un arranque completo:

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml logs typetype-recommender
   ```

   ```text
   INFO:     Started server process [1]
   INFO:     Waiting for application startup.
   Warning: You are sending unauthenticated requests to the HF Hub. Please set a HF_TOKEN to enable higher rate limits and faster downloads.
   INFO:     Application startup complete.
   INFO:     Uvicorn running on http://0.0.0.0:8190 (Press CTRL+C to quit)
   ```

   El aviso sobre el HF Hub es normal: el modelo es público y no necesita ningún
   token. La pausa antes de `Application startup complete` es la descarga.

3. Server lo alcanza:

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml exec -T typetype-server wget -qO- http://127.0.0.1:8080/version/recommender
   ```

   ```json
   {"service":"recommender","version":"0.0.1","revision":"...","shortRevision":"...","buildTime":"..."}
   ```

   Una respuesta vacía o un error significa que Server no ve el servicio: consulta
   [Solución de problemas](#troubleshooting).

4. La instancia lo anuncia:

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml exec -T typetype-server wget -qO- http://127.0.0.1:8080/instance
   ```

   La respuesta contiene:

   ```json
   "recommender":{"installed":true,"enabled":true,"experimental":true}
   ```

   `installed` es verdadero en cuanto Server conoce el servicio. `enabled` es el
   interruptor de la instancia, descrito a continuación.

5. En la aplicación web, **Settings** y después **About** muestra una línea
   **Algorithm** con la versión `0.0.1`.

## Activarlo {#enable}

Instalar el servicio no muestra nada a los usuarios hasta que la instancia lo ofrece.

1. Inicia sesión como administrador y abre la consola de administración.
2. Abre la sección **Recommender**.
3. Activa **Offer the experimental home page**. Ya está activado si `.env` contiene
   `RECOMMENDER_ENABLED=true`.
4. Recarga la aplicación web: **Algorithm** aparece en el menú.

Después pruébalo con tu propia cuenta:

1. Abre **Algorithm**.
2. Activa **Build my home page with an algorithm I choose**.
3. Vuelve a la página de inicio. En una cuenta vacía aparece una tarjeta de
   bienvenida; importa datos o mira algunos vídeos primero.
4. Abre **Algorithm** de nuevo y después **How the last home page was built**: debe
   mostrar las fuentes consultadas y los vídeos encontrados.

Cada usuario tiene que hacer lo mismo para sí, salvo que actives **On for everyone by
default**.

La sección **Recommender** de la consola de administración reúne todo lo que decide
un administrador:

| Control | Efecto |
| --- | --- |
| **Offer the experimental home page** | Desactivado, todos conservan la página de inicio habitual y la página Algorithm desaparece. Activado, cada usuario elige activarlo. |
| **On for everyone by default** | Desactivado por defecto. Activado, cada usuario obtiene de inmediato la página de inicio por algoritmo y puede desactivarla. |
| **Algorithms offered** | Los algoritmos que los usuarios pueden elegir. Ninguno marcado significa todos. |
| **Preselected algorithm** | El que tiene un usuario antes de elegir. **The service's own choice** sigue `RECOMMENDER_DEFAULT_ALGORITHM`. |
| **Answer time allowed (ms)** | Cuánto puede tardar una llamada al servicio. `0` conserva el valor fijado en la instalación. |
| **Video requests to YouTube per minute** | Consulta [Lo que pide a YouTube](#provider-requests). `0` conserva el valor fijado en la instalación. |

Debajo, **State of the service** indica si responde y en cuántos milisegundos, el
tiempo medio para construir una página (repartido entre el algoritmo y las fuentes de
YouTube), las páginas servidas y cuántas salieron de la caché, cuántas veces un
visitante recibió en su lugar la página de inicio habitual, y las peticiones de
vídeos enviadas y retenidas en este minuto. También muestra cuántos usuarios activaron
la opción, por algoritmo, y las opiniones que eligieron enviar. Ninguna opinión nombra
a su autor. Los contadores vuelven a cero cuando Server se reinicia.

## Lo que guarda {#storage}

Los datos de tus usuarios permanecen en la base de datos de Server. El servicio de
recomendaciones no tiene cuentas y no sabe quién es un usuario.

| Qué | Dónde | Durante cuánto tiempo |
| --- | --- | --- |
| Los vectores de títulos de vídeos públicos | Su propia base de datos PostgreSQL, tabla `title_vectors` | Hasta que se borren. No se nombra a ningún usuario. |
| El historial de un usuario, enviado por Server con una clave | La memoria y la caché compartida | 30 minutos después de su último uso |
| El plan de una página en construcción | La memoria y la caché compartida | 2 minutos |
| Lo que se dedujo de un historial | Solo la memoria | 10 minutos, mientras el historial no cambie |

Server guarda además cada página de inicio construida en Dragonfly durante 30
minutos, y la elección de algoritmo, las correcciones y las opiniones de cada usuario
en su propia base de datos. La exportación de un usuario incluye sus elecciones y
opiniones.

El servicio puede reiniciarse en cualquier momento. Server vuelve a enviar el
historial y la página siguiente se construye con normalidad.

## Lo que pide a YouTube {#provider-requests}

El servicio de recomendaciones no envía nada a YouTube. Le dice a Server qué fuentes
necesita una página (los vídeos de un canal, una búsqueda, los vídeos relacionados
con uno), y Server las obtiene con su extracción habitual, detrás de su caché
compartida.

Server limita lo que el servicio puede hacerle abrir:

| Variable | Por defecto | Función |
| --- | --- | --- |
| `RECOMMENDER_STREAM_REQUESTS_PER_MINUTE` | `15` | Vídeos que el servicio puede hacer que Server abra en el proveedor en un minuto, para toda la instancia. Quien pulsa reproducir nunca queda limitado por este ajuste. |

Cuando el proveedor rechaza una petición, el servicio no pide ningún vídeo durante un
rato, para no alargar nunca un rechazo a quienes están viendo vídeos. Una página
construida en ese tiempo simplemente tiene menos fuentes.

## Ajustes {#settings}

Estos valores de la pila se leen de `.env`:

| Variable | Por defecto | Función |
| --- | --- | --- |
| `RECOMMENDER_ENABLED` | `false` | Ofrece el servicio en la instancia. La consola de administración puede cambiarlo después. |
| `RECOMMENDER_MEMORY_LIMIT` | `2g` | Límite de memoria del contenedor |
| `RECOMMENDER_DEFAULT_ALGORITHM` | `signals` | El algoritmo preseleccionado para quien no ha elegido |
| `RECOMMENDER_DATABASE` | `typetype_recommender` | Nombre de la base de datos propia del servicio |
| `RECOMMENDER_CACHE_URL` | `redis://dragonfly:6379` | Caché compartida del servicio |
| `RECOMMENDER_THREADS` | hasta 8 | Hilos de CPU del modelo de lenguaje |
| `TYPETYPE_RECOMMENDER_IMAGE` | imagen estable | Imagen alternativa, para un despliegue fijado o una vuelta atrás |
| `TYPETYPE_POSTGRES_VECTOR_IMAGE` | `pgvector/pgvector:pg17` | Imagen de PostgreSQL que incluye `pgvector` |
| `TYPETYPE_RECOMMENDER_PORT` | `8190` | Puerto en el que escucha el servicio, dentro de la red de Compose |

El lado de Server de la integración también se ajusta:

| Variable | Por defecto | Función |
| --- | --- | --- |
| `RECOMMENDER_REQUEST_TIMEOUT_MS` | `2500` | Cuánto puede tardar una llamada al servicio |
| `RECOMMENDER_PAGE_DEADLINE_MS` | `4000` | Cuánto espera un visitante una página antes de que se muestre la página de inicio habitual; la página sigue construyéndose para la visita siguiente |
| `RECOMMENDER_PAGE_TTL_SECONDS` | `1800` | Cuánto se conserva una página construida |
| `RECOMMENDER_PAGE_VARIANTS` | `3` | Páginas conservadas por usuario, para que una actualización muestre otra al instante |
| `RECOMMENDER_RELATED_TTL_SECONDS` | `86400` | Cuánto se conservan los vídeos relacionados con uno |
| `RECOMMENDER_SEARCH_TTL_SECONDS` | `21600` | Cuánto se conserva un resultado de búsqueda |
| `RECOMMENDER_CHANNEL_TTL_SECONDS` | `1800` | Cuánto se conservan los vídeos de un canal |
| `RECOMMENDER_SOURCE_PARALLELISM` | `6` | Fuentes de una misma página obtenidas a la vez |

El archivo del servicio solo transmite los valores anteriores. El servicio lee otros,
que se fijan con un archivo de override de Compose sobre `typetype-recommender`:

| Variable | Por defecto | Función |
| --- | --- | --- |
| `RECOMMENDER_HISTORY_TTL_SECONDS` | `1800` | Cuánto se conserva un historial enviado por Server después de su último uso |
| `RECOMMENDER_HISTORY_ITEMS_KEPT` | `400000` | Visualizaciones y "me gusta" de todos los historiales mantenidos en memoria a la vez, unos 0,5 MB por cada 1000 |
| `RECOMMENDER_PLAN_TTL_SECONDS` | `120` | Cuánto se conserva el plan de una página |
| `RECOMMENDER_PROFILE_TTL_SECONDS` | `600` | Cuánto se conserva lo deducido de un historial sin cambios; `0` lo desactiva |
| `RECOMMENDER_EMBED_BUDGET` | `100` | Títulos nuevos que el modelo lee como máximo en una petición |
| `RECOMMENDER_MAX_TITLES` | `2000` | Títulos que lee un perfil como máximo |
| `RECOMMENDER_EMBEDDING_MODEL`, `RECOMMENDER_EMBEDDING_FILE` | mpnet multilingüe, fp16 | El modelo de lenguaje y su variante |
| `RECOMMENDER_DATABASE_POOL` | `4` | Conexiones mantenidas con la base de datos |
| `RECOMMENDER_CACHE_TIMEOUT_MS` | `2000` | Cuánto puede tardar una llamada a la caché |

Una variable vacía cuenta como no definida.

```yaml
services:
  typetype-recommender:
    environment:
      RECOMMENDER_PARALLEL_BATCHES: "3"
```

Guárdalo como `docker-compose.override.yml` en el directorio de la pila; el
instalador conserva ese archivo y lo aplica al final.

### Memoria frente a velocidad {#memory}

Con sus valores por defecto, el servicio se mantiene por debajo de 2 GB. En un host
que puede darle 4 GB, dos ajustes del servicio lo hacen más rápido cuando llegan
muchas personas nuevas a la vez, a costa de memoria:

| Variable | Por defecto | Efecto |
| --- | --- | --- |
| `RECOMMENDER_PARALLEL_BATCHES` | `1` | Lotes de títulos que pasan por el modelo a la vez. `3` atiende a una multitud de personas nuevas alrededor de un tercio más rápido, con unos 0,8 GB más en el pico. |
| `RECOMMENDER_ONNX_ARENA` | `0` | `1` deja que el modelo conserve la memoria de sus lotes más grandes: alrededor de un 10 % más rápido con mucha gente, unos 1,3 GB más. |

Sube `RECOMMENDER_MEMORY_LIMIT` al mismo tiempo.

## Actualizarlo {#update}

Con el instalador, actualiza como siempre. Conserva el servicio porque `.env`
contiene `RECOMMENDER_ENABLED=true`:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes --dir "$STACK_DIR"
```

A mano, descarga las imágenes y vuelve a crear con los dos archivos:

```sh
cd "$STACK_DIR"
docker compose -f docker-compose.yml -f docker-compose.recommender.yml pull
docker compose -f docker-compose.yml -f docker-compose.recommender.yml up -d --wait --wait-timeout 900
```

El modelo permanece en su volumen: una actualización no lo descarga de nuevo. Repite
después las comprobaciones de [Comprobar que funciona](#verify): la línea de versión
te dice qué versión responde.

## Quitarlo {#remove}

1. En `.env`, pon `RECOMMENDER_ENABLED=false`, para que el instalador no lo vuelva a
   añadir en la próxima actualización.

2. Vuelve a crear la pila sin el archivo del servicio:

   ```sh
   cd "$STACK_DIR"
   docker compose -f docker-compose.yml up -d --remove-orphans --wait
   ```

   El contenedor del servicio se elimina, PostgreSQL vuelve a `postgres:17` y Server
   se vuelve a crear sin la dirección del servicio. La página de inicio vuelve a ser
   la habitual para todos y la página Algorithm desaparece.

3. Comprueba:

   ```sh
   docker compose exec -T typetype-server wget -qO- http://127.0.0.1:8080/instance
   ```

   La respuesta contiene ahora `"recommender":{"installed":false,`.

Las elecciones, correcciones y opiniones de los usuarios permanecen en la base de
datos de Server, por si vuelves a añadir el servicio. El servicio nunca guardó nada
más de ellos.

Para recuperar el espacio en disco, si quieres:

```sh
docker volume ls | grep recommender_models
docker volume rm <nombre mostrado arriba>
docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DROP DATABASE typetype_recommender"'
```

## Solución de problemas {#troubleshooting}

Lee primero el registro del servicio:

```sh
cd "$STACK_DIR"
docker compose -f docker-compose.yml -f docker-compose.recommender.yml logs --tail 100 typetype-recommender
```

| Lo que ves | Causa | Qué hacer |
| --- | --- | --- |
| `STATUS` se queda en `(health: starting)` durante minutos en el primer arranque | El modelo, de unos 550 MB, se está descargando | Espera. El registro muestra `Application startup complete` cuando termina. |
| El registro muestra un error de red antes de `Application startup complete` | No se pudo descargar el modelo desde Hugging Face | Da acceso a Internet al contenedor para el primer arranque. Después el modelo se lee del volumen. |
| `no such service: typetype-recommender` | El comando solo nombra `docker-compose.yml` | Añade `-f docker-compose.recommender.yml`. |
| El contenedor muere y se reinicia, `OOMKilled` en `docker inspect` | Alcanzó `RECOMMENDER_MEMORY_LIMIT` | Sube el límite, o conserva los valores por defecto de [Memoria frente a velocidad](#memory). |
| `/version/recommender` no responde nada | Server no se volvió a crear con el archivo del servicio, o falta el secreto compartido | Repite los dos comandos de [C. A mano](#manual), pasos 3 y 4. |
| **Algorithm** no está en el menú | La instancia no lo ofrece | Consola de administración, **Recommender**, **Offer the experimental home page**; después recarga la página. |
| La página de inicio sigue siendo la habitual | La página no estuvo lista a tiempo, o la cuenta no tiene datos | Recarga pasados unos segundos. En la consola de administración, **Returns to the standard home page** cuenta cuántas veces ocurre. |
| **State of the service** dice **Not answering** | El servicio está parado o todavía arranca | Comprueba su estado y su registro como arriba. Mientras tanto, las páginas de inicio son las habituales. |

## Referencias

- [Repositorio de Signals](https://github.com/TypeType-Video/TypeType-Signals)
- [Archivo Compose del servicio](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.recommender.yml)
- [Instalador](https://github.com/TypeType-Video/TypeType/blob/main/scripts/install-stack.sh)
- [Configuración del servicio en Server](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/services/RecommenderConfig.kt)
