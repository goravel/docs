# 遷移

[[toc]]

## 概述

當多個人協作開發應用程式時，擁有一個標準化的數據庫結構以便於同步是至關重要的。 否則，可能會出現混亂，因為每個人的個別數據將無法對應。 數據庫遷移是解決此問題的方案。 數據庫結構是版本控制的，以確保所有開發人員之間的一致性。

## 配置

數據庫遷移文件存放在 `database/migrations` 目錄下。 你可以在 `config/database.go` 文件中配置數據庫連接信息。

```go
"migrations": map[string]any{
  // 可以自定義遷移的表名稱
  "table":  "migrations",
},
```

## 生成遷移

使用 `make:migration` 命令來創建遷移：

```shell
go run . artisan make:migration create_users_table
```

該命令會在 `database/migrations` 目錄下生成遷移文件。 所有遷移文件都以一個時間戳為開頭，Goravel 將依據此作為遷移文件的執行順序。

### 快速創建

使用 `create_users_table` 將會自動生成包含 `users` 基礎結構的表，實現原理是根據正則進行匹配：

```
^create_(\w+)_table$
^create_(\w+)$
```

使用 `add_avatar_to_users_table` 將會自動生成向 `users` 表增加字段的結構，實現原理是根據正則進行匹配：

```
_(to|from|in)_(\w+)_table$
_(to|from|in)_(\w+)$
```

未匹配到上述情況時，框架會生成一個空的遷移文件。

## 遷移結構

### Go 語言遷移

遷移結構包含兩個方法： `Up` 和 `Down`。 `Up` 方法用於向數據庫添加新表、列或索引，而 `Down` 方法用於撤消 `Up` 方法所執行的操作。 在這兩個方法中，你可以使用 `facades.Schema()` 來創建和操作數據庫表。 有關可用方法，請參閱 [文檔](#tables)。 以下遷移將創建一個 `users` 表：

```go
package migrations

import (
	"github.com/goravel/framework/contracts/database/schema"
	"github.com/goravel/framework/facades"
)

type M20241207095921CreateUsersTable struct {
}

// 簽名：遷移的唯一簽名。
func (r *M20241207095921CreateUsersTable) Signature() string {
	return "20241207095921_create_users_table"
}

// Up 執行遷移。
func (r *M20241207095921CreateUsersTable) Up() error {
	if !facades.Schema().HasTable("users") {
		return facades.Schema().Create("users", func(table schema.Blueprint) {
			table.ID()
			table.String("name").Nullable()
			table.String("email").Nullable()
			table.Timestamps()
		})
	}

	return nil
}

// Down 逆向執行遷移。
func (r *M20241207095921CreateUsersTable) Down() error {
	return facades.Schema().DropIfExists("users")
}
```

#### 設置遷移連接

如果遷移將與應用程序默認數據庫連接以外的數據庫連接進行交互，你可以使用遷移的 `Connection` 方法：

```go
func (r *M20241207095921CreateUsersTable) Connection() string {
  return "connection-name"
}
```

## 註冊遷移

在遷移文件生成後，需要在 `database/kernel.go` 文件中註冊這些遷移文件，若這些遷移文件是透過 `make:migration` 命令生成的，框架將自動註冊它們。

```go
// database/kernel.go
func (kernel Kernel) Migrations() []schema.Migration {
	return []schema.Migration{
		&migrations.M20241207095921CreateUsersTable{},
	}
}
```

## 執行遷移

要運行所有未執行過的遷移，請執行 `migrate` Artisan 命令：

```shell
go run . artisan migrate
```

如果你想查看目前的遷移狀態，可以使用 `migrate:status` Artisan 命令：

```shell
go run . artisan migrate:status
```

## 回滾遷移

要回滾最新的遷移，使用 `rollback` Artisan 命令。 該命令會回滾最後「一批」的遷移，這可能包含多個遷移文件：

```shell
go run . artisan migrate:rollback
```

透過向 `rollback` 命令加上 `step` 參數，可以回滾指定數量的遷移。 例如，以下命令將回滾最後五個遷移： 例如，以下命令將回滾最後五個遷移：

```shell
go run . artisan migrate:rollback --step=5
```

`migrate:reset` 命令會回滾應用已運行過的所有遷移：

```shell
go run . artisan migrate:reset
```

### 使用單個命令同時進行回滾和遷移操作

`migrate:refresh` 命令將會回滾所有已運行過的遷移，然後執行 `migrate` 命令。 這一命令可以高效地重建你的整個數據庫： 此命令實際上會重新創建您的整個數據庫：

```shell
go run . artisan migrate:refresh
```

透過在命令 `refresh` 中使用 `step` 參數，你可以回滾並重新執行指定數量的遷移操作。 例如，下列命令會回滾並重新執行最後五個遷移操作： 例如，以下命令將回滾並重新遷移最後五個遷移：

```shell
go run . artisan migrate:refresh --step=5
```

### 刪除所有表然後執行遷移

`migrate:fresh` 命令會刪去數據庫中的所有表，隨後執行 `migrate` 命令：

```shell
go run . artisan migrate:fresh
```

## 表

### 創建表

```go
facades.Schema().Create("users", func(table schema.Blueprint) {
  table.ID()
  table.String("name").Nullable()
  table.String("email").Nullable()
  table.Timestamps()
})
```

### 檢查表 / 列是否存在

```go
if facades.Schema().HasTable("users") {}
if facades.Schema().HasColumn("users", "email") {}
if facades.Schema().HasColumns("users", []string{"name", "email"}) {}
if facades.Schema().HasIndex("users", "email_unique") {}
```

### 數據庫連接

```go
facades.Schema().Connection("sqlite").Create("users", func(table schema.Blueprint) {
  table.ID()
})
```

### 更新表

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.String("name").Nullable()
})
```

### 重命名列

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.RenameColumn("old_name", "new_name")
})
```

