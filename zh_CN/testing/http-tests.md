# HTTP 测试

[[toc]]

## 介绍

When building web applications, you'll often need to test if your HTTP requests work correctly from start to finish. 在构建 Web 应用程序时，您经常需要测试 HTTP 请求是否从头到尾正常工作。
Goravel 的测试工具使这变得简单直接 - 您可以模拟请求并验证响应，而无需设置复杂的测试环境。

## 发送请求

在 Goravel 中测试 HTTP 端点使用一个简单的模式。 从您的 `TestCase` 开始使用 `Http` 方法，该方法需要一个 `*testing.T` 参数用于断言。 这会给您一个请求对象（`framework/contracts/testing.TestRequest`），它处理所有常见的 HTTP 动词，如 `Get`、`Post` 和 `Put`。 Start with the `Http` method from your `TestCase`, which needs a `*testing.T` parameter for assertions. 这些方法不会发出真正的 HTTP 调用，而是在内部模拟您应用程序的请求周期。 每个请求都会返回一个响应对象（`framework/contracts/testing.TestResponse`），该对象具有检查结果的方法。

Instead of making real HTTP calls, these methods simulate your application's request cycle internally. Each request returns a response object (`framework/contracts/testing.TestResponse`) with methods to check the results.

以下是一个基本示例：

```go
func (s *ExampleTestSuite) TestIndex() {
 response, err := s.Http(s.T()).Get("/users/1")
 s.Nil(err)
 response.AssertStatus(200)
}
```

### 自定义请求头

您可以使用 `WithHeader` 自定义单个请求头，或使用 `WithHeaders` 自定义多个请求头：

```go
func (s *ExampleTestSuite) TestIndex() {
    // 单个请求头
    response, err := s.Http(s.T()).WithHeader("X-Custom-Header", "Value").Get("/users/1")
    
    // 多个请求头
    response, err := s.Http(s.T()).WithHeaders(map[string]string{
        "X-Custom-Header": "Value",
        "Accept": "application/json",
    }).Get("/users/1")
}
```

### Cookie

您可以在发送请求前使用 `WithCookie` 或 `WithCookies` 方法设置 cookie 值。

```go
func (s *ExampleTestSuite) TestIndex() {
 response, err := s.Http(s.T()).WithCookie("name", "krishan").Get("/users/1")

 // 或使用 WithHeaders 设置多个 Headers
 response, err := s.Http(s.T()).WithHeader(map[string]string{
        "name": "krishan",
        "lang": "en",
    }).Get("/users/1")
}
```

### WithSession

您可以使用 `WithSession` 方法将数据设置到会话中：

```go
func (s *ExampleTestSuite) TestIndex() {
 response, err := s.Http(s.T()).WithSession(map[string]any{"role": "admin"}).Get("/users/1")
}
```

### 调试响应

发出请求后，您可以使用 `Session`、`Headers`、`Content`、`Cookies` 或 `Json` 方法来检查从请求返回的数据。

```go
func (s *ExampleTestSuite) TestIndex() {
 response, err := s.Http(s.T()).WithSession(map[string]any{"role": "admin"}).Get("/users/1")
 
 content, err := response.Content()
 
 cookies := response.Cookies()
 
 headers := response.Headers()
 
 json, err := response.Json() // 响应体解析为json(map[string]any)
 
 session, err := response.Session() // 返回当前请求会话中存储的所有值
}
```

## Building Body

For method like `Post`, `Put`, `Delete` etc. 对于 `Post`、`Put`、`Delete` 等方法。 Goravel 接受 `io.Reader` 作为第二个参数。 为了简化构建负载，框架提供了用于构造请求体的实用方法。 To simplify building payloads, the framework provides utility methods for constructing request bodies.

```go
import "github.com/goravel/framework/support/http"

func (s *ExampleTestSuite) TestIndex() {
    builder := http.NewBody().SetField("name", "krishan")
    
    body, err := builder.Build()

    response, err := s.Http(s.T()).WithHeader("Content-Type", body.ContentType()).Post("/users", body)
}
```

## 测试 JSON API

Goravel 提供了几个辅助函数来有效测试 JSON API 响应。 它尝试将响应体解析为 Go 的 `map[string]any` 类型。 如果解析失败，相关的断言也会失败。 It attempts to unmarshal the response body into a Go `map[string]any`. If unmarshalling fails, the associated assertions will also fail.

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

