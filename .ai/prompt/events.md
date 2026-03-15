# Goravel Events

## Register Events and Listeners

All events and listeners are registered in `bootstrap/app.go` via `WithEvents`:

```go
import (
    "github.com/goravel/framework/contracts/event"
    "goravel/app/events"
    "goravel/app/listeners"
)

func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithEvents(func() map[event.Event][]event.Listener {
            return map[event.Event][]event.Listener{
                events.NewOrderShipped(): {
                    listeners.NewSendShipmentNotification(),
                    listeners.NewUpdateInventory(),
                },
                events.NewUserRegistered(): {
                    listeners.NewSendWelcomeEmail(),
                },
            }
        }).
        WithConfig(config.Boot).
        Create()
}
```

---

## Defining Events

Events live in `app/events/`. An event holds and transforms data passed to listeners.

```go
package events

import "github.com/goravel/framework/contracts/event"

type OrderShipped struct{}

func NewOrderShipped() *OrderShipped {
    return &OrderShipped{}
}

func (r *OrderShipped) Handle(args []event.Arg) ([]event.Arg, error) {
    // Transform args before passing to listeners, or return as-is
    return args, nil
}
```

### Generate event

```shell
./artisan make:event OrderShipped
./artisan make:event user/OrderShipped
```

---

## Defining Listeners

Listeners live in `app/listeners/`.

```go
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
        Enable:     false,
        Connection: "",
        Queue:      "",
    }
}

func (r *SendShipmentNotification) Handle(args ...any) error {
    // args are the []event.Arg values returned by the event's Handle method
    return nil
}
```

### Generate listener

```shell
./artisan make:listener SendShipmentNotification
./artisan make:listener user/SendShipmentNotification
```

---

## Dispatching Events

```go
package controllers

import (
    "github.com/goravel/framework/contracts/event"
    contractshttp "github.com/goravel/framework/contracts/http"

    "goravel/app/events"
    "goravel/app/facades"
)

type OrderController struct{}

func (r *OrderController) Ship(ctx contractshttp.Context) contractshttp.Response {
    err := facades.Event().Job(&events.OrderShipped{}, []event.Arg{
        {Type: "string", Value: "order-123"},
        {Type: "int", Value: 1},
    }).Dispatch()

    if err != nil {
        return ctx.Response().String(500, "dispatch failed")
    }

    return ctx.Response().Success().Json(contractshttp.Json{"status": "shipped"})
}
```

---

## Queued Listeners

Set `Enable: true` in the `Queue` method to run the listener asynchronously via the queue:

```go
func (r *SendShipmentNotification) Queue(args ...any) event.Queue {
    return event.Queue{
        Enable:     true,
        Connection: "redis",
        Queue:      "notifications",
    }
}
```

Use an empty string for `Connection` and `Queue` to use defaults.

### Reading args in Handle

Args are positional, matching the `[]event.Arg` slice dispatched:

```go
func (r *SendShipmentNotification) Handle(args ...any) error {
    orderID := args[0].(string)
    userID := args[1].(int)
    // send notification
    return nil
}
```

---

## Stop Event Propagation

Return an error from `Handle` to stop propagation to subsequent listeners:

```go
func (r *SendShipmentNotification) Handle(args ...any) error {
    // returning a non-nil error stops further listeners
    return errors.New("stop propagation")
}
```

---

## Supported Arg Types

```
bool, int, int8, int16, int32, int64
uint, uint8, uint16, uint32, uint64
float32, float64
string
[]bool, []int, []int8, []int16, []int32, []int64
[]uint, []uint8, []uint16, []uint32, []uint64
[]float32, []float64
[]string
```

---

## Gotchas

- Events must be registered in `WithEvents` before they can be dispatched. Dispatching an unregistered event silently does nothing.
- `Type` in `event.Arg` must be an exact string from the supported list.
- When a queued listener is dispatched inside a database transaction, the queue may process the listener before the transaction commits. Place event dispatches outside transactions if listeners read the data written by the transaction.
- Returning a non-nil error from a listener's `Handle` stops propagation to subsequent listeners for that event.
