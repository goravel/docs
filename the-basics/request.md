# HTTP Requests

[[toc]]

## Introduction

The `contracts/http/Request` method of Goravel can interact with the current HTTP request processed by the application, and get the input and files submitted together.

## Interacting With The Request

The `http.Context` instance is automatically injected into the controller:

```go
import "github.com/goravel/framework/contracts/http"

facades.Route().Get("/", func(ctx http.Context) {

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

### Retrieving The Request HOST

```go
url := ctx.Request().Host()
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
header := ctx.Request().Header("X-Header-Name", "default")
headers := ctx.Request().Headers()
```

### Request IP Address

```go
ip := ctx.Request().Ip()
```

## Input

### Retrieving All Input Data

You may retrieve all of the incoming request's input data as `map[string]any` using the `All` method, which is a collection of `json`, `form` and `query`(priority from front to back).

```go
data := ctx.Request().All()
```

### Retrieving a Route Value

```go
// /users/{id}
id := ctx.Request().Route("id")
id := ctx.Request().RouteInt("id")
id := ctx.Request().RouteInt64("id")
```

### Retrieving Input From The Query String

```go
// /users?name=goravel
name := ctx.Request().Query("name")
name := ctx.Request().Query("name", "default")

// /users?id=1
name := ctx.Request().QueryInt("id")
name := ctx.Request().QueryInt64("id")
name := ctx.Request().QueryBool("id")

// /users?names=goravel1&names=goravel2
names := ctx.Request().QueryArray("names")

// /users?names[a]=goravel1&names[b]=goravel2
names := ctx.Request().QueryMap("names")

queries := ctx.Request().Queries()
```

> Note: Only one-dimensional Json data can be obtained, otherwise it will return empty.

### Retrieving An Input Value

Access all of the user input without worrying about which HTTP verb was used for the request. Retrieve order: `json`, `form`.

```go
name := ctx.Request().Input("name")
name := ctx.Request().Input("name", "goravel")
name := ctx.Request().InputInt("name")
name := ctx.Request().InputInt64("name")
name := ctx.Request().InputBool("name")
name := ctx.Request().InputArray("name")
name := ctx.Request().InputMap("name")
name := ctx.Request().InputMapArray("name")
```

### Bind Json/Form

```go
type User struct {
  Name string `form:"code" json:"code"`
}

var user User
err := ctx.Request().Bind(&user)
```

```go
var user map[string]any
err := ctx.Request().Bind(&user)
```

### Bind Query

Only support bind Query to struct:

```go
type Test struct {
  ID string `form:"id"`
}
var test Test
err := ctx.Request().BindQuery(&test)
```

## Cookie

### Retrieving a Cookie Value

Goravel provides a simple way to work with `cookie`. Use the `Cookie` method on the `Request` instance to retrieve a `cookie` value, will return an empty string if the `cookie` is not present. You can also define a default value in the second argument.

```go
value := ctx.Request().Cookie("name")
value := ctx.Request().Cookie("name", "default") 
```

## File

### Retrieving File

```go
file, err := ctx.Request().File("file")
files, err := ctx.Request().Files("file")
```

### Save File

```go
file, err := ctx.Request().File("file")
file.Store("./public")
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

## Custom Recovery

You can set a custom `recovery` by calling the `Recover` method in the `app/providers/route_service_provider.go` file.

```go
// app/providers/route_service_provider.go
func (receiver *RouteServiceProvider) Boot(app foundation.Application) {
  // Add HTTP middleware
  facades.Route().GlobalMiddleware(http.Kernel{}.Middleware()...)
  facades.Route().Recover(func(ctx http.Context, err error) {
    ctx.Request().Abort()
    // or
    // ctx.Response().String(500, "Internal Server Error").Abort()
  })
  ...
}
```

<CommentService/>