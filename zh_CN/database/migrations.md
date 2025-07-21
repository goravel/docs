# 数据库迁移

[[toc]]

## 简介

当多人协作开发应用程序时，如果同步数据库结构没有一个统一的规范，以保证所有人的本地数据都是一致的，那将是灾难。数据库迁移就是为了解决这个问题，将数据库的结构进行版本控制，以保证所有开发人员的数据库结构的一致性。

## 配置

数据库迁移文件存放在 `database/migrations` 目录下，你可以在 `config/database.go` 文件中配置数据库连接信息。

```go
"migrations": map[string]any{
  // You can cumstomize the table name of migrations
  "table":  "migrations",
},
```

## 生成迁移

使用 `make:migration` 命令来创建迁移：

```shell
go run . artisan make:migration create_users_table
```

该命令会在 `database/migrations` 目录下生成迁移文件，所有迁移文件都以一个时间戳为开头，Goravel 将以此作为迁移文件的执行顺序。

### 快捷生成

使用 `create_users_table` 将会自动生成包含 `users` 基础结构的表，实现原理是根据正则进行匹配：

```
^create_(\w+)_table$
^create_(\w+)$
```

使用 `add_avatar_to_users_table` 将会自动生成向 `users` 表增加字段的结构，实现原理是根据正则进行匹配：

```
_(to|from|in)_(\w+)_table$
_(to|from|in)_(\w+)$
```

未匹配到上述情况时，框架会生成一个空的迁移文件。

## 迁移结构

### Go 语言迁移

迁移类包含两个方法：`Up` 和 `Down`。`Up` 方法用于向数据库中添加新表、列或索引，而 `Down` 方法用于撤销 `Up` 方法执行的操作。在这两种方法中，可以使用 `facades.Schema()` 来创建和操作数据库表，起可用方法[详见文档](#tables)。以下迁移会创建一个 `users` 表：

```go
package migrations

import (
	"github.com/goravel/framework/contracts/database/schema"
	"github.com/goravel/framework/facades"
)

type M20241207095921CreateUsersTable struct {
}

// Signature The unique signature for the migration.
func (r *M20241207095921CreateUsersTable) Signature() string {
	return "20241207095921_create_users_table"
}

// Up Run the migrations.
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

// Down Reverse the migrations.
func (r *M20241207095921CreateUsersTable) Down() error {
	return facades.Schema().DropIfExists("users")
}
```

#### 设置迁移连接

如果迁移将与应用程序默认数据库连接以外的数据库连接进行交互，你可以使用迁移的 `Connection` 方法：

```go
func (r *M20241207095921CreateUsersTable) Connection() string {
  return "connection-name"
}
```

## 注册迁移

迁移文件生成后需要在 `database/kernel.go` 文件中注册，如果是通过 `make:migration` 命令生成的迁移文件，则不需要手动注册，框架会自动注册。

```go
// database/kernel.go
func (kernel Kernel) Migrations() []schema.Migration {
	return []schema.Migration{
		&migrations.M20241207095921CreateUsersTable{},
	}
}
```

## 执行迁移

执行 Artisan 命令 `migrate`，来运行所有未执行过的迁移：

```shell
go run . artisan migrate
```

如果你想查看目前的迁移状态，可以使用 `migrate:status` Artisan 命令：

```shell
go run . artisan migrate:status
```

## 回滚迁移

如果要回滚最后一次迁移操作，可以使用 Artisan 命令 `rollback`。该命令会回滚最后「一批」的迁移，这可能包含多个迁移文件：

```shell
go run . artisan migrate:rollback
```

通过向 `rollback` 命令加上 `step` 参数，可以回滚指定数量的迁移。例如，以下命令将回滚最后五个迁移：

```shell
go run . artisan migrate:rollback --step=5
```

命令 `migrate:reset` 会回滚应用已运行过的所有迁移：

```shell
go run . artisan migrate:reset
```

### 使用单个命令同时进行回滚和迁移操作

命令 `migrate:refresh` 首先会回滚已运行过的所有迁移，随后会执行 `migrate`。这一命令可以高效地重建你的整个数据库：

```shell
go run . artisan migrate:refresh
```

通过在命令 `refresh` 中使用 `step` 参数，你可以回滚并重新执行指定数量的迁移操作。例如，下列命令会回滚并重新执行最后五个迁移操作：

```shell
go run . artisan migrate:refresh --step=5
```

### 删除所有表然后执行迁移

命令 `migrate:fresh` 会删去数据库中的所有表，随后执行命令 `migrate`：

```shell
go run . artisan migrate:fresh
```

## Tables

### 创建表

```go
facades.Schema().Create("users", func(table schema.Blueprint) {
  table.ID()
  table.String("name").Nullable()
  table.String("email").Nullable()
  table.Timestamps()
})
```

### 检查表 / 列是否存在

```go
if facades.Schema().HasTable("users") {}
if facades.Schema().HasColumn("users", "email") {}
if facades.Schema().HasColumns("users", []string{"name", "email"}) {}
if facades.Schema().HasIndex("users", "email_unique") {}
```

### 数据库连接

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

### 重命名字段

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.RenameColumn("old_name", "new_name")
})
```

### 添加表注释

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.Comment("user table")
})
```

