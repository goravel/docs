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

type Auth struct{}

func (a *Auth) Handle(ctx http.Context) {
  ctx.Request().Next()
}

func (a *Auth) Signature() string {
  return "auth"
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

### Middleware'ni Chiqarib Tashlash

`WithoutMiddleware` metodi ma'lum marshrutlarga ota guruhlar tomonidan qo'llaniladigan middleware'ni chetlab o'tish imkonini beradi. Bu ochiq endpointlar, webhook ishlov beruvchilari yoki autentifikatsiya yoki tezlik cheklovini o'tkazib yuborishi kerak bo'lgan marshrutlar uchun foydalidir.

Middleware guruhga qo'llanilgandan so'ng, alohida marshrutlarda `WithoutMiddleware` dan foydalaning:

```go
facades.Route().Middleware(middleware.Auth(), middleware.Throttle("global")).Group(func(router route.Router) {
  router.Get("/dashboard", dashboardController.Index)

  // Bu marshrut throttle middleware'ni chiqarib tashlaydi
  router.Get("/api/webhook", webhookController.Handle).
    WithoutMiddleware(middleware.Throttle("global"))
})
```

Shuningdek, butun guruh uchun middleware'ni chiqarib tashlashingiz mumkin:

```go
facades.Route().Middleware(middleware.Auth()).
  WithoutMiddleware(middleware.Auth()).
  Group(func(router route.Router) {
    router.Get("/public", publicController.Index)
  })
```

> **Eslatma**: Middleware'ni chiqarib tashlash middleware'larni aniqlash uchun `Signature()` metodidan foydalanadi. `WithoutMiddleware` to'g'ri ishlashi uchun har bir middleware noyob imzo qaytarishiga ishonch hosil qiling. O'rnatilgan freymvork middleware'lari allaqachon noyob imzolarni taqdim etadi.

## So‘rovni to‘xtatish

Middleware'da, agar so‘rovni to‘xtatish zarur bo‘lsa, `Abort` metodidan foydalanishingiz mumkin.

```go
ctx.Request().Abort()
ctx.Request().Abort(http.StatusNotFound)
ctx.Response().String(http.StatusNotFound, "Not Found").Abort()
```
