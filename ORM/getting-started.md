# Getting Started

[[toc]]

## Introduction

Goravel makes it easy for developers to interact with databases using `facades.Orm()`. Currently, it supports four official databases:

- MySQL 5.7+
- PostgreSQL 9.6+
- SQLite 3.8.8+
- SQL Server 2017+

Before you start, configure the database in the `.env` file and confirm the `default` configuration in `config/database.go`.

# Configuration

To configure databases, navigate to the `config/database.go` file. This is where you can customize all database connections and choose a `default` connection. The configuration in this file relies on the project's environment variables and showcases various database configurations that Goravel supports.

### Read & Write Connections

Sometimes you may wish to use one database connection for `SELECT` statements, and another for `INSERT`, `UPDATE`, and `DELETE` statements. Goravel makes this a breeze.

To see how read/write connections should be configured, let's look at this example:

```go
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

We have updated the configuration array with two new keys - `read` and `write`. The `read` connection will use `192.168.1.1` as the host, while the `write` connection will use `192.168.1.2`. Both connections will share the same database prefix, character set, and other options specified in the main mysql array. In case of multiple values in the `host` configuration array, a database host will be selected randomly for each request.

### Connection Pool

You can configure a connection pool in the configuration file, reasonable configuration of connection pool parameters can greatly improve concurrency performance:

| Key        | Action           |
| -----------  | -------------- |
| pool.max_idle_conns         | Max idle connections    |
| pool.max_open_conns     | Max open connections |
| pool.conn_max_idletime     | Connections max idle time |
| pool.conn_max_lifetime     | Connections max lifetime  |

## Model Definition

To create a custom model, you can use the model file `app/models/user.go` that is included in the framework. The `struct` in the `app/models/user.go` file contains two embedded frameworks: `orm.Model` and `orm.SoftDeletes`. These frameworks define `id`, `created_at`, `updated_at`, and `deleted_at` properties respectively. With `orm.SoftDeletes`, you can enable soft deletion for the model.

### Model Convention

1. The model is named with a big hump;
2. Use the plural form of the model "snake naming" as the table name;

For example, the model name is `UserOrder`, and the table name is `user_orders`.

### Create Model

```shell
go run . artisan make:model User
go run . artisan make:model user/User
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

### Database Connections

By default, all models utilize the default database connection which is configured for your application. If you wish to specify a distinct connection to be used when interacting with a specific model, you need to define a `Connection` method on the model.

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

