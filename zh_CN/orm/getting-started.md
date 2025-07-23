# Getting Started

[[toc]]

## 简介

Goravel 提供了一套非常简单易用的数据库交互方式，开发者可以使用 `facades.Orm()` 进行操作。在开始之前请先[配置数据库](../database/getting-started)。 Please refer to [Configure Database](../database/getting-started) before starting.

## 模型

To create a custom model, refer to the model file `app/models/user.go` that is included in the framework. 模型相当于数据表的映射，你可以根据框架自带的模型文件 `app/models/user.go` 创建自定义模型。在 `app/models/user.go` 文件中 `struct` 嵌套了 `orm.Model` 与 `orm.SoftDeletes` 两个框架自带结构体，他们分别定义了 `id, created_at, updated_at` 与 `deleted_at`，其中 `orm.SoftDeletes` 代表模型开启了软删除功能。 These frameworks define `id`, `created_at`, `updated_at`, and `deleted_at` properties respectively. 如果模型开启了软删除功能，想要强制删除某数据

### 模型约定

1. 模型使用大驼峰命名；
2. 使用模型的复数形式「蛇形命名」来作为表名；

例如，模型名称为 `UserOrder`，则表名为 `user_orders`。

### 创建模型

使用 `make:model` 命令创建模型：

```shell
go run . artisan make:model User
go run . artisan make:model user/User
```

创建的模型文件位于 `app/models/user.go` 文件中，内容如下：

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

如果你想将模型字段设置为 `any`, 需要额外添加一个 Tag: `gorm:"type:text"`:

```go
type User struct {
  orm.Model
  Name   string
  Avatar string
  Detail any `gorm:"type:text"`
  orm.SoftDeletes
}
```

更多 Tag 使用方法详见：https://gorm.io/docs/models.html。

#### 根据数据表创建模型

```shell
./artisan make:model --table=users User

// 如果 Model 已存在可以使用 -f 选项强制覆盖
./artisan make:model --table=users -f User
```

如果数据表中有字段类型框架无法识别，可以在 `app/providers/database_service_provider.go` 文件的 `Boot` 方法中调用 `facades.Schema().Extend` 方法扩展字段类型：

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

### 指定表名

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

### 数据库连接

默认情况下，所有模型使用的是应用程序配置的默认数据库连接。如果想指定在与特定模型交互时应该使用的不同连接，可以在模型上定义 `Connection` 方法： If you wish to specify a distinct connection to be used when interacting with a particular model, you need to define a `Connection` method on the model.

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

### 设置 Global Scope

Model 中支持设置 `GlobalScope` 方法，在查找、更新和删除操作时限制作用域：

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

## facades.Orm() 可用方法

