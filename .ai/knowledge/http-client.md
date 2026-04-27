# HTTP Client Facade

## Core Imports

```go
import (
    "context"
    "io"
    "net/http"
    contractsclient "github.com/goravel/framework/contracts/http/client"
    supphttp "github.com/goravel/framework/support/http"
    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/http/client/request.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/http/client/response.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/http/client/factory.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/http/client/fake_response.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/http/client/fake_sequence.go`

## Available Methods

**facades.Http():**

- `Get/Head/Options(uri)` (Response, error)
- `Post/Put/Patch/Delete(uri, body io.Reader)` (Response, error)
- `WithHeader/WithHeaders/ReplaceHeaders/WithoutHeader/FlushHeaders(...)`
- `Accept(contentType)` / `AcceptJSON()` / `AsForm()`
- `WithToken(token, type?)` - default "Bearer"
- `WithBasicAuth(user, pass)`
- `WithQueryParameter/WithQueryParameters/WithQueryString`
- `WithUrlParameter/WithUrlParameters`
- `WithCookie/*Cookies`
- `WithContext(ctx)` Request
- `Client(name?)` Request - named client from config
- `Fake(map[string]any)` Factory
- `Response()` FakeResponse
- `Sequence()` FakeSequence
- `Reset()` - clear all fakes
- `AssertSent/AssertNotSent/AssertNothingSent/AssertSentCount`

## Implementation Example

```go
package services

import (
    "context"
    "fmt"
    "time"
    supphttp "github.com/goravel/framework/support/http"
    "yourmodule/app/facades"
)

type GithubService struct{}

type GithubUser struct {
    ID    int    `json:"id"`
    Login string `json:"login"`
}

// GET request
func (s *GithubService) GetUser(username string) (*GithubUser, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    resp, err := facades.Http().
        WithContext(ctx).
        AcceptJSON().
        WithToken("ghp_xxx").
        WithUrlParameter("username", username).
        Get("https://api.github.com/users/{username}")
    if err != nil {
        return nil, err
    }
    if !resp.Successful() {
        return nil, fmt.Errorf("request failed: %d", resp.Status())
    }
    var user GithubUser
    return &user, resp.Bind(&user)
}

// POST with body
func (s *GithubService) CreateIssue(repo string, title string) error {
    body := supphttp.NewBody().
        SetField("title", title).
        SetField("body", "Created via API")
    built, err := body.Build()
    if err != nil {
        return err
    }
    resp, err := facades.Http().
        WithToken("ghp_xxx").
        WithHeader("Content-Type", built.ContentType()).
        Post("https://api.github.com/repos/"+repo+"/issues", built.Reader())
    if err != nil {
        return err
    }
    if !resp.Created() {
        return fmt.Errorf("failed to create issue: %d", resp.Status())
    }
    return nil
}

// Testing with fakes
// func TestGetUser(t *testing.T) {
//     defer facades.Http().Reset()
//     facades.Http().Fake(map[string]any{
//         "https://api.github.com/*": facades.Http().Response().Json(200, map[string]any{
//             "id": 1, "login": "goravel",
//         }),
//     })
//     user, err := (&GithubService{}).GetUser("goravel")
//     assert.Nil(t, err)
//     assert.Equal(t, "goravel", user.Login)
//     facades.Http().AssertSentCount(1)
// }
```

## Rules

- `Post/Put/Patch/Delete` all take `io.Reader` as body - use `supphttp.NewBody().Build()` or pass `nil`.
- `Response.Bind(&dest)` on the response object - **not** `Request.Bind`.
- `Response.Stream()` returns `(io.ReadCloser, error)` for streaming bodies.
- `facades.Http().Reset()` must be deferred in every test using `Fake`; fakes are global state.
- Never use `t.Parallel()` with `Fake` - it mutates global state, causing race conditions.
- `"*"` as fake key matches all unmatched URLs.
- `PreventStrayRequests()` panics if a request is made without a matching fake.
- `Sequence` exhaustion returns error unless `WhenEmpty` is set.
- `WithToken("tok")` defaults to `"Bearer"` scheme; pass second arg for custom scheme.
- `WithUrlParameter("key", "val")` replaces `{key}` in the URL path.
- HTTP client configs (timeouts, base URLs) are in `config/http.go` under `clients`.
