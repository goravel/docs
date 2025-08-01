# Getting Started

[[toc]]

## Introduction

Goravel provides a very simple and easy-to-use database interaction, developers can use `facades.Orm()` to operate. Please refer to [Configure Database](../database/getting-started) before starting.

## Model Definition

To create a custom model, refer to the model file `app/models/user.go` that is included in the framework. The `struct` in `app/models/user.go` contains two embedded frameworks: `orm.Model` and `orm.SoftDeletes`. These frameworks define `id`, `created_at`, `updated_at`, and `deleted_at` properties respectively. With `orm.SoftDeletes`, you can enable soft deletion for the model.

### Model Convention

1. The model is named with a big hump;
2. Use the plural form of the model "snake naming" as the table name;

For example, the model name is `UserOrder`, and the table name is `user_orders`.

### Create Model

Use the `make:model` command to create a model:

```shell
go run . artisan make:model User
go run . artisan make:model user/User
```

Created model file is located in `app/models/user.go` file, the content is as follows:

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
```

If you want to set the model field to `any`, you need to add an additional Tag: `gorm:"type:text"`:

```go
type User struct {
  orm.Model
  Name   string
  Avatar string
  Detail any `gorm:"type:text"`
  orm.SoftDeletes
}
```

More Tag usage details can be found at: https://gorm.io/docs/models.html.

#### Create Model based on data table

```shell
./artisan make:model --table=users User

// If the Model already exists, you can use the -f option to force overwrite
./artisan make:model --table=users -f User
```

If the data table has a field type that the framework cannot recognize, you can call the `facades.Schema().Extend` method to extend the field type in the `Boot` method of the `app/providers/database_service_provider.go` file:

```go
import "github.com/goravel/framework/contracts/schema"

facades.Schema().Extend(&schema.Extension{
  GoTypes: []schema.GoType{
    {
        Pattern: "uuid",
        Type: "uuid.UUID",
        NullType: "uuid.NullUUID",
        Imports: []string{"github.com/google/uuid"},
    },
    {
        Pattern: "point",
        Type: "geom.Point",
        NullType: "*geom.Point",
        Imports: []string{"github.com/twpayne/go-geom"},
    },
  },
})
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

By default, all models utilize the default database connection configured for your application. If you wish to specify a distinct connection to be used when interacting with a particular model, you need to define a `Connection` method on the model.

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
  return "postgres"
}
```

### Setting Global Scope

Model supports setting the `GlobalScope` method, which restricts the scope of the query, update, and delete operations:

```go
import "github.com/goravel/framework/contracts/orm"

type User struct {
  orm.Model
  Name string
}

