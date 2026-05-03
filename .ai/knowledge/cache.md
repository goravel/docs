# Cache

Key-value store with TTL semantics. Multi-driver: `memory`, `redis`, `database`. `Cache` extends `Driver`; `Store(name)` switches driver. Atomic increment/decrement and named locks built in.

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/cache/cache.go` — `Cache`, `Driver`, `Lock`

## Imports

```go
import (
    "time"

    "yourmodule/app/facades"
)
```

## Methods

### `facades.Cache()` returns `cache.Cache` (extends `Driver`)

| Method | Signature | Notes |
|---|---|---|
| Store | `(name string) Driver` | Switch driver (`"redis"`, `"memory"`, etc.). |

All `Driver` methods below are also available directly on `facades.Cache()`.

### `cache.Driver`

| Group | Methods (signature-only) |
|---|---|
| Read | `Get(key string, def ...any) any`, `GetBool(key, def ...bool) bool`, `GetInt(key, def ...int) int`, `GetInt64(key, def ...int64) int64`, `GetString(key, def ...string) string`, `Has(key) bool`, `Pull(key, def ...any) any` (read + delete) |
| Write | `Put(key, value any, ttl time.Duration) error`, `Add(key, value any, ttl time.Duration) bool` (write only if absent), `Forever(key, value any) bool` |
| Compute-or-cache | `Remember(key string, ttl time.Duration, callback func() (any, error)) (any, error)`, `RememberForever(key string, callback func() (any, error)) (any, error)` |
| Delete | `Forget(key) bool`, `Flush() bool` (whole store) |
| Atomic | `Increment(key string, value ...int64) (int64, error)`, `Decrement(key string, value ...int64) (int64, error)` |
| Locks | `Lock(key string, ttl ...time.Duration) Lock` |
| Context | `WithContext(ctx context.Context) Driver` |
| Testing | `Docker() (docker.CacheDriver, error)` (test-helper) |

### `cache.Lock`

| Method | Signature | Notes |
|---|---|---|
| Get | `(callback ...func()) bool` | Try-lock once. With callback: runs it under the lock and returns true on success. |
| Block | `(t time.Duration, callback ...func()) bool` | Wait up to `t` for the lock. |
| BlockWithTicker | `(t time.Duration, ticker time.Duration, callback ...func()) bool` | Same with custom poll interval. |
| Release | `() bool` | Release if you own it. |
| ForceRelease | `() bool` | Release regardless of owner — use for stuck locks only. |

## Config

User-owned: `config/cache.go`. Read directly for current store definitions.

Keys this facade reads:

- `cache.default` (string) — default store name (e.g. `"redis"`)
- `cache.stores.<name>.driver` (string) — driver (`"redis"`, `"memory"`, `"database"`, custom)
- `cache.stores.<name>.connection` (string) — for redis: connection name from `database.redis.<name>`
- `cache.stores.<name>.prefix` (string) — namespace prefix prepended to keys
- `cache.stores.<name>.via` (function) — custom driver factory closure

Greenfield default: `config/cache.go` from goravel-scaffold URL declared in `AGENTS.md`.

## Patterns & gotchas

- **`Increment`/`Decrement` return `(int64, error)`**, not `(int, error)`. The default step is 1: `Increment("hits")` adds 1; `Increment("hits", 5)` adds 5.
- **`Remember` callback returns `(any, error)`** — return the computed value, or `nil, err` to skip caching on failure. The cached value is returned as `any`; type-assert at call-site or use the typed `Get*` accessors after.
- **`Add` is "write if absent"** — returns `true` if it wrote, `false` if the key already existed. Use for atomic single-writer semantics (e.g. claim-a-job).
- **`Lock` TTL is optional**: `Lock("key", 30*time.Second)` auto-releases after 30s; `Lock("key")` (no TTL) holds until explicit Release. Forgetting TTL on a process that crashes leaves a permanently held lock — pair with `ForceRelease` recovery or always pass a TTL.
- **`Lock(...).Get(callback)` is the correct pattern for "do work under lock"** — the callback runs only if the lock was acquired, and the lock is released when the callback returns.
- **`Block(t)` busy-waits** until the lock is acquired or `t` elapses. Use sparingly; long blocks tie up workers.
- **TTL is `time.Duration`** — pass `5*time.Minute`, NOT `300` (seconds) or `300000` (ms).
- **`Get(key)` returns `any`** — type-assert (`v.(string)`) or use the typed accessor `GetString(key)`. Default value is returned when the key is missing OR when the stored value is nil.
- **Driver-specific `Flush`**: on shared stores (redis), `Flush()` wipes the WHOLE database, including data not put by your app. Reach for the prefix-aware delete via `Forget` per key, or use a tagged-cache pattern (Goravel's tags are driver-dependent).
- **`Pull` is atomic read+delete** — useful for "claim and consume" tokens. Returns the value (or default) and deletes the key.
- **Context propagation**: `facades.Cache().WithContext(ctx).Get(...)` — only matters for drivers that respect context (redis with timeouts).

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `count, err := cache.Increment("k")` then `int(count)` mismatch | `count, err := cache.Increment("k") // count is int64` | Increment returns `int64`. |
| `cache.Put("k", v, 300)` | `cache.Put("k", v, 5*time.Minute)` | TTL is `time.Duration`, not seconds. |
| `cache.Remember("k", 5*time.Minute, func() any { return computeIt() })` | `func() (any, error) { v, err := computeIt(); return v, err }` | Callback signature is `func() (any, error)`. |
| `cache.Get("k").(string)` (no nil-check) | `s, _ := cache.Get("k").(string)` or `cache.GetString("k", "")` | Get returns `any` and may be nil; assert with comma-ok or use typed accessor. |
| `if cache.Has("lock") { ... do work ... }` (race) | `lock := cache.Lock("lock", 30*time.Second); lock.Get(func() { ... do work ... })` | Has → Put isn't atomic; use Lock. |
| `cache.Flush()` to clear app data on shared redis | `for _, k := range myKeys { cache.Forget(k) }` (or use a key prefix and clear by SCAN externally) | Flush nukes the entire store on shared backends. |

