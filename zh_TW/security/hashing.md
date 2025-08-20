# 哈希

[[toc]]

## 概述

Goravel `facades.Hash()` 為存儲用戶密碼提供了安全的 Argon2id 和 Bcrypt 哈希加密方式。 如果您正在使用其中一個 Goravel 應用程式啟動套件，則預設會使用 Argon2id 進行註冊和身份驗證。

## 配置

你應用的默認哈希驅動程序配置在應用的 `config/hashing.go` 配置文件中。 當前支持的驅動程序有：Argon2id 和 Bcrypt。

## 基本用法

### 哈希密碼

你可以通過調用 `facades.Hash()` 的 `Make` 方法來加密你的密碼：

```go
password, err := facades.Hash().Make(password)
```

### 驗證密碼是否與哈希匹配

Hash facade 提供的 `Check` 方法允許你驗證給定的明文字符串是否對應於給定的哈希：

```go
if facades.Hash().Check('plain-text', hashedPassword) {
    // 密碼匹配...
}
```

### 檢查密碼是否需要重新散列 / 哈希

Hash facade 提供的 `NeedsRehash` 方法允許你確定自密碼散列以來，哈希演算法所使用的工作因子是否已經改變。 一些應用選擇在應用的認證過程中執行此檢查：

```go
if facades.Hash().NeedsRehash(hashed) {
     hashed = facades.Hash().Make('plain-text');
}
```
