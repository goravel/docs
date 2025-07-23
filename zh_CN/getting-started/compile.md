# 编译

[[toc]]

## 编译命令

Goravel 项目可以使用以下命令进行编译：

```
// 选择要编译的系统
go run . artisan build

// 指定要编译的系统
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

在部署过程中，需要将以下文件和文件夹上传到服务器：

```
./main // 编译生成的二进制文件
.env
./database
./public
./storage
./resources
```

### 静态编译

通过常规编译的包也需要依赖部署环境的支持，而静态编译的文件可以自由地放在指定平台上运行，无需环境配置。

```shell
go build --ldflags "-extldflags -static" -o main .
```

### 交叉编译

编译根据平台有所区分，您需要根据部署情况选择匹配的编译方法。

```shell
// 编译Linux环境
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build .

// 编译Windows环境
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build .

// 编译Mac环境
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build .
```

## Docker

Goravel有一个默认的`Dockerfile`和`docker-compose.yml`文件，您可以直接使用它，注意此时`APP_HOST`应该为`0.0.0.0`。

```shell
docker build .
```

### Docker Compose

您也可以使用以下命令快速启动服务：

```shell
docker-compose build
docker-compose up
```

> 注意：如果需要外部访问，你需要将APP_HOST更改为0.0.0.0

## 设置时区

当你在 `app.timezone` 配置中非 `UTC` 时区时，在编译时需要通过将时区设置到应用中，可以选择下面三种方式中的任意一种： You can choose any of the following three methods:

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

## 减少包大小

在`config/app.go::providers`中注释掉未使用的`ServiceProvider`将有效减少打包体积。
