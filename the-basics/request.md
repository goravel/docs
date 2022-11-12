# HTTP Requests

[[toc]]

## Introduction

The `contracts/http/Request` method of Goravel can interact with the current HTTP request processed by the application, and get the input and files submitted together.

## Interacting With The Request

The `http.Context` instance is automatically injected into the controller:

```go
import "github.com/goravel/framework/contracts/http"

facades.Route.Get("/", func(ctx http.Context) {

})
```

### Retrieving The Request Path

```go
path := ctx.Request().Path() // /users
```

### Retrieving The Request URL

```go
url := ctx.Request().Url() // /users?name=Goravel
```

### Retrieving The Full Request URL

```go
url := ctx.Request().FullUrl() // http://**/users?name=Goravel
```

### Retrieving The Request Method

```go
method := ctx.Request().Method()
```

### Request Headers

```go
header := ctx.Request().Header('X-Header-Name', 'default')
headers := ctx.Request().Headers()
```

### Request IP Address

```go
method := ctx.Request().Ip()
```

## Input

### Retrieving An Input Value

```go
// /users/:id
id := ctx.Request().Input("id")
```

### Retrieving Input From The Query String

```go
// /users?name=goravel
name := ctx.Request().Query("name", "goravel")
```

### Retrieving Form

```go
name := ctx.Request().Form("name", "goravel")
```

### Form Bind Struct

```go
type User struct {
	Name string `form:"code" json:"code" binding:"required"`
}

var user User
err := ctx.Request().Bind(&user)
```

## File

### Retrieving File

```go
file, err := ctx.Request().File("file")
```

### Save File

```go
file, err := ctx.Request().File("file")
file.Store("./public")
```

### Abort Request

```go
ctx.Request().AbortWithStatus(403)
ctx.Request().AbortWithStatusJson(403, http.Json{
  "Hello": "World",
})
```

### Get Origin Request

```go
request := ctx.Request().Origin()
```

### Attach Data

```go
ctx.WithValue("user", "Goravel")
```

### Get Data

```go
user := ctx.Value("user")
```

### Get Context

```go
ctx := ctx.Context()
```
