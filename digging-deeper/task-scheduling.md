# Task Scheduling

[[toc]]

## Introduction

In the past, you may have written a cron configuration entry for each task you needed to schedule on your server. However, this can quickly become a pain because your task schedule is no longer in source control and you must SSH into your server to view your existing cron entries or add additional entries.

Goravel's command scheduler offers a fresh approach to managing scheduled tasks on your server. The scheduler allows you to fluently and expressively define your command schedule within your Goravel application itself. When using the scheduler, only a single cron entry is needed on your server.

## Defining Schedules

You may define all of your scheduled tasks in the schedule method of your application's `app\console\kernel.go` file. To get started, let's take a look at an example. In this example, we will schedule a closure to be called every day at midnight. Within the closure we will execute a database query to clear a table:

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

### Scheduling Artisan Commands

In addition to scheduling closures, you can also schedule [Artisan commands](./Artisan%E5%91%BD%E4%BB%A4%E8%A1%8C.md). For example, you may use the `command` method to schedule an Artisan command using either the command's name or class.

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

### Schedule Frequency Options

We've already seen a few examples of how you may configure a task to run at specified intervals. However, there are many more task schedule frequencies that you may assign to a task:

| 方法                     | 描述                                                |
| ------------------------ | --------------------------------------------------- |
| `.Cron('* * * * *')`     | Run the task on a custom cron schedule              |
| `.EveryMinute()`         | Run the task every minute                           |
| `.EveryTwoMinutes()`     | Run the task every two minutes                      |
| `.EveryThreeMinutes()`   | Run the task every three minutes                    |
| `.EveryFourMinutes()`    | Run the task every four minutes                     |
| `.EveryFiveMinutes()`    | Run the task every five minutes                     |
| `.EveryTenMinutes()`     | Run the task every ten minutes                      |
| `.EveryFifteenMinutes()` | Run the task every fifteen minutes                  |
| `.EveryThirtyMinutes()`  | Run the task every thirty minutes                   |
| `.Hourly()`              | Run the task every hour                             |
| `.HourlyAt(17)`          | Run the task every hour at 17 minutes past the hour |
| `.EveryTwoHours()`       | Run the task every two hours                        |
| `.EveryThreeHours()`     | Run the task every three hours                      |
| `.EveryFourHours()`      | Run the task every four hours                       |
| `.EverySixHours()`       | Run the task every six hours                        |
| `.Daily()`               | Run the task every day at midnight                  |
| `.DailyAt('13:00')`      | Run the task every day at 13:00                     |

### Preventing Task Overlaps

By default, scheduled tasks will be run even if the previous instance of the task is still running. To prevent this, you may use the following methods:

| 方法                     | 描述                   |
| ------------------------ | ---------------------- |
| `.SkipIfStillRunning()`  | Skip if still running  |
| `.DelayIfStillRunning()` | Delay if still running |

```go
facades.Schedule().Command("send:emails name").EveryMinute().SkipIfStillRunning()
facades.Schedule().Command("send:emails name").EveryMinute().DelayIfStillRunning()
```

### Running Tasks On One Server

> To utilize this feature, your application must be using the memcached, dynamodb, or redis cache driver as your application's default cache driver. In addition, all servers must be communicating with the same central cache server.

If your application's scheduler is running on multiple servers, you may limit a scheduled job to only execute on a single server. For instance, assume you have a scheduled task that generates a new report every Friday night. If the task scheduler is running on three worker servers, the scheduled task will run on all three servers and generate the report three times. Not good!

To indicate that the task should run on only one server, use the `OnOneServer` method when defining the scheduled task. The first server to obtain the task will secure an atomic lock on the job to prevent other servers from running the same task at the same time:

```go
facades.Schedule().Command("report:generate").Daily().OnOneServer()
```

Scheduled closures must be assigned a name if they are intended to be run on one server:

```go
facades.Schedule().Call(func() {
  fmt.Println("goravel")
}).Daily().OnOneServer().Name("goravel")
```

## Running The Scheduler

Now that we have learned how to define scheduled tasks, let's discuss how to actually run them on our server.

Add `go facades.Schedule().Run()` to the root `main.go` file.

```go
package main

import (
  "github.com/goravel/framework/facades"

  "goravel/bootstrap"
)

func main() {
  //This bootstraps the framework and gets it ready for use.
  bootstrap.Boot()

  //Start schedule by facades.Schedule
  go facades.Schedule().Run()

  select {}
}
```

<CommentService/>