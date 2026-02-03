# Grpc

[[toc]]

## 概述

Grpc module can be operated by `facades.Grpc()`. Goravel provides an elegant way to build and consume gRPC services, supporting both server and client sides.

## 配置

In the `config/grpc.go` file, you can configure the Grpc module, where `grpc.host` configures the domain name of the server, and `grpc.servers` configures the servers which the client will connect to.

## 控制器

Controllers can be defined in the `app/grpc/controllers` directory.

```go
// app/grpc/controllers/user_controller.go
package controllers

import (
  "context"
  "net/http"

  proto "github.com/goravel/example-proto"
)

type UserController struct {}

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

## 定義路由

All routing files can be defined in the `routes` directory, such as `routes/grpc.go`.

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

### 註冊路由

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

## 攔截器

Interceptors provide a way to intercept and modify gRPC requests and responses. They can be used for logging, authentication, metrics, and more.

### Define Interceptors

Interceptors can be defined in the `app/grpc/interceptors` folder.

**Server Interceptor Example:**

```go
// app/grpc/interceptors/test_server.go
package interceptors

import (
  "context"

  "google.golang.org/grpc"
)

func TestServer(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp any, err error) {
  // Add your logic before the request is handled
  // For example: logging, authentication, etc.
  
  return handler(ctx, req)
}
```

**Client Interceptor Example:**

```go
// app/grpc/interceptors/test_client.go
package interceptors

import (
  "context"

  "google.golang.org/grpc"
)

func TestClient(ctx context.Context, method string, req, reply any, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
  // Add your logic before the request is sent
  // For example: logging, adding metadata, etc.
  
  return invoker(ctx, method, req, reply, cc, opts...)
}
```

### Register Interceptors

Register interceptors in the `bootstrap/app.go` file using the `WithGrpcServerInterceptors`, `WithGrpcClientInterceptors`, `WithGrpcServerStatsHandlers`, and `WithGrpcClientStatsHandlers` functions.

```go
import (
  "github.com/goravel/framework/contracts/foundation"
  "google.golang.org/grpc"
  "google.golang.org/grpc/stats"
  
  "goravel/app/grpc/interceptors"
)

func Boot() foundation.Application {
  return foundation.Setup().
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
    WithGrpcServerStatsHandlers(func() []stats.Handler {
      return []stats.Handler{}
    }).
    WithGrpcClientStatsHandlers(func() map[string][]stats.Handler {
      return map[string][]stats.Handler{}
    }).
    Create()
}
```

### Apply Interceptors to Servers

The `default` in the example above is a group name that can be applied to the configuration item `grpc.servers.interceptors`. In this way, the client will be applied to all interceptors under the group.

```go
package config

import (
  "goravel/app/facades"
)

func init() {
  config := facades.Config()
  config.Add("grpc", map[string]any{
    "host": config.Env("GRPC_HOST", ""),
    "port": config.Env("GRPC_PORT", ""),
    
    "servers": map[string]any{
      "user": map[string]any{
        "host":           config.Env("GRPC_USER_HOST", ""),
        "port":           config.Env("GRPC_USER_PORT", ""),
        "interceptors":   []string{"default"},
        "stats_handlers": []string{},
      },
    },
  })
}
```

## Stats Handlers

Stats handlers are gRPC's mechanism for collecting metrics and monitoring RPC calls. They provide hooks into the lifecycle of both client and server RPCs, making them ideal for:

- Request/response monitoring
- Performance metrics collection
- Custom observability integrations
- Logging and debugging

### Register Stats Handlers

Stats handlers can be registered in the `bootstrap/app.go` file using the `WithGrpcServerStatsHandlers` and `WithGrpcClientStatsHandlers` functions.

**Server Stats Handler Example:**

```go
// app/grpc/stats/server_handler.go
package stats

import (
  "context"
  
  "google.golang.org/grpc/stats"
)

type ServerStatsHandler struct{}

