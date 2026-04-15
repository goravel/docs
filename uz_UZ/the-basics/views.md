# Ko‘rishlar

[[toc]]

## Kirish

Albatta, marshrutlaringiz va kontrollerlaringizdan to‘liq HTML hujjatlarini to‘g‘ridan-to‘g‘ri qaytarish amaliy emas. Yaxshiyamki, ko‘rishlar barcha HTML kodimizni alohida fayllarga joylashtirishning qulay usulini taqdim etadi. Ko‘rishlar kontroller/dastur mantiqini taqdimot mantiqidan ajratadi va ular `resources/views` katalogida saqlanadi.

## Ko‘rishlarni Yaratish & Ko‘rsatish

Goravelning standart `html/template` shablonidan foydalanganda, dastur `resources/views` katalogida `.tmpl` kengaytmali fayl qo‘shib ko‘rishlarni yaratishingiz mumkin.

```
// resources/views/welcome.tmpl
{{ define "welcome.tmpl" }}
<html>
  <body>
  <h1>Salom, {{ .name }}</h1>
  </body>
</html>
{{ end }}
```

Ko‘rishni yaratgandan so‘ng, dasturdagi marshrut yoki kontrollerdan ko‘rishni qaytarish uchun `View` metodidan foydalanishingiz mumkin:

```go
facades.Route().Get("/", func(ctx http.Context) http.Response {
  return ctx.Response().View().Make("welcome.tmpl", map[string]any{
    "name": "Goravel",
  })
})
```

### Ichki Ko‘rish Kataloglari

Ko‘rishlar, shuningdek, `resources/views` katalogining ichki kataloglarida joylashgan bo‘lishi mumkin. Masalan, agar ko‘rishingiz `resources/views/admin/profile.tmpl` manzilida saqlangan bo‘lsa, uni dasturingizning marshrutlari yoki kontrollerlaridan biridan qaytarishingiz mumkin. E‘tibor bering, ko‘rish quyidagicha `define "admin/profile.tmpl"` sifatida aniqlanishi kerak:

```go
// resources/views/admin/profile.tmpl
{{ define "admin/profile.tmpl" }}
<h1>Admin paneliga xush kelibsiz</h1>
{{ end }}

ctx.Response().View().Make("admin/profile.tmpl", map[string]any{
  "name": "Goravel",
})
```

### Mavjud Birinchi Ko‘rishni Yaratish

`First` metodidan foydalanib, berilgan ko‘rishlar massividagi mavjud birinchi ko‘rishdan foydalanishingiz mumkin. Bu, agar dasturingiz yoki paketingiz ko‘rishlarni sozlash yoki ustidan yozishga imkon bersa, foydali bo‘lishi mumkin:

```go
ctx.Response().View().First([]string{"custom/admin.tmpl", "admin.tmpl"}, map[string]any{
  "name": "Goravel",
})
```

### Ko‘rish Mavjudligini Aniqlash

Agar ko‘rish mavjudligini aniqlash kerak bo‘lsa, `facades.View()` metodidan foydalanishingiz mumkin:

```go
if facades.View().Exist("welcome.tmpl") {
  // ...
}
```

## Ko‘rishlarga Ma'lumot O‘tkazish

Oldingi misollarda ko‘rganingizdek, ko‘rishlarga ma'lumot massivini o‘tkazib, bu ma'lumotni ko‘rish uchun mavjud qilishingiz mumkin. Iltimos, o‘tkazilgan ma'lumot formati ishlatiladigan shablon haydovchisiga qarab o‘zgarishi kerakligini unutmang. Quyidagi misolda standart `html/template` haydovchisi ishlatilmoqda:

```go
facades.Route().Get("/", func(ctx http.Context) http.Response {
  return ctx.Response().View().Make("welcome.tmpl", map[string]any{
    "name": "Goravel",
  })
})
```

### Barcha Ko‘rishlar bilan Ma'lumot Ulashish

