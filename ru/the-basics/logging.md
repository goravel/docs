# Логирование (Logging)

[[toc]]

## Введение

Для того чтобы отслеживать состояние работы приложения, Goravel предоставляет мощную службу логирования, которая позволяет записывать сообщения логов и системные ошибки в файл или другие каналы с помощью `facades.Log()`.

## Конфигурация

Вы можете настраивать логирование в файле `config/logging.go`, что позволяет настраивать различные каналы логирования.

По умолчанию `Goravel` использует канал `stack` для записи логов, `stack` позволяет перенаправлять логи в несколько каналов.

Конфигурация `print` в драйверах `single` и `daily` контролирует вывод логов в консоль.

## Доступные драйверы каналов

| Имя      | Описание                    |
| -------- | --------------------------- |
| `stack`  | Позволяет несколько каналов |
| `single` | Один лог-файл               |
| `daily`  | Один лог-файл на день       |
| `custom` | Пользовательский драйвер    |

### Внедрение контекста

```go
facades.Log().WithContext(ctx)
```

## Запись логов

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

## Создание пользовательского канала

Если вы хотите определить полностью пользовательский канал, вы можете указать тип драйвера `custom` в файле конфигурации `config/logging.go`.
Затем включите опцию `via` для реализации структуры `framework\contracts\log\Logger`:

```
//config/logging.go
"custom": map[string]interface{}{
    "driver": "custom",
    "via":    &CustomTest{},
},
```

### Реализация драйвера

Реализуйте интерфейс `framework\contracts\log\Logger`.

```
//framework\contracts\log\Logger
package log

type Logger interface {
  // Handle pass channel config path here
  Handle(channel string) (Hook, error)
}
```

Файлы могут быть сохранены в папке `app/extensions` (доступно для модификации). Пример:

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