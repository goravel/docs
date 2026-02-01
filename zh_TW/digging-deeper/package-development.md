# 擴展包開發

[[toc]]

## 概述

套件是向 Goravel 添加功能的主要方式。 這些套件可能包含專門用於增強 Goravel 應用程序的路由、控制器和配置。 本指南主要涵蓋了那些特定於 Goravel 的套件的開發。 這些套件可能包含專門設計用來增強 Goravel 應用程式的路由、控制器和配置。 本指南聚焦於開發特定於 Goravel 的套件。

這裡有一個建立第三方套件的範例: [goravel/example-package](https://github.com/goravel/example-package)

## 建立套件

你可以輕鬆使用 Artisan 命令建立套件模板：

```shell
./artisan make:package sms
```

創建的文件默認保存在根目錄 `packages` 文件夾中，你可以使用 `--root` 選項自定義：

```shell
./artisan make:package --root=pkg sms
```

## 服務提供者

[服務提供者](../architecture-concepts/service-providers.md)作為你的套件和 Goravel 之間的橋樑。 它們通常位於套件的根目錄下，作為 `service_provider.go` 文件。 它們的主要功能是將項目綁定到 Goravel 的服務容器並指導 Goravel 加載套件資源。

## Install The Package

當創建一個套件時，如果它包含一個 `setup/setup.go` 文件，你可以在此文件中定義套件安裝邏輯，然後用戶可以使用 `package:install` 命令來安裝這個套件：

```shell
./artisan package:install github.com/goravel/example-package
```

以下是對 `setup/setup.go` 文件中定義的安裝過程的解釋，這有助於你編寫自己的套件安裝邏輯：

```go
// setup/setup.go
package main

import (
	"os"

	"github.com/goravel/framework/packages"
	"github.com/goravel/framework/packages/modify"
	"github.com/goravel/framework/support/file"
	"github.com/goravel/framework/support/path"
)

func main() {
	// Initialize setup to get paths, this should be called at the beginning.
	setup := packages.Setup(os.Args)

	// The config file will be published to the project's config directory automatically when installing by this way.
	// You can also publish this config file manually: ./artisan vendor:publish --package=github.com/goravel/example-package
	config, err := file.GetPackageContent(setup.Paths().Module().String(), "setup/config/hello.go")
	if err != nil {
		panic(err)
	}

	serviceProvider := "&hello.ServiceProvider{}"
	moduleImport := setup.Paths().Module().Import()

	setup.Install(
		// Register the service provider to the providers slice in bootstrap/providers.go
		modify.RegisterProvider(moduleImport, serviceProvider),

		// Add the config file to the config directory
		modify.File(path.Config("hello.go")).Overwrite(config),
	).Uninstall(
		// Remove the config file from the config directory
		modify.File(path.Config("hello.go")).Remove(),

		// Unregister the service provider from the providers slice in bootstrap/providers.go
		modify.UnregisterProvider(moduleImport, serviceProvider),
	).Execute()
}
```

## 資源

### 配置

通常，你需要將包的配置文件發佈到應用程序的 `config` 目錄。 這將允許你的包的用戶輕鬆覆蓋你的默認配置選項。 要允許你的配置文件被發佈，請從服務提供者的 `Boot` 方法中調用 `Publishes` 方法，第一个参数是包名，第二个参数是當前包文件路徑和項目路徑的映射：

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "config/sms.go": app.ConfigPath("sms.go"),
  })
}
```

### 路由

如果你的包中有[路由](../the-basics/routing.md)，你可以使用 `app.MakeRoute()` 來解析 `facades.Route()`，然後將路由添加到項目中：

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
	route := app.MakeRoute()
	route.Get("sms", ***)
}
```

### 遷移

如果你的包中有[遷移](../database/migrations.md)，你可以使用 `Publishes` 方法來發佈它們：

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "migrations": app.DatabasePath("migrations"),
  })
}
```

### 模型

如果您的軟體包中定義了任何新的[模型](../orm/getting-started.md)，則可以使用`Publishes`方法發布它們：

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "models": app.ModelPath("models"),
  })
}
```

## 命令

你可以在服務提供者中使用 `Commands` 方法註冊 `Artisan` 命令，並可以透過[Artisan CLI](../digging-deeper/artisan-console.md)執行這些命令。

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
	app.Commands([]console.Command{
		commands.NewSmsCommand(),
	})
}
```

## 公共資源

你的套件可能包含資源，如JavaScript、CSS和圖片。 要將這些資源發佈到應用程序的 `public` 目錄，請使用服務提供者的 `Publishes` 方法：

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "public": app.PublicPath("vendor"),
  })
}
```

## 發佈文件組

如果你想要將特定的套件資產和資源單獨發佈，你可以在調用包的服務提供者的 `Publishes` 方法時使用標籤。 這將允許你給用戶選擇發佈某些文件，如配置文件，而不必發佈所有套件的資產。 例如，你可以使用標籤在包的服務提供者的 `Boot` 方法中為 `sms` 套件定義兩個發佈組（`sms-config` 和 `sms-migrations`）來進行演示。

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

## 發佈資源

在項目中，你可以使用 Artisan 命令 `vendor:publish` 發佈包中註冊的資源：

```shell
./artisan vendor:publish --package={You package name}
```

該命令可以使用如下選項：

| 選項名稱       | 別名 | 操作                                                                                                             |
| ---------- | -- | -------------------------------------------------------------------------------------------------------------- |
| --package  | -p | 包名，可以使遠程包，比如：`github.com/goravel/example-package`，也可以是本地包，`./packages/example-package`，注意當使用本地包名時，需要以 `./` 開頭。 |
| --tag      | -t | 資源組                                                                                                            |
| --force    | -f | 請覆蓋任何已存在的檔案                                                                                                    |
| --existing | -e | 只發布已存在的資源，並強制覆蓋                                                                                                |
