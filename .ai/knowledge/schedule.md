# Schedule Facade

## Core Imports

```go
import (
    "github.com/goravel/framework/contracts/schedule"

    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/schedule/event.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/schedule/schedule.go`

## Available Methods

**facades.Schedule():**

- `Call(func())` Event - schedule a closure
- `Command(signature string)` Event - schedule an Artisan command by signature

**Event frequency (chainable):**

- `.Cron("* * * * *")` - 5-field cron (minutes); `.Cron("* * * * * *")` - 6-field (seconds)
- `.EverySecond()` / `.EveryMinute()` / `.Hourly()` / `.Daily()` / `.Weekly()` / `.Monthly()` / `.Quarterly()` / `.Yearly()`
- `.DailyAt("13:00")` - specific time daily
- `.HourlyAt(17)` - at 17 minutes past each hour
- `.Days(1, 3, 5)` - specific weekdays (1=Mon, 7=Sun)
- `.Weekdays()` / `.Weekends()` / `.Mondays()` ... `.Sundays()`

**Overlap control:**

- `.SkipIfStillRunning()` - skip if previous execution is still running
- `.DelayIfStillRunning()` - queue until previous execution finishes

**Distributed:**

- `.OnOneServer()` - run on only one server (requires non-memory cache driver)
- `.Name("name")` - required for closure tasks with `.OnOneServer()`

## Implementation Example

```go
// bootstrap/app.go
package bootstrap

import (
    contractsfoundation "github.com/goravel/framework/contracts/foundation"
    "github.com/goravel/framework/contracts/schedule"
    "github.com/goravel/framework/foundation"

    "yourmodule/app/facades"
    "yourmodule/app/models"
    "yourmodule/bootstrap/config"
)

func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithConfig(config.Boot).
        WithSchedule(func() []schedule.Event {
            return []schedule.Event{
                // Run closure every minute
                facades.Schedule().Call(func() {
                    facades.Log().Info("heartbeat")
                }).EveryMinute().Name("heartbeat"),

                // Run closure daily at 2am, single server only
                facades.Schedule().Call(func() {
                    facades.Orm().Query().
                        Where("1 = 1").
                        Delete(&models.TempFile{})
                }).DailyAt("02:00").OnOneServer().Name("cleanup-temp"),

                // Run Artisan command every 5 minutes
                facades.Schedule().Command("send:emails --lang en").
                    EveryFiveMinutes().
                    SkipIfStillRunning(),

                // Custom cron expression
                facades.Schedule().Command("report:generate").
                    Cron("0 9 * * 1").  // every Monday at 9:00
                    OnOneServer(),

                // Weekdays only
                facades.Schedule().Call(func() {
                    // business hours sync
                }).Weekdays().HourlyAt(0),
            }
        }).
        Create()
}
```

## Rules

- Define schedules via `WithSchedule` in `bootstrap/app.go`; the scheduler runs automatically on `Start()`.
- `Command("signature")` runs an Artisan command; include arguments/flags in the string.
- `OnOneServer()` requires a distributed cache driver (`redis`, `memcached`, `dynamodb`) - **not** `memory`.
- Closure tasks must have `.Name("unique-name")` when using `.OnOneServer()`.
- `.SkipIfStillRunning()` silently skips; `.DelayIfStillRunning()` waits for the running task to complete.
- `Cron("* * * * *")` is minute-resolution; `Cron("* * * * * *")` is second-resolution (6 fields).
- When `app.debug = true`, all schedule logs are printed; otherwise only `error` level.
- Run the scheduler manually: `./artisan schedule:run`.
- View all scheduled tasks: `./artisan schedule:list`.
- `Days(1, 3, 5)` - weekday integers: 0=Sunday, 1=Monday, ..., 6=Saturday.
