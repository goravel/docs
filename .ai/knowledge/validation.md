# Validation

Two entry points: inline rules via `facades.Validation().Make(ctx, data, rules)`, or struct-based via `ctx.Request().ValidateRequest(&FormRequest{})`. Backed by `gookit/validate`. Custom rules and filters plug in via the framework's Rule/Filter contracts.

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/validation/validation.go` — `Validation`, `Validator`, `Errors`, `Data`, `Rule`, `Filter`, `Options`, `Option`
- `contracts/http/request.go` — `FormRequest`, `FormRequestWithMessages`, `FormRequestWithAttributes`, `FormRequestWithFilters`, `FormRequestWithPrepareForValidation`

## Imports

```go
import (
    "context"

    "github.com/goravel/framework/contracts/http"
    "github.com/goravel/framework/contracts/validation"

    "yourmodule/app/facades"
)
```

## Methods

### `facades.Validation()` returns `validation.Validation`

| Method | Signature | Notes |
|---|---|---|
| Make | `(ctx context.Context, data any, rules map[string]any, opts ...Option) (Validator, error)` | Build a one-off validator. `data` may be `map[string]any`, struct, JSON bytes, etc. |
| AddRules | `(rules []Rule) error` | Register custom rules (call inside `WithCallback`). |
| AddFilters | `(filters []Filter) error` | Register custom filters (call inside `WithCallback`). |
| Rules | `() []Rule` | List registered custom rules. |
| Filters | `() []Filter` | List registered custom filters. |

### `validation.Validator`

| Method | Signature | Notes |
|---|---|---|
| Bind | `(ptr any) error` | Bind validated data into a struct pointer. |
| Errors | `() Errors` | Validation errors (nil-safe pattern: check `Fails()` first). |
| Fails | `() bool` | True if any rule failed. |
| Validated | `() map[string]any` | Map of validated key→value. |

### `validation.Errors`

| Method | Signature | Notes |
|---|---|---|
| One | `(key ...string) string` | First error message for the field, or first error overall if no key. |
| Get | `(key string) map[string]string` | All messages for a field, keyed by rule name. |
| All | `() map[string]map[string]string` | All errors: field → (rule → message). |
| Has | `(key string) bool` | True if the field has any error. |

### `validation.Rule` (custom rule contract)

```go
type Rule interface {
    Signature() string                                                    // unique rule name
    Passes(ctx context.Context, data Data, val any, options ...any) bool  // true = valid
    Message(ctx context.Context) string                                   // error template
}
```

### `validation.Filter` (custom filter contract — transforms input pre-validation)

```go
type Filter interface {
    Signature() string
    // Handle returns a func that transforms input. The returned func may be:
    //   func(val T) U
    //   func(val T) (U, error)
    //   func(val T, args ...A) U
    Handle(ctx context.Context) any
}
```

### `validation.Options` / `validation.Option`

Functional-options struct for `Make`:

```go
type Options struct {
    Filters              map[string]any
    CustomFilters        []Filter
    Messages             map[string]string
    Attributes           map[string]string
    PrepareForValidation func(ctx context.Context, data Data) error
    MaxMultipartMemory   int64
}
type Option func(*Options)  // pass via Make(ctx, data, rules, opt1, opt2, ...)
```

### `http.FormRequest` (struct-based validation)

Implement on a struct, then `ctx.Request().ValidateRequest(&MyForm{})`:

```go
type FormRequest interface {
    Authorize(ctx http.Context) error                  // return non-nil to deny
    Rules(ctx http.Context) map[string]any             // field → rule string
}
// Optional add-on interfaces (implement only what you need):
FormRequestWithMessages              { Messages(ctx) map[string]string }
FormRequestWithAttributes            { Attributes(ctx) map[string]string }
FormRequestWithFilters               { Filters(ctx) map[string]any }
FormRequestWithPrepareForValidation  { PrepareForValidation(ctx, data Data) error }
```

## Common rules (gookit/validate syntax)

Pipe-separated: `"required|min:5|max:120|email"`.

| Category | Examples |
|---|---|
| Presence | `required`, `required_if:other,value`, `required_unless`, `required_with:a,b`, `required_without` |
| String | `min:N`, `max:N`, `len:N`, `email`, `url`, `alpha`, `alphaNum`, `regex:^\d+$`, `starts_with:foo`, `ends_with:bar`, `in:a,b,c`, `not_in:x,y` |
| Number | `int`, `float`, `min:N`, `max:N`, `gt:N`, `gte:N`, `lt:N`, `lte:N`, `between:N,M` |
| Date/time | `date`, `datetime`, `time`, `before:2025-01-01`, `after:2024-01-01` |
| Array/map | `array`, `map`, `slice`, `len:N`, `min_len:N`, `max_len:N` |
| File | `file`, `image`, `mime:jpeg,png`, `max_size:5mb` |
| Comparison | `same:other`, `different:other`, `confirmed` (matches `field_confirmation`) |
| Boolean | `bool`, `accepted`, `declined` |

## Config

User-owned: rules and filters are registered programmatically (no config file). Custom rules live in `app/rules/`, filters in `app/filters/` by convention.

`config/validation.go` may exist for `MaxMultipartMemory` defaults; otherwise pass via `Option`.

## Patterns & gotchas

- **`Make` takes `ctx context.Context` first** (not `http.Context`). For controllers: `facades.Validation().Make(ctx, data, rules)`. For non-HTTP code: `context.Background()`.
- **Custom Rule signatures**: `Passes(ctx context.Context, data Data, val any, options ...any) bool` — three required args + variadic. `Message(ctx context.Context) string` — takes ctx (not no-arg). Mismatched signatures won't satisfy the interface and won't register.
- **Custom Filter `Handle` returns `any`**: the returned value is the transform function. The transform can have shape `func(val) U` or `func(val) (U, error)` or `func(val, args...) U`. The framework introspects via reflection.
- **`AddRules`/`AddFilters` MUST run in `bootstrap/app.go` `WithCallback`** — registering elsewhere is silently ignored because the validator is constructed at boot.
- **Form-struct vs inline**: `FormRequest` centralises rules + messages + auth + prep in one place; reusable across endpoints. Inline `Make` is fine for one-off endpoints.
- **`Errors.Get(field)` returns `map[string]string`** (rule→message), NOT `[]string`. `Errors.All()` returns `map[string]map[string]string` (field→rule→message). Old Laravel-style flat returns don't apply.
- **`PrepareForValidation`** lets you mutate input before rules run (e.g. trim, lowercase). It receives `validation.Data` — call `data.Set(key, val)` to modify.
- **`ValidateRequest` returns `(Errors, error)`** — `error` is for system failures (panic, malformed rules); `Errors` is for actual validation failures. Check error first, then `errs != nil`.
- **`Validate(rules)`** on the request facade is the inline shortcut: returns `(Validator, error)` — call `.Fails()` to check, `.Errors()` to get them, `.Bind(&dest)` to populate.
- **Conditional rules**: `required_if:status,active` means "required when `status` field equals `active`". Multi-condition: `required_if:a,1,b,2` (AND).
- **Array element rules**: `items.*.email` validates each element of `items` array. `users.*.name` for nested arrays of objects.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `validation.Make(input, rules)` | `validation.Make(ctx, input, rules)` | First arg is `context.Context`. |
| `func (r *MyRule) Passes(data, val) bool` | `func (r *MyRule) Passes(ctx context.Context, data validation.Data, val any, options ...any) bool` | All four positions are required by the interface. |
| `func (r *MyRule) Message() string` | `func (r *MyRule) Message(ctx context.Context) string` | Message takes ctx. |
| `func (f *MyFilter) Handle() any` | `func (f *MyFilter) Handle(ctx context.Context) any` | Handle takes ctx. |
| `errs.Get("email") []string` | `errs.Get("email") map[string]string` | Returns rule→message map, not slice. |
| `errs.All() map[string][]string` | `errs.All() map[string]map[string]string` | Field → (rule → message). |
| Register custom rules in `init()` or controller | Register in `bootstrap/app.go` `WithCallback` | Validation builds at boot; runtime adds are ignored. |
| `if validator.Fails() { return errs }` (where `errs` is unset) | `if validator.Fails() { return validator.Errors().All() }` | Errors live on the validator. |

## Worked example: form request + custom rule

```go
// app/rules/uppercase.go
package rules

