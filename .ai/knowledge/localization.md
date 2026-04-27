# Localization Facade

## Core Imports

```go
import (
    "github.com/goravel/framework/translation"
    "github.com/goravel/framework/contracts/http"

    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/translation/translator.go`

## Available Methods

**facades.Lang(ctx):** - takes `http.Context`

- `Get(key string, opts ...translation.Option)` string - translate key
- `Choice(key string, count int, opts ...translation.Option)` string - pluralized translation

**facades.App():**

- `SetLocale(ctx http.Context, locale string)` - change locale for request
- `CurrentLocale(ctx http.Context)` string - get current locale
- `IsLocale(ctx http.Context, locale string)` bool

## Implementation Example

```go
// lang/en.json
// {
//   "welcome": "Welcome, :name!",
//   "messages": {
//     "saved": "Record saved"
//   },
//   "apples": "There is one apple|There are many apples",
//   "items": "{0} None|[1,19] Some|[20,*] Many"
// }

// lang/en/user.json  (categorized)
// { "profile": "Your profile" }

package controllers

import (
    "github.com/goravel/framework/translation"
    "github.com/goravel/framework/contracts/http"
    "yourmodule/app/facades"
)

type LangController struct{}

func (r *LangController) Index(ctx http.Context) http.Response {
    // Simple key
    msg := facades.Lang(ctx).Get("messages.saved")

    // With placeholder replacement (:name → "Alice")
    welcome := facades.Lang(ctx).Get("welcome", translation.Option{
        Replace: map[string]string{"name": "Alice"},
    })

    // Categorized file: "user/profile" = lang/en/user.json → "profile" key
    profile := facades.Lang(ctx).Get("user/profile")

    // Pluralization
    one := facades.Lang(ctx).Choice("apples", 1)   // "There is one apple"
    many := facades.Lang(ctx).Choice("apples", 5)  // "There are many apples"
    none := facades.Lang(ctx).Choice("items", 0)   // "None"

    // Switch locale per-request
    facades.App().SetLocale(ctx, "zh_CN")
    translated := facades.Lang(ctx).Get("welcome", translation.Option{
        Replace: map[string]string{"name": "Alice"},
    })

    return ctx.Response().Json(http.StatusOK, http.Json{
        "msg":        msg,
        "welcome":    welcome,
        "profile":    profile,
        "one":        one,
        "many":       many,
        "none":       none,
        "translated": translated,
    })
}
```

### Embed lang files into binary (optional)

```go
// lang/fs.go
package lang

import "embed"

//go:embed *
var FS embed.FS

// config/app.go
"lang_path": "lang",
"lang_fs":   lang.FS,
```

## Rules

- `facades.Lang(ctx)` takes `http.Context`, not `context.Context`.
- Default and fallback locale set in `config/app.go` under `locale` and `fallback_locale`.
- Lang files: flat JSON (`lang/en.json`) or categorized (`lang/en/user.json`).
- Categorized key format: `"category/key"` or `"category/nested.key"`.
- Placeholders use `:name` syntax in JSON values - replaced via `Option.Replace`.
- `Choice` pluralization formats: `"one|many"` (count 1 = first, else second); `"{0} x|[1,5] y|[6,*] z"` (range-based).
- When both file and embed exist for the same path, the file takes priority; embed is the fallback.
- `SetLocale` changes locale for the current request context only - does not affect other requests.
- Missing key returns the key string itself as fallback.
