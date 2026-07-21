<div align="center">
  <img src="assets/banner.svg" alt="TypeType" width="100%">
</div>

# TypeType Documentation

This repository contains the user and self-hosting documentation for the TypeType ecosystem. The site is built with VitePress and published at [typetype-video.github.io/Docs-TypeType](https://typetype-video.github.io/Docs-TypeType/).

## Documentation sections

| Section | Audience | Contents |
| --- | --- | --- |
| [User guide](https://typetype-video.github.io/Docs-TypeType/guide/) | People using a TypeType instance | Watching, search, accounts, libraries, settings, privacy, and content controls |
| [Self-hosting](https://typetype-video.github.io/Docs-TypeType/self-hosting/introduction) | Instance operators | Installation, configuration, authentication, reverse proxy, updates, rollback, and troubleshooting |
| [Project](https://typetype-video.github.io/Docs-TypeType/project/) | Contributors and integrators | Architecture, repository ownership, playback, releases, source references, and community acknowledgements |

The [central TypeType repository](https://github.com/TypeType-Video/TypeType) owns the Docker Compose stack, installer, releases, and project issue tracker. This repository explains how those supported workflows are used.

## Development

Requirements:

- Bun

```sh
bun install
bun run docs:dev
```

The local documentation server starts at `http://localhost:5173`.

Build and preview the production site with:

```sh
bun run docs:build
bun run docs:preview
```

## Project structure

| Path | Contents |
| --- | --- |
| `docs/guide` | User-facing guides |
| `docs/self-hosting` | Installation and operator guides |
| `docs/project` | Architecture and contributor-facing project guides |
| `docs/.vitepress/config.mts` | Navigation, sidebars, search, and site metadata |
| `docs/.vitepress/theme` | TypeType documentation theme |
| `docs/public` | Screenshots, images, and public site assets |
| `assets` | README banner and repository widgets |

Read [CONTRIBUTING.md](CONTRIBUTING.md) before editing the documentation. Report inaccurate or missing documentation in the [central issue tracker](https://github.com/TypeType-Video/TypeType/issues). Community reports and discussions used as documentation sources are credited on the [acknowledgements page](https://typetype-video.github.io/Docs-TypeType/project/community).

## License

TypeType Documentation is licensed under the [MIT License](LICENSE).
