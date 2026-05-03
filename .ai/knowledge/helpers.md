# Helpers (Path, Maps, Slices, Convert, Color, Debug)

Misc utilities under `support/*`. Small, pure functions: path joining/inspection, map/slice manipulation, type conversion, ANSI color, debug dumps.

## Authoritative sources

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `support/path/path.go` — path helpers (also reachable via `facades.App().XPath(...)`)
- `support/maps/maps.go` — map utilities
- `support/collect/collect.go` — slice/collection utilities
- `support/convert/convert.go` — type conversion helpers
- `support/color/color.go` — ANSI color output
- `support/debug/debug.go` — `Dump`, `Print` debug helpers
- `support/http/http.go` — small HTTP helpers (`StatusText`, etc.)

## Imports

```go
import (
    "github.com/goravel/framework/support/path"
    "github.com/goravel/framework/support/maps"
    "github.com/goravel/framework/support/collect"
    "github.com/goravel/framework/support/convert"
    "github.com/goravel/framework/support/color"
    "github.com/goravel/framework/support/debug"
)
```

## Methods (representative — see sources for the complete API)

### `support/path` (or use `facades.App().XPath(...)` from foundation)

| Function | Signature | Notes |
|---|---|---|
| Base | `(filePath string) string` | filename + extension. |
| Dir | `(filePath string) string` | directory containing the file. |
| Ext | `(filePath string) string` | file extension. |
| Join | `(elem ...string) string` | path-join (slash-aware). |
| Clean | `(filePath string) string` | normalize a path. |

For project-relative paths, the foundation app helpers are usually clearer: `facades.App().BasePath("config")`, `ConfigPath`, `StoragePath`, `PublicPath`, `LangPath`, `DatabasePath`, `ResourcePath`, `Path` (app dir), `BootstrapPath`, `FacadesPath`, `ModelPath`.

### `support/maps`

| Function | Signature | Notes |
|---|---|---|
| Get | `[K comparable, V any](m map[K]V, key K) (V, bool)` | safe get. |
| Has | `[K comparable, V any](m map[K]V, key K) bool` | key presence. |
| Keys | `[K comparable, V any](m map[K]V) []K` | sorted keys. |
| Values | `[K comparable, V any](m map[K]V) []V` | values. |
| Merge | `[K comparable, V any](dst, src map[K]V) map[K]V` | shallow merge (src wins). |
| Only | `[K comparable, V any](m map[K]V, keys []K) map[K]V` | subset by keys. |
| Except | `[K comparable, V any](m map[K]V, keys []K) map[K]V` | exclude keys. |
| Forget | `[K comparable, V any](m map[K]V, keys ...K)` | mutate-delete. |
| Pull | `[K comparable, V any](m map[K]V, key K) (V, bool)` | get + delete. |

### `support/collect` (generic slice helpers)

| Function | Signature | Notes |
|---|---|---|
| Map | `[T, U any](src []T, fn func(T) U) []U` | transform. |
| Filter | `[T any](src []T, fn func(T) bool) []T` | predicate. |
| Each | `[T any](src []T, fn func(T))` | iterate. |
| Reduce | `[T, U any](src []T, init U, fn func(U, T) U) U` | fold. |
| Contains | `[T comparable](src []T, val T) bool` | linear search. |
| Unique | `[T comparable](src []T) []T` | dedupe. |
| Chunk | `[T any](src []T, size int) [][]T` | split into chunks. |
| Flatten | `[T any](src [][]T) []T` | one level flatten. |
| Reverse | `[T any](src []T) []T` | reversed copy. |
| KeyBy | `[T any, K comparable](src []T, fn func(T) K) map[K]T` | index by key. |
| GroupBy | `[T any, K comparable](src []T, fn func(T) K) map[K][]T` | group. |
| Sort | `[T any](src []T, less func(T, T) bool) []T` | sorted copy. |

### `support/convert`

| Function | Signature | Notes |
|---|---|---|
| Default | `[T any](value, def T) T` | return def when value is zero. |
| Pointer | `[T any](v T) *T` | take address of literal. |
| Tap | `[T any](v T, fn func(T)) T` | side-effect, return value. |
| With | `[T any](v T, fns ...func(T)) T` | apply many side-effects. |

### `support/color`

| Function | Signature | Notes |
|---|---|---|
| Black/Red/Green/Yellow/Blue/Magenta/Cyan/White | `(s string) string` | ANSI-wrapped. |
| Bold/Italic/Underline | `(s string) string` | style. |
| Strip | `(s string) string` | remove ANSI codes. |

