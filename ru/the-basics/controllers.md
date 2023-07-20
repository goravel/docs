# Контроллеры

[[toc]]

## Введение

Вместо определения всей логики обработки запросов в виде замыкания в отдельном маршруте, можно использовать контроллеры для интеграции. Контроллеры хранятся в директории `app/http/controllers`.

## Определение контроллеров

Вот пример простого контроллера:

```go
package controllers

import (
  "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/facades"
)

type UserController struct {
  // Зависимые сервисы
}

func NewUserController() *UserController {
  return &UserController{
    // Внедрение сервисов
  }
}

func (r *UserController) Show(ctx http.Context) {
  ctx.Response().Success().Json(http.Json{
    "Hello": "Goravel",
  })
}
```

Определение маршрута:

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

### Создание контроллера

```
go run . artisan make:controller UserController
go run . artisan make:controller user/UserController
```

<CommentService/>