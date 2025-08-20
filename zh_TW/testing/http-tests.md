# HTTP 測試

[[toc]]

## 概述

在構建 Web 應用程序時，您通常需要從頭到尾測試您的 HTTP 請求是否正常工作。 Goravel 的測試工具使這變得簡單 - 您可以模擬請求並驗證響應，而無需設置複雜的測試環境。

## 發送請求

在 Goravel 中測試 HTTP 端點使用了一個簡單的模式。 從您的 `TestCase` 開始使用 `Http` 方法，該方法需一個 `*testing.T` 參數以進行斷言。 這會給您一個請求對象 (`framework/contracts/testing.TestRequest`)，它處理所有常見的 HTTP 請求動詞，如 `Get`、`Post` 和 `Put`。

這些方法會在內部模擬應用程序的請求循環，而不是實際發送 HTTP 請求。 每個請求返回一個響應對象 (`framework/contracts/testing.TestResponse`)，該對象具有檢查結果的方法。

這裡是一個基本示例：

```go
func (s *ExampleTestSuite) TestIndex() {
	response, err := s.Http(s.T()).Get("/users/1")
	s.Nil(err)
	response.AssertStatus(200)
}.
```

### 自定義請求標頭

您可以使用 `WithHeader` 自定義單個標頭或使用 `WithHeaders` 自定義多個標頭：

```go
func (s *ExampleTestSuite) TestIndex() {
    // 單個標頭
    response, err := s.Http(s.T()).WithHeader("X-Custom-Header", "Value").Get("/users/1")

    // 多個標頭
    response, err := s.Http(s.T()).WithHeaders(map[string]string{
        "X-Custom-Header": "Value",
        "Accept": "application/json",
    }).Get("/users/1")
}.
```

### Cookies

您可以使用 `WithCookie` 或 `WithCookies` 方法在發起請求前設置 cookie 值。

```go
import "github.com/goravel/framework/testing/http"

func (s *ExampleTestSuite) TestIndex() {
	response, err := s.Http(s.T()).WithCookie(http.Cookie("name", "krishan")).Get("/users/1")

	// 或使用 WithCookies 設置多個 Cookies
	response, err := s.Http(s.T()).WithCookies(http.Cookies(map[string]string{
        "name": "krishan",
        "lang": "en",
    })).Get("/users/1")
}.
```

### WithSession

您可以使用 `WithSession` 方法設置會話資料：

```go
func (s *ExampleTestSuite) TestIndex() {
	response, err := s.Http(s.T()).WithSession(map[string]any{"role": "admin"}).Get("/users/1")
}.
```

### 調試響應

發起請求後，您可以使用 `Session`、`Headers`、`Content`、`Cookies` 或 `Json` 方法來檢查從請求返回的資料。

```go
func (s *ExampleTestSuite) TestIndex() {
	response, err := s.Http(s.T()).WithSession(map[string]any{"role": "admin"}).Get("/users/1")

	content, err := response.Content()

	cookies := response.Cookies()

	headers := response.Headers()

	json, err := response.Json() // 解析為 json 的響應主體(map[string]any)

	session, err := response.Session() // 返回當前請求會話中存儲的所有值
}.
```

## 構建主體

對於像 `Post`、`Put`、`Delete` 等方法。 Goravel 接受 `io.Reader` 作為第二個參數。 為了簡化構建請求體，框架提供了實用方法來構建請求體。

```go
import "github.com/goravel/framework/support/http"

func (s *ExampleTestSuite) TestIndex() {
    builder := http.NewBody().SetField("name", "krishan")

    body, err := builder.Build()

    response, err := s.Http(s.T()).WithHeader("Content-Type", body.ContentType()).Post("/users", body)
}.
```

## 測試 JSON API

Goravel 提供了多個幫助器來有效測試 JSON API 響應。 它試圖將響應主體解組為 Go `map[string]any`。 如果解組失敗，相關的斷言也會失敗。

```go
func (s *ExampleTestSuite) TestIndex() {
    response, err := s.Http(s.T()).WithHeader("Content-Type", body.ContentType()).Post("/users", nil)
	s.Nil(err)

	response.AssertStatus(201).
		AssertJson(map[string]any{
			"created": true,
        })
}.
```

要直接訪問解組後的 JSON，請使用 `TestResponse` 的 `Json` 方法。 這讓您檢查響應主體的各個元素。

```go
json, err := response.Json()
s.Nil(err)
s.True(json["created"])
```

