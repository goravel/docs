# Goravel ORM

## Model Definition

```go
package models

import "github.com/goravel/framework/database/orm"

type User struct {
    orm.Model           // provides: ID, CreatedAt, UpdatedAt
    Name   string
    Avatar string
    Detail any    `gorm:"type:text"`
    orm.SoftDeletes    // adds: DeletedAt (soft delete)
}

// Optional: override table name
func (r *User) TableName() string {
    return "goravel_user"
}

// Optional: specify database connection
func (r *User) Connection() string {
    return "postgres"
}
```

Convention: model `UserOrder` → table `user_orders`.

Custom primary key (when not using `orm.Model`):

```go
type User struct {
    ID   uint `gorm:"primaryKey"`
    Name string
}
```

Generate model:

```shell
./artisan make:model User
./artisan make:model --table=users User    # generate from existing table
./artisan make:model --table=users -f User  # force overwrite
```

### JSON fields

```go
import (
    "database/sql/driver"
    "encoding/json"
    "gorm.io/datatypes"
)

type User struct {
    orm.Model
    Json1 datatypes.JSONMap `gorm:"type:json" json:"json1"`
    Json2 *UserData         `gorm:"type:json;serializer:json" json:"json2"`
}
```

---

## Global Scopes (v1.17)

// BREAKING v1.17: GlobalScopes() must return map[string]func(orm.Query) orm.Query, NOT []func(...)

```go
import contractsorm "github.com/goravel/framework/contracts/database/orm"

func (r *User) GlobalScopes() map[string]func(contractsorm.Query) contractsorm.Query {
    return map[string]func(contractsorm.Query) contractsorm.Query{
        "active": func(query contractsorm.Query) contractsorm.Query {
            return query.Where("active", 1)
        },
    }
}
```

Remove global scopes in a query:

```go
// Remove all global scopes
facades.Orm().Query().WithoutGlobalScopes().Get(&users)

// Remove specific global scope by name
facades.Orm().Query().WithoutGlobalScopes("active").Get(&users)
```

---

## Query Operations

### Get query instance

```go
facades.Orm().Query()
facades.Orm().Connection("mysql").Query()
facades.Orm().WithContext(ctx).Query()
```

### Find by ID

```go
var user models.User
facades.Orm().Query().Find(&user, 1)

var users []models.User
facades.Orm().Query().Find(&users, []int{1, 2, 3})
```

Note: `Find` returns nil error when record is not found. Use `FindOrFail` to error on missing.

### FindOrFail (errors if not found)

```go
// BREAKING: Find returns nil error even when not found
err := facades.Orm().Query().FindOrFail(&user, 1)
```

### First

```go
var user models.User
facades.Orm().Query().First(&user)
facades.Orm().Query().Where("name", "tom").First(&user)

// First or fail
err := facades.Orm().Query().FirstOrFail(&user)

// First or execute closure
facades.Orm().Query().Where("name", "tom").FirstOr(&user, func() error {
    user.Name = "default"
    return nil
})
```

### Get (multiple)

```go
var users []models.User
facades.Orm().Query().Where("id in ?", []int{1, 2, 3}).Get(&users)
```

### FirstOrCreate / FirstOrNew

```go
var user models.User
// Find by conditions, or create:
facades.Orm().Query().Where("gender", 1).FirstOrCreate(&user, models.User{Name: "tom"})
facades.Orm().Query().Where("gender", 1).FirstOrCreate(&user, models.User{Name: "tom"}, models.User{Avatar: "avatar"})

// Find or return new (unsaved) model:
facades.Orm().Query().Where("gender", 1).FirstOrNew(&user, models.User{Name: "tom"})
```

---

## Where Clauses

```go
facades.Orm().Query().Where("name", "tom")
facades.Orm().Query().Where("name = ?", "tom")
facades.Orm().Query().WhereBetween("age", 1, 10)
facades.Orm().Query().WhereNotBetween("age", 1, 10)
facades.Orm().Query().WhereIn("name", []any{"a", "b"})
facades.Orm().Query().WhereNotIn("name", []any{"a"})
facades.Orm().Query().WhereNull("name")
facades.Orm().Query().OrWhere("name", "tim")
facades.Orm().Query().OrWhereIn("name", []any{"a"})
facades.Orm().Query().OrWhereNull("name")

// v1.17: new Where methods
facades.Orm().Query().WhereAll([]string{"weight", "height"}, "=", 200)  // AND all columns match
facades.Orm().Query().WhereAny([]string{"name", "email"}, "=", "John")  // OR any column matches
facades.Orm().Query().WhereNone([]string{"age", "score"}, ">", 18)      // NOT any column matches
```

