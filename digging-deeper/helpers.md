# Helpers

[[toc]]

## Available Methods

### Paths

#### `path.App()`

The `path.App()` function returns the path to your application's app directory. You may also use the `path.App()` function to generate a path to a file relative to the application directory:

```go
import "github.com/goravel/framework/support/path"

path := path.App()
path := path.App("http/controllers/controller.go")
```

#### `path.Base()`

The `path.Base()` function returns the path to your application's root directory. You may also use the `path.Base()` function to generate a path to a given file relative to the project root directory:

```go
path := path.Base()
path := path.Base("'vendor/bin'")
```

#### `path.Config()`

The `path.Config()` function returns the path to your application's config directory. You may also use the `path.Config()` function to generate a path to a given file within the application's configuration directory:

```go
path := path.Config()
path := path.Config("app.go")
```

#### `path.Database()`

The `path.Database()` function returns the path to your application's database directory. You may also use the `path.Database()` function to generate a path to a given file within the database directory:

```go
path := path.Database()
path := path.Database("factories/user_factory.go")
```

#### `path.Storage()`

The `path.Storage()` function returns the path to your application's storage directory. You may also use the `path.Storage()` function to generate a path to a given file within the storage directory:

```go
path := path.Storage()
path := path.Storage("app/file.txt")
```

#### `path.Public()`

The `path.Public()` function returns the path to your application's public directory. You may also use the `path.Public()` function to generate a path to a given file within the public directory:

```go
path := path.Public()
path := path.Public("css/app.css")
```
