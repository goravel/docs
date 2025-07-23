# 目录结构

[[toc]]

## 简介

默认的文件结构可以让你更好地开始项目开发，你也可以自由添加新的文件夹，但不要修改默认文件夹。

## 根目录

### `app` 目录

`app` 包含程序的核心代码。 程序中几乎所有的逻辑都将在这个文件夹中。 `app` 包含了程序的核心代码，程序中几乎所有的逻辑都将在这个文件夹中。

### `config` 目录

`bootstrap` 目录包含框架启动文件 `app.go`。

### `database` 目录

`config` 目录包含应用程序的所有配置文件。 最好浏览这些文件并熟悉所有可用的选项。 It is best to browse through these files and familiarize yourself with all the available options.

### `public` 目录

`database` 目录包含数据库迁移文件。

### `resources` 目录

`public` 目录包含一些静态资源，如图片、证书等。

### `routes` 目录

`resources` 目录包含您的[视图](../basic/views)以及原始的、未编译的资源，如CSS或JavaScript。

### `storage` 目录

`routes` 目录包含应用程序的所有路由定义。

### `tests` 目录

`storage` 目录包含 `logs` 目录，而 `logs` 目录包含应用程序的日志文件。

### `models` 目录

`tests` 目录包含您的自动化测试。

## `app` 目录

### `http` 目录

该 `console` 目录包含应用程序的所有自定义 `Artisan` 命令，以及控制台引导文件 `kernel.go`，可以在此文件中注册[任务调度](../advanced/schedule)

### `bootstrap` 目录

`http` 目录包含控制器、中间件等，几乎所有通过 Web 进入应用程序的请求都在这里处理。

### `grpc` 目录

`grpc` 目录包含控制器、中间件等，几乎所有通过 Grpc 进入应用程序的请求都在这里处理。

### `providers` 目录

`models` 目录包含所有数据模型。

### `console` 目录

`providers` 目录包含程序中所有的 [服务提供者](../architecture-concepts/service-providers.md)。服务提供者通过绑定服务、注册事件或执行任何其他任务来引导应用程序以应对传入的请求。 `providers` 目录包含程序中的所有[服务提供者](../foundation/providers)。 服务提供者通过绑定服务、注册事件或执行任何其他任务来指导应用程序响应传入请求。
