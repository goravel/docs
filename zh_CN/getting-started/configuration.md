# 配置信息

[[toc]]

## 简介

Goravel 框架所有配置文件都保存在 `config` 目录中。 你可以进入具体文件查看配置说明，根据项目需要灵活配置。

## 环境配置

在不同的环境运行应用程序，通常需要不同的配置。 例如，你可能希望在本地打开 Debug 模式，但生产环境不需要。

因此，框架在根目录提供了 `.env.example` 文件。 需要你在开发前，复制该文件并重命名为 `.env`，根据项目需要修改 `.env` 文件中的配置项。

注意，`.env` 文件不应该加入版本控制，因为多人协作时，不同的开发人员有可能使用不同的配置，不同的部署环境配置也不相同。

此外，如果有入侵者获得了你的代码仓库访问权限，将会有暴露敏感配置的风险。 如果你想新增新的配置项，可以添加到 `.env.example` 文件中，以此来同步所有开发者的配置。

### 注册配置

所有配置文件都将通过 `bootstrap/app.go` 文件中的 `WithConfig` 函数进行注册。 由于它是配置文件中的 `init` 函数，因此你无需逐一注册每个配置文件。 只需按如下方式调用 `WithConfig` 函数：

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithConfig(config.Boot).
		Create()
}
```

## 获取环境配置

使用如下方法，可获取 `.env` 文件中的配置项：

```go
// 第一个参数为配置键，第二个参数为默认值
facades.Config().Env("APP_NAME", "goravel")
```

## 获取配置值

你可以轻松的在应用程序的任何位置使用全局 `facades.Config()` 函数来访问 `config` 目录中的配置值。 配置值的访问可以使用「点」语法。 还可以指定默认值，如果配置选项不存在，则返回默认值：

```go
// 通过断言获取配置
facades.Config().Get("app.name", "goravel")

// 获取字符串类型的配置
facades.Config().GetString("app.name", "goravel")

// 获取整形类型的配置
facades.Config().GetInt("app.int", 1)

// 获取布尔类型的配置
facades.Config().GetBool("app.debug", true)
```

## 设置配置值

```go
facades.Config().Add("path", "value1")
facades.Config().Add("path.with.dot.case1", "value1")
facades.Config().Add("path.with.dot", map[string]any{"case3": "value3"})
```

## 获取项目信息

可以使用 `artisan about` 命令来查看框架的版本、配置等信息。

```bash
./artisan about
```

### Maintenance Mode

If you installed the Route facade, you can use the `down` command to put your application into maintenance mode. By default, Goravel uses the `file` maintenance driver and stores maintenance metadata at the `framework/maintenance.json` storage path:

```shell
./artisan down
```

You may provide a custom reason and HTTP status code for the maintenance response:

```shell
./artisan down --reason="Upgrading database" --status=503
```

The `down` command also supports redirecting users to a path or rendering a view while the application is in maintenance mode:

```shell
./artisan down --redirect=/maintenance
./artisan down --render=errors/503
```

When using `--render`, the view must already exist. If `--redirect` or `--render` is provided, the `--reason` response body is not used.

You may allow temporary access to the application by setting a secret. Users can bypass maintenance mode by visiting the application with the matching `secret` query parameter:

```shell
./artisan down --secret=let-me-in
```

```text
https://example.com?secret=let-me-in
```

You can also let Goravel generate a random secret for you:

```shell
./artisan down --with-secret
```

The maintenance driver and cache store are configured in `config/app.go`. The default configuration reads from the `APP_MAINTENANCE_DRIVER` and `APP_MAINTENANCE_STORE` environment variables:

```go
"maintenance": map[string]any{
    "driver": config.Env("APP_MAINTENANCE_DRIVER", "file"),
    "store":  config.Env("APP_MAINTENANCE_STORE", ""),
},
```

If your application runs on multiple servers, you may use the `cache` maintenance driver so all servers share the same maintenance state. Configure the driver and, optionally, the cache store name in your `.env` file:

```ini
APP_MAINTENANCE_DRIVER=cache
APP_MAINTENANCE_STORE=redis
```

If `APP_MAINTENANCE_STORE` is not set, Goravel uses the default cache store. Running `down` or `up` on one server updates the maintenance state for every server using the same cache store.

To bring the application out of maintenance mode, run the `up` command:

```shell
./artisan up
```

### Disabled Runners

When the application starts via `app.Start()`, Goravel automatically runs the auto-run [runners](../architecture-concepts/service-providers.md#runners) registered by service providers, such as the HTTP server, gRPC server, queue worker, scheduler, and telemetry. You can selectively skip specific runners in the main process by setting the `app.disabled_runners` option in `config/app.go`. The framework evaluates this list centrally, so the same option works for any current or future runner.

```go
// config/app.go
"app": map[string]any{
    "env":   config.Env("APP_ENV", "production"),
    "debug": config.Env("APP_DEBUG", false),
    "disabled_runners": []string{"goravel:schedule"},
},
```

The value is a slice of glob patterns matched against each runner's signature. The framework uses Go's [`path.Match`](https://pkg.go.dev/path#Match) for matching, so `*` is the only wildcard. The framework runner signatures are:

| Signature           | Runner                                          | Started by                   |
| ------------------- | ----------------------------------------------- | ---------------------------- |
| `goravel:http`      | `HTTPRunner` (HTTP server)   | `http` service provider      |
| `goravel:grpc`      | `GrpcRunner` (gRPC server)   | `grpc` service provider      |
| `goravel:queue`     | `QueueRunner` (queue worker) | `queue` service provider     |
| `goravel:schedule`  | `ScheduleRunner` (scheduler) | `schedule` service provider  |
| `goravel:telemetry` | `TelemetryRunner`                               | `telemetry` service provider |

Common patterns:

```go
// Web container — only skip the scheduler so it runs on a dedicated container
"disabled_runners": []string{"goravel:schedule"},

// Scheduler-only container — disable http, queue, grpc
"disabled_runners": []string{"goravel:http", "goravel:queue", "goravel:grpc"},

// Disable every framework runner
"disabled_runners": []string{"goravel:*"},

// Kill switch: run no auto-run runners in the main process
"disabled_runners": []string{"*"},
```

Patterns are evaluated in order and the first match wins. Invalid patterns (for example, an unmatched bracket) are logged as warnings and the runner is left running, so a typo in the config never crashes the boot.

User-defined runners that you register with `WithRunners` are not affected by the `goravel:*` namespace. Use the runner's own signature to disable it.
