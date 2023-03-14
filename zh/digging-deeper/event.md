# 事件系统

[[toc]]

## 简介

Goravel 的事件系统提供了一个简单的观察者模式的实现，允许你能够订阅和监听在你的应用中的发生的各种事件。事件类一般来说存储在 `app/events` 目录，监听者的类存储在 `app/listeners` 目录。不要担心在你的应用中没有看到这两个目录，因为通过 Artisan 命令行来创建事件和监听者的时候目录会同时被创建。

事件系统可以作为一个非常棒的方式来解耦你的系统的方方面面，因为一个事件可以有多个完全不相关的监听者。例如，你希望每当有订单发出的时候都给你发送一个 Slack 通知。你大可不必将你的处理订单的代码和发送 slack 消息的代码放在一起，你只需要触发一个 `app\events\OrderShipped` 事件，然后事件监听者可以收到这个事件然后发送 slack 通知。

### 生成事件和监听器

你可以使用 `make:event` 以及 `make:listener` 用于生成单个事件和监听器的 `Artisan` 命令：

```go
go run . artisan make:event OrderShipped

go run . artisan make:listener SendShipmentNotification
```

## 注册事件和监听器

在系统的服务提供者 `app\providers\EventServiceProvider` 中提供了一个简单的方式来注册你所有的事件监听者。方法 `listener` 包含所有的事件 (作为键) 和对应的监听器 (值)。你可以添加任意多系统需要的监听器在这个数组中，让我们添加一个 `OrderShipped` 事件：

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

## 定义事件

事件类本质上是一个数据容器，它保存与事件相关的信息，`event` 的 `Handle` 方法统一传入与返回 `[]event.Arg` 数据结构，你可以在这里进行数据加工，加工后的数据将传入所有关联的 `listeners` 中。例如，让我们假设一个 `app\events\OrderShipped` 事件：

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

接下来，让我们看一下示例事件的侦听器。事件监听器在其 `Handle` 方法中接收事件 `Handle` 方法返回的 `[]event.Arg`。在 `Handle` 方法中，你可以执行任何必要的操作来响应事件：

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

### 停止事件传播

有时，你可能希望停止将事件传播到其他侦听器。你可以通过从监听器的 `Handle` 方法返回 `error` 来做到这一点。

## 事件监听器队列

如果侦听器执行缓慢的任务如发送电子邮件或发出 HTTP 请求，你可以将任务丢给队列处理。在开始使用队列监听器之前，请确保在你的服务器或者本地开发环境中 [配置队列](%E9%98%9F%E5%88%97.md) 并启动一个队列监听器。然后在 `listener` 的 `Queue` 方法中定义是否启用队列，及使用的链接与队列。

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

### 排队事件监听器和数据库事务

当在数据库事务中调度排队的监听器时，它们可能会在提交数据库事务之前由队列进行处理。发生这种情况时，你在数据库事务期间对模型或数据库记录所做的任何更新可能尚未反映在数据库中。此外，在事务中创建的任何模型或数据库记录可能不存在于数据库中。如果监听器依赖于这些模型，则在处理分派排队监听器的作业时，可能会发生意外错误。这时需要将事件置于数据库事务之外。

## 调度事件

可以使用 `facades.Event.Job().Dispatch()` 方法进行事件调度。

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
  err := facades.Event.Job(&event.OrderShipped{}, []event.Arg{
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
