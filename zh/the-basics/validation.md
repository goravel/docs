# 表单验证

[[toc]]

## 简介

Goravel 提供了几种不同的方法来验证传入应用程序的数据。最常见的做法是在所有传入的 HTTP 请求中使用 `validate` 方法。Goravel 包含了各种方便的验证规则。

## 快速验证

为了了解 Goravel 强大的验证功能，我们来看一个表单验证并将错误消息展示给用户的完整示例。通过阅读概述，这将会对您如何使用 Goravel 验证传入的请求数据有一个很好的理解：

### 定义路由

首先，假设我们在 `routes/web.go` 路由文件中定义了下面这些路由：

```go
import "goravel/app/http/controllers"

postController := controllers.NewPostController()
facades.Route().Get("/post/create", postController.Create)
facades.Route().Post("/post", postController.Store)
```

`GET` 路由会显示一个供用户创建新博客文章的表单，而 `POST` 路由会将新的博客文章存储到数据库中。

### 创建控制器

接下来，让我们一起来看看处理这些路由的简单控制器。我们暂时留空了 `Store` 方法：

```go
package controllers

import (
  "github.com/goravel/framework/contracts/http"
)

type PostController struct {
  // Dependent services
}

func NewPostController() *PostController {
  return &PostController{
    // Inject services
  }
}

func (r *PostController) Create(ctx http.Context) {

}

func (r *PostController) Store(ctx http.Context) {

}
```

### 编写验证逻辑

现在我们开始在 `Store` 方法中编写用来验证新的博客文章的逻辑代码。

```go
func (r *PostController) Store(ctx http.Context) {
  validator, err := ctx.Request().Validate(map[string]string{
    "title": "required|max_len:255",
    "body": "required",
  })
}
```

### 嵌套字段的说明

如果您的 HTTP 请求包含「嵌套」参数，您可以在验证规则中使用 `.` 语法来指定这些参数：

```go
validator, err := ctx.Request().Validate(map[string]string{
  "title": "required|max_len:255",
  "author.name": "required",
  "author.description": "required",
})
```

## 验证表单请求

### 创建表单请求验证

面对更复杂的验证场景，您可以创建一个「表单请求」。表单请求是一个包含了验证逻辑的自定义请求类。要创建一个表单请求类，请使用 `make:request` Artisan CLI 命令：

```go
go run . artisan make:request StorePostRequest
go run . artisan make:request user/StorePostRequest
```

该命令生成的表单请求类将被置于 `app/http/requests` 目录中。如果这个目录不存在，在您运行 `make:request` 命令后将会创建这个目录。Goravel 生成的每个表单请求都有五个方法：`Authorize`, `Rules`, `Messages`, `Attributes` 和 `PrepareForValidation`。

正如您可能已经猜到的那样，`Authorize` 方法负责确定当前经过身份验证的用户是否可以执行请求操作，而 `Rules` 方法则返回适用于请求数据的验证规则：

```go
package requests

import (
  "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/contracts/validation"
)

type StorePostRequest struct {
  Name string `form:"name" json:"name"`
}

func (r *StorePostRequest) Authorize(ctx http.Context) error {
  return nil
}

func (r *StorePostRequest) Rules(ctx http.Context) map[string]string {
  return map[string]string{
    // 键与传入的键保持一致
    "name": "required|max_len:255",
  }
}

func (r *StorePostRequest) Messages(ctx http.Context) map[string]string {
  return map[string]string{}
}

func (r *StorePostRequest) Attributes(ctx http.Context) map[string]string {
  return map[string]string{}
}

func (r *StorePostRequest) PrepareForValidation(ctx http.Context, data validation.Data) error {
  return nil
}
```

所以，验证规则是如何运行的呢？您所需要做的就是在控制器方法中类型提示传入的请求。在调用控制器方法之前验证传入的表单请求，这意味着您不需要在控制器中写任何验证逻辑：

```go
func (r *PostController) Store(ctx http.Context) {
  var storePost requests.StorePostRequest
  errors, err := ctx.Request().ValidateRequest(&storePost)
}
```

> 注意，由于 `form` 传值默认为 `string` 类型，因此 request 中所有字段也都应为 `string` 类型，否则请使用 `JSON` 传值。

