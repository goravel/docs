# 文件儲存

[[toc]]

## 概述

Goravel 提供簡單的驅動程序，以便與本地檔案系統、Amazon S3、阿里雲 OSS、騰訊 COS、Minio 和 Cloudinary 進行交互。 更棒的是，在本地開發機與生產伺服器之間切換這些存儲選項非常簡單，因為每個系統的 API 保持不變。 Goravel 附帶一個 `local` 驅動程序，欲使用其他驅動程序，請查看對應的獨立擴展包：

| 驅動    | 鏈接                                                                                                   |
| ----- | ---------------------------------------------------------------------------------------------------- |
| S3    | [https://github.com/goravel/s3](https://github.com/goravel/s3)       |
| OSS   | [https://github.com/goravel/oss](https://github.com/goravel/oss)     |
| COS   | [https://github.com/goravel/cos](https://github.com/goravel/cos)     |
| Minio | [https://github.com/goravel/minio](https://github.com/goravel/minio) |

## 配置

Goravel 的檔案系統配置檔位於 `config/filesystems.go`。 在此文件中，你可以配置所有的檔案系統「磁碟」，每個磁碟代表特定的存儲驅動及存儲位置。

> 你可以配置任意數量的磁碟，甚至可以有多個使用相同驅動的磁碟。

### 本地驅動

當使用 `local` 驅動時，所有檔案操作都相對於你在 `filesystems` 配置檔中定義的 `root` 目錄。 預設情況下，該值設置為 `storage/app` 目錄。 因此，以下方法會將檔寫入 `storage/app/example.txt`：

```go
facades.Storage().Put("example.txt", "Contents")
```

### 公共磁碟

在你的應用的 `filesystems` 配置檔中包含的 `public` 磁碟適用於將要公開訪問的檔案。 預設情況下，`public` 磁碟使用 `local` 驅動，並將檔案存儲在 `storage/app/public` 目錄下。要使這些檔案可從 web 訪問，可以創建一個檔案路由： facades.Route().Static("storage", "./storage/app/public")

```go
facades.Route().Static("storage", "./storage/app/public")
```

## 獲取磁碟實例

`Storage` facade 可以用於與你配置的任何磁碟互動。 例如，你可以在 facade 上使用 `Put` 方法將個人頭像儲存在預設磁碟上。 如果你在沒有首先調用 `Disk` 方法的情況下調用 `Storage` facade 上的方法，該方法將自動傳遞給預設磁碟：

```go
facades.Storage().Put("avatars/1.png", "Contents")
```

如果你的應用與多個磁碟互動，你可以在 `Storage` facade 上使用 `Disk` 方法處理特定磁碟上的檔案：

```go
facades.Storage().Disk("s3").Put("avatars/1.png", "Contents")
```

## 注入 Context

```go
facades.Storage().WithContext(ctx).Put("avatars/1.png", "Contents")
```

## 檢索檔案

`Get` 方法可用于檢索檔案的內容。 該方法將返回檔案的原始字串內容。 請記住，所有檔案路徑應相對於磁碟的 `root` 位置指定：

```go
content := facades.Storage().Get("file.jpg")
```

`Exists` 方法可用於判斷磁碟上是否存在指定的檔案：

```go
if (facades.Storage().Disk("s3").Exists("file.jpg")) {
    // ...
}
```

`Missing` 方法可用於判斷磁碟上是否缺少指定的檔案：

```go
if (facades.Storage().Disk("s3").Missing("file.jpg")) {
    // ...
}
```

### 檔案網址

你可以使用 `Url` 方法獲取給定檔案的網址。 如果你使用的是 `local` 驅動，這通常只會在給定的路徑前加上 `/storage`，並返回檔案的相對網址。 如果你使用的是 `s3` 驅動，將返回完整的遠程網址：

```go
url := facades.Storage().Url("file.jpg")
```

> 當使用 `local` 驅動時，`Url` 的返回值不會進行網址編碼。 因此，我們建議總是使用可以創建有效網址的名稱來存儲檔案。

#### 臨時網址

使用 `TemporaryUrl` 方法，你可以為使用非本地驅動程序存儲的檔案創建臨時網址。 此方法接受一個路徑和一個 `Time` 實例，指定網址何時過期：

```go
url, err := facades.Storage().TemporaryUrl(
    "file.jpg", time.Now().Add(5*time.Minute)
)
```

### 檔案 Metadata

除了讀寫檔案，Goravel 還可以提供關於檔案本身的信息：

```go
size := facades.Storage().Size("file.jpg")
```

`LastModified` 方法返回檔案的最終修改時間：

```go
time, err := facades.Storage().LastModified("file.jpg")
```

給定檔案的 MIME 類型可以通過 `MimeType` 方法獲取：

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

### 檔案路徑

要獲取特定檔案的路徑，你可以利用 `Path` 方法。 當使用 `local` 驅動時，這將給你檔案的相對路徑。 不過，如果你使用像 `s3` 這樣的驅動，該方法將提供檔案在儲存桶中的相對路徑：

```go
path := facades.Storage().Path("file.jpg")
```

## 儲存檔案

`Put` 方法可用於在磁碟上儲存檔案內容。 請記住，所有檔案路徑應相對於為磁碟配置的「根」位置指定。

```go
err := facades.Storage().Put("file.jpg", contents)
```

你還可以使用 `PutFile` 和 `PutFileAs` 直接將檔案儲存到磁碟上：

```go
import "github.com/goravel/framework/filesystem"

// 自動生成唯一的檔名...
file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFile("photos", file)

// 手動指定檔名...
file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFileAs("photos", file, "photo.jpg")
```

關於 `PutFile` 方法，有幾個重要的事項需要注意。 注意我們僅指定了目錄名稱，而不是檔案名稱。 預設情況下，`PutFile` 方法將生成唯一的 ID 作為檔名。 檔案的擴展名將根據檔案的 MIME 類型來決定。 `PutFile` 方法將返回檔案的路徑，這樣你可以在數據庫中儲存路徑，包括生成的檔名。

### 複製與移動檔案

`Copy` 方法可以用來將現有檔案複製到磁碟上的新位置，而 `Move` 方法可以用來重命名或移動現有檔案到新位置：

```go
err := facades.Storage().Copy("old/file.jpg", "new/file.jpg")

err := facades.Storage().Move("old/file.jpg", "new/file.jpg")
```

### 檔案上傳

在網頁應用程式中，儲存檔案的最常見用例之一是儲存用戶上傳的檔案，如照片和文檔。 Goravel 使得在上傳的檔案實例上使用 `Store` 方法儲存上傳的檔案變得非常容易。 調用 `Store` 方法並提供你希望儲存上傳檔案的路徑：

```go
func (r *UserController) Show(ctx http.Context) {
  file, err := ctx.Request().File("avatar")
  path, err := file.Store("avatars")
}
```

有幾個重要的事情需要注意這個例子。 注意我們僅指定了一個目錄名稱，而不是檔名。 預設情況下，`Store` 方法將生成一個唯一 ID 作為檔名。 檔案的擴展名將根據檔案的 MIME 類型來決定。 `Store` 方法將返回檔案的路徑，這樣你可以將路徑儲存到數據庫中，包括生成的檔名。

你也可以在 `Storage` facade 上調用 `PutFile` 方法，執行與上述示例相同的檔案儲存操作：

```go
import "github.com/goravel/framework/filesystem"

file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFile("photos", file)　
```

### 指定檔名

如果你不希望檔名自動分配給儲存的檔案，可以使用 `StoreAs` 方法，該方法接收路徑、檔名，以及（可選）磁碟作為參數：

```go
file, err := ctx.Request().File("avatar")
path, err := file.StoreAs("avatars", "name")
```

你也可以在 Storage facade 上使用 `PutFileAs` 方法，這樣將執行與上述示例相同的檔案儲存操作：

```go
import "github.com/goravel/framework/filesystem"

file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFileAs("photos", file, "name")
```

> 如果 `StoreAs` 和 `PutFileAs` 指定的檔名沒有後綴，將根據檔案的 MIME 自動添加後綴；否則，直接使用指定的檔名。

### 指定磁碟

預設情況下，上傳檔的 `Store` 方法將使用你的預設磁碟。 如果你希望指定其他磁碟，請使用 `Disk` 方法：

```go
func (r *UserController) Show(ctx http.Context) {
  file, err := ctx.Request().File("avatar")
  path, err := file.Disk("s3").Store("avatars")
}
```

### 其他上傳檔信息

如果你想獲取上傳檔的原始名稱和擴展名，可以使用 `GetClientOriginalName` 和 `GetClientOriginalExtension` 方法：

```go
file, err := ctx.Request().File("avatar")

name := file.GetClientOriginalName()
extension := file.GetClientOriginalExtension()
```

然而，請記住，`GetClientOriginalName` 和 `GetClientOriginalExtension` 方法被認為是不安全的，因為文件名和擴展名可能會被惡意用戶篡改。 出於這個原因，你應該更傾向於使用 `HashName` 和 `Extension` 方法來獲取給定文件上傳的名稱和擴展名：

```go
file, err := ctx.Request().File("avatar")

name := file.HashName() // 生成一個唯一的隨機名稱...
extension, err := file.Extension() // 根據文件的 MIME 類型確定文件的擴展名...
```

## 刪除文件

`Delete` 方法接收一個文件名或一個文件名數組來將其從磁碟中刪除：

```go
err := facades.Storage().Delete("file.jpg")
err := facades.Storage().Delete("file.jpg", "file2.jpg")
```

如果有必要，你可以指定要刪除的文件的磁碟：

```go
err := facades.Storage().Disk("s3").Delete("file.jpg")
```

## 目錄

### 獲取目錄下所有的文件

`Files` 方法返回給定目錄中所有文件的切片。 如果你想獲取給定目錄及所有子目錄中所有文件的列表，你可以使用 `AllFiles` 方法：

```go
files, err := facades.Storage().Disk("s3").Files("directory")
files, err := facades.Storage().Disk("s3").AllFiles("directory")
```

### 獲取目錄中所有的目錄

`Directories` 方法返回給定目錄中所有目錄的切片。 此外，你還可以使用 `AllDirectories` 方法獲取給定目錄及其所有子目錄中的所有目錄的列表：

```go
directories, err := facades.Storage().Disk("s3").Directories("directory")
directories, err := facades.Storage().Disk("s3").AllDirectories("directory")
```

### 創建一個目錄

`MakeDirectory` 方法會創建給定的目錄，包括任何所需的子目錄：

```go
err := facades.Storage().MakeDirectory(directory)
```

### 刪除一個目錄

最後，`DeleteDirectory` 方法可用於刪除一個目錄及其所有文件：

```go
err := facades.Storage().DeleteDirectory(directory)
```

## 自定義文件系統

你可以在 `config/filesystems.go` 文件中設置 `custom` 驅動。

```go
"custom": map[string]any{
  "driver": "custom",
  "via":    filesystems.NewLocal(),
},

```

你需要在 `via` 配置項中實現 `github.com/goravel/framework/contracts/filesystem/Driver` 接口。

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
} ■
```

> Note: Since the configuration has not been loaded when the custom driver is registered, so please use `facades.Config().Env()` to obtain the configuration in the custom driver.
