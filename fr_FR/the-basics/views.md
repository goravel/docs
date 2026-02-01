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

Views may also be nested within subdirectories of the `resources/views` directory. For example, if your view is stored at `resources/views/admin/profile.tmpl`, you can return it from one of your application's routes or controllers, note that the view needs to be defined as `define "admin/profile.tmpl"` as shown below:

```go
// resources/views/admin/profile.tmpl
{{ define "admin/profile.tmpl" }}
<h1>Welcome to the Admin Panel</h1>
{{ end }}

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

Occasionally, you may need to share data with all views that are rendered by your application. You may do so using the `Share` function in `facades.View()`. Typically, you should place calls to the `Share` function in the `bootstrap/app.go::WithCallback` function:

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

1. Register the middleware (`github.com/goravel/framework/http/middleware::VerifyCsrfToken(exceptPaths)`) to global or a specific route.
2. Add <code v-pre>{{ .csrf_token }}</code> to your form in the view file.
3. The middleware will automatically verify the token on form submission.

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
