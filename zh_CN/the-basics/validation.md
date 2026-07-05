# 表单验证

[[toc]]

## 简介

Goravel 提供了几种不同的方法来验证传入应用程序的数据。 最常见的做法是在所有传入的 HTTP 请求中使用 `Validate` 方法。Goravel 包含了各种方便的验证规则。

## 快速验证

让我们来看一个表单验证并将错误消息展示给用户的完整示例， 这将会对你如何使用 Goravel 验证传入的请求数据有一个很好的理解。

### 定义路由

首先，假设我们在 `routes/web.go` 路由文件中定义了下面这些路由：

```go
import "goravel/app/http/controllers"

postController := controllers.NewPostController()
facades.Route().Get("/post/create", postController.Create)
facades.Route().Post("/post", postController.Store)
```

`GET` 路由会显示一个供用户创建新博客文章的表单， 而 `POST` 路由会将新的博客文章存储到数据库中。

### 创建控制器

接下来，让我们一起来看看处理这些路由的简单控制器。 我们暂时留空了 `Store` 方法：

```go
package controllers

import (
  "github.com/goravel/framework/contracts/http"
)

type PostController struct {}

func NewPostController() *PostController {
  return &PostController{}
}

func (r *PostController) Store(ctx http.Context) {}
```

### 编写验证逻辑

现在我们开始在 `Store` 方法中编写用来验证新的博客文章的逻辑代码。

```go
func (r *PostController) Store(ctx http.Context) {
  validator, err := ctx.Request().Validate(map[string]any{
    "title": "required|max:255",
    "body": "required",
    "code": "required|regex:^[0-9]{4,6}$",
  })
}
```

### 嵌套字段

如果你的 HTTP 请求包含「嵌套」参数，你可以在验证规则中使用 `.` 语法来指定这些参数：

```go
validator, err := ctx.Request().Validate(map[string]any{
  "title": "required|max:255",
  "author.name": "required",
  "author.description": "required",
})
```

### Slice 验证

如果你的 HTTP 请求包含「数组」参数，你可以在验证规则中使用 `*` 进行校验：

```go
validator, err := ctx.Request().Validate(map[string]any{
  "tags.*": "required",
})
```

通配符规则会在验证后的数据中保留原始切片形状：

```go
validator, err := facades.Validation().Make(ctx,
  map[string]any{"scores": []int{1, 2}},
  map[string]any{"scores.*": "required|integer"},
)

scores := validator.Validated()["scores"].([]int) // []int{1, 2}
```

## 验证表单请求

### 创建表单请求验证

面对更复杂的验证场景，你可以创建一个「表单请求」。 表单请求是一个包含了验证逻辑的自定义请求类。 要创建一个表单请求类，请使用 `make:request` Artisan CLI 命令：

```go
./artisan make:request StorePostRequest
./artisan make:request user/StorePostRequest
```

该命令生成的表单请求类将被置于 `app/http/requests` 目录中。 如果这个目录不存在，在你运行 `make:request` 命令后将会创建这个目录。 Goravel 生成的每个表单请求都有 `Authorize` 和 `Rules` 方法。 另外可以自定义可选的 `Filters`、`Messages`、`Attributes` 和 `PrepareForValidation` 方法，进行更进一步的操作。

`Authorize` 方法负责确定当前经过身份验证的用户是否可以执行请求操作，而 `Rules` 方法则返回适用于请求数据的验证规则：

```go
package requests

import (
  "mime/multipart"

  "github.com/goravel/framework/contracts/http"
)

type StorePostRequest struct {
  Name string `form:"name" json:"name"`
  File *multipart.FileHeader `form:"file" json:"file"`
  Files []*multipart.FileHeader `form:"files" json:"files"`
}

func (r *StorePostRequest) Authorize(ctx http.Context) error {
  return nil
}

func (r *StorePostRequest) Rules(ctx http.Context) map[string]any {
  return map[string]any{
    // 键与传入的键保持一致
    "name": "required|max:255",
    "file": "required|file",
    "files": "required|array",
    "files.*": "required|file",
  }
}
```

