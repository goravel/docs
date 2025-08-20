# HTTP 回應

[[toc]]

## 概述

您可以在控制器中使用 `ctx.Response()` 來進行 HTTP 回應。

## 字串

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

## 自定義返回

```go
ctx.Response().Data(http.StatusOK, "text/html; charset=utf-8", []byte("<b>Goravel</b>"))
```

## 回應文件

```go
import "net/http"

ctx.Response().File("./public/logo.png")
```

## 下載文件

```go
import "net/http"

ctx.Response().Download("./public/logo.png", "1.png")
```

## 附加標頭

```go
import "github.com/goravel/framework/contracts/http"

ctx.Response().Header("Content", "Goravel").String(http.StatusOK, "Hello Goravel")
```

## Cookie

### 設置 Cookie

使用 `response` 實例中的 `Cookie` 方法來設置 `cookie`。 `Cookie` 方法接受一個 `http.Cookie` 實例，允許您設置各種 cookie 選項。

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

### 過期 Cookie

使用 `WithoutCookie` 方法來刪除 Cookie。

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

## 自定義代碼

```go
ctx.Response().Status(http.StatusOK).Json(http.Json{
  "hello": "Goravel",
})
```

## 返回串流

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

## 無內容

```go
ctx.Response().NoContent()
ctx.Response().NoContent(http.StatusOk)
```

## 獲取回應

可以從 `ctx.Response()` 獲取所有信息，通常在 HTTP 中間件中使用：

```go
origin := ctx.Response().Origin()
```

`origin` 包含以下方法：

| 方法   | 操作      |
| ---- | ------- |
| Body | 獲取回應數據  |
| 標頭   | 獲取回應標頭  |
| 大小   | 獲取回應大小  |
| 狀態   | 獲取回應狀態碼 |
