# 開始使用

[[toc]]

## 概述

Goravel 提供了一個非常簡單且易於使用的資料庫互動，開發者可以使用 `facades.Orm()` 進行操作。 開始之前，請參閱 [配置資料庫](../database/getting-started)。

## 模型定義

要創建自定義模型，請參考框架中包含的模型檔案 `app/models/user.go`。 `app/models/user.go` 中的 `struct` 包含兩個內嵌框架：`orm.Model` 和 `orm.SoftDeletes`。 這些框架分別定義了 `id`、`created_at`、`updated_at` 和 `deleted_at` 屬性。 使用 `orm.SoftDeletes`，您可以為模型啟用軟刪除功能。

### 模型約定

1. 模型使用大駝峰命名；
2. 使用模型 "蛇形命名" 的複數形式作為表名；

例如，模型名稱是 `UserOrder`，表名稱是 `user_orders`。

### 創建模型

使用 `make:model` 命令創建模型：

```shell
go run . artisan make:model User
go run . artisan make:model user/User
```

創建的模型文件位於 `app/models/user.go` 文件，內容如下：

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

如果您想將模型字段設置為 `any`，需要添加額外的標籤：`gorm:"type:text"`：

```go
type User struct {
  orm.Model
  Name   string
  Avatar string
  Detail any `gorm:"type:text"`
  orm.SoftDeletes
}
```

有關標籤使用的更多詳細信息，請參見：https://gorm.io/docs/models.html。

#### 基於資料表創建模型

```shell
./artisan make:model --table=users User

// 如果模型已存在，您可以使用 -f 選項強制覆蓋
./artisan make:model --table=users -f User
```

如果資料表具有框架無法識別的字段類型，您可以調用 `facades.Schema().Extend` 方法在 `app/providers/database_service_provider.go` 文件的 `Boot` 方法中擴展字段類型：

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

### 資料庫連接

默認情況下，所有模型都使用為您的應用程序配置的預設資料庫連接。 如果您希望在與特定模型互動時指定不同的連接，則需要在模型上定義一個 `Connection` 方法。

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

### 設置全局範圍

模型支持設置 `GlobalScope` 方法，該方法限制查詢、更新和刪除操作的範圍：

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

## facades.Orm() 可用函數

