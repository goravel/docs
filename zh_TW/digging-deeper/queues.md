# 佇列

[[toc]]

## 概述

在構建您的網頁應用程序時，可能會出現一些任務，比如解析和存儲上傳的 CSV 檔案，這在網頁請求期間可能需要花費過長時間來完成。 幸運的是，Goravel 提供了解決方案，讓您可以創建在背景運行的佇列任務。 這樣，通過將耗時的任務移到佇列中，您的應用程序可以更快地回應網頁請求，並為您的客戶提供更好的用戶體驗。 要實現此功能，我們使用 `facades.Queue()`。

### 連接與佇列 佇列

在深入研究 Goravel 佇列之前，了解「連接」與「佇列」之間的區別是很重要的。 在配置檔中，`config/queue.go`，您會找到一個陣列，用於 `connections` 配置。 該選項指定與後端佇列服務（如 Redis）的連接。 但是，每個佇列連接可以有多個「佇列」，這可以被視為不同的堆疊或佇列任務。

重要的是要注意，佇列配置檔中的每個連接配置範例都包括一個 `queue` 屬性。 該屬性是將任務發送到給定連接時將被分派到的預設佇列。 簡單來說，如果您在發送任務時未明確定義它應發送到哪個佇列，任務將會放在連接配置的佇列屬性中定義的佇列中。

```go
// 該任務被發送到預設連接的預設佇列
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{
  {Type: "int", Value: 1},
}).Dispatch()

// 該任務被發送到預設連接的 "emails" 佇列
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{
  {Type: "int", Value: 1},
}).OnQueue("emails").Dispatch()
```

## 驅動

佇列配置檔存儲在 `config/queue.go` 中，並且可以在配置檔中設定不同的佇列驅動。

### 同步驅動

同步驅動是預設的驅動，它不會將任務推送到佇列，而是直接在當前進程中執行。

### 資料庫驅動

