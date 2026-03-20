# Request & Response

## Core Imports

```go
import (
    "net/http"
    "github.com/goravel/framework/contracts/http"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/http/request.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/http/response.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/http/context.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/http/cookie.go`

## Available Methods - Request

- `Path()` string - `/users/1`
- `OriginPath()` string - `/users/{id}`
- `Url()` / `FullUrl()` / `Host()` / `Method()` / `Name()` / `Ip()`
- `Info()` Info - route handler/method/name/path
- `Route(key)` string / `RouteInt` / `RouteInt64`
- `Query(key, default?)` / `QueryInt` / `QueryInt64` / `QueryBool` / `QueryArray` / `QueryMap`
- `Queries()` map[string]string - all query params
- `Input(key, default?)` - JSON > form > query > route priority
- `InputInt` / `InputInt64` / `InputBool` / `InputArray` / `InputMap` / `InputMapArray`
- `All()` map[string]any - merged JSON + form + query
- `Bind(&obj)` error - JSON or form -> struct (tags: `json:` or `form:`)
- `BindQuery(&obj)` error - query string -> struct (tags: `form:`)
- `Header(key, default?)` / `Headers()` http.Header
- `Cookie(key, default?)`
- `File(name)` (filesystem.File, error) / `Files(name)` ([]filesystem.File, error)
- `Validate(rules)` (Validator, error)
- `ValidateRequest(&formReq)` (Errors, error)
- `Next()` - advance middleware chain
- `Abort(code?)` - halt; optional status code, default 400
- `Origin()` \*http.Request - underlying stdlib request

## Available Methods - Response

- `Header(key, value)` ContextResponse - chainable, before terminal call
- `Cookie(Cookie)` ContextResponse / `WithoutCookie(name)` ContextResponse
- `Json(code, obj)` AbortableResponse
- `String(code, format, values...)` AbortableResponse
- `Data(code, contentType, []byte)` AbortableResponse
- `NoContent(code?)` AbortableResponse
- `Redirect(code, url)` AbortableResponse
- `File(path)` Response / `Download(path, name)` Response
- `Stream(code, func(StreamWriter) error)` Response
- `Success()` ResponseStatus - then `.Json(obj)` / `.String(fmt)` (no code needed)
- `Status(code)` ResponseStatus - then `.Json(obj)` / `.String(fmt)`
- `View()` ResponseView - then `.Make(name, data...)` / `.First(names, data...)`
- `Origin()` ResponseOrigin - use in after-middleware to read body/status
- `Flush()` - flush buffered data to client

## Implementation Example

```go
package controllers

import (
    "github.com/goravel/framework/contracts/http"
    "yourmodule/app/models"
)

type UserController struct{}

func (r *UserController) Show(ctx http.Context) http.Response {
    id := ctx.Request().RouteInt("id")

    var input struct {
        Name string `json:"name" form:"name"`
    }
    if err := ctx.Request().Bind(&input); err != nil {
        return ctx.Response().Json(http.StatusBadRequest, http.Json{"error": err.Error()})
    }

    validator, err := ctx.Request().Validate(map[string]string{
        "name": "required|max_len:255",
    })
    if err != nil || validator.Fails() {
        return ctx.Response().Json(http.StatusUnprocessableEntity, validator.Errors().All())
    }

    return ctx.Response().
        Header("X-ID", fmt.Sprint(id)).
        Cookie(http.Cookie{Name: "visited", Value: "1", HttpOnly: true}).
        Json(http.StatusOK, http.Json{"id": id, "name": input.Name})
}

func (r *UserController) Stream(ctx http.Context) http.Response {
    return ctx.Response().Stream(http.StatusOK, func(w http.StreamWriter) error {
        for _, chunk := range []string{"a", "b", "c"} {
            if _, err := w.WriteString(chunk); err != nil { return err }
            if err := w.Flush(); err != nil { return err }
        }
        return nil
    })
}

// Form request pattern
type StoreUserRequest struct {
    Name string `form:"name" json:"name"`
}
func (r *StoreUserRequest) Authorize(ctx http.Context) error     { return nil }
func (r *StoreUserRequest) Rules(ctx http.Context) map[string]string {
    return map[string]string{"name": "required|max_len:100"}
}
// Usage: errs, err := ctx.Request().ValidateRequest(&StoreUserRequest{})
```

## Rules

- Every handler **must** return `http.Response` - missing return type is a compile error.
- `Input` reads in priority order: JSON body > form > query > route params.
- `All()` merges JSON + form + query; does not include route params.
- `Bind` uses `json:` tags for JSON body, `form:` tags for form data.
- `BindQuery` only reads query string; struct tags must be `form:`.
- `Next()` must be called in middleware to advance the chain; omitting it halts execution.
- `Abort(code?)` halts remaining middleware and handler; default status is 400.
- `Header/Cookie/WithoutCookie` are chainable and must precede the terminal call.
- `Success()` returns `ResponseStatus` - then call `.Json(obj)` without a status code.
- `ResponseView.Make(view, data...)` takes variadic `any` (not a map argument).
- `Origin()` on response is only useful in after-middleware to inspect the final response.
- `FormRequest` optional interfaces (`WithFilters`, `WithMessages`, `WithAttributes`, `WithPrepareForValidation`) are detected by interface assertion - no explicit declaration needed.
- `AbortableResponse.Abort()` aborts the request; call it after `Json`/`String` etc.
- `ctx.WithValue(key, value)` / `ctx.Value(key)` pass data between middleware and handlers.