func (r *User) Connection() string {
  return "postgresql"
}
```

## facades.Orm available functions

| Name        | Action                                                      |
| ----------- | ----------------------------------------------------------- |
| Connection  | [Specify Database Connection](#specify-database-connection) |
| DB          | [Generic Database Interface sql.DB](#generic-database-interface-sql-db) |
| Query       | [Get Database Instance](#get-database-instance)             |
| Transaction | [Transaction](#transaction)                                 |
| WithContext | [Inject Context](#inject-context)                           |

## facades.Orm().Query & facades.Orm().Transaction available functions

| Functions     | Action                                                  |
| ------------- | ------------------------------------------------------- |
| Begin         | [Begin transaction](#transaction)                       |
| Commit        | [Commit transaction](#transaction)                      |
| Count         | [Count](#count)                                         |
| Create        | [Create](#create)                                       |
| Cursor        | [Cursor](#cursor)                                       |
| Delete        | [Delete](#delete)                                       |
| Distinct      | [Filter Repetition](#filter-repetition)                 |
| Driver        | [Get Driver](#get-driver)                               |
| Exec          | [Execute native update SQL](#execute-native-update-sql) |
| Find          | [Query one or multiple lines by ID](#query-one-or-multiple-lines-by-id)            |
| FindOrFail    | [Not found return error](#not-found-return-error)            |
| First         | [Query one line](#query-one-line)                       |
| FirstOr | [Query or return data through callback](#query-one-line)                     |
| FirstOrCreate | [Retrieving Or Creating Models](#retrieving-or-creating-models)                     |
| FirstOrNew | [Retrieving Or New Models](#retrieving-or-creating-models)                     |
| FirstOrFail | [Not Found Error](#not-found-error)                     |
| ForceDelete   | [Force delete](#delete)                                 |
| Get           | [Query multiple lines](#query-multiple-lines)           |
| Group         | [Group](#group-by--having)                             |
| Having        | [Having](#group-by-having)                            |
| Join          | [Join](#join)                                           |
| Limit         | [Limit](#limit)                                         |
| LockForUpdate | [Pessimistic Locking](#pessimistic-locking)           |
| Model         | [Specify a model](#specify-table-query)                 |
| Offset        | [Offset](#offset)                                       |
| Order         | [Order](#order)                                         |
| OrWhere       | [OrWhere](#where)                                       |
| Paginate      | [Paginate](#paginate)             |
| Pluck         | [Query single column](#query-single-column)             |
| Raw           | [Execute native SQL](#execute-native-sql)               |
| Rollback      | [Rollback transaction](#transaction)                    |
| Save          | [Update a existing model](#update-a-existing-model)                  |
| SaveQuietly          | [Saving a single model without events](#saving-a-single-model-without-events)                  |
| Scan          | [Scan struct](#execute-native-sql)                      |
| Scopes        | [Scopes](#execute-native-sql)                           |
| Select        | [Specify Fields](#specify-fields)                       |
| SharedLock | [Pessimistic Locking](#pessimistic-locking)           |
| Sum | [Sum](#sum)           |
| Table         | [Specify a table](#specify-table-query)                 |
| Update        | [Update a single column](#update-a-single-column)                   |
| UpdateOrCreate       | [Update or create](#update-or-create)                  |
| Where         | [Where](#where)                                         |
| WithoutEvents | [Muting events](#muting-events)               |
| WithTrashed   | [Query soft delete data](#query-soft-delete-data)       |

## Query Builder

### Inject Context

```go
facades.Orm().WithContext(ctx)
```

### Specify Database Connection

If you define multiple database connections in `config/database.go`, you can use them through the `Connection` function of `facades.Orm()`. The connection name passed to `Connection` should be one of the connections configured in `config/database.go`:

```go
facades.Orm().Connection("mysql")
```

### Generic Database Interface sql.DB

Generic database interface sql.DB, then use the functionality it provides:

```go
db, err := facades.Orm().DB()
db, err := facades.Orm().Connection("mysql").DB()

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
facades.Orm().Query()
facades.Orm().Connection("mysql").Query()
facades.Orm().WithContext(ctx).Query()
```

### Select

#### Query one line

```go
var user models.User
facades.Orm().Query().First(&user)
// SELECT * FROM `users` ORDER BY `users`.`id` LIMIT 1;
```

Sometimes you may wish to perform some other action if no results are found. The `findOr` and `firstOr` methods will return a single model instance or, if no results are found, execute the given closure. You can set values to model in closure:

```go
facades.Orm().Query().Where("name", "first_user").FirstOr(&user, func() error {
  user.Name = "goravel"

  return nil
})
```

#### Query one or multiple lines by ID

```go
var user models.User
facades.Orm().Query().Find(&user, 1)
// SELECT * FROM `users` WHERE `users`.`id` = 1;

var users []models.User
facades.Orm().Query().Find(&users, []int{1,2,3})
// SELECT * FROM `users` WHERE `users`.`id` IN (1,2,3);
```

#### Not found return error

```go
var user models.User
err := facades.Orm().Query().FindOrFail(&user, 1)
```

#### When the primary key of the user table is `string` type, you need to specify the primary key when calling `Find` method

```go
var user models.User
facades.Orm().Query().Find(&user, "uuid=?" ,"a")
// SELECT * FROM `users` WHERE `users`.`uuid` = "a";
```

#### Query multiple lines

```go
var users []models.User
facades.Orm().Query().Where("id in ?", []int{1,2,3}).Get(&users)
// SELECT * FROM `users` WHERE id in (1,2,3);
```

#### Retrieving Or Creating Models

When using the `FirstOrCreate` method, it searches for a database record using the specified column/value pairs. If the model cannot be found in the database, it creates a new record with the attributes from merging the first argument with the optional second argument. 

Similarly, the `FirstOrNew` method also tries to locate a record in the database based on the attributes given. However, if it is not found, a new instance of the model is returned. It's important to note that this new model has not been saved to the database yet and you need to manually call the `Save` method to do so.

```go
var user models.User
facades.Orm().Query().Where("gender", 1).FirstOrCreate(&user, models.User{Name: "tom"})
// SELECT * FROM `users` WHERE `gender` = 1 AND `users`.`name` = 'tom' ORDER BY `users`.`id` LIMIT 1;
// INSERT INTO `users` (`created_at`,`updated_at`,`name`) VALUES ('2023-09-18 12:51:32.556','2023-09-18 12:51:32.556','tom');

