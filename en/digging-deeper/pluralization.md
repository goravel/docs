# Pluralization

[[toc]]

## Introduction

Strings are important for any web application. Goravel provides simple utilities to convert words between singular 
and plural forms. It supports **English** by default, but you can add other languages or custom rules easily.

## Basic Usage

You can use the `Plural` and `Singular` methods from the `pluralizer` package. These handle most English words automatically.

```go
import "github.com/goravel/framework/support/pluralizer"

// Pluralize words
pluralizer.Plural("goose") // "geese"
pluralizer.Plural("car")   // "cars"

// Singularize words
pluralizer.Singular("geese") // "goose"
pluralizer.Singular("cars")  // "car"
```

## Custom Rules

Sometimes the default rules are not enough for specific words. Goravel lets you add your own rules to handle these cases.

::: warning
Adding rules changes how pluralization works globally. You should do this when your application starts, 
like in the `Boot` method of a Service Provider.
:::

### Irregular Words

If a word has a unique plural form, you can register it as an "irregular" word. This handles changes in both directions.

```go
import "github.com/goravel/framework/support/pluralizer"

// Register that "mouse" becomes "mice"
pluralizer.RegisterIrregular("english", pluralizer.Substitution{
    Singular: "mouse",
    Plural:   "mice",
})
```

### Uninflected Words

Some words like "fish" or "media" do not change form or are always plural. You can mark these as "uninflected" 
so the pluralizer skips them.

```go
// "sheep" stays "sheep" in singular and plural
pluralizer.RegisterUninflected("english", "sheep", "fish")

// "media" is always treated as plural
pluralizer.RegisterPluralUninflected("english", "media")

// "data" is always treated as singular
pluralizer.RegisterSingularUninflected("english", "data")
```

## Language Support

Goravel uses "english" by default, but you can switch languages or add new ones if you need to.

### Switching Languages

If you have other languages registered, you can switch the active one using `UseLanguage`.

```go
if err := pluralizer.UseLanguage("spanish"); err != nil {
    panic(err)
}

// Get the current language name
name := pluralizer.GetLanguage().Name()
```

### Adding New Languages

To add a language, you need to implement the `Language` interface. This defines how words change in that language.

```go
import "github.com/goravel/framework/contracts/support/pluralizer"

type Language interface {
    Name() string
    SingularRuleset() pluralizer.Ruleset
    PluralRuleset() pluralizer.Ruleset
}
```

After implementing your language struct, register it and set it as active.

```go
import "github.com/goravel/framework/support/pluralizer"

func init() {
    // Register the new language
    if err := pluralizer.RegisterLanguage(&MyCustomLanguage{}); err != nil {
       panic(err)
    }
    
    // Set it as active
    _ = pluralizer.UseLanguage("my_custom_language")
}
```

## Supported Languages

Currently, the pluralizer supports the following languages out of the box:

| Language | Code      | Source                                                                                     |
|:---------|:----------|:-------------------------------------------------------------------------------------------|
| English  | `english` | [View Source](https://github.com/goravel/framework/tree/master/support/pluralizer/english) |

*More languages will be added in future releases. You are welcome to contribute new languages via Pull Request.*