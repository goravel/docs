# 进程

[[toc]]

## 介绍

Goravel 围绕 Go 标准 `os/exec` 包提供了一个富有表现力且优雅的 API，允许你从应用程序中无缝调用外部命令。 默认情况下，Go 的进程处理可能很冗长；Goravel 的 `Process` facade 简化了这一常见任务，为执行命令、处理输出和管理异步进程提供了流畅的接口。

## 调用进程

### 运行进程

要运行一个进程，你可以使用 `Run` 或 `Start` 方法。 `Run` 方法将执行命令并等待其完成，而 `Start` 方法异步触发进程并立即返回控制权。

以下是执行阻塞命令的方式：

```go
import (
    "fmt"

    "goravel/app/facades"
)

func main() {
    result := facades.Process().Run("echo", "Hello, World!")
    if result.Failed() {
        panic(result.Error())
    }

    fmt.Println(result.Output())
}
```

If you want to run a string command directly (without splitting it into arguments), you can pass the command to `Run` as a single string, `/bin/sh -c` (Linux/macOS) or `cmd /C` (Windows) will be used under the hood. Notice, the string command much contains spaces or `&`, `|`, `-`.

```go
result := facades.Process().Run("echo Hello, World!")
// /bin/sh -c ""echo Hello, World!"" on Linux/macOS
// cmd /c "echo Hello, World!" on Windows
```

The `Run` method returns a `Result` interface. `Result` 接口为您提供了方便地访问命令输出和状态的方式：

```go
result := facades.Process().Run("ls", "-la")

result.Command()     // string: The original command
result.Error()       // error: The error returned by the command execution
result.ErrorOutput() // string: Output from Stderr
result.ExitCode()    // int: The exit code (e.g., 0, 1)
result.Failed()      // bool: True if the exit code was not 0
result.Output()      // string: Output from Stdout
```

### 进程选项

您通常需要自定义命令的运行方式，例如其运行位置或看到的环境变量。 `Process` 门面为此提供了一个流畅的 API。

#### 路径

您可以使用 `Path` 方法为命令指定工作目录。 如果不设置此项，进程将在应用程序的当前工作目录中执行。

```go
result := facades.Process().Path("/var/www/html").Run("ls", "-la")
```

#### 超时

为了防止进程无限期挂起，您可以强制执行超时。 如果进程运行时间超过指定的持续时间，它将被终止。

```go
import "time"

result := facades.Process().Timeout(10 * time.Minute).Run("sleep", "20")
```

#### 环境变量

您可以使用 `Env` 方法将自定义环境变量传递给进程。 该进程也将继承系统的环境变量。

```go
// Passes FOO=BAR along with existing system envs
result := facades.Process().Env(map[string]string{
    "FOO": "BAR",
    "API_KEY": "secret",
}).Run("printenv")
```

#### 输入（Stdin）

如果您的命令期望从标准输入（stdin）接收输入，您可以使用 `Input` 方法提供。 这接受一个 `io.Reader`。

```go
import "strings"

// Pipes "Hello Goravel" into the cat command
result := facades.Process().
    Input(strings.NewReader("Hello Goravel")).
    Run("cat")
```

### 进程输出

您可以在执行后使用结果对象上的 `Output`（标准输出）和 `ErrorOutput`（标准错误）方法访问进程输出。

```go
result := facades.Process().Run("ls", "-la")

fmt.Println(result.Output())
fmt.Println(result.ErrorOutput())
```

如果您需要实时处理输出（流式传输），可以使用 `OnOutput` 方法注册回调。 回调接收两个参数：输出类型（stdout 或 stderr）和包含输出数据的字节切片。

```go
import (
    "fmt"
    "github.com/goravel/framework/contracts/process"
)

result := facades.Process().OnOutput(func(typ process.OutputType, b []byte) {
    // Handle real-time streaming here
    fmt.Print(string(b))
}).Run("ls", "-la")
```

如果您只需要在执行后验证输出是否包含特定字符串，可以使用 `SeeInOutput` 或 `SeeInErrorOutput` 辅助方法。

```go
result := facades.Process().Run("ls", "-la")

if result.SeeInOutput("go.mod") {
    // The file exists
}
```

#### 禁用进程输出

如果您的进程写入大量数据，您可能希望控制其存储方式。

