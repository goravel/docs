# 安装

[[toc]]

## 服务要求

- Golang >= 1.23

## 安装 Goravel

### 使用 Goravel 安装器

根据[文档](https://github.com/goravel/installer)初始化安装器，然后使用下面命令初始化一个新的 Goravel 项目：

```shell
// 进入想要安装项目的目录
goravel new blog
```

### 手动安装

```shell
// 下载框架
git clone --depth=1 https://github.com/goravel/goravel.git && rm -rf goravel/.git*

// 安装依赖
cd goravel && go mod tidy

// 创建 .env 环境配置文件
cp .env.example .env

// 生成应用密钥
go run . artisan key:generate
```

如果安装依赖较慢，请使用国内代理，[详见文章](https://learnku.com/go/wikis/38122)。

## 启动 HTTP 服务

### 根据根目录下的 .env 文件启动服务

```shell
go run .
```

### 指定 .env 文件启动服务

```shell
go run . --env=../.env
```

### 使用环境变量启动服务

```shell
APP_ENV=production APP_DEBUG=true go run .
```

### 热更新

安装 [cosmtrek/air](https://github.com/cosmtrek/air)，框架内置配置文件，可直接使用：

```
air
```

#### 🧰 安装 Air 后

安装了 Air 成功后，你需要确保它能够在你的环境中正确执行。  
根据你的环境设置，Air 可能不能自动成为一个有效的命令。  
以下是确保正确运行的两种简单方式：

---

#### 🪄 选项 1: 使用一个 Helper 脚本 (`air.sh`)

如果 Air 已安装但无法被识别为一个终端命令，你可以创建一个脚本，自动定位和运行它。

1. 在你的项目根目录创建一个文件：

```bash
touch air.sh
chmod +x air.sh
```

2. 在 `air.sh` 中添加以下内容：

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

3. 使用以下方式运行你的项目：

```bash
./air.sh
```

这样会确保 Air 正常运行即使你的 `$PATH` 中没有包含 Go 软件库。

#### 💡 Option 2: Add Go Bin To PATH (Mac/Linux)

If you prefer to run Air directly without a script, you can define an alias in your shell configuration file.

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

如果是 Windows 系统，需要修改根目录下 `.air.toml` 文件，为下面两行增加 `.exe` 后缀：

```shell
[build]
  bin = "./storage/temp/main.exe"
  cmd = "go build -o ./storage/temp/main.exe ."
```

## 配置

### 配置文件

Goravel 框架所有的配置文件都放在 `config` 目录中。 每个配置项都有注释，可以根据自身需求进行调整。

### 生成密钥

Goravel 安装到本地后，要生成应用程序的密钥。 运行下面命令后会在 `.env` 文件的 `APP_KEY` 键上生成 32 位字符串。 该密钥主要作用于数据加解密等功能。

```shell
go run . artisan key:generate
```

### 生成 JWT Token

如果使用到了 [用户认证](../security/authentication.md) 功能，需要初始化 JWT Token。

```shell
go run . artisan jwt:secret
```

### 加解密 env 文件

你也许想将生产环境的 env 文件添加到版本控制中，但又不想将敏感信息暴露出来，这时你可以使用 `env:encrypt` 命令来加密 env 文件：

```shell
go run . artisan env:encrypt

// 指定文件名与秘钥
go run . artisan env:encrypt --name .env.safe --key BgcELROHL8sAV568T7Fiki7krjLHOkUc
```

然后再生产环境使用 `env:decrypt` 命令来解密 env 文件：

```shell
GORAVEL_ENV_ENCRYPTION_KEY=BgcELROHL8sAV568T7Fiki7krjLHOkUc go run . artisan env:decrypt

// or
go run . artisan env:decrypt --name .env.safe --key BgcELROHL8sAV568T7Fiki7krjLHOkUc
```
