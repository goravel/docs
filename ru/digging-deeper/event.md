# События (Events)

[[toc]]

## Введение

События (Events) в Goravel предоставляют простую реализацию паттерна "наблюдатель" (observer pattern), позволяя вам подписываться и прослушивать различные события, которые происходят в вашем приложении. Классы событий обычно хранятся в директории `app/events`, а их слушатели - в директории `app/listeners`. Если вы не видите этих директорий в своем приложении, не волнуйтесь, они будут созданы для вас автоматически при создании событий и слушателей с помощью команд консоли Artisan.

События отлично подходят для разделения различных аспектов вашего приложения, так как одно событие может иметь несколько слушателей, которые не зависят друг от друга. Например, вы можете желать отправлять уведомление в Slack каждый раз, когда заказ был отправлен. Вместо связывания вашего кода обработки заказов с кодом отправки уведомлений в Slack, вы можете вызвать событие `app\events\OrderShipped`, на которое слушатель может подписаться и использовать его для отправки уведомления в Slack.

## Регистрация событий и слушателей

Поставщик служб событий `app\providers\EventServiceProvider`, входящий в состав вашего приложения Goravel, предоставляет удобное место для регистрации всех слушателей событий вашего приложения. Метод `listen` содержит массив всех событий (ключей) и их слушателей (значений). Вы можете добавлять в этот массив столько событий, сколько необходимо для вашего приложения. Например, давайте добавим событие `OrderShipped`:

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

### Создание событий и слушателей

Вы можете использовать команды консоли Artisan `make:event` и `make:listener` для создания отдельных событий и слушателей:

```go
go run . artisan make:event PodcastProcessed
go run . artisan make:event user/PodcastProcessed

go run . artisan make:listener SendPodcastNotification
go run . artisan make:listener user/SendPodcastNotification
```

## Определение событий

Класс события является контейнером данных, который содержит информацию о событии. Метод `Handle` события `event` принимает и возвращает структуру `[]event.Arg`, в которой вы можете обрабатывать данные. Обработанные данные будут переданы всем связанным слушателям. Например, давайте предположим, что у нас есть событие `app\events\OrderShipped`:

```go
package events

import "github.com/goravel/framework/contracts/event"

type OrderShipped struct {
}

func (receiver *OrderShipped) Handle(args []event.Arg) ([]event.Arg, error) {
  return args, nil
}
```

## Определение слушателей

Теперь давайте рассмотрим слушателя для нашего события. Слушатели событий получают `[]event.Arg`, которые возвращает метод `Handle` события. Внутри метода `Handle` вы можете выполнять любые действия, необходимые для ответа на событие:

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

### Остановка распространения события

Иногда вы можете захотеть остановить распространение события на другие слушатели. Для этого вы можете вернуть ошибку из метода `Handle` вашего слушателя.

## Очередные слушатели событий

Очередные слушатели могут быть полезны, если ваш слушатель будет выполнять медленную задачу, такую как отправка электронной почты или выполнение HTTP-запроса. Прежде чем использовать очередных слушателей, убедитесь, что [вы настроили вашу очередь](queues.md) и запустили очередной воркер на вашем сервере или локальной среде разработки.

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

### Очередные слушатели событий и транзакции базы данных

Когда очередные слушатели отправляются внутри транзакций базы данных, они могут быть обработаны очередью до того, как транзакция базы данных была подтверждена. Когда это проис

ходит, любые обновления, которые вы внесли в модели или записи базы данных во время транзакции, могут еще не отражаться в базе данных. Кроме того, любые созданные модели или записи базы данных внутри транзакции могут не существовать в базе данных. Если ваш слушатель зависит от этих моделей, могут возникать неожиданные ошибки при обработке задания, которое отправляет очередной слушатель. В этом случае событие нужно поместить за пределы транзакций базы данных.

## Диспетчеризация событий

Мы можем диспетчеризовать события с помощью метода `facades.Event().Job().Dispatch()`.

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

## Поддерживаемые типы `event.Arg.Type`

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