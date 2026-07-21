# Repository guide

Each TypeType component has a narrow ownership boundary, its own checks, and its own
license. User-facing issues stay in the central TypeType tracker even when the fix
belongs to a component repository.

## Ownership at a glance

| Change | Owning repository | Main source path |
| --- | --- | --- |
| Docker Compose, installer, nginx, update or rollback | [TypeType](https://github.com/TypeType-Video/TypeType) | `docker-compose*.yml`, `nginx.conf`, `scripts/` |
| Page, route, settings control, account UI, or player controls | [TypeType-Frontend](https://github.com/TypeType-Video/TypeType-Frontend) | `apps/web/src/` |
| Extraction, API route, account data, import, recommendation, or playback session | [TypeType-Server](https://github.com/TypeType-Video/TypeType-Server) | `src/main/kotlin/dev/typetype/server/` |
| PO token, YouTube player decoder, subtitle metadata, or remote-login browser | [TypeType-Token](https://github.com/TypeType-Video/TypeType-Token) | `src/` |
| Download queue, transfer, mux, storage, or artifact | [TypeType-Downloader](https://github.com/TypeType-Video/TypeType-Downloader) | `cmd/`, `internal/`, `migrations/` |
| MSE buffering, segment scheduling, seek, quality switch, or playback recovery | [TypeType-Player](https://github.com/TypeType-Video/TypeType-Player) | `src/` |
| User, operator, or project explanation | [Docs-TypeType](https://github.com/TypeType-Video/Docs-TypeType) | `docs/` |

## Central stack

The `TypeType` repository is the integration point rather than a monolithic
application. It contains Git submodules for the public components, but deployment
uses the component images selected in `docker-compose.yml`.

Important paths:

- `.env.example` lists supported stack-level settings and image overrides.
- `docker-compose.yml` defines the stable service graph.
- `docker-compose.dev.yml` defines the beta graph.
- `nginx.conf` exposes the web, API, WebSocket, SABR, and version paths.
- `scripts/` owns install, update, secret generation, Garage provisioning, and stable
  deployment helpers.

The repository is MIT licensed.

## Frontend

The frontend is a Bun monorepo containing a React 19 application. TanStack Router and
Query own navigation and server state, Zustand owns local state, Tailwind CSS owns
styling, and Vidstack wraps the available playback providers.

Useful entry points:

- `apps/web/src/routes` for pages and route loaders;
- `apps/web/src/components` for shared UI and the player shell;
- `apps/web/src/lib` for API clients and browser integration;
- `apps/web/src/hooks` for query and feature behavior;
- `apps/web/src/settings` and `apps/web/src/stores` for persistent client choices.

Checks:

```sh
bun run check
bun run test
bun run knip
bun run sherif
bun run build
```

The repository is MIT licensed.

## Server

The Server is a Kotlin/Ktor application on JDK 25. It uses PipePipeExtractor for
supported media services, PostgreSQL through Exposed and HikariCP for persistent
state, and Dragonfly through the Redis protocol for cache state.

Useful entry points:

- `Application.kt` and `ApplicationRoutes.kt` for service and route wiring;
- `routes/` for the HTTP contract;
- `services/` for application, extraction, and playback behavior;
- `db/` for tables and migrations;
- `openapi.yaml` and `openapi/` for the published API contract.

Checks:

```sh
./gradlew test
./gradlew shadowJar
./gradlew validateOpenApi
```

The repository is GPL-3.0 licensed because of its extractor integration.

## Token

Token is an internal Bun service with a Playwright Chromium runtime. Its name is
historical: it now provides much more than subtitles or a single token endpoint.
It supplies YouTube visitor and PO-token data, player decoding, SABR session
metadata, subtitles, and disposable remote-login browser sessions.

The frontend must not call Token directly. Server is its consumer and security
boundary. See [Security boundaries](/self-hosting/security#token-browser-boundary)
before customising its container.

Checks:

```sh
bun run lint
bun test
bun run build
```

The repository is MIT licensed.

## Downloader

Downloader is a Go service with PostgreSQL-backed jobs, Dragonfly cache state,
concurrent Range or SABR media transfer, libavformat muxing, SSE progress, and local
or S3-compatible artifact storage.

Useful entry points:

- `internal/api` and `internal/server` for the internal HTTP API;
- `internal/pipeline`, `internal/downloader`, and `internal/sabr` for job execution;
- `internal/mux` and `internal/ffmpeg` for stream-copy muxing;
- `internal/storage` and `internal/artifact` for capacity and artifact delivery.

Checks:

```sh
gofmt -w cmd internal
go test ./...
go build ./...
```

The repository is GPL-3.0-or-later licensed.

## Player

Player is the dependency-free TypeScript package published as `@typetype/mse` on npm
and JSR. It turns a Server playback session into Media Source Extension buffers on an
`HTMLVideoElement`. The package owns scheduling and recovery, while Frontend owns the
controls and page layout.

Useful entry points include `type-type-mse-player.ts`, `playback-loop.ts`,
`segment-scheduler.ts`, `media-source-controller.ts`, `seek-controller.ts`, and
`player-recovery.ts`.

Checks:

```sh
bun run check
bun run check:docs
bun run check:jsr
bun run test:coverage
bun run build
```

The repository is MIT licensed.

## Documentation and organisation profile

Docs-TypeType is a VitePress site. User pages live in `docs/guide`, operator pages in
`docs/self-hosting`, and developer-facing pages in `docs/project`. Build it with:

```sh
bun run docs:build
```

The documentation is MIT licensed. The `.github` profile repository contains only
organisation presentation assets and does not declare a license.

## Branch and issue workflow

Component development targets `dev`; `main` represents the stable release line. See
[Branches and releases](./releases) before changing integration pins or images.

Open bugs, feature requests, and documentation reports in the
[central tracker](https://github.com/TypeType-Video/TypeType/issues). Once the owning
component is known, open its code pull request against that component's `dev` branch.
Documentation pull requests also target `dev`.

## Source references

- [Central repository README](https://github.com/TypeType-Video/TypeType/blob/main/README.md)
- [Frontend README](https://github.com/TypeType-Video/TypeType-Frontend/blob/dev/README.md)
- [Server README](https://github.com/TypeType-Video/TypeType-Server/blob/dev/README.md)
- [Token README](https://github.com/TypeType-Video/TypeType-Token/blob/dev/README.md)
- [Downloader README](https://github.com/TypeType-Video/TypeType-Downloader/blob/dev/README.md)
- [Player README](https://github.com/TypeType-Video/TypeType-Player/blob/dev/README.md)
