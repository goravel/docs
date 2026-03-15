# Goravel ORM Models, Query Builder, Relationships, and Migrations

## Model Definition

Models live in `app/models/`. Model name is PascalCase; table name is plural snake_case.
`UserOrder` model maps to `user_orders` table.

```go
package models

import "github.com/goravel/framework/database/orm"

type User struct {
    orm.Model        // adds id, created_at, updated_at
    Name   string
    Avatar string
    orm.SoftDeletes  // adds deleted_at for soft delete support
}
```

### Custom table name

```go
func (r *User) TableName() string {
    return "goravel_user"
}
```

### Custom connection

```go
func (r *User) Connection() string {
    return "postgres"
}
```

### JSON field

```go
import (
    "database/sql/driver"
    "encoding/json"
    "github.com/goravel/framework/database/orm"
    "gorm.io/datatypes"
)

type User struct {
    orm.Model
    Metadata datatypes.JSONMap `gorm:"type:json" json:"metadata"`
    Profile  *UserProfile      `gorm:"type:json;serializer:json" json:"profile"`
}

type UserProfile struct {
    Bio string `json:"bio"`
}

func (r *UserProfile) Value() (driver.Value, error) {
    return json.Marshal(r)
}

func (r *UserProfile) Scan(value any) error {
    if data, ok := value.([]byte); ok && len(data) > 0 {
        return json.Unmarshal(data, r)
    }
    return nil
}
```

### `any` field type

```go
type User struct {
    orm.Model
    Detail any `gorm:"type:text"`
}
```

### Global scopes

```go
import contractsorm "github.com/goravel/framework/contracts/database/orm"

func (r *User) GlobalScopes() map[string]func(contractsorm.Query) contractsorm.Query {
    return map[string]func(contractsorm.Query) contractsorm.Query{
        "active": func(query contractsorm.Query) contractsorm.Query {
            return query.Where("active", true)
        },
    }
}
```

Remove global scopes:

```go
facades.Orm().Query().WithoutGlobalScopes().Get(&users)
facades.Orm().Query().WithoutGlobalScopes("active").Get(&users)
```

### Generate model

```shell
./artisan make:model User
./artisan make:model user/User
./artisan make:model --table=users User
```

---

## Getting a Query Instance

```go
facades.Orm().Query()
facades.Orm().Connection("mysql").Query()
facades.Orm().WithContext(ctx).Query()
```

---

## Querying

### Find one by ID

```go
var user models.User
facades.Orm().Query().Find(&user, 1)
// err is nil even when record does not exist
```

### Find or fail

```go
var user models.User
err := facades.Orm().Query().FindOrFail(&user, 1)
// err is non-nil when record does not exist
```

### Find multiple by IDs

```go
var users []models.User
facades.Orm().Query().Find(&users, []int{1, 2, 3})
```

### First

```go
var user models.User
facades.Orm().Query().First(&user)
// ordered by primary key, no error on missing record
```

### First or fail

```go
import "github.com/goravel/framework/errors"

var user models.User
err := facades.Orm().Query().FirstOrFail(&user)
if errors.Is(err, errors.OrmRecordNotFound) {
    // not found
}
```

### First or default via callback

```go
facades.Orm().Query().Where("name", "tom").FirstOr(&user, func() error {
    user.Name = "default"
    return nil
})
```

### Get all matching

```go
var users []models.User
facades.Orm().Query().Where("active", true).Get(&users)
```

---

## Where Conditions

```go
facades.Orm().Query().Where("name", "tom")
facades.Orm().Query().Where("name = ?", "tom")
facades.Orm().Query().Where("age > ?", 18)

facades.Orm().Query().WhereBetween("age", 1, 10)
facades.Orm().Query().WhereNotBetween("age", 1, 10)
facades.Orm().Query().WhereIn("name", []any{"a", "b"})
facades.Orm().Query().WhereNotIn("name", []any{"a", "b"})
facades.Orm().Query().WhereNull("deleted_at")

facades.Orm().Query().OrWhere("name", "tim")
facades.Orm().Query().OrWhereIn("name", []any{"a", "b"})
facades.Orm().Query().OrWhereNull("avatar")

// All must match
facades.Orm().Query().WhereAll([]string{"weight", "height"}, "=", 200).Find(&products)

// Any must match
facades.Orm().Query().WhereAny([]string{"name", "email"}, "=", "john").Find(&users)

// None must match
facades.Orm().Query().WhereNone([]string{"age", "score"}, ">", 18).Find(&products)
```

