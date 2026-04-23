# Tekshirish

[[toc]]

## Kirish

Goravel ilovangizning kiruvchi ma'lumotlarini tekshirish uchun bir nechta turli yondashuvlarni taqdim etadi. Barcha kiruvchi HTTP so'rovlarida mavjud bo'lgan `Validate` usulidan foydalanish eng keng tarqalgan usuldir. Goravel qulay tekshirish qoidalarining keng turlarini o'z ichiga oladi.

## Tekshirishni Tez Boshlash

Keling, formani qanday tekshirish va foydalanuvchiga xato xabarlarini qaytarishning to'liq misolini batafsil ko'rib chiqaylik. Ushbu umumiy ma'lumot sizga Goravel yordamida kiruvchi so'rov ma'lumotlarini qanday tekshirish haqida umumiy tushuncha beradi.

### Marshrutlarni Aniqlash

Birinchidan, `routes/web.go` faylimizda quyidagi marshrutlar aniqlangan deb faraz qilaylik:

```go
import "goravel/app/http/controllers"

postController := controllers.NewPostController()
facades.Route().Get("/post/create", postController.Create)
facades.Route().Post("/post", postController.Store)
```

`GET` marshruti yangi blog postini yaratish uchun shaklni ko'rsatadi. `POST` marshruti yangi postni ma'lumotlar bazasiga saqlaydi.

### Kontrollerni Yaratish

Keyinchalik, ushbu marshrutlarga kiruvchi so'rovlarni boshqaradigan oddiy kontrollerni ko'rib chiqamiz. Biz hozircha `Store` usulini bo'sh qoldiramiz:

```go
package controllers

import (
  "github.com/goravel/framework/contracts/http"
)

type PostController struct {}

func NewPostController() *PostController {
  return &PostController{}
}

func (r *PostController) Store(ctx http.Context) {}
```

### Tekshirish Mantiqini Yozish

Endi biz `Store` usulini yangi blog postini tekshirish mantiqi bilan to'ldirishga tayyormiz.

```go
func (r *PostController) Store(ctx http.Context) {
  validator, err := ctx.Request().Validate(map[string]string{
    "title": "required|max_len:255",
    "body": "required",
    "code": "required|regex:^\d{4,6}$",
  })
}
```

### Ichki Atributlar

Agar kiruvchi HTTP so'rovi "ichki" maydon ma'lumotlarini o'z ichiga olsa, siz ushbu maydonlarni tekshirish qoidalaringizda "nuqta" sintaksisidan foydalanib belgilashingiz mumkin:

```go
validator, err := ctx.Request().Validate(map[string]string{
  "title": "required|max_len:255",
  "author.name": "required",
  "author.description": "required",
})
```

### Massiv (Slice) tekshiruvi

Agar kiruvchi HTTP so'rovi "massiv" maydon ma'lumotlarini o'z ichiga olsa, siz ushbu maydonlarni tekshirish qoidalaringizda `*` sintaksisidan foydalanib belgilashingiz mumkin:

```go
validator, err := ctx.Request().Validate(map[string]string{
  "tags.*": "required",
})
```

## Forma So'rovi Tekshiruvi

### Forma So'rovlarini Yaratish

Murakkabroq tekshirish stsenariylari uchun siz "forma so'rovi" yaratishingiz mumkin. Forma so'rovlari - bu o'z tekshirish va avtorizatsiya mantiqini o'z ichiga olgan maxsus so'rov sinflari. Forma so'rovi sinfini yaratish uchun siz `make:request` Artisan CLI buyrug'idan foydalanishingiz mumkin:

```go
./artisan make:request StorePostRequest
./artisan make:request user/StorePostRequest
```

Yaratilgan forma so'rovi sinfi `app/http/requests` katalogiga joylashtiriladi. Agar bu katalog mavjud bo'lmasa, u siz `make:request` buyrug'ini ishga tushirganingizda yaratiladi. Goravel tomonidan yaratilgan har bir forma so'rovida oltita usul mavjud: `Authorize`, `Rules`. Bundan tashqari, qo'shimcha amallar uchun `Filters`, `Messages`, `Attributes` va `PrepareForValidation` usullarini sozlashingiz mumkin.

