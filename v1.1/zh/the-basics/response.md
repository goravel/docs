# 响应

[[toc]]

## 介绍

可以使用 `ctx.Response()` 在控制其中进行 HTTP 响应。

## 字符串

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

## 文件响应

```go
import "net/http"

ctx.Response().File("./public/logo.png")
```

## 下载文件

```go
import "net/http"

ctx.Response().Download("./public/logo.png", "1.png")
```

## 附加 Header

```go
import "net/http"

ctx.Response().Header("Content", "Goravel").String(http.OK, "Hello Goravel")
```

## 返回成功

```go
ctx.Response().Success().String("Hello Goravel")
ctx.Response().Success().Json(contracthttp.Json({
  "Hello": "Goravel",
}))
```
