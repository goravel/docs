# 加密解密

[[toc]]

## 介绍

Goravel 加密机制使用的是 AES-256-GCM ，你需要在使用前配置并保存好 `APP_KEY` 。

## 配置

在使用之前，你需要设置好 `APP_KEY` 环境变量，一般来说，你可以使用此命令自动生成一个。

```go

go run . artisan key:generate
```

## 获取加密实例

`Crypt` Facade 可用于对字符串进行加密和解密。

例如，你可以使用 Facade 中的 `EncryptString` 方法对字符串进行加密，返回经过 `base64` 编码后的 IV 和 密文，使用 `DecryptString` 方法对经过加密和编码后的密文进行解密，返回原始字符串。

```go

facades.Crypt.EncryptString("Goravel")
facades.Crypt.DecryptString(ivString, encryptString)
```
