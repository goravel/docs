# HTTP 客户端

[[toc]]

## 简介

在软件开发中，有很多时候你需要调用 API 来获取数据——无论是连接到微服务还是访问第三方 API。 在这种情况下，Goravel 提供了一个易于使用、富有表现力且极简的 API，它基于标准的 `net/http` 库构建，所有这些都旨在提升开发者的体验。

## 配置

Goravel 的 HTTP 客户端构建于 `net/http.Client` 之上，用于发起 HTTP 请求。 If you need to tweak its internal settings, just update the `clients` property in the `config/http.go` file.

## 发起请求

Http facade 提供了一种便捷的方式来使用熟悉的动词（`GET`、`POST`、`PUT`、`DELETE`、`PATCH`、`HEAD` 和 `OPTIONS`）发起 HTTP 请求。

**示例：GET 请求**

```go
response, err := facades.Http().Get("https://example.com")
```

每个 HTTP 动词方法都会返回一个类型为 `framework/contracts/http/client.Response` 的 `response` 和一个在请求失败时返回的 `err`。

You can use the `Client` function to specify which HTTP client configuration to use:

```go
response, err := facades.Http().Client("github").Get("https://example.com")
```

### 响应接口

`framework/contracts/http/client.Response` 接口提供了以下方法来与 HTTP 响应进行交互：

```go
type Response interface {
    Bind(value any) error            // Bind the response body to a struct
    Body() (string, error)           // Get the response body as a string
    ClientError() bool               // Check if the status code is in the 4xx range
    Cookie(name string) *http.Cookie // Get a specific cookie
    Cookies() []*http.Cookie         // Get all response cookies
    Failed() bool                    // Check if the status code is not in the 2xx range
    Header(name string) string       // Get the value of a specific header
    Headers() http.Header            // Get all response headers
    Json() (map[string]any, error)   // Decode the response body as JSON into a map
    Redirect() bool                  // Check if the response is a redirect (3xx status code)
    ServerError() bool               // Check if the status code is in the 5xx range
    Status() int                     // Get the HTTP status code
    Successful() bool                // Check if the status code is in the 2xx range

    /* status code related methods */

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

You can use the `Bind` method to specify the struct that the response should be bound to.

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

## Testing

When testing your application, you often want to avoid making real network requests to external APIs. Whether it's to
speed up tests, avoid rate limits, or simulate failure scenarios, Goravel makes this easy. The `Http` facade provides a
powerful `Fake` method that allows you to instruct the HTTP client to return stubbed (dummy) responses when requests are made.

### Faking Responses

To start faking requests, pass a map to the `Fake` method. The keys represent the URL patterns or client names
you want to intercept, and the values represent the responses to return. You can use `*` as a wildcard character.

The `Http` facade provides a convenient `Response` builder to construct various types of fake responses.

```go
facades.Http().Fake(map[string]any{
    // Stub a specific URL
    "https://github.com/goravel/framework": facades.Http().Response().Json(200, map[string]string{"foo": "bar"}),

    // Stub a wildcard pattern
    "https://google.com/*": facades.Http().Response().String(200, "Hello World"),

    // Stub a specific Client (defined in config/http.go)
    "github": facades.Http().Response().OK(),
})
```

**Fallback URLs**

Any request that does not match a pattern defined in `Fake` will be executed normally over the network. To prevent this,
you can define a fallback pattern using the single `*` wildcard, which will match all unmatched URLs.

```go
facades.Http().Fake(map[string]any{
     "https://github.com/*": facades.Http().Response().Json(200, map[string]string{"id": "1"}),
     "*": facades.Http().Response().Status(404),
})
```

**Implicit Conversions**

For convenience, you do not always need to use the `Response` builder. You can pass simple `int`, `string`, or `map`
values, and Goravel will automatically convert them into responses.

```go
facades.Http().Fake(map[string]any{
    "https://goravel.dev/*": "Hello World",               // String -> 200 OK with body
    "https://github.com/*":  map[string]string{"a": "b"}, // Map -> 200 OK JSON
    "https://stripe.com/*":  500,                         // Int -> Status code only
})
```

### Fake Response Builder

The `facades.Http().Response()` method provides a fluent interface to build custom responses easily.

```go
// Create a response using a file content
facades.Http().Response().File(200, "./tests/fixtures/user.json")

