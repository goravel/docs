# Artisan 命令行

[[toc]]

## 简介

Artisan 是 Goravel 自带的命令行工具。 该模块可以使用 `facades.Artisan()` 进行操作。 它提供了许多有用的命令，这些命令可以在构建应用时为你提供帮助。 你可以通过命令查看所有可用的 Artisan 命令。

```shell
./artisan list

# 或
go run . artisan list
```

每个命令都包含了一个 `help` 参数，它会显示命令的可用参数及选项。

```shell
./artisan migrate --help
```

如果不想重复输入 `./artisan ...` 命令，你可以在终端中为这个命令添加一个别名：

```shell
echo -e "\r\nalias artisan=\"go run . artisan\"" >>~/.zshrc
```

随后你就可以简单的运行以下命令：

```shell
artisan make:controller DemoController
```

你也可以使用 `artisan` shell 脚本运行内置命令。

### 生成命令

使用 `make:command` 命令将在 `app/console/commands` 目录中创建一个新的命令。 如果你的应用程序中不存在此目录，请不要担心，它将在你第一次运行 make:command 命令时自动创建：

```shell
./artisan make:command SendEmails
./artisan make:command user/SendEmails
```

### 注册命令

所有命令都应通过 `bootstrap/app.go` 文件中的 `WithCommands` 函数进行注册：

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithCommands(Commands).
		WithConfig(config.Boot).
		Create()
}
```

通过 `make:command` 创建的新命令将自动注册到 `bootstrap/commands.go::Commands()` 函数中，并且该函数将由 `WithCommands` 调用。 如果你自行创建命令文件，则需要手动注册。

### 过滤命令

可能需要在不同环境中限定内置 Artisan 命令的注册范围——例如，在生产环境中隐藏 `make:*`、`package:*` 和 `vendor:publish` 等开发命令。 `ApplicationBuilder` 上的 `WithCommandsFilter` 方法允许您返回一个需要保留的命令签名白名单：

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithCommands(Commands).
		WithCommandsFilter(func() []string {
			if facades.Config().GetString("app.env") == "production" {
				return []string{
					"up", "down", "key:generate", "about",
					"schedule:*", // glob
					"queue:*",    // glob
				}
			}
			return nil // keep everything in other environments
		}).
		WithConfig(config.Boot).
		Create()
}
```

回调在构建时运行一次，每个条目通过以下两种方式之一与 `command.Signature()` 进行匹配：

- **精确匹配**（无通配符）——签名必须与条目完全匹配。
- **Glob 匹配**（条目包含 `*`）—— 使用 `path.Match` 检查。 `*` 匹配任何非 `/` 字符序列。

返回值决定过滤行为：

- **方法未调用**——保留所有命令（默认）。
- **返回 `nil`**——保留所有命令（不应用过滤）。
- **返回 `[]string{}`**——丢弃所有命令。
- **返回条目**——仅保留签名匹配条目的命令。

> 注意：过滤器适用于所有命令，包括通过 `WithCommands` 添加的命令，因此用户无法通过手动添加命令来绕过过滤器。

### 命令结构

生成命令后，需要给该类的 signature 和 description 属性定义适当的值。 执行命令时将调用`handle`方法。 你可以将命令逻辑放在此方法中。

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
./artisan send:emails SUBJECT EMAIL_1 EMAIL_2
```

定义：

```go
// send:emails <subject> <email...>
func (receiver *SendEmails) Extend() command.Extend {
	return command.Extend{
		Arguments: []command.Argument{
			&command.ArgumentString{
				Name:     "subject",
				Usage:    "subject of email",
				Required: true,
			},
			&command.ArgumentStringSlice{
				Name:  "emails",
				Usage: "target emails",
				Min:   1,
				Max:   -1,
			},
		},
	}
}
```

支持的参数类型：`ArgumentFloat32`, `ArgumentFloat64`, `ArgumentInt`, `ArgumentInt8`, `ArgumentInt16`, `ArgumentInt32`, `ArgumentInt64`, `ArgumentString`, `ArgumentUint`, `ArgumentUint8`, `ArgumentUint16`, `ArgumentUint32`, `ArgumentUint64`, `ArgumentTimestamp`, `ArgumentFloat32Slice`, `ArgumentFloat64Slice`, `ArgumentIntSlice`, `ArgumentInt8Slice`, `ArgumentInt16Slice`, `ArgumentInt32Slice`, `ArgumentInt64Slice`, `ArgumentStringSlice`, `ArgumentUintSlice`, `ArgumentUint8Slice`, `ArgumentUint16Slice`, `ArgumentUint32Slice`, `ArgumentUint64Slice`, `ArgumentTimestampSlice`

基础参数类型支持以下字段：

```go
	Name     string // 名称
	Value    T      // 默认值
	Usage    string // 用法
	Required bool   // 是否为必需
