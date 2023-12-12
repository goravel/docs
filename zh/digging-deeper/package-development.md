# 扩展包开发

[[toc]]

## 简介

包是向 Goravel 添加功能的主要方式，这些包可能包含专门用于增强 Goravel 应用程序的路由、控制器和配置。本指南主要涵盖了那些特定于 Goravel 的包的开发。这里有一个关于包开发的官方示例：[goravel/example-package](https://github.com/goravel/example-package)

## 创建包

您可以使用 Artisan 命令便捷的创建一个包模板：

```shell
go run . artisan make:package sms
```

创建的文件默认保存在根目录 `packages` 文件夹中，您可以使用 `--root` 选项自定义：

```shell
go run . artisan make:package --root=pkg sms
```

## 服务提供者

[服务提供者](../architecutre-concepts/service-providers.md)是您的包和 Goravel 之间的连接点，通常位于包的根目录中：`service_provider.go`。服务提供者负责将事物绑定到 Goravel 的[服务容器](../architecutre-concepts/service-container.md)并通知 Goravel 在哪里加载包资源。

## 使用

将包内的 `ServiceProvider` 注册到 `config/app.go::providers`，然后将 `facades` 导出到应用中即可，详细步骤可以参考：[goravel/example-package](https://github.com/goravel/example-package)。

## 资源

### 配置

通常，您需要将包的配置文件发布到应用程序的 `config` 目录。这将允许您的包的用户轻松覆盖您的默认配置选项。要允许发布配置文件，请从服务提供者的 `Boot` 方法中调用 `Publishes` 方法，该方法第一个参数为包名，第二个参数为当前包文件路径与项目路径的映射：

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "config/sms.go": app.ConfigPath("sms.go"),
  })
}
```

### 路由

如果您的包包含[路由](../the-basics/routing.md)，可以使用 `app.MakeRoute()` 解析出 `facades.Route()`，然后添加到项目

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
	route := app.MakeRoute()
	route.Get("sms", ***)
}
```

### 迁移

如果您的包包含[数据库迁移](../orm/migrations.md)，也可以使用 `Publishes` 方法进行发布：

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "migrations": app.DatabasePath("migrations"),
  })
}
```

### 命令

可以在服务提供者中使用 `Commands` 方法注册 `Artisan` 命令，注册命令后，您可以使用[Artisan CLI](../digging-deeper/artisan-console.md)执行它们：

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
	app.Commands([]console.Command{
		commands.NewSmsCommand(),
	})
}
```

### 公共资源

您的包可能包含 JavaScript、CSS 和图像等资产。要将这些资产发布到应用程序的 `public` 目录，请使用服务提供者的 `Publishes` 方法。：

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "public": app.PublicPath("vendor"),
  })
}
```

### 发布文件组

您可能希望单独发布包资产和资源组。例如，您可能希望允许用户发布包的配置文件，而不是被迫发布包的全部资产。您可以在包的服务提供者中调用 `Publishes` 方法时定义「标签」来做到这一点。例如，让我们使用标签在包的服务提供者的 `Boot` 方法中为 `sms` 包定义两个发布组（`sms-config` 和 `sms-migrations`）：

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "config/sms.go": app.ConfigPath("sms.go"),
  }, "sms-config")
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "migrations": app.DatabasePath("migrations"),
  }, "sms-migrations")
}
```

### 发布资源

在项目中，您可以使用 Artisan 命令 `vendor:publish` 发布包中注册的资源：

```shell
go run . artisan vendor:publish --package={您的包名}
```

该命令可以使用如下参数：

| 参数名        | 别名    | 作用           |
| -----------  | ------ | -------------- |
| --package    | -p     | 包名，可以使远程包，例如：github.com/goravel/example-package，也可以使用本地包名：./packages/example-package，注意当使用本地包名时，需要以 `./` 开头     |
| --tag        | -t     | 资源分组     |
| --force      | -f     | 强制覆盖     |
| --existing   | -e     | 只发布已存在的资源，并强制覆盖     |
