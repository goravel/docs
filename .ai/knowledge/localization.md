# Localization

`facades.Lang(ctx)` translates keys to the current request's locale. Translations live in `lang/<locale>/*.go` (or `.json`). Pluralisation via `Choice`. Replacements via `Option.Replace`. Per-request locale switching via `SetLocale(...) context.Context` — returns a NEW context.

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/translation/translator.go` — `Translator`, `Option`, `Bool`
- `contracts/translation/loader.go` — `Loader`

## Imports

```go
import (
    "context"

    "github.com/goravel/framework/contracts/translation"

    "yourmodule/app/facades"
)
```

## Methods

### `facades.Lang(ctx context.Context)` returns `translation.Translator`

(Note: `Lang` takes `context.Context` — `http.Context` satisfies it, pass `ctx` directly.)

| Method | Signature | Notes |
|---|---|---|
| Get | `(key string, opts ...Option) string` | Translate a key. |
| Choice | `(key string, n int, opts ...Option) string` | Pluralise based on n. |
| Has | `(key string, opts ...Option) bool` | Check if a translation exists. |
| CurrentLocale | `() string` | Active locale for this ctx. |
| SetLocale | `(locale string) context.Context` | Returns a NEW ctx with the locale set. Use the returned ctx for downstream calls. |
| GetFallback | `() string` | Configured fallback locale. |
| SetFallback | `(locale string) context.Context` | Same: returns a NEW ctx. |

### `translation.Option`

```go
type Option struct {
    Fallback *bool                 // override fallback behaviour for this lookup; use translation.Bool(true)/Bool(false)
    Replace  map[string]string     // {":name": "Alice"} → replaces ":name" placeholders in the translated string
    Locale   string                // override locale just for this lookup
}

func Bool(v bool) *bool { ... }   // helper for the *bool field
```

## Config

User-owned: `config/app.go` (locale defaults), `lang/<locale>/` (translation files).

Keys this facade reads:

- `app.locale` (string) — default locale (e.g. `"en"`)
- `app.fallback_locale` (string) — used when a key is missing in the current locale

Translation file layout:

- `lang/en/messages.go` (Go map) or `lang/en/messages.json` (JSON file)
- Key path uses dot notation for nesting: `messages.welcome.title` → `messages.go` exporting `{"welcome": map[string]any{"title": "..."}}`

Greenfield default: `config/app.go` and a sample `lang/en/` from goravel-scaffold URL declared in `AGENTS.md`.

## Patterns & gotchas

- **`SetLocale` returns a NEW context** — it does NOT mutate the existing one. You must use the returned ctx for downstream calls:

  ```go
  ctx2 := facades.Lang(ctx).SetLocale("fr")
  msg := facades.Lang(ctx2).Get("welcome")
  ```

- **`facades.Lang(ctx)` takes `context.Context`** — pass `ctx http.Context` directly (it satisfies the interface).
- **Replacements use `:name` placeholders**: translation `"Hello :name"` + `Option{Replace: map[string]string{":name": "Alice"}}` → `"Hello Alice"`. Colon is the placeholder marker.
- **Pluralisation**: `Choice("messages.apple", 5)` → picks the right form based on n. Translation file value is a pipe-separated form: `"{0} no apples|{1} one apple|[2,*] :count apples"` (`{0}` zero, `{1}` one, `[2,*]` two-or-more). Replace `:count` automatically.
- **`Has(key)`** returns true if the key exists in the current locale OR fallback. To check current-locale-only, use `Option{Fallback: translation.Bool(false)}`.
- **`Option.Locale`** overrides for a single lookup — useful for emails sent in the recipient's locale rather than the current request's.
- **Missing keys** return the key itself by default (so `Get("messages.unknown")` returns `"messages.unknown"`). For strict mode, configure your loader / wrap with a panic-on-missing helper.
- **Fallback chain**: missing in current locale → check fallback → return key. Set fallback via `app.fallback_locale` config or per-request via `SetFallback`.
- **JSON vs Go translation files**: JSON is easier for translators; Go is faster + type-safe. Pick one per project.
- **In templates**: typically a `lang` template helper — `{{ lang "messages.welcome" }}`. Driver-specific.
- **Don't store the Translator**: the per-request locale lives in ctx. Re-resolve via `facades.Lang(ctx)` per call so it picks up the right locale.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `facades.Lang(ctx.Context())` | `facades.Lang(ctx)` | http.Context satisfies context.Context. |
| `facades.Lang(ctx).SetLocale("fr"); next := facades.Lang(ctx).Get("k")` | `ctx2 := facades.Lang(ctx).SetLocale("fr"); next := facades.Lang(ctx2).Get("k")` | SetLocale returns a new ctx; original is unchanged. |
| `Get("hello :name", Replace: ...)` | `Get("messages.hello", Option{Replace: map[string]string{":name": v}})` | Pass keys, not literal strings; Option is a struct. |
| `"hello {name}"` placeholder | `"hello :name"` (colon prefix) | Goravel uses `:name`, not `{name}`. |
| Cache the `Translator` instance for cross-request use | Resolve `facades.Lang(ctx)` per call | Locale is per-context; caching loses per-request switching. |
| Missing-key check via `Get("k") == "k"` | `Has("k", Option{Fallback: translation.Bool(false)})` | Has is the explicit existence check. |

## Worked example: per-request locale switch + pluralisation

```go
// lang/en/messages.go
package en

func Messages() map[string]any {
    return map[string]any{
        "welcome": "Welcome, :name",
        "apples":  "{0} no apples|{1} one apple|[2,*] :count apples",
    }
}

// lang/fr/messages.go
package fr

func Messages() map[string]any {
    return map[string]any{
        "welcome": "Bienvenue, :name",
        "apples":  "{0} pas de pommes|{1} une pomme|[2,*] :count pommes",
    }
}

// app/http/controllers/home_controller.go
package controllers

import (
    "github.com/goravel/framework/contracts/http"
    "github.com/goravel/framework/contracts/translation"

    "yourmodule/app/facades"
)

func (c *Home) Greet(ctx http.Context) http.Response {
    name := ctx.Request().Query("name", "guest")

    msg := facades.Lang(ctx).Get("messages.welcome", translation.Option{
        Replace: map[string]string{":name": name},
    })

    apples := facades.Lang(ctx).Choice("messages.apples", 5)

    return ctx.Response().Json(http.StatusOK, http.Json{
        "greeting": msg,
        "apples":   apples,
        "locale":   facades.Lang(ctx).CurrentLocale(),
    })
}

// Switch locale per request (e.g. via Accept-Language middleware)
func LocaleMiddleware(ctx http.Context) {
    if l := ctx.Request().Header("Accept-Language"); l != "" {
        ctx2 := facades.Lang(ctx).SetLocale(l)
        ctx.WithContext(ctx2)  // attach the new ctx to the request for downstream handlers
    }
    ctx.Request().Next()
}
```

## Rules

- `facades.Lang(ctx)` — pass `ctx http.Context` directly; it satisfies `context.Context`.
- `SetLocale(locale)` returns a NEW ctx — use it; don't expect the original to mutate.
- Placeholders use `:name`, NOT `{name}`. Replacements via `Option.Replace`.
- Pluralisation via `Choice(key, n)`; translation forms use `{0}|{1}|[2,*] :count …` syntax.
- Missing keys return the key itself by default. Use `Has(key, Option{Fallback: translation.Bool(false)})` for strict existence.
- Re-resolve `facades.Lang(ctx)` per call — don't cache; locale lives in ctx.
- Defaults: `app.locale`, `app.fallback_locale` in `config/app.go`.
