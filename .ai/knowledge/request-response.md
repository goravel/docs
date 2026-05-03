# Request & Response

`ctx http.Context` exposes `.Request()` (read inputs/headers/files) and `.Response()` (write status/body/headers/cookies). Every controller method returns `http.Response`.

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/http/request.go` — `ContextRequest`, `FormRequest`, `Info`
- `contracts/http/response.go` — `ContextResponse`, `Response`, `AbortableResponse`, `Json`, `ResponseStatus`, `StreamWriter`
- `contracts/http/cookie.go` — `Cookie`
- `contracts/http/context.go` — `Context`

## Imports

```go
import (
    "github.com/goravel/framework/contracts/http"
    "github.com/goravel/framework/contracts/validation"
)
```

## Methods

### `ctx.Request()` returns `http.ContextRequest`

| Group | Methods (signature-only) |
|---|---|
| URL/route info | `Method() string`, `Path() string`, `OriginPath() string`, `Url() string`, `FullUrl() string`, `Name() string`, `Info() Info`, `Ip() string`, `Host() string` |
| Route params | `Route(key string) string`, `RouteInt(key) int`, `RouteInt64(key) int64` |
| Query string | `Query(key string, default ...string) string`, `QueryInt`, `QueryInt64`, `QueryBool`, `QueryArray(key) []string`, `QueryMap(key) map[string]string`, `Queries() map[string]string` |
| Inputs (JSON+form+query+route, in that order) | `Input(key, default...) string`, `InputInt`, `InputInt64`, `InputBool`, `InputArray(key) []string`, `InputMap(key) map[string]any`, `InputMapArray(key) []map[string]any`, `All() map[string]any` |
| Body binding | `Bind(obj any) error` (JSON body), `BindQuery(obj any) error` (query string) |
| Headers/cookies | `Header(key, default ...string) string`, `Headers() http.Header`, `Cookie(key, default ...string) string` |
| Files | `File(name string) (filesystem.File, error)`, `Files(name string) ([]filesystem.File, error)` |
| Session | `HasSession() bool`, `Session() session.Session`, `SetSession(s) ContextRequest` |
| Validation | `Validate(rules map[string]any, opts ...validation.Option) (validation.Validator, error)`, `ValidateRequest(req FormRequest) (validation.Errors, error)` |
| Flow control | `Next()` (skip current, run next middleware/handler), `Abort(code ...int)` (defaults to 400) |
| Escape hatch | `Origin() *http.Request` (raw stdlib request — avoid unless wrapping legacy code) |

### `ctx.Response()` returns `http.ContextResponse`

| Group | Methods (signature-only) |
|---|---|
| Body | `Json(code int, obj any) AbortableResponse`, `String(code int, format string, vals ...any) AbortableResponse`, `Data(code int, contentType string, data []byte) AbortableResponse`, `NoContent(code ...int) AbortableResponse` |
| Status helpers | `Success() ResponseStatus` (200), `Status(code int) ResponseStatus` |
| Files | `File(filepath string) Response`, `Download(filepath, filename string) Response` |
| Streaming | `Stream(code int, step func(w StreamWriter) error) Response` |
| Redirect | `Redirect(code int, location string) AbortableResponse` |
| Headers/cookies | `Header(key, value string) ContextResponse` (chain), `Cookie(c Cookie) ContextResponse`, `WithoutCookie(name string) ContextResponse` |
| View | `View() ResponseView` (then `.Make(view, data...)` or `.First(views, data...)`) |
| Inspect | `Origin() ResponseOrigin` (Body/Header/Size/Status), `Writer() http.ResponseWriter` (escape hatch) |
| Buffer | `Flush()` |

### `ResponseStatus` (returned by `Success()` / `Status(code)`)

`Json(obj) AbortableResponse`, `String(format, vals...) AbortableResponse`, `Data(contentType, data) AbortableResponse`, `Stream(step) Response`.

### `AbortableResponse`

Embeds `Response` (which has `Render() error`) plus `Abort() error` — used for early-termination JSON/string/data writes from middleware.

### `http.Json`

Convenience alias: `type Json map[string]any`. Use as `http.Json{"key": "value"}` for JSON response payloads.

### `FormRequest` (request validation contract)

Implement these on a struct to use with `ctx.Request().ValidateRequest(&MyForm{})`:

```go
type FormRequest interface {
    Authorize(ctx http.Context) error                   // return non-nil to deny
    Rules(ctx http.Context) map[string]any              // field → validation rule string
}
// Optional add-ons:
type FormRequestWithMessages   interface { Messages(ctx) map[string]string }
type FormRequestWithAttributes interface { Attributes(ctx) map[string]string }
type FormRequestWithFilters    interface { Filters(ctx) map[string]any }
type FormRequestWithPrepareForValidation interface { PrepareForValidation(ctx, data validation.Data) error }
```

## Config

User-owned files: `config/http.go`, `config/cors.go`, `config/session.go`. Read directly for current values.

Keys this facade reads: see `route.md` (same `http.*` and `cors.*` keys). For form size: `http.request_timeout`, `http.body_limit`, `http.header_limit` (driver-specific).

## Patterns & gotchas

- **Handlers return `http.Response`** — every controller method ends with `return ctx.Response().X(...)`. Returning `nil` is a runtime error.
- **`Bind` reads JSON body**, `BindQuery` reads query string. Use `Bind` for POST/PUT JSON, `BindQuery` for `?foo=1&bar=2` style.
- **`Input(key)` searches in order**: JSON body → form → query string → route param. Use the typed variants (`InputInt`, `InputBool`) when expecting non-string types — they parse for you.
- **`ctx.Request().Header("Authorization")`** — do NOT reach for `ctx.Request().Origin().Header.Get(...)` unless you're wrapping legacy stdlib code. The facade is the right path.
- **Response builder is chainable**: `ctx.Response().Header("X-Foo", "bar").Cookie(c).Json(200, payload)` returns `AbortableResponse`. Chain methods that return `ContextResponse` BEFORE calling a body method.
- **`Abort()` on `AbortableResponse`** is for middleware early-exit — `ctx.Response().String(401, "x").Abort()` followed by `return`. The body method comes first; `Abort()` is the terminal call.
- **`ResponseStatus` from `Success()` / `Status(code)`** is a sub-builder that doesn't take a code in its body methods: `ctx.Response().Success().Json(payload)` writes 200 + JSON.
- **`NoContent(code...)`** defaults to 204; only override if you need a different empty-body status.
- **Streaming**: `Stream(code, func(w StreamWriter) error { ... })` — write chunks via `w.Write` / `w.WriteString` and call `w.Flush()` between chunks for server-sent events.
- **File uploads**: `ctx.Request().File("avatar")` returns `filesystem.File`. Write via `facades.Storage().Disk("public").PutFile("avatars", file)`. Multi-file: `Files("photos[]")`.
- **`Validate` vs `ValidateRequest`**: inline rules → `Validate`. Reusable form struct → `ValidateRequest(&MyForm{})`. The form struct centralises rules + messages + authorisation.
- **`Origin()` is two different things**: `Request().Origin()` returns `*net/http.Request`, `Response().Origin()` returns `ResponseOrigin` (Body/Header/Size/Status inspector). Different return types, same name — check carefully.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `func (c *C) Show(ctx http.Context)` (no return) | `func (c *C) Show(ctx http.Context) http.Response` | Handlers must return Response. |
| `return nil` from a handler | `return ctx.Response().NoContent()` | nil response panics on render. |
| `ctx.Request().Origin().Header.Get("X")` | `ctx.Request().Header("X")` | Use the facade; raw `*http.Request` is an escape hatch. |
| `id, _ := strconv.Atoi(ctx.Request().Route("id"))` | `id := ctx.Request().RouteInt("id")` | Typed accessor exists; no manual parsing. |
| `ctx.Request().Bind(&form)` for query string `?foo=1` | `ctx.Request().BindQuery(&form)` | `Bind` reads JSON body, NOT query. |
| `ctx.Response().Status(200).Json(payload)` (with explicit 200) | `ctx.Response().Success().Json(payload)` | `Success()` is the 200 alias and reads cleaner. |
| `ctx.Response().Json(200, ...).Abort()` followed by code that runs | `... .Abort(); return` | Abort marks aborted but does NOT return from the handler. |
| `ctx.Response().Header(k, v); ctx.Response().Json(...)` (two statements) | `ctx.Response().Header(k, v).Json(...)` | Header returns ContextResponse — chain it. |

## Worked example: bind, validate, return JSON

```go
package controllers

