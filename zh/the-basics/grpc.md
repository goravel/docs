# Grpc

[[toc]]

## 介绍

Grpc 模块可以使用 `facades.Grpc` 进行操作。

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

所有路由文件可以定义在 `/routes` 目录中，例如 `/routes/grpc.go`。然后注册到 `app/providers/grpc_service_provider.go` 文件中，以实现路由的绑定。

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
  if err := facades.Grpc.Run(facades.Config.GetString("grpc.host")); err != nil {
    facades.Log.Errorf("Grpc run error: %v", err)
  }
}()
```

## 扩展

`facades.Grpc` 提供扩展方法，可以对 Server 进行扩展，例如设置中间件：

| 名称                             | 描述             |
| -------------------------------- | ---------------- |
| `Server() *grpc.Server`          | 获取 Server 实例 |
| `SetServer(server *grpc.Server)` | 设置 Server 实例 |

### 设置链路跟踪中间件

```go
// app/providers/grpc_service_provider.go
package providers

import (
	"github.com/goravel/framework/support/facades"
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
