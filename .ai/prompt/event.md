# Goravel Events and Listeners

## Registration

Register events and listeners in `WithEvents` in `bootstrap/app.go`:

```go
func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithEvents(func() map[event.Event][]event.Listener {
            return map[event.Event][]event.Listener{
                events.NewOrderShipped(): {
                    listeners.NewSendShipmentNotification(),
                    listeners.NewLogOrderShipped(),
                },
            }
        }).
        WithConfig(config.Boot).
        Create()
}
```

Generate via artisan:

```shell
./artisan make:event OrderShipped
./artisan make:event user/OrderShipped

./artisan make:listener SendShipmentNotification
./artisan make:listener user/SendShipmentNotification
```

---

## Define an Event

```go
package events

import "github.com/goravel/framework/contracts/event"

type OrderShipped struct{}

// Handle transforms args before passing to listeners
func (r *OrderShipped) Handle(args []event.Arg) ([]event.Arg, error) {
    return args, nil
}
```

---

## Define a Listener

```go
package listeners

import "github.com/goravel/framework/contracts/event"

type SendShipmentNotification struct{}

func (r *SendShipmentNotification) Signature() string {
    return "send_shipment_notification"
}

// Queue controls async execution
func (r *SendShipmentNotification) Queue(args ...any) event.Queue {
    return event.Queue{
        Enable:     false,   // true to run in queue
        Connection: "",
        Queue:      "",
    }
}

// Handle receives args returned by event.Handle
func (r *SendShipmentNotification) Handle(args ...any) error {
    name := args[0]
    _ = name
    return nil
}
```

Returning an error from `Handle` stops propagation to subsequent listeners.

---

## Queued Listener

```go
func (r *SendShipmentNotification) Queue(args ...any) event.Queue {
    return event.Queue{
        Enable:     true,
        Connection: "redis",
        Queue:      "notifications",
    }
}
```

---

## Dispatch an Event

```go
import (
    "github.com/goravel/framework/contracts/event"
    "goravel/app/events"
    "goravel/app/facades"
)

err := facades.Event().Job(&events.OrderShipped{}, []event.Arg{
    {Type: "string", Value: "Goravel"},
    {Type: "int", Value: 1},
}).Dispatch()
```

---

## Supported `event.Arg.Type` Values

```
bool, int, int8, int16, int32, int64,
uint, uint8, uint16, uint32, uint64,
float32, float64, string,
[]bool, []int, []int8, []int16, []int32, []int64,
[]uint, []uint8, []uint16, []uint32, []uint64,
[]float32, []float64, []string
```

---

## Gotchas

- Queued listeners run outside database transactions. If your listener reads data written in the same transaction, the transaction may not have committed yet when the listener runs.
- Returning an error from `Handle` in a listener stops propagation to subsequent listeners.
- Each `NewOrderShipped()` call creates a new event instance — the map key is the instance used for type matching.
