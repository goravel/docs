# Migratsiyalar

[[toc]]

## Kirish

Bir necha odam ilovalarni ishlab chiqishda hamkorlik qilganda, sinxronizatsiya uchun standartlashtirilgan ma'lumotlar bazasi tuzilishiga ega bo'lish juda muhimdir. Bunisiz, har bir kishining individual ma'lumotlari mos kelmasligi sababli tartibsizlik yuzaga kelishi mumkin. Ma'lumotlar bazasi migratsiyasi bu muammoning yechimidir. Ma'lumotlar bazasi tuzilishi versiyalarni boshqarish orqali barcha ishlab chiquvchilar orasida uning izchilligini ta'minlash uchun nazorat qilinadi.

## Konfiguratsiya

Ma'lumotlar bazasi migratsiya fayllari `database/migrations` katalogida saqlanadi. Siz `config/database.go` faylida ma'lumotlar bazasi ulanish ma'lumotlarini sozlashingiz mumkin.

```go
"migratsiyalar": map[string]any{
  // Siz migratsiyalar jadvalining nomini o'zgartirishingiz mumkin
  "table":  "migratsiyalar",
}
```

## Migratsiyalarni yaratish

Migratsiyani yaratish uchun `make:migration` buyrug'idan foydalaning:

```shell
./artisan make:migration
./artisan make:migration create_users_table
```

Bu buyruq `database/migrations` katalogida migratsiya fayllarini yaratadi. Har bir migratsiya fayli vaqt belgisi bilan boshlanadi, Goravel migratsiya fayllarini bajarish tartibini aniqlash uchun undan foydalanadi.

Shuningdek, siz `-m` yoki `--model` opsiyasidan foydalanib, ma'lum bir model uchun migratsiya yaratishingiz mumkin:

```shell
./artisan make:migration create_users_table -m User
```

Model buyrug'ni ishga tushirishdan oldin `bootstrap/app.go` faylida ro'yxatdan o'tkazilishi kerak. Bu buyruq `User` modelida belgilangan tuzilish asosida migratsiya faylini yaratadi.

```go
func Boot() contractsfoundation.Application {
  return foundation.Setup().
    WithConfig(config.Boot).
    WithCallback(func() {
      facades.Schema().Extend(schema.Extension{
        Models: []any{models.User{}},
      })
    }).
    Create()
}
```

### Tez yaratish

`create_users_table` dan foydalanib, `users` jadvalining infratuzilmasini o'z ichiga olgan jadvalni avtomatik yarating:

```
^create_(\w+)_table$
^create_(\w+)$
```

`users` jadvaliga maydonlar qo'shish uchun tuzilmani avtomatik yaratish uchun `add_avatar_to_users_table` dan foydalaning:

```
_(to|from|in)_(\w+)_table$
_(to|from|in)_(\w+)$
```

Yuqoridagi shartlar bajarilmagan taqdirda, framework bo‘sh migratsiya faylini yaratadi.

## Migratsiya tuzilmasi

### Go Tili Migratsiyasi

Migratsiya strukturasida ikkita metod mavjud: `Up` va `Down`. `Up` usuli ma'lumotlar bazasiga yangi jadvallar, ustunlar yoki indekslar qo'shish uchun ishlatiladi, `Down` usuli esa `Up` usuli tomonidan bajarilgan amallarni bekor qilish uchun ishlatiladi. Ushbu ikki usulda siz `facades.Schema()` yordamida ma'lumotlar bazasi jadvallarini yaratish va boshqarish mumkin. Mavjud usullar uchun [hujjat](#jadvallar)ga qarang. Quyidagi migratsiya `users` jadvalini yaratadi:

