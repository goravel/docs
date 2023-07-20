# Grpc

[[toc]]

## Введение

Модуль Grpc может быть использован через `facades.Grpc()`.

## Контроллеры

Контроллеры могут быть определены в директории `/app/grpc/controllers`.

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

## Определение маршрутов

Все файлы маршрутов могут быть определены в директории `/routes`, например `/routes/grpc.go`. Затем свяжите маршруты в файле `app/providers/grpc_service_provider.go`.

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

### Регистрация маршрутов

Зарегистрируйте маршруты в файле `app/providers/grpc_service_provider.go`, после того, как маршруты будут определены.

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

## Запуск сервера Grpc

Запустите Grpc в файле `main.go`.

```go
go func() {
  if err := facades.Grpc().Run(facades.Config().GetString("grpc.host")); err != nil {
    facades.Log().Errorf("Ошибка запуска Grpc: %v", err)
  }
}()
```

## Интерцептор

Интерцептор может быть определен в папке `app/grpc/inteceptors`, а затем зарегистрирован в `app/grpc/kernel.go`.

**Серверный интерцептор**

Вы можете установить серверные интерцепторы в методе `app/grpc/kernel.go:UnaryServerInterceptors`. Например:

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

**Клиентский интерцептор**

Вы можете установить клиентский интерцептор в методе `app/grpc/kernel.go:UnaryClientInterceptorGroups`, этот метод может объединять интерцепторы в группы. Например, `interceptors.Client` включен в группу `trace`.

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

группа `trace` может быть применена к конфигурационному элементу `grpc.clients.interceptors`, таким образом, клиенту будут применены все интерцепторы в группе. Например:

```go
package config

import (
  "github.com/goravel/framework/facades"
)

func init() {
  config := facades.Config
  config.Add("grpc", map[string]interface{}{
    // Конфигурация Grpc
    //
    // Настройте хост сервера
    "host": config.Env("GRPC_HOST", ""),

    // Настройте хост и интерцепторы клиента.
    // Интерцепторы могут быть именем группы UnaryClientInterceptorGroups в app/grpc/kernel.go.
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

<CommentService/>