# 服务提供者

[[toc]]

## 简介

内核启动过程中最重要的是加载 服务提供者。 应用程序下的所有 `ServiceProvider` 都在 `bootstrap/providers.go` 文件中进行配置。

首先，内核会先调用所有服务提供者的 `Register` 方法。 所有服务提供者均被注册后，再次调用所有服务提供者的 `Boot` 方法。

服务提供者是 Goravel 生命周期中的关键。 服务提供者使框架可以包含各种组件，例如路由、数据库、队列、缓存等。

## 创建服务提供者

服务提供者包含`Register`和`Boot`方法。 在 `Register` 方法中，你只应该将实例绑定到[服务容器](./service-container.md)中。 不要尝试在 `Register` 方法中注册任何事件监听器、路由或其他任何功能组件。

```bash
./artisan make:provider YourServiceProviderName
```

artisan CLI可以通过`make:provider`命令生成一个新的提供者。 新的服务提供商将自动注册在 `bootstrap/providers.go::Providers()` 函数中，并且该函数将由 `WithProviders` 调用。

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithProvders(Providers).
		WithConfig(config.Boot).
		Create()
}
```

## 依赖关系

`ServiceProvider` 提供了一个可选方法 `Relationship() binding.Relationship`，用于声明依赖关系。设置了该方法的 `ServiceProvider` 不依赖于注册顺序，而未设置该方法的 `ServiceProvider` 将最后注册，例如：

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

`ServiceProvider` 也可以实现 `Runners` 接口，在应用程序启动时运行一些代码。 它通常用于启动/关闭在 `ServiceProvider` 中定义的服务。 例如：`Route`、`Schedule`、`Queue` 等。 你无需在 `main.go` 中使用 `Runners` 启动或关闭这些服务，Goravel 会你自动处理。

`Runner` 包含三个方法：`ShouldRun()`、`Run()` 和 `Shutdown()`。

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

下面是一个在 `ServiceProvider` 中定义 `RouteRunner` 的示例，用于启动和关闭 `Route` 服务。

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

你可以在 `bootstrap/app.go::WithRunners` 函数中注册自己的 `Runner`，以便在应用程序启动时运行一些代码。

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithConfig(config.Boot).
		WithRunners(func() []foundation.Runner{
			return []foundation.Runner{
				NewYourCustomRunner(),
			}
		}).
		Create()
}
```
