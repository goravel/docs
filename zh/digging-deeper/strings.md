# Strings

[[toc]]

## 简介

Goravel 提供了一个流畅的字符串操作库，允许您轻松地操作字符串。流畅的字符串提供了一种面向对象的方式来操作字符串，允许您将多个字符串操作链接在一起。每个方法都会返回当前字符串实例，允许您将多个方法链接在一起。因此，要获取字符串，您可以在响应实例上使用 `String` 方法。`String` 方法接受一个 `string` 实例，允许您设置各种字符串选项。

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

`After` 方法返回字符串中指定值之后的部分。如果值为空字符串或不存在于原始字符串中，则返回完整字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World!").After("Hello").String() // " World!"
```

### `AfterLast`

`AfterLast` 方法返回字符串中指定值最后一次出现之后的部分。如果值为空字符串或不存在于原始字符串中，则返回完整字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("docs.goravel.dev").AfterLast(".").String() // "dev"
```

### `Append`

`Append` 方法将指定的值附加到字符串的末尾。

```go
import "github.com/goravel/framework/support/str"

str.Of("Bowen").Append(" Han").String() // "Bowen Han"
```

### `Basename`

`Basename` 方法返回路径的尾部名称组件，可选择从基本名称中删除指定的后缀。

```go
import "github.com/goravel/framework/support/str"

str.Of("framework/support/str").Basename().String() // "str"

str.Of("framework/support/str.go").Basename(".go").String() // "str"
```

### `Before`

`Before` 方法返回指定值之前的字符串部分。如果值为空字符串或不存在于原始字符串中，则返回完整字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World!").Before("World").String() // "Hello "
```

### `BeforeLast`

`BeforeLast` 方法返回指定值最后一次出现之前的字符串部分。如果值为空字符串或不存在于原始字符串中，则返回完整字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("docs.goravel.dev").BeforeLast(".").String() // "docs.goravel"
```

### `Between`

`Between` 方法返回两个给定值之间的字符串部分。

```go
import "github.com/goravel/framework/support/str"

str.Of("[Hello] World!").Between("[", "]").String() // "Hello"
```

### `BetweenFirst`

`BetweenFirst` 方法返回两个给定值之间首次匹配的字符串部分。

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

`CharAt` 方法返回给定索引处的字符。如果索引超出范围，则返回空字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").CharAt(1) // "o"
```

### `Contains`

`Contains` 方法确定给定字符串是否包含给定值。该方法区分大小写。如果提供多个值，则如果字符串包含任何值，则返回 `true`。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Contains("Gor") // true

str.Of("Hello World").Contains("Gor", "Hello") // true
```

### `ContainsAll`

`ContainsAll` 方法确定给定字符串是否包含所有给定值。该方法区分大小写。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ContainsAll("Hello", "World") // true

str.Of("Hello World").ContainsAll("Hello", "Gor") // false
```

### `Dirname`

`Dirname` 方法返回路径的父部分。

```go
import "github.com/goravel/framework/support/str"

str.Of("framework/support/str").Dirname().String() // "framework/support"
```

可选，您可以提供要从路径中删除的目录级别。

```go
import "github.com/goravel/framework/support/str"

str.Of("framework/support/str").Dirname(2).String() // "framework"
```

### `EndsWith`

`EndsWith` 方法确定给定字符串是否以给定值结尾。该方法区分大小写。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").EndsWith("vel") // true
```

你可以传递多个值给方法，以确定字符串是否以任何值结尾。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").EndsWith("vel", "lie") // true
```

### `Exactly`

`Exactly` 方法确定给定字符串是否与给定值完全相等。该方法区分大小写。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Exactly("Goravel") // true
```

### `Except`

`Except` 方法从字符串中提取与给定值的第一次出现匹配的摘录。

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").
	Excerpt("beautiful", str.ExcerptOption{
        Radius: 5,
    }).String() // "...is a beautiful morn...
```

可选，您可以使用 `Omission` 选项更改用于指示摘录的字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").
    Excerpt("beautiful", str.ExcerptOption{
        Radius: 5,
        Omission: "(...)"
    }).String() // "(...)is a beautiful morn(...)"
```

