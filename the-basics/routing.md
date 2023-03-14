# Routing

[[toc]]

## Introduction

Goravel routing module can operated by `facades.Route`.

## Default Routing File

All routing files are defined in the `/routes` directory. The framework defaults to a sample route `/routes/web.go`, in which the `func Web()` method is registered in the `app/providers/route_service_provider.go` file to achieve routing binding.

You can add routing files under the `routes` directory to perform more fine-grained management, then register them in the `app/providers/route_service_provider.go` file.

## Start HTTP Server

Start the HTTP server in `main.go` in the root directory. `facades.Route.Run()` will automatically fetch the `route.host` configuration.

```go
package main

import (
  "github.com/goravel/framework/facades"

  "goravel/bootstrap"
)

func main() {
  //This bootstraps the framework and gets it ready for use.
  bootstrap.Boot()

  //Start http server by facades.Route.
  go func() {
    if err := facades.Route.Run(); err != nil {
      facades.Log.Errorf("Route run error: %v", err)
    }
  }()

  select {}
}
```

## Start HTTPS Server

### Register Middleware

Framework has a general middleware built in, you can also customize it according to your own needs.

```go
// app/http/kernel.go
import "github.com/goravel/framework/http/middleware"

func (kernel *Kernel) Middleware() []http.Middleware {
	return []http.Middleware{
		middleware.Tls(),
	}
}
```

### Start Server

`facades.Route.RunTLS()` will automatically fetch the `route.tls` configuration:

```go
// main.go
if err := facades.Route.RunTLS(); err != nil {
  facades.Log.Errorf("Route run error: %v", err)
}
```

You can also use `facades.Route.RunTLSWithCert()` method to customize host and certificate.

```go
// main.go
if err := facades.Route.RunTLSWithCert("127.0.0.1:3000", "ca.pem", "ca.key"); err != nil {
  facades.Log.Errorf("Route run error: %v", err)
}
```

### Routing Methods

