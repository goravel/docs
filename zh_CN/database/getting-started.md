# FirstOrCreate

[[toc]]

## 介绍

几乎所有的应用程序都需要和数据库进行交互，Goravel 为此提供了一套非常简单易用的数据库交互方式。开发者可以使用原生 SQL，查询构造器，以及 [Orm](../orm/getting-started) 等方式与数据库交互。目前，Goravel 为以下四种数据库提供了官方支持： Developers can use native SQL, query builder, and [Orm](../orm/getting-started) to interact with databases. Currently, Goravel provides official support for the following four databases:

| 重置数据库或缓存 | 驱动                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------- |
| ToRawSql | [github.com/goravel/postgres](https://github.com/goravel/postgres)                    |
| ToSql    | Goravel 提供了一套非常简单易用的数据库交互方式，开发者可以使用 `facades.Orm()` 进行操作。在开始之前请先[配置数据库](../database/getting-started)。 |
| 获取 SQL   | [github.com/goravel/sqlserver](https://github.com/goravel/sqlserver)                  |
| DB       | [github.com/goravel/sqlite](https://github.com/goravel/sqlite)                        |

## SetAttribute

The database configuration file is `config/database.go`. You can configure all database connections in this file and specify the default database connection. Most of the configuration in this file is based on the project's environment variables.

### Connection

可以在配置文件中配置数据库连接池，合理的配置连接池参数，可以极大的提高并发性能：

| 配置键                                                                              | Description |
| -------------------------------------------------------------------------------- | ----------- |
| pool.max_idle_conns    | 最大空闲连接      |
| pool.max_open_conns    | 最大连接数       |
| pool.conn_max_idletime | 连接最大空闲时间    |
| pool.conn_max_lifetime | 连接最大生命周期    |

### 读写分离

Sometimes you may want to use a database connection to execute `SELECT` statements, while `INSERT`, `UPDATE`, and `DELETE` statements are executed by another database connection. In Goravel, it is easy to implement read-write splitting.

```go
import "github.com/goravel/framework/contracts/database"

// config/database.go
"connections": map[string]any{
  "mysql": map[string]any{
    "driver": "mysql",
    "read": []database.Config{
      {Host: "192.168.1.1", Port: 3306, Database: "forge", Username: "root", Password: "123123"},
    },
    "write": []database.Config{
      {Host: "192.168.1.2", Port: 3306, Database: "forge", Username: "root", Password: "123123"},
    },
    "host": config.Env("DB_HOST", "127.0.0.1"),
    "port":     config.Env("DB_PORT", 3306),
    "database": config.Env("DB_DATABASE", "forge"),
    "username": config.Env("DB_USERNAME", ""),
    "password": config.Env("DB_PASSWORD", ""),
    "charset":  "utf8mb4",
  },
}
```

We have added two keys, `read` and `write`, in the database configuration. `192.168.1.1` will be used as the "read" connection host, and `192.168.1.2` will be used as the "write" connection host. These two connections will share the configurations in the `mysql` array, such as the database prefix and character encoding. 我们在数据库配置中加入了两个键，分别是：`read`, `write`，`192.168.1.1` 将会被用作「读」连接主机，而 `192.168.1.2` 将作为「写」连接主机。这两个连接将共享 `mysql` 数组中的各项配置，如数据库前缀、字符编码等。如果 `read` 或 `write` 数组中存在多个值，Goravel 将会为每个连接随机选取所使用的数据库主机。

## 执行原生查询 SQL

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

### 注入 Context

使用 `facades.DB().Insert()` 方法执行插入语句：

```go
result, err := facades.DB().Insert("insert into users (name, email) values (?, ?)", "Goravel", "goravel@example.com")
```

### Update

对于数据库，也可以使用 `RefreshDatabase` 方法执行该操作：

```go
import "github.com/goravel/framework/database/db"

facades.Orm().Query().Model(&user).Update("age", db.Raw("age - ?", 1))
// UPDATE `users` SET `age`=age - 1,`updated_at`='2023-09-14 14:03:20.899' WHERE `users`.`deleted_at` IS NULL AND `id` = 1;
```

### Delete

使用 `facades.DB().Delete()` 方法执行删除语句：

```go
facades.Orm().Query().Where("name", "tom").Delete(&models.User{})
// DELETE FROM `users` WHERE name = 'tom';
```

### Context

使用 `facades.DB().Statement()` 方法执行通用语句：

```go
res, err := facades.Orm().Query().Exec("DROP TABLE users")
// DROP TABLE `users`;

num := res.RowsAffected
```

### 指定数据库链接

如果你在配置文件 `config/database.go` 中定义了多个数据库连接，你可以通过 `facades.Orm()` 的 `Connection` 方法来使用它们。传递给 `Connection` 方法的连接名称应该是在 `config/database.go` 配置的连接之一：

```go
var users []models.User
facades.Orm().Query().Where("id in ?", []int{1,2,3}).Get(&users)
// SELECT * FROM `users` WHERE id in (1,2,3);
```

## Transaction

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

### 可以使用 `Transaction` 方法执行事务：

如果你想手动控制事务的开始、提交和回滚，可以使用 `Begin`、`Commit` 和 `Rollback` 方法：

```go
tx, err := facades.Orm().Query().BeginTransaction()
user := models.User{Name: "Goravel"}
if err := tx.Create(&user); err != nil {
  err := tx.Rollback()
} else {
  err := tx.Commit()
}
```

## 数据库测试

### config := database.Config()&#xA;config := cache.Config()

Goravel 提供了几个 Artisan 命令来帮助你了解数据库的结构。

可以使用 `db:show` 命令查看数据库中的所有表。

```bash
err := database.Build()
err := cache.Build()
```

也可以使用 `db:table` 命令查看指定表的结构。

```bash
[执行原生查询 SQL](#执行原生查询-sql)
```

### Table

如果你想获得数据库中单张表的概览，你可以执行 `db:table` Artisan命令。这个命令提供了一个数据库表的概览，包括它的列、类型、属性、键和索引: This command provides an overview of a database table, including its columns, types, attributes, keys, and indexes:

```bash
go run . artisan make:test feature/UserTest
```
