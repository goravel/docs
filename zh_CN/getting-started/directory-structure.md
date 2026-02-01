# 文件夹结构

[[toc]]

## 简介

默认的文件结构可以使你更好的开始项目推进，你也可以自由的新增文件夹，但默认文件夹不要修改。

## 文件树

```
goravel/
├── app/                        # 核心应用逻辑
│   ├── console/                # Artisan 控制台命令
│   ├── grpc/                   # gRPC 控制器和中间件
│   ├── http/                   # HTTP 控制器和中间件
│   │   ├── controllers/        # HTTP 请求处理器
│   │   ├── middleware/         # HTTP 中间件（认证、CORS 等）
│   ├── models/                 # ORM 模型
│   └── providers/              # 服务提供者
├── bootstrap/                  # 应用引导
│   └── app.go                  # 框架初始化
├── config/                     # 应用配置文件
├── database/                   # 数据库相关文件
│   ├── migrations/             # 数据库迁移文件
│   ├── seeders/                # 数据库种子
├── resources/                  # 资源
│   └── views/                  # 视图模板
├── routes/                     # 路由
├── storage/                    # 存储
├── tests/                      # 测试
├── .air.toml                   # Air 热重载配置
├── .env.example                # 环境变量模板
├── artisan                     # Artisan 控制台入口脚本
├── go.mod                      # Go 模块依赖
├── go.sum                      # Go 模块校验
├── main.go                     # 应用入口点
```

## 自定义目录结构

你可以通过在 `bootstrap/app.go` 文件中调用 `WithPath()` 函数来自定义目录结构。 例如，如果你想将默认的 `app` 目录更改为 `src`，可以按如下方式修改 `bootstrap/app.go` 文件：

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithPaths(func(paths configuration.Paths) {
			paths.App("src")
		}).
		WithConfig(config.Boot).
		Create()
}
```

你还可以自定义许多其他路径，例如 `Config`、`Database`、`Routes`、`Storage` 和 `Resources`。 只需在 `paths` 对象上调用相应的方法来设置你所需的目录。
