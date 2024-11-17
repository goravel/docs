# Color

[[toc]]

## Introduction

The `color` package provides a set of functions to colorize the output of the terminal using [PTerm](github.com/pterm/pterm) library.

## Specific Color

The package provides methods to create printers for specific colors. These methods allow you to easily colorize terminal output.

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

### Printer Methods

A `contracts/support.Printer` provides the following methods to print or format text with color:

- `Print` - Print text
- `Println` - Print text with a new line
- `Printf` - Print formatted text
- `Sprint` - Return colored text
- `Sprintln` - Return colored text with a new line
- `Sprintf` - Return formatted colored text

```go
import "github.com/goravel/framework/support/color"

color.Blue().Println("Hello, Goravel!")
color.Green().Printf("Hello, %s!", "Goravel")
```

## Custom Color

### `color.New`

The `color.New` function creates a new color printer. You can use this object to colorize the output of the terminal.

```go
import "github.com/goravel/framework/support/color"

color.New(color.FgRed).Println("Hello, Goravel!")
```

<CommentService/>
