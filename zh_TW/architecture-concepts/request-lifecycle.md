# 請求週期

[[toc]]

## 概述

Goravel 應用的所有請求入口都是 `main.go` 文件。 它利用 `bootstrap.Boot()` 函數來初始化框架。

然後在 `bootstrap/app.go` 中通過 `app := foundation.NewApplication()` 創建 Goravel 實例。

之後使用 `app.Boot()` 引導加載註冊的 [服務提供者](service-providers.md)，並使用 `config.Boot()` 加載 config 目錄下的配置文件。

最後，在 `main.go` 文件中使用 `facades.Route().Run(facades.Config().GetString("app.host"))` 啟動 HTTP 伺服器。
