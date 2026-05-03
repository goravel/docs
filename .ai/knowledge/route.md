# Route

HTTP routing — verbs, groups, middleware, resource controllers, static, rate limits. Driver-pluggable: `goravel/gin` or `goravel/fiber` register the actual server. The contract surface is identical across drivers.

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/route/route.go` — `Route`, `Router`, `Action`, `GroupFunc`
- `contracts/http/context.go` — `Context`, `Middleware`, `HandlerFunc`, `ResourceController`
- `contracts/http/rate_limiter.go` — `RateLimiter`, `Limit`

Fetch when you need full type bodies, edge-case argument types, or methods not listed below.

## Imports

```go
import (
    "github.com/goravel/framework/contracts/http"
    "github.com/goravel/framework/contracts/route"

    "yourmodule/app/facades"
    "yourmodule/app/http/controllers"
    "yourmodule/app/http/middleware"
)
```

## Methods

### `facades.Route()` returns `route.Route` (extends `route.Router`)

| Method | Signature | Notes |
|---|---|---|
| Run | `(host ...string) error` | Start HTTP server on host (or `config.host:port`). |
| RunTLS | `(host ...string) error` | TLS via configured cert paths. |
| RunTLSWithCert | `(host, certFile, keyFile string) error` | TLS with explicit cert. |
| Listen | `(l net.Listener) error` | Bring-your-own listener. |
| Fallback | `(handler http.HandlerFunc)` | Catch-all for unmatched routes (404 handler). |
| Recover | `(fn func(ctx http.Context, err any))` | Custom panic recovery. |
| GlobalMiddleware | `(mw ...http.Middleware)` | DEPRECATED — use `WithMiddleware` in `bootstrap/app.go` instead. |
| Shutdown | `(ctx ...context.Context) error` | Graceful stop. |
| GetRoutes | `() []http.Info` | Inspect registered routes. |
| Info | `(name string) http.Info` | Look up a named route. |
| ServeHTTP | `(w http.ResponseWriter, r *http.Request)` | Standard `http.Handler` interface. |

### `route.Router` (also reachable from `Route`, group `router`)

| Method | Signature | Notes |
|---|---|---|
| Group | `(handler GroupFunc)` where `GroupFunc = func(router Router)` | Open a sub-router; chain `Prefix`/`Middleware` before. |
| Prefix | `(path string) Router` | Returns a new Router with path prefix; chain or `Group`. |
| Middleware | `(mw ...http.Middleware) Router` | Returns a new Router with middleware attached. |
| Get / Post / Put / Patch / Delete / Options / Any | `(path string, handler http.HandlerFunc) Action` | One method per HTTP verb. |
| Resource | `(path string, controller http.ResourceController) Action` | RESTful resource — controller must implement `Index`, `Show`, `Store`, `Update`, `Destroy`. |
| Static | `(path, root string) Action` | Serve directory. |
| StaticFile | `(path, file string) Action` | Serve a single file. |
| StaticFS | `(path string, fs http.FileSystem) Action` | Serve `fs.FS`. |

### `route.Action`

| Method | Signature | Notes |
|---|---|---|
| Name | `(name string) Action` | Name a route for `Info(name)` lookup. |

### `facades.RateLimiter()` returns `http.RateLimiter`

| Method | Signature | Notes |
|---|---|---|
| For | `(name string, callback func(ctx http.Context) http.Limit)` | Register single limit. |
| ForWithLimits | `(name string, callback func(ctx http.Context) []http.Limit)` | Register multiple limits. |
| Limiter | `(name string) func(ctx http.Context) []http.Limit` | Look up a registered limiter. |

`http.Limit`: `By(key string) Limit` (signature key, e.g. user id), `Response(fn func(ctx http.Context)) Limit` (custom 429 response).

### Type signatures (memorise these)

```go
type Middleware  func(ctx http.Context)                   // takes ctx, returns nothing
type HandlerFunc func(ctx http.Context) http.Response     // takes ctx, returns Response
type GroupFunc   func(router route.Router)
```

## Config

User-owned files: `config/http.go`, `config/cors.go`. Read directly for current values.

Keys this facade reads:

- `http.host` (string) — bind host (env `APP_HOST`)
- `http.port` (string) — bind port (env `APP_PORT`)
- `http.tls.host`/`port`/`ssl` — TLS settings
- `http.tls.ssl.cert` / `key` — cert paths
- `http.driver` — implicitly via the package imported in `bootstrap/app.go` (gin or fiber)
- `cors.paths`, `cors.allowed_methods`, `cors.allowed_origins`, etc. — CORS middleware (auto-registered)
- `app.timezone` (string) — used by some response helpers

If the project has no `config/http.go` or `config/cors.go` yet, fetch the scaffold defaults from the goravel-scaffold URL declared in `AGENTS.md`:
- `config/http.go`
- `config/cors.go`

## Patterns & gotchas

- **Middleware is `func(http.Context)`**, NOT a struct with a `Handle` method. Two valid shapes:
  - **Closure factory** (preferred when config needed): `func JwtAuth() http.Middleware { return func(ctx http.Context) { ... } }` — the factory captures config, returns a Middleware.
  - **Bare function** (no config): `func MyMiddleware(ctx http.Context) { ... }` — pass directly: `routes.Middleware(MyMiddleware)`.
- **Middleware `.Abort()` requires explicit `return`**. `Abort` marks the response aborted but does NOT halt handler execution. Always `ctx.Response().String(401, "x").Abort(); return` — the `return` is mandatory.
- **`Group` opens a sub-router**: pass a `GroupFunc` that receives `route.Router`, attach routes inside. Chain `Prefix(...)` and `Middleware(...)` BEFORE `Group`:
  ```go
  routes.Prefix("/api/v1").Middleware(middleware.JwtAuth()).Group(func(r route.Router) { ... })
  ```
- **`Middleware(...)` returns a new Router** — chain it (e.g. `.Get(...)`) or pass to `.Group(...)`.
- **Resource controllers**: pass an instance that satisfies `http.ResourceController`. Method values (`controller.Index`) are NOT used here; pass the struct itself: `routes.Resource("/posts", &controllers.PostController{})`.
- **HTTP verb handlers** take `http.HandlerFunc` — a method on a controller works because `(*Controller).Method` has the right signature. Pass the method value: `routes.Get("/posts", postsController.Index)`.
- **Rate limiting**: register limiters in `bootstrap/app.go` `WithCallback` (so config + facades are ready). Attach via middleware in routes:
  ```go
  facades.RateLimiter().For("api", func(ctx http.Context) http.Limit {
      return limit.PerMinute(60).By(ctx.Request().Ip())
  })
  ```
- **Static asset routes** are first-class: prefer `Static` / `StaticFile` over routing to a handler that streams a file.
- **Driver lock-in**: `Test()` only works on the Fiber driver. For driver-portable HTTP tests, use the `testing.md` patterns.
- **Global middleware deprecated**: `GlobalMiddleware(...)` on the route is deprecated — use `WithMiddleware([]http.Middleware{...})` in `bootstrap/app.go`.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `func JwtAuth(ctx http.Context) { ... }` then `routes.Middleware(JwtAuth())` | `func JwtAuth() http.Middleware { return func(ctx http.Context) { ... } }` then `routes.Middleware(JwtAuth())` | Calling `JwtAuth()` only works if it's a factory returning Middleware. |
| `type AuthMW struct{}; func (m AuthMW) Handle(ctx http.Context) {...}` then `routes.Middleware(AuthMW{})` | `func AuthMiddleware(ctx http.Context) {...}` then `routes.Middleware(AuthMiddleware)` | Middleware is a function type, not a struct. |
| `.Abort()` (no return) | `.Abort(); return` | Abort doesn't halt execution — handler continues unless you return. |
| `routes.Resource("/posts", PostController{}.Index)` | `routes.Resource("/posts", &PostController{})` | Resource takes a controller instance implementing the 5-method interface, not a method value. |
| `routes.Get("/posts", controllers.Index)` (free function) | `routes.Get("/posts", postsController.Index)` (method value on instance) | The framework passes ctx; method values bind the receiver. |
| `routes.GlobalMiddleware(mw)` (deprecated) | `app.WithMiddleware([]http.Middleware{mw})` in `bootstrap/app.go` | Global middleware moved to bootstrap. |
| `routes.Prefix("/api").Get("/users", h)` (no Group) | works for a single route. For multiple, use `Prefix("/api").Group(func(r route.Router){...})` | Prefix returns a Router; OK for one verb, Group for many. |

## Worked example: protected API group with rate limit + resource controller

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

// bootstrap/app.go (excerpt) — register named rate limiter inside WithCallback
// app.WithCallback(func() {
//     facades.RateLimiter().For("api", func(ctx http.Context) http.Limit {
//         return limit.PerMinute(60).By(ctx.Request().Ip())
//     })
// })

// routes/api.go
package routes

import (
    "github.com/goravel/framework/contracts/http"
    "github.com/goravel/framework/contracts/route"
    httpmw "github.com/goravel/framework/http/middleware"  // throttle middleware

    "yourmodule/app/facades"
    "yourmodule/app/http/controllers"
    "yourmodule/app/http/middleware"
)

func Api() {
    posts := &controllers.PostController{}
    me := &controllers.MeController{}

    facades.Route().
        Prefix("/api/v1").
        Middleware(middleware.JwtAuth(), httpmw.Throttle("api")).
        Group(func(r route.Router) {
            r.Resource("/posts", posts)            // GET/POST/PUT/PATCH/DELETE under /api/v1/posts
            r.Get("/me", me.Show).Name("me.show")  // single route, named
        })
}

// app/http/controllers/post_controller.go (satisfies http.ResourceController)
package controllers

import "github.com/goravel/framework/contracts/http"

type PostController struct{}

func (r *PostController) Index(ctx http.Context) http.Response   { /* ... */ return ctx.Response().Json(http.StatusOK, http.Json{}) }
func (r *PostController) Show(ctx http.Context) http.Response    { /* ... */ return ctx.Response().Json(http.StatusOK, http.Json{}) }
func (r *PostController) Store(ctx http.Context) http.Response   { /* ... */ return ctx.Response().Json(http.StatusCreated, http.Json{}) }
func (r *PostController) Update(ctx http.Context) http.Response  { /* ... */ return ctx.Response().Json(http.StatusOK, http.Json{}) }
func (r *PostController) Destroy(ctx http.Context) http.Response { /* ... */ return ctx.Response().Json(http.StatusNoContent, nil) }
```

## Rules

- Middleware shape: `func(ctx http.Context)`. Use a closure factory `func Name() http.Middleware { return func(ctx http.Context) { ... } }` when config is needed; bare function otherwise.
- `.Abort()` MUST be followed by an explicit `return` in middleware and handlers.
- Handler return type is `http.Response` — every controller method ends with `return ctx.Response().X(...)`.
- `Resource` requires a 5-method controller (Index, Show, Store, Update, Destroy) — pass the struct instance, not method values.
- Route groups: `Prefix(...).Middleware(...).Group(func(r route.Router){...})`. Chain order: prefix → middleware → group.
- Register rate limiters inside `bootstrap/app.go` `WithCallback`. Attach by name in route middleware.
- Do NOT use `GlobalMiddleware()` — it's deprecated. Use `WithMiddleware([]http.Middleware{...})` in `bootstrap/app.go`.
- Static assets: prefer `Static`/`StaticFile`/`StaticFS` over hand-rolling a stream handler.
