# 資料庫：填充

[[toc]]

## 概述

Goravel 包含能夠使用 seed struct 向你的資料庫填充數據的功能。 所有填充 struct 都存放在 `database/seeders` 目錄中。 默認情況下，為你定義了一個 `DatabaseSeeder` struct。

## 編寫 Seeders

要生成一個 seeder，執行 `make:seeder` [Artisan 命令](../digging-deeper/artisan-console.md)。 框架生成的所有 seeder 都將存儲在 `database/seeders` 目錄中：

```shell
go run . artisan make:seeder UserSeeder
```

默認情況下，seeder struct 具有兩個方法： `Signature` 和 `Run`。 `Signature` 方法設置 seeder 的名稱，而 `Run` 方法在執行 `db:seed` Artisan 命令時被觸發。 你可以使用 `Run` 方法以你希望的任何方式將數據插入資料庫。

為了說明，我們可以通過將數據插入語句添加到 `Run` 方法自定義 `DatabaseSeeder` struct。

```go
package seeders

import (
	"github.com/goravel/framework/contracts/database/seeder"
	"github.com/goravel/framework/facades"

	"goravel/app/models"
)

type DatabaseSeeder struct {
}

// Signature seeder 的名稱和簽名。
func (s *DatabaseSeeder) Signature() string {
	return "DatabaseSeeder"
}

// Run 執行 seeder 邏輯。
func (s *DatabaseSeeder) Run() error {
	user := models.User{
		Name: "goravel",
	}
	return facades.Orm().Query().Create(&user)
}
```

## 調用其他 Seeders

在 `DatabaseSeeder` struct 中，你可以使用 `Call` 方法來執行額外的 seed structs。 使用 `Call` 方法允許你將資料庫填充分割成多個文件，以防止單個 seeder struct 變得過於龐大。 `Call` 方法接受應執行的 seeder structs 陣列：

```go
// Run 執行 seeder 邏輯。
func (s *DatabaseSeeder) Run() error {
	return facades.Seeder().Call([]seeder.Seeder{
		&UserSeeder{},
	})
}
```

框架還提供一個 `CallOnce` 方法，seeder 只會在 `db:seed` 命令中執行一次：

```go
// Run 執行 seeder 邏輯。
func (s *DatabaseSeeder) Run() error {
	return facades.Seeder().CallOnce([]seeder.Seeder{
		&UserSeeder{},
	})
}
```

## 執行 Seeder

你可以執行 `db:seed` Artisan 命令以填充你的資料庫。 默認情況下，`db:seed` 命令運行 `database/seeders/database_seeder.go` 文件，該文件又可以調用其他 seed 類。 不過，你可以使用 `--seeder` 選項來指定單獨運行的特定 seeder 類：

```shell
go run . artisan db:seed
```

如果你想在運行 `db:seed` 命令時執行其他 seeders，你可以在 `app/providers/database_service_provider.go` 中註冊該 seeder，如果 seeder 是通過 `make:seeder` 命令生成的，框架會自動註冊。

```go
// app/providers/database_service_provider.go
func (receiver *DatabaseServiceProvider) Boot(app foundation.Application) {
	facades.Seeder().Register([]seeder.Seeder{
		&seeders.DatabaseSeeder{},
        &seeders.UserSeeder{},
        &seeders.PhotoSeeder{},
	})
}

go run . artisan db:seed --seeder=UserSeeder PhotoSeeder // seeder 的簽名
```

你也可以使用 `migrate:fresh` 和 `migrate:refresh` 命令結合 `--seed` 選項填充你的資料庫，這將刪除所有表並重新運行所有遷移。 這個命令對於完全重建你的資料庫非常有用。 `--seeder` 選項可用於指定要運行的特定 seeder：

```shell
go run . artisan migrate:fresh --seed

go run . artisan migrate:fresh --seed --seeder=UserSeeder

go run . artisan migrate:refresh --seed

go run . artisan migrate:refresh --seed --seeder=UserSeeder
```

### 強制 Seeders 在生產環境中運行

某些填充操作可能會導致你更改或丟失數據。 為了保護你在生產資料庫中執行填充命令，你將在 `production` 環境中執行 seeder 前被提示確認。 要強制 seeder 在沒有提示的情況下運行，使用 `--force` 標誌：

```shell
go run . artisan db:seed --force
```
