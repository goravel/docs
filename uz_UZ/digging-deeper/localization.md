# Mahalliylashtirish

[[toc]]

## Kirish

Goravelning lokalizatsiya xususiyatlari turli tillardagi satrlarni olishning qulay usulini taqdim etadi, bu esa ilovangizda bir nechta tillarni qo'llab-quvvatlashni osonlashtiradi. Til satrlari `lang` katalogidagi fayllarda saqlanadi va Goravel til fayllarini tartibga solishning ikkita usulini qo'llab-quvvatlaydi:

Har bir tilning o'z fayli bor:

```
/lang
  en.json
  cn.json
```

Yoki juda ko'p tarjimalar bo'lsa, ularni quyidagicha tasniflash mumkin:

```
/lang
  /en
    user.json
  /cn
    user.json
```

## Mahalliy sozlamalarni sozlash

Ilovaning standart tili `config/app.go` konfiguratsiya faylidagi `lokal` konfiguratsiya parametrida saqlanadi. Ushbu qiymatni ilovangiz talablariga mos ravishda o'zgartirishingiz mumkin.

Shuningdek, ish vaqtida bitta "HTTP" so'rovi uchun standart tilni o'zgartirish uchun App Facade tomonidan taqdim etilgan "SetLocale" usulidan foydalanishingiz mumkin:

```go
facades.Route().Get("/", func(ctx http.Context) http.Response {
  facades.App().SetLocale(ctx, "en")

  return ctx.Response()
})
```

Joriy tilda berilgan tarjima satri mavjud bo'lmaganda ishlatiladigan "zaxira lokalizatsiyasi" ni sozlashingiz mumkin. Standart til singari, zaxira tili ham `config/app.go` konfiguratsiya faylida sozlangan.

```
"fallback_locale": "en",
```

### Joriy joylashuvni aniqlash

Joriy "mahalliy" ni aniqlash yoki "mahalliy" berilgan qiymat ekanligini tekshirish uchun "CurrentLocale" va "IsLocale" usullaridan foydalanishingiz mumkin.

```
locale := facades.App().CurrentLocale(ctx)
if facades.App().IsLocale(ctx, "en") {}
```

### Tarjima satrlarini aniqlash

Til fayllarida siz bir darajali yoki ko'p darajali tuzilmalarni belgilashingiz mumkin:

```json
// lang/en.json
{
  "name": "It's your name",
  "required": {
    "user_id": "UserID is required"
  }
}
```

### Tarjima satrlarini olish

Til fayllaridan tarjima satrlarini olish uchun `facades.Lang(ctx).Get()` usulidan foydalanishingiz mumkin. Agar til fayli bir nechta darajalarni o'z ichiga olsa, ularni ulash uchun `.` dan foydalanishingiz mumkin, agar til fayli bir nechta papkalar darajasida bo'lsa, ularni ulash uchun `/` dan foydalanishingiz mumkin.

Masalan:

```
// lang/en.json
{
  "name": "It's your name",
  "required": {
    "user_id": "UserID is required"
  }
}

facades.Lang(ctx).Get("name")
facades.Lang(ctx).Get("required.user_id")

// lang/en/role/user.json
{
  "name": "It's your name",
  "required": {
    "user_id": "UserID is required"
  }
}

facades.Lang(ctx).Get("role/user.name")
facades.Lang(ctx).Get("role/user.required.user_id")
```

#### Tarjima satrlarida parametrlarni almashtirish

Siz tarjima satrlarida joy egalarini belgilashingiz mumkin. Barcha o'rin egalari `:` prefiksiga ega. Masalan, xush kelibsiz xabarini aniqlash uchun joy egasidan foydalanishingiz mumkin:

```json
{
  "welcome": "Welcome, :name"
}
```

Tarjima satrini olishda to'ldiruvchilarni almashtirish uchun, `facades.Lang(ctx).Get()` usuliga ikkinchi parametr sifatida almashtirish xaritasi bilan tarjima opsiyasini o'tkazishingiz mumkin:

```go
facades.Lang(ctx).Get("welcome", translation.Option{
  Replace: map[string]string{
    "name": "Goravel",
  },
})
```

#### Ko'pliklashtirish

Ko'pliklashtirish murakkab muammodir, chunki turli tillarda turli xil ko'pliklashtirish qoidalari mavjud. Biroq, Goravel siz belgilagan pluralizatsiya qoidalari asosida satrlarni tarjima qilishga yordam berishi mumkin. `|` belgisidan foydalanib, satrning birlik va ko'plik shakllarini farqlashingiz mumkin:

```json
{
  "apples": "There is one apple|There are many apples"
}
```

Hatto bir nechta qiymat diapazonlari uchun tarjima satrlarini belgilash orqali yanada murakkab plyuralizatsiya qoidalarini yaratishingiz mumkin:

```json
{
  "apples": "{0} There are none|[1,19] There are some|[20,*] There are many"
}
```

Ko'paytirish parametrlari bilan tarjima satrini aniqlagandan so'ng, berilgan `count` uchun qatorni olish uchun `facades.Lang(ctx).Choice()` usulidan foydalanishingiz mumkin. Bu misolda, son 1 dan katta bo'lgani uchun, tarjima satrining ko'plik shakli qaytariladi:

```go
facades.Lang(ctx).Choice("messages.apples", 10)
```

Shuningdek, pluralizatsiya satrlarida joy egallovchi atributlarni ham belgilashingiz mumkin. Massivni `facades.Lang(ctx).Choice()` usuliga uchinchi parametr sifatida o'tkazish orqali siz ushbu o'rinbosarlarni almashtirishingiz mumkin:

```
"minutes_ago": "{1} :value minute ago|[2,*] :value minutes ago",

facades.Lang(ctx).Choice("time.minutes_ago", 5, translation.Option{
  Replace: map[string]string{
    "value": "5",
  },
})
```

## Joylashtirish yuklanmoqda

Embed yuklashdan foydalanilganda, til fayllari ikkilik faylga kompilyatsiya qilinadi va endi ularni joylashtirish shart emas. Mustaqil til fayllari va joylashtirish yuklamasi bir vaqtning o'zida ishlatilishi mumkin, shunchaki `config/app.go` faylida `lang_path` va `lang_fs` ni sozlang. Foydalanishda avval mustaqil til fayli rejimi ishlatiladi va mustaqil til fayli mavjud bo'lmaganda, joylashtirish yuklamasi ishlatiladi.

Til fayllari bilan bir xil katalogda `fs.go` faylini yarating:

```
/lang
  en.json
  cn.json
  fs.go
```

```go
// lang/fs.go
package lang

import "embed"

//go:embed *
var FS embed.FS
```

Keyin `config/app.go` faylida sozlang:

```go
// config/app.go
import "lang"

"lang_path": "lang",
"lang_fs":   lang.Fs,
```
