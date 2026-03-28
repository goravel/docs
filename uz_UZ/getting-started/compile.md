# Compile

[[toc]]

## Compile command

The Goravel project can be compiled with the following command:

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

## Manual compilation

### Regular compilation

```shell
go build .
```

#### Deploy Server

The Following files and folders need to be uploaded to the server during deployment:

```
.env
./main // Compile the resulting binary file
./public // if exists
./resources // if exists
```

### Static compilation

The package by regular compilation also needs to rely on the support of the deployment environment, the statically compiled files can be freely put to run on the specified platform without environment configuration.

```shell
go build --ldflags "-extldflags -static" -o main .
```

### Cross compile

Compilation is differentiated by platform, you need to select a matching compilation method according to the deployment situation.

```shell
// Compile Linux environment
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build .

// Compile Windows environment
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build .

// Compile Mac environment
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build .
```

## Docker

Goravel has a default `Dockerfile` and `docker-compose.yml` file, you can use it directly, note that `APP_HOST` should be `0.0.0.0` at this time.

```shell
docker build .
```

If you encounter slow download dependencies and time zone issues, you can optimize the Dockerfile content like the following script:

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

You can also quickly start the service with the following command:

```shell
docker-compose build
docker-compose up
```

> Note: If you need external access, you need to change APP_HOST to 0.0.0.0

## Set timezone

When the `app.timezone` configuration is not `UTC`, you need to set the timezone to the application during compilation. You can choose any of the following three methods:

1. Add timezone settings in Dockerfile

```
RUN apk add tzdata && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo "Asia/Shanghai" > /etc/timezone
```

2. Set timezone during compilation

```
go build -tags timetzdata .
```

3. Import timezone in `main.go`

```shell
import (
    _ "time/tzdata"
)
```
