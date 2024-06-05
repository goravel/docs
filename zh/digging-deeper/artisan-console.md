# Artisan 命令行

[[toc]]

## 简介

Artisan 是 Goravel 自带的命令行工具，该模块可以使用 `facades.Artisan()` 进行操作。它提供了许多有用的命令，这些命令可以在构建应用时为你提供帮助。你可以通过命令查看所有可用的 Artisan 命令：

```shell
go run . artisan list
```

每个命令都包含了「help」，它会显示和概述命令的可用参数及选项。只需要在命令前加上 help 即可查看命令帮助界面：

```shell
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
go run . artisan make:command user/SendEmails
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

// Signature The name and signature of the console command.
func (receiver *SendEmails) Signature() string {
  return "emails"
}

// Description The console command description.
func (receiver *SendEmails) Description() string {
  return "Send emails"
}

// Extend The console command extend.
func (receiver *SendEmails) Extend() command.Extend {
  return command.Extend{}
}

// Handle Execute the console command.
func (receiver *SendEmails) Handle(ctx console.Context) error {
  return nil
}
```

## 命令 I/O

### 检索输入

在编写控制台命令时，通常是通过 `arguments` 或 `options` 来收集用户输入的。 Goravel 让你可以非常方便的获取用户输入的内容。

#### 参数

直接在命令后跟参数：

```shell
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

#### 选项

选项类似于参数，是用户输入的另一种形式。在命令行中指定选项的时候，它们以两个短横线 (–) 作为前缀。

定义：

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

获取：

```go
func (receiver *ListCommand) Handle(ctx console.Context) error {
  lang := ctx.Option("lang")

  return nil
}
```

使用：

```shell
go run . artisan emails --lang Chinese
go run . artisan emails -l Chinese
```

注意：同时使用参数与选项时，选项要在参数之前定义，例如：

```shell
// 正确
go run . artisan emails --lang Chinese name
// 错误
go run . artisan emails name --lang Chinese name
```

除了 `command.StringFlag`，我们还可以其他类型的 `Flag` 与 `Option*`：`StringSliceFlag`, `BoolFlag`, `Float64Flag`, `Float64SliceFlag`, `IntFlag`, `IntSliceFlag`, `Int64Flag`, `Int64SliceFlag`。

### 交互式输入

#### 问题

除了参数和选项，你还可以在命令执行过程中提示用户输入。`Ask` 方法将提示用户回答问题并返回他们的响应：

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
  name := ctx.Ask("What is your name?")
  email := ctx.Ask("What is your email address?")

  return nil
}
```

另外，你可以传递第二个参数给 `Ask` 方法：

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
    name := ctx.Ask("What is your name?", console.AskOption{
        Default: "Krishan",
    })
    
    return nil
}

// 可用选项
type AskOption struct {
    // 默认值
    Default string
    // 描述
    Description string
    // 输入框行数（多行文本时使用）
    Lines int
    // 限制输入字符数
    Limit int
    // 是否多行文本
    Multiple bool
    // 占位符
    Placeholder string
    // 提示（用于单行文本）
    Prompt string
    // 验证输入的函数
    Validate func(string) error
}
```

有时你可能需要隐藏用户输入，例如提示用户输入密码。你可以使用 `Secret` 方法隐藏用户输入：

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
    password := ctx.Secret("What is the password?", console.SecretOption{
        Validate: func (s string) error {
            if len(s) < 8 {
                return errors.New("password length should be at least 8")
            }
            return nil
        },
    })
    
    return nil
}

// 可用选项
type SecretOption struct {
    // 默认值
    Default string
    // 描述
    Description string
    // 字数限制
    Limit int
    // 占位符
    Placeholder string
    // 验证输入的函数
    Validate func(string) error
}
 ```

#### 确认操作

如果你需要在继续之前要求用户确认操作，你可以使用 `Confirm` 方法。默认情况下，除非用户选择肯定选项，否则此方法将返回 `false`。

```go
if !ctx.Confirm("Do you wish to continue?") {
    // ...
}
```

你还可以传递第二个参数给 `Confirm` 方法：

