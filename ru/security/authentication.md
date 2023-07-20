# Аутентификация

## Введение

Аутентификация - это неотъемлемая функция в веб-приложениях, модуль `facades.Auth()` фреймворка Goravel обеспечивает поддержку JWT.

## Конфигурация

Вы можете настроить стандартную охрану и несколько охранников в файле `config/auth.go`, чтобы переключать различные идентификаторы пользователей в приложении.

Вы можете настроить параметры JWT в файле `config/jwt.go`, такие как `secret`, `ttl`, `refresh_ttl`.

## Генерация токена JWT

```
go run . artisan jwt:secret
```

## Генерация токена с использованием пользователя

Вы можете сгенерировать токен на основе модели. Если модель использует `orm.Model`, дополнительная конфигурация не требуется. В противном случае вам нужно настроить тег на поле модели с первичным ключом, например:

```go
type User struct {
  ID uint `gorm:"primaryKey"`
  Name string
}

var user User
user.ID = 1

token, err := facades.Auth().Login(ctx, &user)
```

## Генерация токена с использованием ID

```go
token, err := facades.Auth().LoginUsingID(ctx, 1)
```

## Разбор токена

```go
payload, err := facades.Auth().Parse(ctx, token)
```

Через `payload` вы можете получить:

1. `Guard`: Текущий охранник;
2. `Key`: Флаг пользователя;
3. `ExpireAt`: Время истечения срока действия;
4. `IssuedAt`: Время выдачи;

> Когда `err` не равен nil и не равен `auth.ErrorTokenExpired`, payload == nil

Вы можете определить, истек ли токен, сравнивая err:

```go
"errors"
"github.com/goravel/framework/auth"

errors.Is(err, auth.ErrorTokenExpired)
```

> Токен можно успешно разобрать с префиксом Bearer или без него.

## Получение пользователя

Для получения пользователя необходимо сначала сгенерировать токен с помощью `Parse`, этот процесс можно обработать в промежуточном обработчике HTTP.

```go
var user models.User
err := facades.Auth().User(ctx, &user)// Обязательно использовать указатель
```

## Обновление токена

Для обновления пользователя необходимо сначала сгенерировать токен с помощью `Parse`.

```go
token, err := facades.Auth().Refresh(ctx)
```

## Выход из системы

```go
err := facades.Auth().Logout(ctx)
```

## Несколько охранников

```go
token, err := facades.Auth().Guard("admin").LoginUsingID(ctx, 1)
err := facades.Auth().Guard("admin").Parse(ctx, token)
token, err := facades.Auth().Guard("admin").User(ctx, &user)
```

> Когда не используется стандартный охранник, метод `Guard` должен быть вызван заранее при вызове вышеперечисленных методов.

<CommentService/>