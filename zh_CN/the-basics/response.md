# HTTP 响应

[[toc]]

## 简介

你可以在控制器中使用 `ctx.Response()` 进行 HTTP 响应。

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

## 响应文件

```go
import "net/http"

ctx.Response().File("./public/logo.png")
```

## 下载文件

```go
import "net/http"

ctx.Response().Download("./public/logo.png", "1.png")
```

## 附加头部

```go
import "github.com/goravel/framework/contracts/http"

ctx.Response().Header("Content", "Goravel").String(http.StatusOK, "Hello Goravel")
```

## Cookie

### 设置 Cookie

Use the `Cookie` method on the `response` instance to set a `cookie`. 使用 `response` 实例上的 `Cookie` 方法来设置 `cookie`。 `Cookie` 方法接受一个 `http.Cookie` 实例，它允许你设置各种 cookie 选项。

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

### 过期 Cookie

使用 `WithoutCookie` 方法移除一个 cookie。

```go
ctx.Response().WithoutCookie("name")
```

## 返回成功

```go
ctx.Response().Success().String("Hello Goravel")
ctx.Response().Success().Json(http.Json{
  "Hello": "Goravel",
})
```

## 自定义状态码

```go
ctx.Response().Status(http.StatusOK).Json(http.Json{
  "hello": "Goravel",
})
```

## 返回流

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

## 重定向

```go
ctx.Response().Redirect(http.StatusMovedPermanently, "https://goravel.dev")
```

## 无内容

```go
ctx.Response().NoContent()
ctx.Response().NoContent(http.StatusOk)
```

## 获取响应

您可以从 `ctx.Response()` 获取所有信息，这在 HTTP 中间件中常用：

```go
origin := ctx.Response().Origin()
```

`origin` 包含一些方法，如下所示：

| 方法   | 操作     |
| ---- | ------ |
| Body | 获取响应数据 |
| 头部   | 获取响应头  |
| 大小   | 获取响应大小 |
| 状态   | 获取响应状态 |
