# 编译

[[toc]]

## 编译命令

Goravel 项目可以通过以下命令编译：

```
// 选择系统进行编译
go run . artisan build

// 指定系统进行编译
go run . artisan build --os=linux
go run . artisan build -o=linux

// 静态编译
go run . artisan build --static
go run . artisan build -s

// 指定输出文件名
go run . artisan build --name=goravel
go run . artisan build -n=goravel
```

## 手动编译

### 常规编译

```shell
go build .
```

#### 部署服务器

部署时需要将下列文件与文件夹上传至服务器：

```
./main // 编译生成的二进制文件
.env
./public
./storage
./resources
```

### 静态编译

常规编译后的包还需要依赖部署环境的支持，静态编译出的文件可以任意放到指定平台下运行，不需要环境配置。

```shell
go build --ldflags "-extldflags -static" -o main .
```

### 交叉编译

编译有平台区分，需要根据部署情况，选择匹配的编译方式。

```shell
// 编译 Linux 环境
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build .

// 编译 Windows 环境
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build .

// 编译 Mac 环境
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build .
```

## Docker

Goravel 默认自带 `Dockerfile` 与 `docker-compose.yml` 文件，可以直接使用，注意此时 `APP_HOST` 应为 `0.0.0.0`。

```shell
docker build .
```

国内会有下载依赖较慢与时区问题，可以将 Dockerfile 内容替换为下面脚本：

```
FROM golang:alpine AS builder

ENV GO111MODULE=on \
    CGO_ENABLED=0  \
    GOARCH="amd64" \
    GOOS=linux   \
    GOPROXY=https://goproxy.cn,direct

WORKDIR /build
COPY . .
RUN go mod tidy
RUN go build --ldflags "-extldflags -static" -o main .

FROM alpine:latest

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories
RUN apk add tzdata && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone
WORKDIR /www

COPY --from=builder /build/main /www/
COPY --from=builder /build/database/ /www/database/
COPY --from=builder /build/public/ /www/public/
COPY --from=builder /build/storage/ /www/storage/
COPY --from=builder /build/resources/ /www/resources/
COPY --from=builder /build/.env /www/.env

ENTRYPOINT ["/www/main"]
```

### Docker Compose

您也可以使用以下命令快速启动服务：

```shell
docker-compose build
docker-compose up
```

> 注意：如需外部访问，需要将 APP_HOST 改为 0.0.0.0

## 设置时区

当你在 `app.timezone` 配置中非 `UTC` 时区时，在编译时需要通过将时区设置到应用中，可以选择下面三种方式中的任意一种：

1. 在 Dockerfile 中添加时区设置

```
RUN apk add tzdata && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo "Asia/Shanghai" > /etc/timezone
```

2. 在编译时设置时区

```
go build -tags timetzdata .
```

3. 在 `main.go` 中导入时区

```shell
import (
    _ "time/tzdata"
)
```

## 减小打包体积

将 `config/app.go::providers` 中未用到的 `ServiceProvider` 注释掉将能有效地减少打包体积。
