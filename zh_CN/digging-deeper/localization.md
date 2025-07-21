# 本地化

[[toc]]

## 简介

Goravel 的本地化功能提供了一种方便的方法来检索各种语言的字符串，从而使你可以轻松地在应用程序中支持多种语言。语言字符串存储在 `lang` 目录里的文件中，Goravel 支持两种方式组织语言文件：

每一种语言文件独立一个文件：

```
/lang
  en.json
  cn.json
```

或者当语言过多时，可以对其进行分类：

```
/lang
  /en
    user.json
  /cn
    user.json
```

## 配置语言环境

应用程序的默认语言存储在 `config/app.go` 配置文件的 `locale` 配置选项中。你可以随意修改此值以适合你的应用程序的需求。

你也可以使用 App Facade 提供的 `SetLocale` 方法，在运行时为单个 `HTTP` 请求修改默认语言：

```
facades.Route().Get("/", func(ctx http.Context) http.Response {
    facades.App().SetLocale(ctx, "en")

    return ctx.Response()
})
```

你可以配置一个「备用语言」，当当前语言不包含给定的翻译字符串时，将使用该语言。和默认语言一样，备用语言也是在 `config/app.go` 配置文件中配置。

```
"fallback_locale": "en",
```

### 确定当前的语言环境

你可以使用 `CurrentLocale` 和 `IsLocale` 方法来确定当前的 `locale` 或检查 `locale` 是否是一个给定值。

```
locale := facades.App().CurrentLocale(ctx)
if facades.App().IsLocale(ctx, "en") {}
```

### 定义翻译字符串

在语言文件中，可以定义一级或多级结构：

```
// lang/en.json
{
  "name": "It's your name",
  "required": {
    "user_id": "UserID is required"
  }
}
```

### 检索翻译字符串

你可以使用 `facades.Lang(ctx).Get()` 方法从语言文件中检索翻译字符串。如果语言文件包含多个层级，可以使用 `.` 进行连接，如果语言文件在多层级的文件夹中，可以使用 `/` 进行连接。 例如：

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

#### 替换翻译字符串中的参数

可以在翻译字符串中定义占位符。所有占位符的前缀都是 `:`。例如，可以使用占位符名称定义欢迎消息：

```
{
  "welcome": "Welcome, :name"
}
```

在要检索翻译字符串时替换占位符，可以将替换数组作为第二个参数传递给 `facades.Lang(ctx).Get()` 方法：

```
facades.Lang(ctx).Get("welcome", translation.Option{
  Replace: map[string]string{
    "name": "Goravel",
  },
})
```

#### 复数化

因为不同的语言有着各种复杂的复数化规则，所以复数化是个复杂的问题；不过 Goravel 可以根据你定义的复数化规则帮助你翻译字符串。使用 `|` 字符，可以区分字符串的单数形式和复数形式：

```
{
  "apples": "There is one apple|There are many apples"
}
```

你甚至可以创建更复杂的复数化规则，为多个值范围指定转换字符串：

```
{
  "apples": "{0} There are none|[1,19] There are some|[20,*] There are many"
}
```

定义具有复数选项的翻译字符串后，可以使用 `facades.Lang(ctx).Choice()` 方法检索给定「count」的行。在本例中，由于计数大于 1 ，因此返回翻译字符串的复数形式：

```
facades.Lang(ctx).Choice("messages.apples", 10)
```

也可以在复数化字符串中定义占位符属性。通过将数组作为第三个参数传递给 `facades.Lang(ctx).Choice()` 方法，可以替换这些占位符：

```
"minutes_ago": "{1} :value minute ago|[2,*] :value minutes ago",

facades.Lang(ctx).Choice("time.minutes_ago", 5, translation.Option{
  Replace: map[string]string{
    "value": "5",
  },
})
```

## Embed 加载

使用 embed 加载时，多语言文件将会被编译到二进制文件中，部署时不再需要多语言文件。独立语言文件与 embed 加载可以同时使用，只需要在 `config/app.go` 中同时配置 `lang_path` 和 `lang_fs` 即可。使用时将优先使用独立语言文件模式，当独立语言文件不存在时，才会使用 embed 加载。

在多语言文件同级目录下创建一个 `fs.go` 文件：

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

然后在 `config/app.go` 中配置：

```go
// config/app.go
import "lang"

"lang_path": "lang",
"lang_fs":   lang.Fs,
```

