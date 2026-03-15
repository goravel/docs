# Goravel Localization

## Language File Structure

```
/lang
  en.json
  cn.json
```

Or categorized:

```
/lang
  /en
    user.json
    role.json
  /cn
    user.json
    role.json
```

---

## Translation File Format

```json
// lang/en.json
{
  "name": "It's your name",
  "required": {
    "user_id": "UserID is required"
  },
  "welcome": "Welcome, :name"
}
```

---

## Get Translation

```go
// Simple key
facades.Lang(ctx).Get("name")

// Nested key (dot notation)
facades.Lang(ctx).Get("required.user_id")

// From categorized file (slash + dot notation)
facades.Lang(ctx).Get("role/user.name")
facades.Lang(ctx).Get("role/user.required.user_id")
```

---

## Replace Placeholders

Placeholders are prefixed with `:`.

```go
import "github.com/goravel/framework/translation"

facades.Lang(ctx).Get("welcome", translation.Option{
    Replace: map[string]string{
        "name": "Goravel",
    },
})
// → "Welcome, Goravel"
```

---

## Pluralization

```json
// lang/en.json
{
  "apples": "There is one apple|There are many apples",
  "items": "{0} There are none|[1,19] There are some|[20,*] There are many",
  "minutes_ago": "{1} :value minute ago|[2,*] :value minutes ago"
}
```

```go
facades.Lang(ctx).Choice("apples", 1)   // "There is one apple"
facades.Lang(ctx).Choice("apples", 5)   // "There are many apples"
facades.Lang(ctx).Choice("items", 0)    // "There are none"
facades.Lang(ctx).Choice("items", 10)   // "There are some"

facades.Lang(ctx).Choice("minutes_ago", 5, translation.Option{
    Replace: map[string]string{"value": "5"},
})
// → "5 minutes ago"
```

---

## Set Locale at Runtime

```go
facades.App().SetLocale(ctx, "cn")
```

### Get / Check Current Locale

```go
locale := facades.App().CurrentLocale(ctx)

if facades.App().IsLocale(ctx, "en") {
    // ...
}
```

---

## Default and Fallback Locale

Configure in `config/app.go`:

```go
"locale":          "en",
"fallback_locale": "en",
```

---

## Embed Loading (compile lang files into binary)

```
/lang
  en.json
  cn.json
  fs.go
```

```go
// lang/fs.go
package lang

import "embed"

//go:embed *
var FS embed.FS
```

```go
// config/app.go
import "goravel/lang"

"lang_path": "lang",
"lang_fs":   lang.FS,
```

When both file and embed exist, file takes priority; embed is the fallback.
