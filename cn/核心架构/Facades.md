### 介绍

`facades` 为应用的核心功能提供一个「静态」接口。Goravel 自带了很多 `facades`，可以使用大部分功能，在使用时能够提供更加灵活、更加优雅、易于测试的语法。

Goravel 所有的 `facades` 都定义在 `github.com/goravel/framework/support/facades` 下。我们可以很轻松的使用 `facades`：
```
import "github.com/goravel/framework/support/facades"

facades.Route.Run(facades.Config.GetString("app.host"))
```

### facades 工作原理

`facades` 一般会在 `ServerProvider` 的 `Register` 或 `Boot` 阶段进行实例化，也可以直接进行赋值，具体根据使用场景不同灵活区分。

例如，你只是想用 `facades` 实例化一个对象，可以直接进行赋值：
```
var Artisan = &console.Application{}
```

如果该 `facades` 使用了其他 `facades`，那么就在 `ServerProvider` 的 `Boot` 阶段进行实例化：
```
func (database *ServiceProvider) Register() {
	app := Application{}
	facades.DB = app.Init()
}
```

其他情况，可以在 `ServerProvider` 的 `Register` 阶段进行实例化：
```
func (config *ServiceProvider) Register() {
	app := Application{}
	facades.Config = app.Init()
}
```

### facade 类参考

Facade  |  作用
------------- | -------------
Artisan  |  [命令行工具](../综合话题/Artisan命令行.md)
------------- | -------------
Config  |  [获取系统配置](../入门指南/配置信息.md)
------------- | -------------
DB  |  [ORM](../ORM.md)
------------- | -------------
Route  |  [路由](../基本功能/路由.md)
