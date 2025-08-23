# HTTP Client

[[toc]]

## Introduction

In software development, there are many instances when you need to call an API to fetch data—
whether it's connecting to a microservice or accessing a third-party API. In such cases,
Goravel offers an easy-to-use, expressive, and minimalist API built on the standard `net/http` library,
all designed to enhance the developer experience.

## Configuration

Goravel's HTTP client is built on top of the `net/http.Client` for making HTTP requests. If you need to tweak its internal settings,
just update the `client` property in the `config/http.go` file.
Here are the available configuration options:

- `base_url`: Sets the root URL for relative paths. Automatically prefixes requests that don't start with `http://` or `https://`.
- `timeout`(`DEFAULT`: `30s`): Global timeout duration for complete request lifecycle (connection + any redirects + reading the response body). A Timeout of zero means no timeout.
- `max_idle_conns`: Maximum number of idle (keep-alive) connections across all hosts. Zero means no limit.
- `max_idle_conns_per_host`: Maximum idle (keep-alive) connections to keep per-host
- `max_conns_per_host`: Limits the total number of connections per host, including connections in the dialing, active, and idle states. Zero means no limit.
- `idle_conn_timeout`: Maximum amount of the time of an idle (keep-alive) connection will remain idle before closing itself.

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

## Making Requests

The Http facade provides a convenient way to make HTTP requests using familiar verbs: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD`, and `OPTIONS`.

**Example: GET Request**

```go
import "github.com/goravel/framework/facades"

