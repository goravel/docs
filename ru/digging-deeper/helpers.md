# Помощники

[[toc]]

## Доступные методы

### Пути

|                           |                               |             |
| -----------               | --------------                | -------------- |
| [path.App()](#path-app)   | [path.Base()](#path-base)     | [path.Config()](#path-config)     |
| [path.Database()](#path-database)   | [path.Storage()](#path-storage)     | [path.Public()](#path-public)     |

### Время

|                           |                               |             |
| -----------               | --------------                | -------------- |
| [carbon.Now()](#carbon-now)   | [carbon.SetTimezone()](#carbon-settimezone)     | [carbon.Parse()](#carbon-parse)     |
| [carbon.FromTimestamp()](#carbon-fromtimestamp)   | [carbon.FromDateTime()](#carbon-fromdatetime)     | [carbon.FromDate()](#carbon-fromdate)     |
| [carbon.FromTime()](#carbon-fromtime)   | [carbon.FromStdTime()](#carbon-fromstdtime)     | [carbon.IsTestNow()](#istestnow-fromdate)     |
| [carbon.SetTestNow()](#carbon-settestnow)     | [carbon.UnsetTestNow()](#carbon-unsettestnow)     |      |

## Пути

### `path.App()`

Функция `path.App()` возвращает путь к каталогу приложения вашего приложения. Вы также можете использовать функцию `path.App()` для генерации пути к файлу относительно каталога приложения:

```go
import "github.com/goravel/framework/support/path"

path := path.App()
path := path.App("http/controllers/controller.go")
```

### `path.Base()`

Функция `path.Base()` возвращает путь к корневому каталогу вашего приложения. Вы также можете использовать функцию `path.Base()` для генерации пути к указанному файлу относительно корневого каталога проекта:

```go
path := path.Base()
path := path.Base("'vendor/bin'")
```

### `path.Config()`

Функция `path.Config()` возвращает путь к каталогу конфигурации вашего приложения. Вы также можете использовать функцию `path.Config()` для генерации пути к указанному файлу в каталоге конфигурации приложения:

```go
path := path.Config()
path := path.Config("app.go")
```

### `path.Database()`

Функция `path.Database()` возвращает путь к каталогу базы данных вашего приложения. Вы также можете использовать функцию `path.Database()` для генерации пути к указанному файлу в каталоге базы данных:

```go
path := path.Database()
path := path.Database("factories/user_factory.go")
```

### `path.Storage()`

Функция `path.Storage()` возвращает путь к каталогу хранилища вашего приложения. Вы также можете использовать функцию `path.Storage()` для генерации пути к указанному файлу в каталоге хранилища:

```go
path := path.Storage()
path := path.Storage("app/file.txt")
```

### `path.Public()`

Функция `path.Public()` возвращает путь к публичному каталогу вашего приложения. Вы также можете использовать функцию `path.Public()` для генерации пути к указанному файлу в публичном каталоге:

```go
path := path.Public()
path := path.Public("css/app.css")
```

## Время

Модуль `carbon` в Goravel - это расширение от [golang-module/carbon](https://github.com/golang-module/carbon), основной функцией является реализация перемотки времени, подробнее можно ознакомиться в официальной документации.

### `carbon.Now()`

Получить текущее время:

```go
import "github.com/goravel/framework/carbon"

carbon.Now()
```

### `carbon.SetTimezone()`

Установить временную зону:

```go
carbon.SetTimezone(carbon.UTC)
```

### `carbon.Parse()`

Получить объект `Carbon` по строке:

```go
carbon.Parse("2020-08-05 13:14:15")
```

### `carbon.FromTimestamp()`

Получить объект `Carbon` по временной метке:

```go
carbon.FromTimestamp(1577836800)
```

### `carbon.FromDateTime()`

Получить объект `Carbon` по дате и времени:

```go
carbon.FromDateTime(2020, 1, 1, 0, 0, 0)
```

### `carbon.FromDate()`

Получить объект `Carbon` по дате:

```go
carbon.FromDate(2020, 1, 1)
```

### `carbon.FromTime()`

Получить объект `Carbon` по времени:

```go
carbon.FromTime(0, 0, 0)
```

### `carbon.FromStdTime()`

Получить объект `Carbon` по `time.Time`:

```go
carbon.FromStdTime(time.Now())
```

### `carbon.IsTestNow()`

Определить, является ли время тестовым значением:

```go
carbon.IsTestNow()
```

### `carbon.SetTestNow()`

Установить время на тестовое значение:

```go
carbon.SetTestNow(carbon.Now())
```

### `carbon.UnsetTestNow()`

Восстановить время к нормальному значению:

```go
carbon.UnsetTestNow()
```

# Помощники

[[toc]]

## Доступные методы

### Пути

|                           |                               |             |
| -----------               | --------------                | -------------- |
| [path.App()](#path-app)   | [path.Base()](#path-base)     | [path.Config()](#path-config)     |
| [path.Database()](#path-database)   | [path.Storage()](#path-storage)     | [path.Public()](#path-public)     |

### Время

|                           |                               |             |
| -----------               | --------------                | -------------- |
| [carbon.Now()](#carbon-now)   | [carbon.SetTimezone()](#carbon-settimezone)     | [carbon.Parse()](#carbon-parse)     |
| [carbon.FromTimestamp()](#carbon-fromtimestamp)   | [carbon.FromDateTime()](#carbon-fromdatetime)     | [carbon.FromDate()](#carbon-fromdate)     |
| [carbon.FromTime()](#carbon-fromtime)   | [carbon.FromStdTime()](#carbon-fromstdtime)     | [carbon.IsTestNow()](#istestnow-fromdate)     |
| [carbon.SetTestNow()](#carbon-settestnow)     | [carbon.UnsetTestNow()](#carbon-unsettestnow)     |      |

## Пути

### `path.App()`

Функция `path.App()` возвращает путь к каталогу приложения. Вы также можете использовать `path.App()` для генерации пути к файлу относительно каталога приложения:

```go
import "github.com/goravel/framework/support/path"

path := path.App()
path := path.App("http/controllers/controller.go")
```

### `path.Base()`

Функция `path.Base()` возвращает путь к корневому каталогу. Вы также можете использовать `path.Base()` для генерации пути к указанному файлу относительно корневого каталога:

```go
path := path.Base()
path := path.Base("'vendor/bin'")
```

### `path.Config()`

Функция `path.Config()` возвращает путь к каталогу конфигурации. Вы также можете использовать `path.Config()` для генерации пути к указанному файлу в каталоге конфигурации:

```go
path := path.Config()
path := path.Config("app.go")
```

### `path.Database()`

Функция `path.Database()` возвращает путь к каталогу базы данных. Вы также можете использовать `path.Database()` для генерации пути к указанному файлу в каталоге базы данных:

```go
path := path.Database()
path := path.Database("factories/user_factory.go")
```

### `path.Storage()`

Функция `path.Storage()` возвращает путь к каталогу хранилища. Вы также можете использовать `path.Storage()` для генерации пути к указанному файлу в каталоге хранилища:

```go
path := path.Storage()
path := path.Storage("app/file.txt")
```

### `path.Public()`

Функция `path.Public()` возвращает путь к публичному каталогу. Вы также можете использовать `path.Public()` для генерации пути к указанному файлу в публичном каталоге:

```go
path := path.Public()
path := path.Public("css/app.css")
```

## Время

Модуль `carbon` в Goravel представляет собой расширение [golang-module/carbon](https://github.com/golang-module/carbon) и содержит возможности для перемотки времени. Более подробную информацию можно найти в официальной документации.

### `carbon.Now()`

Получить текущее время:

```go
import "github.com/goravel/framework/carbon"

carbon.Now()
```

### `carbon.SetTimezone()`

Установить временную зону:

```go
carbon.SetTimezone(carbon.UTC)
```

### `carbon.Parse()`

Получить объект `Carbon` из строки:

```go
carbon.Parse("2020-08-05 13:14:15")
```

### `carbon.FromTimestamp()`

Получить объект `Carbon` из временной метки:

```go
carbon.FromTimestamp(1577836800)
```

### `carbon.FromDateTime()`

Получить объект `Carbon` из даты и времени:

```go
carbon.FromDateTime(2020, 1, 1, 0, 0, 0)
```

### `carbon.FromDate()`

Получить объект `Carbon` из даты:

```go
carbon.FromDate(2020, 1, 1)
```

### `carbon.FromTime()`

Получить объект `Carbon` из времени:

```go
carbon.FromTime(0, 0, 0)
```

### `carbon.FromStdTime()`

Получить объект `Carbon` из `time.Time`:

```go
carbon.FromStdTime(time.Now())
```

### `carbon.IsTestNow()`

Определить, установлено ли текущее время как тестовое:

```go
carbon.IsTestNow()
```

### `carbon.SetTestNow()`

Установить текущее время как тестовое:

```go
carbon.SetTestNow(carbon.Now())
```

### `carbon.UnsetTestNow()`

Восстановить нормальное текущее время:

```go
carbon.UnsetTestNow()
```


Here's the translation into Russian:

# Помощники

[[toc]]

## Доступные методы

### Пути

|                           |                               |             |
| -----------               | --------------                | -------------- |
| [path.App()](#path-app)   | [path.Base()](#path-base)     | [path.Config()](#path-config)     |
| [path.Database()](#path-database)   | [path.Storage()](#path-storage)     | [path.Public()](#path-public)     |

### Время

|                           |                               |             |
| -----------               | --------------                | -------------- |
| [carbon.Now()](#carbon-now)   | [carbon.SetTimezone()](#carbon-settimezone)     | [carbon.Parse()](#carbon-parse)     |
| [carbon.FromTimestamp()](#carbon-fromtimestamp)   | [carbon.FromDateTime()](#carbon-fromdatetime)     | [carbon.FromDate()](#carbon-fromdate)     |
| [carbon.FromTime()](#carbon-fromtime)   | [carbon.FromStdTime()](#carbon-fromstdtime)     | [carbon.IsTestNow()](#istestnow-fromdate)     |
| [carbon.SetTestNow()](#carbon-settestnow)     | [carbon.UnsetTestNow()](#carbon-unsettestnow)     |      |

## Пути

### `path.App()`

Функция `path.App()` возвращает путь к каталогу вашего приложения. Вы также можете использовать `path.App()` для генерации пути к файлу относительно каталога приложения:

```go
import "github.com/goravel/framework/support/path"

path := path.App()
path := path.App("http/controllers/controller.go")
```

### `path.Base()`

Функция `path.Base()` возвращает путь к корневому каталогу вашего приложения. Вы также можете использовать `path.Base()` для генерации пути к указанному файлу относительно корневого каталога:

```go
path := path.Base()
path := path.Base("'vendor/bin'")
```

### `path.Config()`

Функция `path.Config()` возвращает путь к каталогу конфигурации вашего приложения. Вы также можете использовать `path.Config()` для генерации пути к указанному файлу в каталоге конфигурации:

```go
path := path.Config()
path := path.Config("app.go")
```

### `path.Database()`

Функция `path.Database()` возвращает путь к каталогу базы данных вашего приложения. Вы также можете использовать `path.Database()` для генерации пути к указанному файлу в каталоге базы данных:

```go
path := path.Database()
path := path.Database("factories/user_factory.go")
```

### `path.Storage()`

Функция `path.Storage()` возвращает путь к каталогу хранилища вашего приложения. Вы также можете использовать `path.Storage()` для генерации пути к указанному файлу в каталоге хранилища:

```go
path := path.Storage()
path := path.Storage("app/file.txt")
```

### `path.Public()`

Функция `path.Public()` возвращает путь к публичному каталогу вашего приложения. Вы также можете использовать `path.Public()` для генерации пути к указанному файлу в публичном каталоге:

```go
path := path.Public()
path := path.Public("css/app.css")
```

## Время

Модуль `carbon` в Goravel является расширением от [golang-module/carbon](https://github.com/golang-module/carbon) и содержит функциональность для перемотки времени. Дополнительную информацию можно найти в официальной документации.

### `carbon.Now()`

Получить текущее время:

```go
import "github.com/goravel/framework/carbon"

carbon.Now()
```

### `carbon.SetTimezone()`

Установить временную зону:

```go
carbon.SetTimezone(carbon.UTC)
```

### `carbon.Parse()`

Получить объект `Carbon` из строки:

```go
carbon.Parse("2020-08-05 13:14:15")
```

### `carbon.FromTimestamp()`

Получить объект `Carbon` из временной метки:

```go
carbon.FromTimestamp(1577836800)
```

### `carbon.FromDateTime()`

Получить объект `Carbon` из даты и времени:

```go
carbon.FromDateTime(2020, 1, 1, 0, 0, 0)
```

### `carbon.FromDate()`

Получить объект `Carbon` из даты:

```go
carbon.FromDate(2020, 1, 1)
```

### `carbon.FromTime()`

Получить объект `Carbon` из времени:

```go
carbon.FromTime(0, 0, 0)
```

### `carbon.FromStdTime()`

Получить объект `Carbon` из `time.Time`:

```go
carbon.FromStdTime(time.Now())
```

### `carbon.IsTestNow()`

Определить, установлено ли текущее время как тестовое:

```go
carbon.IsTestNow()
```

### `carbon.SetTestNow()`

Установить текущее время как тестовое:

```go
carbon.SetTestNow(carbon.Now())
```

### `carbon.UnsetTestNow()`

Восстановить нормальное текущее время:

```go
carbon.UnsetTestNow()
```


Here's the translation of the given text into Russian:

```plaintext
# Помощники

[[toc]]

## Доступные методы

### Пути

|                           |                               |             |
| -----------               | --------------                | -------------- |
| [path.App()](#path-app)   | [path.Base()](#path-base)     | [path.Config()](#path-config)     |
| [path.Database()](#path-database)   | [path.Storage()](#path-storage)     | [path.Public()](#path-public)     |

### Время

|                           |                               |             |
| -----------               | --------------                | -------------- |
| [carbon.Now()](#carbon-now)   | [carbon.SetTimezone()](#carbon-settimezone)     | [carbon.Parse()](#carbon-parse)     |
| [carbon.FromTimestamp()](#carbon-fromtimestamp)   | [carbon.FromDateTime()](#carbon-fromdatetime)     | [carbon.FromDate()](#carbon-fromdate)     |
| [carbon.FromTime()](#carbon-fromtime)   | [carbon.FromStdTime()](#carbon-fromstdtime)     | [carbon.IsTestNow()](#istestnow-fromdate)     |
| [carbon.SetTestNow()](#carbon-settestnow)     | [carbon.UnsetTestNow()](#carbon-unsettestnow)     |      |

## Пути

### `path.App()`

Функция `path.App()` возвращает путь к каталогу вашего приложения. Вы также можете использовать `path.App()` для генерации пути к файлу относительно каталога вашего приложения:

```go
import "github.com/goravel/framework/support/path"

path := path.App()
path := path.App("http/controllers/controller.go")
```

### `path.Base()`

Функция `path.Base()` возвращает путь к корневому каталогу вашего приложения. Вы также можете использовать `path.Base()` для генерации пути к указанному файлу относительно корневого каталога:

```go
path := path.Base()
path := path.Base("'vendor/bin'")
```

### `path.Config()`

Функция `path.Config()` возвращает путь к каталогу конфигурации вашего приложения. Вы также можете использовать `path.Config()` для генерации пути к указанному файлу в каталоге конфигурации:

```go
path := path.Config()
path := path.Config("app.go")
```

### `path.Database()`

Функция `path.Database()` возвращает путь к каталогу базы данных вашего приложения. Вы также можете использовать `path.Database()` для генерации пути к указанному файлу в каталоге базы данных:

```go
path := path.Database()
path := path.Database("factories/user_factory.go")
```

### `path.Storage()`

Функция `path.Storage()` возвращает путь к каталогу хранилища вашего приложения. Вы также можете использовать `path.Storage()` для генерации пути к указанному файлу в каталоге хранилища:

```go
path := path.Storage()
path := path.Storage("app/file.txt")
```

### `path.Public()`

Функция `path.Public()` возвращает путь к публичному каталогу вашего приложения. Вы также можете использовать `path.Public()` для генерации пути к указанному файлу в публичном каталоге:

```go
path := path.Public()
path := path.Public("css/app.css")
```

## Время

Модуль `carbon` в Goravel представляет собой расширение от [golang-module/carbon](https://github.com/golang-module/carbon) и содержит функции для работы с временем. Дополнительную информацию можно найти в официальной документации.

### `carbon.Now()`

Получить текущее время:

```go
import "github.com/goravel/framework/carbon"

carbon.Now()
```

### `carbon.SetTimezone()`

Установить временную зону:

```go
carbon.SetTimezone(carbon.UTC)
```

### `carbon.Parse()`

Получить объект `Carbon` из строки:

```go
carbon.Parse("2020-08-05 13:14:15")
```

### `carbon.FromTimestamp()`

Получить объект `Carbon` из временной метки:

```go
carbon.FromTimestamp(1577836800)
```

### `carbon.FromDateTime()`

Получить объект `Carbon` из даты и времени:

```go
carbon.FromDateTime(2020, 1, 1, 0, 0, 0)
```

### `carbon.FromDate()`

Получить объект `Carbon` из даты:

```go
carbon.FromDate(2020, 1, 1)
```

### `carbon.FromTime()`

Получить объект `Carbon` из времени:

```go
carbon.FromTime(0, 0, 0)
```

### `carbon.FromStdTime()`

Получить объект `Carbon` из `time.Time`:

```go
carbon.FromStdTime(time.Now())
```

### `carbon.IsTestNow()`

Определить, установлено ли текущее время как тестовое:

```go
carbon.IsTestNow()
```

### `carbon.SetTestNow()`

Установить текущее время как тестовое:

```go
carbon.SetTestNow(carbon.Now())
```

### `carbon.UnsetTestNow()`

Восстановить нормальное текущее время:

```go
carbon.UnsetTestNow()
```