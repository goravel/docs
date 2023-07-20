# Консоль Artisan

[[toc]]

## Введение

Artisan - это интерфейс командной строки, включенный в Goravel, который можно использовать с помощью `facades.Artisan()`. Он предоставляет несколько полезных команд, которые помогут вам во время разработки вашего приложения. Вы можете использовать следующую команду, чтобы получить список всех команд:

```go
go run . artisan list
```

Каждая команда также включает "help", который отображает и описывает доступные аргументы и параметры команды. Чтобы просмотреть справочный экран, добавьте перед именем команды ключевое слово `help`:

```go
go run . artisan help migrate
```

Вместо того чтобы повторять команду `go run . artisan ...`, вы можете добавить псевдоним в конфигурацию оболочки с помощью следующей команды в терминале:

```shell
echo -e "\r\nalias artisan=\"go run . artisan\"" >>~/.zshrc
```

Затем вы можете запускать команды просто так:

```shell
artisan make:controller DemoController
```

### Создание команд

Вы можете использовать команду `make:command` для создания новой команды в директории `app/console/commands`. Не беспокойтесь, если этой директории еще нет в вашем приложении - она будет создана при первом запуске команды `make:command`:

```go
go run . artisan make:command SendEmails
go run . artisan make:command user/SendEmails
```

### Структура команды

После создания вашей команды вы должны определить подходящие значения для свойств signature и description вашей структуры. Метод `handle` будет вызван при выполнении вашей команды. В этом методе вы можете оптимизировать вашу логику.

```go
package commands

import (
  "github.com/goravel/framework/contracts/console"
  "github.com/goravel/framework/contracts/console/command"
)

type SendEmails struct {
}

//Signature The name and signature of the console command.
func (receiver *SendEmails) Signature() string {
  return "send:emails"
}

//Description The console command description.
func (receiver *SendEmails) Description() string {
  return "Send emails"
}

//Extend The console command extend.
func (receiver *SendEmails) Extend() command.Extend {
  return command.Extend{}
}

//Handle Execute the console command.
func (receiver *SendEmails) Handle(ctx console.Context) error {
  return nil
}
```

## Определение ожидаемых входных данных

При написании команд консоли часто требуется собирать входные данные от пользователя с помощью аргументов или параметров. Goravel облегчает получение аргументов и параметров, которые вводит пользователь.

### Аргументы

Следуйте за командой аргументы:

```
go run . artisan send:emails NAME EMAIL
```

Получить аргументы:

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
  name := ctx.Argument(0)
  email := ctx.Argument(1)
  all := ctx.Arguments()

  return nil
}
```

### Параметры

Параметры - это еще одна форма ввода пользователя. Параметры предваряются двумя дефисами (--) при вводе с помощью командной строки.

Определение параметра:

```go
func (receiver *ListCommand) Extend() command.Extend {
  return command.Extend{
    Flags: []command.Flag{
      &command.StringFlag{
        Name:    "lang",
        Value:   "default",
        Aliases: []string{"l"},
        Usage:   "language for the greeting",
      },
    },
  }
}
```

Получение параметра:

```go
func (receiver *ListCommand) Handle(ctx console.Context) error {
  lang := ctx.Option("lang")

  return nil
}
```

Использование:

```
go run . artisan emails --lang chinese
go run . artisan emails -l chinese
```

Примечание: при использовании и аргументов, и параметров параметры должны быть определены перед аргументами. Пример:

```
// Верно
go run . artisan emails --lang chinese name
// Неверно
go run . artisan emails name --lang chinese name
```

Кроме `command.StringFlag`, вы также можете использовать другие типы `Flag` и `Option*`: `StringSliceFlag

`, `BoolFlag`, `Float64Flag`, `Float64SliceFlag`, `IntFlag`, `IntSliceFlag`, `Int64Flag`, `Int64SliceFlag`.

### Категория

Вы можете установить для группы команд одну и ту же категорию, что удобно при использовании `go run . artisan list`:

```go
//Extend The console command extend.
func (receiver *ConsoleMakeCommand) Extend() command.Extend {
  return command.Extend{
    Category: "make",
  }
}
```

## Регистрация команд

Все ваши команды консоли должны быть зарегистрированы в функции `Commands` файла `app\console\kernel.go`.

```go
func (kernel Kernel) Commands() []console.Command {
  return []console.Command{
    &commands.SendEmails{},
  }
}
```

## Программное выполнение команд

Иногда вы можете захотеть выполнить команду Artisan вне консоли. Для этого вы можете использовать метод `Call` из `facades.Artisan()`.

```go
facades.Route().GET("/", func(c *gin.Context) {
  facades.Artisan().Call("emails")
  facades.Artisan().Call("emails --lang chinese name") // С аргументами и параметрами
})
```

<CommentService/>