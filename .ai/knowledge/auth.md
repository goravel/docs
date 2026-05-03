# Auth

JWT auth + authorization gates. `facades.Auth` is the only facade that takes `http.Context`.

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/auth/auth.go` — `Auth`, `GuardDriver`, `UserProvider`, `Payload`
- `contracts/auth/access/gate.go` — `Gate`, `Response`

Fetch when you need full type bodies, edge-case argument types, or methods not listed below.

## Imports

```go
import (
    "context"
    "github.com/goravel/framework/contracts/http"
    "github.com/goravel/framework/auth/access"  // access.NewAllowResponse / NewDenyResponse
    "yourmodule/app/facades"
)
```

## Methods

### `facades.Auth(ctx http.Context)` returns `auth.Auth`

| Method | Signature | Notes |
|---|---|---|
| Check | `() bool` | Logged in? Requires prior `Parse`. |
| Guest | `() bool` | Not logged in? Requires prior `Parse`. |
| Login | `(user any) (token string, err error)` | Issue token for an authenticated user. |
| LoginUsingID | `(id any) (token string, err error)` | Issue token by user ID. |
| Parse | `(token string) (*Payload, error)` | **Must be called before User/ID/Check/Guest/Refresh.** |
| User | `(dest any) error` | Populate dest with user model. Requires prior `Parse`. |
| ID | `() (string, error)` | User ID as string. Requires prior `Parse`. |
| Refresh | `() (token string, err error)` | New token from current. Requires prior `Parse`. |
| Logout | `() error` | Invalidate current token. |
| Guard | `(name string) GuardDriver` | Switch guard for the rest of the chain. |
| Extend | `(name string, fn GuardFunc)` | Register custom guard driver (use in `WithCallback`). |
| Provider | `(name string, fn UserProviderFunc)` | Register custom user provider (use in `WithCallback`). |

### `facades.Gate()` returns `access.Gate`

| Method | Signature | Notes |
|---|---|---|
| Define | `(ability string, fn func(context.Context, map[string]any) Response)` | Callback gets `context.Context`, NOT `http.Context`. |
| Allows | `(ability string, args map[string]any) bool` | |
| Denies | `(ability string, args map[string]any) bool` | |
| Inspect | `(ability string, args map[string]any) Response` | |
| Any | `(abilities []string, args map[string]any) bool` | |
| None | `(abilities []string, args map[string]any) bool` | |
| Before | `(fn func(ctx, ability, args) Response)` | Non-nil return short-circuits all `Define`. |
| After | `(fn func(ctx, ability, args, result) Response)` | Only fires if `Define` returned (not short-circuited). |
| WithContext | `(ctx context.Context) Gate` | |

Helpers: `access.NewAllowResponse() Response`, `access.NewDenyResponse(message string) Response`.

## Config

User-owned files: `config/auth.go`, `config/jwt.go`. Read these directly for current values — do not assume defaults.

Keys this facade reads:

- `auth.defaults.guard` (string) — default guard name when ctx hasn't switched
- `auth.guards.<name>.driver` (string) — driver per guard (e.g. `"jwt"`, `"session"`)
- `auth.guards.<name>.provider` (string) — user provider per guard
- `auth.providers.<name>.driver` (string) — provider driver (e.g. `"orm"`)
- `auth.providers.<name>.model` (function) — model factory, e.g. `func() any { return &models.User{} }`
- `jwt.secret` (string, env-backed) — signing secret
- `jwt.ttl` (int, minutes) — token lifetime
- `jwt.refresh_ttl` (int, minutes) — refresh window
- `jwt.disabled` (slice) — invalidated token IDs (driver-dependent)

If the project has no `config/auth.go` or `config/jwt.go` yet, fetch the scaffold defaults via the goravel-scaffold URL declared in `AGENTS.md`:
- `config/auth.go`
- `config/jwt.go`

## Patterns & gotchas

- **Order**: `Parse(token)` MUST run before `User`, `ID`, `Check`, `Guest`, `Refresh`. These silently fail (or return zero values + error) without a prior parse.
- **Single-facade exception**: `Auth(ctx)` takes `http.Context` — every other facade is no-arg.
- **Guard switching**: call `Guard("api")` before `Login`/`User` when using a non-default guard. The guard sticks for the chain only.
- **Custom drivers**: `Extend` and `Provider` MUST be registered inside `WithCallback` in `bootstrap/app.go` — registering at runtime won't take effect.
- **JWT vs session**: JWT is the default; `config/jwt.go` for global JWT settings; `config/auth.go` for per-guard guard/provider overrides.
- **Multi-guard**: configure multiple guards in `config/auth.go`; switch per request via `facades.Auth(ctx).Guard("api")`.
- **Spelling**: `UserProvider.RetriveByID` is spelled without the second `e` — matches the contract; not a typo to "fix".
- **Gate ctx type**: `Define` callback receives `context.Context`, not `http.Context`. Do NOT type-assert to `http.Context`. Pull user info from ctx values instead.
- **Gate Before/After**: `Before` returning non-nil short-circuits all `Define`. `After` only fires if `Define` returned a result (not short-circuited).
- **Logout**: clears the local token. To revoke server-side, the JWT driver maintains a blocklist when `JWT.disabled` config is enabled.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `facades.Auth().User(&u)` | `facades.Auth(ctx).User(&u)` | Auth is variadic on ctx; omit and you'll get a nil-context panic. |
| `r := ctx.Request().Origin(); token := r.Header.Get("Authorization")` | `token := ctx.Request().Header("Authorization")` | Use the framework's request facade; raw `*http.Request` is an escape hatch you don't need here. |
| `ctx.Response().String(401, "x").Abort()` (no return) | `... .Abort(); return` | Abort marks aborted but does NOT stop handler execution. |
| `facades.Gate().Define("x", func(ctx http.Context, args ...) Response {...})` | `func(ctx context.Context, args map[string]any) Response {...}` | Gate ctx is `context.Context`. |
| Registering `Extend`/`Provider` in a controller | Inside `WithCallback` in `bootstrap/app.go` | Runtime registration is silently ignored. |

## Worked example: JWT middleware + protected handler

```go
// app/http/middleware/jwt_auth.go
package middleware

import (
    "github.com/goravel/framework/contracts/http"
    "yourmodule/app/facades"
)

func JwtAuth() http.Middleware {
    return func(ctx http.Context) {
        token := ctx.Request().Header("Authorization")
        if _, err := facades.Auth(ctx).Parse(token); err != nil {
            ctx.Response().String(http.StatusUnauthorized, "unauthorized").Abort()
            return
        }
        ctx.Request().Next()
    }
}

// app/http/controllers/me_controller.go
package controllers

import (
    "github.com/goravel/framework/contracts/http"
    "yourmodule/app/facades"
    "yourmodule/app/models"
)

type MeController struct{}

// Middleware already called Parse; User() works here.
func (r *MeController) Show(ctx http.Context) http.Response {
    var user models.User
    if err := facades.Auth(ctx).User(&user); err != nil {
        return ctx.Response().Json(http.StatusUnauthorized, http.Json{"error": "unauthorized"})
    }
    return ctx.Response().Json(http.StatusOK, user)
}
```

## Rules

- Always pair `.Abort()` with an explicit `return`.
- Never call `User`/`ID`/`Check`/`Guest`/`Refresh` without a preceding `Parse` on the same `ctx`.
- For Gate `Define` callbacks: ctx is `context.Context`, not `http.Context` — do not type-assert.
- Register custom guards/providers inside `WithCallback` in `bootstrap/app.go`.
- For non-default guards: call `Guard(name)` before any other Auth method in the chain.
