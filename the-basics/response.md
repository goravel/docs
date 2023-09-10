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

## Return Success

```go
ctx.Response().Success().String("Hello Goravel")
ctx.Response().Success().Json(http.Json({
  "Hello": "Goravel",
}))
```

## Custom Code

```go
ctx.Response().Status(http.StatusOK).Json(http.Json{
  "hello": "Goravel",
})
```

## Redirect

```go
ctx.Response().Redirect(http.StatusMovedPermanently, "https://goravel.dev")
```

## Get Response

You can get all information of `ctx.Response()`, commonly used in HTTP middleware:

```go
origin := ctx.Response().Origin()
```

`origin` contains some methods as shown below：

| Method        | Action           |
| -----------  | -------------- |
| Body         | Get response data     |
| Header       | Get response header |
| Size         | Get response size     |
| Status       | Get response status   |

<CommentService/>