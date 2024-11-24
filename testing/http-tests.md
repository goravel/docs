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

## Available Assertions

### Response Assertions

|                                                      |                                                            |                                                           |
|------------------------------------------------------|------------------------------------------------------------|-----------------------------------------------------------|
| [AssertAccepted](#assert-accepted)                   | [AssertBadRequest](#assert-bad-request)                    | [AssertConflict](#assert-conflict)                        |
| [AssertCookie](#assert-cookie)                       | [AssertCookieExpired](#assert-cookie-expired)              | [AssertCookieMissing](#assert-cookie-missing)             |
| [AssertCookieNotExpired](#assert-cookie-not-expired) | [AssertCreated](#assert-created)                           | [AssertDontSee](#assert-dont-see)                         |
| [AssertExactJson](#assert-exact-json)                | [AssertFluentJson](#assert-fluent-json)                    | [AssertForbidden](#assert-forbidden)                      |
| [AssertFound](#assert-found)                         | [AssertGone](#assert-gone)                                 | [AssertHeader](#assert-header)                            |
| [AssertHeaderMissing](#assert-header-missing)        | [AssertInternalServerError](#assert-internal-server-error) | [AssertJson](#assert-json)                                |
| [AssertJsonMissing](#assert-json-missing)            | [AssertMethodNotAllowed](#assert-method-not-allowed)       | [AssertMovedPermanently](#assert-moved-permanently)       |
| [AssertNoContent](#assert-no-content)                | [AssertNotAcceptable](#assert-not-acceptable)              | [AssertNotFound](#assert-not-found)                       |
| [AssertNotModified](#assert-not-modified)            | [AssertOk](#assert-ok)                                     | [AssertPartialContent](#assert-partial-content)           |
| [AssertPaymentRequired](#assert-payment-required)    | [AssertRequestTimeout](#assert-request-timeout)            | [AssertSee](#assert-see)                                  |
| [AssertSeeInOrder](#assert-see-in-order)             | [AssertServerError](#assert-server-error)                  | [AssertServiceUnavailable](#assert-service-unavailable)   |
| [AssertStatus](#assert-status)                       | [AssertSuccessful](#assert-successful)                     | [AssertTemporaryRedirect](#assert-temporary-redirect)     |
| [AssertTooManyRequests](#assert-too-many-requests)   | [AssertUnauthorized](#assert-unauthorized)                 | [AssertUnprocessableEntity](#assert-unprocessable-entity) |

### AssertAccepted

Asserts that the response has an `202 Accepted` HTTP status code:

```go
response.AssertAccepted()
```

### AssertBadRequest

Asserts that the response has a `400 Bad Request` HTTP status code:

```go
response.AssertBadRequest()
```

### AssertConflict

Asserts that the response has a `409 Conflict` HTTP status code:

```go
response.AssertConflict()
```

### AssertCookie

Asserts that the response contains a cookie with the specified name and value:

```go
response.AssertCookie("name", "value")
```

### AssertCookieExpired

Asserts that the specified cookie has expired:

```go
response.AssertCookieExpired("name")
```

### AssertCookieMissing

Asserts that the response does not contain a cookie with the specified name:

```go
response.AssertCookieMissing("name")
```

### AssertCookieNotExpired

Asserts that the specified cookie has not expired:

```go
response.AssertCookieNotExpired("name")
```

### AssertCreated

Asserts that the response has a `201 Created` HTTP status code:

```go
response.AssertCreated()
```

### AssertDontSee

Asserts that the response does not contain the specified values. The second parameter (optional) determines whether to escape special characters in the values before checking. If not provided, it defaults to true.

```go
response.AssertDontSee([]string{"<div>"}, false)  // Do not escape special characters
```


### AssertExactJson

Asserts that the response JSON matches exactly the provided `map[string]any`:

```go
response.AssertExactJson(map[string]any{"created": true})
```

### AssertFluentJson

Asserts the response JSON using a fluent interface:
```go
response.AssertFluentJson(func(json AssertableJSON) {
     json.HasKey("created").Equals("true")
})
```

### AssertForbidden

Asserts that the response has a `403 Forbidden` HTTP status code:

```go
response.AssertForbidden()
```

### AssertFound

Asserts that the response has a `302 Found` HTTP status code:

```go
response.AssertFound()
```

### AssertGone

Asserts that the response has a `410 Gone` HTTP status code:

```go
response.AssertGone()
```

### AssertHeader

Asserts that the response contains the specified header with the given value:

```go
response.AssertHeader("Content-Type", "application/json")
```

### AssertHeaderMissing

Asserts that the response does not contain the specified header:

```go
response.AssertHeaderMissing("X-Custom-Header")
```

### AssertInternalServerError

Asserts that the response has a `500 Internal Server` Error HTTP status code:

```go
response.AssertInternalServerError()
```

### AssertJson

Asserts that the response JSON contains the provided fragment:

```go
response.AssertJson(map[string]any{"created": true})
```

### AssertJsonMissing

Asserts that the specified keys or values are missing in the response JSON:

```go
response.AssertJsonMissing(map[string]any{"created": false})
```

### AssertMethodNotAllowed

Asserts that the response has a `405 Method Not Allowed` HTTP status code:

```go
response.AssertMethodNotAllowed()
```

### AssertMovedPermanently

Asserts that the response has a `301 Moved Permanently` HTTP status code:

```go
response.AssertMovedPermanently()
```

### AssertNoContent

Asserts that the response has a `204 No Content` HTTP status code:

```go
response.AssertNoContent()
```

### AssertNotAcceptable

Asserts that the response has a `406 Not Acceptable` HTTP status code:

```go
response.AssertNotAcceptable()
```

### AssertNotFound

Asserts that the response has a `404 Not Found` HTTP status code:

```go
response.AssertNotFound()
```

### AssertNotModified

Asserts that the response has a `304 Not Modified` HTTP status code:

```go
response.AssertNotModified()
```

### AssertOk

Asserts that the response has a `200 OK` HTTP status code:

```go
response.AssertOk()
```

### AssertPartialContent

Asserts that the response has a `206 Partial Content` HTTP status code:

```go
response.AssertPartialContent()
```

### AssertPaymentRequired

Asserts that the response has a `402 Payment Required` HTTP status code:

```go
response.AssertPaymentRequired()
```

### AssertRequestTimeout

Asserts that the response has a `408 Request Timeout` HTTP status code:

```go
response.AssertRequestTimeout()
```

### AssertSee

Asserts that the response contains the specified values. The second parameter (optional) determines whether to escape special characters in the values before checking. If not provided, it defaults to `true`.

```go
response.AssertSee([]string{"<div>"}, false)  // Do not escape special characters
```

### AssertSeeInOrder

Asserts that the response contains the specified values in the given order. The second parameter (optional) determines whether to escape special characters in the values before checking. If not provided, it defaults to `true`.

```go
response.AssertSeeInOrder([]string{"First", "Second"}, false)  // Do not escape special characters
```

### AssertServerError

Asserts that the response has a server error (>= 500 , < 600) HTTP status code:

```go
response.AssertServerError()
```


### AssertServiceUnavailable

Asserts that the response has a `503 Service Unavailable` HTTP status code:

```go
response.AssertServiceUnavailable()
```


### AssertStatus

Asserts that the response has the specified HTTP status code:

```go
response.AssertStatus(200)
```

### AssertSuccessful

Asserts that the response has a successful HTTP status code (2xx):

```go
response.AssertSuccessful()
```


### AssertTemporaryRedirect

Asserts that the response has a `307 Temporary Redirect` HTTP status code:

```go
response.AssertTemporaryRedirect()
```

### AssertTooManyRequests

Asserts that the response has a `429 Too Many Requests` HTTP status code:

```go
response.AssertTooManyRequests()
```

### AssertUnauthorized

Asserts that the response has a `401 Unauthorized` HTTP status code:

```go
response.AssertUnauthorized()
```

### AssertUnprocessableEntity

Asserts that the response has a `422 Unprocessable Entity` HTTP status code:

```go
response.AssertUnprocessableEntity()
```

<CommentService/>




