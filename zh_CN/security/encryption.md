# 加密

[[toc]]

## 简介

Goravel's encryption services provide a simple, convenient interface for encrypting and decrypting text via OpenSSL using AES-256 encryption. Goravel 的加密服务提供了一个简单、方便的接口，用于使用 AES-256
加密来加密和解密文本。 Goravel 的所有加密值都使用消息认证码（GMAC）进行签名，以确保其底层值在加密后不能被修改或篡改。

## 配置

在使用 Goravel 的加密器之前，您必须在 `config/app.go` 配置文件中设置 `key` 配置选项。 此选项由 `APP_KEY` 环境变量驱动。 使用 `go run . This option is driven by the `APP_KEY`environment variable. Use the`go run . artisan key:generate`命令生成此变量的值，因为`key:generate\` 命令将利用 Golang 的安全随机字节生成器为您的应用程序创建一个安全的加密密钥。

## 使用加密器

### 加密值

To encrypt a value, you can use the `EncryptString` method in `facades.Crypt()`. This method encrypts values using the OpenSSL and AES-256-GCM cipher. Additionally, all encrypted values are signed with a message authentication code (GMAC) to prevent decryption by malicious users who try to tamper with the data.

```go
secret, err := facades.Crypt().EncryptString("goravel")
```

### 解密值

您可以使用`facades.Crypt()`的`DecryptString`方法来解密值。 如果无法正确解密该值，例如当消息认证码无效时，将返回错误。 If the value can not be properly decrypted, such as when the message authentication code is invalid, an error will be returned.

```go
str, err := facades.Crypt().DecryptString(secret)
```
