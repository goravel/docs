# Goravel Artisan Console & Task Scheduling

## Command Structure

```go
package commands

import (
    "github.com/goravel/framework/contracts/console"
    "github.com/goravel/framework/contracts/console/command"
)

type SendEmails struct{}

func (r *SendEmails) Signature() string {
    return "send:emails"
}

func (r *SendEmails) Description() string {
    return "Send emails"
}

func (r *SendEmails) Extend() command.Extend {
    return command.Extend{
        Category: "mail",
    }
}

func (r *SendEmails) Handle(ctx console.Context) error {
    return nil
}
```

Generate:

```shell
./artisan make:command SendEmails
./artisan make:command user/SendEmails
```

Register in `bootstrap/app.go`:

```go
WithCommands(Commands)
```

---

## Arguments (v1.17)

```go
func (r *SendEmails) Extend() command.Extend {
    return command.Extend{
        Arguments: []command.Argument{
            &command.ArgumentString{
                Name:     "subject",
                Usage:    "subject of email",
                Required: true,
            },
            &command.ArgumentStringSlice{
                Name:  "emails",
                Usage: "target emails",
                Min:   1,
                Max:   -1,   // -1 = unlimited
            },
        },
    }
}

func (r *SendEmails) Handle(ctx console.Context) error {
    subject := ctx.ArgumentString("subject")
    emails  := ctx.ArgumentStringSlice("emails")

    // Or by index
    first := ctx.Argument(0)
    all   := ctx.Arguments()

    return nil
}
```

Supported argument types: `ArgumentString`, `ArgumentInt`, `ArgumentInt64`, `ArgumentFloat64`, `ArgumentUint`, `ArgumentTimestamp`, `ArgumentStringSlice`, `ArgumentIntSlice`, `ArgumentInt64Slice`, `ArgumentFloat64Slice`, `ArgumentUintSlice`, `ArgumentTimestampSlice`, and more.

---

## Options (Flags)

```go
func (r *ListCommand) Extend() command.Extend {
    return command.Extend{
        Flags: []command.Flag{
            &command.StringFlag{
                Name:    "lang",
                Value:   "default",
                Aliases: []string{"l"},
                Usage:   "language for the greeting",
            },
            &command.BoolFlag{
                Name:  "verbose",
                Usage: "enable verbose output",
            },
        },
    }
}

func (r *ListCommand) Handle(ctx console.Context) error {
    lang    := ctx.Option("lang")
    verbose := ctx.OptionBool("verbose")
    return nil
}
```

Usage:

```shell
./artisan emails --lang Chinese
./artisan emails -l Chinese
```

Other flag types: `StringSliceFlag`, `BoolFlag`, `Float64Flag`, `Float64SliceFlag`, `IntFlag`, `IntSliceFlag`, `Int64Flag`, `Int64SliceFlag`.

---

## Interactive Input

```go
// Ask (text input)
email, err := ctx.Ask("What is your email address?")
name, err := ctx.Ask("What is your name?", console.AskOption{
    Default:     "Goravel",
    Placeholder: "Enter name",
    Limit:       100,
    Validate:    func(s string) error { return nil },
})

// Secret (hidden input)
password, err := ctx.Secret("What is the password?", console.SecretOption{
    Validate: func(s string) error {
        if len(s) < 8 {
            return errors.New("password must be at least 8 characters")
        }
        return nil
    },
})

// Confirm
if ctx.Confirm("Do you wish to continue?") {
    // ...
}
if ctx.Confirm("Do you wish to continue?", console.ConfirmOption{
    Default: true, Affirmative: "Yes", Negative: "No",
}) {
    // ...
}

// Single select
color, err := ctx.Choice("Favorite language?", []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP", Selected: true},
})

// Multi-select
colors, err := ctx.MultiSelect("Favorite languages?", []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP"},
}, console.MultiSelectOption{
    Default:    []string{"go"},
    Filterable: true,
    Limit:      3,
})
```

---

## Output

