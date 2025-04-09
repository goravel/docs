# 辅助函数

[[toc]]

## 可用方法

### 路径

|                                   |                                 |                               |
|-----------------------------------|---------------------------------|-------------------------------|
| [path.App()](#path-app)           | [path.Base()](#path-base)       | [path.Config()](#path-config) |
| [path.Database()](#path-database) | [path.Storage()](#path-storage) | [path.Public()](#path-public) |

### 时间

|                                                       |                                                    |                                                       |
|-------------------------------------------------------|----------------------------------------------------|-------------------------------------------------------|
| [carbon.Now()](#carbon-now)                           | [carbon.SetTimezone()](#carbon-settimezone)        | [carbon.Parse()](#carbon-parse)                       |
| [carbon.FromTimestamp()](#carbon-fromtimestamp)       | [carbon.FromDateTime()](#carbon-fromdatetime)      | [carbon.FromDate()](#carbon-fromdate)                 |
| [carbon.FromTime()](#carbon-fromtime)                 | [carbon.FromStdTime()](#carbon-fromstdtime)        | [carbon.IsTestNow()](#carbon-istestnow)               |
| [carbon.SetTestNow()](#carbon-settestnow)             | [carbon.CleanTestNow()](#carbon-cleantestnow)      | [carbon.ParseByLayout()](#carbon-parsebylayout)       |
| [carbon.ParseWithLayouts()](#carbon-parsewithlayouts) | [carbon.ParseByFormat()](#carbon-parsewithlayouts) | [carbon.ParseWithFormats()](#carbon-parsewithformats) |

### 调试

|                             |                               |                               |
|-----------------------------|-------------------------------|-------------------------------|
| [debug.Dump()](#debug-dump) | [debug.SDump()](#debug-sdump) | [debug.FDump()](#debug-fdump) |

### Maps

|                             |                               |                               |
|-----------------------------|-------------------------------|-------------------------------|
| [maps.Add()](#maps-add)     | [maps.Exists()](#maps-exists) | [maps.Forget()](#maps-forget) |
| [maps.Get()](#maps-get)     | [maps.Has()](#maps-has)       | [maps.HasAny()](#maps-hasany) |
| [maps.Only()](#maps-only)   | [maps.Pull()](#maps-pull)     | [maps.Set()](#maps-set)       |
| [maps.Where()](#maps-where) |                               |                               |

### 转换

|                                       |                                       |                                           |
|---------------------------------------|---------------------------------------|-------------------------------------------|
| [convert.Tap()](#convert-tap)         | [convert.With()](#convert-with)       | [convert.Transform()](#convert-transform) |
| [convert.Default()](#convert-default) | [convert.Pointer()](#convert-pointer) |                                           |

### 集合

|                                     |                                       |                                       |
|-------------------------------------|---------------------------------------|---------------------------------------|
| [collect.Count()](#collect-count)   | [collect.CountBy()](#collect-countby) | [collect.Each()](#collect-each)       |
| [collect.Filter()](#collect-filter) | [collect.GroupBy()](#collect-groupby) | [collect.Keys()](#collect-keys)       |
| [collect.Map()](#collect-map)       | [collect.Max()](#collect-max)         | [collect.Merge()](#collect-merge)     |
| [collect.Min()](#collect-min)       | [collect.Reverse()](#collect-reverse) | [collect.Shuffle()](#collect-shuffle) |
| [collect.Split()](#collect-split)   | [collect.Sum()](#collect-sum)         | [collect.Unique()](#collect-unique)   |
| [collect.Values()](#collect-values) |                                       |                                       |

## 路径

### `path.App()`

`path.App()` 函数返回 app 目录的绝对路径。你也可以用来生成应用目录下特定文件的路径：

```go
import "github.com/goravel/framework/support/path"

path := path.App()
path := path.App("http/controllers/controller.go")
```

### `path.Base()`

`path.Base()` 函数返回项目根目录的绝对路径。你也可以用来生成项目根目录下特定文件的路径：

```go
path := path.Base()
path := path.Base("vendor/bin")
```

### `path.Config()`

`path.Config()` 函数返回项目配置目录 (config) 的绝对路径。你也可以用来生成应用配置目录中的特定文件的路径：

```go
path := path.Config()
path := path.Config("app.go")
```

### `path.Database()`

`path.Database()` 函数返回 `database` 目录的绝对路径。你也可以用来生成数据库目录下特定文件的路径：

```go
path := path.Database()
path := path.Database("factories/user_factory.go")
```

### `path.Storage()`

`path.Storage()` 函数返回 `storage` 目录的绝对路径。你也可以用来生成位于资源路径中的特定路径：

```go
path := path.Storage()
path := path.Storage("app/file.txt")
```

### `path.Public()`

`path.Public()` 函数返回 `public` 目录的绝对路径。你也可以用来生成 `public` 目录下特定文件的路径：

```go
path := path.Public()
path := path.Public("css/app.css")
```

### `path.Lang()`

`path.Lang()` 函数返回 `lang` 目录的绝对路径。你也可以用来生成 `lang` 目录下特定文件的路径：

```go
path := path.Lang()
path := path.Lang("en.json")
```

### `path.Resource()`

`path.Resource()` 函数返回 `resource` 目录的绝对路径。你也可以用来生成 `resource` 目录下特定文件的路径：

```go
path := path.Resource()
path := path.Resource("css/app.css")
```

## 时间

Goravel 的 `carbon` 是 [dromara/carbon](https://github.com/dromara/carbon) 的一个扩展，详细用法请参考其官方文档。

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

### `carbon.ParseByLayout()`

通过指定布局模板解析 `Carbon` 对象:

```go
carbon.ParseByLayout("2020-08-05 13:14:15", carbon.DateTimeLayout)
```

### `carbon.ParseByFormat()`

通过指定格式模板解析 `Carbon` 对象:

```go
carbon.ParseByFormat("2020-08-05 13:14:15", carbon.DateTimeFormat)
```

### `carbon.ParseWithLayouts()`

通过自定义布局模板将时间字符串解析成 `Carbon` 对象:

```go
carbon.ParseWithLayouts("2020|08|05 13|14|15", []string{"2006|01|02 15|04|05", "2006|1|2 3|4|5"})
```

### `carbon.ParseWithFormats()`

通过自定义格式模板将时间字符串解析成 `Carbon` 对象

```go
carbon.ParseWithFormats("2020|08|05 13|14|15", []string{"Y|m|d H|i|s", "y|m|d h|i|s"})
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

### `carbon.CleanTestNow()`

清除系统时间为正常值：

```go
carbon.CleanTestNow()
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

## Maps

### `maps.Add()`

`maps.Add()` 方法用于向给定的 map 中添加不存在的键值对：

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

`maps.Exists()` 函数用于判断给定的键是否存在于提供的 map 中：

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Krishan", "age": 22}

exists := maps.Exists(mp, "name") // true

exists = maps.Exists(mp, "email") // false
```

### `maps.Forget()`

`maps.Forget()` 函数用于从提供的 map 中移除给定的键：

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]string{"name": "Krishan", "age": "22"}

maps.Forget(mp, "name", "age")
// map[string]string{}
```

### `maps.Get()`

`maps.Get()` 函数从提供的 map 中检索给定键的值。如果键不存在，则返回默认值：

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Bowen"}

value := maps.Get(mp, "name", "Krishan")
// Bowen

value = maps.Get(mp, "age", 22)
// 22
```

### `maps.Has()`

`maps.Has()` 函数用于判断给定的键是否存在于提供的 map 中：

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Goravel", "language": "Go"}

exists := maps.Has(mp, "name", "language")
// true

exists = maps.Has(mp, "name", "age")
// false
```

### `maps.HasAny()`

`maps.HasAny()` 函数用于判断给定的任意键是否存在于提供的 map 中：

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Goravel", "language": "Go"}

exists := maps.HasAny(mp, "name", "age")
// true

exists = maps.HasAny(mp, "age", "email")
// false
```

### `maps.Only()`

`maps.Only()` 函数从提供的 map 中检索给定的键：

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Goravel", "language": "Go"}

newMap := maps.Only(mp, "name")
// map[string]any{"name": "Goravel"}

newMap = maps.Only(mp, "name", "age")
// map[string]any{"name": "Goravel"}
```

### `maps.Pull()`

`maps.Pull()` 函数从提供的 map 中检索并移除给定的键：

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Goravel", "language": "Go"}

name := maps.Pull(mp, "name")
// name = "Goravel"
// mp = map[string]any{"language": "Go"}
```

`maps.Pull()` 可以设置默认值在第三个参数，如果键不存在，则返回默认值：

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Goravel", "language": "Go"}

name := maps.Pull(mp, "age", "default")
// name = "default"
// mp = map[string]any{"name": "Goravel", "language": "Go"}
```

### `maps.Set()`

`maps.Set()` 函数用于在提供的 map 中设置给定的键和值：

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Goravel"}

maps.Set(mp, "language", "Go")
// map[string]any{"name": "Goravel", "language": "Go"}
```

### `maps.Where()`

`maps.Where()` 函数使用给定的回调函数过滤提供的 map：

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]string{"name": "Goravel", "language": "Go"}

newMap := maps.Where(mp, func(key string, value string) bool {
    return key == "name"
})
// map[string]string{"name": "Goravel"}
```

## Convert

### `convert.Tap()`

`convert.Tap()` 函数将给定的值传递给提供的回调函数，并返回该值：

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

`convert.Transform()` 函数使用提供的回调函数转换给定的值，并返回结果：

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

`convert.With()` 函数使用提供的值执行给定的回调函数，并返回回调函数的结果：

```go
import "github.com/goravel/framework/support/convert"

value := convert.With("Goravel", func(value string) string {
    return value + " Framework"
})
// Goravel Framework
```

### `convert.Default()`

`convert.Default()` 方法返回第一个非零值。如果所有值都为零，则返回零值。

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

`convert.Pointer()` 函数返回给定值的指针。

```go
import "github.com/goravel/framework/support/convert"

convert.Pointer("foo") // *string("foo")

convert.Pointer(1) // *int(1)
```

## Collect

### `collect.Count()`

`collect.Count()` 函数返回给定集合中的项目数：

```go
import "github.com/goravel/framework/support/collect"

collect.Count([]string{"Goravel", "Framework"})
// 2
```

### `collect.CountBy()`

`collect.CountBy()` 函数统计返回值为 true 的出现次数：

```go
import "github.com/goravel/framework/support/collect"

collect.CountBy([]string{"Goravel", "Framework"}, func(value string) bool {
    return strings.Contains(value, "Goravel")
})
// 1
```

### `collect.Each()`

`collect.Each()` 函数迭代给定集合中的项目，并将每个项目传递给给定的回调函数：

```go
import "github.com/goravel/framework/support/collect"

collect.Each([]string{"Goravel", "Framework"}, func(value string, index int) {
    fmt.Println(index + 1, value)
})
// 1 Goravel
// 2 Framework
```

### `collect.Filter()`

`collect.Filter()` 函数使用给定的回调函数过滤集合中的项目：

```go
import "github.com/goravel/framework/support/collect"

newCollection := collect.Filter([]string{"Goravel", "Framework"}, func(value string) bool {
    return strings.Contains(value, "Goravel")
})

// []string{"Goravel"}
```

### `collect.GroupBy()`

`collect.GroupBy()` 函数根据给定回调函数的结果对集合中的项目进行分组：

```go
import "github.com/goravel/framework/support/collect"

// use example of complex map slice (use different example)
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
import "github.com/goravel/framework/support/collect"

max := collect.Max([]int{1, 2, 3, 4, 5})
// 5
```

### `collect.Merge()`

`collect.Merge()` 函数将给定的 map 合并为一个 map：

```go
import "github.com/goravel/framework/support/collect"

newMap := collect.Merge(map[string]string{"name": "Goravel"}, map[string]string{"language": "Go"})
// map[string]string{"name": "Goravel", "language": "Go"}

newMap = collect.Merge(map[string]string{"name": "Goravel"}, map[string]string{"name": "Framework"})
// map[string]string{"name": "Framework"}
```

### `collect.Min()`

`collect.Min()` 函数返回给定集合的最小值：

```go
import "github.com/goravel/framework/support/collect"

min := collect.Min([]int{1, 2, 3, 4, 5})
// 1
```

### `collect.Reverse()`

`collect.Reverse()` 函数反转集合中的项目：

```go
import "github.com/goravel/framework/support/collect"

newCollection := collect.Reverse([]string{"Goravel", "Framework"})

// []string{"Framework", "Goravel"}
```

### `collect.Shuffle()`

`collect.Shuffle()` 函数随机打乱集合中的项目：

```go
import "github.com/goravel/framework/support/collect"

newCollection := collect.Shuffle([]int{1, 2, 3, 4, 5})

// []int{3, 1, 5, 2, 4}(example)
```

### `collect.Split()`

`collect.Split()` 函数将集合分成给定长度的组。如果集合无法均匀分割，则最后一个块将包含剩余的项目：

```go
import "github.com/goravel/framework/support/collect"

newCollection := collect.Split([]int{1, 2, 3, 4, 5}, 2)

// [][]int{{1, 2}, {3, 4}, {5}}
```

### `collect.Sum()`

`collect.Sum()` 函数返回集合中所有项目的总和：

```go

import "github.com/goravel/framework/support/collect"

sum := collect.Sum([]int{1, 2, 3, 4, 5})

// 15
```

### `collect.Unique()`

`collect.Unique()` 函数返回无重复的集合，如果有重复值，则只保留第一次出现的值：

```go
import "github.com/goravel/framework/support/collect"

newCollection := collect.Unique([]string{"Goravel", "Framework", "Goravel"})

// []string{"Goravel", "Framework"}
```

### `collect.Values()`

`collect.Values()` 函数返回给定集合的所有值：

```go
import "github.com/goravel/framework/support/collect"

values := collect.Values(map[string]string{"name": "Goravel", "language": "Go"})
// []string{"Goravel", "Go"}
```

<CommentService/>