使用 `Quietly` 将防止输出在执行期间冒泡到控制台或日志，但数据仍将被收集并可通过 `result.Output()` 访问。

如果您完全不需要访问最终输出并希望节省内存，可以使用 `DisableBuffering`。 这会阻止输出存储在结果对象中，不过您仍然可以使用 `OnOutput` 实时检查流。

```go
// 捕获输出但在执行期间不打印
facades.Process().Quietly().Run("...")

// 不捕获输出（节省内存），但允许流式传输
facades.Process().DisableBuffering().OnOutput(func(typ process.OutputType, b []byte) {
    // ...
}).Run("...")
```

### 管道

有时您需要将一个进程的输出管道传输到另一个进程的输入。 `Process` 门面通过 `Pipe` 方法使这变得容易，该方法允许您同步地将多个命令链接在一起。

```go
import "github.com/goravel/framework/contracts/process"

result := facades.Process().Pipe(func(pipe process.Pipe) {
    pipe.Command("echo", "Hello, World!")
    pipe.Command("grep World") // string command: /bin/sh -c "grep World"
    pipe.Command("tr", "a-z", "A-Z") 
}).Run()
```

:::warning
诸如 `Timeout`、`Env` 或 `Input` 之类的进程选项必须在调用 `Pipe` 方法**之后**进行配置。
在 `Pipe` 调用之前应用的任何配置都将被忽略。

```go
// 正确：配置在 Pipe 之后应用
facades.Process().Pipe(...).Timeout(10 * time.Second).Run()

// 错误：超时将被忽略
facades.Process().Timeout(10 * time.Second).Pipe(...).Run()
```

:::

#### 管道输出与键

您可以使用 `OnOutput` 方法实时检查管道的输出。 当与管道一起使用时，回调签名会包含一个 `key`（字符串），允许您识别哪个命令产生了输出。

默认情况下，`key` 是命令的数字索引。 但是，您可以使用 `As` 方法为每个命令分配一个可读的标签，这对于调试复杂的管道非常有用。

```go
facades.Process().Pipe(func(pipe process.Pipe) {
    pipe.Command("cat", "access.log").As("source")
    pipe.Command("grep", "error").As("filter")
}).OnOutput(func(typ process.OutputType, line []byte, key string) {
    // 'key' 将是 "source" 或 "filter"
}).Run()
```

## 异步进程

虽然 `Run` 方法等待进程完成，但 `Start` 可用于异步调用进程。
这允许进程在后台运行，而您的应用程序继续执行其他任务。 `Start` 方法返回一个 `Running` 接口。

```go
import "time"

running, err := facades.Process().Timeout(10 * time.Second).Start("sleep", "5")

// Continue doing other work...

result := running.Wait()
```

要检查进程是否已完成而不阻塞，您可以使用 `Done` 方法。 这会返回一个标准的 Go 通道，当进程退出时关闭，使其非常适合在 `select` 语句中使用。

```go
running, err := facades.Process().Start("sleep", "5")

select {
case <-running.Done():
    // Process finished successfully
case <-time.After(1 * time.Second):
    // Custom logic if it takes too long
}

result := running.Wait()
```

:::warning
即使您使用 `Done` 通道来检测完成，之后**必须**调用 `Wait()`。
这确保进程被操作系统正确“收割”并清理底层资源。
:::

### 进程 ID 与信号

您可以使用 `PID` 方法检索正在运行的进程的操作系统进程 ID（PID）。

```go
running, err := facades.Process().Start("ls", "-la")

println(running.PID())
```

#### 发送信号

Goravel 提供了与进程生命周期交互的方法。 您可以使用 `Signal` 方法发送特定的操作系统信号，或使用 `Stop` 辅助函数尝试优雅地关闭进程。

`Stop` 方法特别有用：它会首先发送终止信号（默认为 `SIGTERM`）。
如果进程在提供的超时时间内未退出，它将被强制终止（`SIGKILL`）。

```go
import (
    "os"
    "time"
)

running, err := facades.Process().Start("sleep", "60")

// Manually send a signal
running.Signal(os.Interrupt)

// Attempt to stop gracefully, wait 5 seconds, then force kill
running.Stop(5 * time.Second)
```

### 检查进程状态

您可以使用 `Running` 方法检查进程的当前状态。 这对于调试或健康检查特别有用，因为它提供了进程当前是否处于活动状态的快照。

