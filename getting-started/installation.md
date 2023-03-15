# Installation

[[toc]]

## Server Requirements

- Golang >= 1.18

## Installation

```shell
// Download framework
git clone git@github.com:goravel/goravel.git

// Installation dependencies
cd goravel && go mod tidy

// Create .env environment configuration file
cp .env.example .env

// Generate application key
go run . artisan key:generate
```

## Start HTTP Service

```
go run .
```

## Specify .env File To Start Service

```
go run . --env=../.env
```

### Live reload

Install [cosmtrek/air](https://github.com/cosmtrek/air), Goravel has a built-in configuration file that can be used directly:

```
air
```

If you are using Windows system, you need to modify the `.air.toml` file in the root directory, add the `.exe` suffix to the following two lines:

```
[build]
  bin = "./storage/temp/main.exe"
  cmd = "go build -o ./storage/temp/main.exe ."
```

## Configuration

### Configuration files

All configuration files of the Goravel framework are placed in the `config` directory. All configuration items has annotations, you can adjust it according to your needs.

### Generate Application key

You need to generate the application key after Goravel is installed locally. Running the command below, a 32-bit string will be generated on the `APP_KEY` key in the `.env` file. This key is mainly used for data encryption and decryption.

```
go run. artisan key:generate
```

### Generate JWT Token

You need to generate JWT Token if you use [Authentication](../security/authentication.md).

```
go run . artisan jwt:secret
```

<CommentService/>