### JSON column conditions

```go
facades.Orm().Query().Where("preferences->dining->meal", "salad").First(&user)
facades.Orm().Query().WhereJsonContains("options->languages", "en").First(&user)
facades.Orm().Query().WhereJsonDoesntContain("options->languages", "en").First(&user)
facades.Orm().Query().WhereJsonContainsKey("contacts->personal->email").First(&user)
facades.Orm().Query().WhereJsonLength("options->languages", 1).First(&user)
```

---

## Ordering, Limit, Offset, Paginate

```go
facades.Orm().Query().Order("name asc").Order("id desc").Get(&users)
facades.Orm().Query().OrderBy("name").Get(&users)       // asc
facades.Orm().Query().OrderByDesc("name").Get(&users)   // desc
facades.Orm().Query().InRandomOrder().Get(&users)

facades.Orm().Query().Limit(10).Get(&users)
facades.Orm().Query().Offset(20).Limit(10).Get(&users)

var total int64
facades.Orm().Query().Paginate(1, 10, &users, &total)
```

---

## Select, Count, Aggregates

```go
facades.Orm().Query().Select("name", "age").Get(&users)

count, err := facades.Orm().Query().Model(&models.User{}).Count()
count, err := facades.Orm().Query().Table("users").Count()

var sum int
facades.Orm().Query().Model(models.User{}).Sum("id", &sum)

var avg float64
facades.Orm().Query().Model(models.User{}).Average("age", &avg)

var max int
facades.Orm().Query().Model(models.User{}).Max("age", &max)

var min int
facades.Orm().Query().Model(models.User{}).Min("age", &min)
```

---

## Pluck, Distinct

```go
var ages []int64
facades.Orm().Query().Model(&models.User{}).Pluck("age", &ages)

var users []models.User
facades.Orm().Query().Distinct("name").Find(&users)
```

---

## Group By / Having / Join

```go
type Result struct {
    Name  string
    Total int
}

var result Result
facades.Orm().Query().Model(&models.User{}).
    Select("name", "sum(age) as total").
    Group("name").
    Having("name = ?", "tom").
    Get(&result)
```

```go
facades.Orm().Query().Model(&models.User{}).
    Select("users.name", "emails.email").
    Join("left join emails on emails.user_id = users.id").
    Scan(&result)
```

---

## Create

```go
user := models.User{Name: "tom", Avatar: "avatar.png"}
err := facades.Orm().Query().Create(&user)
// user.ID is populated after create

// Batch create
users := []models.User{{Name: "tom"}, {Name: "tim"}}
err := facades.Orm().Query().Create(&users)

// Create via map (no model events)
err := facades.Orm().Query().Table("users").Create(map[string]any{"name": "Goravel"})

// Create via map (with model events)
err := facades.Orm().Query().Model(&models.User{}).Create(map[string]any{"name": "Goravel"})
```

---

## Update

```go
// Full save (updates all fields)
var user models.User
facades.Orm().Query().First(&user)
user.Name = "updated"
facades.Orm().Query().Save(&user)

// Update single column
facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Update("name", "hello")

// Update via struct (non-zero fields only)
facades.Orm().Query().Model(&models.User{}).Where("id", 1).Update(models.User{Name: "hello"})

// Update via map (all fields including zeros)
facades.Orm().Query().Model(&models.User{}).Where("id", 1).Update(map[string]any{
    "name": "hello",
    "age":  0,
})

// Update JSON field
facades.Orm().Query().Model(&models.User{}).Where("id", 1).Update("options->enabled", true)

// Update or create
facades.Orm().Query().UpdateOrCreate(&user, models.User{Name: "tom"}, models.User{Avatar: "new.png"})
```

---

## FirstOrCreate / FirstOrNew

