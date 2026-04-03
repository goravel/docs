# Paketlarni ishlab chiqish

[[toc]]

## Kirish

Paketlar Goravelga funksiyalarni qo'shishning asosiy usuli hisoblanadi. Ushbu paketlar Goravel dasturini takomillashtirish uchun maxsus ishlab chiqilgan marshrutlar, kontrollerlar va konfiguratsiyalarni o'z ichiga olishi mumkin. Ushbu qo'llanma Goravelga xos paketlarni ishlab chiqishga qaratilgan.

Uchinchi tomon paketini yaratishga misol: [goravel/example-package](https://github.com/goravel/example-package)

## Paket yaratish

Artisan buyrug'i yordamida osongina paket shablonini yaratishingiz mumkin:

```shell
./artisan make:package sms
```

Yaratilgan fayllar sukut bo'yicha `packages` asosiy papkasida saqlanadi, siz sozlash uchun `--root` parametridan foydalanishingiz mumkin:

```shell
./artisan make:package --root=pkg sms
```

## Xizmat ko'rsatuvchilar

[Xizmat ko'rsatuvchi provayderlar](../architecture-concepts/service-providers.md) sizning paketingiz va Goravel o'rtasida ko'prik vazifasini bajaradi. Ular odatda paketning ildiz qismida `service_provider.go` fayli sifatida joylashgan. Ularning asosiy vazifasi Goravel xizmat konteyneriga narsalarni bog'lash va Goravelga paket resurslarini yuklashda yo'l-yo'riq ko'rsatishdir.

## Paketni o'rnating

Paket yaratishda, agar unda `setup/setup.go` fayli bo'lsa, siz ushbu faylda paketni o'rnatish mantig'ini belgilashingiz mumkin va keyin foydalanuvchilar paketni o'rnatish uchun `package:install` buyrug'idan foydalanishlari mumkin:

```shell
./artisan to'plami: github.com/goravel/example-package ni o'rnating
```

Quyida `setup/setup.go` faylida belgilangan o'rnatish jarayonining tushuntirishi keltirilgan, bu sizga o'zingizning paket o'rnatish mantig'ingizni yozishga yordam beradi:

```go
// setup/setup.go
package main

import (
	"os"

	"github.com/goravel/framework/packages"
	"github.com/goravel/framework/packages/modify"
	"github.com/goravel/framework/support/file"
	"github.com/goravel/framework/support/path"
)

func main() {
	// Yo'llarni olish uchun sozlashni ishga tushiring, bu boshida chaqirilishi kerak.
	setup := packages.Setup(os.Args)

	// Shu tarzda o'rnatishda konfiguratsiya fayli avtomatik ravishda loyihaning konfiguratsiya katalogiga nashr etiladi.
	// Ushbu konfiguratsiya faylini qo'lda ham nashr qilishingiz mumkin: ./artisan vendor:publish --package=github.com/goravel/example-package
	config, err := file.GetPackageContent(setup.Paths().Module().String(), "setup/config/hello.go")
	if err != nil {
		panic(err)
	}

	serviceProvider := "&hello.ServiceProvider{}"
	moduleImport := setup.Paths().Module().Import()

	setup.Install(
		// Xizmat ko'rsatuvchi provayderni bootstrap/providers.go saytidagi provayderlar bo'limida ro'yxatdan o'tkazing
		modify.RegisterProvider(moduleImport, serviceProvider),

		// Konfiguratsiya faylini konfiguratsiya katalogiga qo'shing
		modify.File(path.Config("hello.go")).Overwrite(config),
	).Uninstall(
		// Konfiguratsiya faylini konfiguratsiya katalogidan olib tashlang
		modify.File(path.Config("hello.go")).Remove(),

		// bootstrap/providers.go saytidagi provayderlar bo'limidan xizmat ko'rsatuvchi provayderni ro'yxatdan o'chirish
		modify.UnregisterProvider(moduleImport, serviceProvider),
	).Execute()
}
```

## Resurslar

### Konfiguratsiya

Odatda, siz paketingizning konfiguratsiya faylini ilovaning "config" katalogiga nashr qilishingiz kerak bo'ladi. Bu sizning paketingiz foydalanuvchilariga standart konfiguratsiya parametrlarini osongina bekor qilish imkonini beradi. Konfiguratsiya fayllaringizni nashr etishga ruxsat berish uchun xizmat ko'rsatuvchi provayderingizning `Boot` usulidan `Publishes` usulini chaqiring, birinchi parametr paket nomi, ikkinchi parametr esa joriy paket fayl yo'li va loyiha yo'li o'rtasidagi xaritalashdir:

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "config/sms.go": app.ConfigPath("sms.go"),
  })
}
```

### Yo'nalishlar

Agar paketingizda [routes](../the-basics/routing.md) mavjud bo'lsa, `facades.Route()` ni hal qilish uchun `app.MakeRoute()` dan foydalanishingiz mumkin, keyin esa loyihaga marshrutlarni qo'shishingiz mumkin:

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
	route := app.MakeRoute()
	route.Get("sms", ***)
}
```

