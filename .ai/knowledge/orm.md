# ORM Facade

## Core Imports

```go
import (
    "github.com/goravel/framework/database/orm"
    contractsorm "github.com/goravel/framework/contracts/database/orm"
    "github.com/goravel/framework/contracts/database/factory"
    "github.com/goravel/framework/database/db"           // for db.Raw()
    "github.com/goravel/framework/errors"                // for errors.OrmRecordNotFound
    "github.com/goravel/framework/support/carbon"        // for carbon.DateTime model fields

    "yourmodule/app/facades"
    "yourmodule/database/factories"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/database/orm/orm.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/database/orm/events.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/database/orm/observer.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/database/orm/factory.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/database/factory/factory.go`

## Available Methods

**facades.Orm():**

- `Query()` Query - get default DB query instance
- `Connection(name)` Orm - switch database connection
- `WithContext(ctx)` Orm - inject context
- `DB()` (\*sql.DB, error) - raw sql.DB instance
- `Transaction(func(Query) error)` error - atomic transaction
- `Observe(model, observer)` - register model observer
- `Factory()` Factory - get factory builder for the model

**facades.Orm().Factory():**

- `Make(&model, overrides ...map[string]any)` error - build without saving
- `Create(&model, overrides ...map[string]any)` error - build and save to DB
- `CreateQuietly(&model, overrides ...map[string]any)` error - create without model events
- `Count(n int)` Factory - produce a collection of n models
- `Times(n int)` Factory - alias for Count

**Query (chained):**

- `Find(&dest, id?)` error - nil error if not found (use FindOrFail for error)
- `FindOrFail(&dest, id)` error - errors if not found
- `First(&dest)` error - first record ordered by PK
- `FirstOrFail(&dest)` error - errors if not found
- `Get(&dest)` error - all matching records
- `Create(&value)` error - INSERT; auto-fills CreatedAt/UpdatedAt
- `Save(&value)` error - full UPDATE of existing model
- `Update(col, val)` error - UPDATE specific column(s)
- `Delete(&value)` (Result, error) - soft delete (or hard if no SoftDeletes)
- `ForceDelete(&value)` (Result, error) - bypass soft delete
- `WithTrashed()` Query - include soft-deleted records
- `Restore(&value)` error - undelete soft-deleted record
- `Count()` (int64, error)
- `Exists()` (bool, error)
- `Sum(col, &dest)` error - aggregate into pointer
- `Paginate(page, perPage, &dest, &total)` error
- `With("Relation")` Query - eager load
- `Load(&model, "Relation")` error - lazy eager load
- `Association("Field")` Association - manage has-many/m2m

## Implementation Example

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
    orm.Model                    // ID, CreatedAt carbon.DateTime, UpdatedAt carbon.DateTime
    Name     string
    Email    string
    Birthday carbon.Date         // date-only field; use carbon types, not time.Time
    orm.SoftDeletes              // DeletedAt carbon.DateTime
}

// Bind factory for test seeding
func (u *User) Factory() factory.Factory {
    return &factories.UserFactory{}
}

// Optional overrides
func (u *User) TableName() string  { return "goravel_user" }
func (u *User) Connection() string { return "postgres" }

// controllers/user_controller.go
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
    if err := facades.Orm().WithContext(ctx.Context()).Query().
        With("Posts").
        Where("active", 1).
        OrderBy("created_at", "desc").
        Paginate(1, 15, &users, new(int64)); err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }
    return ctx.Response().Json(http.StatusOK, users)
}

func (r *UserController) Show(ctx http.Context) http.Response {
    var user models.User
    err := facades.Orm().Query().FindOrFail(&user, ctx.Request().RouteInt("id"))
    if errors.Is(err, errors.OrmRecordNotFound) {
        return ctx.Response().Json(http.StatusNotFound, http.Json{"error": "not found"})
    }
    return ctx.Response().Json(http.StatusOK, user)
}

func (r *UserController) Store(ctx http.Context) http.Response {
    user := models.User{Name: ctx.Request().Input("name")}
    if err := facades.Orm().Query().Create(&user); err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }
    return ctx.Response().Json(http.StatusCreated, user)
}

func (r *UserController) Transaction(ctx http.Context) http.Response {
    err := facades.Orm().Transaction(func(tx contractsorm.Query) error {
        user := models.User{Name: "Alice"}
        if err := tx.Create(&user); err != nil {
            return err
        }
        return tx.Model(&models.Role{}).Where("id", 1).Update("user_id", user.ID)
    })
    if err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }
    return ctx.Response().Json(http.StatusOK, http.Json{"ok": true})
}

// Factory usage (in tests or seeders)
// var user models.User
// facades.Orm().Factory().Create(&user)
// facades.Orm().Factory().Count(5).Create(&users)
// facades.Orm().Factory().Create(&user, map[string]any{"Name": "Alice"})
// facades.Orm().Factory().CreateQuietly(&user)  // no model events
```

## Rules

- `Find(&model, id)` returns **nil error** when record not found - use `FindOrFail` to error on missing.
- Struct `Update(struct{})` skips zero-value fields - use `map[string]any` to set zero values explicitly.
- `GlobalScopes()` must return `map[string]func(contractsorm.Query) contractsorm.Query` - **not** a slice.
- `Sum(column, &dest)` signature: `error` only (dest is a pointer to the result variable).
- Model events only trigger when operating on a model instance. Batch operations (`Table("users").Delete()`) do **not** trigger events.
- If both `DispatchesEvents` and `Observer` are set, only `DispatchesEvents` applies.
- `WithoutEvents()` suppresses all model events for that query chain.
- `SaveQuietly` saves without dispatching any events.
- Relations use struct field names (PascalCase), not column names: `.With("Posts")` not `.With("posts")`.
- `Association("Posts").Find(&posts)` uses the parent model instance already loaded.
- `Cursor()` - do not use `With()` in the same query; use `Load()` inside the loop instead.
- `ForceDelete` permanently removes records even if `orm.SoftDeletes` is embedded.
- Default connection is set in `config/database.go`; override per-query with `Connection("name")`.
- `orm.Model` embeds `CreatedAt` and `UpdatedAt` as `carbon.DateTime`, NOT `time.Time`. Using `time.Time` causes scan errors.
- For custom date/time model fields use carbon types: `carbon.Date`, `carbon.DateTime`, `carbon.Timestamp`.
- Factory `Definition()` map keys must be PascalCase struct field names, not column names.