| 名稱          | 操作                                                                                                                                       |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 連接          | [指定資料庫連接](#指定資料庫連接)                                                                                                                      |
| DB          | [通用資料庫介面 sql.DB](#通用資料庫介面 sql.DB) |
| 查詢          | [獲取資料庫實例](#獲取資料庫實例)                                                                                                                      |
| 事務          | [交易](#交易)                                                                                                                                |
| WithContext | [注入 Context](#注入 Context)                                         |

## facades.Orm().Query() 可用函數

| 函數                          | 操作                                                  |
| --------------------------- | --------------------------------------------------- |
| 開始交易                        | [開始交易](#交易)                                         |
| 提交                          | [提交交易](#transaction)                                |
| 計數                          | [計數](#計數)                                           |
| 創建                          | [創建](#創建)                                           |
| 光標                          | [游標](#游標)                                           |
| 刪除                          | [刪除](#刪除)                                           |
| 唯一的                         | [過濾重複](#過濾重複)                                       |
| 驅動                          | [獲取驅動程式](#獲取驅動程式)                                   |
| 執行                          | [執行原生更新 SQL](#執行原生更新-SQL)                           |
| 存在                          | [存在](#存在)                                           |
| 查找                          | [通過 ID 查詢一行或多行](#query-one-or-multiple-lines-by-id) |
| 查找或失敗                       | [未找到返回錯誤](#not-found-return-error)                  |
| 第一個                         | [查詢一行](#query-one-line)                             |
| 第一個或                        | [查詢或通過回調返回數據](#query-one-line)                      |
| 第一個或創建                      | [檢索或創建模型](#retrieving-or-creating-models)           |
| 第一個或新建                      | [檢索或新建模型](#retrieving-or-creating-models)           |
| 第一個或失敗                      | [未找到錯誤](#not-found-error)                           |
| 強制刪除                        | [強制刪除](#delete)                                     |
| 獲取                          | [查詢多行](#query-multiple-lines)                       |
| 分組                          | [分組](#group-by--having)                             |
| 擁有                          | [擁有](#group-by-having)                              |
| 聯接                          | [聯接](#join)                                         |
| 限制                          | [限制](#limit)                                        |
| LockForUpdate               | [悲觀鎖定](#pessimistic-locking)                        |
| 模型                          | [指定模型](#specify-table-query)                        |
| Offset                      | [偏移量](#offset)                                      |
| 排序                          | [訂單](#order)                                        |
| OrderBy                     | [訂單](#order)                                        |
| OrderByDesc                 | [訂單](#order)                                        |
| 隨機排序                        | [訂單](#order)                                        |
| OrWhere                     | [或Where](#where)                                    |
| OrWhereNotIn                | [或WhereNotIn](#where)                               |
| OrWhereNull                 | [或WhereNull](#where)                                |
| OrWhereIn                   | [或WhereIn](#where)                                  |
| OrWhereJsonContains         | [查詢條件](#where-條件)                                   |
| OrWhereJsonContainsKey      | [查詢條件](#where-條件)                                   |
| OrWhereJsonDoesntContain    | [查詢條件](#where-條件)                                   |
| OrWhereJsonDoesntContainKey | [查詢條件](#where-條件)                                   |
| OrWhereJsonLength           | [查詢條件](#where-條件)                                   |
| 分頁                          | [分頁](#分頁)                                           |
| Pluck                       | [查詢單個欄位](#查詢單個欄位)                                   |
| 原始                          | [執行原生 SQL](#執行原生-SQL)                               |
| 恢復                          | [恢復](#恢復)                                           |
| 回滾                          | [回滾交易](#交易)                                         |
| 保存                          | [更新現有模型](#update-a-existing-model)                  |
| SaveQuietly                 | [無事件地保存單個模型](#saving-a-single-model-without-events) |
| 掃描                          | [掃描結構](#execute-native-sql)                         |
| 範疇                          | [範圍](#scopes)                                       |
| 選擇                          | [指定欄位](#specify-fields)                             |
| SharedLock                  | [悲觀鎖定](#pessimistic-locking)                        |
| 總和                          | [總和](#sum)                                          |
| 表格                          | [指定表格](#specify-table-query)                        |
| ToSql                       | [獲取 SQL](#get-sql)                                  |
| ToRawSql                    | [獲取 SQL](#get-sql)                                  |
| 更新                          | [更新單個欄位](#update-a-single-column)                   |
| UpdateOrCreate              | [更新或創建](#update-or-create)                          |
| Where                       | [Where](#where)                                     |
| WhereBetween                | [WhereBetween](#where)                              |
| WhereNotBetween             | [WhereNotBetween](#where)                           |
| WhereNotIn                  | [WhereNotIn](#where)                                |
| WhereNull                   | [WhereNull](#where)                                 |
| WhereIn                     | [WhereIn](#where)                                   |
| WhereJsonContains           | [查詢條件](#where-條件)                                   |
| WhereJsonContainsKey        | [查詢條件](#where-條件)                                   |
| WhereJsonDoesntContain      | [查詢條件](#where-條件)                                   |
| WhereJsonDoesntContainKey   | [查詢條件](#where-條件)                                   |
| WhereJsonLength             | [查詢條件](#where-條件)                                   |
| WithoutEvents               | [靜音事件](#靜音事件)                                       |
| WithTrashed                 | [查詢軟刪除的資料](#查詢軟刪除的資料)                               |

## Query Builder

### 注入 Context

```go
facades.Orm().WithContext(ctx)
```

### Specify Database Connection

如果在 `config/database.go` 中定義了多個數據庫連接，可以通過 `facades.Orm().Connection` 函數使用這些連接。 傳遞給 `Connection` 的連接名稱應是 `config/database.go` 中配置的連接之一：

```go
facades.Orm().Connection("mysql")
```

### 通用數據庫介面 sql.DB

通用數據庫介面 sql.DB，然後使用它提供的功能：

```go
db, err := facades.Orm().DB()
db, err := facades.Orm().Connection("mysql").DB()

// Ping
db.Ping()

// Close
db.Close()

// 返回數據庫統計資料
db.Stats()

// SetMaxIdleConns 設置空閒連接池中的最大連接數
db.SetMaxIdleConns(10)

// SetMaxOpenConns 設置數據庫的最大打開連接數
db.SetMaxOpenConns(100)

// SetConnMaxLifetime 設置連接可以重複使用的最大時間
db.SetConnMaxLifetime(time.Hour)
```

### 獲取數據庫實例

在每次特定的數據庫操作之前，需要獲取數據庫的實例。

```go
facades.Orm().Query()
facades.Orm().Connection("mysql").Query()
facades.Orm().WithContext(ctx).Query()
```

### 選擇

#### 查詢一行

```go
var user models.User
facades.Orm().Query().First(&user)
// SELECT * FROM `users` ORDER BY `users`.`id` LIMIT 1;
```

有時如果未找到任何結果，您可能希望執行其他操作。 `FirstOr` 方法將返回單個模型實例，或者如果未找到任何結果，則執行給定的閉包。 您可以在閉包中設置模型的值：

```go
facades.Orm().Query().Where("name", "first_user").FirstOr(&user, func() error {
  user.Name = "goravel"

  return nil
})
```

#### 通過 ID 查詢一行或多行

```go
var user models.User
facades.Orm().Query().Find(&user, 1)
// SELECT * FROM `users` WHERE `users`.`id` = 1;

var users []models.User
facades.Orm().Query().Find(&users, []int{1,2,3})
// SELECT * FROM `users` WHERE `users`.`id` IN (1,2,3);
```

#### 未找到返回錯誤

```go
var user models.User
err := facades.Orm().Query().FindOrFail(&user, 1)
```

#### 當用戶表的主鍵為 `string` 類型時，調用 `Find` 方法時需要指定主鍵

```go
var user models.User
facades.Orm().Query().Find(&user, "uuid=?" ,"a")
// SELECT * FROM `users` WHERE `users`.`uuid` = "a";
```

#### 查詢多行

```go
var users []models.User
facades.Orm().Query().Where("id in ?", []int{1,2,3}).Get(&users)
// SELECT * FROM `users` WHERE id in (1,2,3);
```

#### 檢索或創建模型

`FirstOrCreate` 方法使用指定的列/值對搜索數據庫記錄。 如果模型在數據庫中找不到，它將創建一個新的記錄，屬性來自將第一個參數與可選的第二個參數合併。

類似地，`FirstOrNew` 方法也試圖根據給定的屬性在數據庫中查找記錄。 然而，如果找不到，則返回模型的新實例。 重要的是要注意，這個新模型尚未保存到數據庫，您需要手動調用 `Save` 方法來保存。

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

#### 未找到錯誤

當請求的項目未找到時，`First` 方法不會生成錯誤。 要生成錯誤，請使用 `FirstOrFail` 方法：

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

查詢 JSON 列

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

### 限制

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

### 排序

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

### 分頁

```go
var users []models.User
var total int64
facades.Orm().Query().Paginate(1, 10, &users, &total)
// SELECT count(*) FROM `users`;
// SELECT * FROM `users` LIMIT 10;
```

### 查詢單列

```go
var ages []int64
facades.Orm().Query().Model(&models.User{}).Pluck("age", &ages)
// SELECT `age` FROM `users`;
```

### 指定表查詢

如果您想查詢某些聚合數據，您需要指定一個特定的表。

指定模型

```go
count, err := facades.Orm().Query().Model(&models.User{}).Count()
// SELECT count(*) FROM `users` WHERE deleted_at IS NULL;
```

指定表

```go
count, err := facades.Orm().Query().Table("users").Count()
// SELECT count(*) FROM `users`; // 獲取所有記錄，不論是否被刪除
```

### 獲取 SQL

獲取帶佔位符的 SQL：

```go
facades.Orm().Query().ToSql().Get(models.User{})
// SELECT * FROM "users" WHERE "id" = $1 AND "users"."deleted_at" IS NULL
```

獲取帶值的 SQL：

```go
facades.Orm().Query().ToRawSql().Get(models.User{})
// SELECT * FROM "users" WHERE "id" = 1 AND "users"."deleted_at" IS NULL
```

這些方法可以在 `ToSql` 和 `ToRawSql` 之後調用：`Count`、`Create`、`Delete`、`Find`、`First`、`Get`、`Pluck`、`Save`、`Sum`、`Update`.

### 計數

```go
count, err := facades.Orm().Query().Table("users").Count()
// SELECT count(*) FROM `users` WHERE name = 'tom';
```

### 指定欄位

`Select` 允許您指定要從數據庫檢索的欄位，默認情況下，ORM 會檢索所有欄位。

```go
facades.Orm().Query().Select("name", "age").Get(&users)
// SELECT `name`,`age` FROM `users`;
```

### 按組和擁有

```go
type Result struct {
  Name  string
  Total int
}

var result Result
facades.Orm().Query().Model(&models.User{}).Select("name, sum(age) as total").Group("name").Having("name = ?", "tom").Get(&result)
// SELECT name, sum(age) as total FROM `users` GROUP BY `name` HAVING name = "tom";
```

### 聯接

```go
type Result struct {
  Name  string
  Email string
}

var result Result
facades.Orm().Query().Model(&models.User{}).Select("users.name, emails.email").Join("left join emails on emails.user_id = users.id").Scan(&result)
// SELECT users.name, emails.email FROM `users` LEFT JOIN emails ON emails.user_id = users.id;
```

### 創建

```go
user := models.User{Name: "tom", Age: 18}
err := facades.Orm().Query().Create(&user)
// INSERT INTO users (name, age, created_at, updated_at) VALUES ("tom", 18, "2022-09-27 22:00:00", "2022-09-27 22:00:00");

// 不觸發模型事件
err := facades.Orm().Query().Table("users").Create(map[string]any{
  "name": "Goravel",
})

// 觸發模型事件
err := facades.Orm().Query().Model(&models.User{}).Create(map[string]any{
  "name": "Goravel",
})
```

### 多重創建

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

> `created_at` 和 `updated_at` 將自動填充。

### 光標

可用於在迭代數十萬個 Eloquent 模型記錄時顯著減少應用程序的內存消耗。 請注意，`Cursor` 方法可以與 `With` 同時使用，請使用 [Lazy Eager Loading](./relationships.md#lazy-eager-loading) 在 `for` 邏輯中加載關係。

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

### 保存模型

#### 更新現有模型

```go
var user models.User
facades.Orm().Query().First(&user)

user.Name = "tom"
user.Age = 100
facades.Orm().Query().Save(&user)
// UPDATE `users` SET `created_at`='2023-09-14 16:03:29.454',`updated_at`='2023-09-18 21:05:59.896',`name`='tom',`age`=100,`avatar`='' WHERE `id` = 1;
```

#### 更新欄位

```go
facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Update("name", "hello")
// UPDATE `users` SET `name`='hello',`updated_at`='2023-09-18 21:06:30.373' WHERE `name` = 'tom';

facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Update(models.User{Name: "hello", Age: 18})
facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Update(map[string]any{"name": "hello", "age": 18})
// UPDATE `users` SET `updated_at`='2023-09-18 21:07:06.489',`name`='hello',`age`=18 WHERE `name` = 'tom';
```

> 使用 `struct` 更新時，Orm 將僅更新非零欄位。 您可能希望使用 `map` 來更新屬性或使用 `Select` 指定要更新的欄位。 請注意，`struct` 只能是 `Model`，如果您想使用非 `Model` 進行更新，則需要使用 `.Table("users")`，但是，這時候 `updated_at` 欄位不能自動更新。

#### 更新 JSON 欄位

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

#### 更新或創建

通過 `name` 查詢，如果不存在，則根據 `name`、`avatar` 創建，如果存在，則根據 `name` 更新 `avatar`：

```go
facades.Orm().Query().UpdateOrCreate(&user, models.User{Name: "name"}, models.User{Avatar: "avatar"})
// SELECT * FROM `users` WHERE `users`.`name` = 'name' AND `users`.`deleted_at` IS NULL ORDER BY `users`.`id` LIMIT 1;
// INSERT INTO `users` (`created_at`,`updated_at`,`deleted_at`,`name`,`avatar`) VALUES ('2023-03-11 10:11:08.869','2023-03-11 10:11:08.869',NULL,'name','avatar');
// UPDATE `users` SET `name`='name',avatar`='avatar',`updated_at`='2023-03-11 10:11:08.881' WHERE users`.`deleted_at` IS NULL AND `id` = 1;
```

### 刪除

通過模型刪除，方法返回受語句影響的行數：

```go
var user models.User
facades.Orm().Query().Find(&user, 1)
res, err := facades.Orm().Query().Delete(&user)
res, err := facades.Orm().Query().Model(&models.User{}).Where("id", 1).Delete()
res, err := facades.Orm().Query().Table("users").Where("id", 1).Delete()
// DELETE FROM `users` WHERE `users`.`id` = 1;

num := res.RowsAffected
```

多重刪除

```go
facades.Orm().Query().Where("name", "tom").Delete(&models.User{})
// DELETE FROM `users` WHERE name = 'tom';
```

想要強制刪除一個軟刪除的數據。

```go
facades.Orm().Query().Where("name", "tom").ForceDelete(&models.User{})
facades.Orm().Query().Model(&models.User{}).Where("name", "tom").ForceDelete()
facades.Orm().Query().Table("users").Where("name", "tom").ForceDelete()
```

您可以透過 `Select` 刪除具有模型關聯的記錄:

```go
// 刪除用戶的帳戶當刪除用戶時
facades.Orm().Query().Select("Account").Delete(&user)

// 刪除用戶的訂單和信用卡當刪除用戶時
facades.Orm().Query().Select("Orders", "CreditCards").Delete(&user)

// 刪除用戶的所有子關聯當刪除用戶時
facades.Orm().Query().Select(orm.Associations).Delete(&user)

// 刪除用戶的所有帳戶當刪除用戶時
facades.Orm().Query().Select("Account").Delete(&users)
```

注意：只有當記錄的主鍵不為空時，關聯才會被刪除，Orm使用這些主鍵作為條件刪除關聯記錄:

```go
// 刪除用戶名為 'goravel' 的使用者，但不刪除該用戶的帳戶
facades.Orm().Query().Select("Account").Where("name", "goravel").Delete(&models.User{})

// 刪除用戶名為 'goravel' 且 id = 1 的用戶，並刪除該用戶的帳戶
facades.Orm().Query().Select("Account").Where("name", "goravel").Delete(&models.User{ID: 1})

// 刪除 id = 1 的用戶並刪除該用戶的帳戶
facades.Orm().Query().Select("Account").Delete(&models.User{ID: 1})
```

如果在沒有任何條件的情況下執行批量刪除，ORM不會這樣做，並且返回錯誤。 所以您必須添加一些條件，或者使用原生 SQL。

### 查詢軟刪除數據

```go
var user models.User
facades.Orm().Query().WithTrashed().First(&user)
```

### 過濾重複項

```go
var users []models.User
facades.Orm().Query().Distinct("name").Find(&users)
```

### 獲取驅動程式

```go
driver := facades.Orm().Query().Driver()

// 判斷驅動程式
if driver == orm.DriverMysql {}
```

### 執行原生 SQL

```go
type Result struct {
  ID   int
  Name string
  Age  int
}

var result Result
facades.Orm().Query().Raw("SELECT id, name, age FROM users WHERE name = ?", "tom").Scan(&result)
```

### 執行原生更新 SQL

該語句所影響的行數由方法返回:

```go
res, err := facades.Orm().Query().Exec("DROP TABLE users")
// DROP TABLE `users`;

num := res.RowsAffected
```

### 存在

```go
exists, err := facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Exists()
```

### 恢復

```go
facades.Orm().Query().WithTrashed().Restore(&models.User{ID: 1})
facades.Orm().Query().Model(&models.User{ID: 1}).WithTrashed().Restore()
// UPDATE `users` SET `deleted_at`=NULL WHERE `id` = 1;
```

### 事務

您可以通過 `Transaction` 函數執行事務。

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

您也可以手動控制事務的流程：

```go
tx, err := facades.Orm().Query().BeginTransaction()
user := models.User{Name: "Goravel"}
if err := tx.Create(&user); err != nil {
  err := tx.Rollback()
} else {
  err := tx.Commit()
}
```

### 範疇

允許您指定常用查詢，這些查詢可以在調用方法時引用。

```go
func Paginator(page string, limit string) func(methods orm.Query) orm.Query {
  return func(query orm.Query) orm.Query {
    page, _ := strconv.Atoi(page)
    limit, _ := strconv.Atoi(limit)
    offset := (page - 1) * limit

    return query.Offset(offset).Limit(limit)
  }
}

// scopes.Paginator 是一個自定義函數: func(ormcontract.Query) ormcontract.Query
facades.Orm().Query().Scopes(scopes.Paginator(page, limit)).Find(&entries)
```

### 原生表達式

您可以使用 `db.Raw` 方法來更新字段：

```go
import "github.com/goravel/framework/database/db"

facades.Orm().Query().Model(&user).Update("age", db.Raw("age - ?", 1))
// UPDATE `users` SET `age`=age - 1,`updated_at`='2023-09-14 14:03:20.899' WHERE `users`.`deleted_at` IS NULL AND `id` = 1;
```

### 悲觀鎖定

查詢構建器還包括一些函數，幫助您在執行 `select` 語句時實現 "悲觀鎖定"。

要使用 "共享鎖" 執行語句，您可以調用 `SharedLock` 方法。 共享鎖在您的事務提交之前，防止被選擇的行被修改:

```go
var users []models.User
facades.Orm().Query().Where("votes", ">", 100).SharedLock().Get(&users)
```

或者，您可以使用 `LockForUpdate` 方法。 "for update" 鎖防止選定的記錄被修改或在另一個共享鎖下被選擇:

```go
var users []models.User
facades.Orm().Query().Where("votes", ">", 100).LockForUpdate().Get(&users)
```

### 總和

```go
sum, err := facades.Orm().Query().Model(models.User{}).Sum("id")
```

## 事件

Orm 模型會觸發幾個事件，使您可以在模型生命週期的以下時刻進行掛鈎：`Retrieved`、`Creating`、`Created`、`Updating`、`Updated`、`Saving`、`Saved`、`Deleting`、`Deleted`、`ForceDeleting`、`ForceDeleted`、`Restored`、`Restoring`。

當從資料庫中檢索到現有模型時，`Retrieved` 事件將被觸發。 當一個新模型第一次被保存時，`Creating` 和 `Created` 事件將被觸發。 當更改了現有模型並調用 `Save` 方法時，`Updating` / `Updated` 事件將被觸發。 即使模型的屬性未被更改，`Saving` / `Saved` 事件在創建或更新模型時也會被觸發。 以 `-ing` 結尾的事件名稱在模型的任何更改被持久化之前觸發，而以 `-ed` 結尾的事件名稱在模型的更改被持久化之後觸發。

注意：只有在操作模型時，所有事件才會被觸發。 例如，如果您想在調用 `Update` 方法時觸發 `Updating` 和 `Updated` 事件，您需要將現有模型傳遞給 `Model` 方法：`facades.Orm().Query().Model(&user).Update("name", "Goravel")`。

要開始監聽模型事件，請在您的模型上定義 `DispatchesEvents` 方法。 此屬性將模型生命週期的各個點映射到您自己的事件類。

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

> 注意：只註冊您需要的事件。 在通過 Orm 進行批量操作時，不會觸發模型事件。

### 觀察者

#### 定義觀察者

如果您在給定模型上監聽許多事件，您可以使用觀察者將所有的監聽者組合成一個類。 觀察者類擁有反映您想要監聽的 Eloquent 事件的方法名稱。 每個這些方法只接收受影響的模型作為唯一的參數。 `make:observer` Artisan 命令是創建新觀察者類的最簡單方法：

```shell
go run . artisan make:observer UserObserver
go run . artisan make:observer user/UserObserver
```

該命令將把新的觀察者放置在您的 `app/observers` 目錄中。 如果該目錄不存在，Artisan 將為您創建它。 您的新觀察者將如下所示：

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

模板觀察者僅包含某些事件，您可以根據需要添加其他事件。

要註冊觀察者，您需要在希望監視的模型上調用 `Observe` 方法。 您可以在應用程序的 `app/providers/event_service_provider.go::Boot` 服務提供者的 `Boot` 方法中註冊觀察者:

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

> 注意：如果您同時設置 `DispatchesEvents` 和 `Observer`，則只會應用 `DispatchesEvents`。

#### 觀察者中的參數

`event` 參數將傳遞給所有觀察者：

| 方法名          | 操作                                        |
| ------------ | ----------------------------------------- |
| 上下文          | 獲取通過 `facades.Orm().WithContext()` 傳遞的上下文 |
| GetAttribute | 獲取修改後的值，如果未修改，則獲取原始值，如果沒有原始值，則返回 nil      |
| GetOriginal  | 獲取原始值，如果沒有原始值，則返回 nil                     |
| IsDirty      | 確定該字段是否經過修改                               |
| IsClean      | IsDirty 的反轉                               |
| 查詢           | 獲取一個新的查詢，可用於事務                            |
| SetAttribute | 為字段設置新值                                   |

### 靜音事件

您可能偶爾需要暫時 "靜音" 由一個模型觸發的所有事件。 您可以使用 `WithoutEvents` 方法來實現這一點：

```go
var user models.User
facades.Orm().Query().WithoutEvents().Find(&user, 1)
```

#### 在不觸發事件的情況下保存單個模型

有時您可能希望在不觸發任何事件的情況下"保存"給定模型。 您可以使用 `SaveQuietly` 方法來完成這項工作：

```go
var user models.User
err := facades.Orm().Query().FindOrFail(&user, 1)
user.Name = "Goravel"
err := facades.Orm().Query().SaveQuietly(&user)
```
