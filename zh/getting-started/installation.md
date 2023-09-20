# 安装

[[toc]]

## 服务器要求

- Golang >= 1.18

## 安装 Goravel

Linux / MacOS

```shell
// 下载框架
git clone https://github.com/goravel/goravel.git && rm -rf goravel/.git*

// 安装依赖
cd goravel && go mod tidy

// 创建 .env 环境配置文件
cp .env.example .env

// 生成应用密钥
go run . artisan key:generate
```

Windows

```shell
// 下载框架
git clone https://github.com/goravel/goravel.git
rm -rf goravel/.git*

// 安装依赖
cd goravel
go mod tidy

// 创建 .env 环境配置文件
cp .env.example .env

// 生成应用密钥
go run . artisan key:generate
```

如果安装依赖较慢，请使用国内代理，[详见文章](https://learnku.com/go/wikis/38122)。

## 启动 HTTP 服务

```shell
go run .
```

## 指定 .env 文件启动服务

```shell
go run . --env=../.env
```

### 热更新

安装 [cosmtrek/air](https://github.com/cosmtrek/air)，框架内置配置文件，可直接使用：

```shell
air
```

如果是 Windows 系统，需要修改根目录下 `.air.toml` 文件，为下面两行增加 `.exe` 后缀：

```
[build]
  bin = "./storage/temp/main.exe"
  cmd = "go build -o ./storage/temp/main.exe ."
```

## 配置

### 配置文件

Goravel 框架所有的配置文件都放在 `config` 目录中。每个配置项都有注释，可以根据自身需求进行调整。

### 生成密钥

Goravel 安装到本地后，要生成应用程序的密钥。运行下面命令后会在 `.env` 文件的 `APP_KEY` 键上生成 32 位字符串，该密钥主要作用于数据加解密等功能。

```shell
go run . artisan key:generate
```

### 生成 JWT Token

如果使用到了 [用户认证](../security/authentication.md) 功能，需要初始化 JWT Token。

```shell
go run . artisan jwt:secret
```

<CommentService/>