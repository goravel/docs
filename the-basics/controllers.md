# Controllers

[[toc]]

## Introduction

Instead of defining all request processing logic in the form of a closure in a separate route, a controller can be used for integration. The controllers are stored in the `app/http/controllers` directory.

## Define Controllers

The following is an example of a basic controller:

```go
package controllers

import (
  "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/facades"
)

type UserController struct {
  //Dependent services
}

func NewUserController() *UserController {
  return &UserController{
    //Inject services
  }
}

func (r *UserController) Show(ctx http.Context) {
  ctx.Response().Success().Json(http.Json{
    "Hello": "Goravel",
  })
}
```

The route define:

```go
package routes

import (
  "github.com/goravel/framework/facades"

  "goravel/app/http/controllers"
)

func Web() {
  userController := controllers.NewUserController()
  facades.Route.Get("/{id}", userController.Show)
}
```

### Create Controller

```
go run . artisan make:controller UserController
go run . artisan make:controller user/UserController
```

<CommentService/>