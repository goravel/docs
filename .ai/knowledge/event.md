# Event

Pub/sub: an `Event` (publisher) maps to one or more `Listener`s. Listeners can be sync or queued. Dispatch builds a `Task` and calls `.Dispatch()`.

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/event/events.go` — `Instance`, `Event`, `Listener`, `Task`, `Arg`, `Queue`

## Imports

```go
import (
    "github.com/goravel/framework/contracts/event"

    "yourmodule/app/facades"
)
```

## Methods

### `facades.Event()` returns `event.Instance`

| Method | Signature | Notes |
|---|---|---|
| Register | `(map[Event][]Listener)` | Wire events → listeners. Call inside `WithCallback`. |
| Job | `(event Event, args []Arg) Task` | Build a dispatchable task. |
| GetEvents | `() map[Event][]Listener` | Inspect registered map. |

### `event.Event` (the contract you implement on a publisher)

```go
type Event interface {
    Handle(args []Arg) ([]Arg, error)   // mutate args before listeners receive them; return non-nil err to abort
}
```

### `event.Listener` (the contract you implement on each subscriber)

```go
type Listener interface {
    Signature() string                       // unique listener id
    Queue(args ...any) Queue                 // {Connection, Queue, Enable} — Enable=true => queued
    Handle(args ...any) error                // run the side effect; non-nil = listener failed
}
```

### `event.Task`

```go
type Task interface {
    Dispatch() error
}
```

### Value types

```go
type Arg struct {
    Value any
    Type  string  // "string" | "int" | "uint" | "[]string" | etc.
}

type Queue struct {
    Connection string
    Queue      string
    Enable     bool   // false = run sync; true = push to queue facade
}
```

## Config

User-owned: events are wired in code, not config. See `bootstrap/app.go` `WithCallback` for registration.

If `Listener.Queue().Enable` is true, the queue facade's config (`config/queue.go`) governs delivery — see `queue.md`.

## Patterns & gotchas

- **Event vs Listener**: the Event is the *thing that happened*; the Listener is the *reaction*. The Event's `Handle(args)` runs FIRST and can mutate/replace the args slice; listeners then receive the mutated args.
- **Register inside `WithCallback`** in `bootstrap/app.go`. Events registered after boot are silently ignored.
- **`Job(event, args)` builds a task; `.Dispatch()` actually fires it**. The args slice is value-typed (`[]event.Arg`), each entry `{Value, Type}`. Type strings drive deserialization on the queue side (when listeners are queued).
- **Listener `Queue(args ...any) Queue`**: this is a GETTER returning the routing config for THIS listener. Set `Enable: true` to push the listener invocation to the queue facade. The args param lets you customise routing per dispatch (rarely used; usually return a static struct).
- **`Handle(args ...any) error`** on listeners receives `any` values — type-assert at the top: `userID, _ := args[0].(uint)`.
- **Sync vs queued**: if ALL listeners are sync (`Queue.Enable = false`), `Task.Dispatch()` runs them inline and returns the first non-nil error. If any listener is queued, the dispatch enqueues — the listener's error surfaces via the queue's failed-job store, not the dispatch return.
- **Listener `Signature()` is the queue-side lookup key**. Stable forever; renaming orphans pending invocations.
- **One event → many listeners**: register `map[event.Event][]event.Listener{ &MyEvent{}: {&L1{}, &L2{}} }`.
- **Listener order**: listeners run in the slice order. If one returns an error, the rest still run (errors are aggregated by the dispatcher).
- **Stop propagation**: there's no built-in "stop" signal — to short-circuit, have the Event's `Handle(args)` return an error before listeners are called.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `func (l *L) Queue() event.Queue` (no args) | `func (l *L) Queue(args ...any) event.Queue` | Interface requires variadic args. |
| `func (l *L) Handle(userID uint) error` | `func (l *L) Handle(args ...any) error` then assert | Variadic any per interface. |
| Register at startup outside WithCallback | `app.WithCallback(func() { facades.Event().Register(...) })` | Boot order. |
| `event.Job(&e, ...)` then forget `.Dispatch()` | `event.Job(&e, args).Dispatch()` | Job builds; Dispatch sends. |
| Listener `Signature()` rename | New listener + deprecate old | Pending queue items orphan. |
| Pass struct directly as Arg | `event.Arg{Type: "string", Value: jsonBytes}` (JSON-marshal first) | Args are flat values; complex types serialize via JSON. |

## Worked example: UserRegistered → email + analytics

```go
// app/events/user_registered.go
package events

import "github.com/goravel/framework/contracts/event"

type UserRegistered struct{}

// Handle: mutate/inspect args before listeners. Return non-nil to abort dispatch.
func (e *UserRegistered) Handle(args []event.Arg) ([]event.Arg, error) {
    return args, nil
}

// app/listeners/send_welcome_email.go
package listeners

import (
    "github.com/goravel/framework/contracts/event"

    "yourmodule/app/facades"
)

type SendWelcomeEmail struct{}

func (l *SendWelcomeEmail) Signature() string { return "listeners.send_welcome_email" }

func (l *SendWelcomeEmail) Queue(args ...any) event.Queue {
    return event.Queue{Enable: true, Queue: "emails"}
}

func (l *SendWelcomeEmail) Handle(args ...any) error {
    userID, _ := args[0].(uint)
    facades.Log().Info("welcome email queued", map[string]any{"user_id": userID})
    // ... build mail, dispatch ...
    return nil
}

// app/listeners/track_signup.go
type TrackSignup struct{}

func (l *TrackSignup) Signature() string                   { return "listeners.track_signup" }
func (l *TrackSignup) Queue(args ...any) event.Queue       { return event.Queue{Enable: false} }  // sync
func (l *TrackSignup) Handle(args ...any) error {
    userID, _ := args[0].(uint)
    facades.Log().Channel("audit").Info("signup", map[string]any{"user_id": userID})
    return nil
}

// bootstrap/app.go (excerpt)
// app.WithCallback(func() {
//     facades.Event().Register(map[event.Event][]event.Listener{
//         &events.UserRegistered{}: {
//             &listeners.SendWelcomeEmail{},
//             &listeners.TrackSignup{},
//         },
//     })
// })

// Dispatch
func OnSignup(userID uint) error {
    return facades.Event().
        Job(&events.UserRegistered{}, []event.Arg{{Type: "uint", Value: userID}}).
        Dispatch()
}
```

## Rules

- Event interface: `Handle(args []Arg) ([]Arg, error)`. Mutate-and-pass-through is the common shape.
- Listener interface: `Signature() string` + `Queue(args ...any) Queue` + `Handle(args ...any) error` — all three required.
- Register events → listeners in `bootstrap/app.go` `WithCallback`.
- Dispatch: `facades.Event().Job(&event, []event.Arg{...}).Dispatch()`. Forgetting `.Dispatch()` is silent.
- For queued listeners, `Queue.Enable = true` and route via Connection/Queue. Errors then flow through the queue's failer.
- Listener `Signature()` is stable forever — never rename in-flight.
- For "stop on first error" semantics, return the error from the Event's `Handle` (before listeners fire).
