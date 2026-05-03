# Queue

Background jobs. Each job implements `Signature() + Handle(args ...any) error`. Dispatch via `facades.Queue().Job(...).Dispatch()` (async) or `DispatchSync()`. Drivers: `sync` (in-process), `database`, `redis`. Failed jobs land in a Failer store; chain jobs run sequentially.

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/queue/queue.go` — `Queue`, `Worker`, `Args`, `Arg`
- `contracts/queue/job.go` — `Job`, `PendingJob`, `ReservedJob`, `JobStorer`, `ChainJob`, `JobWithShouldRetry`
- `contracts/queue/driver.go` — `Driver`
- `contracts/queue/task.go` — `Task`
- `contracts/queue/failer.go` — `Failer`

## Imports

```go
import (
    "time"

    "github.com/goravel/framework/contracts/queue"

    "yourmodule/app/facades"
)
```

## Methods

### `facades.Queue()` returns `queue.Queue`

| Method | Signature | Notes |
|---|---|---|
| Job | `(job Job, args ...[]Arg) PendingJob` | Build a pending job (call `.Dispatch()` or `.DispatchSync()` to send). |
| Chain | `(jobs []ChainJob) PendingJob` | Build a chain (jobs run sequentially; later jobs see earlier args). |
| Register | `(jobs []Job)` | Register job types so workers can resolve them by signature. |
| Worker | `(payloads ...Args) Worker` | Build a worker for a specific connection/queue/concurrency. |
| Connection | `(name string) (Driver, error)` | Resolve a configured driver. |
| Failer | `() Failer` | Get failed-job store. |
| GetJob | `(signature string) (Job, error)` | Look up registered job by signature. |
| GetJobs | `() []Job` | List registered jobs. |
| JobStorer | `() JobStorer` | Underlying registry. |

### `queue.PendingJob` (chained — finalised by Dispatch / DispatchSync)

| Method | Signature | Notes |
|---|---|---|
| OnConnection | `(name string) PendingJob` | Override connection for this dispatch. |
| OnQueue | `(name string) PendingJob` | Override queue name. |
| Delay | `(t time.Time) PendingJob` | Schedule for absolute time. (Pass `time.Now().Add(...)` for relative delay.) |
| Dispatch | `() error` | Send to driver (async — returns immediately). |
| DispatchSync | `() error` | Run inline, blocking. |

### `queue.Worker`

| Method | Signature | Notes |
|---|---|---|
| Run | `() error` | Start consuming. Blocks. |
| Shutdown | `() error` | Graceful stop. |

### `queue.Job` (the contract you implement)

```go
type Job interface {
    Signature() string                    // unique identifier — pin this; renames break in-flight jobs
    Handle(args ...any) error             // execute; return non-nil to mark failed
}
```

### `queue.JobWithShouldRetry` (optional add-on)

```go
type JobWithShouldRetry interface {
    ShouldRetry(err error, attempt int) (retryable bool, delay time.Duration)
}
```

### Argument types

```go
type Arg struct {
    Value any    `json:"value"`
    Type  string `json:"type"`   // "string" | "int" | "uint" | "float64" | "bool" | "[]string" | etc.
}
type Args struct {
    Connection string  // optional
    Queue      string
    Concurrent int
    Tries      int
}
type ChainJob struct {
    Delay time.Time
    Job   Job
    Args  []Arg
}
```

## Config

User-owned: `config/queue.go`. Read directly for current driver definitions.

Keys this facade reads:

- `queue.default` (string) — default connection
- `queue.connections.<name>.driver` (string) — `"sync"`, `"database"`, `"redis"`, custom
- `queue.connections.<name>.queue` (string) — default queue name
- `queue.connections.<name>.connection` (string) — DB or redis connection name
- `queue.connections.<name>.table` (string) — for `database` driver
- `queue.connections.<name>.tries` (int) — default max attempts
- `queue.failed.driver`, `queue.failed.database`, `queue.failed.table` — failed-job store

Greenfield default: `config/queue.go` from goravel-scaffold URL declared in `AGENTS.md`.

## Patterns & gotchas

- **Two-step dispatch**: `facades.Queue().Job(&MyJob{}, []queue.Arg{...}).Dispatch()`. The args slice is variadic on `Job(...)` — pass `[]queue.Arg{...}` for one job's args, or omit for none.
- **Each `Arg` is `{Value, Type}`** — the `Type` field tells the driver how to deserialize on the worker side. Common values: `"string"`, `"int"`, `"int64"`, `"uint"`, `"bool"`, `"float64"`, `"[]string"`, `"map[string]any"`. For struct args, JSON-marshal yourself and pass as `"string"` with the JSON.
- **`Handle(args ...any) error` receives values matching the dispatched Args order**. Type-assert at the top of Handle: `userID, _ := args[0].(uint)`. Wrong order or type → silent zero values.
- **`Signature()` is the lookup key** — once jobs are in flight (database/redis driver), renaming a Signature orphans pending payloads. Pick stable names; never rename without a migration.
- **Register jobs in `bootstrap/app.go` `WithCallback`** via `facades.Queue().Register([]queue.Job{...})`. Workers can't resolve signatures otherwise — pending jobs fail with "unknown signature".
- **`Delay(t time.Time)` is absolute**: pass `time.Now().Add(5*time.Minute)` for a 5-minute delay. Passing a `time.Duration` directly is a type error.
- **`OnConnection` / `OnQueue` overrides per dispatch** — useful for routing high-priority work to a fast queue.
- **`Dispatch()` is async, `DispatchSync()` runs inline**. Use Sync in tests or when you need the result immediately.
- **`Chain([]ChainJob{...}).Dispatch()`**: jobs run sequentially; if one fails, the rest are skipped (depending on driver — verify for production-critical chains).
- **Retries**: configure default `tries` in `config/queue.go`. For per-job custom retry logic implement `JobWithShouldRetry` — return `(true, backoff)` to retry, `(false, _)` to send to Failer.
- **Failed jobs**: `facades.Queue().Failer()` returns the store; inspect / reprocess via its methods.
- **Worker startup**: in `main.go` or via an artisan command, `facades.Queue().Worker(queue.Args{Connection: "redis", Queue: "default", Concurrent: 4}).Run()`.
- **Sync driver in tests**: set `queue.default = "sync"` to make Dispatch run inline — easier assertions.
- **Machinery driver was removed** — do not reference `"machinery"` as a driver name.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `facades.Queue().Job(&j).OnQueue("x").Dispatch()` (no args) | `facades.Queue().Job(&j).OnQueue("x").Dispatch()` is fine, but pass `[]queue.Arg{}` if your Handle expects them | Args is variadic. |
| `Delay(5 * time.Minute)` | `Delay(time.Now().Add(5 * time.Minute))` | Delay takes absolute `time.Time`. |
| `func (j *MyJob) Handle(userID uint) error` | `func (j *MyJob) Handle(args ...any) error` then `userID := args[0].(uint)` | Job interface requires variadic `any`. |
| Register jobs at startup outside WithCallback | inside `app.WithCallback(func() { facades.Queue().Register([]queue.Job{&j}) })` | Boot order matters. |
| Renaming `Signature()` | Keep stable; add a new job + deprecate the old | Pending payloads keyed by old signature orphan. |
| `queue.Jobs{}` (deprecated) | `queue.ChainJob{}` | `Jobs` is a deprecated alias. |
| `OnConnection("machinery")` | `OnConnection("redis")` or `database` or `sync` | Machinery driver removed. |

## Worked example: job + dispatch + chain + worker

```go
// app/jobs/welcome_email.go
package jobs

