# HTTP mijozi

[[toc]]

## Kirish

Dasturiy ta'minotni ishlab chiqishda, ma'lumotlarni olish uchun API ni chaqirish kerak bo'lgan ko'p holatlar mavjud — xoh u mikroservisga ulanish bo'lsin, xoh uchinchi tomon API siga kirish bo'lsin. Bunday hollarda,
Goravel standart "net/http" kutubxonasida yaratilgan, foydalanish oson, ifodali va minimalist API-ni taklif qiladi, bularning barchasi ishlab chiquvchilar tajribasini yaxshilash uchun mo'ljallangan.

## Konfiguratsiya

Goravelning HTTP mijozi HTTP so'rovlarini amalga oshirish uchun `net/http.Client` ustiga qurilgan. Agar uning ichki sozlamalarini o'zgartirishingiz kerak bo'lsa, shunchaki `config/http.go` faylidagi `clients` xususiyatini yangilang.

## So'rovlar berish

Http jabhasi tanish fe'llar yordamida HTTP so'rovlarini amalga oshirishning qulay usulini taqdim etadi: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD` va `OPTIONS`.

**Example: GET Request**

```go
response, err := facades.Http().Get("https://example.com")
```

Har bir HTTP fe'l usuli `framework/contracts/http/client.Response` turidagi `javob` va agar so'rov bajarilmasa, `err` qaytaradi.

Qaysi HTTP mijoz konfiguratsiyasidan foydalanishni belgilash uchun `Client` funksiyasidan foydalanishingiz mumkin:

```go
response, err := facades.Http().Client("github").Get("https://example.com")
```

### Javob interfeysi

`framework/contracts/http/client.Response` interfeysi HTTP javobi bilan o'zaro ishlashning quyidagi usullarini taqdim etadi:

```go
type Response interface {
Bind(value any) xatosi // Javob tanasini strukturaga bog'lash
Body() (string, error) // Javob tanasini satr sifatida olish
ClientError() bool // Holat kodi 4xx oralig'ida ekanligini tekshirish
Cookie(name string) *http.Cookie // Muayyan cookie-faylni olish
Cookie() []*http.Cookie // Barcha javob cookie-fayllarini olish
Failed() bool // Holat kodi 2xx oralig'ida emasligini tekshirish
Header(name string) string // Muayyan sarlavhaning qiymatini olish
Header() http.Header // Barcha javob sarlavhalarini olish
Json() (map[string]any, error) // Javob tanasini JSON sifatida xaritaga dekodlash
Redirect() bool // Javob yo'naltirish ekanligini tekshirish (3xx holat kodi)
ServerError() bool // Holat kodi 5xx oralig'ida ekanligini tekshirish
Status() int // HTTP holat kodini olish
Successful() bool // Holat kodi 2xx oralig'ida ekanligini tekshirish

/* holat kodi bilan bog'liq usullar */

OK() bool // 200 OK
Yaratilgan() bool // 201 Yaratilgan
Qabul qilingan() bool // 202 Qabul qilingan
Kontent yo'q() bool // 204 Kontent yo'q Ko'chirildi Doimiy() bool // 301 Doimiy ko'chirildi
Topildi() bool // 302 Topildi
NodRequest() bool // 400 Noto'g'ri so'rov Ruxsatsiz() bool // 401 Ruxsatsiz
To'lov talab qilinadi() bool // 402 To'lov talab qilinadi Taqiqlangan() bool // 403 Taqiqlangan
Topilmadi() bool // 404 Topilmadi
RequestTimeout() bool // 408 So'rov vaqti tugadi
Conflict() bool // 409 Conflict
UnprocessableEntity() bool // 422 Ishlov berilmaydigan obyekt TooManyRequests() bool // 429 Juda ko'p so'rovlar
}
```

### URI shablonlari

URI shablonlari sizga joy egallovchilaridan foydalanib, dinamik so'rov URL manzillarini yaratish imkonini beradi.
Siz ushbu joy egallovchilarni URL manzilingizda belgilashingiz va keyin so'rov yuborishdan oldin ularni almashtirish uchun qiymatlarni taqdim etishingiz mumkin.
Bunga erishish uchun siz bitta parametrlar uchun `WithUrlParameter` yoki bir nechta parametrlar uchun `WithUrlParameters` dan foydalanishingiz mumkin.

```go
response, err := facades.Http().
	WithUrlParameter("id", "123").
	Get("https://api.example.com/users/{id}")

