# HTTP 中间件

[[toc]]

## 简介

中间件可以过滤进入应用程序的 HTTP 请求。例如 `Goravel` 提供一个 CORS 中间件，可以实现请求跨域。

## 定义中间件

你可以在 `app/http/middleware` 目录中创建自己的中间件，结构如下。

```go
package middleware

import (
  "github.com/goravel/framework/contracts/http"
)

func Cors() http.Middleware {
  return func(ctx http.Context) {
    method := ctx.Request().Method()
    origin := ctx.Request().Header("Origin", "")
    if origin != "" {
      ctx.Response().Header("Access-Control-Allow-Origin", "*")
      ctx.Response().Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")
      ctx.Response().Header("Access-Control-Allow-Headers", "*")
      ctx.Response().Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Authorization")
      ctx.Response().Header("Access-Control-Max-Age", "172800")
      ctx.Response().Header("Access-Control-Allow-Credentials", "true")
    }

    if method == "OPTIONS" {
      ctx.Request().AbortWithStatus(204)
      return
    }

    ctx.Request().Next()
  }
}

```

Goravel 中自带了一些中间件可供使用：

| 中间件                                            | 作用     |
| ------------------------------------------------- | -------- |
| github.com/goravel/framework/http/middleware/Cors | 实现跨域 |
| github.com/goravel/framework/http/middleware/Throttle | 限流器 |

### 命令创建中间件
```
go run . artisan make:middleware Cors
```

## 注册中间件

### 全局中间件

如果你希望在应用程序的每一个 HTTP 请求应用中间件，那么只需要在 `app/http/kernel.go` 文件中的 `Middleware` 注册中间件。

```go
// app/http/kernel.go
package http

import (
  "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/http/middleware"
)

type Kernel struct {
}

func (kernel *Kernel) Middleware() []http.Middleware {
  return []http.Middleware{
    middleware.Cors(),
  }
}
```

### 为路由分配中间件

你可以为某一些路由单独注册中间件：

```go
import "github.com/goravel/framework/http/middleware"

facades.Route.Middleware(middleware.Cors()).Get("users", userController.Show)
```

<CommentService/>