# 字串

[[toc]]

## 概述

Goravel 提供了一個流暢的字串操作庫，允許你輕鬆地操作字串。可以使用 `String` 方法創建一個 `string` 實例，允許你調用各種方法，每個方法都會返回當前字串實例，允許你將多個方法鏈接在一起。要在應用鏈式操作後獲得最終字串值，你可以調用 `String` 方法，返回底部的 `string` 值。 Fluent Strings 允許你通過方法鏈接組合多個字串操作，其中大多數方法返回 `support/str.String` 的實例，讓你能夠鏈接額外的方法。 要在應用鏈式操作後獲得最終字串值，你可以調用 `String` 方法，該方法返回底層的 `string` 值。

```go
import "github.com/goravel/framework/support/str"

str.Of("  Goravel  ").Trim().Lower().UpperFirst().String() // "Goravel"
```

## 可用方法

### `Of`

`Of` 方法從給定的字串創建一個新的流暢字串實例。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel")
```

### `After`

`After` 方法返回字串中指定值之後的部分。如果值為空字串或不存在於原始字串中，則返回完整字串。 如果值為空字串或不存在於原始字串中，則返回完整字串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World!").After("Hello").String() // " World!"
```

### `AfterLast`

`AfterLast` 方法返回字串中指定值最後一次出現之後的部分。如果值為空字串或不存在於原始字串中，則返回完整字串。 如果值為空字串或不存在於原始字串中，則返回完整字串。

```go
import "github.com/goravel/framework/support/str"

str.Of("docs.goravel.dev").AfterLast(".").String() // "dev"
```

### `Append`

`Append` 方法將指定的值附加到字串的末尾。

```go
import "github.com/goravel/framework/support/str"

str.Of("Bowen").Append(" Han").String() // "Bowen Han"
```

### `Basename`

`Basename` 方法返回路徑的尾部名稱組件，可選擇從基本名稱中刪除指定的後綴。

```go
import "github.com/goravel/framework/support/str"

str.Of("framework/support/str").Basename().String() // "str"

str.Of("framework/support/str.go").Basename(".go").String() // "str"
```

### `Before`

`Before` 方法返回指定值之前的字串部分。如果值為空字串或不存在於原始字串中，則返回完整字串。 如果值為空字串或不存在於原始字串中，則返回完整字串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World!").Before("World").String() // "Hello "
```

### `BeforeLast`

`BeforeLast` 方法返回指定值最後一次出現之前的字串部分。如果值為空字串或不存在於原始字串中，則返回完整字串。 如果值為空字串或不存在於原始字串中，則返回完整字串。

```go
import "github.com/goravel/framework/support/str"

str.Of("docs.goravel.dev").BeforeLast(".").String() // "docs.goravel"
```

### `Between`

`Between` 方法返回兩個給定值之間的字串部分。

```go
import "github.com/goravel/framework/support/str"

str.Of("[Hello] World!").Between("[", "]").String() // "Hello"
```

### `BetweenFirst`

`BetweenFirst` 方法返回兩個給定值之間首次匹配的字串部分。

```go
import "github.com/goravel/framework/support/str"

str.Of("[Hello] [World]!").BetweenFirst("[", "]").String() // "Hello"
```

### `Camel`

`Camel` 方法將字串轉換為 `camelCase`。

```go
import "github.com/goravel/framework/support/str"

str.Of("hello_world").Camel().String() // "helloWorld"
```

### `CharAt`

`CharAt` 方法返回給定索引處的字符。如果索引超出範圍，則返回空字串。 如果索引超出範圍，將返回空字串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").CharAt(1) // "o"
```

### `ChopEnd`

`ChopEnd` 方法根據給定字串移除待處理數據的結尾。

```go
import "github.com/goravel/framework/support/str"

str.Of("https://goravel.com").ChopEnd(".dev", ".com").String() // https://goravel
```

### `ChopStart`

`ChopStart` 方法根據給定字串移除待處理數據的開頭。

```go
import "github.com/goravel/framework/support/str"

str.Of("https://goravel.dev").ChopStart("http://", "https://").String() // goravel.dev
```

### `Contains`

`Contains` 方法確定給定字串是否包含給定值。 該方法區分大小寫。 如果提供多個值，則如果字串包含任何值，則返回 `true`。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Contains("Gor") // true

