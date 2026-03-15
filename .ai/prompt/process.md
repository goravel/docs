# Goravel Process Facade (v1.17)

The Process facade provides a fluent API for executing external commands via `facades.Process()`.

## Synchronous Execution

```go
import "goravel/app/facades"

// Run with separate args
result := facades.Process().Run("ls", "-la")

// Run as shell string (spaces/&/| trigger /bin/sh -c on Linux, cmd /C on Windows)
result = facades.Process().Run("echo Hello, World!")

if result.Failed() {
    panic(result.Error())
}
fmt.Println(result.Output())
```

### Result Interface

```go
result.Command()      // string: original command
result.Output()       // string: stdout
result.ErrorOutput()  // string: stderr
result.ExitCode()     // int: exit code
result.Failed()       // bool: true if exit code != 0
result.Error()        // error: from command execution
result.SeeInOutput("go.mod")      // bool
result.SeeInErrorOutput("error")  // bool
```

---

## Process Options

```go
facades.Process().
    Path("/var/www/html").              // working directory
    Timeout(10 * time.Minute).         // kill after duration
    Env(map[string]string{             // add env vars (inherits system envs)
        "FOO": "BAR",
        "API_KEY": "secret",
    }).
    Input(strings.NewReader("stdin data")).  // pipe stdin
    Run("command", "arg1")
```

---

## Real-time Output (Streaming)

```go
import "github.com/goravel/framework/contracts/process"

result := facades.Process().OnOutput(func(typ process.OutputType, b []byte) {
    fmt.Print(string(b))
}).Run("ls", "-la")
```

---

## Suppress / Disable Output

```go
// Captures output but doesn't print during execution
facades.Process().Quietly().Run("command")

// Does not capture in memory (saves memory); use OnOutput to stream
facades.Process().DisableBuffering().OnOutput(func(typ process.OutputType, b []byte) {
    // stream here
}).Run("command")
```

---

## Pipelines

```go
import "github.com/goravel/framework/contracts/process"

result := facades.Process().Pipe(func(pipe process.Pipe) {
    pipe.Command("echo", "Hello, World!")
    pipe.Command("grep World")           // shell string
    pipe.Command("tr", "a-z", "A-Z")
}).Run()

// Options must be applied AFTER Pipe(), not before:
result = facades.Process().Pipe(func(pipe process.Pipe) {
    pipe.Command("cat", "file.txt").As("source")
    pipe.Command("grep error").As("filter")
}).Timeout(30 * time.Second).OnOutput(func(typ process.OutputType, line []byte, key string) {
    fmt.Printf("[%s] %s", key, string(line))
}).Run()
```

---

## Asynchronous Processes

```go
running, err := facades.Process().Timeout(10 * time.Second).Start("sleep", "5")

// Continue doing other work...

result := running.Wait()  // must always call Wait()

// Non-blocking check via channel
select {
case <-running.Done():
    // finished
case <-time.After(1 * time.Second):
    // still running
}
result = running.Wait()
```

### Inspect and Signal

```go
running, err := facades.Process().Start("sleep", "60")

pid := running.PID()
running.Running()             // bool: process active?
running.Signal(os.Interrupt)  // send specific signal
running.Stop(5 * time.Second) // SIGTERM, then SIGKILL if still alive after timeout
```

---

## Concurrent Processes (Pool)

```go
import "github.com/goravel/framework/contracts/process"

results, err := facades.Process().Pool(func(pool process.Pool) {
    pool.Command("sleep", "1").As("first")
    pool.Command("sleep 2").As("second")
}).Run()

fmt.Println(results["first"].Output())
fmt.Println(results["second"].Output())
```

### Pool Options

```go
facades.Process().Pool(func(pool process.Pool) {
    for i := 0; i < 10; i++ {
        pool.Command("worker", fmt.Sprintf("%d", i)).As(fmt.Sprintf("worker-%d", i))
    }
}).
    Concurrency(3).              // max 3 concurrent
    Timeout(1 * time.Minute).    // global timeout for entire pool
    OnOutput(func(typ process.OutputType, line []byte, key string) {
        fmt.Printf("[%s] %s", key, string(line))
    }).
    Run()
```

### Per-process Options in Pool

```go
pool.Command("find", "/", "-name", "*.log").
    As("search").
    Path("/var/www").
    Timeout(10 * time.Second).
    Env(map[string]string{"DEBUG": "1"}).
    Quietly().
    DisableBuffering()
```

### Async Pool

```go
runningPool, err := facades.Process().Pool(func(pool process.Pool) {
    pool.Command("sleep", "5").As("long_task")
}).Start()

if runningPool.Running() {
    fmt.Println("Pool active...")
}

// Interact
pids := runningPool.PIDs()
runningPool.Signal(os.Interrupt)
runningPool.Stop(2 * time.Second)

select {
case <-runningPool.Done():
    // all finished
case <-time.After(10 * time.Second):
    runningPool.Stop(1 * time.Second)
}

results := runningPool.Wait()
```

---

## Gotchas

- Always call `running.Wait()` after `Start()` even if you use `Done()` — it reaps OS resources.
- Pool `OnOutput` callback is called from multiple goroutines; make it thread-safe.
- Process options (`Timeout`, `Env`, `Input`) set before `Pipe()` are ignored — apply them after `Pipe()`.
