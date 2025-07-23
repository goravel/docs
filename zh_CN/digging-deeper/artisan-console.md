# Artisan 控制台

[[toc]]

## 简介

Artisan 是 Goravel 附带的用于与命令行交互的 CLI 工具。 你可以使用
`facades.Artisan()`来访问它。 这个工具有几个有用的命令，可以帮助你开发应用程序。
使用以下命令查看所有可用的命令。 You can access it using `facades.Artisan()`. This tool has several useful commands that can assist you in the development of your application. Utilize the following command to view all available commands.

```shell
您可以将一组命令设置为相同的类别，方便在`go run .`中使用。 artisan list\`中使用：
```

每个命令都包含了「help」，它会显示和概述命令的可用参数及选项。只需要在命令前加上 help 即可查看命令帮助界面： 每个命令还有一个"帮助"功能，用于显示和解释与命令相关的参数和选项。 要
查看帮助屏幕，只需在命令名称前添加"help"。

```shell
go run . artisan help migrate
```

与其重复输入 `go run . artisan ...` 命令，你可能想通过以下
终端命令在你的 shell 配置中添加一个别名：

```shell
echo -e "\r\nalias artisan=\"go run . artisan\"" >>~/.zshrc
```

然后你可以像这样简单地运行你的命令：

```shell
artisan make:controller DemoController
```

你也可以像这样使用 `artisan` shell 脚本：

```shell
./artisan make:controller DemoController
```

### 生成命令

你可以使用 `make:command` 命令在 `app/console/commands` 目录中创建一个新命令。 不用担心如果
你的应用程序中不存在这个目录，它会在你第一次运行 `make:command` 命令时被创建： Don't worry if this directory does not exist in your application, it will be created the first time you run the `make:command` command:

```shell
go run . artisan make:command SendEmails
go run . artisan make:command user/SendEmails
```

### 命令结构

生成命令后，为结构体的 signature 和 description 属性分配合适的值。 当你的命令被执行时，
`Handle` 方法将被调用。 你需要在这个方法中实现你的逻辑。 The `Handle` method will be called when your command is executed. You need to implement your logic in this method.

```go
package commands

import (
  "github.com/goravel/framework/contracts/console"
  "github.com/goravel/framework/contracts/console/command"
)

type SendEmails struct {
}

// Signature 控制台命令的名称和签名。
func (receiver *SendEmails) Signature() string {
  return "send:emails"
}

// Description 控制台命令的描述。
func (receiver *SendEmails) Description() string {
  return "发送邮件"
}

// Extend 控制台命令的扩展。
func (receiver *SendEmails) Extend() command.Extend {
  return command.Extend{}
}

// Handle 执行控制台命令。
func (receiver *SendEmails) Handle(ctx console.Context) error {
  return nil
}
```

## 命令输入/输出

### 获取输入

When you write console commands, it's typical to collect user input through `arguments` or `options`. 当你编写控制台命令时，通常会通过 `arguments` 或 `options` 收集用户输入。 使用 Goravel，
获取用户提供的参数和选项非常简单。

#### Arguments

按照命令后的参数：

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

Options, like arguments, are another form of user input. Options are prefixed by two hyphens (--) when they are provided via the command line.

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

用法：

```shell
go run . artisan emails --lang=Chinese
go run . artisan emails -l=Chinese
```

注意：当同时使用参数和选项时，请在参数之前定义选项。 示例： Example:

```shell
// 正确
go run . artisan emails --lang=Chinese name
// 错误
go run . artisan emails name --lang=Chinese name
```

除了`command.StringFlag`，我们还可以使用其他类型的`Flag`和`Option*`：`StringSliceFlag`、`BoolFlag`、
`Float64Flag`、`Float64SliceFlag`、`IntFlag`、`IntSliceFlag`、`Int64Flag`、`Int64SliceFlag`。

### 提示输入

#### 提问

除了参数和选项，你还可以在命令执行过程中提示用户输入。 该`Ask`方法将使用给定的问题提示用户并返回他们的回答： The `Ask` method will prompt the user with the given question and return their response:

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
    name, err := ctx.Ask("What is your name?", console.AskOption{
        Default: "Krishan",
    })
    
    return err
}

// Available options
type AskOption struct {
    // Default 输入的默认值。
    Default string
    // Description 输入的描述。
    Description string
    // Lines 输入的行数。(用于多行文本)
    Lines int
    // Limit 输入的字符限制。
    Limit int
    // Multiple 确定输入是单行还是多行文本
    Multiple bool
    // Placeholder 输入的占位符。
    Placeholder string
    // Prompt 提示消息。(用于单行输入)
    Prompt string
    // Validate 输入验证函数。
    Validate func(string) error
}
```

此外，您可以将选项作为可选的第二个参数传递给`Ask`方法：

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
    password, err := ctx.Secret("请输入密码：", console.SecretOption{
        Validate: func (s string) error {
            if len(s) < 8 {
                return errors.New("密码长度应至少为8个字符")
            }
            return nil
        },
    })
    
    return err
}

// 可用选项
type SecretOption struct {
    // Default 输入的默认值。
    Default string
    // Description 输入的描述。
    Description string
    // Limit 输入的字符限制。
    Limit int
    // Placeholder 输入的占位符。
    Placeholder string
    // Validate 输入的验证函数。
    Validate func(string) error
}
```

