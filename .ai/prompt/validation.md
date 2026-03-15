# Goravel Validation

## Inline Validation

```go
func (r *PostController) Store(ctx http.Context) http.Response {
    validator, err := ctx.Request().Validate(map[string]string{
        "title": "required|max_len:255",
        "body":  "required",
        "code":  "required|regex:^\\d{4,6}$",
    })

    if err != nil {
        return ctx.Response().Json(http.StatusBadRequest, http.Json{"error": err.Error()})
    }

    if validator.Fails() {
        return ctx.Response().Json(http.StatusUnprocessableEntity, validator.Errors().All())
    }

    var post models.Post
    err = validator.Bind(&post)
    ...
}
```

### Nested attributes (dot notation)

```go
validator, err := ctx.Request().Validate(map[string]string{
    "author.name":        "required",
    "author.description": "required",
})
```

### Array / slice validation

```go
validator, err := ctx.Request().Validate(map[string]string{
    "tags.*": "required",
})
```

---

## Form Request Validation

### Generate form request

```shell
./artisan make:request StorePostRequest
./artisan make:request user/StorePostRequest
```

### Define form request

```go
package requests

import (
    "mime/multipart"

    "github.com/goravel/framework/contracts/http"
    "github.com/goravel/framework/contracts/validation"
)

type StorePostRequest struct {
    Name  string                  `form:"name" json:"name"`
    File  *multipart.FileHeader   `form:"file" json:"file"`
    Files []*multipart.FileHeader `form:"files" json:"files"`
}

func (r *StorePostRequest) Authorize(ctx http.Context) error {
    return nil
}

func (r *StorePostRequest) Rules(ctx http.Context) map[string]string {
    return map[string]string{
        "name":    "required|max_len:255",
        "file":    "required|file",
        "files":   "required|array",
        "files.*": "required|file",
    }
}

// Optional - filter/transform input before validation
func (r *StorePostRequest) Filters(ctx http.Context) map[string]string {
    return map[string]string{
        "name": "trim",
    }
}

// Optional - custom error messages
func (r *StorePostRequest) Messages() map[string]string {
    return map[string]string{
        "name.required": "A name is required.",
    }
}

// Optional - custom attribute names in error messages
func (r *StorePostRequest) Attributes() map[string]string {
    return map[string]string{
        "name": "full name",
    }
}

// Optional - modify data before rules run
func (r *StorePostRequest) PrepareForValidation(ctx http.Context, data validation.Data) error {
    if name, exist := data.Get("name"); exist {
        return data.Set("name", strings.TrimSpace(name.(string)))
    }
    return nil
}
```

### Use form request in controller

```go
func (r *PostController) Store(ctx http.Context) http.Response {
    var storePost requests.StorePostRequest
    errors, err := ctx.Request().ValidateRequest(&storePost)

    if err != nil {
        return ctx.Response().Json(http.StatusBadRequest, http.Json{"error": err.Error()})
    }

    if errors != nil {
        return ctx.Response().Json(http.StatusUnprocessableEntity, errors.All())
    }

    // storePost.Name is populated
    fmt.Println(storePost.Name)
    ...
}
```

### Authorization in form request

```go
func (r *StorePostRequest) Authorize(ctx http.Context) error {
    var comment models.Comment
    facades.Orm().Query().First(&comment)

    if comment.ID == 0 {
        return errors.New("comment not found")
    }

    if !facades.Gate().Allows("update", map[string]any{"comment": comment}) {
        return errors.New("unauthorized")
    }

    return nil
}
```

The error from `Authorize` is returned as the first return value of `ValidateRequest`.

---

## Manual Validator

```go
import "goravel/app/facades"

validator, err := facades.Validation().Make(
    ctx,
    map[string]any{
        "name": "Goravel",
    },
    map[string]string{
        "name": "required|max_len:255",
    },
)

if validator.Fails() {
    // handle errors
}

var user models.User
err = validator.Bind(&user)
```

### Custom messages with Make

```go
import "github.com/goravel/framework/validation"

validator, err := facades.Validation().Make(ctx, input, rules,
    validation.Messages(map[string]string{
        "required":       "The :attribute field is required.",
        "email.required": "We need your email address.",
    }),
)
```

### Custom attributes with Make

```go
validator, err := facades.Validation().Make(ctx, input, rules,
    validation.Attributes(map[string]string{
        "email": "email address",
    }),
)
```

### PrepareForValidation with Make

```go
import (
    validationcontract "github.com/goravel/framework/contracts/validation"
    "github.com/goravel/framework/validation"
)

validator, err := facades.Validation().Make(ctx, input, rules,
    validation.PrepareForValidation(func(ctx http.Context, data validationcontract.Data) error {
        if name, exist := data.Get("name"); exist {
            return data.Set("name", strings.TrimSpace(name.(string)))
        }
        return nil
    }),
)
```

---

## Working with Errors

```go
// Check if any errors
if validator.Fails() {}

// One message for a field (random if multiple)
msg := validator.Errors().One("email")

// All messages for a field
msgs := validator.Errors().Get("email")

// All messages for all fields
all := validator.Errors().All()

// Check if a specific field has errors
if validator.Errors().Has("email") {}
```

---

## Bind Validated Data

```go
// Bind to struct after inline Validate
validator, err := ctx.Request().Validate(rules)
var user models.User
err = validator.Bind(&user)

// Data auto-bound when using ValidateRequest
var storePost requests.StorePostRequest
errors, err := ctx.Request().ValidateRequest(&storePost)
fmt.Println(storePost.Name)
```

---

## Available Validation Rules

