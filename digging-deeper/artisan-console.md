# Artisan Console

[[toc]]

## Introduction

Artisan is the command line interface included with Goravel, the module can be operated using `facades.Artisan`. It provide a number of helpful commands that can assist you while you build your application. You can use the command blow to get all commands:

```go
go run . artisan list
```

Every command also includes a "help" which displays and describes the command's available arguments and options. To view a help screen, precede the name of the command with help:

```go
go run . artisan help migrate
```

### Generating Commands

You can use the `make:command` command to create a new command in the `app/console/commands` directory. Don't worry if this directory does not exist in your application, it will be created the first time you run the `make:command` command:

```go
go run . artisan make:command SendEmails
```

### Command Structure

After generating your command, you should define appropriate values for the signature and description properties of the struct. The `handle` method will be called when your command is executed. You need to optimize your logic in this method.

```go
package commands

import (
  "github.com/goravel/framework/contracts/console"
  "github.com/goravel/framework/contracts/console/command"
)

type SendEmails struct {
}

//Signature The name and signature of the console command.
func (receiver *SendEmails) Signature() string {
  return "send:emails"
}

//Description The console command description.
func (receiver *SendEmails) Description() string {
  return "Send emails"
}

//Extend The console command extend.
func (receiver *SendEmails) Extend() command.Extend {
  return command.Extend{}
}

//Handle Execute the console command.
func (receiver *SendEmails) Handle(ctx console.Context) error {
  return nil
}
```

## Defining Input Expectations

When writing console commands, it is common to gather input from the user through arguments or options. Goravel makes it very convenient to get arguments and options which user input.

### Arguments

Follow the arguments after the command:

```
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
      {
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

```
go run . artisan emails --lang chinese
go run . artisan emails -l chinese
```

Notice: When using both arguments and options, the options need defined before the arguments. Example: 

```
// Right
go run . artisan emails --lang chinese name
// Wrong
go run . artisan emails name --lang chinese name
```

### Category

You can set a set of commands to the same category, convenient in `go run . artisan list`:

```go
//Extend The console command extend.
func (receiver *ConsoleMakeCommand) Extend() command.Extend {
  return command.Extend{
    Category: "make",
  }
}
```

## Registering Commands

All of your console commands needs to be registered within the `Commands` function of the `app\console\kernel.go` file.

```go
func (kernel Kernel) Commands() []console.Command {
  return []console.Command{
    &commands.SendEmails{},
  }
}
```

## Programmatically Executing Commands

Sometimes you may wish to execute an Artisan command outside of the CLI, you can use the `Call` method on the `facades.Artisan` to operation this.

```go
facades.Route.GET("/", func(c *gin.Context) {
  facades.Artisan.Call("emails")
  facades.Artisan.Call("emails --lang chinese name") // With arguments and options
})
```

<CommentService/>
