# Goravel Controllers, Requests, and Responses

## Controller Definition

Controllers live in `app/http/controllers/`.

```go
package controllers

import (
    "github.com/goravel/framework/contracts/http"

    "goravel/app/facades"
)

type UserController struct{}

func NewUserController() *UserController {
    return &UserController{}
}

func (r *UserController) Show(ctx http.Context) http.Response {
    return ctx.Response().Success().Json(http.Json{
        "Hello": "Goravel",
    })
}
```

Register in route:

```go
package routes

import (
    "goravel/app/facades"
    "goravel/app/http/controllers"
)

func Api() {
    userController := controllers.NewUserController()
    facades.Route().Get("/users/{id}", userController.Show)
    facades.Route().Post("/users", userController.Store)
}
```

### Generate controller

```shell
./artisan make:controller UserController
./artisan make:controller user/UserController
./artisan make:controller --resource PhotoController
```

---

## Request - Reading Input

### Route parameters

```go
// /users/{id}
id := ctx.Request().Route("id")
id := ctx.Request().RouteInt("id")
id := ctx.Request().RouteInt64("id")
```

### Query string

```go
// /users?name=goravel
name := ctx.Request().Query("name")
name := ctx.Request().Query("name", "default")

id := ctx.Request().QueryInt("id")
id := ctx.Request().QueryInt64("id")
flag := ctx.Request().QueryBool("flag")

// /users?names=a&names=b
names := ctx.Request().QueryArray("names")

// /users?names[a]=1&names[b]=2
names := ctx.Request().QueryMap("names")

all := ctx.Request().Queries()
```

### Body / form input

Reads from JSON body or form data (priority: json, then form):

```go
name := ctx.Request().Input("name")
name := ctx.Request().Input("name", "default")
age := ctx.Request().InputInt("age")
age := ctx.Request().InputInt64("age")
flag := ctx.Request().InputBool("flag")
tags := ctx.Request().InputArray("tags")
meta := ctx.Request().InputMap("meta")
meta := ctx.Request().InputMapArray("meta")
```

### All input

```go
data := ctx.Request().All() // map[string]any combining json + form + query
```

### Bind to struct

```go
type CreateUserRequest struct {
    Name  string `form:"name" json:"name"`
    Email string `form:"email" json:"email"`
}

var req CreateUserRequest
err := ctx.Request().Bind(&req)
```

```go
var data map[string]any
err := ctx.Request().Bind(&data)
```

### Bind query to struct

```go
type SearchRequest struct {
    Query string `form:"q"`
    Page  string `form:"page"`
}

var req SearchRequest
err := ctx.Request().BindQuery(&req)
```

---

## Request - Metadata

```go
path := ctx.Request().Path()           // /users/1
origin := ctx.Request().OriginPath()   // /users/{id}
url := ctx.Request().Url()             // /users?name=goravel
host := ctx.Request().Host()
fullUrl := ctx.Request().FullUrl()     // http://example.com/users?name=goravel
method := ctx.Request().Method()
ip := ctx.Request().Ip()
header := ctx.Request().Header("X-Token", "default")
headers := ctx.Request().Headers()
name := ctx.Request().Name()           // named route
```

---

## Request - Files

```go
file, err := ctx.Request().File("avatar")
files, err := ctx.Request().Files("photos")

// Save to disk
file.Store("./public/uploads")
```

---

## Request - Cookies

```go
value := ctx.Request().Cookie("name")
value := ctx.Request().Cookie("name", "default")
```

---

## Request - Context Values

```go
// Set
ctx.WithValue("user", userObj)

// Get
user := ctx.Value("user")

// Standard context
stdCtx := ctx.Context()
```

---

## Request - Abort

```go
ctx.Request().Abort()
ctx.Request().Abort(http.StatusUnauthorized)
ctx.Request().AbortWithStatus(http.StatusForbidden)
```

---

## Response - String

```go
return ctx.Response().String(http.StatusOK, "Hello Goravel")
```

## Response - JSON

```go
return ctx.Response().Json(http.StatusOK, http.Json{
    "name": "Goravel",
    "id":   1,
})

// Struct
return ctx.Response().Json(http.StatusOK, struct {
    ID   uint   `json:"id"`
    Name string `json:"name"`
}{ID: 1, Name: "Goravel"})
```

## Response - Success shorthand (200)

```go
return ctx.Response().Success().String("Hello")
return ctx.Response().Success().Json(http.Json{"key": "value"})
```

## Response - Custom status

```go
return ctx.Response().Status(http.StatusCreated).Json(http.Json{
    "id": 1,
})
```

## Response - Custom data

```go
return ctx.Response().Data(http.StatusOK, "text/html; charset=utf-8", []byte("<b>Goravel</b>"))
```

## Response - File / Download

```go
return ctx.Response().File("./public/logo.png")
return ctx.Response().Download("./public/report.pdf", "report.pdf")
```

## Response - Headers

```go
return ctx.Response().Header("X-Custom-Header", "value").Json(http.StatusOK, http.Json{})
```

## Response - Cookie

```go
import "time"

return ctx.Response().Cookie(http.Cookie{
    Name:     "session",
    Value:    "abc123",
    Path:     "/",
    Domain:   "example.com",
    Expires:  time.Now().Add(24 * time.Hour),
    Secure:   true,
    HttpOnly: true,
}).Json(http.StatusOK, http.Json{})
```

Remove a cookie:

```go
return ctx.Response().WithoutCookie("session").String(http.StatusOK, "ok")
```

## Response - Stream

```go
return ctx.Response().Stream(http.StatusOK, func(w http.StreamWriter) error {
    items := []string{"a", "b", "c"}
    for _, item := range items {
        if _, err := w.Write([]byte(item + "\n")); err != nil {
            return err
        }
        if err := w.Flush(); err != nil {
            return err
        }
        time.Sleep(1 * time.Second)
    }
    return nil
})
```

## Response - Redirect

```go
return ctx.Response().Redirect(http.StatusMovedPermanently, "https://goravel.dev")
```

## Response - No Content

```go
return ctx.Response().NoContent()
return ctx.Response().NoContent(http.StatusNoContent)
```

## Response - Abort inside middleware

```go
return ctx.Response().String(http.StatusUnauthorized, "unauthorized").Abort()
```

---

## Custom Recovery (panic handler)

Set in `bootstrap/app.go`:

```go
import (
    contractshttp "github.com/goravel/framework/contracts/http"
    configuration "github.com/goravel/framework/contracts/foundation/configuration"
)

WithMiddleware(func(handler configuration.Middleware) {
    handler.Recover(func(ctx contractshttp.Context, err any) {
        facades.Log().Error(err)
        _ = ctx.Response().String(contractshttp.StatusInternalServerError, "internal error").Abort()
    })
})
```

---

## Gotchas

- Always return `ctx.Response()...` from controller methods. Returning without calling `ctx.Response()` leaves the response empty.
- `Input()` reads JSON body or form; `Query()` reads query string only. They do not overlap.
- `Bind()` only binds JSON body or form data. Use `BindQuery()` for query strings.
- `form` fields are always `string` type when bound. Use JSON if you need non-string types.
