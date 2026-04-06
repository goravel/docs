# Zavodlar

[[toc]]

## Kirish

Ilovingizni sinovdan o‘tkazish yoki ma’lumotlar bazangizni to‘ldirishda, oldindan ma’lumotlar bazangizga bir nechta yozuvlarni kiritish zarur bo‘lishi mumkin. Har bir ustun uchun qo‘lda qiymatlarni kiritish o‘rniga, Goravel sizga model zavodlarini yaratish orqali har bir modelingiz uchun standart atributlar to‘plamini belgilash imkonini beradi.

Zavod qanday yozilishiga misol ko‘rish uchun, ilovingizning `database/factories` papkasida joylashgan `user_factory.go` fayliga qarashingiz mumkin.

```go
package factories

type UserFactory struct {
}

// Definition Modelning standart holatini aniqlang.
func (f *UserFactory) Definition() map[string]any {
  return map[string]any{
    "Name": "Goravel",
  }
}
```

Ko‘rib turganingizdek, ularning eng oddiy shaklida, zavodlar `Definition` usuliga ega bo‘lgan strukturalardir. Bu usul zavod yordamida model yaratilganda foydalanish kerak bo‘lgan atribut qiymatlari standart to‘plamini qaytaradi. Tasodifiy ma’lumotlar diapazonini yaratish uchun siz [brianvoe/gofakeit](https://github.com/brianvoe/gofakeit) kutubxonasiga tayanishingiz mumkin.

## Zavodlarni yaratish

Zavod yaratish uchun `make:factory` Artisan buyrug‘ini ishga tushiring:

```
go run . artisan make:factory PostFactory
```

Yangi zavod `struct`i sizning `database/factories` papkangizga joylashtiriladi.

### Model va Zavodni Aniqlash Qoidalari

Zavodni aniqlaganingizdan so‘ng, modelga zavodni bog‘lash uchun modeldagi `Factory()` usulidan foydalanishingiz mumkin:

```go
package models

import (
  "github.com/goravel/framework/contracts/database/factory"
  "github.com/goravel/framework/database/orm"

  "goravel/database/factories"
)

type User struct {
  orm.Model
  Name   string
  Avatar string
  orm.SoftDeletes
}

func (u *User) Factory() factory.Factory {
  return &factories.UserFactory{}
}
```

## Zavodlar Yordamida Modellarni Yaratish

### Modellarni Yaratish

Biz modellarni ma’lumotlar bazasida saqlamasdan yaratish uchun `Make` usulidan foydalanishimiz mumkin:

```go
var user models.User
err := facades.Orm().Factory().Make(&user)
```

`Count` usuli yordamida ko‘plab modellar to‘plamini yaratishingiz mumkin:

```go
var users []models.User
err := facades.Orm().Factory().Count(2).Make(&users)
```

Agar modellaringizning ba’zi standart qiymatlarini o‘zgartirishni istasangiz, `Make` usuliga `map[string]any` o‘tkazishingiz mumkin. Faqat ko‘rsatilgan atributlar almashtiriladi, qolgan atributlar esa zavod tomonidan belgilanganidek, standart qiymatlarida qoladi:

```go
var user models.User
err := facades.Orm().Factory().Make(&user, map[string]any{
    "Avatar": "avatar",
})
```

### Modellarni Saqlash

`Create` usuli model namunalarini yaratadi va Ormning `Save` usuli yordamida ma’lumotlar bazasiga saqlaydi.

```go
var user models.User
err := facades.Orm().Factory().Create(&user)

var users []models.User
err := facades.Orm().Factory().Count(2).Create(&users)
```

Zavodning standart model atributlarini `Create` usuliga atributlarning `map[string]any` to‘plamini o‘tkazish orqali o‘zgartirishingiz mumkin:

```go
var user models.User
err := facades.Orm().Factory().Create(&user, map[string]any{
    "Avatar": "avatar",
})
```

### Model Voqealarini E‘tiborsiz Qoldirish

Modelda [model voqeasi](../orm/getting-started.md#events) aniqlangan bo‘lishi mumkin, siz bu voqealarni `CreateQuietly` usuli bilan e‘tiborsiz qoldirishingiz mumkin:

```go
var user models.User
err := facades.Orm().Factory().CreateQuietly(&user)
```
