# 关系

[[toc]]

## 简介

It's common for database tables to be interconnected. For instance, a blog post may have many comments, or an order may be linked to the user who placed it. `Orm` simplifies managing and dealing with such relationships, and it can handle various common relationships:

- [一对一](#one-to-one)
- [一对多](#one-to-many)
- [多对多](#Many-To-Many)
- [多态关联](#polymorphic)

## 定义关系

### 一对一

一对一关系是一种非常基本的数据库关系类型。 例如，一个 `User` 模型可能与一个 `Phone` 模型相关联。 一对一是最基本的数据库关系。 例如，一个 `User` 模型可能与一个 `Phone` 模型相关联。为了定义这个关联关系，我们要在 `User` 模型中定义一个 `Phone`：

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

使用 `Orm` 时，它会根据父模型名称自动为关系分配外键。 例如，默认情况下，`Phone` 模型被假定有一个 `UserID` 外键。 但是，如果你想改变这个约定，你可以在 `User` 模型的 `Phone` 字段中添加一个 `foreignKey` 标签。 （这也适用于其他关系。） For instance, the `Phone` model is assumed to have a `UserID` foreign key by default. However, if you wish to change this convention, you can add a `foreignKey` tag to the `Phone` field in `User` model. (This also applies to other relationships.)

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

Additionally, when using `Orm`, it is assumed that the foreign key should match the primary key column of the parent. This means that `Orm` will search for the user's `ID` column value in the `UserId` column of the `Phone` record. 此外，使用 `Orm` 时，假定外键应该匹配父级的主键列。
这意味着 `Orm` 将在 `Phone` 记录的 `UserId` 列中搜索用户的 `ID` 列值。 如果你
希望使用除 `ID` 之外的主键值，你可以在 `User` 模型的 `Phone` 字段中添加 "Tag" 引用。 要
做到这一点，只需向 `hasOne` 方法传递第三个参数。 （其他关系设置类似。） To do this, simply pass a third argument to the `hasOne` method. (Other relationship setups are similar.)

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

#### 定义关系的反向

We can access the `Phone` model from our `User` model. Now, we need to establish a relationship on `Phone` model that allows us to access the phone's owner. 我们可以从 `User` 模型访问 `Phone` 模型。 现在，我们需要在 `Phone` 模型上建立一个关系，
允许我们访问电话的所有者。 为此，我们可以在 `Phone` 模型中定义一个 `User` 字段。

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

A one-to-many relationship is used to define relationships where a single model is the parent to one or more child models. For example, a blog post may have an infinite number of comments. 一对多关系用于定义单个模型作为一个或多个子模型的父模型的关系。 例如，一篇博客文章可能有无限数量的评论。 像所有其他的`Orm`关系一样，一对多关系是通过在你的`Orm`模型上定义一个字段来定义的：

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

Remember, `Orm` will automatically determine the proper foreign key column for the `Comment` model. By convention, Orm will take the "hump case" name of the parent model and suffix it with `ID`. 请记住，`Orm`将自动为`Comment`模型确定适当的外键列。 按照惯例，Orm将取父模型的"驼峰命名"名称并在后面加上`ID`。 所以，在这个例子中，Orm会假设`Comment`模型上的外键列是`PostID`。

### 一对多（反向）/ 属于

Now that we can access all of a post's comments, let's define a relationship to allow a comment to access its parent post. 现在我们可以访问一篇文章的所有评论，让我们定义一个关系来允许评论访问其父文章。 要定义`一对多`关系的反向关系，在子模型上定义一个调用`belongsTo`方法的关系方法：

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

## 多对多关系

Many-to-many relations are slightly more complicated than `One To One` and `One To Many` relationships. 多对多关系比`一对一`和`一对多`关系稍微复杂一些。 多对多关系的一个例子是一个用户拥有多个角色，而这些角色也被应用程序中的其他用户共享。 例如，一个用户可能被分配"作者"和"编辑"的角色；然而，这些角色也可能被分配给其他用户。 因此，一个用户有多个角色，一个角色也有多个用户。 For example, a user may be assigned the role of "Author" and "Editor"; however, those roles may also be assigned to other users as well. So, a user has many roles and a role has many users.

### 表结构

要定义这种关系，需要三个数据库表：`users`、`roles`和`role_user`。 `role_user`表的命名可以自定义，它包含`user_id`和`role_id`列。 这个表用作连接用户和角色的中间表。 The `role_user` table naming can be customized and it contains `user_id` and `role_id` columns. This table is used as an intermediate table linking users and roles.

请记住，由于一个角色可以属于多个用户，我们不能简单地在`roles`表上放置一个`user_id`列。 这将意味着一个角色只能属于一个用户。 为了支持将角色分配给多个用户,需要使用 `role_user` 表。 我们可以这样总结关系的表结构： This would mean that a role could only belong to a single user. In order to provide support for roles being assigned to multiple users, the `role_user` table is needed. We can summarize the relationship's table structure like so:

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

### 定义关系的反向关联

要定义关系的反向,只需在 `Role` 模型中定义一个 `Users` 字段并添加一个标签。

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

通常，中间表的外键名称是由父模型名称的"蛇形命名法"生成的，你可以通过 `joinForeignKey` 和 `joinReferences` 来覆盖它们：

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

表结构：

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

## 多态关系

A polymorphic relationship allows the child model to belong to more than one type of model using a single association. For example, imagine you are building an application that allows users to share blog posts and videos. In such an application, a `Comment` model might belong to both the `Post` and `Video` models.

### 表结构

A polymorphic relation is similar to a normal relation; however, the child model can belong to more than one type of model using a single association. For example, a blog `Post` and a `User` may share a polymorphic relation to an `Image` model. 多态关系类似于普通关系；然而，子模型可以使用单个关联属于多种类型的模型。 例如，博客 `Post` 和 `User` 可能共享与 `Image` 模型的多态关系。 使用多态关系允许您拥有一个唯一图像的表，这些图像可以与文章和用户相关联。 首先，让我们检查表结构： First, let's examine the table structure:

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

要特别留意 `images` 表的 `imageable_id` 和 `imageable_type` 列。`imageable_id` 列包含文章或用户的 ID 值，而 `imageable_type` 列包含的则是父模型的类名。Orm 在访问 `imageable` 时使用 `imageable_type` 列来判断父模型的「类型」。`comments` 表类同。 The `imageable_id` column will contain the ID value of the post or user, while the `imageable_type` column will contain the class name of the parent model. 注意 `images` 表上的 `imageable_id` 和 `imageable_type` 列。 `imageable_id` 列将包含文章或用户的 ID 值，而 `imageable_type` 列将包含父模型的类名。 列 `imageable_type` 被 Orm 用于在访问 `imageable` 关系时确定要返回哪种"类型"的父模型。 `comments` 表也类似。 The `comments` table is similar.

### 模型结构

接下来，让我们检查构建这种关系所需的模型定义：

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

你可以通过 `polymorphicValue` 标签更改多态值，例如：

```go
type Post struct {
  orm.Model
  Name  string
  Image   *Image `gorm:"polymorphic:Imageable;polymorphicValue:master"`
}
```

## 查询关联

例如，想象一个博客应用程序，其中 `User` 模型有许多关联的 `Post` 模型：

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

### 创建或更新关联

你可以使用 `Select`、`Omit` 方法来控制关联的创建和更新。 这两种方法不能同时使用，并且关联控制功能仅适用于 `Create`、`Update`、`Save`： These two method cannot be used at the same time and the associated control functions are only applicable to `Create`, `Update`, `Save`:

```go
user := models.User{Name: "user", Posts: []*models.Post{{Name: "post"}}}

// 创建User时创建所有子关联
facades.Orm().Query().Select(orm.Associations).Create(&user)

// 创建User时只创建Post。注意：如果不使用`orm.Associations`，而是单独自定义特定子关联，此时还应列出父模型中的所有字段。
facades.Orm().Query().Select("Name", "Posts").Create(&user)

// 创建User时忽略Post，但创建所有其他子关联
facades.Orm().Query().Omit("Posts").Create(&user)

// 创建User时忽略Name字段，但创建所有子关联
facades.Orm().Query().Omit("Name").Create(&user)

// 创建User时忽略Name字段和所有子关联
facades.Orm().Query().Omit("Name", orm.Associations).Create(&user)
```

### 查找关联

```go
// 查找所有匹配的相关记录
var posts []models.Post
facades.Orm().Query().Model(&user).Association("Posts").Find(&posts)

// 使用条件查找关联
facades.Orm().Query().Model(&user).Where("name = ?", "goravel").Order("id desc").Association("Posts").Find(&posts)
```

### 追加关联

对于`多对多`、`一对多`关系追加新的关联，对于`一对一`、`一对一（反向）`关系替换当前关联：

```go
facades.Orm().Query().Model(&user).Association("Posts").Append([]*models.Post{Post1, Post2})

facades.Orm().Query().Model(&user).Association("Posts").Append(&models.Post{Name: "goravel"})
```

### 替换关联

用新的关联替换当前关联：

```go
facades.Orm().Query().Model(&user).Association("Posts").Replace([]*models.Post{Post1, Post2})

facades.Orm().Query().Model(&user).Association("Posts").Replace(models.Post{Name: "goravel"}, Post2)
```

### 删除关联

移除源和参数之间的关系（如果存在），只删除引用，不会从数据库中删除这些对象，外键必须为NULL：

```go
facades.Orm().Query().Model(&user).Association("Posts").Delete([]*models.Post{Post1, Post2})

facades.Orm().Query().Model(&user).Association("Posts").Delete(Post1, Post2)
```

### 清除关联

移除源和关联之间的所有引用，不会删除这些关联：

```go
facades.Orm().Query().Model(&user).Association("Posts").Clear()
```

### 关联计数

返回当前关联的数量：

```go
facades.Orm().Query().Model(&user).Association("Posts").Count()

// 带条件的计数
facades.Orm().Query().Model(&user).Where("name = ?", "goravel").Association("Posts").Count()
```

### 批量数据

```go
// 查找所有用户的所有角色
facades.Orm().Query().Model(&users).Association("Posts").Find(&posts)

// 从所有用户的帖子中删除用户A
facades.Orm().Query().Model(&users).Association("Posts").Delete(&userA)

// 获取所有用户帖子的不重复统计
facades.Orm().Query().Model(&users).Association("Posts").Count()

// 对于 `Append`，`Replace` 使用批量数据，参数的数量必须与数据的数量相等，否则会返回错误
var users = []models.User{user1, user2, user3}

// 我们有3个用户，将用户A添加到用户1的团队，将用户B添加到用户2的团队，将用户A、用户B和用户C添加到用户3的团队
facades.Orm().Query().Model(&users).Association("Team").Append(&userA, &userB, &[]models.User{userA, userB, userC})

// 将用户1的团队重置为用户A，将用户2的团队重置为用户B，将用户3的团队重置为用户A、用户B和用户C
facades.Orm().Query().Model(&users).Association("Team").Replace(&userA, &userB, &[]models.User{userA, userB, userC})
```

## 预加载

Eager loading conveniences for querying multiple models, and alleviates the "N + 1" query problem. 预加载方便查询多个模型，并缓解 "N + 1" 查询问题。 为了说明 N +
1 查询问题，考虑一个 `Book` 模型，它 "属于" 一个 `Author` 模型：

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

现在，让我们检索所有书籍及其作者：

```go
var books models.Book
facades.Orm().Query().Find(&books)

for _, book := range books {
  var author models.Author
  facades.Orm().Query().Find(&author, book.AuthorID)
}
```

该循环将执行一个查询以检索数据库表中的所有书籍，然后对每本书执行另一个查询以检索该书的作者。 因此，如果我们有 25 本书，上面的代码将运行 26 个查询：一个查询原本的书籍信息，另外 25 个查询来检索每本书的作者。 要检索数据库表中的所有书籍及其作者，循环代码会为每本书执行一次查询。
这意味着对于包含25本书的集合，循环将运行26个查询 - 一个用于书籍集合，25个用于获取每本书的作者。

However, we can simplify this process using eager loading. 但是，我们可以通过使用预加载来简化此过程。 通过使用 `With` 方法，我们可以指定需要被预加载的关系，并将查询数量减少到仅两个。

```go
var books models.Book
facades.Orm().Query().With("Author").Find(&books)

for _, book := range books {
  fmt.Println(book.Author)
}
```

对于这个操作，只会执行两个查询 - 一个查询用于检索所有书籍，一个查询用于检索所有书籍的作者：

```sql
select * from `books`;

select * from `authors` where `id` in (1, 2, 3, 4, 5, ...);
```

### 预加载多个关系

Sometimes you may need to eager load several different relationships. 有时，您可能需要预加载多个不同的关系。 为此，只需多次调用 `With` 方法：

```go
var book models.Book
facades.Orm().Query().With("Author").With("Publisher").Find(&book)
```

### 嵌套预加载

To eager load a relationship's relationships, you may use "dot" syntax. 要预加载一个关系的关系，您可以使用 "点" 语法。 例如，我们可以预加载所有书籍的作者以及所有作者的个人联系方式：

```go
var book models.Book
facades.Orm().Query().With("Author").With("Author.Contacts").Find(&book)
```

### Constraining Eager Loads

有时，您可能希望预加载一个关系，但也指定额外的查询条件供预加载查询使用。 您可以如下完成此操作： You can accomplish this as below:

```go
import "github.com/goravel/framework/contracts/database/orm"

var book models.Book
facades.Orm().Query().With("Author", "name = ?", "author").Find(&book)

facades.Orm().Query().With("Author", func(query orm.Query) orm.Query {
  return query.Where("name = ?", "author")
}).Find(&book)
```

在这个例子中，Orm 只会预加载帖子，其中帖子的 `name` 列等于单词 `author`。

### 懒惰的预加载

有时，您可能需要在父模型已经被检索后预加载一个关系。 例如，若您需要动态决定是否加载相关模型，这可能是有用的： For example, this may be useful if you need to dynamically decide whether to load related models:

```go
var books models.Book
facades.Orm().Query().Find(&books)

for _, book := range books {
  if someCondition {
    err := facades.Orm().Query().Load(&book, "Author")
  }
}
```

如果您需要在预加载查询上设置额外的查询约束，您可以使用以下代码：

```go
import "github.com/goravel/framework/contracts/database/orm"

var book models.Book
facades.Orm().Query().Load(&book, "Author", "name = ?", "author").Find(&book)

facades.Orm().Query().Load(&book, "Author", func(query orm.Query) orm.Query {
  return query.Where("name = ?", "author")
}).Find(&book)
```

仅在关系尚未加载时加载该关系，使用 `LoadMissing` 方法：

```go
facades.Orm().Query().LoadMissing(&book, "Author")
```
