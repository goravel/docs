# 服务容器

[[toc]]

## 简介

Goravel的服务容器是一个功能强大的工具，用于管理类依赖和实现依赖注入。 它包含了框架所有模块，并允许你将自己的服务绑定到容器中，在需要时进行解析。 服务容器为Goravel周边的第三方包提供了有力的支持。

## 绑定

### 简单绑定

几乎所有的服务容器绑定都会在 [服务提供者](./service-providers.md) 中注册。 在服务提供者中，你可以通过 `app` 参数访问容器，然后通过容器的 `Bind` 方法注册绑定，`Bind` 方法的第一个参数为要绑定 `key`，第二个参数是一个返回类实例的闭包：

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

如前所述，你通常会在服务提供者内部与容器进行交互；但是，如果你希望在服务提供者外部与容器进行交互，则可以通过 `App` facade 进行：

```go
facades.App().Bind("key", func(app foundation.Application) (any, error) {
    ...
})
```

### 单例的绑定

`Singleton` 方法将类或接口绑定到只应解析一次的容器中。 解析单例绑定后，后续调用容器时将返回相同的对象实例：

```go
app.Singleton(key, func(app foundation.Application) (any, error) {
    return NewGin(app.MakeConfig()), nil
})
```

### 绑定实例

还可以使用 `Instance` 方法将现有对象实例绑定到容器中。 给定实例将始终在后续调用容器时返回：

```go
app.Instance(key, instance)
```

### 绑定时携带参数

如果你需要一些额外的参数来构建服务实例，可以使用 `BindWith` 方法向闭包传递参数：

```go
app.BindWith(Binding, func(app foundation.Application, parameters map[string]any) (any, error) {
    return NewRoute(app.MakeConfig()), nil
})
```

## 解析

### `Make` 方法

你可以使用 `Make` 方法从容器中解析类实例。 `Make` 方法接受你希望解析的 `key`：

```go
instance, err := app.Make(key)
```

如果你在服务提供商之外的代码位置无法访问 `app` 变量，则可以使用 `App` facade 从容器解析类实例：

```go
instance, err := facades.App().Make(key)
```

### `MakeWith` 方法

如果你的某些类的依赖项无法通过容器解析，你可以通过将它们作为关联数组传递给 `MakeWith` 方法来注入它们，与之相对应的是 `BindWith` 绑定方法：

```go
instance, err := app.MakeWith(key, map[string]any{"id": 1})
```

### 其他方法

框架提供有一些便捷的方法可以快速解析出各种 `facades`: `MakeArtisan`, `MakeAuth`, `MakeCache`, `MakeConfig`, `MakeCrypt`, `MakeEvent`, `MakeGate`, `MakeGrpc`, `MakeHash`, `MakeLog`, `MakeMail`, `MakeOrm`, `MakeQueue`, `MakeRateLimiter`, `MakeRoute`, `MakeSchedule`, `MakeStorage`, `MakeValidation`.