### JSON column queries

```go
facades.Orm().Query().Where("preferences->dining->meal", "salad").First(&user)
facades.Orm().Query().WhereJsonContains("options->languages", "en").First(&user)
facades.Orm().Query().WhereJsonContainsKey("contacts->personal->email").First(&user)
facades.Orm().Query().WhereJsonLength("options->languages", 1).First(&user)
```

---

## Select, Order, Limit, Offset

```go
facades.Orm().Query().Select("name", "age").Get(&users)
facades.Orm().Query().Order("sort asc").Order("id desc").Get(&users)
facades.Orm().Query().OrderBy("sort").Get(&users)
facades.Orm().Query().OrderByDesc("sort").Get(&users)
facades.Orm().Query().InRandomOrder().Get(&users)
facades.Orm().Query().Limit(10).Get(&users)
facades.Orm().Query().Offset(20).Limit(10).Get(&users)
```

### Paginate

```go
var users []models.User
var total int64
facades.Orm().Query().Paginate(1, 10, &users, &total)
```

### Count, Exists

```go
count, err := facades.Orm().Query().Model(&models.User{}).Count()
exists, err := facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Exists()
```

### Aggregates (v1.17)

```go
// BREAKING v1.17: Sum signature changed — Sum(column string, dest any) error (was int64, error)
var sum int
err := facades.Orm().Query().Model(models.User{}).Sum("id", &sum)

var avg float64
err = facades.Orm().Query().Model(models.User{}).Average("age", &avg)

var max, min int
err = facades.Orm().Query().Model(models.User{}).Max("age", &max)
err = facades.Orm().Query().Model(models.User{}).Min("age", &min)
```

### Group By / Having / Join

```go
facades.Orm().Query().Model(&models.User{}).
    Select("name", "sum(age) as total").
    Group("name").
    Having("name = ?", "tom").
    Get(&result)

facades.Orm().Query().Model(&models.User{}).
    Select("users.name", "emails.email").
    Join("left join emails on emails.user_id = users.id").
    Scan(&result)
```

### Pluck (single column)

```go
var ages []int64
facades.Orm().Query().Model(&models.User{}).Pluck("age", &ages)
```

### Cursor (memory-efficient iteration)

```go
cursor, err := facades.Orm().Query().Model(models.User{}).Cursor()
for row := range cursor {
    var user models.User
    if err := row.Scan(&user); err != nil {
        return err
    }
}
```

### Raw SQL

```go
facades.Orm().Query().Raw("SELECT id, name FROM users WHERE name = ?", "tom").Scan(&result)

res, err := facades.Orm().Query().Exec("DROP TABLE users")
num := res.RowsAffected
```

---

## Create

```go
user := models.User{Name: "tom", Age: 18}
err := facades.Orm().Query().Create(&user)

// Batch create
users := []models.User{{Name: "tom"}, {Name: "tim"}}
err = facades.Orm().Query().Create(&users)

// Create via map (no model events)
err = facades.Orm().Query().Table("users").Create(map[string]any{"name": "Goravel"})

// Create via map (with model events)
err = facades.Orm().Query().Model(&models.User{}).Create(map[string]any{"name": "Goravel"})
```

---

## Update

```go
// Update single column
facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Update("name", "hello")

// Update via struct (zero values are skipped)
facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Update(models.User{Name: "hello"})

// Update via map (zero values ARE updated)
facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Update(map[string]any{"name": "hello", "age": 0})

// Save (full update of existing model)
var user models.User
facades.Orm().Query().First(&user)
user.Name = "new-name"
facades.Orm().Query().Save(&user)

// UpdateOrCreate
facades.Orm().Query().UpdateOrCreate(&user, models.User{Name: "name"}, models.User{Avatar: "avatar"})

// Raw expression in update
import "github.com/goravel/framework/database/db"
facades.Orm().Query().Model(&user).Update("age", db.Raw("age - ?", 1))
```

---

## Delete