func (r *User) GlobalScopes() []func(orm.Query) orm.Query {
  return []func(orm.Query) orm.Query{
    func(query orm.Query) orm.Query {
      return query.Where("name", "goravel")
    },
  }
}
```

## facades.Orm() available functions

| 方法名      | 作用                                      |
| ----------- | ----------------------------------------- |
| Connection  | [指定数据库链接](#指定数据库链接)         |
| DB          | [获取通用数据库接口](#获取通用数据库接口) |
| Query       | [获取数据库实例](#获取数据库实例)         |
| Transaction | [事务](#事务)                             |
| WithContext | [注入 Context](#注入-Context)             |

## facades.Orm().Query() available functions

| Functions                   | 作用                                              |
| --------------------------- | ------------------------------------------------- |
| BeginTransaction            | [手动开始事务](#事务)                             |
| Commit                      | [提交事务](#事务)                                 |
| Count                       | [Count](#count)                                   |
| Create                      | [创建数据](#创建)                                 |
| Cursor                      | [游标](#游标)                                     |
| Delete                      | [删除数据](#删除)                                 |
| Distinct                    | [过滤重复](#过滤重复)                             |
| Driver                      | [获取当前驱动](#获取当前驱动)                     |
| Exec                        | [执行原生更新 SQL](#执行原生更新-sql)             |
| Exists                      | [Exists](#exists)                                 |
| Find                        | [查询一条或多条数据](#根据-id-查询单条或多条数据) |
| FindOrFail                  | [未找到时抛出错误](#未找到时抛出错误)             |
| First                       | [Query one line](#query-one-line)                 |
| FirstOr                     | [查询或通过回调返回一条数据](#查询一条数据)       |
| FirstOrCreate               | [查询或创建模型](#查询或创建模型)                 |
| FirstOrNew                  | [查询或实例化模型](#查询或创建模型)               |
| FirstOrFail                 | [未找到时抛出错误](#未找到时抛出错误)             |
| ForceDelete                 | [强制删除](#删除)                                 |
| Get                         | [查询多条数据](#查询多条数据)                     |
| Group                       | [Group 查询](#group-by-having)                    |
| Having                      | [Having 查询](#group-by-having)                   |
| Join                        | [Join 查询](#join-查询)                           |
| Limit                       | [Limit](#limit)                                   |
| LockForUpdate               | [悲观锁](#悲观锁)                                 |
| Model                       | [指定模型](#指定表查询)                           |
| Offset                      | [Offset](#offset)                                 |
| Order                       | [排序](#排序)                                     |
| OrderBy                     | [排序](#排序)                                     |
| OrderByDesc                 | [排序](#排序)                                     |
| InRandomOrder               | [排序](#排序)                                     |
| OrWhere                     | [OrWhere](#where)                                 |
| OrWhereNotIn                | [OrWhereNotIn](#where)                            |
| OrWhereNull                 | [OrWhereNull](#where)                             |
| OrWhereIn                   | [OrWhereIn](#where)                               |
| OrWhereJsonContains         | [查询条件](#where-条件)                           |
| OrWhereJsonContainsKey      | [查询条件](#where-条件)                           |
| OrWhereJsonDoesntContain    | [查询条件](#where-条件)                           |
| OrWhereJsonDoesntContainKey | [查询条件](#where-条件)                           |
| OrWhereJsonLength           | [查询条件](#where-条件)                           |
| Paginate                    | [分页](#分页)                                     |
| Pluck                       | [查询单列](#查询单列)                             |
| Raw                         | [执行原生查询 SQL](#执行原生查询-sql)             |
| Restore                     | [恢复软删除](#恢复软删除)                         |
| Rollback                    | [手动回滚事务](#事务)                             |
| Save                        | [保存修改](#在现有模型基础上进行更新)             |
| SaveQuietly                 | [静默的保存单个模型](#静默的保存单个模型)         |
| Scan                        | [将数据解析到 struct](#执行原生查询-sql)          |
| Scopes                      | [Scopes](#scopes)                                 |
| Select                      | [Specify Fields](#specify-fields)                 |
| SharedLock                  | [悲观锁](#悲观锁)                                 |
| Sum                         | [Sum](#sum)                                       |
| Table                       | [指定表](#指定表查询)                             |
| ToSql                       | [获取 SQL](#获取-sql)                             |
| ToRawSql                    | [获取 SQL](#获取-sql)                             |
| Update                      | [更新单个字段](#更新)                             |
| UpdateOrCreate              | [更新或创建一条数据](#更新或创建一条数据)         |
| Where                       | [Where](#where)                                   |
| WhereBetween                | [WhereBetween](#where)                            |
| WhereNotBetween             | [WhereNotBetween](#where)                         |
| WhereNotIn                  | [WhereNotIn](#where)                              |
| WhereNull                   | [WhereNull](#where)                               |
| WhereIn                     | [WhereIn](#where)                                 |
| WhereJsonContains           | [查询条件](#where-条件)                           |
| WhereJsonContainsKey        | [查询条件](#where-条件)                           |
| WhereJsonDoesntContain      | [查询条件](#where-条件)                           |
| WhereJsonDoesntContainKey   | [查询条件](#where-条件)                           |
| WhereJsonLength             | [查询条件](#where-条件)                           |
| WithoutEvents               | [静默事件](#静默事件)                             |
| WithTrashed                 | [查询软删除](#查询软删除)                         |

## Query Builder

### Inject Context

```go
facades.Orm().WithContext(ctx)
```

### Specify Database Connection

If multiple database connections are defined in `config/database.go`, you can use them through the `Connection` function of `facades.Orm()`. The connection name passed to `Connection` should be one of the connections configured in `config/database.go`:

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

Sometimes you may wish to perform some other action if no results are found. The `FirstOr` method will return a single model instance or, if no results are found, execute the given closure. You can set values to model in closure:

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

The `FirstOrCreate` method searches for a database record using the specified column/value pairs. If the model cannot be found in the database, it creates a new record with the attributes from merging the first argument with the optional second argument.

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

When the requested item is not found, the `First` method does not generate an error. To generate an error, use the `FirstOrFail` method:

```go
var user models.User
err := facades.Orm().Query().FirstOrFail(&user)

