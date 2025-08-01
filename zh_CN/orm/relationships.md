# Relationships

[[toc]]

## 简介

It's common for database tables to be interconnected. For instance, a blog post may have many comments, or an order may be linked to the user who placed it. `Orm` simplifies managing and dealing with such relationships, and it can handle various common relationships:

- [一对一](#一对一)
- [一对多](#一对多)
- [多对多](#多对多)
- [多态](#多态)

## 定义关联

### 一对一

A one-to-one relationship is a very basic type of database relationship. 一对一是最基本的数据库关系。 例如，一个 `User` 模型可能与一个 `Phone` 模型相关联。为了定义这个关联关系，我们要在 `User` 模型中定义一个 `Phone`：

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

When using `Orm`, it automatically assigns the foreign key to the relationship based on the parent model name. For instance, the `Phone` model is assumed to have a `UserID` foreign key by default. However, if you wish to change this convention, you can add a `foreignKey` tag to the `Phone` field in `User` model. (This also applies to other relationships.)

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

Additionally, when using `Orm`, it is assumed that the foreign key should match the primary key column of the parent. This means that `Orm` will search for the user's `ID` column value in the `UserId` column of the `Phone` record. 另外，`Orm` 假设外键的值是与父模型的主键（Primary Key）相同的。换句话说，`Orm` 将会通过 `Phone` 记录的 `UserID` 列中查找与用户表的 `id` 列相匹配的值。如果你希望使用自定义的主键值，可以在 `User` 模型中为 `Phone` 字段添加 `references` Tag（其他关联关系类同）： To do this, simply pass a third argument to the `hasOne` method. (Other relationship setups are similar.)

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

#### 定义反向关联

We can access the `Phone` model from our `User` model. Now, we need to establish a relationship on `Phone` model that allows us to access the phone's owner. 我们已经能从 `User` 模型访问到 `Phone` 模型了。接下来，让我们再在 `Phone` 模型上定义一个关联，它能让我们访问到拥有该电话的用户。我们可以在 `Phone` 模型中定义一个 `User` 字段：

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

### 一对多

A one-to-many relationship is used to define relationships where a single model is the parent to one or more child models. For example, a blog post may have an infinite number of comments. 当要定义一个模型是其他 （一个或者多个）模型的父模型这种关系时，可以使用一对多关联。例如，一篇博客可以有很多条评论。和一对一模型关联一样，一对多关联也是在 Orm 模型文件中定义一个字段：

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

Remember, `Orm` will automatically determine the proper foreign key column for the `Comment` model. By convention, Orm will take the "hump case" name of the parent model and suffix it with `ID`. 注意，Orm 将会自动为 `Comment` 模型选择一个合适的外键。通常，这个外键是通过使用父模型的「驼峰命名」方式，然后再加上 `ID` 的方式来命名的。因此，在上面这个例子中，Orm 将会默认 `Comment` 模型的外键是 `PostID` 字段。

### 一对多 (反向) / 属于

Now that we can access all of a post's comments, let's define a relationship to allow a comment to access its parent post. To define the inverse of a `One To Many` relationship, define a relationship method on the child model which calls the `belongsTo` method:

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

## 多对多关联

Many-to-many relations are slightly more complicated than `One To One` and `One To Many` relationships. An example of a many-to-many relationship is a user that has many roles and those roles are also shared by other users in the application. For example, a user may be assigned the role of "Author" and "Editor"; however, those roles may also be assigned to other users as well. So, a user has many roles and a role has many users.

### 表结构

要定义这种关联，需要三个数据库表: `users`, `roles` 和 `role_user`。`role_user` 表的命名可以自定义。该表包含了 `user_id` 和 `role_id` 字段，用作链接 `users` 和 `roles` 的中间表。 The `role_user` table naming can be customized and it contains `user_id` and `role_id` columns. This table is used as an intermediate table linking users and roles.

特别提醒，由于角色可以属于多个用户，因此我们不能简单地在 `roles` 表上放置 `user_id` 列。如果这样，这意味着角色只能属于一个用户。为了支持将角色分配给多个用户，需要使用 `role_user` 表。我们可以这样定义表结构： This would mean that a role could only belong to a single user. In order to provide support for roles being assigned to multiple users, the `role_user` table is needed. We can summarize the relationship's table structure like so:

```
users
  id - integer
  name - string

roles
  id - integer
  name - string

role_user
  user_id - integer
  role_id - integer
```

### 模型结构

我们可以在 `User` 模型上定义一个 `Roles` 字段：

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

### 定义反向关联

要定义多对多的反向关联，只需要在 `Role` 模型中定义 `Users` 字段并附加 Tag：

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

### 自定义中间表

通常，中间表外键是通过使用父模型的「蛇形」方式，然后再加上 `_id`，您可以使用 `joinForeignKey` 与 `joinReferences` 对它进行重写：

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

对应表结构：

```
users
  id - integer
  name - string

roles
  id - integer
  name - string

role_user
  user_name - integer
  role_name - integer
```

## 多态

A polymorphic relationship allows the child model to belong to more than one type of model using a single association. For example, imagine you are building an application that allows users to share blog posts and videos. In such an application, a `Comment` model might belong to both the `Post` and `Video` models.

### 表结构

A polymorphic relation is similar to a normal relation; however, the child model can belong to more than one type of model using a single association. For example, a blog `Post` and a `User` may share a polymorphic relation to an `Image` model. Using a polymorphic relation allows you to have a single table of unique images that may be associated with posts and users. First, let's examine the table structure:

```
posts
  id - integer
  name - string

videos
  id - integer
  name - string

images
  id - integer
  url - string
  imageable_id - integer
  imageable_type - string

comments
  id - integer
  body - text
  commentable_id - integer
  commentable_type - string
```

要特别留意 `images` 表的 `imageable_id` 和 `imageable_type` 列。`imageable_id` 列包含文章或用户的 ID 值，而 `imageable_type` 列包含的则是父模型的类名。Orm 在访问 `imageable` 时使用 `imageable_type` 列来判断父模型的「类型」。`comments` 表类同。 The `imageable_id` column will contain the ID value of the post or user, while the `imageable_type` column will contain the class name of the parent model. The `imageable_type` column is used by Orm to determine which "type" of parent model to return when accessing the `imageable` relation. The `comments` table is similar.

### 模型结构

接下来，再看看建立关联的模型定义：

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

您可以使用标签 `polymorphicValue` 来更改多态类型的值，例如：

```go
type Post struct {
  orm.Model
  Name  string
  Image   *Image `gorm:"polymorphic:Imageable;polymorphicValue:master"`
}
```

## Querying Associations

假设有一个博客系统，它的 `User` 模型有许多关联的 `Post` 模型：

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

### 创建/更新关联

可以使用 `Select`, `Omit` 方法，对关联的创建和更新进行更细颗粒度控制。这两个方法不可同时使用，且对关联的控制功能只适用于 `Create`, `Update`, `Save`： These two method cannot be used at the same time and the associated control functions are only applicable to `Create`, `Update`, `Save`:

```go
user := models.User{Name: "user", Posts: []*models.Post{{Name: "post"}}}

// 创建 User 的同时创建所有子关联
facades.Orm().Query().Select(orm.Associations).Create(&user)

// 创建 User 的同时只创建 Post 子关联。注意：如果不使用 `orm.Associations`，而是单独自定义特定子关联，则此时也应将所有父模型中的字段列出。
facades.Orm().Query().Select("Name", "Posts").Create(&user)

// 创建 User 时，忽略 Post 关联，但创建其他所有子关联
facades.Orm().Query().Omit("Posts").Create(&user)

// 创建 User 时，忽略 Name 字段，但创建所有子关联
facades.Orm().Query().Omit("Name").Create(&user)

// 创建 User 时，忽略 Name 字段与所有子关联
facades.Orm().Query().Omit("Name", orm.Associations).Create(&user)
```

### 查找关联

```go
// 查找所有匹配的关联记录
var posts []models.Post
facades.Orm().Query().Model(&user).Association("Posts").Find(&posts)

// 查找带条件的关联
facades.Orm().Query().Model(&user).Where("name = ?", "goravel").Order("id desc").Association("Posts").Find(&posts)
```

### 添加关联

为 `manyToMany`, `hasMany` 添加新的关联；为 `hasOne`, `belongsTo` 替换当前的关联:

```go
facades.Orm().Query().Model(&user).Association("Posts").Append([]*models.Post{Post1, Post2})

facades.Orm().Query().Model(&user).Association("Posts").Append(&models.Post{Name: "goravel"})
```

### 替换关联

用一个新的关联替换当前的关联：

```go
facades.Orm().Query().Model(&user).Association("Posts").Replace([]*models.Post{Post1, Post2})

facades.Orm().Query().Model(&user).Association("Posts").Replace(models.Post{Name: "goravel"}, Post2)
```

### 删除关联

如果关联存在，则删除父模型与子模型之间的关系，注意，只会删除引用，不会从数据库中删除这些对象，外键需要允许为 NULL：

```go
facades.Orm().Query().Model(&user).Association("Posts").Delete([]*models.Post{Post1, Post2})

facades.Orm().Query().Model(&user).Association("Posts").Delete(Post1, Post2)
```

### 清空关联

Remove all reference between source & association, won’t delete those associations:

```go
facades.Orm().Query().Model(&user).Association("Posts").Clear()
```

### 关联计数

返回当前关联的数量：

```go
facades.Orm().Query().Model(&user).Association("Posts").Count()

// 条件计数
facades.Orm().Query().Model(&user).Where("name = ?", "goravel").Association("Posts").Count()
```

### 批量处理数据

```go
// 查询所有用户的所有文章
facades.Orm().Query().Model(&users).Association("Posts").Find(&posts)

// 从所有 Post 中删除 user A
facades.Orm().Query().Model(&users).Association("Posts").Delete(&userA)

// 获取去重的用户所属 Post 数量
facades.Orm().Query().Model(&users).Association("Posts").Count()

// 对于批量数据的 `Append`、`Replace`，参数的长度必须与数据的长度相同，否则会返回 error
var users = []models.User{user1, user2, user3}

// 有三个 user，Append userA 到 user1 的 team，Append userB 到 user2 的 team，Append userA、userB 和 userC 到 user3 的 team
facades.Orm().Query().Model(&users).Association("Team").Append(&userA, &userB, &[]models.User{userA, userB, userC})

// 重置 user1 team 为 userA，重置 user2 的 team 为 userB，重置 user3 的 team 为 userA、 userB 和 userC
facades.Orm().Query().Model(&users).Association("Team").Replace(&userA, &userB, &[]models.User{userA, userB, userC})
```

## 预加载

Eager loading conveniences for querying multiple models, and alleviates the "N + 1" query problem. 预加载为多个模型的查询提供方便，同时减轻了 `N + 1` 查询问题。 为了说明 `N + 1` 查询问题，请参考属于 `Author` 模型的 `Book` 模型：

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

我们检索所有书籍及其作者：

```go
var books models.Book
facades.Orm().Query().Find(&books)

for _, book := range books {
  var author models.Author
  facades.Orm().Query().Find(&author, book.AuthorID)
}
```

该循环将执行一个查询以检索数据库表中的所有书籍，然后对每本书执行另一个查询以检索该书的作者。 因此，如果我们有 25 本书，上面的代码将运行 26 个查询：一个查询原本的书籍信息，另外 25 个查询来检索每本书的作者。 This means that for a collection of 25 books, the loop would run 26 queries - one for the collection of books and 25 more to get the author of each book.

However, we can simplify this process using eager loading. 值得庆幸的是，我们可以使用预加载将这个操作减少到两个查询。 在构建查询时，可以使用 with 方法指定应该预加载哪些关系：

```go
var books models.Book
facades.Orm().Query().With("Author").Find(&books)

for _, book := range books {
  fmt.Println(book.Author)
}
```

对于此操作，将只执行两个查询 - 一个查询检索所有书籍，一个查询检索所有书籍的所有作者：

```sql
select * from `books`;

select * from `authors` where `id` in (1, 2, 3, 4, 5, ...);
```

### 预加载多个关联

Sometimes you may need to eager load several different relationships. 有时，你可能需要在单一操作中预加载几个不同的关联。要达成此目的，只需要多次调用 `With` 方法：

```go
var book models.Book
facades.Orm().Query().With("Author").With("Publisher").Find(&book)
```

### 嵌套预加载

To eager load a relationship's relationships, you may use "dot" syntax. For example, let's eager load all of the book's authors and all of the author's personal contacts:

```go
var book models.Book
facades.Orm().Query().With("Author").With("Author.Contacts").Find(&book)
```

### Constraining Eager Loads

有时，你可能希望预加载一个关联，同时为预加载查询添加额外查询条件。您可以通过下面方法来实现这一点： You can accomplish this as below:

```go
import "github.com/goravel/framework/contracts/database/orm"

var book models.Book
facades.Orm().Query().With("Author", "name = ?", "author").Find(&book)

facades.Orm().Query().With("Author", func(query orm.Query) orm.Query {
  return query.Where("name = ?", "author")
}).Find(&book)
```

在这个例子中，Orm 只会预加载作者的 `name` 列等于 `author` 的书籍。

### Lazy Eager Loading

有时你可能需要在已检索到父模型后立即加载关系。例如，你需要动态决定是否加载相关模型，这可能很有用： For example, this may be useful if you need to dynamically decide whether to load related models:

```go
var books models.Book
facades.Orm().Query().Find(&books)

for _, book := range books {
  if someCondition {
    err := facades.Orm().Query().Load(&book, "Author")
  }
}
```

如果要在延迟预加载的查询语句中进行条件约束，可以使用如下写法：

```go
import "github.com/goravel/framework/contracts/database/orm"

var book models.Book
facades.Orm().Query().Load(&book, "Author", "name = ?", "author").Find(&book)

facades.Orm().Query().Load(&book, "Author", func(query orm.Query) orm.Query {
  return query.Where("name = ?", "author")
}).Find(&book)
```

如果希望仅加载未被加载的关联关系时，你可以使用 `LoadMissing` 方法：

```go
facades.Orm().Query().LoadMissing(&book, "Author")
```
