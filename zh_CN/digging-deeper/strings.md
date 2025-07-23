# 字符串

[[toc]]

## 简介

Goravel 提供了一个流畅的字符串操作库，允许您轻松地操作字符串。 流畅的字符串允许您通过方法链接组合多个字符串操作，其中大多数方法返回 `support/str.String` 的实例，让您可以链接额外的方法。 要获取应用链式操作后的最终字符串值，您可以调用 `String` 方法，它返回底层的 `string` 值。 Fluent Strings allows you to combine multiple string operations through method chaining, where most of the methods returns an instance of `support/str.String`, letting you chain additional methods. To get the final string value after applying the chained operations, you can call the `String` method, which returns the underlying `string` value.

```go
import "github.com/goravel/framework/support/str"

str.Of("  Goravel  ").Trim().Lower().UpperFirst().String() // "Goravel"
```

## 可用方法

### `Of`

`Of` 方法从给定的字符串创建一个新的流畅字符串实例。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel")
```

### `After`

`After` 方法返回字符串中指定值之后的部分。 如果值为空字符串
或者在原始字符串中不存在，则返回完整字符串。 If the value is an empty string or does not exist within the original string, the full string is returned.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World!").After("Hello").String() // " World！"
```

### `AfterLast`

`AfterLast` 方法返回字符串中指定值最后一次出现之后的部分。 如果
值为空字符串或在原始字符串中不存在，则返回完整字符串。 If the value is an empty string or does not exist within the original string, the full string is returned.

```go
import "github.com/goravel/framework/support/str"

str.Of("docs.goravel.dev").AfterLast(".").String() // "dev"
```

### `Append`

`Append` 方法将指定值附加到字符串的末尾。

```go
import "github.com/goravel/framework/support/str"

str.Of("Bowen").Append(" Han").String() // "Bowen Han"
```

### `Basename`

方法 `Basename` 返回路径的尾部名称组件，可选择从基本名称中删除指定的后缀。

```go
import "github.com/goravel/framework/support/str"

str.Of("framework/support/str").Basename().String() // "str"

str.Of("framework/support/str.go").Basename(".go").String() // "str"
```

### `之前`

方法 `Before` 返回字符串中指定值之前的部分。 如果值为空字符串或在原始字符串中不存在，则返回完整字符串。 If the value is an empty string or does not exist within the original string, the full string is returned.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World!").Before("World").String() // "Hello "
```

### `最后之前`

方法 `BeforeLast` 返回字符串中指定值最后一次出现之前的部分。 如果值为空字符串或在原始字符串中不存在，则返回完整字符串。 If the value is an empty string or does not exist within the original string, the full string is returned.

```go
import "github.com/goravel/framework/support/str"

str.Of("docs.goravel.dev").BeforeLast(".").String() // "docs.goravel"
```

### `Between`

`Between` 方法返回字符串中两个给定值之间的部分。

```go
import "github.com/goravel/framework/support/str"

str.Of("[Hello] World!").Between("[", "]").String() // "Hello"
```

### `BetweenFirst`

`BetweenFirst` 方法返回字符串中两个给定值的第一次出现之间的部分。

```go
import "github.com/goravel/framework/support/str"

str.Of("[Hello] [World]!").BetweenFirst("[", "]").String() // "Hello"
```

### `Camel`

`Camel` 方法将字符串转换为 `camelCase`。

```go
import "github.com/goravel/framework/support/str"

str.Of("hello_world").Camel().String() // "helloWorld"
```

### `CharAt`

`CharAt` 方法返回给定索引处的字符。 如果索引超出范围，将返回空字符串。 If the index is out of bounds, an empty string will be returned.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").CharAt(1) // "o"
```

### `ChopEnd`

`ChopEnd` 方法从字符串的末尾移除给定的值(s)。

```go
import "github.com/goravel/framework/support/str"

str.Of("https://goravel.com").ChopEnd(".dev", ".com").String() // https://goravel
```

### `ChopStart`

`ChopStart` 方法从字符串的开头移除给定的值(s)。

```go
import "github.com/goravel/framework/support/str"

str.Of("https://goravel.dev").ChopStart("http://", "https://").String() // goravel.dev
```

### `包含`

`Contains` 方法用于判断给定字符串是否包含指定的值。 此方法区分大小写。 如果提供了多个值，只要字符串包含其中任何一个值，就会返回 `true`。 The method is case-sensitive. `Contains` 方法确定给定字符串是否包含给定值。该方法区分大小写。如果提供多个值，则如果字符串包含任何值，则返回 `true`。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Contains("Gor") // true

