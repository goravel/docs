# Log

Structured logging with channels, custom drivers, and rich context (code, hint, owner, request, response, tags, user, with). Multiple channels stack. Driver constants live in the contract.

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/log/log.go` — `Log`, `Writer`, `Logger`, `Handler`, `Entry`, `Data`, driver constants
- `contracts/log/level.go` — `Level` constants

## Imports

```go
import (
    "context"

    "github.com/goravel/framework/contracts/log"

    "yourmodule/app/facades"
)
```

## Methods

### `facades.Log()` returns `log.Log` (extends `Writer`)

| Method | Signature | Notes |
|---|---|---|
| Channel | `(name string) Log` | Switch to a single named channel. |
| Stack | `(channels []string) Log` | Fan out to multiple channels in one call. |
| WithContext | `(ctx context.Context) Log` | Attach context (often `ctx`). |

All `Writer` methods below also live on `facades.Log()` directly.

### `log.Writer`

| Group | Methods (signature-only) |
|---|---|
| Levels | `Debug(args ...any)`, `Info`, `Warning`, `Error`, `Fatal`, `Panic` (+ `*f` printf variants for each) |
| Context (chainable, returns `Writer`) | `Code(code string)`, `Hint(hint string)`, `In(domain string)`, `Owner(owner any)`, `Tags(tags ...string)`, `User(user any)`, `With(map[string]any)`, `WithTrace()` |
| HTTP attach | `Request(req http.ContextRequest)`, `Response(res http.ContextResponse)` |

### Driver constants

```go
log.DriverStack    // "stack"   - fan out to multiple channels
log.DriverSingle   // "single"  - one file, single line
log.DriverDaily    // "daily"   - rotate by day
log.DriverOtel     // "otel"    - OpenTelemetry exporter
log.DriverCustom   // "custom"  - user-supplied Logger
```

Deprecated aliases (will be removed): `StackDriver`, `SingleDriver`, `DailyDriver`, `CustomDriver` — use the `Driver*` forms.

### Custom driver contracts

```go
type Logger interface {
    Handle(channel string) (Handler, error)            // returns the Handler for the configured channel path
}
type Handler interface {
    Enabled(log.Level) bool
    Handle(log.Entry) error
}
```

`log.Hook` is **deprecated** — implement `Handler` instead.

### `log.Entry` (read-only inside Handler)

`Code() string`, `Context() context.Context`, `Data() Data`, `Domain() string`, `Hint() string`, `Level() Level`, `Message() string`, `Owner() any`, `Request() map[string]any`, `Response() map[string]any`, `Tags() []string`, `Time() time.Time`, `Trace() map[string]any`, `User() any`, `With() map[string]any`.

## Config

User-owned: `config/logging.go`. Read directly for current channels.

Keys this facade reads:

- `logging.default` (string) — default channel name
- `logging.channels.<name>.driver` (string) — `log.DriverStack`, `DriverSingle`, `DriverDaily`, `DriverOtel`, `DriverCustom`
- `logging.channels.<name>.path` (string) — file path for `single`/`daily`
- `logging.channels.<name>.level` (string) — minimum level (`debug`, `info`, `warning`, `error`)
- `logging.channels.<name>.channels` ([]string) — for `stack` driver, fan-out list
- `logging.channels.<name>.via` (function) — for `custom` driver, the `func() (log.Logger, error)` factory
- `logging.channels.<name>.days` (int) — for `daily`, retention

Greenfield default: `config/logging.go` from goravel-scaffold URL declared in `AGENTS.md`.

## Patterns & gotchas

- **Context-builder methods chain and return `Writer`** — the level call is terminal: `facades.Log().With(map[string]any{"user_id": id}).Tags("auth", "login").Info("logged in")`.
- **`With(map[string]any)`**, NOT `With(key, value)`. Pass a map literal even for one key: `facades.Log().With(map[string]any{"k": v}).Info(...)`.
- **`Channel(name)` overrides default** — handy for routing: `facades.Log().Channel("audit").Info(...)`.
- **`Stack([]string)` fans out**: writes to ALL listed channels in one call. Useful for "info → file + slack".
- **Custom driver Handle signature**: `Handle(channel string) (Handler, error)` returns the per-channel Handler. Don't confuse with the deprecated `Hook` shape.
- **Register custom drivers in `bootstrap/app.go` `WithCallback`** via the `via` config key. Custom drivers need a `func() (log.Logger, error)` factory.
- **Request/Response context**: `facades.Log().Request(ctx.Request()).Error("payment failed")` captures method, path, headers, body in the entry's `Request()` map. Keep `WithTrace()` enabled for stack traces on errors.
- **WithContext propagation**: `facades.Log().WithContext(ctx)` — important if downstream Handlers respect ctx (otel exporter, async sinks).
- **Levels**: `Debug` < `Info` < `Warning` < `Error` < `Fatal` (terminates) < `Panic` (panics). Configure minimum level per channel.
- **`*f` variants** mirror printf: `Errorf("query %s failed: %w", sql, err)`. Don't pre-`Sprintf` and pass to `Error`; the `f` form is cheaper when the level is filtered out.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `facades.Log().With("user_id", id)` | `facades.Log().With(map[string]any{"user_id": id})` | `With` takes a map. |
| `facades.Log().Request(req *http.Request)` | `facades.Log().Request(ctx.Request())` | Request takes `http.ContextRequest`, not raw `*http.Request`. |
| `func (h *MyHook) Levels() []log.Level / Fire(e log.Entry) error` | `func (l *MyLogger) Handle(ch string) (log.Handler, error)` plus `Handler.Enabled` and `Handle` | `Hook` is deprecated; implement `Logger` + `Handler`. |
| `facades.Log().Stack("a", "b")` | `facades.Log().Stack([]string{"a", "b"})` | Stack takes a slice. |
| Compute and pre-format then `Info(s)` for hot path | `Infof("..%s..", v)` | Printf form is lazy when level is filtered. |
| Register custom logger at runtime | Configure via `via` key in `config/logging.go` (factory) | Channels are constructed at boot. |

## Worked example: structured log + custom audit channel

```go
// config/logging.go (excerpt) — register channels
// "audit": map[string]any{
//     "driver":  log.DriverDaily,
//     "path":    "storage/logs/audit.log",
//     "days":    30,
//     "level":   "info",
// },

