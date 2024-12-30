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
go run . artisan make:middleware Auth

// 支持嵌套文件夹
go run . artisan make:middleware user/Auth
```

## 注册中间件

### 全局中间件

如果你希望在应用程序的每一个 HTTP 请求应用中间件，那么只需要在 `app/http/kernel.go` 文件中的 `Middleware` 注册中间件。

```go
// app/http/kernel.go
package http

import (
  "github.com/goravel/framework/contracts/http"

  "goravel/app/http/middleware"
)

type Kernel struct {
}

func (kernel *Kernel) Middleware() []http.Middleware {
  return []http.Middleware{
    middleware.Auth(),
  }
}
```

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

<CommentService/>