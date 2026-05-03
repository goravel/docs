# Artisan (CLI Commands)

Custom CLI commands implemented via the `console.Command` contract: `Signature`, `Description`, `Extend` (flags/args), `Handle(ctx)`. Rich `Context` API for prompts, progress bars, tables, colored output. Register via `WithCommands` or inside a service provider's `Boot` via `app.Commands(...)`.

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/console/artisan.go` — `Artisan`
- `contracts/console/command.go` — `Command`, `Context`, `Progress`, `Choice`, all option structs
- `contracts/console/command/extend.go` — `Extend`, `Flag` types

## Imports

```go
import (
    "github.com/goravel/framework/contracts/console"
    "github.com/goravel/framework/contracts/console/command"

    "yourmodule/app/facades"
)
```

## Methods

### `facades.Artisan()` returns `console.Artisan`

| Method | Signature | Notes |
|---|---|---|
| Register | `(commands []Command)` | Add commands at runtime (also via builder `WithCommands`). |
| Call | `(command string) error` | Run an Artisan command by signature programmatically. |
| CallAndExit | `(command string)` | Run + exit. |
| Run | `(args []string, exitIfArtisan bool) error` | Internal entry. |

### `console.Command` (the contract you implement)

```go
type Command interface {
    Signature() string                                    // unique cli name (e.g. "report:daily" or "users:prune")
    Description() string                                  // shown in `artisan list`
    Extend() command.Extend                               // flags, arguments, category
    Handle(ctx Context) error                             // command body
}
```

### `command.Extend`

```go
type Extend struct {
    Category    string         // group in `artisan list` (e.g. "ai", "queue", custom)
    Flags       []command.Flag // BoolFlag, StringFlag, IntFlag, StringSliceFlag, etc.
    Args        []command.Arg  // positional arguments (typed)
    ArgsUsage   string
}
```

### Common flag types (under `command.`)

`BoolFlag`, `StringFlag`, `IntFlag`, `Int64Flag`, `Float64Flag`, `StringSliceFlag`, `IntSliceFlag` — each with `Name`, `Aliases []string`, `Value`, `Usage`, `Required`, `DisableDefaultText`.

### `console.Context` (the rich API inside `Handle`)

| Group | Methods (signature-only) |
|---|---|
| Args | `Argument(index int) string`, `Arguments() []string` |
| Typed args (named) | `ArgumentString(key)`, `ArgumentStringSlice`, `ArgumentInt`, `ArgumentInt8/16/32/64`, `ArgumentUint`, `ArgumentUint8/16/32/64`, `ArgumentFloat32/64`, `ArgumentTimestamp`, `ArgumentTimestampSlice` (+ `*Slice` variants) |
| Options/flags | `Option(key) string`, `OptionBool(key) bool`, `OptionInt(key) int`, `OptionInt64(key) int64`, `OptionFloat64(key) float64`, `OptionSlice(key) []string`, `OptionIntSlice`, `OptionInt64Slice`, `OptionFloat64Slice` |
| Output | `Info(message)`, `Success(message)`, `Comment(message)`, `Warning(message)`, `Error(message)`, `Line(message)`, `NewLine(times ...int)` |
| Color | `Green`/`Greenln`/`Red`/`Redln`/`Yellow`/`Yellowln`/`Black`/`Blackln(message)` |
| Layout | `Table(headers []string, rows [][]string, opt ...TableOption)`, `TwoColumnDetail(first, second string, filler ...rune)`, `Divider(filler ...string)` |
| Prompts | `Ask(question, opt ...AskOption) (string, error)`, `Choice(question, choices []Choice, opt ...ChoiceOption) (string, error)`, `MultiSelect(question, choices []Choice, opt ...MultiSelectOption) ([]string, error)`, `Confirm(question, opt ...ConfirmOption) bool`, `Secret(question, opt ...SecretOption) (string, error)` |
| Progress | `CreateProgressBar(total int) Progress`, `WithProgressBar(items []any, callback func(any) error) ([]any, error)` |
| Spinner | `Spinner(message string, opt SpinnerOption) error` |
| Inspect | `Instance() *cli.Command` |

### `Choice`, `Progress` (key types)

```go
type Choice struct {
    Key      string
    Value    string
    Selected bool
}

