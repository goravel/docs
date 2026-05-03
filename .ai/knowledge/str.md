# Str (String Helpers)

Fluent string manipulation. `str.Of("hello")` returns a chainable `*Stringable`; static helpers exposed directly on the `str` package. Covers case conversions, slugify, trim, replace, substring, padding, pluralisation.

## Authoritative source

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `support/str/str.go` — `Of()` constructor, `Stringable` type, all chain methods + static helpers

## Imports

```go
import "github.com/goravel/framework/support/str"
```

## Common usage

```go
s := str.Of("Hello World").Lower().Slug("-").String()  // "hello-world"
slug := str.Slug("Hello World", "-")                   // "hello-world" (static form)
```

## Methods (typical surface — see source for full list)

### `str.Of(s string) *Stringable` — chainable

| Group | Methods (signature-only) |
|---|---|
| Case | `Lower() *Stringable`, `Upper()`, `Title()`, `Camel()`, `Snake(delimiters ...string)`, `Kebab()`, `Studly()`, `Headline()`, `Apa()`, `Lcfirst()`, `Ucfirst()` |
| Trim | `Trim(chars ...string)`, `Ltrim(chars ...string)`, `Rtrim(chars ...string)`, `Squish()` (collapse whitespace) |
| Modify | `Append(...string)`, `Prepend(...string)`, `Replace(search, replace string)`, `ReplaceArray(search string, replace []string)`, `ReplaceFirst(search, replace)`, `ReplaceLast`, `ReplaceMatches(pattern, replace string)`, `Remove(search string, caseSensitive ...bool)` |
| Slice | `Substr(start, length int)`, `After(search string)`, `AfterLast(search)`, `Before(search)`, `BeforeLast(search)`, `Between(from, to string)`, `BetweenFirst`, `Limit(limit int, end ...string)` |
| Format | `Slug(separator string, dictionary ...map[string]string)`, `Mask(char string, index, length int)`, `Pad(length int, pad string)`, `PadLeft`, `PadRight` |
| Pluralisation | `Plural(count int)`, `Singular()`, `Inflect()` (locale-aware) |
| Test | `Contains(needles ...string)`, `ContainsAll(needles []string)`, `StartsWith(needles ...string)`, `EndsWith(needles ...string)`, `Is(pattern string)`, `IsEmpty() bool`, `IsNotEmpty() bool`, `IsAscii() bool`, `IsUuid() bool`, `IsUlid() bool`, `IsJson() bool` |
| Output | `String() string`, `Length() int`, `WordCount() int`, `Words(words int, end ...string)` |
| Encoding | `Md5()`, `Sha1()`, `Sha256()`, `Base64Encode()`, `Base64Decode()` |
| Other | `Tap(func(*Stringable))`, `When(condition bool, fn func(*Stringable))`, `Pipe(callback func(string) string)` |

### Static helpers (call directly on the package)

`str.Random(n int)`, `str.RandomInt(n int)`, `str.Slug(s, sep string)`, `str.Snake(s string)`, `str.Camel(s)`, `str.Kebab(s)`, `str.Studly(s)`, `str.Lower(s)`, `str.Upper(s)`, `str.Title(s)`, `str.Plural(s, count int)`, `str.Singular(s)`, `str.Uuid()`, `str.Ulid()`, `str.IsUuid(s)`, `str.IsUlid(s)`, `str.IsJson(s)`.

## Patterns & gotchas

