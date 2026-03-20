# Cache Facade

## Core Imports

```go
import (
    "context"
    "time"
    "github.com/goravel/framework/contracts/cache"
    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/cache/cache.go`

## Available Methods

**facades.Cache():**

- `Store(name)` Driver - switch to named store
- `WithContext(ctx)` Driver - inject context
- `Get(key, default?)` any
- `GetBool/GetInt/GetInt64/GetString(key, default?)` T
- `Has(key)` bool
- `Put(key, value, ttl)` error - `ttl=0` stores forever
- `Add(key, value, ttl)` bool - stores only if absent; returns false if key exists
- `Forever(key, value)` bool
- `Remember(key, ttl, func() (any, error))` (any, error)
- `RememberForever(key, func() (any, error))` (any, error)
- `Pull(key, default?)` any - retrieve + delete atomically
- `Increment(key, amount?)` (int64, error)
- `Decrement(key, amount?)` (int64, error)
- `Forget(key)` bool
- `Flush()` bool
- `Lock(key, ttl?)` Lock

**Lock:**

- `Get(callback?)` bool - acquire immediately; auto-releases after callback
- `Block(duration, callback?)` bool - wait up to duration; auto-releases after callback
- `BlockWithTicker(duration, ticker, callback?)` bool - poll every `ticker` interval
- `Release()` bool - release (ownership-aware)
- `ForceRelease()` bool - release regardless of owner

## Implementation Example

```go
package services

import (
    "fmt"
    "time"
    "yourmodule/app/facades"
    "yourmodule/app/models"
)

type UserService struct{}

func (s *UserService) GetUser(id int) (*models.User, error) {
    key := fmt.Sprintf("user:%d", id)

    raw, err := facades.Cache().Remember(key, 5*time.Minute, func() (any, error) {
        var user models.User
        if err := facades.Orm().Query().FindOrFail(&user, id); err != nil {
            return nil, err
        }
        return &user, nil
    })
    if err != nil {
        return nil, err
    }
    return raw.(*models.User), nil
}

func (s *UserService) ProcessJob(jobID string) error {
    lock := facades.Cache().Lock("job:"+jobID, 30*time.Second)

    if !lock.Block(5*time.Second, func() {
        facades.Cache().Put("job:"+jobID+":status", "processing", 30*time.Second)
    }) {
        return fmt.Errorf("could not acquire lock")
    }
    return nil
}

// Increment/Decrement return int64
func (s *UserService) TrackVisit(userID int) {
    key := fmt.Sprintf("visits:%d", userID)
    count, err := facades.Cache().Increment(key)
    if err == nil {
        fmt.Printf("visits: %d\n", count) // count is int64
    }
}
```

## Rules

- `Increment`/`Decrement` return `(int64, error)`, not `(int, error)`.
- `Put(key, value, 0)` stores forever (equivalent to `Forever`).
- `Add` returns `false` if key already exists; it does not overwrite.
- `Remember` only executes the closure on cache miss; stores the result automatically.
- `Pull` is atomic: retrieve + delete in one operation.
- `Lock.Get(func(){})` auto-releases the lock after the closure completes.
- `Lock.Block` returns `false` if lock cannot be acquired within the timeout.
- `BlockWithTicker` polls every `ticker` interval instead of continuously retrying.
- `ForceRelease` ignores ownership - use only for cleanup.
- `OnOneServer` scheduling requires `memcached`, `dynamodb`, or `redis` as the default cache.
- Configure stores in `config/cache.go` under `stores`; set `default` to the desired store name.
