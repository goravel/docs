# 快速入门

[[toc]]

## 简介

几乎所有的应用程序都需要和数据库进行交互，Goravel 为此提供了一套非常简单易用的数据库交互方式。开发者可以使用原生 SQL，查询构造器，以及 [Orm](../orm/getting-started) 等方式与数据库交互。目前，Goravel 为以下四种数据库提供了官方支持：

| 数据库 | 驱动 |
| --- | --- |
| PostgreSQL | [github.com/lib/pq](https://github.com/lib/pq) |
| MySQL | [github.com/goravel/mysql](https://github.com/goravel/mysql) |
| SQL Server | [github.com/denisenkom/go-mssqldb](https://github.com/denisenkom/go-mssqldb) |
| SQLite | [github.com/mattn/go-sqlite3](https://github.com/mattn/go-sqlite3) |

## 配置

数据库的配置文件在 `config/database.go` 文件中。你可以在这个文件中配置所有的数据库连接，并指定默认的数据库连接。该文件中的大部分配置都基于项目的环境变量，且提供了 Goravel 所支持的数据库配置示例。

在开始之前，请在 `.env` 文件中配置数据库链接信息，并确认 `config/database.go` 的默认配置。

### DSN

你也可以直接使用 DSN 连接数据库，只需要在配置文件中配置 `dsn` 字段即可：

```go
"postgres": map[string]any{
  "driver":   "postgres",
++  "dsn": "postgres://user:password@localhost:5432/dbname?sslmode=disable",
  ...
}
```

### DSN

你也可以直接使用 DSN 连接数据库，只需要在配置文件中配置 `dsn` 字段即可：

```go
"postgres": map[string]any{
  "driver":   "postgres",
  "dsn": "postgres://user:password@localhost:5432/dbname?sslmode=disable",
  ...
}
```

### 读写分离

有时候您可能会希望使用一个数据库连接来执行 `SELECT` 语句，而 `INSERT`、`UPDATE` 和 `DELETE` 语句则由另一个数据库连接来执行。在 Goravel 中可以轻松实现读写分离。

为了弄明白如何配置读写分离，我们先来看个例子：

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
    "loc":      "Local",
  },
}
```

我们在数据库配置中加入了两个键，分别是：`read`, `write`，`192.168.1.1` 将会被用作「读」连接主机，而 `192.168.1.2` 将作为「写」连接主机。这两个连接将共享 `mysql` 数组中的各项配置，如数据库前缀、字符编码等。如果 `read` 或 `write` 数组中存在多个值，Goravel 将会为每个连接随机选取所使用的数据库主机。

### 连接池

可以在配置文件中配置数据库连接池，合理的配置连接池参数，可以极大的提高并发性能：

| 配置键        | 作用           |
| -----------  | -------------- |
| pool.max_idle_conns         | 最大空闲连接    |
| pool.max_open_conns     | 最大连接数 |
| pool.conn_max_idletime     | 连接最大空闲时间 |
| pool.conn_max_lifetime     | 连接最大生命周期 |

### Schema

Postgres 和 Sqlserver 驱动支持配置 Schema。其中 Postgres 可以直接在配置文件中设置 Schema，而 Sqlserver 则需要通过在模型中设置 `TableName` 方法来指定 Schema。

#### Postgres

```go
"connections": map[string]any{
  "postgres": map[string]any{
    "driver":   "postgres",
    ...
    "schema": "goravel",
  },
}
```

#### Sqlserver

```go
func (r *User) TableName() string {
  return "goravel.users"
}
```

## 运行原生 SQL 查询

配置好数据库连接后，你就可以使用 `facades.DB()` 来运行查询。`DB` 门面提供了各种方法用于运行查询：`Select`、`Insert`、`Update`、`Delete` 和 `Statement`。

### Select 查询

要运行基本的查询，你可以使用 `facades.DB()` 的 `Select` 方法：

```go
import "github.com/goravel/framework/facades"

rows, err := facades.DB().Select("select * from users where id = ?", 1)
if err != nil {
  // 处理错误
}

// 遍历结果
for _, row := range rows {
  fmt.Println(row["id"], row["name"])
}
```

`Select` 方法返回一个 `[]map[string]any` 类型的结果集，你可以通过列名访问每一行的值。

### 使用命名绑定

除了使用 `?` 占位符来表示参数绑定外，你还可以使用命名绑定来执行查询：

```go
rows, err := facades.DB().Select("select * from users where id = @id", map[string]any{
  "id": 1,
})
```

### 执行插入语句

要执行 `insert` 语句，你可以使用 `facades.DB()` 的 `Insert` 方法。和 `Select` 一样，该方法接受 SQL 查询作为其第一个参数，将参数作为第二个参数：

```go
id, err := facades.DB().Insert("insert into users (name, email) values (?, ?)", "Goravel", "goravel@example.com")
if err != nil {
  // 处理错误
}

// 获取最后插入的ID
fmt.Println(id)
```

### 执行更新语句

`Update` 方法用于更新数据库中已存在的记录。该方法返回受影响的行数：

```go
affected, err := facades.DB().Update("update users set name = ? where id = ?", "Goravel", 1)
if err != nil {
  // 处理错误
}

// 获取受影响的行数
fmt.Println(affected)
```

### 执行删除语句

`Delete` 方法用于从数据库中删除记录。和 `Update` 一样，返回受影响的行数：

```go
affected, err := facades.DB().Delete("delete from users where id = ?", 1)
if err != nil {
  // 处理错误
}

// 获取受影响的行数
fmt.Println(affected)
```

### 执行通用语句

有些数据库语句不会返回任何值。对于这些操作，你可以使用 `facades.DB()` 的 `Statement` 方法：

```go
err := facades.DB().Statement("drop table users")
if err != nil {
  // 处理错误
}
```

### 使用多个数据库连接

如果你在配置文件中定义了多个数据库连接，你可以通过 `facades.DB()` 的 `Connection` 方法来指定要使用的连接：

```go
rows, err := facades.DB().Connection("postgres").Select("select * from users where id = ?", 1)
```

## 数据库事务

你可以使用 `facades.DB()` 的 `Transaction` 方法在数据库事务中执行一系列操作。如果在事务闭包中抛出了异常，事务将自动回滚。如果闭包成功执行，事务将自动提交：

```go
err := facades.DB().Transaction(func(tx database.Transaction) error {
  _, err := tx.Insert("insert into users (name) values (?)", "Goravel")
  if err != nil {
    // 发生错误时将自动回滚事务
    return err
  }
  
  _, err = tx.Update("update posts set title = ? where id = ?", "Goravel", 1)
  if err != nil {
    return err
  }
  
  // 当没有错误发生时，事务将自动提交
  return nil
})
```

### 手动使用事务

如果你想手动控制事务的开始、提交和回滚，可以使用 `Begin`、`Commit` 和 `Rollback` 方法：

```go
tx, err := facades.DB().Begin()
if err != nil {
  // 处理错误
}

// 在事务中执行查询
_, err = tx.Insert("insert into users (name) values (?)", "Goravel")
if err != nil {
  // 发生错误时回滚事务
  tx.Rollback()
  return err
}

// 提交事务
err = tx.Commit()
if err != nil {
  // 处理提交错误
}
```

## 连接到数据库 CLI

如果你想连接到数据库的命令行界面，可以使用 `db` Artisan 命令：

```shell
go run . artisan db
```

如果需要指定数据库连接，可以使用 `--connection` 选项：

```shell
go run . artisan db --connection=postgres
```

## 检查数据库

### 数据库概览

Goravel 提供了几个 Artisan 命令来帮助你了解数据库的结构。首先，`db:show` 命令可以用来获取数据库中所有表的概览：

```shell
go run . artisan db:show
```

你可以通过 `--database` 选项向命令提供数据库连接名称来指定应该检查哪个数据库连接:

```shell
go run . artisan db:show --database=postgres
```

如果希望在命令的输出中包含表行计数和数据库视图详细信息，你可以分别提供 `--counts` 和 `--views` 选项：

```shell
go run . artisan db:show --counts --views
```

### 表的摘要信息

如果你想获得数据库中单张表的概览，你可以执行 `db:table` Artisan命令。这个命令提供了一个数据库表的概览，包括它的列、类型、属性、键和索引:

```shell
go run . artisan db:table users
```

## 监控数据库

使用 `db:monitor` Artisan命令，如果你的数据库正在管理超过指定数量的打开连接，可以通过 Goravel 调度触发 `database.DatabaseBusy` 事件。

开始, 你应该将 `db:monitor` 命令安排为每分钟运行一次。该命令接受要监视的数据库连接配置的名称，以及在分派事件之前应允许的最大打开连接数：

```shell
go run . artisan db:monitor --databases=mysql,postgres --max=100
```

仅调度此命令不足以触发通知，提醒你打开的连接数。当命令遇到打开连接计数超过阈值的数据库时，将调度 `DatabaseBusy` 事件。你应该在应用程序的 `EventServiceProvider` 中侦听此事件，以便向你或你的开发团队发送通知：

```go
import (
  "github.com/goravel/framework/contracts/event"
  "github.com/goravel/framework/contracts/foundation"
  "github.com/goravel/framework/facades"
  
  "goravel/app/events"
  "goravel/app/listeners"
)

type EventServiceProvider struct {
}

func (receiver *EventServiceProvider) Register(app foundation.Application) {
  facades.Event().Register(receiver.listen())
}

func (receiver *EventServiceProvider) Boot(app foundation.Application) {
}

func (receiver *EventServiceProvider) listen() map[event.Event][]event.Listener {
  return map[event.Event][]event.Listener{
    &events.DatabaseBusy{}: {
      &listeners.NotifyDatabaseTeam{},
    },
  }
}
```
