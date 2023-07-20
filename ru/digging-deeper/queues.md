# Очереди

[[toc]]

## Введение

При разработке веб-приложения у вас могут возникать задачи, такие как разбор и сохранение загруженного CSV-файла, которые занимают слишком много времени во время обработки веб-запроса. Goravel позволяет легко создавать задачи в очереди, которые могут быть обработаны в фоновом режиме. Перемещая тяжелые задачи в очередь, ваше приложение может отвечать на веб-запросы с невероятной скоростью и обеспечивать более качественный опыт пользователей. Для реализации этих функций используется `facades.Queue()`.

Опции конфигурации очереди Goravel хранятся в файле конфигурации `config/queue.go` вашего приложения. Goravel поддерживает два драйвера: `redis` и `sync`.

### Соединения и очереди

Прежде чем приступить к работе с очередями Goravel, важно понять разницу между "соединениями" и "очередями". В файле конфигурации `config/queue.go` есть массив конфигурации `connections`. Этот параметр определяет соединения с фоновыми службами очереди, такими как Redis. Однако каждое соединение с очередью может содержать несколько "очередей", которые можно рассматривать как разные стеки или группы задач в очереди.

Обратите внимание, что каждый пример конфигурации соединения в файле конфигурации очереди содержит атрибут `queue`. Это очередь по умолчанию, на которую будут отправляться задачи, когда они будут отправлены в соответствующее соединение. Другими словами, если вы отправляете задачу, не указывая явно, в какую очередь ее следует отправить, она будет помещена в очередь, определенную в атрибуте `queue` конфигурации соединения:

```go
// Эта задача отправляется в очередь по умолчанию текущего соединения
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{
  {Type: "int", Value: 1}
}).Dispatch()

// Эта задача отправляется в очередь "emails" текущего соединения
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{
  {Type: "int", Value: 1}
}).OnQueue("emails").Dispatch()
```

## Создание задач

### Генерация классов задач

По умолчанию все задачи для вашего приложения хранятся в каталоге `app/jobs`. Если каталог `app/jobs` не существует, он будет создан при выполнении команды Artisan `make:job`:

```
go run . artisan make:job ProcessPodcast
go run . artisan make:job user/ProcessPodcast
```

### Структура класса

Классы задач очень просты и содержат два метода: `Signature`, `Handle`. `Signature` - это уникальный идентификатор задачи, `Handle` будет вызван при обработке задачи очереди, а `[]queue.Arg{}`, переданные при вызове задачи, будут переданы в `Handle`:

```go
package jobs

type ProcessPodcast struct {
}

//Signature The name and signature of the job.
func (receiver *ProcessPodcast) Signature() string {
  return "process_podcast"
}

//Handle Execute the job.
func (receiver *ProcessPodcast) Handle(args ...interface{}) error {
  return nil
}
```

### Регистрация задачи

После создания задачи необходимо зарегистрировать ее в `app/provides/queue_service_provider.go`, чтобы она могла быть вызвана правильно.

```go
func (receiver *QueueServiceProvider) Jobs() []queue.Job {
  return []queue.Job{
    &jobs.Test{},
  }
}
```

## Запуск сервера очереди

Запустите сервер очереди в `main.go` в корневом каталоге.

```go
package main

import (
  "github.com/goravel/framework/facades"

  "goravel/bootstrap"
)

func main() {
  // This bootstraps the framework and gets it ready for use.
  bootstrap.Boot()

  // Запуск сервера очереди с помощью facades.Queue().
  go func() {
    if err := facades.Queue().Worker(nil).Run(); err != nil {
      facades.Log().Errorf("Queue run error: %v", err)
    }
  }()

  select {}
}
```

В метод `facades.Queue().Worker` можно передать разные параметры, вы можете отслеживать несколько очередей, запуская несколько `facades.Queue().Worker`.

```go
// Без параметров, использует настройки из `config/queue.go`, и количество одновременных операций равно 1
go func() {
  if err := facades.Queue().Worker(nil).Run(); err != nil {
    facades.Log().Errorf("Queue run error: %v", err)
  }
}()

// Отслеживание очереди обработки для связи с Redis, количество одновременных операций равно 10
go func() {
  if err := facades.Queue().Worker(&queue.Args{
    Connection: "redis",
    Queue: "processing",
    Concurrent: 10,
  }).Run(); err != nil {
    facades.Log().Errorf("Queue run error: %v", err)
  }
}()
```

## Отправка задач

После написания класса задачи вы можете вызвать его, используя метод `dispatch

`:

```go
package controllers

import (
  "github.com/goravel/framework/contracts/queue"
  "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/facades"

  "goravel/app/jobs"
)

type UserController struct {
}

func (r *UserController) Show(ctx http.Context) {
  err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).Dispatch()
  if err != nil {
    // do something
  }
}
```

### Синхронная отправка

Если вы хотите немедленно отправить задачу (синхронно), вы можете использовать метод `dispatchSync`. При использовании этого метода задача не будет поставлена в очередь и будет выполняться немедленно в текущем процессе:

```go
package controllers

import (
  "github.com/goravel/framework/contracts/queue"
  "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/facades"

  "goravel/app/jobs"
)

type UserController struct {
}

func (r *UserController) Show(ctx http.Context) {
  err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).DispatchSync()
  if err != nil {
    // do something
  }
}
```

### Цепочка задач

Цепочка задач позволяет указать список задач в очереди, которые должны выполняться последовательно. Если одна задача из последовательности завершается с ошибкой, остальные задачи не будут запущены. Чтобы выполнить цепочку задач в очереди, вы можете использовать метод `chain`, предоставляемый `facades.Queue()`:

```go
err := facades.Queue().Chain([]queue.Jobs{
  {
    Job: &jobs.Test{},
    Args: []queue.Arg{
      {Type: "int", Value: 1},
    },
  },
  {
    Job: &jobs.Test1{},
    Args: []queue.Arg{
      {Type: "int", Value: 2},
    },
  },
}).Dispatch()
```

### Отложенная отправка

Если вы хотите указать, что задача не должна быть немедленно доступна для обработки воркером очереди, вы можете использовать метод `Delay` при отправке задачи. Например, давайте укажем, что задача должна быть доступна для обработки только через 10 минут после ее отправки:

```go
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).Delay(time.Now().Add(100*time.Second)).Dispatch()
```

### Настройка очереди и соединения

#### Отправка в определенную очередь

Размещая задачи в разные очереди, вы можете "категоризировать" ваши задачи в очереди и даже устанавливать приоритет, назначая разное количество воркеров для различных очередей.

```go
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).OnQueue("processing").Dispatch()
```

#### Отправка в определенное соединение

Если ваше приложение взаимодействует с несколькими соединениями с очередью, вы можете использовать метод `onConnection` для указания соединения, в которое будет отправлена задача.

```go
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).OnConnection("sync").Dispatch()
```

Вы можете объединить методы `onConnection` и `onQueue`, чтобы указать соединение и очередь для задачи:

```go
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).OnConnection("sync").OnQueue("processing").Dispatch()
```

## Поддерживаемые типы `queue.Arg.Type`

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