str.Of("Hello World").Contains("Gor", "Hello") // true
```

### `全部包含`

`ContainsAll` 方法用于判断给定字符串是否包含所有给定的值。 此方法区分大小写。 The method is case-sensitive.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ContainsAll("Hello", "World") // true

str.Of("Hello World").ContainsAll("Hello", "Gor") // false
```

### `目录名`

`Dirname` 方法返回路径的父级部分。

```go
import "github.com/goravel/framework/support/str"

str.Of("framework/support/str").Dirname().String() // "framework/support"
```

您可以选择提供要从路径中修剪的目录级别。

```go
import "github.com/goravel/framework/support/str"

str.Of("framework/support/str").Dirname(2).String() // "framework"
```

### `EndsWith`

`EndsWith` 方法用于确定给定字符串是否以给定值结尾。 此方法区分大小写。 The method is case-sensitive.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").EndsWith("vel") // true
```

您可以向该方法传递多个值，以确定字符串是否以任何一个值结尾。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").EndsWith("vel", "lie") // true
```

### `Exactly`

方法 `Exactly` 判断给定字符串是否与给定值完全相等。 该方法区分大小写。 The method is case-sensitive.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Exactly("Goravel") // true
```

### `Except`

方法 `Except` 从字符串中提取与给定值的第一次出现相匹配的摘录。

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").
 Excerpt("beautiful", str.ExcerptOption{
        Radius: 5,
    }).String() // "……is a beautiful morn……"
```

此外，您可以使用 `Omission` 选项来更改用于表示摘录的字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").
    Excerpt("beautiful", str.ExcerptOption{
        Radius: 5,
        Omission: "(...)"
    }).String() // "(...)is a beautiful morn(...)"
```

### `Explode`

Explode 方法使用给定的分隔符将字符串分割成字符串数组。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Explode(" ") // []string{"Hello", "World"}
```

### Finish

The `Finish` method ensures that the given string ends with the given value. Finish 方法确保给定的字符串以给定的值结尾。 如果字符串已经以该值结尾，则不会再次添加。

```go
import "github.com/goravel/framework/support/str"

str.Of("framework").Finish("/").String() // "framework/"

str.Of("framework/").Finish("/").String() // "framework/"
```

### Headline

Headline 方法将字符串转换为标题格式。

```go
import "github.com/goravel/framework/support/str"

str.Of("bowen_han").Headline().String() // "Bowen Han"

str.Of("HelloWorld").Headline().String() // "Hello World"
```

### Is

Is 方法用于判断给定字符串是否匹配给定模式。 该方法区分大小写。 The method is case-sensitive.

```go
import "github.com/goravel/framework/support/str"

str.Of("foo123").Is("bar*", "baz*", "foo*") // true
```

### `IsEmpty`

IsEmpty 方法用于判断给定字符串是否为空。

```go
import "github.com/goravel/framework/support/str"

str.Of("").IsEmpty() // true
```

### `IsNotEmpty`

IsNotEmpty 方法用于判断给定字符串是否不为空。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").IsNotEmpty() // true
```

### `IsAscii`

IsAscii 方法用于判断给定字符串是否只包含 ASCII 字符。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").IsAscii() // true

str.Of("你好").IsAscii() // false
```

### `IsSlice`

`IsSlice` 方法用于判断给定的字符串是否为切片。

```go
import "github.com/goravel/framework/support/str"

str.Of(`[{"name": "John"}, {"name": "Alice"}]`).IsSlice() // true

str.Of(`{"name": "John"}`).IsSlice() // false
```

### `IsMap`

`IsMap` 方法用于判断给定的字符串是否为映射。

```go
import "github.com/goravel/framework/support/str"

str.Of(`{"name": "John"}`).IsMap() // true

str.Of(`[{"name": "John"}, {"name": "Alice"}]`).IsMap() // false
```

### `IsUlid`

`IsUlid` 方法用于判断给定的字符串是否为 ULID。

```go
import "github.com/goravel/framework/support/str"

str.Of("01E5Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6").IsUlid() // true

str.Of("krishan").IsUlid() // false
```

### `IsUuid`

`IsUuid` 方法用于判断给定的字符串是否为 UUID。

```go
import "github.com/goravel/framework/support/str"

str.Of("550e8400-e29b-41d4-a716-446655440000").IsUuid() // true

str.Of("krishan").IsUuid() // false
```

