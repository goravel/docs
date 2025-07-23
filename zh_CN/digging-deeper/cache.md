# 缓存系统

[[toc]]

## 简介

Goravel 提供了可拓展的缓存模块，该模块可以使用 `facades.Cache()` 进行操作。框架默认自带 `memory` 驱动，如需其他驱动，请查看对应的独立扩展包： Goravel comes with a `memory` driver, for other drivers, please check the corresponding independent extension packages:

| 驱动    | Link                                                                                                 |
| ----- | ---------------------------------------------------------------------------------------------------- |
| Redis | [https://github.com/goravel/redis](https://github.com/goravel/redis) |

## 配置

在 `config/cache.go` 中进行所有自定义配置。

## 使用缓存

### 注入 Context

```go
facades.Cache().WithContext(ctx)
```

### 访问多个缓存存储

You may access various cache stores via the `Store` method. 您可以通过 `Store` 方法访问各种缓存存储。传递给 `Store` 方法的键应该对应于 `cache` 配置文件中的 `stores` 配置数组中列出的存储之一：

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

You can pass a `func` as the default value. If the specified data does not exist in the cache, the result of `func` will be returned. The transitive closure method allows you to obtain default values from the database or other external services. Note the closure structure `func() any`.

```go
value := facades.Cache().Get("goravel", any {
    return "default"
})
```

### Checking For Item Existence

```go
bool := facades.Cache().Has("goravel")
```

### 递增 / 递减值

The `Increment` and `Decrement` methods may be used to adjust the value of integer items in the cache. `Increment` 和 `Decrement` 方法可用于调整缓存中整数项的值。这两种方法都接受一个可选的第二个参数，指示增加或减少项目值的数量：

```go
facades.Cache().Increment("key")
facades.Cache().Increment("key", amount)
facades.Cache().Decrement("key")
facades.Cache().Decrement("key", amount)
```

### 获取和存储

有时你可能想从缓存中获取一个数据，而当请求的缓存项不存在时，程序能为你存储一个默认值。

```go
value, err := facades.Cache().Remember("goravel", 5 * time.Second, func() (any, error) {
    return "goravel", nil
})
```

如果缓存中不存在你想要的数据时，则传递给 `Remember` 方法的闭包将被执行，然后将其结果返回并放置到缓存中。

你可以使用 `RememberForever` 方法从缓存中获取数据或者永久存储它：

```go
value, err := facades.Cache().RememberForever("goravel", func() (any, error) {
    return "default", nil
})
```

### 获取并删除

```go
value := facades.Cache().Pull("goravel", "default")
```

### 在缓存中存储数据

```go
err := facades.Cache().Put("goravel", "value", 5 * time.Second)
```

如果缓存的过期时间设置为 0， 则缓存将永久有效：

```go
err := facades.Cache().Put("goravel", "value", 0)
```

### Store If Not Present

The `Add` method stores data only if it's not in the cache. `Add` 方法将只存储缓存中不存在的数据。如果存储成功，将返回 `true` ，否则返回 `false` ：

```go
bool := facades.Cache().Add("goravel", "value", 5 * time.Second)
```

### 数据永久存储

The `Forever` method can be used to store data persistently in the cache. `Forever` 方法可用于将数据持久化存储到缓存中。因为这些数据不会过期，所以必须通过 `Forget` 方法从缓存中手动删除它们：

```go
bool := facades.Cache().Forever("goravel", "value")
```

### 从缓存中删除数据

```go
bool := facades.Cache().Forget("goravel")
```

你可以使用 `Flush` 方法清空所有的缓存：

```go
bool := facades.Cache().Flush()
```

## 原子锁

### 管理锁

原子锁允许操作分布式锁而不用担心竞争条件。您可以使用 `Lock` 方法创建和管理锁： You may create and manage locks using the `Lock` method:

```go
lock := facades.Cache().Lock("foo", 10*time.Second)

if (lock.Get()) {
    // 锁定 10 秒...

    lock.Release()
}
```

The `Get` method also accepts a closure. `Get` 方法也接受一个闭包。闭包执行后，Goravel 会自动释放锁：

```go
facades.Cache().Lock("foo").Get(func () {
    // 锁定无限期获得并自动释放...
});
```

如果在您请求时锁不可用，您可以指示 Goravel 等待指定的秒数。如果在指定的时间限制内无法获取锁，则会返回 `false`： If the lock can not be acquired within the specified time limit, will return `false`:

```go
lock := facades.Cache().Lock("foo", 10*time.Second)
// 等待最多 5 秒后获得锁定...
if (lock.Block(5*time.Second)) {
    lock.Release()
}
```

The example above may be simplified by passing a closure to the `Block` method. 上面的例子可以通过将闭包传递给 `Block` 方法来简化。当一个闭包被传递给这个方法时，Goravel 将尝试在指定的秒数内获取锁，并在闭包执行后自动释放锁：

```go
facades.Cache().Lock("foo", 10*time.Second).Block(5*time.Second, func () {
    // 等待最多 5 秒后获得锁定...
})
```

如果你想释放一个锁而不考虑它的当前所有者，你可以使用 `ForceRelease` 方法：

```go
facades.Cache().Lock("processing").ForceRelease();
```

## 自定义缓存驱动

### 配置

如果你想定义一个完全自定义的驱动，可以在 `config/cache.go` 配置文件中指定 `custom` 驱动类型。
然后包含一个 `via` 选项，实现一个 `framework/contracts/cache/Driver` 接口：
Then include a `via` option to implement a `framework/contracts/cache/Driver` interface:

```go
//config/cache.go
"stores": map[string]any{
    "memory": map[string]any{
        "driver": "memory",
    },
    "custom": map[string]any{
        "driver": "custom",
        "via":    &Logger{},
    },
},
```

### 实现驱动

实现 `framework/contracts/cache/Driver` 接口，文件可以统一储存到 `app/extensions` 文件夹中（可修改）。

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
