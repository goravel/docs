# HTTP Response (Ответ HTTP)

[[toc]]

## Введение

Вы можете использовать `ctx.Response()` для формирования ответа HTTP в контроллере.

## String (Строковый Ответ)

```go
import "github.com/goravel/framework/contracts/http"

ctx.Response().String(http.StatusOK, "Привет, Goravel")
```

## JSON (JSON Ответ)

```go
import (
  "github.com/goravel/framework/contracts/http"
)

ctx.Response().Json(http.StatusOK, http.Json{
  "Привет": "Goravel",
})

ctx.Response().Json(http.StatusOK, struct {
  ID       uint `json:"id"`
  Name     string `json:"name"`
}{
  ID:      1,
  Name:    "Goravel",
})
```

## Пользовательский Возврат (Custom Return)

```go
ctx.Response().Data(http.StatusOK, "text/html; charset=utf-8", []byte("<b>Goravel</b>"))
```

## Ответ с Файлом (Response File)

```go
import "net/http"

ctx.Response().File("./public/logo.png")
```

## Загрузка Файла (Download File)

```go
import "net/http"

ctx.Response().Download("./public/logo.png", "1.png")
```

## Прикрепить Заголовок (Attach Header)

```go
import "github.com/goravel/framework/contracts/http"

ctx.Response().Header("Content", "Goravel").String(http.StatusOK, "Привет, Goravel")
```

## Возврат Успешного Ответа (Return Success)

```go
ctx.Response().Success().String("Привет, Goravel")
ctx.Response().Success().Json(http.Json({
  "Привет": "Goravel",
}))
```

## Перенаправление (Redirect)

```go
ctx.Response().Redirect(http.StatusMovedPermanently, "https://goravel.dev")
```

## Получить Ответ (Get Response)

Вы можете получить всю информацию из `ctx.Response()`, это часто используется в промежуточном программном обеспечении HTTP:

```go
origin := ctx.Response().Origin()
```

`origin` содержит некоторые методы, как показано ниже:

| Метод        | Действие           |
| -----------  | -------------- |
| Body         | Получить данные ответа     |
| Header       | Получить заголовок ответа |
| Size         | Получить размер ответа     |
| Status       | Получить статус ответа   |

<CommentService/>