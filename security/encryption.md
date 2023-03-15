# Encryption

[[toc]]

## Introduction

Goravel's encryption services provide a simple, convenient interface for encrypting and decrypting text via OpenSSL using AES-256 encryption. All of Goravel's encrypted values are signed using a message authentication code (GMAC) so that their underlying value can not be modified or tampered with once encrypted.

## Configuration

Before using Goravel's encrypter, you must set the `key` configuration option in your `config/app.go` configuration file. This configuration value is driven by the `APP_KEY` environment variable. You should use the `go run . artisan key:generate` command to generate this variable's value since the `key:generate` command will use Golang's secure random bytes generator to build a cryptographically secure key for your application.

## Using The Encrypter

### Encrypting A Value

You may encrypt a value using the `EncryptString` method provided by the `facades.Crypt`. All encrypted values are encrypted using OpenSSL and the AES-256-GCM cipher. Furthermore, all encrypted values are signed with a message authentication code (GMAC). The integrated message authentication code will prevent the decryption of any values that have been tampered with by malicious users:

```go
secret, err := facades.Crypt.EncryptString("goravel")
```

### Decrypting A Value

You may decrypt values using the `DecryptString` method provided by the `facades.Crypt`. If the value can not be properly decrypted, such as when the message authentication code is invalid, an error will be return:

```go
str, err := facades.Crypt.DecryptString(secret)
```

<CommentService/>