```

切片参数类型字段：

```go
	Name  string // 名称
	Value T      // 默认值
	Usage string // 用法
	Min   int    // 最小出现次数
	Max   int    // 最大出现次数，设置为 -1 表示无限制
```

时间戳参数额外支持 `Layouts []string` 字段，应填入[支持的布局](https://pkg.go.dev/time#pkg-constants)

获取参数：

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
  subject := ctx.ArgumentString("subject")
  emails := ctx.ArgumentStringSlice("emails")

  return nil
}
```

也可以直接访问参数：

```go
func (receiver *ListCommand) Handle(ctx console.Context) error {
  name := ctx.Argument(0)
  email := ctx.Argument(1)
  all := ctx.Arguments()

  return nil
}
```

#### 选项

选项类似于参数，是用户输入的另一种形式。 在命令行中指定选项的时候，它们以两个短横线 (–) 作为前缀。

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
./artisan emails --lang Chinese
./artisan emails -l Chinese
```

除了 `command.StringFlag`，我们还可以其他类型的 `Flag` 与 `Option*`：`StringSliceFlag`, `BoolFlag`, `Float64Flag`, `Float64SliceFlag`, `IntFlag`, `IntSliceFlag`, `Int64Flag`, `Int64SliceFlag`。

### 交互式输入

#### 问题

除了参数和选项，你还可以在命令执行过程中提示用户输入。 `Ask` 方法将提示用户回答问题并返回他们的响应：

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
  email, err := ctx.Ask("What is your email address?")

  return err
}
```

另外，你可以传递第二个参数给 `Ask` 方法：

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
    name, err := ctx.Ask("What is your name?", console.AskOption{
        Default: "Krishan",
    })

    return err
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

有时你可能需要隐藏用户输入，例如提示用户输入密码。 你可以使用 `Secret` 方法隐藏用户输入：

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
    password, err := ctx.Secret("What is the password?", console.SecretOption{
        Validate: func (s string) error {
            if len(s) < 8 {
                return errors.New("password length should be at least 8")
            }
            return nil
        },
    })

    return err
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

如果你需要在继续之前要求用户确认操作，你可以使用 `Confirm` 方法。 默认情况下，除非用户选择肯定选项，否则此方法将返回 `false`。

```go
if ctx.Confirm("Do you wish to continue?") {
    // ...
}
```

你还可以传递第二个参数给 `Confirm` 方法：

```go
if ctx.Confirm("Do you wish to continue?", console.ConfirmOption {
	Default : true,
	Affirmative : "确认",
	Negative : "取消",
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

如果你需要让用户从一组选项中选择一个选项，你可以使用 `Choice` 方法。 `Choice` 方法将返回所选选项的值：

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

如果你需要让用户从一组选项中选择多个选项，你可以使用 `MultiSelect` 方法。 `MultiSelect` 方法将返回所选选项的值：

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

有时你可能需要将输出写入控制台。 Goravel 提供了几种方法来帮助你将输出写入控制台。 每种方法都有适当的颜色化输出。 例如，`Error` 将以红色显示文本。

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

以下辅助函数可以向控制台打印不同颜色的文本：

```go
ctx.Green("这是一条绿色消息")
ctx.Greenln("这是一条绿色换行消息")
ctx.Red("这是一条红色消息")
ctx.Redln("这是一条红色换行消息")
ctx.Yellow("这是一条黄色消息")
ctx.Yellowln("这是一条黄色换行消息")
ctx.Black("这是一条黑色消息")
ctx.Blackln("这是一条黑色换行消息")
```

你可以使用 `NewLine` 方法在控制台中写入新行：

```go
ctx.NewLine()
ctx.NewLine(2)
```

#### 表格

您可以使用 `Table` 方法以表格形式渲染结构化数据。 该方法接受表头和行，并将渲染后的表格直接写入控制台：

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
    headers := []string{"ID", "Email", "Status"}
    rows := [][]string{
        {"1", "a@example.com", "Queued"},
        {"2", "b@example.com", "Sent"},
    }

    ctx.Table(headers, rows)

    return nil
}
```

