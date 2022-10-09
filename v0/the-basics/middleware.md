# Middleware

[[toc]]

## Introduction

Middleware can play a role in filtering HTTP requests that enter the application. For example, `Goravel` provides a CORS middleware, which can be responsible for adding appropriate response headers to all `response`.

Goravel comes with some `Gin` middleware, which are located in the `app/http/middleware` directory.

## Define Middlewares

You can create your own middleware in the `app/http/middleware` directory, and the writing method is consistent with that of `Gin` middleware.

## Register Middlewares

### Global Middlewares

If you want to apply middleware for every HTTP request of your application, you only need to register the middleware in the `Middleware` in the `app/http/kernel.go` file.

### Assign Middlewares for Routing

If you want to separately register middleware for certain routes, you can create a new middleware in the `app/http/middleware` folder, and then you can process it according to the writing of `Gin`:
```
userAuth := facades.Route.Group("/")
userAuth.Use(middleware.Jwt([]string{"user"}))
```

