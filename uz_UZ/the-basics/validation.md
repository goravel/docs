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
  validator, err := ctx.Request().Validate(map[string]any{
    "title": "required|max:255",
    "body": "required",
    "code": "required|regex:^[0-9]{4,6}$",
  })
}
```

### Ichki Atributlar

Agar kiruvchi HTTP so'rovi "ichki" maydon ma'lumotlarini o'z ichiga olsa, siz ushbu maydonlarni tekshirish qoidalaringizda "nuqta" sintaksisidan foydalanib belgilashingiz mumkin:

```go
validator, err := ctx.Request().Validate(map[string]any{
  "title": "required|max:255",
  "author.name": "required",
  "author.description": "required",
})
```

### Massiv (Slice) tekshiruvi

Agar kiruvchi HTTP so'rovi "massiv" maydon ma'lumotlarini o'z ichiga olsa, siz ushbu maydonlarni tekshirish qoidalaringizda `*` sintaksisidan foydalanib belgilashingiz mumkin:

```go
validator, err := ctx.Request().Validate(map[string]any{
  "tags.*": "required",
})
```

Wildcard qoidalari tasdiqlangan ma'lumotlarda asl slice shaklini saqlab qoladi:

```go
validator, err := facades.Validation().Make(ctx,
  map[string]any{"scores": []int{1, 2}},
  map[string]any{"scores.*": "required|integer"},
)

scores := validator.Validated()["scores"].([]int) // []int{1, 2}
```

## Forma So'rovi Tekshiruvi

### Forma So'rovlarini Yaratish

Murakkabroq tekshirish stsenariylari uchun siz "forma so'rovi" yaratishingiz mumkin. Forma so'rovlari - bu o'z tekshirish va avtorizatsiya mantiqini o'z ichiga olgan maxsus so'rov sinflari. Forma so'rovi sinfini yaratish uchun siz `make:request` Artisan CLI buyrug'idan foydalanishingiz mumkin:

```go
./artisan make:request StorePostRequest
./artisan make:request user/StorePostRequest
```

Yaratilgan forma so'rovi sinfi `app/http/requests` katalogiga joylashtiriladi. Agar bu katalog mavjud bo'lmasa, u siz `make:request` buyrug'ini ishga tushirganingizda yaratiladi. Goravel tomonidan yaratilgan har bir forma so'rovi `Authorize` va `Rules` usullariga ega. Shuningdek, qo'shimcha operatsiyalar uchun ixtiyoriy `Filters`, `Messages`, `Attributes` va `PrepareForValidation` usullarini sozlashingiz mumkin.

`Authorize` usuli joriy autentifikatsiyadan o'tgan foydalanuvchi so'rov bilan ifodalangan harakatni bajarishga qodir yoki yo'qligini aniqlash uchun mas'ul, `Rules` usuli esa so'rov ma'lumotlariga qo'llanilishi kerak bo'lgan tekshirish qoidalarini qaytaradi:

```go
package requests

import (
  "mime/multipart"

  "github.com/goravel/framework/contracts/http"
)

type StorePostRequest struct {
  Name string `form:"name" json:"name"`
  File *multipart.FileHeader `form:"file" json:"file"`
  Files []*multipart.FileHeader `form:"files" json:"files"`
}

func (r *StorePostRequest) Authorize(ctx http.Context) error {
  return nil
}

