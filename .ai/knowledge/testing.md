# Testing

## Core Imports

```go
import (
    "testing"
    "github.com/stretchr/testify/suite"
    testinghttp "github.com/goravel/framework/testing/http"
    "github.com/goravel/framework/testing/mock"
    contractstesting "github.com/goravel/framework/contracts/testing"
    contractsorm "github.com/goravel/framework/contracts/database/orm"

    "yourmodule/tests"
    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/testing/testing.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/testing/http/request.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/testing/http/response.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/testing/http/assertable_json.go`

## Available Methods

**Suite helpers (from `tests.TestCase`):**

- `s.Http(t)` TestRequest - create HTTP test client
- `s.Seed(seeders ...Seeder)` - run seeders (no arg = DatabaseSeeder)
- `s.RefreshDatabase()` - migrate fresh before each test (call in `SetupTest`)

**TestRequest (from `s.Http(t)`):**

- `.WithHeader(key, value)` TestRequest
- `.WithHeaders(map[string]string)` TestRequest
- `.WithCookie(testinghttp.Cookie(name, value))` TestRequest
- `.WithCookies(testinghttp.Cookies(map[string]string))` TestRequest
- `.WithSession(map[string]any)` TestRequest
- `.Get(path)` (TestResponse, error)
- `.Post(path, body)` (TestResponse, error)
- `.Put(path, body)` (TestResponse, error)
- `.Patch(path, body)` (TestResponse, error)
- `.Delete(path, body?)` (TestResponse, error)

**TestResponse assertions:**

- `.AssertStatus(code)`
- `.AssertOk()` / `.AssertCreated()` / `.AssertAccepted()` / `.AssertNoContent()`
- `.AssertPartialContent()` / `.AssertNotModified()` / `.AssertTemporaryRedirect()`
- `.AssertMovedPermanently()` / `.AssertFound()`
- `.AssertBadRequest()` / `.AssertUnauthorized()` / `.AssertPaymentRequired()`
- `.AssertForbidden()` / `.AssertNotFound()` / `.AssertMethodNotAllowed()`
- `.AssertRequestTimeout()` / `.AssertConflict()` / `.AssertGone()`
- `.AssertUnprocessableEntity()` / `.AssertTooManyRequests()`
- `.AssertInternalServerError()` / `.AssertServiceUnavailable()`
- `.AssertSuccessful()` (2xx) / `.AssertServerError()` (5xx)
- `.AssertHeader(key, value)` / `.AssertHeaderMissing(key)`
- `.AssertCookie(name, value)` / `.AssertCookieMissing(name)`
- `.AssertCookieExpired(name)` / `.AssertCookieNotExpired(name)`
- `.AssertJson(map[string]any)` - subset match
- `.AssertExactJson(map[string]any)` - exact match
- `.AssertJsonMissing(map[string]any)`
- `.AssertFluentJson(func(AssertableJSON))` - fluent chain
- `.AssertSee([]string, escape bool)` / `.AssertDontSee([]string, escape bool)`
- `.AssertSeeInOrder([]string, escape bool)`

**TestResponse data:**

- `.Content()` (string, error)
- `.Json()` (map[string]any, error)
- `.Cookies()` []\*http.Cookie
- `.Headers()` http.Header
- `.Session()` (map[string]any, error)

**Mock factory (`mock.Factory()`):**

- `.App()` / `.Artisan()` / `.Auth()` / `.Cache()` / `.Config()` / `.Crypt()`
- `.Event()` + `.EventTask()`
- `.Gate()` / `.Grpc()` / `.Hash()` / `.Lang()` / `.Log()` / `.Mail()`
- `.Orm()` + `.OrmQuery()` + `.OrmTransaction()`
- `.Queue()` + `.QueueTask()`
- `.Storage()` + `.StorageDriver()`
- `.Validation()` + `.ValidationValidator()` + `.ValidationErrors()`
- `.View()`

**Docker testing (`facades.Testing().Docker()`):**

