# 授權

[[toc]]

## 概述

Goravel 提供內建的 [身份驗證](./authentication.md) 服務和易於使用的授權功能，用於管理用戶對資源的操作。 即使用戶已通過身份驗證，也可能無權修改或刪除某些 Eloquent 模型或數據庫記錄。 Goravel 的授權功能允許以系統化的方式管理這些授權檢查。

在 Goravel 中，有兩種授權操作的方法：[網關](#Gates) 和 [政策](#Policies)。 想像網關和政策就像路由和控制器一樣。 網關基於閉包，提供簡單的授權方法，而政策則圍繞特定資源的邏輯進行分組，類似於控制器。 本文件將首先涵蓋網關，然後深入探討政策。

在構建應用程式時，不必僅使用網關或政策。 大多數應用程式將同時使用兩者，這是完全可以接受的！

## 網關

### 編寫網關

網關作為閉包，用來驗證用戶是否有權執行特定操作。 它們通常在 `app/providers/auth_service_provider.go` 檔案的 `Boot` 方法中使用 Gate facade 設定。

在這個場景中，我們將建立一個網關來檢查用戶是否可以通過將其 ID 與帖子創建者的 user_id 進行比較來修改特定的 Post 模型。

```go
package providers

import (
  "context"

  contractsaccess "github.com/goravel/framework/contracts/auth/access"
  "github.com/goravel/framework/auth/access"
  "github.com/goravel/framework/facades"
)

type AuthServiceProvider struct {
}

func (receiver *AuthServiceProvider) Register(app foundation.Application) {

}

func (receiver *AuthServiceProvider) Boot(app foundation.Application) {
  facades.Gate().Define("update-post",
    func(ctx context.Context, arguments map[string]any) contractsaccess.Response {
      user := ctx.Value("user").(models.User)
      post := arguments["post"].(models.Post)

      if user.ID == post.UserID {
        return access.NewAllowResponse()
      } else {
        return access.NewDenyResponse("error")
      }
    },
  )
}
```

### 授權行為

要使用網關授權行為，您應該使用 Gate facade 提供的 `Allows` 或 `Denies` 方法：

```go
package controllers

import (
  "github.com/goravel/framework/facades"
)

type UserController struct {

func (r *UserController) Show(ctx http.Context) http.Response {
  var post models.Post
  if facades.Gate().Allows("update-post", map[string]any{
    "post": post,
  }) {

  }
}
```

您可以使用 `Any` 或 `None` 方法同時授權多個行為。

```go
if facades.Gate().Any([]string{"update-post", "delete-post"}, map[string]any{
  "post": post,
}) {
  // 用戶可以更新或刪除該帖子...
}

if facades.Gate().None([]string{"update-post", "delete-post"}, map[string]any{
  "post": post,
}) {
  // 用戶無法更新或刪除該帖子...
}
```

### 網關響應

`Allows` 方法返回一個布林值。 要獲取完整的授權響應，使用 `Inspect` 方法。

```go
response := facades.Gate().Inspect("edit-settings", nil);

if response.Allowed() {
    // 行為已被授權...
} else {
    fmt.Println(response.Message())
}
```

### 攔截網關檢查

有時候，您可能希望授予特定用戶所有的能力。 您可以使用 `Before` 方法定義一個閉包，該閉包在任何其他授權檢查之前執行：

```go
facades.Gate().Before(func(ctx context.Context, ability string, arguments map[string]any) contractsaccess.Response {
  user := ctx.Value("user").(models.User)
  if isAdministrator(user) {
    return access.NewAllowResponse()
  }

  return nil
})
```

如果 `Before` 閉包返回非 nil 結果，則該返回將被視為授權檢查的結果。

`After` 方法可用於定義在所有其他授權檢查後執行的閉包。

```go
facades.Gate().After(func(ctx context.Context, ability string, arguments map[string]any, result contractsaccess.Response) contractsaccess.Response {
  user := ctx.Value("user").(models.User)
  if isAdministrator(user) {
    return access.NewAllowResponse()
  }

  return nil
})
```

> 注意：只有當 `facades.Gate().Define` 返回 nil 時，才會應用 `After` 的返回結果。

### 注入 Context

`context` 將傳遞給 `Before`, `After` 和 `Define` 方法。

```go
facades.Gate().WithContext(ctx).Allows("update-post", map[string]any{
  "post": post,
})
```

## 政策

### 生成政策

您可以使用 `make:policy` Artisan 命令生成一個政策。 生成的政策將保存在 `app/policies` 目錄中。 如果您的應用中不存在此目錄，Goravel 將為您自動創建。

```go
go run . artisan make:policy PostPolicy
go run . artisan make:policy user/PostPolicy
```

### 編寫政策

我們可以在 `PostPolicy` 上定義一個 `Update` 方法，以檢查 `User` 是否可以更新 `Post`。

```go
package policies

import (
  "context"
  "goravel/app/models"

  "github.com/goravel/framework/auth/access"
  contractsaccess "github.com/goravel/framework/contracts/auth/access"
)

type PostPolicy struct {
}

func NewPostPolicy() *PostPolicy {
  return &PostPolicy{}
}

func (r *PostPolicy) Update(ctx context.Context, arguments map[string]any) contractsaccess.Response {
  user := ctx.Value("user").(models.User)
  post := arguments["post"].(models.Post)

  if user.ID == post.UserID {
    return access.NewAllowResponse()
  } else {
    return access.NewDenyResponse("您不擁有這個帖子。")
  }
}
```

然後我們可以在 `app/providers/auth_service_provider.go` 中註冊政策：

```go
facades.Gate().Define("update-post", policies.NewPostPolicy().Update)
```

在您授權不同操作時，您可以向您的政策添加更多方法。 例如，您可以創建 `View` 或 `Delete` 方法來授權各種模型相關的行為。 隨意命名您的政策方法。
