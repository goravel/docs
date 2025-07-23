# 迁移

[Enum](#enum)

## 简介

当多人协作开发应用程序时，拥有一个标准化的数据库结构以进行同步至关重要。 如果没有这个，每个人的个人数据不匹配可能会导致混乱。 数据库迁移是解决这个问题的方案。 数据库结构被版本控制以确保所有开发人员之间的一致性。 Without this, there could be chaos as everyone's individual data won't match up. 数据库迁移 The database structure is version-controlled to ensure its consistency within all developers.

## 配置

数据库迁移文件存放在 `database/migrations` 目录下，你可以在 `config/database.go` 文件中配置数据库连接信息。 You can configure the database connection information in the `config/database.go` file.

```go
// 可用的驱动程序："default"，"sql"
"migrations": map[string]any{
  "driver": "default",
  // 你可以自定义迁移表的名称
  "table":  "migrations",
},
```

## 创建迁移

使用 `make:migration` 命令创建迁移：

```shell
go run . artisan make:migration create_users_table
```

This command will generate migration files in the `database/migrations` directory. 此命令将在 `database/migrations` 目录中生成迁移文件。 每个迁移文件都将以时间戳开头，Goravel 将使用它来确定迁移文件的执行顺序。

### 快速创建

使用 `add_avatar_to_users_table` 自动生成向 `users` 表添加字段的结构：

```
^create_(\w+)_table$
^create_(\w+)$
```

使用 `create_users_table` 自动生成包含 `users` 基础结构的表：

```
_(to|from|in)_(\w+)_table$
_(to|from|in)_(\w+)$
```

如果不匹配上述条件，框架将生成一个空的迁移文件。

## 迁移结构

### Go 语言迁移

The migration struct contains two methods: `Up` and `Down`. The `Up` method is used to add new tables, columns, or indexes to the database, while the `Down` method is used to undo the operations performed by the `Up` method. In these two methods, you can use `facades.Schema()` to create and operate database tables. For available methods, see the [documentation](#tables). The following migration will create a `users` table:

```go
package migrations

import (
 "github.com/goravel/framework/contracts/database/schema"
 "github.com/goravel/framework/facades"
)

type M20241207095921CreateUsersTable struct {
}

// Signature 迁移的唯一签名。
func (r *M20241207095921CreateUsersTable) Signature() string {
 return "20241207095921_create_users_table"
}

// Up 运行迁移。
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

// Down 回滚迁移。
func (r *M20241207095921CreateUsersTable) Down() error {
 return facades.Schema().DropIfExists("users")
}
```

#### 设置迁移连接

如果迁移将与应用程序默认数据库连接以外的数据库连接进行交互，您应该使用迁移的 `Connection` 方法：

```go
func (r *M20241207095921CreateUsersTable) Connection() string {
  return "connection-name"
}
```

## 注册迁移

当使用Go语言迁移时，在生成迁移文件后，您需要在`database/kernel.go`文件中注册这些迁移文件：

```go
// database/kernel.go
func (kernel Kernel) Migrations() []schema.Migration {
 return []schema.Migration{
  &migrations.M20241207095921CreateUsersTable{},
 }
}
```

## 运行迁移

如果您想查看到目前为止已运行的迁移，可以使用 `migrate:status` Artisan 命令：

```shell
go run . artisan migrate
```

要运行所有未执行的迁移，请执行`migrate` Artisan命令：

```shell
go run . artisan migrate:status
```

## 回滚迁移

要回滚最新的迁移，请使用 `rollback` Artisan 命令。 此命令会回滚最后一个"批次"的迁移，可能包含多个迁移文件： This command rolls back the last "batch" of migrations, which may include multiple migration files:

```shell
go run . artisan migrate:rollback
```

您可以通过向 `rollback` 命令提供 `step` 选项来回滚有限数量的迁移。 例如，以下命令将回滚最后五个迁移： For example, the following command will roll back the last five migrations:

```shell
go run . artisan migrate:rollback --step=5
```

`migrate:reset` 命令将回滚应用程序的所有迁移：

```shell
go run . artisan migrate:reset
```

### 使用单个命令回滚和迁移

`migrate:refresh`命令将回滚所有迁移，然后执行`migrate`命令。 这个命令实际上重新创建了整个数据库： This command effectively re-creates your entire database:

```shell
go run . artisan migrate:refresh
```

您可以通过向`refresh`命令提供`step`选项来回滚和重新迁移有限数量的迁移。
例如，以下命令将回滚并重新迁移最后五个迁移： For example, the following command will roll back and re-migrate the last five migrations:

```shell
go run . artisan migrate:refresh --step=5
```

### 删除所有表并迁移

`migrate:fresh`命令将从数据库中删除所有表，然后执行`migrate`命令：

```shell
go run . artisan migrate:fresh
```

## 表

### 创建表

```go
facades.Schema().Create("users", func(table schema.Blueprint) {
  table.ID()
  table.String("name").Nullable()
  table.String("email").Nullable()
  table.Timestamps()
})
```

### 检查表/列是否存在

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

### String

```go
-- ***.up.sql
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci；

-- ***.down.sql
DROP TABLE `users`；
```

### 添加表注释

```go
迁移结构包含两个方法：`Up` 和 `Down`。 `Up` 方法用于向数据库添加新表、列或索引，而 `Down` 方法用于撤销 `Up` 方法执行的操作。 在这两个方法中，你可以使用 `facades.Schema()` 来创建和操作数据库表。 有关可用方法，请参阅[文档](#tables)。 以下迁移将创建一个 `users` 表：
```

### 重命名/删除表

```go
facades.Schema().Rename("users", "new_users")
facades.Schema().Drop("users")
facades.Schema().DropIfExists("users")

```

## 列

### 可用列类型

#### BigInteger

Boolean

#### 字符串 & 文本类型

Char, Json, LongText, MediumText, String, Text, LongText, TinyText, Uuid, Ulid

#### 数字类型

BigIncrements, BigInteger, Decimal, Double, Float, [ID](#id), Increments, Integer, IntegerIncrements, MediumIncrements, MediumInteger, SmallIncrements, SmallInteger, TinyIncrements, TinyInteger, UnsignedBigInteger, UnsignedInteger, UnsignedMediumInteger, UnsignedSmallInteger, UnsignedTinyInteger

#### DateTime

Date, DateTime, DateTimeTz, [SoftDeletes](#softdeletes), SoftDeletesTz, Time, TimeTz, Timestamp, TimestampTz, Timestamps, TimestampsTz

#### 其他类型

[Enum](#enum), Morphs, NullableMorphs, NumericMorphs, UuidMorphs, UlidMorphs

#### Enum

创建一个可以根据 `[]any` 中的类型存储在 `Mysql` 中的 `Enum` 字段，但在 `Postgres`、`SQLite` 和 `Sqlserver` 数据库中，它是 `String` 类型。

```go
table.Enum("difficulty", []any{"easy", "hard"})
table.Enum("num", []any{1, 2})
```

#### ID

The `ID` method is an alias for the `BigIncrements` method. `ID` 方法是 `BigIncrements` 方法的别名。默认情况下，该方法将创建一个 `id` 列；但是，如果你想要为该列分配一个不同的名称，可以传递一个列名称：

```go
table.ID()
table.ID("user_id")
```

#### SoftDeletes

The `SoftDeletes` method adds a nullable `deleted_at` `TIMESTAMP` column. `SoftDeletes`方法添加一个可为空的`deleted_at` `TIMESTAMP`列。 该列用于存储Orm "软删除"功能所需的`deleted_at`时间戳：

```go
table.SoftDeletes()
```

#### 自定义列

如果您使用的列类型框架尚不支持，可以使用`Column`方法来自定义字段类型：

```go
table.Column("geometry", "geometry")
```

### 列修饰符

In addition to the column types listed above, when adding a column to a database table, you can also add "modifiers" to the column. 除了上面列出的列类型之外，当给数据库表添加一个列时，你还可以给列添加「修饰符」。例如，要使列可以「为空」，你可以使用 `Nullable` 方法：

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.String("name").Nullable()
})
```

下表包含所有可用的列修饰符：

| Modified                 | 描述                                                                            |
| ------------------------ | ----------------------------------------------------------------------------- |
| `.Always()`              | 该列的值始终由数据库系统自动生成，用户不能直接插入或修改（仅限 PostgreSQL）                                   |
| `.AutoIncrement()`       | 将整数列设置为自动递增（主键）                                                               |
| `.After("column")`       | 除了上面列出的列类型外,在向数据库表添加列时,您还可以为列添加"修饰符"。 例如，要允许列为"nullable"，您可以使用`Nullable`方法：   |
| `.Comment("my comment")` | 为列添加注释（MySQL / PostgreSQL）                                                    |
| `.Change()`              | SQL 迁移                                                                        |
| `.Default(value)`        | 设置列的默认值                                                                       |
| `.First()`               | `ID` 方法是 `BigIncrements` 方法的别名。 默认情况下，此方法将创建一个`id`列；但是，如果您想为该列指定不同的名称，可以传递列名： |
| `.GeneratedAs()`         | 设置列的值由数据库系统自动生成（仅限 PostgreSQL）                                                |
| `.Nullable()`            | 允许在列中插入 NULL 值                                                                |
| `.Unsigned()`            | 将整数列设置为 UNSIGNED（仅限 MySQL）                                                    |
| `.UseCurrent()`          | 将时间戳列设置为使用 CURRENT_TIMESTAMP 作为默认值                       |
| `.UseCurrentOnUpdate()`  | 将时间戳列设置为在记录更新时使用 CURRENT_TIMESTAMP（仅限 MySQL）             |

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

### 创建外键

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
