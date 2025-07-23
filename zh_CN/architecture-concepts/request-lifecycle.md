# 请求生命周期

[[toc]]

## 简介

`main.go` 文件作为 Goravel 应用程序中所有请求的入口点。 它使用 `bootstrap.Boot()` 函数来初始化框架。 It utilizes the `bootstrap.Boot()` function to initialize the framework.

然后在 `bootstrap/app.go` 中通过 `app := foundation.NewApplication()` 创建一个 Goravel 实例。

之后，使用 `app.Boot()` 加载已注册的[服务提供者](providers)，并使用 `config.Boot()` 加载 config 目录下的配置文件。

最后，在 `main.go` 中使用 `facades.Route().Run(facades.Config().GetString("app.host"))` 启动 HTTP 服务器。