## Worked example: cached lookup with lock-protected refresh

```go
package services

import (
    "errors"
    "fmt"
    "time"

    "yourmodule/app/facades"
)

type Stats struct {
    Users int64 `json:"users"`
    Posts int64 `json:"posts"`
}

const statsKey = "dashboard:stats"

func GetStats() (*Stats, error) {
    v, err := facades.Cache().Remember(statsKey, 5*time.Minute, func() (any, error) {
        var s Stats
        // ... compute from DB ...
        return &s, nil
    })
    if err != nil {
        return nil, err
    }
    s, ok := v.(*Stats)
    if !ok {
        return nil, errors.New("stats: type assertion failed")
    }
    return s, nil
}

// Atomic counter — no race with concurrent updaters
func RecordVisit(userID uint) (int64, error) {
    return facades.Cache().Increment(fmt.Sprintf("visits:%d", userID))
}

// Lock-protected expensive refresh
func RefreshLeaderboard() error {
    lock := facades.Cache().Lock("leaderboard:refresh", 60*time.Second)
    if !lock.Get(func() {
        // ... heavy computation, write back to cache ...
    }) {
        return errors.New("another worker is already refreshing")
    }
    return nil
}
```

## Rules

- `Increment`/`Decrement` return `(int64, error)`. Step defaults to 1.
- `Put` TTL is `time.Duration` — never raw seconds.
- `Remember` callback signature: `func() (any, error)`. Type-assert the result.
- For "write only if absent" use `Add`, not `Has` + `Put` (race).
- For mutual exclusion use `Lock(key, ttl).Get(callback)`. Always pass a TTL unless you have explicit Release in a defer.
- `Get` returns `any` — assert with comma-ok or use `GetString`/`GetInt`/`GetBool`/`GetInt64`.
- `Flush()` wipes the whole store. On shared backends prefer `Forget` per key.
- For request-scoped timeouts: `facades.Cache().WithContext(ctx)`.
