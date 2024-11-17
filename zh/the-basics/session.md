# Session

[[toc]]

## 简介

Session 使你可以在多个请求之间存储用户信息，为本质上无状态的 HTTP 协议提供有状态的体验。这些用户信息在服务器端持久存储。Goravel 提供了一个统一的接口，用于与各种持久存储驱动进行交互。

## Configuration

`session` 配置文件位于 `config/session.go`。默认驱动是 `file`，它会把 `session` 存储在 `storage/framework/sessions` 目录中。Goravel 允许你通过实现 `contracts/session/driver` 接口来创建自定义 `session` 驱动。

### 注册 Middleware

Goravel 默认情况下未启动 `Session` 功能，但是框架提供了用于启动会话的中间件。你可以在 `app/http/kernel.go` 文件中注册 `Session` 中间件，以将其应用于所有路由，或者将其添加到特定路由中：

```go
import (
  "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/session/middleware"
)

func (kernel Kernel) Middleware() []http.Middleware {
  return []http.Middleware{
    middleware.StartSession(),
  }
}
```

## 使用 Session

### 获取数据

你可以使用 `Get` 方法从 `Session` 中检索数据。如果值不存在，则返回 `nil`。

```go
value := ctx.Request().Session().Get("key")
```

你还可以将默认值作为第二个参数传递给 `Get` 方法。如果会话中不存在指定的键，则返回该值：

```go
value := ctx.Request().Session().Get("key", "default")
```

### 获取所有数据

如果你想从会话中检索所有数据，可以使用 `All` 方法：

```go
data := ctx.Request().Session().All()
```

### 获取数据子集

如果你想检索会话数据某些字段，可以使用 `Only` 方法：

```go
data := ctx.Request().Session().Only([]string{"username", "email"})
```

### 确定会话中是否存在项目

确定会话中是否存在项目，你可以使用 `Has` 方法。如果项目存在且不为 `nil`，则 `Has` 方法返回 `true`：

```go
if ctx.Request().Session().Has("user") {
    //
}
```

确定项目是否存在，即使它是 `nil`，你可以使用 `Exists` 方法：

```go
if ctx.Request().Session().Exists("user") {
    //
}
```

确定项目是否不存在于会话中，你可以使用 `Missing` 方法：

```go
if ctx.Request().Session().Missing("user") {
    //
}
```

### 存储数据

你可以使用 `Put` 方法将数据存储在会话中：

```go
ctx.Request().Session().Put("key", "value")
```

### 检索并删除数据

如果你想从会话中检索项目，然后删除它，可以使用 `Pull` 方法：

```go
value := ctx.Request().Session().Pull("key")
```

### 删除数据

`Forget` 方法可用于从会话中删除数据。如果你想从会话中删除所有数据，可以使用 `Flush` 方法：

```go
ctx.Request().Session().Forget("username", "email")

ctx.Request().Session().Flush()
```

### 重新生成会话 ID

重新生成会话 ID 通常是为了防止恶意用户利用会话固定攻击来利用你的应用程序。你可以使用 `Regenerate` 方法重新生成会话 ID：

```go
ctx.Request().Session().Regenerate()
```

如果你想重新生成会话 ID 并忘记会话中的所有数据，可以使用 `Invalidate` 方法：

```go
ctx.Request().Session().Invalidate()
```

然后需要保存新的 session 到 cookie 中：

```go
ctx.Response().Cookie(http.Cookie{
  Name:     ctx.Request().Session().GetName(),
  Value:    ctx.Request().Session().GetID(),
  MaxAge:   facades.Config().GetInt("session.lifetime") * 60,
  Path:     facades.Config().GetString("session.path"),
  Domain:   facades.Config().GetString("session.domain"),
  Secure:   facades.Config().GetBool("session.secure"),
  HttpOnly: facades.Config().GetBool("session.http_only"),
  SameSite: facades.Config().GetString("session.same_site"),
})
```

### 闪存数据

闪存数据一种仅在随后的 HTTP 请求中可用的数据，请求结束后将被删除。闪存数据对于存储临时消息（如状态消息）非常有用。你可以使用 `Flash` 方法将闪存数据存储在会话中：

```go
ctx.Request().Session().Flash("status", "Task was successful!")
```

如果你希望保留闪存数据以供额外请求使用，可以使用 `Reflash` 方法：

```go
ctx.Request().Session().Reflash()
```

如果你希望保留特定的闪存数据以供立即使用，可以使用 `Keep` 方法：

```go
ctx.Request().Session().Keep("status", "username")
```

If you would like to keep specific data around for immediate use, you may use the `Now` method:

如果你希望保留特定数据以供立即使用，可以使用 `Now` 方法：

```go
ctx.Request().Session().Now("status", "Task was successful!")
```

## 会话管理器

### 构建自定义会话

使用 `Session` 门面构建自定义会话。`Session` 门面提供了 `BuildSession` 方法，它接受一个驱动实例和一个可选的会话 ID，如果你想指定自定义会话 ID：

```go
import "github.com/goravel/framework/facades"

session := facades.Session().BuildSession(driver, "sessionID")
```

### 添加自定义会话驱动

#### 实现驱动

要实现自定义会话驱动，驱动必须实现 `contracts/session/driver` 接口。

```go
// Driver is the interface for Session handlers.
type Driver interface {
  // Close closes the session handler.
  Close() error
  // Destroy destroys the session with the given ID.
  Destroy(id string) error
  // Gc performs garbage collection on the session handler with the given maximum lifetime.
  Gc(maxLifetime int) error
  // Open opens a session with the given path and name.
  Open(path string, name string) error
  // Read reads the session data associated with the given ID.
  Read(id string) (string, error)
  // Write writes the session data associated with the given ID.
  Write(id string, data string) error
}
```

#### 注册驱动

实现驱动后，你需要在 Goravel 中注册它。你可以在 `app/providers/app_service_provider.go` 的 `boot` 方法中调用 `Extend` 方法：

```go
import "github.com/goravel/framework/contracts/session"

facades.Session().Extend("redis", func() session.Driver {
  return &RedisDriver{}
})
```

注册了驱动程序以后，你可以通过将会话配置文件中的 `driver` 选项设置为 `redis` 或将 `SESSION_DRIVER` 环境变量设置为 `redis` 来使用它。

### 获取驱动实例

使用 `Driver` 方法从会话管理器中检索驱动实例。它接受一个可选的驱动名称，如果未提供，则返回默认驱动实例：

```go
driver, err := facades.Session().Driver("file")
```

### 开始新会话

```go
session := facades.Session().BuildSession(driver)
session.Start()
```

### 保存会话数据

```go
session := facades.Session().BuildSession(driver)
session.Start()
session.Save()
```

### 将会话附加到请求

```go
session := facades.Session().BuildSession(driver)
session.Start()
ctx.Request().SetSession(session)
```

### 检查请求是否有会话

```go
if ctx.Request().HasSession() {
    //
}
```

<CommentService/>
