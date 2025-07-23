# Color

[[toc]]

## 简介

`color` 包提供一系列的方法以便在控制台上输出带颜色的内容，该功能由 [PTerm](https://github.com/pterm/pterm) 提供驱动。

## 特定颜色

包提供了一些方法来创建特定颜色的打印。这些方法允许您轻松地为终端输出添加颜色。 These methods allow you to easily colorize terminal output.

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

### 打印方法

`contracts/support.Printer` 提供以下方法来打印或格式化带颜色的文本：

- `Print`
- `Println` - 打印文本并换行
- `Printf`
- `Sprint` - 返回带颜色的文本
- `Sprintln` - 返回带颜色的文本并换行
- `Sprintf` - 返回格式化的带颜色文本

```go
import "github.com/goravel/framework/support/color"

color.Blue().Println("Hello, Goravel!")
color.Green().Printf("Hello, %s!", "Goravel")
```

## 指定颜色

### `color.New`

`color.New` 函数创建一个新的颜色打印。您可以使用此对象来为终端的输出添加颜色。 You can use this object to colorize the output of the terminal.

```go
import "github.com/goravel/framework/support/color"

color.New(color.FgRed).Println("Hello, Goravel!")
```
