# Installation

[[toc]]

## Server Requirements

- Golang >= 1.21

## Installation


### Using Goravel Installer

Initialize the installer according to the [documentation](https://github.com/goravel/installer), and then initialize a new Goravel project using the following command:

```shell
// Enter the directory where you want to install the project
goravel new blog
```

### Manual Installation

```shell
// Download framework
git clone https://github.com/goravel/goravel.git && rm -rf goravel/.git*

// Install dependencies
cd goravel && go mod tidy

// Create .env environment configuration file
cp .env.example .env

// Generate application key
go run . artisan key:generate
```

## Start HTTP Service

### Start Service According To .env File In The Root Directory

```shell
go run .
```

### Specify .env File To Start Service

```shell
go run . --env=./.env
```

### Start Service Using Environment Variables

```shell
APP_ENV=production APP_DEBUG=true go run .
```

### Live reload

Install [cosmtrek/air](https://github.com/cosmtrek/air), Goravel has a built-in configuration file that can be used directly:

```
air
```

If you are using Windows system, you need to modify the `.air.toml` file in the root directory, and add the `.exe` suffix to the following two lines:

```shell
[build]
  bin = "./storage/temp/main.exe"
  cmd = "go build -o ./storage/temp/main.exe ."
```

## Configuration

### Configuration files

All configuration files of the Goravel framework are placed in the `config` directory. All configuration items have annotations, you can adjust them according to your needs.

### Generate Application key

You need to generate the application key after Goravel is installed locally. Running the command below, a 32-bit string will be generated on the `APP_KEY` key in the `.env` file. This key is mainly used for data encryption and decryption.

```shell
go run . artisan key:generate
```

### Generate JWT Token

You need to generate JWT Token if you use [Authentication](../security/authentication.md).

```shell
go run . artisan jwt:secret
```

### Encrypt and decrypt env file

You may want to add the production environment env file to version control, but you don't want to expose sensitive information, you can use the `env:encrypt` command to encrypt the env file:

```shell
go run . artisan env:encrypt

// Specify the file name and key
go run . artisan env.encrypt --name .env.safe --key BgcELROHL8sAV568T7Fiki7krjLHOkUc
```

Then use the `env:decrypt` command to decrypt the env file in the production environment:

```shell
GORAVEL_ENV_ENCRYPTION_KEY=BgcELROHL8sAV568T7Fiki7krjLHOkUc go run . artisan env:decrypt

// or
go run . artisan env.decrypt --name .env.safe --key BgcELROHL8sAV568T7Fiki7krjLHOkUc
```

<CommentService/>
