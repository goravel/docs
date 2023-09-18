# Authorization

[[toc]]

## Introduction

Goravel offers built-in [authentication](./authentication.md) services and an easy-to-use authorization feature to manage user actions on resources. Even if a user is authenticated, they may not have the authority to modify or delete certain Eloquent models or database records. Goravel's authorization feature allows for a systematic way of managing these authorization checks. 

There are two ways to authorize actions in Goravel: [gates](#Gates) and [policies](#policies). Gates are based on closures and provide a simple approach to authorization, whereas policies group logic around a specific resource, similar to controllers. This documentation will first cover gates and then delve into policies. 

It's not necessary to exclusively use gates or policies when building an application. Most applications will use a combination of both, which is perfectly acceptable!

## Gates

### Writing Gates

Gates serve as closures that verify whether a user is authorized to perform a specific action. They are commonly set up in the `app/providers/auth_service_provider.go` file's `Boot` method using the Gate facade. 

In this scenario, we will establish a gate to check if a user can modify a particular Post model by comparing their ID to the user_id of the post's creator.

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

### Authorizing Actions

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

You can authorize multiple actions simultaneously using the `Any` or `None` methods.

```go
if facades.Gate().Any([]string{"update-post", "delete-post"}, map[string]any{
  "post": post,
}) {
  // The user can update or delete the post...
}

if facades.Gate().None([]string{"update-post", "delete-post"}, map[string]any{
  "post": post,
}) {
  // The user can't update or delete the post...
}
```

### Gate Responses

The `Allows` method returns a boolean value. To get the full authorization response, use the `Inspect` method.

```go
response := facades.Gate().Inspect("edit-settings", nil);

if response.Allowed() {
    // The action is authorized...
} else {
    fmt.Println(response.Message())
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

If the `Before` closure returns a non-nil result, that result will be considered the result of the authorization check.

The `After` method can be used to define a closure that will be executed after all other authorization checks.

```go
facades.Gate().After(func(ctx context.Context, ability string, arguments map[string]any, result contractsaccess.Response) contractsaccess.Response {
  user := ctx.Value("user").(models.User)
  if isAdministrator(user) {
    return access.NewAllowResponse()
  }

  return nil
})
```

> Notice: The return result of `After` will be applied only when `facades.Gate().Define` returns nil.

### Inject Context

The `context` will be passed to the `Before`, `After`, and `Define` methods.

```go
facades.Gate().WithContext(ctx).Allows("update-post", map[string]any{
  "post": post,
})
```

## Policies

### Generating Policies

You can use `the make:policy` Artisan command to generate a policy. The generated policy will be saved in the `app/policies` directory. If the directory does not exist in your application, Goravel will create it for you.

```go
go run . artisan make:policy PostPolicy
go run . artisan make:policy user/PostPolicy
```

### Writing Policies

Let's define an `Update` method on `PostPolicy` to check if a `User` can update a `Post`.

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
		return access.NewDenyResponse("You do not own this post.")
	}
}

```

Then we can register the policy to `app/providers/auth_service_provider.go`:

```go
facades.Gate().Define("update-post", policies.NewPostPolicy().Update)
```

As you work on authorizing different actions, you can add more methods to your policy. For instance, you can create `View` or `Delete` methods to authorize various model-related actions. Feel free to name your policy methods as you see fit.

<CommentService/>
