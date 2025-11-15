# 關係

[[toc]]

## 概述

資料庫表之間相互聯繫是很常見的。 例如，一篇博客文章可能有很多評論，或者一個訂單可能與下訂單的用戶相關聯。 `Orm` 簡化了管理和處理這些關係的方式，並且可以處理各種常見的關係：

- [一對一](#One-To-One)
- [一對多](#One-To-Many)
- [多對多](#Many-To-Many)
- [多態](#Polymorphic)

## 定義關係

### 一對一

一對一關係是非常基本的資料庫關係類型。 例如，`User`模型可能與一個`Phone`模型相關聯。

```go
type User struct {
  orm.Model
  Name  string
  Phone   *Phone
}

type Phone struct {
  orm.Model
  UserID   uint
  Name   string
}
```

使用 `Orm` 時，它會根據父模型的名稱自動分配外鍵到該關係。 例如，`Phone` 模型默認被假設擁有 `UserID` 外鍵。 然而，如果你希望更改這種約定，可以在 `User` 模型中的 `Phone` 字段添加 `foreignKey` 標籤。 （這也適用於其他關係。）

```go
type User struct {
  orm.Model
  Name  string
  Phone   *Phone `gorm:"foreignKey:UserName"`
}

type Phone struct {
  orm.Model
  UserName string
  Name   string
}
```

此外，使用 `Orm` 時假設外鍵應與父模型的主鍵欄位相匹配。 這意味著 `Orm` 將在 `Phone` 記錄的 `UserId` 欄位中搜索用戶的 `ID` 欄位值。 如果你希望使用其他於 `ID` 的主鍵值，可以在 `User` 模型中的 `Phone` 字段添加 "Tag" 引用。 要做到這一點，只需將第三個參數傳遞到 `hasOne` 方法中。 （其他關係的設置也類似。）

```go
type User struct {
  orm.Model
  Name  string
  Phone   *Phone `gorm:"foreignKey:UserName;references:name"`
}

type Phone struct {
  orm.Model
  UserName string
  Name   string
}
```

#### 定義關係的反向

我們可以從 `User` 模型訪問 `Phone` 模型。 現在，我們需要在 `Phone` 模型上建立一個關係，這將使我們能夠訪問電話的擁有者。 為此，我們可以在 `Phone` 模型中定義一個 `User` 字段。

```go
type User struct {
  orm.Model
  Name  string
}

type Phone struct {
  orm.Model
  UserID   uint
  Name   string
  User   *User
}
```

### 一對多

一對多關係用以定義單一模型為一個或多個子模型的父模型的關係。 例如，一篇博客文章可能有無限數量的評論。 像所有其他 `Orm` 關係一樣，一對多的關係通過在 `Orm` 模型中定義一個欄位來定義：

```go
type Post struct {
  orm.Model
  Name   string
  Comments []*Comment
}

type Comment struct {
  orm.Model
  PostID   uint
  Name   string
}
```

請記住，`Orm` 將自動確定 `Comment` 模型的適當外鍵欄位。 根據慣例，Orm 將使用父模型的 "駝峰命名" 方式來命名外鍵欄位，並以 `ID` 作為後綴。 因此，在此範例中，Orm 將假設 `Comment` 模型的外鍵欄位為 `PostID`。

### 一對多（反向）/ 屬於

現在我們可以訪問所有帖子的評論，讓我們定義一個關係，使評論能夠訪問其父帖。 要定義 `一對多` 關係的反向，請在子模型上定義一個關係方法，並調用 `belongsTo` 方法：

```go
type Post struct {
  orm.Model
  Name   string
  Comments []*Comment
}

type Comment struct {
  orm.Model
  PostID   uint
  Name   string
  Post   *Post
}
```

## 多對多關係

多對多的關係比 `一對一` 和 `一對多` 的關係稍微複雜。 一個多對多關係的例子是用戶擁有多個角色，並且這些角色也由該應用程式中的其他用戶共享。 例如，一個用戶可能會被分配 "作者" 和 "編輯" 的角色；不過，這些角色也可以分配給其他用戶。 因此，一個用戶擁有多個角色，而一個角色擁有多個用戶。

### 表結構

要定義這種關係，需要三個資料庫表：`users`，`roles` 與 `role_user`。 `role_user` 表名稱可以自定義，並且它包含 `user_id` 和 `role_id` 欄位。 該表用作連結用戶和角色的中間表。

請記住，因為角色可以屬於多個用戶，我們不能簡單地在 `roles` 表中置入 `user_id` 欄位。 這將意味著角色只能屬於單一用戶。 為了支持角色分配給多個用戶，我們需要 `role_user` 表。 我們可以這樣總結關係的表結構：

```
users
  id - 整數
  name - 字串

roles
  id - 整數
  name - 字串

role_user
  user_id - 整數
  role_id - 整數
```

### 模型結構

我們可以在 `User` 模型上定義一個 `Roles` 字段：

```go
type User struct {
  orm.Model
  Name  string
  Roles   []*Role `gorm:"many2many:role_user"`
}

type Role struct {
  orm.Model
  Name   string
}
```

### 定義關係的反向

要定義關係的反向，只需在 `Role` 模型中定義 `Users` 字段並附加標籤。

```go
type User struct {
  orm.Model
  Name  string
  Roles   []*Role `gorm:"many2many:role_user"`
}

type Role struct {
  orm.Model
  Name   string
  Users  []*User `gorm:"many2many:role_user"`
}
```

### 自定義中間表

一般來說，中間表外鍵的命名是基於父模型名稱的「蛇形」命名法，你可以通過 `joinForeignKey` 和 `joinReferences` 來覆蓋它們：

```go
type User struct {
  orm.Model
  Name  string
  Roles   []*Role `gorm:"many2many:role_user;joinForeignKey:UserName;joinReferences:RoleName"`
}

type Role struct {
  orm.Model
  Name   string
}
```

對應的表結構：

```
users
  id - 整數
  name - 字串

roles
  id - 整數
  name - 字串

role_user
  user_name - 整數
  role_name - 整數
```

## 多態

多態關係允許子模型使用單一關聯屬於多種模型類型。 例如，假設你正在建構一個允許用戶分享博文和視頻的應用程式。 在這樣的應用程式中，`Comment` 模型可能同時屬於 `Post` 和 `Video` 模型。

### 表結構

多態關係與普通關係相似；然而，子模型可以使用單一關聯屬於多種模型類型。 例如，一篇博客`Post`和一個`User`可能與`Image`模型共享多態關係。 使用多態關係使你可以擁有一個唯一的圖像表，該表可能與帖子和用戶相關聯。 首先，讓我們檢查表結構：

```
posts
  id - 整數
  name - 字串

videos
  id - 整數
  name - 字串

images
  id - 整數
  url - 字串
  imageable_id - 整數
  imageable_type - 字串

comments
  id - 整數
  body - 文本
  commentable_id - 整數
  commentable_type - 字串
```

注意 `images` 表的 `imageable_id` 和 `imageable_type` 欄位。 `imageable_id` 欄位將包含文章或用戶的 ID 值，而 `imageable_type` 欄位將包含父模型的類名。 `imageable_type` 欄位用於 `Orm` 確定在訪問 `imageable` 關係時返回哪一類父模型。 `comments` 表類似。

### 模型結構

接下來，讓我們檢查構建此關係所需的模型定義：

```go
type Post struct {
  orm.Model
  Name     string
  Image    *Image `gorm:"polymorphic:Imageable"`
  Comments []*Comment `gorm:"polymorphic:Commentable"`
}

type Video struct {
  orm.Model
  Name     string
  Image    *Image `gorm:"polymorphic:Imageable"`
  Comments []*Comment `gorm:"polymorphic:Commentable"`
}

type Image struct {
  orm.Model
  Name          string
  ImageableID   uint
  ImageableType string
}

type Comment struct {
  orm.Model
  Name            string
  CommentableID   uint
  CommentableType string
}
```

你可以使用 `polymorphicValue` 標籤來更改多態類型的值，例如：

```go
type Post struct {
  orm.Model
  Name  string
  Image   *Image `gorm:"polymorphic:Imageable;polymorphicValue:master"`
}
```

## 查詢關聯

例如，假設有一個博客應用，其 `User` 模型有許多關聯的 `Post` 模型：

```go
type User struct {
  orm.Model
  Name   string
  Posts  []*Post
}

type Post struct {
  orm.Model
  UserID   uint
  Name     string
}
```

### 創建或更新關聯

你可以使用 `Select`, `Omit` 方法來控制關聯的創建和更新。 這兩個方法不能同時使用，且關聯的控制功能僅適用於 `Create`, `Update`, `Save`：

```go
user := models.User{Name: "user", Posts: []*models.Post{{Name: "post"}}}

// 在創建用戶的同時創建所有子關聯
facades.Orm().Query().Select(orm.Associations).Create(&user)

// 在創建用戶的同時僅創建 Post 子關聯。注意：如果不使用 `orm.Associations`，而是單獨自定義特定子關聯，則此時也應將所有父模型中的欄位列出。
facades.Orm().Query().Select("Name", "Posts").Create(&user)

// 在創建用戶時，忽略 Post，但創建所有其他子關聯
facades.Orm().Query().Omit("Posts").Create(&user)

// 在創建用戶時，忽略 Name 欄位，但創建所有子關聯
facades.Orm().Query().Omit("Name").Create(&user)

// 在創建用戶時，忽略 Name 欄位及所有子關聯
facades.Orm().Query().Omit("Name", orm.Associations).Create(&user)​
```

### 查找關聯

```go
// 查找所有匹配的關聯記錄
var posts []models.Post
facades.Orm().Query().Model(&user).Association("Posts").Find(&posts)

// 查找帶條件的關聯
facades.Orm().Query().Model(&user).Where("name = ?", "goravel").Order("id desc").Association("Posts").Find(&posts)​
```

### 添加關聯

為 `manyToMany`, `hasMany` 添加新的關聯；為 `hasOne`, `belongsTo` 替換當前的關聯:

```go
facades.Orm().Query().Model(&user).Association("Posts").Append([]*models.Post{Post1, Post2})

facades.Orm().Query().Model(&user).Association("Posts").Append(&models.Post{Name: "goravel"})​
```

### 更改關聯

用新的關聯替換當前的關聯：

```go
facades.Orm().Query().Model(&user).Association("Posts").Replace([]*models.Post{Post1, Post2})

facades.Orm().Query().Model(&user).Association("Posts").Replace(models.Post{Name: "goravel"}, Post2)
```

### 刪除關聯

如果關聯存在，則刪除父模型與子模型之間的關係，注意，只會刪除引用，不會從資料庫中刪除這些物件，外鍵必須為 NULL：

```go
facades.Orm().Query().Model(&user).Association("Posts").Delete([]*models.Post{Post1, Post2})

facades.Orm().Query().Model(&user).Association("Posts").Delete(Post1, Post2)
```

### 清空關聯

移除源與關聯之間的所有引用，但不會刪除這些關聯：

```go
facades.Orm().Query().Model(&user).Association("Posts").Clear()
```

### 關聯計數

返回當前關聯的數量：

```go
facades.Orm().Query().Model(&user).Association("Posts").Count()

// 條件計數
facades.Orm().Query().Model(&user).Where("name = ?", "goravel").Association("Posts").Count()
```

### 批量處理數據

```go
// 查詢所有用戶的所有文章
facades.Orm().Query().Model(&users).Association("Posts").Find(&posts)

// 從所有 Post 中刪除 user A
facades.Orm().Query().Model(&users).Association("Posts").Delete(&userA)

// 獲取去重的用戶所屬 Post 數量
facades.Orm().Query().Model(&users).Association("Posts").Count()

// 對於批量數據的 `Append`、`Replace`，參數的長度必須與數據的長度相同，否則會返回錯誤
var users = []models.User{user1, user2, user3}

// 有三個用戶，Append userA 到 user1 的 team，Append userB 到 user2 的 team，Append userA、userB 和 userC 到 user3 的 team
facades.Orm().Query().Model(&users).Association("Team").Append(&userA, &userB, &[]models.User{userA, userB, userC})

// 重置 user1 的 team 為 userA，重置 user2 的 team 為 userB，重置 user3 的 team 為 userA、userB 和 userC
```

## 預加載

預加載為多個模型的查詢提供方便，同時減輕了 "N + 1" 查詢問題。 為了說明 N + 1 查詢問題，考慮一個 `Book` 模型 "屬於" 一個 `Author` 模型：

```go
type Author struct {
  orm.Model
  Name  string
}

type Book struct {
  orm.Model
  AuthorID   uint
  Name       string
  Author     *Author
}
```

現在，讓我們檢索所有書籍及其作者：

```go
var books []models.Book
facades.Orm().Query().Find(&books)

for _, book := range books {
  var author models.Author
  facades.Orm().Query().Find(&author, book.AuthorID)
}
```

要檢索資料庫表中的所有書籍及其作者，循環代碼會對每本書執行一次查詢。 這意味著對於 25 本書的集合，循環會執行 26 個查詢 - 一個是為了書籍集合，另外 25 個是用來獲取每本書的作者。

不過，我們可以使用預加載簡化這個過程。 通過使用 `With` 方法，我們可以指定需要預加載哪些關係，並將查詢數量減少到只有兩個。

```go
var books []models.Book
facades.Orm().Query().With("Author").Find(&books)

for _, book := range books {
  fmt.Println(book.Author)
}
```

對於此操作，將只執行兩個查詢 - 一個查詢檢索所有書籍，另一個查詢檢索所有書籍的所有作者：

```sql
select * from `books`;

select * from `authors` where `id` in (1, 2, 3, 4, 5, ...);
```

### 預加載多個關係

有時你可能需要預加載幾個不同的關係。 為了做到這一點，只需多次調用 `With` 方法：

```go
var book models.Book
facades.Orm().Query().With("Author").With("Publisher").Find(&book)
```

### 嵌套預加載

要預加載某個關係的關係，你可以使用 "點" 語法。 例如，讓我們預加載所有書籍的作者以及所有作者的個人聯絡人：

```go
var book models.Book
facades.Orm().Query().With("Author.Contacts").Find(&book)
```

### 限制預加載

有時你可能希望預加載一個關係，同時為預加載查詢指定額外的查詢條件。 你可以如下面所示完成這一點：

```go
import "github.com/goravel/framework/contracts/database/orm"

var book models.Book
facades.Orm().Query().With("Author", "name = ?", "author").Find(&book)

facades.Orm().Query().With("Author", func(query orm.Query) orm.Query {
  return query.Where("name = ?", "author")
}).Find(&book)
```

在這個例子中，Orm 只會預加載作者的 `name` 列等於 `author` 的書籍。

### 延遲預加載

有時你可能需要在已檢索到父模型後立即加載關係。 例如，如果你需要動態決定是否加載相關模型，這可能很有用：

```go
var books []models.Book
facades.Orm().Query().Find(&books)

for _, book := range books {
  if someCondition {
    err := facades.Orm().Query().Load(&book, "Author")
  }
}
```

如果你需要對預加載查詢設置額外的查詢條件，可以使用以下代碼：

```go
import "github.com/goravel/framework/contracts/database/orm"

var book models.Book
facades.Orm().Query().Load(&book, "Author", "name = ?", "author").Find(&book)

facades.Orm().Query().Load(&book, "Author", func(query orm.Query) orm.Query {
  return query.Where("name = ?", "author")
}).Find(&book)
```

要僅在關係尚未加載時才加載關係，請使用 `LoadMissing` 方法：

```go
facades.Orm().Query().LoadMissing(&book, "Author")
```
