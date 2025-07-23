# Facades

[[toc]]

## Introduction

`facades` provide a "static" interface for the core functionality of the application and provide a more flexible, more
elegant, and easy-to-test syntax.

All `facades` of Goravel are defined under `github.com/goravel/framework/facades`. We can easily use `facades`:

```go
import "github.com/goravel/framework/facades"

facades.Route().Run(facades.Config().GetString("app.host"))
```

## How Facades Work

`facades` are generally instantiated in the `Register` or `Boot` stage of each module `ServerProvider`.

```go
func (config *ServiceProvider) Register() {
  app := Application{}
  facades.Config = app.Init()
}
```

If the `facades` use other `facades`, then instantiate them in the `Boot` phase of the `ServerProvider`:

```go
func (database *ServiceProvider) Boot() {
  app := Application{}
  facades.DB = app.Init()
}
```

## Facade Class Reference

| Facade      | Document                                     |
| ----------- | -------------------------------------------- |
| App         | [Container](../foundation/container)         |
| Artisan     | [Command Console](../advanced/artisan)       |
| Auth        | [Authentication](../security/authentication) |
| Cache       | [Cache](../advanced/cache)                   |
| Config      | [Configuration](../quickstart/configuration) |
| Crypt       | [Encryption](../security/encryption)         |
| Event       | [Event](../advanced/events)                  |
| Gate        | [Authorization](../security/authorization)   |
| Grpc        | [Grpc](../basic/grpc)                        |
| Hash        | [Hashing](../security/hashing)               |
| Log         | [Log](../basic/logging)                      |
| Mail        | [Mail](../advanced/mail)                     |
| Orm         | [ORM](../orm/getting-started)                |
| Queue       | [Queue](../advanced/queues)                  |
| RateLimiter | [RateLimiter](../basic/routing)              |
| Route       | [Route](../basic/routing)                    |
| Seeder      | [Seeder](../orm/seeding)                     |
| Schedule    | [Schedule](../advanced/schedule)             |
| Storage     | [Storage](../advanced/schedule)              |
| Testing     | [Testing](../testing/getting-started)        |
| Validation  | [Validation](../advanced/schedule)           |
