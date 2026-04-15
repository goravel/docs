# HTTP Testlari

[[toc]]

## Kirish

Veb-ilovalarni yaratishda, siz tez-tez HTTP so'rovlaringiz boshidan oxirigacha to'g'ri ishlayotganligini sinab ko'rishingiz kerak bo'ladi. Goravelning test vositalari buni oddiy qiladi - siz murakkab test muhitlarini sozlashsiz so'rovlarni simulyatsiya qilishingiz va javoblarni tekshirishingiz mumkin.

## So'rovlar berish

Goravel-da HTTP nuqtalarini test qilish oddiy naqshdan foydalanadi. O'zingizning `TestCase` dan `Http` usuli bilan boshlang, u tasdiqlashlar uchun `*testing.T` parametrini talab qiladi. Bu sizga `Get`, `Post` va `Put` kabi barcha umumiy HTTP fe'llarini boshqaradigan so'rov ob'ektini (`framework/contracts/testing.TestRequest`) beradi.

Haqiqiy HTTP chaqiruvlarini amalga oshirish o'rniga, bu usullar ilovangizning so'rov tsikli ichki simulyatsiyasini amalga oshiradi. Har bir so'rov natijalarni tekshirish uchun usullarga ega bo'lgan javob ob'ektini (`framework/contracts/testing.TestResponse`) qaytaradi.

Bu yerda oddiy misol:

```go
func (s *ExampleTestSuite) TestIndex() {
	response, err := s.Http(s.T()).Get("/users/1")
	s.Nil(err)
	response.AssertStatus(200)
}
```

### So'rov sarlavhalarini sozlash

So'rov sarlavhalarini sozlash uchun bitta sarlavha uchun `WithHeader` yoki bir nechta sarlavhalar uchun `WithHeaders` dan foydalanishingiz mumkin:

```go
func (s *ExampleTestSuite) TestIndex() {
    // Bitta sarlavha
    response, err := s.Http(s.T()).WithHeader("X-Custom-Header", "Value").Get("/users/1")

    // Bir nechta sarlavhalar
    response, err := s.Http(s.T()).WithHeaders(map[string]string{
        "X-Custom-Header": "Value",
        "Accept": "application/json",
    }).Get("/users/1")
}
```

### Cookie

So'rov berishdan oldin cookie qiymatlarini o'rnatish uchun `WithCookie` yoki `WithCookies` usulidan foydalanishingiz mumkin.

```go
import "github.com/goravel/framework/testing/http"

func (s *ExampleTestSuite) TestIndex() {
	response, err := s.Http(s.T()).WithCookie(http.Cookie("name", "krishan")).Get("/users/1")

	// yoki bir nechta Cookie lar uchun WithCookies dan foydalaning
	response, err := s.Http(s.T()).WithCookies(http.Cookies(map[string]string{
        "name": "krishan",
        "lang": "en",
    })).Get("/users/1")
}
```

### WithSession

Ma'lumotlarni sessiyaga `WithSession` usuli yordamida o'rnatishingiz mumkin:

```go
func (s *ExampleTestSuite) TestIndex() {
	response, err := s.Http(s.T()).WithSession(map[string]any{"role": "admin"}).Get("/users/1")
}
```

### Javoblarni tuzatish

So'rov berilgandan so'ng, so'rovdan qaytarilgan ma'lumotlarni tekshirish uchun `Session`, `Headers`, `Content`, `Cookies` yoki `Json` usulidan foydalanishingiz mumkin.

```go
func (s *ExampleTestSuite) TestIndex() {
	response, err := s.Http(s.T()).WithSession(map[string]any{"role": "admin"}).Get("/users/1")

	content, err := response.Content()

	cookies := response.Cookies()

	headers := response.Headers()

	json, err := response.Json() // javob tanasi json (map[string]any) sifatida tahlil qilinadi

	session, err := response.Session() // joriy so'rov sessiyasida saqlangan barcha qiymatlarni qaytaradi
}
```

## Tana qurish

`Post`, `Put`, `Delete` va hokazo usullar uchun. Goravel `io.Reader` ni ikkinchi argument sifatida qabul qiladi. Yuklamalarni qurishni soddalashtirish uchun tizim so'rov tanalarini qurish uchun foydali usullarni taqdim etadi.

```go
import "github.com/goravel/framework/support/http"

func (s *ExampleTestSuite) TestIndex() {
    builder := http.NewBody().SetField("name", "krishan")

    body, err := builder.Build()

    response, err := s.Http(s.T()).WithHeader("Content-Type", body.ContentType()).Post("/users", body)
}
```

## JSON API larini test qilish

