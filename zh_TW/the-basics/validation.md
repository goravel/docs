# 驗證

[[toc]]

## 概述

Goravel 提供了幾種不同的方法來驗證傳入應用程序的數據。 最常見的做法是在所有傳入的 HTTP 請求中使用 `Validate` 方法。 Goravel 包含了各種方便的驗證規則。

## 驗證快速入門

讓我們仔細看看如何驗證表單並將錯誤消息返回給用戶的完整示例。 這個概述將為您提供有關如何使用 Goravel 驗證傳入請求數據的一般理解。

### 定義路由

首先，假設我們在 `routes/web.go` 文件中定義了以下路由：

```go
import "goravel/app/http/controllers"

postController := controllers.NewPostController()
facades.Route().Get("/post/create", postController.Create)
facades.Route().Post("/post", postController.Store)
```

`GET` 路由顯示一個用於創建新博客文章的表單。 `POST` 路由將新文章存儲到數據庫中。

### 創建控制器

接下來，讓我們看看一個簡單的控制器，處理這些路由的傳入請求。 我們暫時將 `Store` 方法留空：

```go
package controllers

import (
  "github.com/goravel/framework/contracts/http"
)

type PostController struct {
  // 依賴服務
}

func NewPostController() *PostController {
  return &PostController{
    // 注入服務
  }
}

func (r *PostController) Create(ctx http.Context) {

}

func (r *PostController) Store(ctx http.Context) {

}
```

### 編寫驗證邏輯

現在我們準備在 `Store` 方法中填入邏輯，以驗證新的博客文章。

```go
func (r *PostController) Store(ctx http.Context) {
  validator, err := ctx.Request().Validate(map[string]string{
    "title": "required|max_len:255",
    "body": "required",
    "code": "required|regex:^\d{4,6}$",
  })
}
```

### 嵌套屬性

如果傳入的 HTTP 請求包含 "嵌套" 字段數據，您可以使用 "dot" 語法在驗證規則中指定這些字段：

```go
validator, err := ctx.Request().Validate(map[string]string{
  "title": "required|max_len:255",
  "author.name": "required",
  "author.description": "required",
})
```

### 切片驗證

如果傳入的 HTTP 請求包含 "數組" 字段數據，您可以使用 `*` 語法在驗證規則中指定這些字段：

```go
validator, err := ctx.Request().Validate(map[string]string{
  "tags.*": "required",
})
```

## 表單請求驗證

### 創建表單請求

對於更複雜的驗證場景，您可能希望創建一個 "表單請求"。 表單請求是自定義請求類，封裝其自己的驗證和授權邏輯。 要創建一個表單請求類，您可以使用 `make:request` Artisan CLI 命令：

```go
go run . artisan make:request StorePostRequest
go run . artisan make:request user/StorePostRequest
```

生成的表單請求類將放置在 `app/http/requests` 目錄中。 如果此目錄不存在，則在您運行 `make:request` 命令時會創建。 每個 Goravel 生成的表單請求都有六個方法： `Authorize`， `Rules`。 此外，您還可以自定義 `Filters`、`Messages`、`Attributes` 和 `PrepareForValidation` 方法，以進行進一步操作。

`Authorize` 方法負責確定當前經過身份驗證的用戶是否可以執行請求所表示的操作，而 `Rules` 方法返回應適用於請求數據的驗證規則：

```go
package requests

import (
  "mime/multipart"

  "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/contracts/validation"
)

type StorePostRequest struct {
  Name string `form:"name" json:"name"`
  File *multipart.FileHeader `form:"file" json:"file"`
  Files []*multipart.FileHeader `form:"files" json:"files"`
}

func (r *StorePostRequest) Authorize(ctx http.Context) error {
  return nil
}

func (r *StorePostRequest) Rules(ctx http.Context) map[string]string {
  return map[string]string{
    // 鍵與傳入的鍵保持一致
    "name": "required|max_len:255",
    "file": "required|file",
    "files": "required|array",
    "files.*": "required|file",
  }
}
```

然後，您可以在控制器中使用 `ValidateRequest` 方法來驗證請求：

