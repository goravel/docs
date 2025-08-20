# 顏色

[[toc]]

## 概述

`color` 包提供一系列的方法以便在終端上輸出帶顏色的內容，該功能由 [PTerm](https://github.com/pterm/pterm) 提供驅動。

## 特定顏色

該包提供了一些方法來創建特定顏色的打印。 這些方法允許你輕鬆地為終端輸出添加顏色。 這些方法讓你輕鬆地為終端輸出添加顏色。

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

`contracts/support.Printer` 提供以下方法來打印或格式化文本：

- `Print` - 打印文本
- `Println` - 打印文本時附帶換行
- `Printf` - 打印格式化文本
- `Sprint` - 返回帶顏色信息的文本
- `Sprintln` - 返回帶顏色信息與換行的文本
- `Sprintf` - 返回格式化後的顏色文本

```go
import "github.com/goravel/framework/support/color"

color.Blue().Println("Hello, Goravel!")
color.Green().Printf("Hello, %s!", "Goravel")
```

## 自定義顏色

### `color.New`

`color.New` 函數創建一個新的顏色打印。 你可以使用此對象來為終端的輸出添加顏色。 你可以使用此對象來為終端的輸出添加顏色。

```go
import "github.com/goravel/framework/support/color"

color.New(color.FgRed).Println("Hello, Goravel!")
```
