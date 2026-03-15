# Goravel Migrations

## Configuration

```go
// config/database.go
"migrations": map[string]any{
    "table": "migrations", // customize the migration tracking table name
},
```

---

## Create Migration

```shell
# Interactive (prompts for name)
./artisan make:migration

# Named
./artisan make:migration create_users_table

# From model struct (auto-generates columns from model definition)
# Model must be registered via facades.Schema().Extend() in WithCallback
./artisan make:migration create_users_table -m User
./artisan make:migration create_users_table --model=User
```

### Auto-generation Naming Rules

The command detects intent from the migration name:

| Pattern | Result |
|---------|--------|
| `^create_(\w+)_table$` or `^create_(\w+)$` | Creates table with infrastructure |
| `_(to\|from\|in)_(\w+)_table$` or `_(to\|from\|in)_(\w+)$` | Adds/removes columns on existing table |
| Anything else | Empty migration file |

Examples:
- `create_users_table` → auto-creates `users` table with `id` + `timestamps`
- `add_avatar_to_users_table` → auto-adds column to `users`
- `remove_avatar_from_users` → auto-removes column from `users`

### Register Models for -m Flag

```go
// bootstrap/app.go
WithCallback(func() {
    facades.Schema().Extend(schema.Extension{
        Models: []any{models.User{}},
    })
})
```

---

## Migration File Structure

```go
package migrations

import (
    "github.com/goravel/framework/contracts/database/schema"
    "goravel/app/facades"
)

type M20241207095921CreateUsersTable struct{}

// Signature must be unique — timestamp + name
func (r *M20241207095921CreateUsersTable) Signature() string {
    return "20241207095921_create_users_table"
}

// Up: add tables/columns/indexes
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

// Down: reverse the Up operation
func (r *M20241207095921CreateUsersTable) Down() error {
    return facades.Schema().DropIfExists("users")
}

// Optional: use a non-default DB connection
func (r *M20241207095921CreateUsersTable) Connection() string {
    return "postgres"
}
```

---

## Registration

Migrations created via `make:migration` are auto-registered in `bootstrap/migrations.go`. Manual migrations must be added by hand:

```go
// bootstrap/app.go
func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithMigrations(Migrations).
        WithConfig(config.Boot).
        Create()
}
```

---

## Run Migrations

```shell
./artisan migrate                        # run all pending
./artisan migrate:status                 # show which have run
./artisan migrate:rollback               # BREAKING v1.17: rolls back entire last batch
./artisan migrate:rollback --batch=2     # roll back specific batch number
./artisan migrate:rollback --step=5      # roll back last 5 migrations
./artisan migrate:reset                  # roll back all
./artisan migrate:refresh                # roll back all + re-migrate
./artisan migrate:refresh --step=5       # roll back + re-migrate last 5
./artisan migrate:fresh                  # drop all tables + migrate
```

---

## Tables

```go
// Create
facades.Schema().Create("users", func(table schema.Blueprint) {
    table.ID()
    table.String("name").Nullable()
    table.Timestamps()
})

// Check existence
facades.Schema().HasTable("users")
facades.Schema().HasColumn("users", "email")
facades.Schema().HasColumns("users", []string{"name", "email"})
facades.Schema().HasIndex("users", "email_unique")

// Use specific DB connection
facades.Schema().Connection("sqlite").Create("users", func(table schema.Blueprint) {
    table.ID()
})

// Modify existing table
facades.Schema().Table("users", func(table schema.Blueprint) {
    table.String("avatar").Nullable()
})

// Rename column
facades.Schema().Table("users", func(table schema.Blueprint) {
    table.RenameColumn("old_name", "new_name")
})

// Add table comment
facades.Schema().Table("users", func(table schema.Blueprint) {
    table.Comment("user table")
})

// Rename / Drop
facades.Schema().Rename("users", "new_users")
facades.Schema().Drop("users")
facades.Schema().DropIfExists("users")
```

---

## Column Types

### Boolean
```go
table.Boolean("active")
```

### String & Text
```go
table.Char("code", 4)
table.String("name")          // default 255 length
table.String("name", 100)
table.Text("bio")
table.TinyText("note")
table.MediumText("body")
table.LongText("content")
table.Json("metadata")
table.Uuid("uuid")
table.Ulid("ulid")
```