要使用 `database` 驅動，您需要先創建一個資料庫表來存儲任務：[20210101000002_create_jobs_table.go](https://github.com/goravel/goravel/blob/master/database/migrations/20210101000002_create_jobs_table.go)。 遷移檔案預設位於 `database/migrations` 目錄中。

### 自定義驅動

如果當前驅動無法滿足您的需求，您可以自定義驅動。 您需要在 `contracts/queue/driver.go` 中實現 [Driver](https://github.com/goravel/framework/blob/master/contracts/queue/driver.go#L14) 介面。

`Redis` 驅動的官方實現，您可以參考 [Redis Driver](https://github.com/goravel/redis) 來實現自己的自定義驅動。

在實現自定義驅動後，你可以將配置添加到 `config/queue.go`：

```
...
"connections": map[string]any{
  "redis": map[string]any{
    "driver": "custom",
    "connection": "default",
    "queue": "default",
    "via": func() (queue.Driver, error) {
        return redisfacades.Queue("redis") // redis 值是連接的鍵
    },
  },
},
```

## 創建任務

### 生成任務類別

預設情況下，所有應用程序的任務都存放在 `app/jobs` 目錄中。 如果 `app/Jobs` 目錄不存在，當您運行 `make:job` Artisan 命令時，將會自動創建該目錄：

```shell
./artisan make:job ProcessPodcast
./artisan make:job user/ProcessPodcast
```

### Register Jobs

A new job created by `make:job` will be registered automatically in the `bootstrap/jobs.go::Jobs()` function and the function will be called by `WithJobs`. You need register the job manually if you create the job file by yourself.

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithJobs(Jobs).
		WithConfig(config.Boot).
		Create()
}
```

### 類結構

任務類非常簡單，包含兩個方法：`Signature` 和 `Handle`。 `Signature` 作為任務的獨特標識，`Handle` 在隊列處理任務時執行。 此外，在任務執行時傳遞的 `[]queue.Arg{}` 將被傳遞到 `Handle` 中：

```go
package jobs

type ProcessPodcast struct {
}

// Signature 任務的名稱和簽名。
func (r *ProcessPodcast) Signature() string {
  return "process_podcast"
}

// Handle 執行任務。
func (r *ProcessPodcast) Handle(args ...any) error {
  return nil
}
```

#### 任務重試

任務類支持可選的 `ShouldRetry(err error, attempt int) (retryable bool, delay time.Duration)` 方法，用於控制任務重試。

```go
// ShouldRetry 根據錯誤決定任務是否應該重試。
func (r *ProcessPodcast) ShouldRetry(err error, attempt int) (retryable bool, delay time.Duration) {
  return true, 10 * time.Second
}
```

## 啟動佇列伺服器

The default queue worker will be run by the runner of queue seriver provider, if you want to start multiple queue workers with different configuration, you can create [a runner](../architecture-concepts/service-providers.md#runners) and add it to the `WithRunners` function in the `bootstrap/app.go` file:

```go
func Boot() contractsfoundation.Application {
  return foundation.Setup().
    WithConfig(config.Boot).
    WithRunners(func() []contractsfoundation.Runner {
      return []contractsfoundation.Runner{
        YourRunner,
      }
    }).
    Create()
}
```

You can check [the default queue runner](https://github.com/goravel/framework/blob/master/queue/runners.go) for reference.

## 任務派遣

一旦您編寫了任務類，您可以使用任務本身的 `Dispatch` 方法來派遣它：

```go
package controllers

import (
  "github.com/goravel/framework/contracts/queue"
  "github.com/goravel/framework/contracts/http"

  "goravel/app/facades"
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

### 同步調度

如果您希望立即（同步）調度一個任務，您可以使用 `DispatchSync` 方法。 使用此方法時，任務不會進入佇列，並將立即在當前進程內執行：

```go
package controllers

import (
  "github.com/goravel/framework/contracts/queue"
  "github.com/goravel/framework/contracts/http"

  "goravel/app/facades"
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

### 任務鏈

任務鏈允許您指定一組按特定順序執行的排隊任務。 如果序列中的任何任務失敗，則不會執行剩下的任務。 要運行排隊任務鏈，您可以使用 `facades.Queue()` 提供的 `Chain` 方法：

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

### 延遲調度

如果您希望指定某個任務不應被佇列工作進程立即處理，您可以在任務調度期間使用 `Delay` 方法。 例如，我們可以指定一個任務在調度後 100 秒才可處理：

```go
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).Delay(time.Now().Add(100*time.Second)).Dispatch()
```

### 自定義佇列與連接

#### 調度某個特定佇列

透過將任務推送到不同的佇列，您可以「分類」您的排隊任務，甚至優先考慮分配給各個佇列的工作數。

```go
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).OnQueue("processing").Dispatch()
```

#### 調度某個特定連接

如果您的應用程序與多個佇列連接交互，您可以使用 `OnConnection` 方法指定將任務推送到哪個連接。

```go
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).OnConnection("sync").Dispatch()
```

您可以將 `OnConnection` 和 `OnQueue` 方法串接在一起，以指定一個任務的連接和佇列：

```go
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).OnConnection("sync").OnQueue("processing").Dispatch()
```

## 查看失敗的任務

您可以使用 `queue:failed` 命令來查看失敗的任務，該命令將從資料庫中的 `failed_jobs` 表中獲取失敗任務：

```shell
./artisan queue:failed
```

## 重試失敗的任務

如果一個任務在處理過程中失敗，您可以使用 `queue:retry` 命令來重試該任務。 在重試任務之前，您需要從資料庫中的 `failed_jobs` 表中獲取要重試的任務的 UUID：

```shell
# 重試單個任務
./artisan queue:retry 4427387e-c75a-4295-afb3-2f3d0e410494

# 重試多個任務
./artisan queue:retry 4427387e-c75a-4295-afb3-2f3d0e410494 eafdd963-a8b7-4aca-9421-b376ed9f4382

# 重試特定連接的失敗任務
./artisan queue:retry --connection=redis

# 重試特定佇列的失敗任務
./artisan queue:retry --queue=processing

# 重試特定連接和佇列的失敗任務
./artisan queue:retry --connection=redis --queue=processing

# 重試所有失敗的任務
./artisan queue:retry all
```

## `queue.Arg.Type` 支持的類型

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
