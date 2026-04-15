# Grpc

[[toc]]

## Kirish

Grpc moduli `facades.Grpc()` orqali boshqarilishi mumkin. Goravel gRPC xizmatlarini yaratish va ulardan foydalanishning nafis usulini taqdim etadi, ham server, ham mijoz tomonlarini qo'llab-quvvatlaydi.

## Konfiguratsiya

`config/grpc.go` faylida Grpc modulini sozlashingiz mumkin, bu yerda `grpc.host` server domen nomini, `grpc.servers` esa mijoz ulanadigan serverlarni sozlaydi.

## Kontrollerlar

Kontrollerlar `app/grpc/controllers` katalogida aniqlanishi mumkin.

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

## Marshrutlashni aniqlash

Barcha marshrutlash fayllari `routes` katalogida, masalan `routes/grpc.go` kabi aniqlanishi mumkin.

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

### Marshrutlashni ro'yxatdan o'tkazish

Marshrutlash aniqlangandan so'ng, uni `bootstrap/app.go::WithRouting` funksiyasida ro'yxatdan o'tkazing.

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

Interceptorlar gRPC so'rovlari va javoblarini to'xtatish va o'zgartirish imkoniyatini beradi. Ular jurnalga yozish, autentifikatsiya, metrikalar va boshqalar uchun ishlatilishi mumkin.

### Interceptorlarni aniqlash

Interceptorlar `app/grpc/interceptors` papkasida aniqlanishi mumkin.

**Server Interceptor misoli:**

```go
// app/grpc/interceptors/test_server.go
package interceptors

import (
  "context"

  "google.golang.org/grpc"
)

func TestServer(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (resp any, err error) {
  // So'rov boshqarilishidan oldin mantiqingizni qo'shing
  // Masalan: jurnalga yozish, autentifikatsiya va hokazo.
  
  return handler(ctx, req)
}
```

**Mijoz Interceptor misoli:**

```go
// app/grpc/interceptors/test_client.go
package interceptors

import (
  "context"

  "google.golang.org/grpc"
)

func TestClient(ctx context.Context, method string, req, reply any, cc *grpc.ClientConn, invoker grpc.UnaryInvoker, opts ...grpc.CallOption) error {
  // So'rov yuborilishidan oldin mantiqingizni qo'shing
  // Masalan: jurnalga yozish, metadata qo'shish va hokazo.
  
  return invoker(ctx, method, req, reply, cc, opts...)
}
```

### Interceptorlarni ro'yxatdan o'tkazish

Interceptorlarni `bootstrap/app.go` faylida `WithGrpcServerInterceptors`, `WithGrpcClientInterceptors`, `WithGrpcServerStatsHandlers` va `WithGrpcClientStatsHandlers` funksiyalari yordamida ro'yxatdan o'tkazing.

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

### Interceptorlarni Serverlarga qo'llash

Yuqoridagi misoldagi `default` - bu `grpc.servers.interceptors` konfiguratsiya bandiga qo'llanilishi mumkin bo'lgan guruh nomi. Shu tarzda, mijoz guruh ostidagi barcha interceptorlarga qo'llaniladi.

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

Stats handlerlar RPC chaqiruvlarini monitoring qilish va metrikalarni yig'ish uchun gRPC mexanizmidir. Ular ham mijoz, ham server RPC'larining hayot tsikliga kirish imkoniyatini beradi, bu ularni quyidagilar uchun ideal qiladi:

- So'rov/javob monitoringi
- Ishlash metrikalarini yig'ish
- Maxsus kuzatish integratsiyalari
- Jurnalga yozish va tuzatish

### Stats Handlerlarni ro'yxatdan o'tkazish

Stats handlerlar `bootstrap/app.go` faylida `WithGrpcServerStatsHandlers` va `WithGrpcClientStatsHandlers` funksiyalari yordamida ro'yxatdan o'tkazilishi mumkin.

**Server Stats Handler misoli:**

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
  // Har bir RPC boshida chaqiriladi
  return ctx
}

func (h *ServerStatsHandler) HandleRPC(ctx context.Context, s stats.RPCStats) {
  // Har bir RPC hodisasi uchun chaqiriladi
}

func (h *ServerStatsHandler) TagConn(ctx context.Context, info *stats.ConnTagInfo) context.Context {
  // Ulanish o'rnatilganda chaqiriladi
  return ctx
}

func (h *ServerStatsHandler) HandleConn(ctx context.Context, s stats.ConnStats) {
  // Ulanish hodisalari uchun chaqiriladi
}
```

**Mijoz Stats Handler misoli:**

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
  // Begin, End, InPayload, OutPayload kabi RPC hodisalarini boshqaring
}

func (h *ClientStatsHandler) TagConn(ctx context.Context, info *stats.ConnTagInfo) context.Context {
  return ctx
}

func (h *ClientStatsHandler) HandleConn(ctx context.Context, s stats.ConnStats) {
  // Ulanish hodisalarini boshqaring
}
```

### Bootstrap'da ro'yxatdan o'tkazish

Stats handlerlaringizni `bootstrap/app.go` faylida ro'yxatdan o'tkazing:

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

### Stats Handlerlarni Mijozlarga qo'llash

Guruh nomi (masalan, `"user"`) `config/grpc.go` faylida mijozning `stats_handlers` massivida ko'rsatilishi kerak:

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
        "stats_handlers": []string{"user"}, // "user" stats handler guruhini qo'llash
      },
    },
  })
}
```

## gRPC Mijozi

Goravel gRPC xizmatlaridan foydalanish uchun gRPC mijozlarini yaratishning oson usulini taqdim etadi.

### gRPC Serveriga ulanish

Siz `facades.Grpc().Connect()` usuli yordamida gRPC serveriga ulanishingiz mumkin. Ulanish nomi `config/grpc.go` faylida aniqlangan kalitga mos kelishi kerak.

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
  // Initsializatsiya jarayoni app/services/*.go fayliga ko‘chirilishi mumkin
  client, err := facades.Grpc().Connect("user")
  if err != nil {
    facades.Log().Error(fmt.Sprintf("foydalanuvchi serveriga ulanish muvaffaqiyatsiz: %+v", err))
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
    return ctx.Response().String(http.StatusInternalServerError, fmt.Sprintf("UserService.GetUser chaqiruvi xatosi: %+v", err))
  }
  if resp.Code != http.StatusOK {
    return ctx.Response().String(http.StatusInternalServerError, fmt.Sprintf("foydalanuvchi xizmati xatoni qaytardi, kod: %d, xabar: %s", resp.Code, resp.Message))
  }

  return ctx.Response().Success().Json(resp.GetData())
}
```
