# 开始使用

[[toc]]

## 简介

Goravel 使开发人员可以轻松地使用 `facades.Orm()` 与数据库进行交互。 目前，它官方支持以下四种数据库： Developers can use native SQL, query builder, and [Orm](../orm/getting-started) to interact with databases. Currently, Goravel provides official support for the following four databases:

| 数据库连接                           | 驱动                                                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| PostgreSQL 9.6+ | [github.com/goravel/postgres](https://github.com/goravel/postgres)                              |
| ToSql                           | [github.com/goravel/mysql](https://github.com/goravel/mysql)                                    |
| SQL Server                      | 要配置数据库，请导航到 `config/database.go`。 在这里，您可以自定义所有数据库连接并选择一个 `default` 连接。 此文件中的配置依赖于项目的环境变量，并展示了Goravel支持的各种数据库配置。 |
| 获取 SQL                          | [github.com/goravel/sqlite](https://github.com/goravel/sqlite)                                  |

## 配置

The database configuration file is `config/database.go`. You can configure all database connections in this file and specify the default database connection. Most of the configuration in this file is based on the project's environment variables.

### 连接池

您可以在配置文件中配置连接池，合理配置连接池参数
可以大大提高并发性能：

| 配置键                                                                              | Description |
| -------------------------------------------------------------------------------- | ----------- |
| pool.max_idle_conns    | 最大空闲连接数     |
| pool.max_open_conns    | 最大打开连接数     |
| pool.conn_max_idletime | 连接最大空闲时间    |
| pool.conn_max_lifetime | 连接最大生存时间    |

### 读写连接

有时你可能希望对`SELECT`语句使用一个数据库连接，而对`INSERT`、`UPDATE`和`DELETE`语句使用另一个连接。 Goravel使这变得轻而易举。 In Goravel, it is easy to implement read-write splitting.

```go
import contractstesting "github.com/goravel/framework/contracts/testing"

database.Image(contractstesting.Image{
  Repository: "mysql",
  Tag:        "5.7",
  Env: []string{
    "MYSQL_ROOT_PASSWORD=123123",
    "MYSQL_DATABASE=goravel",
  },
  ExposedPorts: []string{"3306"},
})
```

We have added two keys, `read` and `write`, in the database configuration. `192.168.1.1` will be used as the "read" connection host, and `192.168.1.2` will be used as the "write" connection host. These two connections will share the configurations in the `mysql` array, such as the database prefix and character encoding. 我们在数据库配置中加入了两个键，分别是：`read`, `write`，`192.168.1.1` 将会被用作「读」连接主机，而 `192.168.1.2` 将作为「写」连接主机。这两个连接将共享 `mysql` 数组中的各项配置，如数据库前缀、字符编码等。如果 `read` 或 `write` 数组中存在多个值，Goravel 将会为每个连接随机选取所使用的数据库主机。

## 执行原生 SQL

配置好数据库连接后，你就可以使用 `facades.DB()` 来运行查询。`facades.DB` 提供了各种方法用于运行查询：`Select`、`Insert`、`Update`、`Delete` 和 `Statement`。 `facades.DB` provides various methods for running queries: `Select`, `Insert`, `Update`, `Delete`, and `Statement`.

### Select

使用 `facades.DB().Select()` 方法执行基本的查询：

```go
// 获取多条记录
var products []Product
err := facades.DB().Select(&products, "SELECT * FROM products")

// 获取单条记录
var product Product
err := facades.DB().Select(&product, "SELECT * FROM products WHERE id = ?", 1)
```

> Note: Different database drivers require different placeholders. For example, the `?` placeholder is used for MySQL, while the `@` placeholder is used for PostgreSQL.

### 注入上下文

使用 `facades.DB().Insert()` 方法执行插入语句：

```go
result, err := facades.DB().Insert("insert into users (name, email) values (?, ?)", "Goravel", "goravel@example.com")
```

### 最新版

使用 `facades.DB().Update()` 方法执行更新语句：

```go
import "github.com/goravel/framework/database/db"

facades.Orm().Query().Model(&user).Update("age", db.Raw("age - ?", 1))
// UPDATE `users` SET `age`=age - 1,`updated_at`='2023-09-14 14:03:20.899' WHERE `users`.`deleted_at` IS NULL AND `id` = 1;
```

### Delete

使用 `facades.DB().Delete()` 方法执行删除语句：

```go
var user models.User
facades.Orm().Query().Find(&user, 1)
res, err := facades.Orm().Query().Delete(&user)
res, err := facades.Orm().Query().Model(&models.User{}).Where("id", 1).Delete()
res, err := facades.Orm().Query().Table("users").Where("id", 1).Delete()
// DELETE FROM `users` WHERE `users`.`id` = 1;

num := res.RowsAffected
```

### Context

使用 `facades.DB().Statement()` 方法执行通用语句：

```go
err := database.Seed()
err := database.Seed(&seeders.UserSeeder{})
```

### 指定数据库连接

如果在 `config/database.go` 中定义了多个数据库连接，你可以通过 `facades.Orm()` 的 `Connection` 函数来使用它们。 传递给 `Connection` 的连接名应该是 `config/database.go` 中配置的连接之一：

```go
var users []models.User
facades.Orm().Query().Where("id in ?", []int{1,2,3}).Get(&users)
// SELECT * FROM `users` WHERE id in (1,2,3);
```

## config := database.Config()

你可以使用 `facades.DB().Transaction()` 方法在数据库事务中执行一系列操作。如果在事务闭包中抛出了异常，事务将自动回滚。如果闭包成功执行，事务将自动提交： If an exception is thrown in the transaction closure, the transaction will be automatically rolled back. If the closure executes successfully, the transaction will be automatically committed:

```go
import (
  "github.com/goravel/framework/contracts/database/orm"
  "github.com/goravel/framework/facades"

  "goravel/app/models"
)

...

return facades.Orm().Transaction(func(tx orm.Query) error {
  var user models.User

  return tx.Find(&user, user.ID)
})
```

### Transaction

如果你想手动控制事务的开始、提交和回滚，可以使用 `Begin`、`Commit` 和 `Rollback` 方法：

```go
tx, err := facades.Orm().Query().Begin()
user := models.User{Name: "Goravel"}
if err := tx.Create(&user); err != nil {
  err := tx.Rollback()
} else {
  err := tx.Commit()
}
```

## 数据库测试

### 刷新数据库

Goravel 提供了几个 Artisan 命令来帮助你了解数据库的结构。

您可以使用 `db:show` 命令查看数据库中的所有表。

```bash
database, err := facades.Testing().Docker().Database()
database, err := facades.Testing().Docker().Database("postgres")
```

您还可以使用 `db:table` 命令查看特定表的结构。

```bash
go run . artisan db:table
go run . artisan db:table users
```

### Table

如果你想获得数据库中单张表的概览，你可以执行 `db:table` Artisan命令。这个命令提供了一个数据库表的概览，包括它的列、类型、属性、键和索引: This command provides an overview of a database table, including its columns, types, attributes, keys, and indexes:

```bash
go run . artisan make:test feature/UserTest
```
