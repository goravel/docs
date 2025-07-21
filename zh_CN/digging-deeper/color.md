# Color

[[toc]]

## 简介

`color` 包提供一系列的方法以便在控制台上输出带颜色的内容，该功能由 [PTerm](https://github.com/pterm/pterm) 提供驱动。

## 特定颜色

包提供了一些方法来创建特定颜色的打印。这些方法允许您轻松地为终端输出添加颜色。

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

- `Print`
- `Println`
- `Printf`
- `Sprint`
- `Sprintln`
- `Sprintf`

```go
import "github.com/goravel/framework/support/color"

color.Blue().Println("Hello, Goravel!")
color.Green().Printf("Hello, %s!", "Goravel")
```

## 指定颜色

### `color.New`

`color.New` 函数创建一个新的颜色打印。您可以使用此对象来为终端的输出添加颜色。

```go
import "github.com/goravel/framework/support/color"

color.New(color.FgRed).Println("Hello, Goravel!")
```
