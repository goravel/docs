# Strings

[[toc]]

## Introduction

Goravel provides a fluent string manipulation library that allows you to easily manipulate strings. Fluent Strings allows you to combine multiple string operations through method chaining, where most of the methods returns an instance of `support/str.String`, letting you chain additional methods. To get the final string value after applying the chained operations, you can call the `String` method, which returns the underlying `string` value.

```go
import "github.com/goravel/framework/support/str"

str.Of("  Goravel  ").Trim().Lower().UpperFirst().String() // "Goravel"
```

## Available Methods

### `Of`

The `Of` method creates a new fluent string instance from a given string.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel")
```

### `After`

The `After` method returns the portion of a string that appears after a specified value. If the value is an empty string or does not exist within the original string, the full string is returned.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World!").After("Hello").String() // " World!"
```

### `AfterLast`

The `AfterLast` method returns the portion of a string that appears after the last occurrence of a specified value. If the value is an empty string or does not exist within the original string, the full string is returned.

```go
import "github.com/goravel/framework/support/str"

str.Of("docs.goravel.dev").AfterLast(".").String() // "dev"
```

### `Append`

The `Append` method appends the specified value to the end of the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("Bowen").Append(" Han").String() // "Bowen Han"
```

### `Basename`

The `Basename` method returns the trailing name component of a path, optionally removing a specified suffix from the base name.

```go
import "github.com/goravel/framework/support/str"

str.Of("framework/support/str").Basename().String() // "str"

str.Of("framework/support/str.go").Basename(".go").String() // "str"
```

### `Before`

The `Before` method returns the portion of a string that appears before a specified value. If the value is an empty string or does not exist within the original string, the full string is returned.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World!").Before("World").String() // "Hello "
```

### `BeforeLast`

The `BeforeLast` method returns the portion of a string that appears before the last occurrence of a specified value. If the value is an empty string or does not exist within the original string, the full string is returned.

```go
import "github.com/goravel/framework/support/str"

str.Of("docs.goravel.dev").BeforeLast(".").String() // "docs.goravel"
```

### `Between`

The `Between` method returns the portion of a string between two given values.

```go
import "github.com/goravel/framework/support/str"

str.Of("[Hello] World!").Between("[", "]").String() // "Hello"
```

### `BetweenFirst`

The `BetweenFirst` method returns the portion of a string between the first occurrence of two given values.

```go
import "github.com/goravel/framework/support/str"

str.Of("[Hello] [World]!").BetweenFirst("[", "]").String() // "Hello"
```

### `Camel`

The `Camel` method converts the string to `camelCase`.

```go
import "github.com/goravel/framework/support/str"

str.Of("hello_world").Camel().String() // "helloWorld"
```

### `CharAt`

The `CharAt` method returns the character at the given index. If the index is out of bounds, an empty string will be returned.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").CharAt(1) // "o"
```

### `ChopEnd`

The `ChopEnd` method removes the given value(s) from the end of the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("https://goravel.com").ChopEnd(".dev", ".com").String() // https://goravel
```

### `ChopStart`

The `ChopStart` method removes the given value(s) from the start of the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("https://goravel.dev").ChopStart("http://", "https://").String() // goravel.dev
```

### `Contains`

The `Contains` method determines if the given string contains the given value. The method is case-sensitive. If multiple values are provided, it will return `true` if the string contains any of the values.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Contains("Gor") // true

str.Of("Hello World").Contains("Gor", "Hello") // true
```

### `ContainsAll`

The `ContainsAll` method determines if the given string contains all of the given values. The method is case-sensitive.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ContainsAll("Hello", "World") // true

str.Of("Hello World").ContainsAll("Hello", "Gor") // false
```

### `Dirname`

The `Dirname` method returns the parent portion of a path.

```go
import "github.com/goravel/framework/support/str"

str.Of("framework/support/str").Dirname().String() // "framework/support"
```

Optionally, you may provide the directory level to trim from the path.

```go
import "github.com/goravel/framework/support/str"

str.Of("framework/support/str").Dirname(2).String() // "framework"
```

### `EndsWith`

The `EndsWith` method determines if the given string ends with the given value. The method is case-sensitive.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").EndsWith("vel") // true
```

You may pass multiple values to the method to determine if the string ends with any of the values.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").EndsWith("vel", "lie") // true
```

### `Exactly`

The `Exactly` method determines if the given string is exactly equal to the given value. The method is case-sensitive.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Exactly("Goravel") // true
```

### `Except`

The `Except` method extracts an excerpt from the string that matches the first occurrence of the given value.

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").
	Excerpt("beautiful", str.ExcerptOption{
        Radius: 5,
    }).String() // "...is a beautiful morn...