type Progress interface {
    Start() error
    Advance(step ...int)
    SetTitle(message string)
    ShowTitle(b ...bool) Progress
    ShowElapsedTime(b ...bool) Progress
    Finish() error
}
```

## Config

No facade config — commands are registered in `bootstrap/app.go` via `WithCommands(func() []console.Command { return ... })` OR from a service provider's `Boot`.

## Patterns & gotchas

- **Signature is the CLI name**: `"report:daily"`, `"users:prune"`, `"agents:install"` — colon-separated namespace:action is the convention. Use Extend.Category to group siblings in `artisan list`.
- **Flags vs Arguments**: flags are `--name=value` (or `-n`); arguments are positional. Define both in `Extend`.
- **Typed accessors**: prefer `ctx.OptionInt("limit")` and `ctx.OptionBool("force")` over `ctx.Option("limit")` + manual parse. Same for `Argument*`.
- **Commands return `error`** from `Handle` — non-nil = exit code != 0. Print user-facing error via `ctx.Error(msg)` AND return the error so the exit code is correct.
- **Register in two places, pick one**:
  - `bootstrap/app.go`: `WithCommands(func() []console.Command { return []console.Command{&MyCmd{}} })`.
  - Service provider `Boot`: `app.Commands([]console.Command{&MyCmd{}})`.
- **Inside `Handle`**, prompts BLOCK on stdin — don't use them in non-interactive contexts (cron, CI). Pair every prompt with a `--no-interaction` flag for unattended use.
- **Progress bars**: `CreateProgressBar(total)` for manual control (`Start`, `Advance`, `Finish`). `WithProgressBar(items, fn)` for the simple iterate-and-track case.
- **Tables**: `ctx.Table(headers, rows)` — rows is `[][]string`. Use `TableOption` for borders, alignment, custom styles (lipgloss).
- **`Confirm` returns bool** with no error path — defaults from `ConfirmOption.Default`. For destructive ops always `Confirm` BEFORE acting unless `--force` is set.
- **Calling other commands**: `facades.Artisan().Call("queue:retry --queue=default")` — chains commands programmatically.
- **No `os.Exit` from inside Handle** — return error and let the CLI driver set the exit code.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `func (c *MyCmd) Handle(ctx console.Context)` (no return) | `func (c *MyCmd) Handle(ctx console.Context) error` | Must return error. |
| `ctx.Option("limit")` then `strconv.Atoi(...)` | `ctx.OptionInt("limit")` | Typed accessor exists. |
| `os.Exit(1)` from inside Handle | `return errors.New("...")` (or named declared error) | Let the framework manage exit code. |
| Use `fmt.Println` for output | `ctx.Info(...)`, `ctx.Error(...)`, `ctx.Line(...)` | Goes through the framework's writer (testable, styled). |
| `Confirm` without `--force` flag for destructive op | Define a `--force` BoolFlag; if !force, `Confirm` first | Production scripts need a non-interactive escape hatch. |
| Block on `Ask`/`Confirm` in CI without flag | Add `--no-interaction` (or per-prompt `--force`) and skip prompts when set | Otherwise CI hangs. |
| Print error and return nil | `ctx.Error(err.Error())` AND `return err` | Both: user-visible message AND non-zero exit. |

## Worked example: command with flags + progress + confirm

```go
// app/console/commands/prune_users.go
package commands

import (
    "fmt"

    "github.com/goravel/framework/contracts/console"
    "github.com/goravel/framework/contracts/console/command"

    "yourmodule/app/facades"
    "yourmodule/app/models"
)

type PruneUsers struct{}

func (c *PruneUsers) Signature() string   { return "users:prune" }
func (c *PruneUsers) Description() string { return "Permanently delete users soft-deleted more than N days ago" }

func (c *PruneUsers) Extend() command.Extend {
    return command.Extend{
        Category: "users",
        Flags: []command.Flag{
            &command.IntFlag{Name: "days", Aliases: []string{"d"}, Value: 30, Usage: "older than N days"},
            &command.BoolFlag{Name: "force", Usage: "skip confirm", DisableDefaultText: true},
        },
    }
}

func (c *PruneUsers) Handle(ctx console.Context) error {
    days := ctx.OptionInt("days")

    var users []models.User
    if err := facades.Orm().Query().WithTrashed().
        Where("deleted_at IS NOT NULL").
        Where("deleted_at < NOW() - INTERVAL ? DAY", days).
        Get(&users); err != nil {
        ctx.Error(err.Error())
        return err
    }

    ctx.Info(fmt.Sprintf("Found %d user(s) to prune.", len(users)))
    if len(users) == 0 {
        return nil
    }

    if !ctx.OptionBool("force") {
        if !ctx.Confirm("Permanently delete these users?", console.ConfirmOption{Default: false}) {
            ctx.Warning("Cancelled.")
            return nil
        }
    }

    bar := ctx.CreateProgressBar(len(users))
    if err := bar.Start(); err != nil {
        return err
    }
    for _, u := range users {
        if _, err := facades.Orm().Query().ForceDelete(&u); err != nil {
            ctx.Error(err.Error())
            return err
        }
        bar.Advance()
    }
    if err := bar.Finish(); err != nil {
        return err
    }
    ctx.Success(fmt.Sprintf("Pruned %d user(s).", len(users)))
    return nil
}

// bootstrap/app.go (excerpt)
// app.WithCommands(func() []console.Command {
//     return []console.Command{&commands.PruneUsers{}}
// })
```

## Rules

- `Handle(ctx console.Context) error` — must return error; non-nil = non-zero exit.
- Use typed accessors (`OptionInt`, `OptionBool`, `ArgumentInt`, etc.) — don't hand-parse strings.
- Use `ctx.Info`/`Error`/`Success` etc. for output, NOT `fmt.Println` — testable + styled.
- Pair destructive operations with `--force`; if !force, `Confirm` before acting.
- For non-interactive contexts add `--no-interaction` (or honour `--force`) and skip prompts.
- Register commands via `WithCommands` in `bootstrap/app.go` OR `app.Commands(...)` in a provider's `Boot`.
- Call other commands programmatically via `facades.Artisan().Call("...")`.
- Never `os.Exit` from `Handle`; return error and let the CLI set exit code.
