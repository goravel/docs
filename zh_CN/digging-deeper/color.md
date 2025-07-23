# 颜色

[[toc]]

## 简介

`color` 包提供了一系列函数，使用 [PTerm](https://github.com/pterm/pterm) 库为终端输出添加颜色。

## 特定颜色

该包提供了为特定颜色创建打印器的方法。 这些方法使您能够轻松地为终端输出添加颜色。 These methods allow you to easily colorize terminal output.

- `color.Red()`
- `color.Green()`
- `color.Yellow()`
- `color.Blue()`
- `color.Magenta()`
- `color.Cyan()`
- `color.White()`
- `color.Black()`
- `color.Gray()`
- `color.Default()`

### 打印机方法

`contracts/support.Printer` 提供以下方法来打印或格式化带颜色的文本：

- `Print` - 打印文本
- `Println` - 打印文本并换行
- `Printf` - 打印格式化文本
- `Sprint` - 返回带颜色的文本
- `Sprintln` - 返回带颜色的文本并换行
- `Sprintf` - 返回格式化的带颜色文本

```go
import "github.com/goravel/framework/support/color"

color.Blue().Println("你好，Goravel！")
color.Green().Printf("你好，%s！", "Goravel")
```

## 自定义颜色

### `color.New`

`color.New` 函数创建一个新的颜色打印器。 您可以使用此对象来为终端输出着色。 You can use this object to colorize the output of the terminal.

```go
import "github.com/goravel/framework/support/color"

color.New(color.FgRed).Println("你好，Goravel！")
```
