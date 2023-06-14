# Middleware

[[toc]]

## Introduction

Middleware can filtering HTTP requests that enter the application. For example, `Goravel` provides a CORS middleware, which can implement requests across domains.

## Define Middleware

You can create your own middleware in the `app/http/middleware` directory, the structure is as follows.

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

There are some middleware available in Goravel:

| Middleware                                       | Action        |
| ------------------------------------------------- | ------------- |
| github.com/goravel/framework/http/middleware/Cors | across domain |
| github.com/goravel/framework/http/middleware/Throttle | Rate Limiting |

### Create Middleware By Command
```
go run . artisan make:middleware Cors
go run . artisan make:middleware user/Cors
```

## Register Middleware

### Global Middleware

If you want to apply middleware for every HTTP request of your application, you only need to register the middleware in the `Middleware` in the `app/http/kernel.go` file.

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

### Assign Middleware for Routing

You can register the middleware for some routing separately:

```go
import "github.com/goravel/framework/http/middleware"

facades.Route.Middleware(middleware.Cors()).Get("users", userController.Show)
```

<CommentService/>