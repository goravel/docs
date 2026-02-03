# Grpc

[[toc]]

## 简介

Grpc 模块可以使用 `facades.Grpc()` 进行操作。 Goravel 提供了一种优雅的方式来构建和使用 gRPC 服务，同时支持服务端和客户端。

## 配置

在 `config/grpc.go` 文件中，你可以配置 Grpc 模块，其中 `grpc.host` 配置服务器的域名，`grpc.servers` 配置客户端将连接到的服务器。

## 控制器

控制器可以定义在 `app/grpc/controllers` 目录中。

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

## 定义路由

所有路由文件可以定义在 `routes` 目录中，例如 `routes/grpc.go`。

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

### 注册路由

路由定义好后，在 `bootstrap/app.go::WithRouting` 函数中注册路由。

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

## 拦截器

拦截器提供了一种拦截和修改 gRPC 请求和响应的方法。 它们可用于日志记录、身份验证、指标收集等。

### 定义拦截器

拦截器可以定义在 `app/grpc/interceptors` 文件夹中。

**服务端拦截器示例:**

```go
// app/grpc/interceptors/test_server.go
package interceptors

import (
  "context"

  "google.golang.org/grpc"
)

func TestServer(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp any, err error) {
  // 在请求被处理之前添加你的逻辑
  // 例如：日志记录、身份验证等
  
  return handler(ctx, req)
}
```

**客户端拦截器示例:**

```go
// app/grpc/interceptors/test_client.go
package interceptors

import (
  "context"

  "google.golang.org/grpc"
)

func TestClient(ctx context.Context, method string, req, reply any, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
  // 在请求发送之前添加你的逻辑
  // 例如：日志记录、添加元数据等
  
  return invoker(ctx, method, req, reply, cc, opts...)
}
```

### 注册拦截器

在 `bootstrap/app.go` 文件中使用 `WithGrpcServerInterceptors`、`WithGrpcClientInterceptors` 函数注册拦截器。

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

### 将拦截器应用于服务

上面示例中的 `default` 是一个组名，可以应用于配置项 `grpc.servers.interceptors`。 这样，客户端将应用该组下的所有拦截器。

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

Stats Handlers 是 gRPC 用于收集指标和监控 RPC 调用的机制。 它们提供了对客户端和服务器端 RPC 生命周期的钩子，使其非常适合用于：

- 请求/响应监控
- 性能指标收集
- 自定义可观测性集成
- 日志记录和调试

### 注册 Stats Handlers

Stats Handlers 可以在 `bootstrap/app.go` 文件中使用 `WithGrpcServerStatsHandlers` 和 `WithGrpcClientStatsHandlers` 函数进行注册。

**服务端 Stats Handlers 示例:**

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
  // 在每个 RPC 开始时调用
  return ctx
}

func (h *ServerStatsHandler) HandleRPC(ctx context.Context, s stats.RPCStats) {
  // 为每个 RPC 事件调用
}

func (h *ServerStatsHandler) TagConn(ctx context.Context, info *stats.ConnTagInfo) context.Context {
  // 当连接建立时调用
  return ctx
}

func (h *ServerStatsHandler) HandleConn(ctx context.Context, s stats.ConnStats) {
  // 为连接事件调用
}
```

**客户端 Stats Handlers 示例:**

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
  // 处理 RPC 事件，如 Begin、End、InPayload、OutPayload
}

func (h *ClientStatsHandler) TagConn(ctx context.Context, info *stats.ConnTagInfo) context.Context {
  return ctx
}

func (h *ClientStatsHandler) HandleConn(ctx context.Context, s stats.ConnStats) {
  // 处理连接事件
}
```

### 在引导程序中注册

在 `bootstrap/app.go` 中注册 Stats Handlers：

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

### 将 Stats Handlers 应用于客户端

组名（例如 `"user"`）必须在你的 `config/grpc.go` 文件中的客户端 `stats_handlers` 数组中被引用：

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
        "stats_handlers": []string{"user"}, // 应用 "user" Stats Handlers
      },
    },
  })
}
```

## gRPC 客户端

Goravel 提供了一种简单的方法来创建 gRPC 客户端以使用 gRPC 服务。

### 连接到 gRPC 服务器

你可以使用 `facades.Grpc().Connect()` 方法连接到 gRPC 服务器。 连接名称应与 `config/grpc.go` 中定义的键匹配。

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
  // 初始化过程可以移到 app/services/*.go
  client, err := facades.Grpc().Connect("user")
  if err != nil {
    facades.Log().Error(fmt.Sprintf("连接到用户服务器失败: %+v", err))
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
    return ctx.Response().String(http.StatusInternalServerError, fmt.Sprintf("调用 UserService.GetUser 错误: %+v", err))
  }
  if resp.Code != http.StatusOK {
    return ctx.Response().String(http.StatusInternalServerError, fmt.Sprintf("用户服务返回错误, 代码: %d, 消息: %s", resp.Code, resp.Message))
  }

  return ctx.Response().Success().Json(resp.GetData())
}
```
