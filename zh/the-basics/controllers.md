# 控制器

[[toc]]

## 简介

为了代替在单独路由中以闭包形式定义所有的请求处理逻辑，可以使用控制器来进行整合。控制器被存放在 `app/http/controllers` 目录中。

## 定义控制器

下面是一个基础控制器类的例子：

```go
package controllers

import (
  "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/facades"
)

type UserController struct {
  //Dependent services
}

func NewUserController() *UserController {
  return &UserController{
    //Inject services
  }
}

func (r *UserController) Show(ctx http.Context) {
  ctx.Response().Success().Json(http.Json{
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

```
go run . artisan make:controller UserController
go run . artisan make:controller user/UserController
```

<CommentService/>