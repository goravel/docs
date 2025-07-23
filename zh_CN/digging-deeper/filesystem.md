# 文件存储

[[toc]]

## 简介

Goravel 为使用本地文件系统、Amazon S3、Aliyun OSS、Tencent COS、Minio 和 Cloudinary 提供了简单易用的驱动程序。 更棒的是，由于每个系统的 API 保持不变，所以在这些存储选项之间切换是非常简单的。框架自带 `local` 驱动，如需其他驱动，请查看对应的独立扩展包： Even better, switching between these storage options between your local development machine and production server is amazingly simple as the API remains the same for each system. Goravel 提供了简单的驱动程序，用于处理本地文件系统、Amazon S3、阿里云 OSS、腾讯云 COS、Minio 和 Cloudinary。 更好的是，在本地开发机器和生产服务器之间切换这些存储选项非常简单，因为每个系统的 API 保持一致。 Goravel 自带 `local` 驱动程序，对于其他驱动程序，请查看相应的独立扩展包：

| 驱动程序       | 链接                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| S3         | [https://github.com/goravel/s3](https://github.com/goravel/s3)                 |
| OSS        | [https://github.com/goravel/oss](https://github.com/goravel/oss)               |
| COS        | [https://github.com/goravel/cos](https://github.com/goravel/cos)               |
| Minio      | [https://github.com/goravel/minio](https://github.com/goravel/minio)           |
| Cloudinary | [https://github.com/goravel/cloudinary](https://github.com/goravel/cloudinary) |

## 配置

Goravel 的文件系统配置文件位于 `config/filesystems.go`。 在此文件中，您可以配置所有文件系统"磁盘"，每个磁盘代表一个特定的存储驱动程序和存储位置。 Within this file, you may configure all of your filesystem "disks", each disk represents a particular storage driver and storage location.

> 您可以根据需要配置任意数量的磁盘，甚至可以使用相同驱动程序配置多个磁盘。

### 本地驱动程序

当使用 `local` 驱动程序时，所有文件操作都是相对于 `filesystems` 配置文件中定义的 `root` 目录。 默认情况下，该值设置为 `storage/app` 目录。 因此，以下方法将写入 `storage/app/example.txt`： By default, this value is set to the `storage/app` directory. Therefore, the following method would write to `storage/app/example.txt`:

```go
facades.Storage().Put("example.txt", "Contents")
```

### 公共磁盘

应用程序的 `filesystems` 配置文件中包含的 `public` 磁盘用于存储可公开访问的文件。 默认情况下，`public` 磁盘使用 `local` 驱动程序，并将其文件存储在 `storage/app/public` 中。 如果你想从网页访问这些文件，可以创建一个文件路由： 使用 `local` 驱动时，所有文件操作都与 `filesystems` 配置文件中定义的 `root` 目录相关。 默认情况下，此值设置为 `storage/app` 目录。因此，以下方法会把文件存储在 `storage/app/example.txt` 中： If you want to visit these file from web, you can create a file routing:

```go
facades.Route().Static("storage", "./storage/app/public")
```

## 获取磁盘实例

The `Storage` facade may be used to interact with any of your configured disks. For example, you may use the `Put` method on the facade to store an avatar on the default disk. If you call methods on the `Storage` facade without first calling the `Disk` method, the method will automatically be passed to the default disk:

```go
facades.Storage().Put("avatars/1.png", "Contents")
```

如果您的应用程序与多个磁盘交互，您可以在 `Storage` 门面上使用 `Disk` 方法来处理特定磁盘上的文件：

```go
facades.Storage().Disk("s3").Put("avatars/1.png", "Contents")
```

## 注入上下文

```go
facades.Storage().WithContext(ctx).Put("avatars/1.png", "Contents")
```

## 检索文件

The `Get` method may be used to retrieve the contents of a file. The raw string contents of the file will be returned by the method. Remember, all file paths should be specified relative to the disk's `root` location:

```go
contents := facades.Storage().Get("file.jpg")
```

`Missing`方法可用于确定文件是否在磁盘上缺失：

```go
if (facades.Storage().Disk("s3").Exists("file.jpg")) {
    // ...
}
```

`Exists`方法可用于确定文件是否存在于磁盘上：

```go
if (facades.Storage().Disk("s3").Missing("file.jpg")) {
    // ...
}
```

### 文件URL

You may use the `Url` method to get the URL for a given file. If you are using the `local` driver, this will typically just prepend `/storage` to the given path and return a relative URL to the file. 您可以使用`Url`方法获取给定文件的URL。 如果您使用的是`local`驱动程序，这通常只会在给定路径前加上`/storage`并返回文件的相对URL。 如果您使用的是 `s3` 驱动程序，将返回完全限定的远程 URL：

```go
url := facades.Storage().Url("file.jpg")
```

> 使用 `local` 驱动时，`Url` 的返回值不会进行 URL 编码。 因此，我们建议始终使用能够创建有效 URL 的名称来存储文件。 For this reason, we recommend always storing your files using names that will create valid URLs.

#### 临时 URL

使用 `TemporaryUrl` 方法，您可以为使用非本地驱动存储的文件创建临时 URL。 此方法接受一个路径和一个指定 URL 过期时间的 `Time` 实例： This method accepts a path and a `Time` instance specifying when the URL should expire:

```go
url, err := facades.Storage().TemporaryUrl(
    "file.jpg", time.Now().Add(5*time.Minute)
)
```

### 文件元数据

除了读写文件外，Goravel 还可以提供有关文件本身的信息：

```go
size := facades.Storage().Size("file.jpg")
```

`LastModified` 方法返回文件的最后修改时间：

```go
time, err := facades.Storage().LastModified("file.jpg")
```

可以通过 `MimeType` 方法获取给定文件的 MIME 类型：

```go
mime, err := facades.Storage().MimeType("file.jpg")
```

也可以使用 `NewFile` 方法：

```go
import "github.com/goravel/framework/filesystem"

file, err := filesystem.NewFile("./logo.png")
size, err := file.Size()
lastModified, err := file.LastModified()
mime, err := file.MimeType()
```

### 文件路径

To obtain the path for a specific file, you can utilize the `Path` method. When using the `local` driver, this will provide you with the relative path to the file. 要获取特定文件的路径，可以使用 `Path` 方法。 当使用 `local` 驱动时，这将为您提供文件的绝对路径。 然而，如果您使用的是像 `s3` 这样的驱动，该方法将给出文件在存储桶中的相对路径：

```go
path := facades.Storage().Path("file.jpg")
```

## 存储文件

The `Put` method may be used to store file contents on a disk. 可以使用 `Put` 方法将文件内容存储在磁盘上。 请记住，所有文件路径都应相对于为磁盘配置的"根"位置指定：

```go
err := facades.Storage().Put("file.jpg", contents)
```

您还可以使用 `PutFile` 和 `PutFileAs` 直接将文件保存到磁盘上：

```go
import "github.com/goravel/framework/filesystem"

// 自动为文件名生成唯一的 ID...
file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFile("photos", file)

// 手动指定文件名...
file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFileAs("photos", file, "photo.jpg")
```

There are a few important things to note about the `PutFile` method. Note that we only specified a directory name and not a filename. By default, the `PutFile` method will generate a unique ID to serve as the filename. The file's extension will be determined by examining the file's MIME type. The path to the file will be returned by the `PutFile` method so you can store the path, including the generated filename, in your database.

### 复制和移动文件

`Copy` 方法可用于将现有文件复制到磁盘上的新位置，而 `Move` 方法可用于重命名或将现有文件移动到新位置：

```go
err := facades.Storage().Copy("old/file.jpg", "new/file.jpg")

err := facades.Storage().Move("old/file.jpg", "new/file.jpg")
```

### 文件上传

In web applications, one of the most common use cases for storing files is storing user-uploaded files such as photos and documents. 在 Web 应用程序中，存储文件最常见的用例之一是存储用户上传的文件，如照片和文档。 Goravel 使用上传文件实例的 `Store` 方法可以非常轻松地存储上传的文件。
使用您希望存储上传文件的路径调用 `Store` 方法： Call the `Store` method with the path at which you wish to store the uploaded file:

```go
func (r *UserController) Show(ctx http.Context) {
  file, err := ctx.Request().File("avatar")
  path, err := file.Store("avatars")
}
```

There are a few important things to note about this example. Note that we only specified a directory name, not a filename. By default, the `Store` method will generate a unique ID to serve as the filename. The file's extension will be determined by examining the file's MIME type. The path to the file will be returned by the `Store` method so you can store the path, including the generated filename, in your database.

您也可以在 `Storage` 门面上调用 `PutFile` 方法来执行与上面示例相同的文件存储操作：

```go
import "github.com/goravel/framework/filesystem"

file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFile("photos", file)
```

### 指定文件名

如果您不希望自动为存储的文件分配文件名，可以使用 `StoreAs` 方法，该方法接收路径、文件名和（可选的）磁盘作为参数：

```go
file, err := ctx.Request().File("avatar")
path, err := file.StoreAs("avatars", "name")
```

您也可以在 Storage 门面上使用 `PutFileAs` 方法，它将执行与上面示例相同的文件存储操作：

```go
import "github.com/goravel/framework/filesystem"

file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFileAs("photos", file, "name")
```

> 如果 `StoreAs` 和 `PutFileAs` 指定的文件名没有后缀，则会根据文件的 MIME 类型自动添加后缀；否则，将直接使用指定的文件名。

### 指定磁盘

默认情况下，上传文件的 `Store` 方法将使用您的默认磁盘。 如果您想指定另一个磁盘，请使用 `Disk` 方法： 默认情况下，`Store` 等方法将使用默认磁盘。如果要指定另一个磁盘，请使用 `Disk` 方法：

```go
func (r *UserController) Show(ctx http.Context) {
  file, err := ctx.Request().File("avatar")
  path, err := file.Disk("s3").Store("avatars")
}
```

### 其他上传文件信息

但是，请记住，`GetClientOriginalName` 和 `GetClientOriginalExtension` 方法被认为是不安全的，因为文件名和扩展名可能被恶意用户篡改。 因此，您通常应该优先使用 `HashName` 和 `Extension` 方法来获取给定文件上传的名称和扩展名：

```go
file, err := ctx.Request().File("avatar")

name := file.GetClientOriginalName()
extension := file.GetClientOriginalExtension()
```

如果您想获取上传文件的原始名称和扩展名，可以使用 `GetClientOriginalName` 和 `GetClientOriginalExtension` 方法： For this reason, you should typically prefer the `HashName` and `Extension` methods to get a name and an extension for the given file upload:

```go
file, err := ctx.Request().File("avatar")

name := file.HashName() // 生成一个唯一的随机名称...
extension, err := file.Extension() // 根据文件的 MIME 类型确定文件的扩展名...
```

## 删除文件

`Delete` 方法接受单个文件名或要删除的文件数组：

```go
err := facades.Storage().Delete("file.jpg")
err := facades.Storage().Delete("file.jpg", "file2.jpg")
```

如有必要，您可以指定应该从哪个磁盘删除文件：

```go
err := facades.Storage().Disk("s3").Delete("file.jpg")
```

## 目录

### 获取目录内的所有文件

The `Files` method returns a slice of all of the files in a given directory. `Files` 方法返回给定目录中所有文件的切片。 如果您想获取给定目录内包括所有子目录在内的所有文件列表，可以使用 `AllFiles` 方法：

```go
files, err := facades.Storage().Disk("s3").Files("directory")
files, err := facades.Storage().Disk("s3").AllFiles("directory")
```

### 获取目录内的所有目录

The `Directories` method returns a slice of all the directories within a given directory. `Directories` 方法返回给定目录内所有目录的切片。 此外，您可以使用 `AllDirectories` 方法获取给定目录及其所有子目录内的所有目录列表：

```go
directories, err := facades.Storage().Disk("s3").Directories("directory")
directories, err := facades.Storage().Disk("s3").AllDirectories("directory")
```

### 创建目录

`MakeDirectory` 方法将创建给定的目录，包括任何需要的子目录：

```go
err := facades.Storage().MakeDirectory(directory)
```

### 删除目录

最后，`DeleteDirectory` 方法可用于删除目录及其所有文件：

```go
err := facades.Storage().DeleteDirectory(directory)
```

## 自定义文件系统

你可以在 `config/filesystems.go` 文件中设置 `custom` 驱动。

```go
"custom": map[string]any{
  "driver": "custom",
  "via":    filesystems.NewLocal(),
},
```

你需要在 `via` 配置项中实现 `github.com/goravel/framework/contracts/filesystem/Driver` 接口。

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

> 注意：由于在注册自定义驱动时配置尚未加载，因此请在自定义驱动中使用 `facades.Config().Env` 获取配置。
