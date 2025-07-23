# 路由

[[toc]]

## 简介

Goravel 路由模块可以通过 `facades.Route()` 进行操作。

## HTTP 驱动

Goravel 使用 [gin](https://github.com/gin-gonic/gin) 作为其默认 HTTP 驱动。 要使用其他驱动，请在 `config/http.go` 文件中进行配置。 官方默认支持 [gin](https://github.com/gin-gonic/gin) 和 [fiber](https://github.com/gofiber/fiber)。 To use other drivers, configure them in the `config/http.go` file. The official default supports [gin](https://github.com/gin-gonic/gin) and [fiber](https://github.com/gofiber/fiber).

| 驱动    | 链接                                                                                                   |
| ----- | ---------------------------------------------------------------------------------------------------- |
| Gin   | [https://github.com/goravel/gin](https://github.com/goravel/gin)     |
| Fiber | [https://github.com/goravel/fiber](https://github.com/goravel/fiber) |

## 默认路由文件

To define routing files, simply navigate to the `/routes` directory. By default, the framework utilizes a sample route located in `/routes/web.go`. 所有路由文件都在 `/routes` 目录中进行定义。框架默认有一个示例路由 `/routes/web.go`，其中 `func Web()` 方法被注册到 `app/providers/route_service_provider.go` 文件中，以实现路由的绑定。

如果您需要更精确的管理，可以在 `/routes` 目录中添加路由文件，并在 `app/providers/route_service_provider.go` 文件中注册它们。

## 获取路由列表

使用 `route:list` 命令可以查看路由列表：

```shell
./artisan route:list
```

## 启动 HTTP 服务器

在根目录下 `main.go` 中启动 HTTP 服务器，`facades.Route().Run()` 将会自动获取 `route.host` 的配置。 This will automatically fetch the `route.host` configuration.

```go
// main.go
if err := facades.Route().RunTLSWithCert("127.0.0.1:3000", "ca.pem", "ca.key"); err != nil {
  facades.Log().Errorf("路由运行错误：%v", err)
}
```

## 关闭HTTP/HTTPS服务器

在使用HTTPS之前，请先完成`config/http.go`中`http.tls`的配置，`facades.Route().RunTLS()`方法将根据相关配置启动HTTPS服务器：

```go
// main.go
if err := facades.Route().RunTLS(); err != nil {
  facades.Log().Errorf("路由运行错误：%v", err)
}
```

你也可以使用`facades.Route().RunTLSWithCert()`方法来自定义主机和证书。

```go
package main

import (
  "github.com/goravel/framework/facades"

  "goravel/bootstrap"
)

func main() {
  // 这会引导框架并使其准备就绪。
  bootstrap.Boot()

  // 通过facades.Route()启动http服务器。
  go func() {
    if err := facades.Route().Run(); err != nil {
      facades.Log().Errorf("Route run error: %v", err)
    }
  }()

  select {}
}
```

## 启动HTTPS服务器

你可以通过调用 `Shutdown` 方法来优雅地关闭 HTTP/HTTPS 服务器，该方法会等待所有请求处理完毕后再关闭。

```go
// main.go
bootstrap.Boot()

// 创建一个通道来监听操作系统信号
quit := make(chan os.Signal)
signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

// 通过 facades.Route() 启动 http 服务器
go func() {
  if err := facades.Route().Run(); err != nil {
    facades.Log().Errorf("Route run error: %v", err)
  }
}()

// 监听操作系统信号
go func() {
  <-quit
  if err := facades.Route().Shutdown(); err != nil {
    facades.Log().Errorf("Route shutdown error: %v", err)
  }

  os.Exit(0)
}()

select {}
```

### 路由方法

| 方法                                                                                                                                                               | 操作                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Group                                                                                                                                                            | [分组路由](#group-routing)                                                                                                                     |
| Prefix                                                                                                                                                           | [路由前缀](#routing-prefix)                                                                                                                    |
| ServeHTTP                                                                                                                                                        | [测试路由](#testing-routing)                                                                                                                   |
| Get                                                                                                                                                              | [基本路由](#basic-routing)                                                                                                                     |
| Post                                                                                                                                                             | [基本路由](#basic-routing)                                                                                                                     |
| Put                                                                                                                                                              | [基本路由](#basic-routing)                                                                                                                     |
| Delete                                                                                                                                                           | [基本路由](#basic-routing)                                                                                                                     |
| Patch                                                                                                                                                            | [基本路由](#basic-routing)                                                                                                                     |
| Options                                                                                                                                                          | [基本路由](#basic-routing)                                                                                                                     |
| Any                                                                                                                                                              | [基本路由](#basic-routing)                                                                                                                     |
| Resource                                                                                                                                                         | [资源路由](#resource-routing)                                                                                                                  |
| Static                                                                                                                                                           | [文件路由](#file-routing)                                                                                                                      |
| StaticFile                                                                                                                                                       | [文件路由](#file-routing)                                                                                                                      |
| StaticFS                                                                                                                                                         | [文件路由](#file-routing)                                                                                                                      |
| Middleware                                                                                                                                                       | [中间件](#middleware)                                                                                                                         |
| Goravel 包含强大且可自定义的限流服务，您可以使用它来限制给定路由或路由组的流量。 要开始使用，您应该定义满足应用程序需求的限流器配置。 通常，这应该在应用程序的 `app/providers/route_service_provider.go` 类的 `configureRateLimiting` 方法中完成。 | 如果需要，你可以为给定的速率限制器配置返回一个速率限制数组。 每个速率限制将根据它们在数组中的顺序对路由进行评估：                                                                                  |
| Name                                                                                                                                                             | 可以使用 throttle 中间件将速率限制器附加到路由或路由组。 Throttle 中间件接受您希望分配给路由的速率限制器的名称：                                                                         |
| Info                                                                                                                                                             | 要定义路由文件，只需导航到 `/routes` 目录。 默认情况下，框架使用位于 `/routes/web.go` 的示例路由。 要建立路由绑定，`func Web()` 方法在 `app/providers/route_service_provider.go` 文件中注册。 |

## 基本路由

```go
facades.Route().Get("/", func(ctx http.Context) http.Response {
  return ctx.Response().Json(http.StatusOK, http.Json{
    "Hello": "Goravel",
  })
})
facades.Route().Post("/", userController.Show)
facades.Route().Put("/", userController.Show)
facades.Route().Delete("/", userController.Show)
facades.Route().Patch("/", userController.Show)
facades.Route().Options("/", userController.Show)
facades.Route().Any("/", userController.Show)
```

## 资源路由

```go
import "github.com/goravel/framework/contracts/http"

resourceController := NewResourceController()
facades.Route().Resource("/resource", resourceController)

type ResourceController struct{}
func NewResourceController () *ResourceController {
  return &ResourceController{}
}
// GET /resource
func (c *ResourceController) Index(ctx http.Context) {}
// GET /resource/{id}
func (c *ResourceController) Show(ctx http.Context) {}
// POST /resource
func (c *ResourceController) Store(ctx http.Context) {}
// PUT /resource/{id}
func (c *ResourceController) Update(ctx http.Context) {}
// DELETE /resource/{id}
func (c *ResourceController) Destroy(ctx http.Context) {}
```

## 分组路由

```go
facades.Route().Group(func(router route.Router) {
  router.Get("group/{id}", func(ctx http.Context) http.Response {
    return ctx.Response().Success().String(ctx.Request().Query("id", "1"))
  })
})
```

## 路由前缀

```go
facades.Route().Prefix("users").Get("/", userController.Show)
```

## 文件路由

```go
import "net/http"

facades.Route().Static("static", "./public")
facades.Route().StaticFile("static-file", "./public/logo.png")
facades.Route().StaticFS("static-fs", http.Dir("./public"))
```

## 路由参数

```go
facades.Route().Get("/input/{id}", func(ctx http.Context) http.Response {
  return ctx.Response().Success().Json(http.Json{
    "id": ctx.Request().Input("id"),
  })
})
```

详情 [请求](./requests)

## Middleware

```go
import "github.com/goravel/framework/http/middleware"

facades.Route().Middleware(middleware.Cors()).Get("users", userController.Show)
```

详情 [中间件](./middlewares)

## 获取所有路由

```go
限流器使用 `facades.RateLimiter()` 的 `For` 方法定义。 `For` 方法接受一个限流器名称和一个闭包，该闭包返回应用于分配给该限流器的路由的限制配置。
限流器名称可以是您希望的任何字符串：
```

## 设置路由名称

```go
facades.Route().Get("users", userController.Index).Name("users.index")
```

## 获取路由信息

```go
通过调用 `facades.Route().Run()` 在根目录的 `main.go` 中启动 HTTP 服务器。 这将自动获取 `route.host` 配置。
```

## 回退路由

使用 `Fallback` 方法，您可以定义一个在没有其他路由匹配传入请求时将执行的路由。

```go
facades.Route().Fallback(func(ctx http.Context) http.Response {
  return ctx.Response().String(404, "未找到")
})
```

## 速率限制

### 定义速率限制器

Goravel 包含强大且可自定义的速率限制服务，你可以利用这些服务来限制给定路由或一组路由的流量。首先，你应该定义满足应用程序需求的速率限制器配置。通常，这应该在应用程序的 `app/providers/route_service_provider.go` 文件的 `configureRateLimiting` 方法中完成。 To get started, you should define rate limiter configurations that meet your application's needs. Typically, this should be done within the `configureRateLimiting` method of your application's `app/providers/route_service_provider.go` class.

Rate limiters are defined using the `facades.RateLimiter()`'s `For` method. The `For` method accepts a rate limiter name and a closure that returns the limit configuration that should apply to routes that are assigned to the rate limiter. The rate limiter name may be any string you wish:

```go
import (
  contractshttp "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/facades"
  "github.com/goravel/framework/http/limit"
)

func (receiver *RouteServiceProvider) configureRateLimiting() {
  facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
    return limit.PerMinute(1000)
  })
}
```

如果传入的请求超过指定的速率限制，Goravel 将自动返回一个 HTTP 状态码为 429 的响应。 如果您想定义自己的速率限制响应，可以使用 response 方法： If you would like to define your own response that should be returned by a rate limit, you may use the response method:

```go
facades.RateLimiter().For("global", func(ctx http.Context) http.Limit {
  return limit.PerMinute(1000).Response(func(ctx http.Context) {
    ctx.Request().AbortWithStatus(http.StatusTooManyRequests)
  })
})
```

由于速率限制器回调接收传入的 HTTP 请求实例，您可以根据传入的请求或已认证的用户动态构建适当的速率限制：

```go
facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  // 假设
  if is_vip() {
    return limit.PerMinute(100)
  }

  return nil
})
```

#### 分段速率限制

Sometimes you may wish to segment rate limits by some arbitrary value. For example, you may wish to allow users to access a given route 100 times per minute per IP address. To accomplish this, you may use the `By` method when building your rate limit:

```go
facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  if is_vip() {
    return limit.PerMinute(100).By(ctx.Request().Ip())
  }

  return nil
})
```

为了说明这个功能，我们可以使用另一个例子，限制每分钟每个已认证用户ID访问路由100次，或者对于访客每分钟每个IP地址访问10次：

```go
facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  if userID != 0 {
    return limit.PerMinute(100).By(userID)
  }

  return limit.PerMinute(10).By(ctx.Request().Ip())
})
```

#### 多重速率限制

If needed, you may return an array of rate limits for a given rate limiter configuration. 如果需要，你可以返回给定速率限制器配置的速率限制数组。将根据路由在数组中的放置顺序评估每个速率限制：

```go
facades.RateLimiter().ForWithLimits("login", func(ctx contractshttp.Context) []contractshttp.Limit {
  return []contractshttp.Limit{
    limit.PerMinute(500),
    limit.PerMinute(100).By(ctx.Request().Ip()),
  }
})
```

### 将速率限制器附加到路由

Rate limiters may be attached to routes or route groups using the throttle middleware. 可以使用 `Throttle` middleware 将速率限制器附加到路由或路由组。路由中间件接受你希望分配给路由的速率限制器的名称：

```go
import github.com/goravel/framework/http/middleware

facades.Route().Middleware(middleware.Throttle("global")).Get("/", func(ctx http.Context) http.Response {
  return ctx.Response().Json(200, http.Json{
    "Hello": "Goravel",
  })
})
```

## 跨源资源共享 (CORS)

Goravel 默认启用了 CORS，可以在 `config/cors.go` 中修改配置。

> 有关 CORS 和 CORS 头的更多信息，请参阅 [MDN 关于 CORS 的 Web 文档](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers)。
