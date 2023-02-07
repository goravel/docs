# 路由

[[toc]]

## 介绍

Goravel 路由模块可以使用 `facades.Route` 进行操作。

## 默认路由文件

所有路由文件都在 `/routes` 目录中进行定义。框架默认有一个示例路由 `/routes/web.go`，其中 `func Web()` 方法被注册到 `app/providers/route_service_provider.go` 文件中，以实现路由的绑定。

你可以在 `routes` 目录下新增路由文件，以进行更细颗粒的管理，然后在 `app/providers/route_service_provider.go` 文件中进行注册。

## 启动 HTTP 服务器

在根目录下 `main.go` 中启动 HTTP 服务器

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
    if err := facades.Route.Run(facades.Config.GetString("app.host")); err != nil {
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
		middleware.Tls(facades.Config.GetString("app.host")),
	}
}
```

### 启动服务器

```go
// main.go
if err := facades.Route.RunTLS(facades.Config.GetString("app.host"), "ca.pem", "ca.key"); err != nil {
  facades.Log.Errorf("Route run error: %v", err)
}
```

### 路由方法

| 方法       | 作用                                  |
| ---------- | ------------------------------------- |
| Run        | [启动 HTTP 服务器](#启动-HTTP-服务器) |
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
facades.Route.Static("static", "./public")
facades.Route.StaticFile("static-file", "./public/logo.png")
facades.Route.StaticFS("static-fs", nethttp.Dir("./public"))
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
