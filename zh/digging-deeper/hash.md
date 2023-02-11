# 哈希

[[toc]]

## 介绍

Goravel 为存储用户密码提供了现代化的 Argon2id 和传统的 Bcrypt 哈希加密方式，默认情况下，将使用 Argon2id 进行哈希计算。

## 配置

配置文件位于 `config/hashing.go`。在这个文件中你可以配置需要使用的哈希加密方式及它们的参数，对大多数应用程序来说，默认值就足够了。

## 获取哈希实例

`Hash` Facade 可用于对密码进行哈希和检查哈希。
例如，你可以使用 Facade 中的 `Make` 方法将密码进行哈希返回，使用 `Check` 方法对密码和哈希值进行校验，并在修改哈希函数的参数后使用 `NeedsRehash` 判断一个哈希值是否需要重新哈希。

```go

facades.Hash.Make("password")
facades.Hash.Check("password", hashedString)
facades.Hash.NeedsRehash(hashedString)
```
