# Goravel Bootstrap, Service Container, and Service Providers

## Bootstrap Entry Point

```go
// main.go
package main

import "goravel/bootstrap"

func main() {
    app := bootstrap.Boot()
    app.Wait()
}
```

```go
// bootstrap/app.go
package bootstrap

import (
    "github.com/goravel/framework/foundation"
    contractsfoundation "github.com/goravel/framework/contracts/foundation"
)

func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithProviders(Providers).
        WithConfig(config.Boot).
        WithRouting(func() {
            routes.Web()
            routes.Grpc()
        }).
        WithMiddleware(func(handler configuration.Middleware) {
            handler.Append(middleware.Custom())
        }).
        WithCommands(Commands).
        WithEvents(func() map[event.Event][]event.Listener {
            return map[event.Event][]event.Listener{
                events.NewOrderShipped(): {listeners.NewSendShipmentNotification()},
            }
        }).
        WithJobs(Jobs).
        WithMigrations(Migrations).
        WithSeeders(Seeders).
        WithSchedule(func() []schedule.Event {
            return []schedule.Event{
                facades.Schedule().Call(func() {}).Daily(),
            }
        }).
        WithRules(Rules).
        WithFilters(Filters).
        WithRunners(func() []foundation.Runner {
            return []foundation.Runner{NewCustomRunner()}
        }).
        WithPaths(func(paths configuration.Paths) {
            paths.App("src")            // optional: customize directories
            paths.Config("configuration")
            paths.Database("db")
            paths.Routes("api/routes")
            paths.Storage("data")
            paths.Resources("views-root")
        }).
        WithCallback(func() {
            // runs after all providers Boot(); all facades available here
            facades.Gate().Define("update-post", fn)
            facades.RateLimiter().For("global", fn)
            facades.Orm().Observe(&models.User{}, &observers.UserObserver{})
        }).
        Create()
}
```

**Boot order inside `Create()`:**
1. Load configuration (`WithConfig`)
2. Register all service providers (calls `Register` on each)
3. Boot all service providers (calls `Boot` on each)
4. Run `WithCallback`
5. Runners start (HTTP server, Queue worker, Schedule, gRPC, etc.)

---

## Directory Paths Are Configurable

`WithPaths` customizes directory layout. Never assume `app/`, `config/`, etc. are fixed.

```go
WithPaths(func(paths configuration.Paths) {
    paths.App("src")
    paths.Config("configuration")
    paths.Database("db")
    paths.Routes("api/routes")
    paths.Storage("data")
    paths.Resources("views-root")
})
```

---

## Service Container

### Bind (new instance each call)

```go
func (r *ServiceProvider) Register(app foundation.Application) {
    app.Bind("goravel.route", func(app foundation.Application) (any, error) {
        return NewRoute(app.MakeConfig()), nil
    })
}
```

### Singleton (same instance every call)

```go
app.Singleton("goravel.gin", func(app foundation.Application) (any, error) {
    return NewGin(app.MakeConfig()), nil
})
```

### Instance (existing object)

```go
app.Instance("goravel.key", existingInstance)
```

### BindWith (bind with extra parameters)

```go
app.BindWith("goravel.route", func(app foundation.Application, parameters map[string]any) (any, error) {
    return NewRoute(app.MakeConfig()), nil
})
```

### Make (resolve from container)

```go
instance, err := app.Make("goravel.route")

// from outside a service provider:
instance, err := facades.App().Make("goravel.route")
```

### MakeWith (resolve with parameters)

```go
instance, err := app.MakeWith("goravel.route", map[string]any{"id": 1})
```

### Convenience resolvers

```go
app.MakeArtisan()
app.MakeAuth(ctx)
app.MakeCache()
app.MakeConfig()
app.MakeRoute()
// etc.
```

---

## Service Providers

Create via artisan (auto-registered in `bootstrap/providers.go`):

```shell
./artisan make:provider YourServiceProvider
```

```go
package providers

import "github.com/goravel/framework/contracts/foundation"

type YourServiceProvider struct{}

// Register: only bind into the service container here.
// NEVER register routes, events, or listeners in Register.
func (r *YourServiceProvider) Register(app foundation.Application) {
    app.Singleton("custom", func(app foundation.Application) (any, error) {
        return New(), nil
    })
}

// Boot: register routes, event listeners, or any startup logic here.
func (r *YourServiceProvider) Boot(app foundation.Application) {}
```

### Dependency Relationship

```go
import "github.com/goravel/framework/contracts/foundation/binding"

func (r *ServiceProvider) Relationship() binding.Relationship {
    return binding.Relationship{
        Bindings: []string{
            "custom",
        },
        Dependencies: []string{
            binding.Config,
        },
        ProvideFor: []string{
            binding.Cache,
        },
    }
}
```

Providers with `Relationship()` are registered in dependency order; those without are registered last.

---

## Runners Interface (v1.17)

Implement `Runners` in a service provider to auto-start/shutdown services:

