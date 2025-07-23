# Hashing

[[toc]]

## Introduction

The Goravel `facades.Hash()` provides secure Argon2id and Bcrypt hashing for storing user passwords. If you are using
one of the Goravel application starter kits, Argon2id will be used for registration and authentication by default.

## Configuration

The default hashing driver for your application is configured in your application's `config/hashing.go` configuration
file. There are currently several supported drivers: Argon2id and Bcrypt.

## Basic Usage

### Hashing Passwords

You may hash a password by calling the `Make` method on the `facades.Hash()`:

```go
password, err := facades.Hash().Make(password)
```

### Verifying That A Password Matches A Hash

The `Check` method provided by the Hash facade allows you to verify that a given plain-text string corresponds to a
given hash:

```go
if facades.Hash().Check('plain-text', hashedPassword) {
    // The passwords match...
}
```

### Determining If A Password Needs To Be Rehashed

The `NeedsRehash` method provided by the Hash facade allows you to determine if the work factor used by the hasher has
changed since the password was hashed. Some applications choose to perform this check during the application's
authentication process:

```go
if facades.Hash().NeedsRehash(hashed) {
     hashed = facades.Hash().Make('plain-text');
}
```
