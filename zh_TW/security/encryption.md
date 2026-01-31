# 加密解密

[[toc]]

## 概述

Goravel 的加密服務提供了簡單方便的介面，可以通過 OpenSSL 使用 AES-256 加密進行文字的加密和解密。 所有 Goravel 的加密值都使用消息認證碼 (GMAC) 簽名，以確保其底層值在加密後不會被修改或篡改。

## 配置

在使用 Goravel 的加密工具之前，你必須在 `config/app.go` 配置文件中設置 `key` 配置選項。 此選項由 `APP_KEY` 環境變數驅動。 Use the `./artisan key:generate` command to generate this variable's value since the `key:generate` command will utilize Golang's secure random bytes generator to create a secure cryptographic key for your application.

## 使用加密器

### 加密一個值

要加密一個值，你可以使用 `facades.Crypt()` 中的 `EncryptString` 方法。 此方法使用 OpenSSL 和 AES-256-GCM 密碼加密值。 此外，所有加密值都使用消息認證碼 (GMAC) 進行簽名，以防止惡意用戶通過篡改數據來進行解密。

```go
secret, err := facades.Crypt().EncryptString("goravel")
```

### 解密一個值

你可以使用 `facades.Crypt()` 提供的 `DecryptString` 來解密值。 如果該值無法正確解密，例如消息認證碼 (MAC) 無效，則會返回錯誤。 如果該值無法正確解密，例如消息認證碼無效，將返回錯誤。

```go
str, err := facades.Crypt().DecryptString(secret)
```