`Authorize` usuli joriy autentifikatsiyadan o'tgan foydalanuvchi so'rov bilan ifodalangan harakatni bajarishga qodir yoki yo'qligini aniqlash uchun mas'ul, `Rules` usuli esa so'rov ma'lumotlariga qo'llanilishi kerak bo'lgan tekshirish qoidalarini qaytaradi:

```go
package requests

import (
  "mime/multipart"

  "github.com/goravel/framework/contracts/http"
  "github.com/goravel/framework/contracts/validation"
)

type StorePostRequest struct {
  Name string `form:"name" json:"name"`
  File *multipart.FileHeader `form:"file" json:"file"`
  Files []*multipart.FileHeader `form:"files" json:"files"`
}

func (r *StorePostRequest) Authorize(ctx http.Context) error {
  return nil
}

func (r *StorePostRequest) Rules(ctx http.Context) map[string]string {
  return map[string]string{
    // Kalitlar kiruvchi kalitlar bilan mos keladi.
    "name": "required|max_len:255",
    "file": "required|file",
    "files": "required|array",
    "files.*": "required|file",
  }
}
```

Keyin kontrollerda so'rovni tekshirish uchun `ValidateRequest` usulidan foydalanishingiz mumkin:

```go
func (r *PostController) Store(ctx http.Context) {
  var storePost requests.StorePostRequest
  errors, err := ctx.Request().ValidateRequest(&storePost)
}
```

Ko'proq qoidalarni [Mavjud Tekshirish Qoidalari](#mavjud-tekshirish-qoidalari) bo'limida tekshiring.

> E'tibor bering, `form` orqali uzatilgan qiymatlar sukut bo'yicha `string` turiga ega bo'lgani uchun, so'rovdagi barcha maydonlar ham `string` turida bo'lishi kerak, aks holda qiymatlarni uzatish uchun `JSON` dan foydalaning.

### Forma So'rovlarini Avtorizatsiya Qilish

Forma so'rovi sinfi shuningdek `Authorize` usulini o'z ichiga oladi. Ushbu usul ichida siz autentifikatsiyadan o'tgan foydalanuvchi haqiqatan ham berilgan resursni yangilash huquqiga ega ekanligini aniqlashingiz mumkin. Misol uchun, siz foydalanuvchi yangilashga urinayotgan blog sharhining haqiqiy egasi ekanligini aniqlashingiz mumkin. Eng ehtimol, siz ushbu usul ichida [avtorizatsiya darvozalari va siyosatlari](../security/authorization.md) bilan o'zaro munosabatda bo'lasiz:

```go
func (r *StorePostRequest) Authorize(ctx http.Context) error {
  var comment models.Comment
  facades.Orm().Query().First(&comment)
  if comment.ID == 0 {
    return errors.New("hech qanday sharh topilmadi")
  }

  if !facades.Gate().Allows("update", map[string]any{
    "comment": comment,
  }) {
    return errors.New("sharhni yangilash mumkin emas")
  }

  return nil
}
```

`error` `ctx.Request().ValidateRequest` ning qaytarish qiymatiga o'tkaziladi.

### Kiruvchi Ma'lumotlarni Filtrlash

Siz forma so'rovining `Filters` usulini takomillashtirish orqali kiruvchi ma'lumotlarni formatlashingiz mumkin. Ushbu usul `attribute/filter` xaritasini qaytarishi kerak:

```go
func (r *StorePostRequest) Filters(ctx http.Context) map[string]string {
  return map[string]string{
    "name": "trim",
  }
}
```

### Xato Xabarlarini Sozlash

Siz forma so'rovi tomonidan ishlatiladigan xato xabarlarini `Messages` usulini bekor qilish orqali sozlashingiz mumkin. Ushbu usul atribut / qoida juftlari va ularning mos keladigan xato xabarlaridan iborat massivni qaytarishi kerak:

```go
func (r *StorePostRequest) Messages(ctx http.Context) map[string]string {
  return map[string]string{
    "title.required": "A title is required",
    "body.required": "A message is required",
  }
}
```

### Tekshirish Atributlarini Sozlash