### `Explode`

`Explode` 方法使用给定的分隔符将字符串拆分为字符串数组。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Explode(" ") // []string{"Hello", "World"}
```

### `Finish`

`Finish` 方法确保给定字符串以给定值结尾。如果字符串已经以该值结尾，则不会再次添加。

```go
import "github.com/goravel/framework/support/str"

str.Of("framework").Finish("/").String() // "framework/"

str.Of("framework/").Finish("/").String() // "framework/"
```

### `Headline`

`Headline` 方法将字符串转换为标题。

```go
import "github.com/goravel/framework/support/str"

str.Of("bowen_han").Headline().String() // "Bowen Han"

str.Of("HelloWorld").Headline().String() // "Hello World"
```

### `Is`

`Is` 方法确定给定字符串是否与给定模式匹配。该方法区分大小写。

```go
import "github.com/goravel/framework/support/str"

str.Of("foo123").Is("bar*", "baz*", "foo*") // true
```

### `IsEmpty`

`IsEmpty` 方法确定给定字符串是否为空。

```go
import "github.com/goravel/framework/support/str"

str.Of("").IsEmpty() // true
```

### `IsNotEmpty`

`IsNotEmpty` 方法确定给定字符串是否不为空。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").IsNotEmpty() // true
```

### `IsAscii`

`IsAscii` 方法确定给定字符串是否仅包含 ASCII 字符。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").IsAscii() // true

str.Of("你好").IsAscii() // false
```

### `IsSlice`

`IsSlice` 方法确定给定字符串是否是切片。

```go
import "github.com/goravel/framework/support/str"

str.Of(`[{"name": "John"}, {"name": "Alice"}]`).IsSlice() // true

str.Of(`{"name": "John"}`).IsSlice() // false
```

### `IsMap`

`IsMap` 方法确定给定字符串是否是 map。

```go
import "github.com/goravel/framework/support/str"

str.Of(`{"name": "John"}`).IsMap() // true

str.Of(`[{"name": "John"}, {"name": "Alice"}]`).IsMap() // false
```

### `IsUlid`

`IsUlid` 方法确定给定字符串是否是 ULID。

```go
import "github.com/goravel/framework/support/str"

str.Of("01E5Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6").IsUlid() // true

str.Of("krishan").IsUlid() // false
```

### `IsUuid`

`IsUuid` 方法确定给定字符串是否是 UUID。

```go
import "github.com/goravel/framework/support/str"

str.Of("550e8400-e29b-41d4-a716-446655440000").IsUuid() // true

str.Of("krishan").IsUuid() // false
```

### `Kebab`

`Kebab` 方法将字符串转换为 `kebab-case`。

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

### `Length`

`Length` 方法返回字符串的长度。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Length() // 7
```

### `Limit`

`Limit` 方法将字符串截断到给定长度。

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").Limit(7).String() // "This is..."
```

可选，你可以提供第二个参数来更改用于指示截断的字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").Limit(7, " (****)").String() // "This is (****)"
```

### `Lower`

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

`Mask` 方法使用给定的掩码字符掩盖字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("krishan@email.com").Mask("*", 3).String() // "kri**************"
```

如果需要，可以向方法提供负数，该方法指示从字符串的末尾开始掩码。

```go
import "github.com/goravel/framework/support/str"

str.Of("krishan@email.com").Mask("*", -13, 3).String() // "kris***@email.com"

str.Of("krishan@email.com").Mask("*", -13).String() // "kris**************"
```

### `Match`

`Match` 方法确定给定字符串是否与给定的正则表达式匹配。

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a (test) string").Match(`\([^)]+\)`).String() // (test)
```

### `MatchAll`

`MatchAll` 方法确定给定字符串是否与所有给定的正则表达式匹配。

```go
import "github.com/goravel/framework/support/str"

str.Of("abc123def456def").MatchAll(`\d+`) // []string{"123", "456"}
```

### `IsMatch` 