// or

response, err := facades.Http().
    WithUrlParameters(map[string]string{
        "bookId":        "456",
        "chapterNumber": "7",
    }).
    Get("https://api.example.com/books/{bookId}/chapters/{chapterNumber}")
```

### So'rov parametrlarini so'rash

Bitta parametrlar uchun `WithQueryParameter` yoki xarita orqali bir nechta parametrlar uchun`WithQueryParameters` dan foydalanib, so'rovlaringizga so'rov parametrlarini qo'shing.

```go
response1, err1 := facades.Http().
    WithQueryParameter("sort", "name").
    Get("https://api.example.com/users")
// Resulting URL: https://api.example.com/users?sort=name

// or multiple query parameters
response2, err2 := facades.Http().
    WithQueryParameters(map[string]string{
        "page":     "2",
        "pageSize": "10",
    }).
    Get("https://api.example.com/products")
// Resulting URL: https://api.example.com/products?page=2&pageSize=10
```

Shuningdek, so'rov parametrlarini to'g'ridan-to'g'ri formatlangan satr sifatida `WithQueryString` yordamida qo'shishingiz mumkin:

```go
response, err := facades.Http().
    WithQueryString("filter=active&order=price").
    Get("https://api.example.com/items")
```

### So'rov matnini yuborish

`POST`, `PUT`, `PATCH` va `DELETE` kabi HTTP fe'llari uchun ikkinchi argument sifatida `io.Reader` ni qabul qiling.
Bino yuklamalarini soddalashtirish uchun tizim so'rov tanalarini qurish uchun foydali usullarni taqdim etadi.

```go
import "github.com/goravel/framework/support/http"

builder := http.NewBody().SetField("name", "krishan")

body, err := builder.Build()

response, err := facades.Http().WithHeader("Content-Type", body.ContentType()).Post("https://example.com/users", body.Reader())
```

### Sarlavhalar

Siz so'rovlaringizga bitta sarlavha uchun `WithHeader` yoki xarita sifatida taqdim etilgan bir nechta sarlavhalar uchun `WithHeaders` dan foydalanib sarlavhalar qo'shishingiz mumkin.

```go
response, err := facades.Http().
        WithHeader("X-Custom-Header", "value").
        Get("https://api.example.com")

// Add multiple headers
response, err = facades.Http().
        WithHeaders( map[string]string{
            "Content-Type": "application/json",
            "Accept":       "application/xml",
        }).
        Get("https://api.example.com")
```

So'rovingizga javoban ilovangiz kutayotgan kontent turini ko'rsatish uchun "Qabul qilish" usulidan foydalanishingiz mumkin:

```go
response, err := facades.Http().
    Accept("application/xml").
    Get("https://api.example.com")
```

Qulaylik uchun, API javobi `application/json` formatida bo'lishini kutishingizni tezda belgilash uchun `AcceptJson` dan foydalanishingiz mumkin:

```go
response, err := facades.Http().
    AcceptJson().
    Get("https://api.example.com/data")
```

Mavjud sarlavhalarni yangi to'plam bilan almashtirish uchun "ReplaceHeaders" dan foydalaning:

```go
response, err := facades.Http().
        ReplaceHeaders(map[string]string{
            "Authorization": "Bearer token",
        }).
        Get("https://api.example.com")
```

Siz "WithoutHeader" yordamida ma'lum bir sarlavhani olib tashlashingiz yoki "FlushHeaders" yordamida barcha sarlavhalarni tozalashingiz mumkin.

```go
javob, xato := facades.Http().
WithoutHeader("X-Previous-Header").
Get("https://api.example.com")

