# 限流

[[toc]]

## 介绍

Goravel 包含了一个开箱即用的，基于内存/Redis实现的限流器，提供了一个简单的方法来限制给定路由或一组路由的流量。

## 配置

在 `config/limiter.go` 中进行所有自定义配置，允许配置限流存储。

`Goravel` 默认使用 `memory` 内存进行限流存储。

## 可用的存储驱动

| 名称     | 描述             |
| -------- | ---------------- |
| `memory`  | 内存 |
| `redis` | Redis |

### 在路由中使用

你可以直接使用 `Limit` 中间件，支持 `IP` 和 `Route` 两种限流方式。

其中 `IP` 是基于访客IP进行统计，`Route` 是基于访问页面的URL+访客IP组合统计。
一般来说， `IP` 用在外层路由组设置全局请求上限， `Route` 用在各接口细化配置不同限制。

下面是一段使用 `Route` 限流方式，限流参数为 `1000请求 / 小时` 的示例代码。

```go
import "github.com/goravel/framework/http/middleware"

facades.Route.Middleware(middleware.Limit("Route", "1000-H")).Get("users", userController.Show)
```

## 检查限流状态

为路由启用限流后，将会自动带上一些 HTTP 头，供前端判断：
| 名称     | 描述             |
| -------- | ---------------- |
| `X-RateLimit-Limit`  | 最大请求上限  |
| `X-RateLimit-Remaining` | 剩余的请求数  |
| `X-RateLimit-Reset` | 请求数重置的时间戳  |
