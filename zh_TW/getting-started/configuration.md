# 配置

[[toc]]

## 概述

Goravel 框架所有配置文件都保存在 `config` 目錄中。 你可以進入具體文件查看配置說明，根據項目需要靈活配置。 你可以查看具體說明，並根據項目需要靈活配置它們。

## 環境配置

在不同的環境運行應用程序通常需要不同的配置。 例如，你可能希望在本地打開 Debug 模式，但生產環境不需要。

因此，框架在根目錄提供了 `.env.example` 文件。 你需要複製這個文件，在開始開發之前將其重命名為 `.env`，並根據你的項目需求修改 `.env` 文件中的配置項。

注意，`.env` 文件不應該加入版本控制，因為當多個人協作時，不同的開發者可能使用不同的配置，而不同的部署環境配置也不同。

此外，如果有入侵者獲得了你的代碼倉庫訪問權限，將會有暴露敏感配置的風險。 如果你想新增新的配置項，可以添加到 `.env.example` 文件中，以此來同步所有開發者的配置。 如果你想添加一個新的配置項，你可以將其添加到 `.env.example` 文件中以同步所有開發者的配置。

## 獲取環境配置

使用如下方法，可獲取 `.env` 文件中的配置項：

```go
// 第一个参数为配置键，第二个参数为默认值
facades.Config().Env("APP_NAME", "goravel")
```

## 獲取配置值

你可以輕鬆的在應用程序的任何位置使用全局 `facades.Config()` 函數來訪問 `config` 目錄中的配置值。 配置值的訪問可以使用「點」語法。 還可以指定默認值，如果配置選項不存在，則返回默認值： 訪問配置值可以使用「.」語法。 你也可以指定一個默認值，如果配置選項不存在，則返回默認值：

```go
// 通過斷言獲取配置
facades.Config().Get("app.name", "goravel")

// 獲取字符串類型的配置
facades.Config().GetString("app.name", "goravel")

// 獲取整型類型的配置
facades.Config().GetInt("app.int", 1)

// 獲取布爾類型的配置
facades.Config().GetBool("app.debug", true)
```

## 設置配置

```go
facades.Config().Add("path", "value1")
facades.Config().Add("path.with.dot.case1", "value1")
facades.Config().Add("path.with.dot", map[string]any{"case3": "value3"})
```

## 獲取項目信息

你可以使用 `artisan about` 命令來查看框架的版本、配置等信息。

```bash
go run . artisan about
```
