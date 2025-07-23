# 事件

[[toc]]

## 简介

Goravel 的事件提供了一个简单的观察者模式实现，允许您订阅和监听应用程序中发生的各种事件。 事件类通常存储在 `app/events` 目录中，而它们的监听器存储在 `app/listeners` 中。 如果您在应用程序中没有看到这些目录，请不要担心，因为当您使用 Artisan 控制台命令生成事件和监听器时，它们将为您创建。 Event classes are typically stored in the `app/events` directory, while their listeners are stored in `app/listeners`. Don't worry if you don't see these directories in your application as they will be created for you as you generate events and listeners using Artisan console commands.

Events serve as a great way to decouple various aspects of your application, as a single event can have multiple listeners that do not depend on each other. For example, you may wish to send a Slack notification to your user each time an order is shipped. 事件是解耦应用程序各个方面的好方法，因为单个事件可以有多个不相互依赖的监听器。 例如，您可能希望在每次订单发货时向用户发送 Slack 通知。 与其将订单处理代码与 Slack 通知代码耦合在一起，不如触发一个 `app\events\OrderShipped` 事件，监听器可以接收该事件并用于发送 Slack 通知。

## 注册事件和监听器

Goravel 应用程序中包含的 `app\providers\EventServiceProvider` 提供了一个方便的地方来注册应用程序的所有事件监听器。 该 `listen` 方法包含一个数组,其中包含所有事件(键)及其监听器(值)。 您可以根据应用程序的需要向此数组添加任意数量的事件。 例如，让我们添加一个
`OrderShipped` 事件： The `listen` method contains an array of all events (keys) and their listeners (values). You may add as many events to this array as your application requires. For example, let's add an `OrderShipped` event:

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

### 生成事件和监听器

您可以使用 `make:event` 和 `make:listener` Artisan 命令来生成单独的事件和监听器：

```go
go run . artisan make:event OrderShipped
go run . artisan make:event user/OrderShipped

go run . artisan make:listener SendShipmentNotification
go run . artisan make:listener user/SendShipmentNotification
```

## 定义事件

事件类本质上是一个数据容器，用于保存与事件相关的信息，`event` 的 `Handle` 方法传入并返回 `[]event.Arg` 结构，可用于处理数据。 处理后的数据随后将传递给所有关联的 `listeners`。 例如，假设有一个 `app\events\OrderShipped` 事件： The processed data will then be passed on to all associated `listeners`. For example, let's assume an `app\events\OrderShipped` event:

```go
package events

import "github.com/goravel/framework/contracts/event"

type OrderShipped struct {
}

func (receiver *OrderShipped) Handle(args []event.Arg) ([]event.Arg, error) {
  return args, nil
}
```

## 定义监听器

Next, let's take a look at the listener for our example event. 接下来，让我们看看我们示例事件的监听器。 事件监听器接收事件 `Handle` 方法返回的 `[]event.Arg`。 在 `Handle` 方法中，您可以执行任何必要的操作来响应事件： Within the `Handle` method, you may perform any actions necessary to respond to the event:

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

func (receiver *SendShipmentNotification) Queue(args ...any) event.Queue {
  return event.Queue{
    Enable:     false,
    Connection: "",
    Queue:      "",
  }
}

func (receiver *SendShipmentNotification) Handle(args ...any) error {
  return nil
}
```

### 停止事件的传播

Sometimes, you may wish to stop the propagation of an event to other listeners. 有时，您可能希望停止事件向其他监听器的传播。 您可以通过从监听器的 `Handle` 方法返回错误来实现这一点。

## 队列事件监听器

Queueing listeners can be beneficial if your listener is going to perform a slow task such as sending an email or making an HTTP request. Before using queued listeners, make sure to [configure your queue](queues.md) and start a queue worker on your server or local development environment.

```go
package listeners

...

func (receiver *SendShipmentNotification) Queue(args ...any) event.Queue {
  return event.Queue{
    Enable:     false,
    Connection: "",
    Queue:      "",
  }
}

func (receiver *SendShipmentNotification) Handle(args ...any) error {
  name := args[0]

  return nil
}
```

### 队列事件监听器和数据库事务

When queued listeners are dispatched within database transactions, the queue may process them before the database transaction has been committed. When this happens, any updates you have made to models or database records during the database transaction may not yet be reflected in the database. In addition, any models or database records created within the transaction may not exist in the database. If your listener depends on these models, unexpected errors can occur when the job that dispatches the queued listener is processed. At this time, the event needs to be placed outside the database transactions.

## 调度事件

我们可以通过 `facades.Event().Job().Dispatch()` 方法调度事件。

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
  err := facades.Event().Job(&event.OrderShipped{}, []event.Arg{
    {Type: "string", Value: "Goravel"},
    {Type: "int", Value: 1},
  }).Dispatch()
}
```

## `event.Arg.Type` 支持的类型

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
