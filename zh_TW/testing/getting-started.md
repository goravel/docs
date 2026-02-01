# 開始使用

[[toc]]

## 概述

Goravel 的測試功能依賴於 Golang 的官方測試組件，擴展單元測試以支持整合測試並提高應用程序的穩定性。

## 環境

### 自定義環境檔案

預設情況下，根目錄中的 `.env` 檔案用於在測試期間注入配置資訊。 如果你想針對不同的包使用不同的 `.env` 檔案，可以在包目錄中創建一個 `.env` 檔案，測試將首先閱讀此檔案。

```
- /app
- /config
- ...
- /test
  - /feature
    - .env
    - user_test.go
- .env
```

此外，你可以在專案的根目錄創建一個 `.env.testing` 檔案。 當使用 `--env` 選項執行 `go test` 時，該檔案將被用來替代 `.env` 檔案，請注意此選項必須跟隨測試目錄，例如：

```shell
go test ./... --env=.env.testing
go test ./... -e=.env.testing
```

### `TestCase` 結構

Goravel 中有一個 `TestCase` 結構，未來該結構將提供一些方便的測試方法，此外，在同一檔案中有一個 `init` 方法，該方法指導在運行測試之前註冊 Goravel 應用程序。 你可以在該方法中包括任何需要在測試之前執行的邏輯。

## 創建測試

要創建新的測試用例，使用 `make:test` Artisan 命令：

```shell
./artisan make:test feature/UserTest
```

