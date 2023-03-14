# 路由

[[toc]]

## 简介

Goravel 路由模块可以使用 `facades.Route` 进行操作。

## 默认路由文件

所有路由文件都在 `/routes` 目录中进行定义。框架默认有一个示例路由 `/routes/web.go`，其中 `func Web()` 方法被注册到 `app/providers/route_service_provider.go` 文件中，以实现路由的绑定。

你可以在 `routes` 目录下新增路由文件，以进行更细颗粒的管理，然后在 `app/providers/route_service_provider.go` 文件中进行注册。

## 启动 HTTP 服务器

在根目录下 `main.go` 中启动 HTTP 服务器，`facades.Route.Run()` 将会自动获取 `route.host` 的配置。

```go
package main

import (
  "github.com/goravel/framework/facades"

  "goravel/bootstrap"
)

func main() {
  //This bootstraps the framework and gets it ready for use.
  bootstrap.Boot()

  //Start http server by facades.Route.
  go func() {
    if err := facades.Route.Run(); err != nil {
      facades.Log.Errorf("Route run error: %v", err)
    }
  }()

  select {}
}
```

## 启动 HTTPS 服务器

### 注册中间件

框架内置了一个通用的中间件，您也可以根据自己需求进行自定义。

```go
// app/http/kernel.go
import "github.com/goravel/framework/http/middleware"

func (kernel *Kernel) Middleware() []http.Middleware {
  return []http.Middleware{
    middleware.Tls(),
  }
}
```

### 启动服务器

`facades.Route.RunTLS()` 将会自动获取 `route.tls` 的配置：

```go
// main.go
if err := facades.Route.RunTLS(); err != nil {
  facades.Log.Errorf("Route run error: %v", err)
}
```

您也可以使用 `facades.Route.RunTLSWithCert()` 方法，自定义 host 与 证书：

```go
// main.go
if err := facades.Route.RunTLSWithCert("127.0.0.1:3000", "ca.pem", "ca.key"); err != nil {
  facades.Log.Errorf("Route run error: %v", err)
}
```

### 路由方法

