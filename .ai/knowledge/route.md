# Route Facade

## Core Imports

```go
import (
    "github.com/goravel/framework/contracts/http"
    "github.com/goravel/framework/contracts/route"
    httplimit "github.com/goravel/framework/http/limit"
    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/route/route.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/http/rate_limiter.go`

## Available Methods

**facades.Route():**

- `Get/Post/Put/Delete/Patch/Options/Any(path, handler)` Action
- `Resource(path, controller)` Action
- `Group(func(Router))`
- `Prefix(path)` Router
- `Middleware(middlewares...)` Router
- `Static(path, root)` Action
- `StaticFile(path, file)` Action
- `StaticFS(path, fs)` Action
- `Fallback(handler)` - unmatched routes
- `GetRoutes()` []http.Info - all registered routes
- `Info(name)` http.Info - route by name

**facades.RateLimiter():**

- `For(name, func(ctx) Limit)` - register single limiter
- `ForWithLimits(name, func(ctx) []Limit)` - register multiple limits

**httplimit constructors:**

- `PerMinute(maxAttempts int)` Limit
- `PerMinutes(decayMinutes, maxAttempts int)` Limit
- `PerHour(maxAttempts int)` Limit
- `PerHours(decayHours, maxAttempts int)` Limit
- `PerDay(maxAttempts int)` Limit
- `PerDays(decayDays, maxAttempts int)` Limit

**Action:**

- `.Name(name string)` Action - assign name to route

## Implementation Example

```go
package routes

import (
    contractshttp "github.com/goravel/framework/contracts/http"
    "github.com/goravel/framework/contracts/route"
    httplimit "github.com/goravel/framework/http/limit"
    httpmiddleware "github.com/goravel/framework/http/middleware"
    "yourmodule/app/facades"
    "yourmodule/app/http/controllers"
    appmw "yourmodule/app/http/middleware"
)

func Web() {
    // Rate limiter - register in WithCallback in bootstrap/app.go
    facades.RateLimiter().For("api", func(ctx contractshttp.Context) contractshttp.Limit {
        return httplimit.PerMinute(60).By(ctx.Request().Ip())
    })
    facades.RateLimiter().ForWithLimits("uploads", func(ctx contractshttp.Context) []contractshttp.Limit {
        return []contractshttp.Limit{
            httplimit.PerMinute(10).By(ctx.Request().Ip()),
            httplimit.PerDay(100).By(ctx.Request().Ip()),
        }
    })

    userCtrl := controllers.NewUserController()

    // Named routes
    facades.Route().Get("/", func(ctx contractshttp.Context) contractshttp.Response {
        return ctx.Response().Json(contractshttp.StatusOK, contractshttp.Json{"ok": true})
    }).Name("home")

    // Prefix + middleware group
    facades.Route().
        Prefix("api/v1").
        Middleware(appmw.Auth(), httpmiddleware.Throttle("api")).
        Group(func(r route.Router) {
            r.Get("users", userCtrl.Index).Name("users.index")
            r.Post("users", userCtrl.Store)
            r.Get("users/{id}", userCtrl.Show)
            r.Put("users/{id}", userCtrl.Update)
            r.Delete("users/{id}", userCtrl.Destroy)
        })

    // Resource routes (auto-generates Index/Show/Store/Update/Destroy)
    facades.Route().Resource("photos", controllers.NewPhotoController())

    // Static files
    facades.Route().Static("storage", "./storage/app/public")

    // 404 fallback
    facades.Route().Fallback(func(ctx contractshttp.Context) contractshttp.Response {
        return ctx.Response().Json(404, contractshttp.Json{"error": "not found"})
    })
}
```

## Rules

- Every handler must have signature `func(ctx http.Context) http.Response`.
- `facades.Route()` and `facades.RateLimiter()` are project facades from `yourmodule/app/facades`.
- Rate limiters must be registered in `WithCallback` (all providers booted) before routes are used.
- `Group` callback receives `route.Router`, not the facade.
- `Resource` requires all 5 methods on the controller.
- Route names are set via `.Name()` on the returned `Action`; retrieve with `facades.Route().Info(name)`.
- `Throttle("name")` middleware name must match a registered `RateLimiter` name.
- `PerMinutes(5, 100)` = 100 requests per 5 minutes; first arg is decay, second is max.
- Static path is relative to the application working directory.
- `GlobalMiddleware` on Route is deprecated; use `WithMiddleware` in `bootstrap/app.go`.
