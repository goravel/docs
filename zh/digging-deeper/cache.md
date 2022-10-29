# 缓存系统

[[toc]]

## 介绍

Goravel 提供了可拓展的缓存模块，该模块可以使用 `facades.Cache` 进行操作。

## 配置

在 `config/cache.go` 中进行所有自定义配置。允许配置不同的缓存驱动，默认使用 `redis`，你也可以自定义驱动。

## 可用的缓存驱动

| 名称     | 描述       |
| -------- | ---------- |
| `redis`  | Redis 驱动 |
| `custom` | 自定义驱动 |

## 使用缓存

### 注入 Context

```go
facades.Cache.WithContext(ctx)
```

### 从缓存中获取数据

```go

value := facades.Cache.Get("goravel", "default")
value := facades.Cache.GetBool("goravel", true)
value := facades.Cache.GetInt("goravel", 1)
value := facades.Cache.GetString("goravel", "default")
```

你可以传递一个 `func` 作为默认值。如果指定的数据在缓存中不存在，将返回 `func` 的结果。传递闭包的方法允许你从数据库或其他外部服务中获取默认值。注意闭包结构 `func() interface{}`。

```go
value := facades.Cache.Get("goravel", func() interface{} {
    return "default"
})
```

### 检查缓存项是否存在

```go
bool := facades.Cache.Has("goravel")
```

### 获取和存储

有时你可能想从缓存中获取一个数据，而当请求的缓存项不存在时，程序能为你存储一个默认值。

```go
value, err := facades.Cache.Remember("goravel", 5 * time.Second, func() interface{} {
    return "goravel"
})
```

如果缓存中不存在你想要的数据时，则传递给 `Remember` 方法的闭包将被执行，然后将其结果返回并放置到缓存中。

你可以使用 `RememberForever` 方法从缓存中获取数据或者永久存储它：

```go
value, err := facades.Cache.RememberForever("goravel", func() interface{} {
    return "default"
})
```

### 获取并删除

```go
value := facades.Cache.Pull("goravel", "default")
```

### 在缓存中存储数据

```go
err := facades.Cache.Put("goravel", "value", 5 * time.Second)
```

如果缓存的过期时间设置为 0， 则缓存将永久有效：

```go
err := facades.Cache.Put("goravel", "value", 0)
```

### 只存储没有的数据

`Add` 方法将只存储缓存中不存在的数据。如果存储成功，将返回 `true` ，否则返回 `false` ：

```go
bool := facades.Cache.Add("goravel", "value", 5 * time.Second)
```

### 数据永久存储

`Forever` 方法可用于将数据持久化存储到缓存中。因为这些数据不会过期，所以必须通过 `Forget` 方法从缓存中手动删除它们：

```go
bool := facades.Cache.Forever("goravel", "value")
```

### 从缓存中删除数据

```go
bool := facades.Cache.Forget("goravel")
```

你可以使用 `Flush` 方法清空所有的缓存：

```go
bool := facades.Cache.Flush()
```

## 添加自定义缓存驱动

### 配置

如果你想定义一个完全自定义的驱动，可以在 `config/cache.go` 配置文件中指定 `custom` 驱动类型。
然后包含一个 `via` 选项，实现一个 `framework\contracts\cache\Store` 接口：

```go
//config/cache.go
"stores": map[string]interface{}{
    "redis": map[string]interface{}{
        "driver":     "redis",
        "connection": "default",
    },
    "custom": map[string]interface{}{
        "driver": "custom",
        "via":    &Logger{},
    },
},
```

### 实现驱动

实现 `framework\contracts\cache\Store` 接口，文件可以统一储存到 `app/extensions` 文件夹中（可修改）。

```go
//framework\contracts\cache\Store
package cache

import "time"

type Store interface {
    WithContext(ctx context.Context) Store
    //Get Retrieve an item from the cache by key.
    Get(key string, defaults interface{}) interface{}
    GetBool(key string, defaults bool) bool
    GetInt(key string, defaults interface{}) int
    GetString(key string, defaults interface{}) string
    //Has Determine if an item exists in the cache.
    Has(key string) bool
    //Put Store an item in the cache for a given number of seconds.
    Put(key string, value interface{}, seconds time.Duration) error
    //Pull Retrieve an item from the cache and delete it.
    Pull(key string, defaults interface{}) interface{}
    //Add Store an item in the cache if the key does not exist.
    Add(key string, value interface{}, seconds time.Duration) bool
    //Remember Get an item from the cache, or execute the given Closure and store the result.
    Remember(key string, ttl time.Duration, callback func() interface{}) (interface{}, error)
    //RememberForever Get an item from the cache, or execute the given Closure and store the result forever.
    RememberForever(key string, callback func() interface{}) (interface{}, error)
    //Forever Store an item in the cache indefinitely.
    Forever(key string, value interface{}) bool
    //Forget Remove an item from the cache.
    Forget(key string) bool
    //Flush Remove all items from the cache.
    Flush() bool
}
```
