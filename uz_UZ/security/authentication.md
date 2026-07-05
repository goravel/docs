# Autentifikatsiya

[[toc]]

## Kirish

Autentifikatsiya veb-ilovalarda ajralmas xususiyatdir. Goravelning `facades.Auth()` moduli JWT va Session drayverlarini qo‘llab-quvvatlaydi va siz drayver va foydalanuvchi provayderini sozlashingiz mumkin.

## Konfiguratsiya

Ilovada turli foydalanuvchi identifikatorlarini almashtirish uchun `config/auth.go` faylida `defaults` guard va bir nechta `guards` ni sozlashingiz mumkin.

JWT parametrlarini, masalan, `secret`, `ttl`, `refresh_ttl` ni `config/jwt.go` faylida sozlashingiz mumkin.

### Har xil JWT Guard har xil konfiguratsiyalarni qo‘llab-quvvatlaydi

Har bir Guard uchun TTL, Secret va RefreshTTL ni alohida `config/auth.go` faylida sozlashingiz mumkin. Agar sozlanmagan bo‘lsa, ushbu uchta konfiguratsiya standart sifatida `config/jwt.go` fayli tomonidan ishlatiladi.

```go
// config/auth.go
"guards": map[string]any{
  "user": map[string]any{
    "driver": "jwt",
++  "ttl": 60,
++  "refresh_ttl": 0,
++  "secret": "your-secret",
  },
},
```

## JWT Token Yaratish

```shell
./artisan jwt:secret
```

## Foydalanuvchi Yordamida Token Yaratish

Model orqali token yaratishingiz mumkin. Agar model `orm.Model` dan foydalansa, qo‘shimcha sozlash talab qilinmaydi, aks holda modelning asosiy kalit maydonida Tag ni sozlashingiz kerak, masalan:

```go
type User struct {
  ID uint `gorm:"primaryKey"`
  Name string
}

var user models.User
user.ID = 1

token, err := facades.Auth(ctx).Login(&user)
```

## ID Yordamida Token Yaratish

```go
token, err := facades.Auth(ctx).LoginUsingID(1)
```

## Tokenni Tahlil Qilish

```go
payload, err := facades.Auth(ctx).Parse(token)
```

`payload` orqali quyidagilarni olishingiz mumkin:

1. `Guard`: Joriy Guard;
2. `Key`: Foydalanuvchi belgisi;
3. `ExpireAt`: Muddati tugash vaqti;
4. `IssuedAt`: Berilgan vaqt;

> Agar `err` `ErrorTokenExpired` dan boshqa bo‘lsa va nolga teng bo‘lmasa, payload nolga teng bo‘lishi kerak.

Tokenni muddati o‘tganligini err orqali aniqlashingiz mumkin:

```go
"errors"
"github.com/goravel/framework/auth"

errors.Is(err, auth.ErrorTokenExpired)
```

> Token Bearer prefiksi bilan yoki undan holi normal tahlil qilinishi mumkin.

## Foydalanuvchini Olish

Foydalanuvchini olishdan oldin `Parse` orqali Token yaratishingiz kerak, bu jarayon HTTP middleware orqali boshqarilishi mumkin.

```go
var user models.User
err := facades.Auth(ctx).User(&user) // Ko‘rsatkich bo‘lishi kerak
id, err := facades.Auth(ctx).ID()
```

## Tokenni Yangilash

Foydalanuvchini yangilashdan oldin `Parse` orqali Token yaratishingiz kerak.

```go
token, err := facades.Auth(ctx).Refresh()
```

## Chiqish

```go
err := facades.Auth(ctx).Logout()
```

## Bir Nechta Guardlar

```go
token, err := facades.Auth(ctx).Guard("admin").LoginUsingID(1)
err := facades.Auth(ctx).Guard("admin").Parse(token)
err := facades.Auth(ctx).Guard("admin").User(&user)
```

> Standart guard ishlatilmaganda, yuqoridagi metodlarni chaqirishdan oldin `Guard` metodini chaqirish shart.

JWT tokenlari ularni yaratgan guard bilan bog'langan. Agar siz boshqa guard bilan token parslasangiz, Goravel `auth.ErrorGuardMismatch` qaytaradi:

```go
token, err := facades.Auth(ctx).Guard("user").LoginUsingID(1)
payload, err := facades.Auth(ctx).Guard("admin").Parse(token)

if errors.Is(err, auth.ErrorGuardMismatch) {
  // The token was issued by another guard.
}
```

## Maxsus Drayver

### Maxsus Guard Qo‘shish

O‘zingizning autentifikatsiya guard drayveringizni aniqlash uchun `facades.Auth().Extend()` metodidan foydalanishingiz mumkin, bu metod `AuthServiceProvider` ning `Boot` metodida chaqirilishi mumkin.

```go
import "github.com/goravel/framework/contracts/auth"

func (receiver *AuthServiceProvider) Boot(app foundation.Application) {
  facades.Auth().Extend("custom-driver", func(ctx http.Context, name string, userProvider auth.UserProvider) (auth.GuardDriver, error) {
    return &CustomGuard{}, nil
  })
}
```

Maxsus guardni aniqlaganingizdan so‘ng, uni `auth.go` faylining `guards` konfiguratsiyasida ko‘rsatishingiz mumkin:

```go
"guards": map[string]any{
  "api": map[string]any{
    "driver": "custom-driver",
    "provider": "users",
  },
},
```

### Maxsus UserProvider Qo‘shish

O‘zingizning foydalanuvchi provayderingizni aniqlash uchun `facades.Auth().Provider()` metodidan foydalanishingiz mumkin, bu metod ham `AuthServiceProvider` ning `Boot` metodida chaqirilishi mumkin.

```go
import "github.com/goravel/framework/contracts/auth"

facades.Auth().Provider("custom-provider", func(ctx http.Context) (auth.UserProvider, error) {
  return &UserProvider{}, nil
})
```

`Provider` metodi yordamida provayder ro‘yxatdan o‘tkazilgandan so‘ng, `auth.go` konfiguratsiya faylida maxsus foydalanuvchi provayderidan foydalanishingiz mumkin. Birinchidan, yangi drayverdan foydalanadigan `provider` ni aniqlang:

```go
"providers": map[string]any{
  "users": map[string]any{
    "driver": "custom-provider",
  },
},
```

Nihoyat, ushbu provayderga `guards` konfiguratsiyasida murojaat qilishingiz mumkin:

```go
"guards": map[string]any{
  "api": map[string]any{
    "driver": "custom-provider",
    "provider": "users",
  },
},
```
