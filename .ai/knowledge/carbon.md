# Carbon (Date/Time)

## Import

```go
import "github.com/goravel/framework/support/carbon"
```

## Contracts

Support library wrapping `dromara/carbon`. No framework contract file.
All types (`Carbon`, `DateTime`, `Date`, `Timestamp`, etc.) are defined in the `support/carbon` package directly.

Wraps `dromara/carbon`. All methods are on the `Carbon` type returned by constructors.

## Constructors

```go
carbon.Now()
carbon.Now(timezone ...string)
carbon.Yesterday(timezone ...string)
carbon.Tomorrow(timezone ...string)

// Parse
carbon.Parse("2020-08-05 13:14:15")
carbon.ParseByLayout("2020-08-05 13:14:15", carbon.DateTimeLayout)
carbon.ParseByLayout("2020|08|05", []string{"2006|01|02", "2006|1|2"})  // multiple layouts
carbon.ParseByFormat("2020-08-05 13:14:15", carbon.DateTimeFormat)
carbon.ParseByFormat("2020|08|05", []string{"Y|m|d", "y|m|d"})          // multiple formats

// From primitives
carbon.FromTimestamp(int64)
carbon.FromTimestampMilli(int64)
carbon.FromTimestampMicro(int64)
carbon.FromTimestampNano(int64)
carbon.FromStdTime(t time.Time)

// From components
carbon.FromDateTime(year, month, day, hour, minute, second int)
carbon.FromDateTimeMilli(year, month, day, hour, minute, second, millisecond int)
carbon.FromDateTimeMicro(year, month, day, hour, minute, second, microsecond int)
carbon.FromDateTimeNano(year, month, day, hour, minute, second, nanosecond int)
carbon.FromDate(year, month, day int)
carbon.FromDateMilli(year, month, day, millisecond int)
carbon.FromDateMicro(year, month, day, microsecond int)
carbon.FromDateNano(year, month, day, nanosecond int)
carbon.FromTime(hour, minute, second int)
carbon.FromTimeMilli(hour, minute, second, millisecond int)
carbon.FromTimeMicro(hour, minute, second, microsecond int)
carbon.FromTimeNano(hour, minute, second, nanosecond int)
```

## Built-in Layout / Format Constants

```go
carbon.DateTimeLayout       // "2006-01-02 15:04:05"
carbon.DateLayout           // "2006-01-02"
carbon.TimeLayout           // "15:04:05"
carbon.DateTimeFormat       // "Y-m-d H:i:s"
carbon.DateFormat           // "Y-m-d"
carbon.TimeFormat           // "H:i:s"
```

## Global Config

```go
carbon.SetTimezone(carbon.UTC)       // or "Asia/Shanghai" etc.
carbon.SetLocale("en")               // affects DiffForHumans, weekday names
carbon.SetWeekStartsAt(carbon.Monday)
```

## Arithmetic

```go
c.AddYears(n int) Carbon
c.AddYear() Carbon
c.SubYears(n int) Carbon
c.AddMonths(n int) Carbon
c.AddWeeks(n int) Carbon
c.AddDays(n int) Carbon
c.AddDay() Carbon
c.SubDays(n int) Carbon
c.AddHours(n int) Carbon
c.AddMinutes(n int) Carbon
c.AddSeconds(n int) Carbon
c.SubSeconds(n int) Carbon
```

## Start / End Of Period

```go
c.StartOfDay() Carbon
c.EndOfDay() Carbon
c.StartOfWeek() Carbon
c.EndOfWeek() Carbon
c.StartOfMonth() Carbon
c.EndOfMonth() Carbon
c.StartOfYear() Carbon
c.EndOfYear() Carbon
```

## Comparison

```go
c.Gt(other Carbon) bool        // greater than
c.Lt(other Carbon) bool        // less than
c.Eq(other Carbon) bool        // equal
c.Gte(other Carbon) bool
c.Lte(other Carbon) bool
c.Between(min, max Carbon) bool
c.IsPast() bool
c.IsFuture() bool
c.IsToday() bool
c.IsYesterday() bool
c.IsTomorrow() bool
c.IsWeekday() bool
c.IsWeekend() bool
```

## Output

```go
c.String() string                    // "2020-08-05 13:14:15"
c.ToDateTimeString() string
c.ToDateString() string
c.ToTimeString() string
c.ToTimestamp() int64
c.ToTimestampMilli() int64
c.ToTimestampMicro() int64
c.ToTimestampNano() int64
c.ToStdTime() time.Time
c.DiffForHumans() string             // "2 hours ago"
c.Format(layout string) string       // carbon format: "Y-m-d"
c.Layout(layout string) string       // Go layout: "2006-01-02"
```

## Getters

```go
c.Year() int
c.Month() int
c.Day() int
c.Hour() int
c.Minute() int
c.Second() int
c.DayOfWeek() int       // 0=Sunday
c.DayOfYear() int
c.WeekOfYear() int
c.DaysInMonth() int
c.Timezone() string
```

## Validity

```go
c.IsZero() bool     // true when carbon holds the zero value (invalid/unparseable input)
c.IsValid() bool    // true when carbon holds a non-zero value
```

## ORM Model Fields

`orm.Model` embeds `CreatedAt` and `UpdatedAt` as `carbon.DateTime`, not `time.Time`.
Use `carbon.DateTime` (or `carbon.Date`, `carbon.Timestamp` etc.) for model date fields.

```go
import (
    "github.com/goravel/framework/database/orm"
    "github.com/goravel/framework/support/carbon"
)

type User struct {
    orm.Model                        // CreatedAt, UpdatedAt are carbon.DateTime
    Name      string
    Birthday  carbon.Date            // date only, no time component
    LastLogin carbon.DateTime        // full datetime
    DeletedAt carbon.DateTime        `gorm:"column:deleted_at"`
}

// Reading a value
user.CreatedAt.ToDateTimeString()   // "2024-01-15 10:30:00"
user.CreatedAt.ToStdTime()          // time.Time

// Writing a value
user.Birthday = carbon.NewDate(1990, 6, 15)
user.LastLogin = carbon.NewDateTime(2024, 1, 15, 10, 30, 0)
```

## Test Time Control

```go
carbon.SetTestNow(carbon.Now())    // freeze time for tests
carbon.CleanTestNow()              // unfreeze (call in test teardown)
carbon.IsTestNow() bool
```

## Rules

- `carbon.SetTimezone` and `carbon.SetLocale` are global and affect all subsequent calls.
- In tests, always call `carbon.CleanTestNow()` in teardown to avoid polluting other tests.
- `ParseByLayout` accepts either a single `string` layout or `[]string` (tries each in order).
- `ParseByFormat` also accepts either a single `string` format or `[]string`.
- `Format` uses carbon/PHP format strings (`Y`, `m`, `d`); `Layout` uses Go time format strings (`2006`, `01`, `02`).
- Invalid parse returns a zero `Carbon` -- check `c.IsZero()` before use.
- `orm.Model` fields `CreatedAt` and `UpdatedAt` are `carbon.DateTime`, NOT `time.Time`. Using `time.Time` causes scan errors.
- For model date fields use the typed carbon wrappers: `carbon.Date`, `carbon.DateTime`, `carbon.Timestamp`, `carbon.TimestampMilli`, `carbon.TimestampMicro`, `carbon.TimestampNano`.
