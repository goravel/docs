# 日志

[[toc]]

## 简介

为了了解应用程序的运行状况，Goravel 提供了强大的日志模块，可以通过 `facades.Log()` 将日志消息、系统错误记录到文件或其他通道。

## 配置

在 `config/logging.go` 中进行所有自定义配置，允许配置不同的日志通道。

`Goravel` 默认使用 `stack` 通道记录日志，`stack` 允许日志转发到多个通道中。

`single` 和 `daily` 驱动中的 `print` 配置可以控制日志输出到控制台。

## 可用的通道驱动

| 名称       | 描述       |
| -------- | -------- |
| `stack`  | 允许使用多个通道 |
| `single` | 单日志文件    |
| `daily`  | 每天一个日志文件 |
| `custom` | 自定义驱动    |

### 注入 Context

```go
facades.Log().WithContext(ctx)
```

## 写日志消息

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

有时，你可能希望将消息记录到应用程序默认频道以外的频道：

```go
facades.Log().Channel("single").Info(message)
```

如果你想同时写入多个通道，可以使用 `Stack` 方法：

```go
facades.Log().Stack([]string{"single", "slack"}).Info(message)
```

## 链式方法

Goravel 提供有便捷的链式方式，方便在日志中插入更多有用信息：

```go
facades.Log().User("John").Debug(message)
```

| Method    | Action                              |
| --------- | ----------------------------------- |
| Code      | 设置日志代码。                             |
| Hint      | 设置提示以加快调试速度。                        |
| In        | 设置日志条目相关的功能类别或域。                    |
| Owner     | 对警报目的很有用。                           |
| Request   | 提供一个 http.Request。  |
| Response  | 提供一个 http.Response。 |
| Tags      | 添加多个标签，描述返回错误的功能。                   |
| User      | 记录触发日志的用户。                          |
| With      | 向日志条目的上下文添加键值对。                     |
| WithTrace | 为日志附加堆栈信息。                          |

## 创建自定义通道

如果你想定义一个完全自定义的驱动，可以在 `config/logging.go` 配置文件中指定 `custom` 驱动类型。
然后包含 `via` 选项，实现 `framework\contracts\log\Logger` 接口：
Then include a `via` option to implement a `framework\contracts\log\Logger` structure:

```go
// config/logging.go 配置
"custom": map[string]interface{}{
    "driver": "custom",
    "via":    &Logger{},
},
```

### 编写驱动

实现 `github.com/goravel/framework/contracts/log/Logger` 接口。

```go
// framework/contracts/log/Logger
package log

type Logger interface {
  // Handle pass channel config path here
  Handle(channel string) (Hook, error)
}
```

文件可以储存到 `app/extensions` 文件夹中（可修改）。例如： Example:

```go
package extensions

import (
  "fmt"

  "github.com/goravel/framework/contracts/log"
)

type Logger struct {
}

// Handle 传入通道配置路径
func (logger *Logger) Handle(channel string) (log.Hook, error) {
  return &Hook{}, nil
}

type Hook struct {
}

// Levels 要监控的等级
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

// Fire 当触发时执行的逻辑
func (h *Hook) Fire(entry log.Entry) error {
  fmt.Printf("context=%v level=%v time=%v message=%s", entry.Context(), entry.Level(), entry.Time(), entry.Message())

  return nil
}
```
