# Goravel Cache

## Configuration

Full `config/cache.go`:

```go
// config/cache.go
config.Add("cache", map[string]any{
    "default": "memory",      // driver name to use

    // Cache stores
    // Available built-in drivers: "memory"
    // External: goravel/redis → "custom"
    "stores": map[string]any{
        "memory": map[string]any{
            "driver": "memory",
        },
        // Redis store (requires goravel/redis package):
        // "redis": map[string]any{
        //     "driver":     "custom",
        //     "connection": "default",
        //     "via": func() (cache.Driver, error) {
        //         return redisfacades.Cache("redis"), nil
        //     },
        // },
    },

    // Cache key prefix (must match: a-zA-Z0-9_-)
    "prefix": config.GetString("APP_NAME", "goravel") + "_cache",
})
```

### Redis Cache Driver

Install `goravel/redis`:

```shell
./artisan package:install github.com/goravel/redis
```

```go
// config/cache.go
import (
    "github.com/goravel/framework/contracts/cache"
    redisfacades "github.com/goravel/redis/facades"
)

"default": "redis",

"stores": map[string]any{
    "redis": map[string]any{
        "driver":     "custom",
        "connection": "default",
        "via": func() (cache.Driver, error) {
            return redisfacades.Cache("redis"), nil
        },
    },
},
```

Redis connection in `config/database.go`:

```go
"redis": map[string]any{
    "default": map[string]any{
        "host":     config.Env("REDIS_HOST", "127.0.0.1"),
        "password": config.Env("REDIS_PASSWORD", ""),
        "port":     config.Env("REDIS_PORT", 6379),
        "database": config.Env("REDIS_DB", 0),
    },
},
```

Default driver: `memory`. Redis driver available via `github.com/goravel/redis`.

---

## Basic Usage

### Inject context

```go
facades.Cache().WithContext(ctx)
```

### Multiple stores

```go
value := facades.Cache().Store("redis").Get("foo")
```

---

## Get

```go
value := facades.Cache().Get("goravel", "default")
value := facades.Cache().GetBool("goravel", true)
value := facades.Cache().GetInt("goravel", 1)
value := facades.Cache().GetString("goravel", "default")

// Closure default
value = facades.Cache().Get("goravel", func() any {
    return "computed-default"
})
```

---

## Check

```go
exists := facades.Cache().Has("goravel")
```

---

## Put (store)

```go
// With TTL
err := facades.Cache().Put("goravel", "value", 5*time.Second)

// Forever (TTL = 0 or use Forever)
err = facades.Cache().Put("goravel", "value", 0)
ok  := facades.Cache().Forever("goravel", "value")
```

---

## Add (only if not present)

```go
ok := facades.Cache().Add("goravel", "value", 5*time.Second)
// true if stored, false if key already existed
```

---

## Retrieve & Store

```go
value, err := facades.Cache().Remember("goravel", 5*time.Second, func() (any, error) {
    return "goravel", nil
})

value, err = facades.Cache().RememberForever("goravel", func() (any, error) {
    return "default", nil
})
```

---

## Pull (retrieve and delete)

```go
value := facades.Cache().Pull("goravel", "default")
```

---

## Increment / Decrement

```go
facades.Cache().Increment("key")
facades.Cache().Increment("key", 5)
facades.Cache().Decrement("key")
facades.Cache().Decrement("key", 5)
```

---

## Delete

```go
ok := facades.Cache().Forget("goravel")
ok = facades.Cache().Flush()
```

---

## Atomic Locks

```go
// Acquire lock
lock := facades.Cache().Lock("foo", 10*time.Second)

if lock.Get() {
    // lock acquired for 10 seconds
    lock.Release()
}

// Closure (auto-released)
facades.Cache().Lock("foo", 10*time.Second).Get(func() {
    // lock held here, auto-released after
})

// Block (wait up to 5 seconds)
lock = facades.Cache().Lock("foo", 10*time.Second)
if lock.Block(5 * time.Second) {
    lock.Release()
}

// Block with closure
facades.Cache().Lock("foo", 10*time.Second).Block(5*time.Second, func() {
    // runs when lock acquired
})

// Force release (regardless of owner)
facades.Cache().Lock("processing").ForceRelease()
```

---

## Custom Cache Driver

```go
// config/cache.go
"stores": map[string]interface{}{
    "memory": map[string]any{
        "driver": "memory",
    },
    "custom": map[string]interface{}{
        "driver": "custom",
        "via":    &MyDriver{},
    },
},
```

Implement `contracts/cache/Driver`:

```go
type Driver interface {
    Add(key string, value any, t time.Duration) bool
    Decrement(key string, value ...int) (int, error)
    Forever(key string, value any) bool
    Forget(key string) bool
    Flush() bool
    Get(key string, def ...any) any
    GetBool(key string, def ...bool) bool
    GetInt(key string, def ...int) int
    GetInt64(key string, def ...int64) int64
    GetString(key string, def ...string) string
    Has(key string) bool
    Increment(key string, value ...int) (int, error)
    Lock(key string, t ...time.Duration) Lock
    Put(key string, value any, t time.Duration) error
    Pull(key string, def ...any) any
    Remember(key string, ttl time.Duration, callback func() (any, error)) (any, error)
    RememberForever(key string, callback func() (any, error)) (any, error)
    WithContext(ctx context.Context) Driver
}
```
