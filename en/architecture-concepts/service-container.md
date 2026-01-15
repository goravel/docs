# Service Container

[[toc]]

## Introduction

The Goravel service container is a powerful tool for managing class dependencies and performing dependency injection. It contains all the modules of Goravel, and allows you to bind your own services to container and resolve them when needed. The service container provides powerful support for third-party packages around Goravel.

## Binding

### Simple Bindings

Almost all of your service container bindings will be registered within [service providers](./service-providers.md). Within a service provider, you always have access to the container via the `app` parameter, then register a binding using the `Bind` method, passing the `key` that we wish to register along with a closure that returns an instance of the class:

```go
package route

import (
	"github.com/goravel/framework/contracts/foundation"
)

const Binding = "goravel.route"

type ServiceProvider struct {
}

func (route *ServiceProvider) Register(app foundation.Application) {
	app.Bind(Binding, func(app foundation.Application) (any, error) {
		return NewRoute(app.MakeConfig()), nil
	})
}

func (route *ServiceProvider) Boot(app foundation.Application) {

}
```

As mentioned, you will typically be interacting with the container within service providers; however, if you would like to interact with the container outside of a service provider, you may do so via the `App` facade:

```go
facades.App().Bind("key", func(app foundation.Application) (any, error) {
    ...
})
```

### Binding A Singleton

The `Singleton` method binds a class or interface into the container that should only be resolved one time. Once a singleton binding is resolved, the same object instance will be returned on subsequent calls into the container:

```go
app.Singleton(key, func(app foundation.Application) (any, error) {
    return NewGin(app.MakeConfig()), nil
})
```

### Binding Instances

You may also bind an existing object instance into the container using the `Instance` method. The given instance will always be returned on subsequent calls into the container:

```go
app.Instance(key, instance)
```

### Binding With Parameter

If you need some extra parameters to construct the service provider, you can use the `BindWith` method to pass parameters to the closure:

```go
app.BindWith(Binding, func(app foundation.Application, parameters map[string]any) (any, error) {
    return NewRoute(app.MakeConfig()), nil
})
```

## Resolving

### The `Make` Method

You may use the `Make` method to resolve a class instance from the container. The `Make` method accepts the `key` you wish to resolve:

```go
instance, err := app.Make(key)
```

If you are outside of a service provider in a location of your code that does not have access to the `app` variable, you may use the `App` facade to resolve a class instance from the container:

```go
instance, err := facades.App().Make(key)
```

### The `MakeWith` Method

If some of your class's dependencies are not resolvable via the container, you may inject them by passing them as an associative array into the `MakeWith` method, corresponding to the `BindWith` binding method:

```go
instance, err := app.MakeWith(key, map[string]any{"id": 1})
```

### Other Methods

The framework provides some convenient methods to quickly resolve various facades: `MakeArtisan`, `MakeAuth`, etc.
