# ORM

Active-record ORM over GORM. Models are Go structs with embeds (`orm.Model`, `orm.SoftDeletes`); queries chain via `facades.Orm().Query()`. Multi-driver: mysql, postgres, sqlite, sqlserver via the matching `goravel/<driver>` package.

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/database/orm/orm.go` — `Orm`, `Query`, `Association`, `Factory`
- `contracts/database/orm/events.go` — `Event`, event types
- `contracts/database/orm/observer.go` — `Observer`, `ObserverWithRestored`
- `contracts/database/orm/factory.go` — `Factory`
- `contracts/database/factory/factory.go` — `Factory[Model]` for model-side factory binding
- `database/orm/model.go` — `Model`, `SoftDeletes`, `Timestamps` embed structs

Fetch when you need full type bodies, edge-case argument types, or methods not listed below.

## Imports

```go
import (
    "github.com/goravel/framework/database/orm"                  // Model, SoftDeletes, Associations
    contractsorm "github.com/goravel/framework/contracts/database/orm"
    "github.com/goravel/framework/database/db"                   // db.Raw(), db.Result
    "github.com/goravel/framework/errors"                        // errors.OrmRecordNotFound
    "github.com/goravel/framework/support/carbon"                // carbon.Date, carbon.DateTime

    "yourmodule/app/facades"
    "yourmodule/database/factories"
)
```

## Methods

### `facades.Orm()` returns `contractsorm.Orm`

| Method | Signature | Notes |
|---|---|---|
| Query | `() Query` | Default DB query builder. |
| Connection | `(name string) Orm` | Switch connection (configured in `config/database.go`). |
| WithContext | `(ctx context.Context) Orm` | Bind a context. Use `ctx` from `http.Context`. |
| DB | `() (*sql.DB, error)` | Raw `*sql.DB` for go-sql work. |
| Transaction | `(func(tx Query) error) error` | Atomic; return non-nil from fn to roll back. |
| Observe | `(model any, observer Observer)` | Register observer (call inside `WithCallback`). |
| Factory | `() Factory` | Factory builder for the model bound via `Factory()` method. |

### `Query` (chained — most return `Query`)

| Group | Methods (signature-only) |
|---|---|
| Filter | `Where(query any, args ...any) Query`, `OrWhere`, `WhereIn(col string, vals []any)`, `OrWhereIn`, `WhereNotIn`, `WhereBetween(col, x, y)`, `WhereNotBetween`, `WhereNull(col)`, `WhereNotNull`, `WhereJsonContains(col, val)`, `WhereJsonContainsKey(col)`, `WhereJsonLength(col, n)`, `WhereAll(cols, args)`, `WhereAny`, `WhereNone` |
| Order/limit | `OrderBy(col string, dir ...string) Query`, `OrderByRaw(raw string) Query`, `InRandomOrder()`, `Limit(n int)`, `Offset(n int)`, `Distinct(cols ...string)` |
| Join/group | `Join(query string, args ...any) Query`, `GroupBy(cols ...string)`, `Having(query, args)` |
| Eager-load | `With(relation string, args ...any) Query` (uses struct field name, PascalCase), `Load(dest, relation, args)` (lazy load on already-fetched parent), `Association(field string) Association` |
| Trash | `WithTrashed() Query`, `WithoutGlobalScopes(names ...string) Query`, `WithoutEvents()` |
| Read terminal | `Find(dest any, conds ...any) error`, `FindOrFail(dest, conds...) error`, `First(dest) error`, `FirstOrFail(dest) error`, `FirstOr(dest, fn func() error) error`, `FirstOrCreate(dest, conds ...any) error`, `FirstOrNew(dest, attrs, vals ...any) error`, `Get(dest) error`, `Cursor() chan db.Row`, `Paginate(page, limit int, dest any, total *int64) error` |
| Write | `Create(value any) error`, `Save(value any) error`, `Update(column any, value ...any) (*db.Result, error)` (column may be string OR `map[string]any`), `UpdateOrCreate(dest, attrs, vals any) error`, `Delete(value ...any) (*db.Result, error)`, `ForceDelete(value ...any) (*db.Result, error)`, `Restore(model ...any) (*db.Result, error)` |
| Aggregates | `Count() (int64, error)`, `Exists() (bool, error)`, `Sum(col string, dest any) error` |
| Locks | `LockForUpdate() Query`, `SharedLock() Query` |
| Transactions | `BeginTransaction() (Query, error)`, `Commit() error`, `Rollback() error` |
| Inspect | `ToSql() ToSql`, `ToRawSql() ToSql` |
| Table | `Table(name string, args ...any) Query` (raw-table query, bypasses model events) |

### `Factory`

| Method | Signature | Notes |
|---|---|---|
| Make | `(value any, attributes ...map[string]any) error` | Build, do NOT persist. |
| Create | `(value any, attributes ...map[string]any) error` | Build + persist. |
| CreateQuietly | `(value any, attributes ...map[string]any) error` | Persist without firing events. |
| Count | `(n int) Factory` | Produce a slice of n models. There is **no** `Times()` alias. |

### Model-side hooks (defined ON your struct)

```go
func (u *User) TableName() string  { return "goravel_user" }     // override table name
func (u *User) Connection() string { return "postgres" }         // override connection
func (u *User) Factory() factory.Factory { return &factories.UserFactory{} }  // bind factory
func (u *User) GlobalScopes() map[string]func(contractsorm.Query) contractsorm.Query { ... }
```

## Config

User-owned files: `config/database.go`. Read directly for current connection definitions.

Keys this facade reads:

- `database.default` (string) — default connection name (e.g. `"postgres"`)
- `database.connections.<name>.driver` (string) — driver name (`"mysql"`, `"postgres"`, `"sqlite"`, `"sqlserver"`)
- `database.connections.<name>.host`, `port`, `database`, `username`, `password` — DSN inputs (env-backed)
- `database.connections.<name>.charset`, `prefix` — schema-level options
- `database.connections.<name>.via` (function) — driver factory closure (e.g. `func() (orm.Driver, error) { return postgresfacades.Orm("postgres"), nil }`)
- `database.migrations.driver` — schema-builder driver

Greenfield default: `config/database.go` from goravel-scaffold URL declared in `AGENTS.md`.

## Patterns & gotchas

- **Soft delete auto-filter**: queries on a model with `orm.SoftDeletes` automatically exclude soft-deleted rows. Use `WithTrashed()` to include them, `Restore()` to undelete, `ForceDelete()` to permanently remove.
- **Eager load names are struct field names** (PascalCase), not column names: `.With("Posts")` for `User.Posts`, not `.With("posts")`.
- **`Cursor` does not support `With`**: when iterating with `Cursor()`, use `Load()` inside the loop to lazy-load relationships.
- **Batch operations skip events**: `Table("users").Delete()` and other raw-table queries do NOT trigger model events. Operate on a model instance to fire events.
- **`SaveQuietly` / `WithoutEvents` / `CreateQuietly`** all suppress events for that operation.
- **Observer vs DispatchesEvents**: if both are set on a model, only `DispatchesEvents` applies. Pick one.
- **Custom date/time fields** must use `carbon` types (`carbon.Date`, `carbon.DateTime`, `carbon.Timestamp`, `carbon.DateTimeNano`). `time.Time` causes scan errors. `orm.Model.CreatedAt` and `UpdatedAt` are `*carbon.DateTime` POINTERS — not direct values.
- **`SoftDeletes.DeletedAt` is `gorm.DeletedAt`**, not a carbon type. The library handles the soft-delete query rewrite via this type.
- **Relationships are gorm-style struct tags** — no Goravel-specific `HasMany`/`BelongsTo` methods. Define on the model struct: `Posts []Post `gorm:"foreignKey:UserID"``.
- **Transaction returns rollback automatically** when the callback returns non-nil; commits on nil. Do not call `Commit`/`Rollback` manually inside `Transaction`.
- **`Factory()` map keys must be PascalCase struct field names**, not column names.
- **`Connection("name")` switches per-query**; the chain reverts after terminal call.
- **`facades.Orm().DB()` returns the standard `*sql.DB`** for raw SQL when the ORM is not enough — use sparingly.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `err := q.Update("name", "x")` | `_, err := q.Update("name", "x")` | `Update` returns `(*db.Result, error)`, NOT just `error`. |
| `q.Update(User{Age: 0})` | `q.Update(map[string]any{"age": 0})` | Struct update skips zero-value fields; map sets them explicitly. |
| `var u User; q.Find(&u); if err != nil` | `if err := q.FindOrFail(&u, id); err != nil` | `Find` returns `nil` error on miss; use `FindOrFail` for explicit not-found. |
| `q.Sum("amount")` (returns value) | `var total float64; q.Sum("amount", &total)` | Sum signature: `(col, dest)` returning `error` only. |
| `q.With("posts")` | `q.With("Posts")` | Eager-load uses struct field name (PascalCase). |
| `q.Cursor().With("Posts")` | `for row := range q.Cursor() { q.Load(&row, "Posts") }` | `With` not supported on Cursor. |
| `Times(5)` on Factory | `Count(5)` | `Times` does not exist. |
| `User { CreatedAt time.Time }` | use `orm.Model` (gives `*carbon.DateTime`) or `Created carbon.DateTime` | `time.Time` fails to scan from DB. |
| `User { DeletedAt carbon.DateTime }` | `User { orm.SoftDeletes }` (gives `gorm.DeletedAt`) | Soft delete column type must be `gorm.DeletedAt` for query auto-filter. |
| `tx.Begin(); tx.Commit()` inside `Transaction(fn)` | return `nil` to commit, non-nil to roll back | Manual commit conflicts with `Transaction`'s auto-commit. |

## Worked example: model + factory + transactional repository

```go
// app/models/user.go
package models

