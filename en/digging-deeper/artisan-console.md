# Artisan Console

[[toc]]

## Introduction

Artisan is the CLI tool that comes with Goravel for interacting with the command line. You can access it using `facades.Artisan()`. This tool has several useful commands that can assist you in the development of your application. Utilize the following command to view all available commands.

```shell
./artisan list

# or
go run . artisan list
```

Each command also has a "help" flag that shows and explains the arguments and options associated with the command:

```shell
./artisan migrate --help
```

Instead of repeating `./artisan ...` command, you may want to add an alias to your shell configuration with the terminal command below:

```shell
echo -e "\r\nalias artisan=\"go run . artisan\"" >>~/.zshrc
```

Then you can simply run your commands like this:

```shell
artisan make:controller DemoController
```

You can also use `artisan` shell script like this:

### Generating Commands

You can use the `make:command` command to create a new command in the `app/console/commands` directory. Don't worry if this directory does not exist in your application, it will be created the first time you run the `make:command` command:

```shell
./artisan make:command SendEmails
./artisan make:command user/SendEmails
```

### Register Commands

All commands should be registered via the `WithCommands` function in the `bootstrap/app.go` file:

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithCommands(Commands).
		WithConfig(config.Boot).
		Create()
}
```

A new command created by `make:command` will be registered automatically in the `bootstrap/commands.go::Commands()` function and the function will be called by `WithCommands`. You need register the command manually if you create the command file by yourself.

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

## Command I/O

### Retrieving Input

When you write console commands, it's typical to collect user input through `arguments` or `options`. With Goravel, it's extremely easy to retrieve the arguments and options that the user provides.

#### Arguments

Follow the arguments after the command:

```shell
./artisan send:emails SUBJECT EMAIL_1 EMAIL_2
```

Definition：

```go
// send:emails <subject> <email...>
func (receiver *SendEmails) Extend() command.Extend {
	return command.Extend{
		Arguments: []command.Argument{
			&command.ArgumentString{
				Name:     "subject",
				Usage:    "subject of email",
				Required: true,
			},
			&command.ArgumentStringSlice{
				Name:  "emails",
				Usage: "target emails",
				Min:   1,
				Max:   -1,
			},
		},
	}
}
```

Supported agrument types : `ArgumentFloat32`, `ArgumentFloat64`, `ArgumentInt`, `ArgumentInt8`, `ArgumentInt16`, `ArgumentInt32`, `ArgumentInt64`, `ArgumentString`, `ArgumentUint`, `ArgumentUint8`, `ArgumentUint16`, `ArgumentUint32`, `ArgumentUint64`, `ArgumentTimestamp`, `ArgumentFloat32Slice`, `ArgumentFloat64Slice`, `ArgumentIntSlice`, `ArgumentInt8Slice`, `ArgumentInt16Slice`, `ArgumentInt32Slice`, `ArgumentInt64Slice`, `ArgumentStringSlice`, `ArgumentUintSlice`, `ArgumentUint8Slice`, `ArgumentUint16Slice`, `ArgumentUint32Slice`, `ArgumentUint64Slice`, `ArgumentTimestampSlice`

Argument types with single value support next fields:

```go
	Name     string // the name of this argument
	Value    T      // the default value of this argument
	Usage    string // the usage text to show
	Required bool   // if this argument is required
```

Slice argument types fields:

```go
	Name  string // the name of this argument
	Value T      // the default value of this argument
	Usage string // the usage text to show
	Min   int    // the min num of occurrences of this argument
	Max   int    // the max num of occurrences of this argument, set to -1 for unlimited
```

Timestamp arguments additionally supports `Layouts []string` field, that should be filled with [supported layouts](https://pkg.go.dev/time#pkg-constants)

Get arguments:

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
  subject := ctx.ArgumentString("subject")
  emails := ctx.ArgumentStringSlice("emails")

  return nil
}
```

Alternatively, it is possible to access arguments directly:
```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
  name := ctx.Argument(0)
  email := ctx.Argument(1)
  all := ctx.Arguments()

  return nil
}
```

#### Options

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
./artisan emails --lang Chinese
./artisan emails -l Chinese
```

Except `command.StringFlag`, we can also use other type `Flag` and `Option*`: `StringSliceFlag`, `BoolFlag`, `Float64Flag`, `Float64SliceFlag`, `IntFlag`, `IntSliceFlag`, `Int64Flag`, `Int64SliceFlag`.

### Prompting For Input

#### Asking Questions

In addition to arguments and options, you may also prompt the user for input during the execution of a command. The `Ask` method will prompt the user with the given question and return their response:

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
  email, err := ctx.Ask("What is your email address?")

  return err
}
```

Additionally, you can pass options to the `Ask` method as optional second argument:

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
    name, err := ctx.Ask("What is your name?", console.AskOption{
        Default: "Krishan",
    })

    return err
}

// Available options
type AskOption struct {
    // Default the default value for the input.
    Default string
    // Description the input description.
    Description string
    // Lines the number of lines for the input.(use for multiple lines text)
    Lines int
    // Limit the character limit for the input.
    Limit int
    // Multiple determines if input is single line or multiple lines text
    Multiple bool
    // Placeholder the input placeholder.
    Placeholder string
    // Prompt the prompt message.(use for single line input)
    Prompt string
    // Validate the input validation function.
    Validate func(string) error
}
```

Sometimes you may need to hide the user input, such as when prompting for a password. You can use the `Secret` method to hide the user input:

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
    password, err := ctx.Secret("What is the password?", console.SecretOption{
        Validate: func (s string) error {
            if len(s) < 8 {
                return errors.New("password length should be at least 8")
            }
            return nil
        },
    })

    return err
}

// Available options
type SecretOption struct {
    // Default the default value for the input.
    Default string
    // Description the input description.
    Description string
    // Limit the character limit for the input.
    Limit int
    // Placeholder the input placeholder.
    Placeholder string
    // Validate the input validation function.
    Validate func(string) error
}
```

