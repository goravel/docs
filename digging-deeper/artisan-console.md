# Artisan Console

[[toc]]

## Introduction

Artisan is the command line interface included with Goravel, the module can be operated using `facades.Artisan()`. It provides a number of helpful commands that can assist you while you build your application. You can use the command below to get all the commands:

```shell
go run . artisan list
```

Every command also includes a "help" which displays and describes the command's available arguments and options. To view a help screen, precede the name of the command with help:

```shell
go run . artisan help migrate
```

Instead of repeating `go run . artisan ...` command, you may want to add an alias to your shell configuration with the terminal command below:

```shell
echo -e "\r\nalias artisan=\"go run . artisan\"" >>~/.zshrc
```

Then you can simply run your commands like this:

```shell
artisan make:controller DemoController
```

### Generating Commands

You can use the `make:command` command to create a new command in the `app/console/commands` directory. Don't worry if this directory does not exist in your application, it will be created the first time you run the `make:command` command:

```shell
go run . artisan make:command SendEmails
go run . artisan make:command user/SendEmails
```

### Command Structure

After generating your command, assign suitable values to the signature and description properties of the struct. The `Handle` method will be called when your command is executed. You need to implement your logic in this method.

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
  return "send:emails"
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

## Defining Input Expectations

When writing console commands, it is common to gather input from the user through arguments or options. Goravel makes it very convenient to get arguments and options that user input.

### Arguments

Follow the arguments after the command:

```shell
go run . artisan send:emails NAME EMAIL
```

Get arguments:

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
  name := ctx.Argument(0)
  email := ctx.Argument(1)
all := ctx.Arguments()

  return nil
}
```

### Options

Options, like arguments, are another form of user input. Options are prefixed by two hyphens (--) when they are provided via the command line.

Definition：

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

Get：

```go
func (receiver *ListCommand) Handle(ctx console.Context) error {
  lang := ctx.Option("lang")

  return nil
}
```

Usage：

```shell
go run . artisan emails --lang Chinese
go run . artisan emails -l Chinese
```

Notice: When using both arguments and options, define the options before the arguments. Example:

```shell
// Right
go run . artisan emails --lang Chinese name
// Wrong
go run . artisan emails name --lang Chinese name
```

Except `command.StringFlag`, we can also use other type `Flag` and `Option*`: `StringSliceFlag`, `BoolFlag`, `Float64Flag`, `Float64SliceFlag`, `IntFlag`, `IntSliceFlag`, `Int64Flag`, `Int64SliceFlag`.

### Category

You can set a set of commands to the same category, convenient in `go run . artisan list`:

```go
// Extend The console command extend.
func (receiver *ConsoleMakeCommand) Extend() command.Extend {
  return command.Extend{
    Category: "make",
  }
}
```

## Registering Commands

All of your console commands need to be registered within the `Commands` function of the `app\console\kernel.go` file.

```go
func (kernel Kernel) Commands() []console.Command {
  return []console.Command{
    &commands.SendEmails{},
  }
}
```

## Programmatically Executing Commands

Sometimes you may wish to execute an Artisan command outside of the CLI, you can use the `Call` method on the `facades.Artisan()` to operate this.

```go
facades.Route().Get("/", func(c *gin.Context) {
  facades.Artisan().Call("emails")
  facades.Artisan().Call("emails --lang Chinese name") // With arguments and options
})
```

<CommentService/>
