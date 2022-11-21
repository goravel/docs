# 文件存储

[[toc]]

## 简介 

Goravel 为使用本地文件系统、Amazon S3、Aliyun OSS 和 Tencent COS 提供了简单易用的驱动程序。 更棒的是，由于每个系统的 API 保持不变，所以在这些存储选项之间切换是非常简单的。

## 配置

配置文件位于 `config/filesystems.go`。在这个文件中你可以配置所有的「磁盘」，每个磁盘代表特定的存储驱动及存储位置。每种支持的驱动程序的示例配置都包含在配置文件中。因此，只需要修改配置即可应用你的存储偏好和凭据。

> 技巧：你可以配置任意数量的磁盘，甚至可以添加多个使用相同驱动的磁盘。

## 获取磁盘实例

`Storage` Facade 可用于与所有已配置的磁盘进行交互。例如，你可以使用 Facade 中的 `Put` 方法将头像存储到默认磁盘。如果你使用 `Storage` Facade 时并没有使用 `Disk` 方法，那么所有的方法调用将会自动传递给默认的磁盘：

```go
facades.Storage.Put("avatars/1.png", "Contents")
```

如果应用要与多个磁盘进行交互，可使用 `Storage` Facade 中的 `Disk` 方法对特定磁盘上的文件进行操作：

```go
facades.Storage.Disk("s3").Put("avatars/1.png", "Contents")
```

## 检索文件

`Get` 方法可以用于获取文件的内容，此方法返回该文件的原始字符串内容。切记，所有文件路径的指定都应该相对于该磁盘所配置的 `root` 目录：

```go
contents := facades.Storage.Get("file.jpg")
```

`Exists` 方法可以用来判断磁盘上是否存在指定的文件：

```go
if (facades.Storage.Disk("s3").Exists("file.jpg")) {
    // ...
}
```

`Missing` 方法可以用来判断磁盘上是否缺少指定的文件：

```go
if (facades.Storage.Disk('s3').Missing("file.jpg")) {
    // ...
}
```

### 文件地址

你可以使用 `Url` 方法来获取给定文件的 url。如果你使用的是 `local` 驱动程序，这通常会将 `/storage` 添加到给定的路径，并返回文件的相对 URL。如果你使用的是 `s3` 驱动程序，则会返回完全限定的远程 URL：

```go
url := facades.Storage.Url("file.jpg')
```

> 注意：当使用 `local` 驱动时， `Url` 的返回值不是 url 编码的。因此，我们建议总是使用可以创建有效 url 的名称来存储文件。

#### 临时地址

使用 `TemporaryUrl` 方法，你可以为使用非本地驱动程序存储的文件创建临时 URL。此方法接受一个路径和一个 `time` 实例，指定 URL 何时过期：

```go
url, err := facades.Storage.TemporaryUrl(
    "file.jpg", time.Now().Add(5*time.Minute)
)
```

### 文件 Metadata 信息

除了读写文件，Goravel 还可以提供有关文件自身的信息。例如，`Size` 方法可用于获取文件的大小 (以字节为单位)：

```go
size := facades.Storage.Size("file.jpg")
```

### 文件路径

可以使用 `Path` 方法获取给定文件的路径。如果你使用的是 `local` 驱动程序，这将返回文件的绝对路径。如果你使用的是 `s3` 等驱动程序，此方法将返回 bucket 中文件的相对路径：

```go
path := facades.Storage.Path("file.jpg")
```

## 储存文件

可以使用 `Put` 方法将文件内容存储在磁盘上。请记住，应相对于为磁盘配置的根目录指定所有文件路径：

```go
err := facades.Storage.Put("file.jpg", contents)
```

也可以使用 `PutFile` 和 `PutFileAs` 直接将文件保存在磁盘上：

```go
// 自动生成一个唯一文件名 ...
file, err := NewFile("./logo.png")
path := facades.Storage.PutFile("photos", file)

// 手动指定文件名 ...
file, err := NewFile("./logo.png")
path := facades.Storage.PutFileAs("photos", file, "photo.jpg")
```

关于 `PutFile` 和 `PutFileAs` 方法，有一些重要的事情需要注意。那就是，我们只指定了一个目录名，而没有指定文件名。默认情况下，`PutFile` 方法将生成一个唯一的 ID 作为文件名。文件的扩展名将通过检查文件的 MIME 类型来确定。这两个方法将返回文件的路径，以便你可以将路径（包括生成的文件名）存储在数据库中。

