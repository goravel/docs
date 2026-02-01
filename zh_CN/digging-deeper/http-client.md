# HTTP 客户端

[[toc]]

## 简介

在软件开发中，有很多时候你需要调用 API 来获取数据——无论是连接到微服务还是访问第三方 API。 在这种情况下，Goravel 提供了一个易于使用、富有表现力且极简的 API，它基于标准的 `net/http` 库构建，所有这些都旨在提升开发者的体验。

## 配置

Goravel 的 HTTP 客户端构建于 `net/http.Client` 之上，用于发起 HTTP 请求。 如果你需要调整其设置，只需更新 `config/http.go` 文件中的 `clients` 配置即可。

## 发起请求

Http facade 提供了一种便捷的方式来使用熟悉的动词（`GET`、`POST`、`PUT`、`DELETE`、`PATCH`、`HEAD` 和 `OPTIONS`）发起 HTTP 请求。

**示例：GET 请求**

```go
response, err := facades.Http().Get("https://example.com")
```

每个 HTTP 动词方法都会返回一个类型为 `framework/contracts/http/client.Response` 的 `response` 和一个在请求失败时返回的 `err`。

你可以使用 `Client` 函数来指定要使用的 HTTP 客户端配置：

```go
response, err := facades.Http().Client("github").Get("https://example.com")
```

### 响应接口

`framework/contracts/http/client.Response` 接口提供了以下方法来与 HTTP 响应进行交互：

```go
type Response interface {
    Bind(value any) error            // 将响应体绑定到结构体
    Body() (string, error)           // 获取响应体为字符串
    ClientError() bool               // 检查状态码是否在 4xx 范围内
    Cookie(name string) *http.Cookie // 获取指定名称的 Cookie
    Cookies() []*http.Cookie         // 获取所有响应 Cookie
    Failed() bool                    // 检查状态码是否不在 2xx 范围内
    Header(name string) string       // 获取指定名称的 Header 值
    Headers() http.Header            // 获取所有响应 Header
    Json() (map[string]any, error)   // 将响应体解码为 JSON 并返回 map
    Redirect() bool                  // 检查响应是否为重定向（3xx 状态码）
    ServerError() bool               // 检查状态码是否在 5xx 范围内
    Status() int                     // 获取 HTTP 状态码
    Successful() bool                // 检查状态码是否在 2xx 范围内

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

你可以使用 `Bind` 方法来指定响应应该绑定到的结构体。

```go
type User struct {
    ID   int    `json:"id"`
    Name string `json:"name"`
}

