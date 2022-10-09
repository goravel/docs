# Middleware

[[toc]]

## Introduction

Middleware can filtering HTTP requests that enter the application. For example, `Goravel` provides a CORS middleware, which can implement requests across domains.

## Define Middlewares

You can create your own middleware in the `app/http/middleware` directory, the structure is as follows.

```go
package middleware

import (
	"github.com/goravel/framework/contracts/http"
	"github.com/goravel/framework/facades"
)

func Cors() http.Middleware {
	return func(request http.Request) {
		method := request.Method()
		origin := request.Header("Origin", "")
		if origin != "" {
			facades.Response.Header("Access-Control-Allow-Origin", "*")
			facades.Response.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")
			facades.Response.Header("Access-Control-Allow-Headers", "*")
			facades.Response.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Authorization")
			facades.Response.Header("Access-Control-Max-Age", "172800")
			facades.Response.Header("Access-Control-Allow-Credentials", "true")
		}

		if method == "OPTIONS" {
			request.AbortWithStatus(204)
			return
		}

		request.Next()
	}
}
```

There are some middleware available in Goravel:

| Middlewares                                       | Action        |
| ------------------------------------------------- | ------------- |
| github.com/goravel/framework/http/middleware/Cors | across domain |

## Register Middlewares

### Global Middlewares

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

### Assign Middlewares for Routing

You can register the middleware for some routing separately:

```go
import "github.com/goravel/framework/http/middleware"

facades.Route.Middleware(middleware.Cors()).Get("users", userController.Show)
```
