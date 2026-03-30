# Xizmat Konteyneri

[[toc]]

## Kirish

Goravel xizmat konteyneri sinf bog'liqliklarini boshqarish va bog'liqlik in'ektsiyasini amalga oshirish uchun kuchli vosita hisoblanadi. U Goravelning barcha modullarini o'z ichiga oladi va sizga o'z xizmatlaringizni konteynerga bog'lash va kerak bo'lganda ularni hal qilish imkonini beradi. Xizmat konteyneri Goravel atrofidagi uchinchi tomon paketlari uchun kuchli qo'llab-quvvatlashni ta'minlaydi.

## Bog'lash

### Oddiy bog‘lamalar

Sizning xizmat konteyneringiz bog‘lanishlarining deyarli barchasi [xizmat provayderlari](./service-providers.md) ichida ro‘yxatdan o‘tkaziladi. Xizmat ko'rsatuvchi provayder ichida siz har doim konteynerga `app` parametri orqali kirishingiz mumkin, so'ngra `Bind` metodidan foydalanib bog'lashni ro'yxatdan o'tkazing, ro'yxatdan o'tkazmoqchi bo'lgan `key`ni va sinf namunasini qaytaruvchi yopilishni (closure) o'tkazing:

```go
package route

import (
  "github.com/goravel/framework/contracts/foundation"
)

const Binding = "goravel.route"

type ServiceProvider struct {}

func (route *ServiceProvider) Register(app foundation.Application) {
  app.Bind(Binding, func(app foundation.Application) (any, error) {
    return NewRoute(app.MakeConfig()), nil
  })
}

func (route *ServiceProvider) Boot(app foundation.Application) {}
```

Aytilganidek, odatda siz xizmat ko'rsatuvchi provayderlar ichida konteyner bilan ishlaysiz; biroq, agar siz xizmat ko'rsatuvchi provayderdan tashqarida konteyner bilan ishlashni istasangiz, `App` fasad orqali buni amalga oshirishingiz mumkin:

```go
facades.App().Bind("key", func(app foundation.Application) (any, error) {
  ...
})
```

### Singleton bog'lash

`Singleton` usuli sinf yoki interfeysni konteynerga bir marta hal qilinishi kerak bo'lgan holda bog'laydi. Bir marta singleton bog'lash hal qilingandan so'ng, konteynerga keyingi chaqiruvlarda bir xil ob'ekt namunasi qaytariladi:

```go
app.Singleton(kalit, func(app foundation.Application) (any, error) {
  return NewGin(app.MakeConfig()), nil
})
```

### Instanslarni bog'lash

Shuningdek, siz `Instance` usuli yordamida mavjud obyekt namunasini konteynerga bog‘lashingiz mumkin. Berilgan instansiya har doim konteynerga keyingi chaqiruvlarda qaytariladi:

```go
app.Instance(key, instance)
```

### Parametr bilan bog'lash

Agar xizmat provayderini yaratish uchun qo'shimcha parametrlar kerak bo'lsa, `BindWith` metodidan foydalanib, parametrlarni yopishga o'tkazishingiz mumkin:

```go
app.BindWith(Binding, func(app foundation.Application, parameters map[string]any) (any, error) {
  return NewRoute(app.MakeConfig()), nil
})
```

## Hal qilish

### `Make` usuli

Siz konteynerdan sinf namunasini hal qilish uchun `Make` metodidan foydalanishingiz mumkin. `Make` usuli siz hal qilmoqchi bo'lgan `key` ni qabul qiladi:

```go
instance, err := app.Make(key)
```

Agar siz xizmat ko'rsatuvchi provayderdan tashqarida bo'lsangiz va kod joylashgan joyda `app` o'zgaruvchisiga kirish imkoni bo'lmasa, konteynerdan klass misolini olish uchun `App` fasadidan foydalanishingiz mumkin:

```go
instance, err := facades.App().Make(key)
```

### `MakeWith` metodi

Agar sinfingizning ba'zi bog'liqliklari konteyner orqali hal qilinmasa, ularni `BindWith` bog'lash usuliga mos ravishda `MakeWith` usuliga assotsiativ massiv sifatida o'tkazib, ularni kiritishingiz mumkin:

```go
instance, err := app.MakeWith(key, map[string]any{"id": 1})
```

### Boshqa uslublar

Framework turli fasadlarni tez hal qilish uchun qulay usullarni taqdim etadi: `MakeArtisan`, `MakeAuth` va boshqalar.
