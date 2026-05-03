# HTTP Client

Outbound HTTP. `facades.Http()` returns `Factory` (extends `Request`), so you can either use it directly (`facades.Http().Get(url)`) or build via `facades.Http().Client("named")`. Test-faking built in (`Fake`/`PreventStrayRequests`/`AssertSent`).

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/http/client/factory.go` — `Factory`
- `contracts/http/client/request.go` — `Request`
- `contracts/http/client/response.go` — `Response`
- `contracts/http/client/fake_response.go` — `FakeResponse`
- `contracts/http/client/fake_sequence.go` — `FakeSequence`

## Imports

```go
import (
    "io"
    "net/http"
    "strings"

    "yourmodule/app/facades"
)
```

## Methods

### `facades.Http()` returns `client.Factory` (extends `client.Request`)

| Group | Methods (signature-only) |
|---|---|
| Build | `Client(name ...string) Request` (with optional named-config selector) |
| Test | `Fake(mocks map[string]any) Factory`, `PreventStrayRequests() Factory`, `AllowStrayRequests(patterns []string) Factory`, `Reset()`, `Response() FakeResponse`, `Sequence() FakeSequence` |
| Test assertions | `AssertSent(fn func(req Request) bool) bool`, `AssertNotSent(fn) bool`, `AssertNothingSent() bool`, `AssertSentCount(n int) bool` |

(All `Request` methods below are also reachable directly on `facades.Http()` — the Factory embeds Request.)

### `client.Request` (chainable builder)

| Group | Methods (signature-only) |
|---|---|
| Verbs | `Get(uri string) (Response, error)`, `Head(uri) (Response, error)`, `Post(uri string, body io.Reader) (Response, error)`, `Put(uri, body) (Response, error)`, `Patch(uri, body) (Response, error)`, `Delete(uri, body) (Response, error)`, `Options(uri) (Response, error)` |
| URL | `BaseUrl(url string) Request`, `Url() string` (returns built URL) |
| Headers | `WithHeader(k, v string) Request`, `WithHeaders(map[string]string) Request`, `ReplaceHeaders(map[string]string) Request`, `WithoutHeader(key) Request`, `FlushHeaders() Request`, `Header(key) string`, `Headers() http.Header` |
| Auth | `WithToken(token string, ttype ...string) Request` (default "Bearer"), `WithoutToken() Request`, `WithBasicAuth(user, pass string) Request` |
| Query | `WithQueryParameter(k, v string) Request`, `WithQueryParameters(map[string]string) Request`, `WithQueryString(raw string) Request` |
| URL params | `WithUrlParameter(k, v string) Request`, `WithUrlParameters(map[string]string) Request` (for path placeholders like `/users/:id`) |
| Cookies | `WithCookie(*http.Cookie) Request`, `WithCookies([]*http.Cookie) Request` |
| Content type | `Accept(contentType string) Request`, `AcceptJSON() Request`, `AsForm() Request` (sets Content-Type to `application/x-www-form-urlencoded`) |
| Context | `WithContext(ctx context.Context) Request` (cancellation/timeout) |
| Inspect | `Body() string`, `Method() string`, `ClientName() string`, `HttpClient() *http.Client` (escape hatch), `Clone() Request` |

### `client.Response`

| Group | Methods (signature-only) |
|---|---|
| Body | `Body() (string, error)`, `Bind(value any) error` (JSON unmarshal), `Json() (map[string]any, error)`, `Stream() (io.ReadCloser, error)` |
| Status | `Status() int`, `OK()` (200), `Created()` (201), `Accepted()` (202), `NoContent()` (204), `MovedPermanently()` (301), `Found()` (302), `BadRequest()` (400), `Unauthorized()` (401), `PaymentRequired()` (402), `Forbidden()` (403), `NotFound()` (404), `RequestTimeout()` (408), `Conflict()` (409), `UnprocessableEntity()` (422), `TooManyRequests()` (429) |
| Status ranges | `Successful()` (2xx), `Redirect()` (3xx), `ClientError()` (4xx), `ServerError()` (5xx), `Failed()` (>=400) |
| Headers/cookies | `Header(name) string`, `Headers() http.Header`, `Cookie(name) *http.Cookie`, `Cookies() []*http.Cookie` |
| Origin | `Origin() *http.Response` (escape hatch) |

## Config

User-owned: `config/http_client.go` (or wherever your project conventions place named clients). Read directly.

Keys this facade reads (named clients via `Client("name")`):

- `http.clients.<name>.base_url` (string) — default base URL
- `http.clients.<name>.timeout` (time.Duration) — default request timeout
- `http.clients.<name>.headers` (map[string]string) — default headers (e.g. `User-Agent`)
- `http.clients.<name>.retries` (int) — default retry count (driver-dependent)

Greenfield: clients can be used without any named config; `facades.Http().Get(...)` works out of the box with stdlib defaults.

## Patterns & gotchas

- **Request body is `io.Reader`** — for JSON: `bytes.NewReader(jsonBytes)` or `strings.NewReader(rawString)`. For form: build a `url.Values` and `strings.NewReader(values.Encode())` then `.AsForm()`.
- **`Response.Bind(&v)`** is the JSON unmarshal shortcut. For error bodies, call `Body()` first to inspect.
- **Verb methods return `(Response, error)`** — `error` is for transport failure (DNS, TCP, timeout); `Response.Status()/Failed()` is for HTTP-level errors. Always check both: `if err != nil` (transport) then `if resp.Failed()` (HTTP 4xx/5xx).
- **`Bind(&dest)` on the RESPONSE**, not the request — confusing naming. Request has no `Bind` method.
- **Body args: `Post(uri, body)` body is `io.Reader`**, NOT a string. Wrap strings: `strings.NewReader(s)`.
- **`AsForm()` sets Content-Type only** — you still need to encode the form values yourself and pass as the body reader.
- **`WithContext(ctx)` for timeouts/cancellation** — propagates ctx from `http.Context` (which embeds `context.Context`). Pass `ctx` directly.
- **URL path params**: use `:name` placeholders + `WithUrlParameter("name", val)`. E.g. `BaseUrl("https://api/x").WithUrlParameter("id", "42").Get("/users/:id")`.
- **Test mode**: `Fake(map[string]any{...})` registers stubbed responses by URL pattern. `PreventStrayRequests()` makes any unmocked URL fail loudly. `AllowStrayRequests([]string{...})` whitelists patterns that pass through to real network.
- **Sequence**: `Sequence().Push(resp1).Push(resp2)...` returns ordered responses on repeated calls to the same URL.
- **`Reset()` clears all mocks** — call between tests.
- **Default `*http.Client`** is the stdlib one with sane timeouts. For custom transport (proxies, mTLS), use `HttpClient()` to grab the underlying client and configure it (or construct your own).

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `Post(uri, jsonString)` | `Post(uri, strings.NewReader(jsonString))` | Body must be `io.Reader`. |
| `req.Bind(&dest)` (on the request) | `resp.Bind(&dest)` (on the response) | Bind lives on Response. |
| `if err != nil` only | `if err != nil { ... }` THEN `if resp.Failed() { ... }` | Transport vs HTTP errors are separate. |
| `WithToken("Bearer xyz")` | `WithToken("xyz")` (or `WithToken("xyz", "Bearer")` to be explicit) | Method prepends "Bearer "; passing it doubles up. |
| `Get(url + "?" + queryString)` | `WithQueryString(queryString).Get(url)` | Don't hand-build query strings. |
| `AsForm()` then pass JSON body | `AsForm()` then form-encoded body via `url.Values{...}.Encode()` | AsForm sets the type; you provide matching body. |

## Worked example: GET with retry-on-5xx + POST form + JSON bind

```go
package services

