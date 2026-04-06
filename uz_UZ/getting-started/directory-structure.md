# Papka tuzilishi

[[toc]]

## Kirish

Standart fayl tuzilmasi loyihaning rivojlanishini yaxshiroq boshlashingizga yordam beradi, shuningdek, siz yangi papkalarni bemalol qo‘shishingiz mumkin, lekin standart papkalarni o‘zgartirmang.

## Papka daraxti

```
goravel/
├── app/                        # Asosiy ilova mantiqi
│   ├── console/                # Artisan konsol buyruqlari
│   ├── grpc/                   # gRPC kontrollerlari va middleware
│   ├── http/                   # HTTP kontrollerlari va middleware
│   │   ├── controllers/        # HTTP so‘rovlarini boshqaruvchilari
│   │   ├── middleware/         # HTTP middleware (auth, cors va h.k.)
│   ├── models/                 # ORM modellari
│   └── providers/              # Xizmat provayderlari
├── bootstrap/                  # Ilovani ishga tushirish
│   └── app.go                  # Freymvorkni ishga tushirish
├── config/                     # Ilova konfiguratsiya fayllari
├── database/                   # Maʼlumotlar bazasi bilan bog‘liq fayllar
│   ├── migrations/             # Maʼlumotlar bazasi migratsiya fayllari
│   ├── seeders/                # Maʼlumotlar bazasi to‘ldiruvchilari
├── resources/                  # Xom, kompilyatsiya qilinmagan resurslar
│   └── views/                  # Shablon ko‘rinishlari
├── routes/                     # Ilova marshrutlari taʼriflari
├── storage/                    # Ilova saqlash joyi
├── tests/                      # Avtomatlashtirilgan testlar
├── .air.toml                   # Air hot reload konfiguratsiyasi
├── .env.example                # Muhit o‘zgaruvchilari namunasi
├── artisan                     # Artisan konsol kirish skripti
├── go.mod                      # Go modul bog‘liqliklari
├── go.sum                      # Go modul checksumlari
├── main.go                     # Ilova kirish nuqtasi
```

## Papka tuzilishini sozlash

Siz papka tuzilishini `bootstrap/app.go` faylidagi `WithPath()` funksiyasini chaqirib sozlashingiz mumkin. Masalan, agar siz standart `app` papkasini `src` ga o‘zgartirmoqchi bo‘lsangiz, `bootstrap/app.go` faylini quyidagicha o‘zgartirishingiz mumkin:

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithPaths(func(paths configuration.Paths) {
			paths.App("src")
		}).
		WithConfig(config.Boot).
		Create()
}
```

Siz sozlashingiz mumkin bo‘lgan boshqa ko‘plab yo‘llar mavjud, masalan, `Config`, `Database`, `Routes`, `Storage` va `Resources`. Kerakli papkani o‘rnatish uchun `paths` obyektida tegishli metodni chaqirish kifoya.
