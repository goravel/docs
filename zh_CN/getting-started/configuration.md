# 配置信息

[[toc]]

## 简介

Goravel 框架所有配置文件都保存在 `config` 目录中。 你可以进入具体文件查看配置说明，根据项目需要灵活配置。

## 环境配置

在不同的环境运行应用程序，通常需要不同的配置。 例如，你可能希望在本地打开 Debug 模式，但生产环境不需要。

因此，框架在根目录提供了 `.env.example` 文件。 需要你在开发前，复制该文件并重命名为 `.env`，根据项目需要修改 `.env` 文件中的配置项。

注意，`.env` 文件不应该加入版本控制，因为多人协作时，不同的开发人员有可能使用不同的配置，不同的部署环境配置也不相同。

此外，如果有入侵者获得了你的代码仓库访问权限，将会有暴露敏感配置的风险。 如果你想新增新的配置项，可以添加到 `.env.example` 文件中，以此来同步所有开发者的配置。

### 注册配置

所有配置文件都将通过 `bootstrap/app.go` 文件中的 `WithConfig` 函数进行注册。 由于它是配置文件中的 `init` 函数，因此您无需逐一注册每个配置文件。 只需按如下方式调用 `WithConfig` 函数：

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithConfig(config.Boot).
		Create()
}
```

## 获取环境配置

使用如下方法，可获取 `.env` 文件中的配置项：

```go
// 第一个参数为配置键，第二个参数为默认值
facades.Config().Env("APP_NAME", "goravel")
```

## 获取配置值

你可以轻松的在应用程序的任何位置使用全局 `facades.Config()` 函数来访问 `config` 目录中的配置值。 配置值的访问可以使用「点」语法。 还可以指定默认值，如果配置选项不存在，则返回默认值：

```go
// 通过断言获取配置
facades.Config().Get("app.name", "goravel")

// 获取字符串类型的配置
facades.Config().GetString("app.name", "goravel")

// 获取整形类型的配置
facades.Config().GetInt("app.int", 1)

// 获取布尔类型的配置
facades.Config().GetBool("app.debug", true)
```

## 设置配置值

```go
facades.Config().Add("path", "value1")
facades.Config().Add("path.with.dot.case1", "value1")
facades.Config().Add("path.with.dot", map[string]any{"case3": "value3"})
```

## 获取项目信息

可以使用 `artisan about` 命令来查看框架的版本、配置等信息。

```bash
./artisan about
```