import (
    "context"
    "net/url"
    "strings"
    "time"

    "yourmodule/app/facades"
)

type WeatherResp struct {
    City string `json:"city"`
    Temp int    `json:"temp"`
}

func GetWeather(ctx context.Context, city string) (*WeatherResp, error) {
    var out WeatherResp
    var lastErr error

    for attempt := 1; attempt <= 3; attempt++ {
        resp, err := facades.Http().
            WithContext(ctx).
            AcceptJSON().
            WithQueryParameter("city", city).
            Get("https://api.example.com/weather")
        if err != nil {
            lastErr = err
            time.Sleep(time.Duration(attempt) * 200 * time.Millisecond)
            continue
        }
        if resp.ServerError() {
            lastErr = nil
            time.Sleep(time.Duration(attempt) * 200 * time.Millisecond)
            continue
        }
        if !resp.Successful() {
            body, _ := resp.Body()
            return nil, fmt.Errorf("weather API: %d %s", resp.Status(), body)
        }
        if err := resp.Bind(&out); err != nil {
            return nil, err
        }
        return &out, nil
    }
    return nil, lastErr
}

// Form POST with bearer auth
func SubmitForm(ctx context.Context, token, name string) error {
    form := url.Values{"name": {name}, "active": {"true"}}
    resp, err := facades.Http().
        WithContext(ctx).
        WithToken(token).
        AsForm().
        Post("https://api.example.com/submit", strings.NewReader(form.Encode()))
    if err != nil {
        return err
    }
    if resp.Failed() {
        body, _ := resp.Body()
        return fmt.Errorf("submit: %d %s", resp.Status(), body)
    }
    return nil
}

// Test (mock the upstream)
// facades.Http().Fake(map[string]any{
//     "https://api.example.com/*": http.Response{StatusCode: 200, Body: ...},
// }).PreventStrayRequests()
```

## Rules

- Body args (`Post`/`Put`/`Patch`/`Delete`) take `io.Reader`. Wrap strings with `strings.NewReader`; bytes with `bytes.NewReader`.
- `Response.Bind(&v)` is the JSON unmarshal — Bind lives on Response, not Request.
- Always check both transport `error` AND HTTP `resp.Failed()`/`Successful()`.
- `WithToken("xyz")` adds `Authorization: Bearer xyz`. Don't include "Bearer " in the value.
- For form-encoded POST: `AsForm()` + body = `strings.NewReader(url.Values{...}.Encode())`.
- For URL path params, use `:name` placeholders + `WithUrlParameter`.
- For tests: `facades.Http().Fake(...)` + `PreventStrayRequests()` + `AssertSent(...)` for full isolation.
- Pass `ctx http.Context` directly to `WithContext(ctx)` — `http.Context` embeds `context.Context`.
