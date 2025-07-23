# 加密解密

[[toc]]

## 简介

Goravel's encryption services provide a simple, convenient interface for encrypting and decrypting text via OpenSSL using AES-256 encryption. Goravel 的加密机制使用的是 OpenSSL 所提供的 AES-256 加密。强烈建议你使用 Goravel 内建的加密工具，而不是用其它的加密算法。所有 Goravel 加密之后的结果都会使用消息认证码 (GMAC) 签名，使其底层值不能在加密后再次修改。

## 配置

在使用 Goravel 的加密工具之前，你必须先设置 `config/app.go` 配置文件中的 `key` 配置项。该配置项由环境变量 `APP_KEY` 设定。你应当使用 `go run . This option is driven by the `APP_KEY`environment variable. Use the`go run . artisan key:generate` 命令来生成该变量的值，`key:generate\` 命令将使用 Golang 的安全随机字节生成器为你的应用程序构建加密安全密钥。

## 使用加密器

### 加密一个值

To encrypt a value, you can use the `EncryptString` method in `facades.Crypt()`. This method encrypts values using the OpenSSL and AES-256-GCM cipher. Additionally, all encrypted values are signed with a message authentication code (GMAC) to prevent decryption by malicious users who try to tamper with the data.

```go
secret, err := facades.Crypt().EncryptString("goravel")
```

### 解密一个值

您可以使用 `facades.Crypt()` 提供的 `DecryptString` 来进行解密。如果该值不能被正确解密，例如消息认证码 (MAC) 无效，会返回错误： If the value can not be properly decrypted, such as when the message authentication code is invalid, an error will be returned.

```go
str, err := facades.Crypt().DecryptString(secret)
```
