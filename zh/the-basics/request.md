# 请求

[[toc]]

## 介绍

Goravel 的 `contracts/http/Request` 方法可以与应用程序处理的当前 HTTP 请求进行交互，以及检索与请求一起提交的输入内容和文件。

## 与请求交互

`request` 实例被自动注入到控制器中：

```go
import "github.com/goravel/framework/contracts/http"

facades.Route.Get("/", func(request http.Request) {

})
```

### 获取请求路径

```go
path := request.Path() // /users
```

### 获取请求 URL

```go
url := request.Url() // /users?name=Goravel
```

### 获取完整 URL

```go
url := request.FullUrl() // http://**/users?name=Goravel
```

### 获取请求方法

```go
method := request.Method()
```

### 获取请求头

```go
header := request.Header('X-Header-Name', 'default')
headers := request.Headers()
```

### 获取 IP 地址

```go
method := request.Ip()
```

### 附加 Context

```go
request := request.WithContext(context.Background())
```

### 获取 Context

```go
ctx := request.Context()
```

## 输入

### 获取链接中的参数

```go
// /users/:id
id := request.Input("id")
```

### 获取链接传入的参数

```go
// /users?name=goravel
name := request.Query("name", "goravel")
```

### 获取 form

```go
name := request.Form("name", "goravel")
```

### form 绑定 struct

```go
type User struct {
	Name string `form:"code" json:"code" binding:"required"`
}

var user User
err := request.Bind(&user)
```

## 文件

### 获取上传的文件

```go
file, err := request.File("file")
```

### 储存上传的文件

```go
file, err := request.File("file")
file.Store("./public/test.png")
```

### 中断请求

```go
request.AbortWithStatus(403)
```
