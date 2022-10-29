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
