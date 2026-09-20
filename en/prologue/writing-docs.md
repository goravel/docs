---
search: false
head:
  - - meta
    - name: robots
      content: noindex
---

# Writing Documentation

## Introduction

This page is for people and AI agents who write or edit these docs. It explains how to write a page a developer can follow without getting stuck, and it shows every feature of the docs theme as you write it and as it renders.

Every example on this page is written once: the block shows its source, and the result under it is rendered from that same source.

Preview your changes with `pnpm docs:dev`, and run `pnpm docs:build` before opening a PR. The build fails on dead links.

## What A Good Page Does

The reader has a task and wants to get back to their code. A good page gets them there.

- **It answers "how do I do X".** Organise a page by what the reader wants to do, not by how the package is built inside.
- **It can be pasted.** Every example runs when it is copied into a fresh project.
- **It can be scanned.** The outline on the right lists every `##` and `###` heading, so the reader finds the section without reading from the top.
- **It is true.** Every method, option and config key exists in the framework today.
- **It feels familiar.** Goravel follows Laravel. Use the names a Laravel developer already knows, and say where Goravel differs.

Order the sections the way a reader meets them: introduction, installation or configuration, the common tasks, the rarer tasks, extending, testing.

## Writing A Section

One section covers one task. Write it in this order.

1. **A heading that names the task.** "Storing Items For A Limited Time", not "Put". The reader searches for what they want to do. Reference pages with one short section per method are the exception, and there the method is the heading.
2. **One sentence that names the method** in inline code. It tells the reader what to look for in the example.
3. **A complete example** that starts with its file path.
4. **What comes back, and what can go wrong**, when the reader could be surprised.
5. **A callout, only when needed.** One gotcha that would cost the reader an hour belongs in a warning. Most sections need none.

Keep a section short. When a section needs more than two examples, it is two tasks.

````md demo
### Storing Items For A Limited Time

You may use the `Put` method to store an item for a given time:

```go
// app/http/controllers/user_controller.go
package controllers

import (
	"time"

	"github.com/goravel/framework/contracts/http"

	"goravel/app/facades"
)

func (r *UserController) Show(ctx http.Context) http.Response {
	err := facades.Cache().Put("user", "Goravel", 5*time.Minute)
	if err != nil {
		return ctx.Response().Status(500).String(err.Error())
	}

	return ctx.Response().Success().String("cached")
}
```

::: warning Zero means forever
A duration of `0` stores the item with no expiry.
:::
````

## Writing Examples

Examples are the part of the docs people actually use.

- **Make it complete.** Start the block with the file path as a comment, then the package, the imports and the function around the call. A fragment of one to three lines is only right when the text around it already shows where it goes, such as a single config line.
- **Check it against the framework.** Open the contract in `goravel/framework` and confirm the method name, the arguments and the return values. An example that calls a method that does not exist is worse than no example.
- **Handle the error.** Show `if err != nil` the way real code would, not `_`.
- **Use real names.** `user`, `order`, `invoice`. Not `foo`, `bar` or `test`.
- **Show the result** when it is not obvious, as a comment on the last line or in a `text` block under the example.
- **Write artisan commands as `go run . artisan`.** The `./artisan` script does not run on Windows.
- **Shell comments start with `#`.** The copy button copies the whole block, and a `//` line makes the command fail.
- **One idea per block.** Two alternatives go in a code group, not in one long block with comments between them.
- **Always name the language.** A block without one has no highlighting. Use `go`, `shell`, `json`, `yaml`, `sql`, `dockerfile`, `html`, `php`, `diff`, or `text` for directory trees and plain output.

## Callouts

Use a callout for what the reader must not miss. Never write `Note:`, `Tip:` or `Attention:` as plain text.

| You want to | Use |
| ----------- | --- |
| Help the reader do it better | `::: tip` |
| Add background the reader can skip | `::: info` |
| Stop a surprise | `::: warning` |
| Stop a loss of data or a production failure | `::: danger` |
| Keep a long config out of the way | `::: details Title` |

````md demo
::: tip
A shortcut, or a better way to do what the reader is already doing.
:::

::: info
Background the reader can skip.
:::

::: warning Zero values are skipped
Words after the type become the title.
:::

::: danger
Something that loses data or breaks production.
:::

