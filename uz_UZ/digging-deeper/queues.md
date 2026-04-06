# Navbatlar

[[toc]]

## Kirish

Veb-ilovangizni yaratishda, veb-so‘rov davomida bajarish uchun juda uzoq vaqt talab qiladigan, yuklangan CSV faylini tahlil qilish va saqlash kabi vazifalar bo‘lishi mumkin. Xo‘sh, Goravel sizga orqa fonda ishlaydigan navbatga qo‘yilgan ishlarni yaratish imkoniyatini beruvchi yechimni taklif qiladi. Shu tarzda, vaqt talab qiladigan vazifalarni navbatga o‘tkazish orqali, ilovangiz veb-so‘rovlarga ancha tezroq javob bera oladi va mijozlaringiz uchun yaxshi foydalanuvchi tajribasini taqdim etadi. Ushbu xususiyatni amalga oshirish uchun biz `facades.Queue()` dan foydalanamiz.

### Ulanishlar va Navbatlar

Goravel navbatlarini chuqur o‘rganishdan oldin, "ulanishlar" va "navbatlar" o‘rtasidagi farqni tushunish muhimdir. Konfiguratsiya faylida, `config/queue.go` da, `connections` konfiguratsiyasi uchun massivni topasiz. Ushbu parametr Redis kabi orqa fondagi navbat xizmatlariga ulanishlarni belgilaydi. Biroq, har bir navbat ulanishi bir nechta "navbatlarga" ega bo‘lishi mumkin, ular navbatga qo‘yilgan ishlarning turli steklari yoki to‘plamlari deb tushunilishi mumkin.

Navbat konfiguratsiya faylidagi har bir ulanish konfiguratsiyasi misolida `queue` atributi mavjudligini ta‘kidlash muhimdir. Ushbu atribut, ishlar berilgan ulanishga yuborilganda ular yuboriladigan standart navbatdir. Oddiyroq qilib aytganda, agar siz ishni qaysi navbatga yuborilishi kerakligini aniq belgilamasdan yuborsangiz, ish ulanish konfiguratsiyasining queue atributida belgilangan navbatga joylashtiriladi.

```go
// Bu ish standart ulanishning standart navbatiga yuboriladi
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{
  {Type: "int", Value: 1},
}).Dispatch()

// Bu ish standart ulanishning "emails" navbatiga yuboriladi
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{
  {Type: "int", Value: 1},
}).OnQueue("emails").Dispatch()
```

## Haydovchi

Navbat konfiguratsiya fayli `config/queue.go` da saqlanadi va konfiguratsiya faylida turli navbat haydovchilari o‘rnatilishi mumkin.

### Sinxron Haydovchi

Sinxron haydovchi standart haydovchidir, u vazifalarni navbatga qo‘ymaydi, balki joriy jarayonda bevosita bajaradi.

### Ma'lumotlar Bazasi Haydovchisi

`database` haydovchisidan foydalanish uchun avval vazifalarni saqlash uchun ma'lumotlar bazasi jadvalini yaratishingiz kerak: [20210101000002_create_jobs_table.go](https://github.com/goravel/goravel/blob/master/database/migrations/20210101000002_create_jobs_table.go). Migratsiya fayli sukut bo‘yicha `database/migrations` katalogida joylashgan.

### Maxsus Haydovchi

