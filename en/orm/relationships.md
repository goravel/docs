# Relationships

[[toc]]

## Introduction

It's common for database tables to be interconnected. For instance, a blog post may have many comments, or an order may be linked to the user who placed it. `Orm` simplifies managing and dealing with such relationships, and it can handle various common relationships:

- [One To One](#One-To-One)
- [One To Many](#One-To-Many)
- [Many To Many](#Many-To-Many)
- [Has One Through / Has Many Through](#Has-One-Through-Has-Many-Through)
- [Polymorphic](#Polymorphic)
- [Querying Relationship Existence](#Querying-Relationship-Existence)
- [Querying Relationship Absence](#Querying-Relationship-Absence)
- [Querying Polymorphic Relationships](#Querying-Polymorphic-Relationships)
- [Aggregating Related Models](#Aggregating-Related-Models)

## Defining Relationships

### One To One

A one-to-one relationship is a very basic type of database relationship. For example, a `User` model might be associated with one `Phone` model.

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

Additionally, when using `Orm`, it is assumed that the foreign key should match the primary key column of the parent. This means that `Orm` will search for the user's `ID` column value in the `UserId` column of the `Phone` record. If you wish to use a primary key value other than `ID`, you can add a "Tag" reference to the `Phone` field in `User` model. To do this, simply pass a third argument to the `hasOne` method. (Other relationship setups are similar.)

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

#### Defining The Inverse Of The Relationship

We can access the `Phone` model from our `User` model. Now, we need to establish a relationship on `Phone` model that allows us to access the phone's owner. To do this, we can define a `User` field in `Phone` model.

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

### One To Many

A one-to-many relationship is used to define relationships where a single model is the parent to one or more child models. For example, a blog post may have an infinite number of comments. Like all other `Orm` relationships, one-to-many relationships are defined by defining a field on your `Orm` model:

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

Remember, `Orm` will automatically determine the proper foreign key column for the `Comment` model. By convention, Orm will take the "hump case" name of the parent model and suffix it with `ID`. So, in this example, Orm will assume the foreign key column on the `Comment` model is `PostID`.

### One To Many (Inverse) / Belongs To

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

## Many To Many Relationships

Many-to-many relations are slightly more complicated than `One To One` and `One To Many` relationships. An example of a many-to-many relationship is a user that has many roles and those roles are also shared by other users in the application. For example, a user may be assigned the role of "Author" and "Editor"; however, those roles may also be assigned to other users as well. So, a user has many roles and a role has many users.

### Table Structure

To define this relationship, three database tables are needed: `users`, `roles`, and `role_user`. The `role_user` table naming can be customized and it contains `user_id` and `role_id` columns. This table is used as an intermediate table linking users and roles.

Remember, since a role can belong to many users, we cannot simply place a `user_id` column on the `roles` table. This would mean that a role could only belong to a single user. In order to provide support for roles being assigned to multiple users, the `role_user` table is needed. We can summarize the relationship's table structure like so:

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

### Model Structure

We can define a `Roles` field on `User` model:

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

### Defining The Inverse Of The Relationship

To define the inverse of the relationship, just define a `Users` field in `Role` model and append a Tag.

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

### Custom intermediate table

In general, the intermediate table foreign key is named by the "snake case" of the parent model name, you can override them by `joinForeignKey`, `joinReferences`:

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

Table structure:

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

## Has One Through / Has Many Through

`Has One Through` and `Has Many Through` reach a distant relation via an intermediate table. For example, a `Country` has many `Posts` through a `User`: countries do not directly own posts, but they own users, and users own posts.

Because GORM has no struct-tag representation for these "through" relationships, models must declare them in two places:

1. A field on the parent struct that the loader writes results into. Use `[]*Post` for `HasManyThrough` and `*Post` for `HasOneThrough`. The field name must match the key used in `ThroughRelations` (here, `"Posts"`).
2. A `ThroughRelations()` method on the parent that implements `orm.ModelWithThroughRelations`. The map describes the join columns so Goravel can compile the SQL.

```go
import "github.com/goravel/framework/contracts/database/orm"

type Country struct {
  orm.Model
  Name  string

  // Slice of pointers for HasManyThrough; the field name must match the key
  // ("Posts") used in ThroughRelations below. WithRelation / Load will
  // populate this slice
  Posts []*Post
}

func (Country) ThroughRelations() map[string]orm.ThroughRelation {
  return map[string]orm.ThroughRelation{
    "Posts": {
      Kind:           orm.HasManyThrough,
      Related:        &Post{},   // far model
      Through:        &User{},   // intermediate model
      FirstKey:       "country_id", // FK on Through (users) pointing at Parent (countries)
      SecondKey:      "user_id",    // FK on Related (posts) pointing at Through (users)
      LocalKey:       "id",         // PK on Parent (countries)
      SecondLocalKey: "id",         // PK on Through (users)
    },
  }
}
```

For a one-to-one variant, set `Kind: orm.HasOneThrough` and use `*Post` instead of `[]*Post` on the parent struct:

```go
type Supplier struct {
  orm.Model
  Name    string
  Account *Account // single pointer for HasOneThrough
}

func (Supplier) ThroughRelations() map[string]orm.ThroughRelation {
  return map[string]orm.ThroughRelation{
    "Account": {
      Kind:           orm.HasOneThrough,
      Related:        &Account{},
      Through:        &User{},
      FirstKey:       "supplier_id",
      SecondKey:      "user_id",
      LocalKey:       "id",
      SecondLocalKey: "id",
    },
  }
}
```

Once declared, a through relation can be used in `Has`, `WhereHas`, `WithCount`, `WithRelation`, and the other relationship-query helpers below just like any other relation. Note that `With` (the GORM-`Preload` shim) does **not** support through-relations — use `WithRelation` for eager loading them.

## Polymorphic

A polymorphic relationship allows the child model to belong to more than one type of model using a single association. For example, imagine you are building an application that allows users to share blog posts and videos. In such an application, a `Comment` model might belong to both the `Post` and `Video` models.

### Table structure

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

Note the `imageable_id` and `imageable_type` columns on the `images` table. The `imageable_id` column will contain the ID value of the post or user, while the `imageable_type` column will contain the class name of the parent model. The `imageable_type` column is used by Orm to determine which "type" of parent model to return when accessing the `imageable` relation. The `comments` table is similar.

### Model Structure

Next, let's examine the model definitions needed to build this relationship:

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

You can change the polymorphic value by `polymorphicValue` Tag, such as:

```go
type Post struct {
  orm.Model
  Name  string
  Image   *Image `gorm:"polymorphic:Imageable;polymorphicValue:master"`
}
```

## Querying Associations

For example, imagine a blog application in which a `User` model has many associated `Post` models:

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

### Create or Update Associations

You can use the `Select`, `Omit` methods to to control the create and update of associations. These two method cannot be used at the same time and the associated control functions are only applicable to `Create`, `Update`, `Save`:

```go
user := models.User{Name: "user", Posts: []*models.Post{{Name: "post"}}}

// Create all child associations while creating User
facades.Orm().Query().Select(orm.Associations).Create(&user)

// Only create Post while creating User. Note: If you don't use `orm.Associations`, but customize specific child associations separately, all fields in the parent model should also be listed at this time.
facades.Orm().Query().Select("Name", "Posts").Create(&user)

// When creating a User, ignore the Post, but create all other child associations
facades.Orm().Query().Omit("Posts").Create(&user)

// When creating User, ignore Name field, but create all child associations
facades.Orm().Query().Omit("Name").Create(&user)

// When creating User, ignore Name field and all child associations
facades.Orm().Query().Omit("Name", orm.Associations).Create(&user)
```

### Find Associations

```go
// Find all matching related records
var posts []models.Post
facades.Orm().Query().Model(&user).Association("Posts").Find(&posts)

// Find associations with conditions
facades.Orm().Query().Model(&user).Where("name = ?", "goravel").Order("id desc").Association("Posts").Find(&posts)
```

### Append Associations

Append new associations for `Many To Many`, `One To Many`, replace current association for `One To One`, `One To One(revers)`:

```go
facades.Orm().Query().Model(&user).Association("Posts").Append([]*models.Post{Post1, Post2})

facades.Orm().Query().Model(&user).Association("Posts").Append(&models.Post{Name: "goravel"})
```

### Replace Associations

Replace current associations with new ones:

```go
facades.Orm().Query().Model(&user).Association("Posts").Replace([]*models.Post{Post1, Post2})

facades.Orm().Query().Model(&user).Association("Posts").Replace(models.Post{Name: "goravel"}, Post2)
```

### Delete Associations

Remove the relationship between source & arguments if exists, only delete the reference, won’t delete those objects from DB, the foreign key must be NULL:

```go
facades.Orm().Query().Model(&user).Association("Posts").Delete([]*models.Post{Post1, Post2})

facades.Orm().Query().Model(&user).Association("Posts").Delete(Post1, Post2)
```

### Clear Associations

Remove all reference between source & association, won’t delete those associations:

```go
facades.Orm().Query().Model(&user).Association("Posts").Clear()
```

### Count Associations

Return the count of current associations:

```go
facades.Orm().Query().Model(&user).Association("Posts").Count()

// Count with conditions
facades.Orm().Query().Model(&user).Where("name = ?", "goravel").Association("Posts").Count()
```

### Batch Data

```go
// Find all roles for all users
facades.Orm().Query().Model(&users).Association("Posts").Find(&posts)

// Delete User A from all user's Posts
facades.Orm().Query().Model(&users).Association("Posts").Delete(&userA)

// Get distinct count of all users' Posts
facades.Orm().Query().Model(&users).Association("Posts").Count()

// For `Append`, `Replace` with batch data, the length of the arguments needs to be equal to the data's length or else it will return an error
var users = []models.User{user1, user2, user3}

// We have 3 users, Append userA to user1's team, append userB to user2's team, append userA, userB and userC to user3's team
facades.Orm().Query().Model(&users).Association("Team").Append(&userA, &userB, &[]models.User{userA, userB, userC})

// Reset user1's team to userA，reset user2's team to userB, reset user3's team to userA, userB and userC
facades.Orm().Query().Model(&users).Association("Team").Replace(&userA, &userB, &[]models.User{userA, userB, userC})
```

## Eager Loading

Eager loading conveniences for querying multiple models, and alleviates the "N + 1" query problem. To illustrate the N + 1 query problem, consider a `Book` model that "belongs to" an `Author` model:

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

Now, let's retrieve all books and their authors:

```go
var books []models.Book
facades.Orm().Query().Find(&books)

for _, book := range books {
  var author models.Author
  facades.Orm().Query().Find(&author, book.AuthorID)
}
```

To retrieve all the books in the database table along with their authors, the loop code executes a query for each book. This means that for a collection of 25 books, the loop would run 26 queries - one for the collection of books and 25 more to get the author of each book.

However, we can simplify this process using eager loading. By using the `With` method, we can specify which relationships need to be eagerly loaded and reduce the number of queries to just two.

```go
var books []models.Book
facades.Orm().Query().With("Author").Find(&books)

for _, book := range books {
  fmt.Println(book.Author)
}
```

For this operation, only two queries will be executed - one query to retrieve all books and one query to retrieve authors for all of the books:

```sql
select * from `books`;

select * from `authors` where `id` in (1, 2, 3, 4, 5, ...);
```

### Eager Loading Multiple Relationships

Sometimes you may need to eager load several different relationships. To do so, just call the `With` method multiple times:

```go
var book models.Book
facades.Orm().Query().With("Author").With("Publisher").Find(&book)
```

### Nested Eager Loading

To eager load a relationship's relationships, you may use "dot" syntax. For example, let's eager load all of the book's authors and all of the author's personal contacts:

```go
var book models.Book
facades.Orm().Query().With("Author.Contacts").Find(&book)
```

### Constraining Eager Loads

Sometimes you may wish to eager load a relationship but also specify additional query conditions for the eager loading query. You can accomplish this as below:

```go
import "github.com/goravel/framework/contracts/database/orm"

var book models.Book
facades.Orm().Query().With("Author", "name = ?", "author").Find(&book)

facades.Orm().Query().With("Author", func(query orm.Query) orm.Query {
  return query.Where("name = ?", "author")
}).Find(&book)
```

In this example, Orm will only eager load posts where the post's `name` column equals the word `author`.

### Lazy Eager Loading

Sometimes you may need to eager load a relationship after the parent model has already been retrieved. For example, this may be useful if you need to dynamically decide whether to load related models:

```go
var books []models.Book
facades.Orm().Query().Find(&books)

for _, book := range books {
  if someCondition {
    err := facades.Orm().Query().Load(&book, "Author")
  }
}
```

If you need to set additional query constraints on the eager loading query, you can use the code below:

```go
import "github.com/goravel/framework/contracts/database/orm"

var book models.Book
facades.Orm().Query().Load(&book, "Author", "name = ?", "author").Find(&book)

facades.Orm().Query().Load(&book, "Author", func(query orm.Query) orm.Query {
  return query.Where("name = ?", "author")
}).Find(&book)
```

To load a relationship only when it has not already been loaded, use the `LoadMissing` method:

```go
facades.Orm().Query().LoadMissing(&book, "Author")
```

### Goravel's Loader: `WithRelation`

`WithRelation` is an alternative to `With` that uses Goravel's own eager loader instead of delegating to GORM's `Preload`. Unlike `With`, it also supports `HasOneThrough` and `HasManyThrough` relations:

```go
import "github.com/goravel/framework/contracts/database/orm"

// Single relation.
facades.Orm().Query().WithRelation("Books").Find(&users)

// String + callback to scope the inner query.
cb := func(query orm.Query) orm.Query {
  return query.Where("status = ?", "published")
}
facades.Orm().Query().WithRelation("Books", cb).Find(&users)

// Multiple relations in one call.
facades.Orm().Query().WithRelation("Books", "Roles", "Address").Find(&users)

// Column pruning — only select id and name from books.
facades.Orm().Query().WithRelation("Books:id,name").Find(&users)

// Nested relation; "Books" is auto-filled as a noop entry if not already requested.
facades.Orm().Query().WithRelation("Books.Author").Find(&users)

// Map of relation -> callback.
facades.Orm().Query().WithRelation(map[string]orm.RelationCallback{
  "Books": cb,
  "Roles": rolesCb,
}).Find(&users)
```

For very large parent collections, `WithRelation` splits the inner `WHERE IN` query into batches of 1000 keys by default to stay within dialect limits (Oracle's 1000-expression cap, SQLite's `SQLITE_MAX_VARIABLE_NUMBER`). The chunk size is configurable via the `database.eager_load_chunk_size` config key — set it to `0` or a negative value to disable chunking entirely.

#### `WithoutRelation`

Removes the named relations from the eager-load list set by `WithRelation`. Names must match exactly (including dot-paths):

```go
facades.Orm().Query().
  WithRelation("Books", "Roles", "Books.Author").
  WithoutRelation("Roles").
  Find(&users)
```

#### `WithRelationOnly`

Clears the eager-load list set by `WithRelation`, then adds the given relations. Useful when a default-scoped query has eager loads you want to override:

```go
facades.Orm().Query().WithRelationOnly("Books").Find(&users)
```

## Querying Relationship Existence

When fetching a model, you may want to limit results based on whether a relationship exists. Use `Has` to add an exists / count condition on a related model:

```go
// Retrieve all users that have at least one book.
var users []models.User
facades.Orm().Query().Has("Books").Get(&users)
```

`Has` accepts an optional comparison operator and count to constrain how many related records must exist. The default is `>= 1`, which compiles to a `WHERE EXISTS (...)` clause; any other operator/count compiles to a `(SELECT COUNT(*) ...) <op> ?` comparison:

```go
// Users with at least three books.
facades.Orm().Query().Has("Books", ">=", 3).Get(&users)
```

Dot notation is supported for nested relations: `Has("Books.Author")` is shorthand for "users that have at least one book that has an author".

```go
facades.Orm().Query().Has("Books.Author").Get(&users)
```

### WhereHas / OrWhereHas

`WhereHas` is functionally identical to `Has` but reads more naturally when scoping the inner subquery with a callback. The callback receives a `Query` for the related model:

```go
import "github.com/goravel/framework/contracts/database/orm"

cb := func(query orm.Query) orm.Query {
  return query.Where("name = ?", "wh_target")
}
facades.Orm().Query().WhereHas("Books", cb).Get(&users)
```

`OrHas` and `OrWhereHas` join the existence clause with `OR` instead of `AND`:

```go
facades.Orm().Query().Where("name = ?", "x").OrHas("Books").Get(&users)
```

The variadic `args` accepted by `Has` / `OrHas` / `WhereHas` / `OrWhereHas` may include, in any order: a callback (`func(orm.Query) orm.Query` or `orm.RelationCallback`), a string operator (defaults to `>=`), and an integer count (defaults to `1`).

## Querying Relationship Absence

The `DoesntHave` family is the inverse of `Has` — equivalent to `Has(rel, "<", 1)`, compiled as `WHERE NOT EXISTS (...)`:

```go
// Users that have no books.
facades.Orm().Query().DoesntHave("Books").Get(&users)
```

`WhereDoesntHave` accepts a callback to scope the subquery, and the `Or*` variants join with `OR`:

```go
import "github.com/goravel/framework/contracts/database/orm"

cb := func(query orm.Query) orm.Query {
  return query.Where("title like ?", "draft%")
}
facades.Orm().Query().WhereDoesntHave("Books", cb).Get(&users)

facades.Orm().Query().Where("name = ?", "x").OrDoesntHave("Books").Get(&users)
```

## Querying Polymorphic Relationships

The `HasMorph` family scopes existence checks against polymorphic relations. Pass a slice of model instances for the morph types to consider — the value used for the polymorphic type column is derived from each model's resolved table name (e.g. `&User{}` → `"users"`):

```go
// Records whose polymorphic "Imageable" relation points at a User.
facades.Orm().Query().HasMorph("Image", []any{&User{}}).Get(&records)
```

Multiple morph types are allowed and combined with `OR` inside the existence clause:

```go
facades.Orm().Query().HasMorph("Commentable", []any{&Post{}, &Video{}}).Get(&comments)
```

`WhereHasMorph` accepts either a regular callback or a `MorphRelationCallback` that receives the morph type currently being scoped, letting you apply per-type conditions:

```go
import "github.com/goravel/framework/contracts/database/orm"

cb := func(query orm.Query, morphType string) orm.Query {
  if morphType == "posts" {
    return query.Where("status = ?", "published")
  }
  return query
}
facades.Orm().Query().WhereHasMorph("Commentable", []any{&Post{}, &Video{}}, cb).Get(&comments)
```

The full polymorphic family — `HasMorph`, `OrHasMorph`, `DoesntHaveMorph`, `OrDoesntHaveMorph`, `WhereHasMorph`, `OrWhereHasMorph`, `WhereDoesntHaveMorph`, `OrWhereDoesntHaveMorph` — mirrors the non-polymorphic helpers, with the same operator/count/callback semantics.

> Auto-discovery of morph types via `["*"]` is not supported; the slice of model instances must be explicit.

## Aggregating Related Models

`WithCount`, `WithSum`, `WithMax`, `WithMin`, `WithAvg`, `WithExists` and the lower-level `WithAggregate` add a sub-select column to the parent query for an aggregate over a related model. The result column is exposed alongside the parent's columns and can be scanned into a custom struct or read off the destination model.

### Reading the Aggregate Result

Each call appends an extra column to the parent `SELECT`, e.g. `WithCount("Books")` produces:

```sql
SELECT users.*, (SELECT COUNT(*) FROM books WHERE books.user_id = users.id) AS books_count FROM users
```

Because the value comes back as just another column, you read it the same way you read any column. There are three common patterns:

#### 1. Add a field to the model (most common)

Add a field whose `gorm:"column:..."` tag (or auto-derived name) matches the alias. Use a pointer for aggregates that can be `NULL`:

```go
type User struct {
  orm.Model
  Name          string
  Books         []*Book

  // Counts and EXISTS never return NULL — int64 is fine.
  BooksCount    int64    `gorm:"column:books_count"`

  // SUM / AVG / MAX / MIN return NULL when there are no related rows —
  // use a pointer so the zero-row case stays distinguishable from "0".
  BooksMaxPrice *float64 `gorm:"column:books_max_price"`
}

var users []User
facades.Orm().Query().
  WithCount("Books").
  WithMax("Books", "price").
  Get(&users)

for _, u := range users {
  fmt.Println(u.Name, u.BooksCount, u.BooksMaxPrice)
}
```

#### 2. Scan into a DTO

If you don't want to pollute the model, define a separate struct that embeds (or copies) the columns you care about:

```go
type UserWithStats struct {
  orm.Model
  Name          string
  BooksCount    int64    `gorm:"column:books_count"`
  BooksAvgPrice *float64 `gorm:"column:books_avg_price"`
}

var rows []UserWithStats
facades.Orm().Query().Model(&User{}).
  WithCount("Books").
  WithAvg("Books", "price").
  Get(&rows)
```

Note: pass `Model(&User{})` so the query knows which table to project from when the destination type isn't itself a registered model.

#### 3. Scan into `map[string]any`

For ad-hoc reporting where you don't want a typed struct, scan into a slice of maps:

```go
var rows []map[string]any
facades.Orm().Query().Model(&User{}).
  WithCount("Books").
  WithMax("Books", "price").
  Get(&rows)

// rows[0]["books_count"], rows[0]["books_max_price"], etc.
```

### Alias Naming Rules

The default alias is generated from the relation name, the function, and (for non-count/exists) the column. Relation names are converted from CamelCase to snake_case; nested relations join with `_`.

| Call                                  | Generated alias            | Suggested field type        |
| ------------------------------------- | -------------------------- | --------------------------- |
| `WithCount("Books")`                  | `books_count`              | `int64`                     |
| `WithMax("Books", "price")`           | `books_max_price`          | `*float64` (may be `NULL`)  |
| `WithMin("Books", "price")`           | `books_min_price`          | `*float64` (may be `NULL`)  |
| `WithSum("Books", "price")`           | `books_sum_price`          | `*float64` (may be `NULL`)  |
| `WithAvg("Books", "price")`           | `books_avg_price`          | `*float64` (may be `NULL`)  |
| `WithExists("Books")`                 | `books_exists`             | `bool` (auto-cast from 0/1) |
| `WithCount("Books.Author")`           | `books_author_count`       | `int64`                     |
| `WithCount("MyBooks")`                | `my_books_count`           | `int64`                     |
| `WithAggregate("Books", "*", "count")`| same as `WithCount("Books")` | `int64`                   |

A model that binds every alias above looks like this — the field name can be anything; what matters is the `gorm:"column:..."` tag matching the alias:

```go
type User struct {
  orm.Model
  Name             string

  // COUNT never returns NULL — int64 is fine.
  BooksCount       int64    `gorm:"column:books_count"`
  BooksAuthorCount int64    `gorm:"column:books_author_count"`
  MyBooksCount     int64    `gorm:"column:my_books_count"`

  // EXISTS comes back as 0/1; database/sql + GORM coerce it into a bool field automatically.
  BooksExists      bool     `gorm:"column:books_exists"`

  // SUM / AVG / MAX / MIN can return NULL — use pointer types.
  BooksMaxPrice    *float64 `gorm:"column:books_max_price"`
  BooksMinPrice    *float64 `gorm:"column:books_min_price"`
  BooksSumPrice    *float64 `gorm:"column:books_sum_price"`
  BooksAvgPrice    *float64 `gorm:"column:books_avg_price"`
}

var users []User
facades.Orm().Query().
  WithCount("Books").
  WithCount("Books.Author").
  WithCount("MyBooks").
  WithExists("Books").
  WithMax("Books", "price").
  WithMin("Books", "price").
  WithSum("Books", "price").
  WithAvg("Books", "price").
  Get(&users)
```

If you'd rather rely on GORM's column-name convention instead of explicit tags, name the field exactly the snake_case alias in CamelCase form — e.g. `BooksCount` resolves to `books_count` automatically. The `gorm:"column:..."` tag is only required when your field name diverges from the alias.

### Customising the Alias

Only `WithCount` accepts a custom alias, via `orm.RelationCount`:

```go
import "github.com/goravel/framework/contracts/database/orm"

facades.Orm().Query().WithCount(
  orm.RelationCount{Name: "Books", Alias: "total_books"},
).Get(&users)
```

`WithMax` / `WithMin` / `WithSum` / `WithAvg` / `WithExists` and `WithAggregate` do not expose an alias parameter — the field on your model must match the default alias above. If a default alias collides with another column, switch to `WithAggregate` and project into a DTO whose columns are arranged to avoid the clash.

### WithCount

```go
// Adds a "books_count" column equal to (SELECT COUNT(*) FROM books WHERE books.user_id = users.id).
facades.Orm().Query().WithCount("Books").Get(&users)
```

To scope the inner subquery or override the alias, pass an `orm.RelationCount` value instead of a plain string:

```go
import "github.com/goravel/framework/contracts/database/orm"

cb := func(query orm.Query) orm.Query {
  return query.Where("status = ?", "active")
}

facades.Orm().Query().WithCount(
  orm.RelationCount{Name: "Books", Callback: cb},
  orm.RelationCount{Name: "Books", Alias: "book_total"},
).Get(&users)
```

`WithCount` is variadic — string and `RelationCount` entries may be mixed in a single call.

### WithMax / WithMin / WithSum / WithAvg

Each takes a relation name plus the related-model column to aggregate. The result alias is `<relation>_<fn>_<column>` in snake_case:

```go
facades.Orm().Query().WithMax("Books", "pages").Get(&users)  // adds books_max_pages
facades.Orm().Query().WithSum("Books", "price").Get(&users)  // adds books_sum_price
```

Like `WithCount`, these accept an optional callback as the trailing argument to scope the subquery:

```go
cb := func(query orm.Query) orm.Query {
  return query.Where("status = ?", "published")
}
facades.Orm().Query().WithSum("Books", "pages", cb).Get(&users)
```

> SQL `SUM` / `AVG` / `MAX` / `MIN` return `NULL` when no rows match. To distinguish "no related rows" from "the aggregate happens to equal zero", use a pointer field (`*float64`, `*int64`) on your destination struct.

### WithExists

`WithExists` adds a `0/1` integer column indicating whether a related record exists:

```go
facades.Orm().Query().WithExists("Books").Get(&users)  // adds books_exists
```

`WithExists` is also variadic — pass any number of relation names. The column is yielded as a `0/1` integer in SQL, but `database/sql` together with GORM coerces it into a `bool` field on your destination struct automatically, so declaring the field as `bool` is the recommended form.

### WithAggregate

`WithAggregate` is the building block for the helpers above. Its signature is `WithAggregate(relation, column, fn string, args ...any)`, where `fn` is one of `count`, `max`, `min`, `sum`, `avg`, or `exists`. The trailing `args` can include a callback to scope the inner subquery:

```go
import "github.com/goravel/framework/contracts/database/orm"

// Maximum book price per user — adds books_max_price.
facades.Orm().Query().WithAggregate("Books", "price", "max").Get(&users)

// Sum of pages over only published books — adds books_sum_pages.
cb := func(query orm.Query) orm.Query {
  return query.Where("status = ?", "published")
}
facades.Orm().Query().WithAggregate("Books", "pages", "sum", cb).Get(&users)

// Existence — column is ignored; pass "*" by convention. Adds books_exists.
facades.Orm().Query().WithAggregate("Books", "*", "exists").Get(&users)
```

For `count` and `exists`, `column` is ignored and the alias drops the column suffix (`<relation>_count`, `<relation>_exists`). For the other functions, the alias is `<relation>_<fn>_<column>`. Passing an unknown `fn` returns a query that errors at execution time.

### Combining with Has / WhereHas

Aggregate sub-selects compose with `Has`, `WhereHas`, and the rest of the query builder, so a single query can both filter and project relationship aggregates:

```go
// Users with at least 3 books, projecting the count of their roles.
facades.Orm().Query().Has("Books", ">=", 3).WithCount("Roles").Get(&users)

// Active users with their published-book stats.
cb := func(query orm.Query) orm.Query {
  return query.Where("status = ?", "published")
}
facades.Orm().Query().
  Where("active = ?", true).
  WithCount(orm.RelationCount{Name: "Books", Callback: cb, Alias: "published_books"}).
  WithSum("Books", "pages", cb).
  Get(&users)
```