### 添加表註釋

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.Comment("user table")
})
```

### 重命名 / 刪除表

```go
facades.Schema().Rename("users", "new_users")
facades.Schema().Drop("users")
facades.Schema().DropIfExists("users")

```

## 列

### 可用的字段類型

#### 布爾類型

布爾值

#### 字符串 & 文本類型

Char, Json, LongText, MediumText, String, Text, LongText, TinyText, Uuid, Ulid

#### 數字類型

BigIncrements, BigInteger, Decimal, Double, Float, [ID](#id), Increments, Integer, IntegerIncrements, MediumIncrements, MediumInteger, SmallIncrements, SmallInteger, TinyIncrements, TinyInteger, UnsignedBigInteger, UnsignedInteger, UnsignedMediumInteger, UnsignedSmallInteger, UnsignedTinyInteger

#### 日期 & 時間類型

Date, DateTime, DateTimeTz, [SoftDeletes](#softdeletes), SoftDeletesTz, Time, TimeTz, Timestamp, TimestampTz, Timestamps, TimestampsTz

#### 其他類型

[Enum](#enum), Morphs, NullableMorphs, NumericMorphs, UuidMorphs, UlidMorphs

#### Enum

創建一個 `Enum` 字段，該字段在 `Mysql` 中可以根據 `[]any` 中的類型進行儲存，但在 `Postgres`, `Sqlite` 和 `Sqlserver` 數據庫中都是 `String` 類型。

```go
table.Enum("difficulty", []any{"easy", "hard"})
table.Enum("num", []any{1, 2})
```

#### ID

`ID` 方法是 `BigIncrements` 方法的別名。 根據默認情況，該方法將創建一個 `id` 列；然而，如果你想要將該列指定不同名稱，可以傳遞狀列名稱：

```go
table.ID()
table.ID("user_id")
```

#### SoftDeletes

`SoftDeletes` 方法添加了一個可為空的 `deleted_at` `TIMESTAMP` 列。 此列旨在存儲對應於Orm的"軟刪除"功能所需的`deleted_at`時間戳：

```go
table.SoftDeletes()
```

#### 自定義列

如果你正在使用框架尚不支持的字段類型，可以通過 `Column` 方法自定義字段類型：

```go
table.Column("geometry", "geometry")
```

### 列修飾符

除上述列類型外，當向數據庫表添加列時，你也可以為列添加 "修飾符"。 例如，為了允許列是 "可為空" 的，你可以使用 `Nullable` 方法：

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.String("name").Nullable()
})
```

下面的表包含所有可用的列修飾符：

| 修飾過的                                                      | 描述                                                                                    |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| .Always()              | 該列的值始終由數據庫系統自動生成，使用者無法直接插入或修改（僅限 PostgreSQL）                                          |
| .AutoIncrement()       | 將整數列設置為自動增長（主鍵）                                                                       |
| .After("column")       | 將列設置為指定列之後（僅限 MySQL）                                                                  |
| .Comment("my comment") | 向列添加注釋（MySQL / PostgreSQL）                                                            |
| `.Change()`                                               | 修改欄位結構 (MySQL / PostgreSQL / Sqlserver)                            |
| `.Default(value)`                                         | 為欄位指定「預設」值                                                                            |
| `.First()`                                                | 將欄位設定為第一個欄位 (僅限 MySQL)                                             |
| `.GeneratedAs()`                                          | 設定欄位的值由資料庫系統自動生成 (僅限 PostgreSQL)                                   |
| `.Nullable()`                                             | 允許插入 NULL 值到欄位中                                                                       |
| `.Unsigned()`                                             | 將整數欄位設定為 UNSIGNED (僅限 MySQL)                                       |
| `.UseCurrent()`                                           | 將時間戳欄位的預設值設為 CURRENT_TIMESTAMP                                   |
| `.UseCurrentOnUpdate()`                                   | 將時間戳欄位的值在紀錄更新時使用 CURRENT_TIMESTAMP (僅限 MySQL) |

### 刪除欄位

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.DropColumn("name")
  table.DropColumn("name", "age")
})
```

## 索引

### 創建索引

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  // 新增主鍵
  table.Primary("id")
  // 新增複合主鍵
  table.Primary("id", "name")

  // 新增唯一索引
  table.Unique("name")
  table.Unique("name", "age")

  // 新增普通索引
  table.Index("name")
  table.Index("name", "age")

  // 新增全文索引
  table.FullText("name")
  table.FullText("name", "age")
})
```

### 重命名索引

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.RenameIndex("users_name_index", "users_name")
})
```

### 刪除索引

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.DropPrimary("id")
  table.DropUnique("name")
  table.DropUniqueByName("name_unique")
  table.DropIndex("name")
  table.DropIndexByName("name_index")
  table.DropFullText("name")
  table.DropFullTextByName("name_fulltext")
})
```

### 外鍵約束

```go
facades.Schema().Table("posts", func(table schema.Blueprint) {
  table.UnsignedBigInteger("user_id")
  table.Foreign("user_id").References("id").On("users")
})
```

### 刪除外鍵

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.DropForeign("user_id")
  table.DropForeignByName("user_id_foreign")
})
```
