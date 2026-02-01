# Grpc

[[toc]]

## 简介

Grpc 模块可以使用 `facades.Grpc()` 进行操作。

## 配置

在 `config/grpc.go` 文件中，你可以配置 Grpc 模块，其中 `grpc.host` 配置服务器的域名，`grpc.servers` 配置客户端将连接到的服务器。

## 控制器

控制器可以定义在 `app/grpc/controllers` 目录中。

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

## 定义路由

所有路由文件可以定义在 `routes` 目录中，例如 `routes/grpc.go`。

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

拦截器可以定义在 `app/grpc/interceptors` 文件夹中，并在 `bootstrap/app.go` 文件的 `WithGrpcServerInterceptors` 和 `WithGrpcClientInterceptors` 函数中注册它们。

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

上面示例中的 `default` 是一个分组名称，可以应用到配置项 `grpc.servers.interceptors` 上，这样该 Client 就会被应用该分组下的所有拦截器。 例如：

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
