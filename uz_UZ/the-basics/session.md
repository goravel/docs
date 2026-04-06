# Seans

[[toc]]

## Kirish

Seans sizga bir nechta so‘rovlar bo‘yicha foydalanuvchi ma’lumotlarini saqlash imkonini beradi, bu esa tabiatan stateless HTTP protokolida holatli tajribani ta’minlaydi. Ushbu foydalanuvchi ma’lumotlari server tomonida doimiy ravishda saqlanadi. Goravel turli doimiy saqlash haydovchilari bilan o‘zaro aloqada bo‘lish uchun birlashtirilgan interfeysni taklif qiladi.

## Konfiguratsiya

`session` konfiguratsiya fayli `config/session.go` manzilida joylashgan. Standart haydovchi `file` bo‘lib, seanslarni `storage/framework/sessions` katalogida saqlaydi. Goravel sizga `contracts/session/driver` interfeysini amalga oshirish orqali maxsus `session` haydovchisini yaratish imkonini beradi.

### Middleware-ni ro‘yxatdan o‘tkazish

Standart bo‘yicha, Goravel seansni avtomatik ravishda boshlab bermaydi. Biroq, u seansni boshlash uchun middleware-ni taqdim etadi. Siz middleware-ni `bootstrap/app.go` faylidagi `WithMiddleware` funksiyasida ro‘yxatdan o‘tkazishingiz yoki uni ma’lum yo‘nalishlarga qo‘shishingiz mumkin:

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithMiddleware(func(handler configuration.Middleware) {
			handler.Append(
				middleware.StartSession(),
			)
		}).
		WithConfig(config.Boot).
		Create()
}
```

## Seans bilan ishlash

### Ma’lumotlarni olish

Seansdan ma’lumotlarni olish uchun `Get` usulidan foydalanishingiz mumkin. Agar qiymat mavjud bo‘lmasa, `nil` qaytariladi.

```go
value := ctx.Request().Session().Get("key")
```

Shuningdek, siz `Get` usulining ikkinchi argumenti sifatida standart qiymatni ham o‘tkazishingiz mumkin. Agar belgilangan kalit seansda mavjud bo‘lmasa, bu qiymat qaytariladi:

```go
value := ctx.Request().Session().Get("key", "default")
```

### Barcha ma’lumotlarni olish

Agar siz seansdan barcha ma’lumotlarni olishni istasangiz, `All` usulidan foydalanishingiz mumkin:

```go
data := ctx.Request().Session().All()
```

### Ma’lumotlarning kichik to‘plamini olish

Agar siz seans ma’lumotlarining kichik to‘plamini olishni istasangiz, `Only` usulidan foydalanishingiz mumkin:

```go
data := ctx.Request().Session().Only([]string{"username", "email"})
```

### Elementning seansda mavjudligini aniqlash

Elementning seansda mavjudligini aniqlash uchun `Has` usulidan foydalanishingiz mumkin. `Has` usuli element mavjud va `nil` bo‘lmasa, `true` qaytaradi:

```go
if ctx.Request().Session().Has("user") {
    //
}
```

Element mavjud va hatto `nil` bo‘lsa ham, mavjudligini aniqlash uchun `Exists` usulidan foydalanishingiz mumkin:

```go
if ctx.Request().Session().Exists("user") {
    //
}
```

Elementning seansda mavjud emasligini aniqlash uchun `Missing` usulidan foydalanishingiz mumkin:

```go
if ctx.Request().Session().Missing("user") {
    //
}
```

### Ma’lumotlarni saqlash

Ma’lumotlarni seansda saqlash uchun `Put` usulidan foydalanishingiz mumkin:

```go
ctx.Request().Session().Put("key", "value")
```

### Ma’lumotlarni olish va o‘chirish

Agar siz elementni seansdan olishni va keyin uni o‘chirishni istasangiz, `Pull` usulidan foydalanishingiz mumkin:

```go
value := ctx.Request().Session().Pull("key")
```

### Ma’lumotlarni o‘chirish

`Forget` usuli seansdan bir qism ma’lumotni olib tashlash uchun ishlatilishi mumkin. Agar siz seansdan barcha ma’lumotlarni olib tashlashni istasangiz, `Flush` usulidan foydalanishingiz mumkin:

```go
ctx.Request().Session().Forget("username", "email")