// Create a JSON response
facades.Http().Response().Json(201, map[string]any{"created": true})

// Create a response with custom headers
headers := http.Header{}
headers.Add("X-Custom", "Value")
facades.Http().Response().Make(200, "Body Content", headers)

// Standard status helpers
facades.Http().Response().OK()
facades.Http().Response().Status(403)
```

### Faking Response Sequences

Sometimes you may need to specify that a single URL should return a series of different responses in order,
such as when testing retries or rate-limiting logic. You can use the `Sequence` method to build this flow.

```go
facades.Http().Fake(map[string]any{
    "github": facades.Http().Sequence().
                PushStatus(500).                // 1st Request: Server Error
                PushString(429, "Rate Limit").  // 2nd Request: Rate Limit
                PushStatus(200),                // 3rd Request: Success
})
```

**Empty Sequences**

When all responses in a sequence have been consumed, any further requests will cause the client to return an error.
If you wish to specify a default response instead of failing, use the `WhenEmpty` method:

```go
facades.Http().Fake(map[string]any{
    "github": facades.Http().Sequence().
                PushStatus(200).
                WhenEmpty(facades.Http().Response().Status(404)),
})
```

### Inspecting Requests

When faking responses, it is crucial to verify that the correct requests were actually sent by your application.
You can use the `AssertSent` method to inspect the request and return a boolean indicating if it matches your expectations.

```go
facades.Http().AssertSent(func(req client.Request) bool {
    return req.Url() == "https://api.example.com/users" &&
           req.Method() == "POST" &&
           req.Input("role") == "admin" &&
           req.Header("Authorization") != ""
})
```

**Other Assertions**

You can also assert that a specific request was _not_ sent, or check the total number of requests sent:

```go
// Assert a request was NOT sent
facades.Http().AssertNotSent(func(req client.Request) bool {
    return req.Url() == "https://api.example.com/legacy-endpoint"
})

// Assert that no requests were sent at all
facades.Http().AssertNothingSent()

// Assert that exactly 3 requests were sent
facades.Http().AssertSentCount(3)
```

### Preventing Stray Requests

To ensure your tests are strictly isolated and do not accidentally hit real external APIs, you can use the
`PreventStrayRequests` method. After calling this, any request that does not match a defined Fake rule will cause the
test to panic with an exception.

```go
facades.Http().Fake(map[string]any{
    "github": facades.Http().Response().OK(),
}).PreventStrayRequests()

// This request is mocked and succeeds
facades.Http().Client("github").Get("/") 

// This request is NOT mocked and will panic
facades.Http().Get("https://google.com") 
```

**Allowing Specific Strays**

If you need to block most requests but allow specific internal services (like a local test server),
you can use `AllowStrayRequests`:

```go
facades.Http().PreventStrayRequests().AllowStrayRequests([]string{
    "http://localhost:8080/*",
})
```

### Resetting State

The `Http` facade is a singleton, meaning mocked responses persist across the entire runtime of your test suite unless
cleared. To avoid "leaking" mocks from one test to another, you should strictly use the `Reset` method in
your test cleanup or setup.

```go
func TestExternalApi(t *testing.T) {
    defer facades.Http().Reset()
    
    facades.Http().Fake(nil)
    
    // ... assertions
}
```

:::warning Global State & Parallel Testing
The `Fake` and `Reset` methods mutate the global state of the HTTP client factory. Because of this, **you should avoid
running tests that mock the HTTP client in parallel** (using `t.Parallel()`). Doing so may result in race conditions
where one test resets the mocks while another is still running.
:::


