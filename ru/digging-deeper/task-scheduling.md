# Планирование задач

[[toc]]

## Введение

В прошлом, вы, возможно, создавали запись в файле cron для каждой задачи, которую нужно было запланировать на вашем сервере. Однако это может быстро стать неудобным, так как ваше расписание задач больше не будет находиться в контролируемом репозитории, и вы должны будете входить на сервер через SSH, чтобы просмотреть существующие записи cron или добавить новые.

Планировщик команд Goravel предлагает новый подход к управлению запланированными задачами на вашем сервере. Планировщик позволяет вам гибко и выразительно определить расписание команд прямо в вашем приложении Goravel. При использовании планировщика на вашем сервере будет достаточно только одной записи cron.

## Определение расписаний

Вы можете определить все свои запланированные задачи в методе `schedule` вашего файла `app\console\kernel.go`. Давайте начнем с примера. В этом примере мы запланируем вызов замыкания каждый день в полночь. Внутри замыкания мы выполним запрос к базе данных для очистки таблицы:

```go
package console

import (
  "github.com/goravel/framework/contracts/console"
  "github.com/goravel/framework/contracts/schedule"
  "github.com/goravel/framework/facades"

  "goravel/app/models"
)

type Kernel struct {
}

func (kernel Kernel) Schedule() []schedule.Event {
  return []schedule.Event{
    facades.Schedule().Call(func() {
      facades.Orm().Query().Where("1 = 1").Delete(&models.User{})
    }).Daily(),
  }
}
```

### Запланировка команд Artisan

Помимо запланировки замыканий, вы также можете запланировать [команды Artisan](./Artisan%E5%91%BD%E4%BB%A4%E8%A1%8C.md). Например, вы можете использовать метод `command` для запланировки команды Artisan, используя имя или класс команды.

```go
package console

import (
  "github.com/goravel/framework/contracts/console"
  "github.com/goravel/framework/contracts/schedule"
  "github.com/goravel/framework/facades"
)

type Kernel struct {
}

func (kernel *Kernel) Schedule() []schedule.Event {
  return []schedule.Event{
    facades.Schedule().Command("send:emails name").Daily(),
  }
}
```

### Варианты частоты планирования

Мы уже рассмотрели несколько примеров, как можно настроить задачу для запуска через определенные интервалы. Однако есть много других вариантов частоты планирования задач:

| Метод                     | Описание                                                |
| ------------------------ | ------------------------------------------------------- |
| `.Cron('* * * * *')`     | Запустить задачу по пользовательскому расписанию cron              |
| `.EveryMinute()`         | Запуск задачи каждую минуту                           |
| `.EveryTwoMinutes()`     | Запуск задачи каждые две минуты                      |
| `.EveryThreeMinutes()`   | Запуск задачи каждые три минуты                    |
| `.EveryFourMinutes()`    | Запуск задачи каждые четыре минуты                     |
| `.EveryFiveMinutes()`    | Запуск задачи каждые пять минут                     |
| `.EveryTenMinutes()`     | Запуск задачи каждые десять минут                      |
| `.EveryFifteenMinutes()` | Запуск задачи каждые пятнадцать минут                  |
| `.EveryThirtyMinutes()`  | Запуск задачи каждые тридцать минут                   |
| `.Hourly()`              | Запуск задачи каждый час                             |
| `.HourlyAt(17)`          | Запуск задачи каждый час в 17 минут после часа |
| `.EveryTwoHours()`       | Запуск задачи каждые два часа                        |
| `.EveryThreeHours()`     | Запуск задачи каждые три часа                      |
| `.EveryFourHours()`      | Запуск задачи каждые четыре часа                       |
| `.EverySixHours()`       | Запуск задачи каждые шесть часов                        |
| `.Daily()`               | Запуск задачи каждый день в полночь                  |
| `.DailyAt('13:00')`      | Запуск задачи каждый день в 13:00                     |

### Предотвращение повторения задач

По умолчанию запланированные задачи будут запускаться даже в том случае, если предыдущий экземпляр задачи еще выполняется. Чтобы предотвратить это, вы можете использовать следующие методы:

| Метод                     | Описание                   |
| ------------------------ | ---------------------- |
| `.SkipIfStillRunning()`  | Пропустить, если еще выполняется  |
| `.DelayIfStillRunning()` | Задержать, если еще выполняется |

```go
facades.Schedule().Command("send:emails name").EveryMinute().SkipIfStillRunning()
facades.Schedule().Command("send:emails name").EveryMinute().DelayIfStillRunning()
```

## Запуск планировщика

Теперь, когда мы узнали, как определить запланированные задачи, давайте рассмотрим, как их фактически запустить на сервере.

Добавьте `go facades.Schedule().Run()` в корневой файл `main.go`.

```go
package main

import (
  "github.com/goravel/framework/facades"

  "goravel/bootstrap"
)

func main() {
  //This bootstraps the framework and gets it ready for use.
  bootstrap.Boot()

  //Start

 schedule by facades.Schedule
  go facades.Schedule().Run()

  select {}
}
```

<CommentService/>