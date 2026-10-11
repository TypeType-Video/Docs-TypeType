# Guía de repositorios

Cada componente de TypeType tiene un límite de responsabilidad estrecho, sus propias comprobaciones y su propia licencia. Las incidencias de cara al usuario permanecen en el gestor central de TypeType aunque la corrección pertenezca al repositorio de un componente.

## Quién es dueño de qué, de un vistazo {#ownership-at-a-glance}

| Cambio | Repositorio dueño | Ruta principal del código |
| --- | --- | --- |
| Docker Compose, instalador, actualización, migración o reversión | [TypeType](https://github.com/TypeType-Video/TypeType) | `docker-compose*.yml`, `scripts/` |
| Página, ruta, nginx, control de ajustes, interfaz de cuenta o controles del reproductor | [TypeType-Frontend](https://github.com/TypeType-Video/TypeType-Frontend) | `apps/web/src/`, `nginx.conf` |
| Extracción, ruta de API, datos de cuenta, importación, recomendación o sesión de reproducción | [TypeType-Server](https://github.com/TypeType-Video/TypeType-Server) | `src/main/kotlin/dev/typetype/server/` |
| Token PO, decodificador del reproductor de YouTube, metadatos de subtítulos o navegador de inicio de sesión remoto | [TypeType-Token](https://github.com/TypeType-Video/TypeType-Token) | `src/` |
| Cola de descargas, transferencia, multiplexado, almacenamiento o artefacto | [TypeType-Downloader](https://github.com/TypeType-Video/TypeType-Downloader) | `cmd/`, `internal/`, `migrations/` |
| Búfer MSE, planificación de segmentos, salto, cambio de calidad o recuperación de la reproducción | [TypeType-Player](https://github.com/TypeType-Video/TypeType-Player) | `src/` |
| Algoritmo de la página de inicio, sus ajustes o lo que deduce | [TypeType-Signals](https://github.com/TypeType-Video/TypeType-Signals) | `recommender/` |
| Detalle de la presencia en Discord, negociación RPC o comportamiento en la bandeja del sistema | [TypeType-RPC](https://github.com/TypeType-Video/TypeType-RPC) | `src-tauri/src/` |
| Explicación para usuarios, operadores o del proyecto | [Docs-TypeType](https://github.com/TypeType-Video/Docs-TypeType) | `docs/` |

## Pila central {#central-stack}

El repositorio `TypeType` es el punto de integración y no una aplicación monolítica. Contiene submódulos de Git para los componentes públicos, pero el despliegue usa las imágenes de componentes seleccionadas en `docker-compose.yml`.

Rutas importantes:

- `.env.example` lista los ajustes compatibles a nivel de la pila y las imágenes alternativas.
- `docker-compose.yml` define el grafo de servicios estable.
- `docker-compose.dev.yml` define el grafo de la beta.
- `scripts/` contiene la instalación, la actualización, las copias de migración, la generación de secretos, el aprovisionamiento de Garage y las ayudas para el despliegue estable.

La configuración por defecto de nginx viene incluida en la imagen del frontend. Por eso la pila central no necesita montar un archivo equivalente desde el host en cada actualización.

El repositorio tiene licencia MIT.

## Frontend {#frontend}

El frontend es un monorepo de Bun que contiene una aplicación React 19. TanStack Router y Query se encargan de la navegación y del estado del servidor, Zustand del estado local, Tailwind CSS de los estilos, y Vidstack envuelve los proveedores de reproducción disponibles.

Puntos de entrada útiles:

- `apps/web/src/routes` para las páginas y los cargadores de rutas;
- `apps/web/src/components` para la interfaz compartida y la carcasa del reproductor;
- `apps/web/src/lib` para los clientes de API y la integración con el navegador;
- `apps/web/src/hooks` para las consultas y el comportamiento de las funciones;
- `apps/web/src/settings` y `apps/web/src/stores` para las elecciones persistentes del cliente.

Comprobaciones:

```sh
bun run check
bun run test
bun run knip
bun run sherif
bun run build
```

El repositorio tiene licencia MIT.

## Server {#server}

Server es una aplicación Kotlin/Ktor sobre JDK 25. Usa PipePipeExtractor para los servicios de medios compatibles, PostgreSQL mediante Exposed y HikariCP para el estado persistente, y Dragonfly mediante el protocolo Redis para el estado de la caché.

Puntos de entrada útiles:

- `Application.kt` y `ApplicationRoutes.kt` para la conexión de servicios y rutas;
- `routes/` para el contrato HTTP;
- `services/` para el comportamiento de la aplicación, la extracción y la reproducción;
- `db/` para las tablas y las migraciones;
- `openapi.yaml` y `openapi/` para el contrato de API publicado.

Comprobaciones:

```sh
./gradlew test
./gradlew shadowJar
./gradlew validateOpenApi
```

El repositorio tiene licencia GPL-3.0 debido a su integración del extractor.

## Token {#token}

Token es un servicio interno de Bun con un entorno de Chromium mediante Playwright. Su nombre es histórico: hoy ofrece mucho más que subtítulos o un único punto de acceso de tokens. Aporta los datos de visitante y los tokens PO de YouTube, la decodificación del reproductor, los metadatos de sesión SABR, los subtítulos y sesiones de navegador desechables para el inicio de sesión remoto.

El frontend no debe llamar a Token directamente. Server es su consumidor y su límite de seguridad. Consulta [Límites de seguridad](/es/self-hosting/security#token-browser-boundary) antes de personalizar su contenedor.

Comprobaciones:

```sh
bun run lint
bun test
bun run build
```

El repositorio tiene licencia MIT.

## Downloader {#downloader}

Downloader es un servicio en Go con trabajos respaldados por PostgreSQL, estado de caché en Dragonfly, transferencia de medios concurrente por rangos o por SABR, multiplexado con libavformat, progreso por SSE y almacenamiento de artefactos local o compatible con S3.

Puntos de entrada útiles:

- `internal/api` e `internal/server` para la API HTTP interna;
- `internal/pipeline`, `internal/downloader` e `internal/sabr` para la ejecución de los trabajos;
- `internal/mux` e `internal/ffmpeg` para el multiplexado por copia de flujo;
- `internal/storage` e `internal/artifact` para la capacidad y la entrega de artefactos.

Comprobaciones:

```sh
gofmt -w cmd internal
go test ./...
go build ./...
```

El repositorio tiene licencia GPL-3.0-or-later.

## Player {#player}

Player es el paquete de TypeScript sin dependencias publicado como `@typetype/mse` en npm y JSR. Convierte una sesión de reproducción de Server en búferes de Media Source Extensions sobre un `HTMLVideoElement`. El paquete es dueño de la planificación y la recuperación, mientras que Frontend es dueño de los controles y el diseño de la página.

Entre los puntos de entrada útiles están `type-type-mse-player.ts`, `playback-loop.ts`, `segment-scheduler.ts`, `media-source-controller.ts`, `seek-controller.ts` y `player-recovery.ts`.

Comprobaciones:

```sh
bun run check
bun run check:docs
bun run check:jsr
bun run test:coverage
bun run build
```

El repositorio tiene licencia MIT.

## RPC {#rpc}

RPC es la aplicación de escritorio que convierte la reproducción actual de TypeType de un usuario en un estado de Discord Rich Presence. Es una aplicación Tauri 2 con una implementación en Rust, escrita desde cero, del protocolo IPC de Discord, sin Electron y sin depender del SDK de Discord. Vive en la bandeja del sistema y solo consulta el punto de acceso de presencia de Server mientras compartir está activado.

Puntos de entrada útiles:

- `src-tauri/src/discord_frame.rs` y `discord_socket.rs` para el formato de las tramas IPC y el descubrimiento del socket local;
- `src-tauri/src/discord_rpc.rs` para la negociación y los comandos de actividad;
- `src-tauri/src/presence.rs` para la consulta del punto de acceso de presencia;
- `src-tauri/src/tray.rs` para el menú de la bandeja y el ciclo de consultas;
- `src/main.ts` para la ventana de ajustes.

Comprobaciones:

```sh
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
bun run build
```

El repositorio tiene licencia MIT.

## Signals {#signals}

TypeType-Signals es el servicio de recomendaciones opcional: un servicio en Python que contiene los algoritmos de la página de inicio y nada más. Server lo llama, obtiene los vídeos que pide y filtra lo que vuelve. Es experimental.

```sh
docker compose up -d --build
uv run pytest
```

Rutas importantes:

- `recommender/algorithms/` contiene un archivo por algoritmo.
- `recommender/contract.py` y los archivos `contract_*.py` contienen lo que Server envía y recibe.
- `tests/reference_pages.py` construye las páginas de referencia que demuestran que un cambio no alteró ninguna página.

Consulta [Signals, el servicio de recomendaciones](./signals). El repositorio tiene licencia GNU Affero General Public License, versión 3.

## Documentación y perfil de la organización {#documentation-and-organisation-profile}

Docs-TypeType es un sitio de VitePress. Las páginas para usuarios están en `docs/guide`, las de operadores en `docs/self-hosting` y las orientadas a desarrolladores en `docs/project`. Constrúyelo con:

```sh
bun run docs:build
```

La documentación tiene licencia MIT. El repositorio de perfil `.github` contiene solo recursos de presentación de la organización y no declara ninguna licencia.

## Ramas y flujo de las incidencias {#branch-and-issue-workflow}

El desarrollo de los componentes apunta a `dev`; `main` representa la línea de versiones estables. Consulta [Ramas y versiones](./releases) antes de cambiar fijaciones de integración o imágenes.

Abre los errores, las peticiones de funciones y los informes sobre la documentación en el [gestor central](https://github.com/TypeType-Video/TypeType/issues). Cuando se conozca el componente dueño, abre su pull request de código contra la rama `dev` de ese componente. Las pull requests de documentación también apuntan a `dev`.

## Referencias {#source-references}

- [README del repositorio central](https://github.com/TypeType-Video/TypeType/blob/main/README.md)
- [README del Frontend](https://github.com/TypeType-Video/TypeType-Frontend/blob/dev/README.md)
- [README de Server](https://github.com/TypeType-Video/TypeType-Server/blob/dev/README.md)
- [README de Token](https://github.com/TypeType-Video/TypeType-Token/blob/dev/README.md)
- [README de Downloader](https://github.com/TypeType-Video/TypeType-Downloader/blob/dev/README.md)
- [README de Player](https://github.com/TypeType-Video/TypeType-Player/blob/dev/README.md)
- [README de RPC](https://github.com/TypeType-Video/TypeType-RPC/blob/dev/README.md)
- [README de Signals](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/README.md)
