# Hash & Crypt Facades

## Core Imports

```go
import (
    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/hash/hash.go`
- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/crypt/crypt.go`

## Available Methods

**facades.Hash():**

- `Make(value string)` (string, error) - hash a plain-text password (Argon2id or Bcrypt)
- `Check(value, hashedValue string)` bool - verify plain-text against hash
- `NeedsRehash(hashedValue string)` bool - true if hash algorithm/cost has changed

**facades.Crypt():**

- `EncryptString(value string)` (string, error) - AES-256-GCM encrypt with GMAC signature
- `DecryptString(value string)` (string, error) - decrypt; returns error if GMAC invalid

## Implementation Example

```go
package controllers

import (
    "github.com/goravel/framework/contracts/http"
    "yourmodule/app/facades"
    "yourmodule/app/models"
)

type AuthController struct{}

// Register - hash password before storing
func (r *AuthController) Register(ctx http.Context) http.Response {
    plain := ctx.Request().Input("password")

    hashed, err := facades.Hash().Make(plain)
    if err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }

    user := models.User{
        Email:    ctx.Request().Input("email"),
        Password: hashed,
    }
    if err := facades.Orm().Query().Create(&user); err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }
    return ctx.Response().Json(http.StatusCreated, http.Json{"id": user.ID})
}

// Login - verify password
func (r *AuthController) Login(ctx http.Context) http.Response {
    var user models.User
    facades.Orm().Query().Where("email", ctx.Request().Input("email")).First(&user)

    if !facades.Hash().Check(ctx.Request().Input("password"), user.Password) {
        return ctx.Response().Json(http.StatusUnauthorized, http.Json{"error": "invalid credentials"})
    }

    // Rehash if needed (e.g., after changing algorithm)
    if facades.Hash().NeedsRehash(user.Password) {
        newHash, _ := facades.Hash().Make(ctx.Request().Input("password"))
        facades.Orm().Query().Model(&user).Update("password", newHash)
    }

    token, _ := facades.Auth(ctx).Login(&user)
    return ctx.Response().Json(http.StatusOK, http.Json{"token": token})
}

// Encrypt/Decrypt sensitive data
func (r *AuthController) StoreSecret(ctx http.Context) http.Response {
    secret := ctx.Request().Input("secret")

    encrypted, err := facades.Crypt().EncryptString(secret)
    if err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }

    // Store `encrypted` in DB...

    // Later, decrypt:
    plain, err := facades.Crypt().DecryptString(encrypted)
    if err != nil {
        return ctx.Response().Json(http.StatusBadRequest, http.Json{"error": "tampered or invalid data"})
    }

    return ctx.Response().Json(http.StatusOK, http.Json{"secret": plain})
}
```

## Rules

**Hash:**

- Default hashing algorithm is Argon2id; Bcrypt also supported - configure in `config/hashing.go`.
- `Check` is timing-safe - always use it instead of direct string comparison.
- `NeedsRehash` should be checked on login and password re-hashed if `true`.
- Never store plain-text passwords; always hash before persisting.

**Crypt:**

- Requires `APP_KEY` to be set in `.env`; generate with `./artisan key:generate`.
- Encryption uses AES-256-GCM with GMAC authentication - data integrity is verified on decrypt.
- `DecryptString` returns an error if data has been tampered with or the key is wrong.
- Encrypted values are base64-encoded strings safe for storage in database columns.
- Do **not** use Crypt for passwords - use Hash instead.