| 方法名      | 作用                                      |
| ----------- | ----------------------------------------- |
| Connection  | [指定数据库链接](#指定数据库链接)         |
| DB          | [获取通用数据库接口](#获取通用数据库接口) |
| Query       | [获取数据库实例](#获取数据库实例)         |
| Transaction | [事务](#事务)                             |
| WithContext | [注入 Context](#注入-Context)             |

## facades.Orm().Query() 可用方法

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

## 查询构造器

### 注入 Context

```go
facades.Orm().WithContext(ctx)
```

### 指定数据库链接

如果你在配置文件 `config/database.go` 中定义了多个数据库连接，你可以通过 `facades.Orm()` 的 `Connection` 方法来使用它们。传递给 `Connection` 方法的连接名称应该是在 `config/database.go` 配置的连接之一： The connection name passed to `Connection` should be one of the connections configured in `config/database.go`:

```go
facades.Orm().Connection("mysql")
```

### 获取通用数据库接口

获取通用数据库对象 sql.DB，然后使用其提供的功能：

```go
db, err := facades.Orm().DB()
db, err := facades.Orm().Connection("mysql").DB()

// Ping
db.Ping()

// Close
db.Close()

// 返回数据库统计信息
db.Stats()

// SetMaxIdleConns 用于设置连接池中空闲连接的最大数量。
db.SetMaxIdleConns(10)

// SetMaxOpenConns 设置打开数据库连接的最大数量。
db.SetMaxOpenConns(100)

// SetConnMaxLifetime 设置了连接可复用的最大时间。
db.SetConnMaxLifetime(time.Hour)
```

### 获取数据库实例

每次进行具体数据库操作前，都需要先获取数据库的实例。

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

#### 根据 ID 查询单条或多条数据

```go
var user models.User
facades.Orm().Query().Find(&user, 1)
// SELECT * FROM `users` WHERE `users`.`id` = 1;

facades.Orm().Query().Find(&users, []int{1,2,3})
// SELECT * FROM `users` WHERE `users`.`id` IN (1,2,3);
```

#### 未找到时抛出错误

```go
var user models.User
err := facades.Orm().Query().FindOrFail(&user, 1)
```

#### 当用户表主键为 `string` 类型，调用 `Find` 方法时需要指定主键

```go
var user models.User
facades.Orm().Query().Find(&user, "uuid=?" ,"a")
// SELECT * FROM `users` WHERE `users`.`uuid` = "a";
```

#### 查询多条数据

```go
var users []models.User
facades.Orm().Query().Where("id in ?", []int{1,2,3}).Get(&users)
// SELECT * FROM `users` WHERE id in (1,2,3);
```

#### 查询或创建模型

The `FirstOrCreate` method searches for a database record using the specified column/value pairs. `FirstOrCreate` 方法将尝试使用给定的列 / 值对来查找数据库记录。如果在数据库中找不到该模型，则将插入一条记录，其中包含将第二个参数与可选的第三个参数合并后产生的属性：

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

#### 未找到时抛出错误

When the requested item is not found, the `First` method does not generate an error. 当找不到模型时，`First` 方法不会抛出错误，如果想抛出，可以使用 `FirstOrFail`：

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
facades.Orm().Query().OrWhereNUll("name")
facades.Orm().Query().OrWhereIn("name", []any{"a"})
```

JSON 字段查询

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

### 查询单列

```go
var ages []int64
facades.Orm().Query().Model(&models.User{}).Pluck("age", &ages)
// SELECT `age` FROM `users`;
```

### 指定表查询

如果想查询一些聚合数据，需要指定具体表。

使用模型指定

```go
count, err := facades.Orm().Query().Model(&models.User{}).Count()
// SELECT count(*) FROM `users` WHERE deleted_at IS NULL;
```

使用表名指定

```go
count, err := facades.Orm().Query().Table("users").Count()
// SELECT count(*) FROM `users`; // get all records, whether deleted or not
```

### 获取 SQL

带占位符的 SQL：

```go
facades.Orm().Query().ToSql().Get(models.User{})
// SELECT * FROM "users" WHERE "id" = $1 AND "users"."deleted_at" IS NULL
```

带绑定值的 SQL：

```go
facades.Orm().Query().ToRawSql().Get(models.User{})
// SELECT * FROM "users" WHERE "id" = 1 AND "users"."deleted_at" IS NULL
```

`ToSql` 与 `ToRawSql` 后可以调用的方法：`Count`, `Create`, `Delete`, `Find`, `First`, `Get`, `Pluck`, `Save`, `Sum`, `Update`。

### Count

```go
count, err := facades.Orm().Query().Table("users").Count()
// SELECT count(*) FROM `users` WHERE name = 'tom';
```

### Specify Fields

`Select` 允许你指定从数据库中检索哪些字段，默认情况下，ORM 会检索所有字段。

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

// 不触发模型事件
err := facades.Orm().Query().Table("users").Create(map[string]any{
  "name": "Goravel",
})

// 触发模型事件
err := facades.Orm().Query().Model(&models.User{}).Create(map[string]any{
  "name": "Goravel",
})
```

### 批量创建

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

> `created_at` 和 `updated_at` 字段将会被自动填充。

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

#### 在现有模型基础上进行更新

```go
var user models.User
facades.Orm().Query().First(&user)

user.Name = "tom"
user.Age = 100
facades.Orm().Query().Save(&user)
// UPDATE `users` SET `created_at`='2023-09-14 16:03:29.454',`updated_at`='2023-09-18 21:05:59.896',`name`='tom',`age`=100,`avatar`='' WHERE `id` = 1;
```

#### 更新

```go
facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Update("name", "hello")
// UPDATE `users` SET `name`='hello',`updated_at`='2023-09-18 21:06:30.373' WHERE `name` = 'tom';

facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Update(models.User{Name: "hello", Age: 18})
facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Update(map[string]any{"name": "hello", "age": 18})
// UPDATE `users` SET `updated_at`='2023-09-18 21:07:06.489',`name`='hello',`age`=18 WHERE `name` = 'tom';
```

> When updating with `struct`, Orm will only update non-zero fields. You might want to use `map` to update attributes or use `Select` to specify fields to update. 当使用 `struct` 进行批量更新时，Orm 只会更新非零值的字段。你可以使用 `map` 更新字段，或者使用 `Select` 指定要更新的字段。注意 `struct` 只能为 `Model`，如果想用非 `Model` 批量更新，需要使用 `.Table("users")`，但此时无法自动更新 `updated_at` 字段。

#### 更新 JSON 字段

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

#### 更新或创建一条数据

根据 `name` 查询，如果不存在，则根据 `name`, `avatar` 创建，如果存在，则根据 `name` 更新 `avatar`：

```go
facades.Orm().Query().UpdateOrCreate(&user, models.User{Name: "name"}, models.User{Avatar: "avatar"})
// SELECT * FROM `users` WHERE `users`.`name` = 'name' AND `users`.`deleted_at` IS NULL ORDER BY `users`.`id` LIMIT 1;
// INSERT INTO `users` (`created_at`,`updated_at`,`deleted_at`,`name`,`avatar`) VALUES ('2023-03-11 10:11:08.869','2023-03-11 10:11:08.869',NULL,'name','avatar');
// UPDATE `users` SET `name`='name',avatar`='avatar',`updated_at`='2023-03-11 10:11:08.881' WHERE users`.`deleted_at` IS NULL AND `id` = 1;
```

### Delete

根据模型删除，该方法将返回受影响的行数：

```go
var user models.User
err := facades.Orm().Query().Find(&user, 1)
res, err := facades.Orm().Query().Delete(&user)
res, err := facades.Orm().Query().Model(&models.User{}).Where("id", 1).Delete()
res, err := facades.Orm().Query().Table("users").Where("id", 1).Delete()
// DELETE FROM `users` WHERE `users`.`id` = 1;

num := res.RowsAffected
```

批量删除

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

您可以通过 `Select` 来删除具有模型关联的记录：

```go
// 删除 user 时，也删除 user 的 account
facades.Orm().Query().Select("Account").Delete(&user)

// 删除 user 时，也删除 user 的 Orders、CreditCards 记录
facades.Orm().Query().Select("Orders", "CreditCards").Delete(&user)

// 删除 user 时，也删除用户所有子关联
facades.Orm().Query().Select(orm.Associations).Delete(&user)

// 删除 users 时，也删除每一个 user 的 account
facades.Orm().Query().Select("Account").Delete(&users)
```

注意：只有当记录的主键不为空时，关联才会被删除，Orm 会使用这些主键作为条件来删除关联记录：

```go
// 会删除所有 name=`goravel` 的 user，但这些 user 的 account 不会被删除
facades.Orm().Query().Select("Account").Where("name", "goravel").Delete(&models.User{})

// 会删除 name = `goravel` 且 id = `1` 的 user，并且 user `1` 的 account 也会被删除
facades.Orm().Query().Select("Account").Where("name", "goravel").Delete(&models.User{ID: 1})

// 会删除 id = `1` 的 user，并且 account 也会被删除
facades.Orm().Query().Select("Account").Delete(&models.User{ID: 1})
```

如果在没有任何条件的情况下执行批量删除，ORM 不会执行该操作，并返回错误。对此，你必须加一些条件，或者使用原生 SQL。 So you have to add some conditions, or use native SQL.

### 查询软删除

```go
var user models.User
facades.Orm().Query().WithTrashed().First(&user)
```

### 过滤重复

```go
var users []models.User
facades.Orm().Query().Distinct("name").Find(&users)
```

### 获取当前驱动

```go
driver := facades.Orm().Query().Driver()

// 判断驱动
if driver == orm.DriverMysql {}
```

### 执行原生查询 SQL

```go
type Result struct {
  ID   int
  Name string
  Age  int
}

var result Result
facades.Orm().Query().Raw("SELECT id, name, age FROM users WHERE name = ?", "tom").Scan(&result)
```

### 执行原生更新 SQL

该方法将返回受影响的行数：

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

可以使用 `Transaction` 方法执行事务：

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

也可以自己手动控制事务的流程：

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

允许你指定常用的查询，可以在调用方法时引用这些查询。

```go
func Paginator(page string, limit string) func(methods orm.Query) orm.Query {
  return func(query orm.Query) orm.Query {
    page, _ := strconv.Atoi(page)
    limit, _ := strconv.Atoi(limit)
    offset := (page - 1) * limit

    return query.Offset(offset).Limit(limit)
  }
}

// scopes.Paginator 是一个自定义的 func(ormcontract.Query) ormcontract.Query
facades.Orm().Query().Scopes(scopes.Paginator(page, limit)).Find(&entries)
```

### 原生表达式

可以使用 `db.Raw` 方法进行字段的更新：

```go
import "github.com/goravel/framework/database/db"

facades.Orm().Query().Model(&user).Update("age", db.Raw("age - ?", 1))
// UPDATE `users` SET `age`=age - 1,`updated_at`='2023-09-14 14:03:20.899' WHERE `users`.`deleted_at` IS NULL AND `id` = 1;
```

### 悲观锁

查询构建器还包括一些函数，可帮助您在执行 `select` 语句时实现「悲观锁」。

To execute a statement with a "shared lock", you may call the `SharedLock` method. 您可以调用 `SharedLock` 方法使用「共享锁」执行语句，共享锁可防止选定的行被修改，直到您的事务被提交：

```go
var users []models.User
facades.Orm().Query().Where("votes", ">", 100).SharedLock().Get(&users)
```

Alternatively, you may use the `LockForUpdate` method. 或者，您可以使用 `LockForUpdate` 方法。该锁可防止所选记录被修改或被另一个共享锁选中：

```go
var users []models.User
facades.Orm().Query().Where("votes", ">", 100).LockForUpdate().Get(&users)
```

### Sum

```go
sum, err := facades.Orm().Query().Model(models.User{}).Sum("id")
```

## Events

Orm 模型触发几个事件，允许你挂接到模型生命周期的如下节点：`Retrieved`、`Creating`、`Created`、`Updating`、`Updated`、`Saving`、`Saved`、`Deleting`、`Deleted`、`ForceDeleting`、`ForceDeleted`、`Restored`、`Restoring`。

The `Retrieved` event will dispatch when an existing model is retrieved from the database. When a new model is saved for the first time, the `Creating` and `Created` events will dispatch. The `Updating` / `Updated` events will dispatch when an existing model is modified and the `Save` method is called. The `Saving` / `Saved` events will dispatch when a model is created or updated - even if the model's attributes have not been changed. Event names ending with `-ing` are dispatched before any changes to the model are persisted, while events ending with `-ed` are dispatched after the changes to the model are persisted.

注意：所有事件都只会在操作一个模型时触发。例如在调用 `Update` 方法时，想要触发 `Updating` 和 `Updated` 事件，需要将现有模型传入到 `Model` 方法中：`facades.Orm().Query().Model(&user).Update("name", "Goravel")`。

要开始监听模型事件，请在模型上定义一个 `DispatchesEvents` 方法。此方法将模型生命周期的各个点映射到您定义的事件类中。

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

> Note: Just register the events you need. 注意：仅注册用到的事件即可。通过 Orm 进行批量操作时，不会调度模型事件。

### 观察者

#### 定义观察者

If you are listening to many events on a given model, you may use observers to group all of your listeners into a single class. Observer classes have method names that reflect the Eloquent events you wish to listen for. Each of these methods receives the affected model as their only argument. The `make:observer` Artisan command is the easiest way to create a new observer class:

```shell
go run . artisan make:observer UserObserver
go run . artisan make:observer user/UserObserver
```

此命令将在 `app/observers` 文件夹放置新的观察者类。如果这个目录不存在，Artisan 将替您创建： If this directory does not exist, Artisan will create it for you. Your fresh observer will look like the following:

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

模版中仅包含部分事件，可以根据需要手动添加其他事件。

To register an observer, you need to call the `Observe` method on the model you wish to observe. 要注册观察者，需要将观察者与要观察的模型绑定。您可以在 `app/providers/event_service_provider.go::Boot` 方法中注册观察者：

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

> 注意：如果同时使用了 `DispatchesEvents` 与 `Observer`，将只应用 `DispatchesEvents`。

#### Parameter in Observer

所有的事件默认传入 `event` 参数，包含以下方法：

| 方法名       | 作用                                                       |
| ------------ | ---------------------------------------------------------- |
| Context      | 获取 `facades.Orm().WithContext()` 传入的 context          |
| GetAttribute | 获取修改的值，如未修改，获取原始值，如没有原始值，返回 nil |
| GetOriginal  | 获取原始值，如没有原始值，返回 nil                         |
| IsDirty      | 判断字段是否修改                                           |
| IsClean      | IsDirty 取反                                               |
| Query        | 获取一个新的 Query，可以配合事务使用                       |
| SetAttribute | 为字段设置一个新值                                         |

### 静默事件

也许有时候你会需要暂时将所有由模型触发的事件「静默」处理，可以使用 `WithoutEvents` 方法： You may achieve this using the `WithoutEvents` method:

```go
var user models.User
facades.Orm().Query().WithoutEvents().Find(&user, 1)
```

#### 静默的保存单个模型

有时候，你也许会想要「保存」一个已有的模型，且不触发任何事件。那么你可用 `SaveQuietly` 方法： You may accomplish this with the `SaveQuietly` method:

```go
var user models.User
err := facades.Orm().Query().FindOrFail(&user, 1)
user.Name = "Goravel"
err := facades.Orm().Query().SaveQuietly(&user)
```
