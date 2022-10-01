# Controllers

[[toc]]

## Introduction

Instead of defining all request processing logic in the form of a closure in a separate route, a controller can be used for integration. The controllers are stored in the `app/http/controllers` directory.

## Define Controllers

The following is an example of a basic controller:

```
package controllers

import (
	"github.com/gin-gonic/gin"

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

func (r *UserController) Show(ctx *gin.Context) {
	c.JSON(200, gin.H{
		"Hello": "Goravel",
	})
}
```

The route can be defined like this:

```
package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/goravel/framework/facades"

	"goravel/app/http/controllers"
)

func Web() {
	userController := controllers.NewUserController()
	facades.Route.GET("/user", userController.Show)
}
```