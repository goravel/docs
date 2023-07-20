# Facades

[[toc]]

## Введение

`facades` предоставляют "статический" интерфейс для основного функционала приложения и обеспечивают более гибкий, более элегантный и легко тестируемый синтаксис.

Все `facades` в Goravel определены в пакете `github.com/goravel/framework/facades`. Мы можем легко использовать `facades`:

```go
import "github.com/goravel/framework/facades"

facades.Route().Run(facades.Config().GetString("app.host"))
```

## Как работают фасады

`facades` обычно создаются в этапе `Register` или `Boot` каждого `ServerProvider` модуля.

```go
func (config *ServiceProvider) Register() {
  app := Application{}
  facades.Config = app.Init()
}
```

Если `facades` используют другие `facades`, то их можно создать в этапе `Boot` модуля `ServerProvider`:

```go
func (database *ServiceProvider) Boot() {
  app := Application{}
  facades.DB = app.Init()
}
```

## Справочник классов фасадов

| Фасад     | Документация                                                |
| --------   | ------------------------------------------------------- |
| App        | [Контейнер](../architecutre-concepts/service-container.md) |
| Artisan    | [Консоль команд](../digging-deeper/artisan-console.md) |
| Auth       | [Аутентификация](../security/authentication.md)   |
| Cache      | [Кэш](../digging-deeper/cache.md)                     |
| Config     | [Конфигурация](../getting-started/configuration.md)    |
| Crypt      | [Шифрование](../security/encryption.md)    |
| Event      | [События](../digging-deeper/event.md)                     |
| Gate       | [Авторизация](../security/authorization.md)     |
| Grpc       | [Grpc](../the-basics/grpc.md)                           |
| Hash       | [Хеширование](../security/hashing.md)                           |
| Log        | [Логирование](../the-basics/logging.md)                         |
| Mail       | [Почта](../digging-deeper/mail.md)           |
| Orm        | [ORM](../orm/getting-started.md)                        |
| Queue      | [Очереди](../digging-deeper/queues.md)                    |
| RateLimiter      | [Ограничение скорости](../the-basics/routing.md)                       |
| Route      | [Маршрутизация](../the-basics/routing.md)                       |
| Schedule   | [Планировщик](../digging-deeper/task-scheduling.md)        |
| Storage    | [Хранилище](../digging-deeper/task-scheduling.md)        |
| Validation | [Валидация](../digging-deeper/task-scheduling.md)        |

<CommentService/>