```go
// Soft delete
facades.Orm().Query().Delete(&user)
facades.Orm().Query().Model(&models.User{}).Where("id", 1).Delete()

// Force delete (bypass soft delete)
facades.Orm().Query().ForceDelete(&models.User{}, 1)
facades.Orm().Query().Model(&models.User{}).Where("name", "tom").ForceDelete()

// Query with soft-deleted records
facades.Orm().Query().WithTrashed().First(&user)

// Restore soft-deleted record
facades.Orm().Query().WithTrashed().Restore(&models.User{ID: 1})
```

---

## Transactions

```go
// Automatic (closure-based)
return facades.Orm().Transaction(func(tx orm.Query) error {
    var user models.User
    return tx.Find(&user, user.ID)
})

// Manual
tx, err := facades.Orm().Query().BeginTransaction()
if err := tx.Create(&user); err != nil {
    tx.Rollback()
} else {
    tx.Commit()
}
```

---

## Scopes

```go
func Paginator(page, limit int) func(orm.Query) orm.Query {
    return func(query orm.Query) orm.Query {
        offset := (page - 1) * limit
        return query.Offset(offset).Limit(limit)
    }
}

facades.Orm().Query().Scopes(Paginator(2, 10)).Find(&users)
```

---

## Pessimistic Locking

```go
facades.Orm().Query().Where("votes > ?", 100).SharedLock().Get(&users)
facades.Orm().Query().Where("votes > ?", 100).LockForUpdate().Get(&users)
```

---

## Model Events (DispatchesEvents)

```go
import contractsorm "github.com/goravel/framework/contracts/database/orm"

func (u *User) DispatchesEvents() map[contractsorm.EventType]func(contractsorm.Event) error {
    return map[contractsorm.EventType]func(contractsorm.Event) error{
        contractsorm.EventCreating: func(event contractsorm.Event) error { return nil },
        contractsorm.EventCreated:  func(event contractsorm.Event) error { return nil },
        contractsorm.EventUpdating: func(event contractsorm.Event) error { return nil },
        contractsorm.EventUpdated:  func(event contractsorm.Event) error { return nil },
        contractsorm.EventDeleting: func(event contractsorm.Event) error { return nil },
        contractsorm.EventDeleted:  func(event contractsorm.Event) error { return nil },
        contractsorm.EventSaving:   func(event contractsorm.Event) error { return nil },
        contractsorm.EventSaved:    func(event contractsorm.Event) error { return nil },
        contractsorm.EventRetrieved: func(event contractsorm.Event) error { return nil },
        contractsorm.EventRestored:  func(event contractsorm.Event) error { return nil },
    }
}
```

---

## Observers

Generate:

```shell
./artisan make:observer UserObserver
```

```go
package observers

import "github.com/goravel/framework/contracts/database/orm"

type UserObserver struct{}

func (u *UserObserver) Created(event orm.Event) error  { return nil }
func (u *UserObserver) Updated(event orm.Event) error  { return nil }
func (u *UserObserver) Deleted(event orm.Event) error  { return nil }
func (u *UserObserver) Restored(event orm.Event) error { return nil }
```

Register in `WithCallback`:

```go
WithCallback(func() {
    facades.Orm().Observe(models.User{}, &observers.UserObserver{})
})
```

Event parameter methods: `Context()`, `GetAttribute(key)`, `GetOriginal(key)`, `IsDirty(key)`, `IsClean(key)`, `Query()`, `SetAttribute(key, val)`.

---

## Muting Events

```go
facades.Orm().Query().WithoutEvents().Find(&user, 1)

// Save without triggering events
facades.Orm().Query().SaveQuietly(&user)
```

---

## Connection Pool

```go
db, err := facades.Orm().DB()
db.SetMaxIdleConns(10)
db.SetMaxOpenConns(100)
db.SetConnMaxLifetime(time.Hour)
```

---

## Gotchas

- `Find(&model, id)` returns nil error even when no record is found. Use `FindOrFail` to get an error on missing.
- Struct updates with `Update(struct{})` skip zero-value fields. Use `map[string]any` to set zero values.
- `GlobalScopes()` must return `map[string]func(orm.Query) orm.Query` — not a slice.
- `Sum(column, &dest)` signature: `error` only (was `(int64, error)` in v1.16).
- Model events only trigger when operating on a model instance. Batch operations do not trigger events.
