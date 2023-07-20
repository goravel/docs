# HTTP Запросы

[[toc]]

## Введение

Метод `contracts/http/Request` в Goravel позволяет взаимодействовать с текущим HTTP-запросом, обрабатываемым приложением, и получать входные данные и отправленные файлы.

## Взаимодействие с Запросом

Экземпляр `http.Context` автоматически внедряется в контроллер:

```go
import "github.com/goravel/framework/contracts/http"

facades.Route().Get("/", func(ctx http.Context) {

})
```

### Получение Пути Запроса

```go
path := ctx.Request().Path() // /users
```

### Получение URL Запроса

```go
url := ctx.Request().Url() // /users?name=Goravel
```

### Получение HOST Запроса

```go
url := ctx.Request().Host()
```

### Получение Полного URL Запроса

```go
url := ctx.Request().FullUrl() // http://**/users?name=Goravel
```

### Получение Метода Запроса

```go
method := ctx.Request().Method()
```

### Заголовки Запроса

```go
header := ctx.Request().Header('X-Header-Name', 'default')
headers := ctx.Request().Headers()
```

### IP Адрес Запроса

```go
method := ctx.Request().Ip()
```

## Входные Данные

### Получение Всех Входных Данных

Вы можете получить все входные данные входящего запроса в виде `map[string]any` с помощью метода `All`, это коллекция `json`, `form` и `query` (приоритет от переднего к заднему).

```go
data := ctx.Request().All()
```

### Получение Значения Из Пути (Route Value)

```go
// /users/{id}
id := ctx.Request().Route("id")
id := ctx.Request().RouteInt("id")
id := ctx.Request().RouteInt64("id")
```

### Получение Входных Данных из Строки Запроса (Query String)

```go
// /users?name=goravel
name := ctx.Request().Query("name")
name := ctx.Request().Query("name", "default")

// /users?id=1
name := ctx.Request().QueryInt("id")
name := ctx.Request().QueryInt64("id")
name := ctx.Request().QueryBool("id")

// /users?names=goravel1&names=goravel2
names := ctx.Request().QueryArray("names")

// /users?names[a]=goravel1&names[b]=goravel2
names := ctx.Request().QueryMap("names")

queries := ctx.Request().Queries()
```

### Получение Формы (Form)

```go
name := ctx.Request().Form("name")
name := ctx.Request().Form("name", "goravel")
```

### Получение Json

```go
name := ctx.Request().Json("name")
name := ctx.Request().Json("name", "goravel")
```

> Примечание: Можно получить только одномерные данные Json, иначе будет возвращено пустое значение.

### Получение Значения Из Входных Данных (Input)

Получайте все входные данные пользователя, не заботясь о том, какой HTTP-глагол был использован для запроса. Порядок извлечения: `json`, `form`, `query`, `route`.

```go
name := ctx.Request().Input("name")
name := ctx.Request().Json("name", "goravel")
name := ctx.Request().InputInt("name")
name := ctx.Request().InputInt64("name")
name := ctx.Request().InputBool("name")
```

### Привязка Json/Form в Структуру

```go
type User struct {
  Name string `form:"code" json:"code"`
}

var user User
err := ctx.Request().Bind(&user)
```

```go
var user map[string]any
err := ctx.Request().Bind(&user)
```

## Файлы

### Получение Файла

```go
file, err := ctx.Request().File("file")
```

### Сохранение Файла

```go
file, err := ctx.Request().File("file")
file.Store("./public")
```

### Прерывание Запроса (Abort)

```go
ctx.Request().AbortWithStatus(403)
ctx.Request().AbortWithStatusJson(403, http.Json{
  "Hello": "World",
})
```

### Получение Оригинального Запроса (Origin Request)

```go
request := ctx.Request().Origin()
```

### Прикрепить Данные (Attach Data)

```go
ctx.WithValue("user", "Goravel")
```

### Получить Данные (Get Data)

```go
user := ctx.Value("user")
```

### Получить Контекст (Get Context)

```go
ctx := ctx.Context()
```

<CommentService/>