| Rule | Usage |
|------|-------|
| `required` | Field must be present and not zero value |
| `required_if:field,value` | Required when another field equals value |
| `required_unless:field,value` | Required unless another field equals value |
| `required_with:foo,bar` | Required if any of the listed fields are present |
| `required_with_all:foo,bar` | Required if all of the listed fields are present |
| `required_without:foo,bar` | Required if any of the listed fields are absent |
| `required_without_all:foo,bar` | Required if all of the listed fields are absent |
| `int` | Integer type, optionally `int:min` or `int:min,max` |
| `uint` | Unsigned integer, value >= 0 |
| `bool` | Boolean string (1/0/true/false/yes/no/on/off) |
| `string` | String type, optionally `string:min` or `string:min,max` |
| `float` | Float type |
| `slice` | Slice type |
| `in:a,b,c` | Value must be in list |
| `not_in:a,b,c` | Value must not be in list |
| `starts_with:foo` | Must start with substring |
| `ends_with:foo` | Must end with substring |
| `between:min,max` | Numeric value within range |
| `min:value` | Minimum numeric value |
| `max:value` | Maximum numeric value |
| `eq:value` | Equal to value |
| `ne:value` | Not equal to value |
| `lt:value` | Less than value |
| `gt:value` | Greater than value |
| `len:value` | Exact length (string/array/slice/map) |
| `min_len:value` | Minimum length |
| `max_len:value` | Maximum length |
| `email` | Valid email address |
| `array` | Array or slice |
| `map` | Map type |
| `eq_field:field` | Equal to another field |
| `ne_field:field` | Not equal to another field |
| `gt_field:field` | Greater than another field |
| `gte_field:field` | Greater than or equal to another field |
| `lt_field:field` | Less than another field |
| `lte_field:field` | Less than or equal to another field |
| `file` | Uploaded file |
| `image` | Uploaded image file |
| `date` | Date string |
| `gt_date:value` | After given date |
| `lt_date:value` | Before given date |
| `gte_date:value` | On or after given date |
| `lte_date:value` | On or before given date |
| `alpha` | Letters only |
| `alpha_num` | Letters and numbers only |
| `alpha_dash` | Letters, numbers, dashes, underscores |
| `json` | Valid JSON string |
| `number` | Numeric string >= 0 |
| `full_url` | Full URL starting with http or https |
| `ip` | IPv4 or IPv6 |
| `ipv4` | IPv4 |
| `ipv6` | IPv6 |
| `regex:pattern` | Matches regular expression |
| `uuid` | UUID string |
| `uuid3` | UUID v3 |
| `uuid4` | UUID v4 |
| `uuid5` | UUID v5 |

---

## Available Filters

| Filter | Effect |
|--------|--------|
| `trim` / `trimSpace` | Remove surrounding whitespace |
| `ltrim` / `trimLeft` | Remove left whitespace |
| `rtrim` / `trimRight` | Remove right whitespace |
| `int` / `toInt` | Convert to int |
| `uint` / `toUint` | Convert to uint |
| `int64` / `toInt64` | Convert to int64 |
| `float` / `toFloat` | Convert to float |
| `bool` / `toBool` | Convert to bool |
| `lower` / `lowercase` | Lowercase |
| `upper` / `uppercase` | Uppercase |
| `camel` / `camelCase` | camelCase |
| `snake` / `snakeCase` | snake_case |
| `escapeHtml` / `escapeHTML` | Escape HTML |
| `str2ints` / `strToInts` | String to `[]int` |
| `str2arr` / `strToArray` | String to `[]string` |

---

## Custom Validation Rules

### Generate rule

```shell
./artisan make:rule Uppercase
```

### Define rule

```go
package rules

import (
    "context"
    "strings"

    "github.com/goravel/framework/contracts/validation"
)

type Uppercase struct{}

func (r *Uppercase) Signature() string {
    return "uppercase"
}

func (r *Uppercase) Passes(ctx context.Context, data validation.Data, val any, options ...any) bool {
    s, ok := val.(string)
    if !ok {
        return false
    }
    return strings.ToUpper(s) == s
}

func (r *Uppercase) Message(ctx context.Context) string {
    return "The :attribute must be uppercase."
}
```

### Register rules

Generated rules auto-register in `bootstrap/rules.go`. Manual registration:

```go
func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithRules(rules.Rules).
        WithConfig(config.Boot).
        Create()
}
```

Use the rule:

```go
validator, err := ctx.Request().Validate(map[string]string{
    "name": "required|uppercase",
})
```

---

## Custom Filters

### Generate filter

```shell
./artisan make:filter ToInt
```

### Define filter

```go
package filters

import (
    "context"

    "github.com/spf13/cast"
)

type ToInt struct{}

func (r *ToInt) Signature() string {
    return "ToInt"
}

func (r *ToInt) Handle(ctx context.Context) any {
    return func(val any) int {
        return cast.ToInt(val)
    }
}
```

### Register filters

```go
func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithFilters(filters.Filters).
        WithConfig(config.Boot).
        Create()
}
```

---

## Gotchas

- When using `ctx.Request().Validate(rules)` (inline), JSON-decoded `int` values arrive as `float64`. The `int` rule will fail. Fix: use `facades.Validation().Make()` instead, or add `PrepareForValidation` to convert them.
- Form fields bind as `string` by default. Use JSON if you need typed numeric or boolean fields in a form request struct.
- `Authorize()` error is distinct from validation errors. It is returned as the first return value from `ValidateRequest`, not inside `Errors()`.
- `validator.Bind()` binds all incoming data, not just the validated fields. Filter what you need after binding.
