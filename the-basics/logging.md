# Logging

[[toc]]

## Introduction

In order to understand the running status of the application, Goravel provides a powerful log service that can record log messages and system errors to a file or other channels through `facades.Log()`.

## Configuration

Make custom configurations in `config/logging.go`, allows to configure different log channels.

`Goravel` uses `stack` channel to record logs by default, `stack` allows logs to be forwarded to multiple channels.

The `print` configuration in `single` and `daily` drivers can control log output to console.

## Available channel drivers

| Name     | Description             |
| -------- | ----------------------- |
| `stack`  | Allow multiple channels |
| `single` | Single log file         |
| `daily`  | One log file per day    |
| `custom` | Custom drive            |

### Inject Context

```go
facades.Log().WithContext(ctx)
```

## Write log messages

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

## Chain Methods

Goravel provides a convenient chain methods, make it easy to insert more useful information into the log:

```go
facades.Log().User("John").Debug(message)
```

| Method       | Action           |
| -----------  | -------------- |
| Code         | Set a code or slug that describes the log.     |
| Hint         | Set a hint for faster debugging.     |
| In           | Set the feature category or domain in which the log entry is relevant.     |
| Owner        | Useful for alerting purpose.     |
| Request      | Supplies a http.Request.     |
| Response     | Supplies a http.Response.     |
| Tags         | Add multiple tags, describing the feature returning an error.     |
| User         | Set the user associated with the log entry.     |
| With         | Add key-value pairs to the context of the log entry.    |

## Create a custom channel

If you want to define a completely custom channel, you can specify the `custom` driver type in the `config/logging.go` configuration file.
Then include a `via` option to implement a `framework\contracts\log\Logger` structure:

```
//config/logging.go
"custom": map[string]interface{}{
    "driver": "custom",
    "via":    &CustomTest{},
},
```

### Implement Driver

Implement `framework\contracts\log\Logger` interface.

```
//framework\contracts\log\Logger
package log

type Logger interface {
  // Handle pass channel config path here
  Handle(channel string) (Hook, error)
}
```

files can be stored in the `app/extensions` folder (modifiable). Example:

```go
package extensions

import (
  "fmt"

  "github.com/goravel/framework/contracts/log"
)

type Logger struct {
}

// Handle pass channel config path here
func (logger *Logger) Handle(channel string) (log.Hook, error) {
  return &Hook{}, nil
}

type Hook struct {
}

// Levels monitoring level
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

// Fire execute logic when trigger
func (h *Hook) Fire(entry log.Entry) error {
  fmt.Printf("context=%v level=%v time=%v message=%s", entry.Context(), entry.Level(), entry.Time(), entry.Message())

  return nil
}
```

<CommentService/>