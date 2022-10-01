# Routing

[[toc]]

## Introduction

Goravel routing module can operated by `facades.Route`, `facades.Route` is an instance of HTTP framework [gin-gonic/gin](https://github.com/gin-gonic/gin), the usage is exactly the same as `gin-gonic/gin`.

## Default Routing File

All routing files are defined in the `/routes` directory. The framework defaults to a sample route `/routes/web.go`, in which the `func Web` method is registered in the `app/providers/route_service_provider.go` file to achieve routing binding.

You can add routing files under the `routes` directory to perform more fine-grained management, then register them in the `app/providers/route_service_provider.go` file.

## Start HTTP Server

Start the HTTP server in `main.go` in the root directory.

```go
package main

import (
  "github.com/goravel/framework/support/facades"
  
  "goravel/bootstrap"
)

func main() {
  //This bootstraps the framework and gets it ready for use.
  bootstrap.Boot()

  //Start http server by facades.Route.
  go func() {
    if err := facades.Route.Run(facades.Config.GetString("app.host")); err != nil {
      facades.Log.Errorf("Route run error: %v", err)
    }
  }()

  select {}
}
```

## Basic Routing

You can define a very simple route in the form of a closure:

```go
facades.Route.GET("/", func(c *gin.Context) {
    c.JSON(200, gin.H{
        "message": "pong",
    })
})
```

### Available Routing Methods

```go
facades.Route.GET("/someGet", getting)
facades.Route.POST("/somePost", posting)
facades.Route.PUT("/somePut", putting)
facades.Route.DELETE("/someDelete", deleting)
facades.Route.PATCH("/somePatch", patching)
facades.Route.HEAD("/someHead", head)
facades.Route.OPTIONS("/someOptions", options)
```

### Get Routing Parameters

```go
facades.Route.GET("/user/:name", func(c *gin.Context) {
    name := c.Param("name")
    c.String(http.StatusOK, "Hello %s", name)
})
```

### Routing Queries

```go
router.GET("/welcome", func(ctx *gin.Context) {
    firstname := ctx.DefaultQuery("firstname", "Guest")
    lastname := ctx.Query("lastname")

    ctx.String(http.StatusOK, "Hello %s %s", firstname, lastname)
})
```

### More

See [gin-gonic/gin](https://github.com/gin-gonic/gin)
