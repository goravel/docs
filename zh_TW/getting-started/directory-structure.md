# 目錄結構

[[toc]]

## 概述

默認的文件結構可以使你更好地開始項目推進，你也可以自由地新增文件夾，但默認文件夾不要修改。

## Folder Tree

```
goravel/
├── app/                        # Core application logic
│   ├── console/                # Artisan console commands
│   ├── grpc/                   # gRPC controllers and middleware
│   ├── http/                   # HTTP controllers and middleware
│   │   ├── controllers/        # HTTP request handlers
│   │   ├── middleware/         # HTTP middleware (auth, cors, etc.)
│   ├── models/                 # Database models and ORM entities
│   └── providers/              # Service providers
├── bootstrap/                  # Application bootstrapping
│   └── app.go                  # Framework initialization and startup
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

## Customize Directory Structure

You can customize the directory structure by calling the `WithPath()` function in the `bootstrap/app.go` file. For example, if you want to change the default `app` directory to `src`, you can modify the `bootstrap/app.go` file as follows:

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

There are many other paths you can customize, such as `Config`, `Database`, `Routes`, `Storage`, and `Resources`. Just call the corresponding method on the `paths` object to set your desired directory.
