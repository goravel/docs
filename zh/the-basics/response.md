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

ctx.Response().Json(http.OK, contracthttp.Json{
  "Hello": "Goravel",
})

ctx.Response().Json(http.OK, struct {
  ID       uint `json:"id"`
  Name     string `json:"name"`
}{
  Id:      1,
  Front:   "Goravel",
})
```

## 自定义返回

```go
ctx.Response().Data(http.StatusOK, "text/html; charset=utf-8", []byte("<b>Goravel</b>"))
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

## 重定向

```go
ctx.Response().Redirect(http.StatusMovedPermanently, "https://goravel.dev")
```

## 获取响应

可以获取响应的各种信息，一般用在 HTTP 中间件中：

```go
origin := ctx.Response().Origin()
```

`origin` 包含一下方法：

| 方法名        | 作用           |
| -----------  | -------------- |
| Body         | 获取响应数据     |
| Header       | 获取响应 header |
| Size         | 获取响应大小     |
| Status       | 获取响应状态码   |
