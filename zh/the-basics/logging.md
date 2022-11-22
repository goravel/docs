# 日志

[[toc]]

## 介绍

为了了解应用程序的运行状况，Goravel 提供了强大的日志模块，可以通过 `facades.Log` 将日志消息、系统错误记录到文件或其他通道。

## 配置

在 `config/logging.go` 中进行所有自定义配置，允许配置不同的日志通道。

`Goravel` 默认使用 `stack` 通道记录日志，`stack` 允许日志转发到多个通道中。

## 可用的通道驱动

| 名称     | 描述             |
| -------- | ---------------- |
| `stack`  | 允许使用多个通道 |
| `single` | 单日志文件       |
| `daily`  | 每天一个日志文件 |
| `custom` | 自定义驱动       |

### 注入 Context

```go
facades.Log.WithContext(ctx)
```

## 写日志消息

```go
facades.Log.Debug(message)
facades.Log.Debugf(message, args)
facades.Log.Info(message)
facades.Log.Infof(message, args)
facades.Log.Warning(message)
facades.Log.Warningf(message, args)
facades.Log.Error(message)
facades.Log.Errorf(message, args)
facades.Log.Fatal(message)
facades.Log.Fatalf(message, args)
facades.Log.Panic(message)
facades.Log.Panicf(message, args)
```

## 创建自定义通道

如果你想定义一个完全自定义的驱动，可以在 `config/logging.go` 配置文件中指定 `custom` 驱动类型。
然后包含 `via` 选项，实现 `framework\contracts\log\Logger` 接口：

```
//config/logging.go 配置
"custom": map[string]interface{}{
    "driver": "custom",
    "via":    &Logger{},
},
```

### 编写驱动

实现 `github.com/goravel/framework/contracts/log/Logger` 接口。

```
//framework\contracts\log\Logger
package log

type Logger interface {
	// Handle pass channel config path here
	Handle(channel string) (Hook, error)
}
```

文件可以储存到 `app/extensions` 文件夹中（可修改）。例如：

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
