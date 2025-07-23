# 会话

[[toc]]

## 简介

Session enables you to store user information across multiple requests, providing a stateful experience within the inherently stateless HTTP protocol. This user information is stored persistently on the server side. 会话使您能够在多个请求中存储用户信息，在本质上无状态的HTTP协议中提供有状态的体验。 这些用户信息被持久地存储在服务器端。 Goravel提供了一个统一的接口来与各种持久存储驱动程序交互。

## 配置

The `session` configuration file is located at `config/session.go`. The default driver is `file`, which stores sessions in the `storage/framework/sessions` directory. `session` 配置文件位于 `config/session.go`。默认驱动是 `file`，它会把 `session` 存储在 `storage/framework/sessions` 目录中。Goravel 允许你通过实现 `contracts/session/driver` 接口来创建自定义 `session` 驱动。

### 注册中间件

默认情况下，Goravel不会自动启动会话。 然而，它提供了启动会话的中间件。 你可以在 `app/http/kernel.go` 文件中注册会话中间件以将其应用于所有路由，或者将其添加到特定路由： However, it provides middleware to start a session. You can register the session middleware in the `app/http/kernel.go` file to apply it to all routes, or you can add it to specific routes:

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

## 与会话交互

### 检索数据

你可以使用 `Get` 方法从会话中检索数据。 如果该值不存在，将返回 `nil`。 If the value does not exist, `nil` will be returned.

```go
value := ctx.Request().Session().Get("key")
```

你也可以将默认值作为第二个参数传递给 `Get` 方法。 如果指定的键在会话中不存在，将返回这个值： This value will be returned if the specified key does not exist in the session:

```go
value := ctx.Request().Session().Get("key", "default")
```

### 检索所有数据

如果您想检索会话中的所有数据，可以使用 `All` 方法：

```go
data := ctx.Request().Session().All()
```

### 检索数据子集

如果您想检索会话数据的子集，可以使用 `Only` 方法：

```go
data := ctx.Request().Session().Only([]string{"username", "email"})
```

### 判断会话中是否存在某项

To determine if an item is present in the session, you may use the `Has` method. 要判断会话中是否存在某项，可以使用 `Has` 方法。 如果该项存在且不为 `nil`，`Has` 方法将返回 `true`：

```go
if ctx.Request().Session().Has("user") {
    //
}
```

要判断某项是否存在，即使它是 `nil`，您可以使用 `Exists` 方法：

```go
if ctx.Request().Session().Exists("user") {
    //
}
```

要确定会话中是否不存在某个项目，你可以使用 `Missing` 方法：

```go
if ctx.Request().Session().Missing("user") {
    //
}
```

### 存储数据

你可以使用 `Put` 方法在会话中存储数据：

```go
ctx.Request().Session().Put("key", "value")
```

### 获取和删除数据

如果你想从会话中获取一个项目然后删除它，你可以使用 `Pull` 方法：

```go
value := ctx.Request().Session().Pull("key")
```

### 删除数据

The `Forget` method can be used to remove a piece of data from the session. `Forget` 方法可用于从会话中删除一条数据。 如果你想要从会话中删除所有数据，
可以使用 `Flush` 方法：

```go
ctx.Request().Session().Forget("username", "email")

ctx.Request().Session().Flush()
```

### 重新生成会话 ID

Regenerating the session ID is often done in order to prevent malicious users from exploiting a session fixation attack on your application. 重新生成会话 ID 通常是为了防止恶意用户利用会话固定攻击
来攻击你的应用程序。 你可以使用 `Regenerate` 方法重新生成会话 ID：

```go
ctx.Request().Session().Regenerate()
```

如果你想重新生成会话 ID 并忘记会话中的所有数据，可以使用 `Invalidate`
方法：

```go
ctx.Request().Session().Invalidate()
```

然后，你需要将新会话保存到 cookie 中：

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

闪存数据是只在后续 HTTP 请求期间可用，然后将被删除的会话数据。
闪存数据对于存储临时消息（如状态消息）非常有用。 您可以使用 `Flash` 方法在会话中存储闪存数据： Flash data is useful for storing temporary messages such as status messages. You may use the `Flash` method to store flash data in the session:

```go
ctx.Request().Session().Flash("status", "Task was successful!")
```

如果您想在额外的请求中保留特定的闪存数据，可以使用 `Keep` 方法：

```go
ctx.Request().Session().Reflash()
```

如果您希望闪存数据在额外的请求中保持可用，可以使用 `Reflash` 方法：

```go
ctx.Request().Session().Keep("status", "username")
```

如果您想立即使用特定数据，可以使用 `Now` 方法：

```go
ctx.Request().Session().Now("status", "Task was successful!")
```

## 与会话管理器交互

### 构建自定义会话

Use the `Session` facade to build a custom session. 使用 `Session` 门面来构建自定义会话。 `Session` 门面提供了 `BuildSession` 方法，该方法接受一个驱动实例和一个可选的会话 ID（如果您想指定自定义会话 ID）：

```go
import "github.com/goravel/framework/facades"

session := facades.Session().BuildSession(driver, "sessionID")
```

### 添加自定义会话驱动

#### 实现驱动

要实现自定义会话驱动程序,驱动程序必须实现 `contracts/session/driver` 接口。

```go
// Driver 是 Session 处理程序的接口。
type Driver interface {
  // Close 关闭会话处理程序。
  Close() error
  // Destroy 销毁具有给定 ID 的会话。
  Destroy(id string) error
  // Gc 对具有给定最大生存期的会话处理程序执行垃圾回收。
  Gc(maxLifetime int) error
  // Open 使用给定的路径和名称打开会话。
  Open(path string, name string) error
  // Read 读取与给定 ID 关联的会话数据。
  Read(id string) (string, error)
  // Write 写入与给定 ID 关联的会话数据。
  Write(id string, data string) error
}
```

#### 注册驱动程序

`session`配置文件位于`config/session.go`。 默认驱动程序是`file`，它将会话存储在`storage/framework/sessions`目录中。 Goravel允许您通过实现`contracts/session/driver`接口来创建自定义的`session`驱动程序。

```go
// config/session.go
"default": "new",

"drivers": map[string]any{
  "file": map[string]any{
    "driver": "file",
  },
  "new": map[string]any{
    "driver": "custom",
    "via": func() (session.Driver, error) {
      return &CustomDriver{}, nil
    },
  }
},
```

### 获取驱动程序实例

Use the `Driver` method to retrieve the driver instance from the session manager. 使用 `Driver` 方法从会话管理器中获取驱动程序实例。 它接受一个可选的驱动程序名称，如果未提供，则返回默认驱动程序实例：

```go
driver, err := facades.Session().Driver("file")
```

### 开始一个新会话

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
