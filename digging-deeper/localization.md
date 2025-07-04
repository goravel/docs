# Localization

[[toc]]

## Introduction

Goravel's localization features provide a convenient way to retrieve strings in various languages, making it easy to support multiple languages in your application. Language strings are stored in files in the `lang` directory, and Goravel supports two ways to organize language files:

Each language has its own file:

```
/lang
  en.json
  cn.json
```

Or, when there are too many translations, they can be categorized:

```
/lang
  /en
    user.json
  /cn
    user.json
```

## Configuring the Locale

The default language of the application is stored in the `locale` configuration option in the `config/app.go` configuration file. You can modify this value as needed to suit your application's requirements.

You can also use the `SetLocale` method provided by the App Facade to modify the default language for a single `HTTP` request at runtime:

```
facades.Route().Get("/", func(ctx http.Context) http.Response {
    facades.App().SetLocale(ctx, "en")

    return ctx.Response()
})
```

You can configure a "fallback locale" that will be used when the current language does not contain the given translation string. Like the default language, the fallback language is also configured in the `config/app.go` configuration file.

```
"fallback_locale": "en",
```

### Determining the Current Locale

You can use the `CurrentLocale` and `IsLocale` methods to determine the current `locale` or check if the `locale` is a given value.

```
locale := facades.App().CurrentLocale(ctx)
if facades.App().IsLocale(ctx, "en") {}
```

### Defining Translation Strings

In language files, you can define single-level or multi-level structures:

```
// lang/en.json
{
  "name": "It's your name",
  "required": {
    "user_id": "UserID is required"
  }
}
```

### Retrieving Translation Strings

You can use the `facades.Lang(ctx).Get()` method to retrieve translation strings from language files. If the language file contains multiple levels, you can use `.` to connect them, and if the language file is in multiple levels of folders, you can use `/` to connect them. 

For example:

```
// lang/en.json
{
  "name": "It's your name",
  "required": {
    "user_id": "UserID is required"
  }
}

facades.Lang(ctx).Get("name")
facades.Lang(ctx).Get("required.user_id")

// lang/en/role/user.json
{
  "name": "It's your name",
  "required": {
    "user_id": "UserID is required"
  }
}

facades.Lang(ctx).Get("role/user.name")
facades.Lang(ctx).Get("role/user.required.user_id")
```

#### Replacing Parameters in Translation Strings

You can define placeholders in translation strings. All placeholders have the prefix `:`. For example, you can use a placeholder to define a welcome message:

```
{
  "welcome": "Welcome, :name"
}
```

To replace placeholders when retrieving a translation string, you can pass a translation option with the replacement map as the second parameter to the `facades.Lang(ctx).Get()` method:

```
facades.Lang(ctx).Get("welcome", translation.Option{
  Replace: map[string]string{
    "name": "Goravel",
  },
})
```

#### Pluralization

Pluralization is a complex problem because different languages have various pluralization rules. However, Goravel can help you translate strings based on the pluralization rules you define. By using the `|` character, you can differentiate between the singular and plural forms of a string:

```
{
  "apples": "There is one apple|There are many apples"
}
```

You can even create more complex pluralization rules by specifying translation strings for multiple value ranges:

```
{
  "apples": "{0} There are none|[1,19] There are some|[20,*] There are many"
}
```

After defining a translation string with pluralization options, you can use the `facades.Lang(ctx).Choice()` method to retrieve the line for a given `count`. In this example, because the count is greater than 1, the plural form of the translation string is returned:

```
facades.Lang(ctx).Choice("messages.apples", 10)
```

You can also define placeholder attributes in pluralization strings. By passing an array as the third parameter to the `facades.Lang(ctx).Choice()` method, you can replace these placeholders:

```
"minutes_ago": "{1} :value minute ago|[2,*] :value minutes ago",

facades.Lang(ctx).Choice("time.minutes_ago", 5, translation.Option{
  Replace: map[string]string{
    "value": "5",
  },
})
```

## Embed Loading  

When using embed loading, the language files will be compiled into the binary file and no longer need to be deployed. The independent language files and embed loading can be used at the same time, just configure `lang_path` and `lang_fs` in the `config/app.go` file. When using, the independent language file mode will be used first, and when the independent language file does not exist, the embed loading will be used.

In the same directory as the language files, create a `fs.go` file:

```
/lang
  en.json
  cn.json
  fs.go
```

```go
// lang/fs.go
package lang

import "embed"

//go:embed *
var FS embed.FS
```

Then configure in the `config/app.go` file:

```go
// config/app.go
import "lang"

"lang_path": "lang",
"lang_fs":   lang.Fs,
```

<CommentService/>
