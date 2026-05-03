# Session

Per-request session attached to `http.Context` via the session middleware. Mutating methods chain (return `Session`). Drivers: `file`, `cookie`, `database`, `redis`, custom.

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/session/session.go` — `Session`
- `contracts/session/manager.go` — `Manager`
- `contracts/session/driver.go` — `Driver`

## Imports

```go
import (
    "github.com/goravel/framework/contracts/http"
    "github.com/goravel/framework/contracts/session"
)
```

## Methods

### `ctx.Request().Session()` returns `session.Session`

(Requires session middleware — registered via `WithMiddleware` in `bootstrap/app.go`.)

| Group | Methods (signature-only) |
|---|---|
| Read | `All() map[string]any`, `Get(key string, def ...any) any`, `Only(keys []string) map[string]any`, `Has(key) bool`, `Exists(key) bool`, `Missing(key) bool`, `Pull(key string, def ...any) any` (read+remove) |
| Write (chainable, returns `Session`) | `Put(key string, value any) Session`, `Forget(keys ...string) Session`, `Flush() Session` (clear all) |
| Flash data (one-request lifetime, chainable) | `Flash(key string, value any) Session`, `Now(key string, value any) Session` (immediate use), `Reflash() Session` (extend all flash by one request), `Keep(keys ...string) Session` (extend specific) |
| Lifecycle | `Start() bool`, `Save() error`, `Invalidate() error` (clear + new id), `Regenerate(destroy ...bool) error` (new id, optionally destroy old) |
| Identity | `GetID() string`, `SetID(id string) Session`, `GetName() string`, `SetName(name string) Session`, `Token() string` (CSRF token) |
| Helpers | `Remove(key string) any` (returns removed value), `SetDriver(driver Driver) Session` |

### Access pattern

```go
sess := ctx.Request().Session()
sess.Put("user_id", 42).Flash("notice", "Welcome").Save()
```

`Save()` is required to persist for some drivers. Many drivers auto-save at end of request, but explicit `Save()` is the safe pattern when writing post-mutation.

## Config

User-owned: `config/session.go`. Read directly for current driver and lifetime.

Keys this facade reads:

- `session.default` (string) — driver name (`"file"`, `"cookie"`, `"database"`, `"redis"`)
- `session.lifetime` (int, minutes) — session TTL
- `session.expire_on_close` (bool) — invalidate on browser close
- `session.encrypt` (bool) — encrypt cookie value
- `session.cookie` (string) — cookie name
- `session.path`, `session.domain`, `session.secure`, `session.http_only`, `session.same_site` — cookie attrs
- `session.files` (string) — for `file` driver, storage path
- `session.connection` (string) — for `database`/`redis`, named connection
- `session.table` (string) — for `database`, table name

Greenfield default: `config/session.go` from goravel-scaffold URL declared in `AGENTS.md`.

## Patterns & gotchas

- **`Regenerate(destroy bool)`** returns `error` (not `bool` like Laravel). Call it on login to prevent session-fixation attacks. Pass `true` to also destroy old data.
- **All mutating methods return `Session`** — chain them: `sess.Put("k", v).Flash("notice", "x").Save()`. Treating them as void-returning is wrong.
- **Flash data lives ONE request**: `Flash(key, value)` — available in NEXT request only. `Now(key, value)` — available in CURRENT request immediately. `Reflash()` extends all flash by one more request; `Keep("a", "b")` extends only the listed keys.
- **`Forget(keys ...string)`** is variadic: `sess.Forget("a", "b", "c")`.
- **`Pull(key)` is atomic read + remove** — useful for one-shot tokens.
- **CSRF token**: `sess.Token()` — pair with the framework's CSRF middleware (auto-registered when session middleware is on).
- **Session middleware MUST be registered** — `WithMiddleware([]http.Middleware{httpmiddleware.StartSession()})` in `bootstrap/app.go`. Without it, `ctx.Request().Session()` panics or returns a no-op.
- **`HasSession()` on the request** — guard before access if a route may run with no session middleware.
- **`Save()` after mutations**: many drivers auto-save at request end, but explicit `Save()` is required if you mutate after the response is partially written.
- **Driver lock-in**: `cookie` driver stores all data in the cookie itself (size-limited, ~4KB). For larger payloads use `file`/`database`/`redis`.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `sess.Regenerate()` returning bool | `if err := sess.Regenerate(); err != nil { ... }` | Returns `error`, not `bool`. |
| `sess.Put("k", v); sess.Flash(...)` (two statements) | `sess.Put("k", v).Flash(...)` (chained) | Mutators return `Session`. |
| `sess.Forget([]string{"a", "b"})` | `sess.Forget("a", "b")` | Variadic, not slice. |
| `sess.Get("k")` (no nil-check) | `if v := sess.Get("k"); v != nil { ... }` or use `Has`/`Exists` first | Get may return nil for missing keys. |
| Mutating without `Save()` then expecting persistence cross-request | `sess.Put(...).Save()` (or rely on driver auto-save when sure) | Some drivers persist only on Save. |
| Use session without middleware | Register `StartSession()` middleware in `bootstrap/app.go` | No middleware = no session. |
| `sess.Flash("notice", v)` then read `sess.Get("notice")` SAME request | Use `sess.Now("notice", v)` for current-request, `Flash` for next-request | Flash is for the NEXT request. |

## Worked example: login flow with regeneration + flash notice

```go
package controllers

import (
    "github.com/goravel/framework/contracts/http"

    "yourmodule/app/facades"
)

type AuthController struct{}

func (c *AuthController) Login(ctx http.Context) http.Response {
    var creds struct{ Email, Password string }
    if err := ctx.Request().Bind(&creds); err != nil {
        return ctx.Response().Json(http.StatusBadRequest, http.Json{"error": err.Error()})
    }

    // ... verify creds, get user ...
    var userID uint = 42

    sess := ctx.Request().Session()

    // Always regenerate on login to prevent fixation.
    if err := sess.Regenerate(true); err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }

    // Persist user identity + flash welcome message for the NEXT request.
    sess.Put("user_id", userID).
        Flash("notice", "Welcome back!").
        Save()

    return ctx.Response().Json(http.StatusOK, http.Json{"ok": true})
}

func (c *AuthController) Profile(ctx http.Context) http.Response {
    sess := ctx.Request().Session()
    userID := sess.Get("user_id")
    if userID == nil {
        return ctx.Response().Json(http.StatusUnauthorized, http.Json{"error": "not logged in"})
    }

    notice := sess.Pull("notice")  // read + remove the flash
    return ctx.Response().Json(http.StatusOK, http.Json{
        "user_id": userID,
        "notice":  notice,
    })
}

func (c *AuthController) Logout(ctx http.Context) http.Response {
    if err := ctx.Request().Session().Invalidate(); err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }
    return ctx.Response().Json(http.StatusOK, http.Json{"ok": true})
}
```

## Rules

- `Regenerate(destroy ...bool) error` — call on login. Pass `true` to destroy old data.
- All mutators return `Session` — chain them.
- `Flash` is for the NEXT request; `Now` for CURRENT; `Reflash`/`Keep` to extend.
- Call `Save()` explicitly after mutations when the request flow is unusual (early return, streaming, etc.).
- Register `StartSession()` middleware in `bootstrap/app.go` — required for `ctx.Request().Session()` to work.
- `Forget(keys ...string)` is variadic.
- `Token()` returns the CSRF token; pair with the CSRF middleware.
- `cookie` driver has ~4KB size limit — use `file`/`database`/`redis` for large payloads.
