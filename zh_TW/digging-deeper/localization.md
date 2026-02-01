# 本地化

[[toc]]

## 概述

Goravel 的本地化功能提供了一種方便的方法來檢索各種語言的字符串，使你可以輕鬆地在應用程序中支持多種語言。 語言字符串存儲在 `lang` 目錄下的文件中，Goravel 支持兩種方式來組織語言文件：

每一種語言都有自己的文件：

```
/lang
  en.json
  cn.json
```

或者，當翻譯過多時，可以將它們分類：

```
/lang
  /en
    user.json
  /cn
    user.json
```

## 配置語言環境

應用程序的默認語言存儲在 `config/app.go` 配置文件中的 `locale` 配置選項中。你可以根據需要修改此值以滿足應用程序的需求。 你可以根據需要修改此值以適應你的應用程序的要求。

你也可以使用 App Facade 提供的 `SetLocale` 方法，為單個 `HTTP` 請求在運行時修改默認語言：

```go
facades.Route().Get("/", func(ctx http.Context) http.Response {
  facades.App().SetLocale(ctx, "en")

  return ctx.Response()
})
```

你可以配置一個「備用語言」，當當前語言不包含給定的翻譯字符串時，將使用該語言。 和默認語言一樣，備用語言也在 `config/app.go` 配置文件中進行配置。

```
"fallback_locale": "en",
```

### 確定當前的語言環境

你可以使用 `CurrentLocale` 和 `IsLocale` 方法來確定當前的 `locale` 或檢查 `locale` 是否是給定值。

```
locale := facades.App().CurrentLocale(ctx)
if facades.App().IsLocale(ctx, "en") {}
```

### 定義翻譯字符串

在語言文件中，可以定義單級或多級結構：

```json
// lang/en.json
{
  "name": "It's your name",
  "required": {
    "user_id": "UserID is required"
  }
}
```

### 檢索翻譯字符串

你可以使用 `facades.Lang(ctx).Get()` 方法從語言文件中檢索翻譯字符串。如果語言文件包含多個層級，可以使用 `.` 進行連接；如果語言文件位於多層目錄中，可以使用 `/` 進行連接。 如果語言文件包含多個層級，你可以使用 `.` 進行連接，並且如果語言文件在多個層級的文件夾中，可以使用 `/` 進行連接。

例如：

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

#### 替換翻譯字符串中的參數

你可以在翻譯字符串中定義佔位符。 所有佔位符都以 `:` 開頭。 例如，你可以使用佔位符來定義歡迎消息：

```json
{
  "welcome": "Welcome, :name"
}
```

在檢索翻譯字符串時替換佔位符，可以將替換映射作為第二個參數傳遞給 `facades.Lang(ctx).Get()` 方法：

```go
facades.Lang(ctx).Get("welcome", translation.Option{
  Replace: map[string]string{
    "name": "Goravel",
  },
})
```

#### 複數化

複數化是一個複雜的問題，因為不同的語言有不同的複數化規則。 然而，Goravel 可以幫助你根據定義的複數化規則翻譯字符串。 通過使用 `|` 字符，你可以區分字符串的單數和複數形式：

```json
{
  "apples": "有一個蘋果|有很多蘋果"
}
```

你甚至可以創建更複雜的複數化規則，為多個值範圍指定翻譯字符串：

```json
{
  "apples": "{0} 沒有|[1,19] 有一些|[20,*] 有很多"
}
```

在定義具有複數選項的翻譯字符串後，你可以使用 `facades.Lang(ctx).Choice()` 方法檢索給定「count」的行。 在這個例子中，由於計數大於 1，因此返回翻譯字符串的複數形式：

```go
facades.Lang(ctx).Choice("messages.apples", 10)
```

你也可以在複數化字符串中定義佔位符屬性。 通過將數組作為第三個參數傳遞給 `facades.Lang(ctx).Choice()` 方法，你可以替換這些佔位符：

```
"minutes_ago": "{1} :value 分鐘前|[2,*] :value 分鐘前",

facades.Lang(ctx).Choice("time.minutes_ago", 5, translation.Option{
  Replace: map[string]string{
    "value": "5",
  },
})
```

## Embed 加載

使用嵌入加載時，語言文件將被編譯到二進制文件中，不再需要部署。 獨立語言文件和嵌入加載可以同時使用，僅需在 `config/app.go` 文件中配置 `lang_path` 和 `lang_fs`。 在使用時，將優先使用獨立語言文件模式，當獨立語言文件不存在時，將使用嵌入加載。

在與語言文件同一目錄下，創建一個 `fs.go` 文件：

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

然後在 `config/app.go` 文件中配置：

```go
// config/app.go
import "lang"

"lang_path": "lang",
"lang_fs":   lang.Fs,
```
