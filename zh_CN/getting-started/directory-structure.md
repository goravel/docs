# 文件夹结构

[[toc]]

## 简介

默认的文件结构可以使你更好的开始项目推进，你也可以自由的新增文件夹，但默认文件夹不要修改。

## 文件树

```
goravel/
├── app/                        # Core application logic
│   ├── console/                # Artisan console commands
│   ├── grpc/                   # gRPC controllers and middleware
│   ├── http/                   # HTTP controllers and middleware
│   │   ├── controllers/        # HTTP request handlers
│   │   ├── middleware/         # HTTP middleware (auth, cors, etc.)
│   ├── models/                 # ORM models
│   └── providers/              # Service providers
├── bootstrap/                  # Application bootstrapping
│   └── app.go                  # Framework initialization
├── config/                     # Application configuration files
├── database/                   # Database related files
│   ├── migrations/             # Database migration files
│   ├── seeders/                # Database seeders
├── resources/                  # Raw, uncompiled assets
│   └── views/                  # View templates
├── routes/                     # Application route definitions
├── storage/                    # Application storage
├── tests/                      # Automated tests
├── .air.toml                   # Air hot reload configuration
├── .env.example                # Environment variables template
├── artisan                     # Artisan console entry script
├── go.mod                      # Go module dependencies
├── go.sum                      # Go module checksums
├── main.go                     # Application entry point
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
