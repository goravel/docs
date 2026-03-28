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
./artisan make:migration
./artisan make:migration create_users_table
```

This command will generate migration files in the `database/migrations` directory. Each migration file will begin with a timestamp, which Goravel will use to determine the execution order of the migration files.

You can also create a migration for a specific model by using the `-m` or `--model` option:

```shell
./artisan make:migration create_users_table -m User
```

The model should be registered in the `bootstrap/app.go` file before running the command. This command will generate a migration file based on the structure defined in the `User` model.

```go
func Boot() contractsfoundation.Application {
  return foundation.Setup().
    WithConfig(config.Boot).
    WithCallback(func() {
      facades.Schema().Extend(schema.Extension{
        Models: []any{models.User{}},
      })
    }).
    Create()
}
```

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
	
  "goravel/app/facades"
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

A new migration created by `make:migration` will be registered automatically in the `bootstrap/migrations.go::Migrations()` function and the function will be called by `WithMigrations`. You need register the rule manually if you create the migration file by yourself.

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithMigrations(Migrations).
		WithConfig(config.Boot).
		Create()
}
```

## Run Migrations

To run all of your outstanding migrations, execute the `migrate` Artisan command:

```shell
./artisan migrate
```

If you would like to see which migrations have run thus far, you may use the `migrate:status` Artisan command:

```shell
./artisan migrate:status
```

## Rolling Back Migrations

To roll back the latest migration batch, use the `rollback` Artisan command:

```shell
./artisan migrate:rollback
```

If you want to roll back multiple migration batches, you can specify the `batch` option, the number indicates which batch to roll back:

```shell
./artisan migrate:rollback --batch=2
```

You may roll back a limited number of migrations by providing the `step` option to the `rollback` command. For example, the following command will roll back the last five migrations:

```shell
./artisan migrate:rollback --step=5
```

The `migrate:reset` command will roll back all of your application's migrations:

```shell
./artisan migrate:reset
```

### Roll Back & Migrate Using A Single Command

The `migrate:refresh` command will roll back all of your migrations and then execute the `migrate` command. This command effectively re-creates your entire database:

```shell
./artisan migrate:refresh
```

You may roll back and re-migrate a limited number of migrations by providing the `step` option to the `refresh` command. For example, the following command will roll back and re-migrate the last five migrations:

```shell
./artisan migrate:refresh --step=5
```

### Drop All Tables & Migrate

The `migrate:fresh` command will drop all tables from the database and then execute the `migrate` command:

```shell
./artisan migrate:fresh
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

### Rename Column

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.RenameColumn("old_name", "new_name")
})
```

### Add Table Comment

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.Comment("user table")
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

#### Boolean Types

Boolean

#### String & Text Types

Char, Json, LongText, MediumText, String, Text, LongText, TinyText, Uuid, Ulid

#### Numeric Types

BigIncrements, BigInteger, Decimal, Double, Float, [ID](#id), Increments, Integer, IntegerIncrements, MediumIncrements, MediumInteger, SmallIncrements, SmallInteger, TinyIncrements, TinyInteger, UnsignedBigInteger, UnsignedInteger, UnsignedMediumInteger, UnsignedSmallInteger, UnsignedTinyInteger

#### Date & Time Types

Date, DateTime, DateTimeTz, [SoftDeletes](#softdeletes), SoftDeletesTz, Time, TimeTz, Timestamp, TimestampTz, Timestamps, TimestampsTz

#### Other Types

[Enum](#enum), Morphs, NullableMorphs, NumericMorphs, UuidMorphs, UlidMorphs

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

| Modified                 | Description                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.Always()`              | The value of this column is always generated by the database system, and users cannot directly insert or modify it (only PostgreSQL) |
| `.AutoIncrement()`       | Sets an integer column as auto-incrementing (primary key)                                                                            |
| `.After("column")`       | Sets the column after the specified column (MySQL only)                                                                              |
| `.Comment("my comment")` | Adds a comment to the column (MySQL / PostgreSQL)                                                                                    |
| `.Change()`              | Modify the column structure (MySQL / PostgreSQL / Sqlserver)                                                                         |
| `.Default(value)`        | Sets the default value for the column                                                                                                                   |
| `.First()`               | Sets the column as the first column (MySQL only)                                                                                     |
| `.GeneratedAs()`         | Sets the value of the column to be generated by the database system (only PostgreSQL)                                                |
| `.Nullable()`            | Allows NULL values to be inserted into the column                                                                                                       |
| `.Unsigned()`            | Sets an integer column as UNSIGNED (MySQL only)                                                                                      |
| `.UseCurrent()`          | Sets a timestamp column to use CURRENT_TIMESTAMP as the default value                                                              |
| `.UseCurrentOnUpdate()`  | Sets a timestamp column to use CURRENT_TIMESTAMP when the record is updated (MySQL only)                        |

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
