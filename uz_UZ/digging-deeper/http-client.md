# HTTP Client

[[toc]]

## Introduction

In software development, there are many instances when you need to call an API to fetch data—
whether it's connecting to a microservice or accessing a third-party API. In such cases,
Goravel offers an easy-to-use, expressive, and minimalist API built on the standard `net/http` library,
all designed to enhance the developer experience.

## Configuration

Goravel's HTTP client is built on top of the `net/http.Client` for making HTTP requests. If you need to tweak its internal settings, just update the `clients` property in the `config/http.go` file.

## Making Requests

The Http facade provides a convenient way to make HTTP requests using familiar verbs: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD`, and `OPTIONS`.

**Example: GET Request**

```go
response, err := facades.Http().Get("https://example.com")
```

Each HTTP verb method returns a `response` of type `framework/contracts/http/client.Response` and an `err` if the request fails.

You can use the `Client` function to specify which HTTP client configuration to use:

```go
response, err := facades.Http().Client("github").Get("https://example.com")
```

### Response Interface

The `framework/contracts/http/client.Response` interface provides the following methods to interact with the HTTP response:

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

:::tip
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


