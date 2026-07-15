# Contributing to TypeType Documentation

Thank you for helping make TypeType easier to use and self-host. Corrections, clearer explanations, screenshots, troubleshooting steps, and new guides are welcome.

## Report a documentation problem

Open documentation issues in the [central TypeType issue tracker](https://github.com/TypeType-Video/TypeType/issues). Include the page URL, the TypeType version, what is incorrect or missing, and what you expected to find.

Search existing issues before opening a new one. Do not include passwords, cookies, private keys, access tokens, or values from a private `.env` file.

## Choose the right section

| Change | Location |
| --- | --- |
| Watching, search, accounts, libraries, settings, or privacy | `docs/guide/` |
| Installation, configuration, updates, rollback, reverse proxy, or troubleshooting | `docs/self-hosting/` |
| Navigation or sidebar entries | `docs/.vitepress/config.mts` |
| Screenshots and site images | `docs/public/` |
| Repository README assets | `assets/` |

Document stable behavior that exists in the current TypeType code and stack. Do not present a beta-only feature as stable, invent configuration variables, or copy instructions from an unrelated project without verifying them against the owning TypeType repository.

## Set up the site

Use Bun for every package and site command.

```sh
git switch dev
bun install
bun run docs:dev
```

The local site starts at `http://localhost:5173`.

## Writing and implementation preferences

- Write for the person performing the task, not for the implementation author.
- Use plain language in the user guide and introduce implementation terms only when readers need them.
- Write self-hosting pages for instance operators: state the effect of a command, the expected result, and any risk to data or availability.
- Keep developer-facing repository documentation technical and precise without turning user-facing pages into implementation references.
- Use natural, direct language. Do not add marketing slogans, artificial meta descriptions, emojis, or internal workspace details.
- Put prerequisites before commands and expected results after them.
- Keep one page focused on one workflow.
- Verify every command, configuration key, path, and link against the current owning repository.
- Use root-absolute internal links such as `/self-hosting/maintenance`.
- Add a language to every fenced code block, such as `sh`, `text`, or `json`.
- Use `tip`, `warning`, or `danger` for VitePress custom containers.
- Add an explicit heading anchor when another page depends on it.
- Add new pages to the matching sidebar in `docs/.vitepress/config.mts`.
- Store site images in `docs/public/` and reference them from `/`.
- Use real screenshots and commands without exposing private instance data.
- Use Bun exclusively for documentation tooling and keep theme changes split into focused Vue, TypeScript, and CSS modules.

## Required checks

```sh
bun run docs:build
```

Preview the result when navigation, layout, images, or theme behavior changes:

```sh
bun run docs:preview
```

The spelling workflow also checks every pull request.

## Commits and pull requests

Create your branch from `dev` and open the pull request against `dev`.

Use commit messages in this form:

```text
docs: short description
```

Use the imperative mood and keep the first line under 72 characters.

The pull request should identify the affected pages, the TypeType behavior used as the source, and the local build result. Include screenshots when the rendered result changes visibly.

All contributors are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md). Contributions to this repository are distributed under the [MIT License](LICENSE).
