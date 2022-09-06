## 介绍

中间件可以起到过滤进入应用程序的 HTTP 请求的作用。例如 `Goravel` 提供一个 CORS 中间件，可以负责为所有的 `response` 添加合适的响应头。

Goravel 自带了一些 `Gin` 中间件，它们位于 `app/http/middleware` 目录中。

## 定义中间件

你可以在 `app/http/middleware` 目录中创建自己的中间件，写法与 `Gin` 中间件的写法保持一致。

## 注册中间件

### 全局中间件

如果你希望在应用程序的每一个 HTTP 请求应用中间件，那么只需要在 `app/http/kernel.go` 文件中的 `Middleware` 注册中间件。

### 为路由分配中间件

如果你想要为某一些路由单独注册中间件，那么可以在 `app/http/middleware` 文件夹中新建中间件，然后就可以根据 `Gin` 的写法进行处理：
```
userAuth := facades.Route.Group("/")
userAuth.Use(middleware.Jwt([]string{"user"}))
```

