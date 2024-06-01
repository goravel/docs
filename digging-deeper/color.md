# Color

[[toc]]

## Introduction

The `color` package provides a set of functions to colorize the output of the terminal using `PTerm` library. This package is used by the Goravel framework to colorize the output of the console commands. You are free to use this package in your own applications.

## Available Methods

### `color.New`

The `color.New` function creates a new color printer. You can use this object to colorize the output of the terminal.

```go
import "github.com/goravel/framework/support/color"

color.New(color.FgRed).Println("Hello, Goravel!")
```

## Color-Specific Printer Methods

The package provides methods to create printers for specific colors. These methods allow you to easily colorize terminal output.

- `color.Red()` - Returns a red color printer
- `color.Green()` - Returns a green color printer
- `color.Yellow()` - Returns a yellow color printer
- `color.Blue()` - Returns a blue color printer
- `color.Magenta()` - Returns a magenta color printer
- `color.Cyan()` - Returns a cyan color printer
- `color.White()` - Returns a white color printer
- `color.Black()` - Returns a black color printer
- `color.Gray()` - Returns a gray color printer
- `color.Default()` - Returns a default color printer


## Printer Methods

A `contracts/support.Printer` provides the following methods to print or format text with color:

- `Print` - Print text
- `Println` - Print text with a new line
- `Printf` - Print formatted text
- `Sprint` - Return colored text
- `Sprintln` - Return colored text with a new line
- `Sprintf` - Return formatted colored text

### Example

```go
import "github.com/goravel/framework/support/color"

color.New(color.FgRed).Println("Hello, Goravel!")
color.Blue().Println("Hello, Goravel!")
color.Green().Printf("Hello, %s!", "Goravel")
```
