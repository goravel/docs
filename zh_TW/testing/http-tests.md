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
import "github.com/goravel/framework/testing/http"

func (s *ExampleTestSuite) TestIndex() {
	response, err := s.Http(s.T()).WithCookie(http.Cookie("name", "krishan")).Get("/users/1")

	// or use WithCookies for multiple Cookies
	response, err := s.Http(s.T()).WithCookies(http.Cookies(map[string]string{
        "name": "krishan",
        "lang": "en",
    })).Get("/users/1")
}
```

### WithSession

You may set the data to the session using the `WithSession` method:

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

For method like `Post`, `Put`, `Delete` etc. Goravel accepts `io.Reader` as second argument. To simplify building payloads, the framework provides utility methods for constructing request bodies.

```go
import "github.com/goravel/framework/support/http"

func (s *ExampleTestSuite) TestIndex() {
    builder := http.NewBody().SetField("name", "krishan")

    body, err := builder.Build()

    response, err := s.Http(s.T()).WithHeader("Content-Type", body.ContentType()).Post("/users", body)
}
```

## Testing Json APIs

Goravel provides several helpers to test JSON API responses effectively. It attempts to unmarshal the response body into a Go `map[string]any`. If unmarshalling fails, the associated assertions will also fail.

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

:::tip
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

### Fluent JSON Testing

Goravel makes it easy to perform fluent assertions on JSON responses. Using the `AssertFluentJson` method, you can pass a closure that provides an instance of `framework/contracts/testing.AssertableJSON`. This instance allows you to check specific values or conditions in the JSON response returned by your request.

For example, you can use the `Where` method to assert that a particular value exists in the JSON response, and the `Missing` method to ensure that an attribute is not present.

```go
import contractstesting "github.com/goravel/framework/contracts/testing"

func (s *ExampleTestSuite) TestIndex() {
    response, err := s.Http(s.T()).Get("/users/1")
	s.Nil(err)

	response.AssertStatus(201).
		AssertFluentJson(func (json contractstesting.AssertableJSON) {
			json.Where("id", float64(1)).
				Where("name", "bowen").
				WhereNot("lang", "en").
				Missing("password")
        })
}
```

### Asserting Attribute Presence / Absence

If you want to check whether an attribute is present or missing, Goravel makes it simple with the `Has` and `Missing` methods.

```go
response.AssertStatus(201).
    AssertFluentJson(func (json contractstesting.AssertableJSON) {
        json.Has("username").
            Missing("password")
    })
```

You can also assert the presence or absence of multiple attributes at once using `HasAll` and `MissingAll`.

```go
response.AssertStatus(201).
    AssertFluentJson(func (json contractstesting.AssertableJSON) {
        json.Has([]string{"username", "email"}).
            MissingAll([]string{"verified", "password"})
    })
```

If you only need to check for the presence of at least one attribute from a list, use the `HasAny` method.

```go
response.AssertStatus(201).
    AssertFluentJson(func (json contractstesting.AssertableJSON) {
		json.HasAny([]string{"username", "email"})
    })
```

### Scoping JSON Collection Assertions

When a response contains a collection of objects under a named key, you can use various methods to assert its structure and content.

```go
type Item struct {
    ID int `json:"id"`
}

facades.Route().Get("/", func(ctx http.Context) http.Response {
    items := []Item{
        {ID: 1},
        {ID: 2},
    }
    return ctx.Response().Json(200, map[string]{
		"items": items,
    })
}
```

You can use the `Count` method to verify the number of elements in the collection. To assert properties of the first element, use the `First` method, which provides an instance of `AssertableJson`. Similarly, the `Each` method allows you to iterate over all elements and assert their properties individually. Alternatively, the `HasWithScope` method combines the functionality of `First` and `Count`, allowing you to assert both the first element and its contents while providing an `AssertableJson` instance for scoped assertions.

```go
// Count and First
response.AssertStatus(200).
    AssertFluentJson(func(json contractstesting.AssertableJSON) {
        json.Count("items", 2).
            First("items", func(json contractstesting.AssertableJSON) {
                json.Where("id", 1)
            })
    })

// Each
response.AssertStatus(200).
    AssertFluentJson(func(json contractstesting.AssertableJSON) {
        json.Count("items", 2).
            Each("items", func(json contractstesting.AssertableJSON) {
                json.Has("id")
            })
    })

// HasWithScope
response.AssertStatus(200).
    AssertFluentJson(func(json contractstesting.AssertableJSON) {
        json.HasWithScope("items", 2, func(json contractstesting.AssertableJSON) {
            json.Where("id", 1)
        })
    })
```

## Available Assertions

### Response Assertions

|                                                   |                                                         |                                                         |
| ------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| [AssertAccepted](#assertaccepted)                 | [AssertBadRequest](#assertbadrequest)                   | [AssertConflict](#assertconflict)                       |
| [AssertCookie](#assertcookie)                     | [AssertCookieExpired](#assertcookieexpired)             | [AssertCookieMissing](#assertcookiemissing)             |
| [AssertCookieNotExpired](#assertcookienotexpired) | [AssertCreated](#assertcreated)                         | [AssertDontSee](#assertdontsee)                         |
| [AssertExactJson](#assertexactjson)               | [AssertFluentJson](#assertfluentjson)                   | [AssertForbidden](#assertforbidden)                     |
| [AssertFound](#assertfound)                       | [AssertGone](#assertgone)                               | [AssertHeader](#assertheader)                           |
| [AssertHeaderMissing](#assertheadermissing)       | [AssertInternalServerError](#assertinternalservererror) | [AssertJson](#assertjson)                               |
| [AssertJsonMissing](#assertjsonmissing)           | [AssertMethodNotAllowed](#assertmethodnotallowed)       | [AssertMovedPermanently](#assertmovedpermanently)       |
| [AssertNoContent](#assertnocontent)               | [AssertNotAcceptable](#assertnotacceptable)             | [AssertNotFound](#assertnotfound)                       |
| [AssertNotModified](#assertnotmodified)           | [AssertOk](#assertok)                                   | [AssertPartialContent](#assertpartialcontent)           |
| [AssertPaymentRequired](#assertpaymentrequired)   | [AssertRequestTimeout](#assertrequesttimeout)           | [AssertSee](#assertsee)                                 |
| [AssertSeeInOrder](#assertseeinorder)             | [AssertServerError](#assertservererror)                 | [AssertServiceUnavailable](#assertserviceunavailable)   |
| [AssertStatus](#assertstatus)                     | [AssertSuccessful](#assertsuccessful)                   | [AssertTemporaryRedirect](#asserttemporaryredirect)     |
| [AssertTooManyRequests](#asserttoomanyrequests)   | [AssertUnauthorized](#assertunauthorized)               | [AssertUnprocessableEntity](#assertunprocessableentity) |

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
import contractstesting "github.com/goravel/framework/contracts/testing"

response.AssertFluentJson(func(json contractstesting.AssertableJSON) {
     json.Where("created", true)
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
