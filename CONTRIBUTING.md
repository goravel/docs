# Contributing to the Goravel docs

The guide to writing these docs is a page in the docs themselves, so it can show every feature of the theme as it renders:

- Read it rendered: https://www.goravel.dev/prologue/writing-docs.html
- Read or edit its source: [en/prologue/writing-docs.md](en/prologue/writing-docs.md)

It is the only copy. The page is not listed in the sidebar or in search, because it is for writers, not for readers of the docs.

```shell
pnpm install
pnpm docs:dev
pnpm docs:build
```

`pnpm docs:build` fails on dead links. Run it before every PR.

For contributing to Goravel in general, see the [contribution guide](en/prologue/contributions.md).
