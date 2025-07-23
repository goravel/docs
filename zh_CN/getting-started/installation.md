# 安装

[[toc]]

## 服务器要求

- Golang >= 1.21

## 安装

### 使用Goravel安装程序

根据[文档](https://github.com/goravel/installer)初始化安装程序，然后使用以下命令初始化一个新的Goravel项目：

```shell
// 进入您想要安装项目的目录
goravel new blog
```

### 手动安装

```shell
// 下载框架
git clone --depth=1 https://github.com/goravel/goravel.git && rm -rf goravel/.git*

// 安装依赖
cd goravel && go mod tidy

// 创建.env环境配置文件
cp .env.example .env

// 生成应用密钥
go run . artisan key:generate
```

## 启动HTTP服务

### 根据根目录中的.env文件启动服务

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

### 实时重载

安装 [cosmtrek/air](https://github.com/cosmtrek/air)，Goravel 内置了可直接使用的配置文件：

```
air
```

如果您使用的是 Windows 系统，需要修改根目录下的 `.air.toml` 文件，在以下两行末尾添加 `.exe` 后缀：

```shell
[build]
  bin = "./storage/temp/main.exe"
  cmd = "go build -o ./storage/temp/main.exe ."
```

## 配置

### 配置文件

Goravel框架的所有配置文件都放置在`config`目录中。 所有配置项都有注释，您可以根据需要进行调整。 All configuration items have annotations, you can adjust them according to your needs.

### 生成应用程序密钥

在Goravel本地安装后，您需要生成应用程序密钥。 运行以下命令，将在`.env`文件的`APP_KEY`键上生成一个32位字符串。 这个密钥主要用于数据加密和解密。 Running the command below, a 32-bit string will be generated on the `APP_KEY` key in the `.env` file. This key is mainly used for data encryption and decryption.

```shell
go run . artisan key:generate
```

### 生成JWT令牌

如果您使用[身份验证](../security/authentication)，则需要生成JWT令牌。

```shell
go run . artisan jwt:secret
```

### 加解密 env 文件

然后再生产环境使用 `env:decrypt` 命令来解密 env 文件：

```shell
go run . artisan env:encrypt

// 指定文件名与秘钥
go run . artisan env.encrypt --name .env.safe --key BgcELROHL8sAV568T7Fiki7krjLHOkUc
```

你也许想将生产环境的 env 文件添加到版本控制中，但又不想将敏感信息暴露出来，这时你可以使用 `env:encrypt` 命令来加密 env 文件：

```shell
GORAVEL_ENV_ENCRYPTION_KEY=BgcELROHL8sAV568T7Fiki7krjLHOkUc go run . artisan env:decrypt

// or
go run . artisan env.decrypt --name .env.safe --key BgcELROHL8sAV568T7Fiki7krjLHOkUc
```