### `Kebab`

`Kebab` 方法将字符串转换为 `kebab-case` 格式。

```go
import "github.com/goravel/framework/support/str"

str.Of("GoravelFramework").Kebab().String() // "goravel-framework"
```

### `LcFirst`

`LcFirst` 方法将字符串的第一个字符转换为小写。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel Framework").LcFirst().String() // "goravel Framework"
```

### `长度`

`Length` 方法返回字符串的长度。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Length() // 7
```

### `限制`

`Limit` 方法将字符串截断为给定的长度。

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").Limit(7).String() // "This is……"
```

您也可以提供第二个参数来更改用于指示截断的字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").Limit(7, " (****)").String() // "This is (****)"
```

### `小写`

`Lower` 方法将字符串转换为小写。

```go
import "github.com/goravel/framework/support/str"

str.Of("GORAVEL").Lower().String() // "goravel"
```

### `LTrim`

`LTrim` 方法修剪字符串的左侧。

```go
import "github.com/goravel/framework/support/str"

str.Of("  Goravel  ").LTrim().String() // "Goravel  "

str.Of("/framework/").LTrim("/").String() // "framework/"
```

### `Mask`

`Mask` 方法使用给定的掩码字符对字符串进行掩码处理。

```go
import "github.com/goravel/framework/support/str"

str.Of("krishan@email.com").Mask("*", 3).String() // "kri**************"
```

如果需要，您可以向掩码方法提供负数，这将指示方法从字符串的末尾开始掩码。

```go
import "github.com/goravel/framework/support/str"

str.Of("krishan@email.com").Mask("*", -13, 3).String() // "kris***@email.com"

str.Of("krishan@email.com").Mask("*", -13).String() // "kris**************"
```

### `Match`

`Match` 方法确定给定字符串是否匹配给定的正则表达式。

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a (test) string").Match(`\([^)]+\)`).String() // (test)
```

### `MatchAll`

`MatchAll` 方法确定给定字符串是否匹配所有给定的正则表达式。

```go
import "github.com/goravel/framework/support/str"

str.Of("abc123def456def").MatchAll(`\d+`) // []string{"123", "456"}
```

### `IsMatch`

`IsMatch` 方法确定给定字符串是否匹配（任何）给定的正则表达式。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, Goravel!").IsMatch(`(?i)goravel`, `goravel!(.*)`) // true
```

### `NewLine`

`NewLine` 方法将换行符附加到字符串末尾。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").NewLine(2).Append("Framework").String() // "Goravel\n\nFramework"
```

### `PadBoth`

`PadBoth` 方法在字符串的两侧填充字符。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello").PadBoth(10, "_").String() // "__Hello___"
```

### `PadLeft`

`PadLeft` 方法在字符串的左侧填充字符。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello").PadLeft(10, "_").String() // "_____Hello"
```

### `PadRight`

`PadRight` 方法用于在字符串的右侧进行填充。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello").PadRight(10, "_").String() // "Hello_____"
```

### `Pipe`

`Pipe` 方法允许您使用给定的闭包来转换字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Pipe(func(s string) string {
    return s + " Framework"
}).String() // "Goravel Framework"
```

### `Prepend`

`Prepend` 方法在字符串前面添加给定的值。

```go
import "github.com/goravel/framework/support/str"

str.Of("Framework").Prepend("Goravel ").String() // "Goravel Framework"
```

### `Remove`

`Remove` 方法从字符串中移除给定的值。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Remove("World").String() // "Hello "

str.Of("Hello World").Remove("World", "Hello").String() // " "
```

### `重复`

`Repeat` 方法将字符串重复指定的次数。

```go
import "github.com/goravel/framework/support/str"

str.Of("a").Repeat(2).String() // "aa"
```

### `替换`

`Replace` 方法替换字符串中给定的值。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Replace("World", "Krishan").String() // "Hello Krishan"
```

By default, the `Replace` method is case-sensitive. If you would like the method to be case-insensitive, you may pass `false` as the third argument.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Replace("world", "Krishan", false).String() // "Hello Krishan"
```

### `ReplaceEnd`

`ReplaceEnd` 方法仅在字符串末尾存在给定值时替换字符串中最后一次出现的给定值。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ReplaceEnd("World", "Goravel").String() // "Hello Goravel"

str.Of("Hello World").ReplaceEnd("Hello", "Goravel").String() // "Hello World"
```

### `ReplaceFirst`

`ReplaceFirst` 方法替换字符串中第一次出现的给定值。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ReplaceFirst("World", "Goravel").String() // "Hello Goravel"
```

