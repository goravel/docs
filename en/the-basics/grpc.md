# Grpc

[[toc]]

## Introduction

Grpc module can be operated by `facades.Grpc()`.

## Configuration

In the `config/grpc.go` file, you can configure the Grpc module, where `grpc.host` configures the domain name of the server, and `grpc.servers` configures the servers which the client will connect to.

## Controllers

Controllers can be defined in the `app/grpc/controllers` directory.

```go
// app/grpc/controllers
package controllers

import (
  "context"
  "net/http"

  "github.com/goravel/grpc/protos"
)

type UserController struct {}

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

All routing files can be defined in the `routes` directory, such as `routes/grpc.go`.

```go
// routes/grpc.go
package routes

import (
  "github.com/goravel/grpc/protos"

  "goravel/app/facades"
  "goravel/app/grpc/controllers"
)

func Grpc() {
  protos.RegisterUserServer(facades.Grpc().Server(), controllers.NewUserController())
}
```

### Register routing

Register routing in the `bootstrap/app.go::WithRouting` function after routing was defined.

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithRouting(func() {
      routes.Grpc()
    }).
		WithConfig(config.Boot).
		Create()
}
```

## Interceptor

The interceptor can be defined in the `app/grpc/interceptors` folder, and register them in the `WithGrpcServerInterceptors` and `WithGrpcClientInterceptors` functions of the `bootstrap/app.go` file.

```go
func Boot() contractsfoundation.Application {
  return foundation.Setup().
    WithConfig(config.Boot).
		WithGrpcServerInterceptors(func() []grpc.UnaryServerInterceptor {
			return []grpc.UnaryServerInterceptor{
				interceptors.TestServer,
			}
		}).
		WithGrpcClientInterceptors(func() map[string][]grpc.UnaryClientInterceptor {
			return map[string][]grpc.UnaryClientInterceptor{
				"default": {
					interceptors.TestClient,
				},
			}
		}).
    Create()
}
```

The `default` in the example above is a group name can be applied to the configuration item `grpc.servers.interceptors`, in this way, the Client will be applied to all interceptors under the group. For example:

```go
package config

import (
  "goravel/app/facades"
)

func init() {
  config := facades.Config
  config.Add("grpc", map[string]interface{}{
    // Grpc Configuration
    //
    // Configure your server host
    "host": config.Env("GRPC_HOST", ""),

    // Configure your client host and interceptors.
    "servers": map[string]any{
      "user": map[string]any{
        "host":         config.Env("GRPC_USER_HOST", ""),
        "port":         config.Env("GRPC_USER_PORT", ""),
        "interceptors": []string{"trace"},
      },
    },
  })
}
```
