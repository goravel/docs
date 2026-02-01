# 复数

[[toc]]

## 介绍

字符串对于任何 Web 应用程序都很重要。 Goravel 提供了简单的工具在单数和复数形式之间转换单词。 它默认支持**英语**，但你可以轻松添加其他语言或自定义规则。

## 基本用法

你可以使用 `pluralizer` 包中的 `Plural` 和 `Singular` 方法。 这些方法会自动处理大多数英语单词。

```go
import "github.com/goravel/framework/support/pluralizer"

// 复数化单词
pluralizer.Plural("goose") // "geese"
pluralizer.Plural("car")   // "cars"

// 单数化单词
pluralizer.Singular("geese") // "goose"
pluralizer.Singular("cars")  // "car"
```

## 自定义规则

有时默认规则不足以处理特定单词。 Goravel 允许你添加自己的规则来处理这些情况。

:::warning
添加规则会全局改变复数化的工作方式。 你应该在应用程序启动时执行此操作，例如在服务提供者的 `Boot` 方法中。
:::

### 不规则单词

如果一个单词有独特的复数形式，你可以将其注册为“不规则”单词。 这会处理单数复数两个方向的变化。

```go
import (
	"github.com/goravel/framework/support/pluralizer"
    "github.com/goravel/framework/support/pluralizer/rules"
)

// 注册“mouse”变为“mice”
pluralizer.RegisterIrregular("english", rules.NewSubstitution("mouse", "mice"))
```

### 无变化单词

有些单词如 “fish” 或 “media” 不会改变形式或始终是复数。 你可以将这些标记为“无变化”，以便复数化器跳过它们。

```go
// “sheep”在单数和复数中都保持“sheep”
pluralizer.RegisterUninflected("english", "sheep")

// “media”始终被视为复数
pluralizer.RegisterPluralUninflected("english", "media")

// “data”始终被视为单数
pluralizer.RegisterSingularUninflected("english", "data")
```

## 语言支持

Goravel 默认使用 “english”，但你可以根据需要切换语言或添加新语言。

### 切换语言

如果你注册了其他语言，可以使用 `UseLanguage` 切换语言。

```go
if err := pluralizer.UseLanguage("spanish"); err != nil {
    panic(err)
}

// 获取当前语言名称
name := pluralizer.GetLanguage().Name()
```

### 添加新语言

要添加一种语言，您需要实现 `Language` 接口。 这定义了该语言中单词的变化方式。

```go
import "github.com/goravel/framework/contracts/support/pluralizer"

type Language interface {
    Name() string
    SingularRuleset() pluralizer.Ruleset
    PluralRuleset() pluralizer.Ruleset
}
```

实现你的语言结构体后，注册它并将其设置为默认语言。

```go
import "github.com/goravel/framework/support/pluralizer"

func init() {
    // 注册新语言
    if err := pluralizer.RegisterLanguage(&MyCustomLanguage{}); err != nil {
       panic(err)
    }
    
    // 将其设置为默认语言
    _ = pluralizer.UseLanguage("my_custom_language")
}
```

## 支持的语言

目前，复数化器开箱即用支持以下语言：

| 语言 | 代码        | 来源                                                                                   |
| :- | :-------- | :----------------------------------------------------------------------------------- |
| 英语 | `english` | [查看源代码](https://github.com/goravel/framework/tree/master/support/pluralizer/english) |

_未来版本将添加更多语言。 欢迎你通过 Pull Request 贡献新语言。_