# 视图

[[toc]]

## 简介

当然，直接从路由和控制器返回整个HTML文档字符串是不切实际的。
幸运的是，视图提供了一种便捷的方式，可以将所有HTML放在单独的文件中。 视图将控制器/应用逻辑与展示逻辑分离，并存储在`resources/views`目录中。 Thankfully, views provide a convenient way to place all of our HTML in separate files. Views separate your controller / application logic from your presentation logic and are stored in the `resources/views` directory.

## 创建和渲染视图

当使用Goravel默认模板`html/template`时，你可以通过在应用的`resources/views`目录中添加带有`.tmpl`扩展名的文件来创建视图。

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

创建视图后，你可以使用`View`方法从应用的路由或控制器中返回视图：

```go
facades.Route().Get("/", func(ctx http.Context) http.Response {
  return ctx.Response().View().Make("welcome.tmpl", map[string]any{
    "name": "Goravel",
  })
})
```

### 嵌套视图目录

Views may also be nested within subdirectories of the `resources/views` directory. 视图也可以嵌套在 `resources/views` 目录的子目录中。 例如，如果您的视图存储在 `resources/views/admin/profile.tmpl`，您可以从应用程序的路由或控制器中返回它，请注意视图需要定义为 `define "admin/profile.tmpl"`，如下所示：

```go
// resources/views/admin/profile.tmpl
{{ define "admin/profile.tmpl" }}
<h1>欢迎来到管理面板</h1>
{{ end }}

ctx.Response().View().Make("admin/profile.tmpl", map[string]any{
  "name": "Goravel",
})
```

### 创建第一个可用的视图

使用 `First` 方法，您可以使用给定视图数组中存在的第一个视图。 如果您的应用程序或包允许自定义或覆盖视图，这可能会很有用： This may be useful if your application or package allows views to be customized or overwritten:

```go
ctx.Response().View().First([]string{"custom/admin.tmpl", "admin.tmpl"}, map[string]any{
  "name": "Goravel",
})
```

### 确定视图是否存在

如果你需要确定一个视图是否存在，你可以使用 `facades.View()` 方法：

```go
if facades.View().Exist("welcome.tmpl") {
  // ...
}
```

## 向视图传递数据

As you saw in the previous examples, you may pass an array of data to views to make that data available to the view. 正如你在前面的例子中看到的，你可以向视图传递一个数据数组，使这些数据在视图中可用。
请注意，传递的数据格式需要根据所使用的模板驱动进行更改，在以下示例中，使用默认的 `html/template` 驱动：

```go
facades.Route().Get("/", func(ctx http.Context) http.Response {
  return ctx.Response().View().Make("welcome.tmpl", map[string]any{
    "name": "Goravel",
  })
})
```

### 与所有视图共享数据

Occasionally, you may need to share data with all views that are rendered by your application. 有时，你可能需要与应用程序渲染的所有视图共享数据。 你可以使用 `facades.View()` 中的 `Share` 方法来实现这一点。 通常，你应该在服务提供者的 `Boot` 方法中调用 `Share` 方法。 您可以自由地将它们添加到 `app/providers/app_service_provider.go` 类中或生成一个单独的
服务提供者来存放它们： Typically, you should place calls to the `Share` method within a service provider's `Boot` method. You are free to add them to the `app/providers/app_service_provider.go` class or generate a separate service provider to house them:

```go
package providers

import (
 "github.com/goravel/framework/contracts/foundation"
    "github.com/goravel/framework/facades"
)

type AppServiceProvider struct {
}

func (receiver *AppServiceProvider) Register(app foundation.Application) {
}

func (receiver *AppServiceProvider) Boot(app foundation.Application) {
    facades.View().Share("key", "value")
}
```
