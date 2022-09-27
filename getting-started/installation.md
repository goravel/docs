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

### Live reload

Built-in [cosmtrek/air](https://github.com/cosmtrek/air) configuration file which can be used directly.

```
air
```

## Configuration

### Configuration files

All configuration files of the Goravel framework are placed in the `config` directory. All configuration items has annotations, you can adjust it according to your needs.

### Application key

You need to generate the application key after Goravel is installed locally. Running the command below, a 32-bit string will be generated on the `APP_KEY` key in the `.env` file. This key is mainly used for data encryption and decryption.

```
go run. artisan key:generate
```