### Migratsiyalar

Agar paketingizda [migrations](../database/migrations.md) mavjud bo'lsa, ularni `Publishes` usuli bilan nashr qilishingiz mumkin:

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "migrations": app.DatabasePath("migrations"),
  })
}
```

### Modellar

Agar paketingizning bir qismi sifatida belgilangan yangi [modellar](../orm/getting-started.md) bo'lsa, ularni `Nashr qilish` usuli yordamida nashr etish mumkin:

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "models": app.ModelPath("models"),
  })
}
```

## Buyruqlar

Siz `Artisan` buyrug'ini `Commands` usuli bilan ro'yxatdan o'tkazishingiz mumkin, buyruqlarni ro'yxatdan o'tkazgandan so'ng ularni [Artisan CLI](../digging-deeper/artisan-console.md) yordamida ishga tushirishingiz mumkin.

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
	app.Commands([]console.Command{
		commands.NewSmsCommand(),
	})
}
```

## Davlat aktivlari

Paketingizda JavaScript, CSS va rasmlar kabi aktivlar bo'lishi mumkin. Ushbu aktivlarni ilovaning "ommaviy" katalogiga nashr qilish uchun xizmat ko'rsatuvchi provayderning "Public" usulidan foydalaning:

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "public": app.PublicPath("vendor"),
  })
}
```

## Fayl guruhlarini nashr qilish

Agar siz paket aktivlari va resurslarining ma'lum guruhlarini alohida nashr qilmoqchi bo'lsangiz, paket xizmat ko'rsatuvchi provayderidan "Nashr qilish" usulini chaqirishda teglardan foydalanishingiz mumkin. Bu sizga foydalanuvchilarga konfiguratsiya fayllari kabi ma'lum fayllarni paketning barcha aktivlarini nashr qilmasdan nashr qilish imkoniyatini berish imkonini beradi. Misol tariqasida, paket xizmat ko'rsatuvchi provayderining "Boot" usulidagi teglar yordamida "sms" paketi uchun ikkita nashr guruhini ("sms-config" va "sms-migrations") belgilashingiz mumkin.

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "config/sms.go": app.ConfigPath("sms.go"),
  }, "sms-config")
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "migrations": app.DatabasePath("migrations"),
  }, "sms-migrations")
}
```

## Resurslarni nashr qilish

Loyihada siz "vendor:publish" Artisan buyrug'i yordamida paketda ro'yxatdan o'tgan resurslarni nashr qilishingiz mumkin:

```shell
./artisan vendor:publish --package={You package name}
```

Buyruq quyidagi variantlardan foydalanishi mumkin:

| Variant nomi | Taxallus | Harakat                                                                                                                                                                                                                                                                                         |
| ------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| --package    | -p       | Paket nomi masofaviy paket bo'lishi mumkin: `github.com/goravel/example-package`, shuningdek, mahalliy paket bo'lishi mumkin: `./packages/example-package`, mahalliy paket nomidan foydalanganda u `./` bilan boshlanishi kerakligini unutmang. |
| --tag        | -t       | Resurslar guruhi                                                                                                                                                                                                                                                                                |
| --force      | -f       | Mavjud fayllarni qayta yozing                                                                                                                                                                                                                                                                   |
| --existing   | -e       | Faqat allaqachon nashr etilgan fayllarni nashr eting va qayta yozing                                                                                                                                                                                                                            |
