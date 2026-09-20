# Goravel docs

This repository is the documentation site for Goravel, built with VitePress. Pages live in `en/` and `zh_CN/`. The theme lives in `.vitepress/theme/`.

Before you write or edit a page, read [en/prologue/writing-docs.md](en/prologue/writing-docs.md) and follow it. It is the only writing guide, and it wins over anything you assume about Markdown or VitePress.

The theme has one rule of its own:

- Never write a colour in the theme or in a page. Use the `--g-*` tokens in `.vitepress/theme/goravel.css`, so the light and dark themes both work.

Verify with `pnpm docs:build`, which fails on dead links. Preview with `pnpm docs:dev`.
