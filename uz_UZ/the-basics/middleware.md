# Middleware

[[toc]]

## Kirish

Middleware sizning ilovangizga kiruvchi HTTP so‘rovlarini tekshirish va filtrlash uchun qulay mexanizmni taqdim etadi.

## Middleware'ni aniqlash

Siz o‘zingizning middleware'ingizni `app/http/middleware` katalogida yaratishingiz mumkin, strukturasi quyidagicha.

```go
package middleware

import (
  "github.com/goravel/framework/contracts/http"
)

func Auth() http.Middleware {
  return func(ctx http.Context) {
    ctx.Request().Next()
  }
}
```

### Middleware'ni buyruq orqali yaratish

```
./artisan make:middleware Auth

// Ichki papkalarni qo‘llab-quvvatlaydi
./artisan make:middleware user/Auth
```

## Middleware'ni ro‘yxatdan o‘tkazish

### Global Middleware

Agar siz middleware'ni ilovangizning har bir HTTP so‘rovi uchun qo‘llamoqchi bo‘lsangiz, faqat `bootstrap/app.go` faylidagi `WithMiddleware` funksiyasida middleware'ni ro‘yxatdan o‘tkazishingiz kifoya.

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithMiddleware(func(handler configuration.Middleware) {
			handler.Append(
				middleware.Custom(),
			)
		}).
		WithConfig(config.Boot).
		Create()
}
```

`handler` middleware'ni boshqarish uchun bir nechta funksiyalarni taqdim etadi:

- `Append(middlewares ...http.Middleware)`: Middleware'ni middleware stekining oxiriga qo‘shish.
- `GetGlobalMiddleware() []http.Middleware`: Barcha global middleware'larni olish.
- `GetRecover() func(ctx http.Context, err any)`: Maxsus tiklash funksiyasini olish.
- `Prepend(middlewares ...http.Middleware)`: Middleware'ni middleware stekining boshiga qo‘shish.
- `Recover(fn func(ctx http.Context, err any)) Middleware`: Panikalarni boshqarish uchun maxsus tiklash funksiyasini o‘rnatish.
- `Use(middleware ...http.Middleware) Middleware`: Joriy middleware stekini berilgan middleware bilan almashtirish.

### Routing uchun Middleware'ni tayinlash

Siz middleware'ni ba‘zi routinglar uchun alohida ro‘yxatdan o‘tkazishingiz mumkin:

```go
import "github.com/goravel/framework/http/middleware"

facades.Route().Middleware(middleware.Auth()).Get("users", userController.Show)
```

## So‘rovni to‘xtatish

Middleware'da, agar so‘rovni to‘xtatish zarur bo‘lsa, `Abort` metodidan foydalanishingiz mumkin.

```go
ctx.Request().Abort()
ctx.Request().Abort(http.StatusNotFound)
ctx.Response().String(http.StatusNotFound, "Not Found").Abort()
```
