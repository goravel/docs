# Process

Run external shell commands. `Process` configures, `Result` captures the outcome. Async via `Start()` returning `Running`. Pipelines (`Pipe`) and concurrent pools (`Pool`) supported. TTY mode for interactive commands; spinner for UX.

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/process/process.go` — `Process`, `OutputType`, `OnOutputFunc`
- `contracts/process/result.go` — `Result`
- `contracts/process/running.go` — `Running`
- `contracts/process/pipeline.go` — `Pipeline`, `Pipe`
- `contracts/process/pool.go` — `Pool`, `PoolBuilder`
- `contracts/process/running_pipe.go`, `running_pool.go` — handles for in-flight pipe/pool

## Imports

```go
import (
    "io"
    "time"

    "github.com/goravel/framework/contracts/process"

    "yourmodule/app/facades"
)
```

## Methods

### `facades.Process()` returns `process.Process` (chainable builder, terminated by `Run` / `Start`)

| Group | Methods (signature-only) |
|---|---|
| Configure | `Path(dir string) Process`, `Env(map[string]string) Process`, `Input(io.Reader) Process`, `Timeout(time.Duration) Process`, `WithContext(ctx) Process`, `Quietly() Process` (suppress output), `DisableBuffering() Process` (skip in-memory capture for high-volume), `TTY() Process` (interactive), `WithSpinner(message ...string) Process` |
| Streaming output | `OnOutput(handler OnOutputFunc) Process` (handler: `func(typ OutputType, line []byte)`) |
| Run | `Run(name string, args ...string) Result` (sync), `Start(name string, args ...string) (Running, error)` (async) |
| Compose | `Pipe(fn func(Pipe)) Pipeline`, `Pool(fn func(Pool)) PoolBuilder` |

### `process.Result` (returned from `Run`)

| Method | Signature | Notes |
|---|---|---|
| Command | `() string` | Full command as run. |
| ExitCode | `() int` | 0 = success on POSIX. |
| Successful | `() bool` | exit == 0. |
| Failed | `() bool` | exit != 0. |
| Output | `() string` | stdout (empty if `DisableBuffering`/`Quietly`/`TTY`). |
| ErrorOutput | `() string` | stderr (same caveat). |
| SeeInOutput | `(needle string) bool` | substring check on stdout. |
| SeeInErrorOutput | `(needle string) bool` | substring check on stderr. |
| Error | `() error` | Go-side error (start failure, timeout, context cancel). |

### `process.Running` (returned from `Start`)

Async handle — use `Wait()` for completion, `Output`/`ErrorOutput`/`ExitCode` for live state, `Stop()`/`Signal(...)` to terminate. (Read `running.go` for full surface.)

### Constants & types

```go
type OutputType int
const (
    OutputTypeStdout OutputType = iota
    OutputTypeStderr
)

