# HTTP Javobi

[[toc]]

## Kirish

Controllerda HTTP javobi uchun `ctx.Response()` dan foydalanishingiz mumkin.

## Matn

```go
import "github.com/goravel/framework/contracts/http"

ctx.Response().String(http.StatusOK, "Hello Goravel")
```

## JSON

```go
import (
  "github.com/goravel/framework/contracts/http"
)

ctx.Response().Json(http.StatusOK, http.Json{
  "Hello": "Goravel",
})

ctx.Response().Json(http.StatusOK, struct {
  ID       uint `json:"id"`
  Name     string `json:"name"`
}{
  Id:      1,
  Front:   "Goravel",
})
```

## Maxsus Qaytarish

```go
ctx.Response().Data(http.StatusOK, "text/html; charset=utf-8", []byte("<b>Goravel</b>"))
```

## Javob Fayli

```go
import "net/http"

ctx.Response().File("./public/logo.png")
```

## Faylni Yuklab Olish

```go
import "net/http"

ctx.Response().Download("./public/logo.png", "1.png")
```

## Sarlavha Qo‘shish

```go
import "github.com/goravel/framework/contracts/http"

ctx.Response().Header("Content", "Goravel").String(http.StatusOK, "Hello Goravel")
```

## Cookie

### Cookie O‘rnatish

Cookie o‘rnatish uchun `response` namunasi ustidagi `Cookie` metodidan foydalaning. `Cookie` metodi `http.Cookie` namunasi qabul qiladi, bu sizga turli cookie parametrlarini o‘rnatish imkonini beradi.

```go
import (
  "time"
  "github.com/goravel/framework/contracts/http"
)

ctx.Response().Cookie(http.Cookie{
  Name: "name",
  Value: "Goravel",
  Path: "/",
  Domain: "goravel.dev",
  Expires: time.Now().Add(24 * time.Hour),
  Secure: true,
  HttpOnly: true,
})
```

### Cookie Muddatini Tugatish

Cookie-ni o‘chirish uchun `WithoutCookie` metodidan foydalaning.

```go
ctx.Response().WithoutCookie("name")
```

## Muvaffaqiyatli Javob Qaytarish

```go
ctx.Response().Success().String("Hello Goravel")
ctx.Response().Success().Json(http.Json{
  "Hello": "Goravel",
})
```

## Maxsus Kod

```go
ctx.Response().Status(http.StatusOK).Json(http.Json{
  "hello": "Goravel",
})
```

## Oqim Javobi Qaytarish

```go
ctx.Response().Stream(http.StatusCreated, func(w http.StreamWriter) error {
  data := []string{"a", "b", "c"}
  for _, item := range data {
    if _, err := w.Write([]byte(item + "\n")); err != nil {
      return err
    }

    if err := w.Flush(); err != nil {
      return err
    }

    time.Sleep(1 * time.Second)
  }

  return nil
})
```

## Qayta Yo‘naltirish

```go
ctx.Response().Redirect(http.StatusMovedPermanently, "https://goravel.dev")
```

## Kontent Yo‘q

```go
ctx.Response().NoContent()
ctx.Response().NoContent(http.StatusOk)
```

## Javobni Olish

Siz `ctx.Response()` dan barcha ma’lumotni olishingiz mumkin, bu odatda HTTP middleware’ida ishlatiladi:

```go
origin := ctx.Response().Origin()
```

`origin` quyida ko‘rsatilganidek ba’zi metodlarni o‘z ichiga oladi:

| Metod    | Harakat                    |
| -------- | -------------------------- |
| Tana     | Javob ma’lumotlarini olish |
| Sarlavha | Javob sarlavhasini olish   |
| Hajm     | Javob hajmini olish        |
| Holat    | Javob holatini olish       |