::: details Show the full config
Folded until the reader opens it.
:::
````

## Code Blocks

### File name header

When the first line is only a comment holding a file path, it becomes the title of the block. It works with `//`, `#` and `--` comments. A block that uses line highlights keeps the comment as a line.

````md demo
```go
// config/cache.go
"default": "memory",
```
````

### Line and word highlights

````md demo
```go{2}
func Boot() {
	facades.Route().Run()
}
```

```go /taskController/
facades.Route().Get("/tasks", taskController.Index)
```
````

### Changes, warnings and errors

Put the mark in a comment at the end of the line. `// [!code focus]` blurs every other line until the reader hovers the block. For a whole-file before and after, use the `diff` language.

````md demo
```go
facades.Log().Debug("removed") // [!code --]
facades.Log().Info("added")    // [!code ++]
facades.Log().Warn("careful")  // [!code warning]
facades.Log().Error("bad")     // [!code error]
```
````

### Code groups

Use a group when the same step has more than one form, such as two drivers or two operating systems. The label becomes the tab, and a file name or known tool gets its icon.

````md demo
::: code-group

```go [main.go]
package main

func main() {}
```

```shell [run]
go run .
```

:::
````

### One-line commands

Line numbers are on everywhere. Turn them off for a one-line command.

````md demo
```shell:no-line-numbers
go run . artisan key:generate
```
````

## Tables And Inline Elements

Keep the first column of a table short, because it never breaks in the middle of a name. A page with a very wide table can hide the outline with `aside: false` in its frontmatter.

````md demo
| Facade | Purpose | Since |
| ------ | ------- | ----- |
| `AI` | Agents and tools | <Badge type="tip" text="v1.18" /> |
| `Telemetry` | Traces, metrics and logs | <Badge type="tip" text="v1.18" /> |

Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to open search.

- [x] A finished step
- [ ] An open step

| Feature | Laravel | Goravel |
| ------- | ------- | ------- |
| Grpc | <Brand laravel no /> Not built in | <Brand goravel /> `facades.Grpc()` |
````

A badge takes the type `info`, `tip`, `warning` or `danger`.

## Words

- Write to the reader as "you", in the present tense: "The `Get` method returns the item."
- Keep sentences short. One idea each.
- Drop "simply", "just", "easily" and "obviously". If it were obvious, the reader would not be here.
- Use one word for one thing across the page. Do not switch between "driver", "store" and "adapter" for the same thing.
- Put names of methods, files, config keys, commands and values in inline code.
- Do not write numbers that go stale, such as how many facades, drivers or stars there are.
- Say what a thing does, not how good it is: "runs up to ten processes at once", not "a powerful concurrency engine".

## Two Languages

- Every page exists in `en/` and `zh_CN/` with the same headings in the same order and the same code blocks. Change both in the same PR.
- Translate the text. Keep code, method names, file paths and config keys as they are.
- Link to a page with a relative path to the `.md` file, such as `../architecture-concepts/facades.md#install-uninstall-facades`.
- An anchor is the heading in lower case with hyphens for spaces. A Chinese page has Chinese anchors, so never copy an English anchor into a Chinese page. Give a heading a fixed anchor when it may be renamed: `### Update columns {#update-columns}`.
- A new page goes into the sidebar in both `.vitepress/config/en.ts` and `.vitepress/config/zh_CN.ts`.

## Light And Dark

Switch the theme with the button in the top bar and check your page in both.

- Never write a colour in a page. Raw HTML uses the theme tokens: `var(--g-ink)` for text, `var(--g-grey)` for quiet text, `var(--g-line)` for rules, `var(--g-cyan)` for the accent, `var(--g-code)` for a code ground.
- Use images with a transparent background that stay readable on a dark ground, or give them their own solid ground.

## Before You Open A PR

- [ ] `pnpm docs:build` passes
- [ ] Each section names its task in the heading and its method in the first sentence
- [ ] Every example is complete, starts with its file path, and uses methods that exist in the framework
- [ ] Every code block has a language, and shell comments use `#`
- [ ] The outline reads as a list of tasks, because every `##` and `###` heading is in it
- [ ] English and Chinese have the same headings and code blocks, and Chinese pages use Chinese anchors
- [ ] You looked at the page in both the light and the dark theme
