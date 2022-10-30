# 快速入门

[[toc]]

## 介绍

Goravel 提供了一套非常简单易用的数据库交互方式，开发者可以使用 `facades.Orm` 进行操作。目前，Goravel 为以下四种数据库提供了官方支持：

- MySQL 5.7+
- PostgreSQL 9.6+
- SQLite 3.8.8+
- SQL Server 2017+

在开始之前，请在 `.env` 文件中配置数据库链接信息，并确认 `config/database.go` 的默认配置。

## 配置

数据库的配置文件在 `config/database.go` 文件中。你可以在这个文件中配置所有的数据库连接，并指定默认的数据库连接。该文件中的大部分配置都基于项目的环境变量，且提供了 Goravel 所支持的数据库配置示例。

## 模型

模型相当于数据表的映射，你可以根据框架自带的模型文件 `app/models/user.go` 创建自定义模型。在 `app/models/user.go` 文件中 `struct` 嵌套了 `orm.Model` 与 `orm.SoftDeletes` 两个框架自带结构体，他们分别定义了 `id, created_at, updated_at` 与 `deleted_at`，其中 `orm.SoftDeletes` 代表模型开启了软删除功能。

### 模型约定

1. 模型使用大驼峰命名；
2. 使用模型的复数形式「蛇形命名」来作为表名；

例如，模型名称为 `UserOrder`，则表名为 `user_orders`。

## facades.Orm 可用方法

