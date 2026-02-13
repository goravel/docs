# 檢視

[[toc]]

## 概述

當然，直接從路由和控制器返回整個 HTML 文檔字符串是不切實際的。 值得慶幸的是，檢視提供了一種方便的方式來將我們所有的 HTML 放在單獨的文件中。 檢視將你的控制器 / 應用邏輯與你的表現邏輯分開並存儲在 `resources/views` 目錄中。 幸運的是，檢視提供了一種方便的方式將我們的所有 HTML 放在單獨的文件中。 檢視將你的控制器 / 應用邏輯與你的表現邏輯分開，並存儲在 `resources/views` 目錄中。

## 創建與渲染檢視

使用框架默認模板 `html/template` 時，可以通過在應用程序 `resources/views` 目錄中放置具有 `.tmpl` 擴展名的文件來創建檢視。

```
// resources/views/welcome.tmpl
{{ define "welcome.tmpl" }}
<html>
  <body>
  <h1>你好，{{ .name }}</h1>
  </body>
</html>
{{ end }}
```

創建檢視後，你可以使用 `View` 方法從路由或控制器中返回該檢視：

```go
facades.Route().Get("/", func(ctx http.Context) http.Response {
  return ctx.Response().View().Make("welcome.tmpl", map[string]any{
    "name": "Goravel",
  })
})
```

### 嵌套檢視目錄

檢視也可以嵌套在 `resources/views` 目錄的子目錄中。 例如，如果你的檢視存儲在 `resources/views/admin/profile.tmpl`，你可以從應用程序的路由或控制器中返回它，注意檢視需要定義為 `define "admin/profile.tmpl"`，如下所示：

```go
// resources/views/admin/profile.tmpl
{{ define "admin/profile.tmpl" }}
<h1>歡迎來到管理面板</h1>
{{ end }}

ctx.Response().View().Make("admin/profile.tmpl", map[string]any{
  "name": "Goravel",
})
```

### 創建第一個可用的檢視

使用 `First` 方法，你可以使用給定數組檢視中第一個存在的檢視。 如果你的應用程式或包允許自訂或覆蓋視圖，這可能會很有用：

```go
ctx.Response().View().First([]string{"custom/admin.tmpl", "admin.tmpl"}, map[string]any{
  "name": "Goravel",
})
```

### 判斷檢視是否存在

如果需要判斷檢視文件是否存在，可以使用 `facades.View()` 方法：

```go
if facades.View().Exist("welcome.tmpl") {
  // ...
}
```

## 向檢視傳遞數據

正如你在前面的範例中看到的，你可以將數據數組傳遞給檢視，以使該數據可用於檢視。 請注意，傳遞的數據格式需要根據所使用的模板驅動而變化，在下面的範例中，使用默認的 `html/template` 驅動：

```go
facades.Route().Get("/", func(ctx http.Context) http.Response {
  return ctx.Response().View().Make("welcome.tmpl", map[string]any{
    "name": "Goravel",
  })
})
```

### 與所有檢視共享數據

有時，你可能需要與應用程序呈現的所有檢視共享數據。 You may do so using the `Share` function in `facades.View()`. Typically, you should place calls to the `Share` function in the `bootstrap/app.go::WithCallback` function:

```go
func Boot() contractsfoundation.Application {
  return foundation.Setup().
    WithConfig(config.Boot).
    WithCallback(func() {
      facades.View().Share("key", "value")
    }).
    Create()
}
```

## CSRF Token Middleware

This middleware can be applied to routes to ensure that requests are coming from authenticated sources to against Cross-Site Request Forgery (CSRF) attacks.

::: v-pre
1. Register the middleware (`github.com/goravel/framework/http/middleware::VerifyCsrfToken(exceptPaths)`) to global or a specific route.
2. Add `<input type="hidden" name="_token" value="{{ .csrf_token }}" />` to your form in the view file, or add `X-CSRF-TOKEN={{ .csrf_token }}` to your request header to include the CSRF token.
3. The middleware will automatically verify the token on form submission.
:::

## Register Custom Delims And Functions

You can register custom Delims and functions to be used within your views, they can be registered in the configuration `http.drivers.*.template`.

For the gin driver:

```go
// config/http.go
import (
  "html/template"

  "github.com/gin-gonic/gin/render"
  "github.com/goravel/gin"
)

"template": func() (render.HTMLRender, error) {
  return gin.NewTemplate(gin.RenderOptions{
    Delims: &gin.Delims{
      Left:  "{{",
      Right: "}}",
    },
    FuncMap: template.FuncMap{
      // Add custom template functions here
    },
  })
},
```

For the fiber driver:

```go
// config/http.go
import (
  "github.com/gofiber/fiber/v2"
  "github.com/gofiber/template"
  "github.com/gofiber/template/html/v2"
  "github.com/goravel/framework/support/path"
)

"template": func() (fiber.Views, error) {
  engine := &html.Engine{
    Engine: template.Engine{
      Left:       "{{",
      Right:      "}}",
      Directory:  path.Resource("views"),
      Extension:  ".tmpl",
      LayoutName: "embed",
      // Add custom template functions here
      Funcmap:    make(map[string]interface{}),
    },
  }

  engine.AddFunc(engine.LayoutName, func() error {
    return fmt.Errorf("layoutName called unexpectedly")
  })
  return engine, nil
},
```

## Custom Template Engines

You can create your own custom template engines by implementing the `render.HTMLRender` interface of gin or the `fiber.Views` interface of fiber. After creating your custom engine, you can register it to the configuration `http.drivers.*.template`.

## Advanced Features

`http/template` is the default template engine, you can refer to the official documentation for more advanced features: https://pkg.go.dev/html/template.