facades.Orm().Query().Where("gender", 1).FirstOrCreate(&user, models.User{Name: "tom"}, models.User{Avatar: "avatar"})
// SELECT * FROM `users` WHERE `gender` = 1 AND `users`.`name` = 'tom' ORDER BY `users`.`id` LIMIT 1;
// INSERT INTO `users` (`created_at`,`updated_at`,`name`,`avatar`) VALUES ('2023-09-18 12:52:59.913','2023-09-18 12:52:59.913','tom','avatar');

var user models.User
facades.Orm().Query().Where("gender", 1).FirstOrNew(&user, models.User{Name: "tom"})
// SELECT * FROM `users` WHERE `gender` = 1 AND `users`.`name` = 'tom' ORDER BY `users`.`id` LIMIT 1;

facades.Orm().Query().Where("gender", 1).FirstOrNew(&user, models.User{Name: "tom"}, models.User{Avatar: "avatar"})
// SELECT * FROM `users` WHERE `gender` = 1 AND `users`.`name` = 'tom' ORDER BY `users`.`id` LIMIT 1;
```

#### Not Found Error

When the requested item is not found, using the `First` method does not generate an error. To generate an error, use the `FirstOrFail` method:

```go
var user models.User
err := facades.Orm().Query().FirstOrFail(&user)
// err == orm.ErrRecordNotFound
```

### Where

```go
facades.Orm().Query().Where("name", "tom")
facades.Orm().Query().Where("name = 'tom'")
facades.Orm().Query().Where("name = ?", "tom")

facades.Orm().Query().OrWhere("name = ?", "tom")
```

### Limit

```go
var users []models.User
facades.Orm().Query().Where("name = ?", "tom").Limit(3).Get(&users)
// SELECT * FROM `users` WHERE name = 'tom' LIMIT 3;
```

### Offset

```go
var users []models.User
facades.Orm().Query().Where("name = ?", "tom").Offset(5).Limit(3).Get(&users)
// SELECT * FROM `users` WHERE name = 'tom' LIMIT 3 OFFSET 5;
```

### Order

```go
var users []models.User
facades.Orm().Query().Where("name = ?", "tom").Order("sort asc").Order("id desc").Get(&users)
// SELECT * FROM `users` WHERE name = 'tom' ORDER BY sort asc,id desc;
```

### Paginate

```go
var users []models.User
var total int64
facades.Orm().Query().Paginate(1, 10, &users, &total)
// SELECT count(*) FROM `users`;
// SELECT * FROM `users` LIMIT 10;
```

### Query Single Column

```go
var ages []int64
facades.Orm().Query().Model(&models.User{}).Pluck("age", &ages)
// SELECT `age` FROM `users`;
```

### Specify Table Query

If you want to query some aggregate data, you need to specify a specific table.

Specify a model

```go
var count int64
facades.Orm().Query().Model(&models.User{}).Count(&count)
// SELECT count(*) FROM `users` WHERE deleted_at IS NULL;
```

Specify a table

```go
var count int
facades.Orm().Query().Table("users").Count(&count)
// SELECT count(*) FROM `users`; // get all records, whether deleted or not
```

### Count

```go
var count int64
facades.Orm().Query().Table("users").Where("name = ?", "tom").Count(&count)
// SELECT count(*) FROM `users` WHERE name = 'tom';
```

### Specify Fields

`Select` allows you to specify which fields to retrieve from the database, by default the ORM retrieves all fields.

```go
facades.Orm().Query().Select("name", "age").Get(&users)
// SELECT `name`,age FROM `users`;

facades.Orm().Query().Select([]string{"name", "age"}).Get(&users)
// SELECT `name`,age FROM `users`;
```

### Group By & Having

```go
type Result struct {
  Name  string
  Total int
}

