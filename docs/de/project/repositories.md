# Repository-Leitfaden

Jede Komponente von TypeType hat eine eng gefasste Zuständigkeit, eigene Prüfungen und eine eigene Lizenz. Issues aus Nutzersicht bleiben im zentralen TypeType-Tracker, auch wenn die Korrektur ins Repository einer Komponente gehört.

## Zuständigkeiten auf einen Blick {#ownership-at-a-glance}

| Änderung | Zuständiges Repository | Wichtigster Quellpfad |
| --- | --- | --- |
| Docker Compose, Installer, Aktualisierung, Migration oder Rollback | [TypeType](https://github.com/TypeType-Video/TypeType) | `docker-compose*.yml`, `scripts/` |
| Seite, Route, nginx, Einstellungsoption, Kontooberfläche oder Bedienelemente des Players | [TypeType-Frontend](https://github.com/TypeType-Video/TypeType-Frontend) | `apps/web/src/`, `nginx.conf` |
| Extraktion, API-Route, Kontodaten, Import, Empfehlung oder Wiedergabesitzung | [TypeType-Server](https://github.com/TypeType-Video/TypeType-Server) | `src/main/kotlin/dev/typetype/server/` |
| PO-Token, Decoder des YouTube-Players, Untertitel-Metadaten oder Browser für die Remote-Anmeldung | [TypeType-Token](https://github.com/TypeType-Video/TypeType-Token) | `src/` |
| Download-Warteschlange, Übertragung, Muxen, Speicher oder Artefakt | [TypeType-Downloader](https://github.com/TypeType-Video/TypeType-Downloader) | `cmd/`, `internal/`, `migrations/` |
| MSE-Pufferung, Segmentplanung, Sprung, Qualitätswechsel oder Wiederaufnahme der Wiedergabe | [TypeType-Player](https://github.com/TypeType-Video/TypeType-Player) | `src/` |
| Startseiten-Algorithmus, seine Einstellungen oder was er ableitet | [TypeType-Signals](https://github.com/TypeType-Video/TypeType-Signals) | `recommender/` |
| Detail der Discord-Präsenz, RPC-Handshake oder Verhalten im Infobereich | [TypeType-RPC](https://github.com/TypeType-Video/TypeType-RPC) | `src-tauri/src/` |
| Erklärung für Nutzer, Betreiber oder das Projekt | [Docs-TypeType](https://github.com/TypeType-Video/Docs-TypeType) | `docs/` |

## Zentraler Stack {#central-stack}

Das Repository `TypeType` ist der Integrationspunkt und keine monolithische Anwendung. Es enthält Git-Submodule für die öffentlichen Komponenten, die Bereitstellung verwendet aber die in `docker-compose.yml` ausgewählten Komponenten-Images.

Wichtige Pfade:

- `.env.example` führt die unterstützten Einstellungen auf Stack-Ebene und die abweichenden Images auf.
- `docker-compose.yml` definiert den stabilen Dienstgraphen.
- `docker-compose.dev.yml` definiert den Beta-Graphen.
- `scripts/` enthält Installation, Aktualisierung, Sicherungen bei Migrationen, die Erzeugung von Geheimnissen, die Einrichtung von Garage und Hilfen für die stabile Bereitstellung.

Die Standardkonfiguration von nginx ist im Frontend-Image enthalten. Der zentrale Stack muss daher nicht bei jeder Aktualisierung eine passende Datei vom Host einbinden.

Das Repository steht unter der MIT-Lizenz.

## Frontend {#frontend}

Das Frontend ist ein Bun-Monorepo mit einer React-19-Anwendung. TanStack Router und Query sind für Navigation und Serverzustand zuständig, Zustand für den lokalen Zustand, Tailwind CSS für das Styling, und Vidstack kapselt die verfügbaren Wiedergabeanbieter.

Nützliche Einstiegspunkte:

- `apps/web/src/routes` für Seiten und Routen-Loader;
- `apps/web/src/components` für die gemeinsame Oberfläche und die Hülle des Players;
- `apps/web/src/lib` für API-Clients und die Browser-Integration;
- `apps/web/src/hooks` für Abfragen und das Verhalten der Funktionen;
- `apps/web/src/settings` und `apps/web/src/stores` für dauerhaft gespeicherte Entscheidungen im Client.

Prüfungen:

```sh
bun run check
bun run test
bun run knip
bun run sherif
bun run build
```

Das Repository steht unter der MIT-Lizenz.

## Server {#server}

Server ist eine Kotlin/Ktor-Anwendung auf JDK 25. Er verwendet PipePipeExtractor für unterstützte Mediendienste, PostgreSQL über Exposed und HikariCP für dauerhaften Zustand und Dragonfly über das Redis-Protokoll für den Cache-Zustand.

Nützliche Einstiegspunkte:

- `Application.kt` und `ApplicationRoutes.kt` für die Verdrahtung von Diensten und Routen;
- `routes/` für den HTTP-Vertrag;
- `services/` für das Verhalten von Anwendung, Extraktion und Wiedergabe;
- `db/` für Tabellen und Migrationen;
- `openapi.yaml` und `openapi/` für den veröffentlichten API-Vertrag.

Prüfungen:

```sh
./gradlew test
./gradlew shadowJar
./gradlew validateOpenApi
```

Das Repository steht wegen seiner Extraktor-Integration unter der GPL-3.0.

## Token {#token}

Token ist ein interner Bun-Dienst mit einer Chromium-Laufzeit über Playwright. Sein Name ist historisch: Er bietet heute weit mehr als Untertitel oder einen einzelnen Token-Endpunkt. Er liefert YouTube-Besucherdaten und PO-Token, die Player-Dekodierung, SABR-Sitzungsmetadaten, Untertitel und kurzlebige Browser-Sitzungen für die Remote-Anmeldung.

Das Frontend darf Token nicht direkt aufrufen. Server ist sein Abnehmer und seine Sicherheitsgrenze. Lesen Sie [Sicherheitsgrenzen](/de/self-hosting/security#token-browser-boundary), bevor Sie seinen Container anpassen.

Prüfungen:

```sh
bun run lint
bun test
bun run build
```

Das Repository steht unter der MIT-Lizenz.

## Downloader {#downloader}

Der Downloader ist ein Go-Dienst mit Aufträgen in PostgreSQL, Cache-Zustand in Dragonfly, gleichzeitiger Medienübertragung per Range oder SABR, Muxen mit libavformat, Fortschritt über SSE und lokaler oder S3-kompatibler Artefaktspeicherung.

Nützliche Einstiegspunkte:

- `internal/api` und `internal/server` für die interne HTTP-API;
- `internal/pipeline`, `internal/downloader` und `internal/sabr` für die Ausführung der Aufträge;
- `internal/mux` und `internal/ffmpeg` für das Muxen per Stream-Kopie;
- `internal/storage` und `internal/artifact` für Kapazität und Auslieferung der Artefakte.

Prüfungen:

```sh
gofmt -w cmd internal
go test ./...
go build ./...
```

Das Repository steht unter der GPL-3.0-or-later.

## Player {#player}

Player ist das abhängigkeitsfreie TypeScript-Paket, das als `@typetype/mse` auf npm und JSR veröffentlicht wird. Es macht aus einer Wiedergabesitzung von Server Media-Source-Extensions-Puffer auf einem `HTMLVideoElement`. Das Paket ist für Planung und Wiederaufnahme zuständig, Frontend für die Bedienelemente und das Seitenlayout.

Nützliche Einstiegspunkte sind unter anderem `type-type-mse-player.ts`, `playback-loop.ts`, `segment-scheduler.ts`, `media-source-controller.ts`, `seek-controller.ts` und `player-recovery.ts`.

Prüfungen:

```sh
bun run check
bun run check:docs
bun run check:jsr
bun run test:coverage
bun run build
```

Das Repository steht unter der MIT-Lizenz.

## RPC {#rpc}

RPC ist der Desktop-Begleiter, der die aktuelle TypeType-Wiedergabe eines Nutzers in einen Discord-Rich-Presence-Status verwandelt. Es ist eine Tauri-2-App mit einer von Grund auf in Rust geschriebenen Implementierung des Discord-IPC-Protokolls, ohne Electron und ohne Abhängigkeit vom Discord-SDK. Er sitzt im Infobereich und fragt den Präsenz-Endpunkt von Server nur ab, solange das Teilen eingeschaltet ist.

Nützliche Einstiegspunkte:

- `src-tauri/src/discord_frame.rs` und `discord_socket.rs` für das IPC-Drahtformat und das Auffinden des lokalen Sockets;
- `src-tauri/src/discord_rpc.rs` für den Handshake und die Aktivitätsbefehle;
- `src-tauri/src/presence.rs` für die Abfrage des Präsenz-Endpunkts;
- `src-tauri/src/tray.rs` für das Menü im Infobereich und den Abfragezyklus;
- `src/main.ts` für das Einstellungsfenster.

Prüfungen:

```sh
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
bun run build
```

Das Repository steht unter der MIT-Lizenz.

## Signals {#signals}

TypeType-Signals ist der optionale Empfehlungsdienst: ein Python-Dienst, der die Startseiten-Algorithmen enthält und sonst nichts. Server ruft ihn auf, holt die Videos, die er verlangt, und filtert, was zurückkommt. Er ist experimentell.

```sh
docker compose up -d --build
uv run pytest
```

Wichtige Pfade:

- `recommender/algorithms/` enthält eine Datei je Algorithmus.
- `recommender/contract.py` und die Dateien `contract_*.py` enthalten, was Server sendet und empfängt.
- `tests/reference_pages.py` baut die Referenzseiten, die beweisen, dass eine Änderung keine Seite verändert hat.

Siehe [Signals, der Empfehlungsdienst](./signals). Das Repository steht unter der GNU Affero General Public License, Version 3.

## Dokumentation und Profil der Organisation {#documentation-and-organisation-profile}

Docs-TypeType ist eine VitePress-Website. Seiten für Nutzer liegen in `docs/guide`, Seiten für Betreiber in `docs/self-hosting` und Seiten für Entwickler in `docs/project`. Bauen Sie sie mit:

```sh
bun run docs:build
```

Die Dokumentation steht unter der MIT-Lizenz. Das Profil-Repository `.github` enthält nur Darstellungsmaterial der Organisation und gibt keine Lizenz an.

## Branches und Ablauf bei Issues {#branch-and-issue-workflow}

Die Entwicklung der Komponenten zielt auf `dev`; `main` steht für die stabile Versionslinie. Lesen Sie [Branches und Versionen](./releases), bevor Sie festgelegte Integrationsstände oder Images ändern.

Öffnen Sie Fehler, Funktionswünsche und Hinweise zur Dokumentation im [zentralen Tracker](https://github.com/TypeType-Video/TypeType/issues). Sobald die zuständige Komponente bekannt ist, öffnen Sie deren Code-Pull-Request gegen den Branch `dev` dieser Komponente. Pull Requests für die Dokumentation zielen ebenfalls auf `dev`.

## Quellen {#source-references}

- [README des zentralen Repositorys](https://github.com/TypeType-Video/TypeType/blob/main/README.md)
- [README des Frontends](https://github.com/TypeType-Video/TypeType-Frontend/blob/dev/README.md)
- [README von Server](https://github.com/TypeType-Video/TypeType-Server/blob/dev/README.md)
- [README von Token](https://github.com/TypeType-Video/TypeType-Token/blob/dev/README.md)
- [README des Downloaders](https://github.com/TypeType-Video/TypeType-Downloader/blob/dev/README.md)
- [README von Player](https://github.com/TypeType-Video/TypeType-Player/blob/dev/README.md)
- [README von RPC](https://github.com/TypeType-Video/TypeType-RPC/blob/dev/README.md)
- [README von Signals](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/README.md)
