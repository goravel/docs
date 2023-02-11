# Hashing

[[toc]]

## Introduction

Goraevl provides modern Argon2id and traditional Bcrypt hashing for storing user passwords. By default, Argon2id will be used to hash the password.

## Configuration

Configuration file is located at `config/hashing.go`. In this file you can configure the hashing encryption method and its parameters you want to use. For most applications, the default values are enough.

## Get Hash Instance

`Hash` Facade can be used to hash and check the password.
For example, you can use the `Make` method in Facade to hash the password and return it. Use the `Check` method to check the password and hash value. Use the `NeedsRehash` method to determine whether a hash value needs to be rehashed after modifying the parameters of the hash function.

```go

facades.Hash.Make("password")
facades.Hash.Check("password", hashedString)
facades.Hash.NeedsRehash(hashedString)
```