import (
    "context"
    "strings"

    "github.com/goravel/framework/contracts/validation"
)

type Uppercase struct{}

func (r *Uppercase) Signature() string { return "uppercase" }

func (r *Uppercase) Passes(ctx context.Context, data validation.Data, val any, options ...any) bool {
    s, ok := val.(string)
    if !ok {
        return false
    }
    return s == strings.ToUpper(s)
}

func (r *Uppercase) Message(ctx context.Context) string {
    return "The :attribute must be uppercase."
}

// bootstrap/app.go (excerpt) — register inside WithCallback
// app.WithCallback(func() {
//     _ = facades.Validation().AddRules([]validation.Rule{&rules.Uppercase{}})
// })

// app/http/requests/create_post.go
package requests

import "github.com/goravel/framework/contracts/http"

type CreatePost struct {
    Title string `json:"title" form:"title"`
    Code  string `json:"code"  form:"code"`
}

func (r *CreatePost) Authorize(ctx http.Context) error { return nil }

func (r *CreatePost) Rules(ctx http.Context) map[string]any {
    return map[string]any{
        "title": "required|min:5|max:120",
        "code":  "required|uppercase|len:6",
    }
}

func (r *CreatePost) Messages(ctx http.Context) map[string]string {
    return map[string]string{
        "code.uppercase": "Code must be all caps.",
    }
}

// app/http/controllers/post_controller.go
func (c *PostController) Store(ctx http.Context) http.Response {
    var form requests.CreatePost
    errs, err := ctx.Request().ValidateRequest(&form)
    if err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }
    if errs != nil {
        return ctx.Response().Json(http.StatusUnprocessableEntity, http.Json{"errors": errs.All()})
    }
    return ctx.Response().Status(http.StatusCreated).Json(http.Json{"data": form})
}
```

## Rules

- `Make` first arg is `context.Context` — pass `ctx` from `http.Context`.
- Custom Rule `Passes` signature: `(ctx context.Context, data validation.Data, val any, options ...any) bool`.
- Custom Rule `Message`: `(ctx context.Context) string`.
- Custom Filter `Handle`: `(ctx context.Context) any` returning a transform function.
- Register custom rules/filters in `bootstrap/app.go` `WithCallback` — never at runtime.
- `Errors.Get(field)` returns `map[string]string`; `Errors.All()` returns `map[string]map[string]string`.
- For reusable form validation, implement `FormRequest` (`Authorize` + `Rules`); add `Messages`/`Attributes`/`Filters`/`PrepareForValidation` only as needed.
- Pipe-separated rules: `"required|min:5|email"`. Conditional: `required_if:other,value`. Array element: `items.*.field`.
