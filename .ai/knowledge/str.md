# Fluent String (str)

## Import

```go
import "github.com/goravel/framework/support/str"
```

## Contracts

Support library. No framework contract file.
The `*str.String` type and all methods are defined in `support/str`.

## Usage Pattern

`str.Of(s)` returns `*str.String`. Chain methods. Call `.String()` at the end to get a `string`.
Methods that return a non-string value (`bool`, `int`, `[]string`) do NOT need `.String()`.

## Transform Methods

```go
str.Of(s).Append(values ...string) *str.String
str.Of(s).Prepend(values ...string) *str.String
str.Of(s).Remove(values ...string) *str.String
str.Of(s).Replace(search, replace string, caseSensitive ...bool) *str.String
str.Of(s).ReplaceFirst(search, replace string) *str.String
str.Of(s).ReplaceLast(search, replace string) *str.String
str.Of(s).ReplaceStart(search, replace string) *str.String
str.Of(s).ReplaceEnd(search, replace string) *str.String
str.Of(s).ReplaceMatches(pattern, replace string) *str.String
str.Of(s).Swap(pairs map[string]string) *str.String
str.Of(s).Repeat(times int) *str.String
str.Of(s).Limit(limit int, end ...string) *str.String   // default end: "..."
str.Of(s).Words(words int, end ...string) *str.String
str.Of(s).Mask(char string, index int, length ...int) *str.String
str.Of(s).PadLeft(length int, pad string) *str.String
str.Of(s).PadRight(length int, pad string) *str.String
str.Of(s).PadBoth(length int, pad string) *str.String
str.Of(s).NewLine(count ...int) *str.String
```

## Case Methods

```go
str.Of(s).Lower() *str.String              // "GORAVEL" -> "goravel"
str.Of(s).Upper() *str.String              // "goravel" -> "GORAVEL"
str.Of(s).Title() *str.String              // "goravel framework" -> "Goravel Framework"
str.Of(s).UcFirst() *str.String            // "goravel" -> "Goravel"
str.Of(s).LcFirst() *str.String            // "Goravel" -> "goravel"
str.Of(s).Camel() *str.String              // "hello_world" -> "helloWorld"
str.Of(s).Studly() *str.String             // "hello_world" -> "HelloWorld"
str.Of(s).Snake() *str.String              // "GoravelFramework" -> "goravel_framework"
str.Of(s).Kebab() *str.String              // "GoravelFramework" -> "goravel-framework"
str.Of(s).Headline() *str.String           // "bowen_han" -> "Bowen Han"
str.Of(s).UcSplit() []string               // "GoravelFramework" -> ["Goravel","Framework"]
```

## Trim Methods

```go
str.Of(s).Trim(chars ...string) *str.String     // both sides; optional chars to trim
str.Of(s).LTrim(chars ...string) *str.String    // left only
str.Of(s).RTrim(chars ...string) *str.String    // right only
str.Of(s).Squish() *str.String                  // collapse internal whitespace
```

## Extract Methods

```go
str.Of(s).After(search string) *str.String
str.Of(s).AfterLast(search string) *str.String
str.Of(s).Before(search string) *str.String
str.Of(s).BeforeLast(search string) *str.String
str.Of(s).Between(from, to string) *str.String
str.Of(s).BetweenFirst(from, to string) *str.String
str.Of(s).ChopStart(needle string) *str.String
str.Of(s).ChopEnd(needle string) *str.String
str.Of(s).Substr(start, length int) string       // returns string directly
str.Of(s).CharAt(index int) string               // returns string directly
str.Of(s).Basename(suffix ...string) *str.String
str.Of(s).Dirname(levels ...int) *str.String
str.Of(s).Except(excerpt string, opts ...str.ExcerptOption) *str.String
str.Of(s).Explode(delimiter string) []string     // returns []string directly
str.Of(s).Split(delimiter string) []string       // returns []string directly
```

## Check Methods (return bool -- no .String() needed)

