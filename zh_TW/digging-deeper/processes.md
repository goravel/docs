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

    "goravel/app/facades"
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

:::warning
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
}).OnOutput(func(typ process.OutputType, line []byte, key string) {
    // 'key' will be "source" or "filter"
}).Run()
```

## Asynchronous Processes

While the `Run` method waits for the process to complete, `Start` can be used to invoke a process asynchronously.
This allows the process to run in the background while your application continues executing other tasks. The `Start` method returns a `Running` interface.

```go
import "time"

process, _ := facades.Process().Timeout(10 * time.Second).Start("sleep", "5")

// Continue doing other work...

result := process.Wait()
```

To check if a process has finished without blocking, you may use the `Done` method. This returns a standard Go channel
that closes when the process exits, making it ideal for use in `select` statements.

```go
process, _ := facades.Process().Start("sleep", "5")

select {
case <-process.Done():
    // Process finished successfully
case <-time.After(1 * time.Second):
    // Custom logic if it takes too long
}

result := process.Wait()
```

:::warning
Even if you use the `Done` channel to detect completion, you **must** call `Wait()` afterwards.
This ensures the process is properly "reaped" by the operating system and cleans up underlying resources.
:::

### Process IDs & Signals

You can retrieve the operating system's process ID (PID) for a running process using the `PID` method.

```go
process, _ := facades.Process().Start("ls", "-la")

println(process.PID())
```

#### Sending Signals

Goravel provides methods to interact with the process lifecycle. You can send a specific OS signal using
the `Signal` method, or use the `Stop` helper to attempt a graceful shutdown.

The `Stop` method is particularly useful: it will first send a termination signal (defaulting to `SIGTERM`).
If the process does not exit within the provided timeout, it will be forcibly killed (`SIGKILL`).

```go
import (
    "os"
    "time"
)

process, _ := facades.Process().Start("sleep", "60")

// Manually send a signal
process.Signal(os.Interrupt)

// Attempt to stop gracefully, wait 5 seconds, then force kill
process.Stop(5 * time.Second)
```

### Checking Process State

You can inspect the current state of the process using the `Running` method. This is primarily useful for debugging
or health checks, as it provides a snapshot of whether the process is currently active.

```go
// Snapshot check (useful for logs or metrics)
if process.Running() {
    fmt.Println("Process is still active...")
}
```

:::tip
If you need to execute code **when** the process finishes, do not poll `Running()`. Instead, use the `Done()` channel
or the `Wait()` method, which are much more efficient than repeatedly checking the status.
:::

## Concurrent Processes

Goravel makes it easy to manage a pool of concurrent processes, allowing you to execute multiple commands simultaneously.
This is particularly useful for batch processing or running independent tasks in parallel.

### Executing Pools

To run a pool of processes, you may use the `Pool` method. This accepts a closure where you define the commands you wish to execute.

By default, the `Pool` method waits for all processes to complete and returns a map of results keyed by the process name (or index).

```go
results, err := facades.Process().Pool(func(pool process.Pool) {
    pool.Command("sleep", "1").As("first")
    pool.Command("sleep", "2").As("second")
}).Run()

if err != nil {
    panic(err)
}

// Access results by their assigned key
println(results["first"].Output())
println(results["second"].Output())
```

### Naming Processes

By default, processes in a pool are keyed by their numeric index (e.g., "0", "1"). However, for clarity and easier access
to results, you should assign a unique name to each process using the `As` method:

```go
pool.Command("cat", "system.log").As("system")
```

### Pool Options

The `Pool` builder provides several methods to control the execution behavior of the entire batch.

#### Concurrency

You can control the maximum number of processes running simultaneously using the `Concurrency` method.

```go
facades.Process().Pool(func(pool process.Pool) {
    // Define 10 commands...
}).Concurrency(2).Run()
```

#### Total Timeout

You can enforce a global timeout for the entire pool execution using the `Timeout` method. If the pool takes longer
than this duration, all running processes will be terminated.

```go
facades.Process().Pool(...).Timeout(1 * time.Minute).Run()
```

### Asynchronous Pools

If you need to run the pool in the background while your application performs other tasks, you can use the `Start`
method instead of `Run`. This returns a `RunningPool` handle.

```go
runningPool, err := facades.Process().Pool(func(pool process.Pool) {
    pool.Command("sleep", "5").As("long_task")
}).Start()

// Check if the pool is still running
if runningPool.Running() {
    fmt.Println("Pool is active...")
}

// Wait for all processes to finish and gather results
results := runningPool.Wait()
```

#### Interacting with Running Pools

The `RunningPool` interface provides several methods to manage the active pool:

- **`PIDs()`**: Returns a map of Process IDs keyed by the command name.
- **`Signal(os.Signal)`**: Sends a signal to all running processes in the pool.
- **`Stop(timeout, signal)`**: Gracefully stops all processes.
- **`Done()`**: Returns a channel that closes when the pool finishes, useful for `select` statements.

```go
select {
case <-runningPool.Done():
    // All processes finished
case <-time.After(10 * time.Second):
    // Force stop all processes if they take too long
    runningPool.Stop(1 * time.Second)
}
```

### Pool Output

You can inspect the output of the pool in real-time using the `OnOutput` method.

:::warning
The `OnOutput` callback may be invoked concurrently from multiple goroutines. Ensure your callback logic is thread-safe.
:::

```go
facades.Process().Pool(func(pool process.Pool) {
    pool.Command("ping", "google.com").As("ping")
}).OnOutput(func(typ process.OutputType, line []byte, key string) {
    // key will be "ping"
    fmt.Printf("[%s] %s", key, string(line))
}).Run()
```

### Per-Process Configuration

Inside the pool definition, each command supports individual configuration methods similar to single processes:

- **`Path(string)`**: Sets the working directory.
- **`Env(map[string]string)`**: Sets environment variables.
- **`Input(io.Reader)`**: Sets standard input.
- **`Timeout(time.Duration)`**: Sets a timeout for the specific command.
- **`Quietly()`**: Disables output capturing for this specific command.
- **`DisableBuffering()`**: Disables memory buffering (useful for high-volume output).

```go
facades.Process().Pool(func(pool process.Pool) {
    pool.Command("find", "/", "-name", "*.log").
        As("search").
        Path("/var/www").
        Timeout(10 * time.Second).
        DisableBuffering()
}).Run()
```
