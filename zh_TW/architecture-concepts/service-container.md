# 服務容器

[[toc]]

## 概述

Goravel 服務容器是一個強大的工具，用於管理類依賴關係並執行依賴注入。 它包含了 Goravel 的所有模塊，並允許你將自己的服務綁定到容器中，並在需要時解析它們。 服務容器為 Goravel 周邊的第三方包提供強大的支援。

## 綁定

### 簡單綁定

幾乎所有的服務容器綁定都會在 [服務提供者](./service-providers.md) 中註冊。 在服務提供者內，您始終可以通過 `app` 參數訪問容器，然後使用 `Bind` 方法註冊一個綁定，傳遞要註冊的 `key` 以及返回類的實例的閉包：

```go
package route

import (
  "github.com/goravel/framework/contracts/foundation"
)

const Binding = "goravel.route"

type ServiceProvider struct {}

func (route *ServiceProvider) Register(app foundation.Application) {
  app.Bind(Binding, func(app foundation.Application) (any, error) {
    return NewRoute(app.MakeConfig()), nil
  })
}

func (route *ServiceProvider) Boot(app foundation.Application) {}
```

如前所述，你通常會在服務提供者內部與容器進行交互；但是，如果你希望在服務提供者外部與容器進行交互，則可以通過 `App` facade 進行：

```go
facades.App().Bind("key", func(app foundation.Application) (any, error) {
  ...
})
```

### 單例的綁定

`Singleton` 方法將類或接口綁定到只應解析一次的容器中。 一旦單例綁定被解析，後續對容器的調用將返回相同的對象實例：

```go
app.Singleton(key, func(app foundation.Application) (any, error) {
  return NewGin(app.MakeConfig()), nil
})
```

### 綁定實例

您還可以使用 `Instance` 方法將現有對象實例綁定到容器中。 給定的實例將始終在後續調用容器時返回：

```go
app.Instance(key, instance)
```

### 綁定時攜帶參數

如果您需要一些額外的參數來構建服務提供者，可以使用 `BindWith` 方法向閉包傳遞參數：

```go
app.BindWith(Binding, func(app foundation.Application, parameters map[string]any) (any, error) {
  return NewRoute(app.MakeConfig()), nil
})
```

## 解析

### `Make` 方法

您可以使用 `Make` 方法從容器中解析類實例。 `Make` 方法接受您希望解析的 `key`：

```go
instance, err := app.Make(key)
```

如果您在服務提供者之外的代碼位置無法訪問 `app` 變量，則可以使用 `App` facade 從容器解析類實例：

```go
instance, err := facades.App().Make(key)
```

### `MakeWith` 方法

如果您的某些類的依賴項無法通過容器解析，您可以通過將它們作為關聯數組傳遞給 `MakeWith` 方法來注入它們，與之相對應的是 `BindWith` 綁定方法：

```go
instance, err := app.MakeWith(key, map[string]any{"id": 1})
```

### 其他方法

The framework provides some convenient methods to quickly resolve various facades: `MakeArtisan`, `MakeAuth`, etc.
