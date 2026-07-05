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

### Xizmat ko'rsatish rejimi

Agar siz Route fasadini o'rnatgan bo'lsangiz, ilovangizni xizmat ko'rsatish rejimiga o'tkazish uchun `down` buyrug'idan foydalanishingiz mumkin. Odatiy holda, Goravel `file` xizmat ko'rsatish drayveridan foydalanadi va xizmat ko'rsatish meta ma'lumotlarini `framework/maintenance.json` saqlash yo'lida saqlaydi:

```shell
./artisan down
```

Xizmat ko'rsatish javobi uchun maxsus sabab va HTTP holat kodini taqdim etishingiz mumkin:

```shell
./artisan down --reason="Upgrading database" --status=503
```

`down` buyrug'i, shuningdek, ilova xizmat ko'rsatish rejimida bo'lganida foydalanuvchilarni yo'lga yo'naltirish yoki ko'rinishni ko'rsatishni qo'llab-quvvatlaydi:

```shell
./artisan down --redirect=/maintenance
./artisan down --render=errors/503
```

`--render` dan foydalanganda, ko'rinish allaqachon mavjud bo'lishi kerak. Agar `--redirect` yoki `--render` ko'rsatilgan bo'lsa, `--reason` javob tanasi ishlatilmaydi.

Maxfiy kalit o'rnatish orqali ilovaga vaqtinchalik ruxsat berishingiz mumkin. Foydalanuvchilar mos keladigan `secret` so‘rov parametri bilan ilovaga kirish orqali texnik xizmat ko‘rsatish rejimini chetlab o‘tishlari mumkin:

```shell
./artisan down --secret=let-me-in
```

```text
https://example.com?secret=let-me-in
```

Goravel siz uchun tasodifiy maxfiy kod yaratishiga ham ruxsat berishingiz mumkin:

```shell
./artisan down --with-secret
```

Texnik xizmat ko‘rsatish drayveri va kesh ombori `config/app.go` da sozlangan. Standart konfiguratsiya `APP_MAINTENANCE_DRIVER` va `APP_MAINTENANCE_STORE` muhit o‘zgaruvchilaridan o‘qiladi:

```go
"maintenance": map[string]any{
    "driver": config.Env("APP_MAINTENANCE_DRIVER", "file"),
    "store":  config.Env("APP_MAINTENANCE_STORE", ""),
},
```

Agar ilovangiz bir nechta serverlarda ishlayotgan bo‘lsa, siz `cache` texnik xizmat ko‘rsatish drayveridan foydalanishingiz mumkin, shunda barcha serverlar bir xil texnik xizmat ko‘rsatish holatini baham ko‘radi. `.env` faylingizda drayver va ixtiyoriy ravishda kesh ombori nomini sozlang:

```ini
APP_MAINTENANCE_DRIVER=cache
APP_MAINTENANCE_STORE=redis
```

Agar `APP_MAINTENANCE_STORE` o'rnatilmagan bo'lsa, Goravel standart kesh omboridan foydalanadi. Bir serverda `down` yoki `up` buyrug'ini ishga tushirish, bir xil kesh omboridan foydalanadigan barcha serverlar uchun texnik xizmat ko'rsatish holatini yangilaydi.

Ilovani texnik xizmat ko'rsatish rejimidan chiqarish uchun `up` buyrug'ini ishga tushiring:

```shell
./artisan up
```

### O'chirilgan Runnerlar

Ilova `app.Start()` orqali boshlanganda, Goravel avtomatik ravishda xizmat ko'rsatuvchi provayderlar tomonidan ro'yxatdan o'tkazilgan avtomatik ishga tushiriladigan [runnerlar](../architecture-concepts/service-providers.md#runnerlar) ishga tushiradi, masalan, HTTP server, gRPC server, navbat ishchisi, rejalashtiruvchi va telemetriya. Asosiy jarayonda ma'lum runnerlarni tanlab o'tkazib yuborishingiz mumkin, buning uchun `config/app.go` faylida `app.disabled_runners` opsiyasini sozlang. Framework ushbu ro'yxatni markazlashtirilgan holda baholaydi, shuning uchun bir xil variant joriy yoki kelajakdagi har qanday runner uchun ishlaydi.

```go
// config/app.go
"app": map[string]any{
    "env":   config.Env("APP_ENV", "production"),
    "debug": config.Env("APP_DEBUG", false),
    "disabled_runners": []string{"goravel:schedule"},
},
```

Qiymat har bir ishlovchining imzosiga mos keladigan glob naqshlarining bir qismidir. Framework moslashtirish uchun Go’ning [`path.Match`](https://pkg.go.dev/path#Match) dan foydalanadi, shuning uchun `*` yagona joker belgidir. Framework ishlovchi imzolari:

| Imzo                | Ishlovchi                                              | Boshlovchi                        |
| ------------------- | ------------------------------------------------------ | --------------------------------- |
| `goravel:http`      | `HTTPRunner` (HTTP server)          | `http` xizmat ko'rsatuvchisi      |
| `goravel:grpc`      | `GrpcRunner` (gRPC serveri)         | `grpc` xizmat ko'rsatuvchi        |
| `goravel:queue`     | `QueueRunner` (navbat ishchisi)     | `queue` xizmat ko'rsatuvchi       |
| `goravel:schedule`  | `ScheduleRunner` (rejalashtiruvchi) | `schedule` xizmat ko'rsatuvchi    |
| `goravel:telemetry` | `TelemetryRunner`                                      | `telemetry` xizmat ko'rsatuvchisi |

Umumiy naqshlar:

```go
// Veb konteyner — faqat rejalashtiruvchini o'tkazib yuboring, shunda u ajratilgan konteynerda ishlaydi
"disabled_runners": []string{"goravel:schedule"},

// Faqat rejalashtiruvchi konteyner — http, queue, grpc ni o'chiring
"disabled_runners": []string{"goravel:http", "goravel:queue", "goravel:grpc"},

// Barcha framework ishga tushiruvchilarni o'chiring
"disabled_runners": []string{"goravel:*"},

// O'chirish tugmasi: asosiy jarayonda avtomatik ishga tushiruvchilarni ishga tushirmang
"disabled_runners": []string{"*"},
```

Naqshlar ketma-ketlikda baholanadi va birinchi mos keladigan g'alaba qozonadi. Noto'g'ri naqshlar (masalan, mos kelmaydigan qavs) ogohlantirish sifatida qayd etiladi va ishga tushiruvchi ishlashda qoldiriladi, shuning uchun konfigdagi xato hech qachon yuklashni buzmaydi.

`WithRunners` bilan ro'yxatdan o'tkazgan foydalanuvchi tomonidan belgilangan ishga tushiruvchilarga `goravel:*` nom maydoni ta'sir qilmaydi. Uni o'chirish uchun ishga tushiruvchining o'z imzosidan foydalaning.
