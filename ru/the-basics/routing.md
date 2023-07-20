# Маршрутизация (Routing)

## Введение

Модуль маршрутизации Goravel может быть использован через фасад `facades.Route()`.

## Файл Маршрутизации по Умолчанию

Все файлы маршрутов определены в каталоге `/routes`. Фреймворк использует файл маршрута `/routes/web.go` по умолчанию, в котором метод `func Web()` регистрируется в файле `app/providers/route_service_provider.go` для обработки привязки маршрутов.

Вы можете добавлять дополнительные файлы маршрутов в каталог `routes` для более тонкой настройки управления и регистрировать их в файле `app/providers/route_service_provider.go`.

## Запуск HTTP-сервера

Для запуска HTTP-сервера добавьте следующий код в `main.go` в корневом каталоге. `facades.Route().Run()` автоматически использует конфигурацию `route.host`.

```go
package main

import (
  "github.com/goravel/framework/facades"

  "goravel/bootstrap"
)

func main() {
  // Загрузка и подготовка фреймворка.
  bootstrap.Boot()

  // Запуск HTTP-сервера с помощью facades.Route().
  go func() {
    if err := facades.Route().Run(); err != nil {
      facades.Log().Errorf("Ошибка запуска маршрута: %v", err)
    }
  }()

  select {}
}
```

## Запуск HTTPS-сервера

### Регистрация Middleware

Фреймворк по умолчанию использует общий Middleware, но вы также можете настраивать его по своему усмотрению.

```go
// app/http/kernel.go
import "github.com/goravel/framework/http/middleware"

func (kernel *Kernel) Middleware() []http.Middleware {
  return []http.Middleware{
    middleware.Tls(),
  }
}
```

### Запуск Сервера

Для запуска HTTPS-сервера вы можете использовать `facades.Route().RunTLS()`, который автоматически использует конфигурацию `route.tls`:

```go
// main.go
if err := facades.Route().RunTLS(); err != nil {
  facades.Log().Errorf("Ошибка запуска маршрута: %v", err)
}
```

Вы также можете использовать метод `facades.Route().RunTLSWithCert()` для настройки хоста и сертификата:

```go
// main.go
if err := facades.Route().RunTLSWithCert("127.0.0.1:3000", "ca.pem", "ca.key"); err != nil {
  facades.Log().Errorf("Ошибка запуска маршрута: %v", err)
}
```

### Методы Маршрутизации

Ниже приведены некоторые из методов маршрутизации, доступных в Goravel:

# Маршрутизация (Routing)

## Введение

Модуль маршрутизации Goravel управляется через фасад `facades.Route()`.

## Файл маршрута по умолчанию

Все файлы маршрутов определены в директории `/routes`. Фреймворк использует файл маршрута `/routes/web.go` по умолчанию, в котором метод `func Web()` регистрируется в файле `app/providers/route_service_provider.go` для привязки маршрутов.

Вы можете добавлять дополнительные файлы маршрутов в директорию `routes` для более тонкой настройки управления, а затем регистрировать их в файле `app/providers/route_service_provider.go`.

## Запуск HTTP-сервера

Для запуска HTTP-сервера добавьте следующий код в файл `main.go` в корневой директории. `facades.Route().Run()` автоматически использует конфигурацию `route.host`.

```go
package main

import (
  "github.com/goravel/framework/facades"

  "goravel/bootstrap"
)

func main() {
  // Загрузка и подготовка фреймворка.
  bootstrap.Boot()

  // Запуск HTTP-сервера через facades.Route().
  go func() {
    if err := facades.Route().Run(); err != nil {
      facades.Log().Errorf("Ошибка запуска маршрута: %v", err)
    }
  }()

  select {}
}
```

## Запуск HTTPS-сервера

### Регистрация Middleware

Фреймворк по умолчанию имеет встроенное общее промежуточное программное обеспечение (Middleware), но вы также можете настраивать его по своему усмотрению.

```go
// app/http/kernel.go
import "github.com/goravel/framework/http/middleware"

func (kernel *Kernel) Middleware() []http.Middleware {
  return []http.Middleware{
    middleware.Tls(),
  }
}
```

### Запуск сервера

Для запуска HTTPS-сервера вы можете использовать метод `facades.Route().RunTLS()`, который автоматически использует конфигурацию `route.tls`:

```go
// main.go
if err := facades.Route().RunTLS(); err != nil {
  facades.Log().Errorf("Ошибка запуска маршрута: %v", err)
}
```

