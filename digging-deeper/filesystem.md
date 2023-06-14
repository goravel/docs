# File Storage

[[toc]]

## Introduction

The Goravel provides simple drivers for working with local filesystems, Amazon S3, Aliyun OSS and Tencent COS. Even better, it's amazingly simple to switch between these storage options between your local development machine and production server as the API remains the same for each system. Goravel comes with `local` driver, for other drivers, please check the corresponding independent extension package:

| Driver       | Link           |
| -----------  | -------------- |
| S3           | https://github.com/goravel/s3     |
| OSS          | https://github.com/goravel/oss     |
| COS          | https://github.com/goravel/cos     |
| Minio        | https://github.com/goravel/minio     |

## Configuration

Goravel's filesystem configuration file is located at `config/filesystems.go`. Within this file, you may configure all of your filesystem "disks", each disk represents a particular storage driver and storage location.

> You may configure as many disks as you like and may even have multiple disks that use the same driver.

## Obtaining Disk Instances

The `Storage` facade may be used to interact with any of your configured disks. For example, you may use the `Put` method on the facade to store an avatar on the default disk. If you call methods on the `Storage` facade without first calling the `Disk` method, the method will automatically be passed to the default disk:

```go
facades.Storage.Put("avatars/1.png", "Contents")
```

If your application interacts with multiple disks, you may use the `Disk` method on the `Storage` facade to work with files on a particular disk:

```go
facades.Storage.Disk("s3").Put("avatars/1.png", "Contents")
```

## Inject Context

```go
facades.Storage.WithContext(ctx).Put("avatars/1.png", "Contents")
```

## Retrieving Files

The `Get` method may be used to retrieve the contents of a file. The raw string contents of the file will be returned by the method. Remember, all file paths should be specified relative to the disk's `root` location:

```go
contents := facades.Storage.Get("file.jpg")
```

The `Exists` method may be used to determine if a file exists on the disk:

```go
if (facades.Storage.Disk("s3").Exists("file.jpg")) {
    // ...
}
```

The `Missing` method may be used to determine if a file is missing from the disk:

```go
if (facades.Storage.Disk("s3").Missing("file.jpg")) {
    // ...
}
```

### File URLs

You may use the `Url` method to get the URL for a given file. If you are using the `local` driver, this will typically just prepend `/storage` to the given path and return a relative URL to the file. If you are using the `s3` driver, the fully qualified remote URL will be returned:

```go
url := facades.Storage.Url("file.jpg")
```

> When using the `local` driver, the return value of `Url` is not URL encoded. For this reason, we recommend always storing your files using names that will create valid URLs.

#### Temporary URLs

Using the `TemporaryUrl` method, you may create temporary URLs to files stored using the Non-local driver. This method accepts a path and a `Time` instance specifying when the URL should expire:

```go
url, err := facades.Storage.TemporaryUrl(
    "file.jpg", time.Now().Add(5*time.Minute)
)
```

### File Metadata

In addition to reading and writing files, Goravel can also provide information about the files themselves:

```go
size := facades.Storage.Size("file.jpg")
```

The `LastModified` method returns the last modified time of file:

```go
time, err := facades.Storage.LastModified("file.jpg")
```

The MIME type of a given file may be obtained via the `MimeType` method:

```go
mime, err := facades.Storage.MimeType("file.jpg")
```

Also can use the `NewFile` method:

```go
import "github.com/goravel/framework/filesystem"

file, err := filesystem.NewFile("./logo.png")
size, err := file.Size()
lastModified, err := file.LastModified()
mime, err := file.MimeType()
```

### File Paths

You may use the `Path` method to get the path for a given file. If you are using the `local` driver, this will return the absolute path to the file. If you are using such as the `s3` driver, this method will return the relative path to the file in the bucket:

```go
path := facades.Storage.Path("file.jpg")
```

## Storing Files

The `Put` method may be used to store file contents on a disk. Remember, all file paths should be specified relative to the "root" location configured for the disk:

```go
err := facades.Storage.Put("file.jpg", contents)
```

You can also use `PutFile` and `PutFileAs` to save files directly on disk:

```go
import "github.com/goravel/framework/filesystem"

// Automatically generate a unique ID for filename...
file, err := filesystem.NewFile("./logo.png")
path := facades.Storage.PutFile("photos", file)

// Manually specify a filename...
file, err := filesystem.NewFile("./logo.png")
path := facades.Storage.PutFileAs("photos", file, "photo.jpg")
```

There are a few important things to note about the `PutFile` method. Note that we only specified a directory name and not a filename. By default, the `PutFile` method will generate a unique ID to serve as the filename. The file's extension will be determined by examining the file's MIME type. The path to the file will be returned by the `PutFile` method so you can store the path, including the generated filename, in your database.

### Copying & Moving Files

The `Copy` method may be used to copy an existing file to a new location on the disk, while the `Move` method may be used to rename or move an existing file to a new location:

