# Artisan Console

[[toc]]

## Introduction

Artisan is the command line interface included with Goravel, the module can be operated using `facades.Artisan`. It provide a number of helpful commands that can assist you while you build your application. You can use the command blow to get all commands:

```
go run . artisan list
```

Every command also includes a "help" which displays and describes the command's available arguments and options. To view a help screen, precede the name of the command with help:

```
go run . artisan help migrate
```

### Generating Commands

You can use the `make:command` command to create a new command in the `app/console/commands` directory. Don't worry if this directory does not exist in your application, it will be created the first time you run the `make:command` command:

```
go run . artisan make:command SendEmails
```

### Command Structure

After generating your command, you should define appropriate values for the signature and description properties of the struct. The `handle` method will be called when your command is executed. You need to optimize your logic in this method.

```
package commands

import (
  "github.com/goravel/framework/contracts/console"
  "github.com/urfave/cli/v2"
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
func (receiver *SendEmails) Extend() console.CommandExtend {
  return console.CommandExtend{}
}

//Handle Execute the console command.
func (receiver *SendEmails) Handle(c *cli.Context) error {
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

Get arguemnts:

```
func (receiver *ListCommand) Handle(c *cli.Context) error {
  name := c.Args().Get(0)
  email := c.Args().Get(1)

  return nil
}
```

### Options

Options, like arguments, are another form of user input. Options are prefixed by two hyphens (--) when they are provided via the command line.

Definition：

```
func (receiver *ListCommand) Extend() console.CommandExtend {
  return console.CommandExtend{
    Flags: []cli.Flag{
      &cli.StringFlag{
        Name:    "lang",
        Value:   "english",// Default
        Aliases: []string{"l"},// Option shorthand
        Usage:   "language for the greeting",// Option description
      },
    },
  }
}
```

Get：

```
func (receiver *ListCommand) Handle(c *cli.Context) error {
  lang := c.String("lang")

  return nil
}
```

Usage：

```
go run . artisan emails --lang chinese
go run . artisan emails -l chinese
```

For specific usage, please refer to [urfave/cli Document](https://github.com/urfave/cli/blob/master/docs/v2/manual.md#flags)

### Category

You can set a set of commands to the same category, convenient in `go run . artisan list`:

```
//Extend The console command extend.
func (receiver *ConsoleMakeCommand) Extend() console.CommandExtend {
  return console.CommandExtend{
    Category: "make",
  }
}
```

### Subcommands

You can set multiple subcommands for a command:

```
//Extend The console command extend.
func (receiver *SendEmails) Extend() console.CommandExtend {
  return console.CommandExtend{
    Subcommands: []*cli.Command{
      {
        Name:  "add",
        Usage: "add a new template",
        Action: func(c *cli.Context) error {
          fmt.Println("new task template: ", c.Args().First())
          return nil
        },
      },
      {
        Name:  "remove",
        Usage: "remove an existing template",
        Action: func(c *cli.Context) error {
          fmt.Println("removed task template: ", c.Args().First())
          return nil
        },
      },
    },
  }
}
```

Usage：

```
go run . artisan emails add
go run . artisan emails remove
```

For specific usage, please refer to [urfave/cli Document](https://github.com/urfave/cli/blob/master/docs/v2/manual.md#subcommands)

## Registering Commands

All of your console commands needs to be registered within the `Commands` function of the `app\console\kernel.go` file.

```
func (kernel Kernel) Commands() []console.Command {
  return []console.Command{
    &commands.SendEmails{},
  }
}
```

## Programmatically Executing Commands

Sometimes you may wish to execute an Artisan command outside of the CLI, you can use the `Call` method on the `facades.Artisan` to operation this.

```
facades.Route.GET("/", func(c *gin.Context) {
  facades.Artisan.Call("emails")
  facades.Artisan.Call("emails name --lang chinese") // With arguments and options
})
```
