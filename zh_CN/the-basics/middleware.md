# HTTP 中间件

[[toc]]

## 简介

中间件可以过滤进入应用程序的 HTTP 请求。

## 定义中间件

你可以在 `app/http/middleware` 目录中创建自己的中间件，结构如下。

```go
package middleware

import (
  "github.com/goravel/framework/contracts/http"
)

type Auth struct{}

func (a *Auth) Handle(ctx http.Context) {
  ctx.Request().Next()
}

func (a *Auth) Signature() string {
  return "auth"
}
```

### 命令创建中间件

```
./artisan make:middleware Auth

// 支持嵌套文件夹
./artisan make:middleware user/Auth
```

## 注册中间件

### 全局中间件

如果你希望为应用程序的每个 HTTP 请求应用中间件，需在 `bootstrap/app.go` 文件中的 `WithMiddleware` 函数中注册全局中间件。

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithMiddleware(func(handler configuration.Middleware) {
			handler.Append(
				middleware.Custom(),
			)
		}).
		WithConfig(config.Boot).
		Create()
}
```

`handler` 提供了多个函数来管理中间件：

- `Append(middlewares ...http.Middleware)`：将中间件追加到中间件栈的末尾。
- `GetGlobalMiddleware() []http.Middleware`：获取所有全局中间件。
- `GetRecover() func(ctx http.Context, err any)`：获取自定义恢复函数。
- `Prepend(middlewares ...http.Middleware)`：将中间件前置到中间件栈的开头。
- `Recover(fn func(ctx http.Context, err any)) Middleware`：设置自定义恢复函数以处理 panic。
- `Use(middleware ...http.Middleware) Middleware`：用给定的中间件替换当前的中间件栈。

### 为路由分配中间件

你可以为某一些路由单独注册中间件：

```go
import "github.com/goravel/framework/http/middleware"

facades.Route().Middleware(middleware.Auth()).Get("users", userController.Show)
```

### 排除中间件

`WithoutMiddleware` 方法允许特定路由绕过父级路由组已应用的某些中间件。这对于公开端点、Webhook 处理器或需要跳过身份验证或速率限制的路由非常有用。

在路由组应用 `Middleware` 后，可以在单个路由上使用 `WithoutMiddleware`：

```go
facades.Route().Middleware(middleware.Auth(), middleware.Throttle("global")).Group(func(router route.Router) {
  router.Get("/dashboard", dashboardController.Index)

  // 此路由排除了 throttle 中间件
  router.Get("/api/webhook", webhookController.Handle).
    WithoutMiddleware(middleware.Throttle("global"))
})
```

你也可以为一整个路由组排除中间件：

```go
facades.Route().Middleware(middleware.Auth()).
  WithoutMiddleware(middleware.Auth()).
  Group(func(router route.Router) {
    router.Get("/public", publicController.Index)
  })
```

> **注意**：中间件排除使用 `Signature()` 方法来识别中间件。请确保每个中间件返回唯一的签名，以便 `WithoutMiddleware` 正常工作。框架内置的中间件已经提供了唯一的签名。

## 中断请求

在中间件中，如果需要中断请求，可以使用 `Abort` 方法。

```go
ctx.Request().Abort()
ctx.Request().Abort(http.StatusNotFound)
ctx.Response().String(http.StatusNotFound, "Not Found").Abort()
```
