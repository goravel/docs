# 工厂

[[toc]]

## 介绍

When testing your application or seeding your database, it might be necessary to insert a few records into your database beforehand. 在测试应用程序或填充数据库时，可能需要预先向数据库中插入一些记录。 Goravel允许您通过创建模型工厂为每个模型定义一组默认属性，而不是手动输入每个列的值。

要查看如何编写工厂的示例，您可以查看应用程序的`database/factories`目录中的`user_factory.go`文件。

```go
package factories

type UserFactory struct {
}

// Definition 定义模型的默认状态。
func (f *UserFactory) Definition() map[string]any {
  return map[string]any{
    "Name": "Goravel",
  }
}
```

As you can see, in their most basic form, factories are structs that have a `Definition` method. The method returns the default set of attribute values that should be used when creating a model with the factory. To generate a range of random data, you can rely on [brianvoe/gofakeit](https://github.com/brianvoe/gofakeit).

## 生成工厂

要创建一个工厂，运行 `make:factory` Artisan 命令：

```
go run . artisan make:factory PostFactory
```

新的工厂 `struct` 将被放置在你的 `database/factories` 目录中。

### 模型和工厂发现约定

定义工厂后，你可以在模型中使用 `Factory()` 方法将工厂绑定到模型：

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

### 持久化模型

我们可以使用 `Make` 方法创建模型而不将它们持久化到数据库中：

```go
var user models.User
err := facades.Orm().Factory().Make(&user)
```

你可以使用 `Count` 方法创建多个模型的集合：

```go
var users []models.User
err := facades.Orm().Factory().Count(2).Make(&users)
```

如果你想覆盖模型的一些默认值，你可以将 `map[string]any` 传递给 `Make` 方法。 只有指定的属性会被替换，而其他属性将保持工厂指定的默认值： Only the specified attributes will be replaced while the rest of the attributes remain set to their default values as specified by the factory:

```go
var user models.User
err := facades.Orm().Factory().Make(&user, map[string]any{
    "Avatar": "avatar",
})
```

### 实例化模型

`Create` 方法使用 Orm 的 `Save` 方法创建并保存模型实例到数据库。

```go
var user models.User
err := facades.Orm().Factory().Create(&user)

var users []models.User
err := facades.Orm().Factory().Count(2).Create(&users)
```

你可以通过将 `map[string]any` 属性传递给 `Create` 方法来覆盖工厂的默认模型属性：

```go
var user models.User
err := facades.Orm().Factory().Create(&user, map[string]any{
    "Avatar": "avatar",
})
```

### 忽略模型事件

模型上可能定义了[模型事件](../orm/getting-started#events)，你可以使用`CreateQuietly`方法忽略这些事件：

```go
var user models.User
err := facades.Orm().Factory().CreateQuietly(&user)
```
