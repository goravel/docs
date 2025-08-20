# 目錄結構

[[toc]]

## 概述

默認的文件結構可以使你更好地開始項目推進，你也可以自由地新增文件夾，但默認文件夾不要修改。

## 根目錄

### `app` 目錄

`app` 包含了程序的核心代碼。 幾乎所有的邏輯都會在這個文件夾中。

### `bootstrap` 目錄

`bootstrap` 目錄包含了框架的啟動文件 `app.go`。

### `config` 目錄

`config` 目錄包含了應用程序的所有配置文件。最好把這些文件都瀏覽一遍，並熟悉所有可用的配置。 最好瀏覽這些文件，熟悉所有可用的選項。

### `database` 目錄

`database` 目錄包含了數據庫遷移文件。

### `public` 目錄

`public` 目錄包含一些靜態資源，如圖像、證書等。

### `resources` 目錄

`resources` 目錄包含你的[視圖](../the-basics/views.md)，以及原始的、未編譯的資源文件，例如 CSS 或 JavaScript。

### `routes` 目錄

`routes` 目錄包含應用程序的所有路由定義。

### `storage` 目錄

`storage` 目錄包含 `logs` 目錄，`logs` 目錄包含應用程序的日誌文件。

### `tests` 目錄

`tests` 目錄包含你的自動化測試。

## `app` 目錄

### `console` 目錄

`console` 目錄包含應用程序所有自定義的 `Artisan` 命令，與控制台啟動文件 `kernel.go`，可以在這個文件中註冊[任務](../digging-deeper/task-scheduling.md)

### `http` 目錄

`http` 目錄包含控制器、中間件等，幾乎所有通過 Web 進入應用的請求處理都在這裡進行。

### `grpc` 目錄

`grpc` 目錄包含控制器、中間件等，幾乎所有通過 Grpc 進入應用的請求處理都在這裡進行。

### `models` 目錄

`models` 目錄包含所有數據模型。

### `providers` 目錄

`providers` 目錄包含程序中所有的 [服務提供者](../architecture-concepts/service-providers.md)。 服務提供者通過綁定服務、註冊事件或執行任何其他任務來引導應用程序以應對傳入的請求。 服務提供者引導應用程序通過綁定服務、註冊事件或執行任何其他任務來應對傳入的請求。
