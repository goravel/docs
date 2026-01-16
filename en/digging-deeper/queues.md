# Queues

[[toc]]

## Introduction

When building your web application, there may be tasks, like parsing and storing an uploaded CSV file, that take too long to complete during a web request. Fortunately, Goravel offers a solution by allowing you to create queued jobs that can run in the background. This way, by moving time-intensive tasks to a queue, your application can respond to web requests much faster and provide a better user experience for your customers. To implement this feature, we use `facades.Queue()`.

### Connections Vs. Queues

Before delving into Goravel queues, it's important to understand the difference between "connections" and "queues". In the configuration file, `config/queue.go`, you'll find an array for `connections` configuration. This option specifies the connections to backend queue services like Redis. However, every queue connection can have multiple "queues", which can be thought of as different stacks or piles of queued jobs.

It's essential to note that each connection configuration example in the queue configuration file includes a `queue` attribute. This attribute is the default queue to which jobs will be dispatched when they are sent to a given connection. In simpler terms, if you dispatch a job without explicitly defining which queue it should be dispatched to, the job will be placed in the queue defined in the queue attribute of the connection configuration.

```go
// This job is sent to the default connection's default queue
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{
  {Type: "int", Value: 1},
}).Dispatch()

// This job is sent to the default connection's "emails" queue
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{
  {Type: "int", Value: 1},
}).OnQueue("emails").Dispatch()
```

## Driver

The queue configuration file is stored in `config/queue.go`, and different queue drivers can be set in the configuration file.

### Sync Driver

The sync driver is the default driver, it will not push tasks to the queue, but execute directly in the current process.

### Database Driver

