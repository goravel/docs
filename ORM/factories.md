
# Factories

[[toc]]

## Introduction

When testing your application or seeding your database, you may need to insert a few records into your database. Instead of manually specifying the value of each column, Goravel allows you to define a set of default attributes for each of your models using model factories.

To see an example of how to write a factory, take a look at the `database/factories/user_factory.go` file in your application. 

```go
package factories

type UserFactory struct {
}

// Definition Define the model's default state.
func (f *UserFactory) Definition() map[string]any {
  return map[string]any{
    "Name": "Goravel",
  }
}
```

As you can see, in their most basic form, factories are struct that define a `Definition` method. The `Definition` method returns the default set of attribute values that should be applied when creating a model using the factory. You can use [brianvoe/gofakeit](https://github.com/brianvoe/gofakeit) to generate a variety of random data.

## Generating Factories

To create a factory, execute the `make:factory` Artisan command:

```
go run . artisan make:factory PostFactory
```

The new factory struct will be placed in your `database/factories` directory.

### Model & Factory Discovery Conventions

After defining a factory, you can use the `Factory()` method in the model to bind the factory to the model:

```go
package models

import (
  "github.com/goravel/framework/contracts/database/factory"
  "github.com/goravel/framework/database/orm"

  "goravel/database/factories"
)

type User struct {
  orm.Model
  Name   string
  Avatar string
  orm.SoftDeletes
}

func (u *User) Factory() factory.Factory {
  return &factories.UserFactory{}
}
```

## Creating Models Using Factories

### Instantiating Models

We can use the `Make` method to create models without persisting them to the database:

```go
var user models.User
err := facades.Orm().Factory().Make(&user)
```

You may create a collection of many models using the `Count` method:

```go
var users []models.User
err := facades.Orm().Factory().Count(2).Make(&users)
```

If you would like to override some of the default values of your models, you may pass `map[string]any` to the `Make` method. Only the specified attributes will be replaced while the rest of the attributes remain set to their default values as specified by the factory:

```go
var user models.User
err := facades.Orm().Factory().Make(&user, map[string]any{
    "Avatar": "avatar",
})
```

### Persisting Models

The `Create` method instantiates model instances and persists them to the database using Orm's `Save` method:

```go
var user models.User
err := facades.Orm().Factory().Create(&user)

var users []models.User
err := facades.Orm().Factory().Count(2).Create(&users)
```

You may override the factory's default model attributes by passing `map[string]any` of attributes to the `Create` method:

```go
var user models.User
err := facades.Orm().Factory().Create(&user, map[string]any{
    "Avatar": "avatar",
})
```

### Ignore Model Event

There may be [model event](../orm/getting-started.md#events) defined on the model, you can ignore those events using the `CreateQuietly` method:

```go
var user models.User
err := facades.Orm().Factory().CreateQuietly(&user)
```