// barcha sarlavhalarni tozalash
javob, xato := facades.Http().
FlushHeaders().
Get("https://api.example.com")
```

### Autentifikatsiya

Siz asosiy autentifikatsiyani `WithBasicAuth` usuli yordamida belgilashingiz mumkin:

```go
response, err := facades.Http().
    WithBasicAuth("username", "password").
    Get("https://api.example.com/protected")
```

#### Bearer  tokenlar

So'rovning "Avtorizatsiya" sarlavhasiga tashuvchi tokenni tezda qo'shish uchun siz "WithToken" usulidan foydalanishingiz mumkin:

```go
response, err := facades.Http().
    WithToken("your_bearer_token").
    Get("https://api.example.com/api/resource")
```

:::tip
`WithToken` usuli shuningdek, token turini (masalan, "Bearer", "Token") belgilash uchun ixtiyoriy ikkinchi argumentni ham qabul qiladi.
Agar hech qanday tur ko'rsatilmagan bo'lsa, u standart holatda "Tashiydigan" ga o'rnatiladi.

```go
response, err := facades.Http().
    WithToken("custom_token", "Token").
    Get("https://api.example.com/api/resource")
```

:::

So'rovdan tashuvchi tokenni olib tashlash uchun `WithoutToken` usulidan foydalaning:

```go
response, err := facades.Http().
    WithoutToken().
    Get("https://api.example.com/api/resource")
```

### Kontekst

HTTP so'rovlaringizni kontekstga moslashtirish uchun "WithContext" dan foydalanishingiz mumkin.
Bu sizga so'rovning hayot aylanishini boshqarish imkonini beradi, masalan, vaqtni belgilash yoki bekor qilishni yoqish orqali.

```go
ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
defer cancel()

response, err := facades.Http().WithContext(ctx).Get("https://example.com")
```

### Bog'lanish javobi

Javob bog'lanishi kerak bo'lgan tuzilmani belgilash uchun siz "Bind" usulidan foydalanishingiz mumkin.

```go
type User struct {
    ID   int    `json:"id"`
    Name string `json:"name"`
}

func main() {
    var user User
    response, err := facades.Http().AcceptJson().Get("https://jsonplaceholder.typicode.com/users/1")
    if err != nil {
        fmt.Println("Error making request:", err)
        return
    }

    err = response.Bind(&user)
    if err != nil {
        fmt.Println("Error binding response:", err)
        return
    }
    
    fmt.Printf("User ID: %d, Name: %s\n", user.ID, user.Name)
}
```

### Cookie

HTTP so'rovlaringiz bilan cookie-fayllarni yuborish uchun bitta cookie-fayl uchun `WithCookie` yoki bir nechta cookie-fayllar uchun `WithCookies` dan foydalanishingiz mumkin.

```go
response, err := facades.Http().
	WithCookie(&http.Cookie{Name: "user_id", Value: "123"}).
	Get("https://example.com/profile")

// multiple cookies
response, err := facades.Http().
	WithCookies([]*http.Cookie{
        {Name: "session_token", Value: "xyz"},
        {Name: "language", Value: "en"},
    }).
	Get("https://example.com/dashboard")
```

So'rovingiz bilan birga ma'lum cookie-fayllar yuborilishining oldini olish uchun siz "WithoutCookie" dan foydalanishingiz mumkin.

```go
response, err := facades.Http().
	WithoutCookie("language").
	Get("https://example.com")
