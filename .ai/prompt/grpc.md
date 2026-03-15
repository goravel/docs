# Goravel gRPC

## Configuration

Configure in `config/grpc.go`:

```go
// BREAKING v1.17: grpc.clients renamed to grpc.servers

config.Add("grpc", map[string]any{
    "host": config.Env("GRPC_HOST", ""),
    "port": config.Env("GRPC_PORT", ""),

    "servers": map[string]any{    // BREAKING v1.17: was "clients"
        "user": map[string]any{
            "host":           config.Env("GRPC_USER_HOST", ""),
            "port":           config.Env("GRPC_USER_PORT", ""),
            "interceptors":   []string{"default"},
            "stats_handlers": []string{"user"},
        },
    },
})
```

---

## gRPC Server Controller

```go
// app/grpc/controllers/user_controller.go
package controllers

import (
    "context"
    "net/http"

    proto "github.com/goravel/example-proto"
)

type UserController struct{}

func NewUserController() *UserController {
    return &UserController{}
}

func (r *UserController) GetUser(ctx context.Context, req *proto.UserRequest) (*proto.UserResponse, error) {
    return &proto.UserResponse{
        Code: http.StatusOK,
        Data: &proto.User{
            Id:    1,
            Name:  "Goravel",
            Token: req.GetToken(),
        },
    }, nil
}
```

---

## Define gRPC Routes

```go
// routes/grpc.go
package routes

import (
    proto "github.com/goravel/example-proto"
    "goravel/app/facades"
    "goravel/app/grpc/controllers"
)

func Grpc() {
    proto.RegisterUserServiceServer(facades.Grpc().Server(), controllers.NewUserController())
}
```

Register in `bootstrap/app.go`:

```go
WithRouting(func() {
    routes.Web()
    routes.Grpc()
})
```

---

## gRPC Client

// BREAKING v1.17: facades.Grpc().Client() is deprecated — use facades.Grpc().Connect("name")

```go
// app/http/controllers/grpc_controller.go
package controllers

import (
    "fmt"

    proto "github.com/goravel/example-proto"
    "github.com/goravel/framework/contracts/http"
    "goravel/app/facades"
)

type GrpcController struct {
    userService proto.UserServiceClient
}

func NewGrpcController() *GrpcController {
    // BREAKING v1.17: use Connect instead of Client
    client, err := facades.Grpc().Connect("user")
    if err != nil {
        facades.Log().Error(fmt.Sprintf("failed to connect: %+v", err))
    }

    return &GrpcController{
        userService: proto.NewUserServiceClient(client),
    }
}

func (r *GrpcController) User(ctx http.Context) http.Response {
    resp, err := r.userService.GetUser(ctx, &proto.UserRequest{
        Token: ctx.Request().Input("token"),
    })
    if err != nil {
        return ctx.Response().String(http.StatusInternalServerError, fmt.Sprintf("err: %+v", err))
    }
    return ctx.Response().Success().Json(resp.GetData())
}
```

---

## Interceptors

### Server Interceptor

```go
// app/grpc/interceptors/auth_server.go
package interceptors

import (
    "context"
    "google.golang.org/grpc"
)

func AuthServer(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp any, err error) {
    // pre-processing: auth check, logging, etc.
    return handler(ctx, req)
}
```

### Client Interceptor

```go
// app/grpc/interceptors/log_client.go
package interceptors

import (
    "context"
    "google.golang.org/grpc"
)

func LogClient(ctx context.Context, method string, req, reply any, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
    // pre-processing: add metadata, logging, etc.
    return invoker(ctx, method, req, reply, cc, opts...)
}
```

### Register Interceptors

```go
// bootstrap/app.go
import (
    "google.golang.org/grpc"
    "goravel/app/grpc/interceptors"
)

foundation.Setup().
    WithGrpcServerInterceptors(func() []grpc.UnaryServerInterceptor {
        return []grpc.UnaryServerInterceptor{
            interceptors.AuthServer,
        }
    }).
    WithGrpcClientInterceptors(func() map[string][]grpc.UnaryClientInterceptor {
        return map[string][]grpc.UnaryClientInterceptor{
            "default": {interceptors.LogClient},
        }
    }).
    Create()
```

The map key (`"default"`) is a group name referenced in `config/grpc.go` servers `interceptors` array.

---

## Stats Handlers

### Server Stats Handler

```go
// app/grpc/stats/server_handler.go
package stats

import (
    "context"
    "google.golang.org/grpc/stats"
)

type ServerStatsHandler struct{}

func NewServerStatsHandler() stats.Handler { return &ServerStatsHandler{} }

func (h *ServerStatsHandler) TagRPC(ctx context.Context, info *stats.RPCTagInfo) context.Context {
    return ctx
}
func (h *ServerStatsHandler) HandleRPC(ctx context.Context, s stats.RPCStats) {}
func (h *ServerStatsHandler) TagConn(ctx context.Context, info *stats.ConnTagInfo) context.Context {
    return ctx
}
func (h *ServerStatsHandler) HandleConn(ctx context.Context, s stats.ConnStats) {}
```

### Client Stats Handler

```go
// app/grpc/stats/client_handler.go
package stats

import (
    "context"
    "google.golang.org/grpc/stats"
)

type ClientStatsHandler struct{}

func NewClientStatsHandler() stats.Handler { return &ClientStatsHandler{} }

func (h *ClientStatsHandler) TagRPC(ctx context.Context, info *stats.RPCTagInfo) context.Context {
    return ctx
}
func (h *ClientStatsHandler) HandleRPC(ctx context.Context, s stats.RPCStats) {}
func (h *ClientStatsHandler) TagConn(ctx context.Context, info *stats.ConnTagInfo) context.Context {
    return ctx
}
func (h *ClientStatsHandler) HandleConn(ctx context.Context, s stats.ConnStats) {}
```

### Register Stats Handlers

```go
// bootstrap/app.go
import (
    "google.golang.org/grpc/stats"
    grpcstats "goravel/app/grpc/stats"
)

foundation.Setup().
    WithGrpcServerStatsHandlers(func() []stats.Handler {
        return []stats.Handler{grpcstats.NewServerStatsHandler()}
    }).
    WithGrpcClientStatsHandlers(func() map[string][]stats.Handler {
        return map[string][]stats.Handler{
            "user": {grpcstats.NewClientStatsHandler()},
        }
    }).
    Create()
```

Map key (`"user"`) is referenced in `config/grpc.go` servers `stats_handlers` array.
