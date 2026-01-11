# Processes

[[toc]]

## Introduction

Goravel provides an expressive and elegant API around Go's standard `os/exec` package, allowing you to invoke external commands from your application seamlessly. By default, Go's process handling can be verbose; Goravel's `Process` facade simplifies this common task, offering a fluent interface for executing commands, handling output, and managing asynchronous processes.

## Invoking Processes

### Running Processes

To run a process, you can use the `Run` or `Start` methods. The `Run` method will execute the command and wait for it to finish, while the `Start` method triggers the process asynchronously and returns control immediately.

Here is how you execute a blocking command:

```go
import (
    "fmt"
    "github.com/goravel/framework/facades"
)

func main() {
    result, err := facades.Process().Run("echo", "Hello, World!")
    if err != nil {
        panic(err)
    }

    fmt.Println(result.Output())
}
```

The `Run` method returns a `Result` interface and an `error`. The error will be non-nil if the process failed to start or encountered a system error. The `Result` interface gives you convenient access to the output and status of the command:

```go
result, _ := facades.Process().Run("ls", "-la")

result.Command()     // string: The original command
result.Error()       // error: The error returned by the command execution
result.ErrorOutput() // string: Output from Stderr
result.ExitCode()    // int: The exit code (e.g., 0, 1)
result.Failed()      // bool: True if the exit code was not 0
result.Output()      // string: Output from Stdout
```

### Process Options

You often need to customize how a command runs, such as where it runs or what environment variables it sees. The `Process` facade provides a fluent API for this.

#### Path
You can use the `Path` method to specify the working directory for the command. If you don't set this, the process will execute in the current working directory of your application.

```go
result, _ := facades.Process().Path("/var/www/html").Run("ls", "-la")
```

#### Timeout
To prevent a process from hanging indefinitely, you can enforce a timeout. If the process runs longer than the specified duration, it will be killed.

```go
import "time"

result, _ := facades.Process().Timeout(10 * time.Mintue).Run("sleep", "20")
```

#### Environment Variables
You can pass custom environment variables to the process using the `Env` method. The process will also inherit the system's environment variables.

```go
// Passes FOO=BAR along with existing system envs
result, _ := facades.Process().Env(map[string]string{
    "FOO": "BAR",
    "API_KEY": "secret",
}).Run("printenv")
```

#### Input (Stdin)
If your command expects input from standard input (stdin), you can provide it using the `Input` method. This accepts an `io.Reader`.

```go
import "strings"

// Pipes "Hello Goravel" into the cat command
result, _ := facades.Process().
    Input(strings.NewReader("Hello Goravel")).
    Run("cat")
```

### Process Output

You can access the process output after execution using the `Output` (standard output) and `ErrorOutput` (standard error) methods on the result object.

```go
result, _ := facades.Process().Run("ls", "-la");

fmt.Println(result.Output())
fmt.Println(result.ErrorOutput())
```

If you need to process the output in real-time (streaming), you may register a callback using the `OnOutput` method. The callback receives two arguments: the output type (stdout or stderr) and the byte slice containing the output data.

```go
import (
    "fmt"
    "github.com/goravel/framework/contracts/process"
)

result, _ := facades.Process().OnOutput(func(typ process.OutputType, b []byte) {
    // Handle real-time streaming here
    fmt.Print(string(b))
}).Run("ls", "-la")
```

If you only need to verify that the output contains a specific string after execution, you can use the `SeeInOutput` or `SeeInErrorOutput` helper methods.

```go
result, _ := facades.Process().Run("ls", "-la")

if result.SeeInOutput("go.mod") {
    // The file exists
}
```

#### Disabling Process Output

If your process writes a large amount of data, you may want to control how it is stored.

Using `Quietly` will prevent the output from bubbling up to the console or logs during execution, but the data will still be collected and available via `result.Output()`.

If you do not need to access the final output at all and want to save memory, you can use `DisableBuffering`. This prevents the output from being stored in the result object, though you can still inspect the stream in real-time using `OnOutput`.

```go 
// Captures output but doesn't print it during execution
facades.Process().Quietly().Run("...")

// Does not capture output (saves memory), but allows streaming
facades.Process().DisableBuffering().OnOutput(func(typ process.OutputType, b []byte) {
    // ...
}).Run("...")
```

### Pipelines

Sometimes you need to pipe the output of one process into the input of another. The `Process` facade makes this easy 
using the `Pipe` method, which allows you to chain multiple commands together synchronously.

```go
import "github.com/goravel/framework/contracts/process"

result, err := facades.Process().Pipe(func(pipe process.Pipe) {
    pipe.Command("echo", "Hello, World!")
    pipe.Command("grep", "World")
    pipe.Command("tr", "a-z", "A-Z")
}).Run()
```

::: warning
Process options such as `Timeout`, `Env`, or `Input` must be configured **after** the `Pipe` method is called. 
Any configuration applied before the `Pipe` call will be ignored.

```go
// Correct: Configuration applied after Pipe
facades.Process().Pipe(...).Timeout(10 * time.Second).Run()

// Incorrect: Timeout will be ignored
facades.Process().Timeout(10 * time.Second).Pipe(...).Run()
```
:::

#### Pipeline Output & Keys

You can inspect the output of the pipeline in real-time using the `OnOutput` method. When used with a pipe, 
the callback signature changes to include a `key` (string), allowing you to identify which command produced the output.

By default, the `key` is the numeric index of the command. However, you can assign a readable label to each command 
using the `As` method, which is highly useful for debugging complex pipelines.

```go
facades.Process().Pipe(func(pipe process.Pipe) {
    pipe.Command("cat", "access.log").As("source")
    pipe.Command("grep", "error").As("filter")
}).OnOutput(func(key string, typ process.OutputType, line []byte) {
    // 'key' will be "source" or "filter"
}).Run()
```