```go
str.Of(s).Contains(needles ...string) bool       // any needle matches
str.Of(s).ContainsAll(needles ...string) bool    // all needles match
str.Of(s).StartsWith(needles ...string) bool
str.Of(s).EndsWith(needles ...string) bool
str.Of(s).Exactly(value string) bool
str.Of(s).Is(patterns ...string) bool            // glob patterns
str.Of(s).IsEmpty() bool
str.Of(s).IsNotEmpty() bool
str.Of(s).IsAscii() bool
str.Of(s).IsSlice() bool                         // valid JSON array
str.Of(s).IsMap() bool                           // valid JSON object
str.Of(s).IsUlid() bool
str.Of(s).IsUuid() bool
str.Of(s).IsMatch(pattern string) bool           // regex
str.Of(s).Test(pattern string) bool              // alias for IsMatch
str.Of(s).Length() int
str.Of(s).WordCount() int
```

## Regex Methods

```go
str.Of(s).Match(pattern string) *str.String      // first match
str.Of(s).MatchAll(pattern string) []string      // all matches; returns []string directly
```

## Pluralization

```go
str.Of(s).Plural(count ...int) *str.String       // no arg or count>1 = plural; count=1 = singular
str.Of(s).Singular() *str.String
```

## Path-like Methods

```go
str.Of(s).Finish(cap string) *str.String         // ensure ends with cap
str.Of(s).Start(prefix string) *str.String       // ensure starts with prefix
```

## Conditional Chaining

```go
str.Of(s).When(cond bool, fn func(*str.String) *str.String, otherwise ...func(*str.String) *str.String) *str.String
str.Of(s).Unless(cond func(*str.String) bool, fn func(*str.String) *str.String) *str.String
str.Of(s).WhenEmpty(fn func(*str.String) *str.String) *str.String
str.Of(s).WhenNotEmpty(fn func(*str.String) *str.String) *str.String
str.Of(s).WhenContains(needle string, fn func(*str.String) *str.String) *str.String
str.Of(s).WhenContainsAll(needles []string, fn func(*str.String) *str.String) *str.String
str.Of(s).WhenStartsWith(needle string, fn func(*str.String) *str.String) *str.String
str.Of(s).WhenEndsWith(needle string, fn func(*str.String) *str.String) *str.String
str.Of(s).WhenExactly(value string, fn func(*str.String) *str.String) *str.String
str.Of(s).WhenNotExactly(value string, fn func(*str.String) *str.String) *str.String
str.Of(s).WhenIs(pattern string, fn func(*str.String) *str.String) *str.String
str.Of(s).WhenIsAscii(fn func(*str.String) *str.String) *str.String
str.Of(s).WhenIsUlid(fn func(*str.String) *str.String) *str.String
str.Of(s).WhenIsUuid(fn func(*str.String) *str.String) *str.String
str.Of(s).WhenTest(pattern string, fn func(*str.String) *str.String) *str.String
```

## Utility

```go
str.Of(s).Tap(fn func(string)) *str.String       // inspect without modifying
str.Of(s).Pipe(fn func(string) string) *str.String
str.Of(s).String() string                         // terminal: get final string value
```

## Rules

- Always call `.String()` to extract a plain `string`; intermediate chain returns `*str.String`.
- Methods returning `bool`, `int`, `[]string`, or `string` directly (e.g. `CharAt`, `Substr`, `Explode`) do NOT need `.String()`.
- `Plural()` with no argument returns plural form. `Plural(1)` returns singular.
- `Replace(search, replace, false)` performs case-insensitive replacement.
- `Limit(7)` truncates to 7 characters and appends `"..."` by default.
- `Mask("*", 3)` masks from index 3 to end. `Mask("*", -13, 3)` masks 3 chars from position -13 (from end).
- `Except` extracts a contextual excerpt around the search term; `Radius` controls surrounding character count; `Omission` changes the ellipsis string (default `"..."`).
- `UcFirst` (not `UpperFirst`) is the correct method name for capitalising the first character.
