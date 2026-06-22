# TypeType Docs

Documentation for self-hosting [TypeType](https://github.com/Priveetee/TypeType), a
privacy-friendly video frontend. Built with [VitePress](https://vitepress.dev/).

The current focus is a complete, script-free Docker Compose self-hosting guide.

## Run the docs locally

```sh
bun install
bun run docs:dev      # http://localhost:5173
```

## Build

```sh
bun run docs:build    # output in docs/.vitepress/dist
bun run docs:preview
```

## Structure

```
docs/
  index.md                 landing page
  self-hosting/            the self-hosting guide
  .vitepress/
    config.mts             site config and navigation
    theme/                 TypeType colours and theme tweaks
  public/                  logo, screenshots
```
