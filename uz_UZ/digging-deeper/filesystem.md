# Fayl saqlash

[[toc]]

## Kirish

Goravel mahalliy fayl tizimlari, Amazon S3, Aliyun OSS, Tencent COS, Minio va Cloudinary bilan ishlash uchun oddiy drayverlarni taqdim etadi. Yanada yaxshisi, ushbu saqlash variantlari o'rtasida mahalliy ishlab chiqish mashinangiz va ishlab chiqarish serveringiz o'rtasida o'tish juda oddiy, chunki har bir tizim uchun API bir xil bo'lib qoladi. Goravel `local` haydovchi bilan birga keladi, boshqa haydovchilar uchun iltimos, tegishli mustaqil kengaytma paketini tekshiring:

| Haydovchi   | Havola                                                                                               |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| S3          | [https://github.com/goravel/s3](https://github.com/goravel/s3)       |
| OSS         | [https://github.com/goravel/oss](https://github.com/goravel/oss)     |
| Tencent COS | [https://github.com/goravel/cos](https://github.com/goravel/cos)     |
| Minio       | [https://github.com/goravel/minio](https://github.com/goravel/minio) |

## Konfiguratsiya

Goravelning fayl tizimi konfiguratsiya fayli `config/filesystems.go` manzilida joylashgan. Ushbu fayl ichida siz barcha fayl tizimi "disk"laringizni sozlashingiz mumkin, har bir disk ma'lum bir saqlash haydovchisi va saqlash joyini ifodalaydi.

> Siz istagancha diskni sozlashingiz mumkin va hatto bir xil haydovchidan foydalanadigan bir nechta disklarga ham ega bo'lishingiz mumkin.

### Mahalliy haydovchi

`local` haydovchidan foydalanganda, barcha fayl operatsiyalari `filesystems` konfiguratsiya faylingizda belgilangan `root` katalogiga nisbatan amalga oshiriladi. Standart bo'yicha, bu qiymat `storage/app` katalogiga o'rnatilgan. Shuning uchun, quyidagi usul `storage/app/example.txt` fayliga yozadi:

```go
facades.Storage().Put("example.txt", "Tarkib")
```

### Ommaviy disk

Ilovangizning `filesystems` konfiguratsiya faylida kiritilgan `public` disk umumiy kirish uchun mo'ljallangan fayllar uchun mo'ljallangan. Standart sozlamalar bo'yicha, `public` disk `local` haydovchidan foydalanadi va fayllarini `storage/app/public` papkasida saqlaydi. Agar siz ushbu fayllarga veb orqali tashrif buyurmoqchi bo'lsangiz, fayl marshrutlash yaratishingiz mumkin:

```go
fasadlar.Route().Static("storage", "./storage/app/public")
```

## Disk namunalarini olish

`Storage` fasadasi konfiguratsiya qilingan har qanday disklar bilan o'zaro aloqada foydalanish uchun ishlatilishi mumkin. Masalan, siz fasad ustida `Put` usulidan foydalanib, avatar standart diskda saqlashingiz mumkin. Agar siz `Disk` metodini chaqirmasdan `Storage` fasadida metodlarni chaqirsangiz, metod avtomatik ravishda standart diskka o'tkaziladi:

```go
facades.Storage().Put("avatars/1.png", "Kontent")
```

Agar ilovangiz bir nechta disk bilan ishlasa, ma'lum bir diskdagi fayllar bilan ishlash uchun `Storage` fasadidagi `Disk` metodidan foydalanishingiz mumkin:

```go
facades.Storage().Disk("s3").Put("avatars/1.png", "Contents")
```

## Kontekstni kiritish

```go
facades.Storage().WithContext(ctx).Put("avatars/1.png", "Contents")
```

## Fayllarni olish

`Get` usuli fayl mazmunini olish uchun ishlatilishi mumkin. Faylning xom satr tarkibi usul tomonidan qaytariladi. Eslab qoling, barcha fayl yo'llari diskning `root` joylashuviga nisbatan ko'rsatilishi kerak:

```go
content := facades.Storage().Get("file.jpg")
```

`Exists` usuli diskda fayl mavjudligini aniqlash uchun ishlatilishi mumkin:

```go
if (facades.Storage().Disk("s3").Exists("file.jpg")) {
    // ...
}
```

`Missing` usuli diskda fayl yo'qligini aniqlash uchun ishlatilishi mumkin:

```go
if (facades.Storage().Disk("s3").Missing("file.jpg")) {
    // ...
}
```

### Fayl URL manzillari

Siz berilgan fayl uchun URL olish uchun `Url` metodidan foydalanishingiz mumkin. Agar siz `local` haydovchisidan foydalanayotgan bo'lsangiz, bu odatda berilgan yo'lni `/storage` bilan boshlab, faylga nisbiy URLni qaytaradi. Agar siz `s3` haydovchisidan foydalanayotgan bo'lsangiz, to'liq masofaviy URL qaytariladi:

```go
url := facades.Storage().Url("file.jpg")
```

> `local` haydovchidan foydalanganda, `Url`ning qaytarilgan qiymati URL kodlanmagan. Shu sababdan, fayllaringizni haqiqiy URL'lar yaratadigan nomlar bilan saqlashni har doim tavsiya qilamiz.

#### Vaqtinchalik URL manzillar

`TemporaryUrl` usuli yordamida, Non-local haydovchi yordamida saqlangan fayllarga vaqtinchalik URL-lar yaratishingiz mumkin. Bu usul yo'l va URL qachon muddati tugashi kerakligini belgilaydigan `Time` misolini qabul qiladi:

```go
url, err := facades.Storage().TemporaryUrl(
    "file.jpg", time.Now().Add(5*time.Minute)
)
```

### Fayl Metadata

Fayllarni o'qish va yozishdan tashqari, Goravel fayllarning o'zlari haqida ma'lumot ham taqdim etishi mumkin:

```go
size := facades.Storage().Size("file.jpg")
```

`LastModified` usuli faylning oxirgi o'zgartirilgan vaqtini qaytaradi:

```go
time, err := facades.Storage().LastModified("file.jpg")
```

Berilgan faylning MIME turi `MimeType` usuli orqali olinishi mumkin:

```go
mime, err := facades.Storage().MimeType("file.jpg")
```

Shuningdek, `NewFile` usulidan foydalanish mumkin:

```go
"github.com/goravel/framework/filesystem" paketini import qiling

file, err := filesystem.NewFile("./logo.png")
size, err := file.Size()
lastModified, err := file.LastModified()
mime, err := file.MimeType()
```

### Fayl yo'llari

Muayyan fayl uchun yo'lni olish uchun siz `Path` usulidan foydalanishingiz mumkin. `local` haydovchidan foydalanganda, bu sizga faylning nisbiy yoʻlini taqdim etadi. Biroq, agar siz `s3` kabi haydovchidan foydalanayotgan bo'lsangiz, usul sizga faylning bak ichidagi nisbiy yo'lini beradi:

```go
path := facades.Storage().Path("file.jpg")
```

## Fayllarni saqlash

`Put` usuli diskda fayl tarkibini saqlash uchun ishlatilishi mumkin. Esda tuting, barcha fayl yo'llari disk uchun sozlangan "root" joyiga nisbatan ko'rsatilishi kerak:

```go
err := facades.Storage().Put("file.jpg", contents)
```

Shuningdek, fayllarni to'g'ridan-to'g'ri diskda saqlash uchun `PutFile` va `PutFileAs` dan foydalanishingiz mumkin:

```go
import "github.com/goravel/framework/filesystem"

// Fayl nomi uchun avtomatik ravishda noyob ID yaratish...
file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFile("photos", file)

// Fayl nomini qo'lda belgilash...
file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFileAs("photos", file, "photo.jpg")
```

`PutFile` usuli haqida bir nechta muhim narsalarni esda tutish kerak. E'tibor bering, biz faqat katalog nomini ko'rsatdik, fayl nomini emas. Standart holatda, `PutFile` metodi fayl nomi sifatida xizmat qilish uchun noyob ID yaratadi. Fayl kengaytmasi faylning MIME turini tekshirish orqali aniqlanadi. Fayl yo'li `PutFile` usuli tomonidan qaytariladi, shuning uchun siz yo'lni, shu jumladan yaratilgan fayl nomini, ma'lumotlar bazangizda saqlashingiz mumkin.

### Fayllarni nusxalash va ko'chirish

`Copy` usuli mavjud faylni diskdagi yangi joyga nusxalash uchun ishlatilishi mumkin, `Move` usuli esa mavjud faylni qayta nomlash yoki yangi joyga ko'chirish uchun ishlatilishi mumkin:

```go
err := facades.Storage().Copy("old/file.jpg", "new/file.jpg")

err := facades.Storage().Move("old/file.jpg", "new/file.jpg")
```

### Fayl yuklashlar

Veb-ilovalarda fayllarni saqlashning eng keng tarqalgan qo'llanilishlaridan biri foydalanuvchi tomonidan yuklangan fotosuratlar va hujjatlar kabi fayllarni saqlashdir. Goravel yuklangan fayl namunasida `Store` usulidan foydalanib, yuklangan fayllarni saqlashni juda oson qiladi. Yuklangan faylni saqlamoqchi bo'lgan yo'lingiz bilan `Store` metodini chaqiring:

```go
func (r *UserController) Show(ctx http.Context) {
  fayl, xato := ctx.Request().File("avatar")
  yo'l, xato := fayl.Store("avatars")
}
```

Ushbu misol haqida bir nechta muhim narsalarni esda tutish kerak. E'tibor bering, biz faqat katalog nomini ko'rsatdik, fayl nomini emas. Standart holatda, `Store` usuli fayl nomi sifatida xizmat qilish uchun noyob ID yaratadi. Fayl kengaytmasi faylning MIME turini tekshirish orqali aniqlanadi. Fayl yo'li `Store` usuli tomonidan qaytariladi, shuning uchun siz yo'lni, jumladan, yaratilgan fayl nomini, ma'lumotlar bazangizda saqlashingiz mumkin.

Shuningdek, yuqoridagi misolda ko'rsatilgan fayl saqlash operatsiyasini bajarish uchun `Storage` fasadida `PutFile` metodini ham chaqirishingiz mumkin:

```go
import "github.com/goravel/framework/filesystem"

file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFile("photos", file)
```

### Specifying A File Name

Agar saqlangan faylingizga avtomatik ravishda fayl nomi berilmasligini istasangiz, `StoreAs` metodidan foydalanishingiz mumkin, bu metod argument sifatida yo‘l, fayl nomi va (ixtiyoriy) diskni qabul qiladi:

```go
file, err := ctx.Request().File("avatar")
path, err := file.StoreAs("avatars", "name")
```

Shuningdek, siz Storage fasadidagi `PutFileAs` metodidan ham foydalanishingiz mumkin, bu yuqoridagi misoldagi kabi fayl saqlash operatsiyasini bajaradi:

```go
import "github.com/goravel/framework/filesystem"

file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFileAs("photos", file, "name")
```

> Agar `StoreAs` va `PutFileAs` tomonidan belgilangan fayl nomida kengaytma bo'lmasa, faylning MIME turiga asoslanib kengaytma avtomatik ravishda qo'shiladi; aks holda, belgilangan fayl nomi to'g'ridan-to'g'ri ishlatiladi.

### Diskni belgilash

Standart holda, yuklangan ushbu faylning `Store` usuli sizning standart diskingizdan foydalanadi. Agar boshqa diskni belgilamoqchi bo'lsangiz, `Disk` metodidan foydalaning:

```go
func (r *UserController) Show(ctx http.Context) {
  file, err := ctx.Request().File("avatar")
  path, err := file.Disk("s3").Store("avatars")
}
```

### Boshqa yuklangan fayl ma'lumotlari

Agar yuklangan faylning asl nomi va kengaytmasini olishni istasangiz, `GetClientOriginalName` va `GetClientOriginalExtension` usullaridan foydalanishingiz mumkin:

```go
file, err := ctx.Request().File("avatar")

name := file.GetClientOriginalName()
extension := file.GetClientOriginalExtension()
```

Biroq, `GetClientOriginalName` va `GetClientOriginalExtension` usullari xavfli hisoblanadi, chunki fayl nomi va kengaytmasi yomon niyatli foydalanuvchi tomonidan o'zgartirilishi mumkinligini yodda tuting. Shu sababli, berilgan fayl yuklash uchun nom va kengaytmani olish uchun odatda `HashName` va `Extension` usullarini afzal ko'rishingiz kerak:

```go
file, err := ctx.Request().File("avatar")

name := file.HashName() // Yagona, tasodifiy nom hosil qilish...
extension, err := file.Extension() // Faylning MIME turiga asoslanib, fayl kengaytmasini aniqlash...
```

## Fayllarni o'chirish

`Delete` usuli bitta fayl nomini yoki o'chirish uchun fayllar massivini qabul qiladi:

```go
err := facades.Storage().Delete("file.jpg")
err := facades.Storage().Delete("file.jpg", "file2.jpg")
```

Agar kerak bo'lsa, fayl o'chirilishi kerak bo'lgan diskni belgilashingiz mumkin:

```go
err := facades.Storage().Disk("s3").Delete("file.jpg")
```

## Kataloglar

### Barcha Fayllarni Katalog Ichida Olish

`Files` usuli berilgan katalogdagi barcha fayllarning kesmasini qaytaradi. Agar berilgan katalogdagi barcha fayllar ro'yxatini, shu jumladan barcha pastki kataloglarni olishni istasangiz, `AllFiles` metodidan foydalanishingiz mumkin:

```go
files, err := facades.Storage().Disk("s3").Files("directory")
files, err := facades.Storage().Disk("s3").AllFiles("directory")
```

### Katalog Ichidagi Barcha Kataloglarni Oling

`Directories` usuli berilgan katalog ichidagi barcha kataloglarning kesmasini qaytaradi. Bundan tashqari, siz berilgan katalogdagi barcha kataloglar va uning barcha pastki kataloglari ro'yxatini olish uchun `AllDirectories` usulidan foydalanishingiz mumkin:

```go
directories, err := facades.Storage().Disk("s3").Directories("directory")
directories, err := facades.Storage().Disk("s3").AllDirectories("directory")
```

### Papka yaratish

`MakeDirectory` usuli berilgan katalogni, shu jumladan zarur bo'lgan barcha ichki kataloglarni yaratadi:

```go
err := facades.Storage().MakeDirectory(directory)
```

### Katalogni o'chirish

Nihoyat, `DeleteDirectory` usuli katalog va uning barcha fayllarini olib tashlash uchun ishlatilishi mumkin:

```go
err := facades.Storage().DeleteDirectory(directory)
```

## Maxsus Fayl Tizimlari

Siz `custom` haydovchini `config/filesystems.go` faylida o'rnatishingiz mumkin.

```go
"custom": map[string]any{
  "driver": "custom",
  "via":    filesystems.NewLocal(),
},
```

Siz `via` konfiguratsiya elementida `github.com/goravel/framework/contracts/filesystem/Driver` interfeysini amalga oshirishingiz kerak.

```go
type Driver interface {
  AllDirectories(path string) ([]string, error)
  AllFiles(path string) ([]string, error)
  Copy(oldFile, newFile string) error
  Delete(file ...string) error
  DeleteDirectory(directory string) error
  Directories(path string) ([]string, error)
  Exists(file string) bool
  Files(path string) ([]string, error)
  Get(file string) (string, error)
  GetBytes(file string) ([]byte, error)
  LastModified(file string) (time.Time, error)
  MakeDirectory(directory string) error
  MimeType(file string) (string, error)
  Missing(file string) bool
  Move(oldFile, newFile string) error
  Path(file string) string
  Put(file, content string) error
  PutFile(path string, source File) (string, error)
  PutFileAs(path string, source File, name string) (string, error)
  Size(file string) (int64, error)
  TemporaryUrl(file string, time time.Time) (string, error)
  WithContext(ctx context.Context) Driver
  Url(file string) string
}
```

> Eslatma: Maxsus drayver ro'yxatdan o'tkazilganda konfiguratsiya yuklanmaganligi sababli, iltimos, maxsus drayverda konfiguratsiyani olish uchun `facades.Config().Env()` dan foydalaning.
