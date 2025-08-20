# HTTP 請求

[[toc]]

## 概述

Goravel 的 `contracts/http/Request` 方法可以與應用程序處理的當前 HTTP 請求進行交互，並獲取一起提交的輸入和文件。

## 與請求交互

`http.Context` 實例會自動注入到控制器中：

```go
import "github.com/goravel/framework/contracts/http"

facades.Route().Get("/", func(ctx http.Context) {

})
```

### 獲取請求路徑

```go
path := ctx.Request().Path() // /users/1

originPath := ctx.Request().OriginPath() // /users/{id}
```

### 獲取請求 URL

```go
url := ctx.Request().Url() // /users?name=Goravel
```

### 獲取請求 HOST

```go
url := ctx.Request().Host()
```

### 獲取完整 URL

```go
url := ctx.Request().FullUrl() // http://**/users?name=Goravel
```

### 獲取請求方法

```go
method := ctx.Request().Method()
```

### 獲取請求路由信息

```go
info := ctx.Request().Info()
```

### 獲取請求路由名稱

```go
name := ctx.Request().Name()
```

### 請求頭

```go
header := ctx.Request().Header("X-Header-Name", "default")
headers := ctx.Request().Headers()
```

### 獲取 IP 地址

```go
ip := ctx.Request().Ip()
```

## 輸入

### 獲取所有輸入數據

您可以使用 `All` 方法以 `map[string]any` 的形式檢索所有傳入請求的輸入數據，這是 `json`、`form` 和 `query` 的集合（優先級由前到後）。

```go
data := ctx.Request().All()
```

### 獲取路由值

```go
// /users/{id}
id := ctx.Request().Route("id")
id := ctx.Request().RouteInt("id")
id := ctx.Request().RouteInt64("id")
```

### 從查詢字符串中檢索輸入

```go
// /users?name=goravel
name := ctx.Request().Query("name")
name := ctx.Request().Query("name", "default")

// /users?id=1
name := ctx.Request().QueryInt("id")
name := ctx.Request().QueryInt64("id")
name := ctx.Request().QueryBool("id")

// /users?names=goravel1&names=goravel2
names := ctx.Request().QueryArray("names")

// /users?names[a]=goravel1&names[b]=goravel2
names := ctx.Request().QueryMap("names")

queries := ctx.Request().Queries()
```

> 注意：只能獲取單維 Json 數據，否則它將返回為空。

### 檢索一個輸入值

獲取所有用戶輸入而不必擔心請求使用了哪個 HTTP 動詞。 檢索順序：`json`、`form`。

```go
name := ctx.Request().Input("name")
name := ctx.Request().Input("name", "goravel")
name := ctx.Request().InputInt("name")
name := ctx.Request().InputInt64("name")
name := ctx.Request().InputBool("name")
name := ctx.Request().InputArray("name")
name := ctx.Request().InputMap("name")
name := ctx.Request().InputMapArray("name")
```

### 綁定 Json/Form

```go
type User struct {
  Name string `form:"code" json:"code"`
}

var user User
err := ctx.Request().Bind(&user)
```

```go
var user map[string]any
err := ctx.Request().Bind(&user)
```

### 綁定 Query

僅支持綁定 Query 到 struct：

```go
type Test struct {
  ID string `form:"id"`
}
var test Test
err := ctx.Request().BindQuery(&test)
```

## Cookie

### 獲取 Cookie 值

Goravel 提供了一種簡單的方法來處理 `cookie`。 使用 `Request` 實例上的 `Cookie` 方法來獲取 `cookie` 的值，如果 `cookie` 不存在，則會返回空字符串。 您也可以在第二個參數中定義默認值。

```go
value := ctx.Request().Cookie("name")
value := ctx.Request().Cookie("name", "default")
```

## 文件

### 獲取上傳的文件

```go
file, err := ctx.Request().File("file")
files, err := ctx.Request().Files("file")
```

### 儲存上傳的文件

```go
file, err := ctx.Request().File("file")
file.Store("./public")
```

### 獲取原始 Request

```go
request := ctx.Request().Origin()
```

### 附加數據

```go
ctx.WithValue("user", "Goravel")
```

### 獲取數據

```go
user := ctx.Value("user")
```

### 獲取 Context

```go
ctx := ctx.Context()
```

## 自定義 Recovery

您可以通過在 `app/providers/route_service_provider.go` 文件中調用 `Recover` 方法來設置自定義的 `recovery`。

```go
// app/providers/route_service_provider.go
func (receiver *RouteServiceProvider) Boot(app foundation.Application) {
  // Add HTTP middleware
  facades.Route().GlobalMiddleware(http.Kernel{}.Middleware()...)
  facades.Route().Recover(func(ctx http.Context, err error) {
    ctx.Request().Abort()
    // or
    // ctx.Response().String(500, "Internal Server Error").Abort()
  })
  ...
}
```
