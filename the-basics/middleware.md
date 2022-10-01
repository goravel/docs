# Middleware

[[toc]]

## Introduction

Middleware can filtering HTTP requests that enter the application. For example, `Goravel` provides a CORS middleware, which can implement requests across domains.

## Define Middlewares

You can create your own middleware in the `app/http/middleware` directory, and the writing method is consistent with that of `Gin` middleware, [reference document](https://gin-gonic.com/docs/examples/custom-middleware/).

There are some middleware available in Goravel:

| Middlewares                                        | Action        |
| -------------------------------------------------  | ------------  |
| github.com/goravel/framework/http/middleware/Cors  | across domain |

## Register Middlewares

### Global Middlewares

If you want to apply middleware for every HTTP request of your application, you only need to register the middleware in the `Middleware` in the `app/http/kernel.go` file.

```go
// app/http/kernel.go
package http

import (
	"github.com/gin-gonic/gin"
)

type Kernel struct {
}

func (kernel *Kernel) Middleware() []gin.HandlerFunc {
	return []gin.HandlerFunc{
		gin.Logger(),
	}
}
```

### Assign Middlewares for Routing

You can register the middleware for some routing separately:

```go
route := facades.Route.Group("/")
route.Use(gin.Logger())
```

