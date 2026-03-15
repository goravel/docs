# Goravel Middleware

## Middleware Signature

Middleware is a function that returns `http.Middleware`. It is NOT a struct.

```go
package middleware

import "github.com/goravel/framework/contracts/http"

func Auth() http.Middleware {
    return func(ctx http.Context) {
        // logic before handler
        ctx.Request().Next()
        // logic after handler
    }
}
```

### Generate middleware

```shell
./artisan make:middleware Auth
./artisan make:middleware user/Auth
```

Generated file is placed in `app/http/middleware/`.

---

## Aborting a Request

```go
func Auth() http.Middleware {
    return func(ctx http.Context) {
        token := ctx.Request().Header("Authorization", "")
        if token == "" {
            ctx.Request().Abort(http.StatusUnauthorized)
            return
        }
        ctx.Request().Next()
    }
}
```

Abort with a response body:

```go
func Auth() http.Middleware {
    return func(ctx http.Context) {
        token := ctx.Request().Header("Authorization", "")
        if token == "" {
            ctx.Response().String(http.StatusUnauthorized, "unauthorized").Abort()
            return
        }
        ctx.Request().Next()
    }
}
```

Abort forms:

```go
ctx.Request().Abort()
ctx.Request().Abort(http.StatusForbidden)
ctx.Request().AbortWithStatus(http.StatusForbidden)
ctx.Response().String(http.StatusForbidden, "forbidden").Abort()
```

---

## Passing Data Through Middleware

Set a value on the context to pass to the next handler:

```go
func Auth() http.Middleware {
    return func(ctx http.Context) {
        userID := resolveUserID(ctx)
        ctx.WithValue("userID", userID)
        ctx.Request().Next()
    }
}
```

Read in controller:

```go
func (r *UserController) Show(ctx http.Context) http.Response {
    userID := ctx.Value("userID")
    ...
}
```

---

## Global Middleware

Applies to every HTTP request. Registered in `bootstrap/app.go`:

```go
import (
    "github.com/goravel/framework/contracts/foundation/configuration"
    "goravel/app/http/middleware"
)

func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithMiddleware(func(handler configuration.Middleware) {
            handler.Append(
                middleware.Auth(),
                middleware.Custom(),
            )
        }).
        WithConfig(config.Boot).
        Create()
}
```

`handler` methods:

| Method | Effect |
|--------|--------|
| `Append(middlewares...)` | Add to end of middleware stack |
| `Prepend(middlewares...)` | Add to start of middleware stack |
| `Use(middlewares...)` | Replace entire middleware stack |
| `Recover(fn)` | Set panic recovery handler |
| `GetGlobalMiddleware()` | Return current global middleware list |

---

## Route-Level Middleware

Apply to specific routes or groups:

```go
import (
    "goravel/app/facades"
    "goravel/app/http/middleware"
)

// Single route
facades.Route().Middleware(middleware.Auth()).Get("profile", profileController.Show)

// Multiple middleware
facades.Route().Middleware(middleware.Auth(), middleware.Throttle("api")).Get("admin", adminController.Index)

// Group
facades.Route().Middleware(middleware.Auth()).Group(func(router route.Router) {
    router.Get("profile", profileController.Show)
    router.Put("profile", profileController.Update)
})

// Prefix + middleware
facades.Route().Prefix("admin").Middleware(middleware.Auth()).Group(func(router route.Router) {
    router.Get("dashboard", dashboardController.Index)
})
```

---

## Framework-Provided Middleware

```go
import "github.com/goravel/framework/http/middleware"

middleware.Cors()          // CORS headers
middleware.Throttle("limiterName") // rate limiting (limiter defined via facades.RateLimiter())
```

---

## Custom Recovery (Panic Handler)

```go
import (
    contractshttp "github.com/goravel/framework/contracts/http"
    "github.com/goravel/framework/contracts/foundation/configuration"
)

WithMiddleware(func(handler configuration.Middleware) {
    handler.
        Append(middleware.Cors()).
        Recover(func(ctx contractshttp.Context, err any) {
            facades.Log().Error(err)
            _ = ctx.Response().String(contractshttp.StatusInternalServerError, "internal error").Abort()
        })
})
```

---

## Reading Response Data in Middleware (After Next)

```go
func Logger() http.Middleware {
    return func(ctx http.Context) {
        ctx.Request().Next()

        origin := ctx.Response().Origin()
        // origin.Body()   - response bytes
        // origin.Header() - response headers
        // origin.Status() - HTTP status code
        // origin.Size()   - response body size
    }
}
```

---

## Gotchas

- Middleware is a function returning `http.Middleware`, not a struct with a `Handle` method.
- Always call `ctx.Request().Next()` to pass control to the next middleware or handler. Omitting it silently stops the chain.
- Returning from the middleware function after `Abort` is required to stop execution.
- Global middleware registered with `WithMiddleware` runs on all HTTP routes. Use route-level middleware for scoped behavior.
