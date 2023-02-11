# Encryption

[[toc]]

## Introduction

Goravel use AES-256-GCM as encryption mechanism, you need to configure and save `APP_KEY` before use.

## Configuration

Before use, you need to set the `APP_KEY` environment variable, usually you can use this command to generate one.

```go

go run . artisan key:generate
```

## Get Crypt Instance

`Crypt` Facade can be used to encrypt and decrypt strings.

Such as, you can use the `EncryptString` method in Facade to encrypt a string, return the IV and ciphertext after `base64` encoding, and use the `DecryptString` method to decrypt the ciphertext after encryption and encoding, and return the original string.

```go

facades.Crypt.EncryptString("Goravel")
facades.Crypt.DecryptString(ivString, encryptString)
```
