## 介绍

Grpc 模块可以使用 `facades.Grpc` 进行操作。

## 路由文件

所有路由文件可以定义在 `/routes` 目录中，例如 `/routes/grpc.go`。然后注册到 `app/providers/grpc_service_provider.go` 文件中，以实现路由的绑定。

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

## 控制器

控制器文件可以定义在 `/app/grpc/controllers` 目录中。

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

## 启动 Grpc 服务器

在 `main.go` 中启动 Grpc

```
go facades.Grpc.Run(facades.Config.GetString("grpc.host"))
```

## 扩展

`facades.Grpc` 提供扩展方法，可以对 Server 进行扩展，例如中间件的设置：

| 名称                             | 描述             |
| -------------------------------- | ---------------- |
| `Server() *grpc.Server`          | 获取 Server 实例 |
| `SetServer(server *grpc.Server)` | 设置 Server 实例 |

```
// 设置链路跟踪中间件
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
