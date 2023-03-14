# 请求

[[toc]]

## 简介

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

### 获取路由中的参数

```go
// /users/{id}
id := ctx.Request().Route("id")
id := ctx.Request().RouteInt("id")
id := ctx.Request().RouteInt64("id")
```

### 获取路由传入的参数

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
```

### 获取 form

```go
name := ctx.Request().Form("name")
name := ctx.Request().Form("name", "default")
```

### 获取 json

```go
name := ctx.Request().Json("name")
name := ctx.Request().Json("name", "goravel")
```

> 注意：只能获取一维 Json 数据，否则将返回空。

### 检索一个输入值

获取所有的用户输入数据，而不用在意用户使用的是哪种 HTTP 动词，不管是什么 HTTP 动词。检索顺序为：`json`, `form`, `query`, `route`。

```go
name := ctx.Request().Input("name")
name := ctx.Request().Json("name", "goravel")
name := ctx.Request().InputInt("name")
name := ctx.Request().InputInt64("name")
name := ctx.Request().InputBool("name")
```

### json/form 绑定 struct

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
