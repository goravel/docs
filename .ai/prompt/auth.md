# Goravel Authentication, Authorization, and Hashing

## Authentication Setup

Configure guards in `config/auth.go` and JWT parameters in `config/jwt.go`.

Generate JWT secret:

```shell
./artisan jwt:secret
```

---

## JWT Authentication

### Login with model

```go
import "goravel/app/facades"

var user models.User
user.ID = 1

token, err := facades.Auth(ctx).Login(&user)
```

Model must have a primary key. If the model does not embed `orm.Model`, add a `primaryKey` tag:

```go
type User struct {
    ID   uint `gorm:"primaryKey"`
    Name string
}
```

### Login with ID

```go
token, err := facades.Auth(ctx).LoginUsingID(1)
```

### Parse token

```go
payload, err := facades.Auth(ctx).Parse(token)
```

`payload` fields:
- `Guard` - current guard name
- `Key` - user identifier
- `ExpireAt` - expiration time
- `IssuedAt` - issue time

Check if token is expired:

```go
import (
    "errors"
    "github.com/goravel/framework/auth"
)

if errors.Is(err, auth.ErrorTokenExpired) {
    // token expired, allow refresh
}
```

Token can be passed with or without the `Bearer` prefix.

### Get authenticated user

Must call `Parse` first (typically in middleware):

```go
var user models.User
err := facades.Auth(ctx).User(&user)

id, err := facades.Auth(ctx).ID()
```

### Refresh token

Requires a prior `Parse` call:

```go
token, err := facades.Auth(ctx).Refresh()
```

### Logout

```go
err := facades.Auth(ctx).Logout()
```

---

## Multiple Guards

Configure guards in `config/auth.go`:

```go
"guards": map[string]any{
    "user": map[string]any{
        "driver": "jwt",
    },
    "admin": map[string]any{
        "driver":      "jwt",
        "ttl":         60,
        "refresh_ttl": 0,
        "secret":      "admin-secret",
    },
},
```

Use a specific guard (must call `Guard` before any other method when not using the default):

```go
token, err := facades.Auth(ctx).Guard("admin").LoginUsingID(1)
err := facades.Auth(ctx).Guard("admin").Parse(token)

var admin models.Admin
err := facades.Auth(ctx).Guard("admin").User(&admin)
```

---

## Auth Middleware Pattern

```go
package middleware

import (
    "strings"

    "github.com/goravel/framework/contracts/http"
    "goravel/app/facades"
)

func Auth() http.Middleware {
    return func(ctx http.Context) {
        header := ctx.Request().Header("Authorization", "")
        token := strings.TrimPrefix(header, "Bearer ")

        payload, err := facades.Auth(ctx).Parse(token)
        if err != nil {
            ctx.Response().String(http.StatusUnauthorized, "unauthorized").Abort()
            return
        }
        _ = payload
        ctx.Request().Next()
    }
}
```

---

## Custom Guard Driver

Register in the `Boot` method of a service provider:

```go
import (
    "github.com/goravel/framework/contracts/auth"
    contractshttp "github.com/goravel/framework/contracts/http"
)

func (receiver *AuthServiceProvider) Boot(app foundation.Application) {
    facades.Auth().Extend("custom-driver", func(ctx contractshttp.Context, name string, userProvider auth.UserProvider) (auth.GuardDriver, error) {
        return &CustomGuard{}, nil
    })
}
```

Reference in `config/auth.go`:

```go
"guards": map[string]any{
    "api": map[string]any{
        "driver":   "custom-driver",
        "provider": "users",
    },
},
```

---

## Custom UserProvider

```go
facades.Auth().Provider("custom-provider", func(ctx contractshttp.Context) (auth.UserProvider, error) {
    return &UserProvider{}, nil
})
```

Reference in `config/auth.go`:

```go
"providers": map[string]any{
    "users": map[string]any{
        "driver": "custom-provider",
    },
},

"guards": map[string]any{
    "api": map[string]any{
        "driver":   "jwt",
        "provider": "users",
    },
},
```

---

## Authorization - Gates

### Define a gate

Gates are defined inside `WithCallback` in `bootstrap/app.go`:

