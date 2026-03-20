# Event Facade

## Core Imports

```go
import (
    "github.com/goravel/framework/contracts/event"

    "yourmodule/app/facades"
    "yourmodule/app/events"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/event/events.go`

## Available Methods

**facades.Event():**

- `Job(event Event, args []Arg)` Task - create dispatchable event task
- `Job(...).Dispatch()` error - fire event synchronously or via queue

**Registration (bootstrap/app.go):**

- `WithEvents(func() map[event.Event][]event.Listener)` - map events to listeners

## Implementation Example

```go
// app/events/order_shipped.go
package events

import "github.com/goravel/framework/contracts/event"

type OrderShipped struct{}

func NewOrderShipped() *OrderShipped { return &OrderShipped{} }

func (r *OrderShipped) Handle(args []event.Arg) ([]event.Arg, error) {
    // Transform or enrich args before passing to listeners
    return args, nil
}

// app/listeners/send_shipment_notification.go
package listeners

import "github.com/goravel/framework/contracts/event"

type SendShipmentNotification struct{}

func NewSendShipmentNotification() *SendShipmentNotification {
    return &SendShipmentNotification{}
}

func (r *SendShipmentNotification) Signature() string {
    return "send_shipment_notification"
}

func (r *SendShipmentNotification) Queue(args ...any) event.Queue {
    return event.Queue{
        Enable:     true,        // true = async via queue
        Connection: "redis",
        Queue:      "notifications",
    }
}

func (r *SendShipmentNotification) Handle(args ...any) error {
    orderID := args[0].(int)
    // send notification logic
    _ = orderID
    return nil
}

// bootstrap/app.go - registration
// WithEvents(func() map[event.Event][]event.Listener {
//     return map[event.Event][]event.Listener{
//         events.NewOrderShipped(): {
//             listeners.NewSendShipmentNotification(),
//         },
//     }
// })

// controllers/order_controller.go - dispatching
package controllers

import (
    "github.com/goravel/framework/contracts/http"
    "github.com/goravel/framework/contracts/event"

    "yourmodule/app/facades"
    "yourmodule/app/events"
)

type OrderController struct{}

func (r *OrderController) Ship(ctx http.Context) http.Response {
    orderID := ctx.Request().RouteInt("id")

    err := facades.Event().Job(&events.OrderShipped{}, []event.Arg{
        {Type: "int", Value: orderID},
        {Type: "string", Value: "express"},
    }).Dispatch()
    if err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }
    return ctx.Response().Json(http.StatusOK, http.Json{"shipped": true})
}
```

## Rules

- Events and listeners are registered via `WithEvents` in `bootstrap/app.go` - `make:event`/`make:listener` auto-register.
- `Listener.Signature()` must be unique across all listeners.
- `Event.Handle(args)` receives the dispatched args, can modify them, and returns the (potentially modified) args to listeners.
- `Listener.Handle(args ...any)` receives the output of `Event.Handle` as variadic `any`.
- To stop propagation to subsequent listeners, return an `error` from `Listener.Handle`.
- `Listener.Queue(args).Enable = true` makes the listener asynchronous - requires queue to be configured.
- Queued listeners dispatched within a DB transaction may run before the transaction commits - place the dispatch outside the transaction when the listener depends on newly committed data.
- `event.Arg.Type` must be one of the supported primitive types (same as `queue.Arg`).
- `make:event` creates in `app/events/`; `make:listener` creates in `app/listeners/`.
