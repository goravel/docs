# Goravel Document

This is goravel official document.

## Contributing

We welcome contributions to the Goravel documentation. The guide to writing a page is a page in the docs themselves, so it can show every feature of the theme as it renders:

- Read it rendered: https://www.goravel.dev/prologue/writing-docs.html
- Read or edit its source: [en/prologue/writing-docs.md](en/prologue/writing-docs.md)

The page is not listed in the sidebar or in search, because it is for writers, not for readers of the docs. `pnpm docs:build` fails on dead links, so run it before every PR.

For contributing to Goravel in general, see the [contribution guide](en/prologue/contributions.md).

## Install

```
pnpm install
```

## Run dev

```
pnpm docs:dev
```

## Run Build

```
pnpm docs:build
```

## Deploy

We use Github Actions to deploy the document to the server.

Production: https://github.com/goravel/docs/actions/workflows/deploy.yml

Preview: https://github.com/goravel/docs/actions/workflows/deploy-pre.yml

## Drive by

- [VitePress](https://vitepress.dev/)