func (r *StorePostRequest) Rules(ctx http.Context) map[string]any {
  return map[string]any{
    // Kalitlar kiruvchi kalitlar bilan mos keladi.
    "name": "required|max:255",
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

Siz forma so'rovining `Filters` usulini takomillashtirish orqali kiruvchi ma'lumotlarni formatlashingiz mumkin. Ushbu usul `attribute/filter` juftliklari xaritasini qaytarishi kerak. Filter qiymatlari satr yoki `[]string` qiymatlari bo'lishi mumkin:

```go
func (r *StorePostRequest) Filters(ctx http.Context) map[string]any {
  return map[string]any{
    "name": "trim",
    "age": []string{"trim", "to_int"},
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

Agar siz so'rovdagi `Validate` usulidan foydalanmasangiz, `facades.Validation()` yordamida validator namunasini qo'lda yaratishingiz mumkin. Fasadning `Make` usuli yangi validatori namunasi yaratadi:

```go
func (r *PostController) Store(ctx http.Context) http.Response {
  validator, _ := facades.Validation().Make(
    ctx,
    map[string]any{
      "name": "Goravel",
    },
    map[string]any{
      "title": "required|max:255",
      "body":  "required",
    })

  if validator.Fails() {
    // Xatolikni qaytarish
  }

  var user models.User
  err := validator.Bind(&user)
  ...
}
```

`ctx` dan keyin, `Make` usuliga uzatiladigan ma'lumot argumenti `map[string]any`, `struct`, `url.Values`, `map[string][]string`, `*http.Request` yoki boshqa qo'llab-quvvatlanadigan so'rov ma'lumot manbasi bo'lishi mumkin. Keyingi argument bu `map[string]any` turidagi tekshirish qoidalari. Qoida qiymatlari satr yoki `[]string` qiymatlari bo'lishi mumkin.

### Xato Xabarlarini Sozlash

Agar kerak bo'lsa, siz Goravel tomonidan taqdim etilgan sukut bo'yicha xato xabarlari o'rniga validatori namunasi ishlatishi kerak bo'lgan maxsus xato xabarlarini taqdim etishingiz mumkin. Siz maxsus xabarlarni `validation.Messages` bilan o'tkazishingiz mumkin (`ctx.Request().Validate()` uchun ham qo'llaniladi):

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

Aniq xabar to'ldirishlari (overrides) maxsus qoida standartlaridan ustunlikka ega. Goravel xabarlarni quyidagi tartibda hal qiladi: `field.rule` xabari, keyin `rule` xabari, so'ngra maxsus qoidaning `Message()` qaytarish qiymati.

### Maxsus Atribut Qiymatlarini Belgilash

Goravelning ko'pgina o'rnatilgan xato xabarlarida `:attribute` belgisi mavjud bo'lib, u tekshirilayotgan maydon yoki atribut nomi bilan almashtiriladi. Ushbu belgilarni almashtirish uchun ishlatiladigan qiymatlarni maxsus maydonlar uchun sozlash uchun siz maxsus atributlarni `validation.Attributes` bilan o'tkazishingiz mumkin (shuningdek, `ctx.Request().Validate()` uchun ham qo'llaniladi):

```go
validator, err := facades.Validation().Make(ctx, input, rules, validation.Attributes(map[string]string{
  "email": "elektron manzil",
}))
```

### Tekshirishdan Oldin Ma'lumotlarni Formatlash

Ma'lumotlarni tekshirishdan oldin ularni formatlash orqali yanada moslashuvchan tekshirishni amalga oshirishingiz mumkin va siz formatlash callback-ni `validation.PrepareForValidation` bilan o'tkazishingiz mumkin (shuningdek, `ctx.Request().Validate()` uchun ham qo'llaniladi):

```go
import (
  "context"

  validationcontract "github.com/goravel/framework/contracts/validation"
  "github.com/goravel/framework/validation"
)

func (r *PostController) Store(ctx http.Context) http.Response {
  validator, err := facades.Validation().Make(ctx, input, rules,
    validation.PrepareForValidation(func(ctx context.Context, data validationcontract.Data) error {
      if name, exist := data.Get("name"); exist {
        return data.Set("name", name)
      }

      return nil
    }))

  ...
}
```

## Tekshirilgan Kirish Ma'lumotlari bilan Ishlash

Forma so'rovlari yoki qo'lda yaratilgan tekshiruvchi namunalari yordamida kiruvchi so'rov ma'lumotlarini tekshirgandan so'ng, siz tekshirilgan ma'lumotlarni olishingiz yoki so'rov ma'lumotlarini `struct` ga bog'lashingiz mumkin.

1. Tekshirish muvaffaqiyatli o'tgandan so'ng, faqat tekshirish qoidalari bilan qoplangan maydonlarni olish uchun `Validated` metodidan foydalaning. Cheklangan maydonlar tashlab qo'yiladi va wildcard slice qoidalari asl slice shaklini saqlaydi:

```go
rules := map[string]any{
  "name": "required|string",
  "scores.*": "required|integer",
}

validator, err := ctx.Request().Validate(rules)
validated := validator.Validated()
```

2. Tasdiqlash muvaffaqiyatli bo'lgandan so'ng ma'lumotlarni structga bog'lash uchun `Bind` metodidan foydalaning. `Bind` tasdiqlangan ma'lumotlarni asl so'rov ma'lumotlariga qayta birlashtiradi, shuning uchun qoidalarsiz maydonlar hali ham bog'lanishi mumkin:

```go
validator, err := ctx.Request().Validate(rules)
var user models.User
err := validator.Bind(&user)

validator, err := facades.Validation().Make(ctx, input, rules)
var user models.User
err := validator.Bind(&user)
```

3. Kiruvchi ma'lumotlar so'rovni tekshirishdan foydalanganda avtomatik ravishda forma so'roviga bog'lanadi:

```go
var storePost requests.StorePostRequest
errors, err := ctx.Request().ValidateRequest(&storePost)
fmt.Println(storePost.Name)
```

## Xato Xabarlari bilan Ishlash

### Maydon Uchun Bitta Xato Xabarini Olish

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

## Tarjima va Mahalliylashtirish

### Tasdiqlash Xabarlari uchun Tarjimadan Foydalanish

Tasdiqlash xato xabarlari endi frameworkning [mahalliylashtirish](../digging-deeper/localization.md) tizimi tomonidan quvvatlanadi. Standart xabarlar frameworkga o'rnatilgan va avtomatik ravishda ilovaning joriy lokalidan foydalanadi. Xabarlarni qidirish quyidagi tartibda amalga oshiriladi:

1. Form-so'rov `Messages()` yoki aniq `validation.Messages()` override qiladi (`field.rule`, keyin `rule`)
2. Maxsus qoidaning `Message()` metodi
3. Tarjima faylini qidirish `validation.*` kalitlari bilan (masalan, `validation.required`, `validation.min.string`)
4. O'rnatilgan standart xabarlar

Hajmga asoslangan qoidalar uchun, masalan `min`, `max`, `between`, `size`, `gt`, `gte`, `lt` va `lte`, tarjima kaliti atribut turi qo'shimchasini o'z ichiga oladi (masalan, `min.string`, `min.numeric`, `min.array`, `min.file`).

### Validatsiya til fayllarini nashr qilish

Validatsiya til fayllarini ilovangizning `lang` katalogiga nashr qilish uchun `lang:publish` Artisan buyrug'idan foydalaning:

```shell
go run . artisan lang:publish
```

Bu validatsiya tarjima fayllarini frameworkdan `lang/en/validation.json` ga nusxalaydi, u yerda standart xato xabarlarini moslashtirishingiz mumkin.

Mavjud fayllarni qayta yozish uchun `--force` (yoki `-f`) bayrog‘idan foydalaning:

```shell
go run . artisan lang:publish --force
```

### Odatiy Xabarlarni Sozlash

Nashr qilgandan so'ng, har qanday validatsiya xabarini sozlash uchun `lang/en/validation.json` faylini tahrirlang. Masalan:

```json
{
    "required": "You forgot the :attribute field!",
    "email": "The :attribute must be a valid email address."
}
```

Ushbu maxsus xabarlar ilovangizdagi barcha validatorlar tomonidan ishlatiladi, agar ular forma so'rovining `Messages()` yoki aniq `validation.Messages()` tomonidan o'zgartirilmasa.

### Boshqa Tillarga Tarjima Qilish

Qo'shimcha tillarni qo'llab-quvvatlash uchun nashr qilingan `lang/en/validation.json` faylining nusxasini tegishli til katalogida (masalan, `lang/zh/validation.json`) yarating va xabarlarni tarjima qiling. Framework joriy locale qiymatiga qarab mos til faylidan foydalanadi, u `facades.App().SetLocale(ctx, "zh")` tomonidan o'rnatiladi.

## Mavjud Tekshirish Qoidalari

Validatsiya qoidalari nomlari endi sukut bo'yicha snake_case dan foydalanadi. Qoidalar va filtrlar `map[string]any` bilan belgilanadi; har bir qiymat vertikal chiziq bilan ajratilgan `string` yoki qoida nomlarining `[]string` bo'lishi kerak.

```go
rules := map[string]any{
  "title": "required|string|max:255",
  "slug": []string{"required", "regex:^(news|docs)-[a-z]+$", "string"},
}
```

Agar `regex` yoki `not_regex` namunasi `|` belgisini o'z ichiga olgan bo'lsa va undan keyin qo'shimcha qoidalar qo'shish kerak bo'lsa, `[]string` dan foydalaning.

| Kategoriya                   | Qoidalar                                                                                                                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Majburiy                     | `required`, `required_if`, `required_unless`, `required_with`, `required_with_all`, `required_without`, `required_without_all`, `required_if_accepted`, `required_if_declined`                                                        |
| Mavjudlik                    | `filled`, `present`, `present_if`, `present_unless`, `present_with`, `present_with_all`, `missing`, `missing_if`, `missing_unless`, `missing_with`, `missing_with_all`                                                                |
| Qabul qilingan / Rad etilgan | `accepted`, `accepted_if`, `declined`, `declined_if`                                                                                                                                                                                  |
| Taqiqlangan                  | `prohibited`, `prohibited_if`, `prohibited_unless`, `prohibited_if_accepted`, `prohibited_if_declined`, `prohibits`                                                                                                                   |
| Turi                         | `string`, `integer`, `int`, `uint`, `numeric`, `boolean`, `bool`, `float`, `array`, `list`, `slice`, `map`                                                                                                                            |
| Hajmi                        | `size`, `min`, `max`, `between`, `gt`, `gte`, `lt`, `lte`                                                                                                                                                                             |
| Raqamli                      | `digits`, `digits_between`, `decimal`, `multiple_of`, `min_digits`, `max_digits`                                                                                                                                                      |
| Matn formati                 | `alpha`, `alpha_num`, `alpha_dash`, `ascii`, `email`, `url`, `active_url`, `ip`, `ipv4`, `ipv6`, `mac_address`, `mac`, `json`, `uuid`, `uuid3`, `uuid4`, `uuid5`, `ulid`, `hex_color`, `regex`, `not_regex`, `lowercase`, `uppercase` |
| Matn tarkibi                 | `starts_with`, `doesnt_start_with`, `ends_with`, `doesnt_end_with`, `contains`, `doesnt_contain`, `confirmed`                                                                                                                         |
| Taqqoslash                   | `same`, `different`, `eq`, `ne`, `in`, `not_in`, `in_array`, `in_array_keys`                                                                                                                                                          |
| Date                         | `date`, `date_format`, `date_equals`, `before`, `before_or_equal`, `after`, `after_or_equal`, `timezone`                                                                                                                              |
| Chetlatish                   | `exclude`, `exclude_if`, `exclude_unless`, `exclude_with`, `exclude_without`                                                                                                                                                          |
| Fayl                         | `file`, `image`, `mimes`, `mimetypes`, `extensions`, `dimensions`, `encoding`                                                                                                                                                         |
| Boshqaruv                    | `bail`, `nullable`, `sometimes`                                                                                                                                                                                                       |
| Massiv / Ma'lumotlar bazasi  | `distinct`, `required_array_keys`, `exists`, `unique`                                                                                                                                                                                 |

`size`, `min`, `max`, `between`, `gt`, `gte`, `lt` va `lte` qoidalari turga sezgir. Ular raqamli maydonlar uchun raqamli qiymatlarni, satrlar uchun satr uzunligini, massivlar, slice va map'lar uchun elementlar sonini va fayllar uchun fayl hajmini solishtiradi.

`exists` qoidasi `exists:table,column1,column2,...` formatidan foydalanadi. `unique` qoidasi `unique:table,column,idColumn,except1,except2,...` formatidan foydalanadi. Ikkala qoida ham jadval parametri uchun `connection.table` sintaksisini qo'llab-quvvatlaydi.

`active_url` qoidasi URL hosti uchun DNS so'rovini amalga oshiradi. Uni so'rovning tezkor yo'llarida ehtiyotkorlik bilan ishlating, chunki DNS hal etish kechikish keltirishi mumkin.

### Eskirgan Qoida Taxalluslari

Quyidagi taxalluslar orqaga mos keladi, ammo keyingi asosiy versiyada olib tashlanadi. Yangi snake_case nomlarini afzal ko'ring:

| Eskirgan    | Buning o'rniga     |
| ----------- | ------------------ |
| `len`       | `hajmi`            |
| `min_len`   | `min`              |
| `max_len`   | `max`              |
| `eq_field`  | `bir xil`          |
| `ne_field`  | `farqli`           |
| `gt_field`  | `gt`               |
| `gte_field` | `katta yoki teng`  |
| `lt_field`  | `lt`               |
| `lte_field` | `kichik yoki teng` |
| `gt_date`   | `keyin`            |
| `lt_date`   | `oldin`            |
| `gte_date`  | `keyin yoki teng`  |
| `lte_date`  | `oldin yoki teng`  |
| `number`    | `sonli`            |
| `full_url`  | `url`              |

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
  "context"
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

Maxsus qoida xabarlari quyidagi to'ldiruvchilarni qo'llab-quvvatlaydi:

| To'ldiruvchi                                                                | Tavsifi                                       |
| --------------------------------------------------------------------------- | --------------------------------------------- |
| `:attribute`                                                                | Maydon nomi yoki maxsus atribut               |
| :value                                                      | Tekshirilayotgan maydon qiymati               |
| `:option0`, `:option1`, ... | `Passes()` ga uzatiladigan qoida parametrlari |

```go
// Barcha o'rin egalari bilan misol
func (receiver *Between) Message(ctx context.Context) string {
  return ":attribute qiymati :value :option0 va :option1 oralig'ida bo'lishi kerak."
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

Tekshirish filtrlari sukut bo'yicha snake_case nomlaridan foydalanadi. Filtrlash tekshirishdan oldin ishga tushadi va forma so'rovlarida yoki validatori qo'lda yaratishda `validation.Filters` bilan e'lon qilinishi mumkin.

| Kategoriya             | Filtrlash                                                                      |
| ---------------------- | ------------------------------------------------------------------------------ |
| Satrni tozalash        | `trim`, `ltrim`, `rtrim`                                                       |
| Harflarni o'zgartirish | `lower`, `upper`, `title`, `ucfirst`, `lcfirst`                                |
| Nomlash uslubi         | `camel`, `snake`                                                               |
| Tur konversiyasi       | `to_int`, `to_int64`, `to_uint`, `to_float`, `to_bool`, `to_string`, `to_time` |
| Qisqa tur aliaslari    | `int`, `int64`, `uint`, `float`, `bool`                                        |
| Qochish / Kodlash      | `strip_tags`, `escape_js`, `escape_html`, `url_encode`, `url_decode`           |
| Satrni ajratish        | `str_to_ints`, `str_to_array`, `str_to_time`                                   |

```go
validator, err := facades.Validation().Make(ctx, input, rules, validation.Filters(map[string]any{
  "name": "trim",
  "age": []string{"trim", "to_int"},
}))
```

### Eskirgan Filter Taxalluslari

Quyidagi taxalluslar orqaga mos keladi, ammo keyingi asosiy versiyada olib tashlanadi. Yangi snake_case nomlarini afzal ko'ring:

| Eskirgan                             | Buning o'rniga foydalaning |
| ------------------------------------ | -------------------------- |
| `trimSpace`                          | `kesish`                   |
| `trimLeft`                           | `ltrim`                    |
| `trimRight`                          | `oʻng tomondan kesish`     |
| `lowercase`                          | `lower`                    |
| `uppercase`                          | `katta`                    |
| `lcFirst`, `lowerFirst`              | `lcfirst`                  |
| `ucFirst`, `upperFirst`              | `birinchi harfni katta`    |
| `ucWord`, `upperWord`                | `sarlavha`                 |
| `camelCase`                          | `camel`                    |
| `snakeCase`                          | `iloncha`                  |
| `toInt`, `integer`                   | `to_int`                   |
| `toUint`                             | `to_uint`                  |
| `toInt64`                            | `to_int64`                 |
| `toFloat`                            | `to_float`                 |
| `toBool`                             | `to_bool`                  |
| `toString`                           | `to_string`                |
| `toTime`, `str2time`, `strToTime`    | `to_time` or `str_to_time` |
| `escapeJs`, `escapeJS`               | `escape_js`                |
| `escapeHtml`, `escapeHTML`           | `escape_html`              |
| `urlEncode`                          | `url_encode`               |
| `urlDecode`                          | `url_decode`               |
| `stripTags`                          | `strip_tags`               |
| `str2ints`, `strToInts`              | `str_to_ints`              |
| `str2arr`, `str2array`, `strToArray` | `str_to_array`             |

## Maxsus filtrlar

Goravel foydali filtrlarning keng assortimentini taqdim etadi, ammo siz o‘zingizning ba’zilaringizni belgilashni xohlashingiz mumkin.

### Maxsus Filtrlarni Yaratish

Yangi filtr obyektini yaratish uchun siz oddiygina `make:filter` Artisan buyrug‘idan foydalanishingiz mumkin. Keling, satrni butun songa o‘tkazadigan filtrni yaratish uchun ushbu buyruqdan foydalanaylik. Bu filtr allaqachon freymvorkga kiritilgan, biz uni faqat misol sifatida yaratamiz. Goravel ushbu yangi filtri `app/filters` katalogiga saqlaydi. Agar bu katalog mavjud bo‘lmasa, Goravel filtrni yaratish uchun Artisan buyrug‘ini ishga tushirganingizda uni yaratadi:

```go
./artisan make:filter ToInt
./artisan make:filter user/ToInt
```

### Maxsus Filtrlarni Belgilash

Bitta filtr ikkita usulni o‘z ichiga oladi: `Signature` va `Handle`. `Signature` usuli filtr nomini belgilaydi. `Handle` usuli aniq filtr mantiqini bajaradi:

```go
package filters

import (
  "context"

  "github.com/spf13/cast"
)

type ToInt struct {
}

// Signature The signature of the filter.
func (receiver *ToInt) Signature() string {
  return "to_int_custom"
}

// Handle defines the filter function to apply.
func (receiver *ToInt) Handle(ctx context.Context) any {
  return func (val any) int {
    return cast.ToInt(val)
  }
}
```

### Maxsus Filtrlarni Ro‘yxatdan O‘tkazish

`make:filter` tomonidan yaratilgan yangi filtr `bootstrap/filters.go::Filters()` funksiyasida avtomatik ro‘yxatdan o‘tkaziladi va funksiya `WithFilters` tomonidan chaqiriladi. Agar siz filtr faylini o‘zingiz yaratsangiz, filtrni qo‘lda ro‘yxatdan o‘tkazishingiz kerak.

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithFilters(Filters).
		WithConfig(config.Boot).
		Create()
}
```
