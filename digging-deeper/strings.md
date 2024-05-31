# Strings

[[toc]]

## Introduction

Goravel provides a variety of helpful functions for working with strings. This document will introduce you to some of the most commonly used string functions.

## Fluent Strings

Goravel provides a fluent string manipulation library that allows you to easily manipulate strings. Fluent Strings provides an object-oriented way to manipulate strings, allowing you to chain multiple string operations together. Every method returns the current string instance, allowing you to chain multiple methods together. So to get in String, you can use the `String` method on the response instance. The `String` method accepts a `string` instance, which allows you to set various string options.

```go
import "github.com/goravel/framework/support/str"

str.Of("  Goravel  ").Trim().Lower().UpperFirst().String() // "Goravel"
```

## Available Methods

### `Of`

The `Of` method creates a new fluent string instance.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel")
```

### `After`

The `After` method returns the portion of a string after a given value. If the value is empty string, or it does not exist within the string, full string will be returned.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World!").After("Hello").String() // " World!"
```

### `AfterLast`

The `AfterLast` method returns the portion of a string after the last occurrence of a given value. If the value is empty string, or it does not exist within the string, full string will be returned.

```go
import "github.com/goravel/framework/support/str"

str.Of("docs.goravel.dev").AfterLast(".").String() // "dev"
```

### `Append`

The `Append` method appends the given value to the string.

```go
import "github.com/goravel/framework/support/str"

str.Of("Bowen").Append(" Han").String() // "Bowen Han"
```

### `Basename`

The `Basename` method returns the trailing name component of a path. It takes an optional suffix to remove from the base name.

```go
import "github.com/goravel/framework/support/str"

str.Of("framework/support/str").Basename().String() // "str"

str.Of("framework/support/str.go").Basename(".go").String() // "str"
```

### `Before`

The `Before` method returns the portion of a string before a given value. If the value does not exist within the string, full string will be returned.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World!").Before("World").String() // "Hello "
```

### `BeforeLast`

The `BeforeLast` method returns the portion of a string before the last occurrence of a given value. If the value does not exist within the string, full string will be returned.

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

Additionally, you may use `omission` option to change the string that is used to indicate the excerpt.

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