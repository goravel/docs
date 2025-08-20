# 輔助函數

[[toc]]

## 可用方法

### 路徑

|                                                                      |                                                                    |                                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| [path.App()](#path-app)           | [path.Base()](#path-base)       | [path.Config()](#path-config) |
| [path.Database()](#path-database) | [path.Storage()](#path-storage) | [path.Public()](#path-public) |
| [path.Resource()](#path-resource) |                                                                    |                                                                  |

### Carbon

|                                                                                            |                                                                                              |                                                                                              |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [carbon.Now()](#carbon-now)                             | [carbon.SetTimezone()](#carbon-settimezone)               | [carbon.SetLocale()](#carbon-setlocale)                   |
| [carbon.SetTestNow()](#carbon-settestnow)               | [carbon.ClearTestNow()](#carbon-cleartestnow)             | [carbon.IsTestNow()](#carbon-istestnow)                   |
| [carbon.Parse()](#carbon-parse)                         | [carbon.ParseByLayout()](#carbon-parsebylayout)           | [carbon.ParseByFormat()](#carbon-parsebyformat)           |
| [carbon.FromTimestamp()](#carbon-fromtimestamp)         | [carbon.FromTimestampMilli()](#carbon-fromtimestampmilli) | [carbon.FromTimestampMicro()](#carbon-fromtimestampmicro) |
| [carbon.FromTimestampNano()](#carbon-fromtimestampnano) | [carbon.FromDateTime()](#carbon-fromdatetime)             | [carbon.FromDateTimeMilli()](#carbon-fromdatetimemilli)   |
| [carbon.FromDateTimeMicro()](#carbon-fromdatetimemicro) | [carbon.FromDateTimeNano()](#carbon-fromdatetimenano)     | [carbon.FromDate()](#carbon-fromdate)                     |
| [carbon.FromDateMilli()](#carbon-fromdatemilli)         | [carbon.FromDateMicro()](#carbon-fromdatemicro)           | [carbon.FromDateNano()](#carbon-fromdatenano)             |
| [carbon.FromTime()](#carbon-fromtime)                   | [carbon.FromTimeMilli()](#carbon-fromtimemilli)           | [carbon.FromTimeMicro()](#carbon-fromtimemicro)           |
| [carbon.FromTimeNano()](#carbon-fromtimenano)           | [carbon.FromStdTime()](#carbon-fromstdtime)               |                                                                                              |

### Debug

|                                                                |                                                                  |                                                                  |
| -------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| [debug.Dump()](#debug-dump) | [debug.SDump()](#debug-sdump) | [debug.FDump()](#debug-fdump) |

### Maps

|                                                                |                                                                  |                                                                  |
| -------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| [maps.Add()](#maps-add)     | [maps.Exists()](#maps-exists) | [maps.Forget()](#maps-forget) |
| [maps.Get()](#maps-get)     | [maps.Has()](#maps-has)       | [maps.HasAny()](#maps-hasany) |
| [maps.Only()](#maps-only)   | [maps.Pull()](#maps-pull)     | [maps.Set()](#maps-set)       |
| [maps.Where()](#maps-where) |                                                                  |                                                                  |

### Convert

|                                                                          |                                                                          |                                                                              |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| [convert.Tap()](#convert-tap)         | [convert.With()](#convert-with)       | [convert.Transform()](#convert-transform) |
| [convert.Default()](#convert-default) | [convert.Pointer()](#convert-pointer) |                                                                              |

### Collect

|                                                                        |                                                                          |                                                                          |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| [collect.Count()](#collect-count)   | [collect.CountBy()](#collect-countby) | [collect.Each()](#collect-each)       |
| [collect.Filter()](#collect-filter) | [collect.GroupBy()](#collect-groupby) | [collect.Keys()](#collect-keys)       |
| [collect.Map()](#collect-map)       | [collect.Max()](#collect-max)         | [collect.Merge()](#collect-merge)     |
| [collect.Min()](#collect-min)       | [collect.Reverse()](#collect-reverse) | [collect.Shuffle()](#collect-shuffle) |
| [collect.Split()](#collect-split)   | [collect.Sum()](#collect-sum)         | [collect.Unique()](#collect-unique)   |
| [collect.Values()](#collect-values) |                                                                          |                                                                          |

## 路徑

```go
import "github.com/goravel/framework/support/path"
```

### `path.App()`

`path.App()` 函數返回應用程序的 app 目錄的絕對路徑。 你也可以使用 `path.App()` 函數來生成應用目錄下的特定文件的路徑：

```go
path := path.App()
path := path.App("http/controllers/controller.go")
```

### `path.Base()`

`path.Base()` 函數返回應用程序的根目錄的絕對路徑。 你也可以使用 `path.Base()` 函數來生成相對於項目根目錄的特定文件的路徑：

```go
path := path.Base()
path := path.Base("vendor/bin")
```

### `path.Config()`

`path.Config()` 函數返回應用程序的配置目錄的絕對路徑。 你也可以使用 `path.Config()` 函數來生成應用配置目錄中給定文件的路徑：

```go
path := path.Config()
path := path.Config("app.go")
```

### `path.Database()`

`path.Database()` 函數返回應用程序的數據庫目錄的絕對路徑。 你也可以使用 `path.Database()` 函數來生成 `database` 目錄中給定文件的路徑：

```go
path := path.Database()
path := path.Database("factories/user_factory.go")
```

### `path.Storage()`

`path.Storage()` 函數返回應用程序的存儲目錄的絕對路徑。 你也可以使用 `path.Storage()` 函數來生成 `storage` 目錄中給定文件的路徑：

```go
path := path.Storage()
path := path.Storage("app/file.txt")
```

### `path.Public()`

`path.Public()` 函數返回應用程序的公共目錄的絕對路徑。 你也可以使用 `path.Public()` 函數來生成 `public` 目錄中給定文件的路徑：

```go
path := path.Public()
path := path.Public("css/app.css")
```

### `path.Lang()`

`path.Lang()` 函數返回 `lang` 目錄的絕對路徑。 你也可以使用 `path.Lang()` 函數來生成 `lang` 目錄中給定文件的路徑：

```go
path := path.Lang()
path := path.Lang("en.json")
```

### `path.Resource()`

`path.Resource()` 函數返回 `resource` 目錄的絕對路徑。 你也可以使用 `path.Resource()` 函數來生成 `resource` 目錄中給定文件的路徑：

```go
path := path.Resource()
path := path.Resource("css/app.css")
```

## Carbon

Goravel 的 `carbon` 是 [dromara/carbon](https://github.com/dromara/carbon) 的一個擴展，詳細用法請參考其官方文檔。

```go
import "github.com/goravel/framework/support/carbon"
```

### `carbon.Now()`

`carbon.Now()` 函數獲取當前時間：

```go
carbon.Now()
```

### `carbon.SetTimezone()`

`carbon.SetTimezone()` 函數設置時區：

```go
carbon.SetTimezone(carbon.UTC)
```

### `carbon.SetLocale()`

`carbon.SetLocale()` 函數設置語言環境，參考 [語言列表](https://github.com/dromara/carbon/tree/master/lang) 了解所有支持的語言：

```go
carbon.SetLocale("en")
```

### `carbon.SetTestNow()`

`carbon.SetTestNow()` 函數將時間設置為測試值：

```go
carbon.SetTestNow(carbon.Now())
```

### `carbon.CleanTestNow()`

`carbon.CleanTestNow()` 函數會清除測試中的 Carbon 對象：

```go
carbon.CleanTestNow()
```

### `carbon.IsTestNow()`

`carbon.IsTestNow()` 函數判斷當前時間是否為測試值：

```go
carbon.IsTestNow()
```

### `carbon.Parse()`

`carbon.Parse()` 函數將字符串轉換為 `Carbon` 對象：

```go
carbon.Parse("2020-08-05 13:14:15")
```

### `carbon.ParseByLayout()`

`carbon.ParseByLayout()` 函數會根據給定的值和格式獲得 `Carbon` 對象：

```go
carbon.ParseByLayout("2020-08-05 13:14:15", carbon.DateTimeLayout)
carbon.ParseByLayout("2020|08|05 13|14|15", []string{"2006|01|02 15|04|05", "2006|1|2 3|4|5"})
```

### `carbon.ParseByFormat()`

`carbon.ParseByFormat()` 函數會根據給定的值和格式獲得 `Carbon` 對象：

```go
carbon.ParseByFormat("2020-08-05 13:14:15", carbon.DateTimeFormat)
carbon.ParseByFormat("2020|08|05 13|14|15", []string{"Y|m|d H|i|s", "y|m|d h|i|s"})
```

### `carbon.FromTimestamp()`

`carbon.FromTimestamp()` 函數會根據帶有秒精度的時間戳獲得 `Carbon` 對象：

```go
carbon.FromTimestamp(1577836800)
```

### `carbon.FromTimestampMilli()`

`carbon.FromTimestampMilli()` 函數會根據帶有毫秒精度的時間戳獲得 `Carbon` 對象：

```go
carbon.FromTimestampMilli(1649735755999)
```

### `carbon.FromTimestampMicro()`

`carbon.FromTimestampMicro()` 函數會根據帶有微秒精度的時間戳獲得 `Carbon` 對象：

```go
carbon.FromTimestampMicro(1649735755999999)
```

### `carbon.FromTimestampNano()`

`carbon.FromTimestampNano()` 函數會根據帶有納秒精度的時間戳獲得 `Carbon` 對象：

```go
carbon.FromTimestampNano(1649735755999999999)
```

### `carbon.FromDateTime()`

`carbon.FromDateTime()` 函數會根據年、月、日、時、分、秒獲得 `Carbon` 對象：

```go
carbon.FromDateTime(2020, 1, 1, 0, 0, 0)
```

### `carbon.FromDateTimeMilli()`

`carbon.FromDateTimeMilli()` 函數會根據年、月、日、時、分、秒、毫秒獲得 `Carbon` 對象：

```go
carbon.FromDateTimeMilli(2020, 1, 1, 0, 0, 0, 999)
```

### `carbon.FromDateTimeMicro()`

`carbon.FromDateTimeMicro()` 函數會根據年、月、日、時、分、秒、微秒獲得 `Carbon` 對象：

```go
carbon.FromDateTimeMicro(2020, 1, 1, 0, 0, 0, 999999)
```

### `carbon.FromDateTimeNano()`

`carbon.FromDateTimeNano()` 函數會根據年、月、日、時、分、秒、納秒獲得 `Carbon` 對象：

```go
carbon.FromDateTimeNano(2020, 1, 1, 0, 0, 0, 999999999)
```

### `carbon.FromDate()`

`carbon.FromDate()` 函數會根據年、月、日獲得 `Carbon` 對象：

```go
carbon.FromDate(2020, 1, 1)
```

### `carbon.FromDateMilli()`

`carbon.FromDateMilli()` 函數會根據年、月、日、毫秒獲得 `Carbon` 對象：

```go
carbon.FromDateMilli(2020, 1, 1, 999)
```

### `carbon.FromDateMicro()`

`carbon.FromDateMicro()` 函數會根據年、月、日、微秒獲得 `Carbon` 對象：

```go
carbon.FromDateMicro(2020, 1, 1, 999999)
```

### `carbon.FromDateNano()`

`carbon.FromDateNano()` 函數會根據年、月、日、納秒獲得 `Carbon` 對象：

```go
carbon.FromDateNano(2020, 1, 1, 999999999)
```

### `carbon.FromTime()`

`carbon.FromTime()` 函數會根據小時、分鐘、秒獲得 `Carbon` 對象：

```go
carbon.FromTime(13, 14, 15)
```

### `carbon.FromTimeMilli()`

`carbon.FromTimeMilli()` 函數會根據小時、分鐘、秒、毫秒獲得 `Carbon` 對象：

```go
carbon.FromTimeMilli(13, 14, 15, 999)
```

### `carbon.FromTimeMicro()`

`carbon.FromTimeMicro()` 函數會根據小時、分鐘、秒、微秒獲得 `Carbon` 對象：

```go
carbon.FromTimeMicro(13, 14, 15, 999999)
```

### `carbon.FromTimeNano()`

`carbon.FromTimeNano()` 函數會根據小時、分鐘、秒、納秒獲得 `Carbon` 對象：

```go
carbon.FromTimeNano(13, 14, 15, 999999999)
```

### `carbon.FromStdTime()`

`carbon.FromStdTime()` 函數會根據 `time.Time` 獲得 `Carbon` 對象：

```go
carbon.FromStdTime(time.Now())
```

## Debug

```go
import "github.com/goravel/framework/support/debug"
```

### `debug.Dump()`

`debug.Dump()` 函數可以打印任意變數：

```go
debug.Dump(myVar1, myVar2, ...)
```

### `debug.FDump()`

`debug.FDump()` 函數可以打印任意變數到 `io.Writer`：

```go
debug.FDump(someWriter, myVar1, myVar2, ...)
```

### `debug.SDump()`

`debug.SDump()` 函數可以打印任意變數到字串：

```go
debug.SDump(myVar1, myVar2, ...)
```

## Maps

```go
import "github.com/goravel/framework/support/maps"
```

### `maps.Add()`

`maps.Add()` 函數會在給定的 map 中添加新的鍵值對，前提是該鍵尚不存在於 map 中：

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

`maps.Exists()` 函數判斷給定的鍵是否存在於提供的 map 中：

```go
mp := map[string]any{"name": "Krishan", "age": 22}

maps.Exists(mp, "name") // true

maps.Exists(mp, "email") // false
```

### `maps.Forget()`

`maps.Forget()` 函數會從提供的 map 中移除給定的鍵：

```go
mp := map[string]string{"name": "Krishan", "age": "22"}

maps.Forget(mp, "name", "age")
// map[string]string{}
```

### `maps.Get()`

`maps.Get()` 函數從提供的 map 中檢索給定鍵的值。 如果鍵不存在，則返回預設值： 如果鍵不存在，則將返回預設值：

```go
mp := map[string]any{"name": "Bowen"}

maps.Get(mp, "name", "Krishan") // Bowen

maps.Get(mp, "age", 22) // 22
```

### `maps.Has()`

`maps.Has()` 函數判斷給定鍵是否存在於提供的 map 中：

```go
mp := map[string]any{"name": "Goravel", "language": "Go"}

maps.Has(mp, "name", "language") // true

maps.Has(mp, "name", "age") // false
```

### `maps.HasAny()`

`maps.HasAny()` 函數判斷給定的任意鍵是否存在於提供的 map 中：

```go
mp := map[string]any{"name": "Goravel", "language": "Go"}

maps.HasAny(mp, "name", "age") // true

maps.HasAny(mp, "age", "email") // false
```

### `maps.Only()`

`maps.Only()` 函數從提供的 map 中檢索給定的鍵：

```go
mp := map[string]any{"name": "Goravel", "language": "Go"}

maps.Only(mp, "name")
// map[string]any{"name": "Goravel"}

maps.Only(mp, "name", "age")
// map[string]any{"name": "Goravel"}
```

### `maps.Pull()`

`maps.Pull()` 函數從提供的 map 中檢索並移除給定的鍵：

```go
mp := map[string]any{"name": "Goravel", "language": "Go"}

maps.Pull(mp, "name")
// map[string]any{"language": "Go"}
```

可以提供預設值作為 `maps.Pull()` 函數的第三個參數。 如果鍵不存在，則將返回此值：

```go
mp := map[string]any{"name": "Goravel", "language": "Go"}

maps.Pull(mp, "age", "default")
// map[string]any{"name": "Goravel", "language": "Go"}
```

### `maps.Set()`

`maps.Set()` 函數會在提供的 map 中設定給定的鍵和值：

```go
mp := map[string]any{"name": "Goravel"}

maps.Set(mp, "language", "Go")
// map[string]any{"name": "Goravel", "language": "Go"}
```

### `maps.Where()`

`maps.Where()` 函數使用給定的回調函數過濾提供的 map：

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

`convert.Tap()` 函數將給定的值傳遞給提供的回調函數，並返回該值：

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

`convert.Transform()` 函數使用提供的回調函數轉換給定的值，並返回結果：

```go
convert.Transform(1, strconv.Itoa)
// "1"

convert.Transform("foo", func(s string) *foo {
    return &foo{Name: s}
})
// &foo{Name: "foo"}
```

### `convert.With()`

`convert.With()` 函數使用提供的值執行給定的回調函數，並返回回調函數的結果：

```go
convert.With("Goravel", func(value string) string {
    return value + " Framework"
})
// Goravel Framework
```

### `convert.Default()`

`convert.Default()` 方法返回第一個非零值。 如果所有值都為零，則返回零值。

```go
convert.Default("", "foo") // foo

convert.Default("bar", "foo") // bar

convert.Default(0, 1) // 1
```

### `convert.Pointer()`

`convert.Pointer()` 函數返回給定值的指針。

```go
convert.Pointer("foo") // *string("foo")

convert.Pointer(1) // *int(1)
```

## Collect

```go
import "github.com/goravel/framework/support/collect"
```

### `collect.Count()`

`collect.Count()` 函數返回給定集合中的項目數：

```go
collect.Count([]string{"Goravel", "Framework"}) // 2
```

### `collect.CountBy()`

`collect.CountBy()` 函數統計返回值為 true 的出現次數：

```go
collect.CountBy([]string{"Goravel", "Framework"}, func(value string) bool {
    return strings.Contains(value, "Goravel")
})
// 1
```

### `collect.Each()`

`collect.Each()` 函數迭代給定集合中的項目，並將每個項目傳遞給給定的回調函數：

```go
collect.Each([]string{"Goravel", "Framework"}, func(value string, index int) {
    fmt.Println(index + 1, value)
})
// 1 Goravel
// 2 Framework
```

### `collect.Filter()`

`collect.Filter()` 函數使用給定的回調函數過濾集合中的項目：

```go
collect.Filter([]string{"Goravel", "Framework"}, func(value string) bool {
    return strings.Contains(value, "Goravel")
})
// []string{"Goravel"}
```

### `collect.GroupBy()`

`collect.GroupBy()` 函數根據給定回調函數的結果對集合中的項目進行分組：

```go
// 使用複雜 map 切片的示例（使用不同的範例）
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

`collect.Keys()` 函數返回集合中所有項目的鍵：

```go
collect.Keys(map[string]string{"name": "Goravel", "language": "Go"})
// []string{"name", "language"}
```

### `collect.Map()`

`collect.Map()` 函數使用給定的迭代器將一種類型的集合轉換為另一種類型：

```go
collect.Map([]string{"Goravel", "Framework"}, func(value string, _ int) string {
    return strings.ToUpper(value)
})
// []string{"GORAVEL", "FRAMEWORK"}
```

### `collect.Max()`

`collect.Max()` 函數返回給定集合的最大值：

```go
collect.Max([]int{1, 2, 3, 4, 5}) // 5
```

### `collect.Merge()`

`collect.Merge()` 函數將給定的 map 合併為一個 map：

```go
collect.Merge(map[string]string{"name": "Goravel"}, map[string]string{"language": "Go"})
// map[string]string{"name": "Goravel", "language": "Go"}

collect.Merge(map[string]string{"name": "Goravel"}, map[string]string{"name": "Framework"})
// map[string]string{"name": "Framework"}
```

### `collect.Min()`

`collect.Min()` 函數返回給定集合的最小值：

```go
collect.Min([]int{1, 2, 3, 4, 5}) // 1
```

### `collect.Reverse()`

`collect.Reverse()` 函數反轉集合中的項目：

```go
collect.Reverse([]string{"Goravel", "Framework"})
// []string{"Framework", "Goravel"}
```

### `collect.Shuffle()`

`collect.Shuffle()` 函數隨機打亂集合中的項目：

```go
collect.Shuffle([]int{1, 2, 3, 4, 5})
// []int{3, 1, 5, 2, 4}(示例)
```

### `collect.Split()`

`collect.Split()` 函數將集合分成給定長度的組。 如果集合無法均勻分割，則最後一個塊將包含剩餘的項目： 如果集合無法均勻分割，則最後一塊將包含剩餘項目：

```go
collect.Split([]int{1, 2, 3, 4, 5}, 2)
// [][]int{{1, 2}, {3, 4}, {5}}
```

### `collect.Sum()`

`collect.Sum()` 函數返回集合中所有項目的總和：

```go
collect.Sum([]int{1, 2, 3, 4, 5}) // 15
```

### `collect.Unique()`

`collect.Unique()` 函數返回無重複的集合，如果有重複值，則只保留第一次出現的值：

```go
collect.Unique([]string{"Goravel", "Framework", "Goravel"})
// []string{"Goravel", "Framework"}
```

### `collect.Values()`

`collect.Values()` 函數返回給定集合的所有值：

```go
collect.Values(map[string]string{"name": "Goravel", "language": "Go"})
// []string{"Goravel", "Go"}
```