### 表单请求授权验证

表单请求类内也包含了 `Authorize` 方法。在这个方法中，您可以检查经过身份验证的用户确定其是否具有更新给定资源的权限。例如，您可以判断用户是否拥有更新文章评论的权限。最有可能的是，您将通过以下方法与您的 [授权与策略](../security/authorization.md) 进行交互：

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

### 自定义错误消息

您可以通过重写表单请求的 `Messages` 方法来自定义错误消息。此方法应返回属性 / 规则对及其对应错误消息的数组：

```go
func (r *StorePostRequest) Messages() map[string]string {
  return map[string]string{
    "title.required": "A title is required",
    "body.required": "A message is required",
  }
}
```

### 自定义验证属性

Goravel 的许多内置验证规则错误消息都包含 `:attribute` 占位符。如果您希望将验证消息的 `:attribute` 部分替换为自定义属性名称，则可以重写 `Attributes` 方法来指定自定义名称。此方法应返回属性 / 名称对的数组：

```go
func (r *StorePostRequest) Attributes() map[string]string {
  return map[string]string{
    "email": "email address",
  }
}
```

### 准备验证输入

如果您需要在应用验证规则之前修改或清理请求中的任何数据，您可以使用 `PrepareForValidation` 方法：

```go
func (r *StorePostRequest) PrepareForValidation(data validation.Data) {
  if name, exist := data.Get("name"); exist {
    _ = data.Set("name", name.(string)+"1")
  }
}
```

## 手动创建验证器

如果您不想在请求中使用 `Validate` 方法，您可以使用 `facades.Validator` 手动创建一个验证器实例。facades 中的 `Make` 方法将会生成一个新的验证器实例：

```go
func (r *PostController) Store(ctx http.Context) {
  validator, err := facades.Validation().Make(map[string]any{
    "name": "Goravel",
  }, 
  map[string]string{
    "title": "required|max_len:255",
    "body":  "required",
  })

  if validator.Fails() {
    // Return fail
  }

  var user models.User
  err := validator.Bind(&user)
  ...
}
```

`Make` 方法中的第一个参数是期望校验的数据，可以是 `map[string]any` 与 `struct`。第二个参数是应用到数据上的校验规则。

### 自定义错误消息

如果需要，您可以提供验证程序实例使用的自定义错误消息，而不是 Goravel 提供的默认错误消息。您可以将自定义消息作为第三个参数传递给 `Make` 方法(也适用于`ctx.Request().Validate()`)：

```go
validator, err := facades.Validation().Make(input, rules, validation.Messages(map[string]string{
  "required": "The :attribute field is required.",
}))
```

### 为给定属性指定自定义消息

有时您可能希望只为特定属性指定自定义错误消息。您可以使用 `.` 表示法。首先指定属性名称，然后指定规则(也适用于`ctx.Request().Validate()`)：

```go
validator, err := facades.Validation().Make(input, rules, validation.Messages(map[string]string{
  "email.required": "We need to know your email address!",
}))
```

### 指定自定义属性值

Goravel 的许多内置错误消息都包含一个 `:attribute` 占位符，该占位符已被验证中的字段或属性的名称替换。为了自定义用于替换特定字段的这些占位符的值，您可以将自定义属性的数组作为第三个参数传递给 `Make` 方法(也适用于`ctx.Request().Validate()`)：

```go
validator, err := facades.Validation().Make(input, rules, validation.Attributes(map[string]string{
  "email": "email address",
}))
```

### 验证前格式化数据

您可以在验证数据前先格式化数据，以便更灵活的进行数据校验，您可以将格式化数据的方法作为第三个参数传递给 `Make` 方法(也适用于`ctx.Request().Validate()`)：

```go
import (
  validationcontract "github.com/goravel/framework/contracts/validation"
  "github.com/goravel/framework/validation"
)

func (r *PostController) Store(ctx http.Context) http.Response {
  validator, err := facades.Validation().Make(input, rules, validation.PrepareForValidation(func(data validationcontract.Data) error {
    if name, exist := data.Get("name"); exist {
      return data.Set("name", name)
    }

    return nil
  }))
  ...
}
```

## 处理验证字段

在使用表单请求或手动创建的验证器实例验证传入请求数据后，您依然希望将请求数据绑定至 `struct`，有两种可以实现方法：

