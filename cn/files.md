## 目录结构

- [介绍](#introduction)
- [根目录](#root)
    - [`app` 目录](#root-app)
    - [`bootstrap` 目录](#root-bootstrap)
    - [`config` 目录](#root-config)
    - [`database` 目录](#root-database)
    - [`public` 目录](#root-public)
    - [`routes` 目录](#root-routes)
    - [`storage` 目录](#root-storage)
- [`app` 目录](#app)
    - [`console` 目录](#app-console)
    - [`http` 目录](#app-http)
    - [`models` 目录](#app-models)
    - [`providers` 目录](#app-providers)

<a name="introduction"></a>

## 介绍

默认的文件结构可以使你更好的开始项目推进，你也可以自由的新增文件夹，但默认文件夹不要修改。

<a name="root"></a>

## 根目录

<a name="root-app"></a>

### app 目录

`app` 包含了程序的核心代码，程序中几乎所有的逻辑都将在这个文件夹中。

<a name="root-bootstrap"></a>

### bootstrap 目录

`bootstrap` 目录包含了框架的启动文件 `app.php`。

<a name="root-config"></a>

### config 目录

`config` 目录包含了应用程序的所有配置文件。最好把这些文件都浏览一遍，并熟悉所有可用的选项。

<a name="root-database"></a>

### database 目录

`database` 目录包含了数据库迁移文件。

<a name="root-public"></a>

### public 目录

`public` 目录包含一些资源，如图像、证书等。

<a name="root-routes"></a>

### routes 目录

`routes` 目录包含应用程序的所有路由定义。

<a name="root-storage"></a>

### storage 目录

`storage` 目录包含 `logs` 目录，`logs` 目录包含应用程序的日志文件。

<a name="app"></a>

## app 目录

<a name="app-console"></a>

### console 目录

`console` 目录包含应用程序所有自定义的 Artisan 命令，与控制台引导文件 `kernel.go`，可以再这个文件中注册[任务调度](#schedule)

<a name="app-http"></a>

### http 目录

`http` 目录包含了控制器、中间件等，几乎所有通过 Web 进入应用的请求处理都在这里进行。

<a name="app-models"></a>

### models 目录

`models` 目录包含所有数据模型。

<a name="app-providers"></a>

### providers 目录

`providers` 目录包含程序中所有的 [服务提供者](#providers)。服务提供者通过绑定服务、注册事件或执行任何其他任务来引导应用程序以应对传入请求。
