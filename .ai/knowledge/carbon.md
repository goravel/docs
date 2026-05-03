# Carbon (Date/Time)

Goravel's date/time package — a thin wrapper over `dromara/carbon/v2` plus typed aliases for ORM scanning. Use `carbon.Date`, `carbon.DateTime`, `carbon.Timestamp` (and Milli/Micro/Nano variants) instead of `time.Time` in models. The `*Carbon` value handles arithmetic, formatting, parsing, and timezones.

## Authoritative source

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `support/carbon/carbon.go` — `Carbon` constructor + helpers (re-exports from `dromara/carbon/v2`)
- `support/carbon/type.go` — typed aliases (`Date`, `DateTime`, `Timestamp`, etc.) + `New*` constructors
- `support/carbon/constant.go` — layout constants (`DateLayout`, `DateTimeLayout`, etc.)

External: `dromara/carbon/v2` is the upstream library. For the full method surface fetch its docs.

## Imports

```go
import (
    "time"

    "github.com/goravel/framework/support/carbon"
)
```

## Type aliases (use these in models / API responses)

| Alias | Underlying | Use case |
|---|---|---|
| `carbon.Carbon` | upstream `*Carbon` | The mutable date/time value type |
| `carbon.Timestamp` | typed alias | Unix seconds (int64) — JSON encodes as integer |
| `carbon.TimestampMilli`/`Micro`/`Nano` | typed alias | Higher-precision unix ints |
| `carbon.Date` | typed alias | Date-only (`YYYY-MM-DD`) — JSON encodes as string |
| `carbon.DateTime` | typed alias | DateTime (`YYYY-MM-DD HH:MM:SS`) |
| `carbon.DateMilli`/`Micro`/`Nano`, `DateTimeMilli`/`Micro`/`Nano` | typed alias | Higher precision date / datetime strings |
| `carbon.Time` | typed alias | Time-only (`HH:MM:SS`) |
| `carbon.TimeMilli`/`Micro`/`Nano` | typed alias | Higher precision time |

Each alias has a `New*(c *Carbon)` constructor (e.g. `carbon.NewDateTime(c)`).

## Common `*Carbon` methods (from upstream — fetch upstream docs for the full list)

| Group | Examples |
|---|---|
| Construct | `carbon.Now()`, `carbon.Parse("2024-05-03")`, `carbon.ParseByLayout("...", layout)`, `carbon.CreateFromTimestamp(unix)`, `carbon.CreateFromDate(2024, 5, 3)`, `carbon.CreateFromDateTime(2024, 5, 3, 12, 0, 0)` |
| Format | `.ToDateString()`, `.ToDateTimeString()`, `.ToTimeString()`, `.Format("Y-m-d H:i:s")`, `.ToRfc3339String()`, `.ToIso8601String()` |
| Arithmetic | `.AddDays(n int) *Carbon`, `.SubDays`, `.AddMonths`, `.AddYears`, `.AddHours`, `.AddMinutes`, `.SetTimezone("UTC") *Carbon` |
| Compare | `.Lt`, `.Lte`, `.Eq`, `.Gt`, `.Gte`, `.Between(start, end *Carbon) bool`, `.IsToday() bool`, `.IsPast() bool`, `.IsFuture() bool` |
| Diff | `.DiffInDays(other *Carbon) int64`, `.DiffInHours`, `.DiffInMinutes`, `.DiffForHumans()` (e.g. "2 hours ago") |
| Period | `.StartOfDay() *Carbon`, `.EndOfDay`, `.StartOfMonth`, `.EndOfMonth` |
| Convert | `.Timestamp() int64`, `.TimestampMilli() int64`, `.ToStdTime() time.Time` |
| Locale | `.SetLocale("fr") *Carbon` (for human-friendly output) |

## Layout constants

```go
carbon.DateLayout       // "2006-01-02"
carbon.DateTimeLayout   // "2006-01-02 15:04:05"
carbon.TimeLayout       // "15:04:05"
// + Milli/Micro/Nano variants
```

## Config

User-owned: `config/app.go.timezone` (string) — application timezone (default `"UTC"`). All `carbon.Now()` calls use this unless `.SetTimezone()` is chained.

## Patterns & gotchas