import (
    "github.com/goravel/framework/contracts/database/factory"
    "github.com/goravel/framework/database/orm"
    "github.com/goravel/framework/support/carbon"

    "yourmodule/database/factories"
)

type User struct {
    orm.Model                       // ID uint, CreatedAt/UpdatedAt *carbon.DateTime
    Name     string
    Email    string                 `gorm:"uniqueIndex"`
    Birthday carbon.Date            // date-only field, NOT time.Time
    orm.SoftDeletes                 // DeletedAt gorm.DeletedAt
    Posts    []Post                 `gorm:"foreignKey:UserID"`  // relationship via gorm tag
}

func (u *User) TableName() string         { return "users" }
func (u *User) Factory() factory.Factory  { return &factories.UserFactory{} }

// app/http/controllers/user_controller.go
package controllers

import (
    "github.com/goravel/framework/contracts/http"
    contractsorm "github.com/goravel/framework/contracts/database/orm"
    "github.com/goravel/framework/errors"

    "yourmodule/app/facades"
    "yourmodule/app/models"
)

type UserController struct{}

func (r *UserController) Index(ctx http.Context) http.Response {
    var users []models.User
    var total int64
    if err := facades.Orm().WithContext(ctx).Query().
        With("Posts").
        Where("active", 1).
        OrderBy("created_at", "desc").
        Paginate(1, 15, &users, &total); err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }
    return ctx.Response().Json(http.StatusOK, http.Json{"data": users, "total": total})
}