```go
// Find by conditions, create if not found
var user models.User
facades.Orm().Query().Where("gender", 1).FirstOrCreate(&user, models.User{Name: "tom"})
facades.Orm().Query().Where("gender", 1).FirstOrCreate(&user, models.User{Name: "tom"}, models.User{Avatar: "avatar.png"})

// Like FirstOrCreate but does not save
facades.Orm().Query().Where("gender", 1).FirstOrNew(&user, models.User{Name: "tom"})
// must call Save manually
facades.Orm().Query().Save(&user)
```

---

## Delete

```go
var user models.User
facades.Orm().Query().Find(&user, 1)
res, err := facades.Orm().Query().Delete(&user)

// Delete with conditions
res, err := facades.Orm().Query().Model(&models.User{}).Where("id", 1).Delete()

// Force delete (skip soft delete)
facades.Orm().Query().Where("name", "tom").ForceDelete(&models.User{})
facades.Orm().Query().Model(&models.User{}).Where("name", "tom").ForceDelete()

num := res.RowsAffected
```

---

## Soft Delete

```go
// Query including soft-deleted records
var user models.User
facades.Orm().Query().WithTrashed().First(&user)

// Restore
facades.Orm().Query().WithTrashed().Restore(&models.User{ID: 1})
facades.Orm().Query().Model(&models.User{ID: 1}).WithTrashed().Restore()
```

---

## Transactions

```go
import "github.com/goravel/framework/contracts/database/orm"

err := facades.Orm().Transaction(func(tx orm.Query) error {
    var user models.User
    if err := tx.Find(&user, 1); err != nil {
        return err
    }
    return tx.Model(&user).Update("name", "updated")
})
```

Manual transaction:

```go
tx, err := facades.Orm().Query().BeginTransaction()
if err := tx.Create(&user); err != nil {
    tx.Rollback()
} else {
    tx.Commit()
}
```

---

## Raw SQL

```go
type Result struct {
    ID   int
    Name string
}

var result Result
facades.Orm().Query().Raw("SELECT id, name FROM users WHERE name = ?", "tom").Scan(&result)

// Raw update
res, err := facades.Orm().Query().Exec("DROP TABLE users")
num := res.RowsAffected
```

---

## Raw Expressions in Updates

```go
import "github.com/goravel/framework/database/db"

facades.Orm().Query().Model(&user).Update("age", db.Raw("age - ?", 1))
```

---

## Scopes

```go
import "github.com/goravel/framework/contracts/database/orm"

func Paginator(page, limit int) func(orm.Query) orm.Query {
    return func(query orm.Query) orm.Query {
        offset := (page - 1) * limit
        return query.Offset(offset).Limit(limit)
    }
}

facades.Orm().Query().Scopes(Paginator(2, 10)).Find(&users)
```

---

## Exists

```go
exists, err := facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Exists()
```

---

## Cursor (low-memory iteration)

```go
cursor, err := facades.Orm().Query().Model(models.User{}).Cursor()
if err != nil {
    return err
}
for row := range cursor {
    var user models.User
    if err := row.Scan(&user); err != nil {
        return err
    }
}
```

---

## Pessimistic Locking

```go
facades.Orm().Query().Where("votes > ?", 100).SharedLock().Get(&users)
facades.Orm().Query().Where("votes > ?", 100).LockForUpdate().Get(&users)
```

---

## Relationships

### One to One

```go
type User struct {
    orm.Model
    Name  string
    Phone *Phone
}

type Phone struct {
    orm.Model
    UserID uint
    Name   string
}
```

Custom foreign key:

```go
type User struct {
    orm.Model
    Name  string
    Phone *Phone `gorm:"foreignKey:UserName"`
}

type Phone struct {
    orm.Model
    UserName string
    Name     string
}
```

### One to Many

```go
type Post struct {
    orm.Model
    Name     string
    Comments []*Comment
}

type Comment struct {
    orm.Model
    PostID uint
    Name   string
    Post   *Post // inverse (belongs to)
}
```

### Many to Many

```go
type User struct {
    orm.Model
    Name  string
    Roles []*Role `gorm:"many2many:role_user"`
}

type Role struct {
    orm.Model
    Name  string
    Users []*User `gorm:"many2many:role_user"`
}
```

