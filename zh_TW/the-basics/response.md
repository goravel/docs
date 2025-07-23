# HTTP Response

[[toc]]

## Introduction

You can use `ctx.Response()` for HTTP response in the Controller.

## String

```go
import "github.com/goravel/framework/contracts/http"

ctx.Response().String(http.StatusOK, "Hello Goravel")
```

## JSON

```go
import (
  "github.com/goravel/framework/contracts/http"
)

ctx.Response().Json(http.StatusOK, http.Json{
  "Hello": "Goravel",
})

ctx.Response().Json(http.StatusOK, struct {
  ID       uint `json:"id"`
  Name     string `json:"name"`
}{
  Id:      1,
  Front:   "Goravel",
})
```

## Custom Return

```go
ctx.Response().Data(http.StatusOK, "text/html; charset=utf-8", []byte("<b>Goravel</b>"))
```

## Response File

```go
import "net/http"

ctx.Response().File("./public/logo.png")
```

## Download File

```go
import "net/http"

ctx.Response().Download("./public/logo.png", "1.png")
```

## Attach Header

```go
import "github.com/goravel/framework/contracts/http"

ctx.Response().Header("Content", "Goravel").String(http.StatusOK, "Hello Goravel")
```

## Cookie

### Set Cookie

Use the `Cookie` method on the `response` instance to set a `cookie`. The `Cookie` method accepts a `http.Cookie`
instance, which allows you to set various cookie options.

```go
import (
  "time"
  "github.com/goravel/framework/contracts/http"
)

ctx.Response().Cookie(http.Cookie{
  Name: "name",
  Value: "Goravel",
  Path: "/",
  Domain: "goravel.dev",
  Expires: time.Now().Add(24 * time.Hour),
  Secure: true,
  HttpOnly: true,
})
```

### Expire Cookie

Use the `WithoutCookie` method to remove a cookie.

```go
ctx.Response().WithoutCookie("name")
```

## Return Success

```go
ctx.Response().Success().String("Hello Goravel")
ctx.Response().Success().Json(http.Json{
  "Hello": "Goravel",
})
```

## Custom Code

```go
ctx.Response().Status(http.StatusOK).Json(http.Json{
  "hello": "Goravel",
})
```

## Return Stream

```go
ctx.Response().Stream(http.StatusCreated, func(w http.StreamWriter) error {
  data := []string{"a", "b", "c"}
  for _, item := range data {
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

## Redirect

```go
ctx.Response().Redirect(http.StatusMovedPermanently, "https://goravel.dev")
```

## No Content

```go
ctx.Response().NoContent()
ctx.Response().NoContent(http.StatusOk)
```

## Get Response

You can obtain all the information from `ctx.Response()`, which is commonly used in HTTP middleware:

```go
origin := ctx.Response().Origin()
```

`origin` contains some methods as shown below：

| Method | Action              |
| ------ | ------------------- |
| Body   | Get response data   |
| Header | Get response header |
| Size   | Get response size   |
| Status | Get response status |