var result Result
facades.Orm().Query().Model(&models.User{}).Select("name, sum(age) as total").Group("name").Having("name = ?", "tom").Get(&result)
// SELECT name, sum(age) as total FROM `users` GROUP BY `name` HAVING name = "tom";
```

### Join

```go
type Result struct {
  Name  string
  Email string
}

var result Result
facades.Orm().Query().Model(&models.User{}).Select("users.name, emails.email").Join("left join emails on emails.user_id = users.id").Scan(&result)
// SELECT users.name, emails.email FROM `users` LEFT JOIN emails ON emails.user_id = users.id;
```

### Create

```go
user := models.User{Name: "tom", Age: 18}
result := facades.Orm().Query().Create(&user)
// INSERT INTO users (name, age, created_at, updated_at) VALUES ("tom", 18, "2022-09-27 22:00:00", "2022-09-27 22:00:00");
```

### Multiple create

```go
users := []models.User{{Name: "tom", Age: 18}, {Name: "tim", Age: 19}}
result := facades.Orm().Query().Create(&users)
```

> `created_at` and `updated_at` will be filled automatically.

### Cursor

Can be used to significantly reduce your application's memory consumption when iterating through tens of thousands of Eloquent model records. Note, the `Cursor` method can be used with `With` at the same time, please use [Lazy Eager Loading](./relationships.md#lazy-eager-loading) to load relationship in the `for` logic.

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
  fmt.Println(user)
}
```

### Save Model

#### Update an existing model

```go
var user models.User
facades.Orm().Query().First(&user)

user.Name = "tom"
user.Age = 100
facades.Orm().Query().Save(&user)
// UPDATE `users` SET `created_at`='2023-09-14 16:03:29.454',`updated_at`='2023-09-18 21:05:59.896',`name`='tom',`age`=100,`avatar`='' WHERE `id` = 1;
```

#### Update columns

```go
facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Update("name", "hello")
// UPDATE `users` SET `name`='hello',`updated_at`='2023-09-18 21:06:30.373' WHERE `name` = 'tom';

facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Update(models.User{Name: "hello", Age: 18})
// UPDATE `users` SET `updated_at`='2023-09-18 21:07:06.489',`name`='hello',`age`=18 WHERE `name` = 'tom';
```

> When updating with `struct`, Orm will only update non-zero fields. You might want to use `map` to update attributes or use `Select` to specify fields to update. Note that `struct` can only be `Model`, if you want to update with non `Model`, you need to use `.Table("users")`, however, the `updated_at` field cannot be updated automatically at this time.

#### Update or create

Query by `name`, if not exist, create by `name`, `avatar`, if exists, update `avatar` based on `name`:

```go
facades.Orm().Query().UpdateOrCreate(&user, models.User{Name: "name"}, models.User{Avatar: "avatar"})
// SELECT * FROM `users` WHERE `users`.`name` = 'name' AND `users`.`deleted_at` IS NULL ORDER BY `users`.`id` LIMIT 1;
// INSERT INTO `users` (`created_at`,`updated_at`,`deleted_at`,`name`,`avatar`) VALUES ('2023-03-11 10:11:08.869','2023-03-11 10:11:08.869',NULL,'name','avatar');
// UPDATE `users` SET `name`='name',avatar`='avatar',`updated_at`='2023-03-11 10:11:08.881' WHERE users`.`deleted_at` IS NULL AND `id` = 1;
```
### Delete

Delete by model, the number of rows affected by the statement is returned by the method:

```go
var user models.User
facades.Orm().Query().Find(&user, 1)
res, err := facades.Orm().Query().Delete(&user)
// DELETE FROM `users` WHERE `users`.`id` = 1;

num := res.RowsAffected
```

Delete by ID

```go
facades.Orm().Query().Delete(&models.User{}, 10)
// DELETE FROM `users` WHERE `users`.`id` = 10;

facades.Orm().Query().Delete(&models.User{}, []int{1, 2, 3})
// DELETE FROM `users` WHERE `users`.`id` IN (1,2,3);
```

Multiple delete

```go
facades.Orm().Query().Where("name = ?", "tom").Delete(&models.User{})
// DELETE FROM `users` WHERE name = 'tom';
```

Want to force delete a soft-delete data.

```go
facades.Orm().Query().Where("name = ?", "tom").ForceDelete(&models.User{})
```

You can delete records with model associations via `Select`:

