# 控制器

[[toc]]

## 简介

为了代替在单独路由中以闭包形式定义所有的请求处理逻辑，可以使用控制器来进行整合。 控制器被存放在 `app/http/controllers` 目录中。 控制器被存放在 `app/http/controllers` 目录中。

## 定义控制器

下面是一个基础控制器类的例子：

```go
package controllers

import (
  "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/facades"
)

type UserController struct {
  // Dependent services
}

func NewUserController() *UserController {
  return &UserController{
    // Inject services
  }
}

func (r *UserController) Show(ctx http.Context) http.Response {
  return ctx.Response().Success().Json(http.Json{
    "Hello": "Goravel",
  })
}
```

路由定义：

```go
package routes

import (
  "github.com/goravel/framework/facades"

  "goravel/app/http/controllers"
)

func Web() {
  userController := controllers.NewUserController()
  facades.Route().Get("/{id}", userController.Show)
}
```

### 创建控制器

```shell
go run . artisan make:controller UserController
go run . artisan make:controller user/UserController
```

## 资源型控制器

如果您将应用程序中的每个模型都视为资源，那么通常对应用程序中的每个资源都执行相同的操作。 例如，假设您的应用程序中包含一个 `Photo` 模型和一个 `Movie` 模型。 用户可能可以创建，读取，更新或者删除这些资源。

Goravel 的资源路由通过单行代码即可将典型的「CURD (增删改查)」路由分配给控制器。 首先，我们可以使用 Artisan 命令 `make:controller` 的 `--resource` 选项来快速创建一个控制器： 首先，我们可以使用 Artisan 命令 `make:controller` 的 `--resource` 选项来快速创建一个控制器：

```shell
go run . artisan make:controller --resource PhotoController
```

这个命令将会生成一个控制器 `app/http/controllers/photo_controller.go`。 其中包括每个可用资源操作的方法。 接下来，你可以给控制器注册一个资源路由： 其中包括每个可用资源操作的方法。 接下来，您可以给控制器注册一个资源路由：

```go
facades.Route().Resource("photos", controllers.NewPhotoController())
```

| 请求        | 请求URI             | 行为      |
| --------- | ----------------- | ------- |
| GET       | `/photos`         | Index   |
| POST      | `/photos`         | Store   |
| GET       | `/photos/{photo}` | Show    |
| PUT/PATCH | `/photos/{photo}` | Update  |
| DELETE    | `/photos/{photo}` | Destroy |
