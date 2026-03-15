# Goravel Session

## Configuration

Full `config/session.go`:

```go
import (
    "github.com/goravel/framework/support/path"
    "github.com/goravel/framework/support/str"
    "goravel/app/facades"
)

config.Add("session", map[string]any{
    "default": "file",          // driver name to use

    "drivers": map[string]any{
        "file": map[string]any{
            "driver": "file",
        },
        // Redis driver (requires goravel/redis package):
        // "redis": map[string]any{
        //     "driver":     "custom",
        //     "connection": "default",
        //     "via": func() (session.Driver, error) {
        //         return redisfacades.Session("redis"), nil
        //     },
        // },
    },

    // Session lifetime in minutes
    "lifetime":        config.Env("SESSION_LIFETIME", 120),
    "expire_on_close": config.Env("SESSION_EXPIRE_ON_CLOSE", false),

    // File session storage path (only for file driver)
    "files": path.Storage("framework/sessions"),

    // Garbage collection interval in minutes (-1 to disable)
    "gc_interval": config.Env("SESSION_GC_INTERVAL", 30),

    // Cookie name (defaults to app_name_session)
    "cookie":    config.Env("SESSION_COOKIE", str.Of(config.GetString("app.name")).Snake().Lower().String()+"_session"),
    "path":      config.Env("SESSION_PATH", "/"),
    "domain":    config.Env("SESSION_DOMAIN", ""),
    "secure":    config.Env("SESSION_SECURE", false),     // HTTPS only
    "http_only": config.Env("SESSION_HTTP_ONLY", true),   // prevent JS access
    "same_site": config.Env("SESSION_SAME_SITE", "lax"),  // "lax", "strict", "none"
})
```

### Redis Session Driver

Install `goravel/redis`:

```shell
./artisan package:install github.com/goravel/redis
```

```go
// config/session.go
import (
    "github.com/goravel/framework/contracts/session"
    redisfacades "github.com/goravel/redis/facades"
)

"default": "redis",

"drivers": map[string]any{
    "redis": map[string]any{
        "driver":     "custom",
        "connection": "default",
        "via": func() (session.Driver, error) {
            return redisfacades.Session("redis"), nil
        },
    },
},
```

Redis connection must be defined in `config/database.go`:

```go
"redis": map[string]any{
    "default": map[string]any{
        "host":     config.Env("REDIS_HOST", "127.0.0.1"),
        "password": config.Env("REDIS_PASSWORD", ""),
        "port":     config.Env("REDIS_PORT", 6379),
        "database": config.Env("REDIS_DB", 0),
    },
},
```

### Register Session Middleware

Configure driver in `config/session.go`. Default driver: `file` (stores in `storage/framework/sessions`).

Register session middleware:

```go
import "github.com/goravel/framework/session/middleware"

func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithMiddleware(func(handler configuration.Middleware) {
            handler.Append(middleware.StartSession())
        }).
        WithConfig(config.Boot).
        Create()
}
```

---

## Session Operations

All operations via `ctx.Request().Session()`:

### Read

```go
value := ctx.Request().Session().Get("key")
value := ctx.Request().Session().Get("key", "default")
data  := ctx.Request().Session().All()
data  := ctx.Request().Session().Only([]string{"username", "email"})
```

### Check existence

```go
ctx.Request().Session().Has("user")     // true if present and not nil
ctx.Request().Session().Exists("user")  // true even if nil
ctx.Request().Session().Missing("user") // true if absent
```

### Write

```go
ctx.Request().Session().Put("key", "value")
```

### Retrieve and delete

```go
value := ctx.Request().Session().Pull("key")
```

### Delete

```go
ctx.Request().Session().Forget("username", "email")
ctx.Request().Session().Flush()
```

### Regenerate session ID (prevents session fixation)

```go
ctx.Request().Session().Regenerate()
```

### Invalidate (regenerate ID + clear all data)

```go
ctx.Request().Session().Invalidate()

// After invalidating, save the new session ID to cookie:
ctx.Response().Cookie(http.Cookie{
    Name:     ctx.Request().Session().GetName(),
    Value:    ctx.Request().Session().GetID(),
    MaxAge:   facades.Config().GetInt("session.lifetime") * 60,
    Path:     facades.Config().GetString("session.path"),
    Domain:   facades.Config().GetString("session.domain"),
    Secure:   facades.Config().GetBool("session.secure"),
    HttpOnly: facades.Config().GetBool("session.http_only"),
    SameSite: facades.Config().GetString("session.same_site"),
})
```

---

## Flash Data

Flash data is only available for the next request, then deleted automatically.

```go
ctx.Request().Session().Flash("status", "Task was successful!")

// Keep flash data for one more request
ctx.Request().Session().Reflash()

// Keep specific flash keys for one more request
ctx.Request().Session().Keep("status", "username")

// Flash data available immediately in current request
ctx.Request().Session().Now("status", "Task was successful!")
```

---

## Session Manager

### Build a custom session

```go
session := facades.Session().BuildSession(driver)
session := facades.Session().BuildSession(driver, "custom-session-id")
```

### Get a driver instance

```go
driver, err := facades.Session().Driver("file")
```

### Start and save manually

```go
session := facades.Session().BuildSession(driver)
session.Start()
session.Save()
```

### Attach session to request

```go
ctx.Request().SetSession(session)
```

### Check if request has a session

```go
if ctx.Request().HasSession() {
    // ...
}
```

---

## Custom Session Driver

Implement the `contracts/session/driver` interface:

```go
type Driver interface {
    Close() error
    Destroy(id string) error
    Gc(maxLifetime int) error
    Open(path string, name string) error
    Read(id string) (string, error)
    Write(id string, data string) error
}
```

Register in `config/session.go`:

```go
"default": "custom",

"drivers": map[string]any{
    "custom": map[string]any{
        "driver": "custom",
        "via": func() (session.Driver, error) {
            return &MyDriver{}, nil
        },
    },
},
```
