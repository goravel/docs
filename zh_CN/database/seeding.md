# Database: Seeding

[[toc]]

## 简介

Goravel 内置了一个可为您的数据库填充测试数据的 struct。所有的填充 struct 都放在 `database/seeds` 目录下。Goravel 默认定义了一个 `DatabaseSeeder` struct。通过这个 struct，你可以用 `facades.Seeder.Call()` 方法来运行其他的 `seed` 类，从而控制数据填充的顺序。 All seed structs are stored in the `database/seeders` directory. By default, a `DatabaseSeeder` struct is defined for you.

## 编写 Seeders

运行 [Artisan 命令](../digging-deeper/artisan-console.md) `make:seeder` 可以生成 Seeder，框架生成的 seeders 都放在 `database/seeders` 目录下： 要生成种子，请运行 `make:seeder` [Artisan 命令](../advanced/artisan)。 框架生成的所有种子都将存储在 `database/seeders` 目录中：

```shell
go run . artisan make:seeder UserSeeder
```

By default, a seeder struct has two methods: `Signature` and `Run`. The `Signature` method sets the name of the seeder, while the `Run` method is triggered when the `db:seed` Artisan command is executed. You can use the `Run` method to insert data into your database in any way you prefer.

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

Within the `DatabaseSeeder` struct, you may use the `Call` method to execute additional seed structs. 在 `DatabaseSeeder` struct 中，你可以使用 `Call` 方法来运行其他的 seed。使用 `Call` 方法可以将数据填充拆分成多个文件，这样就不会使单个 seeder 文件变得非常大。 只需向 `Call` 方法中传递要运行的 seeder 类名称即可： The `Call` method accepts an array of seeder structs that should be executed:

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

您可以使用 Artisan 命令 `db:seed` 来填充数据库。默认情况下，`db:seed` 命令将运行 `database/seeders/database_seeder.go`，这个 struct 又可以调用其他 seed。不过，你也可以使用 `--seeder` 选项来指定一个特定的 seeder： By default, the `db:seed` command runs the `database/seeders/database_seeder.go` file, which may in turn invoke other seed classes. However, you may use the `--seeder` option to specify a specific seeder class to run individually:

```shell
go run . artisan db:seed
```

如果您想在运行 `db:seed` 命令时执行其他 seeder，可以在 `app/providers/database_service_provider.go` 中注册该 seeder，如果是通过 `make:seeder` 命令生成的 seeder，则不需要手动注册，框架会自动注册。

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

您还可以使用 `migrate:fresh` 或 `migrate:refresh` 命令结合 `--seed` 选项，这将删除数据库中所有表并重新运行所有迁移。此命令对于完全重建数据库非常有用。也可以使用 `--seeder` 运行一个指定的 seeder： This command is useful for completely re-building your database. The `--seeder` option may be used to specify a specific seeder to run:

```shell
go run . artisan migrate:fresh --seed

go run . artisan migrate:fresh --seed --seeder=UserSeeder

go run . artisan migrate:refresh --seed

go run . artisan migrate:refresh --seed --seeder=UserSeeder
```

### Forcing Seeders To Run In Production

Some seeding operations may cause you to alter or lose data. In order to protect you from running seeding commands against your production database, you will be prompted for confirmation before the seeders are executed in the `production` environment. To force the seeders to run without a prompt, use the `--force` flag:

```shell
go run . artisan db:seed --force
```
