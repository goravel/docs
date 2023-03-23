# Artisan 命令行

[[toc]]

## 简介

Artisan 是 Goravel 自带的命令行工具，该模块可以使用 `facades.Artisan` 进行操作。它提供了许多有用的命令，这些命令可以在构建应用时为你提供帮助。你可以通过命令查看所有可用的 Artisan 命令：

```go
go run . artisan list
```

每个命令都包含了「help」，它会显示和概述命令的可用参数及选项。只需要在命令前加上 help 即可查看命令帮助界面：

```go
go run . artisan help migrate
```

如果您不想重复输入 `go run . artisan ...` 命令，你可以在终端中为这个命令添加一个别名：

```shell
echo -e "\r\nalias artisan=\"go run . artisan\"" >>~/.zshrc
```

随后您就可以简单的运行以下命令：

```shell
artisan make:controller DemoController
```

### 生成命令

使用 `make:command` 命令将在 `app/console/commands` 目录中创建一个新的命令。如果你的应用程序中不存在此目录，请不要担心，它将在你第一次运行 make:command 命令时自动创建：

```go
go run . artisan make:command SendEmails
```

### 命令结构

生成命令后，需要给该类的 signature 和 description 属性定义适当的值。执行命令时将调用`handle`方法。你可以将命令逻辑放在此方法中。

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
  return "emails"
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

## 定义输入

在编写控制台命令时，通常是通过参数和选项来收集用户输入的。 Goravel 让你可以非常方便的获取用户输入的内容。

### 参数

直接在命令后跟参数：

```
go run . artisan send:emails NAME EMAIL
```

获取参数：

```go
func (receiver *ListCommand) Handle(ctx console.Context) error {
  name := ctx.Argument(0)
  email := ctx.Argument(1)
  all := ctx.Arguments()

  return nil
}
```

### 选项

选项类似于参数，是用户输入的另一种形式。在命令行中指定选项的时候，它们以两个短横线 (–) 作为前缀。

定义：

```go
func (receiver *ListCommand) Extend() command.Extend {
  return command.Extend{
    Flags: []command.Flag{
      {
        Name:    "lang",
        Value:   "default",
        Aliases: []string{"l"},
        Usage:   "language for the greeting",
      },
    },
  }
}
```

获取：

```go
func (receiver *ListCommand) Handle(ctx console.Context) error {
  lang := ctx.Option("lang")

  return nil
}
```

使用：

```
go run . artisan emails --lang chinese
go run . artisan emails -l chinese
```

注意：同时使用参数与选项时，选项要在参数之前定义，例如：

```
// 正确
go run . artisan emails --lang chinese name
// 错误
go run . artisan emails name --lang chinese name
```

### 分类

可以将一组命令设置为同一个分类，方便在 `go run . artisan list` 中查看：

```go
// Extend The console command extend.
func (receiver *ConsoleMakeCommand) Extend() command.Extend {
  return command.Extend{
    Category: "make",
  }
}
```

## 注册命令

你的所有命令都需要在 `app\console\kernel.go` 文件的 `Commands` 方法中注册。

```go
func (kernel Kernel) Commands() []console.Command {
  return []console.Command{
    &commands.SendEmails{},
  }
}
```

## 以编程方式执行命令

有时你可能希望在 CLI 之外执行 Artisan 命令，可以使用 `facades.Artisan` 上的 `Call` 方法来完成此操作。

```go
facades.Route.GET("/", func(c *gin.Context) {
  facades.Artisan.Call("emails")
  facades.Artisan.Call("emails --lang chinese name") // 携带参数与选项
})
```

<CommentService/>