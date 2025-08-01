# HTTP Tests

[[toc]]

## 介绍

When building web applications, you'll often need to test if your HTTP requests work correctly from start to finish. 在构建Web应用程序时，您通常需要从头到尾测试您的HTTP请求是否正常工作。Goravel的测试工具使这变得简单——您可以模拟请求并验证响应，而无需设置复杂的测试环境。

## Make Requests

测试 Goravel 中的 HTTP 接口使用了一个简单的模式。使用 `TestCase` 的 `Http` 方法，它需要一个 `*testing.T` 参数用于断言。该方法将返回一个实例(`framework/contracts/testing.TestRequest`)，它处理所有常见的 HTTP 请求，如 `Get` 、`Post` 和 `Put`。 Start with the `Http` method from your `TestCase`, which needs a `*testing.T` parameter for assertions. This gives you a request object (`framework/contracts/testing.TestRequest`) that handles all common HTTP verbs like `Get`, `Post`, and `Put`.

Instead of making real HTTP calls, these methods simulate your application's request cycle internally. Each request returns a response object (`framework/contracts/testing.TestResponse`) with methods to check the results.

一个简单的例子：

```go
func (s *ExampleTestSuite) TestIndex() {
	response, err := s.Http(s.T()).Get("/users/1")
	s.Nil(err)
	response.AssertStatus(200)
}
```

### 自定义请求头

你可以使用 `WithHeader` 设置单个请求头，或者使用 `WithHeaders` 设置多个请求头：

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

你可以使用 `WithCookie` 或 `WithCookies` 方法在发起请求前设置 cookie 值。

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

你可以使用 `WithSession` 方法设置 session 数据：

```go
func (s *ExampleTestSuite) TestIndex() {
	response, err := s.Http(s.T()).WithSession(map[string]any{"role": "admin"}).Get("/users/1")
}
```

### 调试响应

在发起请求后，你可以使用 `Session`、`Headers`、`Content`、`Cookies` 或 `Json` 方法来检查从请求返回的数据。

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

For method like `Post`, `Put`, `Delete` etc. 如 `Post`、`Put`、`Delete` 等方法。Goravel 接受 `io.Reader` 作为第二个参数。为了简化构建请求体，框架提供了用于构建请求体的实用方法。 To simplify building payloads, the framework provides utility methods for constructing request bodies.

```go
import "github.com/goravel/framework/support/http"

func (s *ExampleTestSuite) TestIndex() {
    builder := http.NewBody().SetField("name", "krishan")

    body, err := builder.Build()

    response, err := s.Http(s.T()).WithHeader("Content-Type", body.ContentType()).Post("/users", body)
}
```

## 测试 JSON API

Goravel 提供了多个帮助方法来有效地测试 JSON API 响应。它尝试将响应体解析为 Go `map[string]any`。如果解析失败，相关的断言也会失败。 It attempts to unmarshal the response body into a Go `map[string]any`. If unmarshalling fails, the associated assertions will also fail.

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

使用 `TestResponse` 的 `Json` 方法可以直接访问解析后的 JSON，这样你可以检查响应体的各个元素。 This lets you inspect individual elements of the response body.

```go
json, err := response.Json()
s.Nil(err)
s.True(json["created"])
```

:::tip
`AssertJson` 方法检查响应是否包含所有指定的值，即使响应包含额外的字段。除非使用 `AssertExactJson`，否则不需要完全匹配。 It doesn't require an exact match unless you use `AssertExactJson`.
:::

### 断言精确匹配的 JSON

如果需要验证响应是否完全匹配您的预期 JSON（没有额外或缺少的字段），请使用 `AssertExactJson` 方法。

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

Goravel 可以轻松地对 JSON 响应执行流畅的断言。使用 `AssertFluentJson` 方法，你可以传递一个闭包，该闭包提供了 `framework/contracts/testing.AssertableJSON` 的实例。这个实例允许你检查请求返回的 JSON 响应中的特定值或条件。 Using the `AssertFluentJson` method, you can pass a closure that provides an instance of `framework/contracts/testing.AssertableJSON`. This instance allows you to check specific values or conditions in the JSON response returned by your request.

例如，你可以使用 `Where` 方法来断言 JSON 响应中是否存在特定值，使用 `Missing` 方法来确保属性不存在。

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

### 断言属性的存在/缺失

如果你想检查属性是否存在或缺失，可以使用 `Has` 和 `Missing` 方法：

```go
response.AssertStatus(201).
    AssertFluentJson(func (json contractstesting.AssertableJSON) {
        json.Has("username").
            Missing("password")
    })
```

你也可以一次性断言多个属性的存在或缺失，使用 `HasAll` 和 `MissingAll`：

```go
response.AssertStatus(201).
    AssertFluentJson(func (json contractstesting.AssertableJSON) {
        json.Has([]string{"username", "email"}).
            MissingAll([]string{"verified", "password"})
    })
```

如果你只需要检查列表中至少一个属性的存在，请使用 `HasAny` 方法：

```go
response.AssertStatus(201).
    AssertFluentJson(func (json contractstesting.AssertableJSON) {
		json.HasAny([]string{"username", "email"})
    })
```

### 断言 JSON 集合

当响应包含一个对象集合时，可以使用各种方法来断言其结构和内容。

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