func (r *UserController) Show(ctx http.Context) http.Response {
    var user models.User
    if err := facades.Orm().Query().FindOrFail(&user, ctx.Request().RouteInt("id")); err != nil {
        if errors.Is(err, errors.OrmRecordNotFound) {
            return ctx.Response().Json(http.StatusNotFound, http.Json{"error": "not found"})
        }
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }
    return ctx.Response().Json(http.StatusOK, user)
}

func (r *UserController) TransferOwnership(ctx http.Context) http.Response {
    err := facades.Orm().Transaction(func(tx contractsorm.Query) error {
        if _, err := tx.Model(&models.Post{}).
            Where("user_id", ctx.Request().InputInt("from_id")).
            Update("user_id", ctx.Request().InputInt("to_id")); err != nil {
            return err  // rolls back
        }
        return nil  // commits
    })
    if err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }
    return ctx.Response().Json(http.StatusOK, http.Json{"ok": true})
}
```

## Rules

- `Update` returns `(*db.Result, error)` — always capture both, do not assign just to `err`.
- `Find`/`FindOrFail`/`Delete`/`ForceDelete`/`Restore` are variadic on conditions or model values — pass IDs or model pointers as additional args.
- `orm.Model` provides `*carbon.DateTime` pointers for timestamps. Do not redeclare `CreatedAt`/`UpdatedAt`.
- `orm.SoftDeletes` provides `gorm.DeletedAt` — do not redeclare `DeletedAt` with a different type.
- Custom date/time fields use `carbon.Date`/`carbon.DateTime`/`carbon.Timestamp`. Never `time.Time`.
- Relationships are declared via gorm struct tags on slice/pointer fields — no method definitions needed.
- Inside `Transaction(fn)`: return non-nil to roll back, nil to commit. Do not call `Commit`/`Rollback`.
- Eager-load names use struct field names (PascalCase), not column names.
- For event-bypass writes use `Table()`, `WithoutEvents()`, `SaveQuietly`, or `CreateQuietly`.
- Register observers in `bootstrap/app.go` `WithCallback`, not at runtime.