response, err := facades.Http().Get("https://example.com")
```

Each HTTP verb method returns a `response` of type `framework/contracts/http/client.Response` and an `err` if the request fails.

### Response Interface

The `framework/contracts/http/client.Response` interface provides the following methods to interact with the HTTP response:

```go
type Response interface {
    Body() (string, error)           // Get the response body as a string
    ClientError() bool              // Check if the status code is in the 4xx range
    Cookie(name string) *http.Cookie // Get a specific cookie
    Cookies() []*http.Cookie        // Get all response cookies
    Failed() bool                   // Check if the status code is not in the 2xx range
    Header(name string) string      // Get the value of a specific header
    Headers() http.Header           // Get all response headers
    Json() (map[string]any, error)   // Decode the response body as JSON into a map
    Redirect() bool                 // Check if the response is a redirect (3xx status code)
    ServerError() bool              // Check if the status code is in the 5xx range
    Status() int                    // Get the HTTP status code
    Successful() bool               // Check if the status code is in the 2xx range

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

### URI Templates

URI Templates let you build dynamic request URLs using placeholders.
You can define these placeholders in your URL and then provide the values to replace them before making the request.
To achieve this, you can use `WithUrlParameter` for single parameters or `WithUrlParameters` for multiple parameters.

```go
response, err := facades.Http().
	WithUrlParameter("id", "123").
	Get("https://api.example.com/users/{id}")

// or

response, err := facades.Http().
    WithUrlParameters(map[string]string{
        "bookId":        "456",
        "chapterNumber": "7",
    }).
    Get("https://api.example.com/books/{bookId}/chapters/{chapterNumber}")
```

### Request Query Parameters

Add query parameters to your requests using `WithQueryParameter` for single parameters or
`WithQueryParameters` for multiple parameters via a map.

```go
response1, err1 := facades.Http().
    WithQueryParameter("sort", "name").
    Get("https://api.example.com/users")
// Resulting URL: https://api.example.com/users?sort=name

// or multiple query parameters
response2, err2 := facades.Http().
    WithQueryParameters(map[string]string{
        "page":     "2",
        "pageSize": "10",
    }).
    Get("https://api.example.com/products")
// Resulting URL: https://api.example.com/products?page=2&pageSize=10
```

You can also add query parameters directly as a formatted string using `WithQueryString`:

```go
response, err := facades.Http().
    WithQueryString("filter=active&order=price").
    Get("https://api.example.com/items")
```

### Sending a Request Body

For HTTP verbs like `POST`, `PUT`, `PATCH` and `DELETE` accept `io.Reader` as the second argument.
To simplify building payloads, the framework provides utility methods for constructing request bodies.

```go
import "github.com/goravel/framework/support/http"

builder := http.NewBody().SetField("name", "krishan")

body, err := builder.Build()

response, err := facades.Http().WithHeader("Content-Type", body.ContentType()).Post("https://example.com/users", body.Reader())
```

### Headers

You can add headers to your requests using `WithHeader` for a single header
or `WithHeaders` for multiple headers provided as a map.

```go
response, err := facades.Http().
        WithHeader("X-Custom-Header", "value").
        Get("https://api.example.com")

// Add multiple headers
response, err = facades.Http().
        WithHeaders( map[string]string{
            "Content-Type": "application/json",
            "Accept":       "application/xml",
        }).
        Get("https://api.example.com")
```

You may use the `Accept` method to specify the content type that your application is expecting in response to your request:

```go
response, err := facades.Http().
    Accept("application/xml").
    Get("https://api.example.com")
```

For convenience, you can use `AcceptJson` to quickly specify that you expect the API response to be in `application/json` format:

```go
response, err := facades.Http().
    AcceptJson().
    Get("https://api.example.com/data")
```

To replace all existing headers with a new set, use `ReplaceHeaders`:

```go
response, err := facades.Http().
        ReplaceHeaders(map[string]string{
            "Authorization": "Bearer token",
        }).
        Get("https://api.example.com")
```

You can remove a specific header using `WithoutHeader` or clear all headers with `FlushHeaders`.

```go
response, err := facades.Http().
    WithoutHeader("X-Previous-Header").
    Get("https://api.example.com")

// flush all headers
response, err := facades.Http().
    FlushHeaders().
    Get("https://api.example.com")
```

### Authentication

You can specify basic authentication using the `WithBasicAuth` method:

```go
response, err := facades.Http().
    WithBasicAuth("username", "password").
    Get("https://api.example.com/protected")
```

#### Bearer Tokens

To quickly add a bearer token to the request's `Authorization` header,
you can use the `WithToken` method:

```go
response, err := facades.Http().
    WithToken("your_bearer_token").
    Get("https://api.example.com/api/resource")
```

::: tip
The `WithToken` method also accepts an optional second argument to specify the token type (e.g., "Bearer", "Token").
If no type is provided, it defaults to "Bearer".

```go
response, err := facades.Http().
    WithToken("custom_token", "Token").
    Get("https://api.example.com/api/resource")
```

:::

To remove the bearer token from the request, use the `WithoutToken` method:

```go
response, err := facades.Http().
    WithoutToken().
    Get("https://api.example.com/api/resource")
```

### Context

You can use `WithContext` to make your HTTP requests context-aware.
This allows you to control the lifecycle of a request, for instance, by setting timeouts or enabling cancellation.

```go
ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
defer cancel()

response, err := facades.Http().WithContext(ctx).Get("https://example.com")
```

### Bind Response

You can use the `Bind` method directly on the `Http` facade to specify the struct that the response should be bound to.

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

To send cookies with your HTTP requests, you can use `WithCookie` for a single cookie or `WithCookies` for multiple cookies.

```go
response, err := facades.Http().
	WithCookie(&http.Cookie{Name: "user_id", Value: "123"}).
	Get("https://example.com/profile")

// multiple cookies
response, err := facades.Http().
	WithCookies([]*http.Cookie{
        {Name: "session_token", Value: "xyz"},
        {Name: "language", Value: "en"},
    }).
	Get("https://example.com/dashboard")
```

To prevent specific cookies from being sent with your request, you can use `WithoutCookie`.

```go
response, err := facades.Http().
	WithoutCookie("language").
	Get("https://example.com")
```
