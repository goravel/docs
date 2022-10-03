# HTTP Response

[[toc]]

## Introduction

You can use `facades.Response` for HTTP response.

## String

```go
import "net/http"

facades.Response.String(http.OK, "Hello Goravel")
```

## JSON

```go
import (
  "net/http"
  contracthttp "github.com/goravel/framework/contracts/http"
)

facades.Response.Json(http.OK, contracthttp.Json({
  "Hello": "Goravel",
}))

facades.Response.Json(http.OK, struct {
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

facades.Response.File("./public/logo.png")
```

## Download File

```go
import "net/http"

facades.Response.Download("./public/logo.png", "1.png")
```

## Attach Header

```go
import "net/http"

facades.Response.Header("Content", "Goravel").String(http.OK, "Hello Goravel")
```

## Return Success

```go
facades.Response.Success().String("Hello Goravel")
facades.Response.Success().Json(contracthttp.Json({
  "Hello": "Goravel",
}))
```
