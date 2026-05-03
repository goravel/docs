# Testing

Test helpers for HTTP, database (via Docker), and cache (via Docker). Application-level: `facades.Testing()` exposes `Docker()` for ephemeral cache/db containers. HTTP test surface: route's `Test()` (Fiber driver only) or build a `httptest.Server` against `facades.Route().ServeHTTP`. Mocks for facades are generated in `mocks/` (regenerate via `go tool mockery`).

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/testing/testing.go` — `Testing`, `Docker`, `TestingT`
- `contracts/testing/docker/` — driver-specific container interfaces
- `contracts/testing/http/` — HTTP test helpers

## Imports

```go
import (
    "testing"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/suite"

    "github.com/goravel/framework/contracts/testing"
    "github.com/goravel/framework/contracts/testing/docker"

    mocksconsole "github.com/goravel/framework/mocks/console"
    mockscache   "github.com/goravel/framework/mocks/cache"

    "yourmodule/app/facades"
)
```

## Methods

### `facades.Testing()` returns `testing.Testing`

| Method | Signature | Notes |
|---|---|---|
| Docker | `() Docker` | Get the Docker manager for ephemeral test resources. |

### `testing.Docker`

| Method | Signature | Notes |
|---|---|---|
| Cache | `(store ...string) (docker.CacheDriver, error)` | Spin up a cache container (defaults to configured store). |
| Database | `(connection ...string) (docker.Database, error)` | Spin up a DB container (defaults to configured connection). |
| Image | `(image docker.Image) docker.ImageDriver` | Custom container by image. |

### Mocks (generated under `mocks/`)

For every facade and most major contract there is a `mocks/<package>/X.go` testify-style mock. Examples: `mocks/console.Context`, `mocks/cache.Cache`, `mocks/database/orm.Orm`. Use the `EXPECT()` API (NOT `mock.On(...)`).

### `testing.TestingT`

```go
type TestingT interface {
    Errorf(format string, args ...any)
    FailNow()
}
```

Pass `*testing.T` wherever the framework asks for a `TestingT`.

## Config

User-owned: `config/database.go` (used by `Docker.Database()`), `config/cache.go` (used by `Docker.Cache()`). The Docker container picks driver/image from these.

For test isolation: set `database.connections.<name>.driver` to the matching test driver in your test environment (e.g. `sqlite` for fast unit tests, `postgres` via docker for integration).

## Patterns & gotchas

- **Mocks: use `EXPECT()`, NOT `mock.Anything`**. Per project convention (CLAUDE.md): `mockContext.EXPECT().OptionBool("force").Return(true).Once()`. Avoid `mock.Anything`; spell out the expected argument.
- **Don't edit `mocks/` directly** — they're generated. Run `go tool mockery` to regenerate after contract changes.
- **HTTP testing options**:
  - **Fiber driver**: `facades.Route().Test(req)` returns a fake response — driver-specific, easiest path on Fiber.
  - **Driver-portable**: `httptest.NewServer(http.HandlerFunc(facades.Route().ServeHTTP))` — wraps the route as a stdlib handler, then test via `http.Get`/`http.Post`.
- **Docker DB**: `db, err := facades.Testing().Docker().Database()` returns a `docker.Database` with `Driver()`, `Config()`, `Image()`, `Stop()`. Use `t.Cleanup(func() { _ = db.Stop() })` to tear down.
- **Docker Cache**: same pattern — ephemeral redis container for cache tests. `t.Cleanup` to stop.
- **Test isolation**: each `t.Run(...)` should set up + tear down its own state. For DB tests, wrap each test in a transaction and rollback in cleanup, OR use a fresh container per test (slower but bullet-proof).
- **Don't run `go test ./...` blindly** (per CLAUDE.md) — it's slow. Run on the specific package: `go test ./ai/console/...`.
- **Suite-style tests**: `testify/suite` works well for shared setup; the framework doesn't ship its own test base.
- **Mock context propagation**: the `mocksconsole.Context` mock implements `console.Context`. Set up expected calls via `mockContext.EXPECT().X().Return(y).Once()` and pass the mock to your `Handle(ctx)`.
- **Sync queue driver in tests**: set `queue.default = "sync"` in your test config to make Dispatch run inline — easier to assert effects.
- **Mail testing**: there's typically a `null` driver for tests. Set `mail.driver = "null"` (or use a test double via the mock).
- **HTTP request fixtures**: `httptest.NewRequest("POST", "/x", body)` then pass to `facades.Route().Test(req)` (Fiber) or `srv.Client().Do(req)` (httptest server).

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `mock.On("X", mock.Anything).Return(y)` | `mock.EXPECT().X(specificArg).Return(y).Once()` | Project rule: no `mock.Anything`; use EXPECT with explicit args. |
| Edit `mocks/console/context.go` directly | Run `go tool mockery` to regenerate | Mocks are generated; manual edits get clobbered. |
| `go test ./...` | `go test ./<specific-package>/...` | Full sweep is slow; per CLAUDE.md prefer narrow target. |
| Forget to `t.Cleanup(db.Stop)` after `Docker().Database()` | Always pair with cleanup | Otherwise containers leak. |
| Test against the real production DB | Use `Docker().Database()` for an ephemeral instance | Per-test isolation. |
| Use `time.Sleep` to wait for queued jobs | Set `queue.default = "sync"` in test config | Sync = inline = no waiting. |

## Worked example: HTTP test against the route facade

```go
package controllers_test

