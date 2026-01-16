# Service Providers

[[toc]]

## Introduction

The most important thing in the kernel boot operation is to load the `ServiceProvider`. All `ServiceProvider` under the application are configured in the `bootstrap/providers.go` file.

First, the kernel will call the `Register` method of all service providers. After all service providers have been registered, the kernel will call the `Boot` method of all `ServiceProvider` again.

The `ServiceProvider` is the key to the life cycle of Goravel. They enable the framework to contain various components, such as routing, database, queue, cache, etc.

## Create Service Provider

Service providers contain a `Register` and a `Boot` method. Within the `Register` method, you should only bind things into [the service container](./service-container.md). You should never attempt to register any event listeners, routes, or any other piece of functionality within the `Register` method.

```bash
./artisan make:provider YourServiceProviderName
```

The Artisan CLI can generate a new provider via the `make:provider` command. The new service provider will be registered automatically in the `bootstrap/providers.go::Providers()` function and the function will be called by `WithProviders`.

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithProvders(Providers).
		WithConfig(config.Boot).
		Start()
}
```

## Dependency Relationship

`ServiceProvider` provides an optional method `Relationship() binding.Relationship`, used to declare the dependency relationship, the `ServiceProvider` that sets this method will not depend on the registration order, and the `ServiceProvider` that does not set it will be registered last, for example:

```go
type ServiceProvider struct {}

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

func (r *ServiceProvider) Register(app foundation.Application) {
	app.Singleton("custom", func(app foundation.Application) (any, error) {
		return New()
	})
}

func (r *ServiceProvider) Boot(app foundation.Application) {}
```

## Runners

The `ServiceProvider` can also implement the `Runners` interface to run some code when the application starts. It's usually used to start/shutdown the service which is defined in the `ServiceProvider`. For example: `Route`, `Schedule`, `Queue`, etc. You don't need to start/shutdown these services with `Runners` in the `main.go` anymore, Goravel will take care of it.

A `Runner` contains three methods: `ShouldRun()`, `Run()`, and `Shutdown()`.

```go
type Runner interface {
	// ShouldRun determines whether the runner should be executed.
	ShouldRun() bool
	// Run starts the runner.
	Run() error
	// Shutdown gracefully stops the runner.
	Shutdown() error
}
```

There is an example of a `RouteRunner` defined in the `ServiceProvider` to start and shutdown the `Route` service.

```go
type ServiceProvider struct {}

func (r *ServiceProvider) Register(app foundation.Application) {}

func (r *ServiceProvider) Boot(app foundation.Application) {}

func (r *ServiceProvider) Runners(app foundation.Application) []foundation.Runner {
	return []foundation.Runner{NewRouteRunner(app.MakeConfig(), app.MakeRoute())}
}
```

```go
package route

import (
	"github.com/goravel/framework/contracts/config"
	"github.com/goravel/framework/contracts/route"
)

type RouteRunner struct {
	config config.Config
	route  route.Route
}

func NewRouteRunner(config config.Config, route route.Route) *RouteRunner {
	return &RouteRunner{
		config: config,
		route:  route,
	}
}

func (r *RouteRunner) ShouldRun() bool {
	return r.route != nil && r.config.GetString("http.default") != ""
}

func (r *RouteRunner) Run() error {
	return r.route.Run()
}

func (r *RouteRunner) Shutdown() error {
	return r.route.Shutdown()
}
```

You can also register a single `Runner` in `bootstrap/app.go` to run some code when the application starts.

```go
func Boot() contractsfoundation.Application {
	app := foundation.Setup().
		WithConfig(config.Boot).
		Create()

	app.Start(YourRunner)

	return app
}
```
