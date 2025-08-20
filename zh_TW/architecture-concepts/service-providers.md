# 服務提供者

[[toc]]

## 概述

內核啟動操作中最重要的事情是加載 `ServiceProvider`。 應用程序下的所有 `ServiceProvider` 都在 `config/app.go` 的 `providers` 陣列中配置。

首先，內核會調用所有服務提供者的 `Register` 方法。 在所有服務提供者註冊後，內核將再次調用所有 `ServiceProvider` 的 `Boot` 方法。

`ServiceProvider` 是 Goravel 生命週期的關鍵。 它們使框架能夠包含各種組件，例如路由、數據庫、隊列、快取等。

您也可以自定義自己的提供者，可以存放在 `app/providers` 下並在 `config/app.go` 的 `providers` 陣列中註冊。

框架默認有一個空白的服務提供者 `app/providers/app_service_provider.go`，您可以在這裡實現簡單的啟動邏輯。 在大型項目中，您可以選擇創建新的服務提供者以進行更精確的控制。

ServiceProvider 提供可選方法 `Relationship() binding.Relationship`，用來聲明當前 ServicerProvider 的依賴關係，設定了該方法的 ServiceProvider 將不依賴於註冊順序，而未設定的 ServiceProvider 將最後註冊，例如：

```go
type ServiceProvider struct {
}

func (r *ServiceProvider) Relationship() binding.Relationship {
	return binding.Relationship{
		Bindings: []string{
			BindingSession,
		},
		Dependencies: []string{
			binding.Config,
		},
		ProvideFor: []string{
			binding.Cache,
		},
	}
}

func (r *ServiceProvider) Register(app foundation.Application) {}

func (r *ServiceProvider) Boot(app foundation.Application) {}
```
