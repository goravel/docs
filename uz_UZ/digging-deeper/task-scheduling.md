# Vazifa rejalashtirish

[[toc]]

## Kirish

Avvalroq, serveringizda rejalashtirilishi kerak bo‘lgan har bir vazifa uchun cron konfiguratsiyasi yozuvini yaratishingiz kerak edi. Biroq, bu yondashuv tezda muammoga aylanadi, chunki vazifa jadvalingiz manba nazoratida emas va cron yozuvlarini ko‘rish yoki qo‘shish/o‘zgartirish uchun serveringizga SSH orqali ulanishingiz kerak.

Goravelning buyruq rejalashtiruvchisi serveringizda rejalashtirilgan vazifalarni boshqarishning yangi yondashuvini taklif etadi. Rejalashtiruvchi yordamida Goravel ilovangiz ichida o‘z buyruq jadvalingizni osongina va aniq belgilashingiz mumkin. Rejalashtiruvchidan foydalangan holda, serveringizda faqat bitta cron yozuvini yaratishingiz kifoya.

## Jadvallarni belgilash

Ilovingiz uchun vazifalarni rejalashtirish uchun ularni `bootstrap/app.go` faylidagi `WithSchedule` funksiyasida aniqlashingiz mumkin. Buni yaxshiroq tushunish uchun bir misolni ko‘rib chiqaylik. Bu holda, har kuni yarim tunda ishlaydigan yopilishni rejalashtirmoqchimiz. Ushbu yopilish ichida jadvalni tozalash uchun maʼlumotlar bazasi so‘rovini bajaramiz:

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithSchedule(func() []schedule.Event {
			return []schedule.Event{
				facades.Schedule().Call(func() {
          facades.Orm().Query().Where("1 = 1").Delete(&models.User{})
        }).Daily(),
			}
		}).
		WithConfig(config.Boot).
		Start()
}
```

### Artisan buyruqlarini rejalashtirish

Yopilishlarni rejalashtirishdan tashqari, siz [Artisan buyruqlarini](./artisan-console.md) ham rejalashtirishingiz mumkin. Misol uchun, Artisan buyrug‘ini uning nomi yoki sinfi yordamida rejalashtirish uchun `Command` usulidan foydalanishingiz mumkin.

```go
facades.Schedule().Command("send:emails name").Daily(),
```

### Jurnal darajasi

`app.debug` `true` bo‘lganda, konsol barcha jurnallarni chop etadi. Aks holda, faqat `error` darajasidagi jurnallar chop etiladi.

### Jadval chastotasi variantlari

Biz vazifani belgilangan oraliqlarda qanday sozlashingiz mumkinligining bir nechta misollarini ko‘rdik. Biroq, vazifalarga tayinlash uchun mavjud bo‘lgan yana ko‘plab vazifa jadvali chastotalari mavjud:

| Usul                     | Tavsif                                                            |
| ------------------------ | ----------------------------------------------------------------- |
| `.Cron("* * * * *")`     | Maxsus Cron jadvali (daqiqalar)                |
| `.Cron("* * * * * *")`   | Maxsus Cron jadvali (soniyalar)                |
| `.EverySecond()`         | Vazifani har soniyada ishga tushirish                             |
| `.EveryTwoSeconds()`     | Vazifani har ikki soniyada ishga tushirish                        |
| `.EveryFiveSeconds()`    | Vazifani har besh soniyada ishga tushirish                        |
| `.EveryTenSeconds()`     | Vazifani har o‘n soniyada ishga tushirish                         |
| `.EveryFifteenSeconds()` | Vazifani har o‘n besh soniyada ishga tushirish                    |
| `.EveryTwentySeconds()`  | Vazifani har yigirma soniyada ishga tushirish                     |
| `.EveryThirtySeconds()`  | Vazifani har o‘ttiz soniyada ishga tushirish                      |
| `.EveryMinute()`         | Vazifani har daqiqada ishga tushirish                             |
| `.EveryTwoMinutes()`     | Vazifani har ikki daqiqada ishga tushirish                        |
| `.EveryThreeMinutes()`   | Vazifani har uch daqiqada ishga tushirish                         |
| `.EveryFourMinutes()`    | Vazifani har to‘rt daqiqada ishga tushirish                       |
| `.EveryFiveMinutes()`    | Vazifani har besh daqiqada ishga tushirish                        |
| `.EveryTenMinutes()`     | Vazifani har o‘n daqiqada ishga tushirish                         |
| `.EveryFifteenMinutes()` | Vazifani har o‘n besh daqiqada ishga tushirish                    |
| `.EveryThirtyMinutes()`  | Vazifani har o‘ttiz daqiqada ishga tushirish                      |
| `.Hourly()`              | Vazifani har soatda ishga tushirish                               |
| `.HourlyAt(17)`          | Vazifani har soatda, soatdan 17 daqiqa o‘tgach ishga tushirish    |
| `.EveryTwoHours()`       | Vazifani har ikki soatda ishga tushirish                          |
| `.EveryThreeHours()`     | Vazifani har uch soatda ishga tushirish                           |
| `.EveryFourHours()`      | Vazifani har to‘rt soatda ishga tushirish                         |
| `.EverySixHours()`       | Vazifani har olti soatda ishga tushirish                          |
| `.Daily()`               | Vazifani har kuni yarim tunda ishga tushirish                     |
| `.DailyAt("13:00")`      | Vazifani har kuni soat 13:00 da ishga tushirish   |
| `.Days(1, 3, 5)`         | Vazifani har Dushanba, Chorshanba va Juma kunlari ishga tushirish |
| `.Weekdays()`            | Vazifani har Dushanbadan Jumagacha ishga tushirish                |
| `.Weekends()`            | Vazifani har Shanba va Yakshanba kunlari ishga tushirish          |
| `.Mondays()`             | Vazifani har Dushanba kuni ishga tushirish                        |
| `.Tuesdays()`            | Vazifani har Seshanba kuni ishga tushirish                        |
| `.Wednesdays()`          | Vazifani har Chorshanba kuni ishga tushirish                      |
| `.Thursdays()`           | Vazifani har Payshanba kuni ishga tushirish                       |
| `.Fridays()`             | Vazifani har Juma kuni ishga tushirish                            |
| `.Saturdays()`           | Vazifani har shanba kuni bajarish                                 |
| `.Sundays()`             | Vazifani har yakshanba kuni bajarish                              |
| `.Weekly()`              | Vazifani har hafta bajarish                                       |
| `.Monthly()`             | Vazifani har oy bajarish                                          |
| `.Quarterly()`           | Vazifani har chorakda bajarish                                    |
| `.Yearly()`              | Vazifani har yil bajarish                                         |

### Vazifalarning Ustma-ust Kelishining Oldini Olish

Sukut bo‘yicha, rejalashtirilgan vazifalar oldingi nusxasi hali ishlayotgan bo‘lsa ham bajarilishda davom etadi. Buning oldini olish uchun quyidagi usullardan foydalaning:

| Usul                     | Tavsif                                          |
| ------------------------ | ----------------------------------------------- |
| `.SkipIfStillRunning()`  | Agar hali ishlayotgan bo‘lsa, o‘tkazib yuborish |
| `.DelayIfStillRunning()` | Agar hali ishlayotgan bo‘lsa, kechiktirish      |

```go
facades.Schedule().Command("send:emails name").EveryMinute().SkipIfStillRunning()
facades.Schedule().Command("send:emails name").EveryMinute().DelayIfStillRunning()
```

### Vazifalarni Bitta Serverda Bajarish

> Ushbu xususiyatdan foydalanish uchun ilovangiz sukut bo‘yicha kesha haydovchisi sifatida memcached, dynamodb yoki redis kesha haydovchisidan foydalanishi kerak. Bundan tashqari, barcha serverlar bir markaziy kesha serveri bilan aloqa qilishi kerak.

Agar ilovangizning rejalashtiruvchisi bir nechta serverlarda ishlayotgan bo‘lsa, rejalashtirilgan ish faqat bitta serverda bajarilishini taʼminlashingiz mumkin. Misol uchun, har juma kechasi yangi hisobot yaratadigan rejalashtirilgan vazifangiz bor deb faraz qilaylik. Agar vazifa rejalashtiruvchisi uchta ishchi serverda ishlayotgan bo‘lsa, rejalashtirilgan vazifa barcha uchta serverda ishlaydi va hisobotni uch marta yaratadi. Bu maqbul emas!

Buning oldini olish uchun rejalashtirilgan vazifani aniqlashda `OnOneServer` usulidan foydalaning, bu vazifaning faqat bitta serverda ishlashini taʼminlaydi. Vazifani qabul qilgan birinchi server ish bo‘yicha atomik qulfni oladi, bu boshqa serverlarning bir vaqtning o‘zida bir xil vazifani bajarishiga to‘sqinlik qiladi:

```go
facades.Schedule().Command("report:generate").Daily().OnOneServer()
```

Agar yopilishlar bitta serverda bajarilishi kerak bo‘lsa, ularga nom berilishi kerak:

```go
facades.Schedule().Call(func() {
  fmt.Println("goravel")
}).Daily().OnOneServer().Name("goravel")
```

## Rejalashtiruvchini Ishga Tushirish

Rejalashtiruvchi `main.go` faylida `Start()` chaqirilganda avtomatik ravishda ishga tushiriladi. Shuningdek, vazifalarni qo‘lda ishga tushirishingiz mumkin:

```shell
./artisan schedule:run
```

## Barcha Vazifalarni Ko‘rish

Barcha vazifalarni ko‘rish uchun `schedule:list` buyrug‘idan foydalanishingiz mumkin:

```shell
./artisan schedule:list
```
