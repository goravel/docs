# Task Scheduling

[[toc]]

## Introduction

In the past, you may have written a cron configuration entry for each task you needed to schedule on your server. However, this can quickly become a pain because your task schedule is no longer in source control and you must SSH into your server to view your existing cron entries or add additional entries.

Goravel's command scheduler offers a fresh approach to managing scheduled tasks on your server. The scheduler allows you to fluently and expressively define your command schedule within your Goravel application itself. When using the scheduler, only a single cron entry is needed on your server. Your task schedule is defined in the `app/console/kernel.go` file's schedule method.

## Defining Schedules

You may define all of your scheduled tasks in the schedule method of your application's `app\console\kernel.go` file. To get started, let's take a look at an example. In this example, we will schedule a closure to be called every day at midnight. Within the closure we will execute a database query to clear a table:

```
package console

import (
  "github.com/goravel/framework/contracts/console"
  "github.com/goravel/framework/schedule/support"
  "github.com/goravel/framework/support/facades"
  "goravel/app/models"
)

type Kernel struct {
}

func (kernel Kernel) Schedule() []*support.Event {
  return []*support.Event{
    facades.Schedule.Call(func() {
      facades.DB.Where("1 = 1").Delete(&models.User{})
    }).Daily(),
  }
}
```

### Scheduling Artisan Commands

In addition to scheduling closures, you may also schedule [Artisan commands](./Artisan%E5%91%BD%E4%BB%A4%E8%A1%8C.md). For example, you may use the `command` method to schedule an Artisan command using either the command's name or class.

```
package console

import (
  "github.com/goravel/framework/contracts/console"
  "github.com/goravel/framework/schedule/support"
  "github.com/goravel/framework/support/facades"
)

type Kernel struct {
}

func (kernel Kernel) Schedule() []*support.Event {
  return []*support.Event{
    facades.Schedule.Command("emails:send name").Daily(),
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

```
facades.Schedule.Command("emails:send name").EveryMinute().SkipIfStillRunning()
facades.Schedule.Command("emails:send name").EveryMinute().DelayIfStillRunning()
```

在此例中，若 `emails:send` Artisan 命令还未运行，那它将会每分钟执行一次。如果你的任务执行时间非常不确定，导致你无法准确预测任务的执行时间，那这两个方法会特别有用。

In this example, the `emails:send` Artisan command will be run every minute if it is not already running. The methods is especially useful if you have tasks that vary drastically in their execution time, preventing you from predicting exactly how long a given task will take.

## Running The Scheduler

Now that we have learned how to define scheduled tasks, let's discuss how to actually run them on our server.

Add `go facades.Schedule.Run()` to the root `main.go` file.

```
package main

import (
  "github.com/goravel/framework/support/facades"
  "goravel/bootstrap"
)

func main() {
  //This bootstraps the framework and gets it ready for use.
  bootstrap.Boot()

  //Start http server by facades.Route.
  go func() {
    if err := facades.Route.Run(facades.Config.GetString("app.host")); err != nil {
      facades.Log.Errorf("Route run error: %v", err)
    }
  }()

  //Start schedule by facades.Schedule
  go facades.Schedule.Run()

  select {}
}
```
