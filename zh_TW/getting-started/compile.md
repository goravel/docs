# 編譯

[[toc]]

## 編譯命令

Goravel 專案可以透過以下命令編譯：

```shell
# Select the system to compile
./artisan build

# Specify the system to compile
./artisan build --os=linux
./artisan build -o=linux

# Static compilation
./artisan build --static
./artisan build -s

# Specify the output file name
./artisan build --name=goravel
./artisan build -n=goravel
```

## 手動編譯

### 常規編譯

```shell
go build .
```

#### 部署伺服器

部署時需要將下列檔案與資料夾上傳至伺服器：

```
.env
./main // Compile the resulting binary file
./public // if exists
./resources // if exists
```

### 靜態編譯

常規編譯後的包還需要依賴部署環境的支持，靜態編譯出的檔案可以自由放到指定平台下運行，不需要環境配置。

```shell
go build --ldflags "-extldflags -static" -o main .
```

### 交叉編譯

編譯有平台區分，需要根據部署情況，選擇匹配的編譯方式。

```shell
// 編譯 Linux 環境
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build .

// 編譯 Windows 環境
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build .

// 編譯 Mac 環境
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build .
```

## Docker

Goravel 預設自帶 `Dockerfile` 與 `docker-compose.yml` 檔案，可以直接使用，注意此時 `APP_HOST` 應為 `0.0.0.0`。

```shell
docker build .
```

如果你遇到下載依賴較慢與時區問題，你可以像下面的腳本一樣優化 Dockerfile 內容：

```dockerfile
# China Special

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
COPY --from=builder /build/.env /www/.env
COPY --from=builder /build/main /www/

# If exists
COPY --from=builder /build/database/ /www/database/
COPY --from=builder /build/public/ /www/public/
COPY --from=builder /build/storage/ /www/storage/
COPY --from=builder /build/resources/ /www/resources/

ENTRYPOINT ["/www/main"]
```

### Docker Compose

你也可以使用以下命令快速啟動服務：

```shell
docker-compose build
docker-compose up
```

> 注意：如需外部訪問，需要將 APP_HOST 改為 0.0.0.0

## 設置時區

當 `app.timezone` 配置中非 `UTC` 時區時，在編譯時需要將時區設置到應用中。 你可以選擇以下三種方式中的任何一種：

1. 在 Dockerfile 中添加時區設置

```
RUN apk add tzdata && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo "Asia/Shanghai" > /etc/timezone
```

2. 在編譯時設置時區

```
go build -tags timetzdata .
```

3. 在 `main.go` 中導入時區

```shell
import (
    _ "time/tzdata"
)
```
