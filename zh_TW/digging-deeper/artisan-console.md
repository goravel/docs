# 工匠控制台

[[toc]]

## 概述

工匠是與 Goravel 交互命令行的 CLI 工具。 你可以使用 `facades.Artisan()` 訪問它。 這個工具有幾個有用的命令，可以幫助你開發應用程序。 使用以下命令查看所有可用的命令。

```shell
go run . artisan list

# 或
./artisan list
```

Each command also has a "help" flag that shows and explains the arguments and options associated with the command:

```shell
go run . artisan migrate --help
```

如果你不想重複輸入 `go run . artisan ...` 命令，你可能想在你的外殼配置中添加一個別名，使用下面的終端命令：

```shell
echo -e "\r\nalias artisan=\"go run . artisan\"" >>~/.zshrc
```

然後你可以像這樣簡單地運行命令：

```shell
artisan make:controller DemoController
```

你也可以像這樣使用 `artisan` shell 腳本：

```shell
./artisan make:controller DemoController
```

### 生成命令

你可以使用 `make:command` 命令在 `app/console/commands` 目錄中創建一個新的命令。 如果你的應用程序中不存在此目錄，請不要擔心，首次運行 `make:command` 命令時會自動創建：

```shell
go run . artisan make:command SendEmails
go run . artisan make:command user/SendEmails
```

### 命令結構

生成命令後，為該結構的 signature 和 description 屬性分配適當的值。 當你的命令被執行時，會調用 `Handle` 方法。 你需要在此方法中實現你的邏輯。

```go
package commands

import (
  "github.com/goravel/framework/contracts/console"
  "github.com/goravel/framework/contracts/console/command"
)

type SendEmails struct {
}

// Signature 控制台命令的名稱和簽名。
func (receiver *SendEmails) Signature() string {
  return "send:emails"
}

// Description 控制台命令描述。
func (receiver *SendEmails) Description() string {
  return "發送電子郵件"
}

// Extend 控制台命令延伸。
func (receiver *SendEmails) Extend() command.Extend {
  return command.Extend{}
}

// Handle 執行控制台命令。
func (receiver *SendEmails) Handle(ctx console.Context) error {
  return nil
}
```

## 命令 I/O

### 檢索輸入

當你編寫控制台命令時，通過 `arguments` 或 `options` 收集用戶輸入是很常見的。 使用 Goravel，可以非常輕鬆的檢索用戶提供的參數和選項。

#### 參數

直接在命令後跟參數：

```shell
go run . artisan send:emails NAME EMAIL
```

獲取參數：

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
  name := ctx.Argument(0)
  email := ctx.Argument(1)
  all := ctx.Arguments()

  return nil
}
```

#### 選項

選項類似於參數，是另一種用戶輸入。 當通過命令行提供時，選項以兩個連字符（--）為前綴。

定義：

```go
func (receiver *ListCommand) Extend() command.Extend {
  return command.Extend{
    Flags: []command.Flag{
      &command.StringFlag{
        Name:    "lang",
        Value:   "default",
        Aliases: []string{"l"},
        Usage:   "問候語言",
      },
    },
  }
}
```

獲取：

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

除了 `command.StringFlag`，我們還可以使用其他類型的 `Flag` 和 `Option*`：`StringSliceFlag`、`BoolFlag`、`Float64Flag`、`Float64SliceFlag`、`IntFlag`、`IntSliceFlag`、`Int64Flag`、`Int64SliceFlag`。

### 交互式輸入

#### 問題

除了參數和選項外，你還可以在命令執行期間提示用戶輸入。 `Ask` 方法將提示用戶回答問題並返回他們的響應： `Ask` 方法將用給定的問題提示用戶並返回他們的響應：

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
  email, err := ctx.Ask("你的電子郵件地址是什麼？")

  return err
}
```

此外，你還可以將選項作為可選的第二個參數傳遞給 `Ask` 方法：

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
    name, err := ctx.Ask("你叫什麼名字？", console.AskOption{
        Default: "Krishan",
    })

    return err
}

// 可用選項
type AskOption struct {
    // 默認值
    Default string
    // 描述
    Description string
    // 行數
    Lines int
    // 字數限制
    Limit int
    // 是否多行輸入
    Multiple bool
    // 占位符
    Placeholder string
    // 提示信息（用於單行輸入）
    Prompt string
    // 驗證輸入的函數。
    Validate func(string) error
}
```

有時候你可能需要隱藏用戶的輸入，例如在提示密碼時。 你可以使用 `Secret` 方法隱藏用戶的輸入：

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
    password, err := ctx.Secret("密碼是什麼？", console.SecretOption{
        Validate: func (s string) error {
            if len(s) < 8 {
                return errors.New("密碼長度應至少為 8")
            }
            return nil
        },
    })

    return err
}

// 可用選項
type SecretOption struct {
    // 默認值
    Default string
    // 描述
    Description string
    // 字數限制
    Limit int
    // 占位符
    Placeholder string
    // 驗證輸入的函數。
    Validate func(string) error
}
```

#### 確認操作

如果你需要在繼續前請求用戶確認操作，可以使用 `Confirm` 方法。 默認情況下，除非用戶選擇肯定選項，否則此方法將返回 `false`。

```go
if ctx.Confirm("你確定要繼續嗎？") {
    // ...
}
```

