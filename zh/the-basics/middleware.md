# HTTP 中间件

[[toc]]

## 介绍

中间件可以过滤进入应用程序的 HTTP 请求。例如 `Goravel` 提供一个 CORS 中间件，可以实现请求跨域。

## 定义中间件

你可以在 `app/http/middleware` 目录中创建自己的中间件，写法与 `Gin` 中间件的写法保持一致，可以[参考文章](https://gin-gonic.com/docs/examples/custom-middleware/)。

Goravel 中自带了一些中间件可供使用：

| 中间件                                              | 作用    |
| -------------------------------------------------  | ------  |
| github.com/goravel/framework/http/middleware/Cors  | 实现跨域 |

## 注册中间件

### 全局中间件

如果你希望在应用程序的每一个 HTTP 请求应用中间件，那么只需要在 `app/http/kernel.go` 文件中的 `Middleware` 注册中间件。

```go
// app/http/kernel.go
package http

import (
	"github.com/gin-gonic/gin"
)

type Kernel struct {
}

func (kernel *Kernel) Middleware() []gin.HandlerFunc {
	return []gin.HandlerFunc{
		gin.Logger(),
	}
}
```

### 为路由分配中间件

你可以为某一些路由单独注册中间件：

```go
route := facades.Route.Group("/")
route.Use(gin.Logger())
```

