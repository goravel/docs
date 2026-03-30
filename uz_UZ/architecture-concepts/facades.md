# Fasadlar

[[toc]]

## Kirish

`facades` ilova yadrosining asosiy funksiyalari uchun "static" interfeysni ta'minlaydi va ko'proq moslashuvchan, chiroyli va sinov o'tkazish oson bo'lgan sintaksisni taqdim etadi. Goravel’ning barcha facadelari app/facades papkasi ichida joylashgan:

```go
import "app/facades"

facades.Config().GetString("app.host")

```

## Fasadlar qanday ishlaydi

Har bir xizmat ko'rsatuvchi o'zining mos bog'lanishlarini xizmat konteynerida ro'yxatdan o'tkazadi, so'ngra xizmat konteyneri bog'lanish namunalarini yaratish uchun turli `Make*` funksiyalarini taqdim etadi. `app/facades` papkasidagi `facades`lar xizmat konteyneridan namunalarni olish uchun ushbu `Make*` funksiyalarini chaqiradi. Keling, `Route` fasadini misol sifatida ishlatamiz:

1. `Route` xizmat provayderi xizmat konteynerida `binding.Route` bog'lanishini ro'yxatdan o'tkazadi:

```go
type ServiceProvider struct {}

func (r *ServiceProvider) Register(app foundation.Application) {
	app.Singleton(binding.Route, func(app foundation.Application) (any, error) {
		return NewRoute(app.MakeConfig())
	})
}

func (r *ServiceProvider) Boot(app foundation.Application) {}
```

2. `Route` fasadı `MakeRoute()` funksiyasini chaqirib, xizmat konteyneridan `Route` vorislarini olish uchun:

```go
// app/facades/route.go
package facades

import (
	"github.com/goravel/framework/contracts/route"
)

func Route() route.Route {
	return App().MakeRoute()
}
```

> `facades` ilovaga ochiq bo'lganligi sababli, siz o'zingizning `facades`laringizni yaratishingiz yoki mavjud `facades`larni `app/facades` papkasida almashtirishingiz mumkin.

## Fasadlarni o'rnatish/o'chirish

[goravel/goravel](https://github.com/goravel/goravel) standart boʻyicha barcha `facade`larni oʻrnatadi va [goravel/goravel-lite](https://github.com/goravel/goravel-lite) faqat `Artisan`, `Config` kabi muhim `facade`larni oʻrnatadi. Siz "package:install" va "package:uninstall" buyruqlari orqali boshqa `facades`larni kerak bo‘lganda o‘rnatishingiz yoki o‘chirishingiz mumkin.

```shell
# Muayyan fasadni o'rnatish
./artisan package:install Route

# Barcha fasadlarni o'rnatish
./artisan package:install --all

# Standart drayverlar bilan barcha fasadlarni o'rnatish
./artisan package:install --all --default

# Muayyan fasadni o'chirish
./artisan package:uninstall Route
```

> Eslatma: agar siz `./artisan package:install` buyrug'i orqali `facades`ni qo'lda tanlashni istasangiz, o'rnatmoqchi bo'lgan fasadlarni tanlash uchun `x` tugmasini bosing, so'ngra tasdiqlash uchun `Enter` tugmasini bosing. `facades` to'g'ridan-to'g'ri `Enter` tugmasini bosganingizda tanlanmaydi.
