# HTTP Response

[[toc]]

## Introduction

You can use `ctx.Response()` for HTTP response in the Controller.

## String

```go
import "net/http"

ctx.Response().String(http.OK, "Hello Goravel")
```

## JSON

```go
import (
  "net/http"
  contracthttp "github.com/goravel/framework/contracts/http"
)

ctx.Response().Json(http.OK, contracthttp.Json({
  "Hello": "Goravel",
}))

ctx.Response().Json(http.OK, struct {
  ID       uint `json:"id"`
  Name     string `json:"name"`
}{
  Id:      1,
  Front:   "Goravel",
})
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
import "net/http"

ctx.Response().Header("Content", "Goravel").String(http.OK, "Hello Goravel")
```

## Return Success

```go
ctx.Response().Success().String("Hello Goravel")
ctx.Response().Success().Json(contracthttp.Json({
  "Hello": "Goravel",
}))
```
