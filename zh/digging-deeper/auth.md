# 用户认证

[[toc]]

## 介绍

用户认证是 Web 应用中不可或缺的功能，Goravel 的 `facades.Auth` 模块提供 JWT 功能的支持。

## 配置

可以在 `config/auth.go` 文件中配置默认守卫与多个守卫，以便在应用中进行不同用户身份的切换。

可以在 `config/jwt.go` 文件中配置 JWT 的相关参数，如秘钥、有效时长、可刷新时长等。

## 根据用户生成 Token

可以根据模型来生成 Token，如果模型使用了 `orm.Model` 则无需额外配置，否则，在模型主键字段上需要配置 Tag，例如：`ID uint `gorm:"primaryKey"``。

```go
var user models.User
user.ID = 1

token, err := facades.Auth.Login(ctx, &user)
```

## 根据用户 ID 生成 Token

```go
token, err := facades.Auth.LoginUsingID(ctx, 1)
```

## 解析 Token

```go
err := facades.Auth.Parse(ctx, token)
```

可以通过 err 来判断 Token 是否过期：

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
err := facades.Auth.User(ctx, &user)// 必须是指针
```

## 刷新 Token

刷新 Token 前需要先调用 `Parse` 解析 Token。

```go
token, err := facades.Auth.Refresh(ctx)
```

## 登出

```go
err := facades.Auth.Logout(ctx)
```

## 多用户授权

```go
token, err := facades.Auth.Guard("admin").LoginUsingID(ctx1)
err := facades.Auth.Guard("admin").Parse(ctx, token)
token, err := facades.Auth.Guard("admin").User(ctx, &user)
```

> 当不使用默认授权时，在调用上述方法时都需要前置调用 `Guard` 方法。
