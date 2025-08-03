# 服务提供者

[[toc]]

## 简介

内核启动过程中最重要的是加载 服务提供者。 应用下所有的服务提供者均被配置到了 config/app.go 文件中的 providers 数组中。

首先，内核会先调用所有服务提供者的 `Register` 方法。 首先，内核会先调用所有服务提供者的 `Register` 方法，所有服务提供者均被注册后，再次调用所有服务提供者的 `Boot` 方法。

服务提供者是 Goravel 生命周期中的关键。 服务提供者使框架可以包含各种组件，例如路由、数据库、队列、缓存等。

你也可以自定义自己的 provider，可以存放在 `app/providers` 下面，并注册到 `config/app.go` 中的 `providers` 数组中。

框架默认有一个空白的服务提供者 `app/providers/app_service_provider.go`，你可以在这里添加一些简单的引导逻辑。在大型项目中，你可以新建服务提供者以获得更细颗粒度的控制。 在大型项目中，你可以新建服务提供者以获得更细颗粒度的控制。

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
