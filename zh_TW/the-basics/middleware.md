# 中介軟體

[[toc]]

## 概述

中介軟體提供了一個方便的機制，用於檢查和過濾進入您應用程序的 HTTP 請求。

## 定義中介軟體

您可以在 `app/http/middleware` 目錄中創建自己的中介軟體，結構如下。

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

### 通過命令創建中介軟體

```
./artisan make:middleware Auth

// Support nested folders
./artisan make:middleware user/Auth
```

## 註冊中介軟體

### 全局中介軟體

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

### 為路由分配中介軟體

您可以單獨為某些路由註冊中介軟體：

```go
import "github.com/goravel/framework/http/middleware"

facades.Route().Middleware(middleware.Auth()).Get("users", userController.Show)  
```

## 中止請求

在中介軟體中，如果您需要中止請求，可以使用 `Abort` 方法。

```go
ctx.Request().Abort()
ctx.Request().Abort(http.StatusNotFound)
ctx.Response().String(http.StatusNotFound, "找不到").Abort()
```
