# Log Facade

## Core Imports

```go
import (
    contractslog "github.com/goravel/framework/contracts/log"
    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/log/log.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/log/level.go`

## Available Methods

- `WithContext(ctx)` Log
- `Channel(name)` Log
- `Stack([]string)` Log
- `Debug/Info/Warning/Error/Fatal/Panic(args ...any)`
- `Debugf/Infof/Warningf/Errorf/Fatalf/Panicf(format, args...)`
- `Code(string)` Writer
- `Hint(string)` Writer
- `In(domain string)` Writer
- `Owner(any)` Writer
- `Request(http.ContextRequest)` Writer
- `Response(http.ContextResponse)` Writer
- `Tags(tags ...string)` Writer
- `User(any)` Writer
- `With(map[string]any)` Writer - pass a map, NOT key/value pair
- `WithTrace()` Writer

## Implementation Example

```go
package services

import "yourmodule/app/facades"

func Process(userID int, orderID int) error {
    // Simple
    facades.Log().Info("processing order")
    facades.Log().Infof("order %d for user %d", orderID, userID)

    // Rich context - With takes a MAP
    facades.Log().
        User(userID).
        With(map[string]any{"order_id": orderID, "amount": 99.99}).
        Tags("orders", "billing").
        In("billing").
        Code("ORD-001").
        Hint("check payment gateway if this fails").
        Info("payment initiated")

    // With stack trace on error
    if err := doWork(); err != nil {
        facades.Log().
            WithTrace().
            User(userID).
            With(map[string]any{"order_id": orderID}).
            Error(err)
        return err
    }

    // Specific channel
    facades.Log().Channel("slack").Infof("order %d completed", orderID)

    // Multiple channels simultaneously
    facades.Log().Stack([]string{"daily", "slack"}).Error("critical failure")

    return nil
}

func doWork() error { return nil }
```

## Rules

- `With(data map[string]any)` takes a **map**, not `(key, value)` pair arguments.
- `Request(req)` takes `http.ContextRequest` (from `ctx.Request()`), not `*http.Request`.
- `Response(res)` takes `http.ContextResponse` (from `ctx.Response()`), not `*http.Response`.
- `Fatal` calls `os.Exit(1)` after logging - do not use in goroutines where cleanup is needed.
- `Panic` panics after logging - will trigger any registered `recover` middleware.
- Chain methods are order-independent; must precede the terminal level call.
- Custom driver: implement `Logger` interface (`Handle(channel) (Handler, error)`), not the deprecated `Hook`.
- `Handler` has `Enabled(Level) bool` and `Handle(Entry) error`.
- Use `log.HookToHandler(hook)` adapter only if adapting a legacy `Hook` implementation.
- Default channel is `stack`; configure in `config/logging.go`.