1. 使用 `Bind` 方法，这将会绑定所有传入的数据，包括未通过校验的数据：

```go
validator, err := ctx.Request().Validate(rules)
var user models.User
err := validator.Bind(&user)

validator, err := facades.Validation().Make(input, rules)
var user models.User
err := validator.Bind(&user)
```

2. 使用「表单请求」进行验证时，传入的数据将会自动被绑定到表单：

```go
var storePost requests.StorePostRequest
errors, err := ctx.Request().ValidateRequest(&storePost)
fmt.Println(storePost.Name)
```

## 处理错误信息

### 检索特定字段的一个错误信息（随机）

```go
validator, err := ctx.Request().Validate(rules)
validator, err := facades.Validation().Make(input, rules)

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

## 可用的验证规则

下方列出了所有可用的验证规则及其功能：

| 规则名       | 描述                   |
| ----------- | --------------------- |
| `required`  | 字段为必填项，值不能为空。  |
| `required_if`  | `required_if:anotherfield,value,...` 如果其它字段 anotherField 为任一值 value ，则此验证字段必须存在且不为空。  |
| `required_unless`  | `required_unless:anotherfield,value,...` 如果其它字段 anotherField 不等于任一值 value ，则此验证字段必须存在且不为空。  |
| `required_with`  | `required_with:foo,bar,...` 在其他任一指定字段出现时，验证的字段才必须存在且不为空。  |
| `required_with_all`  | `required_with_all:foo,bar,...` 只有在其他指定字段全部出现时，验证的字段才必须存在且不为空。  |
| `required_without`  | `required_without:foo,bar,...` 在其他指定任一字段不出现时，验证的字段才必须存在且不为空。  |
| `required_without_all`  | `required_without_all:foo,bar,...` 只有在其他指定字段全部不出现时，验证的字段才必须存在且不为空。  |
| `int`  | 检查值是 `intX` `uintX` 类型，同时支持大小检查 `int` `int:2` `int:2,12`。注意：[使用注意事项](#int)  |
| `uint`  | 检查值是 `uintX` 类型(`value >= 0`)  |
| `bool`  | 检查值是布尔字符串(`true`: "1", "on", "yes", "true", `false`: "0", "off", "no", "false") |
| `string`  | 检查值是字符串类型，同时支持长度检查 `string` `string:2` `string:2,12` |
| `float`  | 检查值是 `float(floatX)` 类型 |
| `slice`  | 检查值是 `slice` 类型(`[]intX` `[]uintX` `[]byte` `[]string` 等) |
| `in`  | `in:foo,bar,…` 检查值是否在给定的枚举列表([]string, []intX, []uintX)中 |
| `not_in`  | `not_in:foo,bar,…` 检查值不在给定的枚举列表([]string, []intX, []uintX)中 |
| `starts_with`  | `starts_with:foo` 检查输入的 string 值是否以给定 sub-string 开始 |
| `ends_with`  | `ends_with:foo` 检查输入的 string 值是否以给定 sub-string 结束 |
| `between`  | `between:min,max` 检查值是否为数字且在给定范围内 |
| `max`  | `max:value` 检查输入值小于或等于给定值(`intX` `uintX` `floatX`) |
| `min`  | `min:value` 检查输入值大于或等于给定值(`intX` `uintX` `floatX`) |
| `eq`  | `eq:value` 检查输入值是否等于给定值 |
| `ne`  | `ne:value` 检查输入值是否不等于给定值 |
| `lt`  | `lt:value` 检查值小于给定大小(`intX` `uintX` `floatX`) |
| `gt`  | `gt:value` 检查值大于给定大小(`intX` `uintX` `floatX`) |
| `len`  | `len:value` 检查值长度等于给定大小(`string` `array` `slice` `map`) |
| `min_len`  | `min_len:value` 检查值的最小长度是给定大小(`string` `array` `slice` `map`) |
| `max_len`  | `max_len:value` 检查值的最大长度是给定大小(`string` `array` `slice` `map`) |
| `email`  | 检查值是 Email 地址字符串 |
| `array`  | 检查值是 `array` 或 `slice` 类型 |
| `map`  | 检查值是 `map` 类型 |
| `eq_field`  | `eq_field:field` 检查字段值是否等于另一个字段的值 |
| `ne_field`  | `ne_field:field` 检查字段值是否不等于另一个字段的值 |
| `gt_field`  | `gte_field:field` 检查字段值是否大于另一个字段的值 |
| `gte_field`  | `gt_field:field` 检查字段值是否大于或等于另一个字段的值 |
| `lt_field`  | `lt_field:field` 检查字段值是否小于另一个字段的值 |
| `lte_field`  | `lte_field:field` 检查字段值是否小于或等于另一个字段的值 |
| `file`  | 验证是否是上传的文件 |
| `image`  | 验证是否是上传的图片文件 |
| `date`  | 检查字段值是否为日期字符串 |
| `gt_date`  | `gt_date:value` 检查输入值是否大于给定的日期字符串 |
| `lt_date`  | `lt_date:value` 检查输入值是否小于给定的日期字符串 |
| `gte_date`  | `gte_date:value` 检查输入值是否大于或等于给定的日期字符串 |
| `lte_date`  | `lte_date:value` 检查输入值是否小于或等于给定的日期字符串 |
| `alpha`  | 验证值是否仅包含字母字符 |
| `alpha_num`  | 验证是否仅包含字母、数字 |
| `alpha_dash`  | 验证是否仅包含字母、数字、破折号（ - ）以及下划线（ _ ） |
| `json`  | 检查值是 JSON 字符串 |
| `number`  | 检查值是数字 `>= 0` |
| `full_url`  | 检查值是完整的URL字符串(必须以 http, https 开始的 URL) |
| `ip`  | 检查值是 IP（v4或v6）字符串 |
| `ipv4`  | 检查值是 IPv4 字符串 |
| `ipv6`  | 检查值是 IPv6 字符串 |

## 自定义验证规则

Goravel 提供了各种有用的验证规则，但是，您可能希望指定一些您自己的。注册自定义验证规则的一种方法是使用规则对象。要生成新的规则对象，您可以使用 `make:rule` Artisan 命令。 让我们使用这个命令生成一个验证字符串是否为大写的规则。Goravel 会将新规则放在 `app/rules` 目录中。如果此目录不存在，Goravel 将在您执行 Artisan 命令创建规则时创建它：

```go
go run . artisan make:rule Uppercase
go run . artisan make:rule user/Uppercase
```

创建规则后，我们就可以定义其行为了。 一个规则对象包含两个方法：`Passes` 和 `Message`。`Passes` 方法接收所有数据、待验证的数据与验证参数，应该根据属性值是否有效返回 `true` 或 `false`。`Message` 方法应该返回验证失败时应该使用的验证错误消息：

```go
package rules

