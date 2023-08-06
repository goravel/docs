# Getting Started

[[toc]]

## Introduction

The testing function of Goravel depends on the official test component that comes with Golang, is an extension of unit testing, make Goravel application support integration testing and make application more robust.

## Environment

### The .env.testing Environment File

In addition, you may create a `.env.testing` file in the root of your project. This file will be used instead of the `.env` file when running `go test` with the `--env` option, note, this option needs to follow the test directory, for example:

```
go test ./... --env=.env.testing
go test ./... -e=.env.testing
```

### `TestCase` Struct

There is a `TestCase` Struct in Goravel, the Struct will provider some convenient test methods in the future, in addition, there is an `init` method in the same file, this method guides the registration of the Goravel application before running the test, and you can add logic to this method that needs to be run before running the test.

## Creating Tests

To create a new test case, use the `make:test` Artisan command:

```go
go run . artisan make:test feature/UserTest
```

By default we write our test cases using the `suit` function of the [stretchr/testify](https://github.com/stretchr/testify) package, this function supports the configuration of pre-test, post-test, sub-test and assertion, etc., which can make test cases more organized. For more details, please see the official documentation.

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

## HTTP Tests

Please use third-party packages such as `net/http` to initiate HTTP request during testing, in the future, Goravel plans to extend `Get`, `Post` and other methods in `TestCase` Struct to facilitate requests and assertions.

## Database Testing

Goravel model factories and Seeders can easily create test database records for the application's model.

### Factories

When testing, you may need to insert a few records into your database before executing your test. Instead of manually specifying the value of each column when you create this test data, Goravel allows you to define a set of default attributes for each of your models using [factories](../orm/factories.md).

```go
var user models.User
err := facades.Orm().Factory().Create(&user)
```

### Running Seeders

If you would like to use [database seeders](../orm/seeding.md) to populate your database during a feature test, you may invoke the `Seed` method. By default, the `Seed` method will execute the `DatabaseSeeder`, which should execute all of your other seeders. Alternatively, you pass a specific seeder struct to the `Seed` method:

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

### Using Docker

Because `go test` is tested in parallel between different packages, therefore, so you can't refresh database in a test cases when using a local database for testing, otherwise, it may have an impact on other test cases running in parallel. For this situation, Goravel supports testing with Docker, the database image created by Docker can be used independently between different packages.

> Due to the limited support of the Docker image for the windows system, currently, the Docker test can only be run in non-windows environments.

#### Initiate Docker

You can use the `Database` method to initiate a database image based on the default database connection, or you can pass the database connection name to this method to initiate other database images:

```go
database, err := facades.Testing().Docker().Database()
database, err := facades.Testing().Docker().Database("postgresql")
```

The database images supported by default:

| Database    | Image Link                                                                                         | Version     |
| --------    | --------------------------------------------------                                                 | ---------   |
| Mysql       | [https://hub.docker.com/_/mysql](https://hub.docker.com/_/mysql)                                   | latest      |
| Postgresql  | [https://hub.docker.com/_/postgres](https://hub.docker.com/_/postgres)                             | latest      |
| Sqlserver   | [https://hub.docker.com/_/microsoft-mssql-server](https://hub.docker.com/_/microsoft-mssql-server) | latest      |
| Sqlite      | [https://hub.docker.com/r/nouchka/sqlite3](https://hub.docker.com/r/nouchka/sqlite3)               | latest      |

You can also use the `Image` method to customize the image:

```go
import contractstesting "github.com/goravel/framework/contracts/testing"

database.Image(contractstesting.Image{
  Repository: "mysql",
  Tag:        "5.7",
  Env: []string{
    "MYSQL_ROOT_PASSWORD=123123",
    "MYSQL_DATABASE=goravel",
  },
  Timeout: 1000,
})
```

#### Build Image

After the image is initiated, you can use the `Build` method to build the image:

```go
err := database.Build()
```

At this time, you can use the `docker ps` command to see that the image is already running on the system, and you can obtain the configuration information of database through the `Config` method to facilitate connection debugging:

```go
config := database.Config()
```

#### Running Seeders

If you wish to use [seeder](../orm/seeding.md) to populate the database during testing, you can call the `Seed` method. By default, the `Seed` method will execute the `DatabaseSeeder`, which should execute all of your other seeders. Alternatively, you pass a specific seeder struct to the `Seed` method:

```go
err := database.Seed()
err := database.Seed(&seeders.UserSeeder{})
```

#### Refresh Database

Because the test cases in the same package are executed serially, refreshing the database after a single test case run will have no negative impact, we can use the `RefreshDatabase` method to do this:

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

#### Uninstall Image

After the test cases in the sub-package are executed, the image will be uninstalled automatically in one hour, you can also use the `Clear` method to uninstall the image manually.

```go
err := database.Clear()
```

#### Example

We can create a `TestMain` method in the sub-package and add the pre-logic of the test case:

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

  if err := database.Seed(); err != nil {
    panic(err)
  }

  // Execute test cases
  exit := m.Run()

  // Uninstall the image after all test cases have been run
  if err := database.Clear(); err != nil {
    panic(err)
  }

  os.Exit(exit)
}
```

> For more usage of the TestMain method, see [Official Documentation](https://pkg.go.dev/testing#hdr-Main).