```

## Sinov

Ilovangizni sinab ko'rishda ko'pincha tashqi API-larga haqiqiy tarmoq so'rovlarini yuborishdan qochishingiz kerak. Goravel testlarni tezlashtirish, tezlik chegaralaridan qochish yoki muvaffaqiyatsizlik stsenariylarini simulyatsiya qilish uchun bo'ladimi, buni osonlashtiradi. “Http” fasadi HTTP mijoziga soʻrovlar yuborilganda notoʻgʻri (soxta) javoblarni qaytarish boʻyicha koʻrsatma berish imkonini beruvchi kuchli “Soxta” usulini taqdim etadi.

### Soxta javoblar

Soxta so'rovlarni boshlash uchun xaritani "Soxta" usuliga o'tkazing. Kalitlar siz ushlamoqchi bo'lgan URL naqshlarini yoki mijoz nomlarini, qiymatlar esa qaytariladigan javoblarni ifodalaydi. Siz `*` belgisini joker belgi sifatida ishlatishingiz mumkin.

"Http" jabhasi turli xil soxta javoblarni yaratish uchun qulay "Javob" quruvchisini taqdim etadi.

```go
facades.Http().Fake(map[string]any{
// Muayyan URL manzilini stubga qo'yish
"https://github.com/goravel/framework": facades.Http().Response().Json(200, map[string]string{"foo": "bar"}),

// Joker belgili naqshni stubga qo'yish
"https://google.com/*": facades.Http().Response().String(200, "Salom Dunyo"),

// Muayyan mijozni stubga qo'yish (config/http.go da belgilangan)
"github": facades.Http().Response().OK(),
})
```

**Zaxira URL manzillari**

"Soxta" da belgilangan naqshga mos kelmaydigan har qanday so'rov odatda tarmoq orqali bajariladi. Buning oldini olish uchun, siz barcha mos kelmaydigan URL manzillariga mos keladigan bitta `*` joker belgisidan foydalanib, zaxira nusxasini belgilashingiz mumkin.

```go
facades.Http().Fake(map[string]any{
     "https://github.com/*": facades.Http().Response().Json(200, map[string]string{"id": "1"}),
     "*": facades.Http().Response().Status(404),
})
```

**Yashirin konversiyalar**

Qulaylik uchun, siz har doim ham "Javob" konstruktoridan foydalanishingiz shart emas. Siz oddiy `int`, `string` yoki `map` qiymatlarini uzatishingiz mumkin va Goravel ularni avtomatik ravishda javoblarga aylantiradi.

```go
facades.Http().Fake(map[string]any{
    "https://goravel.dev/*": "Hello World",               // String -> 200 OK with body
    "https://github.com/*":  map[string]string{"a": "b"}, // Map -> 200 OK JSON
    "https://stripe.com/*":  500,                         // Int -> Status code only
})
```

### Soxta javob quruvchisi

`facades.Http().Response()` usuli maxsus javoblarni osongina yaratish uchun ravon interfeysni ta'minlaydi.

```go
// Fayl tarkibidan foydalanib javob yarating
facades.Http().Response().File(200, "./tests/fixtures/user.json")

// JSON javobini yarating
facades.Http().Response().Json(201, map[string]any{"created": true})

// Maxsus sarlavhalar bilan javob yarating
sarlavhalar := http.Header{}
headers.Add("X-Custom", "Value")
facades.Http().Response().Make(200, "Body Content", sarlavhalar)

