# Посредники

[[toc]]

## Введение

Промежуточное ПО (Middleware) может фильтровать HTTP-запросы, поступающие в приложение. Например, `Goravel` предоставляет промежуточное ПО для CORS, которое позволяет реализовать запросы между доменами.

## Определение промежуточного ПО

Вы можете создать свое собственное промежуточное ПО в директории `app/http/middleware`. Структура примера приведена ниже.

```go
package middleware

import (
  "github.com/goravel/framework/contracts/http"
)

func Cors() http.Middleware {
  return func(ctx http.Context) {
    method := ctx.Request().Method()
    origin := ctx.Request().Header("Origin", "")
    if origin != "" {
      ctx.Response().Header("Access-Control-Allow-Origin", "*")
      ctx.Response().Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")
      ctx.Response().Header("Access-Control-Allow-Headers", "*")
      ctx.Response().Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Authorization")
      ctx.Response().Header("Access-Control-Max-Age", "172800")
      ctx.Response().Header("Access-Control-Allow-Credentials", "true")
    }

    if method == "OPTIONS" {
      ctx.Request().AbortWithStatus(204)
      return
    }

    ctx.Request().Next()
  }
}

```

В Goravel доступно несколько промежуточных ПО:

| Промежуточное ПО                                   | Действие           |
| ------------------------------------------------- | ------------------ |
| github.com/goravel/framework/http/middleware/Cors | кросс-доменные запросы |
| github.com/goravel/framework/http/middleware/Throttle | ограничение частоты |

### Создание промежуточного ПО с помощью команды
```
go run . artisan make:middleware Cors
go run . artisan make:middleware user/Cors
```

## Регистрация промежуточного ПО

### Глобальное промежуточное ПО

Если вы хотите применить промежуточное ПО для каждого HTTP-запроса вашего приложения, достаточно зарегистрировать промежуточное ПО в `Middleware` в файле `app/http/kernel.go`.

```go
// app/http/kernel.go
package http

import (
  "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/http/middleware"
)

type Kernel struct {
}

func (kernel *Kernel) Middleware() []http.Middleware {
  return []http.Middleware{
    middleware.Cors(),
  }
}
```

### Назначение промежуточного ПО для маршрутизации

Вы можете отдельно зарегистрировать промежуточное ПО для некоторых маршрутов:

```go
import "github.com/goravel/framework/http/middleware"

facades.Route().Middleware(middleware.Cors()).Get("users", userController.Show)
```

<CommentService/>