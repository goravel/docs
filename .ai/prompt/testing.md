# Goravel Testing

## Setup

Uses [stretchr/testify](https://github.com/stretchr/testify) suite. Framework auto-bootstraps the app before tests run.

```shell
./artisan make:test feature/UserTest
```

```go
package feature

import (
    "testing"

    "github.com/stretchr/testify/suite"

    "goravel/tests"
)

type ExampleTestSuite struct {
    suite.Suite
    tests.TestCase
}

func TestExampleTestSuite(t *testing.T) {
    suite.Run(t, new(ExampleTestSuite))
}

// SetupTest runs before each test
func (s *ExampleTestSuite) SetupTest() {}

// TearDownTest runs after each test
func (s *ExampleTestSuite) TearDownTest() {}

func (s *ExampleTestSuite) TestIndex() {
    s.True(true)
}
```

---

## Environment

- Default: reads `.env` from root
- Package-level override: place `.env` in the test package directory (read first)
- Named env file: `go test ./... --env=.env.testing` or `-e=.env.testing`

---

## HTTP Tests

### Make Requests

```go
func (s *ExampleTestSuite) TestIndex() {
    response, err := s.Http(s.T()).Get("/users/1")
    s.Nil(err)
    response.AssertStatus(200)
}
```

### Set Headers

```go
response, err := s.Http(s.T()).WithHeader("X-Custom-Header", "Value").Get("/users/1")

response, err := s.Http(s.T()).WithHeaders(map[string]string{
    "X-Custom-Header": "Value",
    "Accept":          "application/json",
}).Get("/users/1")
```

### Set Cookies

```go
import "github.com/goravel/framework/testing/http"

response, err := s.Http(s.T()).WithCookie(http.Cookie("name", "value")).Get("/users/1")

response, err := s.Http(s.T()).WithCookies(http.Cookies(map[string]string{
    "name": "value",
    "lang": "en",
})).Get("/users/1")
```

### Set Session

```go
response, err := s.Http(s.T()).WithSession(map[string]any{"role": "admin"}).Get("/users/1")
```

### Build Request Body (POST/PUT/DELETE)

```go
import "github.com/goravel/framework/support/http"

builder := http.NewBody().SetField("name", "goravel")
body, err := builder.Build()

response, err := s.Http(s.T()).
    WithHeader("Content-Type", body.ContentType()).
    Post("/users", body)
```

### Inspect Response

```go
content, err := response.Content()    // raw response body string
cookies := response.Cookies()
headers := response.Headers()
json, err := response.Json()          // map[string]any
session, err := response.Session()    // all session values
```

---

## JSON Assertions

```go
// Contains subset (does not require exact match)
response.AssertJson(map[string]any{"created": true})

// Must match exactly (no extra/missing fields)
response.AssertExactJson(map[string]any{"created": true})

// JSON missing
response.AssertJsonMissing(map[string]any{"created": false})
```

### Fluent JSON

```go
import contractstesting "github.com/goravel/framework/contracts/testing"

response.AssertFluentJson(func(json contractstesting.AssertableJSON) {
    json.Where("id", float64(1)).
        Where("name", "goravel").
        WhereNot("lang", "en").
        Missing("password").
        Has("email").
        HasAny([]string{"username", "email"}).
        MissingAll([]string{"secret", "token"})
})
```

### JSON Collections

```go
response.AssertFluentJson(func(json contractstesting.AssertableJSON) {
    // Count + First element
    json.Count("items", 2).
        First("items", func(json contractstesting.AssertableJSON) {
            json.Where("id", float64(1))
        })

    // Iterate all
    json.Each("items", func(json contractstesting.AssertableJSON) {
        json.Has("id")
    })

    // Count + First combined
    json.HasWithScope("items", 2, func(json contractstesting.AssertableJSON) {
        json.Where("id", float64(1))
    })
})
```

---

## Response Assertions

```go
response.AssertStatus(200)
response.AssertOk()                    // 200
response.AssertCreated()               // 201
response.AssertAccepted()              // 202
response.AssertNoContent()             // 204
response.AssertPartialContent()        // 206
response.AssertMovedPermanently()      // 301
response.AssertFound()                 // 302
response.AssertNotModified()           // 304
response.AssertTemporaryRedirect()     // 307
response.AssertBadRequest()            // 400
response.AssertUnauthorized()          // 401
response.AssertPaymentRequired()       // 402
response.AssertForbidden()             // 403
response.AssertNotFound()              // 404
response.AssertMethodNotAllowed()      // 405
response.AssertRequestTimeout()        // 408
response.AssertConflict()              // 409
response.AssertGone()                  // 410
response.AssertUnprocessableEntity()   // 422
response.AssertTooManyRequests()       // 429
response.AssertInternalServerError()   // 500
response.AssertServiceUnavailable()    // 503
response.AssertSuccessful()            // 2xx
response.AssertServerError()           // 5xx

// Header assertions
response.AssertHeader("Content-Type", "application/json")
response.AssertHeaderMissing("X-Custom")

// Cookie assertions
response.AssertCookie("name", "value")
response.AssertCookieExpired("name")
response.AssertCookieMissing("name")
response.AssertCookieNotExpired("name")

// Body content
response.AssertSee([]string{"<div>"}, false)           // second param: escape HTML
response.AssertDontSee([]string{"error"}, true)
response.AssertSeeInOrder([]string{"First", "Second"}, false)
```

---

## Database Testing

### Factories

```go
var user models.User
err := facades.Orm().Factory().Create(&user)
```

### Seeders

```go
func (s *ExampleTestSuite) TestIndex() {
    s.Seed()                                                          // runs DatabaseSeeder
    s.Seed(&seeders.UserSeeder{}, &seeders.PhotoSeeder{})            // specific seeders
}
```

### Refresh Database (per-test)

```go
func (s *ExampleTestSuite) SetupTest() {
    s.RefreshDatabase()
}
```

---

## Docker Testing

For parallel package tests that need isolated databases/caches.

> Docker testing does not work on Windows.

### Full Example

```go
// tests/feature/main_test.go
package feature

import (
    "fmt"
    "os"
    "testing"

    "goravel/app/facades"
    "goravel/database/seeders"
)

func TestMain(m *testing.M) {
    database, err := facades.Testing().Docker().Database()
    if err != nil {
        panic(err)
    }

    if err := database.Build(); err != nil {
        panic(err)
    }
    if err := database.Ready(); err != nil {
        panic(err)
    }
    if err := database.Migrate(); err != nil {
        panic(err)
    }

    if err := facades.App().Restart(); err != nil {
        panic(err)
    }

    exit := m.Run()

    if err := database.Shutdown(); err != nil {
        panic(err)
    }

    os.Exit(exit)
}
```

### Docker API

```go
// Create images
database, err := facades.Testing().Docker().Database()
database, err := facades.Testing().Docker().Database("postgres")

cache, err := facades.Testing().Docker().Cache()
cache, err := facades.Testing().Docker().Cache("redis")

// Custom image
import contractstesting "github.com/goravel/framework/contracts/testing"

image, err := facades.Testing().Docker().Image(contractstesting.Image{
    Repository:   "mysql",
    Tag:          "5.7",
    Env:          []string{"MYSQL_ROOT_PASSWORD=secret", "MYSQL_DATABASE=goravel"},
    ExposedPorts: []string{"3306"},
})

// Build and configure
err := database.Build()
config := database.Config()    // get connection config

// Seed
err := database.Seed()
err := database.Seed(&seeders.UserSeeder{})

// Refresh (serial tests only — not safe for parallel)
err := database.Fresh()
err := cache.Fresh()

// Shutdown (auto-uninstalls after 1 hour if not called)
err := database.Shutdown()
```

---

## Mock Testing

All facades can be mocked via `mock.Factory()`:

```go
import "github.com/goravel/framework/testing/mock"
```

### Mock Pattern

```go
func TestSomething(t *testing.T) {
    mockFactory := mock.Factory()
    mockCache := mockFactory.Cache()
    mockCache.On("Put", "name", "goravel", mock.Anything).Return(nil).Once()
    mockCache.On("Get", "name", "test").Return("Goravel").Once()

    res := MyFunction()
    assert.Equal(t, "Goravel", res)

    mockCache.AssertExpectations(t)
}
```

### Available Mocks

| Mock | Factory Method |
|------|---------------|
| App | `mockFactory.App()` |
| Artisan | `mockFactory.Artisan()` |
| Auth | `mockFactory.Auth()` |
| Cache | `mockFactory.Cache()` |
| Config | `mockFactory.Config()` |
| Crypt | `mockFactory.Crypt()` |
| Event | `mockFactory.Event()` + `mockFactory.EventTask()` |
| Gate | `mockFactory.Gate()` |
| Grpc | `mockFactory.Grpc()` |
| Hash | `mockFactory.Hash()` |
| Lang | `mockFactory.Lang()` |
| Log | `mockFactory.Log()` (uses fmt, not real log) |
| Mail | `mockFactory.Mail()` |
| Orm | `mockFactory.Orm()` + `mockFactory.OrmQuery()` |
| Queue | `mockFactory.Queue()` + `mockFactory.QueueTask()` |
| Storage | `mockFactory.Storage()` + `mockFactory.StorageDriver()` |
| Validation | `mockFactory.Validation()` + `mockFactory.ValidationValidator()` + `mockFactory.ValidationErrors()` |
| View | `mockFactory.View()` |

### Mock ORM Transaction

```go
func TestTransaction(t *testing.T) {
    mockFactory := mock.Factory()
    mockOrm := mockFactory.Orm()
    mockOrmTransaction := mockFactory.OrmTransaction()
    mockOrm.On("Transaction", mock.Anything).Return(func(txFunc func(tx orm.Transaction) error) error {
        return txFunc(mockOrmTransaction)
    })

    var test Test
    mockOrmTransaction.On("Create", &test).Return(func(test2 interface{}) error {
        test2.(*Test).ID = 1
        return nil
    }).Once()
    mockOrmTransaction.On("Where", "id = ?", uint(1)).Return(mockOrmTransaction).Once()
    mockOrmTransaction.On("Find", mock.Anything).Return(nil).Once()

    assert.Nil(t, Transaction())
}
```

### Mock Event

```go
func TestEvent(t *testing.T) {
    mockFactory := mock.Factory()
    mockEvent := mockFactory.Event()
    mockTask := mockFactory.EventTask()
    mockEvent.On("Job", mock.Anything, mock.Anything).Return(mockTask).Once()
    mockTask.On("Dispatch").Return(nil).Once()

    assert.Nil(t, Event())

    mockEvent.AssertExpectations(t)
    mockTask.AssertExpectations(t)
}
```
