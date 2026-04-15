# HTTP So‘rovlari

[[toc]]

## Kirish

Goravelning `contracts/http/Request` metodi ilova tomonidan qayta ishlangan joriy HTTP so‘rovi bilan o‘zaro aloqada bo‘lishi va birga yuborilgan kiritish ma’lumotlari va fayllarni olishi mumkin.

## So‘rov Bilan O‘zaro Aloqa

`http.Context` namunasi kontrollerga avtomatik ravishda kiritiladi:

```go
import "github.com/goravel/framework/contracts/http"

facades.Route().Get("/", func(ctx http.Context) http.Response {})
```

### So‘rov Yo‘lini Olish

```go
path := ctx.Request().Path() // /users/1

originPath := ctx.Request().OriginPath() // /users/{id}
```

### So‘rov URL Manzilini Olish

```go
url := ctx.Request().Url() // /users?name=Goravel
```

### So‘rov HOST Manzilini Olish

```go
url := ctx.Request().Host()
```

### To‘liq So‘rov URL Manzilini Olish

```go
url := ctx.Request().FullUrl() // http://**/users?name=Goravel
```

### So‘rov Metodini Olish

```go
method := ctx.Request().Method()
```

### So‘rov Yo‘li Ma’lumotlarini Olish

```go
info := ctx.Request().Info()
```

### So‘rov Yo‘li Nomini Olish

```go
name := ctx.Request().Name()
```

### So‘rov Sarlavhalari

```go
header := ctx.Request().Header("X-Header-Name", "default")
headers := ctx.Request().Headers()
```

### So‘rov IP Manzili

```go
ip := ctx.Request().Ip()
```

## Kiritish

### Barcha Kiritish Ma’lumotlarini Olish

Siz kelayotgan so‘rovning barcha kiritish ma’lumotlarini `All` metodi yordamida `map[string]any` sifatida olishingiz mumkin, bu `json`, `form` va `query` (oldindan orqaga ustuvorlik) to‘plamidir.

```go
data := ctx.Request().All()
```

### Yo‘l Qiymatini Olish

```go
// /users/{id}
id := ctx.Request().Route("id")
id := ctx.Request().RouteInt("id")
id := ctx.Request().RouteInt64("id")
```

### So‘rov Qatori Orqali Kiritishni Olish

```go
// /users?name=goravel
name := ctx.Request().Query("name")
name := ctx.Request().Query("name", "default")

// /users?id=1
name := ctx.Request().QueryInt("id")
name := ctx.Request().QueryInt64("id")
name := ctx.Request().QueryBool("id")

// /users?names=goravel1&names=goravel2
names := ctx.Request().QueryArray("names")

// /users?names[a]=goravel1&names[b]=goravel2
names := ctx.Request().QueryMap("names")

queries := ctx.Request().Queries()
```

> Eslatma: Faqat bir o‘lchamli Json ma’lumotlari olinishi mumkin, aks holda bo‘sh qaytariladi.

### Kiritish Qiymatini Olish

So‘rov qaysi HTTP fe’li uchun ishlatilganidan qat’iy nazar, foydalanuvchi kiritishining barchasiga kirish. Olish tartibi: `json`, `form`.

```go
name := ctx.Request().Input("name")
name := ctx.Request().Input("name", "goravel")
name := ctx.Request().InputInt("name")
name := ctx.Request().InputInt64("name")
name := ctx.Request().InputBool("name")
name := ctx.Request().InputArray("name")
name := ctx.Request().InputMap("name")
name := ctx.Request().InputMapArray("name")
```

### Json/Form-ni Bog‘lash

```go
type User struct {
  Name string `form:"code" json:"code"`
}

var user User
err := ctx.Request().Bind(&user)
```

```go
var user map[string]any
err := ctx.Request().Bind(&user)
```

### So‘rovni Bog‘lash

Faqat struct-ga Query-ni bog‘lash qo‘llab-quvvatlanadi:

```go
type Test struct {
  ID string `form:"id"`
}
var test Test
err := ctx.Request().BindQuery(&test)
```

## Cookie

### Cookie Qiymatini Olish

Goravel `cookie` bilan ishlashning oddiy usulini taqdim etadi. `cookie` qiymatini olish uchun `Request` namunasidagi `Cookie` metodidan foydalaning, agar `cookie` mavjud bo‘lmasa, bo‘sh satr qaytariladi. Shuningdek, ikkinchi argumentda standart qiymatni belgilashingiz mumkin.

```go
value := ctx.Request().Cookie("name")
value := ctx.Request().Cookie("name", "default")
```

## Fayl

### Faylni Olish

```go
file, err := ctx.Request().File("file")
files, err := ctx.Request().Files("file")
```

### Faylni Saqlash

```go
file, err := ctx.Request().File("file")
file.Store("./public")
```

### Asl So‘rovni Olish

```go
request := ctx.Request().Origin()
```

### Ma’lumot Qo‘shish

```go
ctx.WithValue("user", "Goravel")
```

### Ma’lumot Olish

```go
user := ctx.Value("user")
```

### Kontekstni Olish

```go
ctx := ctx.Context()
```

## Maxsus Tiklash

Siz `bootstrap/app.go::WithMiddleware` funksiyasida maxsus `recovery` ni o‘rnatishingiz mumkin.

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithMiddleware(func(handler configuration.Middleware) {
			handler.Append(
				httpmiddleware.Throttle("global"),
				sessionmiddleware.StartSession(),
			).Recover(func(ctx http.Context, err any) {
				facades.Log().Error(err)
				_ = ctx.Response().String(contractshttp.StatusInternalServerError, "recover").Abort()
			})
		}).
		WithConfig(config.Boot).
		Create()
}
```
