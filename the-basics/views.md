# Views

[[toc]]

## Introduction

Of course, it's not practical to return entire HTML document strings directly from your routes and controllers. Thankfully, views provide a convenient way to place all of our HTML in separate files. Views separate your controller / application logic from your presentation logic and are stored in the `resources/views` directory.

## Creating & Rendering Views

When using the Goravel default template `html/template`, you can create views by adding a file with the `.tmpl` extension in the application `resources/views` directory.

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

After creating the view, you can use the `View` method to return the view from a route or controller in the application:

```go
facades.Route().Get("/", func(ctx http.Context) http.Response {
  return ctx.Response().View().Make("welcome.tmpl", map[string]any{
    "name": "Goravel",
  })
})
```

### Nested View Directories

Views may also be nested within subdirectories of the `resources/views` directory. For example, if your view is stored at `resources/views/admin/profile.tmpl`, you may return it from one of your application's routes / controllers like so:

```go
ctx.Response().View().Make("admin/profile.tmpl", map[string]any{
  "name": "Goravel",
})
```

### Creating The First Available View

Using the `First` method, you can use the first view that exists in a given array of views. This may be useful if your application or package allows views to be customized or overwritten:

```go
ctx.Response().View().First([]string{"custom/admin.tmpl", "admin.tmpl"}, map[string]any{
  "name": "Goravel",
})
```

### Determining If A View Exists

If you need to determine if a view exists, you can use the `facades.View()` method:

```go
if facades.View().Exist("welcome.tmpl") {
  // ...
}
```

## Passing Data To Views

As you saw in the previous examples, you may pass an array of data to views to make that data available to the view. Please note, the format of the passed data needs to change according to the template driver used, in the following example, using the default `html/template` driver:

```go
facades.Route().Get("/", func(ctx http.Context) http.Response {
  return ctx.Response().View().Make("welcome.tmpl", map[string]any{
    "name": "Goravel",
  })
})
```

### Sharing Data With All Views

Occasionally, you may need to share data with all views that are rendered by your application. You may do so using the `Share` method in `facades.View()`. Typically, you should place calls to the `Share` method within a service provider's `Boot` method. You are free to add them to the `app/providers/app_service_provider.go` class or generate a separate service provider to house them:

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
