# Authentication

[[toc]]

## Introdution

Authentication is an indispensable feature in Web Applications, the `facades.Auth()` module of Goravel provides support for JWT.

## Configration

You can configure default guard and multiple guards in the `config/auth.go` file to switch different user identities in the application.

You can configure parameters of JWT in the `config/jwt.go` file, such as `secret`, `ttl`, `refresh_ttl`.

## Generate JWT Token

```
go run . artisan jwt:secret
```

## Generate Token Using User

You can generate Token by Model, there is no extra configuration if the model use `orm.Model`, otherwise, you need to configure Tag on the model permary key filed, for example:

```go
type User struct {
  ID uint `gorm:"primaryKey"`
  Name string
}

var user User
user.ID = 1

token, err := facades.Auth().Login(ctx, &user)
```

## Generate Token Using ID

```go
token, err := facades.Auth().LoginUsingID(ctx, 1)
```

## Parse Token

```go
payload, err := facades.Auth().Parse(ctx, token)
```

Through `payload` you can get:

1. `Guard`: Current Guard;
2. `Key`: User flag;
3. `ExpireAt`: Expire time;
4. `IssuedAt`: Issued time;

> When `err` isn't nil other than `ErrorTokenExpired`, payload == nil

You can judge whether the Token is expired by err:

```go
"errors"
"github.com/goravel/framework/auth"

errors.Is(err, auth.ErrorTokenExpired)
```

> Token can be parsed normally with or without Bearer prefix.

## Get User

You need to generate Token by `Parse` before getting user, the process can be handled in HTTP middleware.

```go
var user models.User
err := facades.Auth().User(ctx, &user)// Must point
```

## Refrech Token

You need to generate Token by `Parse` before refreshing user.

```go
token, err := facades.Auth().Refresh(ctx)
```

## Logout

```go
err := facades.Auth().Logout(ctx)
```

## Multiple Guards

```go
token, err := facades.Auth().Guard("admin").LoginUsingID(ctx, 1)
err := facades.Auth().Guard("admin").Parse(ctx, token)
token, err := facades.Auth().Guard("admin").User(ctx, &user)
```

> When don't use default guard, the `Guard` method needs to be called beforehand when calling the above methods.

<CommentService/>