```go
migratsiyalar paketi

import (
	"github.com/goravel/framework/contracts/database/schema"
	
  "goravel/app/facades"
)

type M20241207095921CreateUsersTable struct {
}

// Imzo Migratsiyaning noyob imzosi.
func (r *M20241207095921CreateUsersTable) Signature() string {
	return "20241207095921_create_users_table"
}

// Yuqoriga Migratsiyalarni ishga tushiring.
func (r *M20241207095921CreateUsersTable) Up() error {
	if !facades.Schema().HasTable("users") {
		return facades.Schema().Create("users", func(table schema.Blueprint) {
			table.ID()
			table.String("name").Nullable()
			table.String("email").Nullable()
			table.Timestamps()
		})
	}

	return nil
}

// Pastga Migratsiyalarni teskari aylantiring.
func (r *M20241207095921CreateUsersTable) Down() error {
	return facades.Schema().DropIfExists("users")
}
```

#### Migratsiya ulanishini o'rnatish

Agar migratsiya ilovaning standart ma'lumotlar bazasi ulanishidan boshqa ma'lumotlar bazasi ulanishi bilan o'zaro ta'sirlashsa, siz migratsiyaning `Connection` metodidan foydalanishingiz kerak:

```go
func (r *M20241207095921CreateUsersTable) Connection() string {
  return "connection-name"
}
```

## Migratsiyalarni ro'yxatdan o'tkazish

`make:migration` tomonidan yaratilgan yangi migratsiya `bootstrap/migrations.go::Migrations()` funksiyasida avtomatik ravishda ro'yxatga olinadi va funksiya `WithMigrations` tomonidan chaqiriladi. Agar siz migratsiya faylini o'zingiz yaratsangiz, qoidani qo'lda ro'yxatdan o'tkazishingiz kerak.

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithMigrations(Migrations).
		WithConfig(config.Boot).
		Create()
}
```

## Migratsiyalarni ishga tushirish

Barcha qoldirilgan migratsiyalaringizni ishga tushirish uchun `migrate` Artisan buyrug'ini bajaring:

```shell
./artisan migrate
```

Agar hozirgacha qaysi migratsiyalar ishlaganini ko'rmoqchi bo'lsangiz, `migrate:status` Artisan buyrug'idan foydalanishingiz mumkin:

```shell
./artisan migrate:status
```

## Migratsiyalarni Orqaga Qaytarish

Oxirgi migratsiya to'plamini orqaga qaytarish uchun `rollback` Artisan buyrug'idan foydalaning:

```shell
./artisan migrate:rollback
```

Agar siz bir nechta migratsiya to'plamlarini orqaga qaytarmoqchi bo'lsangiz, `batch` opsiyasini belgilashingiz mumkin, raqam qaysi to'plamni orqaga qaytarish kerakligini ko'rsatadi:

```shell
./artisan migrate:rollback --batch=2
```

Siz `rollback` buyrug'iga `step` opsiyasini berib, cheklangan migratsiyalarni qaytarishingiz mumkin. Masalan, quyidagi buyruq oxirgi beshta migratsiyani orqaga qaytaradi:

```shell
./artisan migrate:rollback --step=5
```

`migrate:reset` buyrug'u ilovangizning barcha migratsiyalarini orqaga qaytaradi:

```shell
./artisan migrate:reset
```

### Bitta buyruq yordamida orqaga qaytarish va migratsiya qilish

`migrate:refresh` buyrug'i barcha migratsiyalaringizni orqaga qaytaradi va keyin `migrate` buyrug'ini bajaradi. Bu buyruq sizning butun ma'lumotlar bazangizni samarali ravishda qayta yaratadi:

```shell
./artisan migrate:refresh
```

Siz `refresh` buyrug'iga `step` opsiyasini berib, cheklangan migratsiyalarni orqaga qaytarish va qayta migratsiya qilishingiz mumkin. Masalan, quyidagi buyruq oxirgi besh migratsiyani orqaga qaytaradi va qayta migratsiya qiladi:

```shell
./artisan migrate:refresh --step=5
```

### Barcha Jadval va Migratsiyalarni O'chirish

`migrate:fresh` buyrug'i ma'lumotlar bazasidagi barcha jadvallarni o'chirib tashlaydi va keyin `migrate` buyrug'ini bajaradi:

```shell
./artisan migrate:fresh
```

## Jadvallar

### Jadval yaratish

```go
facades.Schema().Create("users", func(table schema.Blueprint) {
  table.ID()
  table.String("name").Nullable()
  table.String("email").Nullable()
  table.Timestamps()
})
```

### Jadval / Ustun Mavjudligini Tekshirish

```go
if facades.Schema().HasTable("users") {}
if facades.Schema().HasColumn("users", "email") {}
if facades.Schema().HasColumns("users", []string{"name", "email"}) {}
if facades.Schema().HasIndex("users", "email_unique") {}
```

### Ma'lumotlar bazasi ulanishi

```go
facades.Schema().Connection("sqlite").Create("users", func(table schema.Blueprint) {
  table.ID()
})
```

### Jadvalni yangilash

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.String("name").Nullable()
})
```

