# Storage

Filesystem abstraction across local, S3, OSS, COS, MinIO. `Storage` extends `Driver`; `Disk(name)` switches disk. Files are `string` paths relative to the disk root. Uploaded files are `filesystem.File` (different type — see Patterns).

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/filesystem/storage.go` — `Storage`, `Driver`, `File`

## Imports

```go
import (
    "time"

    "github.com/goravel/framework/contracts/filesystem"

    "yourmodule/app/facades"
)
```

## Methods

### `facades.Storage()` returns `filesystem.Storage` (extends `Driver`)

| Method | Signature | Notes |
|---|---|---|
| Disk | `(name string) Driver` | Switch disk (`"local"`, `"public"`, `"s3"`, etc.). |

All `Driver` methods below are also on `facades.Storage()`.

### `filesystem.Driver`

| Group | Methods (signature-only) |
|---|---|
| Read | `Get(file string) (string, error)`, `GetBytes(file string) ([]byte, error)`, `Exists(file) bool`, `Missing(file) bool`, `Size(file) (int64, error)`, `LastModified(file) (time.Time, error)`, `MimeType(file) (string, error)`, `Path(file) string` |
| Write | `Put(file, content string) error`, `PutFile(path string, source File) (string, error)` (returns final path), `PutFileAs(path string, source File, name string) (string, error)` |
| Move/copy/delete | `Copy(old, new string) error`, `Move(old, new string) error`, `Delete(files ...string) error`, `DeleteDirectory(directory string) error`, `MakeDirectory(directory string) error` |
| List | `Files(path string) ([]string, error)`, `AllFiles(path string) ([]string, error)` (recursive), `Directories(path string) ([]string, error)`, `AllDirectories(path string) ([]string, error)` (recursive) |
| URLs | `Url(file string) string` (public URL), `TemporaryUrl(file string, expires time.Time) (string, error)` (signed URL) |
| Context | `WithContext(ctx context.Context) Driver` |

### `filesystem.File` (uploaded files via `ctx.Request().File(...)`)

| Method | Signature | Notes |
|---|---|---|
| Disk | `(name string) File` | Pin a target disk for `Store`/`StoreAs`. |
| Store | `(path string) (string, error)` | Save with hashed filename; returns final path. |
| StoreAs | `(path, name string) (string, error)` | Save with explicit filename. |
| File | `() string` | Local temp path while still buffered. |
| Extension | `() (string, error)` | Sniffed extension. |
| GetClientOriginalName | `() string` | Original upload filename. |
| GetClientOriginalExtension | `() string` | Original extension. |
| HashName | `(path ...string) string` | Generate a hashed name (deterministic). |
| LastModified | `() (time.Time, error)` | |
| MimeType | `() (string, error)` | |
| Size | `() (int64, error)` | |

## Config

User-owned: `config/filesystems.go`. Read directly for current disk definitions.

Keys this facade reads:

- `filesystems.default` (string) — default disk name
- `filesystems.disks.<name>.driver` (string) — `"local"`, `"s3"`, `"oss"`, `"cos"`, `"minio"`, `"custom"`
- `filesystems.disks.<name>.root` (string) — local root directory
- `filesystems.disks.<name>.url` (string) — public base URL for `Url()`
- `filesystems.disks.<name>.bucket`, `key`, `secret`, `region`, `endpoint` — cloud-driver inputs (env-backed)
- `filesystems.disks.<name>.via` (function) — for `custom` driver, factory closure

Greenfield default: `config/filesystems.go` from goravel-scaffold URL declared in `AGENTS.md`.

## Patterns & gotchas

- **Two file types, easy to confuse**:
  - `string` paths (e.g. `"avatars/x.png"`) — used by `Driver` methods (`Get`, `Put`, `Delete`, etc.).
  - `filesystem.File` — wraps an uploaded file (`ctx.Request().File("avatar")`); use its own `Store`/`StoreAs` methods OR pass to `Driver.PutFile`.
- **`PutFile(path, source)` returns the final stored path** — it auto-generates a unique filename. Capture the return value.
- **`PutFileAs(path, source, name)` lets you specify the name** — useful when you want predictable URLs.
- **`Disk(name)` vs `Storage()`**: `facades.Storage()` uses the default disk; `facades.Storage().Disk("s3")` switches per-call.
- **`Url(file)` requires the disk to have a public `url` configured**. For private content use `TemporaryUrl(file, expiresAt)` to get a signed URL — driver-dependent (S3/OSS/COS support; local doesn't).
- **`Delete(files ...string)` is variadic**: `storage.Delete("a", "b", "c")` for batch.
- **`AllFiles`/`AllDirectories` recurse**; `Files`/`Directories` don't. Recursive calls on cloud disks can be slow + expensive.
- **Streaming large reads**: `Driver` doesn't expose a streaming API directly — use `Path()` to get a local path (local disk) or download to disk via the cloud SDK and read with `os.Open`. For HTTP responses use `ctx.Response().File(path)` or `ctx.Response().Stream(...)` — see `request-response.md`.
- **`MakeDirectory`** is idempotent on most drivers. On cloud disks it's typically a no-op (no real directories).
- **`Move` vs `Copy`**: `Move` deletes the source; `Copy` doesn't. Both fail if destination exists on most drivers.
- **`MimeType` is sniffed from content** (not extension) — slow on large files; cache the result if used repeatedly.
- **Context propagation**: `facades.Storage().WithContext(ctx).Get(...)` — important for cloud drivers with timeouts.
- **`HashName(path...)` on uploads**: useful before `PutFileAs` when you want deterministic deduplication keys.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `storage.Put(file, content)` where `file` is `*os.File` | `storage.Put("path/x.txt", "content string")` OR `storage.PutFile(path, uploadedFile)` | `Put` takes string content. For uploads use `PutFile`. |
| `storage.PutFile(path, source)` ignoring return | `name, err := storage.PutFile(path, source)` | Returns the stored filename — capture it. |
| `storage.Url(privateFile)` and serve | `storage.TemporaryUrl(privateFile, time.Now().Add(15*time.Minute))` | `Url` is for publicly-accessible files. |
| `storage.Delete([]string{"a", "b"})` | `storage.Delete("a", "b")` | Variadic. |
| `storage.AllFiles("/")` on S3 to list every object | Paginate via the SDK directly, or scope to a prefix | Recursive listing on cloud is expensive. |
| Compare extensions to MIME types via `Extension()` | `MimeType()` (sniffs content) | Extensions can lie; sniff for security checks. |
| Using local-disk `MakeDirectory` and expecting it on S3 | No-op on cloud disks; use prefixes instead | Cloud has no real directories. |

## Worked example: avatar upload + temporary URL

```go
package controllers