Goravel JSON API javoblarini samarali test qilish uchun bir nechta yordamchilarni taqdim etadi. U javob tanasini Go `map[string]any` ga o'tkazishga harakat qiladi. Agar o'tkazish muvaffaqiyatsiz bo'lsa, bog'liq tasdiqlar ham muvaffaqiyatsiz bo'ladi.

```go
func (s *ExampleTestSuite) TestIndex() {
    response, err := s.Http(s.T()).WithHeader("Content-Type", body.ContentType()).Post("/users", nil)
	s.Nil(err)

	response.AssertStatus(201).
		AssertJson(map[string]any{
			"created": true,
        })
}
```

O'tkazilgan JSON ga to'g'ridan-to'g'ri kirish uchun `TestResponse` dagi `Json` usulidan foydalaning. Bu sizga javob tanasining alohida elementlarini tekshirish imkonini beradi.

```go
json, err := response.Json()
s.Nil(err)
s.True(json["created"])
```

:::tip
`AssertJson` usuli javobda qo'shimcha maydonlar bo'lsa ham, javobda ko'rsatilgan barcha qiymatlar mavjudligini tekshiradi. `AssertExactJson` dan foydalanmaguningizcha, u aniq mos kelishni talab qilmaydi.
:::

### Aniq JSON mosliklarini tasdiqlash

