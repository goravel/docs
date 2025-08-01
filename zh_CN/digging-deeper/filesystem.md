# 文件存储

[[toc]]

## 简介

Goravel 为使用本地文件系统、Amazon S3、Aliyun OSS、Tencent COS、Minio 和 Cloudinary 提供了简单易用的驱动程序。 更棒的是，由于每个系统的 API 保持不变，所以在这些存储选项之间切换是非常简单的。框架自带 `local` 驱动，如需其他驱动，请查看对应的独立扩展包： Even better, switching between these storage options between your local development machine and production server is amazingly simple as the API remains the same for each system. Goravel comes with a `local` driver, for other drivers, please check the corresponding independent extension package:

| 驱动         | Link                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| S3         | [https://github.com/goravel/s3](https://github.com/goravel/s3)                 |
| OSS        | [https://github.com/goravel/oss](https://github.com/goravel/oss)               |
| COS        | [https://github.com/goravel/cos](https://github.com/goravel/cos)               |
| Minio      | [https://github.com/goravel/minio](https://github.com/goravel/minio)           |
| Cloudinary | [https://github.com/goravel/cloudinary](https://github.com/goravel/cloudinary) |

## 配置

配置文件位于 `config/filesystems.go`。在这个文件中你可以配置所有的「磁盘」，每个磁盘代表特定的存储驱动及存储位置。 Within this file, you may configure all of your filesystem "disks", each disk represents a particular storage driver and storage location.

> 技巧：你可以配置任意数量的磁盘，甚至可以添加多个使用相同驱动的磁盘。

### 本地驱动

When using the `local` driver, all file operations are relative to the `root` directory defined in your `filesystems` configuration file. By default, this value is set to the `storage/app` directory. Therefore, the following method would write to `storage/app/example.txt`:

```go
facades.Storage().Put("example.txt", "Contents")
```

### 公共磁盘

在 `filesystems` 配置文件中定义的 `public` 磁盘适用于要公开访问的文件。默认情况下，`public` 磁盘使用 `local` 驱动，并且将这些文件存储在 `storage/app/public` 目录下。要使这些文件可从 web 访问，可以创建一个文件路由： 使用 `local` 驱动时，所有文件操作都与 `filesystems` 配置文件中定义的 `root` 目录相关。 默认情况下，此值设置为 `storage/app` 目录。因此，以下方法会把文件存储在 `storage/app/example.txt` 中： If you want to visit these file from web, you can create a file routing:

```go
facades.Route().Static("storage", "./storage/app/public")
```

## 获取磁盘实例

The `Storage` facade may be used to interact with any of your configured disks. For example, you may use the `Put` method on the facade to store an avatar on the default disk. If you call methods on the `Storage` facade without first calling the `Disk` method, the method will automatically be passed to the default disk:

```go
facades.Storage().Put("avatars/1.png", "Contents")
```

如果应用要与多个磁盘进行交互，可使用 `Storage` Facade 中的 `Disk` 方法对特定磁盘上的文件进行操作：

```go
facades.Storage().Disk("s3").Put("avatars/1.png", "Contents")
```

## 注入 Context

```go
facades.Storage().WithContext(ctx).Put("avatars/1.png", "Contents")
```

## 检索文件

The `Get` method may be used to retrieve the contents of a file. The raw string contents of the file will be returned by the method. Remember, all file paths should be specified relative to the disk's `root` location:

```go
contents := facades.Storage().Get("file.jpg")
```

`Exists` 方法可以用来判断磁盘上是否存在指定的文件：

```go
if (facades.Storage().Disk("s3").Exists("file.jpg")) {
    // ...
}
```

`Missing` 方法可以用来判断磁盘上是否缺少指定的文件：

```go
if (facades.Storage().Disk("s3").Missing("file.jpg")) {
    // ...
}
```

### 文件地址

You may use the `Url` method to get the URL for a given file. If you are using the `local` driver, this will typically just prepend `/storage` to the given path and return a relative URL to the file. 你可以使用 `Url` 方法来获取给定文件的 url。如果你使用的是 `local` 驱动程序，这通常会将 `/storage` 添加到给定的路径，并返回文件的相对 URL。如果你使用的是 `s3` 驱动程序，则会返回完整路径的远程 URL：

```go
url := facades.Storage().Url("file.jpg")
```

> 注意：当使用 `local` 驱动时， `Url` 的返回值不是 url 编码的。因此，我们建议总是使用可以创建有效 url 的名称来存储文件。 For this reason, we recommend always storing your files using names that will create valid URLs.

#### 临时地址

使用 `TemporaryUrl` 方法，你可以为使用非本地驱动程序存储的文件创建临时 URL。此方法接受一个路径和一个 `time` 实例，指定 URL 何时过期： This method accepts a path and a `Time` instance specifying when the URL should expire:

```go
url, err := facades.Storage().TemporaryUrl(
    "file.jpg", time.Now().Add(5*time.Minute)
)
```

### 文件 Metadata 信息

除了读写文件，Goravel 还可以提供有关文件自身的信息：

```go
size := facades.Storage().Size("file.jpg")
```

`LastModified` 方法返回上次修改文件时的时间：

```go
time, err := facades.Storage().LastModified("file.jpg")
```

`MimeType` 方法返回文件的 MINE 类型：

```go
mime, err := facades.Storage().MimeType("file.jpg")
```

也可以使用 `NewFile` 方法获取：

```go
import "github.com/goravel/framework/filesystem"

file, err := filesystem.NewFile("./logo.png")
size, err := file.Size()
lastModified, err := file.LastModified()
mime, err := file.MimeType()
```

### 文件路径

To obtain the path for a specific file, you can utilize the `Path` method. When using the `local` driver, this will provide you with the relative path to the file. 可以使用 `Path` 方法获取给定文件的路径。如果你使用的是 `local` 驱动程序，这将返回文件的相对路径。如果你使用的是 `s3` 等驱动程序，此方法将返回 bucket 中文件的相对路径：

```go
path := facades.Storage().Path("file.jpg")
```

## 储存文件

The `Put` method may be used to store file contents on a disk. 可以使用 `Put` 方法将文件内容存储在磁盘上。请记住，应相对于为磁盘配置的根目录指定所有文件路径：

```go
err := facades.Storage().Put("file.jpg", contents)
```

也可以使用 `PutFile` 和 `PutFileAs` 直接将文件保存在磁盘上：

```go
import "github.com/goravel/framework/filesystem"

// 自动生成一个唯一文件名 ...
file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFile("photos", file)

// 手动指定文件名 ...
file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFileAs("photos", file, "photo.jpg")
```

There are a few important things to note about the `PutFile` method. Note that we only specified a directory name and not a filename. By default, the `PutFile` method will generate a unique ID to serve as the filename. The file's extension will be determined by examining the file's MIME type. The path to the file will be returned by the `PutFile` method so you can store the path, including the generated filename, in your database.

### 复制 / 移动文件

`Copy` 方法可用于将现有文件复制到磁盘上的新位置，而 `Move` 方法可用于重命名现有文件或将其移动到新位置：

```go
err := facades.Storage().Copy("old/file.jpg", "new/file.jpg")

err := facades.Storage().Move("old/file.jpg", "new/file.jpg")
```

### 文件上传

In web applications, one of the most common use cases for storing files is storing user-uploaded files such as photos and documents. 在 web 应用程序中，存储文件最常见的用例之一是存储用户上传的文件，如照片和文档。Goravel 使得在上传的文件实例上使用 `Store` 方法存储上传的文件变得非常容易。可以在要存储的上传文件上调用 `Store` 方法： Call the `Store` method with the path at which you wish to store the uploaded file:

```go
func (r *UserController) Show(ctx http.Context) {
  file, err := ctx.Request().File("avatar")
  path, err := file.Store("avatars")
}
```

There are a few important things to note about this example. Note that we only specified a directory name, not a filename. By default, the `Store` method will generate a unique ID to serve as the filename. The file's extension will be determined by examining the file's MIME type. The path to the file will be returned by the `Store` method so you can store the path, including the generated filename, in your database.

你还可以调用 `Storage` facade 上的 `PutFile` 方法来执行与上述示例相同的文件存储操作：

```go
import "github.com/goravel/framework/filesystem"

file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFile("photos", file)
```

### 指定一个文件名

如果不希望文件名自动分配给存储的文件，可以使用 `StoreAs` 方法，该方法接收路径、文件名作为参数：

```go
file, err := ctx.Request().File("avatar")
path, err := file.StoreAs("avatars", "name")
```

你还可以在 `Storage` facade 上使用 `PutFileAs` 方法，该方法将执行与上述示例相同的文件存储操作：

```go
import "github.com/goravel/framework/filesystem"

file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFileAs("photos", file, "name")
```

> `StoreAs` 与 `PutFileAs` 指定的文件名如果不带后缀，将根据文件的 MIME 自动添加后缀；否则，直接使用指定的文件名。

### 指定一个磁盘

By default, this uploaded file's `Store` method will use your default disk. 默认情况下，`Store` 等方法将使用默认磁盘。如果要指定另一个磁盘，请使用 `Disk` 方法：

```go
func (r *UserController) Show(ctx http.Context) {
  file, err := ctx.Request().File("avatar")
  path, err := file.Disk("s3").Store("avatars")
}
```

### 其他上传文件信息

如果你想获取上传文件的原始名称和扩展名，可以使用 `GetClientOriginalName` 和 `GetClientOriginalExtension` 方法：

```go
file, err := ctx.Request().File("avatar")

name := file.GetClientOriginalName()
extension := file.GetClientOriginalExtension()
```

但是，请记住，`GetClientOriginalName` 和 `GetClientOriginalExtension` 方法被认为是不安全的，因为文件名和扩展名可能被恶意用户篡改。出于这个原因，你应该更喜欢 `HashName` 和 `Extension` 方法来获取给定文件上传的名称和扩展名： For this reason, you should typically prefer the `HashName` and `Extension` methods to get a name and an extension for the given file upload:

```go
file, err := ctx.Request().File("avatar")

name := file.HashName() // 生成一个唯一的随机名称...
extension, err := file.Extension() // 根据文件的 MIME 类型确定文件的扩展名...
```

## 删除文件

`Delete` 方法接收一个文件名或一个文件名数组来将其从磁盘中删除：

```go
err := facades.Storage().Delete("file.jpg")
err := facades.Storage().Delete("file.jpg", "file2.jpg")
```

如果有必要，你可以指定删除的文件的磁盘：

```go
err := facades.Storage().Disk("s3").Delete("file.jpg")
```

## 目录

### 获取目录下所有的文件

The `Files` method returns a slice of all of the files in a given directory. `Files` 将以数组的形式返回给定目录下所有的文件。如果你想要检索给定目录的所有文件及其子目录的所有文件，你可以使用 `AllFiles` 方法：

```go
files, err := facades.Storage().Disk("s3").Files("directory")
files, err := facades.Storage().Disk("s3").AllFiles("directory")
```

### Get All Directories Within A Directory

The `Directories` method returns a slice of all the directories within a given directory. `Directories` 方法以数组的形式返回给定目录中的所有目录。此外，你还可以使用 `AllDirectories` 方法递归地获取给定目录中的所有目录及其子目录中的目录：

```go
directories, err := facades.Storage().Disk("s3").Directories("directory")
directories, err := facades.Storage().Disk("s3").AllDirectories("directory")
```

### 创建一个目录

`MakeDirectory` 方法可递归的创建指定的目录：

```go
err := facades.Storage().MakeDirectory(directory)
```

### 删除一个目录

最后，`DeleteDirectory` 方法可用于删除一个目录及其下所有的文件：

```go
err := facades.Storage().DeleteDirectory(directory)
```

## 自定义文件系统

在 `config/filesystems.go` 文件中设置自定义驱动：

```go
"custom": map[string]any{
  "driver": "custom",
  "via":    filesystems.NewLocal(),
},
```

其中 `via` 配置项实现 `github.com/goravel/framework/contracts/filesystem/Driver` 接口：

```go
type Driver interface {
  AllDirectories(path string) ([]string, error)
  AllFiles(path string) ([]string, error)
  Copy(oldFile, newFile string) error
  Delete(file ...string) error
  DeleteDirectory(directory string) error
  Directories(path string) ([]string, error)
  Exists(file string) bool
  Files(path string) ([]string, error)
  Get(file string) (string, error)
  GetBytes(file string) ([]byte, error)
  LastModified(file string) (time.Time, error)
  MakeDirectory(directory string) error
  MimeType(file string) (string, error)
  Missing(file string) bool
  Move(oldFile, newFile string) error
  Path(file string) string
  Put(file, content string) error
  PutFile(path string, source File) (string, error)
  PutFileAs(path string, source File, name string) (string, error)
  Size(file string) (int64, error)
  TemporaryUrl(file string, time time.Time) (string, error)
  WithContext(ctx context.Context) Driver
  Url(file string) string
}
```

> 注意：由于注册驱动时配置信息尚未加载完毕，所以在自定义驱动中，请使用 `facades.Config().Env` 获取配置信息。