然后你可以在控制器中使用 `ValidateRequest` 方法验证该表单：

```go
func (r *PostController) Store(ctx http.Context) {
  var storePost requests.StorePostRequest
  errors, err := ctx.Request().ValidateRequest(&storePost)
}
```

更多验证规则详见 [可用的验证规则](#可用的验证规则)。

> 注意，由于 `form` 传值默认为 `string` 类型，因此 request 中所有字段也都应为 `string` 类型，否则请使用 `JSON` 传值。

### 表单请求授权验证

表单请求类内也包含了 `Authorize` 方法。 在这个方法中，你可以检查经过身份验证的用户确定其是否具有更新给定资源的权限。 例如，你可以判断用户是否拥有更新文章评论的权限。 最有可能的是，你将通过以下方法与你的 [授权与策略](../security/authorization.md) 进行交互：

```go
func (r *StorePostRequest) Authorize(ctx http.Context) error {
  var comment models.Comment
  facades.Orm().Query().First(&comment)
  if comment.ID == 0 {
    return errors.New("no comment is found")
  }

  if !facades.Gate().Allows("update", map[string]any{
    "comment": comment,
  }) {
    return errors.New("can't update comment")
  }

  return nil
}
```

`error` 将会被传递到 `ctx.Request().ValidateRequest` 的返回值中。

### 过滤输入数据

你可以通过完善表单请求的 `Filters` 方法来格式化输入数据。 此方法应返回 `属性/过滤器` 的 Map。过滤器值可以是字符串或 `[]string` 值：

```go
func (r *StorePostRequest) Filters(ctx http.Context) map[string]any {
  return map[string]any{
    "name": "trim",
    "age": []string{"trim", "to_int"},
  }
}
```

### 自定义错误消息

你可以通过完善表单请求的 `Messages` 方法来自定义错误消息。 此方法应返回 `属性.规则/对应错误消息` 的 Map：

```go
func (r *StorePostRequest) Messages(ctx http.Context) map[string]string {
  return map[string]string{
    "title.required": "A title is required",
    "body.required": "A message is required",
  }
}
```

### 自定义验证属性

Goravel 的许多内置验证规则错误消息都包含 `:attribute` 占位符。 如果你希望将验证消息的 `:attribute` 部分替换为自定义属性名称，则可以重写 `Attributes` 方法来指定自定义名称。 此方法应返回属性 / 名称对的数组：

```go
func (r *StorePostRequest) Attributes(ctx http.Context) map[string]string {
  return map[string]string{
    "email": "email address",
  }
}
```

### 准备验证输入

如果你需要在应用验证规则之前修改或清理请求中的任何数据，你可以使用 `PrepareForValidation` 方法：

```go
func (r *StorePostRequest) PrepareForValidation(ctx http.Context, data validation.Data) error {
  if name, exist := data.Get("name"); exist {
    return data.Set("name", name.(string)+"1")
  }
  return nil
}
```

## 手动创建验证器

如果你不想在请求中使用 `Validate` 方法，你可以使用 `facades.Validation()` 手动创建一个验证器实例。 facade 中的 `Make` 方法将会生成一个新的验证器实例：

```go
func (r *PostController) Store(ctx http.Context) http.Response {
  validator, _ := facades.Validation().Make(
    ctx,
    map[string]any{
      "name": "Goravel",
    },
    map[string]any{
      "title": "required|max:255",
      "body":  "required",
    })

  if validator.Fails() {
    // 返回失败
  }

  var user models.User
  err := validator.Bind(&user)
  ...
}
```

在 `ctx` 之后，传递给 `Make` 方法的 data 参数可以是 `map[string]any`、`struct`、`url.Values`、`map[string][]string`、`*http.Request` 或其他支持的请求数据源。下一个参数是验证规则的 `map[string]any`。规则值可以是字符串或 `[]string` 值。

### 自定义错误消息

如果需要，你可以提供验证程序实例使用的自定义错误消息，而不是 Goravel 提供的默认错误消息。你可以使用 `validation.Messages` 传递自定义消息（也适用于 `ctx.Request().Validate()`）：

```go
validator, err := facades.Validation().Make(ctx, input, rules, validation.Messages(map[string]string{
  "required": "The :attribute field is required.",
}))
```

### 为给定属性指定自定义消息

有时你可能希望只为特定属性指定自定义错误消息， 你可以使用 `.` 表示法。 首先指定属性名称，然后指定规则(也适用于`ctx.Request().Validate()`)：

```go
validator, err := facades.Validation().Make(ctx, input, rules, validation.Messages(map[string]string{
  "email.required": "We need to know your email address!",
}))
```

显式消息覆盖优先于自定义规则的默认值。Goravel 按以下顺序解析消息：`field.rule` 消息，然后是 `rule` 消息，最后是自定义规则的 `Message()` 返回值。

### 指定自定义属性值

Goravel 的许多内置验证规则错误消息都包含 `:attribute` 占位符。 为特定字段自定义替换这些占位符的值， 你可以使用 `validation.Attributes` 传递自定义属性（也适用于 `ctx.Request().Validate()`）：

```go
validator, err := facades.Validation().Make(ctx, input, rules, validation.Attributes(map[string]string{
  "email": "email address",
}))
```

### 验证前格式化数据

你可以在验证数据前先格式化数据，以便更灵活的进行数据校验，你可以使用 `validation.PrepareForValidation` 传递格式化回调（也适用于 `ctx.Request().Validate()`）：

```go
import (
  "context"

  validationcontract "github.com/goravel/framework/contracts/validation"
  "github.com/goravel/framework/validation"
)

func (r *PostController) Store(ctx http.Context) http.Response {
  validator, err := facades.Validation().Make(ctx, input, rules,
    validation.PrepareForValidation(func(ctx context.Context, data validationcontract.Data) error {
      if name, exist := data.Get("name"); exist {
        return data.Set("name", name)
      }

      return nil
    }))

  ...
}
```

## 处理验证字段

在使用表单请求或手动创建的验证器实例验证传入请求数据后，你可以获取已验证的数据或将请求数据绑定至 `struct`。

1. 验证通过后，使用 `Validated` 方法仅获取被验证规则覆盖的字段。未包含的字段会被忽略，通配符切片规则保留原始切片形状：

```go
rules := map[string]any{
  "name": "required|string",
  "scores.*": "required|integer",
}

validator, err := ctx.Request().Validate(rules)
validated := validator.Validated()
```

2. 使用 `Bind` 方法在验证成功后绑定数据到结构体。`Bind` 会将已验证的数据合并回原始请求数据中，因此没有验证规则的字段仍然可以被绑定：

```go
validator, err := ctx.Request().Validate(rules)
var user models.User
err := validator.Bind(&user)

validator, err := facades.Validation().Make(ctx, input, rules)
var user models.User
err := validator.Bind(&user)
```

3. 使用「表单请求」进行验证时，传入的数据将会自动被绑定到表单请求：

```go
var storePost requests.StorePostRequest
errors, err := ctx.Request().ValidateRequest(&storePost)
fmt.Println(storePost.Name)
```

## 处理错误信息

### 检索特定字段的一个错误信息

```go
validator, err := ctx.Request().Validate(rules)
validator, err := facades.Validation().Make(ctx, input, rules)

message := validator.Errors().One("email")
```

### 检索特定字段的所有错误信息

```go
messages := validator.Errors().Get("email")
```

### 检索所有字段的所有错误信息

```go
messages := validator.Errors().All()
```

### 判断特定字段是否含有错误信息

```go
if validator.Errors().Has("email") {
  //
}
```

## 翻译与本地化

### 使用翻译来定制验证消息

验证错误消息现在由框架的[本地化](../digging-deeper/localization.md)系统提供支持。默认消息嵌入在框架中，并自动使用应用程序的当前语言环境。消息查找遵循以下顺序：

1. 表单请求 `Messages()` 或显式 `validation.Messages()` 覆盖（先是 `field.rule`，然后是 `rule`）
2. 自定义规则的 `Message()` 方法
3. 使用 `validation.*` 键的翻译文件查找（例如 `validation.required`、`validation.min.string`）
4. 嵌入的默认消息

对于 `min`、`max`、`between`、`size`、`gt`、`gte`、`lt` 和 `lte` 等基于大小的规则，翻译键包含属性类型后缀（例如 `min.string`、`min.numeric`、`min.array`、`min.file`）。

### 发布验证语言文件

使用 `lang:publish` Artisan 命令将验证语言文件发布到应用程序的 `lang` 目录：

```shell
go run . artisan lang:publish
```

这会将验证翻译文件从框架复制到 `lang/en/validation.json`，你可以在其中自定义默认的错误消息。

要覆盖现有文件，请使用 `--force`（或 `-f`）标志：

```shell
go run . artisan lang:publish --force
```

### 自定义默认消息

发布后，编辑 `lang/en/validation.json` 来自定义任何验证消息。例如：

```json
{
    "required": "你忘了填写 :attribute 字段！",
    "email": ":attribute 必须是一个有效的邮箱地址。"
}
```

这些自定义消息将被应用程序中的所有验证器使用，除非被表单请求的 `Messages()` 或显式的 `validation.Messages()` 覆盖。

### 翻译成其他语言

要支持其他语言，请将发布的 `lang/en/validation.json` 复制到相应的语言目录中（例如 `lang/zh/validation.json`）并翻译消息。框架将根据 `facades.App().SetLocale(ctx, "zh")` 设置的当前语言环境使用相应的语言文件。

## 可用的验证规则

验证规则名称现在默认使用 snake_case。规则和过滤器使用 `map[string]any` 定义；每个值可以是管道分隔的 `string` 或 `[]string` 规则名称。

```go
rules := map[string]any{
  "title": "required|string|max:255",
  "slug": []string{"required", "regex:^(news|docs)-[a-z]+$", "string"},
}
```

当 `regex` 或 `not_regex` 模式中包含 `|` 并且你需要在其后添加更多规则时，请使用 `[]string`。

| 分类 | 规则 |
| --- | --- |
| 必填 | `required`, `required_if`, `required_unless`, `required_with`, `required_with_all`, `required_without`, `required_without_all`, `required_if_accepted`, `required_if_declined` |
| 存在性 | `filled`, `present`, `present_if`, `present_unless`, `present_with`, `present_with_all`, `missing`, `missing_if`, `missing_unless`, `missing_with`, `missing_with_all` |
| 接受/拒绝 | `accepted`, `accepted_if`, `declined`, `declined_if` |
| 禁止 | `prohibited`, `prohibited_if`, `prohibited_unless`, `prohibited_if_accepted`, `prohibited_if_declined`, `prohibits` |
| 类型 | `string`, `integer`, `int`, `uint`, `numeric`, `boolean`, `bool`, `float`, `array`, `list`, `slice`, `map` |
| 大小 | `size`, `min`, `max`, `between`, `gt`, `gte`, `lt`, `lte` |
| 数值 | `digits`, `digits_between`, `decimal`, `multiple_of`, `min_digits`, `max_digits` |
| 字符串格式 | `alpha`, `alpha_num`, `alpha_dash`, `ascii`, `email`, `url`, `active_url`, `ip`, `ipv4`, `ipv6`, `mac_address`, `mac`, `json`, `uuid`, `uuid3`, `uuid4`, `uuid5`, `ulid`, `hex_color`, `regex`, `not_regex`, `lowercase`, `uppercase` |
| 字符串内容 | `starts_with`, `doesnt_start_with`, `ends_with`, `doesnt_end_with`, `contains`, `doesnt_contain`, `confirmed` |
| 比较 | `same`, `different`, `eq`, `ne`, `in`, `not_in`, `in_array`, `in_array_keys` |
| 日期 | `date`, `date_format`, `date_equals`, `before`, `before_or_equal`, `after`, `after_or_equal`, `timezone` |
| 排除 | `exclude`, `exclude_if`, `exclude_unless`, `exclude_with`, `exclude_without` |
| 文件 | `file`, `image`, `mimes`, `mimetypes`, `extensions`, `dimensions`, `encoding` |
| 控制 | `bail`, `nullable`, `sometimes` |
| 数组/数据库 | `distinct`, `required_array_keys`, `exists`, `unique` |

`size`、`min`、`max`、`between`、`gt`、`gte`、`lt` 和 `lte` 规则是类型感知的。它们对数值字段比较数值，对字符串比较字符串长度，对数组、切片和映射比较元素数量，对文件比较文件大小。

`exists` 规则使用 `exists:table,column1,column2,...`。`unique` 规则使用 `unique:table,column,idColumn,except1,except2,...`。这两个规则都支持 `connection.table` 语法作为表参数。

`active_url` 规则会执行 DNS 查找 URL 主机。请谨慎在请求热路径上使用它，因为 DNS 解析可能会增加延迟。

### 已弃用的规则别名

以下别名保持向后兼容，但将在下个大版本中移除。请使用新的 snake_case 名称：

| 已弃用 | 替代 |
| --- | --- |
| `len` | `size` |
| `min_len` | `min` |
| `max_len` | `max` |
| `eq_field` | `same` |
| `ne_field` | `different` |
| `gt_field` | `gt` |
| `gte_field` | `gte` |
| `lt_field` | `lt` |
| `lte_field` | `lte` |
| `gt_date` | `after` |
| `lt_date` | `before` |
| `gte_date` | `after_or_equal` |
| `lte_date` | `before_or_equal` |
| `number` | `numeric` |
| `full_url` | `url` |

## 自定义验证规则

Goravel 提供了各种有用的验证规则，但是，你可能希望定义自己的规则。 注册自定义验证规则的方法之一是使用规则对象。 要生成新的规则，你可以使用 `make:rule` Artisan 命令。

### 创建自定义规则

让我们使用这个命令生成一个验证字符串是否为大写的规则。 Goravel 会将新规则放在 `app/rules` 目录中。 如果此目录不存在，Goravel 将在你执行 Artisan 命令创建规则时创建它。

```go
./artisan make:rule Uppercase
./artisan make:rule user/Uppercase
```

### 定义自定义规则

创建规则后，我们需要定义它的行为。 一个规则包含两个方法：`Passes` 和 `Message`。 `Passes` 方法接收所有数据、待验证的数据与验证参数。 应该根据属性值是否有效返回 `true` 或 `false`。 `Message` 方法应该返回验证失败时应该使用的验证错误消息。

```go
package rules

import (
  "context"
  "strings"

  "github.com/goravel/framework/contracts/validation"
)

type Uppercase struct {
}

// Signature The name of the rule.
func (receiver *Uppercase) Signature() string {
  return "uppercase"
}

// Passes Determine if the validation rule passes.
func (receiver *Uppercase) Passes(ctx context.Context, data validation.Data, val any, options ...any) bool {
  return strings.ToUpper(val.(string)) == val.(string)
}

// Message Get the validation error message.
func (receiver *Uppercase) Message(ctx context.Context) string {
  return "The :attribute must be uppercase."
}
```

自定义规则消息支持以下占位符：

| 占位符 | 描述 |
| --- | --- |
| `:attribute` | 字段名称或自定义属性 |
| `:value` | 正在验证的字段值 |
| `:option0`, `:option1`, ... | 传递给 `Passes()` 的规则参数 |

```go
// 包含所有占位符的示例
func (receiver *Between) Message(ctx context.Context) string {
  return ":attribute 的值 :value 必须在 :option0 和 :option1 之间。"
}
```

### 注册自定义规则

通过 `make:rule` 创建的新规则将自动注册到 `bootstrap/rules.go::Rules()` 函数中，并且该函数将由 `WithRules` 调用。 如果你自行创建规则文件，则需要手动注册。

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithRules(Rules).
		WithConfig(config.Boot).
		Create()
}
```

## 可用的验证过滤器

验证过滤器默认使用 snake_case 名称。过滤器在验证之前运行，可以在表单请求上声明，也可以在手动创建验证器时使用 `validation.Filters` 声明。

| 分类 | 过滤器 |
| --- | --- |
| 字符串清理 | `trim`, `ltrim`, `rtrim` |
| 大小写转换 | `lower`, `upper`, `title`, `ucfirst`, `lcfirst` |
| 命名风格 | `camel`, `snake` |
| 类型转换 | `to_int`, `to_int64`, `to_uint`, `to_float`, `to_bool`, `to_string`, `to_time` |
| 短类型别名 | `int`, `int64`, `uint`, `float`, `bool` |
| 转义/编码 | `strip_tags`, `escape_js`, `escape_html`, `url_encode`, `url_decode` |
| 字符串分割 | `str_to_ints`, `str_to_array`, `str_to_time` |

```go
validator, err := facades.Validation().Make(ctx, input, rules, validation.Filters(map[string]any{
  "name": "trim",
  "age": []string{"trim", "to_int"},
}))
```

### 已弃用的过滤器别名

以下别名保持向后兼容，但将在下个大版本中移除。请使用新的 snake_case 名称：

| 已弃用 | 替代 |
| --- | --- |
| `trimSpace` | `trim` |
| `trimLeft` | `ltrim` |
| `trimRight` | `rtrim` |
| `lowercase` | `lower` |
| `uppercase` | `upper` |
| `lcFirst`, `lowerFirst` | `lcfirst` |
| `ucFirst`, `upperFirst` | `ucfirst` |
| `ucWord`, `upperWord` | `title` |
| `camelCase` | `camel` |
| `snakeCase` | `snake` |
| `toInt`, `integer` | `to_int` |
| `toUint` | `to_uint` |
| `toInt64` | `to_int64` |
| `toFloat` | `to_float` |
| `toBool` | `to_bool` |
| `toString` | `to_string` |
| `toTime`, `str2time`, `strToTime` | `to_time` 或 `str_to_time` |
| `escapeJs`, `escapeJS` | `escape_js` |
| `escapeHtml`, `escapeHTML` | `escape_html` |
| `urlEncode` | `url_encode` |
| `urlDecode` | `url_decode` |
| `stripTags` | `strip_tags` |
| `str2ints`, `strToInts` | `str_to_ints` |
| `str2arr`, `str2array`, `strToArray` | `str_to_array` |

## 自定义过滤器

Goravel 提供了各种有用的过滤规则，但是，你可能希望使用自己的规则。

### 创建自定义过滤器

要生成新的过滤器对象，你可以使用 `make:filter` Artisan 命令。 让我们使用这个命令生成一个将字符串转换为整数的过滤器。 这个过滤器框架已经内置，这里只是为了示例。 Goravel 会将新过滤器放在 `app/filters` 目录中。 如果此目录不存在，Goravel 将在你执行 Artisan 命令创建过滤器时创建它：

```go
./artisan make:filter ToInt
./artisan make:filter user/ToInt
```

### 定义自定义过滤器

一个过滤器包含两个方法：`Signature` 和 `Handle`。 `Signature` 方法设置该过滤器的名称。 `Handle` 方法执行具体的过滤逻辑：

```go
package filters

import (
  "context"

  "github.com/spf13/cast"
)

type ToInt struct {
}

// Signature The signature of the filter.
func (receiver *ToInt) Signature() string {
  return "to_int_custom"
}

// Handle defines the filter function to apply.
func (receiver *ToInt) Handle(ctx context.Context) any {
  return func (val any) int {
    return cast.ToInt(val)
  }
}
```

### 注册自定义过滤器

通过 `make:filter` 创建的新过滤器将自动注册到 `bootstrap/filters.go::Filters()` 函数中，并且该函数将由 `WithFilters` 调用。 如果你自行创建过滤器文件，则需要手动注册。

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithFilters(Filters).
		WithConfig(config.Boot).
		Create()
}
```
