# 请求周期

[[toc]]

## 简介

Goravel 应用的所有请求入口都是 `main.go` 文件，该文件中使用 `bootstrap.Boot()` 引导框架加载。 该文件中使用 `bootstrap.Boot()` 引导框架加载。 该文件中使用 `bootstrap.Boot()` 引导框架加载。

然后在 `bootstrap/app.go` 脚本中创建 Goravel 实例 `app := foundation.Application{}`。

之后使用 `app.Boot()` 引导加载框架中注册的 [服务提供者](service-providers.md)，使用 `config.Boot()` 加载 config 目录下的配置文件。

最后，在 `main.go` 文件中使用 `facades.Route().Run(facades.Config().GetString("app.host"))` 启动 HTTP 服务器。
