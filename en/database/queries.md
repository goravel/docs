# Query Builder

[[toc]]

## Introduction

The database query builder provides a convenient interface to create and execute database queries. It can be used to perform most database operations in your application and works with all supported database systems.

Query builder uses parameter binding to protect your application from SQL injection. You don't need to clean or escape strings passed to the query builder.

## Running Queries

Framework provides various query methods, you can query, create, update and delete data in the database. Note that when you want to bind data to `struct` or [model](../orm/getting-started.md#model-definition), you need to add the `db` tag to the field:

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

### Retrieving All Rows

You can use the `facades.DB()` provided `table` method to start a query. The `table` method returns a chainable query builder instance for the specified table, allowing you to chain more constraints, and finally use the `Get` method to retrieve the query results:

```go
var users []User
err := facades.DB().Table("users").Get(&users)
```

### Retrieving a Single Row or Column

If you only need to retrieve a single row of data from the database table, you can use the `First` method.

```go
var user User
err := facades.DB().Table("users").Where("id", 1).First(&user)
```

You can use the `Value` method to retrieve the value of a single column:

```go
var name string
err := facades.DB().Table("users").Where("id", 1).Value("name", &name)
```

You can use the `Find` method to retrieve a single row of data by passing the `id`:

```go
var user User
err := facades.DB().Table("users").Find(&user, 1)

// You can also pass a collection of `id` to retrieve multiple rows of data
var users []User
err := facades.DB().Table("users").Find(&users, []int{1, 2, 3})

// Find defaults the table primary key to `id`, if the table primary key is not `id`, you can pass the `id` field name
var user User
err := facades.DB().Table("users").Find(&users, "uuid", "1")
```

You can use the `FindOrFail` or `FirstOrFail` method, if the record is not found, it will throw a `sql.ErrNoRows` error:

```go
var user User
err := facades.DB().Table("users").FindOrFail(&user, 1)
```

You can use the `FindOr` or `FirstOr` method, if the record is not found, it will execute the closure function:

```go
var user *User
err = facades.DB().Table("users").Where("name", "John").FirstOr(&user, func() error {
  return errors.New("no rows")
})
```

### Retrieving a Single Column Value

If you want to retrieve a list of records containing a single column value, you can use the `Pluck` method:

```go
var emails []string
err := facades.DB().Table("users").Pluck("email", &emails)
```

### Traversing Results

You can use the `Each` method to traverse all results:

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

### Chunking Results

If you need to process thousands of database records, consider using the `Chunk` method. This method retrieves a small chunk of results at a time and passes each chunk to a closure function for processing:

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

> Note: When modifying records in the Chunk callback, it may result in records not being included in the chunked results.

### Cursor

A cursor can be used to process large amounts of data without loading all data into memory at once. It processes data one by one instead of loading all data at once.

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

### Aggregates

The query builder provides aggregate methods: `Count`, `Sum`, `Avg`, `Min`, `Max`.

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

### Checking if a Record Exists

You can use the `Exists` and `DoesntExist` methods to determine if the result of a query condition exists:

```go
exists, err := facades.DB().Table("users").Where("votes > ?", 100).Exists()

exists, err := facades.DB().Table("users").Where("votes > ?", 100).DoesntExist()
```

### Pagination

You can use the `Paginate` method to paginate the query results:

```go
var (
  users []User
  total int64
)

err := facades.DB().Table("users").Where("name", "John").Paginate(1, 10, &users, &total)
```

## Select

You may not always want to retrieve all columns from a database table. Use the `Select` method to customize a "select" query statement to query the specified fields:

```go
var users []User
err := facades.DB().Table("users").Select("name", "email as user_email").Get(&users)
```

The `Distinct` method will force the query to return unique results:

```go
var users []User
err := facades.DB().Table("users").Distinct().Select("name").Get(&users)
```

## Raw Expressions

Sometimes you may need to use raw expressions in your queries. You can use the `db.Raw` method to create a raw expression:

```go
import "github.com/goravel/framework/database/db"

res, err := facades.DB().Model(&user).Update("age", db.Raw("age - ?", 1))
```

## Select

### Specifying a Select Clause

Of course, you may not always want to retrieve all columns from a database table. Use the `Select` method to specify a custom select clause for your query:

```go
// Select specific fields
err := facades.DB().Select("name", "age").Get(&users)

// Use a subquery
err := facades.DB().Select("name", db.Raw("(SELECT COUNT(*) FROM posts WHERE users.id = posts.user_id) as post_count")).Get(&users)
```

### Distinct

The `Distinct` method will force the query to return unique results:

```go
var users []models.User
err := facades.DB().Distinct("name").Find(&users)
```

## Raw Methods

### WhereRaw / OrWhereRaw

The `WhereRaw` and `OrWhereRaw` methods can be used to inject raw "where" clauses into your query. These methods accept an optional binding array as their second parameter:

```go
var users []User

err := facades.DB().WhereRaw("age = ? or age = ?", []any{25, 30}).Get(&users)

err := facades.DB().OrWhereRaw("age = ? or age = ?", []any{25, 30}).Get(&users)
```

### OrderByRaw

The `OrderByRaw` method can be used to set a raw string as the value of the "order by" clause:

```go
var users []User

err := facades.DB().OrderByRaw("age DESC, id ASC").Get(&users)
```

## Joins

### Inner Join

The query builder can be used to write join statements. To execute a basic SQL "inner join", you can use the `Join` method on the query builder instance:

```go
var users []User

err := facades.DB().Table("users").Join("posts as p ON users.id = p.user_id AND p.id = ?", 1).Where("age", 25).Get(&users)
```

### Left Join / Right Join

If you want to execute a "left join" or "right join", you can use the `LeftJoin` or `RightJoin` methods:

```go
var users []User

err := facades.DB().Table("users").LeftJoin("posts as p ON users.id = p.user_id AND p.id = ?", 1).Where("age", 25).Get(&users)

err = facades.DB().Table("users").RightJoin("posts as p ON users.id = p.user_id AND p.id = ?", 1).Where("age", 25).Get(&users)
```

### Cross Join

The `CrossJoin` method can be used to execute a "cross join":

```go
var users []User

err := facades.DB().Table("users").CrossJoin("posts as p ON users.id = p.user_id AND p.id = ?", 1).Where("age", 25).Get(&users)
```

## Basic Where Clauses

### Where / OrWhere

You can use the `Where` method on the query builder instance to add where clauses to the query.

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

The `WhereNot` and `OrWhereNot` methods can be used to negate a given set of query conditions.

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

The `WhereExists` method allows you to write exists SQL clauses:

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

### Other Where Clauses

**WhereBetween / OrWhereBetween**

The `WhereBetween` method verifies that a field value is between two given values:

```go
facades.DB().Table("users").WhereBetween("votes", 1, 100)
```

**WhereNotBetween / OrWhereNotBetween**

The `WhereNotBetween` method verifies that a field value is not between two given values:

```go
facades.DB().Table("users").WhereNotBetween("votes", 1, 100)
```

**WhereIn / WhereNotIn / OrWhereIn / OrWhereNotIn**

The `WhereIn` method verifies that a field value must exist in the specified array:

```go
facades.DB().Table("users").WhereIn("id", []any{1, 2, 3})
```

**WhereNull / WhereNotNull / OrWhereNull / OrWhereNotNull**

The `WhereNull` method verifies that a specified field must be `NULL`:

```go
facades.DB().Table("users").WhereNull("updated_at")
```

**WhereLike / WhereNotLike / OrWhereLike / OrWhereNotLike**

The `WhereLike` method verifies that a field value contains a given value:

```go
facades.DB().Table("users").WhereLike("name", "%goravel%")
```

**WhereColumn / OrWhereColumn**

The `WhereColumn` method verifies that two fields are equal:

```go
facades.DB().Table("users").WhereColumn("first_name", "last_name")
```

### Logical Grouping

Sometimes you may need to group several "where" clauses within parentheses to achieve the logical grouping required by your query.

```go
facades.DB().Table("users").Where("age", 25).Where(func(query db.Query) db.Query {
  return query.Where("votes", 100).OrWhere("votes", 200)
})
```

## Ordering, Grouping, Limit & Offset

### Ordering

**OrderBy / OrderByDesc**

```go
facades.DB().OrderBy("name")

facades.DB().OrderByDesc("name")
```

**Latest**

The `Latest` method makes it easy to sort results by date. By default, results will be sorted by the `created_at` column:

```go
err := facades.DB().Table("users").Latest().First(&user)

err := facades.DB().Table("users").Latest("updated_at").First(&user)
```

**InRandomOrder**

The `InRandomOrder` method is used to sort results randomly:

```go
err := facades.DB().Table("users").InRandomOrder().First(&user)
```

### Grouping

The `GroupBy` and `Having` methods can be used to group results:

```go
err := facades.DB().Table("users").Where("age", 25).GroupBy("name").Having("name = ?", "John").OrderBy("name").Get(&users)
```

### Limiting and Offset

You can use the `Limit` and `Offset` methods to limit the number of results, or skip a specified number of results in the query:

```go
err := facades.DB().Table("users").Offset(10).Limit(5).Get(&users)
```

## Conditional Clauses

Sometimes you may want a clause to only execute when a given condition is true. For example, you may only want to apply a where clause when a given value exists in the request. You can accomplish this by using the `When` method:

```go
import "github.com/goravel/framework/contracts/database/db"

err := facades.DB().Table("users").When(1 == 1, func(query db.Query) db.Query {
  return query.Where("age", 25)
}).First(&user)
```

You can also pass another closure as the third parameter to the `When` method. This closure will execute if the first parameter results in false:

```go
err := facades.DB().Table("users").When(1 != 1, func(query db.Query) db.Query {
  return query.OrderBy("name")
}, func(query db.Query) db.Query {
  return query.OrderBy("id")
}).First(&user)
```

## Insert

The query builder provides the `Insert` method for inserting records into the database:

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

### Auto Increment ID

If the table's primary key is auto increment, you can use the `LastInsertID` method to get the auto increment ID, only supported for `mysql` and `sqlite` databases:

```go
id, err := facades.DB().Table("products").InsertGetID(Product{
  Name: "goravel",
})
```

## Update

The query builder provides the `Update` method for updating existing records in the database:

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

### Update JSON fields

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

### Update or Insert

Sometimes you may want to update a record in the database, but if the specified record does not exist, create it. This can be done using the `UpdateOrInsert` method. The `UpdateOrInsert` method accepts two parameters: a condition for finding the record, and a key-value pair containing the values to update the record with.

The `UpdateOrInsert` method will attempt to locate a matching database record using the column names and values from the first parameter. If a record exists, its values will be updated using the second parameter. If no matching record is found, a record will be created and its values will be merged from the two parameters:

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

### Increment and Decrement

The `Increment` and `Decrement` methods can be used to increment or decrement the value of a specified field:

```go
err := facades.DB().Table("users").Where("id", 1).Increment("votes")

err := facades.DB().Table("users").Where("id", 1).Increment("votes", 2)

err := facades.DB().Table("users").Where("id", 1).Decrement("votes")

err := facades.DB().Table("users").Where("id", 1).Decrement("votes", 2)
```

## Delete

The query builder also includes some functions that can help you implement "pessimistic locking" in your `select` statements:

```go
result, err := facades.DB().Table("users").Where("id", 1).Delete()
```

## Pessimistic Locking

The query builder also includes some functions that can help you implement "pessimistic locking" in your `select` statements:

To use a "shared lock", you may use the `SharedLock` method. A shared lock prevents the selected rows from being modified until the transaction is committed:

```go
err := facades.DB().Table("users").Where("votes > ?", 100).SharedLock().Get(&users)
```

You can also use the `LockForUpdate` method. Using the "update" lock can prevent rows from being modified or selected by other shared locks:

```go
err := facades.DB().Table("users").Where("votes > ?", 100).LockForUpdate().Get(&users)
```

## Debugging

You can use the `ToSQL` and `ToRawSql` methods to get the current query binding and SQL.

With placeholder SQL:

```go
err := facades.DB().Table("users").Where("id", 1).ToSql().Get(models.User{})
```

With bound values SQL:

```go
err := facades.DB().Table("users").Where("id", 1).ToRawSql().Get(models.User{})
```

The methods that can be called after `ToSql` and `ToRawSql`: `Count`, `Insert`, `Delete`, `First`, `Get`, `Pluck`, `Update`.
