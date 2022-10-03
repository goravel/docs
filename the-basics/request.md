# HTTP Requests

[[toc]]

## Introduction

The `contracts/http/Request` method of Goravel can interact with the current HTTP request processed by the application, and get the input and files submitted together.

## Interacting With The Request

The `request` instance is automatically injected into the controller:

```go
import "github.com/goravel/framework/contracts/http"

facades.Route.Get("/", func(request http.Request) {

})
```

### Retrieving The Request Path

```go
path := request.Path() // /users
```

### Retrieving The Request URL

```go
url := request.Url() // /users?name=Goravel
```

### Retrieving The Full Request URL

```go
url := request.FullUrl() // http://**/users?name=Goravel
```

### Retrieving The Request Method

```go
method := request.Method()
```

### Request Headers

```go
header := request.Header('X-Header-Name', 'default')
headers := request.Headers()
```

### Request IP Address

```go
method := request.Ip()
```

### Attach Context

```go
request := request.WithContext(context.Background())
```

### Get Context

```go
ctx := request.Context()
```

## Input

### Retrieving An Input Value

```go
// /users/:id
id := request.Input("id")
```

### Retrieving Input From The Query String

```go
// /users?name=goravel
name := request.Query("name", "goravel")
```

### Retrieving Form

```go
name := request.Form("name", "goravel")
```

### Form Bind Struct

```go
type User struct {
	Name string `form:"code" json:"code" binding:"required"`
}

var user User
err := request.Bind(&user)
```

## File

### Retrieving File

```go
file, err := request.File("file")
```

### Save File

```go
file, err := request.File("file")
file.Store("./public")
```

### Abort Request

```go
request.AbortWithStatus(403)
```