有时您可能需要隐藏用户输入,例如在提示输入密码时。 您可以使用`Secret`方法来
隐藏用户输入： You can use the `Secret` method to hide the user input:

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
  email, err := ctx.Ask("What is your email address?")
  
  return err
}
```

#### 确认操作

If you need to ask the user to confirm an action before proceeding, you may use the `Confirm` method. 如果您需要在继续之前询问用户确认操作，可以使用`Confirm`方法。 默认情况下，除非用户选择肯定选项，否则此方法将返回`false`。

```go
if answer, _ := ctx.Confirm("您确定要继续吗？"); !answer {
    // ...
}
```

您还可以向`Confirm`方法传递第二个参数，以自定义默认值、肯定和否定按钮的标签：

```go
if answer, _ := ctx.Confirm("您是否希望继续？", console.ConfirmOption{
 Default : true,
 Affirmative : "是",
 Negative : "否",
}) {
    // ...
}

// 可用选项
type ConfirmOption struct {
    // Affirmative 肯定按钮的标签。
    Affirmative string
    // Default 输入的默认值。
    Default bool
    // Description 输入的描述。
    Description string
    // Negative 否定按钮的标签。
    Negative string
}
```

#### 单选问题

如果您需要让用户从选项列表中选择一个选项，可以使用`Choice`方法。 `Choice`方法将返回所选选项的值： 如果你需要让用户从一组选项中选择一个选项，你可以使用 `Choice` 方法。`Choice` 方法将返回所选选项的值：

```go
question := "你最喜欢的编程语言是什么？"
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
    // Default 输入的默认值。
    Default string
    // Description 输入的描述。
    Description string
    // Validate 输入验证函数。
    Validate func(string) error
}
```

此外，您可以将选项作为可选的第二个参数传递给`Choice`方法：

```go
question := "您最喜欢的编程语言是什么？"
options := []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP"},
    {Key: "python", Value: "Python"},
    {Key: "cpp", Value: "C++", Selected: true},
}
color, err := ctx.Choice(question, options)
```

#### 多选问题

如果你需要让用户从选项列表中选择多个选项，你可以使用`MultiSelect`方法。 `MultiSelect`方法将返回所选选项的值： The `MultiSelect` method will return the values of the selected options:

```go
question := "你最喜欢的编程语言是什么？"
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
    // Default 输入的默认值。
    Default []string
    // Description 输入的描述。
    Description string
    // Filterable 决定是否可以过滤选项，输入 `/` 开始过滤。
    Filterable bool
    // Limit 可以选择的选项数量限制。
    Limit int
    // Validate 输入验证函数。
    Validate func([]string) error
}
```

此外，你可以将选项作为可选的第二个参数传递给`MultiSelect`方法：

```go
question := "你最喜欢的编程语言有哪些？"
options := []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP"},
    {Key: "python", Value: "Python"},
    {Key: "cpp", Value: "C++", Selected: true},
}
colors, err := ctx.MultiSelect(question, options)
```

### 输出内容

Sometimes you may need to write output to the console. 有时你可能需要向控制台写入输出。 Goravel 提供了几种方法来帮助你向控制台写入输出。 每种方法都有其适当的彩色输出。 例如，`Error` 将以红色显示文本。 Each of the method have their appropriate colorized output. For example, `Error` will display the text in red.

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
  ctx.Comment("这是一条注释消息")
  ctx.Info("这是一条信息消息")
  ctx.Error("这是一条错误消息")
  ctx.Line("这是一条行消息")
  ctx.Warning("这是一条警告消息")
  return nil
}
```

您可以使用 `NewLine` 方法在控制台中写入新行：

```go
// 写入单个空行
ctx.NewLine()

// 写入多个空行
ctx.NewLine(2)
```

#### Progress Bars

For long-running tasks, it is often helpful to provide the user with some indication of how much time the task will take. 对于长时间运行的任务，通常向用户提供任务将花费多长时间的指示会很有帮助。 您可以使用 `WithProgressBar` 方法来显示进度条。

```go
items := []any{"item1", "item2", "item3"}
_, err := ctx.WithProgressBar(items, func(item any) error {
    // performTask(item)
    return nil
})
```

Sometimes you may need to update the progress bar manually. 有时您可能需要手动更新进度条。 您可以使用 `CreateProgressBar` 方法来更新进度条：

```go
users := []string{"user1", "user2", "user3"}
bar := ctx.CreateProgressBar(len(users))

err := bar.Start()

for _, user := range users {
    // 处理用户
    bar.Advance()
 
 // 休眠一段时间以模拟处理过程
    time.Sleep(time.Millisecond * 50)
}

err = bar.Finish()
```

#### Spinner

如果您需要在任务运行时显示旋转器，可以使用`Spinner`方法。

```go
err := ctx.Spinner("加载中...", console.SpinnerOption{
    Action: func() error {
        // 何时停止旋转器
        time.Sleep(2 * time.Second)
        return nil
    },
})
```

## 类别

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

所有的控制台命令都需要在 `app\console\kernel.go` 的 `Commands` 函数中注册。

```go
func (kernel Kernel) Commands() []console.Command {
  return []console.Command{
    &commands.SendEmails{},
  }
}
```

## 以编程方式执行命令

有时您可能希望在 CLI 之外执行 Artisan 命令，您可以使用 `facades.Artisan()` 上的 `Call` 方法来操作。

```go
facades.Route().Get("/", func(c *gin.Context) {
  facades.Artisan().Call("emails")
  facades.Artisan().Call("emails --lang Chinese name") // 带参数和选项
})
```

## 禁用打印颜色

有些命令默认会打印颜色，例如 `list` 命令，但在某些终端或日志中颜色值会是乱码，这时你可以使用 `--no-ansi` 选项禁用打印颜色： However, in some terminals or logs, the color values may be garbled. You can use the `--no-ansi` option to disable the print colors:

```shell
go run . artisan list
```
