# 响应

[[toc]]

## 简介

可以使用 `ctx.Response()` 在控制其中进行 HTTP 响应。

## 字符串

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
import "github.com/goravel/framework/contracts/http"

ctx.Response().Header("Content", "Goravel").String(http.StatusOK, "Hello Goravel")
```

## 返回成功

```go
ctx.Response().Success().String("Hello Goravel")
ctx.Response().Success().Json(http.Json({
  "Hello": "Goravel",
}))
```

## 自定义 Code

```go
ctx.Response().Status(http.StatusOK).Json(http.Json{
  "hello": "Goravel",
})
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

<CommentService/>