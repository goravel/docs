# Goravel HTTP Client

## Basic Requests

```go
// Default client
response, err := facades.Http().Get("https://example.com")
response, err = facades.Http().Post("https://example.com/users", body)
response, err = facades.Http().Put("https://example.com/users/1", body)
response, err = facades.Http().Delete("https://example.com/users/1", nil)
response, err = facades.Http().Patch("https://example.com/users/1", body)
response, err = facades.Http().Head("https://example.com")

// Named client (configured in config/http.go clients map)
response, err = facades.Http().Client("github").Get("https://api.github.com")
```

---

## Response Interface

```go
// BREAKING v1.17: Http.Request.Bind() is removed — use response.Bind(&dest)

var user User
err = response.Bind(&user)                 // bind JSON body to struct

body, err := response.Body()               // raw string body
json, err := response.Json()               // map[string]any
status    := response.Status()             // HTTP status code
header    := response.Header("X-Custom")
headers   := response.Headers()
cookies   := response.Cookies()
cookie    := response.Cookie("session")

// Status checks
response.Successful()         // 2xx
response.Failed()             // not 2xx
response.ClientError()        // 4xx
response.ServerError()        // 5xx
response.Redirect()           // 3xx
response.OK()                 // 200
response.Created()            // 201
response.NotFound()           // 404
response.UnprocessableEntity() // 422
response.TooManyRequests()    // 429
```

---

## Headers

```go
facades.Http().WithHeader("X-Custom", "value").Get(url)
facades.Http().WithHeaders(map[string]string{"Content-Type": "application/json"}).Get(url)
facades.Http().Accept("application/xml").Get(url)
facades.Http().AcceptJson().Get(url)
facades.Http().ReplaceHeaders(map[string]string{"Authorization": "Bearer token"}).Get(url)
facades.Http().WithoutHeader("X-Old-Header").Get(url)
facades.Http().FlushHeaders().Get(url)
```

---

## Authentication

```go
facades.Http().WithBasicAuth("username", "password").Get(url)
facades.Http().WithToken("bearer_token").Get(url)
facades.Http().WithToken("custom_token", "Token").Get(url)
facades.Http().WithoutToken().Get(url)
```

---

## Query Parameters

```go
facades.Http().WithQueryParameter("sort", "name").Get(url)
facades.Http().WithQueryParameters(map[string]string{"page": "2", "limit": "10"}).Get(url)
facades.Http().WithQueryString("filter=active&order=price").Get(url)
```

---

## URL Templates

```go
facades.Http().
    WithUrlParameter("id", "123").
    Get("https://api.example.com/users/{id}")

facades.Http().
    WithUrlParameters(map[string]string{"bookId": "456", "chapterNumber": "7"}).
    Get("https://api.example.com/books/{bookId}/chapters/{chapterNumber}")
```

---

## Request Body

```go
import "github.com/goravel/framework/support/http"

builder := http.NewBody().SetField("name", "krishan")
body, err := builder.Build()
response, err := facades.Http().
    WithHeader("Content-Type", body.ContentType()).
    Post("https://example.com/users", body.Reader())
```

---

## Cookies

```go
import "net/http"

facades.Http().WithCookie(&http.Cookie{Name: "user_id", Value: "123"}).Get(url)
facades.Http().WithCookies([]*http.Cookie{
    {Name: "session_token", Value: "xyz"},
    {Name: "language", Value: "en"},
}).Get(url)
facades.Http().WithoutCookie("language").Get(url)
```

---

## Context (timeout, cancellation)

```go
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
response, err := facades.Http().WithContext(ctx).Get(url)
```

---

## Bind Response Body

```go
// BREAKING v1.17: use response.Bind(&dest) instead of Request.Bind()

type User struct {
    ID   int    `json:"id"`
    Name string `json:"name"`
}

var user User
response, err := facades.Http().AcceptJson().Get("https://api.example.com/users/1")
err = response.Bind(&user)
```

---

## Multiple Clients Configuration

```go
// config/http.go
"clients": map[string]any{
    "github": map[string]any{
        "base_url": "https://api.github.com",
        "timeout":  30,
    },
},
```

Usage:

```go
response, err := facades.Http().Client("github").Get("/repos/goravel/framework")
```

---

## Testing

### Fake Responses

```go
facades.Http().Fake(map[string]any{
    "https://github.com/goravel/framework": facades.Http().Response().Json(200, map[string]string{"foo": "bar"}),
    "https://google.com/*":                 facades.Http().Response().String(200, "Hello World"),
    "github":                               facades.Http().Response().OK(),  // named client
    "*":                                    facades.Http().Response().Status(404), // fallback
})

// Implicit conversion shortcuts
facades.Http().Fake(map[string]any{
    "https://goravel.dev/*": "Hello World",                          // → 200 string body
    "https://github.com/*":  map[string]string{"a": "b"},           // → 200 JSON
    "https://stripe.com/*":  500,                                    // → 500 empty
})
```

### Response Sequences

```go
facades.Http().Fake(map[string]any{
    "github": facades.Http().Sequence().
        PushStatus(500).
        PushString(429, "Rate Limit").
        PushStatus(200).
        WhenEmpty(facades.Http().Response().Status(404)),
})
```

### Assertions

```go
facades.Http().AssertSent(func(req client.Request) bool {
    return req.Url() == "https://api.example.com/users" &&
        req.Method() == "POST" &&
        req.Input("role") == "admin"
})

facades.Http().AssertNotSent(func(req client.Request) bool {
    return req.Url() == "https://api.example.com/legacy"
})

facades.Http().AssertNothingSent()
facades.Http().AssertSentCount(3)
```

### Prevent Stray Requests

```go
facades.Http().Fake(map[string]any{
    "github": facades.Http().Response().OK(),
}).PreventStrayRequests()

// Allow specific strays
facades.Http().PreventStrayRequests().AllowStrayRequests([]string{
    "http://localhost:8080/*",
})
```

### Reset State Between Tests

```go
func TestExternalApi(t *testing.T) {
    defer facades.Http().Reset()

    facades.Http().Fake(nil)
    // ... test code
}
```

Do not run tests using `Fake` in parallel — it mutates global state.
