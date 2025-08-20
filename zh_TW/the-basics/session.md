# 會話

[[toc]]

## 概述

會話使您能夠在多個請求之間儲存用戶資訊，提供在本質上無狀態的 HTTP 協議中的有狀態體驗。 這些用戶資訊在伺服器端持久儲存。 Goravel 提供了一個統一的接口來與各種持久儲存驅動進行互動。

## 配置

`session` 配置文件位於 `config/session.go`。 默認驅動是 `file`，它將會話儲存在 `storage/framework/sessions` 目錄中。 Goravel 允許您通過實現 `contracts/session/driver` 接口來創建自定義 `session` 驅動。

### 註冊中介軟體

Goravel 默認情況下不會自動啟動會話。 然而，它提供了中介軟體來啟動會話。 您可以在 `app/http/kernel.go` 文件中註冊會話中介軟體，以將其應用於所有路由，或將其添加到特定路由中：

```go
import (
  "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/session/middleware"
)

func (kernel Kernel) Middleware() []http.Middleware {
  return []http.Middleware{
    middleware.StartSession(),
  }
}
```

## 與會話互動

### 檢索資料

您可以使用 `Get` 方法從會話中檢索資料。 如果值不存在，則返回 `nil`。

```go
value := ctx.Request().Session().Get("key")
```

您也可以將默認值作為 `Get` 方法的第二個參數傳遞。 如果指定的鍵在會話中不存在，則返回該值：

```go
value := ctx.Request().Session().Get("key", "default")
```

### 檢索所有資料

如果您想從會話中檢索所有資料，可以使用 `All` 方法：

```go
data := ctx.Request().Session().All()
```

### 檢索資料子集

如果您想檢索會話資料某些字段，可以使用 `Only` 方法：

```go
data := ctx.Request().Session().Only([]string{"username", "email"})
```

### 確定會話中是否存在項目

要確定項目是否在會話中，您可以使用 `Has` 方法。 如果項目存在且不為 `nil`，則 `Has` 方法返回 `true`：

```go
if ctx.Request().Session().Has("user") {
    //
}
```

要確定項目是否存在，即使它是 `nil`，您可以使用 `Exists` 方法：

```go
if ctx.Request().Session().Exists("user") {
    //
}
```

要確定項目不在會話中，您可以使用 `Missing` 方法：

```go
if ctx.Request().Session().Missing("user") {
    //
}
```

### 存儲資料

您可以使用 `Put` 方法將資料儲存到會話中：

```go
ctx.Request().Session().Put("key", "value")
```

### 檢索並刪除資料

如果您想從會話中檢索項目並然後刪除它，您可以使用 `Pull` 方法：

```go
value := ctx.Request().Session().Pull("key")
```

### 刪除資料

`Forget` 方法可用於從會話中刪除資料。 如果您想從會話中刪除所有資料，您可以使用 `Flush` 方法：

```go
ctx.Request().Session().Forget("username", "email")

ctx.Request().Session().Flush()
```

### 重新生成會話 ID

重新生成會話 ID 通常是為了防止惡意用戶利用會話固定攻擊來利用您的應用程式。 您可以使用 `Regenerate` 方法重新生成會話 ID：

```go
ctx.Request().Session().Regenerate()
```

如果您想重新生成會話 ID 並忘記會話中的所有資料，您可以使用 `Invalidate` 方法：

```go
ctx.Request().Session().Invalidate()
```

然後，您需要將新的會話儲存到 cookie 中：

```go
ctx.Response().Cookie(http.Cookie{
  Name:     ctx.Request().Session().GetName(),
  Value:    ctx.Request().Session().GetID(),
  MaxAge:   facades.Config().GetInt("session.lifetime") * 60,
  Path:     facades.Config().GetString("session.path"),
  Domain:   facades.Config().GetString("session.domain"),
  Secure:   facades.Config().GetBool("session.secure"),
  HttpOnly: facades.Config().GetBool("session.http_only"),
  SameSite: facades.Config().GetString("session.same_site"),
})
```

### 閃存資料

閃存資料是只有在隨後的 HTTP 請求期間可用的會話資料，然後將被刪除。 閃存資料有助於儲存暫時性消息，如狀態消息。 您可以使用 `Flash` 方法將閃存資料儲存到會話中：

```go
ctx.Request().Session().Flash("status", "任務已成功！")
```

如果您希望保留閃存資料以供額外請求使用，可以使用 `Reflash` 方法：

```go
ctx.Request().Session().Reflash()
```

如果您希望保留特定的閃存資料以供立即使用，可以使用 `Keep` 方法：

```go
ctx.Request().Session().Keep("status", "username")
```

如果您想保留特定的資料以供立即使用，您可以使用 `Now` 方法：

```go
ctx.Request().Session().Now("status", "任務已成功！")
```

## 與會話管理器互動

### 構建自定義會話

使用 `Session` 門面構建自定義會話。 `Session` 門面提供了 `BuildSession` 方法，它接受一個驅動實例和一個可選的會話 ID，如果您想指定自定義會話 ID：

```go
import "github.com/goravel/framework/facades"

session := facades.Session().BuildSession(driver, "sessionID")
```

### 添加自定義會話驅動

#### 實現驅動

要實現自定義會話驅動，驅動必須實現 `contracts/session/driver` 接口。

```go
// 驅動是會話處理程式的介面。
type Driver interface {
  // Close 關閉會話處理程式。
  Close() error
  // Destroy 根據給定的 ID 銷毀會話。
  Destroy(id string) error
  // Gc 在給定的最大生命週期內對會話處理程式執行垃圾回收。
  Gc(maxLifetime int) error
  // Open 根據給定的路徑和名稱打開會話。
  Open(path string, name string) error
  // Read 讀取與給定 ID 相關的會話資料。
  Read(id string) (string, error)
  // Write 寫入與給定 ID 相關的會話資料。
  Write(id string, data string) error
}
```

#### 註冊驅動

在實現驅動後，您只需將其添加到 `config/session.go` 配置文件中：

```go
// config/session.go
"default": "new",

"drivers": map[string]any{
  "file": map[string]any{
    "driver": "file",
  },
  "new": map[string]any{
    "driver": "custom",
    "via": func() (session.Driver, error) {
      return &CustomDriver{}, nil
    },
  }
},
```

### 獲取驅動實例

使用 `Driver` 方法從會話管理器中檢索驅動實例。 它接受一個可選的驅動名稱，如果未提供，則返回默認驅動實例：

```go
driver, err := facades.Session().Driver("file")
```

### 開始新會話

```go
session := facades.Session().BuildSession(driver)
session.Start()
```

### 儲存會話資料

```go
session := facades.Session().BuildSession(driver)
session.Start()
session.Save()
```

### 將會話附加到請求

```go
session := facades.Session().BuildSession(driver)
session.Start()
ctx.Request().SetSession(session)
```

### 檢查請求是否有會話

```go
if ctx.Request().HasSession() {
    //
}
```
