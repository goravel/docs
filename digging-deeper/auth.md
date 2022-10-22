# Authentication

[[toc]]

## Introdution

Authentication is an indispensable feature in Web Applications, the `facades.Auth` module of Goravel provides support for JWT.

## Configration

You can configure default guard and multiple guards in the `config/auth.go` file to switch different user identities in the application.

You can configure parameters of JWT in the `config/jwt.go` file, such as `secret`, `ttl`, `refresh_ttl`.

## Generate Token Using User

You can generate Token by Model, there is no extra configuration if the model use `orm.Model`, otherwise, you need to configure Tag on the model permary key filed, for example:

```go
type User struct {
  ID uint `gorm:"primaryKey"`
  Name string
}
```

```go
var user models.User
user.ID = 1

token, err := facades.Auth.User(&user)
```

## Generate Token Using ID

```go
token, err := facades.Auth.LoginUsingID(1)
```

## Parse Token

```go
err := facades.Auth.Parse(token)
```

You can judge whether the Token is expired by err:

```go
"errors"
"github.com/goravel/framework/auth"

errros.Is(err, auth.ErrorTokenExpired)
```

> Token can be parsed normally with or without Bearer prefix.

## Get User

You need to generate Token by `Parse` before getting user, the process can be handled in HTTP middleware.

```go
var user models.User
err := facades.Auth.User(&user)// Must point
```

## Refrech Token

You need to generate Token by `Parse` before refreshing user.

```go
token, err := facades.Auth.Refresh()
```

## Logout

```go
err := facades.Auth.Logout()
```

## Multiple Guards

```go
token, err := facades.Auth.Guard("admin").LoginUsingID(1)
err := facades.Auth.Guard("admin").Parse(token)
token, err := facades.Auth.Guard("admin").User(&user)
```

> When don't use default guard, the `Guard` method needs to be called beforehand when calling the above methods.