import (
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
func (receiver *Uppercase) Passes(data validation.Data, val any, options ...any) bool {
  return strings.ToUpper(val.(string)) == val.(string)
}

// Message Get the validation error message.
func (receiver *Uppercase) Message() string {
  return "The :attribute must be uppercase."
}

```

然后将该规则对象注册到 `app/providers/validation_service_provider.go` 文件的 `rules` 方法中，之后该规则就可以像其他规则一样使用了：

```go
package providers

import (
  "github.com/goravel/framework/contracts/validation"
  "github.com/goravel/framework/facades"

  "goravel/app/rules"
)

type ValidationServiceProvider struct {
}

func (receiver *ValidationServiceProvider) Register() {

}

func (receiver *ValidationServiceProvider) Boot() {
  if err := facades.Validation().AddRules(receiver.rules()); err != nil {
    facades.Log().Errorf("add rules error: %+v", err)
  }
}

func (receiver *ValidationServiceProvider) rules() []validation.Rule {
  return []validation.Rule{
    &rules.Uppercase{},
  }
}

```

## 规则使用注意事项

### int

当时用 `ctx.Request().Validate(rules)` 进行校验时，传入的 `int` 类型数据将会被 `json.Unmarshal` 解析为 `float64` 类型，从而导致 int 规则验证失败。

**解决方案：**

方案一：添加 [`validation.PrepareForValidation`](#验证前格式化数据)，在验证数据前对数据进行格式化；

方案二：使用 `facades.Validation().Make()` 进行规则校验；

<CommentService/>