| Methods    | Action                                  |
| ---------- | --------------------------------------- |
| Run        | [Start HTTP Server](#Start-HTTP-Server) |
| RunTLS        | [Start HTTPS Server](#Start-HTTPS-Server) |
| RunTLSWithCert        | [Start HTTPS Server](#Start-HTTPS-Server) |
| Group      | [Group Routing](#Group-Routing)         |
| Prefix     | [Routing Prefix](#Routing-Prefix)       |
| ServeHTTP  | [Testing Routing](#Testing-Routing)     |
| Get        | [Basic Routing](#Basic-Routing)         |
| Post       | [Basic Routing](#Basic-Routing)         |
| Put        | [Basic Routing](#Basic-Routing)         |
| Delete     | [Basic Routing](#Basic-Routing)         |
| Patch      | [Basic Routing](#Basic-Routing)         |
| Options    | [Basic Routing](#Basic-Routing)         |
| Any        | [Basic Routing](#Basic-Routing)         |
| Static     | [File Routing](#File-Routing)           |
| StaticFile | [File Routing](#File-Routing)           |
| StaticFS   | [File Routing](#File-Routing)           |
| Middleware | [Middleware](#Middleware)               |

## Basic Routing

```go
facades.Route.Get("/", userController.Show)
facades.Route.Post("/", userController.Show)
facades.Route.Put("/", userController.Show)
facades.Route.Delete("/", userController.Show)
facades.Route.Patch("/", userController.Show)
facades.Route.Options("/", userController.Show)
facades.Route.Any("/", userController.Show)
```

## Group Routing

```go
facades.Route.Group(func(route route.Route) {
  route.Get("group/{id}", func(ctx http.Context) {
    ctx.Response().Success().String(ctx.Request().Query("id", "1"))
  })
})
```

## Routing Prefix

```go
facades.Route.Prefix("users").Get("/", userController.Show)
```

## File Routing

```go
import "net/http"

facades.Route.Static("static", "./public")
facades.Route.StaticFile("static-file", "./public/logo.png")
facades.Route.StaticFS("static-fs", http.Dir("./public"))
```

## Routing Parameters

```go
facades.Route.Get("/input/{id}", func(ctx http.Context) {
  ctx.Response().Success().Json(http.Json{
    "id": ctx.Request().Input("id"),
  })
})
```

Detail [Request](./request.md)

## Middleware

```go
import "github.com/goravel/framework/http/middleware"

facades.Route.Middleware(middleware.Cors()).Get("users", userController.Show)
```

Detail [Middleware](./middleware.md)

## Rate Limiting

### Defining Rate Limiters

Goravel includes powerful and customizable rate limiting services that you may utilize to restrict the amount of traffic for a given route or group of routes. To get started, you should define rate limiter configurations that meet your application's needs. Typically, this should be done within the `configureRateLimiting` method of your application's `app/providers/route_service_provider.go` class.

Rate limiters are defined using the `facades.RateLimiter`s `For` method. The `For` method accepts a rate limiter name and a closure that returns the limit configuration that should apply to routes that are assigned to the rate limiter. The rate limiter name may be any string you wish:

```go
import (
  contractshttp "github.com/goravel/framework/contracts/http"
	"github.com/goravel/framework/facades"
	"github.com/goravel/framework/http/limit"
)

func (receiver *RouteServiceProvider) configureRateLimiting() {
	facades.RateLimiter.For("global", func(ctx contractshttp.Context) contractshttp.Limit {
		return limit.PerMinute(1000)
	})
}
```

If the incoming request exceeds the specified rate limit, a response with a 429 HTTP status code will automatically be returned by Goravel. If you would like to define your own response that should be returned by a rate limit, you may use the response method:

```go
facades.RateLimiter.For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  return limit.PerMinute(1000).Response(func(ctx contractshttp.Context) {
    ctx.Response().String(429, "Custom response...")
    return
  })
})
```

Since rate limiter callbacks receive the incoming HTTP request instance, you may build the appropriate rate limit dynamically based on the incoming request or authenticated user:

```go
facades.RateLimiter.For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  // Suppose
  if is_vip() {
    return limit.PerMinute(100)
  }

  return nil
})
```

#### Segmenting Rate Limits

Sometimes you may wish to segment rate limits by some arbitrary value. For example, you may wish to allow users to access a given route 100 times per minute per IP address. To accomplish this, you may use the `By` method when building your rate limit:

```go
facades.RateLimiter.For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  if is_vip() {
    return limit.PerMinute(100).By(ctx.Request().Ip())
  }

  return nil
})
```

To illustrate this feature using another example, we can limit access to the route to 100 times per minute per authenticated user ID or 10 times per minute per IP address for guests:

```go
facades.RateLimiter.For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  if userID != 0 {
    return limit.PerMinute(100).By(userID)
  }

  return limit.PerMinute(100).By(ctx.Request().Ip())
})
```

#### Multiple Rate Limits

If needed, you may return an array of rate limits for a given rate limiter configuration. Each rate limit will be evaluated for the route based on the order they are placed within the array:

```go
facades.RateLimiter.ForWithLimits("login", func(ctx contractshttp.Context) []contractshttp.Limit {
  return []contractshttp.Limit{
    limit.PerMinute(500),
    limit.PerMinute(100).By(ctx.Request().Ip()),
  }
})
```

### Attaching Rate Limiters To Routes

Rate limiters may be attached to routes or route groups using the throttle middleware. The throttle middleware accepts the name of the rate limiter you wish to assign to the route:

```go
facades.Route.Middleware(middleware.Throttle("global")).Get("/", func(ctx http.Context) {
  ctx.Response().Json(200, http.Json{
    "Hello": "Goravel",
  })
})
```

## Cross-Origin Resource Sharing (CORS)

Goravel has CORS enabled by default, the configuration can be modified in `config/cors.go`, the funciton is registered in `app/http/kernel.go` as global middleware.

> For more information on CORS and CORS headers, please consult the [MDN web documentation on CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers).

## Testing Routing

```go
func TestHttp(t *testing.T) {
  w := httptest.NewRecorder()
  req, err := http.NewRequest("GET", "/users", nil)
  assert.Nil(t, err)
  facades.Route.ServeHTTP(w, req)
  assert.Equal(t, 200, w.Code)
  assert.Equal(t, "1", w.Body.String())
}
```
