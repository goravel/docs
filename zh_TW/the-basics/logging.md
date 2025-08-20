# 日誌

[[toc]]

## 概述

為了了解應用程序的運行狀態，Goravel 提供了一個強大的日誌服務，可以通過 `facades.Log()` 將日誌消息和系統錯誤記錄到文件或其他通道中。

## 配置

可以在 `config/logging.go` 中進行所有自定義配置，以配置不同的日誌通道。

`Goravel` 默認使用 `stack` 通道來記錄日誌，`stack` 允許日誌轉發到多個通道中。

`single` 和 `daily` 驅動中的 `print` 配置可以控制日誌輸出到控制台。

## 可用的通道驅動

| 名稱       | 描述       |
| -------- | -------- |
| `stack`  | 允許使用多個通道 |
| `single` | 單日誌文件    |
| `daily`  | 每天一個日誌文件 |
| `custom` | 自定義驅動    |

### 注入 Context

```go
facades.Log().WithContext(ctx)
```

## 寫日誌消息

```go
facades.Log().Debug(message)
facades.Log().Debugf(message, args)
facades.Log().Info(message)
facades.Log().Infof(message, args)
facades.Log().Warning(message)
facades.Log().Warningf(message, args)
facades.Log().Error(message)
facades.Log().Errorf(message, args)
facades.Log().Fatal(message)
facades.Log().Fatalf(message, args)
facades.Log().Panic(message)
facades.Log().Panicf(message, args)
```

### 寫入特定通道

有時，你可能希望將消息記錄到應用程序默認通道以外的通道：

```go
facades.Log().Channel("single").Info(message)
```

如果你想同時寫入多個通道，可以使用 `Stack` 方法：

```go
facades.Log().Stack([]string{"single", "slack"}).Info(message)
```

## 鏈式方法

Goravel 提供了便捷的鏈式方法，方便在日誌中插入更多有用的信息：

```go
facades.Log().User("John").Debug(message)
```

| 方法名       | 操作                                  |
| --------- | ----------------------------------- |
| 代碼        | 設置描述日誌的代碼或標識符。                      |
| 提示        | 為了加快調試速度設置提示。                       |
| 在         | 設置日誌條目相關的功能類別或域。                    |
| 擁有者       | 有助於警報目的。                            |
| 請求        | 提供一個 http.Request。  |
| 響應        | 提供一個 http.Response。 |
| 標籤        | 添加多個標籤，描述返回錯誤的功能。                   |
| 用戶        | 設置與日誌條目相關的用戶。                       |
| With      | 向日誌條目的上下文添加鍵值對。                     |
| WithTrace | 為日誌條目添加堆棧信息。                        |

## 創建自定義通道

如果你想定義一個完全自定義的通道，你可以在 `config/logging.go` 配置文件中指定 `custom` 驅動類型。
然後包含一個 `via` 選項來實現 `framework\contracts\log\Logger` 結構：

```go
// config/logging.go
"custom": map[string]interface{}{
    "driver": "custom",
    "via":    &CustomTest{},
},
```

### 實現驅動

實現 `framework\contracts\log\Logger` 接口。

```go
// framework/contracts/log/Logger
package log

type Logger interface {
  // Handle 輸入通道配置路徑
  Handle(channel string) (Hook, error)
}
```

檔案可以存儲在 `app/extensions` 資料夾中（可修改）。 示例：

```go
package extensions

import (
  "fmt"

  "github.com/goravel/framework/contracts/log"
)

type Logger struct {
}

// Handle 輸入通道配置路徑
func (logger *Logger) Handle(channel string) (log.Hook, error) {
  return &Hook{}, nil
}

type Hook struct {
}

// Levels 監控級別
func (h *Hook) Levels() []log.Level {
  return []log.Level{
    log.DebugLevel,
    log.InfoLevel,
    log.WarningLevel,
    log.ErrorLevel,
    log.FatalLevel,
    log.PanicLevel,
  }
}

// Fire 當觸發時執行邏輯
func (h *Hook) Fire(entry log.Entry) error {
  fmt.Printf("context=%v level=%v time=%v message=%s", entry.Context(), entry.Level(), entry.Time(), entry.Message())

  return nil
}
```
