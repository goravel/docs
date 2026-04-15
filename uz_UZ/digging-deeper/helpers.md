# Yordamchilar

[[toc]]

## Mavjud usullar

### Yo'llar

|                                                                      |                                                                    |                                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| [path.App()](#path-app)           | [path.Base()](#path-base)       | [path.Config()](#path-config) |
| [path.Database()](#path-database) | [path.Storage()](#path-storage) | [path.Public()](#path-public) |
| [path.Resource()](#path-resource) |                                                                    |                                                                  |

### Karbon

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

### Xaritalar

|                                                                |                                                                  |                                                                  |
| -------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| [maps.Add()](#maps-add)     | [maps.Exists()](#maps-exists) | [maps.Forget()](#maps-forget) |
| [maps.Get()](#maps-get)     | [maps.Has()](#maps-has)       | [maps.HasAny()](#maps-hasany) |
| [maps.Only()](#maps-only)   | [maps.Pull()](#maps-pull)     | [maps.Set()](#maps-set)       |
| [maps.Where()](#maps-where) |                                                                  |                                                                  |

### Konvertatsiya qilish

|                                                                          |                                                                          |                                                                              |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| [convert.Tap()](#convert-tap)         | [convert.With()](#convert-with)       | [convert.Transform()](#convert-transform) |
| [convert.Default()](#convert-default) | [convert.Pointer()](#convert-pointer) |                                                                              |

### Yig'ish

|                                                                        |                                                                          |                                                                          |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| [collect.Count()](#collect-count)   | [collect.CountBy()](#collect-countby) | [collect.Each()](#collect-each)       |
| [collect.Filter()](#collect-filter) | [collect.GroupBy()](#collect-groupby) | [collect.Keys()](#collect-keys)       |
| [collect.Map()](#collect-map)       | [collect.Max()](#collect-max)         | [collect.Merge()](#collect-merge)     |
| [collect.Min()](#collect-min)       | [collect.Reverse()](#collect-reverse) | [collect.Shuffle()](#collect-shuffle) |
| [collect.Split()](#collect-split)   | [collect.Sum()](#collect-sum)         | [collect.Unique()](#collect-unique)   |
| [collect.Values()](#collect-values) |                                                                          |                                                                          |

## Yo'llar

```go
import "github.com/goravel/framework/support/path"
```

### `path.App()`

`path.App()` funksiyasi ilovangizning ilova katalogiga mutlaq yo'lni qaytaradi. Ilova katalogiga nisbatan faylga yo'l yaratish uchun `path.App()` funksiyasidan ham foydalanishingiz mumkin:

```go
path := path.App()
path := path.App("http/controllers/controller.go")
```

### `path.Base()`

`path.Base()` funksiyasi ilovangizning asosiy katalogiga mutlaq yo'lni qaytaradi. Loyihaning asosiy katalogiga nisbatan berilgan faylga yo'l yaratish uchun `path.Base()` funksiyasidan ham foydalanishingiz mumkin:

```go
path := path.Base()
path := path.Base("vendor/bin")
```

### `path.Config()`

`path.Config()` funksiyasi ilovangizning konfiguratsiya katalogiga mutlaq yo'lni qaytaradi. Ilova konfiguratsiya katalogida berilgan faylga yo'l yaratish uchun siz shuningdek, `path.Config()` funksiyasidan foydalanishingiz mumkin:

```go
path := path.Config()
path := path.Config("app.go")
```

### `path.Database()`

`path.Database()` funksiyasi ilovangizning ma'lumotlar bazasi katalogiga mutlaq yo'lni qaytaradi. Shuningdek, `ma'lumotlar bazasi` katalogidagi berilgan faylga yo'l yaratish uchun `path.Database()` funksiyasidan foydalanishingiz mumkin:

```go
path := path.Database()
path := path.Database("factories/user_factory.go")
```

### `path.Storage()`

`path.Storage()` funksiyasi ilovangizning saqlash katalogiga mutlaq yo'lni qaytaradi. Shuningdek, `storage` katalogidagi berilgan faylga yo'l yaratish uchun `path.Storage()` funksiyasidan foydalanishingiz mumkin:

```go
path := path.Storage()
path := path.Storage("app/file.txt")
```

### `path.Public()`

`path.Public()` funksiyasi ilovangizning umumiy katalogiga mutlaq yo'lni qaytaradi. Shuningdek, siz `public` katalogidagi berilgan faylga yo'l yaratish uchun `path.Public()` funksiyasidan foydalanishingiz mumkin:

```go
path := path.Public()
path := path.Public("css/app.css")
```

### `path.Lang()`

`path.Lang()` funksiyasi `lang` katalogiga mutlaq yo'lni qaytaradi. Shuningdek, `lang` katalogidagi berilgan faylga yo'l yaratish uchun `path.Lang()` funksiyasidan foydalanishingiz mumkin:

```go
path := path.Lang()
path := path.Lang("en.json")
```

### `path.Resource()`

`path.Resource()` funksiyasi `resource` katalogiga mutlaq yo'lni qaytaradi. Shuningdek, `resource` katalogidagi berilgan faylga yo'l yaratish uchun `path.Resource()` funksiyasidan foydalanishingiz mumkin:

```go
path := path.Resource()
path := path.Resource("css/app.css")
```

## Carbon

Goravelning "uglerod" moduli [dromara/carbon] (https://github.com/dromara/carbon) tomonidan kengaytirilgan versiya bo'lib, batafsil ma'lumot uchun rasmiy hujjatlarga qarang.

```go
import "github.com/goravel/framework/support/carbon"
```

### `carbon.Now()`

The `carbon.Now()` function gets current time:

```go
carbon.Now()
```

### `carbon.SetTimezone()`

`carbon.SetTimezone()` funksiyasi vaqt mintaqasini o'rnatadi:

```go
carbon.SetTimezone(carbon.UTC)
```

### `carbon.SetLocale()`

`carbon.SetLocale()` funksiyasi til tilini o'rnatadi, barcha qo'llab-quvvatlanadigan tillar uchun [locales list](https://github.com/dromara/carbon/tree/master/lang) ga qarang:

```go
carbon.SetLocale("en")
```

### `carbon.SetTestNow()`

`carbon.SetTestNow()` funksiyasi vaqtni sinov qiymatiga o'rnatadi:

```go
carbon.SetTestNow(carbon.Now())
```

### `carbon.CleanTestNow()`

`carbon.CleanTestNow()` funksiyasi testni hozir tozalaydi. Carbon obyekti:

```go
carbon.CleanTestNow()
```

### `carbon.IsTestNow()`

`carbon.IsTestNow()` funksiyasi vaqtning sinov qiymati ekanligini aniqlaydi:

```go
carbon.IsTestNow()
```

### `carbon.Parse()`

`carbon.Parse()` funksiyasi String orqali `Carbon` obyektini oladi:

```go
carbon.Parse("2020-08-05 13:14:15")
```

### `carbon.ParseByLayout()`

`carbon.ParseByLayout()` funksiyasi berilgan qiymat va joylashuv bo'yicha `Carbon` obyektini oladi:

```go
carbon.ParseByLayout("2020-08-05 13:14:15", carbon.DateTimeLayout)
carbon.ParseByLayout("2020|08|05 13|14|15", []string{"2006|01|02 15|04|05", "2006|1|2 3|4|5"})
```

### `carbon.ParseByFormat()`

`carbon.ParseByFormat()` funksiyasi berilgan qiymat va format bo'yicha `Carbon` obyektini oladi:

```go
carbon.ParseByFormat("2020-08-05 13:14:15", carbon.DateTimeFormat)
carbon.ParseByFormat("2020|08|05 13|14|15", []string{"Y|m|d H|i|s", "y|m|d h|i|s"})
```

### `carbon.FromTimestamp()`

`carbon.FromTimestamp()` funksiyasi vaqt tamg'asi bo'yicha ikkinchi aniqlik bilan `Carbon` obyektini oladi:

```go
carbon.FromTimestamp(1577836800)
```

### `carbon.FromTimestampMilli()`

`carbon.FromTimestampMilli()` funksiyasi `Carbon` obyektini vaqt tamg'asi orqali millisekund aniqligida oladi:

```go
carbon.FromTimestampMilli(1649735755999)
```

### `carbon.FromTimestampMicro()`

`carbon.FromTimestampMicro()` funksiyasi mikrosekund aniqlik bilan vaqt tamg'asi orqali `Carbon` obyektini oladi:

```go
carbon.FromTimestampMicro(1649735755999999)
```

### `carbon.FromTimestampNano()`

`carbon.FromTimestampNano()` funksiyasi `Carbon` obyektini vaqt tamg'asi orqali nanosekund aniqlik bilan oladi:

```go
carbon.FromTimestampNano(1649735755999999999)
```

### `carbon.FromDateTime()`

`carbon.FromDateTime()` funksiyasi `Carbon` obyektini yil, oy, kun, soat, daqiqa, soniya bo'yicha oladi:

```go
carbon.FromDateTime(2020, 1, 1, 0, 0, 0)
```

### `carbon.FromDateTimeMilli()`

`carbon.FromDateTimeMilli()` funksiyasi `Carbon` obyektini yil, oy, kun, soat, daqiqa, soniya, millisekund bo'yicha oladi:

```go
carbon.FromDateTimeMilli(2020, 1, 1, 0, 0, 0, 999)
```

### `carbon.FromDateTimeMicro()`

`carbon.FromDateTimeMicro()` funksiyasi `Carbon` obyektini yil, oy, kun, soat, daqiqa, soniya, mikrosekund bo'yicha oladi:

```go
carbon.FromDateTimeMicro(2020, 1, 1, 0, 0, 0, 999999)
```

### `carbon.FromDateTimeNano()`

`carbon.FromDateTimeNano()` funksiyasi `Carbon` obyektini yil, oy, kun, soat, daqiqa, soniya, nanosekund bo'yicha oladi:

```go
carbon.FromDateTimeNano(2020, 1, 1, 0, 0, 0, 999999999)
```

### `carbon.FromDate()`

`carbon.FromDate()` funksiyasi `Carbon` obyektini yil, oy, kun bo'yicha oladi:

```go
carbon.FromDate(2020, 1, 1)
```

### `carbon.FromDateMilli()`

`carbon.FromDateMilli()` funksiyasi `Carbon` obyektini yil, oy, kun, millisekund bo'yicha oladi:

```go
carbon.FromDateMilli(2020, 1, 1, 999)
```

### `carbon.FromDateMicro()`

`carbon.FromDateMicro()` funksiyasi `Carbon` obyektini yil, oy, kun, mikrosekund bo'yicha oladi:

```go
carbon.FromDateMicro(2020, 1, 1, 999999)
```

### `carbon.FromDateNano()`

`carbon.FromDateNano()` funksiyasi `Carbon` obyektini yil, oy, kun, nanosekund bo'yicha oladi:

```go
carbon.FromDateNano(2020, 1, 1, 999999999)
```

### `carbon.FromTime()`

`carbon.FromTime()` funksiyasi `Carbon` obyektini soat, daqiqa, soniya bo'yicha oladi:

```go
carbon.FromTime(13, 14, 15)
```

### `carbon.FromTimeMilli()`

`carbon.FromTimeMilli()` funksiyasi `Carbon` obyektini soat, daqiqa, soniya, millisekund bo'yicha oladi:

```go
carbon.FromTimeMilli(13, 14, 15, 999)
```

### `carbon.FromTimeMicro()`

`carbon.FromTimeMicro()` funksiyasi `Carbon` obyektini soat, daqiqa, soniya, mikrosekund bo'yicha oladi:

```go
carbon.FromTimeMicro(13, 14, 15, 999999)
```

### `carbon.FromTimeNano()`

`carbon.FromTimeNano()` funksiyasi `Carbon` obyektini soat, daqiqa, soniya, nanosekund bo'yicha oladi:

```go
carbon.FromTimeNano(13, 14, 15, 999999999)
```

### `carbon.FromStdTime()`

`carbon.FromStdTime()` funksiyasi `time.Time` orqali `Carbon` obyektini oladi:

```go
carbon.FromStdTime(time.Now())
```

## Nosozliklarni tuzatish

```go
import "github.com/goravel/framework/support/debug"
```

### `debug.Dump()`

`debug.Dump()` funksiyasi istalgan o'zgaruvchini chop etadi:

```go
debug.Dump(myVar1, myVar2, ...)
```

### `debug.FDump()`

`debug.FDump()` funksiyasi istalgan o'zgaruvchini `io.Writer` ga chop etadi:

```go
debug.FDump(someWriter, myVar1, myVar2, ...)
```

### `debug.SDump()`

`debug.SDump()` funksiyasi istalgan o'zgaruvchini `string` ga yozib chiqaradi:

```go
debug.SDump(myVar1, myVar2, ...)
```

## Xaritalar

```go
import "github.com/goravel/framework/support/maps"
```

### `maps.Add()`

Agar kalit xaritada mavjud bo'lmasa, `maps.Add()` funksiyasi berilgan xaritaga yangi kalit-qiymat juftligini qo'shadi:

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

`maps.Exists()` funksiyasi berilgan kalit berilgan xaritada mavjudligini aniqlaydi:

```go
mp := map[string]any{"name": "Krishan", "age": 22}

maps.Exists(mp, "name") // true

maps.Exists(mp, "email") // false
```

### `maps.Forget()`

`maps.Forget()` funksiyasi berilgan xaritadan berilgan kalit(lar)ni olib tashlaydi:

```go
mp := map[string]string{"name": "Krishan", "age": "22"}

maps.Forget(mp, "name", "age")
// map[string]string{}
```

### `maps.Get()`

`maps.Get()` funksiyasi berilgan xaritadan berilgan kalitning qiymatini oladi. Agar kalit mavjud bo'lmasa, standart qiymat qaytariladi:

```go
mp := map[string]any{"name": "Bowen"}

maps.Get(mp, "name", "Krishan") // Bowen

maps.Get(mp, "age", 22) // 22
```

### `maps.Has()`

`maps.Has()` funksiyasi berilgan kalit(lar)ning berilgan xaritada mavjudligini aniqlaydi:

```go
mp := map[string]any{"name": "Goravel", "language": "Go"}

maps.Has(mp, "name", "language") // true

maps.Has(mp, "name", "age") // false
```

### `maps.HasAny()`

`maps.HasAny()` funksiyasi berilgan xaritada berilgan kalit(lar)ning birortasi mavjudligini aniqlaydi:

```go
mp := map[string]any{"name": "Goravel", "language": "Go"}

maps.HasAny(mp, "name", "age") // true

maps.HasAny(mp, "age", "email") // false
```

### `maps.Only()`

`maps.Only()` funksiyasi berilgan xaritadan faqat berilgan kalit(lar)ni oladi:

```go
mp := map[string]any{"name": "Goravel", "language": "Go"}

maps.Only(mp, "name")
// map[string]any{"name": "Goravel"}

maps.Only(mp, "name", "age")
// map[string]any{"name": "Goravel"}
```

### `maps.Pull()`

`maps.Pull()` funksiyasi berilgan xaritadan berilgan kalitni oladi va olib tashlaydi:

```go
mp := map[string]any{"name": "Goravel", "language": "Go"}

maps.Pull(mp, "name")
// map[string]any{"language": "Go"}
```

`maps.Pull()` funksiyasiga uchinchi argument sifatida standart qiymat berilishi mumkin. Agar kalit xaritada mavjud bo'lmasa, bu qiymat qaytariladi:

```go
mp := map[string]any{"name": "Goravel", "language": "Go"}

maps.Pull(mp, "age", "default")
// map[string]any{"name": "Goravel", "language": "Go"}
```

### `maps.Set()`

`maps.Set()` funksiyasi berilgan xaritada berilgan kalit va qiymatni o'rnatadi:

```go
mp := map[string]any{"name": "Goravel"}

maps.Set(mp, "language", "Go")
// map[string]any{"name": "Goravel", "language": "Go"}
```

### `maps.Where()`

`maps.Where()` funksiyasi berilgan xaritani berilgan qayta chaqiruv yordamida filtrlaydi:

```go
mp := map[string]string{"name": "Goravel", "language": "Go"}

maps.Where(mp, func(key string, value string) bool {
    return key == "name"
})
// map[string]string{"name": "Goravel"}
```

## Konvertatsiya qilish

```go
import "github.com/goravel/framework/support/convert"
```

### `convert.Tap()`

`convert.Tap()` funksiyasi berilgan qiymatni berilgan qayta chaqiruvga uzatadi va qiymatni qaytaradi:

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

`convert.Transform()` berilgan qiymatni berilgan qayta chaqiruv yordamida o'zgartiradi va natijani qaytaradi:

```go
convert.Transform(1, strconv.Itoa)
// "1"

convert.Transform("foo", func(s string) *foo {
    return &foo{Name: s}
})
// &foo{Name: "foo"}
```

### `convert.With()`

`convert.With()` berilgan qiymat bilan qaytariladigan chaqiruvni bajaradi va qaytariladigan chaqiruv natijasini qaytaradi:

```go
convert.With("Goravel", func(value string) string {
    return value + " Framework"
})
// Goravel Framework
```

### `convert.Default()`

`convert.Default()` usuli birinchi nolga teng bo'lmagan qiymatni qaytaradi. Agar barcha qiymatlar nolga teng bo'lsa, u nol qiymatni qaytaradi.

```go
convert.Default("", "foo") // foo

convert.Default("bar", "foo") // bar

convert.Default(0, 1) // 1
```

### `convert.Pointer()`

`convert.Pointer()` usuli berilgan qiymatning ko'rsatkichini qaytaradi.

```go
convert.Pointer("foo") // *string("foo")

convert.Pointer(1) // *int(1)
```

## Yig'ish

```go
import "github.com/goravel/framework/support/collect"
```

### `collect.Count()`

`collect.Count()` funksiyasi berilgan to'plamdagi elementlar sonini qaytaradi:

```go
collect.Count([]string{"Goravel", "Framework"}) // 2
```

### `collect.CountBy()`

`collect.CountBy()` funksiyasi predikat rost bo'lgan holatlarni hisoblaydi:

```go
collect.CountBy([]string{"Goravel", "Framework"}, func(value string) bool {
    return strings.Contains(value, "Goravel")
})
// 1
```

### `collect.Each()`

`collect.Each()` funksiyasi berilgan to'plamdagi elementlar ustida iteratsiya qiladi va har bir elementni berilgan qayta chaqiruvga o'tkazadi:

```go
collect.Each([]string{"Goravel", "Framework"}, func(value string, index int) {
    fmt.Println(index + 1, value)
})
// 1 Goravel
// 2 Framework
```

### `collect.Filter()`

`collect.Filter()` funksiyasi berilgan qayta chaqiruv yordamida to'plamdagi elementlarni filtrlaydi:

```go
collect.Filter([]string{"Goravel", "Framework"}, func(value string) bool {
    return strings.Contains(value, "Goravel")
})
// []string{"Goravel"}
```

### `collect.GroupBy()`

`collect.GroupBy()` funksiyasi berilgan qayta chaqiruv natijasi bo'yicha to'plamdagi elementlarni guruhlaydi:

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

`collect.Keys()` funksiyasi to'plamdagi elementlar uchun barcha kalitlarni qaytaradi:

```go
collect.Keys(map[string]string{"name": "Goravel", "language": "Go"})
// []string{"name", "language"}
```

### `collect.Map()`

`collect.Map()` funksiyasi berilgan iterate yordamida bir turdagi to'plamni boshqasiga o'zgartiradi:

```go
collect.Map([]string{"Goravel", "Framework"}, func(value string,  _ int) string {
    return strings.ToUpper(value)
})
// []string{"GORAVEL", "FRAMEWORK"}
```

### `collect.Max()`

`collect.Max()` funksiyasi berilgan to'plamning maksimal qiymatini qaytaradi:

```go
collect.Max([]int{1, 2, 3, 4, 5}) // 5
```

### `collect.Merge()`

`collect.Merge()` funksiyasi berilgan xaritalarni bitta xaritaga birlashtiradi:

```go
collect.Merge(map[string]string{"name": "Goravel"}, map[string]string{"language": "Go"})
// map[string]string{"name": "Goravel", "language": "Go"}

collect.Merge(map[string]string{"name": "Goravel"}, map[string]string{"name": "Framework"})
// map[string]string{"name": "Framework"}
```

### `collect.Min()`

`collect.Min()` funksiyasi berilgan to'plamning minimal qiymatini qaytaradi:

```go
collect.Min([]int{1, 2, 3, 4, 5}) // 1
```

### `collect.Reverse()`

`collect.Reverse()` funksiyasi to'plamdagi elementlarni teskari yo'naltiradi:

```go
collect.Reverse([]string{"Goravel", "Framework"})
// []string{"Framework", "Goravel"}
```

### `collect.Shuffle()`

`collect.Shuffle()` funksiyasi to'plamdagi elementlarni aralashtiradi:

```go
collect.Shuffle([]int{1, 2, 3, 4, 5})
// []int{3, 1, 5, 2, 4}(example)
```

### `collect.Split()`

`collect.Split()` funksiyasi to'plamni berilgan uzunlikdagi guruhlarga ajratadi. Agar to'plamni teng ravishda taqsimlab bo'lmasa, oxirgi qism qolgan elementlarni o'z ichiga oladi:

```go
collect.Split([]int{1, 2, 3, 4, 5}, 2)
// [][]int{{1, 2}, {3, 4}, {5}}
```

### `collect.Sum()`

`collect.Sum()` funksiyasi to'plamdagi barcha elementlarning yig'indisini qaytaradi:

```go
collect.Sum([]int{1, 2, 3, 4, 5}) // 15
```

### `collect.Unique()`

`collect.Unique()` usuli takroriy qiymatlar bo'lsa, faqat birinchi holat saqlanib qoladigan takroriy to'plamni qaytaradi:

```go
collect.Unique([]string{"Goravel", "Framework", "Goravel"})
// []string{"Goravel", "Framework"}
```

### `collect.Values()`

`collect.Values()` funksiyasi berilgan to'plamning barcha qiymatlarini qaytaradi:

```go
collect.Values(map[string]string{"name": "Goravel", "language": "Go"})
// []string{"Goravel", "Go"}
```