- `.Database(driver?)` (DatabaseImage, error) - default driver from config
- `.Cache(driver?)` (CacheImage, error)
- `.Image(contractstesting.Image)` (Image, error) - custom image
- `.Build()` error - start container
- `.Ready()` error - wait until healthy
- `.Migrate()` error
- `.Seed(seeders ...Seeder)` error
- `.Config()` - get connection config (use after Build)
- `.Fresh()` error - drop+migrate (not safe for parallel)
- `.Shutdown()` error - stop container

## Implementation Example

```go
// tests/feature/user_test.go
package feature

import (
    "testing"
    "github.com/stretchr/testify/suite"
    contractstesting "github.com/goravel/framework/contracts/testing"
    "github.com/goravel/framework/support/http"
    testinghttp "github.com/goravel/framework/testing/http"
    "github.com/goravel/framework/testing/mock"

    "yourmodule/tests"
    "yourmodule/app/facades"
)

type UserTestSuite struct {
    suite.Suite
    tests.TestCase
}

func TestUserSuite(t *testing.T) { suite.Run(t, new(UserTestSuite)) }

func (s *UserTestSuite) SetupTest() {
    s.RefreshDatabase() // fresh DB before each test
}

func (s *UserTestSuite) TestIndex() {
    resp, err := s.Http(s.T()).
        WithHeader("Accept", "application/json").
        Get("/api/users")

    s.Nil(err)
    resp.AssertOk()
    resp.AssertFluentJson(func(json contractstesting.AssertableJSON) {
        json.Has("data").Count("data", 0)
    })
}

func (s *UserTestSuite) TestCreate() {
    body := http.NewBody().
        SetField("name", "Alice").
        SetField("email", "alice@example.com")
    built, _ := body.Build()

    resp, err := s.Http(s.T()).
        WithHeader("Content-Type", built.ContentType()).
        Post("/api/users", built)

    s.Nil(err)
    resp.AssertCreated()
    resp.AssertFluentJson(func(json contractstesting.AssertableJSON) {
        json.Where("name", "Alice").Has("id").Missing("password")
    })
}

// Unit test with mock
func TestUserServiceCache(t *testing.T) {
    mockFactory := mock.Factory()
    mockCache := mockFactory.Cache()
    mockCache.On("Remember", "user:1", mock.Anything, mock.Anything).
        Return(&User{ID: 1, Name: "Alice"}, nil).Once()

    svc := &UserService{} // uses facades.Cache() internally
    user, err := svc.GetUser(1)
    assert.Nil(t, err)
    assert.Equal(t, "Alice", user.Name)
    mockCache.AssertExpectations(t)
}

// Docker test - tests/feature/main_test.go
func TestMain(m *testing.M) {
    db, err := facades.Testing().Docker().Database()
    if err != nil { panic(err) }
    if err := db.Build(); err != nil { panic(err) }
    if err := db.Ready(); err != nil { panic(err) }
    if err := db.Migrate(); err != nil { panic(err) }
    if err := facades.App().Restart(); err != nil { panic(err) }

    exit := m.Run()
    db.Shutdown()
    os.Exit(exit)
}
```

## Rules

- Embed `tests.TestCase` (not `suite.Suite` alone) to get `Http()`, `Seed()`, `RefreshDatabase()`.
- `s.RefreshDatabase()` in `SetupTest()` drops and re-migrates before **each** test.
- `s.Http(s.T())` creates a new test HTTP client per call; chain builder methods before the verb.
- Post/Put/Patch body: use `http.NewBody().SetField(k,v).Build()` and set `Content-Type` from `built.ContentType()`.
- `AssertJson` is a **subset** match - extra fields in response are allowed.
- `AssertExactJson` requires **exact** match - no extra or missing fields.
- JSON numeric values come back as `float64` in Go - use `float64(1)` not `1` in assertions.
- Mock `Log` facade uses `fmt.Print` - it does not write real log files during tests.
- `mock.Factory()` replaces the global facade binding for that test scope automatically.
- Docker `Fresh()` is **not safe** for parallel tests - it drops all tables.
- Never use `t.Parallel()` alongside `facades.Http().Fake(...)` - global state, race conditions.
- Always `defer facades.Http().Reset()` in any test using `Fake`.
- Docker images auto-shutdown after 1 hour if `Shutdown()` is not called.
- `.env` in the test package directory overrides root `.env`; or pass `--env=.env.testing`.
