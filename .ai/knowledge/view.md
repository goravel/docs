# View (Templates)

Render templates from `resources/views/`. Backed by Go's `html/template` (or driver). The View facade itself is small (`Exists` + Share state); rendering goes through `ctx.Response().View().Make(name, data)`.

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/view/view.go` — `View`
- `contracts/http/response.go` — `ResponseView` (returned by `ctx.Response().View()`)

## Imports

```go
import (
    "github.com/goravel/framework/contracts/http"

    "yourmodule/app/facades"
)
```

## Methods

### `facades.View()` returns `view.View`

| Method | Signature | Notes |
|---|---|---|
| Exists | `(name string) bool` | Check if a template file exists. |
| Share | `(key string, value any)` | Inject shared data available to ALL future renders. |
| Shared | `(key string, def ...any) any` | Read a shared value. |
| GetShared | `() map[string]any` | All shared data. |

### `http.ResponseView` (via `ctx.Response().View()`)

| Method | Signature | Notes |
|---|---|---|
| Make | `(view string, data ...any) Response` | Render one template. |
| First | `(views []string, data ...any) Response` | Try each template in order; render the first that exists. |

## Config

User-owned: templates live in `resources/views/`. No config keys for the View facade itself; the `goravel/gin` or `goravel/fiber` driver may have its own template-engine config (e.g. delimiters).

The render driver is the framework's default `html/template` unless replaced.

## Patterns & gotchas

- **Templates live in `resources/views/<name>.tmpl`**. Reference by name without extension: `Make("home")` → `resources/views/home.tmpl`.
- **Sub-folders**: dot or slash notation depends on driver. `Make("admin/dashboard")` is the safe portable form.
- **Data is variadic `...any`**: typically pass a `map[string]any` or a struct. The template engine reflects fields/keys.
- **`Share` injects globally**: any value set via `facades.View().Share("appVersion", "1.2.3")` is available in all templates as `{{ .appVersion }}` (or via the engine's shared-data convention). Useful for nav state, current user, asset URLs.
- **`Exists` before `Make`** when the template name is dynamic — guards against panic on missing file.
- **`First([]string, data)`** picks the first existing template — useful for layouts that fall back to a default.
- **Layouts/partials**: handled by the underlying engine. Go `html/template` supports `{{ template "name" . }}` and `{{ block "name" . }}{{ end }}`. The framework's default loader auto-loads all files in `resources/views`.
- **Escape behaviour**: Go `html/template` auto-escapes HTML by default. To inject raw HTML use `template.HTML(s)` (and only after sanitising on a security audit basis).
- **CSRF token**: include in forms via `{{ csrf_field }}` (template helper provided by session middleware), or read from `ctx.Request().Session().Token()` and inject manually.
- **Per-driver delimiters**: `goravel/fiber` uses different default delimiters than `gin`. Config it explicitly if you need consistency.
- **Don't call `View()` (the facade) from a request handler when you mean to render** — the request response builder is the renderer: `ctx.Response().View().Make(...)`. The facade is for sharing state across renders.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `return facades.View().Make("home", data)` | `return ctx.Response().View().Make("home", data)` | Render goes through the response builder; the facade only manages shared state. |
| `Make("home.tmpl", ...)` | `Make("home", ...)` | Pass the name without the file extension. |
| Inject raw HTML as a `string` | Wrap in `template.HTML(s)` after sanitising | Plain string is auto-escaped. |
| Use the facade `View().Make(...)` (doesn't exist) | Use `ResponseView.Make(...)` | Facade has only `Exists`/`Share`/`Shared`/`GetShared`. |
| Hard-code shared state in every controller | `facades.View().Share("nav", buildNav())` once at boot | Shared state is global. |

## Worked example: render with shared layout data + dynamic fallback

```go
// bootstrap/app.go (excerpt) — share global view data once at boot
// app.WithCallback(func() {
//     facades.View().Share("appName", "Goravel")
//     facades.View().Share("appVersion", "1.0.0")
// })

// app/http/controllers/home_controller.go
package controllers

import (
    "github.com/goravel/framework/contracts/http"

    "yourmodule/app/facades"
)

type HomeController struct{}

func (c *HomeController) Show(ctx http.Context) http.Response {
    return ctx.Response().View().Make("home", map[string]any{
        "title": "Welcome",
        "user":  ctx.Request().Session().Get("user"),
    })
}

// Pick the first available theme variant
func (c *HomeController) Profile(ctx http.Context) http.Response {
    return ctx.Response().View().First(
        []string{"profiles/" + ctx.Request().Route("id"), "profiles/default"},
        map[string]any{"id": ctx.Request().Route("id")},
    )
}

// Guard a dynamic template name
func (c *HomeController) Page(ctx http.Context) http.Response {
    name := ctx.Request().Route("name")
    if !facades.View().Exists("pages/" + name) {
        return ctx.Response().Json(http.StatusNotFound, http.Json{"error": "no such page"})
    }
    return ctx.Response().View().Make("pages/"+name, http.Json{})
}
```

`resources/views/home.tmpl`:

```html
<!doctype html>
<html>
<head><title>{{ .title }} - {{ .appName }}</title></head>
<body>
  <h1>Welcome, {{ if .user }}{{ .user.Name }}{{ else }}guest{{ end }}!</h1>
  <footer>v{{ .appVersion }}</footer>
</body>
</html>
```

## Rules

- Render via `ctx.Response().View().Make(name, data)` — the facade does not render.
- Reference templates by name only, not full path or extension.
- Use `Share`/`Shared` for global view state (set once at boot, available in every render).
- Use `Exists` to guard dynamic template names.
- For raw HTML, wrap in `template.HTML(s)` after sanitising — the engine auto-escapes plain strings.
- Layouts/partials use the underlying engine's syntax (`{{ template }}`/`{{ block }}` for `html/template`).
- Per-driver template delimiter quirks exist between `gin` and `fiber` — pin via driver config if cross-driver consistency matters.
