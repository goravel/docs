# 路由

[[toc]]

## 简介

Goravel 路由模块可以使用 `facades.Route()` 进行操作。

## HTTP 驱动

Goravel 默认使用 [gin](https://github.com/gin-gonic/gin) 作为 HTTP 驱动。 如果想使用其他驱动，可以到 `config/http.go` 中进行配置。 目前官方默认支持 [gin](https://github.com/gin-gonic/gin) 与 [fiber](https://github.com/gofiber/fiber) 两种驱动。

| 驱动    | 链接                                                                                                   |
| ----- | ---------------------------------------------------------------------------------------------------- |
| Gin   | [https://github.com/goravel/gin](https://github.com/goravel/gin)     |
| Fiber | [https://github.com/goravel/fiber](https://github.com/goravel/fiber) |

## 默认路由文件

要定义路由文件，可以进入 `routes` 目录。 默认情况下，框架使用位于 `routes/web.go` 的示例路由，并在 `bootstrap/app.go::WithRouting` 函数中注册。

如果需要更精确的管理，你可以将路由文件添加到 `routes` 目录，并在 `bootstrap/app.go::WithRouting` 函数中注册它们。

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithRouting(func() {
	      routes.Web()
	    }).
		WithConfig(config.Boot).
		Create()
}
```

## 获取路由列表

使用 `route:list` 命令可以查看路由列表：

```shell
./artisan route:list
```

### 路由方法

| 方法         | 作用                |
| ---------- | ----------------- |
| Group      | [路由分组](#路由分组)     |
| Prefix     | [路由前缀](#路由前缀)     |
| ServeHTTP  | [测试路由](#测试路由)     |
| Get        | [基本路由](#基本路由)     |
| Post       | [基本路由](#基本路由)     |
| Put        | [基本路由](#基本路由)     |
| Delete     | [基本路由](#基本路由)     |
| Patch      | [基本路由](#基本路由)     |
| Options    | [基本路由](#基本路由)     |
| Any        | [基本路由](#基本路由)     |
| Resource   | [资源路由](#资源路由)     |
| Static     | [文件路由](#文件路由)     |
| StaticFile | [文件路由](#文件路由)     |
| StaticFS   | [文件路由](#文件路由)     |
| Middleware         | [中间件](#中间件)                   |
| WithoutMiddleware  | [排除中间件](#排除中间件)          |
| GetRoutes          | [获取所有路由](#获取所有路由)       |
| Name       | [设置路由名称](#设置路由名称) |
| Info       | [获取路由信息](#获取路由信息) |

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

## 路由分组

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

## 域名路由

### 将路由限制到某个域名

你可以使用 `Domain` 方法将路由限制为只处理指定域名的请求。没有设置域名的路由会匹配任意域名。

```go
// routes/web.go
package routes

import (
	"github.com/goravel/framework/contracts/http"
	"github.com/goravel/framework/contracts/route"

	"goravel/app/facades"
)

func Web() {
	facades.Route().Domain("admin.example.com").Group(func(router route.Router) {
		router.Get("/", func(ctx http.Context) http.Response {
			return ctx.Response().String(http.StatusOK, "admin home")
		})
	})

	facades.Route().Get("/", func(ctx http.Context) http.Response {
		return ctx.Response().String(http.StatusOK, "home")
	})
}
```

匹配时会忽略端口和大小写，所以 `Admin.Example.com:3000` 会进入第一个路由。无效的域名，例如带有协议、端口、路径或 `*` 通配符的域名，会在注册路由时触发 panic。

### 读取域名参数

用花括号包裹的一段，例如 `{account}.example.com`，会匹配域名中的一段。你可以像读取路由参数一样，通过 `Route`、`Input` 或 `All` 读取它的值：

```go
// routes/web.go
package routes

import (
	"github.com/goravel/framework/contracts/http"
	"github.com/goravel/framework/contracts/route"

	"goravel/app/facades"
)

func Web() {
	facades.Route().Domain("{account}.example.com").Group(func(router route.Router) {
		router.Get("/users/{id}", func(ctx http.Context) http.Response {
			return ctx.Response().Success().Json(http.Json{
				"account": ctx.Request().Route("account"),
				"id":      ctx.Request().Route("id"),
			})
		})
	})
}
```

```text
GET http://goravel.example.com/users/1
{"account":"goravel","id":"1"}
```

参数值为小写。一个参数只匹配一段，所以 `a.b.example.com` 不会匹配 `{account}.example.com`。当路径参数与域名参数同名时，以路径参数为准。

### 由哪个域名处理请求

请求由第一个匹配其域名的路由域名处理。先尝试没有参数的域名，再按注册顺序尝试带参数的域名，所以无论注册顺序如何，`admin.example.com` 都优先于 `{account}.example.com`。

设置了域名的路由优先于没有域名的路由。当匹配的域名没有对应路径或方法的路由时，请求会交给没有域名的路由处理，而不会交给其他域名。

`Info` 的 `Domain` 字段返回路由所限制的域名，匹配任意域名的路由该字段为空：

```go
// routes/web.go
facades.Route().Domain("admin.example.com").Get("/users", userController.Index).Name("admin.users")

info := facades.Route().Info("admin.users")
// info.Domain: "admin.example.com", info.Path: "/users"
```

::: warning 域名来自客户端
域名是根据请求的 `Host` 头匹配的，而这个头由客户端决定。不要把域名作为显示某个账户数据前的唯一检查，还需要确认用户有权访问这些数据。
:::

## 文件路由

```go
import "net/http"

facades.Route().Static("static", "./public")
facades.Route().StaticFile("static-file", "./public/logo.png")
facades.Route().StaticFS("static-fs", http.Dir("./public"))
```

## 路由传参

```go
facades.Route().Get("/input/{id}", func(ctx http.Context) http.Response {
  return ctx.Response().Success().Json(http.Json{
    "id": ctx.Request().Input("id"),
  })
})
```

详见[请求](./request.md)

## 中间件

```go
import "github.com/goravel/framework/http/middleware"

facades.Route().Middleware(middleware.Cors()).Get("users", userController.Show)
```

详见[中间件](./middleware.md)

## 排除中间件

`WithoutMiddleware` 方法允许你排除父级路由组已应用的特定中间件。这对于 Webhook 端点、公开 API 或任何需要绕过某些中间件（如身份验证或速率限制）的路由非常有用。

### 路由级排除

```go
import "github.com/goravel/framework/http/middleware"

facades.Route().Middleware(middleware.Auth(), middleware.Throttle("global")).Group(func(router route.Router) {
  // 此路由包含两个中间件
  router.Get("/dashboard", dashboardController.Index)

  // 此路由排除了 throttle 中间件
  router.Get("/api/webhook", webhookController.Handle).
    WithoutMiddleware(middleware.Throttle("global"))
})
```

### 路由组级排除

为一组路由中的所有路由排除中间件：

```go
facades.Route().Middleware(middleware.Auth()).
  WithoutMiddleware(middleware.Auth()).
  Group(func(router route.Router) {
    // 此组中的所有路由都绕过了 Auth 中间件
    router.Get("/public", publicController.Index)
    router.Get("/public/{id}", publicController.Show)
  })
```

> **注意**：中间件排除使用 `Signature()` 方法来识别中间件。请确保每个中间件返回唯一的签名，以便 `WithoutMiddleware` 正常工作。框架内置的中间件已经提供了唯一的签名。

## 获取所有路由

```go
routes := facades.Route().GetRoutes()
```

## 设置路由名称

```go
facades.Route().Get("users", userController.Index).Name("users.index")
```

## 获取路由信息

```go
route := facades.Route().Info("users.index")
```

## Fallback 路由

使用 `Fallback` 方法，你可以定义一个在没有其他路由匹配传入请求时将执行的路由。

```go
facades.Route().Fallback(func(ctx http.Context) http.Response {
  return ctx.Response().String(404, "not found")
})
```

## 速率限制

### 定义速率限制器

Goravel 包含强大且可自定义的速率限制服务，你可以利用这些服务来限制给定路由或一组路由的流量。 首先，你应定义符合应用程序需求的速率限制器配置，然后在 `bootstrap/app.go::WithCallback` 函数中注册它们。

速率限制器使用 `facades.RateLimiter()` 的 `For` 方法进行定义。 `For` 方法接受一个速率限制器名称和一个闭包，该闭包返回应该应用于分配给速率限制器的路由的限制配置。 速率限制器名称可以是你希望的任何字符串：

```go
func Boot() contractsfoundation.Application {
  return foundation.Setup().
    WithConfig(config.Boot).
    WithCallback(func() {
      facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
        return limit.PerMinute(1000)
      })
    }).
    Create()
}
```

如果传入的请求超过指定的速率限制，Goravel 将自动返回一个带有 429 HTTP 状态码的响应。 如果你想定义自己的响应，应该由速率限制返回，你可以使用 `Response` 方法：

```go
facades.RateLimiter().For("global", func(ctx http.Context) http.Limit {
  return limit.PerMinute(1000).Response(func(ctx http.Context) {
    ctx.Request().AbortWithStatus(http.StatusTooManyRequests)
  })
})
```

由于速率限制器回调接收传入的 HTTP 请求实例，你可以根据传入的请求或经过身份验证的用户动态构建适当的速率限制：

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

有时你可能希望按某个任意值对速率限制进行分段。 例如，你可能希望每个 IP 地址每分钟允许用户访问给定路由 100 次。 为此，你可以在构建速率限制时使用 `By` 方法：

```go
facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  if is_vip() {
    return limit.PerMinute(100).By(ctx.Request().Ip())
  }

  return nil
})
```

为了使用另一个示例来说明此功能，我们可以将每个经过身份验证的用户 ID 的路由访问限制为每分钟 100 次，或者对于访客来说，每个 IP 地址每分钟访问 10 次：

```go
facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  if userID != 0 {
    return limit.PerMinute(100).By(userID)
  }

  return limit.PerMinute(10).By(ctx.Request().Ip())
})
```

#### 多个速率限制

如果需要，你可以返回给定速率限制器配置的速率限制数组。 将根据路由在数组中的放置顺序评估每个速率限制：

```go
facades.RateLimiter().ForWithLimits("login", func(ctx contractshttp.Context) []contractshttp.Limit {
  return []contractshttp.Limit{
    limit.PerMinute(500),
    limit.PerMinute(100).By(ctx.Request().Ip()),
  }
})
```

### 将速率限制器附加到路由

可以使用 `Throttle` middleware 将速率限制器附加到路由或路由组。 路由中间件接受你希望分配给路由的速率限制器的名称：

```go
import github.com/goravel/framework/http/middleware

facades.Route().Middleware(middleware.Throttle("global")).Get("/", func(ctx http.Context) http.Response {
  return ctx.Response().Json(200, http.Json{
    "Hello": "Goravel",
  })
})
```

## 跨域资源共享 (CORS)

Goravel 已默认启用 CORS，详细配置可以到 `config/cors.go` 文件中进行修改。

> 有关 CORS 和 CORS 标头的更多信息，请参阅 [MDN 关于 CORS 的 Web 文档](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers)。
