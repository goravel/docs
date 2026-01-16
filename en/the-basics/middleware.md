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
./artisan make:middleware Auth

// Support nested folders
./artisan make:middleware user/Auth
```

## Register Middleware

### Global Middleware

If you want to apply middleware for every HTTP request of your application, you only need to register the middleware in the `WithMiddleware` function in the `bootstrap/app.go` file.

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithMiddleware(func(handler configuration.Middleware) {
			handler.Append(
				middleware.Custom(),
			)
		}).
		WithConfig(config.Boot).
		Start()
}
```

The `handler` provides multiple functions to manage middleware:

- `Append(middlewares ...http.Middleware)`: Append middleware to the end of the middleware stack.
- `GetGlobalMiddleware() []http.Middleware`: Get all global middleware.
- `GetRecover() func(ctx http.Context, err any)`: Get the custom recovery function.
- `Prepend(middlewares ...http.Middleware)`: Prepend middleware to the beginning of the middleware stack.
- `Recover(fn func(ctx http.Context, err any)) Middleware`: Set a custom recovery function to handle panics.
- `Use(middleware ...http.Middleware) Middleware`: Replace the current middleware stack with the given middleware.

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
