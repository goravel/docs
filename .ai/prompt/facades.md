# Goravel Facades, Service Container, and Service Providers

## Facade Import Path

Facades are defined in `app/facades/` inside your project. The import path is:

```go
// go.mod: module goravel
import "goravel/app/facades"

facades.Route().Get("/", handler)
facades.Orm().Query().Find(&user, 1)
facades.Config().GetString("app.name")
```

The module name in `go.mod` determines the import path. Never use `github.com/goravel/framework/app/facades`.

---

## How Facades Work

Each facade calls a `Make*` method on the application's service container to retrieve the registered instance:

```go
// app/facades/route.go
package facades

import "github.com/goravel/framework/contracts/route"

func Route() route.Route {
    return App().MakeRoute()
}
```

---

## Creating a Custom Facade

1. Register a binding in a service provider
2. Create a facade function in `app/facades/`

```go
// app/facades/payment.go
package facades

import "goravel/app/contracts"

func Payment() contracts.PaymentService {
    instance, err := App().Make("goravel.payment")
    if err != nil {
        panic(err)
    }
    return instance.(contracts.PaymentService)
}
```

---

## Service Container

The service container manages bindings and dependencies.

### Bind (creates a new instance each call)

```go
app.Bind("goravel.payment", func(app foundation.Application) (any, error) {
    return NewPaymentService(app.MakeConfig()), nil
})
```

### Singleton (creates once, returns same instance after)

```go
app.Singleton("goravel.payment", func(app foundation.Application) (any, error) {
    return NewPaymentService(app.MakeConfig()), nil
})
```

### Instance (bind an already-created object)

```go
app.Instance("goravel.payment", existingInstance)
```

### BindWith (bind with extra parameters)

```go
app.BindWith("goravel.payment", func(app foundation.Application, parameters map[string]any) (any, error) {
    return NewPaymentService(parameters["apiKey"].(string)), nil
})
```

### Resolve

```go
// Inside a service provider
instance, err := app.Make("goravel.payment")

// Outside service providers (via App facade)
instance, err := facades.App().Make("goravel.payment")

// With parameters (matches BindWith)
instance, err := app.MakeWith("goravel.payment", map[string]any{"apiKey": "sk-xxx"})
```

### Framework convenience methods

```go
app.MakeConfig()
app.MakeRoute()
app.MakeOrm()
app.MakeAuth(ctx)
app.MakeLog()
// and others
```

---

## Service Providers

### Create a service provider

```shell
./artisan make:provider PaymentServiceProvider
```

Generated providers auto-register in `bootstrap/providers.go`.

### Provider structure

```go
package providers

import (
    "github.com/goravel/framework/contracts/foundation"
    "goravel/app/facades"
)

type PaymentServiceProvider struct{}

func (r *PaymentServiceProvider) Register(app foundation.Application) {
    // Only bind into the container here
    // Never register routes, events, listeners here
    app.Singleton("goravel.payment", func(app foundation.Application) (any, error) {
        return NewPaymentService(app.MakeConfig()), nil
    })
}

func (r *PaymentServiceProvider) Boot(app foundation.Application) {
    // Runs after all providers are registered
    // Safe to use facades and other bindings here
    facades.Route().Get("/payment", paymentController.Index)
}
```

### Register providers

Providers auto-register when created via artisan. Manual registration in `bootstrap/app.go`:

```go
func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithProviders(providers.Providers).
        WithConfig(config.Boot).
        Create()
}
```

---

## Dependency Relationships Between Providers

Use the optional `Relationship` method to declare explicit dependencies:

```go
import "github.com/goravel/framework/contracts/foundation/binding"

type ServiceProvider struct{}

func (r *ServiceProvider) Relationship() binding.Relationship {
    return binding.Relationship{
        Bindings: []string{
            "custom", // what this provider registers
        },
        Dependencies: []string{
            binding.Config, // must be registered before this
        },
        ProvideFor: []string{
            binding.Cache, // this provider's bindings can be used by Cache
        },
    }
}

func (r *ServiceProvider) Register(app foundation.Application) {
    app.Singleton("custom", func(app foundation.Application) (any, error) {
        return New()
    })
}

func (r *ServiceProvider) Boot(app foundation.Application) {}
```

Providers that implement `Relationship` are sorted by dependency graph. Providers without it run last.

---

## Runners

Service providers can implement `Runners` to start and stop background services:

```go
type ServiceProvider struct{}

func (r *ServiceProvider) Register(app foundation.Application) {}

func (r *ServiceProvider) Boot(app foundation.Application) {}

func (r *ServiceProvider) Runners(app foundation.Application) []foundation.Runner {
    return []foundation.Runner{
        NewMyServiceRunner(app.MakeConfig()),
    }
}
```

Runner interface:

```go
type Runner interface {
    ShouldRun() bool
    Run() error
    Shutdown() error
}
```

Example runner:

```go
type MyServiceRunner struct {
    config config.Config
}

func NewMyServiceRunner(config config.Config) *MyServiceRunner {
    return &MyServiceRunner{config: config}
}

func (r *MyServiceRunner) ShouldRun() bool {
    return r.config.GetBool("myservice.enabled")
}

func (r *MyServiceRunner) Run() error {
    // start the service
    return nil
}

func (r *MyServiceRunner) Shutdown() error {
    // graceful shutdown
    return nil
}
```

Add runners in `bootstrap/app.go`:

```go
func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithConfig(config.Boot).
        WithRunners(func() []contractsfoundation.Runner {
            return []contractsfoundation.Runner{
                NewMyServiceRunner(),
            }
        }).
        Create()
}
```

---

## WithCallback

Code in `WithCallback` runs after all providers have been registered and booted. All facades are available:

```go
func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithConfig(config.Boot).
        WithCallback(func() {
            // Register gates
            facades.Gate().Define("update-post", policyFn)

            // Register rate limiters
            facades.RateLimiter().For("api", func(ctx contractshttp.Context) contractshttp.Limit {
                return limit.PerMinute(60)
            })

            // Register observers
            facades.Orm().Observe(models.User{}, &observers.UserObserver{})
        }).
        Create()
}
```

---

## Install and Uninstall Facades (goravel-lite)

For `goravel/goravel-lite`, facades are installed selectively:

```shell
./artisan package:install Route
./artisan package:install Cache
./artisan package:install --all
./artisan package:install --all --default

./artisan package:uninstall Route
```

Note: when selecting facades interactively, press `x` to select an item, then `Enter` to confirm. Pressing `Enter` without `x` does not select.

---

## Accessing the App Facade

```go
// From anywhere
instance, err := facades.App().Make("goravel.payment")
facades.App().Bind("key", fn)
facades.App().Singleton("key", fn)
facades.App().Instance("key", obj)
```

---

## Gotchas

- Never register routes, events, or other side effects inside `Register`. Use `Boot` or `WithCallback` instead.
- `Register` is called on all providers before `Boot` is called on any. Do not call `facades.*` inside `Register` - the binding may not exist yet.
- Facade functions return an interface. Always check for nil or use type assertions carefully.
- Providers without `Relationship` run after those with it. If your provider depends on a custom provider that does not declare relationships, ordering is not guaranteed.