你可以将 `console.TableOption` 作为第三个参数传递，以自定义边框、尺寸和样式。

```go
ctx.Table(headers, rows, console.TableOption{
    Width: 80,
})
```

#### 进度条

对于长时间运行的任务，通常需要向用户提供任务所需时间的指示。 你可以使用 `WithProgressBar` 方法显示一个进度条。

```go
items := []any{"item1", "item2", "item3"}
_, err := ctx.WithProgressBar(items, func(item any) error {
    // performTask(item)
    return nil
})
```

有时你可能需要手动更新进度条。 你可以使用 `CreateProgressBar` 方法来更新进度条：

```go
users := []string{"user1", "user2", "user3"}
bar := ctx.CreateProgressBar(len(users))

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

### 分隔符

要显示终端宽度的分隔符，可以使用 `Divider` 方法。

```go
ctx.Divider()     // ----------
ctx.Divider("=>") // =>=>=>=>=>
```

## 优雅关闭

默认情况下，按 `Ctrl+C`（或发送 `SIGTERM`）会取消传递给 `Handle` 的 `console.Context`。 框架在 goroutine 中运行 `Handle`，因此一旦信号触发且进程退出，它会返回 `context.Canceled`。 需要释放资源的命令——关闭网络监听器、排空队列、刷新缓冲区——可以通过实现可选的 `console.Shutdownable` 接口来选择清理回调。

```go
type Shutdownable interface {
  Shutdown(ctx Context) error
}
```

当命令实现了 `Shutdownable`，框架会让 `Handle` 与信号上下文进行竞争。 如果 `Handle` 先返回，框架随后会使用一个新的 `console.Context`（原上下文已被取消）和 30 秒的预算调用 `Shutdown`，以便命令完成任何清理工作。 如果信号先触发，框架会使用相同的新建上下文和 30 秒的预算调用 `Shutdown`，然后返回；`Handle` 将留在自己的 goroutine 中继续运行，进程随后退出。

`console.Context` 现在嵌入了 `context.Context`，因此命令可以直接使用 `<-ctx.Done()`，将 `ctx` 传递给期望 `context.Context` 的函数，并调用 `ctx.Deadline()` / `ctx.Err()` / `ctx.Value(key)` 而无需访问器。

```go
package commands

import (
  "errors"
  "net/http"

  "github.com/goravel/framework/contracts/console"
  "github.com/goravel/framework/contracts/console/command"
)

type Serve struct {
  server *http.Server
}

func (r *Serve) Signature() string   { return "serve" }
func (r *Serve) Description() string { return "启动HTTP服务器" }
func (r *Serve) Extend() command.Extend {
  return command.Extend{Category: "server"}
}

func (r *Serve) Handle(ctx console.Context) error {
  if err := r.server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
    return err
  }
  return nil
}

func (r *Serve) Shutdown(ctx console.Context) error {
  ctx.Info("收到信号，正在优雅关闭...")
  return r.server.Shutdown(ctx)
}
```

内置的 `schedule:run` 命令是一个实际例子。 它的 `Handle` 在 `schedule.Run()` 上阻塞，当收到信号时框架调用 `Shutdown`，后者委托给 `schedule.Shutdown(ctx)`，以便计划任务有机会完成其工作。

未实现 `Shutdownable` 的命令保持原始行为——一旦收到信号，进程立即退出。

## 分类

可以将一组命令设置为同一个分类，方便在 `./artisan list` 中查看：

```go
// Extend The console command extend.
func (receiver *ConsoleMakeCommand) Extend() command.Extend {
  return command.Extend{
    Category: "make",
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

## 禁用打印颜色

有些命令默认会打印颜色，例如 `list` 命令。 但在某些终端或日志中颜色值会是乱码。 这时你可以使用 `--no-ansi` 选项禁用打印颜色：

```shell
./artisan list --no-ansi
```
