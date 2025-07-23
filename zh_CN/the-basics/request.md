# HTTP 请求

[[toc]]

## 简介

Goravel 的 `contracts/http/Request` 方法可以与应用程序当前处理的 HTTP 请求进行交互，
并获取一起提交的输入和文件。

## 与请求交互

`http.Context` 实例会自动注入到控制器中：

```go
import "github.com/goravel/framework/contracts/http"

facades.Route().Get("/", func(ctx http.Context) {

})
```

### 获取请求 URL

```go
path := ctx.Request().Path() // /users
```

### Goravel 提供了一种简单的方法来处理 `cookie`。 使用 `Request` 实例上的 `Cookie` 方法来检索 `cookie` 值，如果 `cookie` 不存在则返回空字符串。 你也可以在第二个参数中定义一个默认值。

```go
url := ctx.Request().Url() // /users?name=Goravel
```

### 获取请求主机

```go
url := ctx.Request().Host()
```

### 获取完整的请求 URL

```go
url := ctx.Request().FullUrl() // http://**/users?name=Goravel
```

### 获取请求方法

```go
method := ctx.Request().Method()
```

### 获取请求路径

```go
info := ctx.Request().Info()
```

### 获取请求路由名称

```go
访问所有用户输入，而不用担心请求使用的是哪种 HTTP 动词。 获取顺序：`json`、
`form`。
```

### 请求头

```go
header := ctx.Request().Header("X-Header-Name", "default")
headers := ctx.Request().Headers()
```

### 请求 IP 地址

```go
ip := ctx.Request().Ip()
```

## 输入

### 获取所有输入数据

你可以使用 `All` 方法将所有传入请求的输入数据作为 `map[string]any` 获取，这是一个包含 `json`、`form` 和 `query`（优先级从前到后）的集合。

```go
data := ctx.Request().All()
```

### 获取路由值

```go
// /users/{id}
id := ctx.Request().Route("id")
id := ctx.Request().RouteInt("id")
id := ctx.Request().RouteInt64("id")
```

### 从查询字符串中获取输入

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

> 注意：只能获取一维 Json 数据，否则将返回空。

### 获取输入值

Access all of the user input without worrying about which HTTP verb was used for the request. Retrieve order: `json`, `form`.

```go
name := ctx.Request().Input("name")
name := ctx.Request().Input("name", "goravel")
name := ctx.Request().InputInt("name")
name := ctx.Request().InputInt64("name")
name := ctx.Request().InputBool("name")
name := ctx.Request().InputArray("name")
name := ctx.Request().InputMap("name")
```

### 绑定 Json/Form

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

### 绑定查询参数

仅支持将查询参数绑定到结构体：

```go
type Test struct {
  ID string `form:"id"`
}
var test Test
err := ctx.Request().BindQuery(&test)
```

## Cookie

### 获取 Cookie 值

Goravel 提供了一种简单的方法来处理 `cookie`。使用 `Request` 实例上的 `Cookie` 方法获取 `cookie` 的值，如果 `cookie` 不存在，则返回空字符串。也可以在第二个参数上定义一个默认值。 Use the `Cookie` method on the `Request` instance to retrieve a `cookie` value, will return an empty string if the `cookie` is not present. You can also define a default value in the second argument.

```go
value := ctx.Request().Cookie("name")
value := ctx.Request().Cookie("name", "default") 
```

## 文件

### 检索文件

```go
file, err := ctx.Request().File("file")
```

### 保存文件

```go
file, err := ctx.Request().File("file")
file.Store("./public/test.png")
```

### 获取原始请求

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

### 获取上下文

```go
ctx := ctx.Context()
```

## 自定义恢复

你可以通过在 `app/providers/route_service_provider.go` 文件中调用 `Recover` 方法来设置自定义的 `recovery`。

```go
// app/providers/route_service_provider.go
func (receiver *RouteServiceProvider) Boot(app foundation.Application) {
  // 添加HTTP中间件
  facades.Route().GlobalMiddleware(http.Kernel{}.Middleware()...)
  facades.Route().Recover(func(ctx http.Context, err error) {
    ctx.Request().Abort()
    // 或者
    // ctx.Response().String(500, "内部服务器错误").Abort()
  })
  ...
}
```