str.Of("Hello World").Contains("Gor", "Hello") // true
```

### `ContainsAll`

`ContainsAll` 方法確定給定字串是否包含所有給定值。該方法區分大小寫。 該方法區分大小寫。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ContainsAll("Hello", "World") // true

str.Of("Hello World").ContainsAll("Hello", "Gor") // false
```

### `Dirname`

`Dirname` 方法返回路徑的父部分。

```go
import "github.com/goravel/framework/support/str"

str.Of("framework/support/str").Dirname().String() // "framework/support"
```

可選，你可以提供要從路徑中刪除的目錄級別。

```go
import "github.com/goravel/framework/support/str"

str.Of("framework/support/str").Dirname(2).String() // "framework"
```

### `EndsWith`

`EndsWith` 方法確定給定字串是否以給定值結尾。 該方法區分大小寫。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").EndsWith("vel") // true
```

你可以傳遞多個值給方法，以確定字串是否以任何值結尾。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").EndsWith("vel", "lie") // true
```

### `Exactly`

`Exactly` 方法確定給定字串是否與給定值完全相等。該方法區分大小寫。 該方法區分大小寫。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Exactly("Goravel") // true
```

### `Except`

`Except` 方法從字串中提取與給定值的第一次出現匹配的摘錄。

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").
	Excerpt("beautiful", str.ExcerptOption{
        Radius: 5,
    }).String() // "...is a beautiful morn..."
```

可選，你可以使用 `Omission` 選項更改用於指示摘錄的字串。

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").
    Excerpt("beautiful", str.ExcerptOption{
        Radius: 5,
        Omission: "(...)"
    }).String() // "(...)is a beautiful morn(...)"
```

### `Explode`

`Explode` 方法使用給定的分隔符將字串拆分為字串數組。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Explode(" ") // []string{"Hello", "World"}
```

### `Finish`

`Finish` 方法確保給定字串以給定值結尾。 如果字串已經以該值結尾，則不會再次添加。

```go
import "github.com/goravel/framework/support/str"

str.Of("framework").Finish("/").String() // "framework/"

str.Of("framework/").Finish("/").String() // "framework/"
```

### `Headline`

`Headline` 方法將字串轉換為標題。

```go
import "github.com/goravel/framework/support/str"

str.Of("bowen_han").Headline().String() // "Bowen Han"

str.Of("HelloWorld").Headline().String() // "Hello World"
```

### `Is`

`Is` 方法確定給定字串是否與給定模式匹配。 該方法區分大小寫。

```go
import "github.com/goravel/framework/support/str"

str.Of("foo123").Is("bar*", "baz*", "foo*") // true
```

### `IsEmpty`

`IsEmpty` 方法確定給定字串是否為空。

```go
import "github.com/goravel/framework/support/str"

str.Of("").IsEmpty() // true
```

### `IsNotEmpty`

`IsNotEmpty` 方法確定給定字串是否不為空。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").IsNotEmpty() // true
```

### `IsAscii`

`IsAscii` 方法確定給定字串是否僅包含 ASCII 字符。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").IsAscii() // true

str.Of("你好").IsAscii() // false
```

### `IsSlice`

`IsSlice` 方法確定給定字串是否是切片。

```go
import "github.com/goravel/framework/support/str"

str.Of(`[{"name": "John"}, {"name": "Alice"}]`).IsSlice() // true

str.Of(`{"name": "John"}`).IsSlice() // false
```

### `IsMap`

`IsMap` 方法確定給定字串是否是 map。

```go
import "github.com/goravel/framework/support/str"

str.Of(`{"name": "John"}`).IsMap() // true

str.Of(`[{"name": "John"}, {"name": "Alice"}]`).IsMap() // false
```

### `IsUlid`

`IsUlid` 方法確定給定字符串是否是 ULID。

```go
import "github.com/goravel/framework/support/str"

str.Of("01E5Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6").IsUlid() // true

str.Of("krishan").IsUlid() // false
```

### `IsUuid`

`IsUuid` 方法確定給定字符串是否是 UUID。

```go
import "github.com/goravel/framework/support/str"

str.Of("550e8400-e29b-41d4-a716-446655440000").IsUuid() // true

str.Of("krishan").IsUuid() // false
```

### `Kebab`

`Kebab` 方法將字符串轉換為 `kebab-case`。

```go
import "github.com/goravel/framework/support/str"

str.Of("GoravelFramework").Kebab().String() // "goravel-framework"
```

### `LcFirst`