Вы также можете использовать метод `facades.Route().RunTLSWithCert()` для настройки хоста и сертификата:

```go
// main.go
if err := facades.Route().RunTLSWithCert("127.0.0.1:3000", "ca.pem", "ca.key"); err != nil {
  facades.Log().Errorf("Ошибка запуска маршрута: %v", err)
}
```

### Методы маршрутизации

Ниже приведены некоторые из методов маршрутизации, доступных в Goravel:

## Базовая Маршрутизация

```go
facades.Route().Get("/", userController.Show)
facades.Route().Post("/", userController.Show)
facades.Route().Put("/", userController.Show)
facades.Route().Delete("/", userController.Show)
facades.Route().Patch("/", userController.Show)
facades.Route().Options("/", userController.Show)
facades.Route().Any("/", userController.Show)
```

## Ресурсная Маршрутизация

```go
import "github.com/goravel/framework/contracts/http"

resourceController := NewResourceController()
facades.Route().Resource("/resource", resourceController)

type ResourceController struct{}
func NewResourceController () *ResourceController {
  return &ResourceController{}
}
// GET /resource
func (c *ResourceController) Index(ctx http.Context) {}
// GET /resource/{id}
func (c *ResourceController) Show(ctx http.Context) {}
// POST /resource
func (c *ResourceController) Store(ctx http.Context) {}
// PUT /resource/{id}
func (c *ResourceController) Update(ctx http.Context) {}
// DELETE /resource/{id}
func (c *ResourceController) Destroy(ctx http.Context) {}
```

## Группировка Маршрутов

```go
facades.Route().Group(func(route route.Route) {
  route.Get("group/{id}", func(ctx http.Context) {
    ctx.Response().Success().String(ctx.Request().Query("id", "1"))
  })
})
```

## Префикс Маршрутизации

```go
facades.Route().Prefix("users").Get("/", userController.Show)
```

## Файловая Маршрутизация

```go
import "net/http"

facades.Route().Static("static", "./public")
facades.Route().StaticFile("static-file", "./public/logo.png")
facades.Route().StaticFS("static-fs", http.Dir("./public"))
```

## Параметры Маршрутизации

```go
facades.Route().Get("/input/{id}", func(ctx http.Context) {
  ctx.Response().Success().Json(http.Json{
    "id": ctx.Request().Input("id"),
  })
})
```

Подробности [Request](./request.md)

## Промежуточное программное обеспечение (Middleware)

```go
import "github.com/goravel/framework/http/middleware"

facades.Route().Middleware(middleware.Cors()).Get("users", userController.Show)
```

Подробности [Middleware](./middleware.md)

## Запасные Маршруты (Fallback)

С помощью метода `Fallback` вы можете определить маршрут, который будет выполнен, когда не будет найдено ни одного другого соответствующего маршрута для входящего запроса.

```go
facades.Route().Fallback(func(ctx http.Context) {
  ctx.Response().String(404, "not found")
})
```

## Ограничение по Количеству Запросов (Rate Limiting)

### Определение Лимитеров Ограничения по Количеству Запросов

Goravel включает мощные и настраиваемые сервисы ограничения скорости, которые вы можете использовать для ограничения количества трафика для определенных маршрутов или групп маршрутов. Для начала вам следует определить конфигурации ограничения скорости, которые соответствуют потребностям вашего приложения. Обычно это делается в методе `configureRateLimiting` вашего класса `app/providers/route_service_provider.go`.

Ограничители скорости определяются с помощью метода `facades.RateLimiter().For()`. Метод `For` принимает имя ограничителя скорости и замыкание, которое возвращает конфигурацию лимита, которая должна применяться к маршрутам, назначенным ограничителю скорости. Имя ограничителя скорости может быть любой строкой:

```go
import (
  contractshttp "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/facades"
  "github.com/goravel/framework/http/limit"
)

func (receiver *RouteServiceProvider) configureRateLimiting() {
  facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
    return limit.PerMinute(1000)
  })
}
```

Если входящий запрос превышает указанный лимит скорости, Goravel автоматически вернет ответ с HTTP-кодом 429. Если вы хотите определить свой собственный ответ, который должен возвращаться при ограничении скорости, вы можете использовать метод `response`:

```go
facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  return limit.PerMinute(1000).Response(func(ctx contractshttp.Context) {
    ctx.Response().String(429, "Свой собственный ответ...")
    return
  })
})
```

Так как обратные вызовы ограничения скорости получают экземпляр входящего HTTP-запроса, вы можете строить соответствующий лимит скорости динамически на основе входящего запроса или авторизованного пользователя:

