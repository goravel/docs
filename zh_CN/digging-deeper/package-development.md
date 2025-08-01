# 扩展包开发

[[toc]]

## 简介

Packages are the primary way of adding functionality to Goravel. These packages may contain routes, controllers, and configurations that are specifically designed to enhance a Goravel application. This guide focuses on developing Goravel-specific packages.

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

[服务提供者](../architecture-concepts/service-providers.md)是您的包和 Goravel 之间的连接点，通常位于包的根目录中：`service_provider.go`。服务提供者负责将事物绑定到 Goravel 的[服务容器](../architecture-concepts/service-container.md)并通知 Goravel 在哪里加载包资源。 They are typically located in the root of the package as a `service_provider.go` file. Their main function is to bind items into Goravel's service container and guide Goravel in loading package resources.

## 使用

### 自动安装

当创建包时包含一个 `setup/setup.go` 文件，你可以在这个文件中定义包的安装逻辑，之后用户可以使用 `package:install` 命令安装包：

```shell
./artisan package:install github.com/goravel/example-package
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

Typically, you will need to publish your package's configuration file to the application's `config` directory. This will allow users of your package to easily override your default configuration options. 通常，您需要将包的配置文件发布到应用程序的 `config` 目录。这将允许您的包的用户轻松覆盖您的默认配置选项。要允许发布配置文件，请从服务提供者的 `Boot` 方法中调用 `Publishes` 方法，该方法第一个参数为包名，第二个参数为当前包文件路径与项目路径的映射：

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

如果您的包包含[数据库迁移](../database/migrations.md)，也可以使用 `Publishes` 方法进行发布：

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "migrations": app.DatabasePath("migrations"),
  })
}
```

## 命令

可以在服务提供者中使用 `Commands` 方法注册 `Artisan` 命令，注册命令后，您可以使用[Artisan CLI](../digging-deeper/artisan-console.md)执行它们：

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

If you want to publish specific groups of package assets and resources separately, you can use tags when calling the `Publishes` method from the package's service provider. This allows you to give users the option to publish certain files, like configuration files, without having to publish all the package's assets. 您可能希望单独发布包资产和资源组。例如，您可能希望允许用户发布包的配置文件，而不是被迫发布包的全部资产。您可以在包的服务提供者中调用 `Publishes` 方法时定义「标签」来做到这一点。例如，让我们使用标签在包的服务提供者的 `Boot` 方法中为 `sms` 包定义两个发布组（`sms-config` 和 `sms-migrations`）：

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

在项目中，您可以使用 Artisan 命令 `vendor:publish` 发布包中注册的资源：

```shell
go run . artisan vendor:publish --package={您的包名}
```

该命令可以使用如下参数：

| 参数名        | Alias | 作用                                                                                                                                          |
| ---------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| --package  | -p    | 包名，可以使远程包，例如：github.com/goravel/example-package，也可以使用本地包名：./packages/example-package，注意当使用本地包名时，需要以 `./` 开头 |
| --tag      | -t    | 资源分组                                                                                                                                        |
| --force    | -f    | Overwrite any existing files                                                                                                                |
| --existing | -e    | 只发布已存在的资源，并强制覆盖                                                                                                                             |
