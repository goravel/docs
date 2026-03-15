# Goravel Logging

## Configuration

Configure channels in `config/logging.go`. Default channel: `stack` (forwards to multiple channels).

Available channel drivers:

| Driver | Description |
|--------|-------------|
| `stack` | Multiple channels |
| `single` | Single log file |
| `daily` | One file per day |
| `custom` | Custom driver |

---

## Write Log Messages

```go
facades.Log().Debug("message")
facades.Log().Debugf("message: %s", arg)
facades.Log().Info("message")
facades.Log().Infof("message: %s", arg)
facades.Log().Warning("message")
facades.Log().Warningf("message: %s", arg)
facades.Log().Error("message")
facades.Log().Errorf("message: %s", arg)
facades.Log().Fatal("message")
facades.Log().Fatalf("message: %s", arg)
facades.Log().Panic("message")
facades.Log().Panicf("message: %s", arg)
```

---

## Write to Specific Channel

```go
facades.Log().Channel("single").Info("message")
```

## Write to Multiple Channels

```go
facades.Log().Stack([]string{"single", "slack"}).Info("message")
```

---

## Inject HTTP Context

```go
facades.Log().WithContext(ctx).Info("message")
```

---

## Chain Methods

```go
facades.Log().
    User("john@example.com").
    Code("ERR_AUTH_001").
    Hint("Check the token expiry").
    In("auth").
    Owner("backend-team").
    Tags("auth", "jwt").
    With(map[string]any{"userID": 123}).
    WithTrace().
    Error("Authentication failed")
```

| Method | Description |
|--------|-------------|
| `Code(code)` | Error code or slug |
| `Hint(hint)` | Debugging hint |
| `In(category)` | Feature category or domain |
| `Owner(owner)` | Alert owner |
| `Request(req)` | Attach HTTP request |
| `Response(resp)` | Attach HTTP response |
| `Tags(tags...)` | Feature tags |
| `User(user)` | Associated user |
| `With(data)` | Key-value context pairs |
| `WithTrace()` | Include stack trace |

---

## Custom Log Driver

// BREAKING v1.17: Handle must return (Handler, error) not (Hook, error)
// Use log.HookToHandler(hook) adapter if you have an old Hook implementation

```go
// config/logging.go
"custom": map[string]interface{}{
    "driver": "custom",
    "via":    &CustomLogger{},
},
```

Implement `contracts/log/Logger`:

```go
// BREAKING v1.17: Handle returns (Handler, error) not (Hook, error)
package log

type Logger interface {
    Handle(channel string) (Handler, error)
}
```

Example implementation:

```go
package extensions

import (
    "github.com/goravel/framework/contracts/log"
)

type CustomLogger struct{}

func (c *CustomLogger) Handle(channel string) (log.Handler, error) {
    return &CustomHandler{channel: channel}, nil
}

type CustomHandler struct {
    channel string
}

func (h *CustomHandler) Handle(record log.Record) error {
    // write record to your custom sink
    return nil
}
```

### Adapter for old Hook implementations

```go
import "github.com/goravel/framework/log"

handler := log.HookToHandler(myOldHook)
```

---

## JSON Formatter (v1.17)

```go
// config/logging.go
"single": map[string]any{
    "driver":    "single",
    "path":      "storage/logs/goravel.log",
    "level":     "debug",
    "formatter": "json",   // v1.17: new option
},
```
