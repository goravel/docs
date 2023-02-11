# Limiting

[[toc]]

## Introduction

GoRavel includes a limiter out of the box that provides a simple way to limit the traffic to a given route or group of routes. The limiter is implemented using the memory or Redis storage driver.

## Configuration

In `config/limiter.go` you may configure the limiter's storage driver and other options.

By default, `Goravel` will use the `memory` as limiter's storage driver.

## Available Storage Drivers

| Name     | Describe             |
| -------- | ---------------- |
| `memory`  | Memory |
| `redis` | Redis |

### Using In Routes

You can use the `Limit` middleware directly, which supports two types of limiting: `IP` and `Route`.

`IP` is based on the visitor's IP, and `Route` is based on the URL of the visited page + the visitor's IP combination.
Generally speaking, `IP` is used in the outer route group to set the global request limit, and `Route` is used in each interface to configure different limits in detail.

The following is an example of using the `Route` limiting method, with the limiting parameter set to `1000 requests / hour`.

```go
import "github.com/goravel/framework/http/middleware"

facades.Route.Middleware(middleware.Limit("Route", "1000-H")).Get("users", userController.Show)
```

## Checking The Limit Status

After enabling the limiter for the route, some HTTP headers will be automatically added to the response, which can be used by the front end to determine:
| Name     | Describe             |
| -------- | ---------------- |
| `X-RateLimit-Limit`  | Maximum request limit  |
| `X-RateLimit-Remaining` | Remaining number of requests  |
| `X-RateLimit-Reset` | Timestamp of request reset  |
