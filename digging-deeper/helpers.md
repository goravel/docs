# Helpers

[[toc]]

## Available Methods

### Paths

|                                   |                                 |                               |
|-----------------------------------|---------------------------------|-------------------------------|
| [path.App()](#path-app)           | [path.Base()](#path-base)       | [path.Config()](#path-config) |
| [path.Database()](#path-database) | [path.Storage()](#path-storage) | [path.Public()](#path-public) |

### Carbon

|                                                         |                                                                |                                                           |
|---------------------------------------------------------|----------------------------------------------------------------|-----------------------------------------------------------|
| [carbon.Now()](#carbon-now)                             | [carbon.SetTimezone()](#carbon-settimezone)                    | [carbon.SetLocale()](#carbon-setlocale)                   |
| [carbon.SetTestNow()](#carbon-settestnow)               | [carbon.ClearTestNow()](#carbon-cleartestnow)                  | [carbon.IsTestNow()](#carbon-istestnow)                   |
| [carbon.Parse()](#carbon-parse)                         | [carbon.ParseByLayout()](#carbon-parsebylayout)                | [carbon.ParseByFormat()](#carbon-parsebyformat)           |
| [carbon.FromTimestamp()](#carbon-fromtimestamp)         | [carbon.FromTimestampMilli()](#carbon-fromtimestampmilli)      | [carbon.FromTimestampMicro()](#carbon-fromtimestampmicro) |
| [carbon.FromTimestampNano()](#carbon-fromtimestampnano) | [carbon.FromDateTime()](#carbon-fromdatetime)                  | [carbon.FromDateTimeMilli()](#carbon-fromdatetimemilli)   |
| [carbon.FromDateTimeMicro()](#carbon-fromdatetimemicro) | [carbon.FromDateTimeNano()](#carbon-fromdatetimenano)          | [carbon.FromDate()](#carbon-fromdate)                     |
| [carbon.FromDateMilli()](#carbon-fromdatemilli)         | [carbon.FromDateMicro()](#carbon-fromdatemicro)                | [carbon.FromDateNano()](#carbon-fromdatenano)             |
| [carbon.FromTime()](#carbon-fromtime)                   | [carbon.FromTimeMilli()](#carbon-fromtimemilli)                | [carbon.FromTimeMicro()](#carbon-fromtimemicro)           |
| [carbon.FromTimeNano()](#carbon-fromtimenano)           | [carbon.FromStdTime()](#carbon-fromstdtime)                    |                                                           |

### Debug

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

### Convert

|                                       |                                       |                                           |
|---------------------------------------|---------------------------------------|-------------------------------------------|
| [convert.Tap()](#convert-tap)         | [convert.With()](#convert-with)       | [convert.Transform()](#convert-transform) |
| [convert.Default()](#convert-default) | [convert.Pointer()](#convert-pointer) |                                           |

### Collect

|                                     |                                       |                                       |
|-------------------------------------|---------------------------------------|---------------------------------------|
| [collect.Count()](#collect-count)   | [collect.CountBy()](#collect-countby) | [collect.Each()](#collect-each)       |
| [collect.Filter()](#collect-filter) | [collect.GroupBy()](#collect-groupby) | [collect.Keys()](#collect-keys)       |
| [collect.Map()](#collect-map)       | [collect.Max()](#collect-max)         | [collect.Merge()](#collect-merge)     |
| [collect.Min()](#collect-min)       | [collect.Reverse()](#collect-reverse) | [collect.Shuffle()](#collect-shuffle) |
| [collect.Split()](#collect-split)   | [collect.Sum()](#collect-sum)         | [collect.Unique()](#collect-unique)   |
| [collect.Values()](#collect-values) |                                       |                                       |

## Paths

```go
import "github.com/goravel/framework/support/path"
```

### `path.App()`

The `path.App()` function returns the path to your application's app directory. You may also use the `path.App()` function to generate a path to a file relative to the application directory:

```go
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

The `path.Database()` function returns the path to your application's database directory. You may also use the `path.Database()` function to generate a path to a given file within the `database` directory:

```go
path := path.Database()
path := path.Database("factories/user_factory.go")
```

### `path.Storage()`

The `path.Storage()` function returns the path to your application's storage directory. You may also use the `path.Storage()` function to generate a path to a given file within the `storage` directory:

```go
path := path.Storage()
path := path.Storage("app/file.txt")
```

### `path.Public()`

The `path.Public()` function returns the path to your application's public directory. You may also use the `path.Public()` function to generate a path to a given file within the `public` directory:

```go
path := path.Public()
path := path.Public("css/app.css")
```

### `path.Lang()`

The `path.Lang()` function returns the path to the `lang` directory. You may also use the `path.Lang()` function to generate a path to a given file within the `lang` directory:

```go
path := path.Lang()
path := path.Lang("en.json")
```

## Carbon

The `carbon` module of Goravel is an expansion by [dromara/carbon](https://github.com/dromara/carbon), please refer to the official documentation for details.

```go
import "github.com/goravel/framework/support/carbon"
```

### `carbon.Now()`

The `carbon.Now()` function gets current time:

```go
carbon.Now()
```

### `carbon.SetTimezone()`

The `carbon.SetTimezone()` function sets timezone：

```go
carbon.SetTimezone(carbon.UTC)
```

### `carbon.SetLocale()`

The `carbon.SetLocale()` function sets language locale, refer to [locales list](https://github.com/dromara/carbon/tree/master/lang) for all supported locales：

```go
carbon.SetLocale("en")
```

### `carbon.SetTestNow()`

The `carbon.SetTestNow()` function sets the time to a test value:

```go
carbon.SetTestNow(carbon.Now())
```

### `carbon.CleanTestNow()`

The `carbon.CleanTestNow()` function clears the test now Carbon object:

```go
carbon.CleanTestNow()
```

### `carbon.IsTestNow()`

The `carbon.IsTestNow()` function determines whether the time is a test value:

```go
carbon.IsTestNow()
```

### `carbon.Parse()`

The `carbon.Parse()` function gets `Carbon` object by String:

```go
carbon.Parse("2020-08-05 13:14:15")
```

### `carbon.ParseByLayout()`

The `carbon.ParseByLayout()` function gets `Carbon` object by given value and layout:

```go
carbon.ParseByLayout("2020-08-05 13:14:15", carbon.DateTimeLayout)
carbon.ParseByLayout("2020|08|05 13|14|15", []string{"2006|01|02 15|04|05", "2006|1|2 3|4|5"})
```

### `carbon.ParseByFormat()`

The `carbon.ParseByFormat()` function gets `Carbon` object by given value and format:

```go
carbon.ParseByFormat("2020-08-05 13:14:15", carbon.DateTimeFormat)
carbon.ParseByFormat("2020|08|05 13|14|15", []string{"Y|m|d H|i|s", "y|m|d h|i|s"})
```

### `carbon.FromTimestamp()`

The `carbon.FromTimestamp()` function gets `Carbon` object by timestamp with second precision:

```go
carbon.FromTimestamp(1577836800)
```

### `carbon.FromTimestampMilli()`

The `carbon.FromTimestampMilli()` function gets `Carbon` object by timestamp with millisecond precision:

```go
carbon.FromTimestampMilli(1649735755999)
```

### `carbon.FromTimestampMicro()`

The `carbon.FromTimestampMicro()` function gets `Carbon` object by timestamp with microsecond precision:

```go
carbon.FromTimestampMicro(1649735755999999)
```

### `carbon.FromTimestampNano()`

The `carbon.FromTimestampNano()` function gets `Carbon` object by timestamp with nanosecond precision:

```go
carbon.FromTimestampNano(1649735755999999999)
```

### `carbon.FromDateTime()`

The `carbon.FromDateTime()` function gets `Carbon` object by year, month, day, hour, minute, second:

```go
carbon.FromDateTime(2020, 1, 1, 0, 0, 0)
```

### `carbon.FromDateTimeMilli()`

The `carbon.FromDateTimeMilli()` function gets `Carbon` object by year, month, day, hour, minute, second, millisecond:

```go
carbon.FromDateTimeMilli(2020, 1, 1, 0, 0, 0, 999)
```

### `carbon.FromDateTimeMicro()`

The `carbon.FromDateTimeMicro()` function gets `Carbon` object by year, month, day, hour, minute, second, microsecond:

```go
carbon.FromDateTimeMicro(2020, 1, 1, 0, 0, 0, 999999)
```

### `carbon.FromDateTimeNano()`

The `carbon.FromDateTimeNano()` function gets `Carbon` object by year, month, day, hour, minute, second, nanosecond:

```go
carbon.FromDateTimeNano(2020, 1, 1, 0, 0, 0, 999999999)
```

### `carbon.FromDate()`

The `carbon.FromDate()` function gets `Carbon` object by year, month, day:

```go
carbon.FromDate(2020, 1, 1)
```

### `carbon.FromDateMilli()`

The `carbon.FromDateMilli()` function gets `Carbon` object by year, month, day, millisecond:

```go
carbon.FromDateMilli(2020, 1, 1, 999)
```

### `carbon.FromDateMicro()`

The `carbon.FromDateMicro()` function gets `Carbon` object by year, month, day, microsecond:

```go
carbon.FromDateMicro(2020, 1, 1, 999999)
```

### `carbon.FromDateNano()`

The `carbon.FromDateNano()` function gets `Carbon` object by year, month, day, nanosecond:

```go
carbon.FromDateNano(2020, 1, 1, 999999999)
```

### `carbon.FromTime()`

The `carbon.FromTime()` function gets `Carbon` object by hour, minute, second:

```go
carbon.FromTime(13, 14, 15)
```

### `carbon.FromTimeMilli()`

The `carbon.FromTimeMilli()` function gets `Carbon` object by hour, minute, second, millisecond:

```go
carbon.FromTimeMilli(13, 14, 15, 999)
```

### `carbon.FromTimeMicro()`

The `carbon.FromTimeMicro()` function gets `Carbon` object by hour, minute, second, microsecond:

```go
carbon.FromTimeMicro(13, 14, 15, 999999)
```

### `carbon.FromTimeNano()`

The `carbon.FromTimeNano()` function gets `Carbon` object by hour, minute, second, nanosecond:

```go
carbon.FromTimeNano(13, 14, 15, 999999999)
```


### `carbon.FromStdTime()`

The `carbon.FromStdTime()` function gets `Carbon` object by `time.Time`:

```go
carbon.FromStdTime(time.Now())
```

## Debug

```go
import "github.com/goravel/framework/support/debug"
```

### `debug.Dump()`

The `debug.Dump()` function prints any variable:

```go
debug.Dump(myVar1, myVar2, ...)
```

### `debug.FDump()`

The `debug.FDump()` function prints any variable to `io.Writer`:

```go
debug.FDump(someWriter, myVar1, myVar2, ...)
```

### `debug.SDump()`

The `debug.SDump()` function prints any variable to `string`:

```go
debug.SDump(myVar1, myVar2, ...)
```

## Maps

```go
import "github.com/goravel/framework/support/maps"
```

### `maps.Add()`

The `maps.Add()` function adds a new key-value pair to the given map if the key does not already exist in the map:

```go
mp := map[string]any{"name": "Krishan"}
maps.Add(mp, "age", 22)
// map[string]any{"name": "Krishan", "age": 22}

mp2 := map[string]string{}
maps.Add(mp2, "name", "Bowen")
maps.Add(mp2, "name", "Krishan")
// map[string]string{"name": "Bowen"}
```

### `maps.Exists()`

The `maps.Exists()` function determines if the given key exists in the provided map:

```go
mp := map[string]any{"name": "Krishan", "age": 22}

maps.Exists(mp, "name") // true

maps.Exists(mp, "email") // false
```

### `maps.Forget()`

The `maps.Forget()` function removes the given key(s) from the provided map:

```go
mp := map[string]string{"name": "Krishan", "age": "22"}

maps.Forget(mp, "name", "age")
// map[string]string{}
```

### `maps.Get()`

The `maps.Get()` function retrieves the value of the given key from the provided map. If the key does not exist, the default value will be returned:

```go
mp := map[string]any{"name": "Bowen"}

maps.Get(mp, "name", "Krishan") // Bowen

maps.Get(mp, "age", 22) // 22
```

### `maps.Has()`

The `maps.Has()` function determines if the given key(s) exists in the provided map:

```go
mp := map[string]any{"name": "Goravel", "language": "Go"}

maps.Has(mp, "name", "language") // true

maps.Has(mp, "name", "age") // false
```

### `maps.HasAny()`

The `maps.HasAny()` function determines if any of the given key(s) exists in the provided map:

```go
mp := map[string]any{"name": "Goravel", "language": "Go"}

maps.HasAny(mp, "name", "age") // true

maps.HasAny(mp, "age", "email") // false
```

### `maps.Only()`

The `maps.Only()` function retrieves only the given key(s) from the provided map:

```go
mp := map[string]any{"name": "Goravel", "language": "Go"}

maps.Only(mp, "name")
// map[string]any{"name": "Goravel"}

maps.Only(mp, "name", "age")
// map[string]any{"name": "Goravel"}
```

### `maps.Pull()`

The `maps.Pull()` function retrieves and removes the given key from the provided map:

```go
mp := map[string]any{"name": "Goravel", "language": "Go"}

maps.Pull(mp, "name")
// map[string]any{"language": "Go"}
```

A default value can be provided as the third argument to the `maps.Pull()` function. This value will be returned if the key does not exist in the map:

```go
mp := map[string]any{"name": "Goravel", "language": "Go"}

maps.Pull(mp, "age", "default")
// map[string]any{"name": "Goravel", "language": "Go"}
```

### `maps.Set()`

The `maps.Set()` function sets the given key and value in the provided map:

```go
mp := map[string]any{"name": "Goravel"}

maps.Set(mp, "language", "Go")
// map[string]any{"name": "Goravel", "language": "Go"}
```

### `maps.Where()`

The `maps.Where()` function filters the provided map using the given callback:

```go
mp := map[string]string{"name": "Goravel", "language": "Go"}

maps.Where(mp, func(key string, value string) bool {
    return key == "name"
})
// map[string]string{"name": "Goravel"}
```

## Convert

```go
import "github.com/goravel/framework/support/convert"
```

### `convert.Tap()`

The `convert.Tap()` function passes the given value to the provided callback and returns the value:

```go
convert.Tap("Goravel", func(value string) {
    fmt.Println(value + " Framework")
})
// Goravel

mp := map[string]string{"name": "Goravel"}
convert.Tap(mp, func(value map[string]string) {
    mp["language"] = "Go"
})
// map[string]string{"name": "Goravel", "language": "Go"}
```

### `convert.Transform()`

The `convert.Transform()` transforms the given value using the provided callback and returns the result:

```go
convert.Transform(1, strconv.Itoa)
// "1"

convert.Transform("foo", func(s string) *foo {
    return &foo{Name: s}
})
// &foo{Name: "foo"}
```

### `convert.With()`

The `convert.With()` executes the given callback with the provided value and returns the result of the callback:

```go
convert.With("Goravel", func(value string) string {
    return value + " Framework"
})
// Goravel Framework
```

### `convert.Default()`

The `convert.Default()` method returns first non-zero value. If all values are zero, it returns zero value.

```go
convert.Default("", "foo") // foo

convert.Default("bar", "foo") // bar

convert.Default(0, 1) // 1
```

### `convert.Pointer()`

The `convert.Pointer()` method returns the pointer of the given value.

```go
convert.Pointer("foo") // *string("foo")

convert.Pointer(1) // *int(1)
```

## Collect

```go
import "github.com/goravel/framework/support/collect"
```

### `collect.Count()`

The `collect.Count()` function returns the number of items in the given collection:

```go
collect.Count([]string{"Goravel", "Framework"}) // 2
```

### `collect.CountBy()`

The `collect.CountBy()` function counts the occurrences for which the predicate is true:

```go
collect.CountBy([]string{"Goravel", "Framework"}, func(value string) bool {
    return strings.Contains(value, "Goravel")
})
// 1
```

### `collect.Each()`

The `collect.Each()` function iterates over the items in the given collection and passes each item to the given callback:

```go
collect.Each([]string{"Goravel", "Framework"}, func(value string, index int) {
    fmt.Println(index + 1, value)
})
// 1 Goravel
// 2 Framework
```

### `collect.Filter()`

The `collect.Filter()` function filters the items in the collection using the given callback:

```go
collect.Filter([]string{"Goravel", "Framework"}, func(value string) bool {
    return strings.Contains(value, "Goravel")
})
// []string{"Goravel"}
```

### `collect.GroupBy()`

The `collect.GroupBy()` function groups the items in the collection by the result of the given callback:

```go
// use example of complex map slice (use different example)
collect.GroupBy([]map[string]string{
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

The `collect.Keys()` function returns all the keys for the items in the collection:

```go
collect.Keys(map[string]string{"name": "Goravel", "language": "Go"})
// []string{"name", "language"}
```

### `collect.Map()`

The `collect.Map()` function converts one type of collection into another using the given iteratee:

```go
collect.Map([]string{"Goravel", "Framework"}, func(value string,  _ int) string {
    return strings.ToUpper(value)
})
// []string{"GORAVEL", "FRAMEWORK"}
```

### `collect.Max()`

The `collect.Max()` function returns the maximum value of the given collection:

```go
collect.Max([]int{1, 2, 3, 4, 5}) // 5
```

### `collect.Merge()`

The `collect.Merge()` function merges the given maps into a single map:

```go
collect.Merge(map[string]string{"name": "Goravel"}, map[string]string{"language": "Go"})
// map[string]string{"name": "Goravel", "language": "Go"}

collect.Merge(map[string]string{"name": "Goravel"}, map[string]string{"name": "Framework"})
// map[string]string{"name": "Framework"}
```

### `collect.Min()`

The `collect.Min()` function returns the minimum value of the given collection:

```go
collect.Min([]int{1, 2, 3, 4, 5}) // 1
```

### `collect.Reverse()`

The `collect.Reverse()` function reverses the items in the collection:

```go
collect.Reverse([]string{"Goravel", "Framework"})
// []string{"Framework", "Goravel"}
```

### `collect.Shuffle()`

The `collect.Shuffle()` function shuffles the items in the collection:

```go
collect.Shuffle([]int{1, 2, 3, 4, 5})
// []int{3, 1, 5, 2, 4}(example)
```

### `collect.Split()`

The `collect.Split()` function splits a collection into the groups of the given length. If the collection can't be split evenly, the final chunk will contain the remaining items:

```go
collect.Split([]int{1, 2, 3, 4, 5}, 2)
// [][]int{{1, 2}, {3, 4}, {5}}
```

### `collect.Sum()`

The `collect.Sum()` function returns the sum of all items in the collection:

```go
collect.Sum([]int{1, 2, 3, 4, 5}) // 15
```

### `collect.Unique()`

The `collect.Unique()` method returns the duplicate-free collection where in case of duplicate values, only the first occurrence will be kept:

```go
collect.Unique([]string{"Goravel", "Framework", "Goravel"})
// []string{"Goravel", "Framework"}
```

### `collect.Values()`

The `collect.Values()` function returns all the values of the given collection:

```go
collect.Values(map[string]string{"name": "Goravel", "language": "Go"})
// []string{"Goravel", "Go"}
```

<CommentService/>