# Getting Started

[[toc]]

## Introduction

Almost all applications need to interact with databases, so Goravel provides a very simple and easy-to-use database interaction. Developers can use native SQL, query builder, and [Orm](../orm/getting-started) to interact with databases. Currently, Goravel provides official support for the following four databases:

| Database   | Driver                                                               |
| ---------- | -------------------------------------------------------------------- |
| PostgreSQL | [github.com/goravel/postgres](https://github.com/goravel/postgres)   |
| MySQL      | [github.com/goravel/mysql](https://github.com/goravel/mysql)         |
| SQL Server | [github.com/goravel/sqlserver](https://github.com/goravel/sqlserver) |
| SQLite     | [github.com/goravel/sqlite](https://github.com/goravel/sqlite)       |

## Configuration

The database configuration file is `config/database.go`. You can configure all database connections in this file and specify the default database connection. Most of the configuration in this file is based on the project's environment variables.

### Connection Pool

You can configure the database connection pool in the configuration file to improve the concurrency performance by properly configuring the connection pool parameters:

| Configuration Key      | Description                  |
| ---------------------- | ---------------------------- |
| pool.max_idle_conns    | Maximum idle connections     |
| pool.max_open_conns    | Maximum connections          |
| pool.conn_max_idletime | Connection maximum idle time |
| pool.conn_max_lifetime | Connection maximum lifetime  |

### Read-Write Splitting

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

We have added two keys, `read` and `write`, in the database configuration. `192.168.1.1` will be used as the "read" connection host, and `192.168.1.2` will be used as the "write" connection host. These two connections will share the configurations in the `mysql` array, such as the database prefix and character encoding. If there are multiple values in the `read` or `write` arrays, Goravel will randomly select the database host for each connection.

## Running Native SQL Queries

After configuring the database connection, you can use `facades.DB()` to run queries. `facades.DB` provides various methods for running queries: `Select`, `Insert`, `Update`, `Delete`, and `Statement`.

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

### Insert

Use the `facades.DB().Insert()` method to execute insertion statements:

```go
result, err := facades.DB().Insert("insert into users (name, email) values (?, ?)", "Goravel", "goravel@example.com")
```

### Update

Use the `facades.DB().Update()` method to execute update statements:

```go
result, err := facades.DB().Update("update users set name = ? where id = ?", "Goravel", 1)
```

### Delete

Use the `facades.DB().Delete()` method to execute delete statements:

```go
result, err := facades.DB().Delete("delete from users where id = ?", 1)
```

### Statement

Use the `facades.DB().Statement()` method to execute general statements:

```go
err := facades.DB().Statement("drop table users")
```

### Using Multiple Database Connections

If you define multiple database connections in the configuration file, you can specify the connection to use by calling the `facades.DB().Connection()` method:

```go
var user User
err := facades.DB().Connection("postgres").Select(&user, "select * from users where id = ?", 1)
```

## Database Transactions

You can use the `facades.DB().Transaction()` method to execute a series of operations in a database transaction. If an exception is thrown in the transaction closure, the transaction will be automatically rolled back. If the closure executes successfully, the transaction will be automatically committed:

```go
import "github.com/goravel/framework/contracts/database/db"

err := facades.DB().Transaction(func(tx db.Tx) error {
  _, err := tx.Table("products").Insert(Product{Name: "transaction product1"})

  return err
})
```

### Manually Using Transactions

If you want to manually control the start, commit, and rollback of a transaction, you can use the `Begin`、`Commit` and `Rollback` methods:

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

## Checking Databases

### Database Overview

Goravel provides several Artisan commands to help you understand the structure of the database.

You can use the `db:show` command to view all tables in the database.

```bash
go run . artisan db:show
go run . artisan db:show --database=postgres
```

You can also use the `db:table` command to view the structure of a specific table.

```bash
go run . artisan db:table
go run . artisan db:table --database=postgres
```

### Table Overview

If you want to get an overview of a single table in the database, you can execute the `db:table` Artisan command. This command provides an overview of a database table, including its columns, types, attributes, keys, and indexes:

```bash
go run . artisan db:table users
go run . artisan db:table users --database=postgres
```
