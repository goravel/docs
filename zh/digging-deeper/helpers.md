# 辅助函数

[[toc]]

## 可用方法

### 路径

|                           |                               |             |
| -----------               | --------------                | -------------- |
| [path.App()](#path-app)   | [path.Base()](#path-base)     | [path.Config()](#path-config)     |
| [path.Database()](#path-database)   | [path.Storage()](#path-storage)     | [path.Public()](#path-public)     |

### 时间

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

## 路径

### `path.App()`

`path.App()` 函数返回 app 目录的路径。您也可以用来生成应用目录下特定文件的路径：

```go
import "github.com/goravel/framework/support/path"

path := path.App()
path := path.App("http/controllers/controller.go")
```

### `path.Base()`

`path.Base()` 函数返回项目根目录的路径。您也可以用来生成项目根目录下特定文件的路径：

```go
path := path.Base()
path := path.Base("vendor/bin")
```

### `path.Config()`

`path.Config()` 函数返回项目配置目录 (config) 的路径。您也可以用来生成应用配置目录中的特定文件的路径：

```go
path := path.Config()
path := path.Config("app.go")
```

### `path.Database()`

`path.Database()` 函数返回 `database` 目录的路径。您也可以用来生成数据库目录下特定文件的路径：

```go
path := path.Database()
path := path.Database("factories/user_factory.go")
```

### `path.Storage()`

`path.Storage()` 函数返回 `storage` 目录的路径。您也可以用来生成位于资源路径中的特定路径：

```go
path := path.Storage()
path := path.Storage("app/file.txt")
```

### `path.Public()`

`path.Public()` 函数返回 `public` 目录的路径。您也可以用来生成 `public` 目录下特定文件的路径：

```go
path := path.Public()
path := path.Public("css/app.css")
```

## 时间

Goravel 的 `carbon` 是 [golang-module/carbon](https://github.com/golang-module/carbon) 的一个扩展，主要实现了时间回溯功能，详细用法请参考其官方文档。

### `carbon.Now()`

获取当前时间：

```go
import "github.com/goravel/framework/support/carbon"

carbon.Now()
```

### `carbon.SetTimezone()`

设置时区：

```go
carbon.SetTimezone(carbon.UTC)
```

### `carbon.Parse()`

字符串格式化为 `Carbon` 对象：

```go
carbon.Parse("2020-08-05 13:14:15")
```

### `carbon.FromTimestamp()`

时间戳格式化为 `Carbon` 对象：

```go
carbon.FromTimestamp(1577836800)
```

### `carbon.FromDateTime()`

时间格式化为 `Carbon` 对象：

```go
carbon.FromDateTime(2020, 1, 1, 0, 0, 0)
```

### `carbon.FromDate()`

年月日格式化为 `Carbon` 对象：

```go
carbon.FromDate(2020, 1, 1)
```

### `carbon.FromTime()`

时分秒格式化为 `Carbon` 对象：

```go
carbon.FromTime(0, 0, 0)
```

### `carbon.FromStdTime()`

`time.Time` 格式化为 `Carbon` 对象：

```go
carbon.FromStdTime(time.Now())
```

### `carbon.IsTestNow()`

判断系统时间是否为测试值：

```go
carbon.IsTestNow()
```

### `carbon.SetTestNow()`

将系统时间设置为一个测试值：

```go
carbon.SetTestNow(carbon.Now())
```

### `carbon.UnsetTestNow()`

恢复系统时间为正常值：

```go
carbon.UnsetTestNow()
```

## Debug

### `debug.Dump()`

`debug.Dump()` 可以打印任意对象：

```go
import "github.com/goravel/framework/support/debug"

debug.Dump(myVar1, myVar2, ...)
```

### `debug.FDump()`

`debug.FDump()` 可以打印任意对象输出到一个 `io.Writer`：

```go
import "github.com/goravel/framework/support/debug"

debug.FDump(someWriter, myVar1, myVar2, ...)
```

### `debug.SDump()`

`debug.SDump()` 可以将打印输出至字符串：

```go
import "github.com/goravel/framework/support/debug"

debug.SDump(myVar1, myVar2, ...)
```

<CommentService/>