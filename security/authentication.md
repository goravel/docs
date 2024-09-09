# Authentication

[[toc]]

## Introduction

Authentication is an indispensable feature in Web Applications, the `facades.Auth()` module of Goravel provides support for JWT.

## Configuration

You can configure `defaults` guard and multiple `guards` in the `config/auth.go` file to switch different user identities in the application.

You can configure the parameters of JWT in the `config/jwt.go` file, such as `secret`, `ttl`, `refresh_ttl`.

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
id, err := facades.Auth(ctx).Id()
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

<CommentService/>
