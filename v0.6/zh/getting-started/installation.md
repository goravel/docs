# 安装

[[toc]]

## 服务器要求

- Golang >= 1.18

## 安装 Goravel

```shell
// 下载框架
git clone git@github.com:goravel/goravel.git

// 安装依赖
cd goravel && go mod tidy

// 创建 .env 环境配置文件
cp .env.example .env

// 生成应用密钥
go run . artisan key:generate
```

## 启动 HTTP 服务

`go run .`

框架内置 [cosmtrek/air](https://github.com/cosmtrek/air) 配置文件，可直接使用

`air`

## 配置

### 配置文件

Goravel 框架所有的配置文件都放在 `config` 目录中。没有配置项都有注释，可以根据自身需求进行调整。

### 应用密钥

Goravel 安装到本地后，要生成应用程序的密钥。运行 `go run . artisan key:generate` 命令后会在 `.env` 文件的 `APP_KEY` 键上生成 32 为字符串，该密钥主要作用于数据加解密等功能。