Custom pivot keys:

```go
type User struct {
    orm.Model
    Name  string
    Roles []*Role `gorm:"many2many:role_user;joinForeignKey:UserName;joinReferences:RoleName"`
}
```

### Polymorphic

```go
type Post struct {
    orm.Model
    Name     string
    Image    *Image    `gorm:"polymorphic:Imageable"`
    Comments []*Comment `gorm:"polymorphic:Commentable"`
}

type Image struct {
    orm.Model
    Name          string
    ImageableID   uint
    ImageableType string
}
```

Custom polymorphic value:

```go
type Post struct {
    orm.Model
    Image *Image `gorm:"polymorphic:Imageable;polymorphicValue:master"`
}
```

---

## Eager Loading

```go
// Eager load single relation
var books []models.Book
facades.Orm().Query().With("Author").Find(&books)

// Multiple relations
facades.Orm().Query().With("Author").With("Publisher").Find(&book)

// Nested
facades.Orm().Query().With("Author.Contacts").Find(&book)

// With constraints
facades.Orm().Query().With("Author", "name = ?", "goravel").Find(&book)

facades.Orm().Query().With("Author", func(query orm.Query) orm.Query {
    return query.Where("active", true)
}).Find(&book)
```

### Lazy Eager Loading

```go
var books []models.Book
facades.Orm().Query().Find(&books)

for _, book := range books {
    facades.Orm().Query().Load(&book, "Author")
}

// With constraints
facades.Orm().Query().Load(&book, "Author", "name = ?", "goravel")

// Only if not already loaded
facades.Orm().Query().LoadMissing(&book, "Author")
```

---

## Association Operations

```go
var user models.User
facades.Orm().Query().Find(&user, 1)

// Find all related
var posts []models.Post
facades.Orm().Query().Model(&user).Association("Posts").Find(&posts)

// Append
facades.Orm().Query().Model(&user).Association("Posts").Append(&models.Post{Name: "new post"})

// Replace
facades.Orm().Query().Model(&user).Association("Posts").Replace([]*models.Post{post1, post2})

// Delete (removes relationship, not the record)
facades.Orm().Query().Model(&user).Association("Posts").Delete(post1)

// Clear all
facades.Orm().Query().Model(&user).Association("Posts").Clear()

// Count
count := facades.Orm().Query().Model(&user).Association("Posts").Count()
```

---

## ORM Events

```go
import (
    contractsorm "github.com/goravel/framework/contracts/database/orm"
    "github.com/goravel/framework/database/orm"
)

type User struct {
    orm.Model
    Name string
}

func (u *User) DispatchesEvents() map[contractsorm.EventType]func(contractsorm.Event) error {
    return map[contractsorm.EventType]func(contractsorm.Event) error{
        contractsorm.EventCreating: func(event contractsorm.Event) error {
            return nil
        },
        contractsorm.EventCreated: func(event contractsorm.Event) error {
            return nil
        },
        contractsorm.EventUpdating: func(event contractsorm.Event) error {
            return nil
        },
        contractsorm.EventUpdated: func(event contractsorm.Event) error {
            return nil
        },
        contractsorm.EventDeleting: func(event contractsorm.Event) error {
            return nil
        },
        contractsorm.EventDeleted: func(event contractsorm.Event) error {
            return nil
        },
    }
}
```

### Observer

```go
package observers

import "github.com/goravel/framework/contracts/database/orm"

type UserObserver struct{}

func (u *UserObserver) Created(event orm.Event) error  { return nil }
func (u *UserObserver) Updated(event orm.Event) error  { return nil }
func (u *UserObserver) Deleted(event orm.Event) error  { return nil }
```

Register observer in `WithCallback`:

```go
WithCallback(func() {
    facades.Orm().Observe(models.User{}, &observers.UserObserver{})
})
```

### Muting events

```go
facades.Orm().Query().WithoutEvents().Find(&user, 1)
facades.Orm().Query().SaveQuietly(&user)
```

---

## Migrations

### Create migration

```shell
./artisan make:migration create_users_table
./artisan make:migration add_avatar_to_users_table
./artisan make:migration create_users_table -m User
```

