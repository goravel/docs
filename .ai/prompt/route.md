# Goravel Routing

## Basic Routing

```go
import "github.com/goravel/framework/contracts/http"

facades.Route().Get("/", func(ctx http.Context) http.Response {
    return ctx.Response().Json(http.StatusOK, http.Json{"Hello": "Goravel"})
})
facades.Route().Post("/", userController.Show)
facades.Route().Put("/", userController.Show)
facades.Route().Delete("/", userController.Show)
facades.Route().Patch("/", userController.Show)
facades.Route().Options("/", userController.Show)
facades.Route().Any("/", userController.Show)
```

Every handler must have signature: `func(ctx http.Context) http.Response`

---

## Route Parameters

```go
facades.Route().Get("/input/{id}", func(ctx http.Context) http.Response {
    return ctx.Response().Success().Json(http.Json{
        "id": ctx.Request().Input("id"),
    })
})
```

---

## Resource Routing

```go
import "github.com/goravel/framework/contracts/http"

resourceController := NewResourceController()
facades.Route().Resource("/resource", resourceController)

type ResourceController struct{}
func NewResourceController() *ResourceController { return &ResourceController{} }

// GET  /resource           → Index
// GET  /resource/{id}      → Show
// POST /resource           → Store
// PUT  /resource/{id}      → Update
// DELETE /resource/{id}    → Destroy
func (c *ResourceController) Index(ctx http.Context) http.Response   { ... }
func (c *ResourceController) Show(ctx http.Context) http.Response    { ... }
func (c *ResourceController) Store(ctx http.Context) http.Response   { ... }
func (c *ResourceController) Update(ctx http.Context) http.Response  { ... }
func (c *ResourceController) Destroy(ctx http.Context) http.Response { ... }
```

---

## Group Routing

```go
import "github.com/goravel/framework/contracts/route"

facades.Route().Group(func(router route.Router) {
    router.Get("group/{id}", func(ctx http.Context) http.Response {
        return ctx.Response().Success().String(ctx.Request().Query("id", "1"))
    })
})
```

---

## Routing Prefix

```go
facades.Route().Prefix("users").Get("/", userController.Show)
```

---

## Middleware on Routes

```go
import "github.com/goravel/framework/http/middleware"

facades.Route().Middleware(middleware.Cors()).Get("users", userController.Show)

// Multiple middleware:
facades.Route().Middleware(middleware.Auth(), middleware.Throttle("api")).Get("profile", profileController.Show)
```

---

## Route Naming

```go
facades.Route().Get("users", userController.Index).Name("users.index")
```

## Get Route Info by Name

```go
route := facades.Route().Info("users.index")
```

## Get All Routes

```go
routes := facades.Route().GetRoutes()
```

## List Routes (CLI)

```shell
./artisan route:list
```

---

## Fallback Routes

```go
facades.Route().Fallback(func(ctx http.Context) http.Response {
    return ctx.Response().String(404, "not found")
})
```

---

## File Routing

```go
import "net/http"

facades.Route().Static("static", "./public")
facades.Route().StaticFile("static-file", "./public/logo.png")
facades.Route().StaticFS("static-fs", http.Dir("./public"))
```

---

## Default Route File Registration

```go
// bootstrap/app.go
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

---

## Rate Limiting

### Define Rate Limiters

Define in `WithCallback` in `bootstrap/app.go`:

```go
import (
    contractshttp "github.com/goravel/framework/contracts/http"
    "github.com/goravel/framework/http/limit"
)

WithCallback(func() {
    // Simple per-minute limit
    facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
        return limit.PerMinute(1000)
    })

    // Custom response on limit exceeded
    facades.RateLimiter().For("api", func(ctx contractshttp.Context) contractshttp.Limit {
        return limit.PerMinute(60).Response(func(ctx contractshttp.Context) {
            ctx.Request().AbortWithStatus(http.StatusTooManyRequests)
        })
    })

    // Dynamic limit based on request
    facades.RateLimiter().For("dynamic", func(ctx contractshttp.Context) contractshttp.Limit {
        if is_vip() {
            return limit.PerMinute(100)
        }
        return nil
    })

    // Segment by IP
    facades.RateLimiter().For("per-ip", func(ctx contractshttp.Context) contractshttp.Limit {
        if is_vip() {
            return limit.PerMinute(100).By(ctx.Request().Ip())
        }
        return nil
    })

    // Segment by user/IP with fallback
    facades.RateLimiter().For("user-or-ip", func(ctx contractshttp.Context) contractshttp.Limit {
        if userID != 0 {
            return limit.PerMinute(100).By(userID)
        }
        return limit.PerMinute(10).By(ctx.Request().Ip())
    })
})
```

### Multiple Rate Limits

```go
facades.RateLimiter().ForWithLimits("login", func(ctx contractshttp.Context) []contractshttp.Limit {
    return []contractshttp.Limit{
        limit.PerMinute(500),
        limit.PerMinute(100).By(ctx.Request().Ip()),
    }
})
```

### Attach Rate Limiter to Route

```go
import "github.com/goravel/framework/http/middleware"