要直接访问解析后的 JSON，请使用 `TestResponse` 的 `Json` 方法。 这让你可以检查响应体的各个元素。 This lets you inspect individual elements of the response body.

```go
json, err := response.Json()
s.Nil(err)
s.True(json["created"])
```

:::tip
`AssertJson`方法检查响应是否包含所有指定的值，即使响应包含额外的字段。 除非你使用`AssertExactJson`，否则它不要求完全匹配。 It doesn't require an exact match unless you use `AssertExactJson`.
:::

### 断言精确JSON匹配

如果你需要验证响应是否与你预期的JSON完全匹配（没有额外或缺失的字段），请使用`AssertExactJson`方法。

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

### 流畅的JSON测试

Goravel使对JSON响应进行流畅断言变得容易。 使用 `AssertFluentJson` 方法，你可以传递一个闭包，该闭包提供 `framework/contracts/testing.AssertableJSON` 的实例。 这个实例允许你检查请求返回的 JSON 响应中的特定值或条件。 Using the `AssertFluentJson` method, you can pass a closure that provides an instance of `framework/contracts/testing.AssertableJSON`. This instance allows you to check specific values or conditions in the JSON response returned by your request.

例如，你可以使用 `Where` 方法断言 JSON 响应中存在特定值，并使用 `Missing` 方法确保某个属性不存在。

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

### 断言属性存在/不存在

如果你想检查属性是否存在或缺失，Goravel 通过 `Has` 和 `Missing` 方法使这变得简单。

```go
response.AssertStatus(201).
    AssertFluentJson(func (json contractstesting.AssertableJSON) {
        json.Has("username").
            Missing("password")
    })
```

您还可以使用`HasAll`和`MissingAll`同时断言多个属性的存在或缺失。

```go
response.AssertStatus(201).
    AssertFluentJson(func (json contractstesting.AssertableJSON) {
        json.Has([]string{"username", "email"}).
            MissingAll([]string{"verified", "password"})
    })
```

如果您只需要检查列表中至少有一个属性存在，请使用`HasAny`方法。

```go
response.AssertStatus(201).
    AssertFluentJson(func (json contractstesting.AssertableJSON) {
  json.HasAny([]string{"username", "email"})
    })
```

### 对JSON集合进行断言

当响应在命名键下包含对象集合时，您可以使用各种方法来断言其结构和内容。

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

You can use the `Count` method to verify the number of elements in the collection. To assert properties of the first element, use the `First` method, which provides an instance of `AssertableJson`. Similarly, the `Each` method allows you to iterate over all elements and assert their properties individually. 您可以使用`Count`方法来验证集合中元素的数量。 要断言第一个元素的属性，请使用 `First` 方法，该方法提供了一个 `AssertableJson` 实例。 类似地，`Each` 方法允许您遍历所有元素并单独断言它们的属性。 或者，`HasWithScope` 方法结合了 `First` 和 `Count` 的功能，允许您断言第一个元素及其内容，同时提供一个 `AssertableJson` 实例用于范围断言。

```go
// Count 和 First
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

### 响应断言

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

断言响应具有 `202 Accepted` HTTP 状态码：

```go
response.AssertAccepted()
```

### AssertBadRequest

断言响应具有 `400 Bad Request` HTTP 状态码：

```go
response.AssertBadRequest()
```

### AssertConflict

断言响应具有 `409 Conflict` HTTP 状态码：

```go
response.AssertConflict()
```

### AssertCookie

断言响应包含具有指定名称和值的 cookie：

```go
response.AssertCookie("name", "value")
```

### AssertCookieExpired

断言指定的 cookie 已过期：

```go
response.AssertCookieExpired("name")
```

### AssertCookieMissing

断言响应中不包含指定名称的 cookie：

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
response.AssertDontSee([]string{"<div>"}, false)  // 不转义特殊字符
```

### AssertExactJson

断言响应的JSON与提供的`map[string]any`完全匹配：

```go
response.AssertExactJson(map[string]any{"created": true})
```

### AssertFluentJson

使用流畅接口断言响应JSON：

