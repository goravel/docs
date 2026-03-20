# gRPC Facade

## Core Imports

```go
import (
    "context"
    "net/http"
    "google.golang.org/grpc"
    "google.golang.org/grpc/stats"
    contractshttp "github.com/goravel/framework/contracts/http"

    proto "github.com/goravel/example-proto" // your generated proto package
    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/grpc/grpc.go`

## Available Methods

**facades.Grpc():**

- `Server()` \*grpc.Server - get the gRPC server instance (use to register services in routes)
- `Connect(name)` (\*grpc.ClientConn, error) - get client connection by server name from config

**bootstrap/app.go registration:**

- `WithGrpcServerInterceptors(func() []grpc.UnaryServerInterceptor)`
- `WithGrpcClientInterceptors(func() map[string][]grpc.UnaryClientInterceptor)` - key = interceptor group name
- `WithGrpcServerStatsHandlers(func() []stats.Handler)`
- `WithGrpcClientStatsHandlers(func() map[string][]stats.Handler)` - key = server name from config

## Implementation Example

```go
// config/grpc.go
config.Add("grpc", map[string]any{
    "host": config.Env("GRPC_HOST", ""),
    "port": config.Env("GRPC_PORT", "9000"),
    "servers": map[string]any{           // BREAKING v1.17: was "clients"
        "user": map[string]any{
            "host":           config.Env("GRPC_USER_HOST", "127.0.0.1"),
            "port":           config.Env("GRPC_USER_PORT", "9001"),
            "interceptors":   []string{"default"},   // client interceptor group
            "stats_handlers": []string{"user"},       // client stats handler group
        },
    },
})

// routes/grpc.go - register gRPC service
package routes

import (
    proto "github.com/goravel/example-proto"
    "yourmodule/app/facades"
    grpccontrollers "yourmodule/app/grpc/controllers"
)

func Grpc() {
    proto.RegisterUserServiceServer(
        facades.Grpc().Server(),
        grpccontrollers.NewUserController(),
    )
}

// app/grpc/controllers/user_controller.go
package controllers

import (
    "context"
    "net/http"
    proto "github.com/goravel/example-proto"
)

type UserController struct{}

func NewUserController() *UserController { return &UserController{} }

func (r *UserController) GetUser(ctx context.Context, req *proto.UserRequest) (*proto.UserResponse, error) {
    return &proto.UserResponse{
        Code: http.StatusOK,
        Data: &proto.User{Id: 1, Name: "Goravel", Token: req.GetToken()},
    }, nil
}

// HTTP controller calling gRPC
// app/http/controllers/grpc_controller.go
package controllers

import (
    "fmt"
    proto "github.com/goravel/example-proto"
    contractshttp "github.com/goravel/framework/contracts/http"
    "yourmodule/app/facades"
)

type GrpcController struct {
    userService proto.UserServiceClient
}

func NewGrpcController() *GrpcController {
    conn, err := facades.Grpc().Connect("user") // BREAKING: was Client()
    if err != nil {
        facades.Log().Errorf("grpc connect failed: %+v", err)
    }
    return &GrpcController{userService: proto.NewUserServiceClient(conn)}
}

func (r *GrpcController) GetUser(ctx contractshttp.Context) contractshttp.Response {
    resp, err := r.userService.GetUser(ctx.Context(), &proto.UserRequest{
        Token: ctx.Request().Input("token"),
    })
    if err != nil {
        return ctx.Response().String(contractshttp.StatusInternalServerError, fmt.Sprintf("%+v", err))
    }
    return ctx.Response().Success().Json(resp.GetData())
}

// Interceptors - bootstrap/app.go
// WithGrpcServerInterceptors(func() []grpc.UnaryServerInterceptor {
//     return []grpc.UnaryServerInterceptor{interceptors.AuthServer}
// }).
// WithGrpcClientInterceptors(func() map[string][]grpc.UnaryClientInterceptor {
//     return map[string][]grpc.UnaryClientInterceptor{
//         "default": {interceptors.LogClient}, // "default" matches config interceptors array
//     }
// })
```

## Rules

- `facades.Grpc().Client("name")` is **deprecated** - use `facades.Grpc().Connect("name")`.
- Config key is `grpc.servers` - **not** `grpc.clients` (renamed in v1.17).
- gRPC controllers use `context.Context` (stdlib), not `http.Context` (Goravel).
- Register gRPC services in `routes/grpc.go` → called from `WithRouting` in `bootstrap/app.go`.
- Client interceptor map key matches the `interceptors` array value in `config/grpc.go` servers config.
- Stats handler map key for clients matches the `stats_handlers` array value in config.
- `Connect` returns `*grpc.ClientConn` - wrap with `proto.NewXxxServiceClient(conn)` to get typed client.
- Instantiate gRPC clients in the controller constructor (once), not per-request.
- Server interceptors apply to all incoming gRPC calls; client interceptors apply per-connection group.
