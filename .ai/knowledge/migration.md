# Migration & Schema

Schema migrations via `Migration` interface (`Signature`, `Up`, `Down`). `facades.Schema()` exposes the schema builder; `Create`/`Table` callbacks receive a `Blueprint` for column/index definitions. Driver-aware (mysql/postgres/sqlite/sqlserver). Migrations are registered, not auto-discovered.

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/database/schema/schema.go` — `Schema`, `Migration`, `Connection`, `Extension`, `GoType`
- `contracts/database/schema/blueprint.go` — `Blueprint` (full column/index API)
- `contracts/database/schema/index.go` — `IndexDefinition`, `ForeignKeyDefinition`, `ForeignIDColumnDefinition`
- `contracts/database/driver/*.go` — `ColumnDefinition`, `Column`, `Index`, `ForeignKey`, `Table`

## Imports

```go
import (
    "github.com/goravel/framework/contracts/database/schema"

    "yourmodule/app/facades"
)
```

## Methods

### `facades.Schema()` returns `schema.Schema`

| Group | Methods (signature-only) |
|---|---|
| Build | `Create(table string, fn func(table Blueprint)) error`, `Table(table string, fn func(table Blueprint)) error` (modify) |
| Drop | `Drop(table string) error`, `DropIfExists(table) error`, `DropAllTables() error`, `DropAllViews() error`, `DropAllTypes() error`, `DropColumns(table string, columns []string) error` |
| Inspect (existence) | `HasTable(name) bool`, `HasView(name) bool`, `HasType(name) bool`, `HasColumn(table, column) bool`, `HasColumns(table string, columns []string) bool`, `HasIndex(table, index) bool` |
| Inspect (lists) | `GetTableListing() []string`, `GetTables() ([]driver.Table, error)`, `GetColumnListing(table) []string`, `GetColumns(table) ([]driver.Column, error)`, `GetIndexListing(table) []string`, `GetIndexes(table) ([]driver.Index, error)`, `GetForeignKeys(table) ([]driver.ForeignKey, error)`, `GetViews() ([]driver.View, error)`, `GetTypes() ([]driver.Type, error)` |
| Migration registry | `Register([]Migration)`, `Migrations() []Migration`, `GetModel(name string) any` |
| Connection | `Connection(name) Schema` (per-call), `SetConnection(name)`, `GetConnection() string` |
| Misc | `Rename(from, to string) error`, `Sql(sql string) error` (raw), `Prune() error` (storage cleanup), `Extend(extend Extension) Schema`, `GoTypes() []GoType`, `Orm() orm.Orm` |

### `schema.Migration` (the contract you implement)

```go
type Migration interface {
    Signature() string   // unique migration id (e.g. "2024_05_03_120000_create_users_table")
    Up() error           // forward migration
    Down() error         // reverse migration
}
```

Optional add-ons:

```go
type Connection interface {
    Connection() string  // per-migration connection override
}
```

### `schema.Blueprint` (column + index definitions inside Create/Table callbacks)

| Group | Methods (signature-only) |
|---|---|
| Lifecycle | `Create()`, `Drop()`, `DropIfExists()`, `Rename(to string)`, `Comment(string)` |
| ID columns | `ID(column ...string) ColumnDefinition` (alias for big auto-inc), `Increments(col)`, `BigIncrements(col)`, `MediumIncrements(col)`, `SmallIncrements(col)`, `TinyIncrements(col)`, `IntegerIncrements(col)` |
| Integers | `Integer(col)`, `BigInteger`, `MediumInteger`, `SmallInteger`, `TinyInteger` (+ `Unsigned*` variants) |
| Float/decimal | `Float(col, precision ...int)`, `Decimal(col)`, `Double(col)` |
| Strings | `String(col, length ...int)`, `Char(col, length ...int)`, `Text(col)`, `MediumText(col)`, `LongText(col)`, `TinyText(col)` |
| Booleans/JSON | `Boolean(col)`, `Json(col)`, `Jsonb(col)`, `Enum(col string, options []any)` |
| Date/time | `Date(col)`, `Time(col, p ...int)`, `Timestamp(col, p ...int)`, `TimestampTz(col, p ...int)`, `DateTime(col, p ...int)`, `DateTimeTz(col, p ...int)`, `TimeTz(col, p ...int)` |
| Auto-timestamps | `Timestamps(p ...int)` (nullable created_at + updated_at), `TimestampsTz(p ...int)`, `DateTimes(p ...int)` |
| UUID/ULID | `Uuid(col)`, `Ulid(col, length ...int)`, `UuidMorphs(name)`, `UlidMorphs(name)` |
| Soft deletes | `SoftDeletes(column ...string)`, `SoftDeletesTz(column ...string)`, `DropSoftDeletes(...)`, `DropSoftDeletesTz(...)` |
| Polymorphic | `Morphs(name, indexName ...string)`, `NullableMorphs(...)`, `NumericMorphs(...)`, `UuidMorphs(...)`, `UlidMorphs(...)` |
| Indexes | `Index(col ...string) IndexDefinition`, `Unique(col ...string) IndexDefinition`, `Primary(col ...string)`, `FullText(col ...string) IndexDefinition` |
| Foreign keys | `Foreign(col ...string) ForeignKeyDefinition`, `ForeignID(col) ForeignIDColumnDefinition`, `ForeignUuid(col)`, `ForeignUlid(col, length ...int)` |
| Drop | `DropColumn(col ...string)`, `DropIndex(col ...string)`, `DropIndexByName(name)`, `DropUnique(col ...string)`, `DropUniqueByName(name)`, `DropPrimary(col ...string)`, `DropForeign(col ...string)`, `DropForeignByName(name)`, `DropFullText(col ...string)`, `DropFullTextByName(name)`, `DropTimestamps()`, `DropTimestampsTz()` |
| Rename | `RenameColumn(from, to)`, `RenameIndex(from, to)` |
| Custom | `Column(col, ttype string) ColumnDefinition`, `ToSql(grammar Grammar) ([]string, error)` |

### `ColumnDefinition` / `IndexDefinition` / `ForeignKeyDefinition`

Returned from column/index methods. Chain modifiers:

```go
table.String("name").Nullable().Default("anon").Comment("display name")
table.Integer("age").Unsigned().Default(0)
table.Index("email").Name("idx_email_unique").Unique()
table.Foreign("user_id").References("id").On("users").OnDelete("cascade")
table.ForeignID("user_id").Constrained()  // shorthand: foreign + references id on inferred table
```

(Full chainable methods on `ColumnDefinition` live in `contracts/database/driver/`. Common ones: `Nullable()`, `Default(any)`, `Unsigned()`, `Index()`, `Unique()`, `Comment(string)`, `Change()` (modify existing), `After(col string)`, `First()`, `Charset(string)`, `Collation(string)`.)

## Config

User-owned: `config/database.go`. Read directly for connection definitions.

Keys this facade reads (same as `orm.md`):

- `database.default` — default connection
- `database.connections.<name>.driver` — `mysql`/`postgres`/`sqlite`/`sqlserver`
- `database.migrations.driver` — `default` (creates a `migrations` table) or `sql` (raw .sql files)
- `database.migrations.table` — migrations bookkeeping table name

Greenfield default: `config/database.go` from goravel-scaffold URL declared in `AGENTS.md`.

## Patterns & gotchas

- **Migrations are registered, not auto-discovered**. Place files under `database/migrations/`, then in `bootstrap/app.go` `WithCallback` call `facades.Schema().Register([]schema.Migration{&MyMigration{}, ...})`.
- **`Signature()` is the canonical name** — typically a timestamp prefix: `"2024_05_03_120000_create_users_table"`. Used for ordering AND deduplication. Never rename in-flight; it'll re-run the migration.
- **`Up()` and `Down()` MUST be reversible**. Every additive op needs a matching drop; every column rename needs the reverse name pair. Tested by running `migrate:rollback` then `migrate`.
- **`Create` is for new tables**; `Table` is for modifying existing tables. Mixing them on the wrong target either silently no-ops or errors depending on driver.
- **`SoftDeletes()` adds a nullable `deleted_at` column** of `gorm.DeletedAt` type — pairs with `orm.SoftDeletes` embed in the model.
- **`Timestamps(precision ...int)` adds `created_at` and `updated_at` as NULLABLE timestamps** — matches `orm.Model`'s `*carbon.DateTime` pointer fields. Don't redeclare these columns manually.
- **`ID()` is the canonical primary key** — auto-incrementing big int. Don't combine with `Increments(col)` (which is the 4-byte version).
- **`ForeignID(col).Constrained()`** is the Laravel-shortcut: declares the column AND the foreign key in one call, inferring the referenced table from column name (e.g. `user_id` → `users.id`).
- **`OnDelete`/`OnUpdate` on foreign keys**: `"cascade"`, `"set null"`, `"restrict"`, `"no action"`. Driver support varies (sqlite is loose).
- **Index naming**: by default Goravel generates `<table>_<column>_index`. Use `Name()` on the IndexDefinition for stable cross-driver names you can drop later by name.
- **Column changes**: not all drivers support all changes. Adding columns is universal; renaming requires recent versions of MySQL/Postgres; type changes can lose data on production.
- **Polymorphic: `Morphs("imageable")`** creates `imageable_id` (unsigned big int) + `imageable_type` (string) + an index on both. Use `UuidMorphs` for UUID parents.
- **`Sql(raw)` for grammars not covered**: e.g. PostgreSQL extensions. Keep this as the escape hatch; prefer Blueprint methods otherwise for portability.
- **Connection per migration**: implement `schema.Connection` interface to override which DB this migration targets — useful for multi-DB apps.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| Hand-roll a `created_at` + `updated_at` column | `table.Timestamps()` | Matches `orm.Model`'s nullable `*carbon.DateTime` shape exactly. |
| `table.Timestamp("deleted_at").Nullable()` for soft delete | `table.SoftDeletes()` | The `gorm.DeletedAt` type is required for query auto-filter. |
| `table.Increments("id")` for big primary key | `table.ID()` (or `BigIncrements`) | `Increments` is the 4-byte version; `ID()` is the canonical 8-byte. |
| `table.Foreign("user_id").References("id").On("users")` (verbose) | `table.ForeignID("user_id").Constrained()` | Shorthand when target is inferable. |
| Migration not registered, runs `artisan migrate` and nothing happens | `facades.Schema().Register([]schema.Migration{&m})` in `bootstrap/app.go` `WithCallback` | Migrations must be registered. |
| Renaming `Signature()` after deploy | Add a NEW migration; never rename | Bookkeeping is keyed by signature. |
| `Down()` empty | Implement the reverse (drop columns added in Up, etc.) | Required for `migrate:rollback`. |

## Worked example: create users + foreign-keyed posts

```go
// database/migrations/2024_05_03_120000_create_users_table.go
package migrations

import (
    "github.com/goravel/framework/contracts/database/schema"

    "yourmodule/app/facades"
)

type CreateUsersTable struct{}

func (m *CreateUsersTable) Signature() string { return "2024_05_03_120000_create_users_table" }

func (m *CreateUsersTable) Up() error {
    return facades.Schema().Create("users", func(table schema.Blueprint) {
        table.ID()
        table.String("name", 120)
        table.String("email").Unique()
        table.String("password")
        table.Date("birthday").Nullable()
        table.Timestamps()        // nullable created_at, updated_at
        table.SoftDeletes()       // nullable deleted_at (gorm.DeletedAt)
    })
}

func (m *CreateUsersTable) Down() error {
    return facades.Schema().DropIfExists("users")
}

// database/migrations/2024_05_03_120100_create_posts_table.go
type CreatePostsTable struct{}

func (m *CreatePostsTable) Signature() string { return "2024_05_03_120100_create_posts_table" }

func (m *CreatePostsTable) Up() error {
    return facades.Schema().Create("posts", func(table schema.Blueprint) {
        table.ID()
        table.ForeignID("user_id").Constrained()  // FK to users.id
        table.String("title", 200)
        table.LongText("body")
        table.Index("user_id")
        table.Timestamps()
        table.SoftDeletes()
    })
}

func (m *CreatePostsTable) Down() error {
    return facades.Schema().DropIfExists("posts")
}

// bootstrap/app.go (excerpt)
// app.WithCallback(func() {
//     facades.Schema().Register([]schema.Migration{
//         &migrations.CreateUsersTable{},
//         &migrations.CreatePostsTable{},
//     })
// })
```

## Rules

- Implement `Migration` interface: `Signature() string`, `Up() error`, `Down() error`. Both directions required.
- Register migrations in `bootstrap/app.go` `WithCallback` via `facades.Schema().Register(...)`. Auto-discovery does not exist.
- `Signature()` is stable forever — never rename. Add a new migration to fix mistakes.
- Use `Timestamps()` for `*carbon.DateTime` columns; `SoftDeletes()` for `gorm.DeletedAt`. Do not hand-roll.
- `ID()` is the canonical primary key (big auto-inc). `Increments()` is the 4-byte variant.
- For foreign keys, `ForeignID(col).Constrained()` is the shorthand; otherwise `Foreign(col).References(...).On(...)`.
- `Down()` must reverse `Up()` step-for-step.
- `Create` for new tables, `Table` for modifications — don't mix.
