# Getting Started

[[toc]]

## Introduction

Goravel provides a very easy-to-use way to interact with databases, Developers can use `facades.Orm` to operate. Currently, Goravel provides official support for the following four databases:

- MySQL 5.7+
- PostgreSQL 9.6+
- SQLite 3.8.8+
- SQL Server 2017+

Before starting, please configure the database in the `.env` file and confirm the default configuration of `config/database.go`.

# Configuration

The configuration of databases is in the `config/database.go` file. You can configure all database connections in this file and specify the default database connection. Most of configuration in this file is based on the project's environment variables, and provides examples of database configurations supported by Goravel.

### Read & Write Connections

Sometimes you may wish to use one database connection for `SELECT` statements, and another for `INSERT`, `UPDATE`, and `DELETE` statements. Goravel makes this a breeze.

To see how read / write connections should be configured, let's look at this example:

```
import "github.com/goravel/framework/contracts/database"

// config/database.go
"connections": map[string]any{
  "mysql": map[string]any{
    "driver": "mysql",
    "read": []database.Config{
      {Host: "192.168.1.1", Port: 3306, Database: "forge", Username: "root", Password: "123123"},
    },
    "write": []database.Config{
      {Host: "192.168.1.2", Port: 3306, Database: "forge", Username: "root", Password: "123123"},
    },
    "host": config.Env("DB_HOST", "127.0.0.1"),
    "port":     config.Env("DB_PORT", 3306),
    "database": config.Env("DB_DATABASE", "forge"),
    "username": config.Env("DB_USERNAME", ""),
    "password": config.Env("DB_PASSWORD", ""),
    "charset":  "utf8mb4",
    "loc":      "Local",
  },
}
```

Two keys have been added to the configuration array: `read` and `write`, `192.168.1.1` will be used as the host for the "read" connection, while `192.168.1.2` will be used for the "write" connection. The database prefix, character set, and all other options in the main `mysql` array will be shared across both connections. When multiple values exist in the `host` configuration array, a database host will be randomly chosen for each request.

### Connection Pool

You can configure connection pool in the configuration file, reasonable configuration of connection pool parameters can greatly improve concurrency performance:

| Key        | Action           |
| -----------  | -------------- |
| pool.max_idle_conns         | Max idle connections    |
| pool.max_open_conns     | Max open connections |
| pool.conn_max_idletime     | Connections max idle time |
| pool.conn_max_lifetime     | Connections max lifetime  |

## Model Definition

You can create a custom model based on the model file `app/models/user.go` that comes with the framework. In the `app/models/user.go` file, `struct` has nested two frameworks, `orm.Model` and `orm.SoftDeletes`, they define `id, created_at, updated_at` and `deleted_at` respectively, `orm.SoftDeletes` means that soft deletion is enabled for the model.

### Model Convention

1. The model is named with a big hump;
2. Use the plural form of the model "snake naming" as the table name;

For example, the model name is `UserOrder`, the table name is `user_orders`.

### Create Model

```
go run . artisan make:model User
```

### Specify Table Name

```go
package models

import (
	"github.com/goravel/framework/database/orm"
)

type User struct {
	orm.Model
	Name   string
	Avatar string
	orm.SoftDeletes
}

func (r *User) TableName() string {
	return "goravel_user"
}
```

## facades.Orm available functions