Agar javobingiz kutilgan JSON bilan aniq mos kelishini (qo'shimcha yoki etishmayotgan maydonlarsiz) tekshirish kerak bo'lsa, `AssertExactJson` usulidan foydalaning.

```go
func (s *ExampleTestSuite) TestIndex() {
    response, err := s.Http(s.T()).WithHeader("Content-Type", body.ContentType()).Post("/users", nil)
	s.Nil(err)

	response.AssertStatus(201).
		AssertExactJson(map[string]any{
			"created": true,
        })
}
```

### Oqimli JSON test qilish

Goravel JSON javoblarida oqimli tasdiqlarni amalga oshirishni osonlashtiradi. `AssertFluentJson` usulidan foydalangan holda, siz `framework/contracts/testing.AssertableJSON` ning namunasi bilan ta'minlaydigan yopilishni o'tkazishingiz mumkin. Bu namun sizga so'rovingiz tomonidan qaytarilgan JSON javobidagi aniq qiymatlar yoki shartlarni tekshirish imkonini beradi.

Masalan, JSON javobida ma'lum bir qiymat mavjudligini tasdiqlash uchun `Where` usulidan, va atribut mavjud emasligiga ishonch hosil qilish uchun `Missing` usulidan foydalanishingiz mumkin.

```go
import contractstesting "github.com/goravel/framework/contracts/testing"

func (s *ExampleTestSuite) TestIndex() {
    response, err := s.Http(s.T()).Get("/users/1")
	s.Nil(err)

	response.AssertStatus(201).
		AssertFluentJson(func (json contractstesting.AssertableJSON) {
			json.Where("id", float64(1)).
				Where("name", "bowen").
				WhereNot("lang", "en").
				Missing("password")
        })
}
```

### Atribut mavjudligi / yo'qligini tasdiqlash

Agar atribut mavjud yoki yo'qligini tekshirishni istasangiz, Goravel buni `Has` va `Missing` usullari bilan soddalashtiradi.

```go
response.AssertStatus(201).
    AssertFluentJson(func (json contractstesting.AssertableJSON) {
        json.Has("username").
            Missing("password")
    })
```

Shuningdek, bir vaqtning o'zida bir nechta atributlarning mavjudligi yoki yo'qligini `HasAll` va `MissingAll` yordamida tasdiqlashingiz mumkin.

```go
response.AssertStatus(201).
    AssertFluentJson(func (json contractstesting.AssertableJSON) {
        json.Has([]string{"username", "email"}).
            MissingAll([]string{"verified", "password"})
    })
```

Agar sizga ro'yxatdan kamida bitta atributning mavjudligini tekshirish kerak bo'lsa, `HasAny` usulidan foydalaning.

```go
response.AssertStatus(201).
    AssertFluentJson(func (json contractstesting.AssertableJSON) {
		json.HasAny([]string{"username", "email"})
    })
```

### JSON kollektsiyasi tasdiqlarini qamrab olish

Javobda nomlangan kalit ostida ob'ektlar to'plami mavjud bo'lsa, uning tuzilishi va tarkibini tasdiqlash uchun turli usullardan foydalanishingiz mumkin.

```go
type Item struct {
    ID int `json:"id"`
}

facades.Route().Get("/", func(ctx http.Context) http.Response {
    items := []Item{
        {ID: 1},
        {ID: 2},
    }
    return ctx.Response().Json(200, map[string]{
		"items": items,
    })
}
```

Kolleksiyadagi elementlar sonini tekshirish uchun `Count` usulidan foydalanishingiz mumkin. Birinchi elementning xususiyatlarini tasdiqlash uchun `AssertableJson` namunasi bilan ta'minlaydigan `First` usulidan foydalaning. Xuddi shunday, `Each` usuli sizga barcha elementlar ustida aylanish va ularning xususiyatlarini alohida tasdiqlash imkonini beradi. Boshqa tomondan, `HasWithScope` usuli `First` va `Count` funksionalligini birlashtiradi, bu sizga birinchi elementni va uning tarkibini tasdiqlash imkonini beradi, shu bilan birga qamrovli tasdiqlar uchun `AssertableJson` namunasi bilan ta'minlaydi.

```go
// Count va First
response.AssertStatus(200).
    AssertFluentJson(func(json contractstesting.AssertableJSON) {
        json.Count("items", 2).
            First("items", func(json contractstesting.AssertableJSON) {
                json.Where("id", 1)
            })
    })

// Each
response.AssertStatus(200).
    AssertFluentJson(func(json contractstesting.AssertableJSON) {
        json.Count("items", 2).
            Each("items", func(json contractstesting.AssertableJSON) {
                json.Has("id")
            })
    })

// HasWithScope
response.AssertStatus(200).
    AssertFluentJson(func(json contractstesting.AssertableJSON) {
        json.HasWithScope("items", 2, func(json contractstesting.AssertableJSON) {
            json.Where("id", 1)
        })
    })
```

## Mavjud tasdiqlar

### Javob tasdiqlari

|                                                   |                                                         |                                                         |
| ------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| [AssertAccepted](#assertaccepted)                 | [AssertBadRequest](#assertbadrequest)                   | [AssertConflict](#assertconflict)                       |
| [AssertCookie](#assertcookie)                     | [AssertCookieExpired](#assertcookieexpired)             | [AssertCookieMissing](#assertcookiemissing)             |
| [AssertCookieNotExpired](#assertcookienotexpired) | [AssertCreated](#assertcreated)                         | [AssertDontSee](#assertdontsee)                         |
| [AssertExactJson](#assertexactjson)               | [AssertFluentJson](#assertfluentjson)                   | [AssertForbidden](#assertforbidden)                     |
| [AssertFound](#assertfound)                       | [AssertGone](#assertgone)                               | [AssertHeader](#assertheader)                           |
| [AssertHeaderMissing](#assertheadermissing)       | [AssertInternalServerError](#assertinternalservererror) | [AssertJson](#assertjson)                               |
| [AssertJsonMissing](#assertjsonmissing)           | [AssertMethodNotAllowed](#assertmethodnotallowed)       | [AssertMovedPermanently](#assertmovedpermanently)       |
| [AssertNoContent](#assertnocontent)               | [AssertNotAcceptable](#assertnotacceptable)             | [AssertNotFound](#assertnotfound)                       |
| [AssertNotModified](#assertnotmodified)           | [AssertOk](#assertok)                                   | [AssertPartialContent](#assertpartialcontent)           |
| [AssertPaymentRequired](#assertpaymentrequired)   | [AssertRequestTimeout](#assertrequesttimeout)           | [AssertSee](#assertsee)                                 |
| [AssertSeeInOrder](#assertseeinorder)             | [AssertServerError](#assertservererror)                 | [AssertServiceUnavailable](#assertserviceunavailable)   |
| [AssertStatus](#assertstatus)                     | [AssertSuccessful](#assertsuccessful)                   | [AssertTemporaryRedirect](#asserttemporaryredirect)     |
| [AssertTooManyRequests](#asserttoomanyrequests)   | [AssertUnauthorized](#assertunauthorized)               | [AssertUnprocessableEntity](#assertunprocessableentity) |

### AssertAccepted

Javobning `202 Qabul qilindi` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertAccepted()
```

### AssertBadRequest

Javobning `400 Noto‘g‘ri so‘rov` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertBadRequest()
```

### AssertConflict

Javobning `409 Ziddiyat` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertConflict()
```

### AssertCookie

Javobda belgilangan nom va qiymatga ega cookie borligini tasdiqlaydi:

```go
response.AssertCookie("name", "value")
```

### AssertCookieExpired

Belgilangan cookie muddati o‘tganligini tasdiqlaydi:

```go
response.AssertCookieExpired("name")
```

### AssertCookieMissing

Javobda belgilangan nomga ega cookie yo‘qligini tasdiqlaydi:

```go
response.AssertCookieMissing("name")
```

### AssertCookieNotExpired

Belgilangan cookie muddati o‘tmaganligini tasdiqlaydi:

```go
response.AssertCookieNotExpired("name")
```

### AssertCreated

Javobning `201 Yaratildi` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertCreated()
```

### AssertDontSee

Javobda belgilangan qiymatlar yo‘qligini tasdiqlaydi. Ikkinchi parametr (ixtiyoriy) qiymatlardagi maxsus belgilarni tekshirishdan oldin ekranlash kerakligini aniqlaydi. Agar ko‘rsatilmagan bo‘lsa, standart holatda true ga o‘rnatiladi.

```go
response.AssertDontSee([]string{"<div>"}, false)  // Maxsus belgilarni ekranlamang
```

### AssertExactJson

Javob JSONi taqdim etilgan `map[string]any` bilan aniq mos kelishini tasdiqlaydi:

```go
response.AssertExactJson(map[string]any{"created": true})
```

### AssertFluentJson

Javob JSONini oqim interfeysi yordamida tasdiqlaydi:

```go
import contractstesting "github.com/goravel/framework/contracts/testing"

response.AssertFluentJson(func(json contractstesting.AssertableJSON) {
     json.Where("created", true)
})
```

### AssertForbidden

Javobning `403 Taqiqlangan` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertForbidden()
```

### AssertFound

Javobning `302 Topildi` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertFound()
```

### AssertGone

Javobning `410 Yo‘qolgan` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertGone()
```

### AssertHeader

Javobda belgilangan sarlavha berilgan qiymat bilan borligini tasdiqlaydi:

```go
response.AssertHeader("Content-Type", "application/json")
```

### AssertHeaderMissing

Javobda belgilangan sarlavha yo‘qligini tasdiqlaydi:

```go
response.AssertHeaderMissing("X-Custom-Header")
```

### AssertInternalServerError

Javobning `500 Ichki server` xatosi HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertInternalServerError()
```

### AssertJson

Javob JSONida taqdim etilgan fragment borligini tasdiqlaydi:

```go
response.AssertJson(map[string]any{"created": true})
```

### AssertJsonMissing

Javob JSONida belgilangan kalitlar yoki qiymatlar yo'qligini tasdiqlaydi:

```go
response.AssertJsonMissing(map[string]any{"created": false})
```

### AssertMethodNotAllowed

Javobning `405 Method Not Allowed` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertMethodNotAllowed()
```

### AssertMovedPermanently

Javobning `301 Moved Permanently` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertMovedPermanently()
```

### AssertNoContent

Javobning `204 No Content` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertNoContent()
```

### AssertNotAcceptable

Javobning `406 Not Acceptable` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertNotAcceptable()
```

### AssertNotFound

Javobning `404 Not Found` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertNotFound()
```

### AssertNotModified

Javobning `304 Not Modified` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertNotModified()
```

### AssertOk

Javobning `200 OK` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertOk()
```

### AssertPartialContent

Javobning `206 Partial Content` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertPartialContent()
```

### AssertPaymentRequired

Javobning `402 Payment Required` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertPaymentRequired()
```

### AssertRequestTimeout

Javobning `408 Request Timeout` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertRequestTimeout()
```

### AssertSee

Javobda belgilangan qiymatlar mavjudligini tasdiqlaydi. Ikkinchi parametr (ixtiyoriy) tekshirishdan oldin qiymatlardagi maxsus belgilarni ekranlash kerakligini aniqlaydi. Agar ko'rsatilmagan bo'lsa, standart holatda `true` ga o'rnatiladi.

```go
response.AssertSee([]string{"<div>"}, false)  // Maxsus belgilarni ekranlamang
```

### AssertSeeInOrder

Javobda belgilangan qiymatlar berilgan tartibda mavjudligini tasdiqlaydi. Ikkinchi parametr (ixtiyoriy) tekshirishdan oldin qiymatlardagi maxsus belgilarni ekranlash kerakligini aniqlaydi. Agar ko'rsatilmagan bo'lsa, standart holatda `true` ga o'rnatiladi.

```go
response.AssertSeeInOrder([]string{"First", "Second"}, false)  // Maxsus belgilarni ekranlamang
```

### AssertServerError

Javobning server xatosi (>= 500 , < 600) HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertServerError()
```

### AssertServiceUnavailable

Javobning `503 Service Unavailable` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertServiceUnavailable()
```

### AssertStatus

Javobning belgilangan HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertStatus(200)
```

### AssertSuccessful

Javobning muvaffaqiyatli HTTP holat kodiga (2xx) ega ekanligini tasdiqlaydi:

```go
response.AssertSuccessful()
```

### AssertTemporaryRedirect

Javobning `307 Temporary Redirect` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertTemporaryRedirect()
```

### AssertTooManyRequests

Javobning `429 Too Many Requests` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertTooManyRequests()
```

### AssertUnauthorized

Javobning `401 Unauthorized` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertUnauthorized()
```

### AssertUnprocessableEntity

Javobning `422 Unprocessable Entity` HTTP holat kodiga ega ekanligini tasdiqlaydi:

```go
response.AssertUnprocessableEntity()
```
