# Grpc

[[toc]]

## 概述

Grpc 模組可以使用 `facades.Grpc()` 進行操作。

## 配置

在 `config/grpc.go` 文件中，您可以配置 Grpc 模組，其中 `grpc.host` 配置伺服器的域名，`grpc.clients` 配置客戶端的相關資訊。

## 控制器

控制器文件可以定義在 `/app/grpc/controllers` 目錄中。

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

## 定義路由

所有路由文件可以定義在 `/routes` 目錄中，例如 `/routes/grpc.go`。 然後在 `app/providers/grpc_service_provider.go` 文件中綁定路由。

```go
// routes/grpc.go
package routes

import (
  "github.com/goravel/grpc/protos"
  "github.com/goravel/framework/facades"

  "goravel/app/grpc/controllers"
)

func Grpc() {
  protos.RegisterUserServer(facades.Grpc().Server(), controllers.NewUserController())
}
```

### 註冊路由

在路由定義後，在 `app/providers/grpc_service_provider.go` 文件中註冊路由。

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

## 啟動 Grpc 伺服器

在 `main.go` 中啟動 Grpc。

```go
go func() {
  if err := facades.Grpc().Run(facades.Config().GetString("grpc.host")); err != nil {
    facades.Log().Errorf("Grpc run error: %v", err)
  }
}()
```

## 攔截器

攔截器可以定義在 `app/grpc/inteceptors` 文件夾中，然後註冊到 `app/grpc/kernel.go`。

**伺服器攔截器**

您可以在 `app/grpc/kernel.go:UnaryServerInterceptors` 方法中設定伺服器攔截器。例如： 例如：

```go
// app/grpc/kernel.go
import (
  "goravel/app/grpc/interceptors"

  "google.golang.org/grpc"
)

func (kernel *Kernel) UnaryServerInterceptors() []grpc.UnaryServerInterceptor {
  return []grpc.UnaryServerInterceptor{
    interceptors.Server,
  }
}
```

**客戶端攔截器**

您可以在 `app/grpc/kernel.go:UnaryClientInterceptorGroups` 方法中設定客戶端攔截器，該方法可以對攔截器進行分組。 例如，`interceptors.Client` 包含在 `trace` 群組下。

```go
// app/grpc/kernel.go
import (
  "goravel/app/grpc/interceptors"

  "google.golang.org/grpc"
)

func (kernel *Kernel) UnaryClientInterceptorGroups() map[string][]grpc.UnaryClientInterceptor {
  return map[string][]grpc.UnaryClientInterceptor{
    "trace": {
      interceptors.Client,
    },
  }
}
```

`trace` 群組可以應用於配置項 `grpc.clients.interceptors`，這樣，該客戶端將會應用該群組下的所有攔截器。 例如：

```go
package config

import (
  "github.com/goravel/framework/facades"
)

func init() {
  config := facades.Config
  config.Add("grpc", map[string]interface{}{
    // Grpc 配置
    //
    // 設定伺服器主機
    "host": config.Env("GRPC_HOST", ""),

    // 設定客戶端主機和攔截器。
    // 攔截器可以是 app/grpc/kernel.go 中 UnaryClientInterceptorGroups 的群組名稱。
    "clients": map[string]any{
      "user": map[string]any{
        "host":         config.Env("GRPC_USER_HOST", ""),
        "port":         config.Env("GRPC_USER_PORT", ""),
        "interceptors": []string{"trace"},
      },
    },
  })
}
```

## 關閉 Grpc

您可以調用 `Shutdown` 方法優雅地關閉 Grpc，該方法會等待所有請求處理完畢後再執行關閉操作。

```go
// main.go
bootstrap.Boot()

// 創建一個通道來監聽 OS 信號
quit := make(chan os.Signal)
signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

// 通過 facades.Schedule 開始排程
go func() {
  if err := facades.Grpc().Run(facades.Config().GetString("grpc.host")); err != nil {
    facades.Log().Errorf("Grpc run error: %v", err)
  }
}()

// 監聽 OS 信號
go func() {
  <-quit
  if err := facades.Grpc().Shutdown(); err != nil {
    facades.Log().Errorf("Grpc Shutdown error: %v", err)
  }

  os.Exit(0)
}()

select {}
```