// Standart holat yordamchilari
facades.Http().Response().OK()
facades.Http().Response().Holat(403)
```

### Soxta javob ketma-ketliklari

Ba'zan bitta URL bir qator turli xil javoblarni ketma-ket qaytarishi kerakligini belgilashingiz kerak bo'lishi mumkin, masalan, qayta urinishlarni sinab ko'rish yoki tezlikni cheklovchi mantiqni sinab ko'rish paytida. Ushbu oqimni yaratish uchun siz "Ketma-ketlik" usulidan foydalanishingiz mumkin.

```go
facades.Http().Fake(map[string]any{
"github": facades.Http().Sequence().
PushStatus(500). // Birinchi so'rov: Server xatosi
PushString(429, "Tezlik chegarasi"). // Ikkinchi so'rov: Tezlik chegarasi
PushStatus(200), // Uchinchi so'rov: Muvaffaqiyatli
})
```

**Bo'sh ketma-ketliklar**

Ketma-ketlikdagi barcha javoblar tugagach, keyingi so'rovlar mijozning xato qaytarishiga olib keladi.
Agar xato qilish o'rniga standart javobni ko'rsatmoqchi bo'lsangiz, `WhenEmpty` usulidan foydalaning:

```go
facades.Http().Fake(map[string]any{
    "github": facades.Http().Sequence().
                PushStatus(200).
                WhenEmpty(facades.Http().Response().Status(404)),
})
```

### Tekshirish so'rovlari

Soxta javoblar berishda, to'g'ri so'rovlar aslida sizning arizangiz tomonidan yuborilganligini tekshirish juda muhimdir.
Siz so'rovni tekshirish va uning sizning kutganlaringizga mos kelishini ko'rsatuvchi mantiqiy qiymatni qaytarish uchun "AssertSent" usulidan foydalanishingiz mumkin.

```go
facades.Http().AssertSent(func(req client.Request) bool {
    return req.Url() == "https://api.example.com/users" &&
           req.Method() == "POST" &&
           req.Input("role") == "admin" &&
           req.Header("Authorization") != ""
})
```

**Boshqa tasdiqlar**

Shuningdek, ma'lum bir so'rov _yuborilmagan_ligini tasdiqlashingiz yoki yuborilgan so'rovlarning umumiy sonini tekshirishingiz mumkin:

```go
// So'rov yuborilmaganligini tasdiqlang
facades.Http().AssertNotSent(func(req client.Request) bool {
return req.Url() == "https://api.example.com/legacy-endpoint"
})

// Hech qanday so'rov yuborilmaganligini tasdiqlang
facades.Http().AssertNothingSent()

// Aynan 3 ta so'rov yuborilganligini tasdiqlang
facades.Http().AssertSentCount(3)
```

### Noto'g'ri so'rovlarning oldini olish

Sinovlaringiz qat'iy izolyatsiya qilinganligiga va tasodifan haqiqiy tashqi API-larga tegmasligiga ishonch hosil qilish uchun siz "PreventStrayRequests" usulidan foydalanishingiz mumkin. Buni chaqirgandan so'ng, belgilangan Fake qoidasiga mos kelmaydigan har qanday so'rov testni istisno bilan vahimaga soladi.

```go
facades.Http().Fake(map[string]any{
"github": facades.Http().Response().OK(),
}).PreventStrayRequests()

// Bu so'rov masxara qilindi va muvaffaqiyatli bajarildi
facades.Http().Client("github").Get("/")

// Bu so'rov masxara qilinmadi va vahimaga tushadi
facades.Http().Get("https://google.com")
```

**Maxsus adashganlarga ruxsat berish**

Agar siz ko'pgina so'rovlarni bloklashingiz kerak bo'lsa, lekin ma'lum ichki xizmatlarga (masalan, mahalliy sinov serveriga) ruxsat berishingiz kerak bo'lsa, siz "AllowStrayRequests" dan foydalanishingiz mumkin:

```go
facades.Http().PreventStrayRequests().AllowStrayRequests([]string{
    "http://localhost:8080/*",
})
```

### Holatni tiklash

"Http" fasadi singleton bo'lib, ya'ni masxara qilingan javoblar tozalanmaguncha sinov to'plamingizning butun ish vaqtida saqlanib qoladi. Bir testdan ikkinchisiga "oqish" holatlarining oldini olish uchun testni tozalash yoki sozlashda qat'iy ravishda "Qayta tiklash" usulidan foydalanishingiz kerak.

```go
func TestExternalApi(t *testing.T) {
fasadlarni kechiktirish.Http().Qayta tiklash()

fasadlar.Http().Soxta(nil)

// ... tasdiqlar
}
```

:::warning Global holat va parallel sinovlar
"Soxta" va "Qayta tiklash" usullari HTTP mijoz fabrikasining global holatini o'zgartiradi. Shu sababli, **siz HTTP mijozini parallel ravishda** (`t.Parallel()` yordamida) soxtalashtiradigan testlarni ishga tushirishdan qochishingiz kerak. Buni qilish poyga sharoitlariga olib kelishi mumkin, bunda bitta sinov modellarni qayta o'rnatadi, boshqasi esa hali ham ishlayapti.
:::


