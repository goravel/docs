# Grpc

[[toc]]

## 简介

Grpc 模块可以使用 `facades.Grpc()` 进行操作。

## 配置

在 `config/grpc.go` 中进行 Grpc 模块的配置，其中 `grpc.host` 配置 server 的域名，`grpc.clients` 配置 client 的相关信息。

## 控制器

控制器文件可以定义在 `/app/grpc/controllers` 目录中。

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

所有路由文件可以定义在 `/routes` 目录中，例如 `/routes/grpc.go`。 然后注册到 `app/providers/grpc_service_provider.go` 文件中，以实现路由的绑定。

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

路由定义好后，在 `app/providers/grpc_service_provider.go` 文件中注册路由。

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

在 `main.go` 中启动 Grpc.

```go
go func() {
  if err := facades.Grpc().Run(); err != nil {
    facades.Log().Errorf("Grpc run error: %v", err)
  }
}()
```

## 拦截器

拦截器可以定义在 `app/grpc/inteceptors` 文件夹中，然后注册到 `app/grpc/kernel.go`。

**服务端拦截器**

在 `app/grpc/kernel.go:UnaryServerInterceptors` 方法中设置服务端拦截器。 例如：

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

在 `app/grpc/kernel.go:UnaryClientInterceptorGroups` 方法中设置客户端拦截器，该方法可以对拦截器进行分组。 例如设置 `trace` 分组下包含 `interceptors.Client`。

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

分组名 `trace` 可以被应用到配置项 `grpc.clients.interceptors` 上，这样该 `Client` 就会被应用该分组下的所有拦截器。 例如：

```go
package config

import (
  "github.com/goravel/framework/facades"
)

func init() {
  config := facades.Config
  config.Add("grpc", map[string]interface{}{
    // Grpc Configuration
    //
    // Configure your server host
    "host": config.Env("GRPC_HOST", ""),

    // Configure your client host and interceptors.
    // Interceptors can be the group name of UnaryClientInterceptorGroups in app/grpc/kernel.go.
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

// 创建一个通道来监听操作系统信号
quit := make(chan os.Signal)
signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

// 通过 facades.Grpc 启动 Grpc
go func() {
  if err := facades.Grpc().Run(); err != nil {
    facades.Log().Errorf("Grpc run error: %v", err)
  }
}()

// 监听操作系统信号
go func() {
  <-quit
  if err := facades.Grpc().Shutdown(); err != nil {
    facades.Log().Errorf("Grpc Shutdown error: %v", err)
  }

  os.Exit(0)
}()

select {}
```
