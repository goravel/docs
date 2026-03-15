# Goravel Controllers, Requests, and Responses

## Controller Structure

```go
package controllers

import (
    "github.com/goravel/framework/contracts/http"

    "goravel/app/facades"
)

type UserController struct {
    // inject services
}

func NewUserController() *UserController {
    return &UserController{}
}

// Every handler must return http.Response
func (r *UserController) Show(ctx http.Context) http.Response {
    return ctx.Response().Success().Json(http.Json{
        "Hello": "Goravel",
    })
}
```

Generate via artisan:

```shell
./artisan make:controller UserController
./artisan make:controller user/UserController
./artisan make:controller --resource PhotoController
```

Register in routes:

```go
package routes

import (
    "goravel/app/facades"
    "goravel/app/http/controllers"
)

func Api() {
    userController := controllers.NewUserController()
    facades.Route().Get("/{id}", userController.Show)
}
```

---

## Resource Controllers

```go
facades.Route().Resource("photos", controllers.NewPhotoController())

// Generated actions:
// GET    /photos           → Index
// POST   /photos           → Store
// GET    /photos/{photo}   → Show
// PUT    /photos/{photo}   → Update
// DELETE /photos/{photo}   → Destroy
```

---

## Request Input

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
id   := ctx.Request().QueryInt("id")
id   := ctx.Request().QueryInt64("id")
flag := ctx.Request().QueryBool("flag")

// /users?names=a&names=b
names := ctx.Request().QueryArray("names")

// /users?names[a]=goravel1&names[b]=goravel2
names := ctx.Request().QueryMap("names")

queries := ctx.Request().Queries()
```

### JSON/form input

```go
name := ctx.Request().Input("name")
name := ctx.Request().Input("name", "default")
name := ctx.Request().InputInt("name")
name := ctx.Request().InputInt64("name")
name := ctx.Request().InputBool("name")
name := ctx.Request().InputArray("name")
name := ctx.Request().InputMap("name")
name := ctx.Request().InputMapArray("name")

// All input (json + form + query, priority: json > form > query)
data := ctx.Request().All()
```

### Bind JSON/form to struct

```go
type User struct {
    Name string `form:"name" json:"name"`
}

var user User
err := ctx.Request().Bind(&user)

var data map[string]any
err := ctx.Request().Bind(&data)
```

### Bind query to struct

```go
type Filter struct {
    ID string `form:"id"`
}
var filter Filter
err := ctx.Request().BindQuery(&filter)
```

---

## Request Metadata

```go
path       := ctx.Request().Path()        // /users/1
originPath := ctx.Request().OriginPath()  // /users/{id}
url        := ctx.Request().Url()         // /users?name=Goravel
fullUrl    := ctx.Request().FullUrl()     // http://host/users?name=Goravel
host       := ctx.Request().Host()
method     := ctx.Request().Method()
ip         := ctx.Request().Ip()
info       := ctx.Request().Info()
name       := ctx.Request().Name()
header     := ctx.Request().Header("X-Header-Name", "default")
headers    := ctx.Request().Headers()
```

---

## File Upload

```go
file, err := ctx.Request().File("file")
files, err := ctx.Request().Files("file")

// Save file
file.Store("./public")
```

---

## Context Data

```go
// Set
ctx.WithValue("user", "Goravel")

// Get
user := ctx.Value("user")

// Get stdlib context
c := ctx.Context()
```

---

## Cookie

```go
value := ctx.Request().Cookie("name")
value := ctx.Request().Cookie("name", "default")
```

---

## Response

### String

```go
return ctx.Response().String(http.StatusOK, "Hello Goravel")
```

### JSON

```go
return ctx.Response().Json(http.StatusOK, http.Json{
    "Hello": "Goravel",
})

return ctx.Response().Json(http.StatusOK, struct {
    ID   uint   `json:"id"`
    Name string `json:"name"`
}{ID: 1, Name: "Goravel"})
```

### Success shorthand (200)

```go
return ctx.Response().Success().String("Hello Goravel")
return ctx.Response().Success().Json(http.Json{"Hello": "Goravel"})
```

### Custom status

```go
return ctx.Response().Status(http.StatusCreated).Json(http.Json{"id": 1})
```

### Raw data

```go
return ctx.Response().Data(http.StatusOK, "text/html; charset=utf-8", []byte("<b>Goravel</b>"))
```

### File & download

```go
return ctx.Response().File("./public/logo.png")
return ctx.Response().Download("./public/logo.png", "logo.png")
```

### Header

```go
return ctx.Response().Header("X-Custom", "value").String(http.StatusOK, "ok")
```

### Cookie

```go
import "time"

ctx.Response().Cookie(http.Cookie{
    Name:     "name",
    Value:    "Goravel",
    Path:     "/",
    Domain:   "goravel.dev",
    Expires:  time.Now().Add(24 * time.Hour),
    Secure:   true,
    HttpOnly: true,
})

ctx.Response().WithoutCookie("name")
```

### Stream (SSE / chunked)

```go
return ctx.Response().Stream(http.StatusOK, func(w http.StreamWriter) error {
    for _, item := range []string{"a", "b", "c"} {
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

### Redirect

```go
return ctx.Response().Redirect(http.StatusMovedPermanently, "https://goravel.dev")
```

### No content

```go
return ctx.Response().NoContent()
return ctx.Response().NoContent(http.StatusResetContent)
```

### Inspect response in middleware

```go
origin := ctx.Response().Origin()
// origin.Body()   — response bytes
// origin.Header() — headers
// origin.Status() — status code
// origin.Size()   — body size
```

---

## Abort Request (in middleware/handler)

```go
ctx.Request().Abort()
ctx.Request().Abort(http.StatusNotFound)
ctx.Response().String(http.StatusForbidden, "forbidden").Abort()
```
