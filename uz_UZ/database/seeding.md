# Ma'lumotlar bazasi: Urg'ochi qo'shish

[[toc]]

## Kirish

Goravel ma'lumotlar bazangizni seed struct yordamida ma'lumotlar bilan to'ldirish imkoniyatini o'z ichiga oladi. Barcha urug' strukturalari `database/seeders` katalogida saqlanadi. Standart bo‘yicha, siz uchun `DatabaseSeeder` struktura belgilangan.

## Seederlarni yozish

Seeder yaratish uchun `make:seeder` [Artisan buyrug'ini](../digging-deeper/artisan-console.md) ishga tushiring. Framework tomonidan yaratilgan barcha urug‘lar `database/seeders` katalogida saqlanadi:

```shell
./artisan make:seeder UserSeeder
```

Standart bo'yicha, seeder strukturasida ikkita metod mavjud: `Signature` va `Run`. `Signature` usuli seeder nomini belgilaydi, `Run` usuli esa `db:seed` Artisan buyrug'i bajarilganda ishga tushiriladi. Siz ma'lumotlarni o'zingiz xohlagan tarzda ma'lumotlar bazangizga kiritish uchun `Run` metodidan foydalanishingiz mumkin.

Masalan, biz `DatabaseSeeder` strukturini `Run` metodiga ma'lumotlar bazasiga ma'lumot kiritish bayonotini qo'shish orqali sozlashimiz mumkin.

```go
paket urug‘chilari

import (
	"github.com/goravel/framework/contracts/database/seeder"
	
	"goravel/app/facades"
	"goravel/app/models"
)

type DatabaseSeeder struct {
}

// Imzo Urg‘uchining nomi va imzosi.
func (s *DatabaseSeeder) Signature() string {
	return "DatabaseSeeder"
}

// Run urg‘uchi mantiqini bajaradi.
func (s *DatabaseSeeder) Run() error {
	user := models.User{
		Name: "goravel",
	}
	return facades.Orm().Query().Create(&user)
}
```

## Qo'shimcha Seederni chaqirish

`DatabaseSeeder` strukturasi ichida, qo'shimcha urug' strukturalarini bajarish uchun `Call` metodidan foydalanishingiz mumkin. `Call` usulidan foydalanish ma'lumotlar bazangizni ko'chirishni bir nechta fayllarga bo'lish imkonini beradi, shunda biron bir ko'chiruvchi struktura juda katta bo'lib qolmaydi. `Call` usuli bajarilishi kerak bo'lgan seeder strukturalari massivini qabul qiladi:

```go
// Run seeder mantiqini bajaradi.
func (s *DatabaseSeeder) Run() error {
	return facades.Seeder().Call([]seeder.Seeder{
		&UserSeeder{},
	})
}
```

Framework shuningdek `CallOnce` usulini taqdim etadi, bu urug‘lantiruvchi `db:seed` buyrug‘ida faqat bir marta bajariladi:

```go
// Run seeder mantiqini bajaradi.
func (s *DatabaseSeeder) Run() error {
	return facades.Seeder().CallOnce([]seeder.Seeder{
		&UserSeeder{},
	})
}
```

## Seederlarni ishga tushirish

Siz ma'lumotlar bazangizni to'ldirish uchun `db:seed` Artisan buyrug'ini ishga tushirishingiz mumkin. Standart holatda, `db:seed` buyrug'i `database/seeders/database_seeder.go` faylini ishga tushiradi, bu esa o'z navbatida boshqa urug' sinflarini chaqirishi mumkin. Biroq, siz `--seeder` opsiyasidan foydalanib, alohida ishlatish uchun aniq seeder klassini belgilashingiz mumkin:

```shell
./artisan db:seed
```

Agar siz `db:seed` buyrug'ini ishga tushirganda boshqa seederlarni bajarishni istasangiz, seeder-ni `bootstrp/app.go::WithSeeders` funksiyasida ro'yxatdan o'tkazishingiz mumkin. Agar seeder `make:seeder` buyrug'i orqali yaratilgan bo'lsa, framework uni avtomatik ravishda ro'yxatdan o'tkazadi.

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithSeeders(Seeders).
		WithConfig(config.Boot).
		Create()
}

./artisan db:seed --seeder=UserSeeder PhotoSeeder // The signature of seeder
```

Shuningdek, siz ma'lumotlar bazangizni `migrate:fresh` va `migrate:refresh` buyruqlarini `--seed` opsiyasi bilan birgalikda ishlatib, to'ldirishingiz mumkin. Bu barcha jadvallarni o'chirib tashlaydi va barcha migratsiyalaringizni qayta ishga tushiradi. Bu buyruq ma'lumotlar bazangizni to'liq qayta qurish uchun foydalidir. `--seeder` opsiyasi ma'lum bir seeder-ni ishga tushirish uchun ko'rsatish mumkin:

```shell
./artisan migrate:fresh --seed

./artisan migrate:fresh --seed --seeder=UserSeeder

./artisan migrate:refresh --seed

./artisan migrate:refresh --seed --seeder=UserSeeder
```

### Ishlab chiqarish muhitida urug‘chilarni majburiy ishga tushirish

Ba'zi urug'lantirish amallari ma'lumotlarni o'zgartirish yoki yo'qotishga olib kelishi mumkin. "production" muhitida urug'lar bajarilishidan oldin tasdiqlash so'raladi, shunda sizning ishlab chiqarish ma'lumotlar bazangizga urug' buyruqlarini ishga tushirishdan himoya qilinishingiz uchun. Seederlarni so'ralsiz ishga tushirish uchun `--force` bayrog'idan foydalaning:

```shell
./artisan db:seed --force
```