import (
    "fmt"
    "time"

    "github.com/goravel/framework/contracts/http"

    "yourmodule/app/facades"
)

type ProfileController struct{}

func (c *ProfileController) UploadAvatar(ctx http.Context) http.Response {
    file, err := ctx.Request().File("avatar")
    if err != nil {
        return ctx.Response().Json(http.StatusBadRequest, http.Json{"error": err.Error()})
    }

    // Validate size + MIME (real check, not just extension)
    size, _ := file.Size()
    if size > 5*1024*1024 {
        return ctx.Response().Json(http.StatusRequestEntityTooLarge, http.Json{"error": "max 5MB"})
    }
    mt, _ := file.MimeType()
    if mt != "image/png" && mt != "image/jpeg" {
        return ctx.Response().Json(http.StatusUnsupportedMediaType, http.Json{"error": "png/jpeg only"})
    }

    // Store on the s3 disk under avatars/, deterministic filename keyed by hash
    name := file.HashName()
    storedPath, err := facades.Storage().
        Disk("s3").
        PutFileAs("avatars", file, name)
    if err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }

    // Signed URL good for 15 minutes
    signed, err := facades.Storage().
        Disk("s3").
        TemporaryUrl(storedPath, time.Now().Add(15*time.Minute))
    if err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }

    return ctx.Response().Json(http.StatusOK, http.Json{
        "path":      storedPath,
        "url":       signed,
        "byte_size": fmt.Sprintf("%d", size),
    })
}
```

## Rules

- `Driver` methods take `string` paths; `filesystem.File` is the upload wrapper from `ctx.Request().File(...)`.
- `PutFile(path, source) (string, error)` — capture the returned path.
- `Url` is public; `TemporaryUrl(file, expiresAt)` is signed and time-limited.
- `Delete(files ...string)` is variadic.
- For private file serving prefer `TemporaryUrl` over hand-rolled signed URLs.
- `MimeType` sniffs content (security-correct); `Extension` is whatever the upload claims.
- For cloud disks, avoid `AllFiles`/`AllDirectories` over a wide prefix — paginate explicitly via the SDK.
- Use `.WithContext(ctx)` to propagate cancellation/timeouts on cloud calls.
