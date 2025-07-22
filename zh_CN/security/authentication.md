# 用户认证

[[toc]]

## 简介

用户认证是 Web 应用中不可或缺的功能，Goravel 的 `facades.Auth()` 模块提供 JWT 和 Session 驱动的支持，并且可以根据自己需要自定义驱动。

## 配置

可以在 `config/auth.go` 文件中配置默认守卫与多个守卫，以便在应用中进行不同用户身份的切换。

可以在 `config/jwt.go` 文件中配置 JWT 的相关参数，如秘钥、有效时长、可刷新时长等。

### 不同 JWT Guard 支持不同配置

你可以通过在 `config/auth.go` 文件中为每个 Guard 单独设置 TTL、 Secret 和 RefreshTTL，如果不设置，则默认使用 `jwt.ttl` 等配置。

```go
// config/auth.go
"guards": map[string]any{
  "user": map[string]any{
    "driver": "jwt",
++    "ttl": 60,
++    "refresh_ttl": 0,
++    "secret": "your-secret",
  },
},
```

## 生成 JWT Token

```shell
go run . artisan jwt:secret
```

## 根据用户生成 Token

可以根据模型来生成 Token，如果模型使用了 `orm.Model` 则无需额外配置，否则，在模型主键字段上需要配置 Tag，例如：

```go
type User struct {
  ID uint `gorm:"primaryKey"`
  Name string
}

var user models.User
user.ID = 1

token, err := facades.Auth(ctx).Login(&user)
```

## 根据用户 ID 生成 Token

```go
token, err := facades.Auth(ctx).LoginUsingID(1)
```

## 解析 Token

```go
payload, err := facades.Auth(ctx).Parse(token)
```

可以通过 `payload` 获取：

1. `Guard`: 当前 Guard；
2. `Key`: 用户标识；
3. `ExpireAt`: 过期时间；
4. `IssuedAt`: 发行时间；

> 当 `err` 为非 `ErrorTokenExpired` 的错误时，payload == nil

可以通过 `err` 来判断 `Token` 是否过期：

```go
"errors"
"github.com/goravel/framework/auth"

errors.Is(err, auth.ErrorTokenExpired)
```

> Token 带不带 Bearer 前缀均可正常解析。

## 获取用户

获取用户前需要先调用 `Parse` 解析 Token，这个过程可以在 HTTP 中间件中处理。

```go
var user models.User
err := facades.Auth(ctx).User(&user) // 必须是指针
id, err := facades.Auth(ctx).ID()
```

## 刷新 Token

刷新 Token 前需要先调用 `Parse` 解析 Token。

```go
token, err := facades.Auth(ctx).Refresh()
```

## 登出

```go
err := facades.Auth(ctx).Logout()
```

## 多用户授权

```go
token, err := facades.Auth(ctx).Guard("admin").LoginUsingID(1)
err := facades.Auth(ctx).Guard("admin").Parse(token)
token, err := facades.Auth(ctx).Guard("admin").User(&user)
```

> 当不使用默认授权时，在调用上述方法时都需要前置调用 `Guard` 方法。

## 自定义驱动

### 添加自定义 Guard

你可以使用 `facades.Auth().Extend()` 方法定义你自己的身份验证看守器，该方法可以在 `AuthServiceProvider` 的 `Boot` 方法中调用。

```go
import "github.com/goravel/framework/contracts/auth"

func (receiver *AuthServiceProvider) Boot(app foundation.Application) {
  facades.Auth().Extend("custom-driver", func(ctx http.Context, name string, userProvider auth.UserProvider) (auth.GuardDriver, error) {
    return &CustomGuard{}, nil
  })
}
```

定义自定义看守器后，你可以在 `auth.go` 配置文件的 `guards` 配置中引用该看守器：

```go
"guards": map[string]any{
  "api": map[string]any{
    "driver": "custom-driver",
    "provider": "users",
  },
},
```

### 添加自定义 UserProvider

你可以使用 `facades.Auth().Provider()` 方法定义你自己的用户提供者，该方法也可以在 `AuthServiceProvider` 的 `Boot` 方法中调用。

```go
import "github.com/goravel/framework/contracts/auth"

facades.Auth().Provider("custom-provider", func(ctx http.Context) (auth.UserProvider, error) {
  return &UserProvider{}, nil
})
```

使用 `Provider` 方法注册提供器后，你可以在 `auth.go` 配置文件中使用自定义的用户提供器。 首先，定义一个使用新驱动程序的 `provider`:

```go
"providers": map[string]any{
  "users": map[string]any{
    "driver": "custom-provider",
  },
},
```

最后，你可以在 `guards` 配置中引用此提供器：

```go
"guards": map[string]any{
  "api": map[string]any{
    "driver": "custom-provider",
    "provider": "users",
  },
},
```