func main() {
    var user User
    response, err := facades.Http().AcceptJson().Get("https://jsonplaceholder.typicode.com/users/1")
    if err != nil {
        fmt.Println("Error making request:", err)
        return
    }

    err = response.Bind(&user)
    if err != nil {
        fmt.Println("Error binding response:", err)
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

## 测试

在测试应用程序时，你通常希望避免向外部 API 发出真实的网络请求。 无论是为了加速测试、避免速率限制，还是模拟故障场景，Goravel 都让这一切变得简单。 `Http` facade 提供了一个强大的 `Fake` 方法，允许你指示 HTTP 客户端在发出请求时返回存根（模拟）响应。

### 模拟响应

要开始模拟请求，请将一个映射传递给 `Fake` 方法。 键代表你想要拦截的 URL 模式或客户端名称，值代表要返回的响应。 你可以使用 `*` 作为通配符。

`Http` facade 提供了一个方便的 `Response` 构建器来构造各种类型的模拟响应。

```go
facades.Http().Fake(map[string]any{
    // 特定 URL
    "https://github.com/goravel/framework": facades.Http().Response().Json(200, map[string]string{"foo": "bar"}),

    // 通配符模式
    "https://google.com/*": facades.Http().Response().String(200, "Hello World"),

    // 特定客户端（在 config/http.go 中定义）
    "github": facades.Http().Response().OK(),
})
```

**Fallback URLs**

任何未在 `Fake` 中定义的模式匹配的请求都将通过网络正常执行。 为了防止这种情况，你可以使用单个 `*` 通配符定义一个 fallback 模式，它将匹配所有未匹配的 URL。

```go
facades.Http().Fake(map[string]any{
     "https://github.com/*": facades.Http().Response().Json(200, map[string]string{"id": "1"}),
     "*": facades.Http().Response().Status(404),
})
```

**隐式转换**

为了方便起见，你并不总是需要使用 `Response` 构建器。 你可以传递简单的 `int`、`string` 或 `map` 值，Goravel 会自动将它们转换为响应。

```go
facades.Http().Fake(map[string]any{
    "https://goravel.dev/*": "Hello World",               // 字符串 -> 200 OK 带响应体
    "https://github.com/*":  map[string]string{"a": "b"}, // 映射 -> 200 OK JSON
    "https://stripe.com/*":  500,                         // 整数 -> 仅状态码
})
```

### 模拟响应构建器

`facades.Http().Response()` 方法提供了一个流畅的接口，可以轻松构建自定义响应。

```go
// 使用文件内容创建响应
facades.Http().Response().File(200, "./tests/fixtures/user.json")

// 创建 JSON 响应
facades.Http().Response().Json(201, map[string]any{"created": true})

// 创建带有自定义 Header 的响应
headers := http.Header{}
headers.Add("X-Custom", "Value")
facades.Http().Response().Make(200, "Body Content", headers)

// 标准状态码辅助方法
facades.Http().Response().OK()
facades.Http().Response().Status(403)
```

### 模拟响应序列

有时你可能需要指定单个 URL 应按顺序返回一系列不同的响应，例如在测试重试或速率限制逻辑时。 你可以使用 `Sequence` 方法来构建此流程。

```go
facades.Http().Fake(map[string]any{
    "github": facades.Http().Sequence().
                PushStatus(500).                // 第 1 次请求：服务器错误
                PushString(429, "Rate Limit").  // 第 2 次请求：速率限制
                PushStatus(200),                // 第 3 次请求：成功
})
```

**空序列**

当序列中的所有响应都被消耗后，任何进一步的请求都将导致客户端返回错误。
如果你希望指定默认响应而不是失败，请使用 `WhenEmpty` 方法：

```go
facades.Http().Fake(map[string]any{
    "github": facades.Http().Sequence().
                PushStatus(200).
                WhenEmpty(facades.Http().Response().Status(404)),
})
```

### 检查请求

在模拟响应时，验证你的应用程序是否实际发送了正确的请求至关重要。
你可以使用 `AssertSent` 方法来检查请求，并返回一个布尔值，指示它是否符合你的预期。

```go
facades.Http().AssertSent(func(req client.Request) bool {
    return req.Url() == "https://api.example.com/users" &&
           req.Method() == "POST" &&
           req.Input("role") == "admin" &&
           req.Header("Authorization") != ""
})
```

**其他断言**

你也可以断言某个特定请求_未_被发送，或者检查发送的请求总数：

```go
// 断言请求未被发送
facades.Http().AssertNotSent(func(req client.Request) bool {
    return req.Url() == "https://api.example.com/legacy-endpoint"
})

// 断言根本没有发送任何请求
facades.Http().AssertNothingSent()

// 断言恰好发送了 3 个请求
facades.Http().AssertSentCount(3)
```

### 防止误请求

为了确保你的测试严格隔离，并且不会意外访问真实的外部 API，你可以使用 `PreventStrayRequests` 方法。 调用此方法后，任何未匹配已定义的 Fake 规则的请求都将导致测试因异常而 panic。

```go
facades.Http().Fake(map[string]any{
    "github": facades.Http().Response().OK(),
}).PreventStrayRequests()

// 此请求被模拟并成功
facades.Http().Client("github").Get("/") 

// 此请求未被模拟并将引发 panic
facades.Http().Get("https://google.com") 
```

**允许特定请求**

如果你需要阻止大多数请求但允许特定的内部服务（如本地测试服务器），你可以使用 `AllowStrayRequests`：

```go
facades.Http().PreventStrayRequests().AllowStrayRequests([]string{
    "http://localhost:8080/*",
})
```

### 重置状态

`Http` facade 是一个单例，这意味着除非清除，否则模拟的响应会在整个测试套件的运行期间持续存在。 为了避免模拟从一个测试"泄漏"到另一个测试，你应该严格在测试清理或设置中使用 `Reset` 方法。

```go
func TestExternalApi(t *testing.T) {
    defer facades.Http().Reset()
    
    facades.Http().Fake(nil)
    
    // ... 断言
}
```

:::warning 全局状态与并行测试
`Fake` 和 `Reset` 方法会改变 HTTP 客户端工厂的全局状态。 因此，**你应该避免并行运行模拟 HTTP 客户端的测试**（使用 `t.Parallel()`）。 这样做可能会导致竞态条件，即一个测试重置模拟时，另一个测试仍在运行。
:::