You can use the `Count` method to verify the number of elements in the collection. To assert properties of the first element, use the `First` method, which provides an instance of `AssertableJson`. Similarly, the `Each` method allows you to iterate over all elements and assert their properties individually. 你可以使用 `Count` 方法验证集合中元素的数量。要断言第一个元素的属性，请使用 `First` 方法，该方法提供了一个 `AssertableJson` 实例。同样，使用 `Each` 方法可以遍历所有元素并逐个断言其属性。另外，`HasWithScope` 方法结合了 `First` 和 `Count` 的功能，允许你断言第一个元素及其内容，同时为范围断言提供一个 `AssertableJson` 实例。

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

## 可用断言

### 断言响应

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

断言响应的 HTTP 状态码为 `202 Accepted`：

```go
response.AssertAccepted()
```

### AssertBadRequest

断言响应的 HTTP 状态码为 `400 Bad Request`：

```go
response.AssertBadRequest()
```

### AssertConflict

断言响应的 HTTP 状态码为 `409 Conflict`：

```go
response.AssertConflict()
```

### AssertCookie

断言响应包含指定名称和值的 cookie：

```go
response.AssertCookie("name", "value")
```

### AssertCookieExpired

断言指定的 cookie 已过期：

```go
response.AssertCookieExpired("name")
```

### AssertCookieMissing

断言响应不包含指定名称的 cookie：

```go
response.AssertCookieMissing("name")
```

### AssertCookieNotExpired

断言指定的 cookie 未过期：

```go
response.AssertCookieNotExpired("name")
```

### AssertCreated

断言响应的 HTTP 状态码为 `201 Created`：

```go
response.AssertCreated()
```

### AssertDontSee

Asserts that the response does not contain the specified values. The second parameter (optional) determines whether to escape special characters in the values before checking. If not provided, it defaults to true.

```go
response.AssertDontSee([]string{"<div>"}, false)  // Do not escape special characters
```

### AssertExactJson

断言响应的 JSON 与提供的 `map[string]any` 完全匹配：

```go
response.AssertExactJson(map[string]any{"created": true})
```

### AssertFluentJson

使用 JSON 流畅接口进行断言：

```go
import contractstesting "github.com/goravel/framework/contracts/testing"

response.AssertFluentJson(func(json contractstesting.AssertableJSON) {
     json.Where("created", true)
})
```

### AssertForbidden

断言响应的 HTTP 状态码为 `403 Forbidden`：

```go
response.AssertForbidden()
```

### AssertFound

断言响应的 HTTP 状态码为 `302 Found`：

```go
response.AssertFound()
```

### AssertGone

断言响应的 HTTP 状态码为 `410 Gone`：

```go
response.AssertGone()
```

### AssertHeader

断言响应包含指定名称和值的 header：

```go
response.AssertHeader("Content-Type", "application/json")
```

### AssertHeaderMissing

断言响应不包含指定名称的 header：

```go
response.AssertHeaderMissing("X-Custom-Header")
```

### AssertInternalServerError

断言响应的 HTTP 状态码为 `500 Internal Server Error`：

```go
response.AssertInternalServerError()
```

### AssertJson

断言响应的 JSON 包含提供的片段：

```go
response.AssertJson(map[string]any{"created": true})
```

### AssertJsonMissing

断言响应的 JSON 不包含指定的键或值：

```go
response.AssertJsonMissing(map[string]any{"created": false})
```

### AssertMethodNotAllowed

断言响应的 HTTP 状态码为 `405 Method Not Allowed`：

```go
response.AssertMethodNotAllowed()
```

### AssertMovedPermanently

断言响应的 HTTP 状态码为 `301 Moved Permanently`：

```go
response.AssertMovedPermanently()
```

### AssertNoContent

断言响应的 HTTP 状态码为 `204 No Content`：

```go
response.AssertNoContent()
```

### AssertNotAcceptable

断言响应的 HTTP 状态码为 `406 Not Acceptable`：

```go
response.AssertNotAcceptable()
```

### AssertNotFound

断言响应的 HTTP 状态码为 `404 Not Found`：

```go
response.AssertNotFound()
```

### AssertNotModified

断言响应的 HTTP 状态码为 `304 Not Modified`：

```go
response.AssertNotModified()
```

### AssertOk

断言响应的 HTTP 状态码为 `200 OK`：

```go
response.AssertOk()
```

### AssertPartialContent

断言响应的 HTTP 状态码为 `206 Partial Content`：

```go
response.AssertPartialContent()
```

### AssertPaymentRequired

断言响应的 HTTP 状态码为 `402 Payment Required`：

```go
response.AssertPaymentRequired()
```

### AssertRequestTimeout

断言响应的 HTTP 状态码为 `408 Request Timeout`：

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

断言响应的 HTTP 状态码为 `>= 500 , < 600`：

```go
response.AssertServerError()
```

### AssertServiceUnavailable

断言响应的 HTTP 状态码为 `503 Service Unavailable`：

```go
response.AssertServiceUnavailable()
```

### AssertStatus

断言响应的 HTTP 状态码为指定的值：

```go
response.AssertStatus(200)
```

### AssertSuccessful

断言响应的 HTTP 状态码为成功的状态码（2xx）：

```go
response.AssertSuccessful()
```

### AssertTemporaryRedirect

断言响应的 HTTP 状态码为 `307 Temporary Redirect`：

```go
response.AssertTemporaryRedirect()
```

### AssertTooManyRequests

断言响应的 HTTP 状态码为 `429 Too Many Requests`：

```go
response.AssertTooManyRequests()
```

### AssertUnauthorized

断言响应的 HTTP 状态码为 `401 Unauthorized`：

```go
response.AssertUnauthorized()
```

### AssertUnprocessableEntity

断言响应的 HTTP 状态码为 `422 Unprocessable Entity`：

```go
response.AssertUnprocessableEntity()
```
