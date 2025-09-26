# Query Builder

[[toc]]

## 概述

數據庫查詢構造器提供了一個方便的接口來創建和執行數據庫查詢。 它可以用於執行應用程序中的大部分數據庫操作，並且可以在所有支持的數據庫系統上工作。

查詢構造器使用參數綁定來保護您的應用程序免受 SQL 注入攻擊。 您無需清理或轉義傳遞給查詢構造器的字符串。

## 運行查詢

框架提供了各種查詢方法，您可以查詢、創建、更新和刪除數據庫中的數據。 請注意，當您想將數據綁定到 `struct` 或 [模型](../orm/getting-started.md#model-definition) 時，需要為字段添加 `db` 標籤：

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

### 檢索所有行

您可以使用 `facades.DB()` 提供的 `table` 方法開始查詢。 `table` 方法為指定的表返回一個可鏈式查詢的構造器實例，允許在查詢上鏈接更多約束，最後使用 `Get` 方法檢索查詢結果：

```go
var users []User
err := facades.DB().Table("users").Get(&users)　
```

### 檢索單行或單列

如果您只需要從數據庫表中檢索單行數據，可以使用 `First` 方法。

```go
var user User
err := facades.DB().Table("users").Where("id", 1).First(&user)　
```

您可以使用 `Value` 方法來檢索單個列的值：

```go
var name string
err := facades.DB().Table("users").Where("id", 1).Value("name", &name)　
```

您可以使用 `Find` 方法通過傳遞 `id` 來檢索單行數據：

```go
var user User
err := facades.DB().Table("users").Find(&user, 1)

// 您還可以傳入一組 `id` 來檢索多行數據
var users []User
err := facades.DB().Table("users").Find(&users, []int{1, 2, 3})

// Find 默認將表的主鍵設置為 `id`，如果表的主鍵不是 `id`，可以傳遞 `id` 字段名稱
var user User
err := facades.DB().Table("users").Find(&users, "uuid", "1")
```

您可以使用 `FindOrFail` 或 `FirstOrFail` 方法，如果未找到記錄，將引發 `sql.ErrNoRows` 錯誤：

```go
var user User
err := facades.DB().Table("users").FindOrFail(&user, 1)　
```

您可以使用 `FindOr` 或 `FirstOr` 方法，如果未找到記錄，將執行閉包函數：

```go
var user *User
user, err = facades.DB().Table("users").Where("name", "John").FirstOr(&user, func() error {
  return errors.New("no rows")
})
```

### 檢索單列的值

如果您想檢索包含單個列值的記錄列表，可以使用 `Pluck` 方法：

```go
var emails []string
err := facades.DB().Table("users").Pluck("email", &emails)　
```

### 遍歷結果

您可以使用 `Each` 方法遍歷所有結果：

```go
var products []Product
err := facades.DB().Table("products").Each(func(rows []db.Row) error {
  for _, row := range rows {
    var product Product
    err := row.Scan(&product)
    s.NoError(err)
    products = append(products, product)
  }

  return nil
})
```

### 分塊結果

如果您需要處理數千條數據庫記錄，建議使用 `Chunk` 方法。 該方法一次檢索一小塊結果並將每塊傳遞給閉包函數進行處理：

```go
var products []Product
err := facades.DB().Table("products").Chunk(2, func(rows []db.Row) error {
  for _, row := range rows {
    var product Product
    err := row.Scan(&product)
    s.NoError(err)
    products = append(products, product)
  }

  return nil
})
```

> 注意：在 Chunk 的回調中修改記錄時，可能導致記錄未包含在分塊結果中。

### 光標

游標可用於處理大量數據，而無需一次性加載所有數據到內存中。 它一條一條地處理數據，而不是一次性加載所有數據。

```go
rows, err := facades.DB().Table("products").Cursor()

var products []Product
for row := range rows {
    var product Product
    err = row.Scan(&product)

    s.NoError(err)
    s.True(product.ID > 0)

    products = append(products, product)
}
```

### 聚合

查詢構造器提供了聚合方法： `Count` `Sum`。

```go
count, err := facades.DB().Table("users").Count()

sum, err := facades.DB().Table("users").Sum("age")
```

### 檢查記錄是否存在

您可以使用 `Exists` 和 `DoesntExist` 方法來確定查詢條件的結果是否存在：

```go
exists, err := facades.DB().Table("users").Where("votes > ?", 100).Exists()

exists, err := facades.DB().Table("users").Where("votes > ?", 100).DoesntExist()
```

### 分頁

您可以使用 `Paginate` 方法對查詢結果進行分頁：

```go
var (
  users []User
  total int64
)

err := facades.DB().Table("users").Where("name", "John").Paginate(1, 10, &users, &total)　
```

## 選擇

您可能不總是希望從數據庫表中檢索所有列。 使用 `Select` 方法自定義一個 "select" 查詢語句來查詢指定的字段：

```go
var users []User
err := facades.DB().Table("users").Select("name", "email as user_email").Get(&users)　
```

`Distinct` 方法會強制讓查詢返回不重複的結果：

```go
var users []User
err := facades.DB().Table("users").Distinct().Select("name").Get(&users)　
```

## 原生表達式

有時您可能需要在查詢中使用原生表達式。 您可以使用 `db.Raw` 方法來創建原生表達式：

```go
import "github.com/goravel/framework/database/db"

facades.DB().Model(&user).Update("age", db.Raw("age - ?", 1))
```

## 選擇

### 指定一個 Select 子句

當然，您可能不總是希望從數據庫表中檢索所有列。 使用 `Select` 方法為您的查詢指定自定義的 select 子句：

```go
// 選擇特定字段
facades.DB().Select("name", "age").Get(&users)

// 使用子查詢
facades.DB().Select("name", db.Raw("(SELECT COUNT(*) FROM posts WHERE users.id = posts.user_id) as post_count")).Get(&users)
```

### 唯一的

`Distinct` 方法會強制讓查詢返回不重複的結果：

```go
var users []models.User
facades.DB().Distinct("name").Find(&users)　
```

## 原生方法

### WhereRaw / OrWhereRaw

`WhereRaw` 和 `OrWhereRaw` 方法可用於將原始 "where" 子句注入您的查詢。 這些方法接受一個可選的綁定數組作為它們的第二個參數：

```go
var users []User

err := facades.DB().WhereRaw("age = ? or age = ?", []any{25, 30}).Get(&users)

err := facades.DB().OrWhereRaw("age = ? or age = ?", []any{25, 30}).Get(&users)　
```

### OrderByRaw

`OrderByRaw` 方法可用於將原生字符串設置為「order by」子句的值：

```go
var users []User

err := facades.DB().OrderByRaw("age DESC, id ASC").Get(&users)　
```

## 聯接

### 內聯接

查詢構造器可用於編寫聯接語句。 要執行基本的 SQL "內聯接"，您可以在查詢構造器實例上使用 `Join` 方法：

```go
var users []User

err := facades.DB().Table("users").Join("posts as p ON users.id = p.user_id AND p.id = ?", 1).Where("age", 25).Get(&users)　
```

### 左聯接 / 右聯接

如果您想執行 "左聯接" 或 "右聯接"，可以使用 `LeftJoin` 或 `RightJoin` 方法：

```go
var users []User

err := facades.DB().Table("users").LeftJoin("posts as p ON users.id = p.user_id AND p.id = ?", 1).Where("age", 25).Get(&users)

err = facades.DB().Table("users").RightJoin("posts as p ON users.id = p.user_id AND p.id = ?", 1).Where("age", 25).Get(&users)　
```

### 交叉聯接

`CrossJoin` 方法可用於執行「交叉聯接」：

```go
var users []User

err := facades.DB().Table("users").CrossJoin("posts as p ON users.id = p.user_id AND p.id = ?", 1).Where("age", 25).Get(&users)　
```

## 基本的 Where 子句

### Where / OrWhere

您可以在查詢構造器實例上使用 `Where` 方法向查詢添加 where 子句。

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

`WhereNot` 和 `OrWhereNot` 方法可用於否定一組給定的查詢條件。

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

`WhereExists` 方法允許你編寫 exists SQL 子句：

```go
var users []User

err := facades.DB().Table("users").Where("name", "John").WhereExists(func() db.Query {
  return facades.DB().Table("posts").WhereColumn("posts.user_id", "users.id")
}).Get(&users)
```

### 其他 Where 语句

**WhereBetween / OrWhereBetween**

`WhereBetween` 方法驗證字段值是否在給定的兩個值之間：

```go
facades.DB().Table("users").WhereBetween("votes", 1, 100)
```

**WhereNotBetween / OrWhereNotBetween**

`WhereNotBetween` 方法驗證字段值是否在給定的兩個值之外：

```go
facades.DB().Table("users").WhereNotBetween("votes", 1, 100)
```

**WhereIn / WhereNotIn / OrWhereIn / OrWhereNotIn**

`WhereIn` 方法驗證字段值必須存在於指定的數組中：

```go
facades.DB().Table("users").WhereIn("id", []any{1, 2, 3})
```

**WhereNull / WhereNotNull / OrWhereNull / OrWhereNotNull**

`WhereNull` 方法驗證指定的字段必須是 `NULL`：

```go
facades.DB().Table("users").WhereNull("updated_at")
```

**WhereLike / WhereNotLike / OrWhereLike / OrWhereNotLike**

`WhereLike` 方法驗證字段值是否包含給定的值：

```go
facades.DB().Table("users").WhereLike("name", "%goravel%")
```

**WhereColumn / OrWhereColumn**

`WhereColumn` 方法驗證兩個字段是否相等：

```go
facades.DB().Table("users").WhereColumn("first_name", "last_name")
```

### 邏輯分組

有時你可能需要將幾個「where」子句包裹在括號內，以獲得查詢所需的邏輯分組。

```go
facades.DB().Table("users").Where("age", 25).Where(func(query db.Query) db.Query {
  return query.Where("votes", 100).OrWhere("votes", 200)
})
```

## 排序、分組、限制和偏移

### 排序

**OrderBy / OrderByDesc**

```go
facades.DB().OrderBy("name")

facades.DB().OrderByDesc("name")
```

**最新**

`Latest` 方法可以使你輕鬆地通過日期對結果進行排序。 默認情況下，結果將根據 `created_at` 列進行排序： 默認情況下，結果將根據 `created_at` 列進行排序：

```go
facades.DB().Table("users").Latest().First(&user)

facades.DB().Table("users").Latest("updated_at").First(&user)
```

**隨機排序**

`InRandomOrder` 方法被用來將結果隨機排序：

```go
facades.DB().Table("users").InRandomOrder().First(&user)
```

### 分組

`GroupBy` 和 `Having` 方法可以用來分組結果：

```go
err := facades.DB().Table("users").Where("age", 25).GroupBy("name").Having("name = ?", "John").OrderBy("name").Get(&users)
```

### 限制和偏移

你可以使用 `Limit` 和 `Offset` 方法來限制結果的數量，或者在查詢中跳過指定數量的結果：

```go
err := facades.DB().Table("users").Offset(10).Limit(5).Get(&users)
```

## 條件子句

有時你可能希望在給定的條件為真的時候才執行某個子句。 舉例來說，你只想在給定的值存在於請求中時才應用某個 where 子句。 這可以通過使用 `When` 方法來完成：

```go
import "github.com/goravel/framework/contracts/database/db"

facades.DB().Table("users").When(1 == 1, func(query db.Query) db.Query {
  return query.Where("age", 25)
}).First(&user)
```

你還可以將另一個閉包作為第三個參數傳遞給 `When` 方法。 如果第一個參數的結果為 false，這個閉包將會執行：

```go
facades.DB().Table("users").When(1 != 1, func(query db.Query) db.Query {
  return query.OrderBy("name")
}, func(query db.Query) db.Query {
  return query.OrderBy("id")
}).First(&user)
```

## 插入

查詢構造器提供了 `Insert` 方法用於插入記錄到數據庫中：

```go
// 根據結構插入
result, err := facades.DB().Table("products").Insert(Product{
  Name: "goravel",
})

// 根據切片結構插入
result, err := facades.DB().Table("products").Insert([]Product{
  {
    Name: "goravel",
  },
  {
    Name: "go",
  },
})

// 根據映射插入
result, err := facades.DB().Table("products").Insert(map[string]any{
  "name": "goravel",
  "created_at": time.Now(),
  "updated_at": time.Now(),
})

// 根據切片映射插入
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

如果表的主鍵是自增的，你可以使用 `LastInsertID` 方法獲取自增 ID，僅支持 `mysql` 和 `sqlite` 數據庫：

```go
id, err := facades.DB().Table("products").InsertGetID(Product{
  Name: "goravel",
})
```

## 更新

查詢構造器提供了 `Update` 方法用於更新數據庫中存在的記錄：

```go
// 根據字段名稱更新
result, err := facades.DB().Table("products").Where("id", 1).Update("phone", "1234567890")

// 根據結構更新
result, err := facades.DB().Table("products").Where("id", 1).Update(Product{
  Name: "goravel",
})

// 根據映射更新
result, err := facades.DB().Table("products").Where("id", 1).Update(map[string]any{
  "name": "goravel",
  "created_at": time.Now(),
  "updated_at": time.Now(),
})
```

### 更新 JSON 欄位

```go
facades.DB().Table("users").Where("id", 1).Update("options->enabled", true)
facades.DB().Table("users").Where("id", 1).Update("options->languages[0]", "en")
facades.DB().Table("users").Where("id", 1).Update("options->languages", []string{"en", "de"})

facades.DB().Table("users").Where("id", 1).Update(map[string]any{
    "preferences->dining->meal": "salad",
    "options->languages[0]":     "en",
    "options->enabled":          true,
})
```

### 更新或插入

有時你可能希望更新數據庫中的記錄，但如果指定的記錄不存在，則創建它。 這可以使用 `UpdateOrInsert` 方法來完成。 `UpdateOrInsert` 方法接受兩個參數：一個用於尋找記錄的條件，以及一個包含要更新記錄的值的鍵值對。

`UpdateOrInsert` 方法將嘗試使用第一個參數的列名和值來定位匹配的數據庫記錄。 如果記錄存在，則使用第二個參數更新其值。 如果未找到匹配記錄，則會創建記錄，並從兩個參數中合併其值：

```go
// 使用結構
result, err := facades.DB().Table("users").Where("id", 1).UpdateOrInsert(TestUser{
  Email: "john@example.com",
}, TestUser{
  Phone: "1234567890",
})

// 使用映射
result, err := facades.DB().Table("users").Where("id", 1).UpdateOrInsert(map[string]any{
  "email": "john@example.com",
}, map[string]any{
  "phone": "1234567890",
})
```

### 自增與自減

`Increment` 和 `Decrement` 方法可以用於自增或自減指定字段的值：

```go
err := facades.DB().Table("users").Where("id", 1).Increment("votes")

err := facades.DB().Table("users").Where("id", 1).Increment("votes", 2)

err := facades.DB().Table("users").Where("id", 1).Decrement("votes")

err := facades.DB().Table("users").Where("id", 1).Decrement("votes", 2)
```

## 刪除

查詢構造器還包括一些函數，可以幫助你在 `select` 語句中實現「悲觀鎖定」：

```go
result, err := facades.DB().Table("users").Where("id", 1).Delete()
```

## 悲觀鎖定

查詢構造器還包括一些函數，可以幫助你在 `select` 語句中實現「悲觀鎖定」：

若要使用「共享鎖」，你可以使用 `SharedLock` 方法。 共享鎖可防止選中的行被篡改，直到事務被提交為止：

```go
facades.DB().Table("users").Where("votes > ?", 100).SharedLock().Get(&users)
```

你也可以使用 `LockForUpdate` 方法。 使用「更新」鎖可避免行被其它共享鎖修改或選取：

```go
facades.DB().Table("users").Where("votes > ?", 100).LockForUpdate().Get(&users)
```

## 調試

你可以使用 `ToSQL` 和 `ToRawSql` 方法來獲取當前查詢綁定和 SQL。

帶佔位符的 SQL：

```go
facades.DB().Table("users").Where("id", 1).ToSql().Get(models.User{})
```

帶綁定值的 SQL：

```go
facades.DB().Table("users").Where("id", 1).ToRawSql().Get(models.User{})
```

`ToSql` 與 `ToRawSql` 後可以調用的方法：`Count`, `Insert`, `Delete`, `First`, `Get`, `Pluck`, `Update`。
