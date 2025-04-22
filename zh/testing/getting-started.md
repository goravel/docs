# 快速入门

[[toc]]

## 介绍

Goravel 的测试功能依托于 Golang 自带的 test 官方组件，是对单元测试的扩展，使 Goravel 应用程序支持集成测试，让应用变得更加健壮。

## 环境

### 自定义环境配置文件

测试时默认使用根目录下的 `.env` 文件注入配置信息，如果想为不同的包使用不同的 `.env` 文件，可以在包目录下创建 `.env` 文件，测试时会优先读取该文件。

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

您也可以在运行 `go test` 时使用 `--env=.env.testing` 选项自定义配置文件，但需注意，此选项需跟在测试目录后面，例如：

```shell
go test ./... --env=.env.testing
go test ./... -e=.env.testing
```

### `TestCase` Struct

Goravel 包含一个 `TestCase` Struct，在未来该 Struct 将提供一些便捷测试方法，此外同一个文件中还存在一个 `init` 方法，该方法在运行测试之前引导注册 Goravel 应用程序，如果需要您可以在此方法中添加在运行测试前需要前置运行的逻辑。

## 创建测试

要创建新的测试用例，可以使用 Artisan 命令：`make:test`：

```shell
go run . artisan make:test feature/UserTest
```

默认我们使用 [stretchr/testify](https://github.com/stretchr/testify) 包的 `suit` 功能编写我们的测试，该功能支持配置测试前、测试后、子测试、断言等，可以使我们的测试用例更加有条理，具体使用请详见官方文档。

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

// SetupTest will run before each test in the suite.
func (s *ExampleTestSuite) SetupTest() {
}

// TearDownTest will run after each test in the suite.
func (s *ExampleTestSuite) TearDownTest() {
}

func (s *ExampleTestSuite) TestIndex() {
  s.True(true)
}
```

## 数据库测试

Goravel 模型工厂和 Seeders 可以轻松地为应用程序的模型创建测试数据库记录。

### 模型工厂

当我们测试的时候，可能需要在执行测试之前向数据库插入一些数据。Goravel 允许你使用 [模型工厂](../orm/factories.md) 为每个模型定义一组默认值，而不是在创建测试数据时手动指定每一列的值。

```go
var user models.User
err := facades.Orm().Factory().Create(&user)
```

### 运行 seeders

如果你在功能测试时希望使用 [数据库 seeders](../orm/seeding.md) 来填充你的数据库，你可以调用 `Seed` 方法。默认情况下，`Seed` 方法将会执行 `DatabaseSeeder`，它将会执行你的所有其他 seeders。或者，你可以传递指定的 seeder 给 `Seed` 方法：

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

// SetupTest will run before each test in the suite.
func (s *ExampleTestSuite) SetupTest() {
}

// TearDownTest will run after each test in the suite.
func (s *ExampleTestSuite) TearDownTest() {
}

func (s *ExampleTestSuite) TestIndex() {
  // Run the DatabaseSeeder...
	s.Seed()

  // Run multiple specific seeders...
	s.Seed(&seeders.UserSeeder{}, &seeders.PhotoSeeder{})
}
```

### 使用 Docker

由于 `go test` 在不同包之间是并行测试，因此当使用本地数据库进行测试时，不能在测试用例中执行重置数据库操作，否则将有可能对并行运行的其他测试用例产生影响。针对这种情况，Goravel 支持使用 Docker 进行测试，不同包之间可以独立使用由 Docker 创建的数据库镜像。

> 由于 Docker 镜像对 windows 系统的支持有限，目前 Docker 测试仅支持在非 windows 环境下运行。

#### 初始化镜像

您可以使用 `Database` 方法根据默认数据库连接初始化数据库镜像，也可以向该方法传入数据库连接名称，初始化其他数据库镜像：

```go
database, err := facades.Testing().Docker().Database()
database, err := facades.Testing().Docker().Database("postgres")
```

默认支持的数据库镜像：

| 数据库       | 镜像地址                                               | 版本      |
| --------    | -------------------------------------------------- | --------- |
| Mysql       | [https://hub.docker.com/_/mysql](https://hub.docker.com/_/mysql) | latest      |
| Postgres  | [https://hub.docker.com/_/postgres](https://hub.docker.com/_/postgres) | latest      |
| Sqlserver   | [https://hub.docker.com/r/microsoft/mssql-server](https://hub.docker.com/r/microsoft/mssql-server) | latest      |
| Sqlite      | [https://hub.docker.com/r/nouchka/sqlite3](https://hub.docker.com/r/nouchka/sqlite3) | latest      |

也可以使用 `Image` 方法自定义镜像：

```go
import contractstesting "github.com/goravel/framework/contracts/testing"

database.Image(contractstesting.Image{
  Repository: "mysql",
  Tag:        "5.7",
  Env: []string{
    "MYSQL_ROOT_PASSWORD=123123",
    "MYSQL_DATABASE=goravel",
  },
  ExposedPorts: []string{"3306"},
})
```

#### 构建镜像

镜像初始化完毕后，您可以使用 `Build` 方法构建镜像：

```go
err := database.Build()
```

这时使用 `docker ps` 命令可以看到镜像已运行在系统中，通过 `Config` 方法可以获取链接数据库的配置信息，方便连接调试：

```go
config := database.Config()
```

#### 运行填充

如果您在测试时希望使用 [数据填充](../orm/seeding.md) 来填充数据库，可以调用 `Seed` 方法。 默认情况下，`Seed` 方法将会执行 `DatabaseSeeder`，它应该执行您的所有其他种子器。或者，您可以传递指定的种子器类名给 `Seed` 方法：

```go
err := database.Seed()
err := database.Seed(&seeders.UserSeeder{}, &seeders.PhotoSeeder{})
```

#### 重置数据库

由于子包内测试用例是串行执行的，所以在单个测试用例运行后刷新数据库将不会产生负面影响，可以使用 `Fresh` 方法：

```go
err := database.Fresh()
```

也可以使用 `RefreshDatabase` 方法执行该操作：

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

// SetupTest will run before each test in the suite.
func (s *ExampleTestSuite) SetupTest() {
  s.RefreshDatabase()
}

// TearDownTest will run after each test in the suite.
func (s *ExampleTestSuite) TearDownTest() {
}

func (s *ExampleTestSuite) TestIndex() {
}
```

#### 卸载镜像

子包内测试用例执行完毕后，镜像将在一小时后自动卸载，您也可以使用 `Shutdown` 方法手动卸载镜像。

```go
err := database.Shutdown()
```

#### 示例

我们可以在子包中创建 `TestMain` 函数，添加测试用例的前置逻辑：

```go
// tests/feature/main_test.go
package feature

import (
  "fmt"
  "os"
  "testing"

  "github.com/goravel/framework/facades"

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

  if err := database.Migrate(); err != nil {
    panic(err)
  }

  // 执行测试用例
  exit := m.Run()

  // 所有测试用例运行完毕后卸载镜像
  if err := database.Shutdown(); err != nil {
    panic(err)
  }

  os.Exit(exit)
}
```

> 关于 TestMain 方法的更多使用，参见[官方文档](https://pkg.go.dev/testing#hdr-Main)。