`LcFirst` 方法將字符串的第一個字符轉換為小寫。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel Framework").LcFirst().String() // "goravel Framework"
```

### `Length`

`Length` 方法返回字符串的長度。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Length() // 7
```

### `Limit`

`Limit` 方法將字符串截斷到給定長度。

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").Limit(7).String() // "This is..."
```

可選，你可以提供第二個參數來更改用於指示截斷的字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").Limit(7, " (****)").String() // "This is (****)"
```

### `Lower`

`Lower` 方法將字符串轉換為小寫。

```go
import "github.com/goravel/framework/support/str"

str.Of("GORAVEL").Lower().String() // "goravel"
```

### `LTrim`

`LTrim` 方法修剪字符串的左側。

```go
import "github.com/goravel/framework/support/str"

str.Of("  Goravel  ").LTrim().String() // "Goravel  "

str.Of("/framework/").LTrim("/").String() // "framework/"
```

### `Mask`

`Mask` 方法使用給定的掩碼字符掩蓋字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("krishan@email.com").Mask("*", 3).String() // "kri**************"
```

如果需要，可以向方法提供負數，該方法指示從字符串的末尾開始掩碼。

```go
import "github.com/goravel/framework/support/str"

str.Of("krishan@email.com").Mask("*", -13, 3).String() // "kris***@email.com"

str.Of("krishan@email.com").Mask("*", -13).String() // "kris**************"
```

### `Match`

`Match` 方法確定給定字符串是否與給定的正則表達式匹配。

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a (test) string").Match(`\([^)]+\)`).String() // (test)
```

### `MatchAll`

`MatchAll` 方法確定給定字符串是否與所有給定的正則表達式匹配。

```go
import "github.com/goravel/framework/support/str"

str.Of("abc123def456def").MatchAll(`\d+`) // []string{"123", "456"}
```

### `IsMatch`

`IsMatch` 方法確定給定字符串是否與（任一）給定的正則表達式匹配。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, Goravel!").IsMatch(`(?i)goravel`, `goravel!(.*)`) // true
```

### `NewLine`

`NewLine` 方法將換行符附加到字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").NewLine(2).Append("Framework").String() // "Goravel\n\nFramework"
```

### `PadBoth`

`PadBoth` 方法在字符串的兩側填充。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello").PadBoth(10, "_").String() // "__Hello___"
```

### `PadLeft`

`PadLeft` 方法在字符串的左側填充。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello").PadLeft(10, "_").String() // "_____Hello"
```

### `PadRight`

`PadRight` 方法在字符串的右側填充。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello").PadRight(10, "_").String() // "Hello_____"
```

### `Pipe`

`Pipe` 方法允許你使用給定的閉包轉換字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Pipe(func(s string) string {
    return s + " Framework"
}).String() // "Goravel Framework"
```

### `Plural`

The `Plural` method converts a singular string to its plural form. This function supports any of
the languages supported by the [pluralizer](pluralization.md).

```go
import "github.com/goravel/framework/support/str"

plural := str.Of("goose").Plural().String()
// "geese"
```

You may provide an integer argument to the function to retrieve the singular or plural form of the string:

```go
import "github.com/goravel/framework/support/str"

plural := str.Of("goose").Plural(2).String()
// "geese"

plural = str.Of("goose").Plural(1).String()
// "goose"
```

### `Prepend`

`Prepend` 方法將給定值添加到字符串的開頭。

```go
import "github.com/goravel/framework/support/str"

str.Of("Framework").Prepend("Goravel ").String() // "Goravel Framework"
```

### `Remove`

`Remove` 方法從字符串中刪除給定的值。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Remove("World").String() // "Hello "

str.Of("Hello World").Remove("World", "Hello").String() // " "
```

### `Repeat`

`Repeat` 方法重複字符串指定次數。

```go
import "github.com/goravel/framework/support/str"

str.Of("a").Repeat(2).String() // "aa"
```

### `Replace`

`Replace` 方法替換字符串中的給定值。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Replace("World", "Krishan").String() // "Hello Krishan"
```

預設情況下，`Replace` 方法是區分大小寫的。 如果你希望該方法不區分大小寫，你可以將 `false` 作為第三個參數傳遞。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Replace("world", "Krishan", false).String() // "Hello Krishan"
```

### `ReplaceEnd`

`ReplaceEnd` 方法僅在字符串的末尾替換給定值的最後一個出現。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ReplaceEnd("World", "Goravel").String() // "Hello Goravel"

str.Of("Hello World").ReplaceEnd("Hello", "Goravel").String() // "Hello World"
```

