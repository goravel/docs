# Storage Facade

## Core Imports

```go
import (
    "time"
    "context"
    "github.com/goravel/framework/filesystem"
    contractsfilesystem "github.com/goravel/framework/contracts/filesystem"

    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/filesystem/storage.go`

## Available Methods

**facades.Storage():**

- `Disk(name)` Driver - switch to named disk
- `WithContext(ctx)` Driver - inject context
- `Get(path)` (string, error) - read file contents
- `GetBytes(path)` ([]byte, error) - read as bytes
- `Exists(path)` bool - check file exists
- `Missing(path)` bool - check file is absent
- `Put(path, content)` error - write string content
- `PutFile(dir, file)` (string, error) - store with auto-generated name; returns path
- `PutFileAs(dir, file, name)` (string, error) - store with explicit name
- `Copy(src, dst)` error
- `Move(src, dst)` error
- `Delete(files...)` error
- `Url(path)` string - public URL
- `TemporaryUrl(path, time.Time)` (string, error) - expiring URL (non-local drivers)
- `Size(path)` (int64, error)
- `LastModified(path)` (time.Time, error)
- `MimeType(path)` (string, error)
- `Path(path)` string - absolute local path
- `Files(dir)` ([]string, error) - files in directory
- `AllFiles(dir)` ([]string, error) - files including subdirectories
- `Directories(dir)` ([]string, error)
- `AllDirectories(dir)` ([]string, error)
- `MakeDirectory(dir)` error
- `DeleteDirectory(dir)` error

**filesystem.File (local file object):**

- `filesystem.NewFile(path)` (\*File, error) - create from local path
- `.Size()` (int64, error)
- `.LastModified()` (time.Time, error)
- `.MimeType()` (string, error)

**Uploaded file (from ctx.Request().File):**

- `.Store(dir)` (string, error) - save to default disk; returns stored path
- `.StoreAs(dir, name)` (string, error) - save with specific name
- `.Disk(name)` File - target a specific disk
- `.GetClientOriginalName()` string - unsafe; use for display only
- `.GetClientOriginalExtension()` string - unsafe
- `.HashName()` string - safe random name
- `.Extension()` (string, error) - safe MIME-based extension

## Implementation Example

```go
package controllers

import (
    "time"
    "github.com/goravel/framework/contracts/http"
    "github.com/goravel/framework/filesystem"
    "yourmodule/app/facades"
)

type FileController struct{}

// Upload file from request
func (r *FileController) Upload(ctx http.Context) http.Response {
    file, err := ctx.Request().File("avatar")
    if err != nil {
        return ctx.Response().Json(http.StatusBadRequest, http.Json{"error": "no file"})
    }

    // Store to default disk with auto-name
    path, err := file.Store("avatars")
    if err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }
    return ctx.Response().Json(http.StatusOK, http.Json{"path": path})
}

// Store to S3 with specific name
func (r *FileController) UploadToS3(ctx http.Context) http.Response {
    file, _ := ctx.Request().File("document")
    path, err := file.Disk("s3").StoreAs("docs", file.HashName())
    if err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }
    url := facades.Storage().Disk("s3").Url(path)
    return ctx.Response().Json(http.StatusOK, http.Json{"url": url})
}

// Read / write directly
func (r *FileController) ProcessFile(ctx http.Context) http.Response {
    // Write
    _ = facades.Storage().Put("data/report.txt", "hello world")

    // Read
    content, _ := facades.Storage().Get("data/report.txt")

    // Temporary URL (for S3/OSS etc.)
    tmpUrl, _ := facades.Storage().Disk("s3").TemporaryUrl(
        "private/file.pdf",
        time.Now().Add(15*time.Minute),
    )

    // Copy local file to storage
    localFile, _ := filesystem.NewFile("./resources/logo.png")
    storedPath := facades.Storage().PutFile("images", localFile)

    return ctx.Response().Json(http.StatusOK, http.Json{
        "content":  content,
        "tmp_url":  tmpUrl,
        "logo_path": storedPath,
    })
}
```

## Rules

- Default disk is `local`; configure in `config/filesystems.go` under the `default` key.
- All paths are relative to the disk's configured `root` directory.
- `Url()` on `local` driver prepends `/storage` - serve via `facades.Route().Static("storage", "./storage/app/public")`.
- `TemporaryUrl()` only works on non-local drivers (S3, OSS, etc.).
- `PutFile` auto-generates a unique filename; `PutFileAs` uses the name you provide.
- If name in `StoreAs`/`PutFileAs` has no extension, the MIME-detected extension is appended automatically.
- `GetClientOriginalName`/`GetClientOriginalExtension` are **unsafe** - can be tampered by clients.
- Use `HashName()` and `Extension()` for security-safe filenames.
- Custom driver: set `"driver": "custom"` and `"via": driverInstance` in `config/filesystems.go`.
- Use `facades.Config().Env()` inside custom drivers - regular config is not yet loaded when the driver registers.
- External drivers: S3 (`goravel/s3`), OSS (`goravel/oss`), COS (`goravel/cos`), Minio (`goravel/minio`).
