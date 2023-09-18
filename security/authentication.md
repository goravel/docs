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

You can generate a Token by Model, there is no extra configuration if the model uses `orm.Model`, otherwise, you need to configure Tag on the model primary key field, for example:

```go
type User struct {
  ID uint `gorm:"primaryKey"`
  Name string
}

var user models.User
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

> If the value of err is anything other than ErrorTokenExpired, then the payload should be nil.

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
err := facades.Auth().User(ctx, &user) // Must point
```

## Refresh Token

You need to generate a Token by `Parse` before refreshing the user.

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

> When the default guard is not used, the Guard method must be called before calling the above methods.

<CommentService/>
