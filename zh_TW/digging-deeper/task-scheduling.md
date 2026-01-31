# 任務排程

[[toc]]

## 概述

在過去，你可能需要為需要在伺服器上排程的每個任務創建一個 cron 配置條目。 然而，這種方法很快會成為一種痛苦，因為您的任務排程不在源控制之中，您必須通過 SSH 登錄到伺服器上來查看或新增/編輯 cron 條目。

Goravel 的命令排程器為在您的伺服器上管理排定的任務提供了一種全新的方法。 使用排程器，您可以在您的 Goravel 應用程序中輕鬆而清晰地定義您的命令排程。 使用排程器，您只需在伺服器上創建一個 cron 條目。

## 定義排程

To schedule tasks for your application, you can define them in the `WithSchedule` function in the `bootstrap/app.go` file. 讓我們考慮一個例子來更好地理解這一點。 在這種情況下，我們希望排程一個閉包，它每天在午夜運行。 在這個閉包中，我們將執行一個數據庫查詢以清除一個表：

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

### 排程 Artisan 命令

除了排程閉包之外，您還可以排程 [Artisan 命令](./artisan-console.md)。 例如，您可以使用 `Command` 方法來排程 Artisan 命令，使用命令的名稱或類。

```go
facades.Schedule().Command("send:emails name").Daily(),
```

### 日誌級別

當 `app.debug` 為 `true` 時，控制台將打印所有日誌。 否則，僅打印 `error` 級別日誌。

### 排程頻率選項

我們已經見過幾個如何配置任務以在指定間隔執行的例子。 然而，還有許多其他任務排程頻率可用於分配給任務：

| 方法                                                                   | 描述                              |
| -------------------------------------------------------------------- | ------------------------------- |
| .Cron("\* \* \* \* \*")           | 自定義 Crone 排程（分鐘）                |
| .Cron("\* \* \* \* \* \*")        | 自定義 Crone 排程（秒）                 |
| .EverySecond()                    | 每秒執行一次任務                        |
| .EveryTwoSeconds()                | 每兩秒執行一次任務                       |
| .EveryFiveSeconds()               | 每五秒執行一次任務                       |
| .EveryTenSeconds()                | 每十秒執行一次任務                       |
| .EveryFifteenSeconds()            | 每十五秒執行一次任務                      |
| .EveryTwentySeconds()             | 每二十秒執行一次任務                      |
| .EveryThirtySeconds()             | 每三十秒執行一次任務                      |
| .EveryMinute()                    | 每分鐘執行一次任務                       |
| .EveryTwoMinutes()                | 每兩分鐘執行一次任務                      |
| .EveryThreeMinutes()              | 每三分鐘執行一次任務                      |
| .EveryFourMinutes()               | 每四分鐘執行一次任務                      |
| .EveryFiveMinutes()               | 每五分鐘執行一次任務                      |
| .EveryTenMinutes()                | 每十分鐘執行一次任務                      |
| .EveryFifteenMinutes()            | 每十五分鐘執行一次任務                     |
| .EveryThirtyMinutes()             | 每三十分鐘執行一次任務                     |
| .Hourly()                         | 每小時執行一次任務                       |
| .HourlyAt(17)                     | 每小時第十七分鐘時執行一次任務                 |
| .EveryTwoHours()                  | 每兩小時執行一次任務                      |
| .EveryThreeHours()                | 每三小時執行一次任務                      |
| .EveryFourHours()                 | 每四小時執行一次任務                      |
| .EverySixHours()                  | 每六小時執行一次任務                      |
| .Daily()                          | 每天 00:00 執行一次任務 |
| .DailyAt("13:00") | 每天 13:00 執行一次任務 |
| .Days(1, 3, 5)；                   | 每週一、週三和週五執行一次任務                 |
| .Weekdays()                       | 每週一至週五執行一次任務                    |
| .Weekends()                       | 每週六和週日執行一次任務                    |
| .Mondays()                        | 每週一執行一次任務                       |
| .Tuesdays()                       | 每週二執行一次任務                       |
| .Wednesdays()                     | 每週三執行一次任務                       |
| .Thursdays()                      | 每週四執行一次任務                       |
| .Fridays()                        | 每週五執行一次任務                       |
| .Saturdays()                      | 每週六執行一次任務                       |
| .Sundays()                        | 每週日執行一次任務                       |
| .Weekly()                         | 每週執行一次任務                        |
| .Monthly()                        | 每月執行一次任務                        |
| .Quarterly()                      | 每季度執行一次任務                       |
| .Yearly()                         | 每年執行一次任務                        |

### 防止任務重疊

預設情況下，排定任務將繼續運行，即使之前的實例仍在運行。 為了防止這種情況，請使用以下方法：

| 方法                                                        | 描述        |
| --------------------------------------------------------- | --------- |
| .SkipIfStillRunning()  | 如果仍在運行則跳過 |
| .DelayIfStillRunning() | 如果仍在運行則延遲 |

```go
facades.Schedule().Command("send:emails name").EveryMinute().SkipIfStillRunning()
facades.Schedule().Command("send:emails name").EveryMinute().DelayIfStillRunning()
```

### 在一台伺服器上運行任務

> 要使用此功能，您的應用程序必須使用 memcached、dynamodb 或 redis 緩存驅動程序作為默認緩存驅動程序。 此外，所有伺服器必須與同一中央緩存伺服器通信。

如果您的應用程序的排程器在多個伺服器上運行，您可以確保排定的作業只在其中一台伺服器上執行。 例如，假設您有一個排定任務，每週五晚上生成一個新的報告。 如果任務排程在三個工作伺服器上運行，該排定任務將在所有三台伺服器上運行並創建報告三次。 這可不是理想的！

為了防止這種情況，請在定義排定任務時使用 `OnOneServer` 方法，這將確保該任務僅在一台伺服器上運行。 第一個收到任務的伺服器將對該任務上鎖，防止其他伺服器同時執行該任務：

```go
facades.Schedule().Command("report:generate").Daily().OnOneServer()
```

如果要在一台伺服器上運行排定閉包，則必須為它們指定一個名稱。

```go
facades.Schedule().Call(func() {
  fmt.Println("goravel")
}).Daily().OnOneServer().Name("goravel")
```

## 執行排程器

The scheduler will be run automatically when calling `Start()` in the `main.go` file. You can also run tasks manually :

```shell
./artisan schedule:run
```

## 查看所有任務

你可以使用 `schedule:list` 命令查看所有任務：

```shell
./artisan schedule:list
```
