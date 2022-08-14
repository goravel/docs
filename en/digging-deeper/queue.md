## Introduction

While building your web application, you may have some tasks, such as parsing and storing an uploaded CSV file, that take too long to perform during a typical web request. Thankfully, Goravel allows you to easily create queued jobs that may be processed in the background. By moving time intensive tasks to a queue, your application can respond to web requests with blazing speed and provide a better user experience to your customers.

Goravel's queue configuration options are stored in your application's `config/queue.go` configuration file. In this file, you will find connection configurations for each of the queue drivers that are included with the framework, including the `redis` and `sync` driver.

### Connections Vs. Queues

Before getting started with Goravel queues, it is important to understand the distinction between "connections" and "queues". In your `config/queue.go` configuration file, there is a `connections` configuration array. This option defines the connections to backend queue services such as Redis. However, any given queue connection may have multiple "queues" which may be thought of as different stacks or piles of queued jobs.

Note that each connection configuration example in the queue configuration file contains a queue attribute. This is the default queue that jobs will be dispatched to when they are sent to a given connection. In other words, if you dispatch a job without explicitly defining which queue it should be dispatched to, the job will be placed on the queue that is defined in the queue attribute of the connection configuration:

```
// This job is sent to the default connection's default queue
err := facades.Queue.Job(&jobs.Test{}, []queue.Arg{
  {Type: "int", Value: 1}
}).Dispatch()

// This job is sent to the default connection's "emails" queue
err := facades.Queue.Job(&jobs.Test{}, []queue.Arg{
  {Type: "int", Value: 1}
}).OnQueue("emails").Dispatch()
```

## Creating Jobs

### Generating Job Classes

By default, all of the queueable jobs for your application are stored in the `app/jobs` directory. If the `app/Jobs` directory doesn't exist, it will be created when you run the make:job Artisan command:

```
go run . artisan make:job ProcessPodcast
```

### Class Structure

Job classes are very simple, containing two methods: `Signature`, `Handle`, `Signature` is the unique identifier of the task, `Handle` will be called when the queue processes the task, the `[]queue.Arg{}` passed when the task is called will be passed into `Handle`:

```
package jobs

type ProcessPodcast struct {
}

//Signature The name and signature of the job.
func (receiver *ProcessPodcast) Signature() string {
  return "process_podcast"
}

//Handle Execute the job.
func (receiver *ProcessPodcast) Handle(args ...interface{}) error {
  return nil
}
```

### Register Job

After creating the job, you need to register it on the `app/provides/queue_service_provider.go`, so that it can be called correctly.

```
func (receiver *QueueServiceProvider) Jobs() []queue.Job {
  return []queue.Job{
    &jobs.Test{},
  }
}
```

## Start Queue Server

Start the queue server in `main.go` in the root directory.

```
package main

import (
  "github.com/goravel/framework/support/facades"
  "goravel/bootstrap"
)

func main() {
  // This bootstraps the framework and gets it ready for use.
  bootstrap.Boot()

  // Start http server by facades.Route.
  go func() {
    if err := facades.Route.Run(facades.Config.GetString("app.host")); err != nil {
      facades.Log.Errorf("Route run error: %v", err)
    }
  }()

  // Start queue server by facades.Queue.
  go func() {
    if err := facades.Queue.Worker(queue.Args{}).Run(); err != nil {
      facades.Log.Errorf("Queue run error: %v", err)
    }
  }()

  select {}
}
```

Different parameters can be passed in the `facades.Queue.Worker` method, you can monitor multiple queues by starting multiple `facades.Queue.Worker`

```
// No parameters, default listens to the configuration in the `config/queue.go`, and the number of concurrency is 1
go func() {
    if err := facades.Queue.Worker(queue.Args{}).Run(); err != nil {
      facades.Log.Errorf("Queue run error: %v", err)
    }
  }()

// Monotor processing queue for redis link, and the number of concurrency is 10
go func() {
    if err := facades.Queue.Worker(queue.Args{
      Connection: "redis",
      Queue: "processing",
      Concurrent: 10,
    }).Run(); err != nil {
      facades.Log.Errorf("Queue run error: %v", err)
    }
  }()
```

## Dispatching Jobs

Once you have written your job class, you may dispatch it using the `dispatch` method on the job itself:

```
package controllers

import (
  "github.com/gin-gonic/gin"
  "github.com/goravel/framework/contracts/queue"
  "github.com/goravel/framework/support/facades"
  "goravel/app/jobs"
)

type UserController struct {
}

func (r UserController) Show(ctx *gin.Context) {
  err := facades.Queue.Job(&jobs.Test{}, []queue.Arg{}).Dispatch()
  if err != nil {
    // do something
  }
}
```

### Synchronous Dispatching

If you would like to dispatch a job immediately (synchronously), you may use the `dispatchSync` method. When using this method, the job will not be queued and will be executed immediately within the current process:

```
package controllers

import (
  "github.com/gin-gonic/gin"
  "github.com/goravel/framework/contracts/queue"
  "github.com/goravel/framework/support/facades"
  "goravel/app/jobs"
)

type UserController struct {
}

func (r UserController) Show(ctx *gin.Context) {
  err := facades.Queue.Job(&jobs.Test{}, []queue.Arg{}).DispatchSync()
  if err != nil {
    // do something
  }
}
```

### Job Chaining

Job chaining allows you to specify a list of queued jobs that should be run in sequence after the primary job has executed successfully. If one job in the sequence fails, the rest of the jobs will not be run. To execute a queued job chain, you may use the `chain` method provided by the `facades.Queue`:

```
err := facades.Queue.Chain([]queue.Jobs{
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

### Customizing The Queue & Connection

#### Dispatching To A Particular Queue

By pushing jobs to different queues, you may "categorize" your queued jobs and even prioritize how many workers you assign to various queues. Keep in mind, this does not push jobs to different queue "connections" as defined by your queue configuration file, but only to specific queues within a single connection. To specify the queue, use the `onQueue` method when dispatching the job:

```
err := facades.Queue.Job(&jobs.Test{}, []queue.Arg{}).OnQueue("processing").Dispatch()
```

#### Dispatching To A Particular Connection

If your application interacts with multiple queue connections, you may specify which connection to push a job to using the `onConnection` method:

```
err := facades.Queue.Job(&jobs.Test{}, []queue.Arg{}).OnConnection("sync").Dispatch()
```

You may chain the `onConnection` and `onQueue` methods together to specify the connection and the queue for a job:

```
err := facades.Queue.Job(&jobs.Test{}, []queue.Arg{}).OnConnection("sync").OnQueue("processing").Dispatch()
```

## `queue.Arg.Type` Supported Types

```
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