```go
func (r *PostController) Store(ctx http.Context) {
  var storePost requests.StorePostRequest
  errors, err := ctx.Request().ValidateRequest(&storePost)
}
```

查看 [可用的驗證規則](#available-validation-rules) 部分中的更多規則。

> 請注意，由於 `form` 傳遞的值預設為 `string` 類型，因此請求中的所有字段也應為 `string` 類型，否則請使用 `JSON` 傳遞值。

### 表單請求授權驗證

表單請求類還包含一個 `Authorize` 方法。 在此方法中，您可以確定經過身份驗證的用戶是否真的有權更新給定資源。 例如，您可以確定用戶是否擁有他們試圖更新的博客評論。 您最有可能會在此方法中與您的 [授權網關和政策](../security/authorization.md) 進行互動：

```go
func (r *StorePostRequest) Authorize(ctx http.Context) error {
  var comment models.Comment
  facades.Orm().Query().First(&comment)
  if comment.ID == 0 {
    return errors.New("找不到評論")
  }

  if !facades.Gate().Allows("update", map[string]any{
    "comment": comment,
  }) {
    return errors.New("無法更新評論")
  }

  return nil
}
```

`error` 將被傳遞到 `ctx.Request().ValidateRequest` 的返回值中。

### 過濾輸入數據

您可以通過改善表單請求的 `Filters` 方法來格式化輸入數據。 此方法應返回 `屬性/過濾器` 的數組 Map：

```go
func (r *StorePostRequest) Filters(ctx http.Context) map[string]string {
  return map[string]string{
    "name": "trim",
  }
}
```

### 自定義錯誤消息

您可以通過覆蓋 `Messages` 方法來自定義表單請求使用的錯誤消息。 此方法應返回屬性/規則對及其相應的錯誤消息的數組：

```go
func (r *StorePostRequest) Messages() map[string]string {
  return map[string]string{
    "title.required": "需要提供標題",
    "body.required": "需要提供消息",
  }
}
```

### 自定義驗證屬性

Goravel 的許多內置驗證規則錯誤消息包含一個 `:attribute` 佔位符。 如果您希望將驗證消息的 `:attribute` 佔位符替換為自定義屬性名稱，則可以通過重寫 `Attributes` 方法來指定自定義名稱。 此方法應返回屬性/名稱對的數組：

```go
func (r *StorePostRequest) Attributes() map[string]string {
  return map[string]string{
    "email": "電子郵件地址",
  }
}
```

### 準備驗證輸入

如果您需要在應用驗證規則之前準備或清理請求中的任何數據，則可以使用 `PrepareForValidation` 方法：

```go
func (r *StorePostRequest) PrepareForValidation(ctx http.Context, data validation.Data) error {
  if name, exist := data.Get("name"); exist {
    return data.Set("name", name.(string)+"1")
  }
  return nil
}
```

## 手動創建驗證器

如果您不希望在請求中使用 `Validate` 方法，則可以使用 `facades.Validator` 手動創建一個驗證器實例。 facade 的 `Make` 方法生成一個新的驗證器實例：

```go
func (r *PostController) Store(ctx http.Context) http.Response {
  validator, _ := facades.Validation().Make(
    map[string]any{
      "name": "Goravel",
    },
    map[string]string{
      "title": "required|max_len:255",
      "body":  "required",
    })

  if validator.Fails() {
    // 返回失敗
  }

  var user models.User
  err := validator.Bind(&user)
  ...
}
```

傳遞給 `Make` 方法的第一個參數是要驗證的數據，可以是 `map[string]any` 或 `struct`。 第二個參數是應用於數據的驗證規則數組。

### 自定義錯誤消息

如果需要，您可以提供自定義錯誤消息，讓驗證器實例使用，而不是 Goravel 提供的默認錯誤消息。 您可以將自定義消息作為第三個參數傳遞給 `Make` 方法（同樣適用於`ctx.Request().Validate()`）： 您可以將自定義消息作為第三個參數傳遞給 `Make` 方法（同樣適用於`ctx.Request().Validate()`）：

```go
validator, err := facades.Validation().Make(input, rules, validation.Messages(map[string]string{
  "required": "屬性字段是必需的。",
}))
```

### 為給定屬性指定自定義消息

有時您可能希望僅為特定屬性指定自定義錯誤消息。 您可以使用 "dot" 表示法來實現。 首先指定屬性名稱，然後指定規則（同樣適用於`ctx.Request().Validate()`）：

```go
validator, err := facades.Validation().Make(input, rules, validation.Messages(map[string]string{
  "email.required": "我們需要知道您的電子郵件地址！",
}))
```

### 指定自定義屬性值

Goravel 的許多內置錯誤消息都包含一個 `:attribute` 佔位符，該佔位符會替換為被驗證的字段或屬性的名稱。 要自定義用於替換這些佔位符的值，您可以將一個自定義屬性數組作為第三個參數傳遞給 `Make` 方法（同樣適用於 `ctx.Request().Validate()`）：

```go
validator, err := facades.Validation().Make(input, rules, validation.Attributes(map[string]string{
  "email": "電子郵件地址",
}))
```

### 驗證前格式化數據

您可以在驗證數據之前對數據進行格式化，以便更靈活的數據驗證，並且可以將格式化數據的方法作為第三個參數傳遞給 `Make` 方法（同樣適用於 `ctx.Request().Validate()`）：

```go
import (
  validationcontract "github.com/goravel/framework/contracts/validation"
  "github.com/goravel/framework/validation"
)

func (r *PostController) Store(ctx http.Context) http.Response {
  validator, err := facades.Validation().Make(input, rules,
    validation.PrepareForValidation(func(ctx http.Context, data validationcontract.Data) error {
      if name, exist := data.Get("name"); exist {
        return data.Set("name", name)
      }

      return nil
    }))

  ...
}
```

## 使用經過驗證的輸入

在使用表單請求或手動創建的驗證器實例驗證傳入請求數據後，您仍然希望將請求數據綁定到 `struct`，有兩種方法可以做到這一點：

1. 使用 `Bind` 方法，這將綁定所有傳入數據，包括未通過驗證的數據：

```go
validator, err := ctx.Request().Validate(rules)
var user models.User
err := validator.Bind(&user)

validator, err := facades.Validation().Make(input, rules)
var user models.User
err := validator.Bind(&user)
```

2. 在使用「表單請求」進行驗證時，傳入的數據將自動綁定到表單上：

```go
var storePost requests.StorePostRequest
errors, err := ctx.Request().ValidateRequest(&storePost)
fmt.Println(storePost.Name)
```

## 處理錯誤信息

### 檢索特定字段的一个錯誤信息（隨機）

```go
validator, err := ctx.Request().Validate(rules)
validator, err := facades.Validation().Make(input, rules)

message := validator.Errors().One("email")
```

### 檢索特定字段的所有錯誤信息

```go
messages := validator.Errors().Get("email")
```

### 檢索所有字段的所有錯誤信息

```go
messages := validator.Errors().All()
```

### 判斷特定字段是否含有錯誤信息

```go
if validator.Errors().Has("email") {
  //
}
```

## 可用的驗證規則

下方列出了所有可用的驗證規則及其功能：

| 名稱                     | 描述                                                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `required`             | 檢查值是必填且不能為零值。 例如字段類型為 `bool`，傳入值為 `false`，也將無法通過驗證。                                                                                 |
| `required_if`          | `required_if:anotherfield,value,...` 如果其他字段 anotherField 為任一值 value ，則此驗證字段必須存在且不為空。                                                |
| `required_unless`      | `required_unless:anotherfield,value,...` 如果其他字段 anotherField 不等於任一值 value ，則此驗證字段必須存在且不為空。                                          |
| `required_with`        | `required_with:foo,bar,...` 在其他任一指定字段出現時，驗證的字段才必須存在且不為空。                                                                            |
| `required_with_all`    | `required_with_all:foo,bar,...` 只有在其他指定字段全部出現時，驗證的字段才必須存在且不為空。                                                                      |
| `required_without`     | `required_without:foo,bar,...` 在其他指定任一字段不出現時，驗證的字段才必須存在且不為空。                                                                        |
| `required_without_all` | `required_without_all:foo,bar,...` 只有在其他指定字段全部不出現時，驗證的字段才必須存在且不為空。                                                                  |
| `int`                  | 檢查值是 `intX` `uintX` 類型，且支持大小檢查。 例如：`int` `int:2` `int:2,12`。 注意：[使用注意事項](#int)                                                      |
| `uint`                 | 檢查值是 `uint(uintX)` 類型， `value >= 0`                                                                                                 |
| `bool`                 | 檢查值是布爾字符串(`true`: "1", "on", "yes", "true", `false`: "0", "off", "no", "false")。 |
| `string`               | 檢查值是字符串類型，同時支持長度檢查 `string` `string:2` `string:2,12` 例如:`string` `string:2` `string:2,12`                           |
| `float`                | 檢查值是 `float(floatX)` 類型                                                                                                             |
| `slice`                | 檢查值是 slice 類型(`[]intX` `[]uintX` `[]byte` `[]string`)                                                            |
| `in`                   | `in:foo,bar,…` 檢查值是否在給定的枚舉列表中                                                                                                       |
| `not_in`               | `not_in:foo,bar,…` 檢查值不在給定的枚舉列表中                                                                                                    |
| `starts_with`          | `starts_with:foo` 檢查輸入的 string 值是否以給定 sub-string 開始                                                                                 |
| `ends_with`            | `ends_with:foo` 檢查輸入的 string 值是否以給定 sub-string 結束                                                                                   |
| `between`              | `between:min,max` 檢查值是否為數字且在給定範圍內                                                                                                   |
| `max`                  | `max:value` 檢查值小於或等於給定值(`intX` `uintX` `floatX`)                                                                 |
| `min`                  | `min:value` 檢查值大於或等於給定值(`intX` `uintX` `floatX`)                                                                 |
| `eq`                   | `eq:value` 檢查輸入值是否等於給定值                                                                                                             |
| `ne`                   | `ne:value` 檢查輸入值是否不等於給定值                                                                                                            |
| `lt`                   | `lt:value` 檢查值小於給定大小(`intX` `uintX` `floatX`)                                                                    |
| `gt`                   | `gt:value` 檢查值大於給定大小(`intX` `uintX` `floatX`)                                                                    |
| `len`                  | `len:value` 檢查值長度等於給定大小(`string` `array` `slice` `map`)                                                          |
| `min_len`              | `min_len:value` 檢查值的最小長度是給定大小(`string` `array` `slice` `map`)                                                    |
| `max_len`              | `max_len:value` 檢查值的最大長度是給定大小(`string` `array` `slice` `map`)                                                    |
| `email`                | 檢查值是 Email 地址字符串                                                                                                                    |
| `array`                | 檢查值是 `array` 或 `slice` 類型                                                                                                           |
| `map`                  | 檢查值是 `map` 類型                                                                                                                       |
| `eq_field`             | `eq_field:field` 檢查字段值是否等於另一個字段的值                                                                                                   |
| `ne_field`             | `ne_field:field` 檢查字段值是否不等於另一個字段的值                                                                                                  |
| `gt_field`             | `gt_field:field` 檢查字段值是否大於另一個字段的值                                                                                                   |
| `gte_field`            | `gte_field:field` 檢查字段值是否大於或等於另一個字段的值                                                                                               |
| `lt_field`             | `lt_field:field` 檢查字段值是否小於另一個字段的值                                                                                                   |
| `lte_field`            | `lte_field:field` 檢查字段值是否小於或等於另一個字段的值                                                                                               |
| `file`                 | 驗證是否是上傳的文件                                                                                                                          |
| `image`                | 檢查是否是上傳的圖片文件並支持後綴檢查                                                                                                                 |
| `date`                 | 檢查字段值是否為日期字符串                                                                                                                       |
| `gt_date`              | `gt_date:value` 檢查輸入值是否大於給定的日期字符串                                                                                                   |
| `lt_date`              | `lt_date:value` 檢查輸入值是否小於給定的日期字符串                                                                                                   |
| `gte_date`             | `gte_date:value` 檢查輸入值是否大於或等於給定的日期字符串                                                                                               |
| `lte_date`             | `lte_date:value` 檢查輸入值是否小於或等於給定的日期字符串                                                                                               |
| `alpha`                | 驗證值是否僅包含字母字符                                                                                                                        |
| `alpha_num`            | 檢查是否僅包含字母、數字                                                                                                                        |
| `alpha_dash`           | 檢查是否僅包含字母、數字、破折號（ - ）以及下劃線（ \_ ）                                                                              |
| `json`                 | 檢查值是 JSON 字符串                                                                                                                       |
| `number`               | 檢查值是數字 `>= 0`                                                                                                                       |
| `full_url`             | 檢查值是完整的URL字符串(必須以 http, https 開始的 URL)                                                                           |
| `ip`                   | 檢查值是 IP（v4或v6）字符串                                                                                                                   |
| `ipv4`                 | 檢查值是 IPv4 字符串                                                                                                                       |
| `ipv6`                 | 檢查值是 IPv6 字符串                                                                                                                       |
| `regex`                | 檢查該值是否可以通過正則驗證                                                                                                                      |
| `uuid`                 | 檢查值是UUID字符串                                                                                                                         |
| `uuid3`                | 檢查值是UUID3字符串                                                                                                                        |
| `uuid4`                | 檢查值是UUID4字符串                                                                                                                        |
| `uuid5`                | 檢查值是UUID5字符串                                                                                                                        |

### 使用規則的注意事項

#### int

當使用 `ctx.Request().Validate(rules)` 進行校驗時，傳入的 `int` 類型數據將會被 `json.Unmarshal` 解析為 `float64` 類型，從而導致 int 規則驗證失敗。

**解決方案：**

方案一：添加 [`validation.PrepareForValidation`](#Format-Data-Before-Validation)，在驗證數據前對數據進行格式化；

方案二：使用 `facades.Validation().Make()` 進行規則校驗；

## 自定義驗證規則

Goravel 提供了各種有用的驗證規則，但是，你可能希望定義自己的規則。 註冊自定義驗證規則的方法之一是使用規則對象。 要生成新的規則，你可以使用 `make:rule` Artisan 命令。 註冊自定義驗證規則的方法之一是使用規則對象。 要生成新的規則對象，你可以簡單使用 `make:rule` Artisan 命令。

例如，如果你想檢查字符串是否為大寫，你可以使用這個命令創建一個規則。 Goravel 將會將這個新規則保存在 `app/rules` 目錄中。 如果該目錄不存在，Goravel 將在你運行 Artisan 命令創建規則時創建它。

```go
go run . artisan make:rule Uppercase
go run . artisan make:rule user/Uppercase
```

創建規則後，我們需要定義它的行為。 規則對象有兩個方法： `Passes` 和 `Message`。 Passes 方法接收所有數據，包括要驗證的數據和驗證參數。 它應該根據屬性值是否有效返回 `true` 或 `false`。 `Message` 方法應該返回驗證失敗時用於顯示的錯誤信息。

```go
package rules

import (
  "strings"

  "github.com/goravel/framework/contracts/validation"
)

type Uppercase struct {
}

// Signature 規則的名稱。
func (receiver *Uppercase) Signature() string {
  return "uppercase"
}

// Passes 確定驗證規則是否通過。
func (receiver *Uppercase) Passes(data validation.Data, val any, options ...any) bool {
  return strings.ToUpper(val.(string)) == val.(string)
}

// Message 獲取驗證錯誤消息。
func (receiver *Uppercase) Message() string {
  return ":attribute 必須是大寫。"
}

```

然後你需要將該規則註冊到 `app/providers/validation_service_provider.go` 文件的 `rules` 方法中，然後該規則就可以像其他規則一樣使用了，如果是通過 `make:rule` 命令生成的規則，框架將自動註冊。

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
    facades.Log().Errorf("添加規則錯誤: %+v", err)
  }
}

func (receiver *ValidationServiceProvider) rules() []validation.Rule {
  return []validation.Rule{
    &rules.Uppercase{},
  }
}
```

## 可用的驗證過濾器

| 名稱                             | 描述                                                                                                                                     |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `int/toInt`                    | 將值(string/intX/floatX)轉換為 `int` 類型 `v.FilterRule("id", "int")`                                                      |
| `uint/toUint`                  | 將值(string/intX/floatX)轉換為 `uint` 類型 `v.FilterRule("id", "uint")`                                                    |
| `int64/toInt64`                | 將值(string/intX/floatX)轉換為 `int64` 類型 `v.FilterRule("id", "int64")`                                                  |
| `float/toFloat`                | 將值(string/intX/floatX)轉換為 `float` 類型                                                                                |
| `bool/toBool`                  | 將字符串值轉換為布爾值。 (`true`: "1", "on", "yes", "true", `false`: "0", "off", "no", "false") |
| `trim/trimSpace`               | 清除字符串兩端的空白字符                                                                                                                           |
| `ltrim/trimLeft`               | 清除字符串左側的空白字符                                                                                                                           |
| `rtrim/trimRight`              | 清除字符串右側的空白字符                                                                                                                           |
| `int/integer`                  | 將值(string/intX/floatX)轉換為 `int` 類型 `v.FilterRule("id", "int")`                                                      |
| `lower/lowercase`              | 將字符串轉換為小寫                                                                                                                              |
| `upper/uppercase`              | 將字符串轉換為大寫                                                                                                                              |
| `lcFirst/lowerFirst`           | 將字符串的第一個字符轉換為小寫                                                                                                                        |
| `ucFirst/upperFirst`           | 將字符串的第一個字符轉換為大寫                                                                                                                        |
| `ucWord/upperWord`             | 將每個單詞的首字母轉換為大寫                                                                                                                         |
| `camel/camelCase`              | 將字符串轉換為 camel 命名風格                                                                                                                     |
| `snake/snakeCase`              | 將字串轉換為蛇形命名風格                                                                                                                           |
| `escapeJs/escapeJS`            | 脫敏 JS 字串。                                                                                                                              |
| `escapeHtml/escapeHTML`        | 脫敏 HTML 字串。                                                                                                                            |
| `str2ints/strToInts`           | 將字串轉換為整數切片 `[]int`                                                                                                                     |
| `str2time/strToTime`           | 將日期字串轉換為 `time.Time`。                                                                                                                  |
| `str2arr/str2array/strToArray` | 將字串轉換為字串切片 `[]string`                                                                                                                  |

## 自定義過濾器

Goravel 提供了多種有用的過濾器，但你可能希望指定一些自己的過濾器。 要生成一個新的規則物件，你可以簡單地使用 `make:filter` Artisan 命令。 讓我們使用這個命令來生成一個將字串轉換為整數的規則。 這個規則已經內建在框架中，我們只是將其作為示例。 Goravel 將把這個新過濾器保存在 `app/filters` 目錄中。 如果這個目錄不存在，Goravel 將在你執行 Artisan 命令創建規則時自動創建它：

```go
go run . artisan make:filter ToInt
// 或者
go run . artisan make:filter user/ToInt
```

一個過濾器包含兩個方法：`Signature` 和 `Handle`。 `Signature` 方法設置過濾器的名稱。 `Handle` 方法執行具體的過濾邏輯：

```go
package filters

import (
  "strings"

  "github.com/spf13/cast"
  "github.com/goravel/framework/contracts/validation"
)

type ToInt struct {
}

// Signature 過濾器的簽名。
func (receiver *ToInt) Signature() string {
  return "ToInt"
}

// Handle 定義要應用的過濾器函數。
func (receiver *ToInt) Handle() any {
  return func (val any) int {
    return cast.ToString(val)
  }
}
```

然後你需要將過濾器註冊到 `app/providers/validation_service_provider.go` 文件的 `filters` 方法中，然後可以像其他過濾器一樣使用，如果過濾器是通過 `make:filter` 命令生成的，框架將自動註冊它。

```go
package providers

import (
  "github.com/goravel/framework/contracts/validation"
  "github.com/goravel/framework/facades"

  "goravel/app/filters"
)

type ValidationServiceProvider struct {
}

func (receiver *ValidationServiceProvider) Register() {

}

func (receiver *ValidationServiceProvider) Boot() {
  if err := facades.Validation().AddFilters(receiver.filters()); err != nil {
    facades.Log().Errorf("add filters error: %+v", err)
  }
}

func (receiver *ValidationServiceProvider) filters() []validation.Filter {
  return []validation.Filter{
    &filters.ToInt{},
  }
}
```