:::tip
`AssertJson` 方法檢查響應是否包含所有指定的值，即使響應包含額外的字段。除非使用 `AssertExactJson`，否則不需要完全匹配。 除非您使用 `AssertExactJson`，否則不需要完全匹配。
:::

### 斷言精確匹配的 JSON

如果需要驗證響應是否完全匹配您的預期 JSON（沒有額外或缺少的字段），請使用 `AssertExactJson` 方法。

```go
func (s *ExampleTestSuite) TestIndex() {
    response, err := s.Http(s.T()).WithHeader("Content-Type", body.ContentType()).Post("/users", nil)
	s.Nil(err)

	response.AssertStatus(201).
		AssertExactJson(map[string]any{
			"created": true,
        })
}.
```

### 流暢的 JSON 測試

Goravel 可以輕鬆地對 JSON 響應進行流暢的斷言。 使用 `AssertFluentJson` 方法，您可以傳遞一個閉包，該閉包提供 `framework/contracts/testing.AssertableJSON` 的實例。 這個實例允許您檢查請求返回的 JSON 響應中的特定值或條件。

例如，您可以使用 `Where` 方法來斷言 JSON 響應中是否存在特定值，並使用 `Missing` 方法來確保某個屬性不存在。

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
}.
```

### 斷言屬性的存在/缺失

如果您想檢查某個屬性是否存在或缺失，Goravel 提供簡單的方法 `Has` 和 `Missing`。

```go
response.AssertStatus(201).
    AssertFluentJson(func (json contractstesting.AssertableJSON) {
        json.Has("username").
            Missing("password")
    })
```

您還可以使用 `HasAll` 和 `MissingAll` 方法一次性斷言多個屬性的存在或缺失。

```go
response.AssertStatus(201).
    AssertFluentJson(func (json contractstesting.AssertableJSON) {
        json.Has([]string{"username", "email"}).
            MissingAll([]string{"verified", "password"})
    })
```

如果您只需要檢查列表中至少一個屬性的存在，請使用 `HasAny` 方法。

```go
response.AssertStatus(201).
    AssertFluentJson(func (json contractstesting.AssertableJSON) {
		json.HasAny([]string{"username", "email"})
    })
```

### 限制 JSON 集合斷言

當響應包含一個以命名鍵的對象集合時，您可以使用各種方法來斷言其結構和內容。

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
}.
```

您可以使用 `Count` 方法來驗證集合中元素的數量。 要斷言第一個元素的屬性，請使用 `First` 方法，該方法提供 `AssertableJson` 的實例。 同樣，`Each` 方法允許您遍歷所有元素並逐一斷言其屬性。 另外，`HasWithScope` 方法結合了 `First` 和 `Count` 的功能，允許您在提供 `AssertableJson` 實例進行範圍斷言的同時，斷言第一個元素及其內容。

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

## 可用斷言

### 響應斷言

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

斷言響應的 HTTP 狀態碼為 `202 Accepted`：

```go
response.AssertAccepted()
```

### AssertBadRequest

斷言響應的 HTTP 狀態碼為 `400 Bad Request`：

```go
response.AssertBadRequest()
```

### AssertConflict

斷言響應的 HTTP 狀態碼為 `409 Conflict`：

```go
response.AssertConflict()
```

### AssertCookie

斷言響應包含指定名稱和值的 cookie：

```go
response.AssertCookie("name", "value")
```

### AssertCookieExpired

斷言指定的 cookie 已過期：

```go
response.AssertCookieExpired("name")
```

### AssertCookieMissing

斷言響應不包含指定名稱的 cookie：

```go
response.AssertCookieMissing("name")
```

### AssertCookieNotExpired

斷言指定的 cookie 未過期：

```go
response.AssertCookieNotExpired("name")
```

### AssertCreated

斷言響應的 HTTP 狀態碼為 `201 Created`：

```go
response.AssertCreated()
```

### AssertDontSee

斷言回應不包含指定的值。 第二個參數（可選）決定是否在檢查前對值中的特殊字符進行轉義。 如果未提供，則默認為 true。

```go
response.AssertDontSee([]string{"<div>"}, false)  // 不轉義特殊字符
```

### AssertExactJson

斷言響應的 JSON 與提供的 `map[string]any` 完全匹配：

```go
response.AssertExactJson(map[string]any{"created": true})
```

### AssertFluentJson

使用 JSON 流暢接口進行斷言：

```go
import contractstesting "github.com/goravel/framework/contracts/testing"

response.AssertFluentJson(func(json contractstesting.AssertableJSON) {
     json.Where("created", true)
})
```