```go
if !ctx.Confirm("Do you wish to continue?", console.ConfirmOption{
	Default : true,
}) {
    // ...
}

// 可用选项
type ConfirmOption struct {
    // 肯定回答文本
    Affirmative string
    // 默认值
    Default bool
    // 描述
    Description string
    // 否定回答文本
    Negative string
}
```

#### 单选问题

如果你需要让用户从一组选项中选择一个选项，你可以使用 `Choice` 方法。`Choice` 方法将返回所选选项的值：

```go
question := "What is your favorite programming language?"
options := []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP"},
    {Key: "python", Value: "Python"},
    {Key: "cpp", Value: "C++", Selected: true},
}
color, err := ctx.Choice(question, options)
```

另外，你可以传递第二个参数给 `Choice` 方法：

```go
question := "What is your favorite programming language?"
options := []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP"},
    {Key: "python", Value: "Python"},
    {Key: "cpp", Value: "C++", Selected: true},
}

color, err := ctx.Choice(question, options, console.ChoiceOption{
    Default: "go",
})

// 可用选项
type ChoiceOption struct {
    // 默认值
    Default string
    // 描述
    Description string
    // 验证输入的函数
    Validate func(string) error
}
```

#### 多选问题

如果你需要让用户从一组选项中选择多个选项，你可以使用 `MultiSelect` 方法。`MultiSelect` 方法将返回所选选项的值：

```go
question := "What are your favorite programming languages?"
options := []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP"},
    {Key: "python", Value: "Python"},
    {Key: "cpp", Value: "C++", Selected: true},
}
colors, err := ctx.MultiSelect(question, options)
```

另外，你可以传递第二个参数给 `MultiSelect` 方法：

```go
question := "What are your favorite programming languages?"
options := []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP"},
    {Key: "python", Value: "Python"},
    {Key: "cpp", Value: "C++", Selected: true},
}

colors, err := ctx.MultiSelect(question, options, console.MultiSelectOption{
    Default: []string{"go", "php"},
})

// 可用选项
type MultiSelectOption struct {
    // 默认值
    Default []string
    // 描述
    Description string
    // 过滤选项，输入 `/` 开始过滤
    Filterable bool
    // 字数限制
    Limit int
    // 验证输入的函数
    Validate func([]string) error
}
```

### 文字输出

有时你可能需要将输出写入控制台。Goravel 提供了几种方法来帮助你将输出写入控制台。每种方法都有适当的颜色化输出。例如，`Error` 将以红色显示文本。

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
  ctx.Comment("This is a comment message")
  ctx.Info("This is an info message")
  ctx.Error("This is an error message")
  ctx.Line("This is a line message")
  ctx.Warning("This is a warning message")
  return nil
}
```

你可以使用 `NewLine` 方法在控制台中写入新行：

```go
ctx.NewLine()
ctx.NewLine(2)
```

#### 进度条

对于长时间运行的任务，通常需要向用户提供任务所需时间的指示。你可以使用 `WithProgressBar` 方法显示一个进度条。

```go
items := []any{"item1", "item2", "item3"}
_, err := ctx.WithProgressBar(items, func(item any) error {
    // performTask(item)
    return nil
})
```

有时你可能需要手动更新进度条。你可以使用 `ProgressBar` 方法来更新进度条：

```go
users := []string{"user1", "user2", "user3"}
bar := ctx.ProgressBar(len(users))

err := bar.Start()

for _, user := range users {
    // process user
    bar.Advance()
	
	// sleep for a while to simulate processing
	time.Sleep(time.Millisecond * 50)
}

err = bar.Finish()
```

#### 旋转器

如果你需要在任务运行时显示一个旋转器，你可以使用 `Spinner` 方法。

```go
err := ctx.Spinner("Loading...", console.SpinnerOption{
    Action: func() error {
        // when to stop the spinner
        time.Sleep(2 * time.Second)
        return nil
    },
})
```

## 分类

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

有时你可能希望在 CLI 之外执行 Artisan 命令，可以使用 `facades.Artisan()` 上的 `Call` 方法来完成此操作。

```go
facades.Route().GET("/", func(c *gin.Context) {
  facades.Artisan().Call("emails")
  facades.Artisan().Call("emails --lang Chinese name") // 携带参数与选项
})
```

<CommentService/>