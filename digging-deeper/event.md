# Events

[[toc]]

## Introduction

Goravel's events provide a simple observer pattern implementation, allowing you to subscribe and listen for various events that occur within your application. Event classes are typically stored in the `app/events` directory, while their listeners are stored in `app/listeners`. Don't worry if you don't see these directories in your application as they will be created for you as you generate events and listeners using Artisan console commands.

Events serve as a great way to decouple various aspects of your application, since a single event can have multiple listeners that do not depend on each other. For example, you may wish to send a Slack notification to your user each time an order has shipped. Instead of coupling your order processing code to your Slack notification code, you can raise an `app\events\OrderShipped` event which a listener can receive and use to dispatch a Slack notification.

## Registering Events & Listeners

The `app\providers\EventServiceProvider` included with your Goravel application provides a convenient place to register all of your application's event listeners. The `listen` method contains an array of all events (keys) and their listeners (values). You may add as many events to this array as your application requires. For example, let's add an `OrderShipped` event:

```go
package providers

import (
  "github.com/goravel/framework/contracts/event"
  "github.com/goravel/framework/facades"

  "goravel/app/events"
  "goravel/app/listeners"
)

type EventServiceProvider struct {
}

...

func (receiver *EventServiceProvider) listen() map[event.Event][]event.Listener {
  return map[event.Event][]event.Listener{
    &events.OrderShipped{}: {
      &listeners.SendShipmentNotification{},
    },
  }
}
```

### Generating Events & Listeners

You can use the `make:event` and `make:listener` Artisan commands to generate individual events and listeners:

```go
go run . artisan make:event PodcastProcessed

go run . artisan make:listener SendPodcastNotification
```

## Defining Events

An event class is essentially a data container which holds the information related to the event, the Handle method of `event` passes in and returns the `[]event.Arg` structure, you can process data here, the processed data will be passed into all associated `listeners` For example, let's assume an `app\events\OrderShipped` event:

```go
package events

import "github.com/goravel/framework/contracts/event"

type OrderShipped struct {
}

func (receiver *OrderShipped) Handle(args []event.Arg) ([]event.Arg, error) {
  return args, nil
}
```

## Defining Listeners

Next, let's take a look at the listener for our example event. Event listeners receive `[]event.Arg` of the event `Handle` method returns. Within the `Handle` method, you may perform any actions necessary to respond to the event:

```go
package listeners

import (
  "github.com/goravel/framework/contracts/event"
)

type SendShipmentNotification struct {
}

func (receiver *SendShipmentNotification) Signature() string {
  return "send_shipment_notification"
}

func (receiver *SendShipmentNotification) Queue(args ...interface{}) event.Queue {
  return event.Queue{
    Enable:     false,
    Connection: "",
    Queue:      "",
  }
}

func (receiver *SendShipmentNotification) Handle(args ...interface{}) error {
  return nil
}
```

### Stopping The Propagation Of An Event

Sometimes, you may wish to stop the propagation of an event to other listeners. You may do so by returning error from your listener's `Handle` method.

## Queued Event Listeners

Queueing listeners can be beneficial if your listener is going to perform a slow task such as sending an email or making an HTTP request. Before using queued listeners, make sure to [configure your queue](queues.md) and start a queue worker on your server or local development environment.

```go
package listeners

...

func (receiver *SendShipmentNotification) Queue(args ...interface{}) event.Queue {
  return event.Queue{
    Enable:     false,
    Connection: "",
    Queue:      "",
  }
}

func (receiver *SendShipmentNotification) Handle(args ...interface{}) error {
  name := args[0]

  return nil
}
```

### Queued Event Listeners & Database Transactions

When queued listeners are dispatched within database transactions, they may be processed by the queue before the database transaction has committed. When this happens, any updates you have made to models or database records during the database transaction may not yet be reflected in the database. In addition, any models or database records created within the transaction may not exist in the database. If your listener depends on these models, unexpected errors can occur when the job that dispatches the queued listener is processed. At this time, the event needs to be placed outside the database transactions.

## Dispatching Events

We can dispatching Events by `facades.Event.Job().Dispatch()` method.

```go
package controllers

import (
  "github.com/goravel/framework/contracts/event"
  "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/facades"

  "goravel/app/events"
)

type UserController struct {
}

func (r UserController) Show(ctx http.Context) {
  err := facades.Event.Job(&events.OrderShipped{}, []event.Arg{
    {Type: "string", Value: "Goravel"},
    {Type: "int", Value: 1},
  }).Dispatch()
}
```

## `event.Arg.Type` Supported Types

```go
bool
int
int8
int16
int32
int64
uint
uint8
uint16
uint32
uint64
float32
float64
string
[]bool
[]int
[]int8
[]int16
[]int32
[]int64
[]uint
[]uint8
[]uint16
[]uint32
[]uint64
[]float32
[]float64
[]string
```

<CommentService/>