### `ReplaceFirst`

`ReplaceFirst` 方法替換字符串中的第一个給定值。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ReplaceFirst("World", "Goravel").String() // "Hello Goravel"
```

### `ReplaceLast`

`ReplaceLast` 方法替換字符串中的最後一個給定值。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ReplaceLast("World", "Goravel").String() // "Hello Goravel"
```

### `ReplaceMatches`

`ReplaceMatches` 方法替換字符串中的給定正則表達式匹配。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, Goravel!").ReplaceMatches(`goravel!(.*)`, "Krishan") // "Hello, Krishan!"
```

### `ReplaceStart`

`ReplaceStart` 方法僅在字符串的開頭替換給定值的第一次出現。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ReplaceStart("Hello", "Goravel").String() // "Goravel World"

str.Of("Hello World").ReplaceStart("World", "Goravel").String() // "Hello World"
```

### `RTrim`

`RTrim` 方法修剪字符串的右側。

```go
import "github.com/goravel/framework/support/str"

str.Of("  Goravel  ").RTrim().String() // "  Goravel"

str.Of("/framework/").RTrim("/").String() // "/framework"
```

### `Singular`

The `Singular` method converts a string to its singular form. This function supports any of
the languages supported by the [pluralizer](pluralization.md).

```go
import "github.com/goravel/framework/support/str"

singular := str.Of("heroes").Singular().String()
// "hero"
```

### `Snake`

`Snake` 方法將字符串轉換為 `snake_case`。

```go
import "github.com/goravel/framework/support/str"

str.Of("GoravelFramework").Snake().String() // "goravel_framework"
```

### `Split`

`Split` 方法使用給定的分隔符將字符串拆分為字符串數組。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Split(" ") // []string{"Hello", "World"}
```

### `Squish`

`Squish` 方法將連續的空白字符替換為單個空格。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello    World").Squish().String() // "Hello World"
```

### `Start`

`Start` 方法在字符串的開頭添加給定值的單個實例，如果它尚未以該值開頭。

```go
import "github.com/goravel/framework/support/str"

str.Of("framework").Start("/").String() // "/framework"

str.Of("/framework").Start("/").String() // "/framework"
```

### `StartsWith`

`StartsWith` 方法確定給定字符串是否以給定值開頭。 該方法區分大小寫。

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

`Studly` 方法將字符串轉換為 `StudlyCase`。

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel_framework").Studly().String() // "GoravelFramework"
```

### `Substr`

`Substr` 方法返回從給定索引開始並持續給定長度的字符串部分。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Substr(1, 3) // "ora"
```

### `Swap`

`Swap` 方法交換字符串中的多個值。

```go
import "github.com/goravel/framework/support/str"

str.Of("Golang is awesome").Swap(map[string]string{
		"Golang":  "Go",
		"awesome": "excellent",
	}).String() // "Go is excellent"
```

### `Tap`

`Tap` 方法將字符串傳遞給給定的閉包，並返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Tap(func(s string) {
    fmt.Println(s)
}).String() // "Goravel"
```

### `Test`

`Test` 方法確定給定字符串是否與給定的正則表達式匹配。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, Goravel!").Test(`goravel!(.*)`) // true
```

### `Title`

`Title` 方法將字符串轉換為 `Title Case`。

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

`UcFirst` 方法將字符串的第一個字符轉換為大寫。

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel framework").UcFirst().String() // "Goravel framework"
```

### `UcSplit`

`UcSplit` 方法使用大寫字符將字符串拆分為字符串數組。

```go
import "github.com/goravel/framework/support/str"

str.Of("GoravelFramework").UcSplit() // []string{"Goravel", "Framework"}
```

### `Unless`

`Unless` 方法將字符串傳遞給給定的閉包，並在給定條件為 `false` 時返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Unless(func(s *String) bool {
        return false
    }, func(s *String) *String {
        return Of("Fallback Applied")
    }).String() // "Fallback Applied"
```

### `Upper`

`Upper` 方法將字符串轉換為大寫。

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel").Upper().String() // "GORAVEL"
```

### `When`

`When` 方法將字符串傳遞給給定的閉包，並在給定條件為 `true` 時返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Bowen").When(true, func(s *str.String) *str.String {
    return s.Append(" Han")
}).String() // "Bowen Han"
```

