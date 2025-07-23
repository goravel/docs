# 服务容器

[[toc]]

## 简介

The Goravel service container is a powerful tool for managing class dependencies and performing dependency injection. It contains all the modules of Goravel, and allows you to bind your own services to container and resolve them when needed. Goravel服务容器是一个强大的工具，用于管理类依赖和执行依赖注入。 它包含了Goravel的所有模块，并允许你将自己的服务绑定到容器中，并在需要时解析它们。
服务容器为Goravel周边的第三方包提供了强大的支持。

## 绑定

### 简单绑定

Almost all of your service container bindings will be registered within [service providers](./service-providers.md). 几乎所有的服务容器绑定都将在[服务提供者](./providers)中注册。
在服务提供者中，你始终可以通过`app`参数访问容器，然后使用`Bind`方法注册绑定，传递我们希望注册的`key`以及返回类实例的闭包：

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

如前所述，您通常会在服务提供者中与容器进行交互；但是，如果您想在服务提供者之外与容器进行交互，可以通过 `App` 门面来实现：

```go
facades.App().Bind("key", func(app foundation.Application) (any, error) {
    ...
})
```

### 单例的绑定

The `Singleton` method binds a class or interface into the container that should only be resolved one time. `Singleton` 方法将一个类或接口绑定到容器中，该类或接口只应被解析一次。 一旦单例绑定被解析，在后续对容器的调用中将返回相同的对象实例：

```go
app.Singleton(key, func(app foundation.Application) (any, error) {
    return NewGin(app.MakeConfig()), nil
})
```

### 绑定实例

您也可以使用 `Instance` 方法将现有的对象实例绑定到容器中。 在后续对容器的调用中，将始终返回给定的实例： The given instance will always be returned on subsequent calls into the container:

```go
app.Instance(key, instance)
```

### 带参数绑定

如果你需要一些额外的参数来构造服务提供者，你可以使用 `BindWith` 方法将参数传递给闭包：

```go
app.BindWith(Binding, func(app foundation.Application, parameters map[string]any) (any, error) {
    return NewRoute(app.MakeConfig()), nil
})
```

## Resolving

### `Make` 方法

你可以使用 `Make` 方法从容器中解析一个类实例。 `Make` 方法接受你想要解析的 `key`： The `Make` method accepts the `key` you wish to resolve:

```go
instance, err := app.Make(key)
```

如果你在服务提供者之外的代码位置，无法访问 `app` 变量，你可以使用 `App` 门面从容器中解析一个类实例：

```go
instance, err := facades.App().Make(key)
```

### `MakeWith` 方法

如果你的类的某些依赖项无法通过容器解析，你可以通过将它们作为关联数组传递给 `MakeWith` 方法来注入它们，这与 `BindWith` 绑定方法相对应：

```go
instance, err := app.MakeWith(key, map[string]any{"id": 1})
```

### 其他方法

框架提供了一些便捷方法来快速解析各种门面：`MakeArtisan`、`MakeAuth`、`MakeCache`、`MakeConfig`、`MakeCrypt`、`MakeEvent`、`MakeGate`、`MakeGrpc`、`MakeHash`、`MakeLog`、`MakeMail`、`MakeOrm`、`MakeQueue`、`MakeRateLimiter`、`MakeRoute`、`MakeSchedule`、`MakeStorage`、`MakeValidation`。
