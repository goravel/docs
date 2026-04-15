# Tuzish

[[toc]]

## Tuzish buyrug‘i

Goravel loyihasini quyidagi buyruq orqali tuzish mumkin:

```shell
# Tuzish uchun tizimni tanlash
./artisan build

# Tuzish uchun tizimni ko‘rsatish
./artisan build --os=linux
./artisan build -o=linux

# Statik tuzish
./artisan build --static
./artisan build -s

# Chiqish fayli nomini ko‘rsatish
./artisan build --name=goravel
./artisan build -n=goravel
```

## Qo‘lda tuzish

### Oddiy tuzish

```shell
go build .
```

#### Serverga joylash

Joylash vaqtida serverga quyidagi fayl va papkalarni yuklash kerak:

```
.env
./main // Tuzish natijasidagi binar fayl
./public // mavjud bo‘lsa
./resources // mavjud bo‘lsa
```

### Statik tuzish

Oddiy tuzish orqali olingan paket joylash muhitining qo‘llab-quvvatlashiga muhtoj bo‘ladi, statik tuzilgan fayllarni esa muayyan platformada muhit sozlamasisiz erkin ishlatish mumkin.

```shell
go build --ldflags "-extldflags -static" -o main .
```

### Platformalararo tuzish

Tuzish platformaga qarab farqlanadi, joylash holatiga mos tuzish usulini tanlashingiz kerak.

```shell
// Linux muhiti uchun tuzish
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build .

// Windows muhiti uchun tuzish
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build .

// Mac muhiti uchun tuzish
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build .
```

## Docker

Goravelning standart `Dockerfile` va `docker-compose.yml` fayli mavjud, ularni to‘g‘ridan-to‘g‘ri ishlatishingiz mumkin, shu paytda `APP_HOST` `0.0.0.0` bo‘lishi kerakligiga e‘tibor bering.

```shell
docker build .
```

Agar bog‘liqliklarni yuklash sekin va vaqt mintaqasi muammolari duch kelsangiz, Dockerfile mazmunini quyidagi skript kabi optimallashtirishingiz mumkin:

```dockerfile
# Xitoy uchun maxsus

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

# Mavjud bo‘lsa
COPY --from=builder /build/database/ /www/database/
COPY --from=builder /build/public/ /www/public/
COPY --from=builder /build/storage/ /www/storage/
COPY --from=builder /build/resources/ /www/resources/

ENTRYPOINT ["/www/main"]
```

### Docker Compose

Shuningdek, xizmatni quyidagi buyruq orqali tezda ishga tushirishingiz mumkin:

```shell
docker-compose build
docker-compose up
```

> Eslatma: Agar tashqi kirish kerak bo‘lsa, APP_HOST ni 0.0.0.0 ga o‘zgartirishingiz kerak

## Vaqt mintaqasini o‘rnatish

`app.timezone` sozlamasi `UTC` bo‘lmaganda, tuzish vaqtida ilovaga vaqt mintaqasini o‘rnatishingiz kerak. Quyidagi uch usuldan istalgan birini tanlashingiz mumkin:

1. Dockerfile faylida vaqt mintaqasi sozlamalarini qo‘shish

```
RUN apk add tzdata && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo "Asia/Shanghai" > /etc/timezone
```

2. Tuzish vaqtida vaqt mintaqasini o‘rnatish

```
go build -tags timetzdata .
```

3. `main.go` faylida vaqt mintaqasini import qilish

```shell
import (
    _ "time/tzdata"
)
```
