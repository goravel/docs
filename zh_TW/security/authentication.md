# 認證

[[toc]]

## 概述

認證是Web應用中不可或缺的功能，Goravel的 `facades.Auth()` 模塊提供對JWT和Session驅動的支持，並且您可以自定義驅動和用戶提供者。

## 配置

您可以在 `config/auth.go` 文件中配置 `defaults` 保護和多個 `guards` 以便在應用中切換不同的用戶身份。

您可以在 `config/jwt.go` 文件中配置JWT的相關參數，如 `secret`、`ttl`、`refresh_ttl`。

### 不同 JWT Guard 支持不同配置

您可以在 `config/auth.go` 文件中為每個Guard單獨設置TTL、Secret和RefreshTTL，如果未設置，則默認使用 `jwt.ttl` 配置。

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

## 生成JWT Token

```shell
go run . artisan jwt:secret
```

## 根據用戶生成Token

您可以通過模型生成Token，如果模型使用 `orm.Model`，則無需額外配置，否則，您需要在模型主鍵字段上配置Tag，例如：

```go
type User struct {
  ID uint `gorm:"primaryKey"`
  Name string
}

var user models.User
user.ID = 1

token, err := facades.Auth(ctx).Login(&user) 
```

## 根據用戶ID生成Token

```go
token, err := facades.Auth(ctx).LoginUsingID(1)
```

## 解析Token

```go
payload, err := facades.Auth(ctx).Parse(token)
```

您可以通過 `payload` 獲取：

1. `Guard`: 當前 Guard；
2. `Key`: 用戶標識；
3. `ExpireAt`: 過期時間；
4. `IssuedAt`: 發行時間；

> 如果 `err` 不是 `ErrorTokenExpired`，則payload應為nil。

您可以通過err來判斷Token是否過期：

```go
"errors"
"github.com/goravel/framework/auth"

errors.Is(err, auth.ErrorTokenExpired)
```

> Token無論是否帶有Bearer前綴都可以正常解析。

## 獲取用戶

在獲取用戶之前，您需要通過 `Parse` 生成Token，這個過程可以在HTTP中間件中處理。

```go
var user models.User
err := facades.Auth(ctx).User(&user) // 必須是指針
id, err := facades.Auth(ctx).ID()
```

## 刷新Token

刷新用戶前，您需要先調用 `Parse` 解析Token。

```go
token, err := facades.Auth(ctx).Refresh()
```

## 登出

```go
err := facades.Auth(ctx).Logout()
```

## 多個Guard

```go
token, err := facades.Auth(ctx).Guard("admin").LoginUsingID(1)
err := facades.Auth(ctx).Guard("admin").Parse(token)
token, err := facades.Auth(ctx).Guard("admin").User(&user)
```

> 當不使用默認Guard時，在調用上述方法之前必須調用 `Guard` 方法。

## 自定義驅動

### 添加自定義Guard

您可以使用 `facades.Auth().Extend()` 方法來定義自己的身份驗證Guard，這個方法可以在 `AuthServiceProvider` 的 `Boot` 方法中呼叫。

```go
import "github.com/goravel/framework/contracts/auth"

func (receiver *AuthServiceProvider) Boot(app foundation.Application) {
  facades.Auth().Extend("custom-driver", func(ctx http.Context, name string, userProvider auth.UserProvider) (auth.GuardDriver, error) {
    return &CustomGuard{}, nil
  })
} 
```

定義自定義Guard後，您可以在 `auth.go` 配置文件的 `guards` 配置中引用該Guard：

```go
"guards": map[string]any{
  "api": map[string]any{
    "driver": "custom-driver",
    "provider": "users",
  },
},
```

### 添加自定義UserProvider

您可以使用 `facades.Auth().Provider()` 方法來定義自己的用戶提供者，這個方法也可以在 `AuthServiceProvider` 的 `Boot` 方法中呼叫。

```go
import "github.com/goravel/framework/contracts/auth"

facades.Auth().Provider("custom-provider", func(ctx http.Context) (auth.UserProvider, error) {
  return &UserProvider{}, nil
})
```

在使用 `Provider` 方法註冊提供者後，您可以在 `auth.go` 配置文件中使用自定義的用戶提供者。 首先，定義一個使用新驅動的 `provider`： 首先，定義一個使用新驅動的 `provider`：

```go
"providers": map[string]any{
  "users": map[string]any{
    "driver": "custom-provider",
  },
},
```

最後，您可以在 `guards` 配置中引用此提供者：

```go
"guards": map[string]any{
  "api": map[string]any{
    "driver": "custom-provider",
    "provider": "users",
  },
},
```