```go
// Delete Account of user when deleting user
facades.Orm().Query().Select("Account").Delete(&user)

// Delete Orders and CreditCards of user when deleting user
facades.Orm().Query().Select("Orders", "CreditCards").Delete(&user)

// Delete all child associations of user when deleting user
facades.Orm().Query().Select(orm.Associations).Delete(&user)

// Delete all Account of users when deleting users
facades.Orm().Query().Select("Account").Delete(&users)
```

Note: The associations will be deleted only if the primary key of the record is not empty, and Orm uses these primary keys as conditions to delete associated records:

```go
// Delete user that name='jinzhu', but don't delete account of user
facades.Orm().Query().Select("Account").Where("name = ?", "jinzhu").Delete(&models.User{})

// Delete user that name='jinzhu' and id = 1, and delete account of user
facades.Orm().Query().Select("Account").Where("name = ?", "jinzhu").Delete(&models.User{ID: 1})

// Delete user that id = 1 and delete account of that user
facades.Orm().Query().Select("Account").Delete(&models.User{ID: 1})
```

If execute batch delete without any conditions, ORM doesn't do that and returns an error. So you have to add some conditions, or use native SQL.

### Query Soft Delete Data

```go
var user models.User
facades.Orm().Query().WithTrashed().First(&user)
```

### Filter Repetition

```go
var users []models.User
facades.Orm().Query().Distinct("name").Find(&users)
```

### Get Driver

```go
driver := facades.Orm().Query().Driver()

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
facades.Orm().Query().Raw("SELECT id, name, age FROM users WHERE name = ?", "tom").Scan(&result)
```

### Execute Native Update SQL

The number of rows affected by the statement is returned by the method:

```go
res, err := facades.Orm().Query().Exec("DROP TABLE users")
// DROP TABLE `users`;

num := res.RowsAffected
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

return facades.Orm().Transaction(func(tx orm.Transaction) error {
  var user models.User

  return tx.Find(&user, user.ID)
})
```

You can also manually control the flow of the transaction yourself:

```go
tx, err := facades.Orm().Query().Begin()
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

facades.Orm().Query().Scopes(scopes.Paginator(page, limit)).Find(&entries)
```

### Raw Expressions

You can use the `db.Raw` method to update fields:

```go
import "github.com/goravel/framework/database/db"

facades.Orm().Query().Model(&user).Update("age", db.Raw("age - ?", 1))
// UPDATE `users` SET `age`=age - 1,`updated_at`='2023-09-14 14:03:20.899' WHERE `users`.`deleted_at` IS NULL AND `id` = 1;
```

### Pessimistic Locking

The query builder also includes a few functions to help you achieve "pessimistic locking" when executing your `select` statements. 

To execute a statement with a "shared lock", you may call the `SharedLock` method. A shared lock prevents the selected rows from being modified until your transaction is committed:

```go
var users []models.User
facades.Orm().Query().Where("votes", ">", 100).SharedLock().Get(&users)
```

Alternatively, you may use the `LockForUpdate` method. A "for update" lock prevents the selected records from being modified or from being selected with another shared lock:

```go
var users []models.User
facades.Orm().Query().Where("votes", ">", 100).LockForUpdate().Get(&users)
```

### Sum

```go
var sum int
if err := facades.Orm().Query().Model(models.User{}).Sum("id", &sum); err != nil {
  return err
}
fmt.Println(sum)
```

## Events

Orm models dispatch several events, allowing you to hook into the following moments in a model's lifecycle: `Retrieved`, `Creating`, `Created`, `Updating`, `Updated`, `Saving`, `Saved`, `Deleting`, `Deleted`, `ForceDeleting`, `ForceDeleted`.

The `Retrieved` event will dispatch when an existing model is retrieved from the database. When a new model is saved for the first time, the `Creating` and `Created` events will dispatch. The `Updating` / `Updated` events will dispatch when an existing model is modified and the `Save` method is called. The `Saving` / `Saved` events will dispatch when a model is created or updated - even if the model's attributes have not been changed. Event names ending with `-ing` are dispatched before any changes to the model are persisted, while events ending with `-ed` are dispatched after the changes to the model are persisted.

To start listening to model events, define a `DispatchesEvents` method on your model. This property maps various points of the model's lifecycle to your own event classes.

