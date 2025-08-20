# 快取

[[toc]]

## 概述

Goravel 提供了可擴展的快取模組，可以使用 `facades.Cache()` 進行操作。 Goravel 附帶 `memory` 驅動，若需要其他驅動，請查看相應的獨立擴展包：

| 驅動    | 鏈接                                                                                                   |
| ----- | ---------------------------------------------------------------------------------------------------- |
| Redis | [https://github.com/goravel/redis](https://github.com/goravel/redis) |

## 配置

在 `config/cache.go` 中進行所有自定義配置。

## 快取用法

### 注入 Context

```go
facades.Cache().WithContext(ctx)
```

### 訪問多個快取存儲

你可以通過 `Store` 方法訪問各種快取存儲。 傳遞給 `Store` 方法的鍵應對應於你的快取配置文件中 "stores" 配置數組列出的存儲之一：

```go
value := facades.Cache().Store("redis").Get("foo")
```

### 從快取中檢索項目

```go
value := facades.Cache().Get("goravel", "default")
value := facades.Cache().GetBool("goravel", true)
value := facades.Cache().GetInt("goravel", 1)
value := facades.Cache().GetString("goravel", "default")
```

你可以將 `func` 作為默認值傳遞。 如果指定的資料在快取中不存在，則會返回 `func` 的結果。 傳遞閉包方法使你能夠從資料庫或其他外部服務獲取默認值。 注意閉包結構 `func() any`。

```go
value := facades.Cache().Get("goravel", func() any {
    return "default"
})
```

### 檢查項目是否存在

```go
bool := facades.Cache().Has("goravel")
```

### 遞增 / 遞減值

`Increment` 和 `Decrement` 方法可用於調整快取中整數項的值。 這兩種方法都接受一個可選的第二個參數，指示增加或減少項目值的數量：

```go
facades.Cache().Increment("key")
facades.Cache().Increment("key", amount)
facades.Cache().Decrement("key")
facades.Cache().Decrement("key", amount)
```

### 檢索及存儲

有時你可能想從快取中獲取資料，而當請求的快取項不存在時，程序能為你存儲一個默認值。

```go
value, err := facades.Cache().Remember("goravel", 5*time.Second, func() (any, error) {
    return "goravel", nil
})
```

如果你想要的資料在快取中不存在，傳遞給 `Remember` 方法的閉包將被執行，然後將結果返回並放入快取中。

你可以使用 `RememberForever` 方法從快取中獲取資料或永久存儲它：

```go
value, err := facades.Cache().RememberForever("goravel", func() (any, error) {
    return "default", nil
})
```

### 檢索及刪除

```go
value := facades.Cache().Pull("goravel", "default")
```

### 在快取中存儲資料

```go
err := facades.Cache().Put("goravel", "value", 5*time.Second)
```

如果快取的過期時間設置為 `0`，則快取將永久有效：

```go
err := facades.Cache().Put("goravel", "value", 0)
```

### 如果不存在則存儲

`Add` 方法將只在快取中不存在時存儲資料。 如果存儲成功，將返回 `true`，否則返回 `false`。

```go
bool := facades.Cache().Add("goravel", "value", 5*time.Second)
```

### 永久存儲項目

`Forever` 方法可用於將資料持久化存儲到快取中。 由於這些資料不會過期，所以必須通過 `Forget` 方法從快取中手動刪除它們。

```go
bool := facades.Cache().Forever("goravel", "value")
```

### 從快取中刪除項目

```go
bool := facades.Cache().Forget("goravel")
```

你可以使用 `Flush` 方法清空所有的快取：

```go
bool := facades.Cache().Flush()
```

## 原子鎖

### 管理鎖

原子鎖允許在不擔心競爭條件的情況下操作分佈式鎖。你可以使用 `Lock` 方法創建和管理鎖： 你可以使用 `Lock` 方法創建和管理鎖：

```go
lock := facades.Cache().Lock("foo", 10*time.Second)

if (lock.Get()) {
    // 鎖定 10 秒...

    lock.Release()
}
```

`Get` 方法也接受一個閉包。 閉包執行後，Goravel 將自動釋放鎖：

```go
facades.Cache().Lock("foo").Get(func () {
    // 鎖定 10 秒並自動釋放...
});
```

如果在你請求時鎖不可用，你可以指示 Goravel 等待指定的秒數。 如果在指定的時間限制內無法獲取鎖，則返回 `false`：

```go
lock := facades.Cache().Lock("foo", 10*time.Second)
// 等待最多 5 秒後獲得鎖定...
if (lock.Block(5*time.Second)) {
    lock.Release()
}
```

上述例子可以通過將閉包傳遞給 `Block` 方法來簡化。 當一個閉包被傳遞給這個方法時，Goravel 將嘗試在指定的秒數內獲取鎖，並在閉包執行後自動釋放鎖：

```go
facades.Cache().Lock("foo", 10*time.Second).Block(5*time.Second, func () {
    // 鎖定 10 秒後獲得並自動釋放...
})
```

如果你想釋放一個鎖而不考慮當前所有者，你可以使用 `ForceRelease` 方法：

```go
facades.Cache().Lock("processing").ForceRelease();
```

## 添加自定義快取驅動

### 配置

如果你想定義一個完全自定義的驅動，可以在 `config/cache.go` 配置文件中指定 `custom` 驅動類型。
然後包含一個 `via` 選項以實現 `framework/contracts/cache/Driver` 接口：

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

### 實現自定義驅動

實現 `framework/contracts/cache/Driver` 接口，文件可以存儲在 `app/extensions` 文件夾中（可修改）。

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
