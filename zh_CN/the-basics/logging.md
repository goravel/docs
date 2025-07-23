# 日志

[[toc]]

## 简介

为了了解应用程序的运行状态，Goravel 提供了强大的日志服务，可以通过 `facades.Log()` 将日志消息和系统错误记录到文件或其他通道。

## 配置

要配置各种日志通道，可以在 `config/logging.go` 中进行自定义配置。

`Goravel` 默认使用 `stack` 通道记录日志，`stack` 允许将日志转发到多个通道。

`single` 和 `daily` 驱动程序中的 `print` 配置可以控制日志输出到控制台。

## 可用的通道驱动程序

| 名称       | 描述       |
| -------- | -------- |
| `stack`  | 允许多个通道   |
| `single` | 单个日志文件   |
| `daily`  | 每天一个日志文件 |
| `custom` | 自定义驱动    |

### 注入上下文

```go
facades.Log().WithContext(ctx)
```

## 写入日志消息

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

### 写入特定通道

有时，您可能希望将消息记录到应用程序默认通道以外的通道：

```go
facades.Log().Channel("single").Info(message)
```

如果您想同时写入多个通道，可以使用 `Stack` 方法：

```go
facades.Log().Stack([]string{"single", "slack"}).Info(message)
```

## 链式方法

Goravel 提供了方便的链式方法，可以轻松地在日志中插入更多有用的信息：

```go
facades.Log().User("John").Debug(message)
```

| 方法        | 作用                                  |
| --------- | ----------------------------------- |
| Code      | 设置描述日志的代码或标识。                       |
| Hint      | 设置提示以加快调试速度。                        |
| In        | 设置日志条目相关的功能类别或域。                    |
| Owner     | 对警报目的很有用。                           |
| Request   | 提供一个 http.Request。  |
| Response  | 提供一个 http.Response。 |
| Tags      | 添加多个标签，描述返回错误的功能。                   |
| User      | 设置与日志条目关联的用户。                       |
| With      | 向日志条目的上下文添加键值对。                     |
| WithTrace | 向日志条目添加堆栈信息。                        |

## 创建自定义通道

如果你想定义一个完全自定义的通道，你可以在 `config/logging.go` 配置文件中指定 `custom` 驱动类型。
然后包含一个 `via` 选项来实现 `framework\contracts\log\Logger` 结构：
Then include a `via` option to implement a `framework\contracts\log\Logger` structure:

```go
// config/logging.go 配置
"custom": map[string]interface{}{
    "driver": "custom",
    "via":    &Logger{},
},
```

### 实现驱动程序

实现 `framework\contracts\log\Logger` 接口。

```go
// framework/contracts/log/Logger
package log

type Logger interface {
  // 在此处传递通道配置路径
  Handle(channel string) (Hook, error)
}
```

文件可以存储在 `app/extensions` 文件夹中（可修改）。 示例： Example:

```go
package extensions

import (
  "fmt"

  "github.com/goravel/framework/contracts/log"
)

type Logger struct {
}

// Handle 在此处传递通道配置路径
func (logger *Logger) Handle(channel string) (log.Hook, error) {
  return &Hook{}, nil
}

type Hook struct {
}

// Levels 监控级别
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

// Fire 触发时执行逻辑
func (h *Hook) Fire(entry log.Entry) error {
  fmt.Printf("context=%v level=%v time=%v message=%s", entry.Context(), entry.Level(), entry.Time(), entry.Message())

  return nil
}
```