Ba'zan, dasturingiz tomonidan ko‘rsatiladigan barcha ko‘rishlar bilan ma'lumot ulashishingiz kerak bo‘lishi mumkin. Buni `facades.View()` dagi `Share` funksiyasidan foydalanib amalga oshirishingiz mumkin. Odatda, `Share` funksiyasiga chaqiruvlarni `bootstrap/app.go::WithCallback` funksiyasiga joylashtirishingiz kerak:

```go
func Boot() contractsfoundation.Application {
  return foundation.Setup().
    WithConfig(config.Boot).
    WithCallback(func() {
      facades.View().Share("key", "value")
    }).
    Create()
}
```

## CSRF Token Middleware

Bu middleware marshrutlarga qo‘llanilishi mumkin, bu esa so‘rovlar autentifikatsiyadan o‘tgan manbalardan kelayotganligini va Saytlararo So‘rov Soxtalashtirish (CSRF) hujumlariga qarshi himoyani ta'minlaydi.

::: v-pre

1. Middleware'ni (`github.com/goravel/framework/http/middleware::VerifyCsrfToken(exceptPaths)`) global yoki ma'lum bir marshrutga ro‘yxatdan o‘tkazing.
2. CSRF tokenini o‘z ichiga olish uchun ko‘rish faylidagi formangizga `<input type="hidden" name="_token" value="{{ .csrf_token }}" />` qo‘shing yoki so‘rov sarlavhangizga `X-CSRF-TOKEN={{ .csrf_token }}` qo‘shing.
3. Middleware forma topshirilganda tokenni avtomatik tekshiradi.
   :::

## Maxsus Delims va Funksiyalarni Ro‘yxatdan O‘tkazish

Ko‘rishlaringiz ichida ishlatilishi uchun maxsus Delims va funksiyalarni ro‘yxatdan o‘tkazishingiz mumkin, ular `http.drivers.*.template` konfiguratsiyasida ro‘yxatdan o‘tkazilishi mumkin.

Gin haydovchisi uchun:

```go
// config/http.go
import (
  "html/template"

  "github.com/gin-gonic/gin/render"
  "github.com/goravel/gin"
)

"template": func() (render.HTMLRender, error) {
  return gin.NewTemplate(gin.RenderOptions{
    Delims: &gin.Delims{
      Left:  "{{",
      Right: "}}",
    },
    FuncMap: template.FuncMap{
      // Maxsus shablon funksiyalarini shu yerda qo‘shing
    },
  })
},
```

Fiber haydovchisi uchun:

```go
// config/http.go
import (
  "github.com/gofiber/fiber/v2"
  "github.com/gofiber/template"
  "github.com/gofiber/template/html/v2"
  "github.com/goravel/framework/support/path"
)

"template": func() (fiber.Views, error) {
  engine := &html.Engine{
    Engine: template.Engine{
      Left:       "{{",
      Right:      "}}",
      Directory:  path.Resource("views"),
      Extension:  ".tmpl",
      LayoutName: "embed",
      // Maxsus shablon funksiyalarini shu yerda qo‘shing
      Funcmap:    make(map[string]interface{}),
    },
  }

  engine.AddFunc(engine.LayoutName, func() error {
    return fmt.Errorf("layoutName called unexpectedly")
  })
  return engine, nil
},
```

## Maxsus Shablon Dvigatellari

Ginning `render.HTMLRender` interfeysi yoki fiberning `fiber.Views` interfeysini amalga oshirib, o‘zingizning maxsus shablon dvigatellaringizni yaratishingiz mumkin. Maxsus dvigatelni yaratgandan so‘ng, uni `http.drivers.*.template` konfiguratsiyasiga ro‘yxatdan o‘tkazishingiz mumkin.

## Ilg‘or Xususiyatlar

`http/template` standart shablon dvigatelidir, ilg‘or xususiyatlar uchun rasmiy hujjatga murojaat qilishingiz mumkin: https://pkg.go.dev/html/template.
