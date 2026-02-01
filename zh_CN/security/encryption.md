# 加密解密

[[toc]]

## 简介

Goravel 的加密机制使用的是 OpenSSL 所提供的 AES-256 加密。 所有 Goravel 加密之后的结果都会使用消息认证码 (GMAC) 签名，使其底层值不能在加密后再次修改。

## 配置

在使用 Goravel 的加密工具之前，你必须先设置 `config/app.go` 配置文件中的 `key` 配置项。 该配置项由环境变量 `APP_KEY` 设定。 使用 `./artisan key:generate` 命令来生成此配置的值，因为 `key:generate` 命令将利用 Golang 的安全随机字节生成器为你的应用程序创建安全的加密密钥。

## 基本用法

### 加密一个值

你可以使用 `facades.Crypt()` 提供的 `EncryptString` 来加密一个值。 所有加密的值都使用 OpenSSL 的 `AES-256-GCM` 来进行加密。 此外，所有加密过的值都会使用消息认证码 (GMAC) 来签名，以检测加密字符串是否被篡改过。

```go
secret, err := facades.Crypt().EncryptString("goravel")
```

### 解密一个值

你可以使用 `facades.Crypt()` 提供的 `DecryptString` 来进行解密。 如果该值不能被正确解密，例如消息认证码 (MAC) 无效，会返回错误。

```go
str, err := facades.Crypt().DecryptString(secret)
```
