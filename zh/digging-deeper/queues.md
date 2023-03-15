# 队列

[[toc]]

## 简介

在构建 Web 应用程序时，你可能需要执行一些比较耗时的任务（例如解析和存储上传的 CSV 文件），Goravel 可以让你轻松地创建可在后台排队处理的任务。通过将耗时的任务移到队列中，你的应用程序可以以超快的速度响应 Web 请求，并为客户提供更好的用户体验。我们使用 `facades.Queue` 实现这些功能。

队列配置文件存储在 `config/queue.go` 中。目前框架支持两种队列驱动： `redis` 和 `sync`。

### 连接 Vs 队列

在开始使用 Goravel 队列之前，理解「连接」和「队列」之间的区别非常重要。在 `config/queue.go` 配置文件中，有一个 `connections` 配置选项。此选项定义到后端服务（如 Redis）的特定连接。然而，任何给定的队列连接都可能有多个「队列」，这些「队列」可能被认为是不同的堆栈或成堆的排队任务。

请注意，`config/queue.go` 文件中的每个连接配置示例都包含一个 `queue` 属性。 这是将任务发送到给定连接时将被分配到的默认队列。换句话说，如果你没有显式地定义任务应该被发送到哪个队列，那么该任务将被放置在 `queue` 定义的队列上：

```go
// 这个任务将被推送到默认队列
err := facades.Queue.Job(&jobs.Test{}, []queue.Arg{
  {Type: "int", Value: 1},
}).Dispatch()

// 这个任务将被推送到 "emails" 队列
err := facades.Queue.Job(&jobs.Test{}, []queue.Arg{
  {Type: "int", Value: 1}
}).OnQueue("emails").Dispatch()
```

## 创建任务

### 生成任务类

默认情况下，应用程序的所有的任务都被存储在了 `app/jobs` 目录中。如果 `app/jobs` 目录不存在，当你运行 `make:job` Artisan 命令时，将会自动创建该目录：

```go
go run . artisan make:job ProcessPodcast
```

### 类结构

任务类非常简单，包含 `Signature`, `Handle` 方法，`Signature` 是任务类的唯一标识，`Handle` 在队列处理任务时将会被调用，在调用任务时传入的 `[]queue.Arg{}` 将会被传入 `Handle` 中：

```go
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

### 注册任务

当任务创建好后，需要注册到 `app/provides/queue_service_provider.go`，以便能够正确调用。

```go
func (receiver *QueueServiceProvider) Jobs() []queue.Job {
  return []queue.Job{
    &jobs.Test{},
  }
}
```

## 启动队列服务器

在根目录下 `main.go` 中启动队列服务器。

```go
package main

import (
  "github.com/goravel/framework/facades"

  "goravel/bootstrap"
)

func main() {
  // This bootstraps the framework and gets it ready for use.
  bootstrap.Boot()

  // Start queue server by facades.Queue.
  go func() {
    if err := facades.Queue.Worker(nil).Run(); err != nil {
      facades.Log.Errorf("Queue run error: %v", err)
    }
  }()

  select {}
}
```

`facades.Queue.Worker` 方法中可以传入不同的参数，通过启动多个 `facades.Queue.Worker`，可以达到监听多个队列的目的。

```go
// 不传参数，默认监听 `config/queue.go` 中的配置，并发数为 1
go func() {
  if err := facades.Queue.Worker(nil).Run(); err != nil {
    facades.Log.Errorf("Queue run error: %v", err)
  }
}()

// 监听 redis 链接的 processing 队列，并发数 10
go func() {
  if err := facades.Queue.Worker(&queue.Args{
    Connection: "redis",
    Queue: "processing",
    Concurrent: 10,
  }).Run(); err != nil {
    facades.Log.Errorf("Queue run error: %v", err)
  }
}()
```

## 调度任务

一旦写好了任务类，你可以使用任务本身的 `dispatch` 方法来调度它：

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
  err := facades.Queue.Job(&jobs.Test{}, []queue.Arg{}).Dispatch()
  if err != nil {
    // do something
  }
}
```

### 同步调度

如果你想立即（同步）调度任务，你可以使用 `dispatchSync` 方法。使用此方法时，任务不会排队，会在当前进程内立即执行：

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

func (r *serController) Show(ctx http.Context) {
  err := facades.Queue.Job(&jobs.Test{}, []queue.Arg{}).DispatchSync()
  if err != nil {
    // do something
  }
}
```

### 任务链

任务链允许你指定一组按顺序运行的排队任务。如果序列中的一个任务失败，其余的任务将不会运行。要执行一个排队的任务链，你可以使用 `facades.Queue` 提供的 `chain` 方法：

```go
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

### 延迟调度

如果您想指定任务不应立即被队列处理，您可以在调度任务时使用 `Delay` 方法。例如，让我们指定一个任务在分派 10 分钟后处理：

```go
err := facades.Queue.Job(&jobs.Test{}, []queue.Arg{}).Delay(time.Now().Add(100*time.Second)).Dispatch()
```

### 自定义队列 & 连接

#### 分派到特定队列

通过将任务推送到不同的队列，你可以对排队的任务进行「分类」，甚至可以优先考虑分配给各个队列的 worker 数量。

```go
err := facades.Queue.Job(&jobs.Test{}, []queue.Arg{}).OnQueue("processing").Dispatch()
```

#### 调度到特定连接

如果你的应用程序与多个队列连接交互，你可以使用 `onConnection` 方法指定将任务推送到哪个连接：

```go
err := facades.Queue.Job(&jobs.Test{}, []queue.Arg{}).OnConnection("sync").Dispatch()
```

你可以将 onConnection 和 onQueue 方法链接在一起，以指定任务的连接和队列：

```go
err := facades.Queue.Job(&jobs.Test{}, []queue.Arg{}).OnConnection("sync").OnQueue("processing").Dispatch()
```

## `queue.Arg.Type` 支持的类型

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