Agar joriy haydovchi sizning ehtiyojlaringizni qondira olmasa, siz haydovchini sozlashingiz mumkin. Siz `contracts/queue/driver.go` dagi [Driver](https://github.com/goravel/framework/blob/master/contracts/queue/driver.go#L14) interfeysini amalga oshirishingiz kerak.

`Redis` drayverining rasmiy amalga oshirilishi, siz o'z maxsus drayveringizni amalga oshirish uchun [Redis Drayveri](https://github.com/goravel/redis) ga murojaat qilishingiz mumkin.

Maxsus haydovchini amalga oshirgandan so‘ng, konfiguratsiyani `config/queue.go` ga qo‘shishingiz mumkin:

```
...
"connections": map[string]any{
  "redis": map[string]any{
    "driver": "custom",
    "connection": "default",
    "queue": "default",
    "via": func() (queue.Driver, error) {
        return redisfacades.Queue("redis") // redis qiymati connections kalitidir
    },
  },
},
```

## Ishlarni Yaratish

### Ish Klasslarini Yaratish

Sukut bo‘yicha, ilovangizning barcha ishlari `app/jobs` katalogida saqlanadi. Agar `app/Jobs` katalogi mavjud bo‘lmasa, u `make:job` Artisan buyrug‘ini ishga tushirganingizda yaratiladi:

```shell
./artisan make:job ProcessPodcast
./artisan make:job user/ProcessPodcast
```

### Ishlarni ro'yxatdan o'tkazish

`make:job` tomonidan yaratilgan yangi ish `bootstrap/jobs.go::Jobs()` funksiyasida avtomatik ro'yxatdan o'tkaziladi va funksiya `WithJobs` tomonidan chaqiriladi. Agar ish faylini o'zingiz yaratgan bo'lsangiz, ishni qo'lda ro'yxatdan o'tkazishingiz kerak.

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithJobs(Jobs).
		WithConfig(config.Boot).
		Create()
}
```

### Klass Tuzilmasi

Ish klasslari juda oddiy, ikkita usuldan iborat: `Signature` va `Handle`. `Signature` vazifaning o‘ziga xos identifikatori vazifasini bajaradi, `Handle` esa navbat vazifani qayta ishlaganda bajariladi. Bundan tashqari, vazifa bajarilganda uzatilgan `[]queue.Arg{}` `Handle` ga uzatiladi:

```go
package jobs

type ProcessPodcast struct {
}

// Signature Ishning nomi va imzosi.
func (r *ProcessPodcast) Signature() string {
  return "process_podcast"
}

// Handle Ishni bajarish.
func (r *ProcessPodcast) Handle(args ...any) error {
  return nil
}
```

#### Ishni Qayta Urinish

Ish klasslari ishni qayta urinishni boshqarish uchun ishlatiladigan ixtiyoriy `ShouldRetry(err error, attempt int) (retryable bool, delay time.Duration)` usulini qo‘llab-quvvatlaydi.

```go
// ShouldRetry xatoga asoslanib, ish qayta urinib ko‘rilishini belgilaydi.
func (r *ProcessPodcast) ShouldRetry(err error, attempt int) (retryable bool, delay time.Duration) {
  return true, 10 * time.Second
}
```

## Navbat Serverini Ishga Tushirish

Standart navbat ishchisi navbat seriver provayderining runneri tomonidan ishga tushiriladi, agar siz turli konfiguratsiyalar bilan bir nechta navbat ishchilarini ishga tushirmoqchi bo'lsangiz, [runner](../architecture-concepts/service-providers.md#runners) yaratishingiz va uni `bootstrap/app.go` faylidagi `WithRunners` funksiyasiga qo'shishingiz mumkin:

```go
func Boot() contractsfoundation.Application {
  return foundation.Setup().
    WithConfig(config.Boot).
    WithRunners(func() []contractsfoundation.Runner {
      return []contractsfoundation.Runner{
        YourRunner,
      }
    }).
    Create()
}
```

Siz ma'lumot uchun [standart navbat runneri](https://github.com/goravel/framework/blob/master/queue/runners.go) ni tekshirishingiz mumkin.

## Ishlarni Yuborish

Ish klassini yozganingizdan so‘ng, uni ishning o‘zidagi `Dispatch` usuli yordamida yuborishingiz mumkin:

```go
package controllers

import (
  "github.com/goravel/framework/contracts/queue"
  "github.com/goravel/framework/contracts/http"

  "goravel/app/facades"
  "goravel/app/jobs"
)

type UserController struct {
}

func (r *UserController) Show(ctx http.Context) {
  err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).Dispatch()
  if err != nil {
    // do something
  }
}
```

### Sinxron Yuborish

Agar siz ishni darhol (sinxron ravishda) yubormoqchi bo‘lsangiz, `DispatchSync` usulidan foydalanishingiz mumkin. Ushbu usuldan foydalanganda, ish navbatga qo‘yilmaydi va joriy jarayon ichida darhol bajariladi:

```go
package controllers

import (
  "github.com/goravel/framework/contracts/queue"
  "github.com/goravel/framework/contracts/http"

  "goravel/app/facades"
  "goravel/app/jobs"
)

type UserController struct {
}

