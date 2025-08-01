# 请求

[[toc]]

## 简介

Goravel 的 `contracts/http/Request` 方法可以与应用程序处理的当前 HTTP 请求进行交互，以及检索与请求一起提交的输入内容和文件。

## 与请求交互

`http.Context` 实例被自动注入到控制器中：

```go
import "github.com/goravel/framework/contracts/http"

facades.Route().Get("/", func(ctx http.Context) {

})
```

### 获取请求路径

```go
path := ctx.Request().Path() // /users/1

originPath := ctx.Request().OriginPath() // /users/{id}
```

### 获取请求 URL

```go
url := ctx.Request().Url() // /users?name=Goravel
```

### 获取请求 HOST

```go
url := ctx.Request().Host()
```

### 获取完整 URL

```go
url := ctx.Request().FullUrl() // http://**/users?name=Goravel
```

### 获取请求方法

```go
method := ctx.Request().Method()
```

### 获取请求路由信息

```go
info := ctx.Request().Info()
```

### 获取请求路由名称

```go
name := ctx.Request().Name()
```

### 获取请求头

```go
header := ctx.Request().Header("X-Header-Name", "default")
headers := ctx.Request().Headers()
```

### 获取 IP 地址

```go
ip := ctx.Request().Ip()
```

## 输入

### 获取所有输入数据

可以使用 `All` 方法以 `map[string]any` 的形式检索所有传入请求的输入数据，是 `json`， `form` 和 `query` 的合集（优先级由前到后）。

```go
data := ctx.Request().All()
```

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

queries := ctx.Request().Queries()
```

### 检索一个输入值

获取所有的用户输入数据，而不用在意用户使用的是哪种 HTTP 动词，不管是什么 HTTP 动词。检索顺序为：`json`, `form`。

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

### 绑定 json/form

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

### 绑定 Query

仅支持绑定 Query 到 struct：

```go
type Test struct {
  ID string `form:"id"`
}
var test Test
err := ctx.Request().BindQuery(&test)
```

## Cookie

### 获取 Cookie

Goravel 提供了一种简单的方法来处理 `cookie`。使用 `Request` 实例上的 `Cookie` 方法获取 `cookie` 的值，如果 `cookie` 不存在，则返回空字符串。也可以在第二个参数上定义一个默认值。

```go
value := ctx.Request().Cookie("name")
value := ctx.Request().Cookie("name", "default")
```

## 文件

### 获取上传的文件

```go
file, err := ctx.Request().File("file")
files, err := ctx.Request().Files("file")
```

### 储存上传的文件

```go
file, err := ctx.Request().File("file")
file.Store("./public/test.png")
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

## 自定义 Recovery

可以通过在 `app/providers/route_service_provider.go` 文件中调用 `Recover` 方法 设置自定义 `recovery`。

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
