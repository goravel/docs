# 辅助函数

[[toc]]

## 可用方法

### 路径

#### `path.App()`

`path.App()` 函数返回 app 目录的路径。您也可以用来生成应用目录下特定文件的路径：

```go
import "github.com/goravel/framework/support/path"

path := path.App()
path := path.App("http/controllers/controller.go")
```

#### `path.Base()`

`path.Base()` 函数返回项目根目录的路径。您也可以用来生成项目根目录下特定文件的路径：

```go
path := path.Base()
path := path.Base("'vendor/bin'")
```

#### `path.Config()`

`path.Config()` 函数返回项目配置目录 (config) 的路径。您也可以用来生成应用配置目录中的特定文件的路径：

```go
path := path.Config()
path := path.Config("app.go")
```

#### `path.Database()`

`path.Database()` 函数返回 `database` 目录的路径。您也可以用来生成数据库目录下特定文件的路径：

```go
path := path.Database()
path := path.Database("factories/user_factory.go")
```

#### `path.Storage()`

`path.Storage()` 函数返回 `storage` 目录的路径。您也可以用来生成位于资源路径中的特定路径：

```go
path := path.Storage()
path := path.Storage("app/file.txt")
```

#### `path.Public()`

`path.Public()` 函数返回 `public` 目录的路径。您也可以用来生成 `public` 目录下特定文件的路径：

```go
path := path.Public()
path := path.Public("css/app.css")
```
