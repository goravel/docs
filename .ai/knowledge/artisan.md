# Artisan Console Facade

## Core Imports

```go
import (
    "context"
    "time"
    "github.com/goravel/framework/contracts/console"
    "github.com/goravel/framework/contracts/console/command"
    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/console/command.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/console/command/flags.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/console/command/arguments.go`

## Available Methods

**facades.Artisan():**

- `Call(command string)` - run command string programmatically

**console.Context - Arguments:**

- `Argument(index int)` string - 0-based positional
- `Arguments()` []string
- `ArgumentString/Int/Int8/Int16/Int32/Int64(key)` T
- `ArgumentUint/Uint8/Uint16/Uint32/Uint64(key)` T
- `ArgumentFloat32/Float64(key)` T
- `ArgumentStringSlice/IntSlice/Int8Slice/.../Float64Slice(key)` []T
- `ArgumentTimestamp(key)` time.Time
- `ArgumentTimestampSlice(key)` []time.Time

**console.Context - Flags/Options:**

- `Option(key)` string
- `OptionBool(key)` bool
- `OptionInt/OptionInt64/OptionFloat64(key)` T
- `OptionSlice(key)` []string
- `OptionIntSlice/OptionInt64Slice/OptionFloat64Slice(key)` []T

**console.Context - Output:**

- `Info/Warning/Error/Comment/Success/Line(message)`
- `Green/Greenln/Red/Redln/Yellow/Yellowln/Black/Blackln(message)`
- `NewLine(times ...int)`
- `Divider(filler ...string)`
- `TwoColumnDetail(first, second string, filler ...rune)`
- `Table(headers []string, rows [][]string, option ...TableOption)`

**console.Context - Interactive:**

- `Ask(question, ...AskOption)` (string, error)
- `Secret(question, ...SecretOption)` (string, error)
- `Confirm(question, ...ConfirmOption)` bool
- `Choice(question, []Choice, ...ChoiceOption)` (string, error)
- `MultiSelect(question, []Choice, ...MultiSelectOption)` ([]string, error)

**console.Context - Progress:**

- `CreateProgressBar(total int)` Progress
- `WithProgressBar(items []any, callback func(any) error)` ([]any, error)
- `Spinner(message string, option SpinnerOption)` error

## Implementation Example

```go
package commands

import (
    "fmt"
    "github.com/goravel/framework/contracts/console"
    "github.com/goravel/framework/contracts/console/command"
)

type SendEmails struct{}

func (r *SendEmails) Signature() string    { return "send:emails" }
func (r *SendEmails) Description() string { return "Send bulk emails" }

func (r *SendEmails) Extend() command.Extend {
    return command.Extend{
        Category: "mail",
        Arguments: []command.Argument{
            &command.ArgumentString{Name: "subject", Usage: "Email subject", Required: true},
        },
        Flags: []command.Flag{
            &command.StringFlag{Name: "lang", Value: "en", Aliases: []string{"l"}},
            &command.BoolFlag{Name: "dry-run"},
            &command.IntSliceFlag{Name: "ids", Usage: "User IDs"},
        },
    }
}

func (r *SendEmails) Handle(ctx console.Context) error {
    subject := ctx.ArgumentString("subject")
    lang    := ctx.Option("lang")
    dryRun  := ctx.OptionBool("dry-run")
    ids     := ctx.OptionIntSlice("ids")

    ctx.Info(fmt.Sprintf("Sending to %d users (lang=%s dry=%v)", len(ids), lang, dryRun))

    // Table output
    ctx.Table([]string{"ID", "Status"}, [][]string{{"1", "queued"}})

    // Auto progress bar
    items := make([]any, len(ids))
    for i, id := range ids { items[i] = id }
    _, err := ctx.WithProgressBar(items, func(item any) error {
        return nil
    })

    _ = subject
    return err
}
```

## Rules

- Register via `WithCommands` in `bootstrap/app.go`; `make:command` auto-registers in `bootstrap/commands.go`.
- `Signature()` is the CLI name and must be unique across all commands.
- `Argument(index)` is 0-based positional; `ArgumentString(name)` is by declared name.
- Slice flags (`IntSliceFlag`) use `OptionIntSlice`; `StringSliceFlag` uses `OptionSlice`.
- `OptionFloat64Slice` reads `Float64SliceFlag` values.
- `Ask/Confirm/Choice/MultiSelect` are interactive; do not use in non-TTY (CI) environments.
- `CreateProgressBar` requires `.Start()` first, then `.Advance()`, then `.Finish()`.
- `WithProgressBar` handles lifecycle automatically.
- `Spinner.Action` must block; spinner stops when Action returns.
- `facades.Artisan().Call("cmd args --flag val")` passes the full string including args and flags.
