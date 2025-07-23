# 缓存

[[toc]]

## 简介

Goravel 提供了一个可扩展的缓存模块，可以使用 `facades.Cache()` 进行操作。 Goravel 自带 `memory` 驱动，对于其他驱动，请查看相应的独立扩展包： Goravel comes with a `memory` driver, for other drivers, please check the corresponding independent extension packages:

| 驱动    | 链接                                                                                                   |
| ----- | ---------------------------------------------------------------------------------------------------- |
| Redis | [https://github.com/goravel/redis](https://github.com/goravel/redis) |

## 配置

在 `config/cache.go` 中进行所有自定义配置。

## 缓存使用

### 注入上下文

```go
facades.Cache().WithContext(ctx)
```

### 访问多个缓存存储

You may access various cache stores via the `Store` method. 您可以通过 `Store` 方法访问各种缓存存储。 传递给 `Store` 方法的键应该对应于缓存配置文件中"stores"配置数组中列出的存储之一：

```go
value := facades.Cache().Store("redis").Get("foo")
```

### 从缓存中检索项目

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

### 检查项目是否存在

```go
bool := facades.Cache().Has("goravel")
```

### 递增/递减值

The `Increment` and `Decrement` methods may be used to adjust the value of integer items in the cache. `Increment`和`Decrement`方法可用于调整缓存中整数项的值。 这两个方法都接受一个可选的第二个参数，用于指定要增加或减少项目值的数量：

```go
facades.Cache().Increment("key")
facades.Cache().Increment("key", amount)
facades.Cache().Decrement("key")
facades.Cache().Decrement("key", amount)
```

### 获取并存储

有时您可能想从缓存中获取数据，当请求的缓存项不存在时，程序可以为您存储一个默认值。

```go
value, err := facades.Cache().Remember("goravel", 5 * time.Second, func() (any, error) {
    return "goravel", nil
})
```

如果您想要的数据在缓存中不存在，传递给`Remember`方法的闭包将被执行，然后结果将被返回并放置在缓存中。

您可以使用 `RememberForever` 方法从缓存中检索数据或永久存储数据：

```go
value, err := facades.Cache().RememberForever("goravel", func() (any, error) {
    return "default", nil
})
```

### 检索并删除

```go
value := facades.Cache().Pull("goravel", "default")
```

### 在缓存中存储项目

```go
err := facades.Cache().Put("goravel", "value", 5 * time.Second)
```

如果缓存的过期时间设置为 `0`，缓存将永久有效：

```go
err := facades.Cache().Put("goravel", "value", 0)
```

### Store If Not Present

The `Add` method stores data only if it's not in the cache. `Add` 方法仅在数据不在缓存中时才存储数据。 如果存储成功，它返回 `true`，否则返回 `false`。

```go
bool := facades.Cache().Add("goravel", "value", 5 * time.Second)
```

### 永久存储项目

The `Forever` method can be used to store data persistently in the cache. `Forever` 方法可用于在缓存中永久存储数据。 由于这些数据不会过期，必须通过 `Forget` 方法手动从缓存中删除：

```go
bool := facades.Cache().Forever("goravel", "value")
```

### 从缓存中删除项目

```go
bool := facades.Cache().Forget("goravel")
```

您可以使用 `Flush` 方法清除所有缓存：

```go
bool := facades.Cache().Flush()
```

## 原子锁

### 管理锁

原子锁允许操作分布式锁而不用担心竞争条件。您可以使用 `Lock` 方法创建和管理锁： 原子锁允许操作分布式锁而无需担心竞态条件。 您可以使用 `Lock` 方法创建和管理锁：

```go
facades.Cache().Lock("foo").Get(func () {
    // 获取锁10秒并自动释放...
})；
```

The `Get` method also accepts a closure. `Get` 方法也接受一个闭包。 闭包执行后，Goravel 将自动释放锁：

```go
lock := facades.Cache().Lock("foo", 10*time.Second)
// 最多等待5秒后获取锁...
if (lock.Block(5*time.Second)) {
    lock.Release()
}
```

如果在您请求锁时锁不可用，您可以指示 Goravel 等待指定的秒数。 如果在指定的时间限制内无法获取锁，将返回 `false`： If the lock can not be acquired within the specified time limit, will return `false`:

```go
facades.Cache().Lock("foo", 10*time.Second).Block(5*time.Second, func () {
    // 在等待最多5秒后获取锁...
})
```

The example above may be simplified by passing a closure to the `Block` method. 上面的例子可以通过向 `Block` 方法传递一个闭包来简化。 当闭包传递给此方法时，
Goravel 将尝试在指定的秒数内获取锁，并在闭包执行完毕后自动释放锁：

```go
lock := facades.Cache().Lock("foo", 10*time.Second)

if (lock.Get()) {
    // 获取锁10秒...

    lock.Release()
}
```

如果您想在不考虑当前所有者的情况下释放锁，可以使用 `ForceRelease` 方法：

```go
facades.Cache().Lock("processing").ForceRelease();
```

## 添加自定义缓存驱动

### 配置

如果您想定义一个完全自定义的驱动，可以在 `config/cache.go` 配置文件中指定 `custom` 驱动类型。
然后包含一个 `via` 选项来实现 `framework/contracts/cache/Driver` 接口：
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

### 实现自定义驱动

实现 `framework/contracts/cache/Driver` 接口，文件可以存储在 `app/extensions` 文件夹中（
可修改）。

```go
// framework/contracts/cache/Driver
package cache

import "time"

type Driver interface {
    // Add Driver 如果键不存在，则在缓存中添加一个项目。
    Add(key string, value any, t time.Duration) bool
    Decrement(key string, value ...int) (int, error)
    // Forever Driver 在缓存中永久存储一个项目。
    Forever(key string, value any) bool
    // Forget 从缓存中移除一个项目。
    Forget(key string) bool
    // Flush 从缓存中移除所有项目。
    Flush() bool
    // Get 通过键从缓存中检索一个项目。
    Get(key string, def ...any) any
    GetBool(key string, def ...bool) bool
    GetInt(key string, def ...int) int
    GetInt64(key string, def ...int64) int64
    GetString(key string, def ...string) string
    // Has 检查一个项目是否存在于缓存中。
    Has(key string) bool
    Increment(key string, value ...int) (int, error)
    Lock(key string, t ...time.Duration) Lock
    // Put Driver 在缓存中存储一个项目一段时间。
    Put(key string, value any, t time.Duration) error
    // Pull 从缓存中检索一个项目并删除它。
    Pull(key string, def ...any) any
    // Remember 从缓存中获取一个项目，或执行给定的闭包并存储结果。
    Remember(key string, ttl time.Duration, callback func() (any, error)) (any, error)
    // RememberForever 从缓存中获取一个项目，或执行给定的闭包并永久存储结果。
    RememberForever(key string, callback func() (any, error)) (any, error)
    WithContext(ctx context.Context) Driver
}
```
