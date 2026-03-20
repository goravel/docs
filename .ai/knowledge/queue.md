# Queue Facade

## Core Imports

```go
import (
    "time"
    "github.com/goravel/framework/contracts/queue"
    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/queue/job.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/queue/queue.go`

## Available Methods

**facades.Queue():**

- `Job(job Job, args ...[]Arg)` PendingJob - create dispatchable task
- `Chain([]ChainJob)` PendingJob - create chained sequence
- `Worker(payloads ...Args)` Worker - create a queue worker
- `Register(jobs []Job)` - register jobs manually

**PendingJob:**

- `.Dispatch()` error - push to queue
- `.DispatchSync()` error - execute immediately in current process
- `.Delay(time.Time)` PendingJob - delay until absolute time
- `.OnQueue(name)` PendingJob - named queue
- `.OnConnection(name)` PendingJob - named connection

## Implementation Example

```go
// app/jobs/process_podcast.go
package jobs

import "time"

type ProcessPodcast struct{}

func (r *ProcessPodcast) Signature() string { return "process_podcast" }

func (r *ProcessPodcast) Handle(args ...any) error {
    podcastID := args[0].(int)
    _ = podcastID
    return nil
}

// Optional retry control
func (r *ProcessPodcast) ShouldRetry(err error, attempt int) (bool, time.Duration) {
    if attempt < 3 { return true, 10 * time.Second }
    return false, 0
}

// app/jobs/send_notification.go
type SendNotification struct{}
func (r *SendNotification) Signature() string       { return "send_notification" }
func (r *SendNotification) Handle(args ...any) error { return nil }

// controllers/podcast_controller.go
package controllers

import (
    "time"
    "github.com/goravel/framework/contracts/http"
    "github.com/goravel/framework/contracts/queue"
    "yourmodule/app/facades"
    "yourmodule/app/jobs"
)

type PodcastController struct{}

func (r *PodcastController) Store(ctx http.Context) http.Response {
    podcastID := 42

    // Basic dispatch
    _ = facades.Queue().Job(&jobs.ProcessPodcast{}, []queue.Arg{
        {Type: "int", Value: podcastID},
    }).Dispatch()

    // Delayed to specific time
    _ = facades.Queue().Job(&jobs.ProcessPodcast{}, []queue.Arg{
        {Type: "int", Value: podcastID},
    }).Delay(time.Now().Add(5 * time.Minute)).OnQueue("podcasts").Dispatch()

    // Chained - stops on first failure
    _ = facades.Queue().Chain([]queue.ChainJob{
        {Job: &jobs.ProcessPodcast{},    Args: []queue.Arg{{Type: "int",    Value: podcastID}}},
        {Job: &jobs.SendNotification{}, Args: []queue.Arg{{Type: "string", Value: "done"}}},
    }).Dispatch()

    return ctx.Response().Json(http.StatusAccepted, http.Json{"queued": true})
}
```

## Rules

- Register jobs via `WithJobs(Jobs)` in `bootstrap/app.go`; `make:job` auto-registers in `bootstrap/jobs.go`.
- `Signature()` must be unique across all jobs.
- `Handle(args ...any)` receives args in the same order as `[]Arg` passed at dispatch.
- `Arg.Type` must be a supported primitive string - see list below.
- `Chain` stops at first job failure; subsequent jobs are not executed.
- `Delay` takes `time.Time` (absolute), not `time.Duration` - use `time.Now().Add(d)`.
- `DispatchSync` bypasses the queue entirely; executes in the current goroutine.
- `Jobs` type alias for `ChainJob` is deprecated; use `ChainJob` directly.
- Machinery driver is removed; available drivers: `sync`, `database`, `redis` (via `goravel/redis`).
- Configure connections in `config/queue.go`; set `default` connection name.

**Supported `Arg.Type` values:**
`bool`, `int`, `int8`, `int16`, `int32`, `int64`, `uint`, `uint8`, `uint16`, `uint32`, `uint64`, `float32`, `float64`, `string`, `[]bool`, `[]int`, `[]int8`, `[]int16`, `[]int32`, `[]int64`, `[]uint`, `[]uint8`, `[]uint16`, `[]uint32`, `[]uint64`, `[]float32`, `[]float64`, `[]string`
