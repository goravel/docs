# Facades

[[toc]]

## 简介

`facades` 为应用的核心功能提供一个「静态」接口，能够提供更加灵活、更加优雅、易于测试的语法。 Goravel 的所有 `facades` 都定义在 `app/facades` 文件夹下：

```go
import "app/facades"

facades.Config().GetString("app.host")
```

## facades 工作原理

每个服务提供者在服务容器中注册绑定，然后是服务容器提供很多 `Make*` 方法来构建服务提供者绑定的实例。 `app/facades` 文件夹中的 `facades` 通过调用 `Make*` 方法从服务容器中获取实例。 以 `Route` facade 为例：

1. `Route` 服务提供者注册在服务容器中注册 `binding.Route` 绑定：

```go
type ServiceProvider struct {}

func (r *ServiceProvider) Register(app foundation.Application) {
	app.Singleton(binding.Route, func(app foundation.Application) (any, error) {
		return NewRoute(app.MakeConfig())
	})
}

func (r *ServiceProvider) Boot(app foundation.Application) {}
```

2. `Route` facade 调用 `MakeRoute()` 函数从服务容器中获取 `Route` 实例：

```go
// app/facades/route.go
package facades

import (
	"github.com/goravel/framework/contracts/route"
)

func Route() route.Route {
	return App().MakeRoute()
}
```

> `facades` 被暴露于应用程序中，你也可以在 `app/facades` 文件夹中创建自己的 `facades` 或覆盖现有的 `facades`。

## 安装/卸载 Facades

[goravel/goravel](https://github.com/goravel/goravel) 默认安装所有 `facades`，[goravel/goravel-lite](https://github.com/goravel/goravel-lite) 只安装`Artisan`、`Config` 这样的基本 `facades`。 你可以通过 `package:install` 和 `package:uninstall` 命令安装或卸载 `facades` 。

```shell
# 安装指定的 facade
./artisan package:install Route

# 安装所有 facades
./artisan package:install --all

# 使用默认驱动安装所有 facades 
./artisan package:install --all --default

# 卸载指定的 facade
./artisan package:uninstall Route
```

> Notice: if you are using the `./artisan package:install` command to choose the `facades` manually, you need to press `x` to select the facades you want to install, then press `Enter` to confirm. `facades` are not selected if you directly press `Enter`.
