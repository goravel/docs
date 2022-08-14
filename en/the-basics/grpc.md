## Introduction

Grpc module can be operated by `facades.Grpc`.

## Routing File

All routing files can be difined in the `/routes` directory, such as `/routes/grpc.go`. Then register to the `app/providers/grpc_service_provider.go` file, to bind routes.

```
// routes/grpc.go
func Grpc() {
  protos.RegisterUserServer(facades.Grpc.Server(), &controllers.UserController{})
}

// app/providers/grpc_service_provider.go
func (router *GrpcServiceProvider) Boot() {
  routes.Grpc()
}
```

## Controllers

Controllers can be difined in the `/app/grpc/controllers` directory.

```
// /app/grpc/controllers/user_controller.go
package controllers

import (
  "context"
  "net/http"
  "goravel/protos"
)

type UserController struct {
}

func (r *UserController) GetUser(ctx context.Context, req *protos.UserRequest) (protoUser *protos.UserResponse, err error) {
  return &protos.UserResponse{
    Code: http.StatusOK,
    Data: &protos.User{
      Id: user.Id,
    },
  }, nil
}
```

## Start Grpc Server

Start Grpc in the `main.go` file.

```
go func() {
  if err := facades.Grpc.Run(facades.Config.GetString("grpc.host")); err != nil {
    facades.Log.Errorf("Grpc run error: %v", err)
  }
}()
```

## Extension

`facades.Grpc` provide extension methods, they can extend Server, for example, the setting of middlewares:

| Name                             | Description         |
| -------------------------------- | ------------------- |
| `Server() *grpc.Server`          | Get Server Instance |
| `SetServer(server *grpc.Server)` | Set Server Instance |

```
// Set Tracing Analysis Middlewares
// app/providers/grpc_service_provider.go
func (router *GrpcServiceProvider) Boot() {
  tracer, _ := helpers.NewJaegerTracer()

  facades.Grpc.SetServer(grpc.NewServer(grpc.UnaryInterceptor(
    grpc_middleware.ChainUnaryServer(
      middleware.OpentracingServer(tracer),
    ),
  )))

  routes.Grpc()
}
```