我們的測試用例預設使用 [stretchr/testify](https://github.com/stretchr/testify) 包的 suite 函數編寫。 該函數允許我們配置前測、後測、副測和斷言等功能，從而形成更有組織的測試用例。 有關更多信息，請參閱官方文檔。

```go
package feature

import (
  "testing"

  "github.com/stretchr/testify/suite"

  "goravel/tests"
)

type ExampleTestSuite struct {
  suite.Suite
  tests.TestCase
}

func TestExampleTestSuite(t *testing.T) {
  suite.Run(t, new(ExampleTestSuite))
}

// SetupTest 會在套件中的每個測試之前運行。
func (s *ExampleTestSuite) SetupTest() {
}

// TearDownTest 會在套件中的每個測試之後運行。
func (s *ExampleTestSuite) TearDownTest() {
}

func (s *ExampleTestSuite) TestIndex() {
  s.True(true)
}
```

## 資料庫測試

Goravel 模型工廠和 Seeder 可以輕鬆創建應用程序模型的測試資料庫記錄。

### 模型工廠

如果你正在進行測試，則可能需要在運行測試之前向資料庫添加一些記錄。 你不必手動輸入每列的值來創建測試數據。 有了 Goravel，你可以通過 [factories](../orm/factories.md) 為你的模型設置預設屬性。

```go
var user models.User
err := facades.Orm().Factory().Create(&user)
```

### 執行 Seeder

如果你想在功能測試期間使用 [database seeders](../database/seeding.md) 來填充資料庫，可以調用 `Seed` 方法。 預設情況下，`Seed` 方法將執行 `DatabaseSeeder`，該方法應執行你所有其他的 seeders。 此外，你可以將特定的 seeder 結構傳遞給 `Seed` 方法：

```go
package feature

import (
	"testing"

	"github.com/stretchr/testify/suite"

	"goravel/database/seeders"
	"goravel/tests"
)

type ExampleTestSuite struct {
	suite.Suite
	tests.TestCase
}

func TestExampleTestSuite(t *testing.T) {
	suite.Run(t, new(ExampleTestSuite))
}

// SetupTest 會在套件中的每個測試之前運行。
func (s *ExampleTestSuite) SetupTest() {
}

// TearDownTest 會在套件中的每個測試之後運行。
func (s *ExampleTestSuite) TearDownTest() {
}

func (s *ExampleTestSuite) TestIndex() {
  // 運行 DatabaseSeeder...
	s.Seed()

  // 運行多個特定的 seeders...
	s.Seed(&seeders.UserSeeder{}, &seeders.PhotoSeeder{})
}
```

### 使用 Docker

在使用 `go test` 時，多個包會並行測試。 因此，在測試用例中使用本地資料庫或快取來刷新資料庫或快取可能會影響其他並行測試用例。 為了解決這個問題，Goravel 提供了基於 Docker 的測試。 使用 Docker，可以創建資料庫或快取映像並在不同的包之間獨立使用。

> 由於 Docker 映像對 Windows 系統的支持有限，目前，Docker 測試只能在非 Windows 環境中運行。

#### 啟動 Docker

你可以使用 `Database` 或 `Cache` 方法創建映像，或者可以將連接名稱傳遞給該方法：

```go
database, err := facades.Testing().Docker().Database()
database, err := facades.Testing().Docker().Database("postgres")

cache, err := facades.Testing().Docker().Cache()
cache, err := facades.Testing().Docker().Cache("redis")
```

你還可以使用 `Image` 方法自定義映像：

```go
import contractstesting "github.com/goravel/framework/contracts/testing"

image, err := facades.Testing().Docker().Image(contractstesting.Image{
  Repository: "mysql",
  Tag:        "5.7",
  Env: []string{
    "MYSQL_ROOT_PASSWORD=123123",
    "MYSQL_DATABASE=goravel",
  },
  ExposedPorts: []string{"3306"},
})
```

#### 構建映像

在映像啟動後，你可以使用 `Build` 方法來構建該映像：

```go
err := database.Build()
err := cache.Build()
```

此時，你可以使用 `docker ps` 命令查看映像是否已在系統上運行，並通過 `Config` 方法獲取資料庫的配置資訊以方便連接調試：

```go
config := database.Config()
config := cache.Config()
```

#### 執行 Seeder

如果你希望在測試期間使用 [seeder](../database/seeding.md) 填充資料庫，可以調用 `Seed` 方法。 預設情況下，`Seed` 方法將執行 `DatabaseSeeder`，該方法應執行你所有其他的 seeders。 此外，你可以將特定的 seeder 結構傳遞給 `Seed` 方法：

```go
err := database.Seed()
err := database.Seed(&seeders.UserSeeder{})
```

#### 刷新資料庫或快取

因為同一包中的測試用例是串行執行的，在單個測試用例運行後刷新資料庫或快取將不會有負面影響，我們可以使用 `Fresh` 方法：

```go
err := database.Fresh()
err := cache.Fresh()
```

對於資料庫，你還可以使用 `RefreshDatabase` 方法：

```go
package feature

import (
	"testing"

	"github.com/stretchr/testify/suite"

	"goravel/tests"
)

type ExampleTestSuite struct {
	suite.Suite
	tests.TestCase
}

func TestExampleTestSuite(t *testing.T) {
	suite.Run(t, new(ExampleTestSuite))
}

// SetupTest 會在套件中的每個測試之前運行。
func (s *ExampleTestSuite) SetupTest() {
  s.RefreshDatabase()
}

// TearDownTest 會在套件中的每個測試之後運行。
func (s *ExampleTestSuite) TearDownTest() {
}

func (s *ExampleTestSuite) TestIndex() {
}
```

#### 卸載映像

在子包中的測試用例執行後，映像將在一小時內自動卸載，您還可以使用 `Shutdown` 方法手動卸載映像。

```go
err := database.Shutdown()
```

#### 範例

我們可以在子包中創建一個 `TestMain` 方法，並添加測試用例的前置邏輯：

```go
// tests/feature/main_test.go
package feature

import (
  "fmt"
  "os"
  "testing"

  "goravel/app/facades"
  "goravel/database/seeders"
)

func TestMain(m *testing.M) {
  database, err := facades.Testing().Docker().Database()
  if err != nil {
    panic(err)
  }

  if err := database.Build(); err != nil {
    panic(err)
  }
  if err := database.Ready(); err != nil {
    panic(err)
  }
  if err := database.Migrate(); err != nil {
    panic(err)
  }

  if err := facades.App().Restart(); err != nil {
    panic(err)
  }

  // Execute test cases
  exit := m.Run()

  // Uninstall the image after all test cases have been run
  if err := database.Shutdown(); err != nil {
    panic(err)
  }

  os.Exit(exit)
}
```

> 有關 TestMain 方法的更多用法，請參閱 [官方文檔](https://pkg.go.dev/testing#hdr-Main)。
