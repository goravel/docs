# 外觀

[[toc]]

## 概述

`facades` 為應用的核心功能提供一個「靜態」接口，能夠提供更加靈活、更加優雅、易於測試的語法。

Goravel 所有的 `facades` 都定義在 `github.com/goravel/framework/facades` 下。 我們可以很輕鬆的使用 `facades`： 我們可以輕鬆使用 `facades`：

```go
import "github.com/goravel/framework/facades"

facades.Route().Run(facades.Config().GetString("app.host"))
```

## 外觀的工作原理

`facades` 一般會在各模組 `ServerProvider` 的 `Register` 或 `Boot` 階段進行實例化。

```go
func (config *ServiceProvider) Register() {
  app := Application{}
  facades.Config = app.Init()
}
```

如果該 `facades` 使用了其他 `facades`，那麼就在 `ServerProvider` 的 `Boot` 階段進行實例化：

```go
func (database *ServiceProvider) Boot() {
  app := Application{}
  facades.DB = app.Init()
}
```

## 外觀類參考

| 外觀     | 使用文檔                                                |
| ------ | --------------------------------------------------- |
| 應用程序   | [容器](../architecture-concepts/service-container.md) |
| 藝術家    | [命令行工具](../digging-deeper/artisan-console.md)       |
| 身份驗證   | [用戶認證](../security/authentication.md)               |
| 快取     | [快取系統](../digging-deeper/cache.md)                  |
| 配置     | [配置信息](../getting-started/configuration.md)         |
| 加密     | [加密解密](../security/encryption.md)                   |
| 事件     | [事件系統](../digging-deeper/event.md)                  |
| 門      | [用戶授權](../security/authorization.md)                |
| Grpc   | [Grpc](../the-basics/grpc.md)                       |
| 雜湊     | [哈希](../security/hashing.md)                        |
| 日誌     | [日誌](../the-basics/logging.md)                      |
| 郵件     | [郵件](../digging-deeper/mail.md)                     |
| Orm    | [ORM](../orm/getting-started.md)                    |
| 隊列     | [隊列](../digging-deeper/queues.md)                   |
| 速率限制器  | [速率限制器](../the-basics/routing.md)                   |
| Route  | [路由](../the-basics/routing.md)                      |
| Seeder | [數據填充](../database/seeding.md)                      |
| 排程     | [任務調度](../digging-deeper/task-scheduling.md)        |
| 儲存     | [文件系統](../digging-deeper/task-scheduling.md)        |
| 集成測試   | [測試](../testing/getting-started.md)                 |
| 驗證     | [表單驗證](../the-basics/validation.md)                 |
