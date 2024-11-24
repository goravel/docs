# HTTP Tests

[[toc]]

## Introduction

When building web applications, you'll often need to test if your HTTP requests work correctly from start to finish. Goravel's testing tools make this straightforward - you can simulate requests and verify responses without setting up complex test environments.

## Make Requests

Testing HTTP endpoints in Goravel uses a simple pattern. Start with the `Http` method from your `TestCase`, which needs a `*testing.T` parameter for assertions. This gives you a request object (`framework/contracts/testing.TestRequest`) that handles all common HTTP verbs like `Get`, `Post`, and `Put`.

Instead of making real HTTP calls, these methods simulate your application's request cycle internally. Each request returns a response object (`framework/contracts/testing.TestResponse`) with methods to check the results.

Here's a basic example:

```go
func (s *ExampleTestSuite) TestIndex() {
	response, err := s.Http(s.T()).Get("/users/1")
	s.Nil(err)
	response.AssertStatus(200)
}
```

### Customize Request Headers

You can customize request headers using either `WithHeader` for a single header or `WithHeaders` for multiple headers:

```go
func (s *ExampleTestSuite) TestIndex() {
    // Single header
    response, err := s.Http(s.T()).WithHeader("X-Custom-Header", "Value").Get("/users/1")
    
    // Multiple headers
    response, err := s.Http(s.T()).WithHeaders(map[string]string{
        "X-Custom-Header": "Value",
        "Accept": "application/json",
    }).Get("/users/1")
}
```

### Cookies

You may use either `WithCookie` or `WithCookies` method to set cookies value before making a request.

```go
func (s *ExampleTestSuite) TestIndex() {
	response, err := s.Http(s.T()).WithCookie("name", "krishan").Get("/users/1")

	// or use WithHeaders for multiple Headers
	response, err := s.Http(s.T()).WithHeader(map[string]string{
        "name": "krishan",
        "lang": "en",
    }).Get("/users/1")
}
```

### WithSession / Authentication

You may set the data to the session using the `WithSession` method. Note that this creates an actual session. If you need to clean up after testing, you can access the session cookie from `TestResponse` and use the `Session` facade:

```go
func (s *ExampleTestSuite) TestIndex() {
	response, err := s.Http(s.T()).WithSession(map[string]any{"role": "admin"}).Get("/users/1")
}
```

### Debugging Responses

After making request you may use `Session`, `Headers`, `Content`, `Cookies` or `Json` method to check data returned from the request.

```go
func (s *ExampleTestSuite) TestIndex() {
	response, err := s.Http(s.T()).WithSession(map[string]any{"role": "admin"}).Get("/users/1")
	
	content, err := response.Content()
	
	cookies := response.Cookies()
	
	headers := response.Headers()
	
	json, err := response.Json() // response body parsed as json(map[string]any)
	
	session, err := response.Session() // returns all values stored in the current request session
}
```

## Building Body

For method like `Post`, `Put`, `Delete` etc. Goravel accepts `io.Reader` as second argument. To simplify building payloads, the framework provides utility methods for constructing request bodies. Refer to the body support documentation for complete details.

```go
import "github.com/goravel/framework/support/http"

func (s *ExampleTestSuite) TestIndex() {
    builder := http.NewBody().
            SetField("name", "krishan")
    
    body, err := builder.Build()

    response, err := s.Http(s.T()).WithHeader("Content-Type", body.ContentType()).Post("/users", body.Reader())
}
```

## Testing Json APIs

Goravel provides several helpers to test JSON API responses effectively. It attempts to unmarshal the response body into a Go `map[string]any`. If unmarshalling fails, the associated assertions will also fail.
	AssertJson(map[string]any) TestResponse
	AssertExactJson(map[string]any) TestResponse
	AssertJsonMissing(map[string]any) TestResponse
	AssertFluentJson(func(json AssertableJSON)) TestResponse
```go
func (s *ExampleTestSuite) TestIndex() {
    response, err := s.Http(s.T()).WithHeader("Content-Type", body.ContentType()).Post("/users", nil)
	s.Nil(err)
	
	response.AssertStatus(201).
		AssertJson(map[string]any{
			"created": true,
        })
}
```

To access the unmarshalled JSON directly, use the `Json` method on the `TestResponse`. This lets you inspect individual elements of the response body.

```go
json, err := response.Json()
s.Nil(err)
s.True(json["created"])
```

::: tip 
The `AssertJson` method checks whether the response contains all the specified values, even if the response includes additional fields. It doesn't require an exact match unless you use `AssertExactJson`.
:::

### Asserting Exact JSON Matches

If you need to verify that the response matches your expected JSON exactly (with no extra or missing fields), use the `AssertExactJson` method.

```go
func (s *ExampleTestSuite) TestIndex() {
    response, err := s.Http(s.T()).WithHeader("Content-Type", body.ContentType()).Post("/users", nil)
	s.Nil(err)
	
	response.AssertStatus(201).
		AssertExactJson(map[string]any{
			"created": true,
        })
}
```




