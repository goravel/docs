# 控制器

[[toc]]

## 简介

控制器可以用于集成，而不是在单独的路由中以闭包形式定义所有请求处理逻辑。 控制器存储在 `app/http/controllers` 目录中。 The controllers are stored in the `app/http/controllers` directory.

## 定义控制器

以下是一个基本控制器的示例：

```go
package controllers

import (
  "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/facades"
)

type UserController struct {
  // 依赖服务
}

func NewUserController() *UserController {
  return &UserController{
    // 注入服务
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

## 资源控制器

如果你将应用程序中的每个Eloquent模型视为一个"资源"，那么对应用程序中的每个资源执行相同的一组操作是很常见的。 例如，假设你的应用程序包含一个`Photo`模型和一个`Movie`模型。 用户很可能可以创建、读取、更新或删除这些资源。 For example, imagine your application contains a `Photo` model and a `Movie` model. It is likely that users can create, read, update, or delete these resources.

由于这种常见用例，Goravel资源路由只需一行代码就可以将典型的创建、读取、更新和删除（"CRUD"）路由分配给控制器。 要开始使用，我们可以使用`make:controller` Artisan命令的`--resource`选项来快速创建一个处理这些操作的控制器： To get started, we can use the `make:controller` Artisan command's `--resource` option to quickly create a controller to handle these actions:

```shell
go run . artisan make:controller --resource PhotoController
```

这个命令将在`app/http/controllers/photo_controller.go`生成一个控制器。 该控制器将包含每个可用资源操作的方法。 接下来，您可以注册一个指向控制器的资源路由： The controller will contain a method for each of the available resource operations. Next, you may register a resource route that points to the controller:

```go
facades.Route().Resource("photos", controllers.NewPhotoController())
```

| 动词        | 请求URI             | 操作      |
| --------- | ----------------- | ------- |
| GET       | `/photos`         | 索引      |
| POST      | `/photos`         | 存储      |
| GET       | `/photos/{photo}` | 显示      |
| PUT/PATCH | `/photos/{photo}` | 更新      |
| DELETE    | `/photos/{photo}` | Destroy |
