# Validation Facade

## Core Imports

```go
import (
    "context"
    "github.com/goravel/framework/contracts/http"
    "github.com/goravel/framework/contracts/validation"
    validationpkg "github.com/goravel/framework/validation"
    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/validation/validation.go`

## Available Methods

**Inline on request:**

- `ctx.Request().Validate(rules map[string]string, opts ...Option)` (Validator, error)
- `ctx.Request().ValidateRequest(formRequest)` (Errors, error)

**Manual:**

- `facades.Validation().Make(ctx context.Context, data any, rules map[string]string, opts...Option)` (Validator, error)
  - `ctx` is `context.Context` (use `ctx.Context()` from http.Context)
  - `data` is `map[string]any` or struct

**Validator:**

- `Fails()` bool
- `Errors().One(key?)` string - first error for optional key
- `Errors().Get(key)` map[string]string - `map[ruleName]message`
- `Errors().All()` map[string]map[string]string - `map[field]map[rule]message`
- `Errors().Has(key)` bool
- `Bind(&dest)` error - populate struct from validated data

## Implementation Example

```go
// Inline validation
package controllers

import (
    "github.com/goravel/framework/contracts/http"
    validationpkg "github.com/goravel/framework/validation"
    "yourmodule/app/facades"
)

type PostController struct{}

func (r *PostController) Store(ctx http.Context) http.Response {
    validator, err := ctx.Request().Validate(map[string]string{
        "title":       "required|max_len:255",
        "body":        "required",
        "author.name": "required",     // nested
        "tags.*":      "required|string", // slice elements
    })
    if err != nil {
        return ctx.Response().Json(http.StatusBadRequest, http.Json{"error": err.Error()})
    }
    if validator.Fails() {
        // All() returns map[field]map[rule]message
        return ctx.Response().Json(http.StatusUnprocessableEntity, validator.Errors().All())
    }
    return ctx.Response().Json(http.StatusCreated, http.Json{"ok": true})
}

// Form Request pattern
// app/http/requests/store_post_request.go
package requests

import (
    "context"
    "github.com/goravel/framework/contracts/http"
    "github.com/goravel/framework/contracts/validation"
)

type StorePostRequest struct {
    Title string `form:"title" json:"title"`
    Body  string `form:"body"  json:"body"`
}

func (r *StorePostRequest) Authorize(ctx http.Context) error { return nil }

func (r *StorePostRequest) Rules(ctx http.Context) map[string]string {
    return map[string]string{
        "title": "required|max_len:255",
        "body":  "required",
    }
}
// Optional - detected by interface assertion, no explicit declaration needed:
func (r *StorePostRequest) Messages(ctx http.Context) map[string]string {
    return map[string]string{"title.required": "Title is required"}
}
func (r *StorePostRequest) Attributes(ctx http.Context) map[string]string {
    return map[string]string{"title": "post title"}
}
func (r *StorePostRequest) Filters(ctx http.Context) map[string]string {
    return map[string]string{"title": "trim"}
}
func (r *StorePostRequest) PrepareForValidation(ctx http.Context, data validation.Data) error {
    if title, ok := data.Get("title"); ok {
        return data.Set("title", title.(string)+" [processed]")
    }
    return nil
}

// Usage:
// var req requests.StorePostRequest
// errs, err := ctx.Request().ValidateRequest(&req)
// fmt.Println(req.Title) // auto-bound after validation

// Manual with options:
// validator, _ := facades.Validation().Make(
//     ctx.Context(),  // context.Context, not http.Context
//     map[string]any{"name": "Goravel"},
//     map[string]string{"name": "required|max_len:50"},
//     validationpkg.Messages(map[string]string{"name.required": "Name is required"}),
// )
```

## Rules

- `facades.Validation().Make(ctx, ...)` - first arg is `context.Context`, use `ctx.Context()`.
- `Errors.Get(key)` returns `map[string]string` (rule -> message), NOT `[]string`.
- `Errors.All()` returns `map[string]map[string]string` (field -> rule -> message), NOT `map[string][]string`.
- `Errors.One()` with no args returns first error of any field; `One("field")` returns first error of that field.
- Custom `Rule.Passes(ctx context.Context, ...)` - `ctx` is `context.Context`, not `http.Context`.
- Custom `Rule.Message(ctx context.Context)` - `ctx` is `context.Context`.
- Custom `Filter.Handle(ctx context.Context) any` - must return a function (`func(val T) U`).
- FormRequest optional interfaces (`WithFilters`, `WithMessages`, `WithAttributes`, `WithPrepareForValidation`) - detected by interface assertion, not embedded.
- `ValidateRequest` auto-binds validated fields to struct; struct tags: `form:` or `json:`.
- Nested fields use dot notation: `"author.name"`. Slice element rules use `*`: `"tags.*"`.
- Register custom rules via `WithRules` and filters via `WithFilters` in `bootstrap/app.go`.

**Built-in rules (pipe-separated):**
`required`, `required_if:field,val`, `required_unless:field,val`, `required_with:fields`,
`required_without:fields`, `int[:min[,max]]`, `uint`, `bool`, `string[:min[,max]]`, `float`,
`in:a,b,c`, `not_in:a,b,c`, `between:min,max`, `min:val`, `max:val`, `eq:val`, `ne:val`,
`lt:val`, `gt:val`, `len:val`, `min_len:val`, `max_len:val`, `email`, `array`, `map`,
`file`, `image`, `date`, `gt_date:val`, `lt_date:val`, `alpha`, `alpha_num`, `alpha_dash`,
`json`, `number`, `full_url`, `ip`, `ipv4`, `ipv6`, `regex:pattern`, `uuid`, `uuid3`,
`uuid4`, `uuid5`, `starts_with:val`, `ends_with:val`
