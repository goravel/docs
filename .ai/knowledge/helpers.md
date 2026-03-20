# Helpers (path / maps / collect / convert / debug / color)

For fluent strings see `str.md`. For date/time see `carbon.md`.

## Contracts

Support utilities. No framework contract files.
All functions are in their respective `support/*` packages.

## Imports

```go
import (
    "github.com/goravel/framework/support/path"
    "github.com/goravel/framework/support/maps"
    "github.com/goravel/framework/support/collect"
    "github.com/goravel/framework/support/convert"
    "github.com/goravel/framework/support/debug"
    "github.com/goravel/framework/support/color"
    supphttp "github.com/goravel/framework/support/http"
)
```

## path -- Absolute paths (respect WithPaths config)

```go
path.App(rel ...string)       // abs path to app/
path.Base(rel ...string)      // project root
path.Config(rel ...string)    // config/
path.Database(rel ...string)  // database/
path.Storage(rel ...string)   // storage/
path.Public(rel ...string)    // public/
path.Lang(rel ...string)      // lang/
path.Resource(rel ...string)  // resources/
```

## maps -- map[string]any operations

```go
maps.Add(m, key, value)                          // add only if key absent
maps.Exists(m, key) bool
maps.Forget(m, keys ...string)                   // remove one or more keys
maps.Get(m, key, defaultValue) any
maps.Has(m, keys ...string) bool                 // true only if ALL keys present
maps.HasAny(m, keys ...string) bool              // true if ANY key present
maps.Only(m, keys ...string) map[string]any      // return subset
maps.Pull(m, key, defaultValue ...any) any       // get + remove
maps.Set(m, key, value)
maps.Where(m, func(k string, v any) bool) map[string]any
```

## collect -- generic slice/map helpers

```go
collect.Count(slice) int
collect.CountBy(slice, func(v T) bool) int
collect.Each(slice, func(v T, i int))
collect.Filter(slice, func(v T) bool) []T
collect.GroupBy(slice, func(v T) string) map[string][]T
collect.Keys(m map[K]V) []K
collect.Map(slice, func(v T, i int) U) []U
collect.Max(slice) T
collect.Min(slice) T
collect.Merge(m1, m2 map[K]V) map[K]V           // m2 wins on conflict
collect.Reverse(slice) []T
collect.Shuffle(slice) []T
collect.Split(slice, size int) [][]T
collect.Sum(slice) T
collect.Unique(slice) []T                        // first occurrence kept
collect.Values(m map[K]V) []V
```

## convert -- value utilities

```go
convert.Tap(val T, fn func(T)) T                // pass to fn, return original val
convert.Transform(val T, fn func(T) U) U        // convert type
convert.With(val T, fn func(T) U) U             // run fn, return result
convert.Default(val T, fallback T) T            // first non-zero value
convert.Pointer(val T) *T                       // wrap in pointer
```

## debug -- variable dump

```go
debug.Dump(vars ...any)                  // print to stdout
debug.SDump(vars ...any) string          // return as string
debug.FDump(w io.Writer, vars ...any)    // write to writer
```

## color -- terminal output

```go
// Constructors: Red, Green, Yellow, Blue, Magenta, Cyan, White, Black, Gray, Default
color.Red().Println("msg")
color.Green().Printf("ok: %s", val)
color.Blue().Sprint("info")      // returns colored string without newline
color.New(color.FgRed).Println("custom")

// Methods on each color: Print / Println / Printf / Sprint / Sprintln / Sprintf
```

## supphttp.NewBody -- request body builder

Used for `facades.Http()` POST bodies and test HTTP requests.

```go
body := supphttp.NewBody().SetField("name", "Alice").SetField("role", "admin")
built, err := body.Build()
built.ContentType() string   // set as Content-Type header
built.Reader() io.Reader     // pass as request body
```

## Rules

- `path.*` returns absolute paths; always correct relative to `WithPaths` config -- never construct paths manually with `filepath.Join`.
- `maps.*` mutates the map in-place for `Add`, `Set`, `Forget`, `Pull`.
- `collect.Unique` keeps the first occurrence of duplicates, not the last.
- `collect.Merge` is shallow -- nested maps are not deep-merged.
- `convert.Default` returns the first argument if it is non-zero, otherwise the second.
- `color` output is suppressed in non-TTY environments automatically.
