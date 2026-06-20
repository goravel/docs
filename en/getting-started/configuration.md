# Configuration

[[toc]]

## Introduction

All configuration files of the Goravel framework are stored in the `config` directory. You can view specific instructions and configure them flexibly according to project needs.

## Environment Configuration

Running applications in different environments usually requires different configurations. For example, you may want to turn on the Debug mode locally but don't need it in the production environment.

Therefore, the framework provides the `.env.example` file in the root directory. You need to copy this file, rename it to `.env` before you start development, and modify the configuration items in the `.env` file according to your project needs.

Note that the `.env` file should not be added to version control, because when multiple people collaborate, different developers may use different configurations, and different deployment environment configurations are different.

In addition, if an intruder gains access to your code repository, there will be a risk of exposing sensitive configuration. If you want to add a new configuration item, you can add it to the `.env.example` file to synchronize the configuration of all developers.


### Register Configuration

All configuration files will be registered via the `WithConfig` function in the `bootstrap/app.go` file. Given that it's a `init` function in the config file, you don't need to register each configuration file one by one. Just call the `WithConfig` function as follows:

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithConfig(config.Boot).
		Create()
}
```

## Retrieve Environment Configuration

Use the following method to obtain the configuration items in the `.env` file:

```go
// The first parameter is the configuration key, and the second parameter is the default value
facades.Config().Env("APP_NAME", "goravel")
```

## Access Configuration Values

You can easily use the global `facades.Config()` function anywhere in the application to access the configuration values in the `config` directory. The access to the configuration value can use the "." syntax. You can also specify a default value, if the configuration option does not exist, the default value is returned:

```go
// Get the configuration through assertion
facades.Config().Get("app.name", "goravel")

// Get the configuration of the string type
facades.Config().GetString("app.name", "goravel")

// Get the configuration of the int type
facades.Config().GetInt("app.int", 1)

// Get the configuration of the bool type
facades.Config().GetBool("app.debug", true)
```

## Set Configuration

```go
facades.Config().Add("path", "value1")
facades.Config().Add("path.with.dot.case1", "value1")
facades.Config().Add("path.with.dot", map[string]any{"case3": "value3"})
```

## Get Project Information

You can use the `artisan about` command to view the framework version, configuration, etc.

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

| Signature | Runner | Started by |
| --- | --- | --- |
| `goravel:http` | `HTTPRunner` (HTTP server) | `http` service provider |
| `goravel:grpc` | `GrpcRunner` (gRPC server) | `grpc` service provider |
| `goravel:queue` | `QueueRunner` (queue worker) | `queue` service provider |
| `goravel:schedule` | `ScheduleRunner` (scheduler) | `schedule` service provider |
| `goravel:telemetry` | `TelemetryRunner` | `telemetry` service provider |

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
