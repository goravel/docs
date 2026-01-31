# 路由

[[toc]]

## 概述

Goravel 路由模組可以使用 `facades.Route()` 進行操作。

## HTTP 驅動

Goravel 預設使用 [gin](https://github.com/gin-gonic/gin) 作為 HTTP 驅動。 要使用其他驅動器，請在 `config/http.go` 中配置它們。 官方預設支持 [gin](https://github.com/gin-gonic/gin) 和 [fiber](https://github.com/gofiber/fiber)。

| 驅動    | 鏈接                                                                                                   |
| ----- | ---------------------------------------------------------------------------------------------------- |
| Gin   | [https://github.com/goravel/gin](https://github.com/goravel/gin)     |
| Fiber | [https://github.com/goravel/fiber](https://github.com/goravel/fiber) |

## 預設路由檔案

To define routing files, simply navigate to the `routes` directory. By default, the framework utilizes a sample route located in `routes/web.go` and it is registered in the `bootstrap/app.go::WithRouting` function.

If you require more precise management, you can add routing files to the `routes` directory and register them in the `bootstrap/app.go::WithRouting` function as well.

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

## Get Routes List

使用 `route:list` 命令來查看路由列表：

```shell
./artisan route:list
```

### 路由方法

| 方法名       | 操作                |
| --------- | ----------------- |
| 分組        | [群組路由](#群組路由)     |
| 前綴        | [路由前綴](#路由前綴)     |
| ServeHTTP | [測試路由](#測試路由)     |
| 獲取        | [基本路由](#基本路由)     |
| Post      | [基本路由](#基本路由)     |
| 放         | [基本路由](#基本路由)     |
| 刪除        | [基本路由](#基本路由)     |
| 補丁        | [基本路由](#基本路由)     |
| 選項        | [基本路由](#基本路由)     |
| 任何        | [基本路由](#基本路由)     |
| 資源        | [資源路由](#資源路由)     |
| 靜態        | [文件路由](#文件路由)     |
| 靜態檔案      | [文件路由](#文件路由)     |
| 靜態文件系統    | [文件路由](#文件路由)     |
| 中介軟體      | [中間件](#中間件)       |
| 獲取路由      | [獲取所有路由](#獲取所有路由) |
| 名稱        | [設定路由名稱](#設定路由名稱) |
| 資訊        | [獲取路由資訊](#獲取路由資訊) |

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

## 資源路由

```go
import "github.com/goravel/framework/contracts/http"

resourceController := NewResourceController()
facades.Route().Resource("/resource", resourceController)

type ResourceController struct{}
func NewResourceController () *ResourceController {
  return &ResourceController{}
}
// 獲取 /resource
func (c *ResourceController) Index(ctx http.Context) {}
// 獲取 /resource/{id}
func (c *ResourceController) Show(ctx http.Context) {}
// 發送 /resource
func (c *ResourceController) Store(ctx http.Context) {}
// 更新 /resource/{id}
func (c *ResourceController) Update(ctx http.Context) {}
// 刪除 /resource/{id}
func (c *ResourceController) Destroy(ctx http.Context) {}
```

## 路由分組

```go
facades.Route().Group(func(router route.Router) {
  router.Get("group/{id}", func(ctx http.Context) http.Response {
    return ctx.Response().Success().String(ctx.Request().Query("id", "1"))
  })
})
```

## 路由前綴

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

## 路由參數

```go
facades.Route().Get("/input/{id}", func(ctx http.Context) http.Response {
  return ctx.Response().Success().Json(http.Json{
    "id": ctx.Request().Input("id"),
  })
})
```

詳見[請求](./request.md)

## 中介軟體

```go
import "github.com/goravel/framework/http/middleware"

facades.Route().Middleware(middleware.Cors()).Get("users", userController.Show)
```

詳見[中間件](./middleware.md)

## 獲取所有路由

```go
routes := facades.Route().GetRoutes()
```

## 設定路由名稱

```go
facades.Route().Get("users", userController.Index).Name("users.index")
```

## 獲取路由資訊

```go
route := facades.Route().Info("users.index")
```

## Fallback 路由

使用 `Fallback` 方法，你可以定義一個在沒有其他路由匹配傳入請求時將執行的路由。

```go
facades.Route().Fallback(func(ctx http.Context) http.Response {
  return ctx.Response().String(404, "未找到")
})
```

## 速率限制

### 定義速率限制器

Goravel 包含強大且可自訂的速率限制服務，你可以利用這些服務來限制給定路由或一組路由的流量。 首先，你應該定義滿足應用需求的速率限制器配置。 通常，這應在應用的 `app/providers/route_service_provider.go` 檔案的 `configureRateLimiting` 方法中完成。 To get started, you should define rate limiter configurations that meet your application's needs, then register them in the `bootstrap/app.go::WithCallback` function.

速率限制器是使用 `facades.RateLimiter()` 的 `For` 方法來定義的。 `For` 方法接受速率限制器名稱和返回應用於指派給速率限制器的路由的限制配置的閉包。 速率限制器名稱可以是您希望的任何字串：

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

如果傳入的請求超過指定的速率限制，Goravel 將自動返回一個帶有 429 HTTP 狀態碼的響應。 如果你想定義自己的響應以由速率限制返回，你可以使用響應方法：

```go
facades.RateLimiter().For("global", func(ctx http.Context) http.Limit {
  return limit.PerMinute(1000).Response(func(ctx http.Context) {
    ctx.Request().AbortWithStatus(http.StatusTooManyRequests)
  })
})
```

由於速率限制器回調接收傳入的 HTTP 請求實例，你可以根據傳入的請求或經過身份驗證的用戶動態構建適當的速率限制：

```go
facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  // 假設
  if is_vip() {
    return limit.PerMinute(100)
  }

  return nil
})
```

#### 分段速率限制

有時你可能希望按某些任意值分段速率限制。 例如，你可能希望允許用戶每分鐘每個 IP 地址訪問給定路由 100 次。 為了實現這一點，你可以在構建速率限制時使用 `By` 方法：

```go
facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  if is_vip() {
    return limit.PerMinute(100).By(ctx.Request().Ip())
  }

  return nil
})
```

為了使用另一個示例來說明此功能，我們可以將每個經過身份驗證的用戶 ID 的路由訪問限制為每分鐘 100 次，或者對於訪客，每個 IP 地址每分鐘訪問 10 次：

```go
facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  if userID != 0 {
    return limit.PerMinute(100).By(userID)
  }

  return limit.PerMinute(10).By(ctx.Request().Ip())
})
```

#### 多個速率限制

如果需要，你可以返回一個速率限制數組以進行特定的速率限制器配置。 每個速率限制將根據它們在數組中的排列順序進行評估：

```go
facades.RateLimiter().ForWithLimits("login", func(ctx contractshttp.Context) []contractshttp.Limit {
  return []contractshttp.Limit{
    limit.PerMinute(500),
    limit.PerMinute(100).By(ctx.Request().Ip()),
  }
})
```

### 將速率限制器附加到路由

速率限制器可以通過使用 throttle 中介附件附加到路由或路由組。 throttle 中介接受你希望分配給路由的速率限制器的名稱：

```go
import github.com/goravel/framework/http/middleware

facades.Route().Middleware(middleware.Throttle("global")).Get("/", func(ctx http.Context) http.Response {
  return ctx.Response().Json(200, http.Json{
    "Hello": "Goravel",
  })
})
```

## 跨域資源共享 (CORS)

Goravel 已預設啟用 CORS，詳細配置可以到 `config/cors.go` 文件中進行修改。

> 有關 CORS 和 CORS 標頭的更多信息，請參閱 [MDN 關於 CORS 的 Web 文檔](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers)。
