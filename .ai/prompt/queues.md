# Goravel Queues

## Job Definition

Jobs live in `app/jobs/`.

```go
package jobs

type ProcessPodcast struct{}

func (r *ProcessPodcast) Signature() string {
    return "process_podcast"
}

func (r *ProcessPodcast) Handle(args ...any) error {
    // args are positional, matching the []queue.Arg slice passed at dispatch
    return nil
}
```

### With retry control

```go
import "time"

func (r *ProcessPodcast) ShouldRetry(err error, attempt int) (retryable bool, delay time.Duration) {
    return true, 10 * time.Second
}
```

### Generate job

```shell
./artisan make:job ProcessPodcast
./artisan make:job user/ProcessPodcast
```

---

## Register Jobs

Generated jobs auto-register in `bootstrap/jobs.go`. Manual registration:

```go
func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithJobs(jobs.Jobs).
        WithConfig(config.Boot).
        Create()
}
```

---

## Dispatching Jobs

```go
import (
    "github.com/goravel/framework/contracts/queue"
    "goravel/app/facades"
    "goravel/app/jobs"
)

// Dispatch to default queue
err := facades.Queue().Job(&jobs.ProcessPodcast{}, []queue.Arg{
    {Type: "int", Value: 1},
    {Type: "string", Value: "example"},
}).Dispatch()

// Dispatch synchronously (runs immediately in current process)
err := facades.Queue().Job(&jobs.ProcessPodcast{}, []queue.Arg{
    {Type: "int", Value: 1},
}).DispatchSync()
```

---

## Dispatch Options

### Named queue

```go
err := facades.Queue().Job(&jobs.ProcessPodcast{}, []queue.Arg{}).OnQueue("emails").Dispatch()
```

### Named connection

```go
err := facades.Queue().Job(&jobs.ProcessPodcast{}, []queue.Arg{}).OnConnection("redis").Dispatch()
```

### Connection and queue together

```go
err := facades.Queue().Job(&jobs.ProcessPodcast{}, []queue.Arg{}).
    OnConnection("redis").
    OnQueue("high").
    Dispatch()
```

### Delayed dispatch

```go
import "time"

err := facades.Queue().Job(&jobs.ProcessPodcast{}, []queue.Arg{}).
    Delay(time.Now().Add(100 * time.Second)).
    Dispatch()
```

---

## Job Chaining

Executes jobs in order. Stops on first failure.

```go
err := facades.Queue().Chain([]queue.Jobs{
    {
        Job: &jobs.ProcessPodcast{},
        Args: []queue.Arg{
            {Type: "int", Value: 1},
        },
    },
    {
        Job: &jobs.SendPodcastEmail{},
        Args: []queue.Arg{
            {Type: "string", Value: "user@example.com"},
        },
    },
}).Dispatch()
```

---

## Supported Arg Types

```
bool, int, int8, int16, int32, int64
uint, uint8, uint16, uint32, uint64
float32, float64
string
[]bool, []int, []int8, []int16, []int32, []int64
[]uint, []uint8, []uint16, []uint32, []uint64
[]float32, []float64
[]string
```

---

## Drivers

Configure in `config/queue.go`.

| Driver | Description |
|--------|-------------|
| `sync` | Runs in current process, no queue (default) |
| `database` | Stores jobs in database table |
| custom | Implement `contracts/queue/driver.go` interface |

### Database driver setup

Create the jobs table migration: `20210101000002_create_jobs_table.go` (included in the default goravel template).

### Custom driver configuration

```go
// config/queue.go
"connections": map[string]any{
    "redis": map[string]any{
        "driver":     "custom",
        "connection": "default",
        "queue":      "default",
        "via": func() (queue.Driver, error) {
            return redisfacades.Queue("redis")
        },
    },
},
```

---

## Failed Jobs

View failed jobs:

```shell
./artisan queue:failed
```

Retry failed jobs:

```shell
# Single job by UUID
./artisan queue:retry 4427387e-c75a-4295-afb3-2f3d0e410494

# Multiple jobs
./artisan queue:retry uuid1 uuid2

# All failed jobs
./artisan queue:retry all

# By connection
./artisan queue:retry --connection=redis

# By queue
./artisan queue:retry --queue=processing
```

---

## Reading Args in Handle

Args are passed positionally. Match by index:

```go
func (r *ProcessPodcast) Handle(args ...any) error {
    podcastID := args[0].(int)
    title := args[1].(string)
    return nil
}
```

Dispatched with:

```go
facades.Queue().Job(&jobs.ProcessPodcast{}, []queue.Arg{
    {Type: "int", Value: podcastID},
    {Type: "string", Value: title},
}).Dispatch()
```

---

## Custom Queue Workers (Runners)

The default queue worker is started automatically. To run additional workers with different config, add a runner:

```go
func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithConfig(config.Boot).
        WithRunners(func() []contractsfoundation.Runner {
            return []contractsfoundation.Runner{
                NewCustomQueueRunner(),
            }
        }).
        Create()
}
```

---

## Gotchas

- `Type` in `queue.Arg` must be an exact string from the supported list. Invalid types cause silent failures.
- Arguments in `Handle(args ...any)` are positional. Order must match the `[]queue.Arg` slice passed at dispatch.
- The sync driver runs jobs synchronously in the same process. It does not queue anything. Use it for testing or development only.
- For database driver, create the `jobs` and `failed_jobs` tables before dispatching.