### AssertForbidden

斷言響應的 HTTP 狀態碼為 `403 Forbidden`：

```go
response.AssertForbidden()
```

### AssertFound

斷言響應的 HTTP 狀態碼為 `302 Found`：

```go
response.AssertFound()
```

### AssertGone

斷言響應的 HTTP 狀態碼為 `410 Gone`：

```go
response.AssertGone()
```

### AssertHeader

斷言響應包含指定名稱和值的 header：

```go
response.AssertHeader("Content-Type", "application/json")
```

### AssertHeaderMissing

斷言響應不包含指定名稱的 header：

```go
response.AssertHeaderMissing("X-Custom-Header")
```

### AssertInternalServerError

斷言響應的 HTTP 狀態碼為 `500 Internal Server Error`：

```go
response.AssertInternalServerError()
```

### AssertJson

斷言響應的 JSON 包含提供的片段：

```go
response.AssertJson(map[string]any{"created": true})
```

### AssertJsonMissing

斷言響應的 JSON 不包含指定的鍵或值：

```go
response.AssertJsonMissing(map[string]any{"created": false})
```

### AssertMethodNotAllowed

斷言響應的 HTTP 狀態碼為 `405 Method Not Allowed`：

```go
response.AssertMethodNotAllowed()
```

### AssertMovedPermanently

斷言響應的 HTTP 狀態碼為 `301 Moved Permanently`：

```go
response.AssertMovedPermanently()
```

### AssertNoContent

斷言響應的 HTTP 狀態碼為 `204 No Content`：

```go
response.AssertNoContent()
```

### AssertNotAcceptable

斷言響應的 HTTP 狀態碼為 `406 Not Acceptable`：

```go
response.AssertNotAcceptable()
```

### AssertNotFound

斷言響應的 HTTP 狀態碼為 `404 Not Found`：

```go
response.AssertNotFound()
```

### AssertNotModified

斷言響應的 HTTP 狀態碼為 `304 Not Modified`：

```go
response.AssertNotModified()
```

### AssertOk

斷言響應的 HTTP 狀態碼為 `200 OK`：

```go
response.AssertOk()
```

### AssertPartialContent

斷言響應的 HTTP 狀態碼為 `206 Partial Content`：

```go
response.AssertPartialContent()
```

### AssertPaymentRequired

斷言響應的 HTTP 狀態碼為 `402 Payment Required`：

```go
response.AssertPaymentRequired()
```

### AssertRequestTimeout

斷言響應的 HTTP 狀態碼為 `408 Request Timeout`：

```go
response.AssertRequestTimeout()
```

### AssertSee

斷言回應包含指定的值。 第二個參數（可選）決定是否在檢查前對值中的特殊字符進行轉義。 如果未提供，則默認為 `true`。

```go
response.AssertSee([]string{"<div>"}, false)  // 不轉義特殊字符
```

### AssertSeeInOrder

斷言回應按照給定的順序包含指定的值。 第二個參數（可選）決定是否在檢查前對值中的特殊字符進行轉義。 如果未提供，則默認為 `true`。

```go
response.AssertSeeInOrder([]string{"First", "Second"}, false)  // 不轉義特殊字符
```

### AssertServerError

斷言響應的 HTTP 狀態碼為 `>= 500 , < 600`：

```go
response.AssertServerError()
```

### AssertServiceUnavailable

斷言響應的 HTTP 狀態碼為 `503 Service Unavailable`：

```go
response.AssertServiceUnavailable()
```

### AssertStatus

斷言響應的 HTTP 狀態碼為指定的值：

```go
response.AssertStatus(200)
```

### AssertSuccessful

斷言響應的 HTTP 狀態碼為成功的狀態碼（2xx）：

```go
response.AssertSuccessful()
```

### AssertTemporaryRedirect

斷言響應的 HTTP 狀態碼為 `307 Temporary Redirect`：

```go
response.AssertTemporaryRedirect()
```

### AssertTooManyRequests

斷言響應的 HTTP 狀態碼為 `429 Too Many Requests`：

```go
response.AssertTooManyRequests()
```

### AssertUnauthorized

斷言響應的 HTTP 狀態碼為 `401 Unauthorized`：

```go
response.AssertUnauthorized()
```

### AssertUnprocessableEntity

斷言響應的 HTTP 狀態碼為 `422 Unprocessable Entity`：

```go
response.AssertUnprocessableEntity()
```