// import "github.com/goravel/framework/errors"
// if errors.Is(err, errors.OrmRecordNotFound) {}
```

### Where

```go
facades.Orm().Query().Where("name", "tom")
facades.Orm().Query().Where("name = 'tom'")
facades.Orm().Query().Where("name = ?", "tom")
facades.Orm().Query().Where("name", "tom").Where(func(query orm.Query) orm.Query {
  return query.Where("height", 180).Where("age", 18)
})

facades.Orm().Query().WhereBetween("age", 1, 10)
facades.Orm().Query().WhereNotBetween("age", 1, 10)
facades.Orm().Query().WhereNotIn("name", []any{"a"})
facades.Orm().Query().WhereNull("name")
facades.Orm().Query().WhereIn("name", []any{"a"})

facades.Orm().Query().OrWhere("name", "tom")
facades.Orm().Query().OrWhereNotIn("name", []any{"a"})
facades.Orm().Query().OrWhereNull("name")
facades.Orm().Query().OrWhereIn("name", []any{"a"})
```

Query JSON columns

```go
facades.Orm().Query().Where("preferences->dining->meal", "salad").First(&user)
facades.Orm().Query().Where("options->languages[0]", "en").First(&user)
facades.Orm().Query().WhereJsonContainsKey("contacts->personal->email").First(&user)
facades.Orm().Query().WhereJsonDoesntContainKey("contacts->personal->email").First(&user)
facades.Orm().Query().WhereJsonContains("options->languages", "en").First(&user)
facades.Orm().Query().WhereJsonContains("options->languages", []string{"en", "de"}).First(&user)
facades.Orm().Query().WhereJsonDoesntContain("options->languages", "en").First(&user)
facades.Orm().Query().WhereJsonDoesntContain("options->languages", []string{"en", "de"}).First(&user)
facades.Orm().Query().WhereJsonLength('options->languages', 1).First(&user)
facades.Orm().Query().WhereJsonLength('options->languages > ?', 1).First(&user)

facades.Orm().Query().OrWhere("preferences->dining->meal", "salad").First(&user)
facades.Orm().Query().OrWhere("options->languages[0]", "en").First(&user)
facades.Orm().Query().OrWhereJsonContainsKey("contacts->personal->email").First(&user)
facades.Orm().Query().OrWhereJsonDoesntContainKey("contacts->personal->email").First(&user)
facades.Orm().Query().OrWhereJsonContains("options->languages", "en").First(&user)
facades.Orm().Query().OrWhereJsonContains("options->languages", []string{"en", "de"}).First(&user)
facades.Orm().Query().OrWhereJsonDoesntContain("options->languages", "en").First(&user)
facades.Orm().Query().OrWhereJsonDoesntContain("options->languages", []string{"en", "de"}).First(&user)
facades.Orm().Query().OrWhereJsonLength('options->languages', 1).First(&user)
facades.Orm().Query().OrWhereJsonLength('options->languages > ?', 1).First(&user)
```

### Limit

```go
var users []models.User
facades.Orm().Query().Where("name", "tom").Limit(3).Get(&users)
// SELECT * FROM `users` WHERE name = 'tom' LIMIT 3;
```

### Offset

```go
var users []models.User
facades.Orm().Query().Where("name", "tom").Offset(5).Limit(3).Get(&users)
// SELECT * FROM `users` WHERE name = 'tom' LIMIT 3 OFFSET 5;
```

### Order

```go
var users []models.User
facades.Orm().Query().Where("name", "tom").Order("sort asc").Order("id desc").Get(&users)
// SELECT * FROM `users` WHERE name = 'tom' ORDER BY sort asc,id desc;

facades.Orm().Query().Where("name", "tom").OrderBy("sort").Get(&users)
// SELECT * FROM `users` WHERE name = 'tom' ORDER BY sort asc;

