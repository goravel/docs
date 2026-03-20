# Bootstrap, Service Container & Providers

## Core Imports

```go
import (
    "github.com/goravel/framework/foundation"
    contractsfoundation "github.com/goravel/framework/contracts/foundation"
    "github.com/goravel/framework/contracts/foundation/binding"
    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/foundation/application_builder.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/foundation/application.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/foundation/service_provider.go`

## Available Methods

**Service container (inside providers):**

- `app.Bind(key, func(Application) (any, error))` -- new instance per resolution
- `app.Singleton(key, func(Application) (any, error))` -- single instance
- `app.Instance(key, obj)` -- bind pre-created object
- `app.BindWith(key, func(Application, map[string]any) (any, error))` -- with parameters
- `app.Make(key)` (any, error) -- resolve
- `app.MakeWith(key, params)` (any, error) -- resolve with parameters

**Via App facade (outside providers):**

- `facades.App().Make(key)` (any, error)
- `facades.App().Bind(key, fn)`
- `facades.App().Singleton(key, fn)`
- `facades.App().SetLocale(ctx, locale)`
- `facades.App().CurrentLocale(ctx)` string
- `facades.App().IsLocale(ctx, locale)` bool
- `facades.App().Restart()` error -- used in Docker testing

**bootstrap/app.go builder:**

- `WithProviders(func() []ServiceProvider)`
- `WithConfig(func())`
- `WithRouting(func())`
- `WithMiddleware(func(Middleware))`
- `WithCommands(func() []Command)`
- `WithJobs(func() []Job)`
- `WithMigrations(func() []Migration)`
- `WithSeeders(func() []Seeder)`
- `WithEvents(func() map[Event][]Listener)`
- `WithSchedule(func() []schedule.Event)`
- `WithRules(func() []Rule)`
- `WithFilters(func() []Filter)`
- `WithRunners(func() []Runner)`
- `WithCallback(func())`
- `WithPaths(func(Paths))`
- `Create()` Application

## Implementation Example

```go
// app/providers/payment_service_provider.go
package providers

import (
    "github.com/goravel/framework/contracts/foundation"
    "github.com/goravel/framework/contracts/foundation/binding"
    "yourmodule/app/facades"
)

type PaymentServiceProvider struct{}

func (r *PaymentServiceProvider) Register(app foundation.Application) {
    // Only bind into container here. Never call facades.* here.
    app.Singleton("payment", func(app foundation.Application) (any, error) {
        return NewPaymentService(app.MakeConfig()), nil
    })
}

func (r *PaymentServiceProvider) Boot(app foundation.Application) {
    // All providers registered. Facades are safe here.
    facades.Route().Get("/payment/health", paymentController.Health)
}

// Optional: declare dependency ordering
func (r *PaymentServiceProvider) Relationship() binding.Relationship {
    return binding.Relationship{
        Bindings:     []string{"payment"},
        Dependencies: []string{binding.Config, binding.Route},
    }
}

// app/facades/payment.go
package facades

import "yourmodule/app/contracts"

func Payment() contracts.PaymentService {
    instance, err := App().Make("payment")
    if err != nil {
        panic(err)
    }
    return instance.(contracts.PaymentService)
}

// Custom runner
type QueueRunner struct{}

func (r *QueueRunner) ShouldRun() bool  { return true }
func (r *QueueRunner) Run() error       { /* start worker */ ; return nil }
func (r *QueueRunner) Shutdown() error  { /* graceful stop */ ; return nil }

// bootstrap/app.go -- full example
func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithProviders(Providers).
        WithConfig(config.Boot).
        WithRouting(func() { routes.Web() }).
        WithCallback(func() {
            facades.Gate().Define("update-post", policies.NewPostPolicy().Update)
            facades.RateLimiter().For("api", func(ctx contractshttp.Context) contractshttp.Limit {
                return httplimit.PerMinute(60).By(ctx.Request().Ip())
            })
            facades.Orm().Observe(models.User{}, &observers.UserObserver{})
        }).
        WithRunners(func() []contractsfoundation.Runner {
            return []contractsfoundation.Runner{&QueueRunner{}}
        }).
        Create()
}
```

## Rules

- `Register` binds things into the container only. Never call `facades.*` inside `Register` -- bindings from other providers may not exist yet.
- `Boot` runs after all `Register` calls complete. Facades are safe here.
- `WithCallback` runs after all `Boot` calls. Use it for gates, observers, rate limiters, Schema extensions.
- Providers without `Relationship` run after those that declare it; ordering between them is not guaranteed.
- Auto-generated artifacts (`make:command`, `make:job`, `make:rule`, etc.) self-register in `bootstrap/` files.
- `Runner.ShouldRun()` returning false skips that runner entirely.
- `facades.App().Restart()` is used in Docker tests after reconfiguring the database connection.