### 重命名 / 删除表

```go
facades.Schema().Rename("users", "new_users")
facades.Schema().Drop("users")
facades.Schema().DropIfExists("users")

```

## 字段

### 可用的字段类型

#### 布尔类型

Boolean

#### 字符串 & 文本类型

Char, Json, LongText, MediumText, String, Text, LongText, TinyText, Uuid, Ulid

#### 数字类型

BigIncrements, BigInteger, Decimal, Double, Float, [ID](#id), Increments, Integer, IntegerIncrements, MediumIncrements, MediumInteger, SmallIncrements, SmallInteger, TinyIncrements, TinyInteger, UnsignedBigInteger, UnsignedInteger, UnsignedMediumInteger, UnsignedSmallInteger, UnsignedTinyInteger

#### 日期 & 时间类型

Date, DateTime, DateTimeTz, [SoftDeletes](#softdeletes), SoftDeletesTz, Time, TimeTz, Timestamp, TimestampTz, Timestamps, TimestampsTz

#### 其他类型

[Enum](#enum), Morphs, NullableMorphs, NumericMorphs, UuidMorphs, UlidMorphs

#### Enum

创建一个 `Enum` 字段，该字段在 `Mysql` 中可以根据 `[]any` 中的类型进行储存，但在 `Postgres`, `Sqlite` 和 `Sqlserver` 数据库中都是 `String` 类型。

```go
table.Enum("difficulty", []any{"easy", "hard"})
table.Enum("num", []any{1, 2})
```

#### ID

`ID` 方法是 `BigIncrements` 方法的别名。默认情况下，该方法将创建一个 `id` 列；但是，如果你想要为该列分配一个不同的名称，可以传递一个列名称：

```go
table.ID()
table.ID("user_id")
```

#### SoftDeletes

`SoftDeletes` 方法添加了一个可以为空的 `deleted_at` `TIMESTAMP` 列。此列旨在存储 Orm 「软删除」功能所需的 `deleted_at` 时间戳：

```go
table.SoftDeletes()
```

#### 自定义字段

如果你正在使用框架尚不支持的字段类型，可以通过 `Column` 方法自定义字段类型：

```go
table.Column("geometry", "geometry")
```

### 列修饰符

除了上面列出的列类型之外，当给数据库表添加一个列时，你还可以给列添加「修饰符」。例如，要使列可以「为空」，你可以使用 `Nullable` 方法：

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.String("name").Nullable()
})
```

以下表格包含所有可用的列修饰符：

| 修饰符 | 描述 |
|-----|-----|
| `.Always()` | 该列的值始终由数据库系统自动生成，用户不能直接插入或修改（仅限 PostgreSQL） |
| `.AutoIncrement()` | 设置整数列为自动增长的（主键） |
| `.After("column")` | 将列设置为指定列之后（适用于 MySQL） |
| `.Comment("my comment")` | 向列添加注释（MySQL / PostgreSQL） |
| `.Change()` | 修改列（MySQL / PostgreSQL / Sqlserver） |
| `.Default(value)` | 为列指定「默认」值 |
| `.First()` | 将列设置为表的第一个字段（适用于 MySQL） |
| `.GeneratedAs()` | 设置列的值由数据库系统自动生成（仅限 PostgreSQL） |
| `.Nullable()` | 允许插入 NULL 值到列中 |
| `.Unsigned()` | 设置整数列为 UNSIGNED（仅限 MySQL） |
| `.UseCurrent()` | 设置时间戳列使用 CURRENT_TIMESTAMP 作为默认值 |
| `.UseCurrentOnUpdate()` | 设置记录更新时，时间戳列使用 CURRENT_TIMESTAMP（仅限 MySQL） |

### 删除列

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.DropColumn("name")
  table.DropColumn("name", "age")
})
```

## 索引

### 创建索引

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  // 添加主键
  table.Primary("id")
  // 添加复合主键
  table.Primary("id", "name")

  // 添加唯一索引
  table.Unique("name")
  table.Unique("name", "age")

  // 添加普通索引
  table.Index("name")
  table.Index("name", "age")

  // 添加全文索引
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

### 删除索引

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

### 外键约束

```go
facades.Schema().Table("posts", func(table schema.Blueprint) {
  table.UnsignedBigInteger("user_id")
  table.Foreign("user_id").References("id").On("users")
})
```

### 删除外键

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.DropForeign("user_id")
  table.DropForeignByName("user_id_foreign")
})
```

