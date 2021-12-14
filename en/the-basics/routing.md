## Introduction

Goravel routing module can use `facades.Route` to operate, `facades.Route` is an example of well-known HTTP framework [gin-gonic/gin](https://github.com/gin-gonic/gin), the usage is exactly the same as `gin-gonic/gin`.

## Default Routing File

All routing files are defined in the `/routes` directory. The framework defaults to a sample route `/routes/web.go`, in which the `func Web` method is registered in the `app/providers/route_service_provider.go` file to achieve routing binding.

You can also perform more fine-grained management based on this method. You can add routing files under the `routes` directory, and then register in the `app/providers/route_service_provider.go` file.

## Start HTTP Server
```
facades.Route.Run("127.0.0.1:3000")
// OR
facades.Route.Run(facades.Config.GetString("app.host"))
```

## Basic Routing

You can define a very simple route in the form of a closure:
```
facades.Route.GET("/", func(c *gin.Context) {
    c.JSON(200, gin.H{
        "message": "pong",
    })
})
```

### Available Routing Methods
```
facades.Route.GET("/someGet", getting)
facades.Route.POST("/somePost", posting)
facades.Route.PUT("/somePut", putting)
facades.Route.DELETE("/someDelete", deleting)
facades.Route.PATCH("/somePatch", patching)
facades.Route.HEAD("/someHead", head)
facades.Route.OPTIONS("/someOptions", options)
```

### Routing Parameters
```
facades.Route.GET("/user/:name", func(c *gin.Context) {
    name := c.Param("name")
    c.String(http.StatusOK, "Hello %s", name)
})
```

### Routing Queries
```
router.GET("/welcome", func(c *gin.Context) {
    firstname := c.DefaultQuery("firstname", "Guest")
    lastname := c.Query("lastname") // shortcut for c.Request.URL.Query().Get("lastname")

    c.String(http.StatusOK, "Hello %s %s", firstname, lastname)
})
```

### More

See [gin-gonic/gin](https://github.com/gin-gonic/gin)