你還可以向 `Confirm` 方法傳遞第二個參數以自定義默認值、肯定和否定按鈕的標籤：

```go
if ctx.Confirm("你確定要繼續嗎？", console.ConfirmOption{
	Default : true,
	Affirmative : "是",
	Negative : "否",
}) {
    // ...
}

// 可用選項
type ConfirmOption struct {
    // 肯定按鈕的標籤。
    Affirmative string
    // 默認值
    Default bool
    // 描述
    Description string
    // 否定按鈕的標籤。
    Negative string
}
```

#### 單選問題

如果你需要讓用戶從選項列表中選擇一個選項，可以使用 `Choice` 方法。 `Choice` 方法將返回所選選項的值：

```go
question := "你最喜歡的編程語言是什麼？"
options := []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP"},
    {Key: "python", Value: "Python"},
    {Key: "cpp", Value: "C++", Selected: true},
}
color, err := ctx.Choice(question, options)担当
```

此外，你還可以將選項作為可選的第二個參數傳遞給 `Choice` 方法：

```go
question := "你最喜歡的編程語言是什麼？"
options := []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP"},
    {Key: "python", Value: "Python"},
    {Key: "cpp", Value: "C++", Selected: true},
}

color, err := ctx.Choice(question, options, console.ChoiceOption{
    Default: "go",
})

// 可用選項
type ChoiceOption struct {
    // 默認值
    Default string
    // 描述
    Description string
    // 驗證輸入的函數。
    Validate func(string) error
}
```

#### 多選問題

如果你需要讓用戶從選項列表中選擇多個選項，可以使用 `MultiSelect` 方法。 `MultiSelect` 方法將返回所選選項的值：

```go
question := "你最喜歡的編程語言是什麼？"
options := []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP"},
    {Key: "python", Value: "Python"},
    {Key: "cpp", Value: "C++", Selected: true},
}
colors, err := ctx.MultiSelect(question, options)  
```

此外，你還可以將選項作為可選的第二個參數傳遞給 `MultiSelect` 方法：

```go
question := "你最喜歡的編程語言是什麼？"
options := []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP"},
    {Key: "python", Value: "Python"},
    {Key: "cpp", Value: "C++", Selected: true},
}

colors, err := ctx.MultiSelect(question, options, console.MultiSelectOption{
    Default: []string{"go", "php"},
})

// 可用選項
type MultiSelectOption struct {
    // 默認值
    Default []string
    // 描述
    Description string
    // 可篩選，輸入 `/` 開始篩選。
    Filterable bool
    // 限制可選擇的個數。
    Limit int
    // 驗證輸入的函數。
    Validate func([]string) error
}
```

### 寫輸出

有時你可能需要將輸出寫入控制台。 Goravel 提供了幾種方法來幫助你將輸出寫入控制台。 每種方法都有適合的顏色化輸出。 例如，`Error` 將以紅色顯示文本。

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
  ctx.Comment("這是一條評論消息")
  ctx.Info("這是一條信息消息")
  ctx.Error("這是一條錯誤消息")
  ctx.Line("這是一條行消息")
  ctx.Warning("這是一條警告消息")
  return nil
}
```

你可以使用 `NewLine` 方法在控制台中寫入新行：

```go
// 寫入單個空行
ctx.NewLine()

// 寫入多個空行
ctx.NewLine(2)
```

#### 進度條

對於長時間運行的任務，通常需要為用戶提供一些指示，告訴他們任務將花費多少時間。 你可以使用 `WithProgressBar` 方法顯示一個進度條。

```go
items := []any{"item1", "item2", "item3"}
_, err := ctx.WithProgressBar(items, func(item any) error {
    // performTask(item)
    return nil
})
```

有時你可能需要手動更新進度條。 你可以使用 `CreateProgressBar` 方法來更新進度條：

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

#### 旋轉器

如果你需要在任務運行時顯示一個旋轉器，你可以使用 `Spinner` 方法。

```go
err := ctx.Spinner("Loading...", console.SpinnerOption{
    Action: func() error {
        // when to stop the spinner
        time.Sleep(2 * time.Second)
        return nil
    },
})
```

## 分類

可以將一組命令設置為同一個分類，方便在 `go run . artisan list` 中查看：

```go
// Extend The console command extend.
func (receiver *ConsoleMakeCommand) Extend() command.Extend {
  return command.Extend{
    Category: "make",
  }
}
```

## 註冊命令

你的所有命令都需要在 `app\console\kernel.go` 文件的 `Commands` 方法中註冊。

```go
func (kernel Kernel) Commands() []console.Command {
  return []console.Command{
    &commands.SendEmails{},
  }
}
```

## 以程式方式執行命令

有時你可能希望在 CLI 之外執行 Artisan 命令，可以使用 `facades.Artisan()` 上的 `Call` 方法來操作這個。

```go
facades.Route().Get("/", func(c *gin.Context) {
  facades.Artisan().Call("emails")
  facades.Artisan().Call("emails --lang Chinese name") // With arguments and options
})
```

## 禁用列印顏色

一些命令默認會列印顏色，例如 `list` 命令。 然而，在某些終端或日誌中，顏色值可能會亂碼。 某些命令默認輸出顏色，例如 `list` 命令。 但是，在某些終端或日誌中，顏色值可能會亂碼。 您可以使用 `--no-ansi` 選項禁用輸出顏色：

```shell
go run . artisan list --no-ansi
```