```go
import (
  contractsorm "github.com/goravel/framework/contracts/database/orm"
	"github.com/goravel/framework/database/orm"
)

type User struct {
	orm.Model
	Name    string
}

func (u *User) DispatchesEvents() map[contractsorm.EventType]func(contractsorm.Event) error {
	return map[contractsorm.EventType]func(contractsorm.Event) error{
		contractsorm.EventCreating: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventCreated: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventSaving: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventSaved: func(event contractsorm.Event) error {
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
		contractsorm.EventForceDeleting: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventForceDeleted: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventRetrieved: func(event contractsorm.Event) error {
			return nil
		},
	}
}
```

> Note: Just register the events you need. Model events are not dispatched when doing batch operations through Orm.

### Observers

#### Defining Observers

If you are listening to many events on a given model, you may use observers to group all of your listeners into a single class. Observer classes have method names that reflect the Eloquent events you wish to listen for. Each of these methods receives the affected model as their only argument. The `make:observer` Artisan command is the easiest way to create a new observer class:

```shell
go run . artisan make:observer UserObserver
go run . artisan make:observer user/UserObserver
```

This command will place the new observer in your `app/observers` directory. If this directory does not exist, Artisan will create it for you. Your fresh observer will look like the following:

```go
package observers

import (
	"fmt"

	"github.com/goravel/framework/contracts/database/orm"
)

type UserObserver struct{}

func (u *UserObserver) Retrieved(event orm.Event) error {
	return nil
}

func (u *UserObserver) Creating(event orm.Event) error {
	return nil
}

func (u *UserObserver) Created(event orm.Event) error {
	return nil
}

func (u *UserObserver) Updating(event orm.Event) error {
	return nil
}

func (u *UserObserver) Updated(event orm.Event) error {
	return nil
}

func (u *UserObserver) Saving(event orm.Event) error {
	return nil
}

func (u *UserObserver) Saved(event orm.Event) error {
	return nil
}

func (u *UserObserver) Deleting(event orm.Event) error {
	return nil
}

func (u *UserObserver) Deleted(event orm.Event) error {
	return nil
}

func (u *UserObserver) ForceDeleting(event orm.Event) error {
	return nil
}

func (u *UserObserver) ForceDeleted(event orm.Event) error {
	return nil
}
```

To register an observer, you need to call the `Observe` method on the model you wish to observe. You may register observers in the `Boot` method of your application's `app/providers/event_service_provider.go::Boot` service provider:

```go
package providers

import (
	"github.com/goravel/framework/facades"

	"goravel/app/models"
	"goravel/app/observers"
)

type EventServiceProvider struct {
}

func (receiver *EventServiceProvider) Register(app foundation.Application) {
	facades.Event().Register(receiver.listen())
}

func (receiver *EventServiceProvider) Boot(app foundation.Application) {
	facades.Orm().Observe(models.User{}, &observers.UserObserver{})
}

func (receiver *EventServiceProvider) listen() map[event.Event][]event.Listener {
	return map[event.Event][]event.Listener{}
}
```

> Note: If you set `DispatchesEvents` and `Observer` at the same time, only `DispatchesEvents` will be applied.

#### Parameter in Observer

The `event` parameter will be passed to all observers:

| Method   | Action                                                |
| -------- | ------------------------------------------------------- |
| Context  | Get context that passed by `facades.Orm().WithContext()` |
| GetAttribute  | Get the modified value, if not modified, get the original value, if there is no original value, return nil |
| GetOriginal  | Get the original value, if there is no original value, return nil |
| IsDirty  | Determine whether the field is modified |
| IsClean  | IsDirty reverse   |
| Query  | Get a new Query, which can be used with transaction |
| SetAttribute  | Set a new value for a field |

### Muting Events

You may occasionally need to temporarily "mute" all events fired by a model. You may achieve this using the `WithoutEvents` method:

```go
var user models.User
facades.Orm().Query().WithoutEvents().Find(&user, 1)
```

#### Saving A Single Model Without Events

Sometimes you may wish to "save" a given model without dispatching any events. You may accomplish this with the `SaveQuietly` method:

```go
var user models.User
err := facades.Orm().Query().FindOrFail(&user, 1)
user.Name = "Goravel"
err := facades.Orm().Query().SaveQuietly(&user)
```

<CommentService/>
