# Kontrollerlar

[[toc]]

## Kirish

Alohida marshrutda barcha so‘rovni qayta ishlash mantiqini yopish (closure) shaklida belgilash o‘rniga, birlashtirish uchun kontrollerdan foydalanish mumkin. Kontrollerlar `app/http/controllers` katalogida saqlanadi.

## Kontrollerlarni belgilash

Quyida oddiy kontrollerning namunasi keltirilgan:

```go
package controllers

import (
  "github.com/goravel/framework/contracts/http"

  "goravel/app/facades"
)

type UserController struct {
  // Dependent services
}

func NewUserController() *UserController {
  return &UserController{
    // Inject services
  }
}

func (r *UserController) Show(ctx http.Context) http.Response {
  return ctx.Response().Success().Json(http.Json{
    "Hello": "Goravel",
  })
}
```

Marshrut belgilash:

```go
package routes

import (
  "goravel/app/facades"
  "goravel/app/http/controllers"
)

func Api() {
  userController := controllers.NewUserController()
  facades.Route().Get("/{id}", userController.Show)
}
```

### Kontroller yaratish

```shell
./artisan make:controller UserController
./artisan make:controller user/UserController
```

## Resurs kontrollerlari

Agar ilovangizdagi har bir Eloquent modelini "resurs" deb hisoblasangiz, ilovangizdagi har bir resursga nisbatan bir xil harakatlar to‘plamini bajarish odatiy holdir. Misol uchun, ilovangizda `Photo` modeli va `Movie` modeli bor deb tasavvur qiling. Foydalanuvchilar ushbu resurslarni yaratishi, o‘qishi, yangilashi yoki o‘chirishi mumkin.

Ushbu umumiy foydalanish holati tufayli, Goravel resurs marshrutlash odatiy yaratish, o‘qish, yangilash va o‘chirish ("CRUD") marshrutlarini bitta kod satri bilan kontrollerga tayinlaydi. Boshlash uchun, biz ushbu harakatlarni boshqarish uchun tezda kontroller yaratish uchun `make:controller` Artisan buyrug‘ining `--resource` opsiyasidan foydalanishimiz mumkin:

```shell
./artisan make:controller --resource PhotoController
```

Ushbu buyruq `app/http/controllers/photo_controller.go` faylida kontroller yaratadi. Kontrollerda mavjud bo‘lgan har bir resurs operatsiyasi uchun usul bo‘ladi. Keyin, siz kontrollerga yo‘naltirilgan resurs marshrutini ro‘yxatdan o‘tkazishingiz mumkin:

```go
facades.Route().Resource("photos", controllers.NewPhotoController())
```

| Fe’l      | URI               | Harakat    |
| --------- | ----------------- | ---------- |
| GET       | `/photos`         | Indeks     |
| POST      | `/photos`         | Saqlash    |
| GET       | `/photos/{photo}` | Ko‘rsatish |
| PUT/PATCH | `/photos/{photo}` | Yangilash  |
| DELETE    | `/photos/{photo}` | O‘chirish  |
