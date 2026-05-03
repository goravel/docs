# Hash & Crypt

Two facades: `facades.Hash()` for one-way password hashing (default driver bcrypt or argon2id), `facades.Crypt()` for symmetric encrypt/decrypt of strings (AES-256-CBC by default, key from `config/app.go.key`).

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/hash/hash.go` — `Hash`
- `contracts/crypt/crypt.go` — `Crypt`

## Imports

```go
import "yourmodule/app/facades"
```

## Methods

### `facades.Hash()` returns `hash.Hash`

| Method | Signature | Notes |
|---|---|---|
| Make | `(value string) (string, error)` | One-way hash. The output encodes algorithm + cost + salt. |
| Check | `(value, hashed string) bool` | Constant-time compare. Returns false on any mismatch (including malformed hash). |
| NeedsRehash | `(hashed string) bool` | True when the cost factor in the stored hash is below the current config — re-hash on next login. |

### `facades.Crypt()` returns `crypt.Crypt`

| Method | Signature | Notes |
|---|---|---|
| EncryptString | `(value string) (string, error)` | Encrypt + base64-encode. Output includes IV + MAC. |
| DecryptString | `(payload string) (string, error)` | Verify MAC + decrypt. Returns error on tampered or wrong-key payload. |

## Config

User-owned: `config/hashing.go`, `config/app.go`. Read directly for current settings.

Hash keys this facade reads:

- `hashing.driver` (string) — `"bcrypt"` (default) or `"argon2id"`
- `hashing.bcrypt.rounds` (int) — bcrypt cost (default 10; bump to 12+ for high security)
- `hashing.argon2id.memory` / `time` / `threads` — argon2id parameters

Crypt keys:

- `app.key` (string, env `APP_KEY`) — base64-encoded 32-byte key (AES-256). Required; missing key panics at boot.
- `app.previous_keys` ([]string, env-backed) — for key rotation; tries each on decrypt failure.

Greenfield default: `config/hashing.go` and `config/app.go` from goravel-scaffold URL declared in `AGENTS.md`.

## Patterns & gotchas

- **`Hash.Check` is constant-time** — always use it, never compare hash strings with `==` (timing attack).
- **`NeedsRehash` after a successful Check** — if true, hash and persist again with the current cost. Standard upgrade flow on login.
- **Bcrypt has a 72-byte input limit** — passwords longer than 72 bytes are silently truncated. Either pre-hash with sha256 (then bcrypt) for very long passphrases, or switch driver to argon2id (no limit).
- **Crypt key must be base64 32-byte (AES-256)**. Generate via `./artisan key:generate` — never hand-roll.
- **`EncryptString` output is opaque** — includes IV + MAC + ciphertext, base64-encoded. Don't try to compose pieces by hand.
- **`DecryptString` failure modes**: missing key, key mismatch, tampered ciphertext (MAC failure). All return `error` — never trust a partial decrypt.
- **Key rotation**: add the old key to `app.previous_keys`. Decrypt tries the active key first, then each previous key. Rotation strategy: deploy with new active key + previous keys → re-encrypt all stored ciphertext via a job → drop previous keys.
- **Don't use `Crypt` for passwords** — use `Hash`. Crypt is reversible (you can decrypt); passwords should never be reversible.
- **Don't use `Hash` for general data integrity** — use `Crypt` (which signs with MAC) or stdlib `crypto/hmac` for keyed signatures.
- **Hash error**: `Make` returns error on driver misconfig (e.g. cost outside legal range). In practice rare with default config.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `if hash == storedHash { ... }` | `if facades.Hash().Check(plain, storedHash) { ... }` | Bcrypt hashes are non-deterministic; check via the contract. Constant-time compare. |
| `facades.Hash().Make(longPassword)` (>72 bytes silently truncated on bcrypt) | Pre-hash with sha256 OR switch driver to argon2id | Bcrypt input limit is silent. |
| `facades.Crypt().EncryptString(password)` | `facades.Hash().Make(password)` | Use Hash for passwords (one-way), Crypt for reversibly stored data (e.g. PII at rest). |
| Hand-base64 + AES bytes | Use `Crypt.EncryptString` / `DecryptString` | Composition is footgun-rich (IV reuse, MAC missing). |
| Skip `NeedsRehash` on successful login | After `Check` passes, `if hash.NeedsRehash(stored) { newHash := hash.Make(plain); ... persist ... }` | Cost upgrades only happen if you re-hash. |

## Worked example: register + login + cost-upgrade

```go
package controllers

import (
    "github.com/goravel/framework/contracts/http"

    "yourmodule/app/facades"
)

type AuthController struct{}

func (c *AuthController) Register(ctx http.Context) http.Response {
    var input struct{ Email, Password string }
    if err := ctx.Request().Bind(&input); err != nil {
        return ctx.Response().Json(http.StatusBadRequest, http.Json{"error": err.Error()})
    }

    hashed, err := facades.Hash().Make(input.Password)
    if err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }
    // ... persist hashed alongside email ...
    return ctx.Response().Status(http.StatusCreated).Json(http.Json{"ok": true})
}

func (c *AuthController) Login(ctx http.Context) http.Response {
    var input struct{ Email, Password string }
    if err := ctx.Request().Bind(&input); err != nil {
        return ctx.Response().Json(http.StatusBadRequest, http.Json{"error": err.Error()})
    }

    // ... fetch stored hash for input.Email ...
    var stored string

    if !facades.Hash().Check(input.Password, stored) {
        return ctx.Response().Json(http.StatusUnauthorized, http.Json{"error": "invalid creds"})
    }

    // Upgrade cost on the fly
    if facades.Hash().NeedsRehash(stored) {
        newHash, err := facades.Hash().Make(input.Password)
        if err == nil {
            // persist newHash for the user
            _ = newHash
        }
    }

    return ctx.Response().Json(http.StatusOK, http.Json{"ok": true})
}

// Crypt: reversibly store an API token at rest
func StoreToken(plainToken string) (string, error) {
    return facades.Crypt().EncryptString(plainToken)
}

func ReadToken(encrypted string) (string, error) {
    return facades.Crypt().DecryptString(encrypted)
}
```

## Rules

- Passwords → `facades.Hash()` (one-way). Reversibly-stored secrets → `facades.Crypt()` (symmetric).
- Always compare hashes via `Hash.Check`, never `==`.
- After a successful `Check`, run `NeedsRehash` and re-hash if true.
- Bcrypt silently truncates input >72 bytes — pre-hash with sha256 or switch to argon2id for long inputs.
- `app.key` is required (base64 32-byte AES-256 key); generate via `./artisan key:generate`.
- For key rotation, populate `app.previous_keys`; decrypt tries new then old.
- Don't try to compose AES + IV + MAC manually — use `Crypt.EncryptString`/`DecryptString`.
