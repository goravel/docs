# Routing

[[toc]]

## Introduction

Goravel routing module can operated by `facades.Route`.

## Default Routing File

All routing files are defined in the `/routes` directory. The framework defaults to a sample route `/routes/web.go`, in which the `func Web()` method is registered in the `app/providers/route_service_provider.go` file to achieve routing binding.

You can add routing files under the `routes` directory to perform more fine-grained management, then register them in the `app/providers/route_service_provider.go` file.

## Start HTTP Server

Start the HTTP server in `main.go` in the root directory.

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
    if err := facades.Route.Run(facades.Config.GetString("app.host")); err != nil {
      facades.Log.Errorf("Route run error: %v", err)
    }
  }()

  select {}
}
```

### Routing Methods

| Methods    | Action                                  |
| ---------- | --------------------------------------- |
| Run        | [Start HTTP Server](#Start-HTTP-Server) |
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
facades.Route.Static("static", "./public")
facades.Route.StaticFile("static-file", "./public/logo.png")
facades.Route.StaticFS("static-fs", nethttp.Dir("./public"))
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
