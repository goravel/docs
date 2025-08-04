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
go run . artisan env.encrypt --name .env.safe --key BgcELROHL8sAV568T7Fiki7krjLHOkUc
```

然后再生产环境使用 `env:decrypt` 命令来解密 env 文件：

```shell
GORAVEL_ENV_ENCRYPTION_KEY=BgcELROHL8sAV568T7Fiki7krjLHOkUc go run . artisan env:decrypt

// or
go run . artisan env.decrypt --name .env.safe --key BgcELROHL8sAV568T7Fiki7krjLHOkUc
```