```go
import contractstesting "github.com/goravel/framework/contracts/testing"

response.AssertFluentJson(func(json contractstesting.AssertableJSON) {
     json.Where("created", true)
})
```

### AssertForbidden

断言响应具有`403 Forbidden` HTTP状态码：

```go
response.AssertForbidden()
```

### AssertFound

断言响应具有`302 Found` HTTP状态码：

```go
response.AssertFound()
```

### AssertGone

断言响应具有 `410 Gone` HTTP 状态码：

```go
response.AssertGone()
```

### AssertHeader

断言响应包含指定的头部及其给定值：

```go
response.AssertHeader("Content-Type", "application/json")
```

### AssertHeaderMissing

断言响应不包含指定的头部：

```go
response.AssertHeaderMissing("X-Custom-Header")
```

### AssertInternalServerError

断言响应具有 `500 Internal Server Error` HTTP 状态码：

```go
response.AssertInternalServerError()
```

### AssertJson

断言响应 JSON 包含提供的片段：

```go
response.AssertJson(map[string]any{"created": true})
```

### AssertJsonMissing

断言指定的键或值在响应JSON中缺失：

```go
response.AssertJsonMissing(map[string]any{"created": false})
```

### AssertMethodNotAllowed

断言响应具有 `405 Method Not Allowed` HTTP状态码：

```go
response.AssertMethodNotAllowed()
```

### AssertMovedPermanently

断言响应具有 `301 Moved Permanently` HTTP状态码：

```go
response.AssertMovedPermanently()
```

### AssertNoContent

断言响应具有 `204 No Content` HTTP状态码：

```go
response.AssertNoContent()
```

### AssertNotAcceptable

断言响应具有 `406 Not Acceptable` HTTP 状态码：

```go
response.AssertNotAcceptable()
```

### AssertNotFound

断言响应具有 `404 Not Found` HTTP 状态码：

```go
response.AssertNotFound()
```

### AssertNotModified

断言响应具有 `304 Not Modified` HTTP 状态码：

```go
response.AssertNotModified()
```

### AssertOk

断言响应具有 `200 OK` HTTP 状态码：

```go
response.AssertOk()
```

### AssertPartialContent

断言响应具有 `206 Partial Content` HTTP 状态码：

```go
response.AssertPartialContent()
```

### AssertPaymentRequired

断言响应具有 `402 Payment Required` HTTP 状态码：

```go
response.AssertPaymentRequired()
```

### AssertRequestTimeout

断言响应具有 `408 Request Timeout` HTTP 状态码：

```go
response.AssertRequestTimeout()
```

### AssertSee

Asserts that the response contains the specified values. The second parameter (optional) determines whether to escape special characters in the values before checking. If not provided, it defaults to `true`.

```go
response.AssertSee([]string{"<div>"}, false)  // 不转义特殊字符
```

### AssertSeeInOrder

Asserts that the response contains the specified values in the given order. The second parameter (optional) determines whether to escape special characters in the values before checking. If not provided, it defaults to `true`.

```go
response.AssertSeeInOrder([]string{"First", "Second"}, false)  // 不转义特殊字符
```

### AssertServerError

断言响应具有服务器错误（>= 500，< 600）HTTP 状态码：

```go
response.AssertServerError()
```

### AssertServiceUnavailable

断言响应具有 `503 Service Unavailable` HTTP 状态码：

```go
response.AssertServiceUnavailable()
```

### AssertStatus

断言响应具有指定的 HTTP 状态码：

```go
response.AssertStatus(200)
```

### AssertSuccessful

断言响应具有成功的 HTTP 状态码（2xx）：

```go
response.AssertSuccessful()
```

### AssertTemporaryRedirect

断言响应具有 `307 Temporary Redirect` HTTP 状态码：

```go
response.AssertTemporaryRedirect()
```

### AssertTooManyRequests

断言响应具有 `429 Too Many Requests` HTTP 状态码：

```go
response.AssertTooManyRequests()
```

### AssertUnauthorized

断言响应具有 `401 Unauthorized` HTTP 状态码：

```go
response.AssertUnauthorized()
```

### AssertUnprocessableEntity

断言响应具有 `422 Unprocessable Entity` HTTP 状态码：

```go
response.AssertUnprocessableEntity()
```