| Name        | Action                                                      |
| ----------- | ----------------------------------------------------------- |
| Connection  | [Specify Database Connection](#Specify-Database-Connection) |
| DB          | [Generic Database Interface sql.DB](#Generic-Database-Interface-sql.DB) |
| Query       | [Get Database Instance](#Get-Database-Instance)             |
| Transaction | [Transaction](#Transaction)                                 |
| WithContext | [Inject Context](#Inject-Context)                           |

## facades.Orm.Query & facades.Orm.Transaction available functions

| Functions     | Action                                                  |
| ------------- | ------------------------------------------------------- |
| Begin         | [Begin transaction](#Transaction)                       |
| Commit        | [Commit transaction](#Transaction)                      |
| Count         | [Count](#Count)                                         |
| Create        | [Create](#Create)                                       |
| Delete        | [Delete](#Delete)                                       |
| Distinct      | [Filter Repetition](#Filter-Repetition)                 |
| Driver        | [Get Driver](#Get-Driver)                               |
| Exec          | [Execute native update SQL](#Execute-Native-Update-SQL) |
| Find          | [Query one or multiple lines by ID](#Query-one-or-multiple-lines-by-ID)            |
| First         | [Query one line](#Query-one-line)                       |
| FirstOr | [Query or return data through callback](#Query-one-line)                     |
| FirstOrCreate | [Retrieving Or Creating Models](#Retrieving-Or-Creating-Models)                     |
| FirstOrNew | [Retrieving Or New Models](#Retrieving-Or-Creating-Models)                     |
| FirstOrFail | [Not Found Error](#Not-Found-Error)                     |
| ForceDelete   | [Force delete](#Delete)                                 |
| Get           | [Query multiple lines](#Query-multiple-lines)           |
| Group         | [Group](#Group-By-&-Having)                             |
| Having        | [Having](#Group-By-&-Having)                            |
| Join          | [Join](#Join)                                           |
| Limit         | [Limit](#Limit)                                         |
| Model         | [Specify a model](#Specify-Table-Query)                 |
| Offset        | [Offset](#Offset)                                       |
| Order         | [Order](#Order)                                         |
| OrWhere       | [OrWhere](#Where)                                       |
| Paginate      | [Paginate](#Paginate)             |
| Pluck         | [Query single column](#Query-Single-Column)             |
| Raw           | [Execute native SQL](#Execute-Native-SQL)               |
| Rollback      | [Rollback transaction](#Transaction)                    |
| Save          | [Update a existing model](#Save-Model)                  |
| Scan          | [Scan struct](#Execute-Native-SQL)                      |
| Scopes        | [Scopes](#Execute-Native-SQL)                           |
| Select        | [Specify Fields](#Specify-Fields)                       |
| Table         | [Specify a table](#Specify-Table-Query)                 |
| Update        | [Update a single column](#Update-a-single-column)                   |
| Updates       | [Update multiple columns](#Update-multiple-columns)                  |
| UpdateOrCreate       | [Update or create](#Update-or-create)                  |
| Where         | [Where](#Where)                                         |
| WithTrashed   | [Query soft delete data](#Query-Soft-Delete-Data)       |

## Query Builder

### Inject Context

```go
facades.Orm.WithContext(ctx)
```

### Specify Database Connection

If you define multiple database connections in the `config/database.go` file, you can use them through the `Connection` function of `facades.Orm`. The connection name passed to `Connection` should be one of the connections configured in `config/database.go`:

```go
facades.Orm.Connection("mysql")
```

### Generic Database Interface sql.DB

Generic database interface sql.DB, then use the functionality it provides:

```go
db, err := facades.Orm.DB()
db, err := facades.Orm.Connection("mysql").DB()

// Ping
db.Ping()

// Close
db.Close()

// Returns database statistics
db.Stats()

// SetMaxIdleConns sets the maximum number of connections in the idle connection pool
db.SetMaxIdleConns(10)

// SetMaxOpenConns sets the maximum number of open connections to the database
db.SetMaxOpenConns(100)

// SetConnMaxLifetime sets the maximum amount of time a connection may be reused
db.SetConnMaxLifetime(time.Hour)
```

### Get Database Instance

Before each specific database operation, it's necessary to obtain an instance of the database.

```go
facades.Orm.Query()
facades.Orm.Connection("mysql").Query()
facades.Orm.WithContext(ctx).Query()
```

### Select

#### Query one line

```go
var user models.User
facades.Orm.Query().First(&user)
// SELECT * FROM users WHERE id = 10;
```

Sometimes you may wish to perform some other action if no results are found. The findOr and firstOr methods will return a single model instance or, if no results are found, execute the given closure. You can set values to model in closure:

```go
facades.Orm.Query().Where("name", "first_user").FirstOr(&user, func() error {
  user.Name = "goravel"

  return nil
})
```

#### Query one or multiple lines by ID

```go
var user models.User
facades.Orm.Query().Find(&user, 1)
// SELECT * FROM users WHERE id = 1;

var users []models.User
facades.Orm.Query().Find(&users, []int{1,2,3})
// SELECT * FROM users WHERE id IN (1,2,3);
```

#### When the primary key of the user table is `string` type, you need to specify the primary key when calling `Find` method

```go
var user models.User
facades.Orm.Query().Find(&user, "uuid=?" ,"a")
// SELECT * FROM users WHERE uuid = "a";
```

#### Query multiple lines

```go
var users []models.User
facades.Orm.Query().Where("id in ?", []int{1,2,3}).Get(&users)
// SELECT * FROM users WHERE id IN (1,2,3);
```

#### Retrieving Or Creating Models

The `FirstOrCreate` method will attempt to locate a database record using the given column / value pairs. If the model can not be found in the database, a record will be inserted with the attributes resulting from merging the first argument with the optional second argument:

The `FirstOrNew` method, like `FirstOrCreate`, will attempt to locate a record in the database matching the given attributes. However, if a model is not found, a new model instance will be returned. Note that the model returned by `FirstOrNew` has not yet been persisted to the database. You will need to manually call the `Save` method to persist it:

```go
var user models.User
facades.Orm.Query().Where("sex", 1).FirstOrCreate(&user, models.User{Name: "tom"})
// SELECT * FROM users where name="tom" and sex=1;
// INSERT INTO users (name) VALUES ("tom");

facades.Orm.Query().Where("sex", 1).FirstOrCreate(&user, models.User{Name: "tom"}, models.User{Avatar: "avatar"})
// SELECT * FROM users where name="tom" and sex=1;
// INSERT INTO users (name,avatar) VALUES ("tom", "avatar");

var user models.User
facades.Orm.Query().Where("sex", 1).FirstOrNew(&user, models.User{Name: "tom"})
// SELECT * FROM users where name="tom" and sex=1;

facades.Orm.Query().Where("sex", 1).FirstOrNew(&user, models.User{Name: "tom"}, models.User{Avatar: "avatar"})
// SELECT * FROM users where name="tom" and sex=1;
```

#### Not Found Error

When not fount model, `First` doesn't return error, if you want return an error, you can use `FirstOrFail`:

```go
var user models.User
err := facades.Orm.Query().FirstOrFail(&user)
// err == orm.ErrRecordNotFound
```

### Where

```go
facades.Orm.Query().Where("name", "tom")
facades.Orm.Query().Where("name = 'tom'")
facades.Orm.Query().Where("name = ?", "tom")

facades.Orm.Query().OrWhere("name = ?", "tom")
```

### Limit

```go
var users []models.User
facades.Orm.Query().Where("name = ?", "tom").Limit(3).Get(&users)
// SELECT * FROM users WHERE name = "tom" LIMIT 3;
```

### Offset

```go
var users []models.User
facades.Orm.Query().Where("name = ?", "tom").Offset(5).Limit(3).Get(&users)
// SELECT * FROM users WHERE name = "tom" OFFSET 5 LIMIT 3;
```

### Order

```go
var users []models.User
facades.Orm.Query().Where("name = ?", "tom").Order("sort asc").Order("id desc").Get(&users)
// SELECT * FROM users WHERE name = "tom" order sort asc, id desc;
```

### Paginate

```go
var users []models.User
var total int64
facades.Orm.Query().Paginate(1, 10, &users, &total)
// SELECT count(*) FROM `users`;
// SELECT * FROM `users` LIMIT 10;
```

### Query Single Column

```go
var ages []int64
facades.Orm.Query().Model(&models.User{}).Pluck("age", &ages)
// SELECT `name` FROM `users`;
```

### Specify Table Query

If you want to query some aggregate data, you need to specify a specific table.

Specify a model

```go
var count int64
facades.Orm.Query().Model(&models.User{}).Count(&count)
// SELECT count(1) where users
```

Specify a table

```go
var count int
facades.Orm.Query().Table("users").Count(&count)
// SELECT count(1) where users
```

### Count

```go
var count int64
facades.Orm.Query().Where("name = ?", "tom").Count(&count)
// SELECT count(1) FROM users WHERE name = 'tom'
```

### Specify Fields

`Select` allows you to specify which fields to retrieve from the database, by default the ORM retrieves all fields.

```go
facades.Orm.Query().Select("name", "age").Get(&users)
// SELECT name, age FROM users;

facades.Orm.Query().Select([]string{"name", "age"}).Get(&users)
// SELECT name, age FROM users;
```

### Group By & Having

```go
type Result struct {
  Name  string
  Total int
}

var result Result
facades.Orm.Query().Model(&models.User{}).Select("name, sum(age) as total").Group("name").Having("name = ?", "tom").Get(&result)
// SELECT name, sum(age) as total FROM `users` GROUP BY `name` HAVING name = "tom"
```

### Join

```go
type Result struct {
  Name  string
  Email string
}

var result Result
facades.Orm.Query().Model(&models.User{}).Select("users.name, emails.email").Joins("left join emails on emails.user_id = users.id").Scan(&result)
// SELECT users.name, emails.email FROM `users` left join emails on emails.user_id = users.id
```

### Create

```go
user := User{Name: "tom", Age: 18}
result := facades.Orm.Query().Create(&user)
// INSERT INTO users (name, age, created_at, updated_at) VALUES ("tom", 18, "2022-09-27 22:00:00", "2022-09-27 22:00:00");
```

Multiple create

```go
users := []User{{Name: "tom", Age: 18}, {Name: "tim", Age: 19}}
result := facades.Orm.Query().Create(&users)
```

> `created_at` and `updated_at` will be filled automatically.

### Save Model

#### Update a existing model

```go
var user models.User
facades.Orm.Query().First(&user)

user.Name = "tom"
user.Age = 100
facades.Orm.Query().Save(&user)
// UPDATE users SET name='tom', age=100, updated_at = '2022-09-28 16:28:22' WHERE id=1;
```

#### Update a single column

```go
facades.Orm.Query().Model(&models.User{}).Where("name", "tom").Update("name", "hello")
// UPDATE users SET name='tom', updated_at='2022-09-28 16:29:39' WHERE name="tom";
```

#### Update multiple columns

```go
facades.Orm.Query().Model(&user).Where("name", "tom").Updates(User{Name: "hello", Age: 18})
// UPDATE users SET name="hello", age=18, updated_at = '2022-09-28 16:30:12' WHERE name = "tom";
```

> When updating with `struct`, Orm will only update non-zero fields. You might want to use `map` to update attributes or use `Select` to specify fields to update. Note that `struct` can only be `Model`, if you want to update with non `Model`, you need to use `.Table("users")`, however, the `updated_at` field cannot be updated automatically at this time.

#### Update or create

Query by `name`, if not exist, create by `name`, `avatar`, if exists, update `avatar` based on `name`:

```go
facades.Orm.Query().UpdateOrCreate(&user, User{Name: "name"}, User{Avatar: "avatar"})
// SELECT * FROM `users` WHERE `users`.`name` = 'name' AND `users`.`deleted_at` IS NULL ORDER BY `users`.`id` LIMIT 1
// INSERT INTO `users` (`created_at`,`updated_at`,`deleted_at`,`name`,`avatar`) VALUES ('2023-03-11 10:11:08.869','2023-03-11 10:11:08.869',NULL,'name','avatar')
// UPDATE `users` SET `avatar`='avatar',`updated_at`='2023-03-11 10:11:08.881' WHERE `name` = 'name' AND `users`.`deleted_at` IS NULL AND `id` = 1
```
### Delete

Delete by model

```go
var user models.User
facades.Orm.Query().Find(&user, 1)
facades.Orm.Query().Delete(&user)
// DELETE FROM users where id = 1;
```

Delete by ID

```go
facades.Orm.Query().Delete(&models.User{}, 10)
// DELETE FROM users WHERE id = 10;

facades.Orm.Query().Delete(&models.User{}, []int{1, 2, 3})
// DELETE FROM users WHERE id in (1, 2, 3);
```

Multiple delete

```go
facades.Orm.Query().Where("name = ?", "tom").Delete(&models.User{})
// DELETE FROM users where name = "tom";
```

Want to force delete a soft-delete data.

```go
facades.Orm.Query().Where("name = ?", "tom").ForceDelete(&models.User{})
```

You can delete records with model associations via `Select`:

```go
// Delete Account of user when deleting user
facades.Orm.Query().Select("Account").Delete(&user)

// Delete Orders and CreditCards of user when deleting user
facades.Orm.Query().Select("Orders", "CreditCards").Delete(&user)

// Delete all child associations of user when deleting user
facades.Orm.Query().Select(orm.Associations).Delete(&user)

// Delete all Account of users when deleting users
facades.Orm.Query().Select("Account").Delete(&users)
```

Note: The associations will be deleted only if the primary key of the record is not empty, and Orm uses these primary keys as conditions to delete associated records:

```go
// Delete user that name=`jinzhu`, but don't delete account of user
facades.Orm.Query().Select("Account").Where("name = ?", "jinzhu").Delete(&User{})

// Delete user that name=`jinzhu` and id = `1`, and delete account of user
facades.Orm.Query().Select("Account").Where("name = ?", "jinzhu").Delete(&User{ID: 1})

// Delete user that id = `1` and delete account that user
facades.Orm.Query().Select("Account").Delete(&User{ID: 1})
```

If execute batch delete without any conditions, ORM doesn't do that and returns an error. So you have to add some conditions, or use native SQL.

### Query Soft Delete Data

```go
var user models.User
facades.Orm.Query().WithTrashed().First(&user)
```

### Filter Repetition

```go
var users []models.User
facades.Orm.Query().Distinct("name").Find(&users)
```

### Get Driver

```go
driver := facades.Orm.Query().Driver()

// Judge driver
if driver == orm.DriverMysql {}
```

### Execute Native SQL

```go
type Result struct {
  ID   int
  Name string
  Age  int
}

var result Result
facades.Orm.Query().Raw("SELECT id, name, age FROM users WHERE name = ?", "tom").Scan(&result)
```

### Execute Native Update SQL

```go
facades.Orm.Query().Exec("DROP TABLE users")
// DROP TABLE users;
```

### Transaction

You can execute a transaction by `Transaction` function.

```go
import (
  "github.com/goravel/framework/contracts/database/orm"
  "github.com/goravel/framework/facades"

  "goravel/app/models"
)

...

return facades.Orm.Transaction(func(tx orm.Transaction) error {
  var user models.User

  return tx.Find(&user, user.ID)
})
```

You can also manually control the flow of the transaction yourself:

```go
tx, err := facades.Orm.Query().Begin()
user := models.User{Name: "Goravel"}
if err := tx.Create(&user); err != nil {
  err := tx.Rollback()
} else {
  err := tx.Commit()
}
```

### Scopes

Allows you to specify commonly used queries that can be referenced when methoed are called.

```go
func Paginator(page string, limit string) func(methods orm.Query) orm.Query {
  return func(query orm.Query) orm.Query {
    page, _ := strconv.Atoi(page)
    limit, _ := strconv.Atoi(limit)
    offset := (page - 1) * limit

    return query.Offset(offset).Limit(limit)
  }
}

facades.Orm.Query().Scopes(scopes.Paginator(page, limit)).Find(&entries)
```
