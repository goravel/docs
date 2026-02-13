# 视图

[[toc]]

## 简介

当然，直接从路由和控制器返回整个 HTML 文档字符串是不切实际的。 值得庆幸的是，视图提供了一种方便的方式来将我们所有的 HTML 放在单独的文件中。 视图将你的控制器 / 应用程序逻辑与你的表现逻辑分开并存储在 `resources/views` 目录中。

## 创建和渲染视图

使用框架默认模版 `html/template` 时，可以通过在应用程序 `resources/views` 目录中放置具有 `.tmpl` 扩展名的文件来创建视图。

```
// resources/views/welcome.tmpl
{{ define "welcome.tmpl" }}
<html>
  <body>
  <h1>Hello, {{ .name }}</h1>
  </body>
</html>
{{ end }}
```

创建视图后，可以使用 `View` 方法从应用程序的某个路由或控制器返回视图：

```go
facades.Route().Get("/", func(ctx http.Context) http.Response {
  return ctx.Response().View().Make("welcome.tmpl", map[string]any{
    "name": "Goravel",
  })
})
```

### 嵌套视图目录

视图也可以嵌套在目录 `resources/views` 的子目录中。 例如，如果视图存储在 `resources/views/admin/profile.tmpl`，你可以从应用程序的路由或控制器中返回它，注意视图需要定义为 `define "admin/profile.tmpl"`，如下所示：

```go
// resources/views/admin/profile.tmpl
{{ define "admin/profile.tmpl" }}
<h1>Welcome to the Admin Panel</h1>
{{ end }}

ctx.Response().View().Make("admin/profile.tmpl", map[string]any{
  "Name": "Goravel",
})
```

### 使用第一个可用视图

使用 `View` 的 `First` 方法，你可以使用给定数组视图中第一个存在的视图。 如果你的应用程序或开发的第三方包允许定制或覆盖视图，这会非常有用：

```go
ctx.Response().View().First([]string{"custom/admin.tmpl", "admin.tmpl"}, map[string]any{
  "name": "Goravel",
})
```

### 判断视图文件是否存在

如果需要判断视图文件是否存在，可以使用 `facades.View()`：

```go
if facades.View().Exist("welcome.tmpl") {
  // ...
}
```

## 向视图传递数据

正如你在前面的示例中看到的，你可以将数据数组传递给视图，以使该数据可用于视图。 请注意，传递的数据格式需要根据所使用的模版驱动而变化，在下面例子中，使用默认的 `html/template` 驱动：

```go
facades.Route().Get("/", func(ctx http.Context) http.Response {
  return ctx.Response().View().Make("welcome.tmpl", map[string]any{
    "name": "Goravel",
  })
})
```

### 与所有视图共享数据

有时，你可能需要与应用程序呈现的所有视图共享数据， 可以使用 `facades.View()` 中的 `Share` 函数。 通常，你应该将 `Share` 函数的调用放在 `bootstrap/app.go::WithCallback` 函数中：

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

## CSRF 令牌中间件

此中间件可应用于路由，以确保请求来自经过身份验证的来源，以防范跨站请求伪造（CSRF）攻击。

::: v-pre
1. 将中间件（`github.com/goravel/framework/http/middleware::VerifyCsrfToken(exceptPaths)`）注册到全局或特定路由。
2. 在视图文件中向表单添加 `<input type="hidden" name="_token" value="{{ .csrf_token }}" />`，或在请求头中添加 `X-CSRF-TOKEN={{ .csrf_token }}` 以包含 CSRF 令牌。
3. 中间件将在表单提交时自动验证令牌。
:::

## 注册自定义分隔符和函数

你可以在视图中注册自定义分隔符和函数，它们可以被注册在 `http.drivers.*.template` 配置中。

对于 gin 驱动：

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

用于 fiber 驱动：

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

## 自定义模板引擎

你可以通过实现 gin 的 `render.HTMLRender` 接口或者 fiber 的 `fiber.Views` 接口来创建自己的自定义模板引擎。 在创建自定义引擎后，你可以将它注册到配置 `http.drivers.*.template` 。

## 高级功能

模板引擎默认由 `http/template` 驱动，你可以参考其官方文档获取更多高级功能：https://pkg.go.dev/html/template
