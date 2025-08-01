# 用户授权

[[toc]]

## 简介

除了提供内置的 [身份验证（authentication)](./authentication.md) 服务外，Goravel 还提供了一种可以很简单就进行使用的方法，来对用户与资源的授权关系进行管理。即使用户已经通过了「身份验证（authentication)」， 用户也可能无权对应用程序中的模型或数据库记录进行删除或更改。 Even if a user is authenticated, they may not have the authority to modify or delete certain Eloquent models or database records. Goravel's authorization feature allows for a systematic way of managing these authorization checks.

Goravel 主要提供了两种授权操作的方法: [拦截器](#拦截器（Gates）) 和 [策略](#策略（Policies）)。可以把拦截器（gates）和策略（policies）想象成路由和控制器。拦截器（Gates）提供了一种轻便的基于闭包函数的授权方法，像是路由。而策略（policies)，就像是一个控制器，对特定模型或资源进行管理。在本文档中，我们将首先探讨拦截器（gates），然后是策略（policies)。 Imagine gates and policies as similar to routes and controllers. Gates are based on closures and provide a simple approach to authorization, whereas policies group logic around a specific resource, similar to controllers. This documentation will first cover gates and then delve into policies.

您在构建应用程序时，不用为是使用拦截器（gates）或是使用策略（policies）而担心，并不需要在两者中进行唯一选择。大多数的应用程序都同时包含两种方法，并且同时使用两者。 Most applications will use a combination of both, which is perfectly acceptable!

## Gates

### Writing Gates

Gates serve as closures that verify whether a user is authorized to perform a specific action. They are commonly set up in the `app/providers/auth_service_provider.go` file's `Boot` method using the Gate facade.

In this scenario, we will establish a gate to check if a user can modify a particular Post model by comparing its ID to the user_id of the post's creator.

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
  facades.Gate().Define("update-post", func(ctx context.Context, arguments map[string]any) contractsaccess.Response {
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

To authorize an action using gates, you should use the `Allows` or `Denies` methods provided by the Gate facade:

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

您还可以通过 `any` 或 `none` 方法来一次性授权多个行为:

```go
if facades.Gate().Any([]string{"update-post", "delete-post"}, map[string]any{
  "post": post,
}) {
  // 用户可以提交update或delete...
}

if facades.Gate().None([]string{"update-post", "delete-post"}, map[string]any{
  "post": post,
}) {
  // 用户不可以提交update和delete...
}
```

### Gate Responses

The `Allows` method returns a boolean value. To get the full authorization response, use the `Inspect` method.

```go
response := facades.Gate().Inspect("edit-settings", nil);

if (response.Allowed()) {
    // 行为进行授权...
} else {
    fmt.Println(response.Message());
}
```

### Intercepting Gate Checks

Sometimes, you may wish to grant all abilities to a specific user. You can define a closure using the `Before` method, which runs before any other authorization checks:

```go
facades.Gate().Before(func(ctx context.Context, ability string, arguments map[string]any) contractsaccess.Response {
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
facades.Gate().After(func(ctx context.Context, ability string, arguments map[string]any, result contractsaccess.Response) contractsaccess.Response {
  user := ctx.Value("user").(models.User)
  if isAdministrator(user) {
    return access.NewAllowResponse()
  }

  return nil
})
```

> 注意：只有当 `facades.Gate().Define` 返回 nil 时，才会应用 `After` 的返回结果。

### 注入 Context

`context` 将被传入到 `Before`, `After`, `Define` 方法中。

```go
facades.Gate().WithContext(ctx).Allows("update-post", map[string]any{
  "post": post,
})
```

## 策略（Policies）

### 生成策略

You can use the `make:policy` Artisan command to generate a policy. The generated policy will be saved in the `app/policies` directory. 您可以使用 `make:policy` Artisan 命令生成策略。生成的策略将放置在 `app/policies` 目录中。如果应用程序中不存在此目录，Goravel 将自动创建：

```go
go run . artisan make:policy PostPolicy
go run . artisan make:policy user/PostPolicy
```

### 编写策略

可以为策略添加具体的方法，例如，让我们在 `PostPolicy` 上定义一个 `Update` 方法，该方法判断 `models.User` 是否可以更新 `models.Post`。

```go
package policies

import (
  "context"

  "github.com/goravel/framework/contracts/auth/access"
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
    return access.NewDenyResponse("You do not own this post.")
  }
}
```

然后我们就可以在 `app/providers/auth_service_provider.go` 中注册策略：

```go
facades.Gate().Define("update-post", policies.NewPostPolicy().Update)
```

As you work on authorizing different actions, you can add more methods to your policy. 您可以继续根据需要为策略授权的各种操作定义其他方法。例如，您可以定义 `View` 或 `Delete` 方法来授权各种与 `models.Post` 相关的操作，但请记住，您可以自由地为策略方法命名任何您喜欢的名称。 Feel free to name your policy methods as you see fit.
