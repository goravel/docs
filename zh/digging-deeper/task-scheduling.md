# 任务调度

[[toc]]

## 介绍

过去，你可能需要在服务器上为每一个调度任务去创建 Cron 条目。因为这些任务的调度不是通过代码控制的，你要查看或新增任务调度都需要通过 SSH 远程登录到服务器上去操作，所以这种方式很快会让人变得痛苦不堪。

Goravel 的命令行调度器允许你在 Goravel 中清晰明了地定义命令调度。在使用这个任务调度器时，你只需要在你的服务器上创建单个 Cron 入口。

## 定义调度

你可以在 `app\console\kernel.go` 的 `Schedule` 方法中定义所有的调度任务。在开始之前，我们来看一个例子：我们计划每天午夜执行一个 `闭包`，这个 `闭包` 会执行一次数据库语句去清空一张表：

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
      facades.Orm.Query().Where("1 = 1").Delete(&models.User{})
    }).Daily(),
  }
}
```

### Artisan 命令调度

调度方式不仅有闭包调用，还可以使用 [Artisan commands](./Artisan%E5%91%BD%E4%BB%A4%E8%A1%8C.md)。例如，你可以给 `command` 方法传递命令名称或类来调度一个 Artisan 命令：

```
package console

import (
  "github.com/goravel/framework/contracts/console"
  "github.com/goravel/framework/schedule/support"
  "github.com/goravel/framework/support/facades"
)

type Kernel struct {
}

func (kernel *Kernel) Schedule() []*support.Event {
  return []*support.Event{
    facades.Schedule.Command("send:emails name").Daily(),
  }
}
```

### 调度频率选项

我们已经看到了几个如何设置任务在指定时间间隔运行的例子。不仅如此，你还有更多的任务调度频率可选：

| 方法                     | 描述                           |
| ------------------------ | ------------------------------ |
| `.Cron('* * * * *')`     | 自定义 Crone 计划执行任务      |
| `.EveryMinute()`         | 每分钟执行一次任务             |
| `.EveryTwoMinutes()`     | 每两分钟执行一次任务           |
| `.EveryThreeMinutes()`   | 每三分钟执行一次任务           |
| `.EveryFourMinutes()`    | 每四分钟执行一次任务           |
| `.EveryFiveMinutes()`    | 每五分钟执行一次任务           |
| `.EveryTenMinutes()`     | 每十分钟执行一次任务           |
| `.EveryFifteenMinutes()` | 每十五分钟执行一次任务         |
| `.EveryThirtyMinutes()`  | 每三十分钟执行一次任务         |
| `.Hourly()`              | 每小时执行一次任务             |
| `.HourlyAt(17)`          | 每小时第十七分钟时执行一次任务 |
| `.EveryTwoHours()`       | 每两小时执行一次任务           |
| `.EveryThreeHours()`     | 每三小时执行一次任务           |
| `.EveryFourHours()`      | 每四小时执行一次任务           |
| `.EverySixHours()`       | 每六小时执行一次任务           |
| `.Daily()`               | 每天 00:00 执行一次任务        |
| `.DailyAt('13:00')`      | 每天 13:00 执行一次任务        |

### 避免任务重复

默认情况下，即使之前的任务实例还在执行，调度内的任务也会执行。为避免这种情况的发生，你可以使用 `SkipIfStillRunning` 或 `DelayIfStillRunning` 方法：

| 方法                     | 描述                                                           |
| ------------------------ | -------------------------------------------------------------- |
| `.SkipIfStillRunning()`  | 如果有正在执行的相同任务，则本次取消执行                       |
| `.DelayIfStillRunning()` | 如果有正在执行的相同任务，则本次等待正在执行的任务结束后再执行 |

```
facades.Schedule.Command("send:emails name").EveryMinute().SkipIfStillRunning()
facades.Schedule.Command("send:emails name").EveryMinute().DelayIfStillRunning()
```

## 运行调度程序

现在，我们已经学会了如何定义计划任务，接下来让我们讨论如何真正在服务器上运行它们。

在根目录 `main.go` 文件中增加 `go facades.Schedule.Run()`。

```
package main

import (
  "github.com/goravel/framework/support/facades"

  "goravel/bootstrap"
)

func main() {
  //This bootstraps the framework and gets it ready for use.
  bootstrap.Boot()

  //Start schedule by facades.Schedule
  go facades.Schedule.Run()

  select {}
}
```