#### Confirming Actions

If you need to ask the user to confirm an action before proceeding, you may use the `Confirm` method. By default, this method will return `false` unless the user select affirmative option.

```go
if ctx.Confirm("Do you wish to continue?") {
    // ...
}
```

You can also pass a second argument to the `Confirm` method to customize the default value, label of the affirmative and negative buttons:

```go
if ctx.Confirm("Do you wish to continue?", console.ConfirmOption{
	Default : true,
	Affirmative : "Yes",
	Negative : "No",
}) {
    // ...
}

// Available options
type ConfirmOption struct {
    // Affirmative label for the affirmative button.
    Affirmative string
    // Default the default value for the input.
    Default bool
    // Description the input description.
    Description string
    // Negative label for the negative button.
    Negative string
}
```

#### Single Select Questions

If you need to ask the user to select an option from a list of options, you may use the `Choice` method. The `Choice` method will return the value of the selected option:

```go
question := "What is your favorite programming language?"
options := []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP"},
    {Key: "python", Value: "Python"},
    {Key: "cpp", Value: "C++", Selected: true},
}
color, err := ctx.Choice(question, options)
```

Additionally, you can pass options to the `Choice` method as optional second argument:

```go
question := "What is your favorite programming language?"
options := []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP"},
    {Key: "python", Value: "Python"},
    {Key: "cpp", Value: "C++", Selected: true},
}

color, err := ctx.Choice(question, options, console.ChoiceOption{
    Default: "go",
})

// Available options
type ChoiceOption struct {
    // Default the default value for the input.
    Default string
    // Description the input description.
    Description string
    // Validate the input validation function.
    Validate func(string) error
}
```

#### Multiple Select Questions

If you need to ask the user to select multiple options from a list of options, you may use the `MultiSelect` method. The `MultiSelect` method will return the values of the selected options:

```go
question := "What are your favorite programming languages?"
options := []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP"},
    {Key: "python", Value: "Python"},
    {Key: "cpp", Value: "C++", Selected: true},
}
colors, err := ctx.MultiSelect(question, options)
```

Additionally, you can pass options to the `MultiSelect` method as optional second argument:

```go
question := "What are your favorite programming languages?"
options := []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP"},
    {Key: "python", Value: "Python"},
    {Key: "cpp", Value: "C++", Selected: true},
}

colors, err := ctx.MultiSelect(question, options, console.MultiSelectOption{
    Default: []string{"go", "php"},
})

// Available options
type MultiSelectOption struct {
    // Default the default value for the input.
    Default []string
    // Description the input description.
    Description string
    // Filterable determines if the choices can be filtered, type `/` to starting filter.
    Filterable bool
    // Limit the number of choices that can be selected.
    Limit int
    // Validate the input validation function.
    Validate func([]string) error
}
```

### Writing Output

Sometimes you may need to write output to the console. Goravel provides several methods to assist you in writing output to the console. Each of the method have their appropriate colorized output. For example, `Error` will display the text in red.

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
  ctx.Comment("This is a comment message")
  ctx.Info("This is an info message")
  ctx.Error("This is an error message")
  ctx.Line("This is a line message")
  ctx.Warning("This is a warning message")
  return nil
}
```

There are few helpers to write to console with respective color:

```go
ctx.Green("This is a green message")
ctx.Greenln("This is a green line message")
ctx.Red("This is a red message")
ctx.Redln("This is a red line message")
ctx.Yellow("This is a yellow message")
ctx.Yellowln("This is a yellow line message")
ctx.Black("This is a black message")
ctx.Blackln("This is a black line message")
```

You can use the `NewLine` method to write a new line to the console:

```go
// write single blank line
ctx.NewLine()

// write multiple blank lines
ctx.NewLine(2)
```

#### Progress Bars

For long-running tasks, it is often helpful to provide the user with some indication of how much time the task will take. You may use the `WithProgressBar` method to display a progress bar.

```go
items := []any{"item1", "item2", "item3"}
_, err := ctx.WithProgressBar(items, func(item any) error {
    // performTask(item)
    return nil
})
```

Sometimes you may need to update the progress bar manually. You can use the `CreateProgressBar` method to update the progress bar:

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

#### Spinner

If you need to display a spinner while a task is running, you may use the `Spinner` method.

```go
err := ctx.Spinner("Loading...", console.SpinnerOption{
    Action: func() error {
        // when to stop the spinner
        time.Sleep(2 * time.Second)
        return nil
    },
})
```

### Divider

To show terminal-width divider you may use `Divider` method.

```go
ctx.Divider()     // ----------
ctx.Divider("=>") // =>=>=>=>=>
```

## Category

You can set a set of commands to the same category, convenient in `./artisan list`:

```go
// Extend The console command extend.
func (receiver *ConsoleMakeCommand) Extend() command.Extend {
  return command.Extend{
    Category: "make",
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

## Disabling Print Colors

Some commands print colors by default, such as the `list` command. However, in some terminals or logs, the color values may be garbled. You can use the `--no-ansi` option to disable the print colors:

```shell
./artisan list --no-ansi
```