```go
import (
    "context"
    "github.com/goravel/framework/auth/access"
    contractsaccess "github.com/goravel/framework/contracts/auth/access"
)

WithCallback(func() {
    facades.Gate().Define("update-post",
        func(ctx context.Context, arguments map[string]any) contractsaccess.Response {
            user := ctx.Value("user").(models.User)
            post := arguments["post"].(models.Post)

            if user.ID == post.UserID {
                return access.NewAllowResponse()
            }
            return access.NewDenyResponse("You do not own this post.")
        },
    )
})
```

### Check a gate

```go
if facades.Gate().Allows("update-post", map[string]any{"post": post}) {
    // authorized
}

if facades.Gate().Denies("update-post", map[string]any{"post": post}) {
    // denied
}

// Check multiple abilities
if facades.Gate().Any([]string{"update-post", "delete-post"}, map[string]any{"post": post}) {
    // can do at least one
}

if facades.Gate().None([]string{"update-post", "delete-post"}, map[string]any{"post": post}) {
    // can do none
}
```

### Full response

```go
response := facades.Gate().Inspect("update-post", map[string]any{"post": post})

if response.Allowed() {
    // authorized
} else {
    fmt.Println(response.Message())
}
```

### Inject context into gate

```go
facades.Gate().WithContext(ctx).Allows("update-post", map[string]any{"post": post})
```

### Before / After hooks

```go
facades.Gate().Before(func(ctx context.Context, ability string, arguments map[string]any) contractsaccess.Response {
    user := ctx.Value("user").(models.User)
    if isAdministrator(user) {
        return access.NewAllowResponse()
    }
    return nil // nil means continue to next check
})

facades.Gate().After(func(ctx context.Context, ability string, arguments map[string]any, result contractsaccess.Response) contractsaccess.Response {
    user := ctx.Value("user").(models.User)
    if isAdministrator(user) {
        return access.NewAllowResponse()
    }
    return nil
})
```

Note: `After` result only applies when `Define` returns `nil`.

---

## Authorization - Policies

### Generate policy

```shell
./artisan make:policy PostPolicy
./artisan make:policy user/PostPolicy
```

### Write policy

```go
package policies

import (
    "context"

    "github.com/goravel/framework/auth/access"
    contractsaccess "github.com/goravel/framework/contracts/auth/access"
    "goravel/app/models"
)

type PostPolicy struct{}

func NewPostPolicy() *PostPolicy {
    return &PostPolicy{}
}

func (r *PostPolicy) Update(ctx context.Context, arguments map[string]any) contractsaccess.Response {
    user := ctx.Value("user").(models.User)
    post := arguments["post"].(models.Post)

    if user.ID == post.UserID {
        return access.NewAllowResponse()
    }
    return access.NewDenyResponse("You do not own this post.")
}
```

### Register policy

Register by mapping the policy method to a gate name inside `WithCallback`:

```go
WithCallback(func() {
    facades.Gate().Define("update-post", policies.NewPostPolicy().Update)
    facades.Gate().Define("delete-post", policies.NewPostPolicy().Delete)
})
```

---

## Hashing

### Hash a password

```go
hashed, err := facades.Hash().Make(password)
```

### Verify a password

```go
if facades.Hash().Check("plain-text-password", hashedPassword) {
    // passwords match
}
```

### Check if rehash needed

```go
if facades.Hash().NeedsRehash(hashed) {
    hashed, err = facades.Hash().Make("plain-text-password")
}
```

Configure the hashing driver (argon2id or bcrypt) in `config/hashing.go`.

---

## Gotchas

- `facades.Auth(ctx).User(&user)` requires a prior `Parse(token)` call on the same context. Without parsing, the user struct remains empty.
- When using a non-default guard, always chain `.Guard("name")` before `Login`, `Parse`, `User`, `ID`, `Refresh`, and `Logout`.
- Gate `Before` returning `nil` does not deny the action; it allows other checks to proceed. Return a response from `access.NewDenyResponse()` to explicitly deny.
- Policy methods and gate closures receive the same arguments map. Keys must match what you pass to `Allows`.