### 复制 / 移动文件

`Copy` 方法可用于将现有文件复制到磁盘上的新位置，而 `Move` 方法可用于重命名现有文件或将其移动到新位置：

```go
err := facades.Storage.Copy('old/file.jpg', 'new/file.jpg')

err := facades.Storage.Move('old/file.jpg', 'new/file.jpg')
```

### 文件上传

在 web 应用程序中，存储文件最常见的用例之一是存储用户上传的文件，如照片和文档。Goravel 使得在上传的文件实例上使用 `Store` 方法存储上传的文件变得非常容易。可以在要存储的上传文件上调用 `Store` 方法：

```go
func (r *UserController) Show(ctx http.Context) {
	file, err := ctx.Request().File("avatar")
	path, err := file.Store("avatars")
}
```

关于这个例子，有一些重要的事情需要注意。那就是，我们只指定了一个目录名，而不是文件名。默认情况下，`Store` 方法将生成一个唯一的 ID 作为文件名。文件的扩展名将通过检查文件的 MIME 类型来确定。文件的路径将由 `Store` 方法返回，因此你可以将路径（包括生成的文件名）存储在数据库中。

你还可以调用 `Storage` facade 上的 `PutFile` 方法来执行与上述示例相同的文件存储操作：

```go
file, err := NewFile("./logo.png")
path := facades.Storage.PutFile("photos", file)
```

### 指定一个文件名

如果不希望文件名自动分配给存储的文件，可以使用 `StoreAs` 方法，该方法接收路径、文件名作为参数：

```go
file, err := ctx.Request().File("avatar")
path, err := file.StoreAs("avatars", "name")
```

你还可以在 `Storage` facade 上使用 `PutFileAs` 方法，该方法将执行与上述示例相同的文件存储操作：

```go
file, err := NewFile("./logo.png")
path := facades.Storage.PutFileAs("photos", file, "name")
```

> `StoreAs` 与 `PutFileAs` 指定的文件名如果不带后缀，将根据文件的 MIME 自动添加后缀；否则，直接使用指定的文件名。

### 指定一个磁盘

默认情况下，`Store` 等方法将使用默认磁盘。如果要指定另一个磁盘，请使用 `Disk` 方法：

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

但是，请记住，`GetClientOriginalName` 和 `GetClientOriginalExtension` 方法被认为是不安全的，因为文件名和扩展名可能被恶意用户篡改。出于这个原因，你应该更喜欢 `HashName` 和 `Extension` 方法来获取给定文件上传的名称和扩展名：

```go
file, err := ctx.Request().File("avatar")

name := file.HashName()// 生成一个唯一的随机名称...
extension, err := file.Extension()// 根据文件的 MIME 类型确定文件的扩展名...
```

## 删除文件

`Delete` 方法接收一个文件名或一个文件名数组来将其从磁盘中删除：

```go
err := facades.Storage.Delete("file.jpg")
err := facades.Storage.Delete("file.jpg", "file2.jpg")
```

如果有必要，你可以指定删除的文件的磁盘：

```go
err := facades.Storage.Disk("s3").Delete("file.jpg")
```

## 目录

### 创建一个目录

`MakeDirectory` 方法可递归的创建指定的目录：

```go
err := facades.Storage.MakeDirectory(directory)
```

### 删除一个目录

最后，`DeleteDirectory` 方法可用于删除一个目录及其下所有的文件：

```go 
err := facades.Storage.DeleteDirectory(directory)
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
	WithContext(ctx context.Context) Driver
	Put(file, content string) error
	PutFile(path string, source File) (string, error)
	PutFileAs(path string, source File, name string) (string, error)
	Get(file string) (string, error)
	Size(file string) (int64, error)
	Path(file string) string
	Exists(file string) bool
	Missing(file string) bool
	Url(file string) string
	TemporaryUrl(file string, time time.Time) (string, error)
	Copy(oldFile, newFile string) error
	Move(oldFile, newFile string) error
	Delete(file ...string) error
	MakeDirectory(directory string) error
	DeleteDirectory(directory string) error
}
```