import (
    "encoding/json"
    "io"
    "net/http"
    "net/http/httptest"
    "strings"
    "testing"

    "github.com/stretchr/testify/assert"

    "yourmodule/app/facades"
    "yourmodule/bootstrap"
)

func TestPostsStore(t *testing.T) {
    // Boot the app once for the test (or use a shared TestMain).
    app := bootstrap.Boot()
    t.Cleanup(func() { _ = app.Shutdown() })

    // Driver-portable: wrap the framework's HTTP handler in a httptest server.
    srv := httptest.NewServer(http.HandlerFunc(facades.Route().ServeHTTP))
    t.Cleanup(srv.Close)

    body := `{"title": "First post", "body": "Hello world"}`
    resp, err := http.Post(srv.URL+"/posts", "application/json", strings.NewReader(body))
    assert.NoError(t, err)
    defer func() { _ = resp.Body.Close() }()

    assert.Equal(t, http.StatusCreated, resp.StatusCode)
    raw, _ := io.ReadAll(resp.Body)
    var got map[string]any
    assert.NoError(t, json.Unmarshal(raw, &got))
    assert.Equal(t, "First post", got["data"].(map[string]any)["title"])
}

// Mock-based unit test for an artisan command
package console_test

import (
    "testing"

    "github.com/stretchr/testify/assert"

    mocksconsole "github.com/goravel/framework/mocks/console"
    "yourmodule/app/console/commands"
)

func TestPruneUsers_NoUsers(t *testing.T) {
    mockCtx := mocksconsole.NewContext(t)
    mockCtx.EXPECT().OptionInt("days").Return(30).Once()
    mockCtx.EXPECT().Info("Found 0 user(s) to prune.").Once()

    cmd := &commands.PruneUsers{}
    assert.NoError(t, cmd.Handle(mockCtx))
}

// Docker-backed DB test
func TestUserRepository(t *testing.T) {
    db, err := facades.Testing().Docker().Database()
    assert.NoError(t, err)
    t.Cleanup(func() { _ = db.Stop() })

    // ... run migrations against db.Config(), exercise repository, assert ...
}
```

## Rules

- Mocks live in `mocks/`; never edit by hand. Regenerate via `go tool mockery`.
- Use `mock.EXPECT().X(args).Return(y).Once()` — never `mock.Anything`.
- For ephemeral DB/cache: `facades.Testing().Docker().Database()` / `Cache()`. Always pair with `t.Cleanup(func() { _ = x.Stop() })`.
- Use a per-package `go test ./ai/console/...` rather than `go test ./...` (CLAUDE.md rule).
- For driver-portable HTTP tests: `httptest.NewServer(http.HandlerFunc(facades.Route().ServeHTTP))`.
- For Fiber-only fast tests: `facades.Route().Test(req)`.
- In tests, swap to `sync` queue driver and `null` mail driver via test config — keeps assertions deterministic.
