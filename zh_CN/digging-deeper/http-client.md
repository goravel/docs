# HTTP 客户端

[[toc]]

## 简介

在软件开发中，有很多时候你需要调用 API 来获取数据——无论是连接到微服务还是访问第三方 API。 在这种情况下，Goravel 提供了一个易于使用、富有表现力且极简的 API，它基于标准的 `net/http` 库构建，所有这些都旨在提升开发者的体验。

## 配置

Goravel 的 HTTP 客户端构建于 `net/http.Client` 之上，用于发起 HTTP 请求。 如果你需要调整其内部设置，只需更新 `config/http.go` 文件中的 `client` 属性即可。
以下是可用的配置选项：

- `base_url`: 设置相对路径的根 URL。 自动为不以 `http://` 或 `https://` 开头的请求添加前缀。
- `timeout`（默认值：`30s`）: 完整请求生命周期的全局超时时长（连接 + 任何重定向 + 读取响应体）。 零表示不超时。
- `max_idle_conns`: 最大空闲（保持活动）连接数。 零表示没有限制。
- `max_idle_conns_per_host`: 最大空闲（保持活动）连接数。
- `max_conns_per_host`: 限制总连接数，包括正在拨号、活动和空闲状态的连接。 零表示没有限制。
- `idle_conn_timeout`: 空闲（保持活动）连接在自行关闭之前保持空闲的最大时长。

```go
"client": map[string]any{
    "base_url":                config.GetString("HTTP_CLIENT_BASE_URL"),  // "https://api.example.com"
    "timeout":                 config.GetDuration("HTTP_CLIENT_TIMEOUT"), // 30 * time.Second
    "max_idle_conns":          config.GetInt("HTTP_CLIENT_MAX_IDLE_CONNS"), // 100
    "max_idle_conns_per_host": config.GetInt("HTTP_CLIENT_MAX_IDLE_CONNS_PER_HOST"), // 10
    "max_conns_per_host":      config.GetInt("HTTP_CLIENT_MAX_CONN_PER_HOST"), // 0
    "idle_conn_timeout":       config.GetDuration("HTTP_CLIENT_IDLE_CONN_TIMEOUT"), // 90 * time.Second
}
```

## 发起请求

Http facade 提供了一种便捷的方式来使用熟悉的动词（`GET`、`POST`、`PUT`、`DELETE`、`PATCH`、`HEAD` 和 `OPTIONS`）发起 HTTP 请求。

**示例：GET 请求**

```go
import "github.com/goravel/framework/facades"

response, err := facades.Http().Get("https://example.com")
```

每个 HTTP 动词方法都会返回一个类型为 `framework/contracts/http/client.Response` 的 `response` 和一个在请求失败时返回的 `err`。

### 响应接口

`framework/contracts/http/client.Response` 接口提供了以下方法来与 HTTP 响应进行交互：

```go
type Response interface {
    Body() (string, error)           // 获取响应体为字符串
    ClientError() bool              // 检查状态码是否在 4xx 范围内
    Cookie(name string) *http.Cookie // 获取指定名称的 Cookie
    Cookies() []*http.Cookie        // 获取所有响应 Cookie
    Failed() bool                   // 检查状态码是否不在 2xx 范围内
    Header(name string) string      // 获取指定名称的 Header 值
    Headers() http.Header           // 获取所有响应 Header
    Json() (map[string]any, error)   // 将响应体解码为 JSON 并返回 map
    Redirect() bool                 // 检查响应是否为重定向（3xx 状态码）
    ServerError() bool              // 检查状态码是否在 5xx 范围内
    Status() int                    // 获取 HTTP 状态码
    Successful() bool               // 检查状态码是否在 2xx 范围内

    /* 状态码相关方法 */

    OK() bool                  // 200 OK
    Created() bool             // 201 Created
    Accepted() bool            // 202 Accepted
    NoContent() bool           // 204 No Content
    MovedPermanently() bool    // 301 Moved Permanently
    Found() bool               // 302 Found
    BadRequest() bool          // 400 Bad Request
    Unauthorized() bool        // 401 Unauthorized
    PaymentRequired() bool     // 402 Payment Required
    Forbidden() bool           // 403 Forbidden
    NotFound() bool            // 404 Not Found
    RequestTimeout() bool      // 408 Request Timeout
    Conflict() bool            // 409 Conflict
    UnprocessableEntity() bool // 422 Unprocessable Entity
    TooManyRequests() bool     // 429 Too Many Requests
}
```

### URI 模板

URI 模板允许你使用占位符构建动态的请求 URL。
你可以在 URL 中定义这些占位符，然后在发起请求之前提供值来替换它们。
要实现这一点，你可以使用 `WithUrlParameter` 来设置单个参数，或者使用 `WithUrlParameters` 来设置多个参数。

```go
response, err := facades.Http().
	WithUrlParameter("id", "123").
	Get("https://api.example.com/users/{id}")

// 或者

response, err := facades.Http().
    WithUrlParameters(map[string]string{
        "bookId":        "456",
        "chapterNumber": "7",
    }).
    Get("https://api.example.com/books/{bookId}/chapters/{chapterNumber}")
```

### 请求查询参数

使用 `WithQueryParameter` 可以为你的请求添加单个查询参数，或者使用 `WithQueryParameters` 通过 map 添加多个查询参数。