```

Additionally, you may use `Omission` option to change the string that is used to indicate the excerpt.

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").
    Excerpt("beautiful", str.ExcerptOption{
        Radius: 5,
        Omission: "(...)"
    }).String() // "(...)is a beautiful morn(...)"
```

### `Explode`

The `Explode` method splits the string into an array of strings using the given delimiter.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Explode(" ") // []string{"Hello", "World"}
```

### `Finish`

The `Finish` method ensures that the given string ends with the given value. If the string already ends with the value, it will not be added again.

```go
import "github.com/goravel/framework/support/str"

str.Of("framework").Finish("/").String() // "framework/"

str.Of("framework/").Finish("/").String() // "framework/"
```

### `Headline`

The `Headline` method converts the string to a headline.

```go
import "github.com/goravel/framework/support/str"

str.Of("bowen_han").Headline().String() // "Bowen Han"

str.Of("HelloWorld").Headline().String() // "Hello World"
```

### `Is`

The `Is` method determines if the given string matches the given pattern. The method is case-sensitive.

```go
import "github.com/goravel/framework/support/str"

str.Of("foo123").Is("bar*", "baz*", "foo*") // true
```

### `IsEmpty`

The `IsEmpty` method determines if the given string is empty.

```go
import "github.com/goravel/framework/support/str"

str.Of("").IsEmpty() // true
```

### `IsNotEmpty`

The `IsNotEmpty` method determines if the given string is not empty.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").IsNotEmpty() // true
```

### `IsAscii`

The `IsAscii` method determines if the given string contains only ASCII characters.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").IsAscii() // true

str.Of("你好").IsAscii() // false
```

### `IsSlice`

The `IsSlice` method determines if the given string is a slice.

```go
import "github.com/goravel/framework/support/str"

str.Of(`[{"name": "John"}, {"name": "Alice"}]`).IsSlice() // true

str.Of(`{"name": "John"}`).IsSlice() // false
```

### `IsMap`

The `IsMap` method determines if the given string is a map.

```go
import "github.com/goravel/framework/support/str"

str.Of(`{"name": "John"}`).IsMap() // true

str.Of(`[{"name": "John"}, {"name": "Alice"}]`).IsMap() // false
```

### `IsUlid`

The `IsUlid` method determines if the given string is a ULID.

```go
import "github.com/goravel/framework/support/str"

str.Of("01E5Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6").IsUlid() // true

str.Of("krishan").IsUlid() // false
```

### `IsUuid`

The `IsUuid` method determines if the given string is a UUID.

```go
import "github.com/goravel/framework/support/str"

str.Of("550e8400-e29b-41d4-a716-446655440000").IsUuid() // true

str.Of("krishan").IsUuid() // false
```

### `Kebab`

The `Kebab` method converts the string to `kebab-case`.

```go
import "github.com/goravel/framework/support/str"

str.Of("GoravelFramework").Kebab().String() // "goravel-framework"
```

### `LcFirst`

The `LcFirst` method converts the first character of the string to lowercase.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel Framework").LcFirst().String() // "goravel Framework"
```

### `Length`

The `Length` method returns the length of the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Length() // 7
```

### `Limit`

The `Limit` method truncates the string to the given length.

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").Limit(7).String() // "This is..."
```

Optionally, you may provide the second argument to change the string that is used to indicate the truncation.

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").Limit(7, " (****)").String() // "This is (****)"
```

### `Lower`

The `Lower` method converts the string to lowercase.

```go
import "github.com/goravel/framework/support/str"

str.Of("GORAVEL").Lower().String() // "goravel"
```

### `LTrim`

The `LTrim` method trims the left side of the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("  Goravel  ").LTrim().String() // "Goravel  "

str.Of("/framework/").LTrim("/").String() // "framework/"
```

### `Mask`

The `Mask` method masks the string with the given mask character.

```go
import "github.com/goravel/framework/support/str"

str.Of("krishan@email.com").Mask("*", 3).String() // "kri**************"
```

If needed, you may provide negative number to mask method which instruct the method to begin masking from the end of the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("krishan@email.com").Mask("*", -13, 3).String() // "kris***@email.com"

str.Of("krishan@email.com").Mask("*", -13).String() // "kris**************"
```

### `Match`

The `Match` method determines if the given string matches the given regular expression.

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a (test) string").Match(`\([^)]+\)`).String() // (test)
```

### `MatchAll`

The `MatchAll` method determines if the given string matches all of the given regular expressions.

```go
import "github.com/goravel/framework/support/str"

str.Of("abc123def456def").MatchAll(`\d+`) // []string{"123", "456"}
```

### `IsMatch`

The `IsMatch` method determines if the given string matches (any of) the given regular expression.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, Goravel!").IsMatch(`(?i)goravel`, `goravel!(.*)`) // true
```

### `NewLine`

The `NewLine` method appends a newline character to the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").NewLine(2).Append("Framework").String() // "Goravel\n\nFramework"
```

