# 查询构造器

[[toc]]

## 简介

Goravel 的数据库查询构造器提供了一个方便的接口来创建和执行数据库查询。 它可以用于执行应用程序中的大部分数据库操作，并且可以在所有支持的数据库系统上工作。

Goravel 查询构造器使用参数绑定来保护你的应用程序免受 SQL 注入攻击。 不需要清理或转义传递给查询构造器的字符串。

## 运行查询

框架提供了各种查询方法，可以用于检索、创建、更新和删除数据库中的数据。 注意，当你想将数据绑定至 struct 或[模型](../orm/getting-started.md#模型)，需要为字段添加 tag `db`：

```go
type User struct {
	ID   string `db:"id"`
	Name string `db:"name"`
}

type User struct {
	orm.BaseModel
	orm.NullableSoftDeletes
	Name string `db:"name"`
}
```

### 检索所有行

你可以使用 `facades.DB()` 提供的 `table` 方法开始查询。 `table` 方法为指定的表返回一个链式查询构造器实例，允许在查询上链接更多约束，最后使用 `Get` 方法检索查询结果：

```go
var users []User
err := facades.DB().Table("users").Get(&users)
```

### 检索单行或单列

如果你只需要从数据库表中检索单行数据，可以使用 `First` 方法。

```go
var user User
err := facades.DB().Table("users").Where("id", 1).First(&user)
```

可以使用 `Value` 方法检索单个列的值：

```go
var name string
err := facades.DB().Table("users").Where("id", 1).Value("name", &name)
```

可以使用 `Find` 方法传入 `id` 获取单行数据：

```go
var user User
err := facades.DB().Table("users").Find(&user, 1)

// 也可以传入 `id` 集合获取多行数据
var users []User
err := facades.DB().Table("users").Find(&users, []int{1, 2, 3})

// Find 默认表主键为 `id`，如果表主键不是 `id`，可以传入 `id` 字段名
var user User
err := facades.DB().Table("users").Find(&users, "uuid", "1")
```

可以使用 `FindOrFail` 或 `FirstOrFail` 方法，如果找不到记录，会抛出 `sql.ErrNoRows` 错误：

```go
var user User
err := facades.DB().Table("users").FindOrFail(&user, 1)
```

可以使用 `FindOr` 或 `FirstOr` 方法，如果找不到记录，则执行闭包函数：

```go
var user *User
err = facades.DB().Table("users").Where("name", "John").FirstOr(&user, func() error {
  return errors.New("no rows")
})
```

### 检索一列的值

如果你想要检索包含单个列值的记录列表，可以使用 `Pluck` 方法：

```go
var emails []string
err := facades.DB().Table("users").Pluck("email", &emails)
```

### 遍历结果

可以使用 `Each` 方法遍历所有结果：

```go
var products []Product
err := facades.DB().Table("products").Each(func(rows []db.Row) error {
  for _, row := range rows {
    var product Product
    if err := row.Scan(&product); err != nil {
      return err
    }

    products = append(products, product)
  }

  return nil
})
```

### 分块结果

如果你需要处理数千条数据库记录，可以考虑使用 `Chunk` 方法。 这个方法一次检索一小块结果，并将每个块传递给闭包函数进行处理：

```go
var products []Product
err := facades.DB().Table("products").Chunk(2, func(rows []db.Row) error {
  for _, row := range rows {
    var product Product
    if err := row.Scan(&product); err != nil {
      return err
    }

    products = append(products, product)
  }

  return nil
})
```

> 注意：当在 Chunk 的回调中的修改记录时，可能会导致记录未包含在分块结果中。

### 游标

游标可以用于处理大量数据，它不会一次性将所有数据加载到内存中， 而是逐条处理数据。

```go
rows, err := facades.DB().Table("products").Cursor()

var products []Product
for row := range rows {
    var product Product
    if err := row.Scan(&product); err != nil {
      return err
    }

    products = append(products, product)
}
```

### 聚合

查询构造器提供了多个聚合方法：`Count`、`Sum`、`Avg`、`Min`、`Max`。

```go
count, err := facades.DB().Table("users").Count()

var sum int
err := facades.DB().Table("users").Sum("age", &sum)

var avg float64
err := facades.DB().Table("users").Avg("age", &avg)

var min int
err := facades.DB().Table("users").Min("age", &min)

var max int
err := facades.DB().Table("users").Max("age", &max)
```

### 判断记录是否存在

可以通过 `Exists` 和 `DoesntExist` 方法确定查询条件的结果是否存在：

```go
exists, err := facades.DB().Table("users").Where("votes > ?", 100).Exists()

exists, err := facades.DB().Table("users").Where("votes > ?", 100).DoesntExist()
```

### 分页

可以使用 `Paginate` 方法分页查询：

```go
var (
  users []User
  total int64
)

err := facades.DB().Table("users").Where("name", "John").Paginate(1, 10, &users, &total)
```

## Select 语句

可能你并不总是希望从数据库表中获取所有列。  使用 `Select` 方法，可以自定义一个 「select」 查询语句来查询指定的字段：

```go
var users []User
err := facades.DB().Table("users").Select("name", "email as user_email").Get(&users)
```

`Distinct` 方法会强制让查询返回不重复的结果：

```go
var users []User
err := facades.DB().Table("users").Distinct().Select("name").Get(&users)
```

## 原生表达式

有时候你可能需要在查询中使用原生表达式。 你可以使用 `db.Raw` 创建一个原生表达式：

```go
import "github.com/goravel/framework/database/db"

res, err := facades.DB().Model(&user).Update("age", db.Raw("age - ?", 1))
```

## Select 语句

### 指定一个 Select 子句

当然你可能并不总是希望从数据库表中获取所有列。 使用 `Select` 方法，你可以为查询指定一个自定义的 select 子句：

```go
// 选择特定字段
err := facades.DB().Select("name", "age").Get(&users)

// 使用子查询
err := facades.DB().Select("name", db.Raw("(SELECT COUNT(*) FROM posts WHERE users.id = posts.user_id) as post_count")).Get(&users)
```

### Distinct 语句

`Distinct` 方法会强制让查询返回不重复的结果：

```go
var users []models.User
err := facades.DB().Distinct("name").Find(&users)
```

## 原生方法

### WhereRaw / OrWhereRaw

`WhereRaw` 和 `OrWhereRaw` 方法可用于将原始 「where」子句注入你的查询。 这些方法接受一个可选的绑定数组作为它们的第二个参数：

```go
var users []User

err := facades.DB().WhereRaw("age = ? or age = ?", []any{25, 30}).Get(&users)

err := facades.DB().OrWhereRaw("age = ? or age = ?", []any{25, 30}).Get(&users)
```

### OrderByRaw

`OrderByRaw` 方法可用于将原生字符串设置为「order by」子句的值：

```go
var users []User

err := facades.DB().OrderByRaw("age DESC, id ASC").Get(&users)
```

## Joins

### Inner Join 语句

查询构造器也可以用于编写 join 语句。 要执行基本的 SQL "inner join"，你可以在查询构造器实例上使用 `Join` 方法：

```go
var users []User

err := facades.DB().Table("users").Join("posts as p ON users.id = p.user_id AND p.id = ?", 1).Where("age", 25).Get(&users)
```

### Left Join / Right Join 语句

如果你想执行 "left join" 或 "right join"，可以使用 `LeftJoin` 或者 `RightJoin` 方法：

```go
var users []User

err := facades.DB().Table("users").LeftJoin("posts as p ON users.id = p.user_id AND p.id = ?", 1).Where("age", 25).Get(&users)

err = facades.DB().Table("users").RightJoin("posts as p ON users.id = p.user_id AND p.id = ?", 1).Where("age", 25).Get(&users)
```

### Cross Join 语句

`CrossJoin` 方法可用于执行「cross join」：

```go
var users []User

err := facades.DB().Table("users").CrossJoin("posts as p ON users.id = p.user_id AND p.id = ?", 1).Where("age", 25).Get(&users)
```

## 基本的 Where 子句

### Where / OrWhere

你可以在查询构造器实例上使用 `Where` 方法来添加 where 子句到查询中。

```go
import "github.com/goravel/framework/contracts/database/db"

var users []User

err := facades.DB().Where("votes", 100).Get(&users)

err := facades.DB().Where("votes >= ?", 100).Get(&users)

err := facades.DB().Where("votes LIKE ?", "%goravel%").Get(&users)

err := facades.DB().Where("votes", []int{1, 2, 3}).Get(&users)

err := facades.DB().Where(func(query db.Query) db.Query {
  return query.Where("age", []int{25, 30}).Where("name", "Tom")
}).OrWhere("name", "John").Get(&users)
```

### WhereNot / OrWhereNot

`WhereNot` 和 `OrWhereNot` 方法可用于否定一组给定的查询条件。

```go
import "github.com/goravel/framework/contracts/database/db"

var users []User

err := facades.DB().WhereNot("votes", 100).Get(&users)

err := facades.DB().WhereNot("votes >= ?", 100).Get(&users)

err := facades.DB().WhereNot("votes LIKE ?", "%goravel%").Get(&users)

err := facades.DB().WhereNot("votes", []int{1, 2, 3}).Get(&users)

err := facades.DB().WhereNot(func(query db.Query) db.Query {
  return query.Where("age", []int{25, 30}).Where("name", "Tom")
}).OrWhereNot("name", "John").Get(&users)
```

### WhereExists / WhereNotExists

`WhereExists` 方法允许你编写 exists SQL 子句：

```go
var users []User

err := facades.DB().Table("users").Where("name", "John").WhereExists(func() db.Query {
  return facades.DB().Table("posts").WhereColumn("posts.user_id", "users.id")
}).Get(&users)
```

### WhereAll / WhereAny / WhereNone

```go
var products []Product
facades.DB().Table("products").WhereAll([]string{"weight", "height"}, "=", 200).Find(&products)
// SQL: SELECT * FROM products WHERE weight = ? AND height = ?

var users []User
facades.DB().Table("users").WhereAny([]string{"name", "email"}, "=", "John").Find(&users)
// SQL: SELECT * FROM users WHERE (name = ? OR email = ?)

var products []Product
facades.DB().Table("products").WhereNone([]string{"age", "score"}, ">", 18).Find(&products)
// SQL: SELECT * FROM products WHERE NOT (age > ?) AND NOT (score > ?)
```

### 其他 Where 语句

**WhereBetween / OrWhereBetween**

`WhereBetween` 方法验证字段值是否在给定的两个值之间：

```go
facades.DB().Table("users").WhereBetween("votes", 1, 100)
```

**WhereNotBetween / OrWhereNotBetween**

`WhereNotBetween` 方法验证字段值是否在给定的两个值之外：

```go
facades.DB().Table("users").WhereNotBetween("votes", 1, 100)
```

**WhereIn / WhereNotIn / OrWhereIn / OrWhereNotIn**

`WhereIn` 方法验证字段的值必须存在指定的数组里：

```go
facades.DB().Table("users").WhereIn("id", []any{1, 2, 3})
```

**WhereNull / WhereNotNull / OrWhereNull / OrWhereNotNull**

`WhereNull` 方法验证指定的字段必须是 `NULL`：

```go
facades.DB().Table("users").WhereNull("updated_at")
```

**WhereLike / WhereNotLike / OrWhereLike / OrWhereNotLike**

`WhereLike` 方法验证字段值是否包含给定的值：

```go
facades.DB().Table("users").WhereLike("name", "%goravel%")
```

**WhereColumn / OrWhereColumn**

`WhereColumn` 方法验证两个字段是否相等：

```go
facades.DB().Table("users").WhereColumn("first_name", "last_name")
```

### 逻辑分组

有时你可能需要将括号内的几个「where」子句分组，以实现查询所需的逻辑分组。

```go
facades.DB().Table("users").Where("age", 25).Where(func(query db.Query) db.Query {
  return query.Where("votes", 100).OrWhere("votes", 200)
})
```

## Ordering, Grouping, Limit & Offset

### 排序

**OrderBy / OrderByDesc**

```go
facades.DB().OrderBy("name")

facades.DB().OrderByDesc("name")
```

**Latest**

`Latest` 方法可以使你轻松地通过日期对结果进行排序。 默认情况下，结果将根据 `created_at` 列进行排序：

```go
err := facades.DB().Table("users").Latest().First(&user)

err := facades.DB().Table("users").Latest("updated_at").First(&user)
```

**InRandomOrder**

`InRandomOrder` 方法被用来将结果随机排序：

```go
err := facades.DB().Table("users").InRandomOrder().First(&user)
```

### 分组

`GroupBy` 和 `Having` 方法可以将结果分组：

```go
err := facades.DB().Table("users").Where("age", 25).GroupBy("name").Having("name = ?", "John").OrderBy("name").Get(&users)
```

### 限制和偏移

你可以使用 `Limit` 和 `Offset` 方法来限制结果的数量，或者在查询中跳过指定数量的结果：

```go
err := facades.DB().Table("users").Offset(10).Limit(5).Get(&users)
```

## 条件子句

有时你可能想要子句只适用于某个情况为真时才执行查询。 例如，你可能只想给定值在请求中存在的情况下才应用 where 语句。 你可以通过使用 `When` 方法来实现这种功能：

```go
import "github.com/goravel/framework/contracts/database/db"

err := facades.DB().Table("users").When(1 == 1, func(query db.Query) db.Query {
  return query.Where("age", 25)
}).First(&user)
```

你也可以将另一个闭包作为第三个参数传递给 `When` 方法。 这个闭包则旨在第一个参数结果为 false 时才会执行：

```go
err := facades.DB().Table("users").When(1 != 1, func(query db.Query) db.Query {
  return query.OrderBy("name")
}, func(query db.Query) db.Query {
  return query.OrderBy("id")
}).First(&user)
```

## 插入语句

查询构造器提供了 `Insert` 方法用于插入记录到数据库中：

```go
// Insert by struct
result, err := facades.DB().Table("products").Insert(Product{
  Name: "goravel",
})

// Insert by slice struct
result, err := facades.DB().Table("products").Insert([]Product{
  {
    Name: "goravel",
  },
  {
    Name: "go",
  },
})

// Insert by map
result, err := facades.DB().Table("products").Insert(map[string]any{
  "name": "goravel",
  "created_at": time.Now(),
  "updated_at": time.Now(),
})

// Insert by slice map
result, err := facades.DB().Table("products").Insert([]map[string]any{
  {
    "name": "goravel",
    "created_at": time.Now(),
    "updated_at": time.Now(),
  },
  {
    "name": "go",
    "created_at": time.Now(),
    "updated_at": time.Now(),
  },
})
```

### 自增 ID

如果表的主键是自增的，你可以使用 `LastInsertID` 方法获取自增 ID，仅支持 `mysql` 和 `sqlite` 数据库：

```go
id, err := facades.DB().Table("products").InsertGetID(Product{
  Name: "goravel",
})
```

## 更新语句

查询构造器提供了 `Update` 方法用于更新数据库中存在的记录：

```go
// Update by field name
result, err := facades.DB().Table("products").Where("id", 1).Update("phone", "1234567890")

// Update by struct
result, err := facades.DB().Table("products").Where("id", 1).Update(Product{
  Name: "goravel",
})

// Update by map
result, err := facades.DB().Table("products").Where("id", 1).Update(map[string]any{
  "name": "goravel",
  "created_at": time.Now(),
  "updated_at": time.Now(),
})
```

### 更新 JSON 字段

```go
result, err := facades.DB().Table("users").Where("id", 1).Update("options->enabled", true)
result, err := facades.DB().Table("users").Where("id", 1).Update("options->languages[0]", "en")
result, err := facades.DB().Table("users").Where("id", 1).Update("options->languages", []string{"en", "de"})
result, err := facades.DB().Table("users").Where("id", 1).Update(map[string]any{
    "preferences->dining->meal": "salad",
    "options->languages[0]":     "en",
    "options->enabled":          true,
})
```

### 更新或插入

有时你可能希望更新数据库中的记录，但如果指定记录不存在的时候则创建它。 这时可以使用 `UpdateOrInsert` 方法。 `UpdateOrInsert` 方法接受两个参数：一个用于查找记录的条件，以及一个包含要更改记录的键值对。

`UpdateOrInsert` 方法将尝试使用第一个参数的列名和值来定位匹配的数据库记录。 如果记录存在，则使用第二个参数更新其值。 如果找不到指定记录，则会合并两个参数的属性来创建一条记录并将其插入：

```go
// use struct
result, err := facades.DB().Table("users").Where("id", 1).UpdateOrInsert(TestUser{
  Email: "john@example.com",
}, TestUser{
  Phone: "1234567890",
})

// use map
result, err := facades.DB().Table("users").Where("id", 1).UpdateOrInsert(map[string]any{
  "email": "john@example.com",
}, map[string]any{
  "phone": "1234567890",
})
```

### 自增与自减

`Increment` 和 `Decrement` 方法可以用于自增或自减指定字段的值：

```go
err := facades.DB().Table("users").Where("id", 1).Increment("votes")

err := facades.DB().Table("users").Where("id", 1).Increment("votes", 2)

err := facades.DB().Table("users").Where("id", 1).Decrement("votes")

err := facades.DB().Table("users").Where("id", 1).Decrement("votes", 2)
```

## 删除语句

查询构造器也可以使用 `Delete` 方法从表中删除记录：

```go
result, err := facades.DB().Table("users").Where("id", 1).Delete()
```

## 悲观锁

查询构造器也包含了一些可以帮助你在 `select` 语句中实现「悲观锁定」的函数。

若要在查询中使用「共享锁」，你可以使用 `SharedLock` 方法。 共享锁可防止选中的行被篡改，直到事务被提交为止：

```go
err := facades.DB().Table("users").Where("votes > ?", 100).SharedLock().Get(&users)
```

此外，你也可以使用 `LockForUpdate` 方法。 使用「更新」锁可避免行被其它共享锁修改或选取：

```go
err := facades.DB().Table("users").Where("votes > ?", 100).LockForUpdate().Get(&users)
```

## 调试

你可以在构建查询时使用 `ToSQL` 和 `ToRawSql` 方法获取当前查询绑定和 SQL。

带占位符的 SQL：

```go
err := facades.DB().Table("users").Where("id", 1).ToSql().Get(models.User{})
```

带绑定值的 SQL：

```go
err := facades.DB().Table("users").Where("id", 1).ToRawSql().Get(models.User{})
```

`ToSql` 与 `ToRawSql` 后可以调用的方法：`Count`, `Insert`, `Delete`, `First`, `Get`, `Pluck` `Update`。
