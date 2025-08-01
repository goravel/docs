# 事件系统

[[toc]]

## 简介

Goravel 的事件系统提供了一个简单的观察者模式的实现，允许你能够订阅和监听在你的应用中的发生的各种事件。事件类一般来说存储在 `app/events` 目录，监听者的类存储在 `app/listeners` 目录。不要担心在你的应用中没有看到这两个目录，因为通过 Artisan 命令行来创建事件和监听者的时候目录会同时被创建。 Event classes are typically stored in the `app/events` directory, while their listeners are stored in `app/listeners`. Don't worry if you don't see these directories in your application as they will be created for you as you generate events and listeners using Artisan console commands.

Events serve as a great way to decouple various aspects of your application, as a single event can have multiple listeners that do not depend on each other. For example, you may wish to send a Slack notification to your user each time an order is shipped. 事件系统可以作为一个非常棒的方式来解耦你的系统的方方面面，因为一个事件可以有多个完全不相关的监听者。例如，你希望每当有订单发出的时候都给你发送一个 Slack 通知。你大可不必将你的处理订单的代码和发送 slack 消息的代码放在一起，你只需要触发一个 `app\events\OrderShipped` 事件，然后事件监听者可以收到这个事件然后发送 slack 通知。

## 生成事件和监听器

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

### 注册事件和监听器

你可以使用 `make:event` 以及 `make:listener` 用于生成单个事件和监听器的 `Artisan` 命令：

```go
go run . artisan make:event OrderShipped
go run . artisan make:event user/OrderShipped

go run . artisan make:listener SendShipmentNotification
go run . artisan make:listener user/SendShipmentNotification
```

## 定义事件

事件类本质上是一个数据容器，它保存与事件相关的信息，`event` 的 `Handle` 方法统一传入与返回 `[]event.Arg` 数据结构，你可以在这里进行数据加工，加工后的数据将传入所有关联的 `listeners` 中。例如，让我们假设一个 `app\events\OrderShipped` 事件： The processed data will then be passed on to all associated `listeners`. For example, let's assume an `app\events\OrderShipped` event:

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

Next, let's take a look at the listener for our example event. 接下来，让我们看一下示例事件的侦听器。事件监听器在其 `Handle` 方法中接收事件 `Handle` 方法返回的 `[]event.Arg`。在 `Handle` 方法中，你可以执行任何必要的操作来响应事件： Within the `Handle` method, you may perform any actions necessary to respond to the event:

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

### 停止事件传播

Sometimes, you may wish to stop the propagation of an event to other listeners. 有时，你可能希望停止将事件传播到其他侦听器。你可以通过从监听器的 `Handle` 方法返回 `error` 来做到这一点。

## 事件监听器队列

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

### 排队事件监听器和数据库事务

When queued listeners are dispatched within database transactions, the queue may process them before the database transaction has been committed. When this happens, any updates you have made to models or database records during the database transaction may not yet be reflected in the database. In addition, any models or database records created within the transaction may not exist in the database. If your listener depends on these models, unexpected errors can occur when the job that dispatches the queued listener is processed. At this time, the event needs to be placed outside the database transactions.

## 调度事件

可以使用 `facades.Event().Job().Dispatch()` 方法进行事件调度。

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
