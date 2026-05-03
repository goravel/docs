# Schedule

Cron-style task scheduling. Two task types: `Call(func())` for inline closures, `Command("artisan ...")` for Artisan commands. Frequency methods chain (`.Daily().At("03:00")`). Single-server execution + overlap prevention available.

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/schedule/schedule.go` — `Schedule`
- `contracts/schedule/event.go` — `Event` (full frequency + modifier API)

## Imports

```go
import (
    "github.com/goravel/framework/contracts/schedule"

    "yourmodule/app/facades"
)
```

## Methods

### `facades.Schedule()` returns `schedule.Schedule`

| Method | Signature | Notes |
|---|---|---|
| Call | `(callback func()) Event` | Schedule an inline closure. |
| Command | `(command string) Event` | Schedule an Artisan command (e.g. `"queue:retry --queue=default"`). |
| Register | `(events []Event)` | Wire scheduled events. Call inside `WithCallback`. |
| Events | `() []Event` | Inspect registered events. |
| Run | `()` | Start the scheduler loop (typically called in main / artisan command). |
| Shutdown | `(ctx ...context.Context) error` | Graceful stop. |

### `schedule.Event` (chainable — frequency method then modifiers)

| Group | Methods (signature-only) |
|---|---|
| Cron | `Cron(expression string) Event` (e.g. `"0 3 * * *"`) |
| Sub-minute | `EverySecond()`, `EveryTwoSeconds()`, `EveryFiveSeconds()`, `EveryTenSeconds()`, `EveryFifteenSeconds()`, `EveryTwentySeconds()`, `EveryThirtySeconds()` |
| Minute | `EveryMinute()`, `EveryTwoMinutes()`, `EveryThreeMinutes()`, `EveryFourMinutes()`, `EveryFiveMinutes()`, `EveryTenMinutes()`, `EveryFifteenMinutes()`, `EveryThirtyMinutes()` |
| Hour | `Hourly()`, `HourlyAt([]string) Event` (offsets in hour, e.g. `["00","30"]`), `EveryTwoHours()`, `EveryThreeHours()`, `EveryFourHours()`, `EverySixHours()` |
| Day | `Daily()`, `DailyAt(time string) Event` (e.g. `"03:00"`), `TwiceDaily(hours ...int) Event` (default 1, 13), `Weekly()`, `Monthly()`, `Quarterly()`, `Yearly()` |
| Day-of-week | `Weekdays()`, `Weekends()`, `Mondays()` … `Sundays()`, `Days(days ...time.Weekday) Event` |
| Time-of-day modifier | `At(time string) Event` (HH:MM, used after `Daily()` etc.) |
| Concurrency | `OnOneServer() Event` (multi-instance dedupe), `SkipIfStillRunning() Event`, `DelayIfStillRunning() Event` |
| Identity | `Name(name string) Event` |
| Inspectors | `GetCron() string`, `GetCommand() string`, `GetCallback() func()`, `GetName() string`, `GetSkipIfStillRunning() bool`, `GetDelayIfStillRunning() bool`, `IsOnOneServer() bool` |

## Config

User-owned: scheduling is wired in code via `app/console/kernel.go` (or wherever your project conventions place it). Registration runs in `bootstrap/app.go` `WithCallback`.

For `OnOneServer()` to work, configure a shared cache (`config/cache.go` — typically redis) so multiple instances coordinate via cache locks.

## Patterns & gotchas

- **Frequency method first, modifiers chain after**: `Daily().At("03:00").OnOneServer()`. Some frequencies have built-in time (e.g. `DailyAt("03:00")` is shorthand for `Daily().At("03:00")`).
- **`Cron(expr)` overrides everything else** — pass a standard 5-field cron expression for full control. Use frequency helpers when they fit; cron when they don't.
- **`Call(func())` runs the closure inline in the scheduler process** — keep it fast. For heavy work, dispatch a queue job from inside the closure.
- **`Command("artisan x")` runs an Artisan command** — string includes args (`"queue:retry --queue=foo"`).
- **`OnOneServer()` requires a shared cache**: backed by a cache lock. Multiple scheduler instances coordinate so only one runs the event per tick. Without cache, all instances fire.
- **`SkipIfStillRunning()` vs `DelayIfStillRunning()`**: skip = miss this tick if previous still running. Delay = run later when previous finishes (queue style).
- **`Name(name)` matters for OnOneServer + Skip/Delay**: the lock key is derived from the name. Without an explicit name, the framework derives one from the cron+command, which may collide.
- **Register inside `WithCallback`** in `bootstrap/app.go` via `facades.Schedule().Register([]schedule.Event{...})`.
- **`Run()` blocks** — start in a dedicated goroutine or via an artisan command (`./artisan schedule:run`). Don't call from a request handler.
- **`HourlyAt([]string)` takes minute offsets** as strings, e.g. `["00", "15", "30", "45"]` for every quarter-hour.
- **Timezone**: events fire in `app.timezone` (config). Cron expressions don't carry timezone — they're interpreted in the configured TZ.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `Daily().Cron("0 3 * * *")` | `Cron("0 3 * * *")` (alone) OR `Daily().At("03:00")` | Cron overrides frequency helpers; pick one. |
| `HourlyAt("00")` | `HourlyAt([]string{"00"})` | Takes a slice. |
| `DailyAt(3, 0)` | `DailyAt("03:00")` | Takes a string. |
| `Days(time.Monday, time.Wednesday)` | `Days(time.Monday, time.Wednesday)` is fine — variadic | Reminder of the variadic. |
| `OnOneServer()` without configured cache | Configure shared cache (redis) first | Lock backend required. |
| Heavy work inside `Call(func() { ... })` | Dispatch a queue job from the closure | Scheduler runs tasks inline; don't block. |
| Register events at runtime | inside `bootstrap/app.go` `WithCallback` | Boot order. |
| `Run()` in a request handler | start in a dedicated process / artisan command | Run blocks indefinitely. |

## Worked example: register + start

```go
// app/console/schedule.go
package console

