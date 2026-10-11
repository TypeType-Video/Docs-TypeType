# Guide des dépôts

Chaque composant de TypeType a une limite de responsabilité étroite, ses propres vérifications et sa propre licence. Les problèmes tournés vers les utilisateurs restent dans le suivi central de TypeType, même quand le correctif appartient au dépôt d'un composant.

## Qui possède quoi, en un coup d'œil {#ownership-at-a-glance}

| Changement | Dépôt propriétaire | Chemin principal du code |
| --- | --- | --- |
| Docker Compose, installateur, mise à jour, migration ou retour arrière | [TypeType](https://github.com/TypeType-Video/TypeType) | `docker-compose*.yml`, `scripts/` |
| Page, route, nginx, réglage dans les paramètres, interface de compte ou commandes du lecteur | [TypeType-Frontend](https://github.com/TypeType-Video/TypeType-Frontend) | `apps/web/src/`, `nginx.conf` |
| Extraction, route d'API, données de compte, import, recommandation ou session de lecture | [TypeType-Server](https://github.com/TypeType-Video/TypeType-Server) | `src/main/kotlin/dev/typetype/server/` |
| Jeton PO, décodeur du lecteur YouTube, métadonnées de sous-titres ou navigateur de connexion distante | [TypeType-Token](https://github.com/TypeType-Video/TypeType-Token) | `src/` |
| File de téléchargement, transfert, multiplexage, stockage ou artefact | [TypeType-Downloader](https://github.com/TypeType-Video/TypeType-Downloader) | `cmd/`, `internal/`, `migrations/` |
| Mise en tampon MSE, planification des segments, déplacement, changement de qualité ou reprise de lecture | [TypeType-Player](https://github.com/TypeType-Video/TypeType-Player) | `src/` |
| Algorithme d'accueil, ses réglages ou ce qu'il déduit | [TypeType-Signals](https://github.com/TypeType-Video/TypeType-Signals) | `recommender/` |
| Détail de la présence Discord, poignée de main RPC ou comportement dans la zone de notification | [TypeType-RPC](https://github.com/TypeType-Video/TypeType-RPC) | `src-tauri/src/` |
| Explication pour les utilisateurs, les exploitants ou le projet | [Docs-TypeType](https://github.com/TypeType-Video/Docs-TypeType) | `docs/` |

## Stack centrale {#central-stack}

Le dépôt `TypeType` est le point d'intégration plutôt qu'une application monolithique. Il contient des sous-modules Git pour les composants publics, mais le déploiement utilise les images de composants sélectionnées dans `docker-compose.yml`.

Chemins importants :

- `.env.example` liste les réglages pris en charge au niveau de la stack et les images de remplacement.
- `docker-compose.yml` définit le graphe des services stables.
- `docker-compose.dev.yml` définit le graphe de la beta.
- `scripts/` contient l'installation, la mise à jour, les sauvegardes de migration, la génération des secrets, le provisionnement de Garage et les aides au déploiement stable.

La configuration nginx par défaut est intégrée à l'image du frontend. La stack centrale n'a donc pas besoin de monter un fichier correspondant depuis l'hôte à chaque mise à jour.

Le dépôt est sous licence MIT.

## Frontend {#frontend}

Le frontend est un monorepo Bun qui contient une application React 19. TanStack Router et Query s'occupent de la navigation et de l'état serveur, Zustand de l'état local, Tailwind CSS du style, et Vidstack enveloppe les fournisseurs de lecture disponibles.

Points d'entrée utiles :

- `apps/web/src/routes` pour les pages et les chargeurs de routes ;
- `apps/web/src/components` pour l'interface partagée et l'habillage du lecteur ;
- `apps/web/src/lib` pour les clients d'API et l'intégration au navigateur ;
- `apps/web/src/hooks` pour les requêtes et le comportement des fonctions ;
- `apps/web/src/settings` et `apps/web/src/stores` pour les choix persistants côté client.

Vérifications :

```sh
bun run check
bun run test
bun run knip
bun run sherif
bun run build
```

Le dépôt est sous licence MIT.

## Server {#server}

Server est une application Kotlin/Ktor sur JDK 25. Il utilise PipePipeExtractor pour les services de médias pris en charge, PostgreSQL via Exposed et HikariCP pour l'état persistant, et Dragonfly via le protocole Redis pour l'état du cache.

Points d'entrée utiles :

- `Application.kt` et `ApplicationRoutes.kt` pour le câblage des services et des routes ;
- `routes/` pour le contrat HTTP ;
- `services/` pour le comportement de l'application, de l'extraction et de la lecture ;
- `db/` pour les tables et les migrations ;
- `openapi.yaml` et `openapi/` pour le contrat d'API publié.

Vérifications :

```sh
./gradlew test
./gradlew shadowJar
./gradlew validateOpenApi
```

Le dépôt est sous licence GPL-3.0 en raison de son intégration de l'extracteur.

## Token {#token}

Token est un service Bun interne avec un environnement Chromium via Playwright. Son nom est historique : il fournit aujourd'hui bien plus que des sous-titres ou un seul point d'accès de jetons. Il fournit les données de visiteur et les jetons PO de YouTube, le décodage du lecteur, les métadonnées de session SABR, les sous-titres et des sessions de navigateur jetables pour la connexion distante.

Le frontend ne doit pas appeler Token directement. Server est son consommateur et sa limite de sécurité. Voir [Limites de sécurité](/fr/self-hosting/security#token-browser-boundary) avant de personnaliser son conteneur.

Vérifications :

```sh
bun run lint
bun test
bun run build
```

Le dépôt est sous licence MIT.

## Downloader {#downloader}

Downloader est un service Go avec des tâches adossées à PostgreSQL, un état de cache dans Dragonfly, un transfert de médias concurrent par plages ou par SABR, un multiplexage par libavformat, une progression en SSE et un stockage d'artefacts local ou compatible S3.

Points d'entrée utiles :

- `internal/api` et `internal/server` pour l'API HTTP interne ;
- `internal/pipeline`, `internal/downloader` et `internal/sabr` pour l'exécution des tâches ;
- `internal/mux` et `internal/ffmpeg` pour le multiplexage par copie de flux ;
- `internal/storage` et `internal/artifact` pour la capacité et la livraison des artefacts.

Vérifications :

```sh
gofmt -w cmd internal
go test ./...
go build ./...
```

Le dépôt est sous licence GPL-3.0-or-later.

## Player {#player}

Player est le paquet TypeScript sans dépendance publié sous le nom `@typetype/mse` sur npm et JSR. Il transforme une session de lecture de Server en tampons Media Source Extensions sur un `HTMLVideoElement`. Le paquet possède la planification et la reprise, tandis que Frontend possède les commandes et la mise en page.

Les points d'entrée utiles sont notamment `type-type-mse-player.ts`, `playback-loop.ts`, `segment-scheduler.ts`, `media-source-controller.ts`, `seek-controller.ts` et `player-recovery.ts`.

Vérifications :

```sh
bun run check
bun run check:docs
bun run check:jsr
bun run test:coverage
bun run build
```

Le dépôt est sous licence MIT.

## RPC {#rpc}

RPC est le compagnon de bureau qui transforme la lecture TypeType en cours d'un utilisateur en statut Discord Rich Presence. C'est une application Tauri 2 avec une implémentation Rust écrite de zéro du protocole IPC de Discord, sans Electron ni dépendance au SDK de Discord. Il vit dans la zone de notification et n'interroge le point d'accès de présence de Server que pendant que le partage est activé.

Points d'entrée utiles :

- `src-tauri/src/discord_frame.rs` et `discord_socket.rs` pour le format des trames IPC et la découverte du socket local ;
- `src-tauri/src/discord_rpc.rs` pour la poignée de main et les commandes d'activité ;
- `src-tauri/src/presence.rs` pour l'interrogation du point d'accès de présence ;
- `src-tauri/src/tray.rs` pour le menu de la zone de notification et le cycle d'interrogation ;
- `src/main.ts` pour la fenêtre des réglages.

Vérifications :

```sh
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
bun run build
```

Le dépôt est sous licence MIT.

## Signals {#signals}

TypeType-Signals est le service de recommandations optionnel : un service Python qui contient les algorithmes d'accueil et rien d'autre. Server l'appelle, récupère les vidéos qu'il demande et filtre ce qui revient. Il est expérimental.

```sh
docker compose up -d --build
uv run pytest
```

Chemins importants :

- `recommender/algorithms/` contient un fichier par algorithme.
- `recommender/contract.py` et les fichiers `contract_*.py` contiennent ce que Server envoie et reçoit.
- `tests/reference_pages.py` construit les pages de référence qui prouvent qu'un changement n'a modifié aucune page.

Voir [Signals, le service de recommandations](./signals). Le dépôt est sous licence GNU Affero General Public License, version 3.

## Documentation et profil de l'organisation {#documentation-and-organisation-profile}

Docs-TypeType est un site VitePress. Les pages pour les utilisateurs sont dans `docs/guide`, celles pour les exploitants dans `docs/self-hosting`, et celles tournées vers les développeurs dans `docs/project`. Construisez-le avec :

```sh
bun run docs:build
```

La documentation est sous licence MIT. Le dépôt de profil `.github` ne contient que des ressources de présentation de l'organisation et ne déclare pas de licence.

## Branches et parcours des issues {#branch-and-issue-workflow}

Le développement des composants vise `dev` ; `main` représente la ligne des versions stables. Voir [Branches et versions](./releases) avant de changer des épinglages d'intégration ou des images.

Ouvrez les bugs, les demandes de fonctions et les signalements sur la documentation dans le [suivi central](https://github.com/TypeType-Video/TypeType/issues). Une fois le composant propriétaire connu, ouvrez sa pull request de code vers la branche `dev` de ce composant. Les pull requests de documentation visent aussi `dev`.

## Références {#source-references}

- [README du dépôt central](https://github.com/TypeType-Video/TypeType/blob/main/README.md)
- [README du Frontend](https://github.com/TypeType-Video/TypeType-Frontend/blob/dev/README.md)
- [README de Server](https://github.com/TypeType-Video/TypeType-Server/blob/dev/README.md)
- [README de Token](https://github.com/TypeType-Video/TypeType-Token/blob/dev/README.md)
- [README de Downloader](https://github.com/TypeType-Video/TypeType-Downloader/blob/dev/README.md)
- [README de Player](https://github.com/TypeType-Video/TypeType-Player/blob/dev/README.md)
- [README de RPC](https://github.com/TypeType-Video/TypeType-RPC/blob/dev/README.md)
- [README de Signals](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/README.md)
