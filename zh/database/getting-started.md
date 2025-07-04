# 快速入门

[[toc]]

## 简介

几乎所有的应用程序都需要和数据库进行交互，Goravel 为此提供了一套非常简单易用的数据库交互方式。开发者可以使用原生 SQL，查询构造器，以及 [Orm](../orm/getting-started) 等方式与数据库交互。目前，Goravel 为以下四种数据库提供了官方支持：

| 数据库 | 驱动 |
| --- | --- |
| PostgreSQL | [github.com/goravel/postgres](https://github.com/goravel/postgres) |
| MySQL | [github.com/goravel/mysql](https://github.com/goravel/mysql) |
| SQL Server | [github.com/goravel/sqlserver](https://github.com/goravel/sqlserver) |
| SQLite | [github.com/goravel/sqlite](https://github.com/goravel/sqlite) |

## 配置

数据库的配置文件在 `config/database.go` 文件中。你可以在这个文件中配置所有的数据库连接，并指定默认的数据库连接。该文件中的大部分配置都基于项目的环境变量。

### 连接池

可以在配置文件中配置数据库连接池，合理的配置连接池参数，可以极大的提高并发性能：

| 配置键        | 作用           |
| -----------  | -------------- |
| pool.max_idle_conns         | 最大空闲连接    |
| pool.max_open_conns     | 最大连接数 |
| pool.conn_max_idletime     | 连接最大空闲时间 |
| pool.conn_max_lifetime     | 连接最大生命周期 |

### 读写分离

有时候你可能会希望使用一个数据库连接来执行 `SELECT` 语句，而 `INSERT`、`UPDATE` 和 `DELETE` 语句则由另一个数据库连接来执行。在 Goravel 中可以轻松实现读写分离。

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

我们在数据库配置中加入了两个键，分别是：`read`, `write`，`192.168.1.1` 将会被用作「读」连接主机，而 `192.168.1.2` 将作为「写」连接主机。这两个连接将共享 `mysql` 数组中的各项配置，如数据库前缀、字符编码等。如果 `read` 或 `write` 数组中存在多个值，Goravel 将会为每个连接随机选取所使用的数据库主机。

## 运行原生 SQL 查询

配置好数据库连接后，你就可以使用 `facades.DB()` 来运行查询。`facades.DB` 提供了各种方法用于运行查询：`Select`、`Insert`、`Update`、`Delete` 和 `Statement`。

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

> 注意：不同数据库驱动需要使用不同的占位符，例如：`?` 占位符适用于 MySQL，而 `@` 占位符适用于 PostgreSQL。

### Insert

使用 `facades.DB().Insert()` 方法执行插入语句：

```go
result, err := facades.DB().Insert("insert into users (name, email) values (?, ?)", "Goravel", "goravel@example.com")
```

### Update

使用 `facades.DB().Update()` 方法执行更新语句：

```go
result, err := facades.DB().Update("update users set name = ? where id = ?", "Goravel", 1)
```

### Delete

使用 `facades.DB().Delete()` 方法执行删除语句：

```go
result, err := facades.DB().Delete("delete from users where id = ?", 1)
```

### Statement

使用 `facades.DB().Statement()` 方法执行通用语句：

```go
err := facades.DB().Statement("drop table users")
```

### 使用多个数据库连接

如果你在配置文件中定义了多个数据库连接，你可以通过 `facades.DB().Connection()` 方法来指定要使用的连接：

```go
var user User
err := facades.DB().Connection("postgres").Select(&user, "select * from users where id = ?", 1)
```

## 数据库事务

你可以使用 `facades.DB().Transaction()` 方法在数据库事务中执行一系列操作。如果在事务闭包中抛出了异常，事务将自动回滚。如果闭包成功执行，事务将自动提交：

```go
import "github.com/goravel/framework/contracts/database/db"

err := facades.DB().Transaction(func(tx db.Tx) error {
  _, err := tx.Table("products").Insert(Product{Name: "transaction product1"})

  return err
})
```

### 手动使用事务

如果你想手动控制事务的开始、提交和回滚，可以使用 `Begin`、`Commit` 和 `Rollback` 方法：

```go
tx, err := facades.DB().BeginTransaction()
if err != nil {
  return err
}

_, err = tx.Insert("insert into users (name) values (?)", "Goravel")
if err != nil {
  tx.Rollback()
  return err
}

err = tx.Commit()
if err != nil {
  return err
}
```

## 检查数据库

### 数据库概览

Goravel 提供了几个 Artisan 命令来帮助你了解数据库的结构。

可以使用 `db:show` 命令查看数据库中的所有表。

```bash
go run . artisan db:show
go run . artisan db:show --database=postgres
```

也可以使用 `db:table` 命令查看指定表的结构。

```bash
go run . artisan db:table
go run . artisan db:table --database=postgres
```

### 表的摘要信息

如果你想获得数据库中单张表的概览，你可以执行 `db:table` Artisan命令。这个命令提供了一个数据库表的概览，包括它的列、类型、属性、键和索引:

```bash
go run . artisan db:table users
go run . artisan db:table users --database=postgres
```
