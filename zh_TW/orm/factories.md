# 模型工廠

[[toc]]

## 概述

在測試你的應用程式或填充資料庫時，可能需要在此之前在資料庫中插入一些記錄。 Goravel 允許你透過創建模型工廠來為每個模型定義一組預設屬性，而不是在建立測試資料時手動輸入每一欄的值。

要查看如何編寫工廠的範例，你可以查看應用程式的 `database/factories/user_factory.go` 文件。

```go
package factories

type UserFactory struct {
}

// 定義 定義模型的預設狀態。
func (f *UserFactory) Definition() map[string]any {
  return map[string]any{
    "Name": "Goravel",
  }
}
```

正如你所見，工廠在其最基本的形式中，是具有 `Definition` 方法的結構體。 該方法返回在使用工廠創建模型時應使用的預設屬性值集。 要生成一系列隨機數據，你可以依賴 [brianvoe/gofakeit](https://github.com/brianvoe/gofakeit)。

## 創建工廠

要創建工廠，運行 Artisan 命令 `make:factory`：

```
go run . artisan make:factory PostFactory
```

新工廠的 `struct` 將放置在你的 `database/factories` 目錄中。

### 模型與工廠的發現協議

定義工廠後，你可以在模型中使用 `Factory()` 方法將工廠綁定到模型：

```go
package models

import (
  "github.com/goravel/framework/contracts/database/factory"
  "github.com/goravel/framework/database/orm"

  "goravel/database/factories"
)

type User struct {
  orm.Model
  Name   string
  Avatar string
  orm.SoftDeletes
}

func (u *User) Factory() factory.Factory {
  return &factories.UserFactory{}
}
```

## 使用工廠創建模型

### 實例化模型

我們可以使用 `Make` 方法來創建模型而不需將它們持久化到資料庫中：

```go
var user models.User
err := facades.Orm().Factory().Make(&user)
```

你可以使用 `Count` 方法來創建多個模型的集合：

```go
var users []models.User
err := facades.Orm().Factory().Count(2).Make(&users)
```

如果你想覆蓋模型的一些預設值，你可以將 `map[string]any` 傳遞給 `Make` 方法。 只有指定的屬性會被替換，而其他屬性將保持設置為工廠指定的預設值：

```go
var user models.User
err := facades.Orm().Factory().Make(&user, map[string]any{
    "Avatar": "avatar",
})
```

### 持久化模型

`Create` 方法創建並使用 Orm 的 `Save` 方法將模型實例保存到資料庫中。

```go
var user models.User
err := facades.Orm().Factory().Create(&user)

var users []models.User
err := facades.Orm().Factory().Count(2).Create(&users)
```

你可以通過將 `map[string]any` 的屬性傳遞給 `Create` 方法來覆蓋工廠的預設模型屬性：

```go
var user models.User
err := facades.Orm().Factory().Create(&user, map[string]any{
    "Avatar": "avatar",
})
```

### 忽略模型事件

在模型上可能會定義有 [模型事件](../orm/getting-started.md#events)，你可以使用 `CreateQuietly` 方法忽略這些事件：

```go
var user models.User
err := facades.Orm().Factory().CreateQuietly(&user)
```