### `ReplaceLast`

`ReplaceLast` 方法替换字符串中最后一次出现的给定值。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ReplaceLast("World", "Goravel").String() // "Hello Goravel"
```

### `ReplaceMatches`

`ReplaceMatches` 方法替换字符串中给定正则表达式匹配的内容。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, Goravel!").ReplaceMatches(`goravel!(.*)`, "Krishan") // "Hello, Krishan！"
```

### `ReplaceStart`

`ReplaceStart` 方法仅在字符串开头替换给定值的第一次出现。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ReplaceStart("Hello", "Goravel").String() // "Goravel World"

str.Of("Hello World").ReplaceStart("World", "Goravel").String() // "Hello World"
```

### `RTrim`

`RTrim` 方法修剪字符串的右侧。

```go
import "github.com/goravel/framework/support/str"

str.Of("  Goravel  ").RTrim().String() // "  Goravel"

str.Of("/framework/").RTrim("/").String() // "/framework"
```

### `Snake`

`Snake` 方法将字符串转换为 `snake_case`。

```go
import "github.com/goravel/framework/support/str"

str.Of("GoravelFramework").Snake().String() // "goravel_framework"
```

### `Split`

`Split` 方法使用给定的分隔符将字符串分割成字符串数组。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Split(" ") // []string{"Hello", "World"}
```

### `Squish`

`Squish` 方法将连续的空白字符替换为单个空格。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello    World").Squish().String() // "Hello World"
```

### `开始`

`Start` 方法会在字符串的开头添加一个给定值的单个实例，如果字符串尚未以该值开头的话。

```go
import "github.com/goravel/framework/support/str"

str.Of("framework").Start("/").String() // "/framework"

str.Of("/framework").Start("/").String() // "/framework"
```

### `StartsWith`

`StartsWith` 方法用于确定给定字符串是否以（任何）给定值开头。 该方法区分大小写。 The method is case-sensitive.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").StartsWith("Gor") // true

str.Of("Hello World").StartsWith("Gor", "Hello") // true
```

### `String`

`String` 方法返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").String() // "Goravel"
```

### `Studly`

`Studly` 方法将字符串转换为 `StudlyCase`。

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel_framework").Studly().String() // "GoravelFramework"
```

### `Substr`

`Substr` 方法返回从给定索引开始并持续给定长度的字符串部分。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Substr(1, 3) // "ora"
```

### `Swap`

`Swap` 方法交换字符串中的多个值。

```go
import "github.com/goravel/framework/support/str"

str.Of("Golang is awesome").Swap(map[string]string{
  "Golang":  "Go",
  "awesome": "excellent",
 }).String() // "Go is excellent"
```

### `Tap`

Tap 方法将字符串传递给给定的闭包并返回该字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Tap(func(s string) {
    fmt.Println(s)
}).String() // "Goravel"
```

### `测试`

Test 方法判断给定的字符串是否匹配给定的正则表达式。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, Goravel!").Test(`goravel!(.*)`) // true
```

### `标题`

Title 方法将字符串转换为`标题大小写`。

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel framework").Title().String() // "Goravel Framework"
```

### `Trim`

Trim 方法修剪字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("  Goravel  ").Trim().String() // "Goravel"

str.Of("/framework/").Trim("/").String() // "framework"
```

### `UcFirst`

`UcFirst` 方法将字符串的第一个字符转换为大写。

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel framework").UcFirst().String() // "Goravel framework"
```

### `UcSplit`

`UcSplit` 方法使用大写字符将字符串分割成字符串数组。

```go
import "github.com/goravel/framework/support/str"

str.Of("GoravelFramework").UcSplit() // []string{"Goravel", "Framework"}
```

### `Unless`

`Unless` 方法将字符串传递给给定的闭包，如果给定条件为 `false`，则返回该字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Unless(func(s *String) bool {
        return false
    }, func(s *String) *String {
        return Of("Fallback Applied")
    }).String() // "Fallback Applied"
```

### `Upper`

`Upper` 方法将字符串转换为大写。

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel").Upper().String() // "GORAVEL"
```

### `When`