facades.Orm().Query().Where("name", "tom").OrderByDesc("sort").Get(&users)
// SELECT * FROM `users` WHERE name = 'tom' ORDER BY sort desc;

facades.Orm().Query().Where("name", "tom").InRandomOrder().Get(&users)
// SELECT * FROM `users` WHERE name = 'tom' ORDER BY RAND();
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
count, err := facades.Orm().Query().Model(&models.User{}).Count()
// SELECT count(*) FROM `users` WHERE deleted_at IS NULL;
```

Specify a table

```go
count, err := facades.Orm().Query().Table("users").Count()
// SELECT count(*) FROM `users`; // get all records, whether deleted or not
```

### Get SQL

Get SQL with placeholder:

```go
facades.Orm().Query().ToSql().Get(models.User{})
// SELECT * FROM "users" WHERE "id" = $1 AND "users"."deleted_at" IS NULL
```

Get SQL with value:

```go
facades.Orm().Query().ToRawSql().Get(models.User{})
// SELECT * FROM "users" WHERE "id" = 1 AND "users"."deleted_at" IS NULL
```

The methods can be called after `ToSql` and `ToRawSql`: `Count`, `Create`, `Delete`, `Find`, `First`, `Get`, `Pluck`, `Save`, `Sum`, `Update`.

### Count

```go
count, err := facades.Orm().Query().Table("users").Count()
// SELECT count(*) FROM `users` WHERE name = 'tom';
```

### Specify Fields

`Select` allows you to specify which fields to retrieve from the database, by default the ORM retrieves all fields.

```go
facades.Orm().Query().Select("name", "age").Get(&users)
// SELECT `name`,`age` FROM `users`;
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
err := facades.Orm().Query().Create(&user)
// INSERT INTO users (name, age, created_at, updated_at) VALUES ("tom", 18, "2022-09-27 22:00:00", "2022-09-27 22:00:00");

// Not trigger model events
err := facades.Orm().Query().Table("users").Create(map[string]any{
  "name": "Goravel",
})

// Trigger model events
err := facades.Orm().Query().Model(&models.User{}).Create(map[string]any{
  "name": "Goravel",
})
```

### Multiple create

```go
users := []models.User{{Name: "tom", Age: 18}, {Name: "tim", Age: 19}}
err := facades.Orm().Query().Create(&users)

err := facades.Orm().Query().Table("users").Create(&[]map[string]any{
  {"name": "Goravel"},
  {"name": "Framework"},
})

err := facades.Orm().Query().Model(&models.User{}).Create(&[]map[string]any{
  {"name": "Goravel"},
  {"name": "Framework"},
})
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
facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Update(map[string]any{"name": "hello", "age": 18})
// UPDATE `users` SET `updated_at`='2023-09-18 21:07:06.489',`name`='hello',`age`=18 WHERE `name` = 'tom';
```

> When updating with `struct`, Orm will only update non-zero fields. You might want to use `map` to update attributes or use `Select` to specify fields to update. Note that `struct` can only be `Model`, if you want to update with non `Model`, you need to use `.Table("users")`, however, the `updated_at` field cannot be updated automatically at this time.

#### Update JSON fields

```go
facades.Orm().Query().Model(&models.User{}).Where("id", 1).Update("options->enabled", true)
facades.Orm().Query().Model(&models.User{}).Where("id", 1).Update("options->languages[0]", "en")
facades.Orm().Query().Model(&models.User{}).Where("id", 1).Update("options->languages", []string{"en", "de"})
facades.Orm().Query().Model(&models.User{}).Where("id", 1).Update(map[string]any{
    "preferences->dining->meal": "salad",
    "options->languages[0]":     "en",
    "options->enabled":          true,
})
```

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
res, err := facades.Orm().Query().Model(&models.User{}).Where("id", 1).Delete()
res, err := facades.Orm().Query().Table("users").Where("id", 1).Delete()
// DELETE FROM `users` WHERE `users`.`id` = 1;

num := res.RowsAffected
```

Multiple delete

```go
facades.Orm().Query().Where("name", "tom").Delete(&models.User{})
// DELETE FROM `users` WHERE name = 'tom';
```

Want to force delete a soft-delete data.