To use the `database` driver, you need to create a database table to store tasks first: [20210101000002_create_jobs_table.go](https://github.com/goravel/goravel/blob/master/database/migrations/20210101000002_create_jobs_table.go). The migration file is located in the `database/migrations` directory by default.

### Custom Driver

If the current driver cannot meet your needs, you can customize the driver. You need to implement the [Driver](https://github.com/goravel/framework/blob/master/contracts/queue/driver.go#L14) interface in `contracts/queue/driver.go`.

The official implementation of the `Redis` driver, you can refer to [Redis Driver](https://github.com/goravel/redis) to implement your own custom driver.

After implementing the custom driver, you can add the configuration to `config/queue.go`:

```
...
"connections": map[string]any{
  "redis": map[string]any{
    "driver": "custom",
    "connection": "default",
    "queue": "default",
    "via": func() (queue.Driver, error) {
        return redisfacades.Queue("redis") // The redis value is the key of connections
    },
  },
},
```

## Creating Jobs

### Generating Job Classes

By default, all of the jobs for your application are stored in the `app/jobs` directory. If the `app/Jobs` directory doesn't exist, it will be created when you run the `make:job` Artisan command:

```shell
./artisan make:job ProcessPodcast
./artisan make:job user/ProcessPodcast
```

### Register Jobs

A new job created by `make:job` will be registered automatically in the `bootstrap/jobs.go::Jobs()` function and the function will be called by `WithJobs`. You need register the job manually if you create the job file by yourself.

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithJobs(Jobs).
		WithConfig(config.Boot).
		Start()
}
```

### Class Structure

Job classes are very simple, consisting of two methods: `Signature` and `Handle`. `Signature` serves as a task's distinct identifier, while `Handle` executes when the queue processes the task. Additionally, the `[]queue.Arg{}` passed when the task executes will be transmitted into `Handle`:

```go
package jobs

type ProcessPodcast struct {
}

// Signature The name and signature of the job.
func (r *ProcessPodcast) Signature() string {
  return "process_podcast"
}

// Handle Execute the job.
func (r *ProcessPodcast) Handle(args ...any) error {
  return nil
}
```

#### Job Retry

Job classes support an optional `ShouldRetry(err error, attempt int) (retryable bool, delay time.Duration)` method, which is used to control job retry.

```go
// ShouldRetry determines if the job should be retried based on the error.
func (r *ProcessPodcast) ShouldRetry(err error, attempt int) (retryable bool, delay time.Duration) {
  return true, 10 * time.Second
}
```

## Start Queue Server

The default queue worker will be run by the runner of queue seriver provider, if you want to start multiple queue workers with different configuration, you can create [a runner](../architecture-concepts/service-providers.md#runners) and add it to the `WithRunners` function in the `bootstrap/app.go` file:

```go
func Boot() contractsfoundation.Application {
  return foundation.Setup().
    WithConfig(config.Boot).
    WithRunners(func() []contractsfoundation.Runner {
      return []contractsfoundation.Runner{
        YourRunner,
      }
    }).
    Start()
}
```

You can check [the default queue runner](https://github.com/goravel/framework/blob/master/queue/runners.go) for reference.

## Dispatching Jobs

Once you have written the job class, you can dispatch it using the `Dispatch` method on the job itself:

```go
package controllers

import (
  "github.com/goravel/framework/contracts/queue"
  "github.com/goravel/framework/contracts/http"

  "goravel/app/facades"
  "goravel/app/jobs"
)

type UserController struct {
}

func (r *UserController) Show(ctx http.Context) {
  err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).Dispatch()
  if err != nil {
    // do something
  }
}
```

### Synchronous Dispatching

If you want to dispatch a job immediately (synchronously), you can use the `DispatchSync` method. When using this method, the job will not be queued and will be executed immediately within the current process:

```go
package controllers

import (
  "github.com/goravel/framework/contracts/queue"
  "github.com/goravel/framework/contracts/http"

  "goravel/app/facades"
  "goravel/app/jobs"
)

type UserController struct {
}

func (r *UserController) Show(ctx http.Context) {
  err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).DispatchSync()
  if err != nil {
    // do something
  }
}
```

### Job Chaining

Job chaining allows you to specify a list of queued jobs to be executed in a specific order. If any job in the sequence fails, the rest of the jobs will not be executed. To run a queued job chain, you can use the `Chain` method provided by the `facades.Queue()`:

```go
err := facades.Queue().Chain([]queue.Jobs{
  {
    Job: &jobs.Test{},
    Args: []queue.Arg{
      {Type: "int", Value: 1},
    },
  },
  {
    Job: &jobs.Test1{},
    Args: []queue.Arg{
      {Type: "int", Value: 2},
    },
  },
}).Dispatch()
```

### Delayed Dispatching

If you would like to specify that a job should not be immediately processed by a queue worker, you may use the `Delay` method during job dispatch. For example, let's specify that a job should not be available for processing after 100 seconds of dispatching:

```go
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).Delay(time.Now().Add(100*time.Second)).Dispatch()
```

### Customizing The Queue & Connection

#### Dispatching To A Particular Queue

By pushing jobs to different queues, you may "categorize" your queued jobs and even prioritize how many workers you assign to various queues.

```go
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).OnQueue("processing").Dispatch()
```

#### Dispatching To A Particular Connection

If your application interacts with multiple queue connections, you can use the `OnConnection` method to specify the connection to which the task is pushed.

```go
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).OnConnection("sync").Dispatch()
```

You may chain the `OnConnection` and `OnQueue` methods together to specify the connection and the queue for a job:

```go
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).OnConnection("sync").OnQueue("processing").Dispatch()
```

## View Failed Jobs

You can use the `queue:failed` command to view failed jobs, this command will get the failed jobs from the `failed_jobs` table in the database:

```shell
./artisan queue:failed
```

## Retrying Failed Jobs

If a job fails during processing, you can use the `queue:retry` command to retry the job. Before retrying the job, you need to get the UUID of the job to be retried from the `failed_jobs` table in the database:

```shell
# Retry a single job
./artisan queue:retry 4427387e-c75a-4295-afb3-2f3d0e410494

# Retry multiple jobs
./artisan queue:retry 4427387e-c75a-4295-afb3-2f3d0e410494 eafdd963-a8b7-4aca-9421-b376ed9f4382

# Retry failed jobs for a specific connection
./artisan queue:retry --connection=redis

# Retry failed jobs for a specific queue
./artisan queue:retry --queue=processing

# Retry failed jobs for a specific connection and queue
./artisan queue:retry --connection=redis --queue=processing

# Retry all failed jobs
./artisan queue:retry all
```

## `queue.Arg.Type` Supported Types

```go
bool
int
int8
int16
int32
int64
uint
uint8
uint16
uint32
uint64
float32
float64
string
[]bool
[]int
[]int8
[]int16
[]int32
[]int64
[]uint
[]uint8
[]uint16
[]uint32
[]uint64
[]float32
[]float64
[]string
```
