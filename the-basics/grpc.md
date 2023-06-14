# Grpc

[[toc]]

## Introduction

Grpc module can be operated by `facades.Grpc()`.

## Controllers

Controllers can be defined in the `/app/grpc/controllers` directory.

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

## Define routing

All routing files can be defined in the `/routes` directory, such as `/routes/grpc.go`. Then bind routes in the `app/providers/grpc_service_provider.go` file.

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

### Register routing

Register routing in the `app/providers/grpc_service_provider.go` file after routing was defined.

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

## Start Grpc Server

Start Grpc in the `main.go` file.

```go
go func() {
  if err := facades.Grpc().Run(facades.Config().GetString("grpc.host")); err != nil {
    facades.Log().Errorf("Grpc run error: %v", err)
  }
}()
```

## Interceptor

The interceptor can be defined in the `app/grpc/inteceptors` folder, and then registered to `app/grpc/kernel.go`.

**Server Interceptor**

You can set the server interceptors in the `app/grpc/kernel.go:UnaryServerInterceptors` method. For example:

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

**Client Interceptor**

You can set the client interceptor in the `app/grpc/kernel.go:UnaryClientInterceptorGroups` method, the method can group interceptors. For example, `interceptors.Client` is included under the `trace` group.

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

the `trace` group can be applied to the configuration item `grpc.clients.interceptors`, in this way, the Client will be applied to all interceptors under the group. For example:

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

<CommentService/>