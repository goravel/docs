# 文件夹结构

[[toc]]

## 简介

默认的文件结构可以使你更好的开始项目推进，你也可以自由的新增文件夹，但默认文件夹不要修改。

## 根目录

### app 目录

`app` 包含了程序的核心代码，程序中几乎所有的逻辑都将在这个文件夹中。

### bootstrap 目录

`bootstrap` 目录包含了框架的启动文件 `app.go`。

### config 目录

`config` 目录包含了应用程序的所有配置文件。最好把这些文件都浏览一遍，并熟悉所有可用的配置。

### database 目录

`database` 目录包含了数据库迁移文件。

### public 目录

`public` 目录包含一些静态资源，如图像、证书等。

### resources 目录

`resources` 目录包含您的[视图](../the-basics/views.md)，以及原始的、未编译的资源文件，例如 CSS 或 JavaScript。

### routes 目录

`routes` 目录包含应用程序的所有路由定义。

### storage 目录

`storage` 目录包含 `logs` 等目录，`logs` 目录包含应用程序的日志文件。

### tests 目录

`tests` 目录包含你的自动化测试。

## app 目录

### console 目录

`console` 目录包含应用程序所有自定义的 `Artisan` 命令，与控制台引导文件 `kernel.go`，可以在这个文件中注册[任务](../digging-deeper/task-scheduling.md)

### http 目录

`http` 目录包含了控制器、中间件等，几乎所有通过 Web 进入应用的请求处理都在这里进行。

### grpc 目录

`grpc` 目录包含了控制器、中间件等，几乎所有通过 Grpc 进入应用的请求处理都在这里进行。

### models 目录

`models` 目录包含所有数据模型。

### providers 目录

`providers` 目录包含程序中所有的 [服务提供者](../architecutre-concepts/service-providers.md)。服务提供者通过绑定服务、注册事件或执行任何其他任务来引导应用程序以应对传入的请求。

<CommentService/>