// app/http/controllers/auth_controller.go
package controllers

import (
    "github.com/goravel/framework/contracts/http"

    "yourmodule/app/facades"
)

func (c *AuthController) Login(ctx http.Context) http.Response {
    var creds struct{ Email, Password string }
    if err := ctx.Request().Bind(&creds); err != nil {
        return ctx.Response().Json(http.StatusBadRequest, http.Json{"error": err.Error()})
    }

    // Default channel + structured fields
    facades.Log().
        WithContext(ctx).
        With(map[string]any{"email": creds.Email}).
        Tags("auth", "login.attempt").
        Info("login attempt")

    // ... auth ...

    // Audit channel: separate retention + format
    facades.Log().
        Channel("audit").
        With(map[string]any{"user_id": 42, "ip": ctx.Request().Ip()}).
        Info("user logged in")

    return ctx.Response().Success().Json(http.Json{"ok": true})
}
```

## Rules

- `With` takes `map[string]any`, not `(key, value)`.
- `Request`/`Response` take framework facades (`http.ContextRequest`/`http.ContextResponse`), not stdlib types.
- Custom drivers implement `Logger` (returns Handler) — `Hook` is deprecated.
- Use the constants `log.DriverStack`, `DriverSingle`, `DriverDaily`, `DriverOtel`, `DriverCustom` (deprecated aliases drop in v1.18).
- For request-scoped logs in handlers: `facades.Log().WithContext(ctx).Request(ctx.Request())...`.
- Prefer `*f` variants in hot paths — they skip Sprintf when the level is filtered.
- Levels chain is the LAST call in the builder; everything else returns `Writer` for chaining.