```go
err := facades.Storage.Copy("old/file.jpg", "new/file.jpg")

err := facades.Storage.Move("old/file.jpg", "new/file.jpg")
```

### File Uploads

In web applications, one of the most common use-cases for storing files is storing user uploaded files such as photos and documents. Goravel makes it very easy to store uploaded files using the `Store` method on an uploaded file instance. Call the `Store` method with the path at which you wish to store the uploaded file:

```go
func (r *UserController) Show(ctx http.Context) {
  file, err := ctx.Request().File("avatar")
  path, err := file.Store("avatars")
}
```

There are a few important things to note about this example. Note that we only specified a directory name, not a filename. By default, the `Store` method will generate a unique ID to serve as the filename. The file's extension will be determined by examining the file's MIME type. The path to the file will be returned by the `Store` method so you can store the path, including the generated filename, in your database.

You may also call the `PutFile` method on the `Storage` facade to perform the same file storage operation as the example above:

```go
import "github.com/goravel/framework/filesystem"

file, err := filesystem.NewFile("./logo.png")
path := facades.Storage.PutFile("photos", file)
```

### Specifying A File Name

If you do not want a filename to be automatically assigned to your stored file, you may use the `StoreAs` method, which receives the path, the filename, and the (optional) disk as its arguments:

```go
file, err := ctx.Request().File("avatar")
path, err := file.StoreAs("avatars", "name")
```

You may also use the `PutFileAs` method on the Storage facade, which will perform the same file storage operation as the example above:

```go
import "github.com/goravel/framework/filesystem"

file, err := filesystem.NewFile("./logo.png")
path := facades.Storage.PutFileAs("photos", file, "name")
```

> If the file name specified by `StoreAs` and `PutFileAs` don't have a suffix, the suffix is automatically added based on the MIME of the file; otherwise, the specified file name is used directly.

### Specifying A Disk

By default, this uploaded file's `Store` method will use your default disk. If you would like to specify another disk, please use the `Disk` method:

```go
func (r *UserController) Show(ctx http.Context) {
  file, err := ctx.Request().File("avatar")
  path, err := file.Disk("s3").Store("avatars")
}
```

### Other Uploaded File Information

If you would like to get the original name and extension of the uploaded file, you may do so using the `GetClientOriginalName` and `GetClientOriginalExtension` methods:

```go
file, err := ctx.Request().File("avatar")

name := file.GetClientOriginalName()
extension := file.GetClientOriginalExtension()
```

However, keep in mind that the `GetClientOriginalName` and `GetClientOriginalExtension` methods are considered unsafe, as the file name and extension may be tampered with by a malicious user. For this reason, you should typically prefer the `HashName` and `Extension` methods to get a name and an extension for the given file upload:

```go
file, err := ctx.Request().File("avatar")

name := file.HashName()// Generate a unique, random name...
extension, err := file.Extension()// Determine the file's extension based on the file's MIME type...
```

## Deleting Files

The `Delete` method accepts a single filename or an array of files to delete:

```go
err := facades.Storage.Delete("file.jpg")
err := facades.Storage.Delete("file.jpg", "file2.jpg")
```

If necessary, you may specify the disk that the file should be deleted from:

```go
err := facades.Storage.Disk("s3").Delete("file.jpg")
```

## Directories

### Get All Files Within A Directory
The `Files` method returns an slice of all of the files in a given directory. If you would like to retrieve a list of all files within a given directory including all subdirectories, you may use the `AllFiles` method:

```go
files, err := facades.Storage.Disk("s3").Files("directory")
files, err := facades.Storage.Disk("s3").AllFiles("directory")
```

### Get All Directories Within A Directory

The `Directories` method returns an slice of all the directories within a given directory. Additionally, you may use the `AllDirectories` method to get a list of all directories within a given directory and all of its subdirectories:

```go
directories, err := facades.Storage.Disk("s3").Directories("directory")
directories, err := facades.Storage.Disk("s3").AllDirectories("directory")
```

### Create A Directory

The `MakeDirectory` method will create the given directory, including any needed subdirectories:

```go
err := facades.Storage.MakeDirectory(directory)
```

### Delete A Directory

Finally, the `DeleteDirectory` method may be used to remove a directory and all of its files:

```go 
err := facades.Storage.DeleteDirectory(directory)
```

## Custom Filesystems

You can set the `custom` driver in the `config/filesystems.go` file.

```go
"custom": map[string]any{
  "driver": "custom",
  "via":    filesystems.NewLocal(),
},
```

You need to implement the `github.com/goravel/framework/contracts/filesystem/Driver` interface in the `via` configuration item.

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
  MakeDirectory(directory string) error
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

> Note: Since the configuration has not been loaded when the custom driver is registered, so please use `facades.Config.Env` to obtain the configuration in the custom driver.

<CommentService/>
