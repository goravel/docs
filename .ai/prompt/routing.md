# Goravel Routing

## Setup

Routes are defined in `routes/` and registered in `bootstrap/app.go`:

```go
func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithRouting(func() {
            routes.Web()
            routes.Api()
        }).
        WithConfig(config.Boot).
        Create()
}
```

Route files call `facades.Route()` methods:

```go
package routes

import "goravel/app/facades"

func Web() {
    facades.Route().Get("/", homeController.Index)
}
```

---

## HTTP Methods

```go
facades.Route().Get("/", handler)
facades.Route().Post("/", handler)
facades.Route().Put("/", handler)
facades.Route().Delete("/", handler)
facades.Route().Patch("/", handler)
facades.Route().Options("/", handler)
facades.Route().Any("/", handler)
```

Handler signature:

```go
import "github.com/goravel/framework/contracts/http"

func(ctx http.Context) http.Response
```

---

## Inline Handler

```go
facades.Route().Get("/", func(ctx http.Context) http.Response {
    return ctx.Response().Json(http.StatusOK, http.Json{
        "Hello": "Goravel",
    })
})
```

---

## Route Parameters

```go
facades.Route().Get("/users/{id}", func(ctx http.Context) http.Response {
    id := ctx.Request().Input("id")
    return ctx.Response().Success().Json(http.Json{"id": id})
})
```

---

## Group Routing

```go
import "github.com/goravel/framework/contracts/route"

facades.Route().Group(func(router route.Router) {
    router.Get("users/{id}", userController.Show)
    router.Post("users", userController.Store)
})
```

---

## Routing Prefix

```go
facades.Route().Prefix("api/v1").Get("users", userController.Index)

facades.Route().Prefix("api").Group(func(router route.Router) {
    router.Get("users", userController.Index)
    router.Post("users", userController.Store)
})
```

---

## Resource Routing

```go
import "github.com/goravel/framework/contracts/http"

resourceController := controllers.NewPhotoController()
facades.Route().Resource("photos", resourceController)
```

Resource controller must implement these methods:

```go
type PhotoController struct{}

func NewPhotoController() *PhotoController {
    return &PhotoController{}
}

// GET /photos
func (c *PhotoController) Index(ctx http.Context) http.Response {}

// GET /photos/{photo}
func (c *PhotoController) Show(ctx http.Context) http.Response {}

// POST /photos
func (c *PhotoController) Store(ctx http.Context) http.Response {}

// PUT/PATCH /photos/{photo}
func (c *PhotoController) Update(ctx http.Context) http.Response {}

// DELETE /photos/{photo}
func (c *PhotoController) Destroy(ctx http.Context) http.Response {}
```

---

## Middleware on Routes

```go
import "github.com/goravel/framework/http/middleware"

facades.Route().Middleware(middleware.Cors()).Get("users", userController.Show)
facades.Route().Middleware(middleware.Auth(), middleware.Throttle("api")).Get("profile", profileController.Show)
```

---

## File Serving

```go
import "net/http"

facades.Route().Static("static", "./public")
facades.Route().StaticFile("static-file", "./public/logo.png")
facades.Route().StaticFS("static-fs", http.Dir("./public"))
```

---

## Named Routes

```go
facades.Route().Get("users", userController.Index).Name("users.index")

// Get route info by name
route := facades.Route().Info("users.index")
```

---

## Fallback Route

```go
facades.Route().Fallback(func(ctx http.Context) http.Response {
    return ctx.Response().String(404, "not found")
})
```

---

## Get All Routes

```go
routes := facades.Route().GetRoutes()
```

---

## Rate Limiting

### Define a rate limiter

Rate limiters must be defined inside `WithCallback` in `bootstrap/app.go`:

```go
import (
    contractshttp "github.com/goravel/framework/contracts/http"
    "github.com/goravel/framework/http/limit"
)

func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithConfig(config.Boot).
        WithCallback(func() {
            facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
                return limit.PerMinute(1000)
            })

            // Per-IP limit
            facades.RateLimiter().For("api", func(ctx contractshttp.Context) contractshttp.Limit {
                return limit.PerMinute(60).By(ctx.Request().Ip())
            })

            // Multiple limits
            facades.RateLimiter().ForWithLimits("login", func(ctx contractshttp.Context) []contractshttp.Limit {
                return []contractshttp.Limit{
                    limit.PerMinute(500),
                    limit.PerMinute(5).By(ctx.Request().Ip()),
                }
            })
        }).
        Create()
}
```

### Attach to route

```go
import "github.com/goravel/framework/http/middleware"

facades.Route().Middleware(middleware.Throttle("global")).Get("/", handler)
```

### Custom rate limit response

```go
facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
    return limit.PerMinute(1000).Response(func(ctx contractshttp.Context) {
        ctx.Request().AbortWithStatus(http.StatusTooManyRequests)
    })
})
```

---

## CORS

CORS is enabled by default. Configure in `config/cors.go`.

---

## List Routes

```shell
./artisan route:list
```

---

## Gotchas

- Route parameters use `ctx.Request().Input("param")` not `ctx.Request().Route("param")` for basic use. `Route()` is only needed for explicit route-segment access.
- `Prefix` and `Group` can be chained: `facades.Route().Prefix("api").Group(...)`
- Middleware registered via `WithMiddleware` in `bootstrap/app.go` applies globally to all HTTP requests.