### Ustun nomini o'zgartirish

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.RenameColumn("old_name", "new_name")
})
```

### Jadval izohini qo'shish

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.Comment("user table")
})
```

### Jadvalni qayta nomlash / O‘chirish

```go
facades.Schema().Rename("users", "new_users")
facades.Schema().Drop("users")
facades.Schema().DropIfExists("users")
```

## Ustunlar

### Mavjud ustun turlari

#### Mantiqiy turlar

Mantiqiy

#### Satr va matn turlari

Char, Json, LongText, MediumText, String, Text, LongText, TinyText, Uuid, Ulid

#### Raqamli turlar

BigIncrements, BigInteger, Decimal, Double, Float, [ID](#id), Increments, Integer, IntegerIncrements, MediumIncrements, MediumInteger, SmallIncrements, SmallInteger, TinyIncrements, TinyInteger, UnsignedBigInteger, UnsignedInteger, UnsignedMediumInteger, UnsignedSmallInteger, UnsignedTinyInteger

#### Sana va Vaqt Turlari

Sana, SanaVaqt, SanaVaqtTz, [YumshoqO'chirishlar](#yumşoq-o-chirishlar), YumshoqO'chirishlarTz, Vaqt, VaqtTz, VaqtBelgisi, VaqtBelgisiTz, VaqtBelgilari, VaqtBelgilariTz

#### Boshqa turlar

[Enum](#enum), Morflar, NullableMorflar, NumericMorflar, UuidMorflar, UlidMorflar

#### Enum

`[]any` turidagi bo‘yicha `Mysql` da saqlanishi mumkin bo‘lgan `Enum` maydonini yarating, lekin `Postgres`, `Sqlite` va `Sqlserver` ma’lumotlar bazalarida u `String` turidir.

```go
table.Enum("qiyinlik", []any{"oson", "qiyin"})
table.Enum("raqam", []any{1, 2})
```

#### ID

`ID` usuli `BigIncrements` usulining taxallusidir. Standart holda, ushbu usul `id` ustunini yaratadi; ammo, agar siz ustunga boshqa nom berishni istasangiz, ustun nomini o'tkazishingiz mumkin:

```go
jadval.ID()
jadval.ID("foydalanuvchi_id")
```

#### Yumşoq o'chirishlar

`SoftDeletes` usuli `deleted_at` `TIMESTAMP` ustunini qo‘shadi. Bu ustun Orm "yumshoq o'chirish" funksiyasi uchun zarur bo'lgan `deleted_at` vaqt belgisini saqlash uchun mo'ljallangan:

```go
table.SoftDeletes()
```

#### Maxsus ustun

Agar siz freymvork hali qo'llab-quvvatlamaydigan ustun turlaridan foydalanayotgan bo'lsangiz, maydon turini sozlash uchun `Column` metodidan foydalanishingiz mumkin:

```go
table.Column("geometriya", "geometriya")
```

### Ustun modifikatorlari

Yuqorida keltirilgan ustun turlaridan tashqari, ma'lumotlar bazasi jadvaliga ustun qo'shganda, siz shuningdek, ustunga "modifikatorlar" qo'shishingiz mumkin. Masalan, ustunni "null qiymat qabul qiluvchi" qilish uchun `Nullable` metodidan foydalanishingiz mumkin:

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.String("name").Nullable()
})
```

Quyidagi jadvalda barcha mavjud ustun modifikatorlari keltirilgan:

| O'zgartirilgan                                 | Tavsif                                                                                                                                                                                                      |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.Har doim()`                                  | Ushbu ustunning qiymati har doim ma'lumotlar bazasi tizimi tomonidan yaratiladi va foydalanuvchilar uni to'g'ridan-to'g'ri kiritish yoki o'zgartirishlari mumkin emas (faqat PostgreSQL) |
| `.AutoIncrement()`                             | Butun sonli ustunni avtomatik o'sish (asosiy kalit) sifatida belgilaydi                                                                                                                  |
| `.After("ustun")`                              | Belgilangan ustundan keyingi ustunni o‘rnatadi (faqat MySQL)                                                                                                                             |
| `.Comment("mening izohim")`                    | Ustunga izoh qo'shadi (MySQL / PostgreSQL)                                                                                                                                               |
| \`.Change() | Ustun tuzilishini o'zgartirish (MySQL / PostgreSQL / Sqlserver)                                                                                                                          |
| `.Default(value)`                              | Ustunning standart qiymatini belgilaydi                                                                                                                                                                     |
| `.First()`                                     | Ustunni birinchi ustun sifatida belgilaydi (faqat MySQL)                                                                                                                                 |
| `.GeneratedAs()`                               | Ushbu ustunning qiymatini ma'lumotlar bazasi tizimi tomonidan yaratilishi uchun belgilaydi (faqat PostgreSQL)                                                                            |
| `.Nullable()`                                  | Ustunga NULL qiymatlarni kiritishga ruxsat beradi                                                                                                                                                           |
| `.Unsigned()`                                  | Butun sonli ustunni UNSIGNED qilib belgilaydi (faqat MySQL uchun)                                                                                                                        |
| `.UseCurrent()`                                | Jadval ustuniga standart qiymat sifatida CURRENT_TIMESTAMP ni belgilaydi                                                                                                               |
| `.UseCurrentOnUpdate()`                        | Yozuv yangilanganda CURRENT_TIMESTAMP dan foydalanish uchun vaqt belgisi ustunini belgilaydi (faqat MySQL)                                                          |

### Ustunni tashlash

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.DropColumn("name")
  table.DropColumn("name", "age")
})
```

## Indekslar

### Indeks yaratish

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  // Asosiy kalitni qo'shish
  table.Primary("id")
  // Kompozit asosiy kalitni qo'shish
  table.Primary("id", "name")

  // Yagona indeksni qo'shish
  table.Unique("name")
  table.Unique("name", "age")

  // Oddiy indeksni qo'shish
  table.Index("name")
  table.Index("name", "age")

  // To'liq matn indeksini qo'shish
  table.FullText("name")
  table.FullText("name", "age")
})
```

### Indeksni nomini o'zgartirish

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.RenameIndex("users_name_index", "users_name")
})
```

### Indeksni tashlash

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.DropPrimary("id")
  table.DropUnique("name")
  table.DropUniqueByName("name_unique")
  table.DropIndex("name")
  table.DropIndexByName("name_index")
  table.DropFullText("name")
  table.DropFullTextByName("name_fulltext")
})
```

### Tashqi kalit yaratish

```go
facades.Schema().Table("posts", func(table schema.Blueprint) {
  table.UnsignedBigInteger("user_id")
  table.Foreign("user_id").References("id").On("users")
})
```

### Tashqi kalitni olib tashlash

```go
facades.Schema().Table("users", func(table schema.Blueprint) {
  table.DropForeign("user_id")
  table.DropForeignByName("user_id_foreign")
})
```
