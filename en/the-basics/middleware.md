# Middleware

[[toc]]

## Introduction

Middleware provide a convenient mechanism for inspecting and filtering HTTP requests entering your application.

## Define Middleware

You can create your own middleware in the `app/http/middleware` directory, the structure is as follows.

```go
package middleware

import (
  "github.com/goravel/framework/contracts/http"
)

func Auth() http.Middleware {
  return func(ctx http.Context) {
    ctx.Request().Next()
  }
}
```

### Create Middleware By Command

```
go run . artisan make:middleware Auth

// Support nested folders
go run . artisan make:middleware user/Auth
```

## Register Middleware

### Global Middleware

If you want to apply middleware for every HTTP request of your application, you only need to register the middleware in the `Middleware` in the `app/http/kernel.go` file.

```go
// app/http/kernel.go
package http

import (
  "github.com/goravel/framework/contracts/http"

  "goravel/app/http/middleware"
)

type Kernel struct {
}

func (kernel *Kernel) Middleware() []http.Middleware {
  return []http.Middleware{
    middleware.Auth(),
  }
}
```

### Assign Middleware for Routing

You can register the middleware for some routing separately:

```go
import "github.com/goravel/framework/http/middleware"

facades.Route().Middleware(middleware.Auth()).Get("users", userController.Show)
```

## Abort Request

In middleware, if you need to interrupt the request, you can use the `Abort` method.

```go
ctx.Request().Abort()
ctx.Request().Abort(http.StatusNotFound)
ctx.Response().String(http.StatusNotFound, "Not Found").Abort()
```
