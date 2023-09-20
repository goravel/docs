# Helpers

[[toc]]

## Available Methods

### Paths

|                           |                               |             |
| -----------               | --------------                | -------------- |
| [path.App()](#path-app)   | [path.Base()](#path-base)     | [path.Config()](#path-config)     |
| [path.Database()](#path-database)   | [path.Storage()](#path-storage)     | [path.Public()](#path-public)     |

### Time

|                           |                               |             |
| -----------               | --------------                | -------------- |
| [carbon.Now()](#carbon-now)   | [carbon.SetTimezone()](#carbon-settimezone)     | [carbon.Parse()](#carbon-parse)     |
| [carbon.FromTimestamp()](#carbon-fromtimestamp)   | [carbon.FromDateTime()](#carbon-fromdatetime)     | [carbon.FromDate()](#carbon-fromdate)     |
| [carbon.FromTime()](#carbon-fromtime)   | [carbon.FromStdTime()](#carbon-fromstdtime)     | [carbon.IsTestNow()](#istestnow-fromdate)     |
| [carbon.SetTestNow()](#carbon-settestnow)     | [carbon.UnsetTestNow()](#carbon-unsettestnow)     |      |

### Debug

|                           |                               |             |
| -----------               | --------------                | -------------- |
| [debug.Dump()](#debug-dump)   | [debug.SDump()](#debug-sdump)     | [debug.FDump()](#debug-fdump)     |

## Paths

### `path.App()`

The `path.App()` function returns the path to your application's app directory. You may also use the `path.App()` function to generate a path to a file relative to the application directory:

```go
import "github.com/goravel/framework/support/path"

path := path.App()
path := path.App("http/controllers/controller.go")
```

### `path.Base()`

The `path.Base()` function returns the path to your application's root directory. You may also use the `path.Base()` function to generate a path to a given file relative to the project root directory:

```go
path := path.Base()
path := path.Base("vendor/bin")
```

### `path.Config()`

The `path.Config()` function returns the path to your application's config directory. You may also use the `path.Config()` function to generate a path to a given file within the application's configuration directory:

```go
path := path.Config()
path := path.Config("app.go")
```

### `path.Database()`

The `path.Database()` function returns the path to your application's database directory. You may also use the `path.Database()` function to generate a path to a given file within the database directory:

```go
path := path.Database()
path := path.Database("factories/user_factory.go")
```

### `path.Storage()`

The `path.Storage()` function returns the path to your application's storage directory. You may also use the `path.Storage()` function to generate a path to a given file within the storage directory:

```go
path := path.Storage()
path := path.Storage("app/file.txt")
```

### `path.Public()`

The `path.Public()` function returns the path to your application's public directory. You may also use the `path.Public()` function to generate a path to a given file within the public directory:

```go
path := path.Public()
path := path.Public("css/app.css")
```

## Time

The `carbon` module of Goravel is an expansion by [golang-module/carbon](https://github.com/golang-module/carbon), the main feature is the realization of time backtracking, please refer to the official documentation for details.

### `carbon.Now()`

Get current time:

```go
import "github.com/goravel/framework/support/carbon"

carbon.Now()
```

### `carbon.SetTimezone()`

Set timezone：

```go
carbon.SetTimezone(carbon.UTC)
```

### `carbon.Parse()`

Get `Carbon` object by String:

```go
carbon.Parse("2020-08-05 13:14:15")
```

### `carbon.FromTimestamp()`

Get `Carbon` Object by timestamp:

```go
carbon.FromTimestamp(1577836800)
```

### `carbon.FromDateTime()`

Get `Carbon` Object by date time:

```go
carbon.FromDateTime(2020, 1, 1, 0, 0, 0)
```

### `carbon.FromDate()`

Get `Carbon` Object by date:

```go
carbon.FromDate(2020, 1, 1)
```

### `carbon.FromTime()`

Get `Carbon` Object by time:

```go
carbon.FromTime(0, 0, 0)
```

### `carbon.FromStdTime()`

Get `Carbon` Object by `time.Time`:

```go
carbon.FromStdTime(time.Now())
```

### `carbon.IsTestNow()`

Determine whether the time is a test value:

```go
carbon.IsTestNow()
```

### `carbon.SetTestNow()`

Set the time to a test value:

```go
carbon.SetTestNow(carbon.Now())
```

### `carbon.UnsetTestNow()`

Restore the time to a normal value:

```go
carbon.UnsetTestNow()
```

## Debug

### `debug.Dump()`

`debug.Dump()` can print any variable:

```go
import "github.com/goravel/framework/support/debug"

debug.Dump(myVar1, myVar2, ...)
```

### `debug.FDump()`

`debug.FDump()` can print any variable to `io.Writer`:

```go
import "github.com/goravel/framework/support/debug"

debug.FDump(someWriter, myVar1, myVar2, ...)
```

### `debug.SDump()`

`debug.SDump()` can print any variable to `string`:

```go
import "github.com/goravel/framework/support/debug"

debug.SDump(myVar1, myVar2, ...)
```

<CommentService/>