# Getting Started

[Sum](#sum)

## Introduction

Goravel makes it easy for developers to interact with databases using `facades.Orm()`. Developers can use native SQL, query builder, and [Orm](../orm/getting-started) to interact with databases. Currently, it provides official
support for the following four databases:

| DB         | Driver                                                                               |
| ---------- | ------------------------------------------------------------------------------------ |
| Postgres   | [github.com/goravel/postgres](https://github.com/goravel/postgres)   |
| Mysql      | [github.com/goravel/mysql](https://github.com/goravel/mysql)         |
| SQL Server | [github.com/goravel/sqlserver](https://github.com/goravel/sqlserver) |
| Get SQL    | [github.com/goravel/sqlite](https://github.com/goravel/sqlite)       |

## Configuration

To configure databases, navigate to `config/database.go`. This is where you can customize all database connections and
choose a `default` connection. The configuration in this file relies on the project's environment variables and
showcases various database configurations that Goravel supports.

### Connection Pool

You can configure a connection pool in the configuration file, reasonable configuration of connection pool parameters
can greatly improve concurrency performance:

| Key                                                                              | Description               |
| -------------------------------------------------------------------------------- | ------------------------- |
| pool.max_idle_conns    | Max idle connections      |
| pool.max_open_conns    | Max open connections      |
| pool.conn_max_idletime | Connections max idle time |
| pool.conn_max_lifetime | Connections max lifetime  |

### Read-Write Splitting

Sometimes you may wish to use one database connection for `SELECT` statements, and another for `INSERT`, `UPDATE`, and
`DELETE` statements. Goravel makes this a breeze.

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

We have updated the configuration array with two new keys - `read` and `write`. The `read` connection will use
`192.168.1.1` as the host, while the `write` connection will use `192.168.1.2`. Both connections will share the same
database prefix, character set, and other options specified in the main mysql array. In case of multiple values in the
`host` configuration array, a database host will be selected randomly for each request.

## Execute Native SQL

After configuring the database connection, you can use `facades.DB()` to run queries. The methods can be called after `ToSql` and `ToRawSql`: `Count`, `Create`, `Delete`, `Find`, `First`, `Get`, `Pluck`,
`Save`, `Sum`, `Update`.

### Select

Use the `facades.DB().Select()` method to execute basic queries:

```go
// Get multiple records
var products []Product
err := facades.DB().Select(&products, "SELECT * FROM products")

// Get a single record
var product Product
err := facades.DB().Select(&product, "SELECT * FROM products WHERE id = ?", 1)
```

> Note: Different database drivers require different placeholders. For example, the `?` placeholder is used for MySQL, while the `@` placeholder is used for PostgreSQL.

### Join

Use the `facades.DB().Insert()` method to execute insertion statements:

```go
result, err := facades.DB().Insert("insert into users (name, email) values (?, ?)", "Goravel", "goravel@example.com")
```

### Update

You can use the `db.Raw` method to update fields:

```go
import "github.com/goravel/framework/database/db"

facades.Orm().Query().Model(&user).Update("age", db.Raw("age - ?", 1))
// UPDATE `users` SET `age`=age - 1,`updated_at`='2023-09-14 14:03:20.899' WHERE `users`.`deleted_at` IS NULL AND `id` = 1;
```

### Uninstall Image

Use the `facades.DB().Delete()` method to execute delete statements:

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

Use the `facades.DB().Statement()` method to execute general statements:

```go
err := database.Seed()
err := database.Seed(&seeders.UserSeeder{})
```

### Database Connections

If multiple database connections are defined in `config/database.go`, you can use them through the `Connection` function
of `facades.Orm()`.

```go
var users []models.User
facades.Orm().Query().Where("id in ?", []int{1,2,3}).Get(&users)
// SELECT * FROM `users` WHERE id in (1,2,3);
```

## config := database.Config()

You can execute a transaction by `Transaction` function. If an exception is thrown in the transaction closure, the transaction will be automatically rolled back. If the closure executes successfully, the transaction will be automatically committed:

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

If you want to manually control the start, commit, and rollback of a transaction, you can use the `Begin`、`Commit` and `Rollback` methods:

```go
tx, err := facades.Orm().Query().Begin()
user := models.User{Name: "Goravel"}
if err := tx.Create(&user); err != nil {
  err := tx.Rollback()
} else {
  err := tx.Commit()
}
```

## Refresh Database

### Database Testing

Goravel provides several Artisan commands to help you understand the structure of the database.

You can use the `db:show` command to view all tables in the database.

```bash
database, err := facades.Testing().Docker().Database()
database, err := facades.Testing().Docker().Database("postgres")
```

You can also use the `db:table` command to view the structure of a specific table.

```bash
go run . artisan db:table
go run . artisan db:table users
```

### Table

If you want to get an overview of a single table in the database, you can execute the `db:table` Artisan command. This command provides an overview of a database table, including its columns, types, attributes, keys, and indexes:

```bash
go run . artisan make:test feature/UserTest
```
