# 哈希

[[toc]]

## 简介

Goravel `facades.Hash` 为存储用户密码提供了安全的 Argon2id 和 Bcrypt 哈希加密方式。如果你正在使用 Goravel 应用初始脚手架 ，默认情况下，将使用 Argon2id 进行注册和身份验证。

## 配置

你可以在 `config/hashing.go` 配置文件中配置默认哈希驱动程序。目前支持两种驱动程序： Bcrypt 和 Argon2id。

## 基本用法

### 哈希密码

你可以通过调用 `facades.Hash` 的 `Make` 方法来加密你的密码：

```go
password, err := facades.Hash.Make(password)
```

### 验证密码是否与哈希匹配

`Check` 方法能为你验证一段给定的未加密字符串与给定的散列 / 哈希值是否一致：

```go
if facades.Hash.Check('plain-text', hashedPassword) {
    // 密码匹配...
}
```

### 检查密码是否需要重新散列 / 哈希

`NeedsRehash` 方法可以为你检查当散列 / 哈希的加密系数改变时，你的密码是否被新的加密系数重新加密过。某些应用程序选择在身份验证时执行这一项检查：

```go
if facades.Hash.NeedsRehash(hashed) {
     hashed = facades.Hash.Make('plain-text');
}
```

<CommentService/>