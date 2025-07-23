# Facades

[[toc]]

## 简介

`facades` 为应用程序的核心功能提供了一个"静态"接口，并提供了更灵活、更优雅且易于测试的语法。

Goravel 的所有 `facades` 都定义在 `github.com/goravel/framework/facades` 下。 我们可以轻松使用 `facades`： We can easily use `facades`:

```go
import "github.com/goravel/framework/facades"

facades.Route().Run(facades.Config().GetString("app.host"))
```

## 外观如何工作

`facades` 通常在每个模块 `ServerProvider` 的 `Register` 或 `Boot` 阶段实例化。

```go
func (config *ServiceProvider) Register() {
  app := Application{}
  facades.Config = app.Init()
}
```

如果 `facades` 使用其他 `facades`，则在 `ServerProvider` 的 `Boot` 阶段实例化它们：

```go
func (database *ServiceProvider) Boot() {
  app := Application{}
  facades.DB = app.Init()
}
```

## Facade 类参考

| Facade      | 文档                                |
| ----------- | --------------------------------- |
| App         | [容器](../foundation/container)     |
| Artisan     | [命令行控制台](../advanced/artisan)     |
| Auth        | [认证](../security/authentication)  |
| Cache       | [缓存](../advanced/cache)           |
| Config      | [配置](../quickstart/configuration) |
| Crypt       | [加密](../security/encryption)      |
| Event       | [事件](../advanced/events)          |
| Gate        | [授权](../security/authorization)   |
| Grpc        | [Grpc](../basic/grpc)             |
| Hash        | [哈希](../security/hashing)         |
| Log         | [日志](../basic/logging)            |
| Mail        | [邮件](../advanced/mail)            |
| Orm         | [ORM](../orm/getting-started)     |
| Queue       | [队列](../advanced/queues)          |
| RateLimiter | [速率限制器](../basic/routing)         |
| Route       | [路由](../basic/routing)            |
| Seeder      | [种子](../orm/seeding)              |
| Schedule    | [调度](../advanced/schedule)        |
| Storage     | [存储](../advanced/schedule)        |
| Testing     | [测试](../testing/getting-started)  |
| Validation  | [验证](../advanced/schedule)        |
