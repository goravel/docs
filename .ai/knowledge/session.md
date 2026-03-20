# Session Facade

## Core Imports

```go
import (
    "github.com/goravel/framework/contracts/http"
    contractssession "github.com/goravel/framework/contracts/session"
    httpmiddleware "github.com/goravel/framework/http/middleware"
    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/session/session.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/session/manager.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/session/driver.go`

## Available Methods

**ctx.Request():**

- `HasSession()` bool
- `Session()` Session
- `SetSession(session)` ContextRequest

**Session:**

- `Get(key, default?)` any
- `All()` map[string]any
- `Only([]string)` map[string]any
- `Has(key)` bool - present and not nil
- `Exists(key)` bool - present even if nil
- `Missing(key)` bool
- `Token()` string - CSRF token
- `Put(key, value)` Session
- `Pull(key, default?)` any - retrieve + delete
- `Flash(key, value)` Session - available next request only
- `Now(key, value)` Session - available current request only
- `Reflash()` Session - extend all flash by one more request
- `Keep(keys...)` Session - extend specific flash keys
- `Forget(keys...)` Session
- `Flush()` Session - clear all
- `Remove(key)` any - remove and return value
- `Regenerate(destroy?)` error - new session ID
- `Invalidate()` error - new ID + flush data
- `GetID()` / `SetID(id)` / `GetName()` / `SetName(name)`
- `Save()` error
- `Start()` bool

**facades.Session():**

- `Driver(name?)` (Driver, error)
- `BuildSession(driver, sessionID?)` (Session, error)
- `ReleaseSession(session)`

## Implementation Example

```go
// bootstrap/app.go - register session middleware globally
// WithMiddleware(func(h configuration.Middleware) {
//     h.Append(httpmiddleware.StartSession())
// })

package controllers

import (
    "fmt"
    "github.com/goravel/framework/contracts/http"
    "yourmodule/app/facades"
)

type SessionController struct{}

func (r *SessionController) Store(ctx http.Context) http.Response {
    session := ctx.Request().Session()

    session.Put("user_id", 42)
    session.Flash("status", "Profile updated!")
    session.Now("notice", "Visible this request only")

    return ctx.Response().Json(http.StatusOK, http.Json{"stored": true})
}

func (r *SessionController) Read(ctx http.Context) http.Response {
    session := ctx.Request().Session()

    userID := session.Get("user_id", 0)
    status := session.Pull("status") // read + delete

    if session.Missing("preferences") {
        session.Put("preferences", map[string]any{"theme": "light"})
    }

    return ctx.Response().Json(http.StatusOK, http.Json{
        "user_id": userID,
        "status":  status,
    })
}

func (r *SessionController) Regenerate(ctx http.Context) http.Response {
    // Regenerate session ID after login (prevents fixation)
    if err := ctx.Request().Session().Regenerate(); err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }

    // Update session cookie with new ID
    ctx.Response().Cookie(http.Cookie{
        Name:     ctx.Request().Session().GetName(),
        Value:    ctx.Request().Session().GetID(),
        MaxAge:   facades.Config().GetInt("session.lifetime") * 60,
        Path:     facades.Config().GetString("session.path"),
        Domain:   facades.Config().GetString("session.domain"),
        Secure:   facades.Config().GetBool("session.secure"),
        HttpOnly: facades.Config().GetBool("session.http_only"),
        SameSite: facades.Config().GetString("session.same_site"),
    })

    return ctx.Response().Json(http.StatusOK, http.Json{"ok": true})
}
```

## Rules

- Sessions are not started automatically; register `httpmiddleware.StartSession()` explicitly.
- `ctx.Request().Session()` panics if no session middleware is registered; check `HasSession()` first if uncertain.
- `Put/Flash/Now/Reflash/Keep/Forget/Flush` all return `Session` for chaining.
- `Regenerate()` and `Invalidate()` return `error`, not `bool`.
- `Remove(key)` returns the removed value as `any`.
- `Flash` is available for exactly one subsequent request; `Reflash()` extends by one more.
- `Now` is an immediate flash; visible in the **current** request, not the next.
- After `Regenerate`/`Invalidate`, update the session cookie manually (see example above).
- Default driver is `file`; configure in `config/session.go`.
- `Token()` returns the CSRF token associated with the session.