facades.Route().Middleware(middleware.Throttle("global")).Get("/", func(ctx http.Context) http.Response {
    return ctx.Response().Json(200, http.Json{"Hello": "Goravel"})
})
```

---

## CORS

CORS is enabled by default. Configure in `config/cors.go`:

```go
// config/cors.go
config.Add("cors", map[string]any{
    "paths":                []string{},        // paths to apply CORS to (empty = all)
    "allowed_methods":      []string{"*"},     // or []string{"GET", "POST", "PUT", "DELETE"}
    "allowed_origins":      []string{"*"},     // or []string{"https://example.com"}
    "allowed_headers":      []string{"*"},     // or []string{"Content-Type", "Authorization"}
    "exposed_headers":      []string{},
    "max_age":              0,                 // preflight cache seconds (0 = no cache)
    "supports_credentials": false,             // true enables cookies/auth headers
})
```

Apply CORS middleware on specific routes:

```go
import "github.com/goravel/framework/http/middleware"

facades.Route().Middleware(middleware.Cors()).Get("users", userController.Show)
```

---

## HTTP Drivers

Install via artisan:

```shell
./artisan package:install github.com/goravel/gin
./artisan package:install github.com/goravel/fiber
```

### Gin (default)

```go
// config/http.go
import (
    "github.com/gin-gonic/gin/render"
    "github.com/goravel/framework/contracts/route"
    "github.com/goravel/gin"
    ginfacades "github.com/goravel/gin/facades"
)

config.Add("http", map[string]any{
    "default": "gin",
    "drivers": map[string]any{
        "gin": map[string]any{
            "body_limit":   4096,   // KB, default 4096
            "header_limit": 4096,   // KB, default 4096
            "route": func() (route.Route, error) {
                return ginfacades.Route("gin"), nil
            },
            // Optional: custom HTML template renderer
            "template": func() (render.HTMLRender, error) {
                return gin.DefaultTemplate()
            },
        },
    },
    "url":             config.Env("APP_URL", "http://localhost"),
    "host":            config.Env("APP_HOST", "127.0.0.1"),
    "port":            config.Env("APP_PORT", "3000"),
    "request_timeout": 3, // seconds
    "tls": map[string]any{
        "host": config.Env("APP_HOST", "127.0.0.1"),
        "port": config.Env("APP_PORT", "3000"),
        "ssl": map[string]any{
            "cert": "", // path to cert file
            "key":  "", // path to key file
        },
    },
    // HTTP client configuration (for facades.Http())
    "default_client": config.Env("HTTP_CLIENT_DEFAULT", "default"),
    "clients": map[string]any{
        "default": map[string]any{
            "base_url":               config.Env("HTTP_CLIENT_BASE_URL", ""),
            "timeout":                config.Env("HTTP_CLIENT_TIMEOUT", "30s"),
            "max_idle_conns":         config.Env("HTTP_CLIENT_MAX_IDLE_CONNS", 100),
            "max_idle_conns_per_host": config.Env("HTTP_CLIENT_MAX_IDLE_CONNS_PER_HOST", 2),
            "max_conns_per_host":     config.Env("HTTP_CLIENT_MAX_CONN_PER_HOST", 0),
            "idle_conn_timeout":      config.Env("HTTP_CLIENT_IDLE_CONN_TIMEOUT", "90s"),
        },
    },
})
```

### Fiber

```go
// config/http.go
import (
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/template/html/v2"
    "github.com/goravel/framework/contracts/route"
    "github.com/goravel/framework/support/path"
    fiberfacades "github.com/goravel/fiber/facades"
)

config.Add("http", map[string]any{
    "default": "fiber",
    "drivers": map[string]any{
        "fiber": map[string]any{
            // WARNING: immutable mode — only disable if you understand zero-allocation implications
            "immutable":    true,
            "prefork":      false,
            "body_limit":   4096,  // KB
            "header_limit": 4096,  // KB
            "route": func() (route.Route, error) {
                return fiberfacades.Route("fiber"), nil
            },
            // Optional: custom template engine
            "template": func() (fiber.Views, error) {
                return html.New(path.Resource("views"), ".tmpl"), nil
            },
        },
    },
    // ... same host/port/tls/clients as Gin config above
})
```

| Driver | Package |
|--------|---------|
| Gin    | github.com/goravel/gin |
| Fiber  | github.com/goravel/fiber |
