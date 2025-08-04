# 缓存系统

[[toc]]

## 简介

Goravel 提供了可拓展的缓存模块，该模块可以使用 `facades.Cache()` 进行操作。 框架默认自带 `memory` 驱动，如需其他驱动，请查看对应的独立扩展包：

| 驱动    | 链接                                                                                                   |
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

你可以通过 `Store` 方法访问各种缓存存储。 传递给 `Store` 方法的键应该对应于 `cache` 配置文件中的 `stores` 配置数组中列出的存储之一：

```go
value := facades.Cache().Store("redis").Get("foo")
```

### 从缓存中获取数据

```go
value := facades.Cache().Get("goravel", "default")
value := facades.Cache().GetBool("goravel", true)
value := facades.Cache().GetInt("goravel", 1)
value := facades.Cache().GetString("goravel", "default")
```

你可以传递一个 `func` 作为默认值。 如果指定的数据在缓存中不存在，将返回 `func` 的结果。 传递闭包的方法允许你从数据库或其他外部服务中获取默认值。 注意闭包结构 `func() any`。

```go
value := facades.Cache().Get("goravel", any {
    return "default"
})
```

### 检查缓存项是否存在

```go
bool := facades.Cache().Has("goravel")
```

### 递增 / 递减值

`Increment` 和 `Decrement` 方法可用于调整缓存中整数项的值。 这两种方法都接受一个可选的第二个参数，指示增加或减少项目值的数量：

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

### 只存储没有的数据

`Add` 方法将只存储缓存中不存在的数据。 如果存储成功，将返回 `true` ，否则返回 `false` 。

```go
bool := facades.Cache().Add("goravel", "value", 5 * time.Second)
```

### 数据永久存储

因为这些数据不会过期，所以必须通过 `Forget` 方法从缓存中手动删除它们。 `Forever` 方法可用于将数据持久化存储到缓存中：

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

原子锁允许操作分布式锁而不用担心竞争条件。 你可以使用 `Lock` 方法创建和管理锁：

```go
lock := facades.Cache().Lock("foo", 10*time.Second)

if (lock.Get()) {
    // 锁定 10 秒...

    lock.Release()
}
```

`Get` 方法也接受一个闭包。 闭包执行后，Goravel 会自动释放锁：

```go
facades.Cache().Lock("foo").Get(func () {
    // 锁定无限期获得并自动释放...
});
```

如果在你请求时锁不可用，你可以指示 Goravel 等待指定的秒数。 如果在指定的时间限制内无法获取锁，则会返回 `false`：

```go
lock := facades.Cache().Lock("foo", 10*time.Second)
// 等待最多 5 秒后获得锁定...
if (lock.Block(5*time.Second)) {
    lock.Release()
}
```

上面的例子可以通过将闭包传递给 `Block` 方法来简化。 当一个闭包被传递给这个方法时，Goravel 将尝试在指定的秒数内获取锁，并在闭包执行后自动释放锁：

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