`When` 方法将字符串传递给给定的闭包，并在给定条件为 `true` 时返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Bowen").When(true, func(s *str.String) *str.String {
    return s.Append(" Han")
}).String() // "Bowen Han"
```

如果需要，你可以为 `When` 方法提供第三个参数，这是一个在条件为 `false` 时执行的闭包。

### `WhenContains`

当给定字符串包含给定值时，`WhenContains` 方法将字符串传递给给定的闭包并返回该字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello Bowen").WhenContains("Hello", func(s *str.String) *str.String {
    return s.Append(" Han")
}).String() // "Hello Bowen Han"
```

如有必要，您可以提供 `WhenContains` 方法的第三个参数，这是一个闭包，当字符串不包含给定值时将被执行。

### `WhenContainsAll`

当给定字符串包含所有给定值时，`WhenContainsAll` 方法将字符串传递给给定的闭包并返回该字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello Bowen").WhenContainsAll([]string{"Hello", "Bowen"}, func(s *str.String) *str.String {
    return s.Append(" Han")
}).String() // "Hello Bowen Han"
```

如有必要，您可以提供 `WhenContainsAll` 方法的第三个参数，这是一个闭包，当字符串不包含所有给定值时将被执行。

### `WhenEmpty`

如果给定的字符串为空，`WhenEmpty` 方法会将字符串传递给给定的闭包并返回该字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("").WhenEmpty(func(s *str.String) *str.String {
    return s.Append("Goravel")
}).String() // "Goravel"
```

### `WhenIsAscii`

如果给定的字符串只包含 ASCII 字符，`WhenIsAscii` 方法会将字符串传递给给定的闭包并返回该字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").WhenIsAscii(func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String() // "Goravel Framework"

str.Of("你好").WhenIsAscii(func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String() // "你好"
```

### `WhenNotEmpty`

如果给定的字符串不为空，`WhenNotEmpty` 方法会将字符串传递给给定的闭包并返回该字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").WhenNotEmpty(func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String() // "Goravel Framework"
```

### `WhenStartsWith`

`WhenStartsWith` 方法将字符串传递给给定的闭包，如果给定的字符串以给定的值开头，则返回该字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("hello world").WhenStartsWith("hello", func(s *str.String) *str.String {
    return s.Title()
}).String() // "Hello World"
```

### `WhenEndsWith`

`WhenEndsWith` 方法将字符串传递给给定的闭包，如果给定的字符串以给定的值结尾，则返回该字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("hello world").WhenEndsWith("world", func(s *str.String) *str.String {
    return s.Title()
}).String() // "Hello World"
```

### `WhenExactly`

当给定的字符串与给定的值完全相等时，`WhenExactly`方法将字符串传递给给定的闭包并返回该字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").WhenExactly("Goravel", func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String() // "Goravel Framework"
```

### `WhenNotExactly`

当给定的字符串与给定的值不完全相等时，`WhenNotExactly`方法将字符串传递给给定的闭包并返回该字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").WhenNotExactly("Goravel", func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String() // "Goravel"
```

### `WhenIs`

如果给定的字符串匹配给定的模式，`WhenIs`方法将字符串传递给给定的闭包并返回该字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("foo/bar").WhenIs("foo/*", func(s *str.String) *str.String {
    return s.Append("/baz")
}).String() // "foo/bar/baz"
```

### `WhenIsUlid`

`WhenIsUlid` 方法将字符串传递给给定的闭包，如果给定的字符串是 ULID，则返回该字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("01E5Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6").WhenIsUlid(func(s *str.String) *str.String {
    return s.Substr(0, 10)
}).String() // "01E5Z6Z1Z6"
```

### `WhenIsUuid`

`WhenIsUuid` 方法将字符串传递给给定的闭包，如果给定的字符串是 UUID，则返回该字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("550e8400-e29b-41d4-a716-446655440000").WhenIsUuid(func(s *str.String) *str.String {
    return s.Substr(0, 8)
}).String() // "550e8400"
```

### `WhenTest`

`WhenTest` 方法将字符串传递给给定的闭包，如果给定的字符串匹配给定的正则表达式，则返回该字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel framework").WhenTest(`goravel(.*)`, func(s *str.String) *str.String {
    return s.Append(" is awesome")
}).String() // "goravel framework is awesome"
```

### `WordCount`

`WordCount` 方法返回字符串中的单词数。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, World!").WordCount() // 2
```

### `Words`

`Words` 方法限制字符串中的单词数。 如有必要，您可以提供第二个参数来更改用于指示截断的字符串。 If necessary, you may provide the second argument to change the string that is used to indicate the truncation.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, World!").Words(1) // "Hello..."

str.Of("Hello, World!").Words(1, " (****)") // "Hello (****)"
```
