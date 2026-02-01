# 任务调度

[[toc]]

## 简介

过去，你可能需要在服务器上为每一个调度任务去创建 Cron 条目。 因为这些任务的调度不是通过代码控制的，你要查看或新增任务调度都需要通过 SSH 远程登录到服务器上去操作，所以这种方式很快会让人变得痛苦不堪。

Goravel的命令调度程序为管理你服务器上的预定任务提供了新的方法。 Goravel 的命令行调度器允许你在 Goravel 中清晰明了地定义命令调度。 在使用这个任务调度器时，你只需要在你的服务器上创建单个 Cron 入口。

## 定义调度

如果要为应用添加调度任务，你可以在 `bootstrap/app.go` 文件的 `WithSchedule` 函数中定义它们。 在开始之前，我们来看一个例子。 我们计划每天午夜执行一个 `闭包`。 这个 `闭包` 会执行一次数据库语句去清空一张表：

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithSchedule(func() []schedule.Event {
			return []schedule.Event{
				facades.Schedule().Call(func() {
          facades.Orm().Query().Where("1 = 1").Delete(&models.User{})
        }).Daily(),
			}
		}).
		WithConfig(config.Boot).
		Start()
}
```

### Artisan 命令调度

调度方式不仅有闭包调用，还可以使用 [Artisan commands](./artisan-console.md)。 例如，你可以给 `Command` 方法传递命令名称或类来调度一个 Artisan 命令。

```go
facades.Schedule().Command("send:emails name").Daily(),
```

### 日志级别

当 `app.debug` 为 `true` 时，控制台将打印所有日志。 否则，只打印 `error` 级别日志。

### 调度频率选项

我们已经看到了几个如何设置任务在指定时间间隔运行的例子。 不仅如此，你还有更多的任务调度频率可选：

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

默认情况下，即使之前的任务实例还在执行，调度内的任务也会执行。 为避免这种情况的发生，你可以使用 `SkipIfStillRunning` 或 `DelayIfStillRunning` 方法：

| 方法                       | 描述        |
| ------------------------ | --------- |
| `.SkipIfStillRunning()`  | 如果仍在运行则跳过 |
| `.DelayIfStillRunning()` | 如果仍在运行则延迟 |

```go
facades.Schedule().Command("send:emails name").EveryMinute().SkipIfStillRunning()
facades.Schedule().Command("send:emails name").EveryMinute().DelayIfStillRunning()
```

### 任务只运行在一台服务器上

> 要使用此功能，你的应用程序必须使用 memcached, dynamodb, 或 redis 缓存驱动程序作为应用程序的默认缓存驱动程序。 此外，所有服务器必须和同一个中央缓存服务器通信。

如果你的应用运行在多台服务器上，可能需要限制调度任务只在某台服务器上运行。 例如，假设你有一个每个星期五晚上生成新报告的调度任务。 如果任务调度器运行在三台服务器上，调度任务会在三台服务器上运行并且生成三次报告。 不够优雅！

要指示任务应仅在一台服务器上运行，请在定义计划任务时使用 `OnOneServer` 方法。 第一台获取到该任务的服务器会给任务上一把原子锁以阻止其他服务器同时运行该任务：

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

调度器将在 `main.go` 文件中调用 `Start()` 时自动运行。 你也可以手动运行任务：

```shell
./artisan schedule:run
```

## 查看所有任务

你可以使用 `schedule:list` 命令查看所有任务：

```shell
./artisan schedule:list
```
