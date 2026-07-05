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

### 维护模式

如果安装了路由门面，你可以使用 `down` 命令使应用进入维护模式。 默认情况下，Goravel 使用 `file` 维护驱动，并将维护元数据存储在 `framework/maintenance.json` 存储路径：

```shell
./artisan down
```

你可以为维护响应提供自定义原因和 HTTP 状态码：

```shell
./artisan down --reason="Upgrading database" --status=503
```

`down` 命令还支持在应用处于维护模式时，将用户重定向到某个路径或渲染视图：

```shell
./artisan down --redirect=/maintenance
./artisan down --render=errors/503
```

使用 `--render` 时，视图必须已存在。 如果提供了 `--redirect` 或 `--render`，则不会使用 `--reason` 响应体。

你可以通过设置密钥来允许临时访问应用。 用户可以通过访问带有匹配 `secret` 查询参数的应用程序来绕过维护模式：

```shell
./artisan down --secret=let-me-in
```

```text
https://example.com?secret=let-me-in
```

你也可以让 Goravel 为你生成一个随机 secret：

```shell
./artisan down --with-secret
```

维护驱动和缓存存储配置在 `config/app.go` 中。 默认配置从 `APP_MAINTENANCE_DRIVER` 和 `APP_MAINTENANCE_STORE` 环境变量中读取：

```go
"maintenance": map[string]any{
    "driver": config.Env("APP_MAINTENANCE_DRIVER", "file"),
    "store":  config.Env("APP_MAINTENANCE_STORE", ""),
},
```

如果你的应用程序运行在多台服务器上，你可以使用 `cache` 维护驱动，以便所有服务器共享相同的维护状态。 在 `.env` 文件中配置驱动和（可选）缓存存储名称：

```ini
APP_MAINTENANCE_DRIVER=cache
APP_MAINTENANCE_STORE=redis
```

如果 `APP_MAINTENANCE_STORE` 未设置，Goravel 将使用默认缓存存储。 在一台服务器上运行 `down` 或 `up` 会更新所有使用相同缓存存储的服务器的维护状态。

要将应用程序退出维护模式，请运行 `up` 命令：

```shell
./artisan up
```

### 禁用的运行器

当应用程序通过 `app.Start()` 启动时，Goravel 会自动运行服务提供者注册的自动运行[运行器](../architecture-concepts/service-providers.md#运行器)，例如 HTTP 服务器、gRPC 服务器、队列工作器、调度程序和遥测。 您可以通过在 `config/app.go` 中设置 `app.disabled_runners` 选项，有选择地跳过主进程中的特定运行器。 框架会集中评估此列表，因此同一选项适用于任何当前或未来的运行器。

```go
// config/app.go
"app": map[string]any{
    "env":   config.Env("APP_ENV", "production"),
    "debug": config.Env("APP_DEBUG", false),
    "disabled_runners": []string{"goravel:schedule"},
},
```

该值是一个与每个运行器签名匹配的glob模式切片。 框架使用Go的[`path.Match`](https://pkg.go.dev/path#Match)进行匹配，因此`*`是唯一通配符。 框架运行器签名如下：

| 签名                  | 运行器                    | 启动者              |
| ------------------- | ---------------------- | ---------------- |
| `goravel:http`      | `HTTPRunner`（HTTP服务器）  | `http`服务提供者      |
| `goravel:grpc`      | `GrpcRunner`（gRPC 服务器） | `grpc` 服务提供者     |
| `goravel:queue`     | `QueueRunner`（队列工作者）   | `queue` 服务提供者    |
| `goravel:schedule`  | `ScheduleRunner`（调度器）  | `schedule` 服务提供者 |
| `goravel:telemetry` | `TelemetryRunner`      | `遥测`服务提供者        |

常见模式：

```go
// Web容器 — 仅跳过调度器，使其在专用容器上运行
"disabled_runners": []string{"goravel:schedule"},

// 仅调度器容器 — 禁用 http、queue、grpc
"disabled_runners": []string{"goravel:http", "goravel:queue", "goravel:grpc"},

// 禁用所有框架运行器
"disabled_runners": []string{"goravel:*"},

// 终止开关：主进程中不运行任何自动运行器
"disabled_runners": []string{"*"},
```

模式按顺序评估，第一个匹配者胜出。 无效模式（例如，不匹配的括号）会记录为警告，运行器保持运行，因此配置中的拼写错误不会导致启动崩溃。

通过 `WithRunners` 注册的用户定义运行器不受 `goravel:*` 命名空间的影响。 使用运行器自身的签名来禁用它。
