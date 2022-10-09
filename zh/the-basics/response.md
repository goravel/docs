# 响应

[[toc]]

## 介绍

可以使用 `facades.Response` 进行 HTTP 响应。

## 字符串

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

## 文件响应

```go
import "net/http"

facades.Response.File("./public/logo.png")
```

## 下载文件

```go
import "net/http"

facades.Response.Download("./public/logo.png", "1.png")
```

## 附加 Header

```go
import "net/http"

facades.Response.Header("Content", "Goravel").String(http.OK, "Hello Goravel")
```

## 返回成功

```go
facades.Response.Success().String("Hello Goravel")
facades.Response.Success().Json(contracthttp.Json({
  "Hello": "Goravel",
}))
```
