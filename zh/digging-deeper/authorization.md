# 用户授权

[[toc]]

## 介绍

除了提供内置的 [身份验证（authentication)](./authentication.md) 服务外，Goravel 还提供了一种可以很简单就进行使用的方法，来对用户与资源的授权关系进行管理。即使用户已经通过了「身份验证（authentication)」， 用户也可能无权对应用程序中的模型或数据库记录进行删除或更改。

Goravel 主要提供了两种授权操作的方法: [拦截器](#拦截器（Gates）) 和 [策略](#策略（Policies）)。可以把拦截器（gates）和策略（policies）想象成路由和控制器。拦截器（Gates）提供了一种轻便的基于闭包函数的授权方法，像是路由。而策略（policies)，就像是一个控制器，对特定模型或资源进行管理。在本文档中，我们将首先探讨拦截器（gates），然后是策略（policies)。

您在构建应用程序时，不用为是使用拦截器（gates）或是使用策略（policies）而担心，并不需要在两者中进行唯一选择。大多数的应用程序都同时包含两种方法，并且同时使用两者。

## 拦截器（Gates）

### 编写拦截器（Gates）

拦截器（Gates）是用来确定用户是否有权执行给定操作的闭包函数。默认条件下，拦截器（Gates）的使用，是在 `app/providers/auth_service_provider.go` 文件中的 `Boot` 方法里来规定 `Gate` 规则。

在下面的例子中，我们将定义一个拦截器（Gates)，通过比较用户的 id 来判断是否有对 post 数据操作的权限：

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

func (receiver *AuthServiceProvider) Register() {
}

func (receiver *AuthServiceProvider) Boot() {
  facades.Gate.Define("update-post", func(ctx context.Context, arguments map[string]any) contractsaccess.Response {
    user := ctx.Value("user").(models.User)
    post := arguments["post"].(models.Post)
    
    if user.ID == post.UserID {
      return access.NewAllowResponse()
    } else {
      return access.NewDenyResponse("error")
    }
  })
}
```

### 行为授权控制

如果需要通过拦截器（Gates）来对行为进行授权控制，您可以通过调用 `Gate` 中的 `Allows` 或 `Denies` 方法。

```go
package controllers

import (
  "github.com/goravel/framework/facades"
)

type UserController struct {

func (r *UserController) Show(ctx http.Context) {
  var post models.Post
  if facades.Gate.Allows("update-post", map[string]any{
    "post": post,
  }) {
    
  }
}
```

您还可以通过 `any` 或 `none` 方法来一次性授权多个行为:

```go
if facades.Gate.Any([]string{"update-post", "delete-post"}, map[string]any{
  "post": post,
}) {
  // 用户可以提交update或delete...
}

if facades.Gate.None([]string{"update-post", "delete-post"}, map[string]any{
  "post": post,
}) {
  // 用户不可以提交update和delete...
}
```

### 拦截器（Gates）返回（Responses）

使用 `Allows` 方法，将仅返回一个简单的布尔值，您也还可以使用 `Inspect` 方法来返回拦截器（Gates）中的所有响应值：

```go
response := facades.Gate.Inspect("edit-settings", nil);

if (response.Allowed()) {
    // 行为进行授权...
} else {
    fmt.Println($response->message());
}
```

### 拦截器（Gates）优先级

有时，您可能希望将所有权限授予特定用户。您可以使用 `Before` 方法。该方法将定义该授权拦截规则，优先于所有其他授权拦截规则前执行：

```go
facades.Gate.Before(func(ctx context.Context, ability string, arguments map[string]any) contractsaccess.Response {
  user := ctx.Value("user").(models.User)
  if isAdministrator(user) {
    return access.NewAllowResponse()
  }

  return nil
})
```

如果 `Before` 返回的是非 nil 结果，则该返回将会被视为最终的检查结果。

您还可以使用 `After` 方法，来定义在所有授权拦截规则执行后，再次进行授权拦截规则判定：

```go
facades.Gate.After(func(ctx context.Context, ability string, arguments map[string]any, result contractsaccess.Response) contractsaccess.Response {
  user := ctx.Value("user").(models.User)
  if isAdministrator(user) {
    return access.NewAllowResponse()
  }

  return nil
})
```

> 注意：只有当 `facades.Gate.Define` 返回 nil 时，才会应用 `After` 的返回结果。

### 注入 Context

`context` 将被传入到 `Before`, `After`, `Define` 方法中。

```go
facades.Gate.WithContext(ctx).Allows("update-post", map[string]any{
  "post": post,
})
```

## 策略（Policies）

### 生成策略

您可以使用 `make:policy` Artisan 命令生成策略。生成的策略将放置在 `app/policies` 目录中。如果应用程序中不存在此目录，Goravel 将自动创建：

```go
go run . artisan make:policy PostPolicy
```

### 编写策略

可以为策略添加具体的方法，例如，让我们在 `PostPolicy` 上定义一个 `Update` 方法，该方法判断 `models.User` 是否可以更新 `models.Post`。

```go
package policies

import (
  "context"

  contractsaccess "github.com/goravel/framework/contracts/auth/access"
  "github.com/goravel/framework/contracts/auth/access"
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
    return access.NewDenyResponse("You do not own this post.")
  }
}
```

您可以继续根据需要为策略授权的各种操作定义其他方法。例如，您可以定义 `View` 或 `Delete` 方法来授权各种与 `models.Post` 相关的操作，但请记住，您可以自由地为策略方法命名任何您喜欢的名称。