| 方法       | 作用                                  |
| ---------- | ------------------------------------- |
| Run        | [启动 HTTP 服务器](#启动-HTTP-服务器) |
| RunTLS        | [启动 HTTPS 服务器](#启动-HTTPS-服务器) |
| RunTLSWithCert        | [启动 HTTPS 服务器](#启动-HTTPS-服务器) |
| Group      | [路由分组](#路由分组)                 |
| Prefix     | [路由前缀](#路由前缀)                 |
| ServeHTTP  | [测试路由](#测试路由)                 |
| Get        | [基本路由](#基本路由)                 |
| Post       | [基本路由](#基本路由)                 |
| Put        | [基本路由](#基本路由)                 |
| Delete     | [基本路由](#基本路由)                 |
| Patch      | [基本路由](#基本路由)                 |
| Options    | [基本路由](#基本路由)                 |
| Any        | [基本路由](#基本路由)                 |
| Static     | [文件路由](#文件路由)                 |
| StaticFile | [文件路由](#文件路由)                 |
| StaticFS   | [文件路由](#文件路由)                 |
| Middleware | [中间件](#中间件)                     |

## 基本路由

```go
facades.Route.Get("/", func(ctx http.Context) {
  ctx.Response().Json(nethttp.StatusOK, http.Json{
    "Hello": "Goravel",
  })
})
facades.Route.Post("/", userController.Show)
facades.Route.Put("/", userController.Show)
facades.Route.Delete("/", userController.Show)
facades.Route.Patch("/", userController.Show)
facades.Route.Options("/", userController.Show)
facades.Route.Any("/", userController.Show)
```

## 路由分组

```go
facades.Route.Group(func(route route.Route) {
  route.Get("group/{id}", func(ctx http.Context) {
    ctx.Response().Success().String(ctx.Request().Query("id", "1"))
  })
})
```

## 路由前缀

```go
facades.Route.Prefix("users").Get("/", userController.Show)
```

## 文件路由

```go
import "net/http"

facades.Route.Static("static", "./public")
facades.Route.StaticFile("static-file", "./public/logo.png")
facades.Route.StaticFS("static-fs", http.Dir("./public"))
```

一般情况下，我们无法将文件路由定向到根目录 `/`，如果您真的想这么做，可以使用如下方式：

```go
// 安装依赖 
go get -u github.com/gin-contrib/static

// 定义中间件 app/http/middleware/static.go，然后将其注册到 app/http/kernel.go
package middleware

import (
  "github.com/gin-contrib/static"

  contractshttp "github.com/goravel/framework/contracts/http"
  frameworkhttp "github.com/goravel/framework/http"
)

func Static() contractshttp.Middleware {
  return func(ctx contractshttp.Context) {
    static.Serve("/", static.LocalFile("./public", false))(ctx.(*frameworkhttp.GinContext).Instance())

    ctx.Request().Next()
  }
}
```

## 路由传参

```go
facades.Route.Get("/input/{id}", func(ctx http.Context) {
  ctx.Response().Success().Json(http.Json{
    "id": ctx.Request().Input("id"),
  })
})
```

详见[请求](./request.md)

## 中间件

```go
import "github.com/goravel/framework/http/middleware"

facades.Route.Middleware(middleware.Cors()).Get("users", userController.Show)
```

详见[中间件](./middleware.md)

## 速率限制

### 定义速率限制器

Goravel 包含强大且可自定义的速率限制服务，你可以利用这些服务来限制给定路由或一组路由的流量。首先，你应该定义满足应用程序需求的速率限制器配置。通常，这应该在应用程序的 `app/providers/route_service_provider.go` 文件的 `configureRateLimiting` 方法中完成。

速率限制器使用 `facades.RateLimiter` 的 `For` 方法进行定义。`For` 方法接受一个速率限制器名称和一个闭包，该闭包返回应该应用于分配给速率限制器的路由的限制配置。速率限制器名称可以是你希望的任何字符串：

```go
import (
  contractshttp "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/facades"
  "github.com/goravel/framework/http/limit"
)

func (receiver *RouteServiceProvider) configureRateLimiting() {
  facades.RateLimiter.For("global", func(ctx contractshttp.Context) contractshttp.Limit {
    return limit.PerMinute(1000)
  })
}
```

如果传入的请求超过指定的速率限制，Goravel 将自动返回一个带有 429 HTTP 状态码的响应。如果你想定义自己的响应，应该由速率限制返回，你可以使用 `Response` 方法：

```go
facades.RateLimiter.For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  return limit.PerMinute(1000).Response(func(ctx contractshttp.Context) {
    ctx.Response().String(429, "Custom response...")
    return
  })
})
```

由于速率限制器回调接收传入的 HTTP 请求实例，你可以根据传入的请求或经过身份验证的用户动态构建适当的速率限制：

```go
facades.RateLimiter.For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  // 假设
  if is_vip() {
    return limit.PerMinute(100)
  }

  return nil
})
```

#### 分段速率限制

有时你可能希望按某个任意值对速率限制进行分段。例如，你可能希望每个 IP 地址每分钟允许用户访问给定路由 100 次。为此，你可以在构建速率限制时使用 `By` 方法：

```go
facades.RateLimiter.For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  if is_vip() {
    return limit.PerMinute(100).By(ctx.Request().Ip())
  }

  return nil
})
```

为了使用另一个示例来说明此功能，我们可以将每个经过身份验证的用户 ID 的路由访问限制为每分钟 100 次，或者对于访客来说，每个 IP 地址每分钟访问 10 次：

```go
facades.RateLimiter.For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  if userID != 0 {
    return limit.PerMinute(100).By(userID)
  }

  return limit.PerMinute(100).By(ctx.Request().Ip())
})
```

#### 多个速率限制

如果需要，你可以返回给定速率限制器配置的速率限制数组。将根据路由在数组中的放置顺序评估每个速率限制：

```go
facades.RateLimiter.ForWithLimits("login", func(ctx contractshttp.Context) []contractshttp.Limit {
  return []contractshttp.Limit{
    limit.PerMinute(500),
    limit.PerMinute(100).By(ctx.Request().Ip()),
  }
})
```

### 将速率限制器附加到路由

可以使用 `Throttle` middleware 将速率限制器附加到路由或路由组。路由中间件接受你希望分配给路由的速率限制器的名称：

```go
facades.Route.Middleware(middleware.Throttle("global")).Get("/", func(ctx http.Context) {
  ctx.Response().Json(200, http.Json{
    "Hello": "Goravel",
  })
})
```

## 跨域资源共享 (CORS)

Goravel 已默认启用 CORS，详细配置可以到 `config/cors.go` 文件中进行修改，该功能被作为全局中间件注册在 `app/http/kernel.go` 中。

> 有关 CORS 和 CORS 标头的更多信息，请参阅 [MDN 关于 CORS 的 Web 文档](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers)。

## 测试路由

```go
func TestHttp(t *testing.T) {
  w := httptest.NewRecorder()
  req, err := http.NewRequest("GET", "/users", nil)
  assert.Nil(t, err)
  facades.Route.ServeHTTP(w, req)
  assert.Equal(t, 200, w.Code)
  assert.Equal(t, "1", w.Body.String())
}
```