```go
facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  // Например, если это VIP-пользователь
  if is_vip() {
    return limit.PerMinute(100)
  }

  return nil
})
```

#### Сегментация Лимитов Скорости

Иногда вам может понадобить

The translation of the remaining text:

| Методы    | Действие                                  |
| ---------- | --------------------------------------- |
| Run        | [Запуск HTTP-сервера](#start-http-server) |
| RunTLS        | [Запуск HTTPS-сервера](#start-https-server) |
| RunTLSWithCert        | [Запуск HTTPS-сервера](#start-https-server) |
| Group      | [Группировка маршрутов](#group-routing)         |
| Prefix     | [Префикс маршрутизации](#routing-prefix)       |
| ServeHTTP  | [Тестирование маршрутов](#testing-routing)     |
| Get        | [Базовая маршрутизация](#basic-routing)         |
| Post       | [Базовая маршрутизация](#basic-routing)         |
| Put        | [Базовая маршрутизация](#basic-routing)         |
| Delete     | [Базовая маршрутизация](#basic-routing)         |
| Patch      | [Базовая маршрутизация](#basic-routing)         |
| Options    | [Базовая маршрутизация](#basic-routing)         |
| Any        | [Базовая маршрутизация](#basic-routing)         |
| Resource   | [Ресурсная маршрутизация](#resource-routing)         |
| Static     | [Файловая маршрутизация](#file-routing)           |
| StaticFile | [Файловая маршрутизация](#file-routing)           |
| StaticFS   | [Файловая маршрутизация](#file-routing)           |
| Middleware | [Промежуточное программное обеспечение (Middleware)](#middleware)               |
| Fallback   | [Запасные маршруты](#fallback-routes)               |
| Rate Limiting   | [Ограничение по количеству запросов (Rate Limiting)](#rate-limiting)               |
| CORS   | [Cross-Origin Resource Sharing (CORS)](#cross-origin-resource-sharing-cors)               |
| Testing Routing   | [Тестирование маршрутизации](#testing-routing)               |

## Базовая Маршрутизация

```go
facades.Route().Get("/", userController.Show)
facades.Route().Post("/", userController.Show)
facades.Route().Put("/", userController.Show)
facades.Route().Delete("/", userController.Show)
facades.Route().Patch("/", userController.Show)
facades.Route().Options("/", userController.Show)
facades.Route().Any("/", userController.Show)
```

## Ресурсная Маршрутизация

```go
import "github.com/goravel/framework/contracts/http"

resourceController := NewResourceController()
facades.Route().Resource("/resource", resourceController)

type ResourceController struct{}
func NewResourceController () *ResourceController {
  return &ResourceController{}
}
// GET /resource
func (c *ResourceController) Index(ctx http.Context) {}
// GET /resource/{id}
func (c *ResourceController) Show(ctx http.Context) {}
// POST /resource
func (c *ResourceController) Store(ctx http.Context) {}
// PUT /resource/{id}
func (c *ResourceController) Update(ctx http.Context) {}
// DELETE /resource/{id}
func (c *ResourceController) Destroy(ctx http.Context) {}
```

## Группировка Маршрутов

```go
facades.Route().Group(func(route route.Route) {
  route.Get("group/{id}", func(ctx http.Context) {
    ctx.Response().Success().String(ctx.Request().Query("id", "1"))
  })
})
```

## Префикс Маршрутизации

```go
facades.Route().Prefix("users").Get("/", userController.Show)
```

## Файловая Маршрутизация

```go
import "net/http"

facades.Route().Static("static", "./public")
facades.Route().StaticFile("static-file", "./public/logo.png")
facades.Route().StaticFS("static-fs", http.Dir("./public"))
```

## Параметры Маршрутизации

```go
facades.Route().Get("/input/{id}", func(ctx http.Context) {
  ctx.Response().Success().Json(http.Json{
    "id": ctx.Request().Input("id"),
  })
})
```

Подробности [Request](./request.md)

## Промежуточное программное обеспечение (Middleware)

```go
import "github.com/goravel/framework/http/middleware"

facades.Route().Middleware(middleware.Cors()).Get("users", userController.Show)
```

Подробности [Middleware](./middleware.md)

З## Запасные (по-умолчанию) Маршруты

Используя метод `Fallback`, вы можете определить маршрут, который будет выполнен, когда нет других совпадающих маршрутов для входящего запроса.

```go
facades.Route().Fallback(func(ctx http.Context) {
  ctx.Response().String(404, "не найдено")
})
```

## Ограничение Скорости

### Определение Ограничителей Скорости

Goravel включает мощные и настраиваемые сервисы ограничения скорости, которые вы можете использовать для ограничения количества трафика для определенного маршрута или группы маршрутов. Для начала работы вы должны определить конфигурации ограничителей скорости, которые соответствуют потребностям вашего приложения. Обычно это делается в методе `configureRateLimiting` вашего класса `app/providers/route_service_provider.go`.

Ограничители скорости определяются с помощью метода `For` из `facades.RateLimiter()`. Метод `For` принимает имя ограничителя скорости и замыкание, которое возвращает конфигурацию ограничения, которое должно применяться к маршрутам, назначенным ограничителю скорости. Имя ограничителя скорости может быть любой строкой на ваше усмотрение:

```go
import (
  contractshttp "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/facades"
  "github.com/goravel/framework/http/limit"
)

func (receiver *RouteServiceProvider) configureRateLimiting() {
  facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
    return limit.PerMinute(1000)
  })
}
```

Если входящий запрос превышает указанный лимит скорости, автоматически будет возвращен ответ с кодом состояния HTTP 429 от Goravel. Если вы хотите определить свой собственный ответ, который должен возвращаться при ограничении скорости, вы можете использовать метод `response`:

```go
facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  return limit.PerMinute(1000).Response(func(ctx contractshttp.Context) {
    ctx.Response().String(429, "Собственный ответ...")
    return
  })
})
```

Так как обратные вызовы лимитов скорости получают экземпляр входящего запроса HTTP, вы можете динамически создавать соответствующее ограничение скорости на основе входящего запроса или аутентифицированного пользователя:

```go
facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  // Предположим
  if is_vip() {
    return limit.PerMinute(100)
  }

  return nil
})
```

#### Сегментация Ограничителей Скорости

Иногда вы можете захотеть сегментировать лимиты скорости по некоторому произвольному значению. Например, вы можете позволить пользователям обращаться к определенному маршруту 100 раз в минуту для каждого IP-адреса. Для этого можно использовать метод `By` при создании лимита скорости:

```go
facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  if is_vip() {
    return limit.PerMinute(100).By(ctx.Request().Ip())
  }

  return nil
})
```

Для проиллюстрирования этой функции на другом примере можно ограничить доступ к маршруту до 100 раз в минуту на каждый идентификатор аутентифици

рованного пользователя или до 10 раз в минуту на каждый IP-адрес для гостей:

```go
facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  if userID != 0 {
    return limit.PerMinute(100).By(userID)
  }

  return limit.PerMinute(100).By(ctx.Request().Ip())
})
```

#### Несколько Ограничителей Скорости

При необходимости вы можете вернуть массив ограничений скорости для заданной конфигурации ограничителя скорости. Каждый ограничитель скорости будет оцениваться для маршрута в соответствии с их расположением в массиве:

```go
facades.RateLimiter().ForWithLimits("login", func(ctx contractshttp.Context) []contractshttp.Limit {
  return []contractshttp.Limit{
    limit.PerMinute(500),
    limit.PerMinute(100).By(ctx.Request().Ip()),
  }
})
```

### Присоединение Ограничителей Скорости к Маршрутам

Ограничители скорости могут быть присоединены к маршрутам или группам маршрутов с помощью промежуточного программного обеспечения `throttle`. Промежуточное программное обеспечение `throttle` принимает имя ограничителя скорости, которое вы хотите присвоить маршруту:

```go
facades.Route().Middleware(middleware.Throttle("global")).Get("/", func(ctx http.Context) {
  ctx.Response().Json(200, http.Json{
    "Hello": "Goravel",
  })
})
```

## Кросс-Доменный Обмен Ресурсами (CORS)

По-умолчанию в Goravel включена поддержка CORS, конфигурацию можно изменить в файле `config/cors.go`, функция зарегистрирована как глобальное промежуточное программное обеспечение в `app/http/kernel.go`.

> Для получения дополнительной информации о CORS и заголовках CORS, обратитесь к [документации MDN web о CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers).

## Тестирование Маршрутов

```go
func TestHttp(t *testing.T) {
  w := httptest.NewRecorder()
  req, err := http.NewRequest("GET", "/users", nil)
  assert.Nil(t, err)
  facades.Route().ServeHTTP(w, req)
  assert.Equal(t, 200, w.Code)
  assert.Equal(t, "1", w.Body.String())
}
```

<CommentService/>