import (
    "fmt"

    "yourmodule/app/facades"
)

type WelcomeEmail struct{}

func (j *WelcomeEmail) Signature() string { return "jobs.welcome_email" }

func (j *WelcomeEmail) Handle(args ...any) error {
    userID, ok := args[0].(uint)
    if !ok {
        return fmt.Errorf("WelcomeEmail: expected uint user id, got %T", args[0])
    }
    facades.Log().Info("sending welcome email", map[string]any{"user_id": userID})
    // ... call mailer ...
    return nil
}

// bootstrap/app.go (excerpt)
// app.WithCallback(func() {
//     facades.Queue().Register([]queue.Job{
//         &jobs.WelcomeEmail{},
//         &jobs.IndexProfile{},
//     })
// })

// app/services/signup.go (dispatch)
package services

import (
    "time"

    "github.com/goravel/framework/contracts/queue"

    "yourmodule/app/facades"
    "yourmodule/app/jobs"
)

func OnSignup(userID uint) error {
    return facades.Queue().
        Job(&jobs.WelcomeEmail{}, []queue.Arg{{Type: "uint", Value: userID}}).
        OnQueue("emails").
        Delay(time.Now().Add(5 * time.Second)).
        Dispatch()
}

func OnboardChain(userID uint) error {
    arg := []queue.Arg{{Type: "uint", Value: userID}}
    return facades.Queue().Chain([]queue.ChainJob{
        {Job: &jobs.WelcomeEmail{}, Args: arg},
        {Job: &jobs.IndexProfile{}, Args: arg},
    }).Dispatch()
}

// main.go (worker startup — typically wrapped in an artisan command)
// facades.Queue().Worker(queue.Args{Connection: "redis", Queue: "emails", Concurrent: 4}).Run()
```

## Rules

- Job interface: `Signature() string` + `Handle(args ...any) error`. Type-assert each arg in Handle.
- `Signature()` is a stable identifier — never rename in-flight.
- `Delay(t)` takes absolute `time.Time`. Use `time.Now().Add(d)` for relative delays.
- Register jobs in `bootstrap/app.go` `WithCallback`. Workers can't resolve unregistered signatures.
- Args are `[]queue.Arg`, each `{Type, Value}` — `Type` drives deserialization. JSON-marshal complex values.
- For per-job retry policy implement `JobWithShouldRetry` returning `(retryable bool, delay time.Duration)`.
- Use `DispatchSync()` in tests for inline execution + easy assertions.
- Drivers: `sync`, `database`, `redis`. `machinery` is removed.
