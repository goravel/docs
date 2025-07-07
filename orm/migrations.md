# Migrations

[[toc]]

## Introduction

When multiple people collaborate to develop applications, it's crucial to have a standardized database structure for synchronization. Without this, there could be chaos as everyone's individual data won't match up. Database migration is the solution to this problem. The database structure is version-controlled to ensure its consistency within all developers.

## Configuration

The database migration files are stored in the `database/migrations` directory. You can configure the database connection information in the `config/database.go` file.

```go
"migrations": map[string]any{
  // You can cumstomize the table name of migrations
  "table":  "migrations",
},
```

## Create Migrations

Use the `make:migration` command to create the migration:

```shell
go run . artisan make:migration create_users_table
```

This command will generate migration files in the `database/migrations` directory. Each migration file will begin with a timestamp, which Goravel will use to determine the execution order of the migration files.

### Quickly Create

Use `create_users_table` to automatically generate a table containing the infrastructure of `users`:

```
^create_(\w+)_table$
^create_(\w+)$
```

Use `add_avatar_to_users_table` to automatically generate a structure for adding fields to the `users` table:

```
_(to|from|in)_(\w+)_table$
_(to|from|in)_(\w+)$
```

If the above conditions are not matched, the framework will generate an empty migration file.

## Migration Structure

### Go Language Migration

The migration struct contains two methods: `Up` and `Down`. The `Up` method is used to add new tables, columns, or indexes to the database, while the `Down` method is used to undo the operations performed by the `Up` method. In these two methods, you can use `facades.Schema()` to create and operate database tables. For available methods, see the [documentation](#tables). The following migration will create a `users` table:

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

#### Set Migration Connection

If the migration will interact with a database connection other than the application's default database connection, you should use the migration's `Connection` method:

```go
func (r *M20241207095921CreateUsersTable) Connection() string {
  return "connection-name"
}
```

## Register Migrations

When using Go language migrations, you need to register the migration files in the `database/kernel.go` file after the migration files are generated:

```go
// database/kernel.go
func (kernel Kernel) Migrations() []schema.Migration {
	return []schema.Migration{
		&migrations.M20241207095921CreateUsersTable{},
	}
}
```

## Run Migrations

To run all of your outstanding migrations, execute the `migrate` Artisan command:

```shell
go run . artisan migrate
```

If you would like to see which migrations have run thus far, you may use the `migrate:status` Artisan command:

```shell
go run . artisan migrate:status
```

## Rolling Back Migrations

To roll back the latest migration, use the `rollback` Artisan command. This command rolls back the last "batch" of migrations, which may include multiple migration files:

```shell
go run . artisan migrate:rollback
```

You may roll back a limited number of migrations by providing the `step` option to the `rollback` command. For example, the following command will roll back the last five migrations:

```shell
go run . artisan migrate:rollback --step=5
```

The `migrate:reset` command will roll back all of your application's migrations:

```shell
go run . artisan migrate:reset
```

### Roll Back & Migrate Using A Single Command

The `migrate:refresh` command will roll back all of your migrations and then execute the `migrate` command. This command effectively re-creates your entire database:

```shell
go run . artisan migrate:refresh
```

You may roll back and re-migrate a limited number of migrations by providing the `step` option to the `refresh` command. For example, the following command will roll back and re-migrate the last five migrations:

```shell
go run . artisan migrate:refresh --step=5
```

### Drop All Tables & Migrate

The `migrate:fresh` command will drop all tables from the database and then execute the `migrate` command:

```shell
go run . artisan migrate:fresh
```

## Tables

### Create Table

```go
facades.Schema().Create("users", func(table schema.Blueprint) {
  table.ID()
  table.String("name").Nullable()
  table.String("email").Nullable()
  table.Timestamps()
})
```

### Check If Table / Column Exists

```go
if facades.Schema().HasTable("users") {}
if facades.Schema().HasColumn("users", "email") {}
if facades.Schema().HasColumns("users", []string{"name", "email"}) {}
if facades.Schema().HasIndex("users", "email_unique") {}
```

### Database Connection

```go
facades.Schema().Connection("sqlite").Create("users", func(table schema.Blueprint) {
  table.ID()
})
```

### Update Table

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.String("name").Nullable()
})
```

### Rename / Drop Table

```go
facades.Schema().Rename("users", "new_users")
facades.Schema().Drop("users")
facades.Schema().DropIfExists("users")

