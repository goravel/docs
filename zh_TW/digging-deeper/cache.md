# Cache

[[toc]]

## Introduction

Goravel provides an expandable cache module that can be operated using `facades.Cache()`. Goravel comes with a `memory`
driver, for other drivers, please check the corresponding independent extension packages:

| Driver | Link                                                                                                 |
| ------ | ---------------------------------------------------------------------------------------------------- |
| Redis  | [https://github.com/goravel/redis](https://github.com/goravel/redis) |

## Configuration

Make all custom configurations in `config/cache.go`.

## Cache Usage

### Inject Context

```go
facades.Cache().WithContext(ctx)
```

### Accessing Multiple Cache Stores

You may access various cache stores via the `Store` method. The key passed to the `Store` method should correspond to
one of the stores listed in the "stores" configuration array in your cache configuration file:

```go
value := facades.Cache().Store("redis").Get("foo")
```

### Retrieving Items From The Cache

```go
value := facades.Cache().Get("goravel", "default")
value := facades.Cache().GetBool("goravel", true)
value := facades.Cache().GetInt("goravel", 1)
value := facades.Cache().GetString("goravel", "default")
```

You can pass a `func` as the default value. If the specified data does not exist in the cache, the result of `func` will
be returned. The transitive closure method allows you to obtain default values from the database or other external
services. Note the closure structure `func() any`.

```go
value := facades.Cache().Get("goravel", func() any {
    return "default"
})
```

### Checking For Item Existence

```go
bool := facades.Cache().Has("goravel")
```

### Incrementing / Decrementing Values

The `Increment` and `Decrement` methods may be used to adjust the value of integer items in the cache. Both methods
accept an optional second argument indicating the amount by which to increment or decrement the item's value:

```go
facades.Cache().Increment("key")
facades.Cache().Increment("key", amount)
facades.Cache().Decrement("key")
facades.Cache().Decrement("key", amount)
```

### Retrieve & Store

Sometimes you may want to get data from the cache, and when the requested cache item does not exist, the program can
store a default value for you.

```go
value, err := facades.Cache().Remember("goravel", 5*time.Second, func() (any, error) {
    return "goravel", nil
})
```

If the data you want does not exist in the cache, the closure passed to the `Remember` method will be executed, and then
the result will be returned and placed in the cache.

You can use the `RememberForever` method to retrieve data from the cache or store it permanently:

```go
value, err := facades.Cache().RememberForever("goravel", func() (any, error) {
    return "default", nil
})
```

### Retrieve & Delete

```go
value := facades.Cache().Pull("goravel", "default")
```

### Storing Items In The Cache

```go
err := facades.Cache().Put("goravel", "value", 5*time.Second)
```

If the expiration time of the cache is set to `0`, the cache will be valid forever:

```go
err := facades.Cache().Put("goravel", "value", 0)
```

### Store If Not Present

The `Add` method stores data only if it's not in the cache. It returns `true` if storage is successful and `false` if
it's not.

```go
bool := facades.Cache().Add("goravel", "value", 5*time.Second)
```

### Storing Items Forever

The `Forever` method can be used to store data persistently in the cache. Because these data will not expire, they must
be manually deleted from the cache through the `Forget` method:

```go
bool := facades.Cache().Forever("goravel", "value")
```

### Removing Items From The Cache

```go
bool := facades.Cache().Forget("goravel")
```

You can use the `Flush` method to clear all caches:

```go
bool := facades.Cache().Flush()
```

## Atomic Locks

### Managing Locks

Atomic locks allow for the manipulation of distributed locks without worrying about race conditions. You may create and
manage locks using the `Lock` method:

```go
lock := facades.Cache().Lock("foo", 10*time.Second)

if (lock.Get()) {
    // Lock acquired for 10 seconds...

    lock.Release()
}
```

The `Get` method also accepts a closure. After the closure is executed, Goravel will automatically release the lock:

```go
facades.Cache().Lock("foo").Get(func () {
    // Lock acquired for 10 seconds and automatically released...
});
```

If the lock is not available at the moment you request it, you may instruct Goravel to wait for a specified number of
seconds. If the lock can not be acquired within the specified time limit, will return `false`:

```go
lock := facades.Cache().Lock("foo", 10*time.Second)
// Lock acquired after waiting a maximum of 5 seconds...
if (lock.Block(5*time.Second)) {
    lock.Release()
}
```

The example above may be simplified by passing a closure to the `Block` method. When a closure is passed to this method,
Goravel will attempt to acquire the lock for the specified number of seconds and will automatically release the lock
once the closure has been executed:

```go
facades.Cache().Lock("foo", 10*time.Second).Block(5*time.Second, func () {
    // Lock acquired after waiting a maximum of 5 seconds...
})
```

If you would like to release a lock without respecting its current owner, you may use the `ForceRelease` method:

```go
facades.Cache().Lock("processing").ForceRelease();
```

## Adding Custom Cache Drivers

### Configuration

If you want to define a completely custom driver, you can specify the `custom` driver type in the `config/cache.go`
configuration file.
Then include a `via` option to implement a `framework/contracts/cache/Driver` interface:

```go
//config/cache.go
"stores": map[string]interface{}{
    "memory": map[string]any{
        "driver": "memory",
    },
    "custom": map[string]interface{}{
        "driver": "custom",
        "via":    &Logger{},
    },
},
```

### Implement Custom Driver

Implement the `framework/contracts/cache/Driver` interface, files can be stored in the `app/extensions` folder (
modifiable).

```go
// framework/contracts/cache/Driver
package cache

import "time"

type Driver interface {
    // Add Driver an item in the cache if the key does not exist.
    Add(key string, value any, t time.Duration) bool
    Decrement(key string, value ...int) (int, error)
    // Forever Driver an item in the cache indefinitely.
    Forever(key string, value any) bool
    // Forget Remove an item from the cache.
    Forget(key string) bool
    // Flush Remove all items from the cache.
    Flush() bool
    // Get Retrieve an item from the cache by key.
    Get(key string, def ...any) any
    GetBool(key string, def ...bool) bool
    GetInt(key string, def ...int) int
    GetInt64(key string, def ...int64) int64
    GetString(key string, def ...string) string
    // Has Check an item exists in the cache.
    Has(key string) bool
    Increment(key string, value ...int) (int, error)
    Lock(key string, t ...time.Duration) Lock
    // Put Driver an item in the cache for a given time.
    Put(key string, value any, t time.Duration) error
    // Pull Retrieve an item from the cache and delete it.
    Pull(key string, def ...any) any
    // Remember Get an item from the cache, or execute the given Closure and store the result.
    Remember(key string, ttl time.Duration, callback func() (any, error)) (any, error)
    // RememberForever Get an item from the cache, or execute the given Closure and store the result forever.
    RememberForever(key string, callback func() (any, error)) (any, error)
    WithContext(ctx context.Context) Driver
}
```
