# Grpc

[[toc]]

## Introduction

Grpc module can be operated by `facades.Grpc`.

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
  protos.RegisterUserServer(facades.Grpc.Server(), controllers.NewUserController())
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
  if err := facades.Grpc.Run(facades.Config.GetString("grpc.host")); err != nil {
    facades.Log.Errorf("Grpc run error: %v", err)
  }
}()
```

## Extension

`facades.Grpc` provide extension methods, they can extend Server, for example, set middlewares:

| Name                             | Description         |
| -------------------------------- | ------------------- |
| `Server() *grpc.Server`          | Get Server Instance |
| `SetServer(server *grpc.Server)` | Set Server Instance |

### Set Tracing Analysis Middlewares

```go
// app/providers/grpc_service_provider.go
package providers

import (
	"github.com/goravel/framework/facades"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	"google.golang.org/grpc"

	"goravel/routes"
)

type GrpcServiceProvider struct {
}

func (router *GrpcServiceProvider) Register() {

}

func (router *GrpcServiceProvider) Boot() {
	facades.Grpc.SetServer(grpc.NewServer(grpc.UnaryInterceptor(
		grpc_middleware.ChainUnaryServer(
			// Add middleware
		),
	)))

	routes.Grpc()
}
```
