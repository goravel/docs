# Facades

[[toc]]

## 简介

`facades` provide a "static" interface for the core functionality of the application and provide a more flexible, more elegant, and easy-to-test syntax. All `facades` of Goravel are defined under the `app/facades` folder:

```go
import "app/facades"

facades.Config().GetString("app.host")
```

## facades 工作原理

Each service provider registers its corresponding bindings in the service container, then the service container providers vairous `Make*` functions to build the binding instances. The `facades` in the `app/facades` folder call these `Make*` functions to get the instances from the service container. Let's use the `Route` facade as an example:

1. The `Route` service provider registers the `binding.Route` binding in the service container:

```go
type ServiceProvider struct {}

func (r *ServiceProvider) Register(app foundation.Application) {
	app.Singleton(binding.Route, func(app foundation.Application) (any, error) {
		return NewRoute(app.MakeConfig())
	})
}

func (r *ServiceProvider) Boot(app foundation.Application) {}
```

2. The `Route` facade calls the `MakeRoute()` function to get the `Route` instance from the service container:

```go
// app/facades/route.go
package facades

import (
	"github.com/goravel/framework/contracts/route"
)

func Route() route.Route {
	return App().MakeRoute()
}
```

> Given that the `facades` is exposed to the application, you can also create your own `facades` or override the existing `facades` in the `app/facades` folder.

## Install/Uninstall Facades

[goravel/goravel](https://github.com/goravel/goravel) installs all `facades` by default and [goravel/goravel-lite](https://github.com/goravel/goravel-lite) only installs essential `facades` like `Artisan`, `Config`. You can install or uninstall other `facades` as needed via the `package:install` and `package:uninstall` commands.

```shell
# Install a specific facade
./artisan package:install Route

# Install all facades
./artisan package:install --all

# Install all facades with default drivers
./artisan package:install --all --default

# Uninstall a specific facade
./artisan package:uninstall Route
```
