# Task Scheduling

[[toc]]

## Introduction

In the past, you might need to create a cron configuration entry for each task that needed scheduling on your server. However, this approach can quickly become a pain as your task schedule is not in source control, and you have to SSH into your server to view or add/edit cron entries. 

Goravel's command scheduler offers a fresh approach to managing scheduled tasks on your server. With the scheduler, you can easily and clearly define your command schedule within your Goravel application. Using the scheduler, you only need to create a single cron entry on your server.

## Defining Schedules

To schedule tasks for your application, you can define them in the `Schedule` method in `app\console\kernel.go`. Let's consider an example to understand this better. In this case, we want to schedule a closure that will run every day at midnight. Inside this closure, we will execute a database query to clear a table:

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

In addition to scheduling closures, you can also schedule [Artisan commands](./artisan-console.md). For example, you may use the `Command` method to schedule an Artisan command using either the command's name or class.

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

### Logging Level

When `app.debug` is `true`, the console will print all logs. Otherwise, only `error` level logs will be printed.

### Schedule Frequency Options

We've already seen a few examples of how you may configure a task to run at specified intervals. However, there are many more task schedule frequencies avaibable to assign to tasks:

| 方法                     | 描述                                                |
| ------------------------ | --------------------------------------------------- |
| `.Cron("* * * * *")`     | Run the task on a custom cron schedule              |
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
| `.DailyAt("13:00")`      | Run the task every day at 13:00                     |

### Preventing Task Overlaps

By default, scheduled tasks will continue to run even if a previous instance is still running. To prevent this, use the following methods:

| 方法                     | 描述                   |
| ------------------------ | ---------------------- |
| `.SkipIfStillRunning()`  | Skip if still running  |
| `.DelayIfStillRunning()` | Delay if still running |

```go
facades.Schedule().Command("send:emails name").EveryMinute().SkipIfStillRunning()
facades.Schedule().Command("send:emails name").EveryMinute().DelayIfStillRunning()
```

### Running Tasks On One Server

> To utilize this feature, your application must be using the memcached, dynamodb, or redis cache driver as the default cache driver. In addition, all servers must be communicating with the same central cache server.

If your application's scheduler runs on multiple servers, you can ensure that a scheduled job is executed on only one of them. For example, let's say you have a scheduled task that generates a new report every Friday night. If the task scheduler runs on three worker servers, the scheduled task will run on all three servers and create the report three times. This is not ideal! 

To prevent this, use the `OnOneServer` method when defining the scheduled task, which will make sure that the task runs on only one server. The first server to receive the task will secure an atomic lock on the job, preventing other servers from executing the same task at the same time:

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
  // This bootstraps the framework and gets it ready for use.
  bootstrap.Boot()

  // Start schedule by facades.Schedule
  go facades.Schedule().Run()

  select {}
}
```

## Stopping The Scheduler

You can call the `Stop` method to gracefully shut down the scheduler. This method will wait for all tasks to complete before shutting down.

```go
// main.go
bootstrap.Boot()

// Create a channel to listen for OS signals
quit := make(chan os.Signal)
signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

// Start schedule by facades.Schedule
go facades.Schedule().Run()

// Listen for the OS signal
go func() {
  <-quit
  if err := facades.Schedule().Stop(); err != nil {
    facades.Log().Errorf("Schedule Stop error: %v", err)
  }

  os.Exit(0)
}()

select {}
```

<CommentService/>