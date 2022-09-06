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

`go run .`

Built-in [cosmtrek/air](https://github.com/cosmtrek/air) configuration file, which can be used directly.

`air`

## Configuration

### Configuration files

All configuration files of the Goravel framework are placed in the `config` directory. No configuration item has a comment, you can adjust it according to your own needs.

### Application key

After Goravel is installed locally, the application key is generated. After running the `go run. Artisan key:generate` command, a 32-bit string will be generated on the `APP_KEY` key of the `.env` file. This key is mainly used for data encryption and decryption.
