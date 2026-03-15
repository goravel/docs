# Goravel Helpers, Strings, Color

## Path Helpers

```go
import "github.com/goravel/framework/support/path"

path.App()                                     // absolute path to app directory
path.App("http/controllers/controller.go")     // path within app dir
path.Base()                                    // project root
path.Base("vendor/bin")
path.Config()                                  // config directory
path.Config("app.go")
path.Database()                                // database directory
path.Database("factories/user_factory.go")
path.Storage()                                 // storage directory
path.Storage("app/file.txt")
path.Public()                                  // public directory
path.Public("css/app.css")
path.Lang()                                    // lang directory
path.Lang("en.json")
path.Resource()                                // resource directory
path.Resource("css/app.css")
```

---

## Carbon (Date/Time)

```go
import "github.com/goravel/framework/support/carbon"
```

Wraps [dromara/carbon](https://github.com/dromara/carbon).

```go
carbon.Now()
carbon.SetTimezone(carbon.UTC)
carbon.SetLocale("en")                         // see https://github.com/dromara/carbon/tree/master/lang

// Test time control
carbon.SetTestNow(carbon.Now())
carbon.CleanTestNow()
carbon.IsTestNow()

// Parse
carbon.Parse("2020-08-05 13:14:15")
carbon.ParseByLayout("2020-08-05 13:14:15", carbon.DateTimeLayout)
carbon.ParseByLayout("2020|08|05 13|14|15", []string{"2006|01|02 15|04|05", "2006|1|2 3|4|5"})
carbon.ParseByFormat("2020-08-05 13:14:15", carbon.DateTimeFormat)

// From timestamp
carbon.FromTimestamp(1577836800)
carbon.FromTimestampMilli(1649735755999)
carbon.FromTimestampMicro(1649735755999999)
carbon.FromTimestampNano(1649735755999999999)

// From components
carbon.FromDateTime(2020, 1, 1, 0, 0, 0)
carbon.FromDateTimeMilli(2020, 1, 1, 0, 0, 0, 999)
carbon.FromDateTimeMicro(2020, 1, 1, 0, 0, 0, 999999)
carbon.FromDateTimeNano(2020, 1, 1, 0, 0, 0, 999999999)
carbon.FromDate(2020, 1, 1)
carbon.FromDateMilli(2020, 1, 1, 999)
carbon.FromDateMicro(2020, 1, 1, 999999)
carbon.FromDateNano(2020, 1, 1, 999999999)
carbon.FromTime(13, 14, 15)
carbon.FromTimeMilli(13, 14, 15, 999)
carbon.FromTimeMicro(13, 14, 15, 999999)
carbon.FromTimeNano(13, 14, 15, 999999999)
carbon.FromStdTime(time.Now())
```

---

## Debug

```go
import "github.com/goravel/framework/support/debug"

debug.Dump(myVar1, myVar2)           // print to stdout
debug.SDump(myVar1, myVar2)          // return as string
debug.FDump(someWriter, myVar1)      // write to io.Writer
```

---

## Maps

```go
import "github.com/goravel/framework/support/maps"

mp := map[string]any{"name": "Goravel"}

maps.Add(mp, "age", 22)                        // add only if key absent
maps.Exists(mp, "name")                        // true
maps.Forget(mp, "name", "age")                 // remove key(s)
maps.Get(mp, "name", "default")                // get with default
maps.Has(mp, "name", "age")                    // all keys must exist
maps.HasAny(mp, "name", "email")               // any key present
maps.Only(mp, "name")                          // subset map
maps.Pull(mp, "name")                          // get and remove
maps.Pull(mp, "missing", "default")            // with default
maps.Set(mp, "language", "Go")                 // set value
maps.Where(mp, func(k string, v any) bool {    // filter
    return k == "name"
})
```

---

## Convert

```go
import "github.com/goravel/framework/support/convert"

// Tap: pass to closure, return original value
convert.Tap("Goravel", func(value string) {
    fmt.Println(value + " Framework")
})
// → "Goravel"

// Transform: convert using closure
convert.Transform(1, strconv.Itoa)             // "1"
convert.Transform("foo", func(s string) *Foo {
    return &Foo{Name: s}
})

// With: execute closure and return its result
convert.With("Goravel", func(value string) string {
    return value + " Framework"
})
// → "Goravel Framework"

// Default: first non-zero value
convert.Default("", "foo")                     // "foo"
convert.Default("bar", "foo")                  // "bar"
convert.Default(0, 1)                          // 1

// Pointer: return pointer to value
convert.Pointer("foo")                         // *string
convert.Pointer(1)                             // *int
```

---

## Collect

```go
import "github.com/goravel/framework/support/collect"

collect.Count([]string{"a", "b"})             // 2
collect.CountBy([]string{"a", "b"}, func(v string) bool { return v == "a" }) // 1
collect.Each([]string{"a", "b"}, func(v string, i int) { fmt.Println(i, v) })
collect.Filter([]string{"a", "b"}, func(v string) bool { return v == "a" })  // ["a"]
collect.GroupBy(slice, func(v T) string { return v.Key })                     // map[string][]T
collect.Keys(map[string]string{"a": "1"})     // ["a"]
collect.Map([]string{"a"}, func(v string, i int) string { return strings.ToUpper(v) }) // ["A"]
collect.Max([]int{1, 2, 3})                   // 3
collect.Merge(map1, map2)                     // merged (map2 wins on conflict)
collect.Min([]int{1, 2, 3})                   // 1
collect.Reverse([]string{"a", "b"})           // ["b", "a"]
collect.Shuffle([]int{1, 2, 3})               // random order
collect.Split([]int{1, 2, 3, 4, 5}, 2)       // [[1,2],[3,4],[5]]
collect.Sum([]int{1, 2, 3})                   // 6
collect.Unique([]string{"a", "b", "a"})       // ["a", "b"] (first occurrence kept)
collect.Values(map[string]string{"a": "1"})   // ["1"]
```

---

## Fluent Strings

```go
import "github.com/goravel/framework/support/str"

// Chain methods; call .String() to get final string value
str.Of("  Goravel  ").Trim().Lower().UcFirst().String() // "Goravel"
```

### String Methods

```go
str.Of("Hello World!").After("Hello").String()              // " World!"
str.Of("docs.goravel.dev").AfterLast(".").String()          // "dev"
str.Of("Bowen").Append(" Han").String()                     // "Bowen Han"
str.Of("framework/support/str").Basename().String()         // "str"
str.Of("framework/support/str.go").Basename(".go").String() // "str"
str.Of("Hello World!").Before("World").String()             // "Hello "
str.Of("docs.goravel.dev").BeforeLast(".").String()         // "docs.goravel"
str.Of("[Hello] World!").Between("[", "]").String()         // "Hello"
str.Of("[Hello] [World]!").BetweenFirst("[", "]").String()  // "Hello"
str.Of("hello_world").Camel().String()                      // "helloWorld"
str.Of("Goravel").CharAt(1)                                 // "o"
str.Of("https://goravel.com").ChopEnd(".com").String()      // "https://goravel"
str.Of("https://goravel.dev").ChopStart("https://").String()// "goravel.dev"
str.Of("Goravel").Contains("Gor")                           // true
str.Of("Hello World").Contains("Gor", "Hello")              // true (any)
str.Of("Hello World").ContainsAll("Hello", "World")         // true (all)
str.Of("framework/support/str").Dirname().String()          // "framework/support"
str.Of("framework/support/str").Dirname(2).String()         // "framework"
str.Of("Goravel").EndsWith("vel")                           // true
str.Of("Goravel").EndsWith("vel", "lie")                    // true (any)
str.Of("Goravel").Exactly("Goravel")                        // true
str.Of("This is a beautiful morning").Except("beautiful", str.ExcerptOption{Radius: 5}).String()
// "...is a beautiful morn..."
str.Of("Hello World").Explode(" ")                          // []string{"Hello", "World"}
str.Of("framework").Finish("/").String()                    // "framework/"
str.Of("bowen_han").Headline().String()                     // "Bowen Han"
str.Of("foo123").Is("bar*", "foo*")                         // true
str.Of("").IsEmpty()                                        // true
str.Of("Goravel").IsNotEmpty()                              // true
str.Of("Goravel").IsAscii()                                 // true
str.Of(`[{"name":"a"}]`).IsSlice()                         // true
str.Of(`{"name":"a"}`).IsMap()                              // true
str.Of("01E5Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6").IsUlid()             // true
str.Of("550e8400-e29b-41d4-a716-446655440000").IsUuid()    // true
str.Of("GoravelFramework").Kebab().String()                  // "goravel-framework"
str.Of("Goravel Framework").LcFirst().String()              // "goravel Framework"
str.Of("Goravel").Length()                                  // 7
str.Of("This is a beautiful morning").Limit(7).String()     // "This is..."
str.Of("This is a beautiful morning").Limit(7, " (****)").String() // "This is (****)"
str.Of("GORAVEL").Lower().String()                          // "goravel"
str.Of("  Goravel  ").LTrim().String()                      // "Goravel  "
str.Of("/framework/").LTrim("/").String()                   // "framework/"
str.Of("krishan@email.com").Mask("*", 3).String()           // "kri**************"
str.Of("krishan@email.com").Mask("*", -13, 3).String()      // "kris***@email.com"
str.Of("This is a (test) string").Match(`\([^)]+\)`).String()// "(test)"
str.Of("abc123def456").MatchAll(`\d+`)                      // ["123", "456"]
str.Of("Hello, Goravel!").IsMatch(`(?i)goravel`)            // true
str.Of("Goravel").NewLine(2).Append("Framework").String()   // "Goravel\n\nFramework"
str.Of("Hello").PadBoth(10, "_").String()                   // "__Hello___"
str.Of("Hello").PadLeft(10, "_").String()                   // "_____Hello"
str.Of("Hello").PadRight(10, "_").String()                  // "Hello_____"
str.Of("Goravel").Pipe(func(s string) string { return s + " Framework" }).String()
str.Of("goose").Plural().String()                           // "geese"
str.Of("goose").Plural(1).String()                          // "goose"
str.Of("goose").Plural(2).String()                          // "geese"
str.Of("Framework").Prepend("Goravel ").String()            // "Goravel Framework"
str.Of("Hello World").Remove("World").String()              // "Hello "
str.Of("a").Repeat(2).String()                              // "aa"
str.Of("Hello World").Replace("World", "Krishan").String()  // "Hello Krishan"
str.Of("Hello World").Replace("world", "Krishan", false).String() // case-insensitive
str.Of("Hello World").ReplaceEnd("World", "Goravel").String()
str.Of("Hello World").ReplaceFirst("World", "Goravel").String()
str.Of("Hello World").ReplaceLast("World", "Goravel").String()
str.Of("Hello, Goravel!").ReplaceMatches(`goravel!(.*)`, "Krishan")
str.Of("Hello World").ReplaceStart("Hello", "Goravel").String()
str.Of("  Goravel  ").RTrim().String()                      // "  Goravel"
str.Of("heroes").Singular().String()                        // "hero"
str.Of("GoravelFramework").Snake().String()                  // "goravel_framework"
str.Of("Hello World").Split(" ")                            // []string{"Hello", "World"}
str.Of("Hello    World").Squish().String()                  // "Hello World"
str.Of("framework").Start("/").String()                     // "/framework"
str.Of("Goravel").StartsWith("Gor")                         // true
str.Of("Goravel").String()                                  // "Goravel"
str.Of("goravel_framework").Studly().String()               // "GoravelFramework"
str.Of("Goravel").Substr(1, 3)                              // "ora"
str.Of("Golang is awesome").Swap(map[string]string{"Golang": "Go", "awesome": "great"}).String()
str.Of("Goravel").Tap(func(s string) { fmt.Println(s) }).String()
str.Of("Hello, Goravel!").Test(`goravel!(.*)`)              // true
str.Of("goravel framework").Title().String()                // "Goravel Framework"
str.Of("  Goravel  ").Trim().String()                       // "Goravel"
str.Of("/framework/").Trim("/").String()                    // "framework"
str.Of("goravel framework").UcFirst().String()              // "Goravel framework"
str.Of("GoravelFramework").UcSplit()                        // ["Goravel", "Framework"]
str.Of("goravel").Upper().String()                          // "GORAVEL"
str.Of("Hello, World!").WordCount()                         // 2
str.Of("Hello, World!").Words(1)                            // "Hello..."
str.Of("Hello, World!").Words(1, " (****)").String()        // "Hello (****)"

// Conditional chaining
str.Of("Bowen").When(true, func(s *str.String) *str.String {
    return s.Append(" Han")
}).String() // "Bowen Han"

str.Of("Hello Bowen").WhenContains("Hello", func(s *str.String) *str.String {
    return s.Append(" Han")
}).String()

str.Of("Hello Bowen").WhenContainsAll([]string{"Hello", "Bowen"}, func(s *str.String) *str.String {
    return s.Append(" Han")
}).String()

str.Of("").WhenEmpty(func(s *str.String) *str.String {
    return s.Append("Goravel")
}).String()

str.Of("Goravel").WhenIsAscii(func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String()

str.Of("Goravel").WhenNotEmpty(func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String()

str.Of("hello world").WhenStartsWith("hello", func(s *str.String) *str.String {
    return s.Title()
}).String()

str.Of("hello world").WhenEndsWith("world", func(s *str.String) *str.String {
    return s.Title()
}).String()

str.Of("Goravel").WhenExactly("Goravel", func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String()

str.Of("foo/bar").WhenIs("foo/*", func(s *str.String) *str.String {
    return s.Append("/baz")
}).String()

str.Of("goravel framework").WhenTest(`goravel(.*)`, func(s *str.String) *str.String {
    return s.Append(" is awesome")
}).String()

// Unless: execute if condition is false
str.Of("Goravel").Unless(func(s *str.String) bool {
    return false
}, func(s *str.String) *str.String {
    return str.Of("Fallback Applied")
}).String() // "Fallback Applied"
```

---

## Color (Terminal Output)

```go
import "github.com/goravel/framework/support/color"

// Built-in colors
color.Red().Println("error")
color.Green().Printf("Hello, %s!", "Goravel")
color.Yellow().Print("warning")
color.Blue().Sprintln("info")   // returns colored string
color.Magenta().Sprint("text")
color.Cyan().Sprintf("value: %d", 42)
color.White().Println("white")
color.Black().Println("black")
color.Gray().Println("gray")
color.Default().Println("default")

// Printer interface methods: Print, Println, Printf, Sprint, Sprintln, Sprintf

// Custom color
color.New(color.FgRed).Println("custom red")
```
