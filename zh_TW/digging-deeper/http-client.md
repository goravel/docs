# HTTP 客戶端

[[toc]]

## 概述

在軟體開發中，經常需要調用 API 來抓取數據——無論是連接到微服務還是訪問第三方 API。 在這種情況下，Goravel 提供了一個易於使用、富有表現力且簡約的 API，基於標準的 `net/http` 庫，旨在提升開發者的體驗。

## 配置

Goravel 的 HTTP 客戶端構建於 `net/http.Client` 之上，用於發起 HTTP 請求。如果您需要調整其內部設置，只需更新 `config/http.go` 文件中的 `client` 屬性即可。
以下是可用的配置選項： 如果您需要調整其內部設置，只需更新 `config/http.go` 文件中的 `client` 屬性。
以下是可用的配置選項：

- `base_url`: 設置相對路徑的根 URL。 自動為不以 `http://` 或 `https://` 開頭的請求添加前綴。
- `timeout`（默認：`30s`）: 完整請求生命週期的全局超時持續時間（連接 + 任何重定向 + 讀取響應體）。 超時為零表示無超時。
- `max_idle_conns`: 最大空閒（保持活動）連接數。 零表示沒有限制。
- `max_idle_conns_per_host`: 每個主機的最大空閒（保持活動）連接數。
- `max_conns_per_host`: 限制每個主機的總連接數，包括正在撥號、活動和空閒狀態的連接。 零表示沒有限制。
- `idle_conn_timeout`: 空閒（保持活動）連接在自行關閉之前保持空閒的最大時間。

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

## 發起請求

Http facade 提供了一種便捷的方式來使用熟悉的動詞（`GET`、`POST`、`PUT`、`DELETE`、`PATCH`、`HEAD` 和 `OPTIONS`）發起 HTTP 請求。

**示例：GET 請求**

```go
import "github.com/goravel/framework/facades"

response, err := facades.Http().Get("https://example.com")
```

每個 HTTP 動詞方法都會返回一個類型為 `framework/contracts/http/client.Response` 的 `response` 和一個在請求失敗時返回的 `err`。

### 響應接口

`framework/contracts/http/client.Response` 接口提供了以下方法來與 HTTP 响應進行互動：

```go
type Response interface {
    Body() (string, error)           // 獲取響應體作為字符串
    ClientError() bool              // 檢查狀態碼是否在 4xx 範圍內
    Cookie(name string) *http.Cookie // 獲取特定的 Cookie
    Cookies() []*http.Cookie        // 獲取所有響應 Cookie
    Failed() bool                   // 檢查狀態碼是否不在 2xx 範圍內
    Header(name string) string      // 獲取特定標頭的值
    Headers() http.Header           // 獲取所有響應標頭
    Json() (map[string]any, error)   // 將響應體解碼為 JSON 進入 map
    Redirect() bool                 // 檢查響應是否為重定向（3xx 狀態碼）
    ServerError() bool              // 檢查狀態碼是否在 5xx 範圍內
    Status() int                    // 獲取 HTTP 狀態碼
    Successful() bool               // 檢查狀態碼是否在 2xx 範圍內

    /* 狀態碼相關方法 */

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

response, err := facades.Http().WithHeader("Content-Type", body.ContentType()).Post("https://example.com/users", body)  
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

你可以直接在 `Http` facade 上使用 `Bind` 方法來指定響應應該綁定到的結構體。

```go
type User struct {
    ID   int    `json:"id"`
    Name string `json:"name"`
}

func main() {
    var user User
    response, err := facades.Http().Bind(&user).AcceptJson().Get("https://jsonplaceholder.typicode.com/users/1")
    if err != nil {
        fmt.Println("執行請求時出錯：", err)
        return
    }

    fmt.Printf("用戶 ID: %d, 名稱: %s\n", user.ID, user.Name)
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
