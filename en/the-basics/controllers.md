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
  // Dependent services
}

func NewUserController() *UserController {
  return &UserController{
    // Inject services
  }
}

func (r *UserController) Show(ctx http.Context) http.Response {
  return ctx.Response().Success().Json(http.Json{
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

func Api() {
  userController := controllers.NewUserController()
  facades.Route().Get("/{id}", userController.Show)
}
```

### Create Controller

```shell
go run . artisan make:controller UserController
go run . artisan make:controller user/UserController
```

## Resource Controllers

If you think of each Eloquent model in your application as a "resource", it is typical to perform the same sets of actions against each resource in your application. For example, imagine your application contains a `Photo` model and a `Movie` model. It is likely that users can create, read, update, or delete these resources.

Because of this common use case, Goravel resource routing assigns the typical create, read, update, and delete ("CRUD") routes to a controller with a single line of code. To get started, we can use the `make:controller` Artisan command's `--resource` option to quickly create a controller to handle these actions:

```shell
go run . artisan make:controller --resource PhotoController
```

This command will generate a controller at `app/http/controllers/photo_controller.go`. The controller will contain a method for each of the available resource operations. Next, you may register a resource route that points to the controller:

```go
facades.Route().Resource("photos", controllers.NewPhotoController())
```

|Verb         | URI                    | Action       
--------------|------------------------|--------------
GET           | `/photos`              | Index        
POST          | `/photos`              | Store        
GET           | `/photos/{photo}`      | Show         
PUT/PATCH     | `/photos/{photo}`      | Update       
DELETE        | `/photos/{photo}`      | Destroy      
