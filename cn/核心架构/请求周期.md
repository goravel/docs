## 介绍

在生活中使用任何工具，如果理解了其工作原理，那么就会得心应手，应用开发也是如此。本文档会让你更清晰的了解 Goravel 的工作原理。

## 生命周期概述

Goravel 应用的所有请求入口都是 `main.go` 文件，该文件中使用 `bootstrap.Boot()` 引导框架加载。

然后在 `bootstrap/app.go` 脚本中创建 Goravel 实例 `app := foundation.Application{}`。

之后使用 `app.Boot()` 引导加载框架中注册的 [服务提供者](服务提供者.md)，使用 `config.Boot()` 加载 config 目录下的配置文件。

最后，在 `main.go` 文件中使用 `facades.Route.Run(facades.Config.GetString("app.host"))` 启动 HTTP 服务器。
