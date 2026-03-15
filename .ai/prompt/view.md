# Goravel Views

## Template Files

Default template engine: `html/template`. Files use `.tmpl` extension, stored in `resources/views/` (configurable via `WithPaths`).

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

Nested views:

```
// resources/views/admin/profile.tmpl
{{ define "admin/profile.tmpl" }}
<h1>Welcome to the Admin Panel</h1>
{{ end }}
```

---

## Rendering Views

```go
facades.Route().Get("/", func(ctx http.Context) http.Response {
    return ctx.Response().View().Make("welcome.tmpl", map[string]any{
        "name": "Goravel",
    })
})
```

Nested view:

```go
return ctx.Response().View().Make("admin/profile.tmpl", map[string]any{
    "name": "Goravel",
})
```

First available view:

```go
return ctx.Response().View().First([]string{"custom/admin.tmpl", "admin.tmpl"}, map[string]any{
    "name": "Goravel",
})
```

---

## Check View Exists

```go
if facades.View().Exist("welcome.tmpl") {
    // ...
}
```

---

## Sharing Data With All Views

Call in `WithCallback` in `bootstrap/app.go`:

```go
WithCallback(func() {
    facades.View().Share("appName", "MyApp")
    facades.View().Share("version", "1.0")
})
```

---

## CSRF Token Middleware (v1.17)

1. Register `middleware.VerifyCsrfToken(exceptPaths)` globally or on specific routes.
2. Include the CSRF token in forms:

```html
<input type="hidden" name="_token" value="{{ .csrf_token }}" />
```

Or in request headers:

```
X-CSRF-TOKEN: {{ .csrf_token }}
```

Registration:

```go
import "github.com/goravel/framework/http/middleware"

handler.Append(middleware.VerifyCsrfToken([]string{
    "api/*",
    "webhook/*",
}))
```

---

## Custom Delimiters and Functions (Gin Driver)

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
            "upper": strings.ToUpper,
        },
    })
},
```

---

## Custom Template Engine (Fiber Driver)

```go
// config/http.go
import (
    "github.com/gofiber/fiber/v2"
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
            Funcmap:    make(map[string]interface{}),
        },
    }
    engine.AddFunc(engine.LayoutName, func() error {
        return fmt.Errorf("layoutName called unexpectedly")
    })
    return engine, nil
},
```

---

## Gotchas

- View template `define` name must match the path passed to `Make`. Nested views must use `define "admin/profile.tmpl"` to match the `Make("admin/profile.tmpl", ...)` call.
- `Share` data is available in all views; per-request data is passed via `Make`'s second argument.
- View resources directory is configurable via `paths.Resources("views-root")` in `WithPaths`.