Goravelning ko'plab o'rnatilgan tekshirish qoidasi xato xabarlari `:attribute` joy egasini o'z ichiga oladi. Agar siz tekshirish xabaringizning `:attribute` joy egasi maxsus atribut nomi bilan almashtirilishini istasangiz, `Attributes` usulini bekor qilish orqali maxsus nomlarni belgilashingiz mumkin. Ushbu usul atribut / nom juftlaridan iborat massivni qaytarishi kerak:

```go
func (r *StorePostRequest) Attributes(ctx http.Context) map[string]string {
  return map[string]string{
    "email": "email address",
  }
}
```

### Tekshirish Uchun Kiruvchi Ma'lumotlarni Tayyorlash

Agar tekshirish qoidalaringizni qo'llashdan oldin so'rovdan har qanday ma'lumotni tayyorlash yoki tozalash zarur bo'lsa, `PrepareForValidation` usulidan foydalanishingiz mumkin:

```go
func (r *StorePostRequest) PrepareForValidation(ctx http.Context, data validation.Data) error {
  if name, exist := data.Get("name"); exist {
    return data.Set("name", name.(string)+"1")
  }
  return nil
}
```

## Validatorni Qo'lda Yaratish

Agar siz so'rovdagi `Validate` usulidan foydalanmasangiz, `facades.Validator` yordamida validatori namunasi qo'lda yaratishingiz mumkin. Fasadning `Make` usuli yangi validatori namunasi yaratadi:

```go
func (r *PostController) Store(ctx http.Context) http.Response {
  validator, _ := facades.Validation().Make(
    ctx,
    map[string]any{
      "name": "Goravel",
    },
    map[string]string{
      "title": "required|max_len:255",
      "body":  "required",
    })

  if validator.Fails() {
    // Return fail
  }

  var user models.User
  err := validator.Bind(&user)
  ...
}
```

`Make` usuliga uzatilgan birinchi argument tekshirilayotgan ma'lumot bo'lib, u `map[string]any` yoki `struct` bo'lishi mumkin. Ikkinchi argument ma'lumotga qo'llanilishi kerak bo'lgan tekshirish qoidalari massividir.

### Xato Xabarlarini Sozlash

Agar kerak bo'lsa, siz Goravel tomonidan taqdim etilgan sukut bo'yicha xato xabarlari o'rniga validatori namunasi ishlatishi kerak bo'lgan maxsus xato xabarlarini taqdim etishingiz mumkin. Siz maxsus xabarlarni `Make` usulining uchinchi argumenti sifatida o'tkazishingiz mumkin (`ctx.Request().Validate()` uchun ham qo'llaniladi):

```go
validator, err := facades.Validation().Make(ctx, input, rules, validation.Messages(map[string]string{
  "required": "The :attribute field is required.",
}))
```

### Berilgan Atribut Uchun Maxsus Xabar Belgilash