`IsMatch` 方法确定给定字符串是否与给定的正则表达式匹配。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, Goravel!").IsMatch(`(?i)goravel`, `goravel!(.*)`) // true
```

### `NewLine`

`NewLine` 方法将换行符附加到字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").NewLine(2).Append("Framework").String() // "Goravel\n\nFramework"
```

### `PadBoth`

`PadBoth` 方法在字符串的两侧填充。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello").PadBoth(10, "_").String() // "__Hello___"
```

### `PadLeft`

`PadLeft` 方法在字符串的左侧填充。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello").PadLeft(10, "_").String() // "_____Hello"
```

### `PadRight`

`PadRight` 方法在字符串的右侧填充。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello").PadRight(10, "_").String() // "Hello_____"
```

### `Pipe`

`Pipe` 方法允许您使用给定的闭包转换字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Pipe(func(s string) string {
    return s + " Framework"
}).String() // "Goravel Framework"
```

### `Prepend`

`Prepend` 方法将给定值添加到字符串的开头。

```go
import "github.com/goravel/framework/support/str"

str.Of("Framework").Prepend("Goravel ").String() // "Goravel Framework"
```

### `Remove`

`Remove` 方法从字符串中删除给定的值。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Remove("World").String() // "Hello "

str.Of("Hello World").Remove("World", "Hello").String() // " "
```

### `Repeat`

`Repeat` 方法重复字符串指定次数。

```go
import "github.com/goravel/framework/support/str"

str.Of("a").Repeat(2).String() // "aa"
```

### `Replace`

`Replace` 方法替换字符串中的给定值。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Replace("World", "Krishan").String() // "Hello Krishan"
```

`Replace` 方法默认区分大小写。如果您希望方法不区分大小写，可以将 `false` 作为第三个参数传递。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Replace("world", "Krishan", false).String() // "Hello Krishan"
```

### `ReplaceEnd`

`ReplaceEnd` 方法仅在字符串的末尾替换给定值的最后一个出现。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ReplaceEnd("World", "Goravel").String() // "Hello Goravel"

str.Of("Hello World").ReplaceEnd("Hello", "Goravel").String() // "Hello World"
```

### `ReplaceFirst`

`ReplaceFirst` 方法替换字符串中的第一个给定值。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ReplaceFirst("World", "Goravel").String() // "Hello Goravel"
```

### `ReplaceLast`

`ReplaceLast` 方法替换字符串中的最后一个给定值。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ReplaceLast("World", "Goravel").String() // "Hello Goravel"
```

### `ReplaceMatches`

`ReplaceMatches` 方法替换字符串中的给定正则表达式匹配。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, Goravel!").ReplaceMatches(`goravel!(.*)`, "Krishan") // "Hello, Krishan!"
```

### `ReplaceStart`

`ReplaceStart` 方法仅在字符串的开头替换给定值的第一次出现。

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

`Split` 方法使用给定的分隔符将字符串拆分为字符串数组。

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

### `Start`

`Start` 方法在字符串的开头添加给定值的一个实例，如果字符串尚未以该值开头。

```go
import "github.com/goravel/framework/support/str"

str.Of("framework").Start("/").String() // "/framework"

str.Of("/framework").Start("/").String() // "/framework"
```

### `StartsWith`

`StartsWith` 方法确定给定字符串是否以给定值开头。该方法区分大小写。

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

`Tap` 方法将字符串传递给给定的闭包，并返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Tap(func(s string) {
    fmt.Println(s)
}).String() // "Goravel"
```

### `Test`

`Test` 方法确定给定字符串是否与给定的正则表达式匹配。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, Goravel!").Test(`goravel!(.*)`) // true
```

### `Title`

`Title` 方法将字符串转换为 `Title Case`。

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel framework").Title().String() // "Goravel Framework"
```

### `Trim`

`Trim` 方法修剪字符串。

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

`UcSplit` 方法使用大写字符将字符串拆分为字符串数组。

```go
import "github.com/goravel/framework/support/str"

str.Of("GoravelFramework").UcSplit() // []string{"Goravel", "Framework"}
```