### Migration struct

```go
package migrations

import (
    "github.com/goravel/framework/contracts/database/schema"

    "goravel/app/facades"
)

type M20241207095921CreateUsersTable struct{}

func (r *M20241207095921CreateUsersTable) Signature() string {
    return "20241207095921_create_users_table"
}

func (r *M20241207095921CreateUsersTable) Up() error {
    if !facades.Schema().HasTable("users") {
        return facades.Schema().Create("users", func(table schema.Blueprint) {
            table.ID()
            table.String("name").Nullable()
            table.String("email").Nullable()
            table.Timestamps()
            table.SoftDeletes()
        })
    }
    return nil
}

func (r *M20241207095921CreateUsersTable) Down() error {
    return facades.Schema().DropIfExists("users")
}
```

Optional connection method:

```go
func (r *M20241207095921CreateUsersTable) Connection() string {
    return "postgres"
}
```

### Register migrations

Generated migrations auto-register in `bootstrap/migrations.go`. Manual registration:

```go
func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithMigrations(migrations.Migrations).
        WithConfig(config.Boot).
        Create()
}
```

### Schema operations

```go
// Create
facades.Schema().Create("users", func(table schema.Blueprint) {
    table.ID()
    table.String("name").Nullable()
    table.String("email").Unique()
    table.Timestamps()
    table.SoftDeletes()
})

// Modify
facades.Schema().Table("users", func(table schema.Blueprint) {
    table.String("avatar").Nullable()
})

// Rename column
facades.Schema().Table("users", func(table schema.Blueprint) {
    table.RenameColumn("old_name", "new_name")
})

// Drop column
facades.Schema().Table("users", func(table schema.Blueprint) {
    table.DropColumn("avatar")
})

// Drop table
facades.Schema().Drop("users")
facades.Schema().DropIfExists("users")
facades.Schema().Rename("users", "new_users")

// Checks
facades.Schema().HasTable("users")
facades.Schema().HasColumn("users", "email")
facades.Schema().HasColumns("users", []string{"name", "email"})
facades.Schema().HasIndex("users", "email_unique")
```

### Column types

Boolean, Char, String, Text, MediumText, LongText, TinyText, Json, ID, BigIncrements, Integer, BigInteger, Decimal, Float, Double, Date, DateTime, Timestamp, Timestamps, SoftDeletes, Enum, Uuid, Ulid

```go
table.ID()
table.String("name")
table.String("code", 10)
table.Text("body")
table.Integer("age")
table.BigInteger("views")
table.Boolean("active")
table.Decimal("price", 8, 2)
table.Timestamps()
table.SoftDeletes()
table.Enum("status", []any{"active", "inactive"})
table.UnsignedBigInteger("user_id")
table.Column("geometry", "geometry") // custom type
```

### Column modifiers

```go
table.String("name").Nullable()
table.String("role").Default("user")
table.Integer("sort").Default(0)
table.String("code").Unique()
table.Timestamp("published_at").UseCurrent()
```

### Indexes and foreign keys

```go
// Indexes
table.Primary("id")
table.Unique("email")
table.Index("name")
table.FullText("body")

// Foreign key
table.UnsignedBigInteger("user_id")
table.Foreign("user_id").References("id").On("users")

// Drop index
table.DropUnique("email")
table.DropForeign("user_id")
```

### Migration commands

```shell
./artisan migrate
./artisan migrate:rollback
./artisan migrate:rollback --step=5
./artisan migrate:rollback --batch=2
./artisan migrate:reset
./artisan migrate:refresh
./artisan migrate:fresh
./artisan migrate:status
```

---

## Gotchas

- `Find` never errors on missing record. Always use `FindOrFail` when you need to confirm existence.
- `First` never errors on missing record. Use `FirstOrFail` instead.
- Struct-based `Update` silently skips zero values. Use `map[string]any` when zero values matter.
- Model events only fire when a model instance is passed to `Model()`. Batch operations without a model skip events.
- `WithTrashed()` must be chained before the query method to include soft-deleted records.
- Do not use `DispatchesEvents` and an observer on the same model: only `DispatchesEvents` applies when both are set.
