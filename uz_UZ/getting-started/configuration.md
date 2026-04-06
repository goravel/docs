# Konfiguratsiya

[[toc]]

## Kirish

Goravel freymvorkining barcha konfiguratsiya fayllari `config` papkasida saqlanadi. Siz aniq ko'rsatmalarni ko'rib chiqishingiz va loyiha ehtiyojlariga mos ravishda ularni moslashuvchan sozlashingiz mumkin.

## Muhit konfiguratsiyasi

Ilovalarni turli muhitlarda ishga tushirish odatda turli konfiguratsiyalarni talab qiladi. Misol uchun, siz mahalliy ravishda Debug rejimini yoqishni xohlashingiz mumkin, lekin ishlab chiqarish muhitida bunga ehtiyoj yo'q.

Shuning uchun, freymvork ildiz papkasida `.env.example` faylini taqdim etadi. Siz ishlab chiqishni boshlashdan oldin ushbu faylni nusxalashingiz, uni `.env` deb nomini o'zgartirishingiz va `.env` faylidagi konfiguratsiya bandlarini loyiha ehtiyojlariga mos ravishda o'zgartirishingiz kerak.

Diqqat qiling, `.env` fayli versiyalarni nazorat qilishga qo'shilmasligi kerak, chunki bir nechta odamlar hamkorlik qilganda, turli dasturchilar turli konfiguratsiyalardan foydalanishlari mumkin va turli joylashtirish muhitlari konfiguratsiyalari har xil bo'ladi.

Bundan tashqari, agar tashqi shaxs sizning kod omboringizga kirish huquqini olgan bo'lsa, sezuvchi konfiguratsiyani oshkor qilish xavfi mavjud bo'ladi. Agar siz yangi konfiguratsiya bandini qo'shmoqchi bo'lsangiz, uni `.env.example` fayliga qo'shishingiz mumkin, shunda barcha dasturchilarning konfiguratsiyasi sinxronlanadi.

### Konfiguratsiyani ro'yxatdan o'tkazish

Barcha konfiguratsiya fayllari `bootstrap/app.go` faylidagi `WithConfig` funksiyasi orqali ro'yxatdan o'tkaziladi. Konfiguratsiya faylidagi `init` funksiyasi ekanligini hisobga olgan holda, siz har bir konfiguratsiya faylini birma-bir ro'yxatdan o'tkazishingiz shart emas. Shunchaki `WithConfig` funksiyasini quyidagicha chaqiring:

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithConfig(config.Boot).
		Create()
}
```

## Muhit konfiguratsiyasini olish

`.env` faylidagi konfiguratsiya bandlarini olish uchun quyidagi usuldan foydalaning:

```go
// Birinchi parametr konfiguratsiya kaliti, ikkinchi parametr standart qiymat
facades.Config().Env("APP_NAME", "goravel")
```

## Konfiguratsiya qiymatlariga kirish

Siz ilovaning istalgan joyidan `config` papkasidagi konfiguratsiya qiymatlariga kirish uchun global `facades.Config()` funksiyasidan osongina foydalanishingiz mumkin. Konfiguratsiya qiymatiga kirish "." sintaksisidan foydalanishi mumkin. Shuningdek, siz standart qiymatni belgilashingiz mumkin, agar konfiguratsiya opsiyasi mavjud bo'lmasa, standart qiymat qaytariladi:

```go
// Tasdiq orqali konfiguratsiyani olish
facades.Config().Get("app.name", "goravel")

// String turidagi konfiguratsiyani olish
facades.Config().GetString("app.name", "goravel")

// Int turidagi konfiguratsiyani olish
facades.Config().GetInt("app.int", 1)

// Bool turidagi konfiguratsiyani olish
facades.Config().GetBool("app.debug", true)
```

## Konfiguratsiyani sozlash

```go
facades.Config().Add("path", "value1")
facades.Config().Add("path.with.dot.case1", "value1")
facades.Config().Add("path.with.dot", map[string]any{"case3": "value3"})
```

## Loyiha ma'lumotlarini olish

Siz freymvork versiyasi, konfiguratsiyasi va boshqalarni ko'rish uchun `artisan about` buyrug'idan foydalanishingiz mumkin.

```bash
./artisan about
```