| 方法名      | 作用                              |
| ----------- | --------------------------------- |
| Connection  | [指定数据库链接](#指定数据库链接) |
| Query       | [获取数据库实例](#获取数据库实例) |
| Transaction | [事务](#事务)                     |
| WithContext | [注入 Context](#注入-Context)     |

## facades.Orm.Query & facades.Orm.Transaction 可用方法

| 方法名        | 作用                                    |
| ------------- | --------------------------------------- |
| Begin         | [手动开始事务](#事务)                   |
| Commit        | [提交事务](#事务)                       |
| Count         | [数据库事务](#事务)                     |
| Create        | [创建数据](#创建)                       |
| Delete        | [删除数据](#删除)                       |
| Distinct      | [过滤重复](#过滤重复)                   |
| Exec          | [执行原生更新 SQL](#执行原生更新SQL)    |
| Find          | [获取一条数据](#查询)                   |
| First         | [获取一条数据](#查询)                   |
| FirstOrCreate | [获取或创建一条数据](#查询)             |
| ForceDelete   | [强制删除](#删除)                       |
| Get           | [获取多条数据](#查询)                   |
| Group         | [Group 查询](#Group-By-&-Having)        |
| Having        | [Having 查询](#Group-By-&-Having)       |
| Join          | [Join 查询](#Join查询)                  |
| Limit         | [指定查询数量](#指定查询数量)           |
| Model         | [指定模型](#指定表查询)                 |
| Offset        | [指定查询开始位置](#指定查询开始位置)   |
| Order         | [排序](#排序)                           |
| OrWhere       | [查询条件](#Where条件)                  |
| Pluck         | [查询单列](查询单列)                    |
| Raw           | [执行原生查询 SQL](#执行原生查询SQL)    |
| Rollback      | [手动回滚事务](#事务)                   |
| Save          | [保存修改](#更新)                       |
| Scan          | [将数据解析到 struct](#执行原生查询SQL) |
| Scopes        | [Scopes](#Execute-Native-SQL)           |
| Select        | [指定查询列](#指定查询列)               |
| Table         | [指定表](#指定表查询)                   |
| Update        | [更新单个字段](#更新)                   |
| Updates       | [更新多个字段](#更新)                   |
| Where         | [查询条件](#Where条件)                  |
| WithTrashed   | [查询软删除](#查询软删除)               |

## 查询构造器

### 注入 Context

注入 Context，以实现超时控制等功能。

```go
facades.Orm.WithContext(ctx)
```

### 指定数据库链接

如果你在配置文件 `config/database.go` 中定义了多个数据库连接，你可以通过 `facades.Orm` 的 `Connection` 方法来使用它们。传递给 `Connection` 方法的连接名称应该是在 `config/database.go` 配置的连接之一：

```go
facades.Orm.Connection("mysql")
```

### 获取数据库实例

每次进行具体数据库操作前，都需要先获取数据库的实例。

```go
facades.Orm.Query()
facades.Orm.Connection("mysql").Query()
facades.Orm.WithContext(ctx).Query()
```

### 查询

查询单条数据

```go
var user models.User
facades.Orm.Query().First(&user)
// SELECT * FROM users WHERE id = 10;
```

根据 ID 查询单条或多条数据

```go
var user models.User
facades.Orm.Query().Find(&user, 1)
// SELECT * FROM users WHERE id = 1;

var users []models.User
facades.Orm.Query().Find(&users, []int{1,2,3})
// SELECT * FROM users WHERE id IN (1,2,3);
```

查询多条数据

```go
var users []models.User
facades.Orm.Query().Where("id in ?", []int{1,2,3}).Get(&users)
// SELECT * FROM users WHERE id IN (1,2,3);
```

查找或创建

```go
var user models.User
facades.Orm.Query().Where("sex = ?", 1).FirstOrCreate(&user, models.User{Name: "tom"})
// SELECT * FROM users where name="tom" and sex=1;
// INSERT INTO users (name) VALUES ("tom");

facades.Orm.Query().Where("sex = ?", 1).FirstOrCreate(&user, models.User{Name: "tom"}, , models.User{Avatar: "avatar"})
// SELECT * FROM users where name="tom" and sex=1;
// INSERT INTO users (name,avatar) VALUES ("tom", "avatar");
```

### Where 条件

```go
facades.Orm.Query().Where("name", "tom")
facades.Orm.Query().Where("name = 'tom'")
facades.Orm.Query().Where("name = ?", "tom")

facades.Orm.Query().OrWhere("name = ?", "tom")
```

### 指定查询数量

```go
var users []models.User
facades.Orm.Query().Where("name = ?", "tom").Limit(3).Get(&users)
// SELECT * FROM users WHERE name = "tom" LIMIT 3;
```

### 指定查询开始位置

```go
var users []models.User
facades.Orm.Query().Where("name = ?", "tom").Offset(5).Limit(3).Get(&users)
// SELECT * FROM users WHERE name = "tom" OFFSET 5 LIMIT 3;
```

### 排序

```go
var users []models.User
facades.Orm.Query().Where("name = ?", "tom").Order("sort asc").Order("id desc").Get(&users)
// SELECT * FROM users WHERE name = "tom" order sort asc, id desc;
```

### 查询单列

```go
var ages []int64
facades.Orm.Query().Model(&models.User{}).Pluck("age", &ages)
// SELECT `name` FROM `users`;
```

### 指定表查询

如果想查询一些聚合数据，需要指定具体表。

使用模型指定

```go
var count int64
facades.Orm.Query().Model(&models.User{}).Count(&count)
// SELECT count(1) where users
```

使用表名指定

```go
var count int64
facades.Orm.Query().Table("users").Count(&count)
// SELECT count(1) where users
```

### 检索聚合

```go
var count int
facades.Orm.Query().Where("name = ?", "tom").Count(&count)
// SELECT count(1) FROM users WHERE name = 'tom'
```

### 指定查询列

`Select` 允许你指定从数据库中检索哪些字段，默认情况下，ORM 会检索所有字段。

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

### Join 查询

```go
type Result struct {
  Name  string
  Email string
}

var result Result
facades.Orm.Query().Model(&models.User{}).Select("users.name, emails.email").Joins("left join emails on emails.user_id = users.id").Scan(&result)
// SELECT users.name, emails.email FROM `users` left join emails on emails.user_id = users.id
```

### 创建

```go
user := User{Name: "tom", Age: 18}
result := facades.Orm.Query().Create(&user)
// INSERT INTO users (name, age, created_at, updated_at) VALUES ("tom", 18, "2022-09-27 22:00:00", "2022-09-27 22:00:00");
```

批量创建

```go
users := []User{{Name: "tom", Age: 18}, {Name: "tim", Age: 19}}
result := facades.Orm.Query().Create(&users)
```

> `created_at` 和 `updated_at` 字段将会被自动填充。

### 更新

在现有模型基础上进行更新

```go
var user models.User
facades.Orm.Query().First(&user)

user.Name = "tom"
user.Age = 100
facades.Orm.Query().Save(&user)
// UPDATE users SET name='tom', age=100, updated_at = '2022-09-28 16:28:22' WHERE id=1;
```

更新单一字段

```go
facades.Orm.Query().Model(&models.User{}).Where("name = ?", "tom").Update("name", "hello")
// UPDATE users SET name='tom', updated_at='2022-09-28 16:29:39' WHERE name="tom";
```

更新多个字段

```go
facades.Orm.Query().Model(&user).Where("name = ?", "tom").Updates(User{Name: "hello", Age: 18})
// UPDATE users SET name="hello", age=18, updated_at = '2022-09-28 16:30:12' WHERE name = "tom";
```

> `updated_at` 字段将会被自动更新。

### 删除

根据模型删除

```go
var user models.User
facades.Orm.Query().Find(&user, 1)
facades.Orm.Query().Delete(&user)
// DELETE FROM users where id = 1;
```

根据 ID 删除

```go
facades.Orm.Query().Delete(&models.User{}, 10)
// DELETE FROM users WHERE id = 10;

facades.Orm.Query().Delete(&models.User{}, []uint{1, 2, 3})
// DELETE FROM users WHERE id in (1, 2, 3);
```

批量删除

```go
facades.Orm.Query().Where("name = ?", "tom").Delete(&models.User{})
// DELETE FROM users where name = "tom";
```

如果模型开启了软删除功能，想要强制删除某数据

```go
facades.Orm.Query().Where("name = ?", "tom").ForceDelete(&models.User{})
```

如果在没有任何条件的情况下执行批量删除，ORM 不会执行该操作，并返回错误。对此，你必须加一些条件，或者使用原生 SQL。

### 查询软删除

```go
var user models.User
facades.Orm.Query().WithTrashed().First(&user)
```

### 过滤重复

```go
var users []models.User
facades.Orm.Query().Distinct("name").Find(&users)
```

### 执行原生查询 SQL

```go
type Result struct {
  ID   int
  Name string
  Age  int
}

var result Result
db.Raw("SELECT id, name, age FROM users WHERE name = ?", "tom").Scan(&result)
```

### 执行原生更新 SQL

```go
facades.Orm.Query().Exec("DROP TABLE users")
// DROP TABLE users;
```

### 事务

可以使用 `Transaction` 方法执行事务：

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

也可以自己手动控制事务的流程：

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

facades.Orm.Query().Scopes(scopes.Paginator(page, limit)).Find(&entries)
```