type OnOutputFunc func(typ OutputType, line []byte)
```

## Config

No facade config — process commands run as the host process's user with the host's PATH (override per-call via `Env`/`Path`).

## Patterns & gotchas

- **`Run("name", "arg1", "arg2")` is the simplest path** for one-shot sync commands. Returns `Result` (no error — check `Result.Error()` for Go-side issues, `ExitCode()/Failed()` for command status).
- **Shell wrapping**: if the FIRST arg (`name`) contains spaces / `&` / `|`, the framework wraps it in `/bin/sh -c` (or `cmd /c` on Windows). Use this to compose: `Run("ls -la | grep .go")`. For predictable shape, prefer `Pipe` (composable) or split into `name + args`.
- **`Path(dir)` sets working directory** — defaults to current.
- **`Env(map)` ADDS to (or overrides) env vars** — does not REPLACE the inherited environment.
- **`Input(reader)` provides stdin** — defaults to no stdin. Useful for piping data: `Input(bytes.NewReader(payload)).Run("jq", ".")`.
- **`Timeout(d)`** kills the process after `d`. Combine with `WithContext` — earlier deadline wins.
- **`OnOutput(handler)` streams stdout/stderr line-by-line** as bytes arrive. The handler is invoked from a goroutine; protect shared state. Combine with `DisableBuffering()` for high-volume output to avoid memory bloat.
- **`DisableBuffering()` consequence**: `Output()` / `ErrorOutput()` on the Result return empty strings — your `OnOutput` handler is the only sink.
- **`Quietly()` suppresses both stdout/stderr** (discards entirely). `Result.Output()` is empty.
- **`TTY()` for interactive commands**: borrows the terminal. NO output is captured; `Input(...)` is ignored (your real keyboard becomes stdin). Use for password prompts, TUIs, `artisan make:*` etc.
- **`WithSpinner("Building...")` shows a spinner in the terminal** while the process runs — UX nicety.
- **`Pipe` and `Pool` create new builders**: process configurations (timeout, env, context) are NOT inherited. Re-apply them on the Pipeline/Pool.
- **`Start` returns `Running` + error**: error is for spawn failure; otherwise call `.Wait()` to block for completion.
- **Process is mutable; do not share between goroutines** — each method mutates the same builder.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `result, err := facades.Process().Run(...)` | `result := facades.Process().Run(...); if err := result.Error(); err != nil ...` | `Run` returns Result only; Go errors live on `Result.Error()`. |
| Replace env via `Env(map)` expecting only-these-vars | `Env(map)` adds/overrides; PATH and others remain inherited | Env layers on top. |
| `OnOutput(...)` then `result.Output()` returns empty | Combine with `DisableBuffering()` if you only need streaming, OR omit `DisableBuffering` to keep capture too | Buffering = capture in memory. |
| `TTY()` then expect `result.Output()` to capture | TTY discards capture; output goes to your terminal | TTY's whole point. |
| Configure timeout on outer Process then `Pipe(...)` and expect inheritance | Re-apply timeout on the Pipeline | Configurations not inherited by Pipe/Pool. |
| `Run("ls -la | grep .go")` and expect args parsed | This works (auto-wrapped in shell), but for portability use `Pipe`: `Pipe(func(p Pipe){ p.Command("ls").Append("-la"); p.Command("grep").Append(".go") })` | Shell-wrapping is a convenience, Pipe is the structured form. |
| Call `Run` from a request handler with no timeout | Always `Timeout(d)` or `WithContext(ctx)` from the request | Request handler can hang forever. |

## Worked example: timed run + streaming + async + pipe

```go
package services

import (
    "fmt"
    "time"

    "github.com/goravel/framework/contracts/process"

    "yourmodule/app/facades"
)

// One-shot sync with timeout, capture output
func RunMigrations() error {
    result := facades.Process().
        Path("/srv/app").
        Timeout(2 * time.Minute).
        Env(map[string]string{"APP_ENV": "production"}).
        Run("./artisan", "migrate", "--force")

    if err := result.Error(); err != nil {
        return fmt.Errorf("process error: %w", err)
    }
    if result.Failed() {
        return fmt.Errorf("migrate exit %d: %s", result.ExitCode(), result.ErrorOutput())
    }
    return nil
}

// Streaming output for a long-running build
func RunBuild() error {
    result := facades.Process().
        Path("/srv/app").
        Timeout(10 * time.Minute).
        DisableBuffering().
        OnOutput(func(typ process.OutputType, line []byte) {
            tag := "stdout"
            if typ == process.OutputTypeStderr {
                tag = "stderr"
            }
            facades.Log().Info(fmt.Sprintf("[%s] %s", tag, string(line)))
        }).
        Run("npm", "run", "build")

    if result.Failed() {
        return fmt.Errorf("build failed: exit %d", result.ExitCode())
    }
    return nil
}

// Async: start, do other work, wait
func StartWorker() (process.Running, error) {
    return facades.Process().
        Env(map[string]string{"WORKER_ID": "1"}).
        Start("./artisan", "queue:work", "--queue=default")
}

// Pipeline: ls | grep .go (note: Pipe doesn't inherit Process config; reconfigure on the Pipeline)
func ListGoFiles() (string, error) {
    pipeline := facades.Process().Pipe(func(p process.Pipe) {
        p.Command("ls", "-la")
        p.Command("grep", ".go")
    }).Timeout(10 * time.Second)
    result := pipeline.Run()
    if err := result.Error(); err != nil {
        return "", err
    }
    return result.Output(), nil
}
```

## Rules

- `Run` returns `Result` (no separate error). Check `result.Error()` for Go-side issues, `result.Failed()/ExitCode()` for command status.
- `Env(map)` LAYERS on inherited env; does not replace.
- For high-volume output, combine `OnOutput` with `DisableBuffering()` — `Result.Output()` will then be empty.
- `TTY()` discards capture and ignores `Input` — only for interactive commands.
- Always set `Timeout(d)` or `WithContext(ctx)` for commands triggered by request handlers.
- `Pipe` and `Pool` builders do NOT inherit Process config — reconfigure on the Pipeline/Pool.
- `Start` returns `(Running, error)`; call `.Wait()` to block until completion.
- Process builder is mutable — do not share across goroutines.
