# Database: Seeding

[[toc]]

## 简介

Goravel 包含使用种子结构填充数据库的功能。 所有种子结构都存储在 `database/seeders` 目录中。 默认情况下，为您定义了一个 `DatabaseSeeder` 结构。 All seed structs are stored in the `database/seeders` directory. By default, a `DatabaseSeeder` struct is defined for you.

## 编写 Seeders

运行 [Artisan 命令](../digging-deeper/artisan-console.md) `make:seeder` 可以生成 Seeder，框架生成的 seeders 都放在 `database/seeders` 目录下： 要生成种子，请运行 `make:seeder` [Artisan 命令](../advanced/artisan)。 框架生成的所有种子都将存储在 `database/seeders` 目录中：

```shell
go run . artisan make:seeder UserSeeder
```

By default, a seeder struct has two methods: `Signature` and `Run`. The `Signature` method sets the name of the seeder, while the `Run` method is triggered when the `db:seed` Artisan command is executed. You can use the `Run` method to insert data into your database in any way you prefer.

为了说明，我们可以通过在 `Run` 方法中添加数据库插入语句来自定义 `DatabaseSeeder` 结构体。

```go
package seeders

import (
 "github.com/goravel/framework/contracts/database/seeder"
 "github.com/goravel/framework/facades"

 "goravel/app/models"
)

type DatabaseSeeder struct {
}

// Signature 种子器的名称和签名。
func (s *DatabaseSeeder) Signature() string {
 return "DatabaseSeeder"
}

// Run 执行种子器逻辑。
func (s *DatabaseSeeder) Run() error {
 user := models.User{
  Name: "goravel",
 }
 return facades.Orm().Query().Create(&user)
}
```

## 调用其他 Seeders

Within the `DatabaseSeeder` struct, you may use the `Call` method to execute additional seed structs. 在 `DatabaseSeeder` 结构体中，你可以使用 `Call` 方法来执行其他种子结构体。 使用 `Call` 方法允许你将数据库种子分解成多个文件，这样就不会让单个种子结构体变得过大。 `Call` 方法接受一个应该被执行的种子结构体数组： The `Call` method accepts an array of seeder structs that should be executed:

```go
// Run 执行 seeder 逻辑。
func (s *DatabaseSeeder) Run() error {
 return facades.Seeder().CallOnce([]seeder.Seeder{
  &UserSeeder{},
 })
}
```

Framework 还提供了一个 `CallOnce` 方法，一个 seeder 将只在 `db:seed` 命令中执行一次：

```go
// Run 执行种子器逻辑。
func (s *DatabaseSeeder) Run() error {
 return facades.Seeder().Call([]seeder.Seeder{
  &UserSeeder{},
 })
}
```

## 运行 Seeders

你可以运行 `db:seed` Artisan 命令来为数据库填充数据。 默认情况下，`db:seed` 命令运行 `database/seeders/database_seeder.go` 文件，该文件可能会调用其他 seed 类。 然而，你可以使用 `--seeder` 选项来指定一个特定的 seeder 类单独运行： By default, the `db:seed` command runs the `database/seeders/database_seeder.go` file, which may in turn invoke other seed classes. However, you may use the `--seeder` option to specify a specific seeder class to run individually:

```shell
go run . artisan db:seed
```

如果你想在运行 `db:seed` 命令时执行其他 seeders，你可以在 `app/providers/database_service_provider.go` 中注册 seeder：

```go
// app/providers/database_service_provider.go
func (receiver *DatabaseServiceProvider) Boot(app foundation.Application) {
 facades.Seeder().Register([]seeder.Seeder{
  &seeders.DatabaseSeeder{},
        &seeders.UserSeeder{},
        &seeders.PhotoSeeder{},
 })
}

go run . artisan db:seed --seeder=UserSeeder PhotoSeeder // seeder的签名
```

您还可以使用`migrate:fresh`和`migrate:refresh`命令结合`--seed`选项来为数据库填充数据，这将删除所有表并重新运行所有迁移。 此命令对于完全重建数据库非常有用。 `--seeder`选项可用于指定要运行的特定填充器： This command is useful for completely re-building your database. The `--seeder` option may be used to specify a specific seeder to run:

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