Ba'zan siz faqat ma'lum bir atribut uchun maxsus xato xabarini belgilashni xohlashingiz mumkin. Siz buni "nuqta" belgisi yordamida qilishingiz mumkin. Avval atribut nomini, keyin qoidani belgilang (`ctx.Request().Validate()` uchun ham qo'llaniladi):

```go
validator, err := facades.Validation().Make(ctx, input, rules, validation.Messages(map[string]string{
  "email.required": "Biz sizning elektron manzilingizni bilishimiz kerak!",
}))
```

### Maxsus Atribut Qiymatlarini Belgilash

Goravelning ko'pgina o'rnatilgan xato xabarlarida `:attribute` belgisi mavjud bo'lib, u tekshirilayotgan maydon yoki atribut nomi bilan almashtiriladi. Ushbu belgilarni almashtirish uchun ishlatiladigan qiymatlarni maxsus maydonlar uchun sozlash uchun siz maxsus atributlar massivini `Make` metodining uchinchi argumenti sifatida o'tkazishingiz mumkin (shuningdek, `ctx.Request().Validate()` uchun ham qo'llaniladi):

```go
validator, err := facades.Validation().Make(ctx, input, rules, validation.Attributes(map[string]string{
  "email": "elektron manzil",
}))
```

### Tekshirishdan Oldin Ma'lumotlarni Formatlash

Ma'lumotlarni tekshirishdan oldin ularni formatlash orqali yanada moslashuvchan tekshirishni amalga oshirishingiz mumkin. Ma'lumotlarni formatlash metodini `Make` metodining uchinchi parametri sifatida o'tkazishingiz mumkin (shuningdek, `ctx.Request().Validate()` uchun ham qo'llaniladi):

```go
import (
  validationcontract "github.com/goravel/framework/contracts/validation"
  "github.com/goravel/framework/validation"
)

func (r *PostController) Store(ctx http.Context) http.Response {
  validator, err := facades.Validation().Make(ctx, input, rules,
    validation.PrepareForValidation(func(ctx http.Context, data validationcontract.Data) error {
      if name, exist := data.Get("name"); exist {
        return data.Set("name", name)
      }

      return nil
    }))

  ...
}
```

## Tekshirilgan Kirish Ma'lumotlari bilan Ishlash

Forma so'rovlari yoki qo'lda yaratilgan tekshiruvchi namunalari yordamida kiruvchi so'rov ma'lumotlarini tekshirgandan so'ng, so'rov ma'lumotlarini `struct` ga bog'lashni istasangiz, buning ikki usuli mavjud:

1. `Bind` metodidan foydalaning, bu barcha kiruvchi ma'lumotlarni, shu jumladan tekshirilmagan ma'lumotlarni ham bog'laydi:

```go
validator, err := ctx.Request().Validate(rules)
var user models.User
err := validator.Bind(&user)

validator, err := facades.Validation().Make(ctx, input, rules)
var user models.User
err := validator.Bind(&user)
```

2. Tekshirish uchun so'rovdan foydalanganda kiruvchi ma'lumotlar avtomatik ravishda formaga bog'lanadi:

```go
var storePost requests.StorePostRequest
errors, err := ctx.Request().ValidateRequest(&storePost)
fmt.Println(storePost.Name)
```

## Xato Xabarlari bilan Ishlash

### Maydon Uchun Bitta Xato Xabarini Olish (Tasodifiy)

```go
validator, err := ctx.Request().Validate(rules)
validator, err := facades.Validation().Make(ctx, input, rules)

message := validator.Errors().One("email")
```

### Maydon Uchun Barcha Xato Xabarlarini Olish

```go
messages := validator.Errors().Get("email")
```

### Barcha Maydonlar Uchun Barcha Xato Xabarlarini Olish

```go
messages := validator.Errors().All()
```

### Maydon Uchun Xato Xabarlari Mavjudligini Aniqlash

```go
if validator.Errors().Has("email") {
  //
}
```

## Mavjud Tekshirish Qoidalari

Quyida barcha mavjud tekshirish qoidalari va ularning funktsiyalari ro'yxati keltirilgan:

| Nomi                   | Tavsifi                                                                                                                                                                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `required`             | Qiymat talab qilinadi va nol qiymat bo'lishi mumkin emasligini tekshiradi. Misol uchun, maydon turi `bool` bo'lsa va o'tkazilgan qiymat `false` bo'lsa, u tekshiruvdan o'ta olmaydi.                                       |
| `required_if`          | `required_if:anotherfield,value,...` Tekshirilayotgan maydon mavjud va bo'sh bo'lmasligi kerak, agar anotherField maydoni har qanday qiymatga teng bo'lsa.                                                                                 |
| `required_unless`      | `required_unless:anotherfield,value,...` Tekshirilayotgan maydon mavjud va bo'sh bo'lmasligi kerak, agar anotherField maydoni har qanday qiymatga teng bo'lmasa.                                                                           |
| `required_with`        | `required_with:foo,bar,...` Tekshirilayotgan maydon faqat boshqa ko'rsatilgan maydonlardan har qanday biri mavjud bo'lganda mavjud va bo'sh bo'lmasligi kerak.                                                                             |
| `required_with_all`    | `required_with_all:foo,bar,...` Tekshirilayotgan maydon faqat boshqa ko'rsatilgan barcha maydonlar mavjud bo'lganda mavjud va bo'sh bo'lmasligi kerak.                                                                                     |
| `required_without`     | `required_without:foo,bar,...` Tekshirilayotgan maydon faqat boshqa ko'rsatilgan maydonlardan har qanday biri mavjud bo'lmaganda mavjud va bo'sh bo'lmasligi kerak.                                                                        |
| `required_without_all` | `required_without_all:foo,bar,...` Tekshirilayotgan maydon faqat boshqa ko'rsatilgan barcha maydonlar mavjud bo'lmaganda mavjud va bo'sh bo'lmasligi kerak.                                                                                |
| `int`                  | Qiymat `intX` yoki `uintX` turida ekanligini tekshiradi va o'lcham tekshiruvini qo'llab-quvvatlaydi. masalan: `int` `int:2` `int:2,12`. Eslatma: [Qoidalardan foydalanish nuqtalari](#int) |
| `uint`                 | Qiymat `uint(uintX)` turida ekanligini tekshiradi, `value >= 0`                                                                                                                                                                                            |
| `bool`                 | Qiymat bool matni ekanligini tekshiradi (`true`: "1", "on", "yes", "true", `false`: "0", "off", "no", "false").                                                                         |
| `string`               | Qiymat matn turida ekanligini tekshiradi va o'lcham tekshiruvini qo'llab-quvvatlaydi. masalan:`string` `string:2` `string:2,12`                                                                                            |
| `float`                | Qiymat `float(floatX)` turida ekanligini tekshiradi                                                                                                                                                                                                        |
| `slice`                | Qiymat slice turida ekanligini tekshiradi(`[]intX` `[]uintX` `[]byte` `[]string`)                                                                                                                                                       |
| `in`                   | `in:foo,bar,…` Qiymat berilgan ro'yxatda borligini tekshiradi                                                                                                                                                                                              |
| `not_in`               | `not_in:foo,bar,…` Qiymat berilgan ro'yxatda yo'qligini tekshiradi                                                                                                                                                                                         |
| `starts_with`          | `starts_with:foo` Kiruvchi matn qiymati berilgan pastki matn bilan boshlanishini tekshiradi                                                                                                                                                                |
| `ends_with`            | `ends_with:foo` Kiruvchi matn qiymati berilgan pastki matn bilan tugashini tekshiradi                                                                                                                                                                      |
| `between`              | `between:min,max` Qiymat raqam ekanligini va berilgan oralikda ekanligini tekshiradi                                                                                                                                                                       |
| `max`                  | `max:value` Qiymat berilgan qiymatdan kichik yoki tengligini tekshiradi(`intX` `uintX` `floatX`)                                                                                                                                        |
| `min`                  | `min:value` Qiymat berilgan qiymatdan katta yoki tengligini tekshiradi(`intX` `uintX` `floatX`)                                                                                                                                         |
| `eq`                   | `eq:value` Kiruvchi qiymat berilgan qiymatga tengligini tekshiradi                                                                                                                                                                                         |
| `ne`                   | `ne:value` Kiruvchi qiymat berilgan qiymatga teng emasligini tekshiradi                                                                                                                                                                                    |
| `lt`                   | `lt:value` Qiymat berilgan qiymatdan kichikligini tekshiradi(`intX` `uintX` `floatX`)                                                                                                                                                   |
| `gt`                   | `gt:value` Qiymat berilgan qiymatdan katta ekanligini tekshiradi(`intX` `uintX` `floatX`)                                                                                                                                               |
| `len`                  | `len:value` Qiymat uzunligi berilgan o'lchamga tengligini tekshiradi(`string` `array` `slice` `map`)                                                                                                                                    |
| `min_len`              | `min_len:value` Qiymatning minimal uzunligi berilgan o'lcham ekanligini tekshiradi(`string` `array` `slice` `map`)                                                                                                                      |
| `max_len`              | `max_len:value` Qiymatning maksimal uzunligi berilgan o'lcham ekanligini tekshiradi(`string` `array` `slice` `map`)                                                                                                                     |
| `email`                | Qiymat elektron pochta manzili satri ekanligini tekshirish                                                                                                                                                                                                 |
| `array`                | Qiymat massiv, kesma turi ekanligini tekshirish                                                                                                                                                                                                            |
| `map`                  | Qiymat MAP turi ekanligini tekshirish                                                                                                                                                                                                                      |
| `eq_field`             | `eq_field:field` Maydon qiymati boshqa maydon qiymatiga teng ekanligini tekshirish                                                                                                                                                                         |
| `ne_field`             | `ne_field:field` Maydon qiymati boshqa maydon qiymatiga teng emasligini tekshirish                                                                                                                                                                         |
| `gt_field`             | `gt_field:field` Maydon qiymati boshqa maydon qiymatidan katta ekanligini tekshirish                                                                                                                                                                       |
| `gte_field`            | `gte_field:field` Maydon qiymati boshqa maydon qiymatidan katta yoki unga teng ekanligini tekshirish                                                                                                                                                       |
| `lt_field`             | `lt_field:field` Maydon qiymati boshqa maydon qiymatidan kichik ekanligini tekshirish                                                                                                                                                                      |
| `lte_field`            | `lte_field:field` Maydon qiymati boshqa maydon qiymatidan kichik yoki unga teng ekanligini tekshirish                                                                                                                                                      |
| `file`                 | Yuklangan fayl ekanligini tekshirish                                                                                                                                                                                                                       |
| `image`                | Yuklangan rasm fayli ekanligini va kengaytmani tekshirishni qo‘llab-quvvatlashni tekshirish                                                                                                                                                                |
| `date`                 | Maydon qiymati sana satri ekanligini tekshirish                                                                                                                                                                                                            |
| `gt_date`              | `gt_date:value` Kirish qiymati berilgan sana satridan katta ekanligini tekshirish                                                                                                                                                                          |
| `lt_date`              | `lt_date:value` Kirish qiymati berilgan sana satridan kichik ekanligini tekshirish                                                                                                                                                                         |
| `gte_date`             | `gte_date:value` Kirish qiymati berilgan sana satridan katta yoki unga teng ekanligini tekshirish                                                                                                                                                          |
| `lte_date`             | `lte_date:value` Kirish qiymati berilgan sana satridan kichik yoki unga teng ekanligini tekshirish                                                                                                                                                         |
| `alpha`                | Qiymat faqat alifbo belgilaridan iborat ekanligini tekshirish                                                                                                                                                                                              |
| `alpha_num`            | Faqat harflar va raqamlar kiritilganligini tekshirish                                                                                                                                                                                                      |
| `alpha_dash`           | Faqat harflar, raqamlar, tire ( - ) va pastki chiziq ( \_ ) kiritilganligini tekshirish                                                                                                        |
| `json`                 | Qiymat JSON satri ekanligini tekshirish                                                                                                                                                                                                                    |
| `number`               | Qiymat raqamli satr `>= 0` ekanligini tekshirish                                                                                                                                                                                                           |
| `full_url`             | Qiymat to‘liq URL satri ekanligini tekshirish (http,https bilan boshlanishi kerak)                                                                                                                                                      |
| `ip`                   | Qiymat IP(v4 yoki v6) satri ekanligini tekshirish                                                                                                                                                                                       |
| `ipv4`                 | Qiymat IPv4 satri ekanligini tekshirish                                                                                                                                                                                                                    |
| `ipv6`                 | Qiymat IPv6 satri ekanligini tekshirish                                                                                                                                                                                                                    |
| `regex`                | Qiymat muntazam tekshiruvdan o‘tishi mumkinligini tekshirish                                                                                                                                                                                               |
| `uuid`                 | Qiymat UUID satri ekanligini tekshirish                                                                                                                                                                                                                    |
| `uuid3`                | Qiymat UUID3 satri ekanligini tekshirish                                                                                                                                                                                                                   |
| `uuid4`                | Qiymat UUID4 satri ekanligini tekshirish                                                                                                                                                                                                                   |
| `uuid5`                | Qiymat UUID5 satri ekanligini tekshirish                                                                                                                                                                                                                   |

### Qoidalardan Foydalanish Bo‘yicha Ko‘rsatmalar

#### int

`ctx.Request().Validate(rules)` yordamida tekshiruvni amalga oshirishda, kiruvchi `int` turidagi ma’lumotlar `json.Unmarshal` tomonidan `float64` turiga o‘tkaziladi, bu esa int qoidasi tekshiruvini muvaffaqiyatsiz yakunlanishiga olib keladi.

**Yechimlar**

Variant 1: Ma’lumotlarni tekshirishdan oldin [`validation.PrepareForValidation`](#tekshirishdan-oldin-ma-lumotlarni-formatlash) qo‘shish, ma’lumotlarni formatlash;

Variant 2: Qoidalarni tekshirish uchun `facades.Validation().Make()` dan foydalanish;

## Maxsus Tekshiruv Qoidalari

Goravel foydali tekshiruv qoidalarining keng assortimentini taqdim etadi; ammo, siz o‘zingizning ba’zi qoidalaringizni belgilamoqchi bo‘lishingiz mumkin. Maxsus tekshiruv qoidalarini ro‘yxatdan o‘tkazishning bir usuli qoida ob’yektlaridan foydalanishdir. Yangi qoida ob’yektini yaratish uchun siz oddiygina `make:rule` Artisan buyrug‘idan foydalanishingiz mumkin.

### Maxsus Qoidalarni Yaratish

Masalan, agar siz satr katta harflarda ekanligini tekshirishni istasangiz, ushbu buyruq yordamida qoida yaratishingiz mumkin. Goravel keyin ushbu yangi qoidani `app/rules` katalogida saqlaydi. Agar bu katalog mavjud bo‘lmasa, Goravel siz qoidangizni yaratish uchun Artisan buyrug‘ini ishga tushirganingizda uni yaratadi.

```go
./artisan make:rule Uppercase
./artisan make:rule user/Uppercase
```

### Maxsus Qoidalarni Belgilash

Qoidani yaratgandan so‘ng, uning xatti-harakatlarini aniqlashimiz kerak. Qoida ob’yektida ikkita usul mavjud: `Passes` va `Message`. Passes usuli tekshirilishi kerak bo‘lgan ma’lumot va tekshiruv parametrlarini o‘z ichiga olgan barcha ma’lumotlarni qabul qiladi. U atribut qiymatining haqiqiyligiga qarab `true` yoki `false` qaytarishi kerak. `Message` usuli tekshiruv muvaffaqiyatsiz tugaganda foydalanish kerak bo‘lgan tekshiruv xato xabarini qaytarishi kerak.

```go
package rules

import (
  "strings"

  "github.com/goravel/framework/contracts/validation"
)

type Uppercase struct {
}

// Signature The name of the rule.
func (receiver *Uppercase) Signature() string {
  return "uppercase"
}

// Passes Determine if the validation rule passes.
func (receiver *Uppercase) Passes(ctx context.Context, data validation.Data, val any, options ...any) bool {
  return strings.ToUpper(val.(string)) == val.(string)
}

// Message Get the validation error message.
func (receiver *Uppercase) Message(ctx context.Context) string {
  return "The :attribute must be uppercase."
}
```

### Maxsus Qoidalarni Ro‘yxatdan O‘tkazish

`make:rule` tomonidan yaratilgan yangi qoida `bootstrap/rules.go::Rules()` funksiyasida avtomatik ro‘yxatdan o‘tkaziladi va funksiya `WithRules` tomonidan chaqiriladi. Agar siz qoida faylini o‘zingiz yaratsangiz, qoidani qo‘lda ro‘yxatdan o‘tkazishingiz kerak.

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithRules(Rules).
		WithConfig(config.Boot).
		Create()
}
```

## Mavjud Tekshiruv Filtrlari

| Nomi                           | Tavsifi                                                                                                                                                                     |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `int/toInt`                    | Qiymatni(string/intX/floatX) `int` turiga o‘tkazish `v.FilterRule("id", "int")`                                                                          |
| `uint/toUint`                  | Qiymatni(string/intX/floatX) `uint` turiga o‘tkazish `v.FilterRule("id", "uint")`                                                                        |
| `int64/toInt64`                | Qiymatni (string/intX/floatX) `int64` turiga o‘tkazish `v.FilterRule("id", "int64")`                                                                     |
| `float/toFloat`                | Qiymatni (string/intX/floatX) `float` turiga o‘tkazish                                                                                                   |
| `bool/toBool`                  | Satr qiymatini bool ga o‘tkazish. (`true`: "1", "on", "yes", "true", `false`: "0", "off", "no", "false") |
| `trim/trimSpace`               | Satrning ikkala tomonidagi bo‘sh joy belgilarini tozalash                                                                                                                   |
| `ltrim/trimLeft`               | Satrning chap tomonidagi bo‘sh joy belgilarini tozalash                                                                                                                     |
| `rtrim/trimRight`              | Satrning o‘ng tomonidagi bo‘sh joy belgilarini tozalash                                                                                                                     |
| `int/integer`                  | Qiymatni (string/intX/floatX) `int` turiga o‘tkazish `v.FilterRule("id", "int")`                                                                         |
| `lower/lowercase`              | Satrni kichik harflarga o‘tkazish                                                                                                                                           |
| `upper/uppercase`              | Satrni katta harflarga o‘tkazish                                                                                                                                            |
| `lcFirst/lowerFirst`           | Satrning birinchi belgisini kichik harfga o‘tkazish                                                                                                                         |
| `ucFirst/upperFirst`           | Satrning birinchi belgisini katta harfga o‘tkazish                                                                                                                          |
| `ucWord/upperWord`             | Har bir so‘zning birinchi belgisini katta harfga o‘tkazish                                                                                                                  |
| `camel/camelCase`              | Satrni camel nomlash uslubiga o‘tkazish                                                                                                                                     |
| `snake/snakeCase`              | Satrni snake nomlash uslubiga o‘tkazish                                                                                                                                     |
| `escapeJs/escapeJS`            | JS satrini ekranlash.                                                                                                                                       |
| `escapeHtml/escapeHTML`        | HTML satrini ekranlash.                                                                                                                                     |
| `str2ints/strToInts`           | Satrni int kesimiga `[]int` o‘tkazish                                                                                                                                       |
| `str2time/strToTime`           | Sana satrini `time.Time` ga o‘tkazish.                                                                                                                      |
| `str2arr/str2array/strToArray` | Satrni string kesimiga `[]string` o‘tkazish                                                                                                                                 |

## Maxsus filtr

Goravel foydali filtrlarning keng assortimentini taqdim etadi, ammo siz o‘zingizning ba’zilaringizni belgilashni xohlashingiz mumkin.

### Maxsus Filtrlarni Yaratish

Yangi qoida obyektini yaratish uchun siz oddiygina `make:filter` Artisan buyrug‘idan foydalanishingiz mumkin. Keling, satrni butun songa o‘tkazadigan qoidani yaratish uchun ushbu buyruqdan foydalanaylik. Bu qoida allaqachon freymvorkga kiritilgan, biz uni faqat misol sifatida yaratamiz. Goravel ushbu yangi filtri `app/filters` katalogiga saqlaydi. Agar bu katalog mavjud bo‘lmasa, Goravel qoidani yaratish uchun Artisan buyrug‘ini ishga tushirganingizda uni yaratadi:

```go
./artisan make:filter ToInt
./artisan make:filter user/ToInt
```

### Maxsus Filtrlarni Belgilash

Bitta filtr ikkita usulni o‘z ichiga oladi: `Signature` va `Handle`. `Signature` usuli filtr nomini belgilaydi. `Handle` usuli aniq filtr mantiqini bajaradi:

```go
package filters

import (
  "strings"

  "github.com/spf13/cast"
  "github.com/goravel/framework/contracts/validation"
)

type ToInt struct {
}

// Signature The signature of the filter.
func (receiver *ToInt) Signature() string {
  return "ToInt"
}

// Handle defines the filter function to apply.
func (receiver *ToInt) Handle(ctx context.Context) any {
  return func (val any) int {
    return cast.ToString(val)
  }
}
```

### Maxsus Filtrlarni Ro‘yxatdan O‘tkazish

`make:filter` tomonidan yaratilgan yangi qoida `bootstrap/filters.go::Filters()` funksiyasida avtomatik ro‘yxatdan o‘tkaziladi va funksiya `WithFilters` tomonidan chaqiriladi. Agar siz qoida faylini o‘zingiz yaratsangiz, qoidani qo‘lda ro‘yxatdan o‘tkazishingiz kerak.

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithFilters(Filters).
		WithConfig(config.Boot).
		Create()
}
```