```go
// BREAKING v1.17: register new service providers &process.ServiceProvider{} and &view.ServiceProvider{}

type Runner interface {
    ShouldRun() bool
    Run() error
    Shutdown() error
}

// In service provider:
func (r *ServiceProvider) Runners(app foundation.Application) []foundation.Runner {
    return []foundation.Runner{NewMyRunner(app.MakeConfig())}
}

// Runner implementation:
type MyRunner struct {
    config config.Config
    route  route.Route
}

func NewMyRunner(config config.Config, route route.Route) *MyRunner {
    return &MyRunner{config: config, route: route}
}

func (r *MyRunner) ShouldRun() bool {
    return r.route != nil && r.config.GetString("http.default") != ""
}

func (r *MyRunner) Run() error {
    return r.route.Run()
}

func (r *MyRunner) Shutdown() error {
    return r.route.Shutdown()
}
```

Custom runners via `WithRunners`:

```go
WithRunners(func() []foundation.Runner {
    return []foundation.Runner{NewCustomRunner()}
})
```

---

## Facade Import Pattern

Facades live in `app/facades/` of your project. Import path depends on `go.mod` module name:

```go
// go.mod:  module github.com/mycompany/myapp

import "github.com/mycompany/myapp/app/facades"

facades.Route().Get("/", handler)
facades.Orm().Query().Find(&user, 1)
facades.Auth(ctx).Login(&user)
```

Available facades: `App`, `Artisan`, `Auth`, `Cache`, `Config`, `Crypt`, `DB`, `Event`, `Gate`, `Grpc`, `Hash`, `Http`, `Lang`, `Log`, `Mail`, `Orm`, `Process`, `Queue`, `RateLimiter`, `Route`, `Schedule`, `Schema`, `Seeder`, `Session`, `Storage`, `Validation`, `View`.

Never import `github.com/goravel/framework/facades` — it does not exist.

---

## HTTP Driver Configuration

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
            "body_limit":   4096,       // KB (default 4096)
            "header_limit": 4096,
            "route": func() (route.Route, error) {
                return ginfacades.Route("gin"), nil
            },
            "template": func() (render.HTMLRender, error) {
                return gin.DefaultTemplate()
            },
        },
    },
    "url":             config.Env("APP_URL", "http://localhost"),
    "host":            config.Env("APP_HOST", "127.0.0.1"),
    "port":            config.Env("APP_PORT", "3000"),
    "request_timeout": 3,   // seconds
    "tls": map[string]any{
        "host": config.Env("APP_HOST", "127.0.0.1"),
        "port": config.Env("APP_PORT", "3000"),
        "ssl": map[string]any{
            "cert": "",  // path to .pem
            "key":  "",  // path to .key
        },
    },
    "default_client": config.Env("HTTP_CLIENT_DEFAULT", "default"),
    "clients": map[string]any{
        "default": map[string]any{
            "base_url":                config.Env("HTTP_CLIENT_BASE_URL", ""),
            "timeout":                 config.Env("HTTP_CLIENT_TIMEOUT", "30s"),
            "max_idle_conns":          config.Env("HTTP_CLIENT_MAX_IDLE_CONNS", 100),
            "max_idle_conns_per_host": config.Env("HTTP_CLIENT_MAX_IDLE_CONNS_PER_HOST", 2),
            "max_conns_per_host":      config.Env("HTTP_CLIENT_MAX_CONN_PER_HOST", 0),
            "idle_conn_timeout":       config.Env("HTTP_CLIENT_IDLE_CONN_TIMEOUT", "90s"),
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
            "immutable":    true,   // zero-allocation mode; understand before disabling
            "prefork":      false,
            "body_limit":   4096,
            "header_limit": 4096,
            "route": func() (route.Route, error) {
                return fiberfacades.Route("fiber"), nil
            },
            "template": func() (fiber.Views, error) {
                return html.New(path.Resource("views"), ".tmpl"), nil
            },
        },
    },
    // url/host/port/tls/clients same as Gin config
})
```

Install drivers:

```shell
./artisan package:install github.com/goravel/gin
./artisan package:install github.com/goravel/fiber
```

---

## WithCallback Pattern

Use `WithCallback` for any code that requires all facades to be available:

```go
WithCallback(func() {
    // Gates
    facades.Gate().Define("edit-post", func(ctx context.Context, args map[string]any) contractsaccess.Response {
        user := ctx.Value("user").(models.User)
        post := args["post"].(models.Post)
        if user.ID == post.UserID {
            return access.NewAllowResponse()
        }
        return access.NewDenyResponse("forbidden")
    })

    // Rate limiters
    facades.RateLimiter().For("api", func(ctx contractshttp.Context) contractshttp.Limit {
        return limit.PerMinute(60).By(ctx.Request().Ip())
    })

    // ORM observers
    facades.Orm().Observe(&models.User{}, &observers.UserObserver{})
})
```
