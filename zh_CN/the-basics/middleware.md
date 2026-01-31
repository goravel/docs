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

func Auth() http.Middleware {
  return func(ctx http.Context) {
    ctx.Request().Next()
  }
}
```

### 命令创建中间件

```
./artisan make:middleware Auth

// Support nested folders
./artisan make:middleware user/Auth
```

## 注册中间件

### 全局中间件

If you want to apply middleware for every HTTP request of your application, you only need to register the middleware in the `WithMiddleware` function in the `bootstrap/app.go` file.

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

The `handler` provides multiple functions to manage middleware:

- `Append(middlewares ...http.Middleware)`: Append middleware to the end of the middleware stack.
- `GetGlobalMiddleware() []http.Middleware`: Get all global middleware.
- `GetRecover() func(ctx http.Context, err any)`: Get the custom recovery function.
- `Prepend(middlewares ...http.Middleware)`: Prepend middleware to the beginning of the middleware stack.
- `Recover(fn func(ctx http.Context, err any)) Middleware`: Set a custom recovery function to handle panics.
- `Use(middleware ...http.Middleware) Middleware`: Replace the current middleware stack with the given middleware.

### 为路由分配中间件

你可以为某一些路由单独注册中间件：

```go
import "github.com/goravel/framework/http/middleware"

facades.Route().Middleware(middleware.Auth()).Get("users", userController.Show)
```

## 中断请求

在中间件中，如果需要中断请求，可以使用 `Abort` 方法。

```go
ctx.Request().Abort()
ctx.Request().Abort(http.StatusNotFound)
ctx.Response().String(http.StatusNotFound, "Not Found").Abort()
```
