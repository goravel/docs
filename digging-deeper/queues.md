# Queues

[[toc]]

## Introduction

When building your web application, there may be tasks, like parsing and storing an uploaded CSV file, that take too long to complete during a web request. Fortunately, Goravel offers a solution by allowing you to create queued jobs that can run in the background. This way, by moving time-intensive tasks to a queue, your application can respond to web requests much faster and provide a better user experience for your customers. To implement this feature, we use `facades.Queue()`.  

Goravel's queue configuration options are saved in your application's `config/queue.go` configuration file. Goravel supports two drivers: `redis` and `sync`.

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

## Creating Jobs

### Generating Job Classes

By default, all of the jobs for your application are stored in the `app/jobs` directory. If the `app/Jobs` directory doesn't exist, it will be created when you run the `make:job` Artisan command:

```shell
go run . artisan make:job ProcessPodcast
go run . artisan make:job user/ProcessPodcast
```

### Class Structure

Job classes are very simple, consisting of two methods: `Signature` and `Handle`. `Signature` serves as a task's distinct identifier, while `Handle` executes when the queue processes the task. Additionally, the `[]queue.Arg{}` passed when the task executes will be transmitted into `Handle`:

```go
package jobs

type ProcessPodcast struct {
}

// Signature The name and signature of the job.
func (receiver *ProcessPodcast) Signature() string {
  return "process_podcast"
}

// Handle Execute the job.
func (receiver *ProcessPodcast) Handle(args ...any) error {
  return nil
}
```

### Register Job

After creating the job, you need to register it in `app/provides/queue_service_provider.go`, so that it can be called correctly.

```go
func (receiver *QueueServiceProvider) Jobs() []queue.Job {
  return []queue.Job{
    &jobs.Test{},
  }
}
```

## Start Queue Server

Start the queue server in `main.go` in the root directory.

```go
package main

import (
  "github.com/goravel/framework/facades"

  "goravel/bootstrap"
)

func main() {
  // This bootstraps the framework and gets it ready for use.
  bootstrap.Boot()

  // Start queue server by facades.Queue().
  go func() {
    if err := facades.Queue().Worker(nil).Run(); err != nil {
      facades.Log().Errorf("Queue run error: %v", err)
    }
  }()

  select {}
}
```

Different parameters can be passed in the `facades.Queue().Worker` method, you can monitor multiple queues by starting multiple `facades.Queue().Worker`.

```go
// No parameters, default listens to the configuration in the `config/queue.go`, and the number of concurrency is 1
go func() {
  if err := facades.Queue().Worker(nil).Run(); err != nil {
    facades.Log().Errorf("Queue run error: %v", err)
  }
}()

// Monitor processing queue for redis link, and the number of concurrency is 10
go func() {
  if err := facades.Queue().Worker(&queue.Args{
    Connection: "redis",
    Queue: "processing",
    Concurrent: 10,
  }).Run(); err != nil {
    facades.Log().Errorf("Queue run error: %v", err)
  }
}()
```

## Dispatching Jobs

Once you have written the job class, you can dispatch it using the `Dispatch` method on the job itself:

```go
package controllers

import (
  "github.com/goravel/framework/contracts/queue"
  "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/facades"

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
  "github.com/goravel/framework/facades"

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

<CommentService/>