# 包开发

[[toc]]

## 简介

包是向 Goravel 添加功能的主要方式。 这些包可能包含专门设计用于增强 Goravel 应用程序的路由、控制器和配置。 本指南重点介绍开发 Goravel 特定的包。 These packages may contain routes, controllers, and configurations that are specifically designed to enhance a Goravel application. This guide focuses on developing Goravel-specific packages.

这里有一个构建第三方包的示例：[goravel/example-package](https://github.com/goravel/example-package)

## 创建包

您可以使用 Artisan 命令轻松创建包模板：

```shell
go run . artisan make:package sms
```

创建的文件默认保存在根目录的 `packages` 文件夹中，您可以使用 `--root` 选项进行自定义：

```shell
go run . artisan make:package --root=pkg sms
```

## 服务提供者

[服务提供者](../architecture-concepts/service-providers.md)是您的包和 Goravel 之间的连接点，通常位于包的根目录中：`service_provider.go`。服务提供者负责将事物绑定到 Goravel 的[服务容器](../architecture-concepts/service-container.md)并通知 Goravel 在哪里加载包资源。 They are typically located in the root of the package as a `service_provider.go` file. [服务提供者](../foundation/providers)充当您的包和 Goravel 之间的桥梁。
它们通常位于包的根目录中，作为一个 `service_provider.go` 文件。 它们的主要功能是将项目绑定到 Goravel 的服务容器中，并指导 Goravel 加载包资源。

## 用法

### 自动安装

当创建包时包含一个 `setup/setup.go` 文件，你可以在这个文件中定义包的安装逻辑，之后用户可以使用 `package:install` 命令安装包：

```shell
在 `config/app.go::providers` 中注册包的 `ServiceProvider`，然后将 `facades` 导出到应用程序。
有关详细步骤，请参阅 [goravel/example-package](https://github.com/goravel/example-package)。
```

下面是关于 `setup/setup.go` 文件定义安装过程的解析，有助于你编写自己包的安装逻辑：

```go
// setup/setup.go
func main() {
  // 当使用这种方式安装时，配置文件将会被发布到项目的 config 目录。
  // 你也可以手动发布这个配置文件：./artisan vendor:publish --package=github.com/goravel/example-package
	config, err := supportfile.GetPackageContent(packages.GetModulePath(), "setup/config/hello.go")
	if err != nil {
		panic(err)
	}

  // 根据用户输入的参数，执行安装或卸载操作
	packages.Setup(os.Args).
    // 定义安装过程
		Install(
      // 查找 config/app.go 文件
			modify.GoFile(path.Config("app.go")).
        // 查找 imports 并添加导入: examplepackage "github.com/goravel/example-package"
				Find(match.Imports()).Modify(modify.AddImport(packages.GetModulePath(), "examplepackage")).
        // 查找 providers 并注册服务提供者: &examplepackage.ServiceProvider{}，注意这里需要先添加导入，然后才能注册服务提供者
				Find(match.Providers()).Modify(modify.Register("&examplepackage.ServiceProvider{}")),
      // 查找 hello.go 文件，创建或覆盖文件
			modify.File(path.Config("hello.go")).Overwrite(config),
		).
    // 定义卸载过程
		Uninstall(
      // 查找 config/app.go 文件
			modify.GoFile(path.Config("app.go")).
        // 查找 providers 并取消注册服务提供者: &examplepackage.ServiceProvider{}
				Find(match.Providers()).Modify(modify.Unregister("&examplepackage.ServiceProvider{}")).
        // 查找 imports 并删除导入: examplepackage "github.com/goravel/example-package"，注意这里需要先取消注册服务提供者，然后才能删除导入
				Find(match.Imports()).Modify(modify.RemoveImport(packages.GetModulePath(), "examplepackage")),
      // 查找 hello.go 文件，删除文件
			modify.File(path.Config("hello.go")).Remove(),
		).
    // 执行安装或卸载操作
		Execute()
```

### 手动安装

将包内的 `ServiceProvider` 注册到 `config/app.go::providers`，然后将 `facades` 导出到应用中即可，详细步骤可以参考：[goravel/example-package](https://github.com/goravel/example-package)。 For detailed steps, refer to [goravel/example-package](https://github.com/goravel/example-package).

## 资源

### 配置

Typically, you will need to publish your package's configuration file to the application's `config` directory. This will allow users of your package to easily override your default configuration options. 通常，您需要将包的配置文件发布到应用程序的 `config` 目录中。 这将允许包的用户轻松覆盖您的默认配置选项。 要允许发布您的配置文件，请从服务提供者的 `Boot` 方法中调用 `Publishes` 方法，第一个参数是包名，第二个参数是当前包文件路径和项目路径之间的映射：

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "config/sms.go": app.ConfigPath("sms.go"),
  })
}
```

### 路由

如果你的包中有[路由](../basic/routing)，你可以使用 `app.MakeRoute()` 来解析 `facades.Route()`，然后将路由添加到项目中：

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
 route := app.MakeRoute()
 route.Get("sms", ***)
}
```

### 迁移

如果你的包中有[迁移](../orm/migrations)，你可以通过 `Publishes` 方法发布它们：

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "migrations": app.DatabasePath("migrations"),
  })
}
```

## 命令

你可以通过 `Commands` 方法注册 `Artisan` 命令，注册后你可以使用 [Artisan CLI](../advanced/artisan) 运行这些命令。

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
 app.Commands([]console.Command{
  commands.NewSmsCommand(),
 })
}
```

## 公共资源

Your package may have assets such as JavaScript, CSS, and images. To publish these assets to the application's `public` directory, use the service provider's `Publishes` method:

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "public": app.PublicPath("vendor"),
  })
}
```

## 发布文件组

If you want to publish specific groups of package assets and resources separately, you can use tags when calling the `Publishes` method from the package's service provider. This allows you to give users the option to publish certain files, like configuration files, without having to publish all the package's assets. 如果你想单独发布特定组的包资源，你可以在包的服务提供者中调用 `Publishes` 方法时使用标签。 这使你能够给用户选择发布某些文件，如配置文件，而不必发布包的所有资源。 为了说明，你可以在包的服务提供者的 `Boot` 方法中使用标签为 `sms` 包定义两个发布组（`sms-config` 和 `sms-migrations`）。

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

## 发布资源

在项目中，您可以使用 `vendor:publish` Artisan 命令发布包中注册的资源：

```shell
go run . artisan vendor:publish --package={您的包名}
```

该命令可以使用以下选项：

| 选项名称       | Alias | 操作                                                                                                       |
| ---------- | ----- | -------------------------------------------------------------------------------------------------------- |
| --package  | -p    | 包名，可以是远程包：`github.com/goravel/example-package`，也可以是本地包：`./packages/example-package`，注意使用本地包名时需以 `./` 开头。 |
| --tag      | -t    | 资源组                                                                                                      |
| --force    | -f    | 覆盖任何现有文件                                                                                                 |
| --existing | -e    | 仅发布并覆盖已经发布的文件                                                                                            |