### Numeric
```go
table.ID()                    // alias for BigIncrements, column name "id"
table.ID("user_id")           // custom name
table.BigIncrements("id")
table.Increments("id")        // uint auto-increment
table.IntegerIncrements("id")
table.MediumIncrements("id")
table.SmallIncrements("id")
table.TinyIncrements("id")
table.BigInteger("views")
table.Integer("age")
table.MediumInteger("score")
table.SmallInteger("rating")
table.TinyInteger("status")
table.UnsignedBigInteger("user_id")
table.UnsignedInteger("count")
table.UnsignedMediumInteger("x")
table.UnsignedSmallInteger("y")
table.UnsignedTinyInteger("z")
table.Float("amount")
table.Double("price")
table.Decimal("total")
```

### Date & Time
```go
table.Date("birthday")
table.DateTime("scheduled_at")
table.DateTimeTz("scheduled_at")
table.Time("starts_at")
table.TimeTz("starts_at")
table.Timestamp("created_at")
table.TimestampTz("created_at")
table.Timestamps()             // created_at + updated_at
table.TimestampsTz()
table.SoftDeletes()            // deleted_at nullable TIMESTAMP
table.SoftDeletesTz()
```

### Enum
```go
// MySQL: actual ENUM type; Postgres/SQLite/Sqlserver: stored as string
table.Enum("difficulty", []any{"easy", "hard"})
table.Enum("num", []any{1, 2})
```

### Polymorphic Morphs
```go
table.Morphs("taggable")         // taggable_id (uint) + taggable_type (string)
table.NullableMorphs("taggable")
table.NumericMorphs("taggable")
table.UuidMorphs("taggable")
table.UlidMorphs("taggable")
```

### Custom Column Type
```go
table.Column("geometry", "geometry")
```

---

## Column Modifiers

Chain after any column type:

| Modifier | Description |
|----------|-------------|
| `.Always()` | DB-generated always (PostgreSQL only) |
| `.AutoIncrement()` | Auto-increment primary key |
| `.After("column")` | Position after column (MySQL only) |
| `.Comment("text")` | Column comment (MySQL/PostgreSQL) |
| `.Change()` | Modify column structure (MySQL/PostgreSQL/Sqlserver) |
| `.Default(value)` | Default value |
| `.First()` | Place as first column (MySQL only) |
| `.GeneratedAs()` | DB-generated value (PostgreSQL only) |
| `.Nullable()` | Allow NULL |
| `.Unsigned()` | UNSIGNED integer (MySQL only) |
| `.UseCurrent()` | Default CURRENT_TIMESTAMP |
| `.UseCurrentOnUpdate()` | Update to CURRENT_TIMESTAMP on row update (MySQL only) |

```go
table.String("name").Nullable().Default("anonymous").Comment("user name")
table.Timestamp("created_at").UseCurrent()
```

---

## Drop Columns

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
    table.DropColumn("name")
    table.DropColumn("name", "age")
})
```

---

## Indexes

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
    // Primary key
    table.Primary("id")
    table.Primary("id", "name")        // composite

    // Unique index
    table.Unique("name")
    table.Unique("name", "age")        // composite

    // Regular index
    table.Index("name")
    table.Index("name", "age")

    // Fulltext index
    table.FullText("name")
    table.FullText("name", "age")

    // Rename index
    table.RenameIndex("users_name_index", "users_name")

    // Drop indexes
    table.DropPrimary("id")
    table.DropUnique("name")
    table.DropUniqueByName("name_unique")
    table.DropIndex("name")
    table.DropIndexByName("name_index")
    table.DropFullText("name")
    table.DropFullTextByName("name_fulltext")
})
```

---

## Foreign Keys

```go
facades.Schema().Table("posts", func(table schema.Blueprint) {
    table.UnsignedBigInteger("user_id")
    table.Foreign("user_id").References("id").On("users")
})

// Drop foreign key
facades.Schema().Table("posts", func(table schema.Blueprint) {
    table.DropForeign("user_id")
    table.DropForeignByName("posts_user_id_foreign")
})
```
