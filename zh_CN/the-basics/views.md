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

视图也可以嵌套在目录 `resources/views` 的子目录中。 例如，如果视图存储在 `resources/views/admin/profile.tmpl`，您可以从应用程序的路由或控制器中返回它，注意视图需要定义为 `define "admin/profile.tmpl"`，如下所示：

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

使用 `View` 的 `First` 方法，您可以使用给定数组视图中第一个存在的视图。 如果您的应用程序或开发的第三方包允许定制或覆盖视图，这会非常有用：

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

有时，您可能需要与应用程序呈现的所有视图共享数据， 可以使用 `facades.View()` 的 `Share` 方法。 你可以在服务提供器的 `Boot` 方法中调用视图 `Share` 方法。 例如，可以将它们添加到 `app/providers/app_service_provider.go` 或者为它们生成一个单独的服务提供器：

```go
package providers

import (
	"github.com/goravel/framework/contracts/foundation"
    "github.com/goravel/framework/facades
)

type AppServiceProvider struct {
}

func (receiver *AppServiceProvider) Register(app foundation.Application) {
}

func (receiver *AppServiceProvider) Boot(app foundation.Application) {
    facades.View().Share("key", "value")
}
```
