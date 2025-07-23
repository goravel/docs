# Helpers

[[toc]]

## 可用方法

### 路径

|                                                                      |                                                                    |                                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| [path.App()](#path-app)           | [path.Base()](#path-base)       | [path.Config()](#path-config) |
| [path.Database()](#path-database) | [path.Storage()](#path-storage) | [path.Public()](#path-public) |
| [path.Resource()](#path-resource) |                                                                    |                                                                  |

### 调试

|                                                                                            |                                                                                              |                                                                                              |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [carbon.Now()](#carbon-now)                             | [carbon.SetTimezone()](#carbon-settimezone)               | `path.Config()` 函数返回应用程序配置目录的路径。 您还可以使用 `path.Config()` 函数生成应用程序配置目录中给定文件的路径：                |
| [carbon.SetTestNow()](#carbon-settestnow)               | [carbon.UnsetTestNow()](#carbon-unsettestnow)             | [carbon.IsTestNow()](#istestnow-fromdate)                 |
| [carbon.Parse()](#carbon-parse)                         | [carbon.ParseByLayout()](#carbon-parsebylayout)           | [carbon.ParseByFormat()](#carbon-parsebyformat)           |
| [carbon.FromTimestamp()](#carbon-fromtimestamp)         | [carbon.FromTimestampMilli()](#carbon-fromtimestampmilli) | [carbon.FromTimestampMicro()](#carbon-fromtimestampmicro) |
| [carbon.FromTimestampNano()](#carbon-fromtimestampnano) | [carbon.FromDateTime()](#carbon-fromdatetime)             | [carbon.FromDateTimeMilli()](#carbon-fromdatetimemilli)   |
| [carbon.FromDateTimeMicro()](#carbon-fromdatetimemicro) | [carbon.FromDateTimeNano()](#carbon-fromdatetimenano)     | [carbon.FromDate()](#carbon-fromdate)                     |
| `path.Base()` 函数返回应用程序根目录的路径。 您还可以使用 `path.Base()` 函数生成相对于项目根目录的给定文件路径：                    | [carbon.FromDateMicro()](#carbon-fromdatemicro)           | [carbon.FromDateNano()](#carbon-fromdatenano)             |
| [carbon.FromTime()](#carbon-fromtime)                   | [carbon.FromTimeMilli()](#carbon-fromtimemilli)           | [carbon.FromTimeMicro()](#carbon-fromtimemicro)           |
| [carbon.FromTimeNano()](#carbon-fromtimenano)           | [carbon.FromStdTime()](#carbon-fromstdtime)               |                                                                                              |

### Debug

|                                                                |                                                                  |                                                                  |
| -------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| [debug.Dump()](#debug-dump) | [debug.SDump()](#debug-sdump) | [debug.FDump()](#debug-fdump) |

### 映射

|                                                                |                                                                  |                                                                  |
| -------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| [maps.Add()](#maps-add)     | [maps.Exists()](#maps-exists) | [maps.Forget()](#maps-forget) |
| [maps.Get()](#maps-get)     | [maps.Has()](#maps-has)       | [maps.HasAny()](#maps-hasany) |
| [maps.Only()](#maps-only)   | [maps.Pull()](#maps-pull)     | [maps.Set()](#maps-set)       |
| [maps.Where()](#maps-where) |                                                                  |                                                                  |

### 转换

|                                                                          |                                                                          |                                                                              |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| [convert.Tap()](#convert-tap)         | [convert.With()](#convert-with)       | [convert.Transform()](#convert-transform) |
| [convert.Default()](#convert-default) | [convert.Pointer()](#convert-pointer) |                                                                              |

### 收集

|                                                                        |                                                                          |                                                                          |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| [collect.Count()](#collect-count)   | [collect.CountBy()](#collect-countby) | [collect.Each()](#collect-each)       |
| [collect.Filter()](#collect-filter) | [collect.GroupBy()](#collect-groupby) | [collect.Keys()](#collect-keys)       |
| [collect.Map()](#collect-map)       | [collect.Max()](#collect-max)         | [collect.Merge()](#collect-merge)     |
| [collect.Min()](#collect-min)       | [collect.Reverse()](#collect-reverse) | [collect.Shuffle()](#collect-shuffle) |
| [collect.Split()](#collect-split)   | [collect.Sum()](#collect-sum)         | [collect.Unique()](#collect-unique)   |
| [collect.Values()](#collect-values) |                                                                          |                                                                          |

## 路径

```go
import "github.com/goravel/framework/support/path"

path := path.App()
path := path.App("http/controllers/controller.go")
```

### `path.App()`

The `path.App()` function returns the absolute path to your application's app directory. `path.App()` 函数返回 app 目录的绝对路径。你也可以用来生成应用目录下特定文件的路径：

```go
`path.App()` 函数返回应用程序的 app 目录路径。 您还可以使用 `path.App()` 函数生成相对于应用程序目录的文件路径：
```

### `path.Base()`

The `path.Base()` function returns the absolute path to your application's root directory. `path.Base()` 函数返回项目根目录的绝对路径。你也可以用来生成项目根目录下特定文件的路径：

```go
path := path.Base()
path := path.Base("vendor/bin")
```

### `path.Config()`

The `path.Config()` function returns the absolute path to your application's config directory. `path.Config()` 函数返回项目配置目录 (config) 的绝对路径。你也可以用来生成应用配置目录中的特定文件的路径：

```go
path := path.Config()
path := path.Config("app.go")
```

### `path.Database()`

The `path.Database()` function returns the absolute path to your application's database directory. `path.Database()` 函数返回 `database` 目录的绝对路径。你也可以用来生成数据库目录下特定文件的路径：

```go
path := path.Database()
path := path.Database("factories/user_factory.go")
```

### `path.Storage()`

The `path.Storage()` function returns the absolute path to your application's storage directory. `path.Storage()` 函数返回 `storage` 目录的绝对路径。你也可以用来生成位于资源路径中的特定路径：

```go
path := path.Storage()
path := path.Storage("app/file.txt")
```

### `path.Public()`

The `path.Public()` function returns the absolute path to your application's public directory. `path.Public()` 函数返回 `public` 目录的绝对路径。你也可以用来生成 `public` 目录下特定文件的路径：

```go
path := path.Public()
path := path.Public("css/app.css")
```

### `path.Lang()`

The `path.Lang()` function returns the absolute path to the `lang` directory. `path.Lang()` 函数返回 `lang` 目录的绝对路径。你也可以用来生成 `lang` 目录下特定文件的路径：

```go
path := path.Lang()
path := path.Lang("en.json")
```

### `path.Resource()`

The `path.Resource()` function returns the absolute path to the `resource` directory. `path.Resource()` 函数返回 `resource` 目录的绝对路径。你也可以用来生成 `resource` 目录下特定文件的路径：

```go
path := path.Resource()
path := path.Resource("css/app.css")
```

## 调试

Goravel 的 `carbon` 模块是 [golang-module/carbon](https://github.com/golang-module/carbon) 的扩展，主要特点是实现了时间回溯，详情请参考官方文档。

```go
import "github.com/goravel/framework/support/collect"

max := collect.Max([]int{1, 2, 3, 4, 5})
// 5
```

### `carbon.Now()`

The `carbon.Now()` function gets current time:

```go
import "github.com/goravel/framework/support/carbon"

carbon.Now()
```

### `carbon.SetTimezone()`

设置时区：

```go
carbon.SetTimezone(carbon.UTC)
```

### `path.Public()` 函数返回应用程序公共目录的路径。 您还可以使用 `path.Public()` 函数生成 `public` 目录中指定文件的路径：

设置语言环境，访问 [语言列表](https://github.com/dromara/carbon/tree/master/lang) 查看所有支持的语言：

```go
`path.Database()` 函数返回应用程序数据库目录的路径。 您还可以使用 `path.Database()` 函数生成 `database` 目录中给定文件的路径：
```

### `carbon.SetTestNow()`

将时间设置为测试值：

```go
carbon.SetTestNow(carbon.Now())
```

### `carbon.UnsetTestNow()`

函数 `maps.Get()` 从提供的映射中检索给定键的值。 如果键不存在，将
返回默认值：

```go
carbon.UnsetTestNow()
```

### `carbon.IsTestNow()`

判断时间是否为测试值：

```go
carbon.IsTestNow()
```

### `carbon.Parse()`

通过字符串获取 `Carbon` 对象：

```go
carbon.Parse("2020-08-05 13:14:15")
```

### `carbon.ParseByLayout()`

The `carbon.ParseByLayout()` function gets `Carbon` object by given value and layout:

```go
carbon.ParseByLayout("2020-08-05 13:14:15", carbon.DateTimeLayout)
carbon.ParseByFormat("2020|08|05 13|14|15", []string{"2006|01|02 15|04|05", "2006|1|2 3|4|5"})
```

### `carbon.ParseByFormat()`

通过指定格式模板解析 `Carbon` 对象:

```go
carbon.ParseByFormat("2020-08-05 13:14:15", carbon.DateTimeFormat)
carbon.ParseByFormat("2020|08|05 13|14|15", []string{"Y|m|d H|i|s", "y|m|d h|i|s"})
```

### `carbon.FromTimestamp()`

通过时间戳获取 `Carbon` 对象：

```go
carbon.FromTimestamp(1649735755)
```

### 获取当前时间：

`path.Lang()` 函数返回 `lang` 目录的路径。 您还可以使用 `path.Lang()` 函数生成 `lang` 目录中指定文件的路径：

```go
时间
```

### `carbon.FromTimestampMicro()`

将时间恢复为正常值：

```go
carbon.FromTimestampMicro(1649735755999999)
```

### `carbon.FromTimestampNano()`

`path.Storage()` 函数返回应用程序存储目录的路径。 您还可以使用 `path.Storage()` 函数生成 `storage` 目录中指定文件的路径：

```go
carbon.FromTimestampNano(1649735755999999999)
```

### `carbon.FromDateTime()`

通过日期时间获取 `Carbon` 对象：

```go
carbon.FromDateTime(2020, 1, 1, 0, 0, 0)
```

### `carbon.FromDateTimeMilli()`

将年、月、日、时、分、秒、毫秒格式化为 `Carbon` 对象：

```go
`convert.Default()` 方法返回第一个非零值。 如果所有值都为零，则返回零值。
```

### `carbon.FromDateTimeMicro()`

将年、月、日、时、分、秒、微妙格式化为 `Carbon` 对象：

```go
carbon.FromTime(0, 0, 0)
```

### `carbon.FromDateTimeNano()`

将年、月、日、时、分、秒、纳妙格式化为 `Carbon` 对象：

```go
carbon.FromDateTimeNano(2020, 1, 1, 0, 0, 0, 999999999)
```

### `carbon.FromDate()`

通过日期获取 `Carbon` 对象：

```go
carbon.FromDate(2020, 1, 1)
```

### `carbon.FromDateMilli()`

将年、月、日、毫秒格式化为 `Carbon` 对象：

```go
carbon.FromDateMilli(2020, 1, 1, 999)
```

### `carbon.FromDateMicro()`

将年、月、日、微秒格式化为 `Carbon` 对象：

```go
carbon.FromDateMicro(2020, 1, 1, 999999)
```

### `carbon.FromDateNano()`

将年、月、日、纳秒格式化为 `Carbon` 对象：

```go
carbon.FromDateNano(2020, 1, 1, 999999999)
```

### `carbon.FromTime()`

通过时间获取 `Carbon` 对象：

```go
carbon.FromTime(13, 14, 15)
```

### `carbon.FromTimeMilli()`

可以为 `maps.Pull()` 函数提供第三个参数作为默认值。 如果键在映射中不存在，将返回此值：

```go

import "github.com/goravel/framework/support/collect"

sum := collect.Sum([]int{1, 2, 3, 4, 5})

// 15
```

### `carbon.FromTimeMicro()`

辅助函数

```go
carbon.FromTimeMicro(13, 14, 15, 999999)
```

### 时间

函数 `collect.Split()` 将集合分割成给定长度的组。 如果集合无法被平均分割，最后一个块将包含剩余的项目：

```go
carbon.FromTimeNano(13, 14, 15, 999999999)
```

### `carbon.FromStdTime()`

通过 `time.Time` 获取 `Carbon` 对象：

```go
carbon.FromStdTime(time.Now())
```

## Debug

```go
import "github.com/goravel/framework/support/convert"

value := convert.With("Goravel", func(value string) string {
    return value + " Framework"
})
// Goravel Framework
```

### `debug.Dump()`

`debug.Dump()` 可以打印任何变量：

```go
debug.Dump(myVar1, myVar2, ...)
```

### `debug.FDump()`

`debug.FDump()` 可以将任何变量打印到 `io.Writer`：

```go
debug.FDump(someWriter, myVar1, myVar2, ...)
```

### `debug.SDump()`

`debug.SDump()` 可以将任何变量打印为 `string`：

```go
debug.SDump(myVar1, myVar2, ...)
```

## 映射

```go
import "github.com/goravel/framework/support/debug"

debug.SDump(myVar1, myVar2, ...)
```

### `maps.Add()`

`maps.Add()` 函数在给定的 map 中添加一个新的键值对，如果该键在 map 中不存在：

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Krishan"}
maps.Add(mp, "age", 22)
// map[string]any{"name": "Krishan", "age": 22}

mp2 := map[string]string{}
maps.Add(mp2, "name", "Bowen")
maps.Add(mp2, "name", "Krishan")
// map[string]string{"name": "Bowen"}
```

### `maps.Exists()`

`maps.Exists()` 函数用于确定给定的键是否存在于提供的映射中：

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Krishan", "age": 22}

exists := maps.Exists(mp, "name") // true

exists = maps.Exists(mp, "email") // false
```

### `maps.Forget()`

`maps.Forget()` 函数从提供的映射中移除给定的键（s）：

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]string{"name": "Krishan", "age": "22"}

maps.Forget(mp, "name", "age")
// map[string]string{}
```

### `maps.Get()`

`maps.Get()` 函数从提供的 map 中检索给定键的值。如果键不存在，则返回默认值： If the key does not exist, the default value will be returned:

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Bowen"}

value := maps.Get(mp, "name", "Krishan")
// Bowen

value = maps.Get(mp, "age", 22)
// 22
```

### `maps.Has()`

函数 `maps.Has()` 用于确定给定的键是否存在于提供的映射中：

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Goravel", "language": "Go"}

exists := maps.Has(mp, "name", "language")
// true

exists = maps.Has(mp, "name", "age")
// false
```

### `maps.HasAny()`

函数 `maps.HasAny()` 用于确定给定的任何键是否存在于提供的映射中：

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Goravel", "language": "Go"}

exists := maps.HasAny(mp, "name", "age")
// true

exists = maps.HasAny(mp, "age", "email")
// false
```

### `maps.Only()`

`maps.Only()` 函数从提供的映射中仅检索给定的键：

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Goravel", "language": "Go"}

newMap := maps.Only(mp, "name")
// map[string]any{"name": "Goravel"}

newMap = maps.Only(mp, "name", "age")
// map[string]any{"name": "Goravel"}
```

### `maps.Pull()`

`maps.Pull()` 函数从提供的映射中检索并移除给定的键：

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Goravel", "language": "Go"}

name := maps.Pull(mp, "name")
// name = "Goravel"
// mp = map[string]any{"language": "Go"}
```

`maps.Pull()` 可以设置默认值在第三个参数，如果键不存在，则返回默认值： This value will be returned if the key does not exist in the map:

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Goravel", "language": "Go"}

name := maps.Pull(mp, "age", "default")
// name = "default"
// mp = map[string]any{"name": "Goravel", "language": "Go"}
```

### `maps.Set()`

`maps.Set()` 函数在提供的映射中设置给定的键和值：

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Goravel"}

maps.Set(mp, "language", "Go")
// map[string]any{"name": "Goravel", "language": "Go"}
```

### `maps.Where()`

`maps.Where()` 函数使用给定的回调函数过滤提供的映射：

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]string{"name": "Goravel", "language": "Go"}

newMap := maps.Where(mp, func(key string, value string) bool {
    return key == "name"
})
// map[string]string{"name": "Goravel"}
```

## 转换

```go
import "github.com/goravel/framework/support/debug"

debug.Dump(myVar1, myVar2, ...)
```

### `convert.Tap()`

`convert.Tap()` 函数将给定值传递给提供的回调函数并返回该值：

```go
import "github.com/goravel/framework/support/convert"

value := convert.Tap("Goravel", func(value string) {
    fmt.Println(value + " Framework")
})
// Goravel

mp := map[string]string{"name": "Goravel"}
val := convert.Tap(mp, func(value map[string]string) {
    mp["language"] = "Go"
})
// map[string]string{"name": "Goravel", "language": "Go"}
```

### `convert.Transform()`

`convert.Transform()` 使用提供的回调函数转换给定值并返回结果：

```go
import "github.com/goravel/framework/support/convert"

value := convert.Transform(1, strconv.Itoa)
// "1"

val := convert.Transform("foo", func(s string) *foo {
      return &foo{Name: s}
})
// &foo{Name: "foo"}
```

### `convert.With()`

`convert.With()` 使用提供的值执行给定的回调并返回回调的结果：

```go
import "github.com/goravel/framework/support/debug"

debug.FDump(someWriter, myVar1, myVar2, ...)
```

### `convert.Default()`

`convert.Default()` 方法返回第一个非零值。如果所有值都为零，则返回零值。 If all values are zero, it returns zero value.

```go
import "github.com/goravel/framework/support/convert"

value := convert.Default("", "foo")
// foo

value = convert.Default("bar", "foo")
// bar

value = convert.Default(0, 1)
// 1
```

### `convert.Pointer()`

方法 `convert.Pointer()` 返回给定值的指针。

```go
import "github.com/goravel/framework/support/convert"

convert.Pointer("foo") // *string("foo")

convert.Pointer(1) // *int(1)
```

## 收集

```go
import "github.com/goravel/framework/support/collect"

min := collect.Min([]int{1, 2, 3, 4, 5})
// 1
```

### `collect.Count()`

函数 `collect.Count()` 返回给定集合中的项目数量：

```go
import "github.com/goravel/framework/support/collect"

collect.Count([]string{"Goravel", "Framework"})
// 2
```

### `collect.CountBy()`

函数 `collect.CountBy()` 计算谓词为真的出现次数：

```go
import "github.com/goravel/framework/support/collect"

collect.CountBy([]string{"Goravel", "Framework"}, func(value string) bool {
    return strings.Contains(value, "Goravel")
})
// 1
```

### `collect.Each()`

函数 `collect.Each()` 遍历给定集合中的项目，并将每个项目传递给给定的回调函数：

```go
import "github.com/goravel/framework/support/collect"

collect.Each([]string{"Goravel", "Framework"}, func(value string, index int) {
    fmt.Println(index + 1, value)
})
// 1 Goravel
// 2 Framework
```

### `collect.Filter()`

函数 `collect.Filter()` 使用给定的回调函数过滤集合中的项目：

```go
import "github.com/goravel/framework/support/collect"

newCollection := collect.Filter([]string{"Goravel", "Framework"}, func(value string) bool {
    return strings.Contains(value, "Goravel")
})

// []string{"Goravel"}
```

### `collect.GroupBy()`

函数 `collect.GroupBy()` 根据给定回调函数的结果对集合中的项目进行分组：

```go
import "github.com/goravel/framework/support/collect"

// 复杂映射切片的使用示例（使用不同的示例）
newCollection := collect.GroupBy([]map[string]string{
    {"class": "1", "Name": "Rohan"},
    {"class": "2", "Name": "Bowen"},
    {"class": "2", "Name": "Krishan"},
}, func(value map[string]string) string {
    return value["class"]
})

// map[string][]map[string]string{
//     "1": []map[string]string{{"class": "1", "Name": "Rohan"}},
//     "2": []map[string]string{{"class": "2", "Name": "Bowen"}, {"class": "2", "Name": "Krishan"}},
// }
```

### `collect.Keys()`

`collect.Keys()` 函数返回集合中所有项目的键：

```go
import "github.com/goravel/framework/support/collect"

keys := collect.Keys(map[string]string{"name": "Goravel", "language": "Go"})
// []string{"name", "language"}
```

### `collect.Map()`

`collect.Map()` 函数使用给定的迭代器将一种类型的集合转换为另一种类型：

```go
import "github.com/goravel/framework/support/collect"

newCollection := collect.Map([]string{"Goravel", "Framework"}, func(value string,  _ int) string {
    return strings.ToUpper(value)
})

// []string{"GORAVEL", "FRAMEWORK"}
```

### `collect.Max()`

`collect.Max()` 函数返回给定集合的最大值：

```go
collect.Max([]int{1, 2, 3, 4, 5}) // 5
```

### `collect.Merge()`

`collect.Merge()` 函数将给定的多个映射合并成一个单一的映射：

```go
import "github.com/goravel/framework/support/collect"

newMap := collect.Merge(map[string]string{"name": "Goravel"}, map[string]string{"language": "Go"})
// map[string]string{"name": "Goravel", "language": "Go"}

newMap = collect.Merge(map[string]string{"name": "Goravel"}, map[string]string{"name": "Framework"})
// map[string]string{"name": "Framework"}
```

### `collect.Min()`

函数 `collect.Min()` 返回给定集合中的最小值：

```go
collect.Min([]int{1, 2, 3, 4, 5}) // 1
```

### `collect.Reverse()`

函数 `collect.Reverse()` 反转集合中的项目：

```go
import "github.com/goravel/framework/support/collect"

newCollection := collect.Reverse([]string{"Goravel", "Framework"})

// []string{"Framework", "Goravel"}
```

### `collect.Shuffle()`

函数 `collect.Shuffle()` 打乱集合中的项目：

```go
import "github.com/goravel/framework/support/collect"

newCollection := collect.Shuffle([]int{1, 2, 3, 4, 5})

// []int{3, 1, 5, 2, 4}(示例)
```

### `collect.Split()`

`collect.Split()` 函数将集合分成给定长度的组。如果集合无法均匀分割，则最后一个块将包含剩余的项目： If the collection can't be split evenly, the final chunk will contain the remaining items:

```go
import "github.com/goravel/framework/support/collect"

newCollection := collect.Split([]int{1, 2, 3, 4, 5}, 2)

// [][]int{{1, 2}, {3, 4}, {5}}
```

### `collect.Sum()`

`collect.Sum()` 函数返回集合中所有项目的总和：

```go
collect.Sum([]int{1, 2, 3, 4, 5}) // 15
```

### `collect.Unique()`

`collect.Unique()` 方法返回去重后的集合，对于重复值，只保留第一次出现的值：

```go
import "github.com/goravel/framework/support/collect"

newCollection := collect.Unique([]string{"Goravel", "Framework", "Goravel"})

// []string{"Goravel", "Framework"}
```

### `collect.Values()`

函数 `collect.Values()` 返回给定集合的所有值：

```go
import "github.com/goravel/framework/support/collect"

values := collect.Values(map[string]string{"name": "Goravel", "language": "Go"})
// []string{"Goravel", "Go"}
```