import (
    "github.com/goravel/framework/contracts/http"

    "yourmodule/app/facades"
)

type CreatePostRequest struct {
    Title string `json:"title" form:"title"`
    Body  string `json:"body"  form:"body"`
}

func (r *CreatePostRequest) Authorize(ctx http.Context) error {
    return nil
}

func (r *CreatePostRequest) Rules(ctx http.Context) map[string]any {
    return map[string]any{
        "title": "required|min:5|max:120",
        "body":  "required|min:10",
    }
}

type PostController struct{}

func (r *PostController) Store(ctx http.Context) http.Response {
    var req CreatePostRequest
    errs, err := ctx.Request().ValidateRequest(&req)
    if err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }
    if errs != nil {
        return ctx.Response().Json(http.StatusUnprocessableEntity, http.Json{"errors": errs.All()})
    }
    // req.Title and req.Body are validated and bound here
    facades.Log().Info("creating post", map[string]any{"title": req.Title})
    return ctx.Response().
        Header("X-Source", "api").
        Status(http.StatusCreated).
        Json(http.Json{"data": req})
}
```

## Rules

- Every handler returns `http.Response`. Never `nil`.
- Read inputs via `ctx.Request().Input/Route/Query/Header/Cookie/Bind/BindQuery`. Avoid `Origin()` unless wrapping legacy.
- Use typed accessors (`RouteInt`, `QueryBool`, `InputInt`) when expecting non-string types.
- Chain `ctx.Response().Header(...).Cookie(...).X(...)` — the body method (Json/String/Data/etc.) is terminal.
- `Abort()` MUST be paired with explicit `return`.
- For form-style validation, prefer `FormRequest` structs over inline `Validate(map)`.
- Use `http.Json{...}` literal for JSON payloads; `http.StatusXxx` constants for status codes.