import (
    "github.com/goravel/framework/contracts/schedule"

    "yourmodule/app/facades"
)

func Schedule() []schedule.Event {
    return []schedule.Event{
        // Daily 3am cleanup
        facades.Schedule().
            Call(func() {
                facades.Log().Info("running daily cleanup")
                // dispatch a queue job here for heavier work
            }).
            DailyAt("03:00").
            Name("cleanup.daily").
            OnOneServer(),

        // Every 5 minutes via Artisan
        facades.Schedule().
            Command("queue:retry --queue=default").
            EveryFiveMinutes().
            Name("queue.retry"),

        // Quarter-hour custom
        facades.Schedule().
            Call(func() { /* sync external data */ }).
            HourlyAt([]string{"00", "15", "30", "45"}).
            Name("sync.external").
            SkipIfStillRunning(),
    }
}

// bootstrap/app.go (excerpt)
// app.WithCallback(func() {
//     facades.Schedule().Register(console.Schedule())
// })

// Run via artisan: ./artisan schedule:run
```

## Rules

- Frequency call first, modifiers chain after. Cron expression is exclusive (don't combine with frequency helpers).
- `OnOneServer()` requires a shared cache backend (redis). Configure cache first.
- Always `Name(...)` events you flag with `OnOneServer`/`SkipIfStillRunning`/`DelayIfStillRunning` — the name is the lock key.
- Register events in `bootstrap/app.go` `WithCallback` via `facades.Schedule().Register(...)`.
- `HourlyAt` takes `[]string`; `DailyAt` takes `string`.
- Keep `Call(func)` closures fast — dispatch heavy work to the queue facade.
- `Run()` blocks — start in a dedicated process via `./artisan schedule:run`, not from a request handler.
- Events fire in `app.timezone` (`config/app.go`); cron expressions are interpreted in that timezone.
