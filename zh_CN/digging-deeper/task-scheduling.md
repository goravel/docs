# 任务调度

[[toc]]

## 简介

In the past, you might need to create a cron configuration entry for each task that needed scheduling on your server. 过去，你可能需要在服务器上为每一个调度任务去创建 Cron 条目。因为这些任务的调度不是通过代码控制的，你要查看或新增任务调度都需要通过 SSH 远程登录到服务器上去操作，所以这种方式很快会让人变得痛苦不堪。

Goravel's command scheduler offers a fresh approach to managing scheduled tasks on your server. With the scheduler, you can easily and clearly define your command schedule within your Goravel application. Using the scheduler, you only need to create a single cron entry on your server.

## 定义调度

你可以在 `app\console\kernel.go` 的 `Schedule` 方法中定义所有的调度任务。在开始之前，我们来看一个例子：我们计划每天午夜执行一个 `闭包`，这个 `闭包` 会执行一次数据库语句去清空一张表： Let's consider an example to understand this better. In this case, we want to schedule a closure that will run every day at midnight. Inside this closure, we will execute a database query to clear a table:

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

### Artisan 命令调度

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

### 日志级别

当 `app.debug` 为 `true` 时，控制台将打印所有日志；否则，只打印 `error` 级别日志。 Otherwise, only `error` level logs will be printed.

### 调度频率选项

我们已经看到了几个如何设置任务在指定时间间隔运行的例子。不仅如此，你还有更多的任务调度频率可选： However, there are many more task schedule frequencies avaibable to assign to tasks:

| 方法                       | 描述                              |
| ------------------------ | ------------------------------- |
| `.Cron("* * * * *")`     | 自定义 Crone 计划执行任务（分钟）            |
| `.Cron("* * * * * *")`   | 自定义 Crone 计划执行任务（秒）             |
| `.EverySecond()`         | 每秒执行一次任务                        |
| `.EveryTwoSeconds()`     | 每两秒执行一次任务                       |
| `.EveryFiveSeconds()`    | 每五秒执行一次任务                       |
| `.EveryTenSeconds()`     | 每十秒执行一次任务                       |
| `.EveryFifteenSeconds()` | 每十五秒执行一次任务                      |
| `.EveryTwentySeconds()`  | 每二十秒执行一次任务                      |
| `.EveryThirtySeconds()`  | 每三十秒执行一次任务                      |
| `.EveryMinute()`         | 每分钟执行一次任务                       |
| `.EveryTwoMinutes()`     | 每两分钟执行一次任务                      |
| `.EveryThreeMinutes()`   | 每三分钟执行一次任务                      |
| `.EveryFourMinutes()`    | 每四分钟执行一次任务                      |
| `.EveryFiveMinutes()`    | 每五分钟执行一次任务                      |
| `.EveryTenMinutes()`     | 每十分钟执行一次任务                      |
| `.EveryFifteenMinutes()` | 每十五分钟执行一次任务                     |
| `.EveryThirtyMinutes()`  | 每三十分钟执行一次任务                     |
| `.Hourly()`              | 每小时执行一次任务                       |
| `.HourlyAt(17)`          | 每小时第十七分钟时执行一次任务                 |
| `.EveryTwoHours()`       | 每两小时执行一次任务                      |
| `.EveryThreeHours()`     | 每三小时执行一次任务                      |
| `.EveryFourHours()`      | 每四小时执行一次任务                      |
| `.EverySixHours()`       | 每六小时执行一次任务                      |
| `.Daily()`               | 每天 00:00 执行一次任务 |
| `.DailyAt("13:00")`      | 每天 13:00 执行一次任务 |
| `.Days(1, 3, 5)`         | 每周一、周三、周五执行一次任务                 |
| `.Weekdays()`            | 每周一至周五执行一次任务                    |
| `.Weekends()`            | 每周六、周日执行一次任务                    |
| `.Mondays()`             | 每周一执行一次任务                       |
| `.Tuesdays()`            | 每周二执行一次任务                       |
| `.Wednesdays()`          | 每周三执行一次任务                       |
| `.Thursdays()`           | 每周四执行一次任务                       |
| `.Fridays()`             | 每周五执行一次任务                       |
| `.Saturdays()`           | 每周六执行一次任务                       |
| `.Sundays()`             | 每周日执行一次任务                       |
| `.Weekly()`              | 每周执行一次任务                        |
| `.Monthly()`             | 每月执行一次任务                        |
| `.Quarterly()`           | 每季度执行一次任务                       |
| `.Yearly()`              | 每年执行一次任务                        |

### 避免任务重复

默认情况下，即使之前的任务实例还在执行，调度内的任务也会执行。为避免这种情况的发生，你可以使用 `SkipIfStillRunning` 或 `DelayIfStillRunning` 方法： To prevent this, use the following methods:

| 方法                       | 描述        |
| ------------------------ | --------- |
| `.SkipIfStillRunning()`  | 如果仍在运行则跳过 |
| `.DelayIfStillRunning()` | 如果仍在运行则延迟 |

```go
facades.Schedule().Command("send:emails name").EveryMinute().SkipIfStillRunning()
facades.Schedule().Command("send:emails name").EveryMinute().DelayIfStillRunning()
```

### 任务只运行在一台服务器上

> **注意**
> 要使用此功能，你的应用程序必须使用 memcached, dynamodb, 或 redis 缓存驱动程序作为应用程序的默认缓存驱动程序。此外，所有服务器必须和同一个中央缓存服务器通信。 In addition, all servers must be communicating with the same central cache server.

If your application's scheduler runs on multiple servers, you can ensure that a scheduled job is executed on only one of them. For example, let's say you have a scheduled task that generates a new report every Friday night. If the task scheduler runs on three worker servers, the scheduled task will run on all three servers and create the report three times. This is not ideal!

To prevent this, use the `OnOneServer` method when defining the scheduled task, which will make sure that the task runs on only one server. 要指示任务应仅在一台服务器上运行，请在定义计划任务时使用 `OnOneServer` 方法。第一台获取到该任务的服务器会给任务上一把原子锁以阻止其他服务器同时运行该任务:

```go
facades.Schedule().Command("report:generate").Daily().OnOneServer()
```

如果你使用闭包来定义单服务器作业，则必须为他们定义一个名字：

```go
facades.Schedule().Call(func() {
  fmt.Println("goravel")
}).Daily().OnOneServer().Name("goravel")
```

## 运行调度程序

现在，我们已经学会了如何定义计划任务，接下来让我们讨论如何真正在服务器上运行它们。

在根目录 `main.go` 文件中增加 `go facades.Schedule().Run()`。

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

也可以使用 `schedule:run` 命令手动运行任务：

```shell
./artisan schedule:run
```

## 关闭调度程序

你可以调用 `Shutdown` 方法优雅的关闭调度程序，该方法将会等待所有任务处理完毕后再执行关闭操作。 This method will wait for all tasks to complete before shutting down.

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
  if err := facades.Schedule().Shutdown(); err != nil {
    facades.Log().Errorf("Schedule Shutdown error: %v", err)
  }

  os.Exit(0)
}()

select {}
```

## 查看所有任务

你可以使用 `schedule:list` 命令查看所有任务：

```shell
./artisan schedule:list
```
