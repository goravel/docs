# 数据填充

[[toc]]

## 简介

Goravel 内置了一个可为你的数据库填充测试数据的 struct。 所有的填充 struct 都放在 `database/seeds` 目录下。 Goravel 默认定义了一个 `DatabaseSeeder` struct。

## 编写 Seeders

运行 [Artisan 命令](../digging-deeper/artisan-console.md) `make:seeder` 可以生成 Seeder。 框架生成的 seeders 都放在 `database/seeders` 目录下：

```shell
go run . artisan make:seeder UserSeeder
```

Seeder struct 只包含两个方法：`Signature`, `Run`。 `Signature` 方法定义 Seeder 的名称，`Run` 方法会在执行 `db:seed` 这个 Artisan command 时被调用。 在 `Run` 方法里，您可以按需在数据库中插入数据。

如下所示，在默认的 `DatabaseSeeder` struct 中的 `Run` 方法中添加一条数据插入语句：

```go
package seeders

import (
	"github.com/goravel/framework/contracts/database/seeder"
	"github.com/goravel/framework/facades"

	"goravel/app/models"
)

type DatabaseSeeder struct {
}

// Signature The name and signature of the seeder.
func (s *DatabaseSeeder) Signature() string {
	return "DatabaseSeeder"
}

// Run executes the seeder logic.
func (s *DatabaseSeeder) Run() error {
	user := models.User{
		Name: "goravel",
	}
	return facades.Orm().Query().Create(&user)
}
```

## 调用其他 Seeders

在 `DatabaseSeeder` struct 中，你可以使用 `Call` 方法来运行其他的 seed。 使用 `Call` 方法可以将数据填充拆分成多个文件，这样就不会使单个 seeder 文件变得非常大。 只需向 `Call` 方法中传递要运行的 seeder 类名称即可：

```go
// Run executes the seeder logic.
func (s *DatabaseSeeder) Run() error {
	return facades.Seeder().Call([]seeder.Seeder{
		&UserSeeder{},
	})
}
```

框架还提供一个 `CallOnce` 方法，可以使某 seeder 在一次 `db:seed` 命令中只运行一次：

```go
// Run executes the seeder logic.
func (s *DatabaseSeeder) Run() error {
	return facades.Seeder().CallOnce([]seeder.Seeder{
		&UserSeeder{},
	})
}
```

## 运行 Seeders

你可以使用 Artisan 命令 `db:seed` 来填充数据库。 默认情况下，`db:seed` 命令将运行 `database/seeders/database_seeder.go`，这个 struct 又可以调用其他 seed。 不过，你也可以使用 `--seeder` 选项来指定一个特定的 seeder：

```shell
go run . artisan db:seed
```

如果你想在运行 `db:seed` 命令时执行其他 seeder，可以在 `app/providers/database_service_provider.go` 中注册该 seeder，如果是通过 `make:seeder` 命令生成的 seeder，则不需要手动注册，框架会自动注册。

```go
// app/providers/database_service_provider.go
func (receiver *DatabaseServiceProvider) Boot(app foundation.Application) {
	facades.Seeder().Register([]seeder.Seeder{
		&seeders.DatabaseSeeder{},
        &seeders.UserSeeder{},
        &seeders.PhotoSeeder{},
	})
}

go run . artisan db:seed --seeder=UserSeeder PhotoSeeder // The signature of seeder
```

你还可以使用 `migrate:fresh` 或 `migrate:refresh` 命令结合 `--seed` 选项，这将删除数据库中所有表并重新运行所有迁移。 此命令对于完全重建数据库非常有用。 也可以使用 `--seeder` 运行一个指定的 seeder：

```shell
go run . artisan migrate:fresh --seed

go run . artisan migrate:fresh --seed --seeder=UserSeeder

go run . artisan migrate:refresh --seed

go run . artisan migrate:refresh --seed --seeder=UserSeeder
```

### 在生产环境中强制运行填充

一些填充操作可能会导致原有数据的更新或丢失。 为了保护生产环境数据库的数据，在生产环境中运行填充命令前会进行确认。 可以添加 `--force` 选项来强制运行填充命令：

```shell
go run . artisan db:seed --force
```
