# 哈希

[[toc]]

## 简介

Goravel `facades.Hash()` 为存储用户密码提供了安全的 Argon2id 和 Bcrypt 哈希加密方式。如果你正在使用 Goravel 应用初始脚手架 ，默认情况下，将使用 Argon2id 进行注册和身份验证。 If you are using one of the Goravel application starter kits, Argon2id will be used for registration and authentication by default.

## 配置

The default hashing driver for your application is configured in your application's `config/hashing.go` configuration file. There are currently several supported drivers: Argon2id and Bcrypt.

## 基本用法

### 哈希密码

你可以通过调用 `facades.Hash()` 的 `Make` 方法来加密你的密码：

```go
password, err := facades.Hash().Make(password)
```

### 验证密码是否与哈希匹配

`Check` 方法能为你验证一段给定的未加密字符串与给定的散列 / 哈希值是否一致：

```go
if facades.Hash().Check("plain-text", hashedPassword) {
    // 密码匹配...
}
```

### 检查密码是否需要重新散列 / 哈希

Hash facade 提供的 `NeedsRehash` 方法允许你确定自密码被哈希后，哈希器使用的工作因子是否已经改变。 一些应用程序选择在应用程序的认证过程中执行此检查： Some applications choose to perform this check during the application's authentication process:

```go
if facades.Hash().NeedsRehash(hashed) {
     hashed = facades.Hash().Make("plain-text");
}
```
