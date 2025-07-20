# Authentication

[[toc]]

## Introduction

Authentication is an indispensable feature in Web Applications, the `facades.Auth()` module of Goravel provides support for JWT and Session drivers, and you can customize the driver and user provider.

## Configuration

You can configure `defaults` guard and multiple `guards` in the `config/auth.go` file to switch different user identities in the application.

You can configure the parameters of JWT in the `config/jwt.go` file, such as `secret`, `ttl`, `refresh_ttl`.

### Different JWT Guard supports different configurations

You can set TTL, Secret and RefreshTTL for each Guard separately in the `config/auth.go` file, if not set, the `jwt.ttl` configuration is used by default.

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

## Generate JWT Token

```shell
go run . artisan jwt:secret
```

## Generate Token Using User

You can generate a token by Model, there is no extra configuration if the model uses `orm.Model`, otherwise, you need to configure Tag on the model primary key field, for example:

```go
type User struct {
  ID uint `gorm:"primaryKey"`
  Name string
}

var user models.User
user.ID = 1

token, err := facades.Auth(ctx).Login(&user)
```

## Generate Token Using ID

```go
token, err := facades.Auth(ctx).LoginUsingID(1)
```

## Parse Token

```go
payload, err := facades.Auth(ctx).Parse(token)
```

Through `payload` you can get:

1. `Guard`: Current Guard;
2. `Key`: User flag;
3. `ExpireAt`: Expire time;
4. `IssuedAt`: Issued time;

> If `err` isn't nil other than `ErrorTokenExpired`, the payload should be nil.

You can judge whether the Token is expired by err:

```go
"errors"
"github.com/goravel/framework/auth"

errors.Is(err, auth.ErrorTokenExpired)
```

> The token can be parsed normally with or without the Bearer prefix.

## Get User

You need to generate a Token by `Parse` before getting a user, the process can be handled in HTTP middleware.

```go
var user models.User
err := facades.Auth(ctx).User(&user) // Must point
id, err := facades.Auth(ctx).ID()
```

## Refresh Token

You need to generate a Token by `Parse` before refreshing the user.

```go
token, err := facades.Auth(ctx).Refresh()
```

## Logout

```go
err := facades.Auth(ctx).Logout()
```

## Multiple Guards

```go
token, err := facades.Auth(ctx).Guard("admin").LoginUsingID(1)
err := facades.Auth(ctx).Guard("admin").Parse(token)
token, err := facades.Auth(ctx).Guard("admin").User(&user)
```

> When the default guard is not used, the `Guard` method must be called before calling the above methods.

## Custom Driver

### Add Custom Guard

You can use the `facades.Auth().Extend()` method to define your own authentication guard, this method can be called in the `Boot` method of `AuthServiceProvider`.

```go
import "github.com/goravel/framework/contracts/auth"

func (receiver *AuthServiceProvider) Boot(app foundation.Application) {
  facades.Auth().Extend("custom-driver", func(ctx http.Context, name string, userProvider auth.UserProvider) (auth.GuardDriver, error) {
    return &CustomGuard{}, nil
  })
}
```

After defining the custom guard, you can reference it in the `guards` configuration of the `auth.go` file:

```go
"guards": map[string]any{
  "api": map[string]any{
    "driver": "custom-driver",
    "provider": "users",
  },
},
```

### Add Custom UserProvider

You can use the `facades.Auth().Provider()` method to define your own user provider, this method can also be called in the `Boot` method of `AuthServiceProvider`.

```go
import "github.com/goravel/framework/contracts/auth"

facades.Auth().Provider("custom-provider", func(ctx http.Context) (auth.UserProvider, error) {
  return &UserProvider{}, nil
})
```

After using the `Provider` method to register the provider, you can use the custom user provider in the `auth.go` configuration file. First, define a `provider` that uses the new driver:

```go
"providers": map[string]any{
  "users": map[string]any{
    "driver": "custom-provider",
  },
},
```

Finally, you can reference this provider in the `guards` configuration:

```go
"guards": map[string]any{
  "api": map[string]any{
    "driver": "custom-provider",
    "provider": "users",
  },
},
```

<CommentService/>
