# 模型工厂

[[toc]]

## 介绍

测试时您可能需要在执行测试之前向数据库中插入一些记录。 测试时你可能需要在执行测试之前向数据库中插入一些记录。 Goravel 允许你使用模型工厂为每个模型定义一组默认属性，而不是在创建测试数据时手动指定每一列的值。

要了解如何编写工厂，请查看应用程序中的 `database/factories/user_factory.go` 文件：

```go
package factories

type UserFactory struct {
}

// Definition Define the model's default state.
func (f *UserFactory) Definition() map[string]any {
  return map[string]any{
    "Name": "Goravel",
  }
}
```

正如您所见，在最基本的形式中，factories 是定义 `Definition` 方法的 struct。 `Definition` 方法返回对应模型的属性值。 可以使用 [brianvoe/gofakeit](https://github.com/brianvoe/gofakeit) 包来生成各种随机数据。

## 创建工厂

可以使用 Artisan 命令 `make:factory` 创建工厂：

```
go run . artisan make:factory PostFactory
```

新工厂将放置在你的 `database/factories` 目录下。

### 模型和工厂的关联约定

定义工厂后，可以在模型中使用 `Factory()` 方法将工厂与模型绑定在一起：

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

## 使用工厂创建模型

### 实例化模型

我们可以使用 `Make` 方法来创建模型而且不需要将它们持久化到数据库中：

```go
var user models.User
err := facades.Orm().Factory().Make(&user)
```

也可以使用 `Count` 方法创建许多模型的集合：

```go
var users []models.User
err := facades.Orm().Factory().Count(2).Make(&users)
```

如果你想覆盖模型的一些默认值，你可以将 `map[string]any` 传递给 `Make` 方法。 只有指定的属性将被替换，而这些属性的其余部分保持设置为其默认值： 只有指定的属性将被替换，而这些属性的其余部分保持设置为其默认值：

```go
var user models.User
err := facades.Orm().Factory().Make(&user, map[string]any{
    "Avatar": "avatar",
})
```

### 持久化模型

`Create` 方法创建模型实例，并使用 Orm 的 `Save` 方法其持久化到数据库中：

```go
var user models.User
err := facades.Orm().Factory().Create(&user)

var users []models.User
err := facades.Orm().Factory().Count(2).Create(&users)
```

你可以通过将 `map[string]any` 传递给 `Create` 方法来覆盖模型上的属性：

```go
var user models.User
err := facades.Orm().Factory().Create(&user, map[string]any{
    "Avatar": "avatar",
})
```

### 忽略模型事件

在模型上可能会定义有[模型事件](../orm/getting-started.md#events)，你可以使用 `CreateQuietly` 忽略这些事件：

```go
var user models.User
err := facades.Orm().Factory().CreateQuietly(&user)
```
