# Auth Facade

## Core Imports

```go
import (
    "context"
    "github.com/goravel/framework/contracts/http"
    contractsauth "github.com/goravel/framework/contracts/auth"
    contractsaccess "github.com/goravel/framework/contracts/auth/access"
    "github.com/goravel/framework/auth/access"  // access.NewAllowResponse(), access.NewDenyResponse()
    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/auth/auth.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/auth/access/gate.go`

## Available Methods

**facades.Auth(ctx):** - takes `http.Context`

- `Check()` bool - logged in?
- `Guest()` bool - not logged in?
- `Login(&user)` (string, error) - generate token
- `LoginUsingID(id)` (string, error)
- `Parse(token)` (\*Payload, error) - **must call before User/ID**
- `User(&dest)` error - populate struct (requires prior Parse)
- `ID()` (string, error) - user ID as string (requires prior Parse)
- `Refresh()` (string, error) - new token (requires prior Parse)
- `Logout()` error
- `Guard(name)` GuardDriver - switch guard
- `Extend(name, GuardFunc)` - register custom guard driver
- `Provider(name, UserProviderFunc)` - register custom user provider

**facades.Gate():**

- `Define(ability, func(ctx context.Context, args map[string]any) Response)`
- `Allows/Denies(ability, args)` bool
- `Inspect(ability, args)` Response
- `Any/None([]string, args)` bool
- `Before(func(ctx, ability, args) Response)` - runs before all checks
- `After(func(ctx, ability, args, result) Response)` - runs after checks
- `WithContext(ctx)` Gate

**access helpers:**

- `access.NewAllowResponse()` Response
- `access.NewDenyResponse(message)` Response

## Implementation Example

```go
// middleware/auth.go
package middleware

import (
    "github.com/goravel/framework/contracts/http"
    "yourmodule/app/facades"
)

func Auth() http.Middleware {
    return func(ctx http.Context) {
        token := ctx.Request().Header("Authorization")
        if _, err := facades.Auth(ctx).Parse(token); err != nil {
            ctx.Response().String(http.StatusUnauthorized, "unauthorized").Abort()
            return
        }
        ctx.Request().Next()
    }
}

// controllers/auth_controller.go
package controllers

import (
    "github.com/goravel/framework/contracts/http"
    "yourmodule/app/facades"
    "yourmodule/app/models"
)

type AuthController struct{}

func (r *AuthController) Login(ctx http.Context) http.Response {
    var user models.User
    facades.Orm().Query().Where("email", ctx.Request().Input("email")).First(&user)

    token, err := facades.Auth(ctx).Login(&user)
    if err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }
    return ctx.Response().Json(http.StatusOK, http.Json{"token": token})
}

func (r *AuthController) Me(ctx http.Context) http.Response {
    // Auth middleware already called Parse; User() works here
    var user models.User
    if err := facades.Auth(ctx).User(&user); err != nil {
        return ctx.Response().Json(http.StatusUnauthorized, http.Json{"error": "unauthorized"})
    }
    return ctx.Response().Json(http.StatusOK, user)
}

// Gate definition in bootstrap/app.go WithCallback:
// facades.Gate().Define("update-post", func(ctx context.Context, args map[string]any) contractsaccess.Response {
//     // ctx here is context.Context, NOT http.Context
//     post := args["post"].(models.Post)
//     userID := args["user_id"].(uint)
//     if userID == post.UserID { return access.NewAllowResponse() }
//     return access.NewDenyResponse("forbidden")
// })
```

## Rules

- `facades.Auth(ctx)` takes `http.Context`, not `context.Context`.
- `User()` and `ID()` require `Parse(token)` to have been called first on the same ctx.
- `Check()` / `Guest()` also require prior `Parse`.
- `Guard(name)` must be called before `Login`/`User`/etc. when using non-default guard.
- `Extend` and `Provider` must be called inside `WithCallback` in `bootstrap/app.go`.
- `UserProvider.RetriveByID` - spelled without the second 'e' ("Retrive") - this matches the contract.
- Gate `Define` callback receives `context.Context`, not `http.Context` - extract user from ctx value.
- Gate `Before` returning a non-nil Response short-circuits all other `Define` callbacks.
- Gate `After` only fires if `Define` returned a result (not short-circuited by `Before`).
- JWT config: `config/jwt.go` for global; per-guard overrides in `config/auth.go`.
