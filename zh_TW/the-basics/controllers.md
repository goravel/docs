# 控制器

[[toc]]

## 概述

為了代替在單獨路由中以閉包形式定義所有的請求處理邏輯，可以使用控制器來進行整合。 控制器被存放在 `app/http/controllers` 目錄中。 控制器存放在 `app/http/controllers` 目錄中。

## 定義控制器

下面是一個基礎控制器的例子：

```go
package controllers

import (
  "github.com/goravel/framework/contracts/http"

  "goravel/app/facades"
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

路由定義：

```go
package routes

import (
  "goravel/app/facades"
  "goravel/app/http/controllers"
)

func Api() {
  userController := controllers.NewUserController()
  facades.Route().Get("/{id}", userController.Show)
}
```

### 創建控制器

```shell
./artisan make:controller UserController
./artisan make:controller user/UserController
```

## 資源型控制器

如果你把應用中的每個 Eloquent 模型視為一個「資源」，那麼對每個資源執行相同操作是很常見的。 例如，假設你的應用包含一個 `Photo` 模型和一個 `Movie` 模型。 很可能用戶可以創建、讀取、更新或刪除這些資源。

因為這是一個常見的用例，Goravel 資源路由會通過單行代碼將典型的創建、讀取、更新和刪除（"CRUD"）路由分配給控制器。 要開始，我們可以使用 `make:controller` Artisan 命令的 `--resource` 選項來快速創建一個處理這些操作的控制器：

```shell
./artisan make:controller --resource PhotoController
```

這條命令將生成一個控制器位於 `app/http/controllers/photo_controller.go`。 控制器將包含每個可用資源操作的方法。 接下來，你可以註冊一個指向控制器的資源路由：

```go
facades.Route().Resource("photos", controllers.NewPhotoController())
```

| 動詞        | URI               | 操作    |
| --------- | ----------------- | ----- |
| GET       | `/photos`         | 索引    |
| POST      | `/photos`         | Store |
| GET       | `/photos/{photo}` | 顯示    |
| PUT/PATCH | `/photos/{photo}` | 更新    |
| DELETE    | `/photos/{photo}` | 摧毀    |
