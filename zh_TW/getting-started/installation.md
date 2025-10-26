# 安裝

[[toc]]

## 伺服器要求

- Golang >= 1.23

## 安裝

### 使用 Goravel 安裝器

根據[文檔](https://github.com/goravel/installer)初始化安裝器，然後使用以下命令初始化一個新的 Goravel 項目：

```shell
// 進入想要安裝項目的目錄
goravel new blog
```

### 手動安裝

```shell
// 下載框架
git clone --depth=1 https://github.com/goravel/goravel.git && rm -rf goravel/.git*

// 安裝依賴
cd goravel && go mod tidy

// 創建 .env 環境配置文件
cp .env.example .env

// 生成應用密鑰
go run . artisan key:generate
```

如果您遇到下載依賴緩慢的情況，請確認您的網絡。

## 啟動 HTTP 服務

### 根據根目錄中的 .env 文件啟動服務

```shell
go run .
```

### 指定 .env 文件啟動服務

```shell
go run . --env=./.env
```

### 使用環境變量啟動服務

```shell
APP_ENV=production APP_DEBUG=true go run .
```

### 即時重新加載

安裝 [cosmtrek/air](https://github.com/cosmtrek/air)，Goravel 具備可以直接使用的內建配置文件：

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

If it doesn't return a valid path (for example `/Users/yourname/go/bin/air`), it means the alias or helper script hasn't been configured yet.

如果您使用的是 Windows 系統，則需要修改根目錄中的 `.air.toml` 文件，並為以下兩行添加 `.exe` 後綴：

```shell
[build]
  bin = "./storage/temp/main.exe"
  cmd = "go build -o ./storage/temp/main.exe ."
```

## 配置

### 配置文件

Goravel 框架的所有配置文件被放置在 `config` 目錄中。 所有配置項都有註解，您可以根據需要進行調整。

### 生成應用密鑰

在本地安裝 Goravel 後，您需要生成應用密鑰。 運行以下命令後，會在 `.env` 文件的 `APP_KEY` 鍵上生成 32 位字符串。 此密鑰主要用於數據加解密。

```shell
go run . artisan key:generate
```

### 生成JWT Token

如果您使用到 [身份驗證](../security/authentication.md) 功能，則需要生成 JWT Token。

```shell
go run . artisan jwt:secret
```

### 加解密 env 文件

您可能希望將生產環境的 env 文件添加到版本控制中，但不想暴露敏感信息，您可以使用 `env:encrypt` 命令加密 env 文件：

```shell
go run . artisan env:encrypt

// 指定文件名與密鑰
go run . artisan env:encrypt --name .env.safe --key BgcELROHL8sAV568T7Fiki7krjLHOkUc
```

然後在生產環境中使用 `env:decrypt` 命令來解密 env 文件：

```shell
GORAVEL_ENV_ENCRYPTION_KEY=BgcELROHL8sAV568T7Fiki7krjLHOkUc go run . artisan env:decrypt

// or
go run . artisan env:decrypt --name .env.safe --key BgcELROHL8sAV568T7Fiki7krjLHOkUc
```
