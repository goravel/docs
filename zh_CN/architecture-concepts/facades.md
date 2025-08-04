# Facades

[[toc]]

## 简介

`facades` 为应用的核心功能提供一个「静态」接口，能够提供更加灵活、更加优雅、易于测试的语法。

Goravel 所有的 `facades` 都定义在 `github.com/goravel/framework/facades` 下。 我们可以很轻松的使用 `facades`： 我们可以很轻松的使用 `facades`：

```go
import "github.com/goravel/framework/facades"

facades.Route().Run(facades.Config().GetString("app.host"))
```

## facades 工作原理

`facades` 一般会在各模块 `ServerProvider` 的 `Register` 或 `Boot` 阶段进行实例化。

```go
func (config *ServiceProvider) Register() {
  app := Application{}
  facades.Config = app.Init()
}
```

如果该 `facades` 使用了其他 `facades`，那么就在 `ServerProvider` 的 `Boot` 阶段进行实例化：

```go
func (database *ServiceProvider) Boot() {
  app := Application{}
  facades.DB = app.Init()
}
```

## facade 类参考

| Facade      | 文档                                                  |
| ----------- | --------------------------------------------------- |
| App         | [容器](../architecture-concepts/service-container.md) |
| Artisan     | [命令行工具](../digging-deeper/artisan-console.md)       |
| Auth        | [用户认证](../security/authentication.md)               |
| Cache       | [缓存系统](../digging-deeper/cache.md)                  |
| Config      | [配置信息](../getting-started/configuration.md)         |
| Crypt       | [加密解密](../security/encryption.md)                   |
| Event       | [事件系统](../digging-deeper/event.md)                  |
| Gate        | [用户授权](../security/authorization.md)                |
| Grpc        | [Grpc](../the-basics/grpc.md)                       |
| Hash        | [哈希](../security/hashing.md)                        |
| Log         | [日志](../the-basics/logging.md)                      |
| Mail        | [邮件](../digging-deeper/mail.md)                     |
| Orm         | [ORM](../orm/getting-started.md)                    |
| Queue       | [队列](../digging-deeper/queues.md)                   |
| RateLimiter | [限流器](../the-basics/routing.md)                     |
| Route       | [路由](../the-basics/routing.md)                      |
| Seeder      | [数据填充](../database/seeding.md)                      |
| Schedule    | [任务调度](../digging-deeper/task-scheduling.md)        |
| Storage     | [文件系统](../digging-deeper/filesystem.md)             |
| Testing     | [测试](../testing/getting-started.md)                 |
| Validation  | [表单验证](../the-basics/validation.md)                 |
