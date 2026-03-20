# Process Facade

## Core Imports

```go
import (
    "context"
    "io"
    "os"
    "time"
    contractsprocess "github.com/goravel/framework/contracts/process"
    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/process/process.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/process/pipeline.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/process/pool.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/process/result.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/process/running.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/process/running_pipe.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/process/running_pool.go`

## Available Methods

**facades.Process() - builder (chainable):**

- `Path(dir)` - working directory
- `Timeout(d)` - kill after duration
- `Env(map[string]string)` - add env vars (inherits system)
- `Input(io.Reader)` - pipe to stdin
- `Quietly()` - capture but suppress terminal output
- `DisableBuffering()` - do not buffer in memory (use with `OnOutput`)
- `OnOutput(func(OutputType, []byte))` - stream output
- `WithContext(ctx)` - bind to context
- `TTY()` - interactive terminal; output not captured; `Input()` is ignored
- `WithSpinner(message?)` - show spinner while running

**Execution:**

- `Run(name, args...)` Result - synchronous
- `Start(name, args...)` (Running, error) - async; **must call `.Wait()`**
- `Pipe(func(Pipe))` Pipeline - define pipe; set options **after** `Pipe()` call
- `Pool(func(Pool))` PoolBuilder - define concurrent processes

## Implementation Example

```go
package services

import (
    "fmt"
    "os"
    "time"
    contractsprocess "github.com/goravel/framework/contracts/process"
    "yourmodule/app/facades"
)

// Synchronous
func RunBuild() error {
    result := facades.Process().
        Path("/var/www/app").
        Timeout(5 * time.Minute).
        Env(map[string]string{"NODE_ENV": "production"}).
        Run("npm", "run", "build")
    if result.Failed() {
        return fmt.Errorf("exit %d: %s", result.ExitCode(), result.ErrorOutput())
    }
    return nil
}

// Async - must call Wait()
func RunAsync() error {
    running, err := facades.Process().Timeout(10 * time.Second).Start("sleep", "5")
    if err != nil { return err }

    select {
    case <-running.Done():
    case <-time.After(8 * time.Second):
        running.Stop(2 * time.Second)
    }
    result := running.Wait() // always call Wait()
    if result.Failed() { return result.Error() }
    return nil
}

// Pipeline - options applied AFTER Pipe()
func RunPipeline() error {
    result := facades.Process().
        Pipe(func(pipe contractsprocess.Pipe) {
            pipe.Command("cat", "app.log").As("source")
            pipe.Command("grep", "ERROR").As("filter")
        }).
        Timeout(30 * time.Second).           // options AFTER Pipe()
        OnOutput(func(typ contractsprocess.OutputType, line []byte, key string) {
            fmt.Printf("[%s] %s", key, line) // key identifies which stage
        }).
        Run()
    if result.Failed() { return result.Error() }
    return nil
}

// Pool - concurrent processes
func RunPool() error {
    results, err := facades.Process().
        Pool(func(pool contractsprocess.Pool) {
            pool.Command("npm", "test").As("tests")
            pool.Command("go", "vet", "./...").As("vet")
        }).
        Concurrency(2).
        Timeout(10 * time.Minute).
        Run()
    if err != nil { return err }
    for key, res := range results {
        if res.Failed() {
            return fmt.Errorf("%s failed: %s", key, res.ErrorOutput())
        }
    }
    return nil
}
```

## Rules

- `Run("ls -la")` - shell string with spaces triggers `/bin/sh -c` wrapper automatically.
- `Start()` is async - **always** call `.Wait()` to reap OS resources, even after `Done()`.
- Pipeline options (`Timeout`, `Env`, `WithContext`) set **before** `Pipe()` are **ignored** - apply them after `Pipe()`.
- `DisableBuffering` - `Result.Output()` and `Result.ErrorOutput()` return empty; use `OnOutput` to consume.
- `TTY()` - output is not captured; `Input()` is ignored; your terminal becomes the subprocess stdin.
- `Pool.OnOutput` callback is called from multiple goroutines - ensure thread safety.
- `Pool.PoolCommand` supports per-process overrides: `Path`, `Timeout`, `Env`, `Input`, `Quietly`, `DisableBuffering`, `WithContext`.
- `Pool.Run()` returns `map[string]Result` keyed by `.As(key)` names.
- `Stop(timeout, sig?)` sends SIGTERM, then SIGKILL after timeout if process is still alive.
- `WithSpinner` shows a terminal spinner while the process runs.
- `Process` facade is registered via `&process.ServiceProvider{}` in `bootstrap/providers.go`.
