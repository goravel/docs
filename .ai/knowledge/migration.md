# Migration & Schema Facade

## Core Imports

```go
import (
    "github.com/goravel/framework/contracts/database/schema"
    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/database/schema/schema.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/database/schema/blueprint.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/database/schema/index.go`

## Available Methods

**facades.Schema():**

- `Create(table, func(Blueprint))` error - create new table
- `Table(table, func(Blueprint))` error - modify existing table
- `Drop(table)` error
- `DropIfExists(table)` error
- `Rename(from, to)` error
- `HasTable(table)` bool
- `HasColumn(table, column)` bool
- `HasColumns(table, []string)` bool
- `HasIndex(table, index)` bool
- `Connection(name)` Schema - use specific DB connection
- `Extend(Extension)` - register custom Go types for `make:model --table`

**Migration struct methods:**

- `Signature() string` - unique identifier (timestamp_name format)
- `Up() error` - apply migration
- `Down() error` - reverse migration
- `Connection() string` - (optional) override DB connection

## Implementation Example

```go
// database/migrations/20240101_create_users_table.go
package migrations

import (
    "github.com/goravel/framework/contracts/database/schema"
    "yourmodule/app/facades"
)

type M20240101000000CreateUsersTable struct{}

func (r *M20240101000000CreateUsersTable) Signature() string {
    return "20240101000000_create_users_table"
}

func (r *M20240101000000CreateUsersTable) Up() error {
    if facades.Schema().HasTable("users") {
        return nil
    }
    return facades.Schema().Create("users", func(table schema.Blueprint) {
        table.ID()
        table.String("name").Comment("display name")
        table.String("email").Unique()
        table.String("password")
        table.Boolean("active").Default(true)
        table.Json("settings").Nullable()
        table.Timestamps()
        table.SoftDeletes()
    })
}

func (r *M20240101000000CreateUsersTable) Down() error {
    return facades.Schema().DropIfExists("users")
}

// Adding columns to existing table
type M20240102000000AddAvatarToUsersTable struct{}

func (r *M20240102000000AddAvatarToUsersTable) Signature() string {
    return "20240102000000_add_avatar_to_users_table"
}

func (r *M20240102000000AddAvatarToUsersTable) Up() error {
    return facades.Schema().Table("users", func(table schema.Blueprint) {
        table.String("avatar").Nullable().After("email")
        table.UnsignedBigInteger("role_id").Nullable()
        table.Foreign("role_id").References("id").On("roles")
        table.Index("role_id")
    })
}

func (r *M20240102000000AddAvatarToUsersTable) Down() error {
    return facades.Schema().Table("users", func(table schema.Blueprint) {
        table.DropForeign("role_id")
        table.DropColumn("avatar", "role_id")
    })
}
```

## Rules

- `Signature()` must be unique - conventional format: `YYYYMMDDHHMMSS_description`.
- `make:migration` auto-registers in `bootstrap/migrations.go`; manual files must be added there.
- Always guard `Up()` with `HasTable`/`HasColumn` checks to make migrations idempotent.
- `Down()` should exactly reverse `Up()` - always implement it.
- `migrate:rollback` (v1.17) rolls back the **entire last batch**, not one migration - use `--step=N` for finer control.
- `Change()` modifier (column modification) is supported on MySQL, PostgreSQL, Sqlserver only.
- `After()` (position) is **MySQL only**. `Always()`/`GeneratedAs()` are **PostgreSQL only**.
- `Enum` on PostgreSQL/SQLite/Sqlserver is stored as string - not a native ENUM type.
- `Morphs("taggable")` creates `taggable_id` (uint) + `taggable_type` (string) columns.
- Foreign key: call `.References("id").On("table")` chained on `.Foreign("col")`.
- `DropForeign("col")` drops by column name convention; `DropForeignByName("name")` by explicit constraint name.
- `facades.Schema().Connection("postgres")` overrides the connection for that schema operation.
- Register models for `make:model --table` via `facades.Schema().Extend()` in `WithCallback`.