- **Use `carbon.*` types in models, NEVER `time.Time`**: GORM's scanner doesn't know how to deserialize `time.Time` into the typed alias correctly across drivers. `orm.Model` already gives you `*carbon.DateTime` for CreatedAt/UpdatedAt.
- **Pointer types in `orm.Model`**: `CreatedAt` and `UpdatedAt` are `*carbon.DateTime` (POINTER) — nil before persistence, populated after. Don't dereference without nil-check on a fresh struct.
- **`*Carbon` is mutable across some methods**: many arithmetic methods (`AddDays`) return a new `*Carbon` — chain them. Read upstream docs to confirm per-method.
- **Parsing**: `carbon.Parse("...")` accepts many common formats (RFC3339, ISO8601, "YYYY-MM-DD", "YYYY-MM-DD HH:MM:SS"). For ambiguous input, use `ParseByLayout(s, layout)` with an explicit Go time layout.
- **Format strings use PHP-style** (Y, m, d, H, i, s) in `.Format(...)` — NOT Go's reference time. For Go-style, use `time.Time` after `.ToStdTime()`.
- **Timezone**: `carbon.Now()` returns local time per `app.timezone`. Use `.SetTimezone("Asia/Tokyo")` to convert (returns new *Carbon).
- **JSON encoding**: typed aliases (`Date`, `DateTime`, `Timestamp`) implement `json.Marshaler`/`Unmarshaler`. `Date` → `"2024-05-03"`, `DateTime` → `"2024-05-03 12:00:00"`, `Timestamp` → integer.
- **Diff sign convention**: `a.DiffInDays(b)` is `b - a` — if b is later, positive. Use `.DiffAbsInDays` for unsigned.
- **`DiffForHumans` is locale-aware**: `.SetLocale("fr").DiffForHumans()` → "il y a 2 heures".
- **Don't compare two `*Carbon` with `==`** — use `.Eq()` (semantic equality including timezone).
- **`carbon.NewDateTime(c)` etc.** wrap a `*Carbon` into the typed alias — typically only needed if you build a value programmatically and need to assign it to a model field.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `User { CreatedAt time.Time }` | `User { orm.Model }` (gives `*carbon.DateTime`) or `Created carbon.DateTime` | time.Time fails to scan from DB into the carbon alias. |
| `if user.CreatedAt.Before(...)` (nil deref) | `if user.CreatedAt != nil && user.CreatedAt.ToCarbon().Before(...)` | Pointer can be nil before save. |
| `t := time.Now()` for new model timestamp | `t := carbon.Now()` (or rely on `orm.Model`'s autoCreateTime) | Stay in carbon for consistency + JSON encoding. |
| `c.Format("2006-01-02")` | `c.Format("Y-m-d")` | Carbon uses PHP-style format chars. |
| `if c1 == c2` | `if c1.Eq(c2)` | Pointer equality vs semantic equality. |
| `Parse(input).AddDays(7)` (no error check on Parse) | `c := carbon.Parse(input); if c.IsInvalid() { ... }; c.AddDays(7)` | Parse may produce an invalid Carbon — check `IsInvalid()` (or `Error()`). |

## Worked example: model + arithmetic + JSON

```go
package models

import (
    "github.com/goravel/framework/database/orm"
    "github.com/goravel/framework/support/carbon"
)

type Subscription struct {
    orm.Model
    UserID    uint
    StartedAt carbon.DateTime    // string in JSON: "2024-05-03 12:00:00"
    ExpiresAt carbon.DateTime
    Trial     carbon.Date        // date-only: "2024-05-10"
}

// app/services/subscription.go
package services

import (
    "github.com/goravel/framework/support/carbon"

    "yourmodule/app/models"
)

func IsActive(s *models.Subscription) bool {
    now := carbon.Now()
    expires := carbon.Parse(string(s.ExpiresAt))
    return expires.Gt(now)
}

func ExtendByDays(s *models.Subscription, days int) {
    extended := carbon.Parse(string(s.ExpiresAt)).AddDays(days)
    s.ExpiresAt = *carbon.NewDateTime(extended)
}

func DaysUntilExpiry(s *models.Subscription) int64 {
    return carbon.Parse(string(s.ExpiresAt)).DiffInDays(carbon.Now())
}
```

## Rules

- Use `carbon.*` typed aliases in models — never `time.Time`.
- `orm.Model.CreatedAt`/`UpdatedAt` are `*carbon.DateTime` POINTERS — nil-check before deref.
- Format strings use PHP-style chars (`Y-m-d H:i:s`), not Go's reference time.
- Compare `*Carbon` via `.Eq()` / `.Lt` / `.Gt`, never `==`.
- Always check `c.IsInvalid()` (or `c.Error()`) after `Parse(...)` on untrusted input.
- For Go interop, `c.ToStdTime()` returns a `time.Time`.
- Timezone: configured via `app.timezone`; per-call override with `.SetTimezone(...)`.
- For human-friendly output: `.DiffForHumans()` after `.SetLocale("...")`.
- For full method list, fetch the upstream `dromara/carbon/v2` docs — Goravel re-exports the type but does not duplicate it.
