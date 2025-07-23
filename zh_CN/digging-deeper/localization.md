# 本地化

[[toc]]

## 简介

Goravel的本地化功能提供了一种方便的方式来检索各种语言的字符串，使得在应用程序中支持多种语言变得容易。 语言字符串存储在`lang`目录的文件中，Goravel支持两种组织语言文件的方式： Language strings are stored in files in the `lang` directory, and Goravel supports two ways to organize language files:

每种语言有自己的文件：

```
/lang
  en.json
  cn.json
```

或者，当有太多翻译时，可以进行分类：

```
/lang
  /en
    user.json
  /cn
    user.json
```

## 配置区域设置

应用程序的默认语言存储在`config/app.go`配置文件中的`locale`配置选项中。 您可以根据需要修改此值以适应应用程序的要求。 You can modify this value as needed to suit your application's requirements.

您还可以使用App Facade提供的`SetLocale`方法在运行时为单个`HTTP`请求修改默认语言：

```
facades.Route().Get("/", func(ctx http.Context) http.Response {
    facades.App().SetLocale(ctx, "en")

    return ctx.Response()
})
```

You can configure a "fallback locale" that will be used when the current language does not contain the given translation string. 您可以配置一个"回退语言环境"，当当前语言不包含给定的翻译字符串时，将使用该环境。 与默认语言一样，回退语言也在`config/app.go`配置文件中配置。

```
"fallback_locale": "en",
```

### 确定当前语言环境

您可以使用`CurrentLocale`和`IsLocale`方法来确定当前的`locale`或检查`locale`是否为给定值。

```
locale := facades.App().CurrentLocale(ctx)
if facades.App().IsLocale(ctx, "en") {}
```

### 定义翻译字符串

在语言文件中，您可以定义单级或多级结构：

```
// lang/en.json
{
  "name": "这是你的名字",
  "required": {
    "user_id": "需要UserID"
  }
}
```

### 获取翻译字符串

您可以使用 `facades.Lang(ctx).Get()` 方法从语言文件中获取翻译字符串。 如果语言文件包含多个层级，您可以使用 `.` 连接它们，如果语言文件在多层文件夹中，您可以使用 `/` 连接它们。 If the language file contains multiple levels, you can use `.` to connect them, and if the language file is in multiple levels of folders, you can use `/` to connect them.

例如：

```
// lang/en.json
{
  "name": "这是你的名字",
  "required": {
    "user_id": "需要UserID"
  }
}

facades.Lang(ctx).Get("name")
facades.Lang(ctx).Get("required.user_id")

// lang/en/role/user.json
{
  "name": "这是你的名字",
  "required": {
    "user_id": "需要UserID"
  }
}

facades.Lang(ctx).Get("role/user.name")
facades.Lang(ctx).Get("role/user.required.user_id")
```

#### 替换翻译字符串中的参数

You can define placeholders in translation strings. All placeholders have the prefix `:`. For example, you can use a placeholder to define a welcome message:

```
{
  "welcome": "欢迎，:name"
}
```

要在检索翻译字符串时替换占位符，您可以将带有替换映射的翻译选项作为第二个参数传递给 `facades.Lang(ctx).Get()` 方法：

```
facades.Lang(ctx).Get("welcome", translation.Option{
  Replace: map[string]string{
    "name": "Goravel",
  },
})
```

#### 复数化

Pluralization is a complex problem because different languages have various pluralization rules. However, Goravel can help you translate strings based on the pluralization rules you define. By using the `|` character, you can differentiate between the singular and plural forms of a string:

```
{
  "apples": "{0} 没有苹果|[1,19] 有一些苹果|[20,*] 有很多苹果"
}
```

您甚至可以通过为多个值范围指定翻译字符串来创建更复杂的复数规则：

```
{
  "apples": "有一个苹果|有很多苹果"
}
```

定义带有复数选项的翻译字符串后，您可以使用 `facades.Lang(ctx).Choice()` 方法来
根据给定的 `count` 获取对应的行。 在这个例子中，因为计数大于1，所以返回了翻译字符串的复数形式： In this example, because the count is greater than 1, the plural form of the translation string is returned:

```
facades.Lang(ctx).Choice("messages.apples", 10)
```

You can also define placeholder attributes in pluralization strings. 您还可以在复数化字符串中定义占位符属性。 通过将数组作为第三个参数传递给 `facades.Lang(ctx).Choice()` 方法，您可以替换这些占位符：

```
"minutes_ago": "{1} :value 分钟前|[2,*] :value 分钟前",

facades.Lang(ctx).Choice("time.minutes_ago", 5, translation.Option{
  Replace: map[string]string{
    "value": "5",
  },
})
```

## Embed 加载

When using embed loading, the language files will be compiled into the binary file and no longer need to be deployed. 使用 embed 加载时，多语言文件将会被编译到二进制文件中，部署时不再需要多语言文件。独立语言文件与 embed 加载可以同时使用，只需要在 `config/app.go` 中同时配置 `lang_path` 和 `lang_fs` 即可。使用时将优先使用独立语言文件模式，当独立语言文件不存在时，才会使用 embed 加载。 When using, the independent language file mode will be used first, and when the independent language file does not exist, the embed loading will be used.

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
