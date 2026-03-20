# View Facade

## Core Imports

```go
import (
    "github.com/goravel/framework/contracts/http"
    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/view/view.go`

## Available Methods

**ctx.Response().View():**

- `Make(viewName, data?)` http.Response - render template; returns full http.Response
- `First([]string, data?)` http.Response - render first existing view from list

**facades.View():**

- `Exist(name)` bool - check if template exists
- `Share(key, value)` - share data with all views (call in `WithCallback`)
- `GetShared()` map[string]any - get all shared data

## Implementation Example

```go
// resources/views/welcome.tmpl
// {{ define "welcome.tmpl" }}
// <html><body><h1>Hello, {{ .name }}!</h1></body></html>
// {{ end }}

// resources/views/admin/dashboard.tmpl
// {{ define "admin/dashboard.tmpl" }}
// <h1>Admin: {{ .appName }}</h1>
// {{ end }}

// bootstrap/app.go - share global data
// WithCallback(func() {
//     facades.View().Share("appName", "MyApp")
//     facades.View().Share("version", "1.0")
// })

package controllers

import (
    "github.com/goravel/framework/contracts/http"
    "yourmodule/app/facades"
)

type PageController struct{}

func (r *PageController) Welcome(ctx http.Context) http.Response {
    return ctx.Response().View().Make("welcome.tmpl", map[string]any{
        "name": ctx.Request().Query("name", "Guest"),
    })
}

func (r *PageController) Dashboard(ctx http.Context) http.Response {
    return ctx.Response().View().Make("admin/dashboard.tmpl", map[string]any{
        "user": "Alice",
    })
}

func (r *PageController) TryViews(ctx http.Context) http.Response {
    // Try custom theme first, fall back to default
    return ctx.Response().View().First(
        []string{"themes/custom/welcome.tmpl", "welcome.tmpl"},
        map[string]any{"name": "Guest"},
    )
}

func (r *PageController) CheckView(ctx http.Context) http.Response {
    if facades.View().Exist("maintenance.tmpl") {
        return ctx.Response().View().Make("maintenance.tmpl")
    }
    return ctx.Response().View().Make("welcome.tmpl")
}
```

### CSRF Protection

```go
// Register middleware globally or per-route
import "github.com/goravel/framework/http/middleware"

handler.Append(middleware.VerifyCsrfToken([]string{
    "api/*",       // exclude these paths from CSRF check
    "webhook/*",
}))

// In template - include the injected csrf_token variable
// <input type="hidden" name="_token" value="{{ .csrf_token }}" />
// Or in AJAX headers: X-CSRF-TOKEN: {{ .csrf_token }}
```

## Rules

- Template `define` name **must** match the string passed to `Make` exactly - including subdirectory path.
  - `Make("admin/dashboard.tmpl")` requires `{{ define "admin/dashboard.tmpl" }}` in the file.
- Default template engine: `html/template`; files use `.tmpl` extension.
- Default views directory: `resources/views/` - configurable via `paths.Resources("dir")` in `WithPaths`.
- `Share` data is global to all views; per-request data is passed via `Make`'s second argument - per-request data takes precedence on key collision.
- Call `facades.View().Share(...)` in `WithCallback`, not in `Register` or `Boot` of a provider.
- `View` facade is new in v1.17 - register `&view.ServiceProvider{}` in providers.
- CSRF token is auto-injected as `csrf_token` into view data when `VerifyCsrfToken` middleware is active.
- `VerifyCsrfToken` excludes paths by glob pattern; always exclude API and webhook endpoints.
- Custom template engine (Gin): configure `"template"` key in `config/http.go` with `gin.NewTemplate(...)`.
- `make:view welcome` generates `resources/views/welcome.tmpl` scaffold.
