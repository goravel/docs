# Helpers

[[toc]]

## Available Methods

### Paths

|                                   |                                 |                               |
|-----------------------------------|---------------------------------|-------------------------------|
| [path.App()](#path-app)           | [path.Base()](#path-base)       | [path.Config()](#path-config) |
| [path.Database()](#path-database) | [path.Storage()](#path-storage) | [path.Public()](#path-public) |

### Time

|                                                       |                                                    |                                                       |
|-------------------------------------------------------|----------------------------------------------------|-------------------------------------------------------|
| [carbon.Now()](#carbon-now)                           | [carbon.SetTimezone()](#carbon-settimezone)        | [carbon.Parse()](#carbon-parse)                       |
| [carbon.FromTimestamp()](#carbon-fromtimestamp)       | [carbon.FromDateTime()](#carbon-fromdatetime)      | [carbon.FromDate()](#carbon-fromdate)                 |
| [carbon.FromTime()](#carbon-fromtime)                 | [carbon.FromStdTime()](#carbon-fromstdtime)        | [carbon.IsTestNow()](#carbon-istestnow)               |
| [carbon.SetTestNow()](#carbon-settestnow)             | [carbon.CleanTestNow()](#carbon-cleantestnow)      | [carbon.ParseByLayout()](#carbon-parsebylayout)       |
| [carbon.ParseWithLayouts()](#carbon-parsewithlayouts) | [carbon.ParseByFormat()](#carbon-parsewithlayouts) | [carbon.ParseWithFormats()](#carbon-parsewithformats) |

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

### `path.App()`

The `path.App()` function returns the absolute path to your application's app directory. You may also use the `path.App()` function to generate a path to a file relative to the application directory:

```go
import "github.com/goravel/framework/support/path"

path := path.App()
path := path.App("http/controllers/controller.go")
```

### `path.Base()`

The `path.Base()` function returns the absolute path to your application's root directory. You may also use the `path.Base()` function to generate a path to a given file relative to the project root directory:

```go
path := path.Base()
path := path.Base("vendor/bin")
```

### `path.Config()`

The `path.Config()` function returns the absolute path to your application's config directory. You may also use the `path.Config()` function to generate a path to a given file within the application's configuration directory:

```go
path := path.Config()
path := path.Config("app.go")
```

### `path.Database()`

The `path.Database()` function returns the absolute path to your application's database directory. You may also use the `path.Database()` function to generate a path to a given file within the `database` directory:

```go
path := path.Database()
path := path.Database("factories/user_factory.go")
```

### `path.Storage()`

The `path.Storage()` function returns the absolute path to your application's storage directory. You may also use the `path.Storage()` function to generate a path to a given file within the `storage` directory:

```go
path := path.Storage()
path := path.Storage("app/file.txt")
```

### `path.Public()`

The `path.Public()` function returns the absolute path to your application's public directory. You may also use the `path.Public()` function to generate a path to a given file within the `public` directory:

```go
path := path.Public()
path := path.Public("css/app.css")
```

### `path.Lang()`

The `path.Lang()` function returns the absolute path to the `lang` directory. You may also use the `path.Lang()` function to generate a path to a given file within the `lang` directory:

```go
path := path.Lang()
path := path.Lang("en.json")
```

### `path.Resource()`

The `path.Resource()` function returns the absolute path to the `resource` directory. You may also use the `path.Resource()` function to generate a path to a given file within the `resource` directory:

```go
path := path.Resource()
path := path.Resource("css/app.css")
```

## Time

The `carbon` module of Goravel is an expansion by [dromara/carbon](https://github.com/dromara/carbon), please refer to the official documentation for details.

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

### `carbon.ParseByLayout()`

Get `Carbon` object by given value and layout:

```go
carbon.ParseByLayout("2020-08-05 13:14:15", carbon.DateTimeLayout)
```

### `carbon.ParseByFormat()`

Get `Carbon` object by given value and format:

```go
carbon.ParseByFormat("2020-08-05 13:14:15", carbon.DateTimeFormat)
```

### `carbon.ParseWithLayouts()`

Get `Carbon` object with layouts:

```go
carbon.ParseWithLayouts("2020|08|05 13|14|15", []string{"2006|01|02 15|04|05", "2006|1|2 3|4|5"})
```

### `carbon.ParseWithFormats()`

Get `Carbon` object with formats:

```go
carbon.ParseWithFormats("2020|08|05 13|14|15", []string{"Y|m|d H|i|s", "y|m|d h|i|s"})
```

### `carbon.FromTimestamp()`

Get `Carbon` object by timestamp:

```go
carbon.FromTimestamp(1577836800)
```

### `carbon.FromDateTime()`

Get `Carbon` object by date time:

```go
carbon.FromDateTime(2020, 1, 1, 0, 0, 0)
```

### `carbon.FromDate()`

Get `Carbon` object by date:

```go
carbon.FromDate(2020, 1, 1)
```

### `carbon.FromTime()`

Get `Carbon` object by time:

```go
carbon.FromTime(0, 0, 0)
```

### `carbon.FromStdTime()`

Get `Carbon` object by `time.Time`:

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

### `carbon.CleanTestNow()`

Clear the test now Carbon object:

```go
carbon.CleanTestNow()
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

## Maps

### `maps.Add()`

The `maps.Add()` function adds a new key-value pair to the given map if the key does not already exist in the map:

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

The `maps.Exists()` function determines if the given key exists in the provided map:

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Krishan", "age": 22}

exists := maps.Exists(mp, "name") // true

exists = maps.Exists(mp, "email") // false
```

### `maps.Forget()`

The `maps.Forget()` function removes the given key(s) from the provided map:

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]string{"name": "Krishan", "age": "22"}

maps.Forget(mp, "name", "age")
// map[string]string{}
```

### `maps.Get()`

The `maps.Get()` function retrieves the value of the given key from the provided map. If the key does not exist, the default value will be returned:

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Bowen"}

value := maps.Get(mp, "name", "Krishan")
// Bowen

value = maps.Get(mp, "age", 22)
// 22
```

### `maps.Has()`

The `maps.Has()` function determines if the given key(s) exists in the provided map:

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Goravel", "language": "Go"}

exists := maps.Has(mp, "name", "language")
// true

exists = maps.Has(mp, "name", "age")
// false
```

### `maps.HasAny()`

The `maps.HasAny()` function determines if any of the given key(s) exists in the provided map:

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Goravel", "language": "Go"}

exists := maps.HasAny(mp, "name", "age")
// true

exists = maps.HasAny(mp, "age", "email")
// false
```

### `maps.Only()`

The `maps.Only()` function retrieves only the given key(s) from the provided map:

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Goravel", "language": "Go"}

newMap := maps.Only(mp, "name")
// map[string]any{"name": "Goravel"}

newMap = maps.Only(mp, "name", "age")
// map[string]any{"name": "Goravel"}
```

### `maps.Pull()`

The `maps.Pull()` function retrieves and removes the given key from the provided map:

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Goravel", "language": "Go"}

name := maps.Pull(mp, "name")
// name = "Goravel"
// mp = map[string]any{"language": "Go"}
```

A default value can be provided as the third argument to the `maps.Pull()` function. This value will be returned if the key does not exist in the map:

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Goravel", "language": "Go"}

name := maps.Pull(mp, "age", "default")
// name = "default"
// mp = map[string]any{"name": "Goravel", "language": "Go"}
```

### `maps.Set()`

The `maps.Set()` function sets the given key and value in the provided map:

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Goravel"}

maps.Set(mp, "language", "Go")
// map[string]any{"name": "Goravel", "language": "Go"}
```

### `maps.Where()`

The `maps.Where()` function filters the provided map using the given callback:

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

The `convert.Tap()` function passes the given value to the provided callback and returns the value:

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

The `convert.Transform()` transforms the given value using the provided callback and returns the result:

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

The `convert.With()` executes the given callback with the provided value and returns the result of the callback:

```go
import "github.com/goravel/framework/support/convert"

value := convert.With("Goravel", func(value string) string {
    return value + " Framework"
})
// Goravel Framework
```

### `convert.Default()`

The `convert.Default()` method returns first non-zero value. If all values are zero, it returns zero value.

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

The `convert.Pointer()` method returns the pointer of the given value.

```go
import "github.com/goravel/framework/support/convert"

convert.Pointer("foo") // *string("foo")

convert.Pointer(1) // *int(1)
```

## Collect

### `collect.Count()`

The `collect.Count()` function returns the number of items in the given collection:

```go
import "github.com/goravel/framework/support/collect"

collect.Count([]string{"Goravel", "Framework"})
// 2
```

### `collect.CountBy()`

The `collect.CountBy()` function counts the occurrences for which the predicate is true:

```go
import "github.com/goravel/framework/support/collect"

collect.CountBy([]string{"Goravel", "Framework"}, func(value string) bool {
    return strings.Contains(value, "Goravel")
})
// 1
```

### `collect.Each()`

The `collect.Each()` function iterates over the items in the given collection and passes each item to the given callback:

```go
import "github.com/goravel/framework/support/collect"

collect.Each([]string{"Goravel", "Framework"}, func(value string, index int) {
    fmt.Println(index + 1, value)
})
// 1 Goravel
// 2 Framework
```

### `collect.Filter()`

The `collect.Filter()` function filters the items in the collection using the given callback:

```go
import "github.com/goravel/framework/support/collect"

newCollection := collect.Filter([]string{"Goravel", "Framework"}, func(value string) bool {
    return strings.Contains(value, "Goravel")
})

// []string{"Goravel"}
```

### `collect.GroupBy()`

The `collect.GroupBy()` function groups the items in the collection by the result of the given callback:

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

The `collect.Keys()` function returns all the keys for the items in the collection:

```go
import "github.com/goravel/framework/support/collect"

keys := collect.Keys(map[string]string{"name": "Goravel", "language": "Go"})
// []string{"name", "language"}
```

### `collect.Map()`

The `collect.Map()` function converts one type of collection into another using the given iteratee:

```go
import "github.com/goravel/framework/support/collect"

newCollection := collect.Map([]string{"Goravel", "Framework"}, func(value string,  _ int) string {
    return strings.ToUpper(value)
})

// []string{"GORAVEL", "FRAMEWORK"}
```

### `collect.Max()`

The `collect.Max()` function returns the maximum value of the given collection:

```go
import "github.com/goravel/framework/support/collect"

max := collect.Max([]int{1, 2, 3, 4, 5})
// 5
```

### `collect.Merge()`

The `collect.Merge()` function merges the given maps into a single map:

```go
import "github.com/goravel/framework/support/collect"

newMap := collect.Merge(map[string]string{"name": "Goravel"}, map[string]string{"language": "Go"})
// map[string]string{"name": "Goravel", "language": "Go"}

newMap = collect.Merge(map[string]string{"name": "Goravel"}, map[string]string{"name": "Framework"})
// map[string]string{"name": "Framework"}
```

### `collect.Min()`

The `collect.Min()` function returns the minimum value of the given collection:

```go
import "github.com/goravel/framework/support/collect"

min := collect.Min([]int{1, 2, 3, 4, 5})
// 1
```

### `collect.Reverse()`

The `collect.Reverse()` function reverses the items in the collection:

```go
import "github.com/goravel/framework/support/collect"

newCollection := collect.Reverse([]string{"Goravel", "Framework"})

// []string{"Framework", "Goravel"}
```

### `collect.Shuffle()`

The `collect.Shuffle()` function shuffles the items in the collection:

```go
import "github.com/goravel/framework/support/collect"

newCollection := collect.Shuffle([]int{1, 2, 3, 4, 5})

// []int{3, 1, 5, 2, 4}(example)
```

### `collect.Split()`

The `collect.Split()` function splits a collection into the groups of the given length. If the collection can't be split evenly, the final chunk will contain the remaining items:

```go
import "github.com/goravel/framework/support/collect"

newCollection := collect.Split([]int{1, 2, 3, 4, 5}, 2)

// [][]int{{1, 2}, {3, 4}, {5}}
```

### `collect.Sum()`

The `collect.Sum()` function returns the sum of all items in the collection:

```go

import "github.com/goravel/framework/support/collect"

sum := collect.Sum([]int{1, 2, 3, 4, 5})

// 15
```

### `collect.Unique()`

The `collect.Unique()` method returns the duplicate-free collection where in case of duplicate values, only the first occurrence will be kept:

```go
import "github.com/goravel/framework/support/collect"

newCollection := collect.Unique([]string{"Goravel", "Framework", "Goravel"})

// []string{"Goravel", "Framework"}
```

### `collect.Values()`

The `collect.Values()` function returns all the values of the given collection:

```go
import "github.com/goravel/framework/support/collect"

values := collect.Values(map[string]string{"name": "Goravel", "language": "Go"})
// []string{"Goravel", "Go"}
```

<CommentService/>