### `Unless`

`Unless` 方法将字符串传递给给定的闭包，并在给定条件为 `false` 时返回字符串。

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

如果需要，您可以提供第三个参数给 `When` 方法，该方法在条件为 `false` 时执行。

### `WhenContains`

`WhenContains` 方法将字符串传递给给定的闭包，并在给定字符串包含给定值时返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello Bowen").WhenContains("Hello", func(s *str.String) *str.String {
    return s.Append(" Han")
}).String() // "Hello Bowen Han"
```

如果需要，您可以提供第三个参数给 `WhenContains` 方法，该方法在字符串不包含给定值时执行。

### `WhenContainsAll`

`WhenContainsAll` 方法将字符串传递给给定的闭包，并在给定字符串包含所有给定值时返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello Bowen").WhenContainsAll([]string{"Hello", "Bowen"}, func(s *str.String) *str.String {
    return s.Append(" Han")
}).String() // "Hello Bowen Han"
```

如果需要，您可以提供第三个参数给 `WhenContainsAll` 方法，该方法在字符串不包含所有给定值时执行。

### `WhenEmpty`

`WhenEmpty` 方法将字符串传递给给定的闭包，并在给定字符串为空时返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("").WhenEmpty(func(s *str.String) *str.String {
    return s.Append("Goravel")
}).String() // "Goravel"
```

### `WhenIsAscii`

`WhenIsAscii` 方法将字符串传递给给定的闭包，并在给定字符串仅包含 ASCII 字符时返回字符串。

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

`WhenNotEmpty` 方法将字符串传递给给定的闭包，并在给定字符串不为空时返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").WhenNotEmpty(func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String() // "Goravel Framework"
```

### `WhenStartsWith`

`WhenStartsWith` 方法将字符串传递给给定的闭包，并在给定字符串以给定值开头时返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("hello world").WhenStartsWith("hello", func(s *str.String) *str.String {
    return s.Title()
}).String() // "Hello World"
```

### `WhenEndsWith`

`WhenEndsWith` 方法将字符串传递给给定的闭包，并在给定字符串以给定值结尾时返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("hello world").WhenEndsWith("world", func(s *str.String) *str.String {
    return s.Title()
}).String() // "Hello World"
```

### `WhenExactly`

`WhenExactly` 方法将字符串传递给给定的闭包，并在给定字符串与给定值完全相等时返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").WhenExactly("Goravel", func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String() // "Goravel Framework"
```

### `WhenNotExactly`

`WhenNotExactly` 方法将字符串传递给给定的闭包，并在给定字符串不完全等于给定值时返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").WhenNotExactly("Goravel", func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String() // "Goravel"
```

### `WhenIs`

`WhenIs` 方法将字符串传递给给定的闭包，并在给定字符串与给定模式匹配时返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("foo/bar").WhenIs("foo/*", func(s *str.String) *str.String {
    return s.Append("/baz")
}).String() // "foo/bar/baz"
```

### `WhenIsUlid`

`WhenIsUlid` 方法将字符串传递给给定的闭包，并在给定字符串是 ULID 时返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("01E5Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6").WhenIsUlid(func(s *str.String) *str.String {
    return s.Substr(0, 10)
}).String() // "01E5Z6Z1Z6"
```

### `WhenIsUuid`

`WhenIsUuid` 方法将字符串传递给给定的闭包，并在给定字符串是 UUID 时返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("550e8400-e29b-41d4-a716-446655440000").WhenIsUuid(func(s *str.String) *str.String {
    return s.Substr(0, 8)
}).String() // "550e8400"
```

### `WhenTest`

`WhenTest` 方法将字符串传递给给定的闭包，并在给定字符串与给定正则表达式匹配时返回字符串。

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

`Words` 方法限制字符串中的单词数。如果需要，您可以提供第二个参数来更改用于指示截断的字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, World!").Words(1) // "Hello..."

str.Of("Hello, World!").Words(1, " (****)") // "Hello (****)"
```