ctx.Request().Session().Flush()
```

### Seans ID-sini qayta yaratish

Seans ID-sini qayta yaratish ko‘pincha zararli foydalanuvchilarning ilovangizda seans fiksatsiya hujumidan foydalanishining oldini olish uchun amalga oshiriladi. Seans ID-sini `Regenerate` usuli yordamida qayta yaratishingiz mumkin:

```go
ctx.Request().Session().Regenerate()
```

Agar siz seans ID-sini qayta yaratishni va seansda bo‘lgan barcha ma’lumotlarni unutishni istasangiz, `Invalidate` usulidan foydalanishingiz mumkin:

```go
ctx.Request().Session().Invalidate()
```

Keyin, yangi seansni cookie-ga saqlashingiz kerak:

```go
ctx.Response().Cookie(http.Cookie{
  Name:     ctx.Request().Session().GetName(),
  Value:    ctx.Request().Session().GetID(),
  MaxAge:   facades.Config().GetInt("session.lifetime") * 60,
  Path:     facades.Config().GetString("session.path"),
  Domain:   facades.Config().GetString("session.domain"),
  Secure:   facades.Config().GetBool("session.secure"),
  HttpOnly: facades.Config().GetBool("session.http_only"),
  SameSite: facades.Config().GetString("session.same_site"),
})
```

### Flash ma’lumotlar

Flash ma’lumotlar faqat keyingi HTTP so‘rovi davomida mavjud bo‘ladigan va keyin o‘chiriladigan seans ma’lumotlaridir. Flash ma’lumotlar holat xabarlari kabi vaqtincha xabarlarni saqlash uchun foydalidir. Flash ma’lumotlarni seansda saqlash uchun `Flash` usulidan foydalanishingiz mumkin:

```go
ctx.Request().Session().Flash("status", "Task was successful!")
```

Agar siz flash ma’lumotlaringizni qo‘shimcha so‘rov uchun saqlamoqchi bo‘lsangiz, `Reflash` usulidan foydalanishingiz mumkin:

```go
ctx.Request().Session().Reflash()
```

Agar siz ma’lum flash ma’lumotlarni qo‘shimcha so‘rov uchun saqlamoqchi bo‘lsangiz, `Keep` usulidan foydalanishingiz mumkin:

```go
ctx.Request().Session().Keep("status", "username")
```

Agar siz ma’lum ma’lumotlarni darhol foydalanish uchun saqlamoqchi bo‘lsangiz, `Now` usulidan foydalanishingiz mumkin:

```go
ctx.Request().Session().Now("status", "Task was successful!")
```

## Seans menejeri bilan ishlash

### Maxsus seans yaratish

Maxsus seans yaratish uchun `Session` fasadidan foydalaning. `Session` fasad `BuildSession` usulini taqdim etadi, u haydovchi namunasini va agar siz maxsus seans ID-sini belgilamoqchi bo‘lsangiz, ixtiyoriy seans ID-sini qabul qiladi:

```go
session := facades.Session().BuildSession(driver, "sessionID")
```

### Maxsus seans haydovchilarini qo‘shish

#### Haydovchini amalga oshirish

Maxsus seans haydovchisini amalga oshirish uchun, haydovchi `contracts/session/driver` interfeysini amalga oshirishi kerak.

```go
// Driver is the interface for Session handlers.
type Driver interface {
  // Close closes the session handler.
  Close() error
  // Destroy destroys the session with the given ID.
  Destroy(id string) error
  // Gc performs garbage collection on the session handler with the given maximum lifetime.
  Gc(maxLifetime int) error
  // Open opens a session with the given path and name.
  Open(path string, name string) error
  // Read reads the session data associated with the given ID.
  Read(id string) (string, error)
  // Write writes the session data associated with the given ID.
  Write(id string, data string) error
}
```

#### Haydovchini ro‘yxatdan o‘tkazish

Haydovchini amalga oshirgandan so‘ng, uni faqat `config/session.go` konfiguratsiya fayliga qo‘shishingiz kerak:

```go
// config/session.go
"default": "new",

"drivers": map[string]any{
  "file": map[string]any{
    "driver": "file",
  },
  "new": map[string]any{
    "driver": "custom",
    "via": func() (session.Driver, error) {
      return &CustomDriver{}, nil
    },
  }
},
```

### Haydovchi namunasini olish

Haydovchi namunasini seans menejeridan olish uchun `Driver` usulidan foydalaning. U ixtiyoriy haydovchi nomini qabul qiladi, agar berilmasa, standart haydovchi namunasini qaytaradi:

```go
driver, err := facades.Session().Driver("file")
```

### Yangi seansni boshlash

```go
session := facades.Session().BuildSession(driver)
session.Start()
```

### Seans ma’lumotlarini saqlash

```go
session := facades.Session().BuildSession(driver)
session.Start()
session.Save()
```

### Seansni so‘rovga biriktirish

```go
session := facades.Session().BuildSession(driver)
session.Start()
ctx.Request().SetSession(session)
```

### So‘rovda seans mavjudligini tekshirish

```go
if ctx.Request().HasSession() {
    //
}
```
