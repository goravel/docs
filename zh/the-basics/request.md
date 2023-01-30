# 请求

[[toc]]

## 介绍

Goravel 的 `contracts/http/Request` 方法可以与应用程序处理的当前 HTTP 请求进行交互，以及检索与请求一起提交的输入内容和文件。

## 与请求交互

`http.Context` 实例被自动注入到控制器中：

```go
import "github.com/goravel/framework/contracts/http"

facades.Route.Get("/", func(ctx http.Context) {

})
```

### 获取请求路径

```go
path := ctx.Request().Path() // /users
```

### 获取请求 URL

```go
url := ctx.Request().Url() // /users?name=Goravel
```

### 获取完整 URL

```go
url := ctx.Request().FullUrl() // http://**/users?name=Goravel
```

### 获取请求方法

```go
method := ctx.Request().Method()
```

### 获取请求头

```go
header := ctx.Request().Header('X-Header-Name', 'default')
headers := ctx.Request().Headers()
```

### 获取 IP 地址

```go
method := ctx.Request().Ip()
```

## 输入

### 获取链接中的参数

```go
// /users/:id
id := ctx.Request().Input("id")
```

### 获取链接传入的参数

```go
// /users?name=goravel
name := ctx.Request().Query("name", "goravel")

// /users?names=goravel1&names=goravel2
names := ctx.Request().QueryArray("names")

// /users?names[a]=goravel1&names[b]=goravel2
names := ctx.Request().QueryMap("names")
```

### 获取 form

```go
name := ctx.Request().Form("name", "goravel")
```

### form 绑定 struct

```go
type User struct {
  Name string `form:"code" json:"code"`
}

var user User
err := ctx.Request().Bind(&user)
```

## 文件

### 获取上传的文件

```go
file, err := ctx.Request().File("file")
```

### 储存上传的文件

```go
file, err := ctx.Request().File("file")
file.Store("./public/test.png")
```

### 中断请求

```go
ctx.Request().AbortWithStatus(403)
ctx.Request().AbortWithStatusJson(403, http.Json{
  "Hello": "World",
})
```

### 获取原始 Request

```go
request := ctx.Request().Origin()
```

### 附加数据

```go
ctx.WithValue("user", "Goravel")
```

### 获取数据

```go
user := ctx.Value("user")
```

### 获取 Context

```go
ctx := ctx.Context()
```
