# 服务提供者

[[toc]]

## 简介

The most important thing in the kernel boot operation is to load the `ServiceProvider`. All `ServiceProvider` under the application are configured in the `providers` array in `config/app.go`.

First, the kernel will call the `Register` method of all service providers. 首先，内核将调用所有服务提供者的 `Register` 方法。 在所有服务提供者注册完成后，内核将再次调用所有 `ServiceProvider` 的 `Boot` 方法。

`ServiceProvider` 是 Goravel 生命周期的关键。 它们使框架能够包含各种组件，如路由、数据库、队列、缓存等。 They enable the framework to contain various components, such as routing, database, queue, cache, etc.

你也可以自定义自己的提供者，它可以存储在 `app/providers` 下，并在 `config/app.go` 的 `providers` 数组中注册。

框架自带一个空白的服务提供者 `app/providers/app_service_provider.go`，你可以在其中实现简单的启动逻辑。 在更大的项目中，你可以选择创建新的服务提供者以实现更精确的控制。 In bigger projects, you have the option to create new service providers for more precise control.

ServiceProvider 中提供可选方法 `Relationship() binding.Relationship`，用来声明当前 ServicerProvider 的依赖关系，设置了该方法的 ServiceProvider 将不依赖注册顺序，未设置的 ServiceProvider 将被最后注册，例如：

```go
type ServiceProvider struct {
}

func (r *ServiceProvider) Relationship() binding.Relationship {
	return binding.Relationship{
		Bindings: []string{
			BindingSession,
		},
		Dependencies: []string{
			binding.Config,
		},
		ProvideFor: []string{
			binding.Cache,
		},
	}
}

func (r *ServiceProvider) Register(app foundation.Application) {}

func (r *ServiceProvider) Boot(app foundation.Application) {}
```