```go
facades.Orm().Query().Where("name", "tom").ForceDelete(&models.User{})
facades.Orm().Query().Model(&models.User{}).Where("name", "tom").ForceDelete()
facades.Orm().Query().Table("users").Where("name", "tom").ForceDelete()
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
// Delete user that name='goravel', but don't delete account of user
facades.Orm().Query().Select("Account").Where("name", "goravel").Delete(&models.User{})

// Delete user that name='goravel' and id = 1, and delete account of user
facades.Orm().Query().Select("Account").Where("name", "goravel").Delete(&models.User{ID: 1})

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

### Exists

```go
exists, err := facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Exists()
```

### Restore

```go
facades.Orm().Query().WithTrashed().Restore(&models.User{ID: 1})
facades.Orm().Query().Model(&models.User{ID: 1}).WithTrashed().Restore()
// UPDATE `users` SET `deleted_at`=NULL WHERE `id` = 1;
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

return facades.Orm().Transaction(func(tx orm.Query) error {
  var user models.User

  return tx.Find(&user, user.ID)
})
```

You can also manually control the flow of the transaction yourself:

```go
tx, err := facades.Orm().Query().BeginTransaction()
user := models.User{Name: "Goravel"}
if err := tx.Create(&user); err != nil {
  err := tx.Rollback()
} else {
  err := tx.Commit()
}
```

### Scopes

Allows you to specify commonly used queries that can be referenced when method are called.

```go
func Paginator(page string, limit string) func(methods orm.Query) orm.Query {
  return func(query orm.Query) orm.Query {
    page, _ := strconv.Atoi(page)
    limit, _ := strconv.Atoi(limit)
    offset := (page - 1) * limit

    return query.Offset(offset).Limit(limit)
  }
}

// scopes.Paginator is a custom function: func(ormcontract.Query) ormcontract.Query
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
sum, err := facades.Orm().Query().Model(models.User{}).Sum("id")
```

## Events

Orm models dispatch several events, allowing you to hook into the following moments in a model's lifecycle: `Retrieved`, `Creating`, `Created`, `Updating`, `Updated`, `Saving`, `Saved`, `Deleting`, `Deleted`, `ForceDeleting`, `ForceDeleted`, `Restored`, `Restoring`.

The `Retrieved` event will dispatch when an existing model is retrieved from the database. When a new model is saved for the first time, the `Creating` and `Created` events will dispatch. The `Updating` / `Updated` events will dispatch when an existing model is modified and the `Save` method is called. The `Saving` / `Saved` events will dispatch when a model is created or updated - even if the model's attributes have not been changed. Event names ending with `-ing` are dispatched before any changes to the model are persisted, while events ending with `-ed` are dispatched after the changes to the model are persisted.

要开始监听模型事件，请在模型上定义一个 `DispatchesEvents` 方法。此方法将模型生命周期的各个点映射到您定义的事件类中。

注意：所有事件都只会在操作一个模型时触发。例如在调用 `Update` 方法时，想要触发 `Updating` 和 `Updated` 事件，需要将现有模型传入到 `Model` 方法中：`facades.Orm().Query().Model(&user).Update("name", "Goravel")`。

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
		contractsorm.EventRestored: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventRestoring: func(event contractsorm.Event) error {
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

func (u *UserObserver) Created(event orm.Event) error {
	return nil
}

func (u *UserObserver) Updated(event orm.Event) error {
	return nil
}

func (u *UserObserver) Deleted(event orm.Event) error {
	return nil
}

func (u *UserObserver) ForceDeleted(event orm.Event) error {
	return nil
}
```

The template observer only contains some events, you can add other events according to your needs.

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

| 方法名       | 作用                                                       |
| ------------ | ---------------------------------------------------------- |
| Context      | 获取 `facades.Orm().WithContext()` 传入的 context          |
| GetAttribute | 获取修改的值，如未修改，获取原始值，如没有原始值，返回 nil |
| GetOriginal  | 获取原始值，如没有原始值，返回 nil                         |
| IsDirty      | 判断字段是否修改                                           |
| IsClean      | IsDirty 取反                                               |
| Query        | 获取一个新的 Query，可以配合事务使用                       |
| SetAttribute | 为字段设置一个新值                                         |

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
