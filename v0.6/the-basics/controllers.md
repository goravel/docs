# Controllers

[[toc]]

## Introduction

Instead of defining all request processing logic in the form of a closure in a separate route, a controller can be used for integration. The controllers are stored in the `app/http/controllers` directory.

## Define Controllers

The following is an example of a basic controller class:
```
package controllers

type UserController struct {
}

func (controller UserController) Login(c *gin.Context) {

}
```

Then the route can be defined like this:
```
facades.Route.GET("/users", controllers.UserController{}.Show)
```