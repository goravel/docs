# Авторизация

[[toc]]

## Введение

Помимо предоставления встроенных служб [аутентификации](./authentication.md), Goravel также предоставляет простой способ авторизации действий пользователей относительно заданного ресурса. Например, хотя пользователь прошел аутентификацию, он может не иметь прав на обновление или удаление определенных моделей Eloquent или записей базы данных, управляемых вашим приложением. Возможности авторизации Goravel предоставляют простой и организованный способ управления такими проверками авторизации.

Laravel предоставляет два основных способа авторизации: [гейты](#Гейты) и [политики](#Политики). Подумайте о гейтах и политиках, как о маршрутах и контроллерах. Гейты предоставляют простой подход на основе замыканий для авторизации, в то время как политики, как контроллеры, группируют логику вокруг конкретной модели или ресурса. В этой документации мы сначала рассмотрим гейты, а затем рассмотрим политики.

Вам не нужно выбирать между исключительным использованием гейтов или исключительно использованием политик при создании приложения. В большинстве случаев приложения будут, вероятно, содержать некоторую смесь гейтов и политик, и это вполне нормально!

## Гейты

### Создание гейтов

Гейты - это просто замыкания, которые определяют, имеет ли пользователь разрешение на выполнение данного действия. Обычно гейты определяются в методе `Boot` файла `app/providers/auth_service_provider.go` с использованием фасада Gate.

В этом примере мы определим гейт для определения, может ли пользователь обновить заданную модель Post, сравнивая id пользователя с user_id пользователя, который создал пост:

```go
package providers

import (
  "context"

  "github.com/goravel/framework/contracts/auth/access"
  "github.com/goravel/framework/facades"
)

type AuthServiceProvider struct {
}

func (receiver *AuthServiceProvider) Register() {
}

func (receiver *AuthServiceProvider) Boot() {
  facades.Gate().Define("update-post", func(ctx context.Context, arguments map[string]any) access.Response {
    user := ctx.Value("user").(models.User)
    post := arguments["post"].(models.Post)
    
    if user.ID == post.UserID {
      return access.NewAllowResponse()
    } else {
      return access.NewDenyResponse("error")
    }
  })
}
```

### Авторизация действий

Чтобы авторизовать действие с использованием гейтов, вы должны использовать методы `Allows` или `Denies`, предоставляемые фасадом Gate:

```go
package controllers

import (
  "github.com/goravel/framework/facades"
)

type UserController struct {

func (r *UserController) Show(ctx http.Context) {
  var post models.Post
  if facades.Gate().Allows("update-post", map[string]any{
    "post": post,
  }) {
    
  }
}
```

Вы можете авторизовать несколько действий одновременно, используя методы `Any` или `None`:

```go
if facades.Gate().Any([]string{"update-post", "delete-post"}, map[string]any{
  "post": post,
}) {
  // Пользователь может обновлять или удалять пост...
}

if facades.Gate().None([]string{"update-post", "delete-post"}, map[string]any{
  "post": post,
}) {
  // Пользователь не может обновлять или удалять пост...
}
```

### Ответы от гейтов

Метод `Allows` вернет простое логическое значение, вы можете использовать метод `Inspect` для получения полного ответа авторизации, возвращенного гейтом:

```go
response := facades.Gate().Inspect("edit-settings", nil);

if (response.Allowed()) {
    // Действие авторизовано...
} else {
    fmt.Println($response->message());
}
```

### Перехват проверок гейтов

Иногда вы можете захотеть предоставить все права определенному пользователю. Вы можете использовать метод `Before` для определения замыкания, которое выполняется перед всеми остальными проверками авторизации:

```go
facades.Gate().Before(func(ctx context.Context, ability string, arguments map[string]any) access.Response {
  user := ctx.Value("user").(models.User)
  if isAdministrator(user) {
    return access.NewAllowResponse()
  }

  return nil
})
```

Если замыкание `before` возвращает результат, отличный от `nil`, этот результат будет считаться результатом проверки авторизации.

Вы можете использовать метод `After` для определения замыкания, которое будет выполнено после всех остальных проверок авторизации:

```go
facades.Gate().After(func(ctx context.Context, ability string, arguments map[string]any, result access.Response) access.Response {
  user := ctx.Value("user").(models.User)
  if isAdministrator(user) {
    return access.NewAllowResponse()
  }

  return nil
})
```

> Обратите внимание: результат, возвращаемый `After`, применяется только тогда, когда `facades.Gate().Define` возвращает `nil`.

### Внедрение контекста

`context` будет передан в методы `Before`, `After`, `Define`.

```go
facades.Gate().WithContext(ctx).Allows("update-post", map[string]any{
  "post": post,
})
```

## Политики

### Создание политик

Вы можете создать политику с помощью команды Artisan `

make:policy`. Созданная политика будет размещена в каталоге `app/policies`. Если этот каталог отсутствует в вашем приложении, Goravel создаст его за вас:

```go
go run . artisan make:policy PostPolicy
go run . artisan make:policy user/PostPolicy
```

### Написание политик

Вы можете добавить методы для политики. Например, определим метод `Update` в нашей `PostPolicy`, который определяет, может ли `models.User` обновить `models.Post`.

```go
package policies

import (
  "context"

  "github.com/goravel/framework/contracts/auth/access"
)

type PostPolicy struct {
}

func NewPostPolicy() *PostPolicy {
  return &PostPolicy{}
}

func (r *PostPolicy) Update(ctx context.Context, arguments map[string]any) access.Response {
  user := ctx.Value("user").(models.User)
  post := arguments["post"].(models.Post)
    
  if user.ID == post.UserID {
    return access.NewAllowResponse()
  } else {
    return access.NewDenyResponse("You do not own this post.")
  }
}
```

Затем мы можем зарегистрировать политику в `app/providers/auth_service_provider.go`:

```go
facades.Gate().Define("update-post", policies.NewPostPolicy().Update)
```

Вы можете продолжать определять дополнительные методы в политике по мере необходимости для различных действий, которые она авторизует. Например, вы можете определить методы `View` или `Delete` для авторизации различных действий, связанных с `models.Post`, но помните, что вы вольны давать своим методам политики любое имя, которое вам нравится.

<CommentService/>