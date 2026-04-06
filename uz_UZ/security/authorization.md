# Avtorizatsiya

[[toc]]

## Kirish

Goravel foydalanuvchilarning resurslar ustidagi amallarini boshqarish uchun o‘rnatilgan [autentifikatsiya](./authentication.md) xizmatlari va oson foydalaniladigan avtorizatsiya xususiyatini taklif etadi. Foydalanuvchi autentifikatsiyadan o‘tgan bo‘lsa ham, u ma’lum Eloquent modellarini yoki ma’lumotlar bazasi yozuvlarini o‘zgartirish yoki o‘chirish huquqiga ega bo‘lmasligi mumkin. Goravelning avtorizatsiya xususiyati bu avtorizatsiya tekshiruvlarini tizimli boshqarish usulini taqdim etadi.

Goravelda amallarni avtorizatsiya qilishning ikkita usuli mavjud: [darvoza](#Gates) va [siyosatlar](#Policies). Darvoza va siyosatlarni marshrut va kontrollerlarga o‘xshash deb tasavvur qiling. Darvozalar yopilishlar asosida bo‘lib, oddiy avtorizatsiya yondashuvini taqdim etadi, siyosatlar esa kontrollerlarga o‘xshab, ma’lum bir resurs atrofidagi mantiqni guruhlaydi. Ushbu hujjat avval darvozalarni, keyin esa siyosatlarni batafsil yoritadi.

Ilova yaratishda faqat darvoza yoki faqat siyosatlardan foydalanish shart emas. Ko‘pgina ilovalar ikkalasining kombinatsiyasidan foydalanadi va bu mutlaqo qabul qilinadi!

## Darvozalar

### Darvozalarni yozish

Darvozalar foydalanuvchi ma’lum bir amalni bajarishga ruxsat berilganligini tekshiruvchi yopilishlar vazifasini bajaradi. Ular odatda Gate fasadidan foydalanib, `bootstrap/app.go::WithCallback` funksiyasida o‘rnatiladi.

Bu holatda, biz foydalanuvchi ma’lum bir Post modelini o‘zgartirishga ruxsat berilganligini tekshirish uchun darvoza o‘rnatamiz, buning uchun uning ID sini post muallifining user_id si bilan solishtiramiz.

```go
func Boot() contractsfoundation.Application {
  return foundation.Setup().
    WithConfig(config.Boot).
    WithCallback(func() {
      facades.Gate().Define("update-post",
        func(ctx context.Context, arguments map[string]any) contractsaccess.Response {
          user := ctx.Value("user").(models.User)
          post := arguments["post"].(models.Post)

          if user.ID == post.UserID {
            return access.NewAllowResponse()
          } else {
            return access.NewDenyResponse("error")
          }
        },
      )
    }).
    Create()
}
```

### Amallarni avtorizatsiya qilish

Darvozalar yordamida amalni avtorizatsiya qilish uchun Gate fasadining `Allows` yoki `Denies` metodlaridan foydalanish kerak:

```go
package controllers

import (
  "goravel/app/facades"
)

type UserController struct {

func (r *UserController) Show(ctx http.Context) http.Response {
  var post models.Post
  if facades.Gate().Allows("update-post", map[string]any{
    "post": post,
  }) {

  }
}
```

`Any` yoki `None` metodlaridan foydalanib, bir vaqtning o‘zida bir nechta amallarni avtorizatsiya qilishingiz mumkin.

```go
if facades.Gate().Any([]string{"update-post", "delete-post"}, map[string]any{
  "post": post,
}) {
  // Foydalanuvchi postni yangilashi yoki o‘chirishi mumkin...
}

if facades.Gate().None([]string{"update-post", "delete-post"}, map[string]any{
  "post": post,
}) {
  // Foydalanuvchi postni yangilay olmaydi yoki o‘chirolmaydi...
}
```

### Darvoza javoblari

`Allows` metodi mantiqiy qiymat qaytaradi. To‘liq avtorizatsiya javobini olish uchun `Inspect` metodidan foydalaning.

```go
response := facades.Gate().Inspect("edit-settings", nil);

if response.Allowed() {
    // Amalga ruxsat berilgan...
} else {
    fmt.Println(response.Message())
}
```

### Darvoza tekshiruvlarini to‘sib qo‘yish

Ba’zan, ma’lum bir foydalanuvchiga barcha imkoniyatlarni berishni xohlashingiz mumkin. Boshqa barcha avtorizatsiya tekshiruvlaridan oldin ishlaydigan `Before` metodidan foydalanib, yopilish aniqlashingiz mumkin:

```go
facades.Gate().Before(func(ctx context.Context, ability string, arguments map[string]any) contractsaccess.Response {
  user := ctx.Value("user").(models.User)
  if isAdministrator(user) {
    return access.NewAllowResponse()
  }

  return nil
})
```

Agar `Before` yopilishi nolga teng bo‘lmagan natija qaytarsa, bu natija avtorizatsiya tekshiruvining natijasi deb hisoblanadi.

`After` metodi boshqa barcha avtorizatsiya tekshiruvlari bajarilgandan keyin ijro etiladigan yopilishni aniqlash uchun ishlatilishi mumkin.

```go
facades.Gate().After(func(ctx context.Context, ability string, arguments map[string]any, result contractsaccess.Response) contractsaccess.Response {
  user := ctx.Value("user").(models.User)
  if isAdministrator(user) {
    return access.NewAllowResponse()
  }

  return nil
})
```

> Eslatma: `After` ning qaytarish natijasi faqat `facades.Gate().Define` nol qaytarganda qo‘llaniladi.

### Kontekstni kiritish

`context` `Before`, `After` va `Define` metodlariga uzatiladi.

```go
facades.Gate().WithContext(ctx).Allows("update-post", map[string]any{
  "post": post,
})
```

## Siyosatlar

### Siyosatlarni yaratish

Siyosat yaratish uchun `make:policy` Artisan buyrug‘idan foydalanishingiz mumkin. Yaratilgan siyosat `app/policies` katalogiga saqlanadi. Agar bu katalog ilovangizda mavjud bo‘lmasa, Goravel uni siz uchun yaratadi.

```shell
./artisan make:policy PostPolicy
./artisan make:policy user/PostPolicy
```

### Siyosatlarni yozish

Keling, `PostPolicy` da `User` `Post` ni yangilashi mumkinligini tekshirish uchun `Update` metodini aniqlaymiz.

```go
package policies

import (
  "context"
  "goravel/app/models"

  "github.com/goravel/framework/auth/access"
  contractsaccess "github.com/goravel/framework/contracts/auth/access"
)

type PostPolicy struct {
}

func NewPostPolicy() *PostPolicy {
  return &PostPolicy{}
}

func (r *PostPolicy) Update(ctx context.Context, arguments map[string]any) contractsaccess.Response {
  user := ctx.Value("user").(models.User)
  post := arguments["post"].(models.Post)

  if user.ID == post.UserID {
    return access.NewAllowResponse()
  } else {
    return access.NewDenyResponse("You do not own this post.")
  }
}
```

Keyin siyosatni `bootstrap/app.go::WithCallback` funksiyasiga ro‘yxatdan o‘tkazishimiz mumkin:

```go
func Boot() contractsfoundation.Application {
  return foundation.Setup().
    WithConfig(config.Boot).
    WithCallback(func() {
      facades.Gate().Define("update-post", policies.NewPostPolicy().Update)
    }).
    Create()
}
```

Turli amallarni avtorizatsiya qilish jarayonida siyosatingizga ko‘proq metodlar qo‘shishingiz mumkin. Masalan, turli modelga oid amallarni avtorizatsiya qilish uchun `View` yoki `Delete` metodlarini yaratishingiz mumkin. Siyosat metodlaringizni o‘zingiz xohlagancha nomlang.
