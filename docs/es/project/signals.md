# Signals, el servicio de recomendaciones

::: warning Experimental
Signals está en la versión 0.0.1. Su contrato con Server y sus algoritmos todavía
pueden cambiar.
:::

[TypeType Signals](https://github.com/TypeType-Video/TypeType-Signals) es el servicio opcional que contiene los algoritmos de la
página de inicio. Esta página explica cómo encaja con Server y cómo se escribe un
algoritmo. Para lo que ven los usuarios, lee
[Elegir tu algoritmo](/es/guide/algorithm); para ejecutarlo, lee
[Servicio de recomendaciones](/es/self-hosting/recommender).

## Quién hace qué {#roles}

| | TypeType-Server | Signals |
| --- | --- | --- |
| Cuentas, sesiones, datos de los usuarios | Es su dueño | No tiene ninguno: una petición nunca nombra a un usuario |
| Hablar con YouTube | Obtiene cada vídeo, con su extracción y su caché | Nunca lo hace |
| Bloqueo, filtros familiares | Los aplica a todo lo que vuelve | No puede saltárselos |
| Elegir y ordenar los vídeos | Recurre a su página de inicio integrada | Es dueño de los algoritmos |
| Lo que se conserva | Elecciones, correcciones, opiniones, páginas construidas | Vectores de títulos públicos; un historial durante unos minutos |

Server es el único que llama al servicio. Si el servicio no está, va lento o falla,
Server sirve su página de inicio integrada, así que una página de inicio nunca se
rompe.

## Una página de inicio, paso a paso {#flow}

```text
browser ── GET /recommendations/home ─▶ Server
Server  ── POST /v1/history (once, when the history changed) ─▶ Signals
Server  ── POST /v1/plan (snapshot) ─▶ Signals
Server  ◀─ the sources to fetch ───── Signals
Server:    fetches those sources, filters the candidates
Server  ── POST /v1/rank (plan id, candidates) ─▶ Signals
Server  ◀─ rows, reasons, trace ───── Signals
Server:    filters the rows again, keeps the page, serves it in slices
browser ◀─ rows ───────────────────── Server
```

1. **Instantánea.** Server describe a la persona sin nombrarla: el algoritmo que
   eligió y sus ajustes, la hora y el idioma, sus suscripciones, y solo las categorías
   de datos que el algoritmo anuncia y que la persona permite. Un historial largo se
   envía una vez con una clave y después se nombra por esa clave.
2. **Plan.** El algoritmo responde con las fuentes que quiere: el feed de
   suscripciones, los vídeos relacionados con un vídeo dado, los vídeos de un canal,
   una búsqueda, las tendencias o vídeos concretos para reanudar. Cada fuente lleva la
   razón por la que se pidió.
3. **Obtención.** Server obtiene las fuentes, a través de su caché compartida, y
   cuenta cada vídeo que tiene que abrir en el proveedor dentro del límite de la
   instancia.
4. **Clasificación.** El algoritmo puntúa los candidatos y los ordena en filas. Las
   filas nombran los vídeos solo por su URL: el servicio no puede poner en pantalla un
   vídeo que Server no haya obtenido y filtrado.
5. **Segundo filtro.** Server vuelve a aplicar el bloqueo y los filtros familiares a
   las filas. Un error en un algoritmo no puede mostrar un vídeo bloqueado.

Una página que no está lista dentro del plazo de Server se sustituye por la página de
inicio integrada en esa visita, y sigue construyéndose para la siguiente.

## Rutas del servicio {#routes}

Todas las rutas salvo `/health` requieren la cabecera `X-Internal-Token`, el secreto
compartido con Server.

| Ruta | Función |
| --- | --- |
| `GET /health` | Disponibilidad y versión |
| `GET /version` | Versión, revisión y fecha de compilación, como las da todo servicio de TypeType |
| `GET /v1/algorithms` | Los algoritmos, sus textos, los datos que lee cada uno y cada ajuste con sus límites y su valor por defecto. La interfaz se construye a partir de esta respuesta: un algoritmo nuevo no requiere ningún cambio en el frontend. |
| `POST /v1/history` | Un historial y los «me gusta» con una clave elegida por Server, en una llamada o en varias partes |
| `POST /v1/plan` | Entra la instantánea, salen las fuentes que hay que obtener |
| `POST /v1/rank` | Entran los candidatos, salen las filas con sus razones, y la traza cuando se pide |
| `POST /v1/profile` | Lo que el algoritmo deduce de una instantánea: intereses, canales, vídeos recientes |
| `POST /v1/topics` | Para una lista de títulos, el interés al que pertenece cada uno |

Un plan o un historial que el servicio ya no conserva recibe un `409`; Server lo
vuelve a enviar. Las formas exactas son los modelos de [`recommender/contract.py`](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/recommender/contract.py) y de los archivos
`contract_*.py` que están junto a él.

## Reglas que sigue todo algoritmo {#principles}

1. **Dice lo que lee.** Un algoritmo lista las categorías de datos que usa, y el motor
   quita las demás de la instantánea antes de llamarlo. «Nunca lee tu historial» es
   cierto por construcción.
2. **Cada ajuste está expuesto.** Cada peso, umbral, tope y tiempo de atenuación se
   declara con su tipo, sus límites y su valor por defecto, y se muestra al usuario.
3. **Cada fila tiene una razón.** Una fila lleva el tipo de razón y el elemento o la
   conclusión que hay detrás; cada vídeo lleva lo que lo trajo.
4. **Las conclusiones se muestran.** Lo que se dedujo (intereses, canales, vídeos
   recientes) sale del mismo código que clasifica, con el origen de cada conclusión.
5. **Las decisiones del usuario mandan.** Los intereses ocultos o fijados, los canales
   ignorados y los elementos excluidos se respetan en todos los algoritmos.
6. **El azar se declara.** Un algoritmo que sortea lo dice y toma una semilla: la
   misma semilla y los mismos datos dan la misma página.
7. **Un solo camino de código.** El perfil y la traza que ve un usuario salen del
   cálculo que construyó su página. No hay una explicación aparte.

## Escribir un algoritmo {#write}

Un algoritmo es un archivo en `recommender/algorithms/`. Declara su nombre y sus
textos, los datos que lee, sus ajustes, e implementa dos pasos: planificar las fuentes
y después clasificar los candidatos en filas. Regístralo en `recommender/registry.py`.

Parte de [`subscriptions.py`](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/recommender/algorithms/subscriptions.py), el más pequeño, y lee primero [`CONTRIBUTING.md`](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/CONTRIBUTING.md): explica cómo se escribe el
código y cómo demostrar que un cambio no alteró ninguna página.

```sh
docker compose up -d --build
uv run pytest
```

El primer comando arranca el servicio en el puerto `8190` con su propia base de datos
y su propia caché. Las pruebas usan un sustituto del modelo de lenguaje basado en el
hash de las palabras, así que no necesitan ninguna descarga.

## Cómo lee Signals un historial {#signals}

La familia Signals (Signals, channels, videos, mix) comparte una misma lectura del
historial:

- **Canales.** Un canal cuenta por los vídeos distintos que se vieron de él, con una
  atenuación a la mitad cada 30 días. Los minutos vistos no cuentan.
- **Intereses.** Los títulos de los vídeos vistos hasta el final se comparan por su
  significado con un modelo multilingüe de frases, y se agrupan cuando están lo
  bastante cerca en promedio. Un grupo lleva el nombre de las palabras que comparten
  sus títulos. Los títulos que no dicen nada sobre un tema se dejan fuera.
- **Vídeos recientes.** Un vídeo recién visto orienta la página de inmediato; su
  efecto se reduce a la mitad con el tiempo y se detiene tras unas horas.

Los Shorts se leen aparte y nunca alimentan las recomendaciones de vídeos largos.

El modelo se ejecuta localmente en el servicio, en la CPU. Se descarga una vez en el
primer arranque y después no se envía nada a terceros.

## Versiones {#versions}

Signals sigue el [versionado semántico](https://semver.org). Un parche no cambia
ninguna página, una versión menor puede cambiar lo que muestran las páginas o añadir
ajustes, y una versión mayor cambia el contrato con Server. Mientras el número empiece
por 0, todo puede cambiar todavía. La versión que se ejecuta en una instancia se
muestra en su página About.

El servicio tiene licencia GNU Affero General Public License, versión 3.

## Referencias {#source-references}

- [Repositorio de Signals](https://github.com/TypeType-Video/TypeType-Signals)
- [Modelos del contrato](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/recommender/contract.py)
- [Integración del servicio en Server](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/RecommenderServices.kt)