### `PadBoth`

The `PadBoth` method pads both sides of the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello").PadBoth(10, "_").String() // "__Hello___"
```

### `PadLeft`

The `PadLeft` method pads the left side of the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello").PadLeft(10, "_").String() // "_____Hello"
```

### `PadRight`

The `PadRight` method pads the right side of the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello").PadRight(10, "_").String() // "Hello_____"
```

### `Pipe`

The `Pipe` method allows you to transform the string using a given closure.

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

The `Prepend` method prepends the given value to the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("Framework").Prepend("Goravel ").String() // "Goravel Framework"
```

### `Remove`

The `Remove` method removes the given value(s) from the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Remove("World").String() // "Hello "

str.Of("Hello World").Remove("World", "Hello").String() // " "
```

### `Repeat`

The `Repeat` method repeats the string a given number of times.

```go
import "github.com/goravel/framework/support/str"

str.Of("a").Repeat(2).String() // "aa"
```

### `Replace`

The `Replace` method replaces the given value in the string.

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

The `ReplaceEnd` method replaces the last occurrence of the given value in the string only if it is at the end of the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ReplaceEnd("World", "Goravel").String() // "Hello Goravel"

str.Of("Hello World").ReplaceEnd("Hello", "Goravel").String() // "Hello World"
```

### `ReplaceFirst`

The `ReplaceFirst` method replaces the first occurrence of the given value in the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ReplaceFirst("World", "Goravel").String() // "Hello Goravel"
```

### `ReplaceLast`

The `ReplaceLast` method replaces the last occurrence of the given value in the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ReplaceLast("World", "Goravel").String() // "Hello Goravel"
```

### `ReplaceMatches`

The `ReplaceMatches` method replaces the given regular expression matches in the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, Goravel!").ReplaceMatches(`goravel!(.*)`, "Krishan") // "Hello, Krishan!"
```

### `ReplaceStart`

The `ReplaceStart` method replaces the first occurrence of the given value in the string only if it is at the start of the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ReplaceStart("Hello", "Goravel").String() // "Goravel World"

str.Of("Hello World").ReplaceStart("World", "Goravel").String() // "Hello World"
```

### `RTrim`

The `RTrim` method trims the right side of the string.

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

The `Snake` method converts the string to `snake_case`.

```go
import "github.com/goravel/framework/support/str"

str.Of("GoravelFramework").Snake().String() // "goravel_framework"
```

### `Split`

The `Split` method splits the string into an array of strings using the given delimiter.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Split(" ") // []string{"Hello", "World"}
```

### `Squish`

The `Squish` method replaces consecutive whitespace characters with a single space.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello    World").Squish().String() // "Hello World"
```

### `Start`

The `Start` method adds a single instance of the given value to the beginning of the string if it does not already start with the value.

```go
import "github.com/goravel/framework/support/str"

str.Of("framework").Start("/").String() // "/framework"

str.Of("/framework").Start("/").String() // "/framework"
```

### `StartsWith`

The `StartsWith` method determines if the given string starts with (any) given value(s). The method is case-sensitive.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").StartsWith("Gor") // true

str.Of("Hello World").StartsWith("Gor", "Hello") // true
```

### `String`

The `String` method returns the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").String() // "Goravel"
```

### `Studly`

The `Studly` method converts the string to `StudlyCase`.

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel_framework").Studly().String() // "GoravelFramework"
```

### `Substr`

The `Substr` method returns the portion of the string starting at the given index and continuing for the given length.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Substr(1, 3) // "ora"
```

### `Swap`

The `Swap` method swaps multiple values in the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("Golang is awesome").Swap(map[string]string{
		"Golang":  "Go",
		"awesome": "excellent",
	}).String() // "Go is excellent"
```

### `Tap`

The `Tap` method passes the string to the given closure and returns the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Tap(func(s string) {
    fmt.Println(s)
}).String() // "Goravel"
```

### `Test`

The `Test` method determines if the given string matches the given regular expression.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, Goravel!").Test(`goravel!(.*)`) // true
```

### `Title`

The `Title` method converts the string to `Title Case`.

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel framework").Title().String() // "Goravel Framework"
```

### `Trim`

The `Trim` method trims the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("  Goravel  ").Trim().String() // "Goravel"

str.Of("/framework/").Trim("/").String() // "framework"
```

### `UcFirst`

The `UcFirst` method converts the first character of the string to uppercase.

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel framework").UcFirst().String() // "Goravel framework"
```

### `UcSplit`

The `UcSplit` method splits the string into an array of strings using uppercase characters.

```go
import "github.com/goravel/framework/support/str"

str.Of("GoravelFramework").UcSplit() // []string{"Goravel", "Framework"}
```

### `Unless`