func (r *UserController) Show(ctx http.Context) {
  err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).DispatchSync()
  if err != nil {
    // do something
  }
}
```

### Ishlar Zanjiri

Ishlar zanjiri sizga ma‘lum tartibda bajarilishi kerak bo‘lgan navbatga qo‘yilgan ishlar ro‘yxatini belgilash imkonini beradi. Agar ketma-ketlikdagi har qanday ish muvaffaqiyatsiz bo‘lsa, qolgan ishlar bajarilmaydi. Navbatga qo‘yilgan ishlar zanjirini ishga tushirish uchun `facades.Queue()` tomonidan taqdim etilgan `Chain` usulidan foydalanishingiz mumkin:

```go
err := facades.Queue().Chain([]queue.Jobs{
  {
    Job: &jobs.Test{},
    Args: []queue.Arg{
      {Type: "int", Value: 1},
    },
  },
  {
    Job: &jobs.Test1{},
    Args: []queue.Arg{
      {Type: "int", Value: 2},
    },
  },
}).Dispatch()
```

### Kechiktirilgan Yuborish

Agar siz ishning navbat ishchisi tomonidan darhol qayta ishlanmasligini belgilamoqchi bo‘lsangiz, ish yuborilayotganda `Delay` usulidan foydalanishingiz mumkin. Misol uchun, ish yuborilgandan 100 soniyadan keyin qayta ishlash uchun mavjud bo‘lmasligini belgilaymiz:

```go
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).Delay(time.Now().Add(100*time.Second)).Dispatch()
```

### Navbat va Ulanishni Sozlash

#### Muayyan Navbatga Yuborish

Ishlarni turli navbatlarga yuborish orqali, siz navbatga qo‘yilgan ishlaringizni "toifalarga ajratishingiz" va hatto turli navbatlarga qancha ishchi tayinlash ustunligini belgilashingiz mumkin.

```go
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).OnQueue("processing").Dispatch()
```

#### Muayyan Ulanishga Yuborish

Agar ilovangiz bir nechta navbat ulanishlari bilan ishlayotgan bo‘lsa, vazifa qaysi ulanishga yuborilishini belgilash uchun `OnConnection` usulidan foydalanishingiz mumkin.

```go
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).OnConnection("sync").Dispatch()
```

Siz ish uchun ulanish va navbatni belgilash uchun `OnConnection` va `OnQueue` usullarini birgalikda zanjirlashingiz mumkin:

```go
err := facades.Queue().Job(&jobs.Test{}, []queue.Arg{}).OnConnection("sync").OnQueue("processing").Dispatch()
```

## Muvaffaqiyatsiz Ishlarni Ko‘rish

Muvaffaqiyatsiz ishlarni ko‘rish uchun `queue:failed` buyrug‘idan foydalanishingiz mumkin, bu buyruq ma‘lumotlar bazasidagi `failed_jobs` jadvalidan muvaffaqiyatsiz ishlarni oladi:

```shell
./artisan queue:failed
```

## Muvaffaqiyatsiz Ishlarni Qayta Urinish

Agar ish qayta ishlash paytida muvaffaqiyatsiz bo‘lsa, ishni qayta urinish uchun `queue:retry` buyrug‘idan foydalanishingiz mumkin. Ishni qayta urinishdan oldin, ma‘lumotlar bazasidagi `failed_jobs` jadvalidan qayta urinilishi kerak bo‘lgan ishning UUID ni olishingiz kerak:

```shell
# Bitta ishni qayta urinish
./artisan queue:retry 4427387e-c75a-4295-afb3-2f3d0e410494

# Bir nechta ishlarni qayta urinish
./artisan queue:retry 4427387e-c75a-4295-afb3-2f3d0e410494 eafdd963-a8b7-4aca-9421-b376ed9f4382

# Muayyan ulanish uchun muvaffaqiyatsiz ishlarni qayta urinish
./artisan queue:retry --connection=redis

# Muayyan navbat uchun muvaffaqiyatsiz ishlarni qayta urinish
./artisan queue:retry --queue=processing

# Muayyan ulanish va navbat uchun muvaffaqiyatsiz ishlarni qayta urinish
./artisan queue:retry --connection=redis --queue=processing

# Barcha muvaffaqiyatsiz ishlarni qayta urinish
./artisan queue:retry all
```

## `queue.Arg.Type` Qo‘llab-quvvatlanadigan Turlar

```go
bool
int
int8
int16
int32
int64
uint
uint8
uint16
uint32
uint64
float32
float64
string
[]bool
[]int
[]int8
[]int16
[]int32
[]int64
[]uint
[]uint8
[]uint16
[]uint32
[]uint64
[]float32
[]float64
[]string
```