```go
// Snapshot check (useful for logs or metrics)
if running.Running() {
    fmt.Println("Process is still active...")
}
```

:::tip
如果您需要在进程完成时执行代码，请勿轮询 `Running()`。 相反，请使用 `Done()` 通道或 `Wait()` 方法，这比重复检查状态要高效得多。
:::

## 并发进程

Goravel 使得管理并发进程池变得容易，允许您同时执行多个命令。
这对于批处理或并行运行独立任务特别有用。

### 执行池

要运行进程池，您可以使用 `Pool` 方法。 它接受一个闭包，您可以在其中定义要执行的命令。

默认情况下，`Pool` 方法会等待所有进程完成，并返回一个按进程名称（或索引）键控的结果映射。

```go
results, err := facades.Process().Pool(func(pool process.Pool) {
    pool.Command("sleep", "1").As("first")
    pool.Command("sleep 2").As("second") // string command: /bin/sh -c "sleep 2"
}).Run()

if err != nil {
    panic(err)
}

// Access results by their assigned key
println(results["first"].Output())
println(results["second"].Output())
```

### 命名进程

默认情况下，池中的进程按其数字索引（例如 "0"、"1"）键控。 但是，为了清晰和更容易访问结果，您应该使用 `As` 方法为每个进程分配一个唯一的名称：

```go
pool.Command("cat", "system.log").As("system")
```

### 池选项

`Pool` 构建器提供了几种方法来控制整个批处理的执行行为。

#### 并发数

您可以使用 `Concurrency` 方法控制同时运行的最大进程数。

```go
facades.Process().Pool(func(pool process.Pool) {
    // 定义 10 个命令...
}).Concurrency(2).Run()
```

#### 总超时

您可以使用 `Timeout` 方法为整个池的执行强制执行全局超时。 如果池的执行时间超过此持续时间，所有正在运行的进程将被终止。

```go
facades.Process().Pool(...).Timeout(1 * time.Minute).Run()
```

### 异步池

如果您需要在应用程序执行其他任务时在后台运行池，可以使用 `Start` 方法代替 `Run`。 这将返回一个 `RunningPool` 句柄。

```go
runningPool, err := facades.Process().Pool(func(pool process.Pool) {
    pool.Command("sleep", "5").As("long_task")
}).Start()

// 检查池是否仍在运行
if runningPool.Running() {
    fmt.Println("池处于活动状态...")
}

// 等待所有进程完成并收集结果
results := runningPool.Wait()
```

#### 与运行中的池交互

`RunningPool` 接口提供了几种方法来管理活动池：

- **`PIDs()`**：返回一个按命令名称键控的进程 ID 映射。
- **`Signal(os.Signal)`**：向池中所有正在运行的进程发送信号。
- **`Stop(timeout, signal)`**：优雅地停止所有进程。
- **`Done()`**：返回一个在池完成时关闭的通道，对 `select` 语句很有用。

```go
select {
case <-runningPool.Done():
    // 所有进程已完成
case <-time.After(10 * time.Second):
    // 如果进程耗时过长，强制停止所有进程
    runningPool.Stop(1 * time.Second)
}
```

### 池输出

您可以使用 `OnOutput` 方法实时检查池的输出。

:::warning
`OnOutput` 回调可能会从多个 goroutine 并发调用。 确保您的回调逻辑是线程安全的。
:::

```go
facades.Process().Pool(func(pool process.Pool) {
    pool.Command("ping", "google.com").As("ping")
}).OnOutput(func(typ process.OutputType, line []byte, key string) {
    // key 将是 "ping"
    fmt.Printf("[%s] %s", key, string(line))
}).Run()
```

### 每个进程的配置

在池定义内部，每个命令都支持类似于单个进程的单独配置方法：

- **`Path(string)`**：设置工作目录。
- **`Env(map[string]string)`**：设置环境变量。
- **`Input(io.Reader)`**：设置标准输入。
- **`Timeout(time.Duration)`**：设置特定命令的超时时间。
- **`Quietly()`**：禁用此特定命令的输出捕获。
- **`DisableBuffering()`**：禁用内存缓冲（对高容量输出很有用）。

```go
facades.Process().Pool(func(pool process.Pool) {
    pool.Command("find", "/", "-name", "*.log").
        As("search").
        Path("/var/www").
        Timeout(10 * time.Second).
        DisableBuffering()
}).Run()
```