如果需要，您可以提供第三個參數給 `When` 方法，該方法在條件為 `false` 時執行。

### `WhenContains`

`WhenContains` 方法將字符串傳遞給給定的閉包，並在給定字符串包含給定值時返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello Bowen").WhenContains("Hello", func(s *str.String) *str.String {
    return s.Append(" Han")
}).String() // "Hello Bowen Han"
```

如果需要，您可以提供第三個參數給 `WhenContains` 方法，該方法在字符串不包含給定值時執行。

### `WhenContainsAll`

`WhenContainsAll` 方法將字符串傳遞給給定的閉包，並在給定字符串包含所有給定值時返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello Bowen").WhenContainsAll([]string{"Hello", "Bowen"}, func(s *str.String) *str.String {
    return s.Append(" Han")
}).String() // "Hello Bowen Han"
```

如果需要，您可以提供第三個參數給 `WhenContainsAll` 方法，該方法在字符串不包含所有給定值時執行。

### `WhenEmpty`

`WhenEmpty` 方法將字符串傳遞給給定的閉包，並在給定字符串為空時返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("").WhenEmpty(func(s *str.String) *str.String {
    return s.Append("Goravel")
}).String() // "Goravel"
```

### `WhenIsAscii`

`WhenIsAscii` 方法將字符串傳遞給給定的閉包，並在給定字符串僅包含 ASCII 字符時返回字符串。

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

`WhenNotEmpty` 方法將字符串傳遞給給定的閉包，並在給定字符串不為空時返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").WhenNotEmpty(func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String() // "Goravel Framework"
```

### `WhenStartsWith`

`WhenStartsWith` 方法將字符串傳遞給給定的閉包，並在給定字符串以給定值開頭時返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("hello world").WhenStartsWith("hello", func(s *str.String) *str.String {
    return s.Title()
}).String() // "Hello World"
```

### `WhenEndsWith`

`WhenEndsWith` 方法將字符串傳遞給給定的閉包，並在給定字符串以給定值結尾時返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("hello world").WhenEndsWith("world", func(s *str.String) *str.String {
    return s.Title()
}).String() // "Hello World"
```

### `WhenExactly`

`WhenExactly` 方法將字符串傳遞給給定的閉包，並在給定字符串與給定值完全相等時返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").WhenExactly("Goravel", func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String() // "Goravel Framework"
```

### `WhenNotExactly`

`WhenNotExactly` 方法將字符串傳遞給給定的閉包，並在給定字符串不完全等於給定值時返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").WhenNotExactly("Goravel", func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String() // "Goravel"
```

### `WhenIs`

`WhenIs` 方法將字符串傳遞給給定的閉包，並在給定字符串與給定模式匹配時返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("foo/bar").WhenIs("foo/*", func(s *str.String) *str.String {
    return s.Append("/baz")
}).String() // "foo/bar/baz"
```

### `WhenIsUlid`

`WhenIsUlid` 方法將字符串傳遞給給定的閉包，並在給定字符串是 ULID 時返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("01E5Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6").WhenIsUlid(func(s *str.String) *str.String {
    return s.Substr(0, 10)
}).String() // "01E5Z6Z1Z6"
```

### `WhenIsUuid`

`WhenIsUuid` 方法將字符串傳遞給給定的閉包，並在給定字符串是 UUID 時返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("550e8400-e29b-41d4-a716-446655440000").WhenIsUuid(func(s *str.String) *str.String {
    return s.Substr(0, 8)
}).String() // "550e8400"
```

### `WhenTest`

`WhenTest` 方法將字符串傳遞給給定的閉包，並在給定字符串與給定正則表達式匹配時返回字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel framework").WhenTest(`goravel(.*)`, func(s *str.String) *str.String {
    return s.Append(" is awesome")
}).String() // "goravel framework is awesome"
```

### `WordCount`

`WordCount` 方法返回字符串中的單詞數。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, World!").WordCount() // 2
```

### `Words`

`Words` 方法限制字符串中的單詞數。 如果需要，你可以提供第二個參數來更改用於指示截斷的字符串。 如果需要，您可以提供第二個參數來更改用於指示截斷的字符串。

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, World!").Words(1) // "Hello..."

str.Of("Hello, World!").Words(1, " (****)") // "Hello (****)"
```