```go
response1, err1 := facades.Http().
    WithQueryParameter("sort", "name").
    Get("https://api.example.com/users")
// 生成的 URL: https://api.example.com/users?sort=name

// 或者添加多个查询参数
response2, err2 := facades.Http().
    WithQueryParameters(map[string]string{
        "page":     "2",
        "pageSize": "10",
    }).
    Get("https://api.example.com/products")
// 生成的 URL: https://api.example.com/products?page=2&pageSize=10
```

你也可以使用 `WithQueryString` 直接添加格式化后的查询字符串：

```go
response, err := facades.Http().
    WithQueryString("filter=active&order=price").
    Get("https://api.example.com/items")
```

### 发送请求体

对于像 `POST`、`PUT`、`PATCH` 和 `DELETE` 这样的 HTTP 动词，它们接受 `io.Reader` 作为第二个参数。
为了简化构建请求负载（payload），框架提供了构建请求体的实用方法。

```go
import "github.com/goravel/framework/support/http"

builder := http.NewBody().SetField("name", "krishan")

body, err := builder.Build()

response, err := facades.Http().WithHeader("Content-Type", body.ContentType()).Post("https://example.com/users", body.Reader())
```

### 请求头

你可以使用 `WithHeader` 为你的请求添加单个请求头，或者使用 `WithHeaders` 通过 map 提供多个请求头。

```go
response, err := facades.Http().
        WithHeader("X-Custom-Header", "value").
        Get("https://api.example.com")

// 添加多个请求头
response, err = facades.Http().
        WithHeaders( map[string]string{
            "Content-Type": "application/json",
            "Accept":       "application/xml",
        }).
        Get("https://api.example.com")
```

你可以使用 `Accept` 方法来指定你的应用程序期望在响应中接收的内容类型：

```go
response, err := facades.Http().
    Accept("application/xml").
    Get("https://api.example.com")
```

为了方便起见，你可以使用 `AcceptJson` 快速指定你期望 API 响应为 `application/json` 格式：

```go
response, err := facades.Http().
    AcceptJson().
    Get("https://api.example.com/data")
```

要使用新的请求头集合替换所有现有的请求头，请使用 `ReplaceHeaders`：

```go
response, err := facades.Http().
        ReplaceHeaders(map[string]string{
            "Authorization": "Bearer token",
        }).
        Get("https://api.example.com")
```

你可以使用 `WithoutHeader` 删除特定的请求头，或者使用 `FlushHeaders` 清除所有请求中使用的请求头。

```go
response, err := facades.Http().
    WithoutHeader("X-Previous-Header").
    Get("https://api.example.com")

// 清除所有请求头
response, err := facades.Http().
    FlushHeaders().
    Get("https://api.example.com")
```

### 身份验证

你可以使用 `WithBasicAuth` 方法指定基本身份验证：

```go
response, err := facades.Http().
    WithBasicAuth("username", "password").
    Get("https://api.example.com/protected")
```

#### Bearer Tokens

要快速将 Bearer Token 添加到请求的 `Authorization` 请求头中，你可以使用 `WithToken` 方法：

```go
response, err := facades.Http().
    WithToken("your_bearer_token").
    Get("https://api.example.com/api/resource")
```

:::tip
`WithToken` 方法还接受一个可选的第二个参数，用于指定令牌类型（例如，“Bearer”、“Token”）。
如果未提供类型，则默认为“Bearer”。

```go
response, err := facades.Http().
    WithToken("custom_token", "Token").
    Get("https://api.example.com/api/resource")
```

:::

要从请求中移除 Bearer Token，请使用 `WithoutToken` 方法：

```go
response, err := facades.Http().
    WithoutToken().
    Get("https://api.example.com/api/resource")
```

### 上下文

你可以使用 `WithContext` 使你的 HTTP 请求具有上下文感知能力。
这允许你控制请求的生命周期，例如，通过设置超时或启用取消。

```go
ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
defer cancel()

response, err := facades.Http().WithContext(ctx).Get("https://example.com")
```

### 绑定响应

你可以直接在 `Http` facade 上使用 `Bind` 方法来指定响应应该绑定到的结构体。

```go
type User struct {
    ID   int    `json:"id"`
    Name string `json:"name"`
}

func main() {
    var user User
    response, err := facades.Http().Bind(&user).AcceptJson().Get("https://jsonplaceholder.typicode.com/users/1")
    if err != nil {
        fmt.Println("Error making request:", err)
        return
    }

    fmt.Printf("User ID: %d, Name: %s\n", user.ID, user.Name)
}
```

### Cookie

要使用 HTTP 请求发送 Cookie，你可以使用 `WithCookie` 来发送单个 Cookie，或者使用 `WithCookies` 来发送多个 Cookie。

```go
response, err := facades.Http().
	WithCookie(&http.Cookie{Name: "user_id", Value: "123"}).
	Get("https://example.com/profile")

// 多个 Cookie
response, err := facades.Http().
	WithCookies([]*http.Cookie{
        {Name: "session_token", Value: "xyz"},
        {Name: "language", Value: "en"},
    }).
	Get("https://example.com/dashboard")
```

要阻止发送特定的 Cookie，你可以使用 `WithoutCookie`。

```go
response, err := facades.Http().
	WithoutCookie("language").
	Get("https://example.com")
```