func NewServerStatsHandler() stats.Handler {
  return &ServerStatsHandler{}
}

func (h *ServerStatsHandler) TagRPC(ctx context.Context, info *stats.RPCTagInfo) context.Context {
  // Called at the beginning of each RPC
  return ctx
}

func (h *ServerStatsHandler) HandleRPC(ctx context.Context, s stats.RPCStats) {
  // Called for each RPC event
}

func (h *ServerStatsHandler) TagConn(ctx context.Context, info *stats.ConnTagInfo) context.Context {
  // Called when a connection is established
  return ctx
}

func (h *ServerStatsHandler) HandleConn(ctx context.Context, s stats.ConnStats) {
  // Called for connection events
}
```

**Client Stats Handler Example:**

```go
// app/grpc/stats/client_handler.go
package stats

import (
  "context"
  
  "google.golang.org/grpc/stats"
)

type ClientStatsHandler struct{}

func NewClientStatsHandler() stats.Handler {
  return &ClientStatsHandler{}
}

func (h *ClientStatsHandler) TagRPC(ctx context.Context, info *stats.RPCTagInfo) context.Context {
  return ctx
}

func (h *ClientStatsHandler) HandleRPC(ctx context.Context, s stats.RPCStats) {
  // Handle RPC events like Begin, End, InPayload, OutPayload
}

func (h *ClientStatsHandler) TagConn(ctx context.Context, info *stats.ConnTagInfo) context.Context {
  return ctx
}

func (h *ClientStatsHandler) HandleConn(ctx context.Context, s stats.ConnStats) {
  // Handle connection events
}
```

### Register in Bootstrap

Register your stats handlers in `bootstrap/app.go`:

```go
import (
  "google.golang.org/grpc/stats"
  
  grpcstats "goravel/app/grpc/stats"
)

func Boot() foundation.Application {
  return foundation.Setup().
    WithGrpcServerStatsHandlers(func() []stats.Handler {
      return []stats.Handler{
        grpcstats.NewServerStatsHandler(),
      }
    }).
    WithGrpcClientStatsHandlers(func() map[string][]stats.Handler {
      return map[string][]stats.Handler{
        "user": {
          grpcstats.NewClientStatsHandler(),
        },
      }
    }).
    Create()
}
```

### Apply Stats Handlers to Clients

The group name (e.g., `"user"`) must be referenced in your `config/grpc.go` file under the client's `stats_handlers` array:

```go
package config

import (
  "goravel/app/facades"
)

func init() {
  config := facades.Config()
  config.Add("grpc", map[string]any{
    "host": config.Env("GRPC_HOST", ""),
    "port": config.Env("GRPC_PORT", ""),
    
    "servers": map[string]any{
      "user": map[string]any{
        "host":           config.Env("GRPC_USER_HOST", ""),
        "port":           config.Env("GRPC_USER_PORT", ""),
        "interceptors":   []string{"default"},
        "stats_handlers": []string{"user"}, // Apply "user" stats handler group
      },
    },
  })
}
```

## gRPC Client

Goravel provides an easy way to create gRPC clients to consume gRPC services.

### Connect to gRPC Server

You can connect to a gRPC server using the `facades.Grpc().Connect()` method. The connection name should match the key defined in `config/grpc.go`.

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
  // The initialization process can be moved to app/services/*.go
  client, err := facades.Grpc().Connect("user")
  if err != nil {
    facades.Log().Error(fmt.Sprintf("failed to connect to user server: %+v", err))
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
    return ctx.Response().String(http.StatusInternalServerError, fmt.Sprintf("call UserService.GetUser err: %+v", err))
  }
  if resp.Code != http.StatusOK {
    return ctx.Response().String(http.StatusInternalServerError, fmt.Sprintf("user service returns error, code: %d, message: %s", resp.Code, resp.Message))
  }

  return ctx.Response().Success().Json(resp.GetData())
}
```
