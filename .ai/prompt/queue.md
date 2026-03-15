# Goravel Queue

## Configuration

Configure in `config/queue.go`. Default driver: `sync` (runs inline, no queue).

// BREAKING v1.17: Machinery driver is completely removed. Migrate to `redis`, `database`, or `sync`.

Available drivers: `sync`, `database`, `redis` (external package), `custom`.

---

## Define a Job

```shell
./artisan make:job ProcessPodcast
./artisan make:job user/ProcessPodcast
```

```go
package jobs

import "time"

type ProcessPodcast struct{}

// Signature is the unique identifier for the job
func (r *ProcessPodcast) Signature() string {
    return "process_podcast"
}

// Handle executes the job; args come from dispatch
func (r *ProcessPodcast) Handle(args ...any) error {
    // process args
    return nil
}

// ShouldRetry (optional) controls retry behavior on failure
func (r *ProcessPodcast) ShouldRetry(err error, attempt int) (retryable bool, delay time.Duration) {
    return true, 10 * time.Second
}
```

---

## Register Jobs

Jobs created by `make:job` auto-register in `bootstrap/jobs.go`. Register in `bootstrap/app.go`:

```go
func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithJobs(Jobs).
        WithConfig(config.Boot).
        Create()
}
```

---

## Dispatch Jobs

```go
import (
    "github.com/goravel/framework/contracts/queue"
    "goravel/app/facades"
    "goravel/app/jobs"
)

// Default connection and queue
err := facades.Queue().Job(&jobs.ProcessPodcast{}, []queue.Arg{
    {Type: "string", Value: "podcast.mp3"},
    {Type: "int", Value: 42},
}).Dispatch()

// Synchronous dispatch (runs immediately, no queue)
err = facades.Queue().Job(&jobs.ProcessPodcast{}, []queue.Arg{}).DispatchSync()

// Specific queue
err = facades.Queue().Job(&jobs.ProcessPodcast{}, []queue.Arg{}).OnQueue("processing").Dispatch()

// Specific connection
err = facades.Queue().Job(&jobs.ProcessPodcast{}, []queue.Arg{}).OnConnection("redis").Dispatch()

// Connection + queue
err = facades.Queue().Job(&jobs.ProcessPodcast{}, []queue.Arg{}).
    OnConnection("redis").OnQueue("processing").Dispatch()

// Delayed dispatch
err = facades.Queue().Job(&jobs.ProcessPodcast{}, []queue.Arg{}).
    Delay(time.Now().Add(100 * time.Second)).Dispatch()
```

---

## Job Chaining

Jobs run in order; if one fails, remaining jobs are not executed:

```go
err := facades.Queue().Chain([]queue.Jobs{
    {
        Job:  &jobs.ProcessPodcast{},
        Args: []queue.Arg{{Type: "int", Value: 1}},
    },
    {
        Job:  &jobs.NotifySubscribers{},
        Args: []queue.Arg{{Type: "int", Value: 2}},
    },
}).Dispatch()
```

---

## Supported `queue.Arg.Type` Values

```
bool, int, int8, int16, int32, int64,
uint, uint8, uint16, uint32, uint64,
float32, float64, string,
[]bool, []int, []int8, []int16, []int32, []int64,
[]uint, []uint8, []uint16, []uint32, []uint64,
[]float32, []float64, []string
```

---

## Database Driver Setup

For the `database` driver, create the jobs table using the migration at:
`database/migrations/20210101000002_create_jobs_table.go`

---

## Custom Driver

```go
// config/queue.go
"connections": map[string]any{
    "redis": map[string]any{
        "driver":     "custom",
        "connection": "default",
        "queue":      "default",
        "via": func() (queue.Driver, error) {
            return redisfacades.Queue("redis"), nil
        },
    },
},
```

---

## Failed Jobs

```shell
# View failed jobs
./artisan queue:failed

# Retry a specific job (UUID from failed_jobs table)
./artisan queue:retry 4427387e-c75a-4295-afb3-2f3d0e410494

# Retry all failed jobs
./artisan queue:retry all

# Retry by connection or queue
./artisan queue:retry --connection=redis
./artisan queue:retry --queue=processing
```

---

## Custom Queue Runner

```go
WithRunners(func() []contractsfoundation.Runner {
    return []contractsfoundation.Runner{
        YourCustomQueueRunner,
    }
})
```
