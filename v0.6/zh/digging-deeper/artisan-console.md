# Artisan 命令行

[[toc]]

## 介绍

Artisan 是 Goravel 自带的命令行工具，该模块可以使用 `facades.Cache` 进行操作。它提供了许多有用的命令，这些命令可以在构建应用时为你提供帮助。其底层使用 [urfave/cli](https://github.com/urfave/cli) 进行功能的实现。你可以通过命令查看所有可用的 Artisan 命令：

```
go run . artisan list
```

每个命令都包含了「help」界面，它会显示和概述命令的可用参数及选项。只需要在命令前加上 help 即可查看命令帮助界面：

```
go run . artisan help migrate
```

## 编写命令

除 Artisan 提供的命令外，你也可以编写自己的自定义命令。命令位于 `app/console/commands` 目录中。

### 生成命令

要创建新命令，可以使用 make:command Artisan 命令。该命令将在 app/console/commands 目录中创建一个新的命令类。如果你的应用程序中不存在此目录，请不要担心，它将在你第一次运行 make:command 命令时自动创建：

```
go run . artisan make:command SendEmails
```

### 命令结构

生成命令后，应为该类的 signature 和 description 属性定义适当的值。当使用 `list` 命令显示命令列表时，将使用这些属性。执行命令时将调用`handle`方法。你可以将命令逻辑放在此方法中。

```
package commands

import (
  "github.com/goravel/framework/contracts/console"
  "github.com/urfave/cli/v2"
)

type SendEmails struct {
}

//Signature The name and signature of the console command.
func (receiver *SendEmails) Signature() string {
  return "emails"
}

//Description The console command description.
func (receiver *SendEmails) Description() string {
  return "Command description"
}

//Extend The console command extend.
func (receiver *SendEmails) Extend() console.CommandExtend {
  return console.CommandExtend{}
}

//Handle Execute the console command.
func (receiver *SendEmails) Handle(c *cli.Context) error {
  return nil
}
```

## 定义输入

在编写控制台命令时，通常是通过参数和选项来收集用户输入的。 Goravel 让你可以非常方便的获取用户输入的内容。

### 参数

直接在命令后跟参数：

```
go run . artisan emails NAME EMAIL
```

获取参数：

```
func (receiver *ListCommand) Handle(c *cli.Context) error {
  name := c.Args().Get(0)
  email := c.Args().Get(1)

  return nil
}
```

### 选项

选项类似于参数，是用户输入的另一种形式。在命令行中指定选项的时候，它们以两个短横线 (–) 作为前缀。

定义：

```
func (receiver *ListCommand) Extend() console.CommandExtend {
  return console.CommandExtend{
    Flags: []cli.Flag{
      &cli.StringFlag{
        Name:    "lang",
        Value:   "english",// 默认值
        Aliases: []string{"l"},// 选项简写
        Usage:   "language for the greeting",// 选项说明
      },
    },
  }
}
```

获取：

```
func (receiver *ListCommand) Handle(c *cli.Context) error {
  lang := c.String("lang")

  return nil
}
```

使用：

```
go run . artisan emails --lang chinese
go run . artisan emails -l chinese // 缩写
```

具体使用方法请参考 [urfave/cli 文档](https://github.com/urfave/cli/blob/master/docs/v2/manual.md#flags)

### 分类

可以将一组命令设置为同一个分类，方便在 `go run . artisan list` 中查看：

```
//Extend The console command extend.
func (receiver *ConsoleMakeCommand) Extend() console.CommandExtend {
  return console.CommandExtend{
    Category: "make",
  }
}
```

### 子命令

可以为一个命令设置多个子命令：

```
//Extend The console command extend.
func (receiver *SendEmails) Extend() console.CommandExtend {
  return console.CommandExtend{
    Subcommands: []*cli.Command{
      {
        Name:  "add",
        Usage: "add a new template",
        Action: func(c *cli.Context) error {
          fmt.Println("new task template: ", c.Args().First())
          return nil
        },
      },
      {
        Name:  "remove",
        Usage: "remove an existing template",
        Action: func(c *cli.Context) error {
          fmt.Println("removed task template: ", c.Args().First())
          return nil
        },
      },
    },
  }
}
```

使用：

```
go run . artisan emails add
go run . artisan emails remove
```

具体使用方法请参考 [urfave/cli 文档](https://github.com/urfave/cli/blob/master/docs/v2/manual.md#subcommands)

## 注册命令

你的所有控制台命令都在你的应用程序的 `app\console\kernel.go` 中注册，这是你的应用程序的「控制台内核」。在此文件的 `Commands` 方法中，加载所有可用的命令。

```
func (kernel Kernel) Commands() []console.Command {
  return []console.Command{
    &commands.SendEmails{},
  }
}
```

## 以编程方式执行命令

有时你可能希望在 CLI 之外执行 Artisan 命令。例如，你可能希望从路由或控制器执行 Artisan 命令。可以使用 `facades.Artisan` 上的 `Call` 方法来完成此操作。

```
facades.Route.GET("/", func(c *gin.Context) {
  facades.Artisan.Call("emails")
  facades.Artisan.Call("emails name --lang chinese") // 携带参数与选项
})
```
