# 编译

[[toc]]

## 常规编译

```
go build .
```

## 静态编译

常规编译后的包还需要依赖部署环境的支持，静态编译出的文件可以任意放到指定平台下运行，不需要环境配置。

```
go build --ldflags "-extldflags -static" -o main .
```

## 交叉编译

编译有平台区分，需要根据部署情况，选择匹配的编译方式。

```
// 编译 Linux 环境
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build .

// 编译 Windows 环境
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build .

// 编译 Mac 环境
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build .
```

## Docker

Goravel 默认自带一个 Dockerfile 文件，可以直接使用。

```
docker build .
```

国内会有下载依赖较慢与时区问题，可以将 Doockerfile 内容替换为下面脚本：

```
FROM golang:1.18.3-alpine3.16 AS builder

ENV GO111MODULE=on \
    CGO_ENABLED=0  \
    GOARCH="amd64" \
    GOOS=linux   \
    GOPROXY=https://goproxy.cn,direct

WORKDIR /build
COPY . .
RUN go mod tidy
RUN go build --ldflags "-extldflags -static" -o main .

FROM alpine:3.16

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories
RUN apk add tzdata && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone
WORKDIR /www

COPY --from=builder /build/main /www/
COPY --from=builder /build/database/ /www/database/
COPY --from=builder /build/public/ /www/public/
COPY --from=builder /build/storage/ /www/storage/
COPY --from=builder /build/.env /www/.env

ENTRYPOINT ["/www/main"]
```