The `Unless` method passes the string to the given closure and returns the string if the given condition is `false`.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Unless(func(s *String) bool {
        return false
    }, func(s *String) *String {
        return Of("Fallback Applied")
    }).String() // "Fallback Applied"
```

### `Upper`

The `Upper` method converts the string to uppercase.

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel").Upper().String() // "GORAVEL"
```

### `When`

The `When` method passes the string to the given closure and returns the string if the given condition is `true`.

```go
import "github.com/goravel/framework/support/str"

str.Of("Bowen").When(true, func(s *str.String) *str.String {
    return s.Append(" Han")
}).String() // "Bowen Han"
```

If necessary, you may provide the third argument to the `When` method which is a closure that will be executed when the condition is `false`.

### `WhenContains`

The `WhenContains` method passes the string to the given closure and returns the string if the given string contains the given value.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello Bowen").WhenContains("Hello", func(s *str.String) *str.String {
    return s.Append(" Han")
}).String() // "Hello Bowen Han"
```

If necessary, you may provide the third argument to the `WhenContains` method which is a closure that will be executed when the string does not contain the given value.

### `WhenContainsAll`

The `WhenContainsAll` method passes the string to the given closure and returns the string if the given string contains all of the given values.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello Bowen").WhenContainsAll([]string{"Hello", "Bowen"}, func(s *str.String) *str.String {
    return s.Append(" Han")
}).String() // "Hello Bowen Han"
```

If necessary, you may provide the third argument to the `WhenContainsAll` method which is a closure that will be executed when the string does not contain all the given values.

### `WhenEmpty`

The `WhenEmpty` method passes the string to the given closure and returns the string if the given string is empty.

```go
import "github.com/goravel/framework/support/str"

str.Of("").WhenEmpty(func(s *str.String) *str.String {
    return s.Append("Goravel")
}).String() // "Goravel"
```

### `WhenIsAscii`

The `WhenIsAscii` method passes the string to the given closure and returns the string if the given string contains only ASCII characters.

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

The `WhenNotEmpty` method passes the string to the given closure and returns the string if the given string is not empty.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").WhenNotEmpty(func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String() // "Goravel Framework"
```

### `WhenStartsWith`

The `WhenStartsWith` method passes the string to the given closure and returns the string if the given string starts with the given value.

```go
import "github.com/goravel/framework/support/str"

str.Of("hello world").WhenStartsWith("hello", func(s *str.String) *str.String {
    return s.Title()
}).String() // "Hello World"
```

### `WhenEndsWith`

The `WhenEndsWith` method passes the string to the given closure and returns the string if the given string ends with the given value.

```go
import "github.com/goravel/framework/support/str"

str.Of("hello world").WhenEndsWith("world", func(s *str.String) *str.String {
    return s.Title()
}).String() // "Hello World"
```

### `WhenExactly`

The `WhenExactly` method passes the string to the given closure and returns the string if the given string is exactly equal to the given value.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").WhenExactly("Goravel", func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String() // "Goravel Framework"
```

### `WhenNotExactly`

The `WhenNotExactly` method passes the string to the given closure and returns the string if the given string is not exactly equal to the given value.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").WhenNotExactly("Goravel", func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String() // "Goravel"
```

### `WhenIs`

The `WhenIs` method passes the string to the given closure and returns the string if the given string matches the given pattern.

```go
import "github.com/goravel/framework/support/str"

str.Of("foo/bar").WhenIs("foo/*", func(s *str.String) *str.String {
    return s.Append("/baz")
}).String() // "foo/bar/baz"
```

### `WhenIsUlid`

The `WhenIsUlid` method passes the string to the given closure and returns the string if the given string is a ULID.

```go
import "github.com/goravel/framework/support/str"

str.Of("01E5Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6").WhenIsUlid(func(s *str.String) *str.String {
    return s.Substr(0, 10)
}).String() // "01E5Z6Z1Z6"
```

### `WhenIsUuid`

The `WhenIsUuid` method passes the string to the given closure and returns the string if the given string is a UUID.

```go
import "github.com/goravel/framework/support/str"

str.Of("550e8400-e29b-41d4-a716-446655440000").WhenIsUuid(func(s *str.String) *str.String {
    return s.Substr(0, 8)
}).String() // "550e8400"
```

### `WhenTest`

The `WhenTest` method passes the string to the given closure and returns the string if the given string matches the given regular expression.

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel framework").WhenTest(`goravel(.*)`, func(s *str.String) *str.String {
    return s.Append(" is awesome")
}).String() // "goravel framework is awesome"
```

### `WordCount`

The `WordCount` method returns the number of words in the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, World!").WordCount() // 2
```

### `Words`

The `Words` method limits the number of words in the string. If necessary, you may provide the second argument to change the string that is used to indicate the truncation.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, World!").Words(1) // "Hello..."

str.Of("Hello, World!").Words(1, " (****)") // "Hello (****)"
```
