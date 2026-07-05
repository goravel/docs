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

### Xizmat ko‘rsatish rejimi

Agar siz Route fasadini o‘rnatgan bo‘lsangiz, ilovangizni xizmat ko‘rsatish rejimiga o‘tkazish uchun `down` buyrug‘idan foydalanishingiz mumkin. Sukut bo‘yicha, Goravel `file` xizmat ko‘rsatish drayveridan foydalanadi va xizmat ko‘rsatish metama'lumotlarini `framework/maintenance.json` saqlash yo‘lida saqlaydi:

```shell
./artisan down
```

Siz xizmat ko‘rsatish javobi uchun maxsus sabab va HTTP status kodini ko‘rsatishingiz mumkin:

```shell
./artisan down --reason="Upgrading database" --status=503
```

`down` buyrug‘i, shuningdek, ilova xizmat ko‘rsatish rejimida bo‘lganda foydalanuvchilarni yo‘lga yo‘naltirish yoki ko‘rinishni ko‘rsatishni qo‘llab-quvvatlaydi:

```shell
./artisan down --redirect=/maintenance
./artisan down --render=errors/503
```

`--render` ishlatilganda, ko‘rinish allaqachon mavjud bo‘lishi kerak. Agar `--redirect` yoki `--render` ko‘rsatilgan bo‘lsa, `--reason` javob tanasi ishlatilmaydi.

Siz maxfiy kalit o‘rnatish orqali ilovaga vaqtinchalik kirishni ruxsat berishingiz mumkin. Foydalanuvchilar `secret` so‘rov parametri bilan ilovaga tashrif buyurib, xizmat ko‘rsatish rejimini chetlab o‘tishi mumkin:

```shell
./artisan down --secret=let-me-in
```

```text
https://example.com?secret=let-me-in
```

Shuningdek, Goravel siz uchun tasodifiy maxfiy kalit yaratishi mumkin:

```shell
./artisan down --with-secret
```

Xizmat ko‘rsatish drayveri va kesh do‘koni `config/app.go` faylida sozlanadi. Sukut bo‘yicha konfiguratsiya `APP_MAINTENANCE_DRIVER` va `APP_MAINTENANCE_STORE` muhit o‘zgaruvchilaridan o‘qiydi:

```go
"maintenance": map[string]any{
    "driver": config.Env("APP_MAINTENANCE_DRIVER", "file"),
    "store":  config.Env("APP_MAINTENANCE_STORE", ""),
},
```

Agar ilovangiz bir nechta serverda ishlasa, barcha serverlar bir xil xizmat ko‘rsatish holatini ulashishi uchun `cache` xizmat ko‘rsatish drayveridan foydalanishingiz mumkin. `.env` faylida drayver va ixtiyoriy kesh do‘koni nomini sozlang:

```ini
APP_MAINTENANCE_DRIVER=cache
APP_MAINTENANCE_STORE=redis
```

Agar `APP_MAINTENANCE_STORE` o‘rnatilmagan bo‘lsa, Goravel sukut bo‘yicha kesh do‘konidan foydalanadi. Bitta serverda `down` yoki `up` ishga tushirish, bir xil kesh do‘konidan foydalanadigan barcha serverlar uchun xizmat ko‘rsatish holatini yangilaydi.

Ilovani xizmat ko‘rsatish rejimidan chiqarish uchun `up` buyrug‘ini ishga tushiring:

```shell
./artisan up
```

### O‘chirilgan Runnerlar

Ilova `app.Start()` orqali ishga tushganda, Goravel xizmat provayderlari tomonidan ro‘yxatdan o‘tkazilgan avtomatik ishga tushuvchi [runnerlarni](../architecture-concepts/service-providers.md#runners) avtomatik ravishda ishga tushiradi, masalan, HTTP server, gRPC server, navbat ishchisi, rejalashtiruvchi va telemetriya. `config/app.go` faylida `app.disabled_runners` opsiyasini o‘rnatish orqali asosiy jarayonda muayyan runnerlarni tanlab o‘tkazib yuborishingiz mumkin. Framework ushbu ro‘yxatni markazlashtirilgan holda baholaydi, shuning uchun bir xil opsiya har qanday joriy yoki kelajakdagi runner uchun ishlaydi.

```go
// config/app.go
"app": map[string]any{
    "env":   config.Env("APP_ENV", "production"),
    "debug": config.Env("APP_DEBUG", false),
    "disabled_runners": []string{"goravel:schedule"},
},
```

Qiymat har bir runnerning imzosiga mos keladigan glob shablonlari bo‘lakchasidir. Framework moslashtirish uchun Go'ning [`path.Match`](https://pkg.go.dev/path#Match) funksiyasidan foydalanadi, shuning uchun `*` yagona wildcard hisoblanadi. Framework runner imzolari:

| Imzo | Runner | Ishga tushiruvchi |
| --- | --- | --- |
| `goravel:http` | `HTTPRunner` (HTTP server) | `http` xizmat provayderi |
| `goravel:grpc` | `GrpcRunner` (gRPC server) | `grpc` xizmat provayderi |
| `goravel:queue` | `QueueRunner` (navbat ishchisi) | `queue` xizmat provayderi |
| `goravel:schedule` | `ScheduleRunner` (rejalashtiruvchi) | `schedule` xizmat provayderi |
| `goravel:telemetry` | `TelemetryRunner` | `telemetry` xizmat provayderi |

Keng tarqalgan shablonlar:

```go
// Veb-konteyner — faqat rejalashtiruvchini o‘chirib qo‘yish, u maxsus konteynerda ishlasin
"disabled_runners": []string{"goravel:schedule"},

// Faqat rejalashtiruvchi konteyneri — http, queue, grpc ni o‘chirish
"disabled_runners": []string{"goravel:http", "goravel:queue", "goravel:grpc"},

// Barcha framework runnerlarini o‘chirish
"disabled_runners": []string{"goravel:*"},

// O‘chirish tugmasi: asosiy jarayonda hech qanday avtomatik runner ishlamasin
"disabled_runners": []string{"*"},
```

Shablonlar tartib bo‘yicha baholanadi va birinchi mos kelgan g‘alaba qozonadi. Noto‘g‘ri shablonlar (masalan, yopilmagan qavs) ogohlantirish sifatida qayd etiladi va runner ishlayveradi, shuning uchun konfiguratsiyadagi xato boshlang‘ich yuklanishni hech qachon buzmaydi.

`WithRunners` orqali ro‘yxatdan o‘tkazgan foydalanuvchi tomonidan belgilangan runnerlar `goravel:*` nom maydonidan ta'sirlanmaydi. Ularni o‘chirish uchun runnerning o‘z imzosidan foydalaning.
