# 檢視

[[toc]]

## 概述

當然，直接從路由和控制器返回整個 HTML 文檔字符串是不切實際的。 值得慶幸的是，檢視提供了一種方便的方式來將我們所有的 HTML 放在單獨的文件中。 檢視將你的控制器 / 應用邏輯與你的表現邏輯分開並存儲在 `resources/views` 目錄中。 幸運的是，檢視提供了一種方便的方式將我們的所有 HTML 放在單獨的文件中。 檢視將你的控制器 / 應用邏輯與你的表現邏輯分開，並存儲在 `resources/views` 目錄中。

## 創建與渲染檢視

使用框架默認模板 `html/template` 時，可以通過在應用程序 `resources/views` 目錄中放置具有 `.tmpl` 擴展名的文件來創建檢視。

```
// resources/views/welcome.tmpl
{{ define "welcome.tmpl" }}
<html>
  <body>
  <h1>你好，{{ .name }}</h1>
  </body>
</html>
{{ end }}
```

創建檢視後，你可以使用 `View` 方法從路由或控制器中返回該檢視：

```go
facades.Route().Get("/", func(ctx http.Context) http.Response {
  return ctx.Response().View().Make("welcome.tmpl", map[string]any{
    "name": "Goravel",
  })
})
```

### 嵌套檢視目錄

檢視也可以嵌套在 `resources/views` 目錄的子目錄中。 例如，如果你的檢視存儲在 `resources/views/admin/profile.tmpl`，你可以從應用程序的路由或控制器中返回它，注意檢視需要定義為 `define "admin/profile.tmpl"`，如下所示：

```go
// resources/views/admin/profile.tmpl
{{ define "admin/profile.tmpl" }}
<h1>歡迎來到管理面板</h1>
{{ end }}

ctx.Response().View().Make("admin/profile.tmpl", map[string]any{
  "name": "Goravel",
})
```

### 創建第一個可用的檢視

使用 `First` 方法，你可以使用給定數組檢視中第一個存在的檢視。 如果你的應用程式或包允許自訂或覆蓋視圖，這可能會很有用：

```go
ctx.Response().View().First([]string{"custom/admin.tmpl", "admin.tmpl"}, map[string]any{
  "name": "Goravel",
})
```

### 判斷檢視是否存在

如果需要判斷檢視文件是否存在，可以使用 `facades.View()` 方法：

```go
if facades.View().Exist("welcome.tmpl") {
  // ...
}
```

## 向檢視傳遞數據

正如你在前面的範例中看到的，你可以將數據數組傳遞給檢視，以使該數據可用於檢視。 請注意，傳遞的數據格式需要根據所使用的模板驅動而變化，在下面的範例中，使用默認的 `html/template` 驅動：

```go
facades.Route().Get("/", func(ctx http.Context) http.Response {
  return ctx.Response().View().Make("welcome.tmpl", map[string]any{
    "name": "Goravel",
  })
})
```

### 與所有檢視共享數據

有時，你可能需要與應用程序呈現的所有檢視共享數據。 你可以使用 `facades.View()` 的 `Share` 方法來實現。 通常，你應該將 `Share` 方法的調用放在服務提供者的 `Boot` 方法內。 你可以將它們添加到 `app/providers/app_service_provider.go` 類中，或生成一個單獨的服務提供者來容納它們：

```go
package providers

import (
	"github.com/goravel/framework/contracts/foundation"
    "github.com/goravel/framework/facades"
)

type AppServiceProvider struct {
}

func (receiver *AppServiceProvider) Register(app foundation.Application) {
}

func (receiver *AppServiceProvider) Boot(app foundation.Application) {
    facades.View().Share("key", "value")
}
```
