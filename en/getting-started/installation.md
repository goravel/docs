# Installation

[[toc]]

## Server Requirements

- Golang >= 1.23

## Installation

### Using Goravel Installer

Initialize the installer according to the [documentation](https://github.com/goravel/installer), and then initialize a new Goravel project using the following command:

```shell
// Install the latest version of the goravel installer
go install github.com/goravel/installer/goravel@latest

// Enter the directory where you want to install the project
goravel new blog
```

### Manual Installation

```shell
// Download framework
git clone --depth=1 https://github.com/goravel/goravel.git && rm -rf goravel/.git*

// Install dependencies
cd goravel && go mod tidy

// Create .env environment configuration file
cp .env.example .env

// Generate application key
go run . artisan key:generate
```

Please confirm your network if you encounter slow download dependencies.

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

Install [air-verse/air](https://github.com/air-verse/air), Goravel has a built-in configuration file that can be used directly:

```
air
```

#### 🧰 After Installing Air

Once you have successfully installed Air, you need to make sure it can be executed properly within your environment.  
Depending on your setup, Air might not be automatically available as a command.  
Here are two simple ways to ensure it runs correctly:

---

#### 🪄 Option 1: Using a Helper Script (`air.sh`)

If Air is installed but not recognized as a terminal command, you can create a small helper script that locates and runs it automatically.

1. Create a new file in your project root:
```bash
touch air.sh
chmod +x air.sh
```

2. Add the following content inside air.sh:

```bash
#!/bin/bash
GO_PATH=$(go env GOPATH)
GO_BIN=$GO_PATH/bin/air

if [ ! -f $GO_BIN ]; then
    echo "❌ Air not found. Please install it first:"
    echo "   go install github.com/air-verse/air@latest"
    exit 1
fi

echo "🚀 Starting Air..."
$GO_BIN
```

3. Run your project using:

```bash
./air.sh
```

This ensures Air runs even if your `$PATH` does not include Go binaries.

#### 💡 Option 2: Add Go Bin To PATH (Mac/Linux)

If you prefer to run Air directly without a script, you can add Go bin directory to your PATH.

For Zsh users:

```bash
echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.zshrc
source ~/.zshrc
```

After this setup, you can start your project simply by running:

```bash
air
```

#### ✅ Tip

To verify that Air is installed and accessible, run:

```bash
which air
```

If it doesn't return a valid path (for example `/Users/yourname/go/bin/air`), it means the helper script or the path hasn't been configured yet.

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
go run . artisan env:encrypt --name .env.safe --key BgcELROHL8sAV568T7Fiki7krjLHOkUc
```

Then use the `env:decrypt` command to decrypt the env file in the production environment:

```shell
GORAVEL_ENV_ENCRYPTION_KEY=BgcELROHL8sAV568T7Fiki7krjLHOkUc go run . artisan env:decrypt

// or
go run . artisan env:decrypt --name .env.safe --key BgcELROHL8sAV568T7Fiki7krjLHOkUc
```