- **`Of(s)` returns `*Stringable`** — chain methods, end with `.String()` to extract the result.
- **Static vs fluent**: most case/format helpers exist in BOTH forms. `str.Slug("x", "-")` is the one-shot form; `str.Of("x").Slug("-")` is the chainable form. Use whichever reads better in context.
- **`Plural(count)` is count-aware**: `str.Plural("apple", 1)` → `"apple"`, `str.Plural("apple", 2)` → `"apples"`. Handles irregular nouns (mouse → mice, person → people).
- **`Slug(separator)` defaults to `-`** but accepts any separator string. Pass a `dictionary` map to override character substitutions (e.g. `{"@": "at"}`).
- **`Mask(char, index, length)`** masks a substring. `str.Of("4242 4242 4242 4242").Mask("*", 0, 12).String()` → `"************4242"`.
- **`Replace` vs `ReplaceMatches`**: Replace is literal; ReplaceMatches takes a regex pattern.
- **`Tap` for side-effects**: `str.Of("x").Tap(func(s *Stringable) { log.Println(s.String()) }).Upper().String()` — useful for logging mid-chain without breaking it.
- **`When(cond, fn)` for conditional ops**: `str.Of("x").When(addPrefix, func(s *Stringable) { s.Prepend("!") })`.
- **`Random(n)` is cryptographically random** (uses `crypto/rand`). Safe for tokens; for fast non-secure use `math/rand` directly.
- **`Uuid()` generates a v4 UUID**; `Ulid()` generates a ULID (lexicographically sortable). Both are strings.
- **Chain ordering matters**: case methods return new state; e.g. `Lower().Snake()` differs from `Snake().Lower()` for inputs like `"FooBar"` (the former snake-cases lowercased, the latter snake-cases first).
- **Multi-byte safe**: methods handle UTF-8 properly (uses Go runes internally).

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `str.Of("x").Upper()` (forget `.String()`) | `str.Of("x").Upper().String()` | Stringable is a chain; extract via String. |
| `strings.ReplaceAll(s, " ", "-")` for slugs | `str.Slug(s, "-")` | Slug also strips diacritics, lowercases, removes special chars. |
| `s + "-" + suffix` for joining | `str.Of(s).Append("-", suffix).String()` | Variadic Append; chainable with rest of pipeline. |
| `regexp.MustCompile(p).ReplaceAllString(s, r)` | `str.Of(s).ReplaceMatches(p, r).String()` | Pipeline-friendly. |
| `len(s) > 0` | `str.Of(s).IsNotEmpty()` (when in a chain) — for one-shot, plain `len` is fine | Use the helper when reading better in context. |
| `s + strings.Repeat(" ", n - len(s))` | `str.Of(s).PadRight(n, " ").String()` | Built-in; multi-byte safe. |
| `math/rand.Read(buf)` for tokens | `str.Random(32)` | crypto/rand backed. |

## Worked example: slugified title + masked PII + token

```go
package services

import (
    "github.com/goravel/framework/support/str"
)

func GenerateSlug(title string) string {
    return str.Of(title).
        Lower().
        ReplaceMatches(`[^\w\s-]`, "").  // strip non-alphanumeric (extra safety)
        Squish().                        // collapse internal whitespace
        Slug("-").
        String()
}

func MaskCardNumber(cardNumber string) string {
    return str.Of(cardNumber).Remove(" ").Mask("*", 0, 12).String()
}

func ApiToken() string {
    return str.Random(40)
}

func IsSafeUuid(s string) bool {
    return str.IsUuid(s)
}

// Tap for logging mid-chain
func ProcessName(input string) string {
    return str.Of(input).
        Trim().
        Tap(func(s *str.Stringable) {
            // log s.String() if needed
        }).
        Title().
        String()
}
```

## Rules

- `str.Of(s)` for chaining; `.String()` to extract.
- Static `str.X(...)` helpers exist for one-shot use — pick whichever reads cleaner.
- `Slug(sep)` does more than `strings.Replace` — it lowercases, strips diacritics, removes special chars.
- `Plural(count)` and `Singular()` handle irregular nouns.
- `Random(n)` uses crypto/rand — safe for security tokens.
- Methods are UTF-8 safe (rune-based).
- For non-trivial substitutions chain via `Tap` / `When` / `Pipe` to keep the pipeline readable.
- `Uuid()` = v4, `Ulid()` = lexicographically sortable; both return string.
