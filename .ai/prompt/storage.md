# Goravel Storage / Filesystem

## Configuration

Configure disks in `config/filesystems.go`. Default disk: `local` (stores in `storage/app`). Storage directory is configurable via `WithPaths`.

Available drivers:

| Driver | Package |
|--------|---------|
| local  | built-in |
| S3     | github.com/goravel/s3 |
| OSS    | github.com/goravel/oss |
| COS    | github.com/goravel/cos |
| Minio  | github.com/goravel/minio |

---

## Basic Usage

```go
// Default disk
err := facades.Storage().Put("file.jpg", contents)
content := facades.Storage().Get("file.jpg")

// Specific disk
facades.Storage().Disk("s3").Put("avatars/1.png", "Contents")

// Inject context
facades.Storage().WithContext(ctx).Put("avatars/1.png", "Contents")
```

---

## File Existence

```go
if facades.Storage().Disk("s3").Exists("file.jpg") {
    // file exists
}

if facades.Storage().Disk("s3").Missing("file.jpg") {
    // file missing
}
```

---

## File URLs

```go
url := facades.Storage().Url("file.jpg")

// Temporary URL (non-local drivers)
url, err := facades.Storage().TemporaryUrl("file.jpg", time.Now().Add(5*time.Minute))
```

---

## File Metadata

```go
size := facades.Storage().Size("file.jpg")
lastModified, err := facades.Storage().LastModified("file.jpg")
mime, err := facades.Storage().MimeType("file.jpg")
path := facades.Storage().Path("file.jpg")
```

Using `NewFile`:

```go
import "github.com/goravel/framework/filesystem"

file, err := filesystem.NewFile("./logo.png")
size, _ := file.Size()
lastModified, _ := file.LastModified()
mime, _ := file.MimeType()
```

---

## Storing Files

```go
// Put raw content
err := facades.Storage().Put("file.jpg", contents)

// PutFile (auto-generates unique filename)
import "github.com/goravel/framework/filesystem"
file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFile("photos", file)

// PutFileAs (specify filename)
path = facades.Storage().PutFileAs("photos", file, "photo.jpg")
```

---

## File Uploads (from HTTP request)

```go
func (r *UserController) Store(ctx http.Context) http.Response {
    file, err := ctx.Request().File("avatar")

    // Auto-generated filename
    path, err := file.Store("avatars")

    // Custom filename
    path, err = file.StoreAs("avatars", "custom-name")

    // Specific disk
    path, err = file.Disk("s3").Store("avatars")

    // Get client-provided info (unsafe — may be tampered)
    name := file.GetClientOriginalName()
    ext  := file.GetClientOriginalExtension()

    // Safe alternatives
    name = file.HashName()
    ext, err = file.Extension()  // determined from MIME type

    return ctx.Response().Success().Json(http.Json{"path": path})
}
```

---

## Copy, Move, Delete

```go
err := facades.Storage().Copy("old/file.jpg", "new/file.jpg")
err = facades.Storage().Move("old/file.jpg", "new/file.jpg")

// Delete one or multiple files
err = facades.Storage().Delete("file.jpg")
err = facades.Storage().Delete("file.jpg", "file2.jpg")
err = facades.Storage().Disk("s3").Delete("file.jpg")
```

---

## Directories

```go
// List files
files, err := facades.Storage().Disk("s3").Files("directory")
files, err = facades.Storage().Disk("s3").AllFiles("directory")

// List directories
dirs, err := facades.Storage().Disk("s3").Directories("directory")
dirs, err = facades.Storage().Disk("s3").AllDirectories("directory")

// Create/delete directories
err = facades.Storage().MakeDirectory("new/directory")
err = facades.Storage().DeleteDirectory("old/directory")
```

---

## Public Disk

Serve publicly accessible files:

```go
// config/filesystems.go: public disk uses local driver → storage/app/public

// Serve via route:
facades.Route().Static("storage", "./storage/app/public")
```

---

## Custom Driver

```go
// config/filesystems.go
"custom": map[string]any{
    "driver": "custom",
    "via":    filesystems.NewLocal(),
},
```

Implement `contracts/filesystem/Driver` interface:

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

Use `facades.Config().Env()` (not `facades.Config().Get()`) inside custom driver — config is not yet loaded when the driver is registered.
