# Marshrutlash

[[toc]]

## Kirish

Goravel marshrutlash moduli `facades.Route()` orqali boshqarilishi mumkin.

## HTTP haydovchisi

Goravel sukut boʻyicha HTTP haydovchisi sifatida [gin](https://github.com/gin-gonic/gin) dan foydalanadi. Boshqa haydovchilardan foydalanish uchun ularni `config/http.go` faylida sozlang. Rasmiy sukut boʻyicha [gin](https://github.com/gin-gonic/gin) va [fiber](https://github.com/gofiber/fiber) qoʻllab-quvvatlanadi.

| Haydovchi | Havola                                                                                               |
| --------- | ---------------------------------------------------------------------------------------------------- |
| Gin       | [https://github.com/goravel/gin](https://github.com/goravel/gin)     |
| Fiber     | [https://github.com/goravel/fiber](https://github.com/goravel/fiber) |

## Sukut boʻyicha marshrutlash fayli

Marshrutlash fayllarini aniqlash uchun oddiygina `routes` katalogiga o‘ting. Sukut bo‘yicha, framework `routes/web.go` faylida joylashgan namunaviy marshrutdan foydalanadi va u `bootstrap/app.go::WithRouting` funksiyasida ro‘yxatdan o‘tkaziladi.

Agar sizga aniqroq boshqaruv kerak bo‘lsa, `routes` katalogiga marshrutlash fayllarini qo‘shishingiz va ularni ham `bootstrap/app.go::WithRouting` funksiyasida ro‘yxatdan o‘tkazishingiz mumkin.

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithRouting(func() {
	      routes.Web()
	    }).
		WithConfig(config.Boot).
		Create()
}
```

## Marshrutlar Ro‘yxatini Olish

Marshrutlar ro‘yxatini ko‘rish uchun `route:list` buyrug‘idan foydalaning:

```shell
./artisan route:list
```

### Marshrutlash usullari

| Usullar     | Harakat                                       |
| ----------- | --------------------------------------------- |
| Guruh       | [Guruh marshrutlash](#group-routing)          |
| Prefiks     | [Marshrut prefiksi](#routing-prefix)          |
| ServeHTTP   | [Marshrutlarni testlash](#testing-routing)    |
| Oling       | [Asosiy marshrutlash](#basic-routing)         |
| Post        | [Asosiy marshrutlash](#basic-routing)         |
| Put         | [Asosiy marshrutlash](#basic-routing)         |
| O‘chirish   | [Asosiy marshrutlash](#basic-routing)         |
| Patch       | [Asosiy marshrutlash](#basic-routing)         |
| Parametrlar | [Asosiy marshrutlash](#basic-routing)         |
| Any         | [Asosiy Marshrutlash](#basic-routing)         |
| Resurs      | [Resurs marshrutlash](#resource-routing)      |
| Static      | [Fayl marshrutlash](#file-routing)            |
| StaticFile  | [Fayl marshrutlash](#file-routing)            |
| StaticFS    | [Fayl marshrutlash](#file-routing)            |
| Middleware  | [Middleware](#middleware)                     |
| GetRoutes   | [Barcha marshrutlarni olish](#get-all-routes) |
| Name        | [Marshrut nomini belgilash](#set-route-name)  |
| Info        | [Marshrut maʼlumotini olish](#get-route-info) |

## Asosiy marshrutlash

```go
facades.Route().Get("/", func(ctx http.Context) http.Response {
  return ctx.Response().Json(http.StatusOK, http.Json{
    "Hello": "Goravel",
  })
})
facades.Route().Post("/", userController.Show)
facades.Route().Put("/", userController.Show)
facades.Route().Delete("/", userController.Show)
facades.Route().Patch("/", userController.Show)
facades.Route().Options("/", userController.Show)
facades.Route().Any("/", userController.Show)
```

## Resurs marshrutlash

```go
import "github.com/goravel/framework/contracts/http"

resourceController := NewResourceController()
facades.Route().Resource("/resource", resourceController)

type ResourceController struct{}
func NewResourceController () *ResourceController {
  return &ResourceController{}
}
// GET /resource
func (c *ResourceController) Index(ctx http.Context) {}
// GET /resource/{id}
func (c *ResourceController) Show(ctx http.Context) {}
// POST /resource
func (c *ResourceController) Store(ctx http.Context) {}
// PUT /resource/{id}
func (c *ResourceController) Update(ctx http.Context) {}
// DELETE /resource/{id}
func (c *ResourceController) Destroy(ctx http.Context) {}
```

## Guruh marshrutlash

```go
facades.Route().Group(func(router route.Router) {
  router.Get("group/{id}", func(ctx http.Context) http.Response {
    return ctx.Response().Success().String(ctx.Request().Query("id", "1"))
  })
})
```

## Marshrut prefiksi

```go
facades.Route().Prefix("users").Get("/", userController.Show)
```

## Fayl marshrutlash

```go
import "net/http"

facades.Route().Static("static", "./public")
facades.Route().StaticFile("static-file", "./public/logo.png")
facades.Route().StaticFS("static-fs", http.Dir("./public"))
```

## Marshrut parametrlari

```go
facades.Route().Get("/input/{id}", func(ctx http.Context) http.Response {
  return ctx.Response().Success().Json(http.Json{
    "id": ctx.Request().Input("id"),
  })
})
```

Batafsil [Soʻrov](./request.md)

## Middleware

```go
import "github.com/goravel/framework/http/middleware"

facades.Route().Middleware(middleware.Cors()).Get("users", userController.Show)
```

Batafsil [Middleware](./middleware.md)

## Barcha marshrutlarni olish

```go
routes := facades.Route().GetRoutes()
```

## Marshrut nomini belgilash

```go
facades.Route().Get("users", userController.Index).Name("users.index")
```

## Marshrut maʼlumotini olish

```go
route := facades.Route().Info("users.index")
```

## Zaxira marshrutlar

`Fallback` usulidan foydalanib, kiruvchi soʻrovga boshqa hech qanday marshrut mos kelmasa bajariladigan marshrutni belgilashingiz mumkin.

```go
facades.Route().Fallback(func(ctx http.Context) http.Response {
  return ctx.Response().String(404, "not found")
})
```

## Cheklov tezligi

### Cheklov tezligi limitlarini belgilash

Goravel berilgan marshrut yoki marshrutlar guruhi uchun trafik miqdorini cheklash uchun foydalanishingiz mumkin boʻlgan kuchli va sozlanishi mumkin boʻlgan cheklov tezligi xizmatlarini oʻz ichiga oladi. Boshlash uchun siz ilovangiz ehtiyojlariga javob beradigan cheklov konfiguratsiyalarini aniqlashingiz kerak, so‘ngra ularni `bootstrap/app.go::WithCallback` funksiyasida ro‘yxatdan o‘tkazishingiz kerak.

Cheklov tezligi limitlari `facades.RateLimiter()` ning `For` usuli yordamida belgilanadi. `For` usuli cheklov tezligi limiti nomini va cheklov tezligi limitiga tayinlangan marshrutlarga qoʻllanilishi kerak boʻlgan limit konfiguratsiyasini qaytaradigan yopilishni qabul qiladi. Cheklov tezligi limiti nomi siz xohlagan har qanday satr boʻlishi mumkin:

```go
func Boot() contractsfoundation.Application {
  return foundation.Setup().
    WithConfig(config.Boot).
    WithCallback(func() {
      facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
        return limit.PerMinute(1000)
      })
    }).
    Create()
}
```

Agar kiruvchi soʻrov belgilangan tezlik chegarasidan oshib ketgan boʻlsa, Goravel tomonidan 429 HTTP holat kodi bilan javob avtomatik ravishda qaytariladi. Agar siz cheklov tezligi tomonidan qaytarilishi kerak boʻlgan oʻz javobingizni belgilamoqchi boʻlsangiz, javob usulidan foydalanishingiz mumkin:

```go
facades.RateLimiter().For("global", func(ctx http.Context) http.Limit {
  return limit.PerMinute(1000).Response(func(ctx http.Context) {
    ctx.Request().AbortWithStatus(http.StatusTooManyRequests)
  })
})
```

Cheklovli so‘rovlar chaqiruvlari kiruvchi HTTP so‘rov namunasini qabul qilganligi sababli, siz kiruvchi so‘rov yoki autentifikatsiyadan o‘tgan foydalanuvchiga asoslanib, tegishli cheklovni dinamik tarzda yaratishingiz mumkin:

```go
facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  // Faraz qilaylik
  if is_vip() {
    return limit.PerMinute(100)
  }

  return nil
})
```

#### Cheklovlarni Segmentlash

Ba‘zan siz cheklovlarni ixtiyoriy qiymat bo‘yicha segmentlarga ajratmoqchi bo‘lishingiz mumkin. Masalan, siz foydalanuvchilarga har bir IP manzili uchun daqiqada 100 marta ma‘lum marshrutga kirish imkoniyatini berishni xohlashingiz mumkin. Buni amalga oshirish uchun cheklovni yaratishda `By` metodidan foydalanishingiz mumkin:

```go
facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  if is_vip() {
    return limit.PerMinute(100).By(ctx.Request().Ip())
  }

  return nil
})
```

Ushbu xususiyatni yana bir misol bilan tushuntirish uchun, marshrutga kirishni autentifikatsiyadan o‘tgan foydalanuvchi IDsi uchun daqiqada 100 marta yoki mehmonlar uchun har bir IP manzili uchun daqiqada 10 marta cheklashimiz mumkin:

```go
facades.RateLimiter().For("global", func(ctx contractshttp.Context) contractshttp.Limit {
  if userID != 0 {
    return limit.PerMinute(100).By(userID)
  }

  return limit.PerMinute(10).By(ctx.Request().Ip())
})
```

#### Bir Nechta Cheklovlar

Agar kerak bo‘lsa, siz berilgan cheklov konfiguratsiyasi uchun cheklovlar massivini qaytarishingiz mumkin. Har bir cheklov marshrut uchun massiv ichida joylashgan tartibda baholanadi:

```go
facades.RateLimiter().ForWithLimits("login", func(ctx contractshttp.Context) []contractshttp.Limit {
  return []contractshttp.Limit{
    limit.PerMinute(500),
    limit.PerMinute(100).By(ctx.Request().Ip()),
  }
})
```

### Cheklovlarni Marshrutlarga Biriktirish

Cheklovlarni marshrutlarga yoki marshrut guruhlariga throttle middleware’i yordamida biriktirish mumkin. Throttle middleware’i marshrutga tayinlamoqchi bo‘lgan cheklov nomini qabul qiladi:

```go
import github.com/goravel/framework/http/middleware

facades.Route().Middleware(middleware.Throttle("global")).Get("/", func(ctx http.Context) http.Response {
  return ctx.Response().Json(200, http.Json{
    "Hello": "Goravel",
  })
})
```

## Cross-Origin Resource Sharing (CORS)

Goravel sukut bo‘yicha CORS’ni yoqilgan holda keladi, konfiguratsiyani `config/cors.go` faylida o‘zgartirish mumkin.

> CORS va CORS sarlavhalari haqida qo‘shimcha ma‘lumot olish uchun iltimos, [CORS bo‘yicha MDN veb hujjatlari](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#The_HTTP_response_headers) bilan tanishib chiqing.
