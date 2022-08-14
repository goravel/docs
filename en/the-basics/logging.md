## Introduction

In order to help you understand the running status of the application, Goravel provides a powerful log service that can record log messages and system errors to a file or other channels.

This module can be operated with `facades.Log`, `facades.Log` is an instance of the well-known log component [sirupsen/logrus](https://github.com/sirupsen/logrus), the usage method is the same as that of `sirupsen/logrus `Exactly the same.

## Configuration

Make custom configurations in `config/logging.php`. Allows to configure different log channels, you can enter the configuration file to view.

`Goravel` uses `stack` channel to record logs by default. `stack` allows logs to be forwarded to multiple channels.

## Available channel drivers

| Name     | Description             |
| -------- | ----------------------- |
| `stack`  | Allow multiple channels |
| `single` | Single log file         |
| `daily`  | One log file per day    |
| `custom` | Custom drive            |

## Write log messages

Available level:

```
facades.Log.Trace($message)
facades.Log.Debug($message)
facades.Log.Info($message)
facades.Log.Warn($message)
facades.Log.Error($message)
facades.Log.Fatal($message)
facades.Log.Panic($message)
```

## Contextual Information

An array of contextual data may be passed to the log methods. This contextual data will be formatted and displayed with the log message:

```
facades.Log.WithFields(logrus.Fields{
  "goravel": "framework",
}).Debug("web")
```

## Create a custom channel

If you want to define a completely custom channel, you can specify the `custom` driver type in the `config/logging.php` configuration file.
Then include a `via` option to implement a `framework\contracts\log\Logger` structure:

```
//config/logging.go
"custom": map[string]interface{}{
    "driver": "custom",
    "via":    CustomTest{},
    "path":   "storage/logs/goravel-custom.log",//选配
    "level":  facadesConfig.Env("LOG_LEVEL", "debug"),//选配
},
```

### 编写驱动

Implement `framework\contracts\log\Logger` interface.

```
//framework\contracts\log\Logger
package log

import "github.com/sirupsen/logrus"

type Logger interface {
  Handle(configPath string) (logrus.Hook, error)
}
```

files can be stored in the `app/extensions` folder (modifiable). Example:

```
package aliyun

import (
  "github.com/goravel/framework/support/facades"
  "github.com/sirupsen/logrus"
)

type Logger struct {
}

func (logger Logger) Handle(configPath string) (logrus.Hook, error) {
  return AliyunLogHook{}, nil
}

type AliyunLogHook struct {
}

func (h AliyunLogHook) Levels() []logrus.Level {
  level := facades.Config.GetString("logging.channels.aliyun.level")

  if level == "error" {
    return []logrus.Level{
      logrus.ErrorLevel,
      logrus.FatalLevel,
      logrus.PanicLevel,
    }
  }

  return []logrus.Level{
    logrus.TraceLevel,
    logrus.DebugLevel,
    logrus.InfoLevel,
    logrus.WarnLevel,
    logrus.ErrorLevel,
    logrus.FatalLevel,
    logrus.PanicLevel,
  }
}

func (h AliyunLogHook) Fire(entry *logrus.Entry) error {
  // todo logic
  level := entry.Level.String()
  errTime := entry.Time.String()
  message := entry.Message

  return nil
}
```

### More

See [sirupsen/logrus](https://github.com/sirupsen/logrus)
