# Encryption

[[toc]]

## Introduction

Goravel's encryption services provide a simple, convenient interface for encrypting and decrypting text using AES-256
encryption. All of Goravel's encrypted values are signed using a message authentication code (GMAC) so that their
underlying value can not be modified or tampered with once encrypted.

## Configuration

Before using Goravel's encrypter, you must set the `key` configuration option in your `config/app.go` configuration
file. This option is driven by the `APP_KEY` environment variable. Use the `go run . artisan key:generate` command to
generate this variable's value since the `key:generate` command will utilize Golang's secure random bytes generator to
create a secure cryptographic key for your application.

## Using The Encrypter

### Encrypting A Value

To encrypt a value, you can use the `EncryptString` method in `facades.Crypt()`. This method encrypts values using
AES-256-GCM cipher. Additionally, all encrypted values are signed with a message authentication code (GMAC) to prevent
decryption by malicious users who try to tamper with the data.

```go
secret, err := facades.Crypt().EncryptString("goravel")
```

### Decrypting A Value

You can use the `DecryptString` method from `facades.Crypt()` to decrypt values. If the value can not be properly
decrypted, such as when the message authentication code is invalid, an error will be returned.

```go
str, err := facades.Crypt().DecryptString(secret)
```