```go
ctx.Info("Info message")
ctx.Comment("Comment message")
ctx.Warning("Warning message")
ctx.Error("Error message")
ctx.Line("Line message")

ctx.Green("green text")
ctx.Greenln("green line")
ctx.Red("red text")
ctx.Yellow("yellow text")
ctx.Black("black text")

ctx.NewLine()
ctx.NewLine(2)
ctx.Divider()
ctx.Divider("=>")
```

### Progress Bars

```go
items := []any{"item1", "item2", "item3"}
_, err := ctx.WithProgressBar(items, func(item any) error {
    // process item
    return nil
})

// Manual progress bar
bar := ctx.CreateProgressBar(len(items))
bar.Start()
for _, item := range items {
    // process
    bar.Advance()
    time.Sleep(50 * time.Millisecond)
}
bar.Finish()
```

### Spinner

```go
err := ctx.Spinner("Loading...", console.SpinnerOption{
    Action: func() error {
        time.Sleep(2 * time.Second)
        return nil
    },
})
```

---

## Call Artisan Commands Programmatically

```go
facades.Artisan().Call("send:emails")
facades.Artisan().Call("send:emails --lang Chinese name")
```

---

## Disable Colors

```shell
./artisan list --no-ansi
```

---

## Task Scheduling

Define in `WithSchedule` in `bootstrap/app.go`:

```go
WithSchedule(func() []schedule.Event {
    return []schedule.Event{
        // Closure task
        facades.Schedule().Call(func() {
            facades.Orm().Query().Where("1 = 1").Delete(&models.User{})
        }).Daily(),

        // Artisan command task
        facades.Schedule().Command("send:emails name").EveryMinute(),

        // Named closure for OnOneServer
        facades.Schedule().Call(func() {
            fmt.Println("goravel")
        }).Daily().OnOneServer().Name("goravel"),
    }
})
```

### Frequency Methods

| Method | Frequency |
|--------|-----------|
| `.Cron("* * * * *")` | Custom cron (minutes) |
| `.Cron("* * * * * *")` | Custom cron (seconds) |
| `.EverySecond()` | Every second |
| `.EveryTwoSeconds()` | Every 2 seconds |
| `.EveryFiveSeconds()` | Every 5 seconds |
| `.EveryTenSeconds()` | Every 10 seconds |
| `.EveryFifteenSeconds()` | Every 15 seconds |
| `.EveryThirtySeconds()` | Every 30 seconds |
| `.EveryMinute()` | Every minute |
| `.EveryTwoMinutes()` | Every 2 minutes |
| `.EveryFiveMinutes()` | Every 5 minutes |
| `.EveryTenMinutes()` | Every 10 minutes |
| `.EveryFifteenMinutes()` | Every 15 minutes |
| `.EveryThirtyMinutes()` | Every 30 minutes |
| `.Hourly()` | Every hour |
| `.HourlyAt(17)` | Every hour at :17 |
| `.EveryTwoHours()` | Every 2 hours |
| `.EverySixHours()` | Every 6 hours |
| `.Daily()` | Daily at midnight |
| `.DailyAt("13:00")` | Daily at 13:00 |
| `.Days(1, 3, 5)` | Mon, Wed, Fri |
| `.Weekdays()` | Mon–Fri |
| `.Weekends()` | Sat–Sun |
| `.Weekly()` | Weekly |
| `.Monthly()` | Monthly |
| `.Quarterly()` | Quarterly |
| `.Yearly()` | Yearly |

### Overlap Prevention

```go
facades.Schedule().Command("send:emails name").EveryMinute().SkipIfStillRunning()
facades.Schedule().Command("send:emails name").EveryMinute().DelayIfStillRunning()
```

### Single Server Execution

Requires memcached, dynamodb, or redis as default cache driver:

```go
facades.Schedule().Command("report:generate").Daily().OnOneServer()

// Named closure for OnOneServer:
facades.Schedule().Call(func() {}).Daily().OnOneServer().Name("unique-name")
```

### Run Scheduler Manually

```shell
./artisan schedule:run
./artisan schedule:list
```
