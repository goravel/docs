# HTTP 客戶端

[[toc]]

## 概述

在軟體開發中，經常需要調用 API 來抓取數據——無論是連接到微服務還是訪問第三方 API。 在這種情況下，Goravel 提供了一個易於使用、富有表現力且簡約的 API，基於標準的 `net/http` 庫，旨在提升開發者的體驗。

## 配置

Goravel 的 HTTP 客戶端構建於 `net/http.Client` 之上，用於發起 HTTP 請求。如果您需要調整其內部設置，只需更新 `config/http.go` 文件中的 `client` 屬性即可。
以下是可用的配置選項： If you need to tweak its internal settings, just update the `clients` property in the `config/http.go` file.

## 發起請求

Http facade 提供了一種便捷的方式來使用熟悉的動詞（`GET`、`POST`、`PUT`、`DELETE`、`PATCH`、`HEAD` 和 `OPTIONS`）發起 HTTP 請求。

**示例：GET 請求**

```go
response, err := facades.Http().Get("https://example.com")
```

每個 HTTP 動詞方法都會返回一個類型為 `framework/contracts/http/client.Response` 的 `response` 和一個在請求失敗時返回的 `err`。

You can use the `Client` function to specify which HTTP client configuration to use:

```go
response, err := facades.Http().Client("github").Get("https://example.com")
```

### 響應接口

`framework/contracts/http/client.Response` 接口提供了以下方法來與 HTTP 响應進行互動：

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

URI 模板允許你使用占位符構建動態的請求 URL。
你可以在 URL 中定義這些占位符，然後在發起請求之前提供值來替換它們。
要實現這一點，你可以使用 `WithUrlParameter` 來設置單個參數，或者使用 `WithUrlParameters` 來設置多個參數。
你可以在你的 URL 中定義這些占位符，然後提供值來替換它們，通常是在發起請求之前。
為了實現這一點，你可以使用 `WithUrlParameter` 來設置單個參數或 `WithUrlParameters` 來設置多個參數。

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

### 請求查詢參數

使用 `WithQueryParameter` 來為你的請求添加單個查詢參數，或者使用 `WithQueryParameters` 通過 map 添加多個查詢參數。

```go
response1, err1 := facades.Http().
    WithQueryParameter("sort", "name").
    Get("https://api.example.com/users")
// 生成的 URL: https://api.example.com/users?sort=name

// 或者添加多個查詢參數
response2, err2 := facades.Http().
    WithQueryParameters(map[string]string{
        "page":     "2",
        "pageSize": "10",
    }).
    Get("https://api.example.com/products")
// 生成的 URL: https://api.example.com/products?page=2&pageSize=10
```

你也可以使用 `WithQueryString` 直接添加格式化後的查詢字符串：

```go
response, err := facades.Http().
    WithQueryString("filter=active&order=price").
    Get("https://api.example.com/items")
```

### 發送請求體

對於像 `POST`、`PUT`、`PATCH` 和 `DELETE` 這樣的 HTTP 動詞，它們接受 `io.Reader` 作為第二個參數。
為了簡化構建請求體，框架提供了實用方法來構建請求體。

```go
import "github.com/goravel/framework/support/http"

builder := http.NewBody().SetField("name", "krishan")

body, err := builder.Build()

response, err := facades.Http().WithHeader("Content-Type", body.ContentType()).Post("https://example.com/users", body.Reader())
```

### 標頭

你可以使用 `WithHeader` 為你的請求添加單個請求頭，或者使用 `WithHeaders` 通過 map 提供多個請求頭。

```go
response, err := facades.Http().
        WithHeader("X-Custom-Header", "value").
        Get("https://api.example.com")

// 添加多個請求頭
response, err = facades.Http().
        WithHeaders( map[string]string{
            "Content-Type": "application/json",
            "Accept":       "application/xml",
        }).
        Get("https://api.example.com")
```

你可以使用 `Accept` 方法來指定你的應用程序期望在響應中接收的內容類型：

```go
response, err := facades.Http().
    Accept("application/xml").
    Get("https://api.example.com")
```

為了方便起見，你可以使用 `AcceptJson` 快速指定你期望 API 響應為 `application/json` 格式：

```go
response, err := facades.Http().
    AcceptJson().
    Get("https://api.example.com/data")
```

要使用新的請求頭集合替換所有現有的請求頭，請使用 `ReplaceHeaders`：

```go
response, err := facades.Http().
        ReplaceHeaders(map[string]string{
            "Authorization": "Bearer token",
        }).
        Get("https://api.example.com")
```

你可以使用 `WithoutHeader` 刪除特定的請求頭，或者使用 `FlushHeaders` 清除所有請求中使用的請求頭。

```go
response, err := facades.Http().
    WithoutHeader("X-Previous-Header").
    Get("https://api.example.com")

// 清除所有請求頭
response, err := facades.Http().
    FlushHeaders().
    Get("https://api.example.com")
```

### 認證

你可以使用 `WithBasicAuth` 方法指定基本身份驗證：

```go
response, err := facades.Http().
    WithBasicAuth("username", "password").
    Get("https://api.example.com/protected")
```

#### Bearer Tokens

要快速將 Bearer Token 添加到請求的 `Authorization` 請求頭中，你可以使用 `WithToken` 方法：

```go
response, err := facades.Http().
    WithToken("your_bearer_token").
    Get("https://api.example.com/api/resource")
```

:::tip
`WithToken` 方法還接受一個可選的第二個參數，用於指定令牌類型（例如，“Bearer”、“Token”）。
如果未提供類型，則默認為“Bearer”。

```go
response, err := facades.Http().
    WithToken("custom_token", "Token").
    Get("https://api.example.com/api/resource")
```

:::

要從請求中移除 Bearer Token，請使用 `WithoutToken` 方法：

```go
response, err := facades.Http().
    WithoutToken().
    Get("https://api.example.com/api/resource")
```

### 上下文

你可以使用 `WithContext` 使你的 HTTP 請求具有上下文感知能力。
這允許你控制請求的生命週期，例如，通過設置超時或啟用取消。

```go
ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
def defer cancel()

response, err := facades.Http().WithContext(ctx).Get("https://example.com")
```

### 響應綁定

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

要使用 HTTP 請求發送 Cookie，你可以使用 `WithCookie` 來發送單個 Cookie，或者使用 `WithCookies` 來發送多個 Cookie。

```go
response, err := facades.Http().
	WithCookie(&http.Cookie{Name: "user_id", Value: "123"}).
	Get("https://example.com/profile")

// 多個 Cookie
response, err := facades.Http().
	WithCookies([]*http.Cookie{
        {Name: "session_token", Value: "xyz"},
        {Name: "language", Value: "en"},
    }).
	Get("https://example.com/dashboard")
```

要阻止發送特定的 Cookie，你可以使用 `WithoutCookie`。

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


