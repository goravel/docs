# 事件

[[toc]]

## 概述

Goravel 的事件系統提供了一個簡單的觀察者模式的實現，允許你能夠訂閱和監聽在你的應用中的發生的各種事件。 事件類一般來說存儲在 `app/events` 目錄，而其監聽者則存儲在 `app/listeners`。 不要擔心在你的應用中沒有看到這兩個目錄，因為通過 Artisan 命令行來創建事件和監聽者的時候目錄會同時被創建。

事件提供了一種很好的方式來解耦應用的各個方面，因為一個事件可以有多個彼此不依賴的監聽者。 例如，你可能希望每當訂單發貨時就向用戶發送 Slack 通知。 而不是將你的訂單處理代碼與 Slack 通知代碼耦合在一起，你可以引發一個 `app\events\OrderShipped` 事件，這個事件可以被監聽者接收並用來發送 Slack 通知。

## 註冊事件與監聽者

在你 Goravel 應用的 `app\providers\EventServiceProvider` 中提供了一個方便的地方來註冊所有的事件監聽者。 `listen` 方法包含所有事件（鍵）和其監聽者（值）的數組。 你可以根據應用的需要向這個數組中添加任意多的事件。 例如，讓我們添加一個 `OrderShipped` 事件：

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

### 生成事件與監聽者

你可以使用 `make:event` 以及 `make:listener` Artisan 命令來生成單個事件和監聽者：

```go
go run . artisan make:event PodcastProcessed
go run . artisan make:event user/PodcastProcessed

go run . artisan make:listener SendPodcastNotification
go run . artisan make:listener user/SendPodcastNotification
```

## 定義事件

事件類本質上是一個數據容器，它保存與事件相關的信息，`event` 的 `Handle` 方法傳入並返回 `[]event.Arg` 結構，可以用於處理數據。 處理過的數據將然後傳遞給所有關聯的 `listeners`。 例如，讓我們假設一個 `app\events\OrderShipped` 事件：

```go
package events

import "github.com/goravel/framework/contracts/event"

type OrderShipped struct {
}

func (receiver *OrderShipped) Handle(args []event.Arg) ([]event.Arg, error) {
  return args, nil
}
```

## 定義監聽器

接下來，讓我們看一下我們的示例事件的監聽器。 事件監聽器在其 `Handle` 方法中接收事件 `Handle` 方法返回的 `[]event.Arg`。 在 `Handle` 方法中，你可以執行任何必要的操作來回應事件：

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

### 停止事件的傳播

有時候，你可能希望停止將事件傳播到其他監聽者。 你可以通過從監聽器的 `Handle` 方法返回一個錯誤來做到這一點。

## 排隊事件監聽器

排隊監聽器是有益的，如果你的監聽器將執行緩慢的任務，比如發送電子郵件或發出 HTTP 請求。 在使用排隊監聽器之前，確保先[配置你的隊列](queues.md)並在你的伺服器或本地開發環境中啟動隊列工作者。

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

### 排隊事件監聽器與數據庫事務

當排隊監聽器在數據庫事務內部被調度時，隊列可能在數據庫事務被提交之前就處理它們。 當這種情況發生時，你在數據庫事務期間對模型或數據庫記錄所做的任何更新可能尚未反映在數據庫中。 另外，在事務內部創建的任何模型或數據庫記錄可能在數據庫中不存在。 如果你的監聽器依賴於這些模型，當發送排隊監聽器的任務被處理時，可能會發生意外錯誤。 此時，事件需要置於數據庫事務之外。

## 調度事件

我們可以通過 `facades.Event().Job().Dispatch()` 方法來調度事件。

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
  err := facades.Event().Job(&events.OrderShipped{}, []event.Arg{
    {Type: "string", Value: "Goravel"},
    {Type: "int", Value: 1},
  }).Dispatch()
}
```

## `event.Arg.Type` 支持的類型

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