### `support/debug`

| Function | Signature | Notes |
|---|---|---|
| Dump | `(values ...any)` | pretty-print + continue. |
| Print | `(values ...any)` | print to stdout. |
| Dd | `(values ...any)` | "dump and die" — print + os.Exit(1). |

### `support/http`

`StatusText(code int) string`, `IsSuccessful(code int) bool`, etc.

## Patterns & gotchas

- **Project paths via the foundation app, not the support package**: `facades.App().ConfigPath("app.go")` resolves to the actual config file location, respecting `WithPaths` overrides. `path.Join(...)` is generic — fine for arbitrary paths but doesn't know your project layout.
- **`maps`/`collect` use generics** (Go 1.18+) — type parameters are inferred from the args. No need to write `collect.Map[User, string]([]User{...}, ...)`; the compiler infers.
- **`maps.Forget` mutates in place**; `maps.Except` returns a new map. Pick based on whether you want the original preserved.
- **`collect.Map` returns a NEW slice**; doesn't mutate the source. Same for Filter, Reverse, Sort, Unique.
- **`collect.Contains` is O(n)** — for hot paths over large slices, build a `map[T]struct{}` once.
- **`convert.Pointer(v)` for taking the address of a literal**: useful with API SDKs that take `*string`/`*bool` (you can't `&"foo"`).
- **`convert.Default(v, def)` returns def when v is the zero value** — handy for `OrDefault` patterns.
- **`debug.Dd` exits the process** — never use in production code; for development only.
- **Color helpers wrap with ANSI codes** — output looks garbled when not on a TTY. Use them only in CLI commands or `os.Stdout.IsTerminal()`-guarded paths.
- **`maps.Get` returns `(V, bool)`** (not panic on missing) — use this in place of bare map access when the key may be absent.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `filepath.Join("config", "app.go")` for project paths | `facades.App().ConfigPath("app.go")` | Respects `WithPaths` overrides. |
| `&"foo"` (compile error) | `convert.Pointer("foo")` | You can't take the address of a literal directly. |
| `if v, ok := m["k"]; ok { ... }` then never use `v` outside | `if maps.Has(m, "k") { ... }` | Has is the explicit existence check. |
| Loop + filter + collect into new slice | `collect.Filter(src, predicate)` | One-line generic. |
| `debug.Dd(x)` left in committed code | Remove or replace with `facades.Log().Debug(...)` | Dd terminates the process. |
| Color output to a logfile | Strip via `color.Strip(s)` first, OR check `os.Stdout.IsTerminal()` | ANSI codes look garbled in non-TTY. |

## Worked example: project paths + collect transforms + map ops

```go
package services

import (
    "github.com/goravel/framework/support/collect"
    "github.com/goravel/framework/support/convert"
    "github.com/goravel/framework/support/maps"

    "yourmodule/app/facades"
    "yourmodule/app/models"
)

func ConfigFilePath() string {
    return facades.App().ConfigPath("app.go")  // respects WithPaths overrides
}

// Transform users into a slug → name map
func IndexUsersBySlug(users []models.User) map[string]string {
    return collect.KeyBy(users, func(u models.User) string {
        return facades.App().ModelPath()  // example only
    })
}

// Filter + map in one expression
func ActiveEmails(users []models.User) []string {
    active := collect.Filter(users, func(u models.User) bool { return u.Active })
    return collect.Map(active, func(u models.User) string { return u.Email })
}

// Subset of a config map
func WhitelistedKeys(cfg map[string]any) map[string]any {
    return maps.Only(cfg, []string{"host", "port", "scheme"})
}

// Take the address of a literal for an SDK that wants *string
type StripeCreate struct {
    Name *string
}
func NewStripeReq(name string) StripeCreate {
    return StripeCreate{Name: convert.Pointer(name)}
}

// Default value when missing
func GetTimeout(cfg map[string]int) int {
    return convert.Default(cfg["timeout"], 30)
}
```

## Rules

- For project-relative paths, prefer `facades.App().XPath(...)` over generic `path.Join`.
- `maps`/`collect` are generic — type params inferred; no need to spell them out.
- `collect.Map`/`Filter`/`Reverse`/`Sort`/`Unique` return NEW slices. `maps.Forget` mutates.
- `convert.Pointer(v)` for taking address of a literal; `convert.Default(v, def)` for zero-value fallback.
- `debug.Dd` terminates the process — development only, never in committed code.
- Color helpers add ANSI escapes — guard against non-TTY output.
- For repeated lookups in large slices, build a map once instead of repeated `collect.Contains`.
