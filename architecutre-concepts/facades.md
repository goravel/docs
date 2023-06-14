# Facades

[[toc]]

## Introduction

`facades` provide a "static" interface for the core functionality of the application and provide a more flexible, more elegant, and easy-to-test syntax.

All `facades` of Goravel are defined under `github.com/goravel/framework/facades`. We can easily use `facades`:

```
import "github.com/goravel/framework/facades"

facades.Route.Run(facades.Config.GetString("app.host"))
```

## How Facades Work

`facades` are generally instantiated in the `Register` or `Boot` stage of each module `ServerProvider`.

```
func (config *ServiceProvider) Register() {
  app := Application{}
  facades.Config = app.Init()
}
```

If the `facades` use other `facades`, then instantiate them in the `Boot` phase of the `ServerProvider`:

```
func (database *ServiceProvider) Boot() {
  app := Application{}
  facades.DB = app.Init()
}
```

## Facade Class Reference

| Facade     | Document                                                |
| --------   | ------------------------------------------------------- |
| App        | [Container](../architecutre-concepts/service-container.md) |
| Artisan    | [Command Console](../digging-deeper/artisan-console.md) |
| Auth       | [Authentication](../security/authentication.md)   |
| Cache      | [Cache](../digging-deeper/cache.md)                     |
| Config     | [Configuration](../getting-started/configuration.md)    |
| Crypt      | [Encryption](../security/encryption.md)    |
| Event      | [Event](../digging-deeper/event.md)                     |
| Gate       | [Authorization](../security/authorization.md)     |
| Grpc       | [Grpc](../the-basics/grpc.md)                           |
| Hash       | [Hashing](../security/hashing.md)                           |
| Mail       | [Mail](../digging-deeper/mail.md)           |
| Orm        | [ORM](../orm/getting-started.md)                        |
| Hash       | [Hash](../security/hashing.md)           |
| Log        | [Log](../the-basics/logging.md)                         |
| Queue      | [Queue](../digging-deeper/queues.md)                    |
| Route      | [Route](../the-basics/routing.md)                       |
| Schedule   | [Schedule](../digging-deeper/task-scheduling.md)        |
| Storage    | [Storage](../digging-deeper/task-scheduling.md)        |
| Validation | [Validation](../digging-deeper/task-scheduling.md)        |

<CommentService/>