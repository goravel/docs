# 開始使用

[[toc]]

## 概述

幾乎所有的應用程式都需要與資料庫進行互動，因此 Goravel 提供了一個非常簡單易用的資料庫互動方式。 開發者可以使用原生 SQL、查詢生成器和 [Orm](../orm/getting-started) 與資料庫互動。 目前，Goravel 正式支援以下四種資料庫：

| 資料庫        | 驅動                                                                                   |
| ---------- | ------------------------------------------------------------------------------------ |
| PostgreSQL | [github.com/goravel/postgres](https://github.com/goravel/postgres)   |
| MySQL      | [github.com/goravel/mysql](https://github.com/goravel/mysql)         |
| SQL Server | [github.com/goravel/sqlserver](https://github.com/goravel/sqlserver) |
| SQLite     | [github.com/goravel/sqlite](https://github.com/goravel/sqlite)       |

## 配置

資料庫配置檔案為 `config/database.go`。 您可以在此檔案中配置所有資料庫連接並指定預設資料庫連接。 此檔案中的大部分配置都是根據專案的環境變數。

### 連接池

您可以在配置檔案中配置資料庫連接池，透過合理配置連接池參數來提高併發性能：

| 配置鍵                                                                              | 描述       |
| -------------------------------------------------------------------------------- | -------- |
| pool.max_idle_conns    | 最大空閒連接   |
| pool.max_open_conns    | 最大連接數    |
| pool.conn_max_idletime | 連接最大空閒時間 |
| pool.conn_max_lifetime | 連接最大生命周期 |

### 讀寫分離

有時您可能想使用資料庫連接來執行 `SELECT` 語句，而 `INSERT`、`UPDATE` 和 `DELETE` 語句則由另一個資料庫連接執行。 在 Goravel 中，實現讀寫分離非常容易。

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

我們在資料庫配置中加入了兩個鍵，分別是：`read`, `write`。 `192.168.1.1` 將作為「讀」連接主機，而 `192.168.1.2` 將作為「寫」連接主機。 這兩個連接將共享 `mysql` 陣列中的配置，例如資料庫前綴和字符編碼。 如果 `read` 或 `write` 陣列中有多個值，Goravel 將會為每個連接隨機選取資料庫主機。

## 執行原生 SQL 查詢

配置好資料庫連接後，您可以使用 `facades.DB()` 來執行查詢。 `facades.DB` 提供多種方法來運行查詢：`Select`、`Insert`、`Update`、`Delete` 和 `Statement`。

### 選擇

使用 `facades.DB().Select()` 方法來執行基本查詢：

```go
// 獲取多條記錄
var products []Product
err := facades.DB().Select(&products, "SELECT * FROM products")

// 獲取單條記錄
var product Product
err := facades.DB().Select(&product, "SELECT * FROM products WHERE id = ?", 1)
```

> 注意：不同的資料庫驅動程式需要不同的佔位符。 例如，`?` 佔位符用於 MySQL，而 `@` 佔位符用於 PostgreSQL。

### 插入

使用 `facades.DB().Insert()` 方法來執行插入語句：

```go
result, err := facades.DB().Insert("insert into users (name, email) values (?, ?)", "Goravel", "goravel@example.com")
```

### 更新

使用 `facades.DB().Update()` 方法來執行更新語句：

```go
result, err := facades.DB().Update("update users set name = ? where id = ?", "Goravel", 1)
```

### 刪除

使用 `facades.DB().Delete()` 方法來執行刪除語句：

```go
result, err := facades.DB().Delete("delete from users where id = ?", 1)
```

### 語句

使用 `facades.DB().Statement()` 方法來執行一般語句：

```go
err := facades.DB().Statement("drop table users")
```

### 使用多個資料庫連接

如果您在配置文件中定義了多個資料庫連接，您可以通過調用 `facades.DB().Connection()` 方法來指定要使用的連接：

```go
var user User
err := facades.DB().Connection("postgres").Select(&user, "select * from users where id = ?", 1)
```

## 資料庫交易

您可以使用 `facades.DB().Transaction()` 方法來執行一系列的資料庫交易。 如果在交易閉包中拋出異常，交易將自動回滾。 如果閉包成功執行，交易將自動提交：

```go
import "github.com/goravel/framework/contracts/database/db"

err := facades.DB().Transaction(func(tx db.Tx) error {
  _, err := tx.Table("products").Insert(Product{Name: "transaction product1"})

  return err
})
```

### 手動使用交易

如果您想手動控制交易的開始、提交和回滾，您可以使用 `Begin`、`Commit` 和 `Rollback` 方法：

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

## 檢查資料庫

### 資料庫概述

Goravel 提供了幾個 Artisan 命令來幫助您了解資料庫的結構。

您可以使用 `db:show` 命令查看資料庫中的所有表。

```bash
go run . artisan db:show
go run . artisan db:show --database=postgres
```

您還可以使用 `db:table` 命令來查看特定表的結構。

```bash
go run . artisan db:table
go run . artisan db:table --database=postgres
```

### 表概述

如果您想獲得資料庫中單張表的概述，您可以執行 `db:table` Artisan 命令。這個命令提供了一個資料庫表的概述，包括它的列、類型、屬性、鍵和索引: 此命令提供了資料庫表的概述，包括其列、類型、屬性、鍵和索引：

```bash
go run . artisan db:table users
go run . artisan db:table users --database=postgres
```
