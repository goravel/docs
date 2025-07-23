# Grpc

[[toc]]

## 简介

Grpc模块可以通过`facades.Grpc()`操作。

## 控制器

控制器可以在`/app/grpc/controllers`目录中定义。

```go
// app/grpc/controllers
package controllers

import (
  "context"
  "net/http"

  "github.com/goravel/grpc/protos"
)

type UserController struct {
}

func NewUserController() *UserController {
  return &UserController{}
}

func (r *UserController) Show(ctx context.Context, req *protos.UserRequest) (protoBook *protos.UserResponse, err error) {
  return &protos.UserResponse{
    Code: http.StatusOK,
  }, nil
}
```

## 定义路由

所有路由文件可以在`/routes`目录中定义，例如`/routes/grpc.go`。 然后在`app/providers/grpc_service_provider.go`文件中绑定路由。 Then bind routes in the `app/providers/grpc_service_provider.go` file.

```go
// routes/grpc.go
package routes

import (
  "github.com/goravel/grpc/protos"
  "github.com/goravel/framework/facades"

  "goravel/app/grpc/controllers"
)

func Grpc() {
  protos.RegisterUserServer(facades.Grpc().Server(), controllers.NewUserController())
}
```

### 注册路由

在定义路由后，在 `app/providers/grpc_service_provider.go` 文件中注册路由。

```go
// app/providers/grpc_service_provider.go
package providers

import (
  "goravel/routes"
)

type GrpcServiceProvider struct {
}

func (router *GrpcServiceProvider) Register() {

}

func (router *GrpcServiceProvider) Boot() {
  routes.Grpc()
}
```

## 启动 Grpc 服务器

在 `main.go` 文件中启动 Grpc。

```go
go func() {
  if err := facades.Grpc().Run(facades.Config().GetString("grpc.host")); err != nil {
    facades.Log().Errorf("Grpc运行错误：%v", err)
  }
}()
```

## Interceptor

拦截器可以在 `app/grpc/inteceptors` 文件夹中定义，然后注册到 `app/grpc/kernel.go` 中。

**服务端拦截器**

你可以在 `app/grpc/kernel.go:UnaryServerInterceptors` 方法中设置服务端拦截器。 例如： For example:

```go
// app/grpc/kernel.go
import (
  "goravel/app/grpc/interceptors"

  "google.golang.org/grpc"
)

func (kernel *Kernel) UnaryServerInterceptors() []grpc.UnaryServerInterceptor {
  return []grpc.UnaryServerInterceptor{
    interceptors.Server,
  }
}
```

**客户端拦截器**

你可以在 `app/grpc/kernel.go:UnaryClientInterceptorGroups` 方法中设置客户端拦截器，该方法可以对拦截器进行分组。 例如，`interceptors.Client` 包含在 `trace` 组下。 For example, `interceptors.Client` is included under the `trace` group.

```go
// app/grpc/kernel.go
import (
  "goravel/app/grpc/interceptors"

  "google.golang.org/grpc"
)

func (kernel *Kernel) UnaryClientInterceptorGroups() map[string][]grpc.UnaryClientInterceptor {
  return map[string][]grpc.UnaryClientInterceptor{
    "trace": {
      interceptors.Client,
    },
  }
}
```

可以将 `trace` 组应用于配置项 `grpc.clients.interceptors`，这样 Client 将应用于该组下的所有拦截器。 例如： For example:

```go
package config

import (
  "github.com/goravel/framework/facades"
)

func init() {
  config := facades.Config
  config.Add("grpc", map[string]interface{}{
    // gRPC 配置
    //
    // 配置你的服务器主机
    "host": config.Env("GRPC_HOST", ""),

    // 配置你的客户端主机和拦截器。
    // 拦截器可以是 app/grpc/kernel.go 中 UnaryClientInterceptorGroups 的组名。
    "clients": map[string]any{
      "user": map[string]any{
        "host":         config.Env("GRPC_USER_HOST", ""),
        "port":         config.Env("GRPC_USER_PORT", ""),
        "interceptors": []string{"trace"},
      },
    },
  })
}
```

## 关闭 Grpc

你可以调用 `Shutdown` 方法优雅的关闭 Grpc，该方法将会等待所有请求处理完毕后再执行关闭操作。

```go
// main.go
bootstrap.Boot()

// Create a channel to listen for OS signals
quit := make(chan os.Signal)
signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

// Start schedule by facades.Schedule
go func() {
  if err := facades.Grpc().Run(facades.Config().GetString("grpc.host")); err != nil {
    facades.Log().Errorf("Grpc run error: %v", err)
  }
}()

// Listen for the OS signal
go func() {
  <-quit
  if err := facades.Grpc().Shutdown(); err != nil {
    facades.Log().Errorf("Grpc Shutdown error: %v", err)
  }

  os.Exit(0)
}()

select {}
```