```

## Columns

### Available Column Types

|     |     |     |     |
|-----|-----|-----|-----|
| BigIncrements | BigInteger | Boolean | Char |
| Date | DateTime | DateTimeTz | Decimal |
| Double | [Enum](#enum) | Float | [ID](#id) |
| Increments | Integer | IntegerIncrements | Json |
| Increments | LongText | MediumIncrements | MediumInteger |
| MediumText | SmallIncrements | SmallInteger | [SoftDeletes](#softdeletes) |
| SoftDeletesTz | String | Text | Time |
| TimeTz | Timestamp | Timestamps | TimestampsTz |
| TimestampTz | UnsignedBigInteger | TinyIncrements | TinyInteger |
| TinyText | UnsignedInteger | UnsignedMediumInteger | UnsignedSmallInteger |
| UnsignedTinyInteger |  |  |  |

#### Enum

Create an `Enum` field that can be stored in `Mysql` according to the type in `[]any`, but in `Postgres`, `Sqlite`, and `Sqlserver` databases, it is a `String` type.

```go
table.Enum("difficulty", []any{"easy", "hard"})
table.Enum("num", []any{1, 2})
```

#### ID

The `ID` method is an alias for the `BigIncrements` method. By default, this method will create an `id` column; however, if you would like to assign a different name to the column, you may pass the column name:

```go
table.ID()
table.ID("user_id")
```

#### SoftDeletes

The `SoftDeletes` method adds a nullable `deleted_at` `TIMESTAMP` column. This column is intended to store the `deleted_at` timestamp required for the Orm "soft delete" feature:

```go
table.SoftDeletes()
```

#### Custom column

If you are using column types that framework does not support yet, you can use the `Column` method to customize the field type:

```go
table.Column("geometry", "geometry")
```

### Column Modifiers

In addition to the column types listed above, when adding a column to a database table, you can also add "modifiers" to the column. For example, to allow a column to be "nullable," you can use the `Nullable` method:

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.String("name").Nullable()
})
```

The following table contains all available column modifiers:

| Modified | Description |
|-----|-----|
| `.AutoIncrement()` | Sets an integer column as auto-incrementing (primary key) |
| `.Comment("my comment")` | Adds a comment to the column (MySQL / PostgreSQL) |
| `.Default(value)` | Sets the default value for the column |
| `.Nullable()` | Allows NULL values to be inserted into the column |
| `.Unsigned()` | Sets an integer column as UNSIGNED (MySQL only) |
| `.UseCurrent()` | Sets a timestamp column to use CURRENT_TIMESTAMP as the default value |
| `.UseCurrentOnUpdate()` | Sets a timestamp column to use CURRENT_TIMESTAMP when the record is updated (MySQL only) |

### Drop Column

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.DropColumn("name")
  table.DropColumn("name", "age")
})
```

## Indexes

### Create Index

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  // Add primary key
  table.Primary("id")
  // Add composite primary key
  table.Primary("id", "name")

  // Add unique index
  table.Unique("name")
  table.Unique("name", "age")

  // Add normal index
  table.Index("name")
  table.Index("name", "age")

  // Add fulltext index
  table.FullText("name")
  table.FullText("name", "age")
})
```

### Rename Index

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.RenameIndex("users_name_index", "users_name")
})
```

### Drop Index

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

### Create Foreign Key

```go
facades.Schema().Table("posts", func(table schema.Blueprint) {
  table.UnsignedBigInteger("user_id")
  table.Foreign("user_id").References("id").On("users")
})
```

### Drop Foreign Key

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.DropForeign("user_id")
  table.DropForeignByName("user_id_foreign")
})
```

<CommentService/>
