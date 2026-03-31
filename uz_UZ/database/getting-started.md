# Boshlash

[[toc]]

## Kirish

Deyarli barcha ilovalar ma'lumotlar bazalari bilan o'zaro aloqada bo'lishi kerak, shuning uchun Goravel juda oddiy va qulay ma'lumotlar bazasi o'zaro aloqasini taqdim etadi. Dasturchilar ma'lumotlar bazalari bilan ishlash uchun native SQL, so'rov quruvchi va [Orm](../orm/getting-started) dan foydalanishlari mumkin. Hozirda Goravel quyidagi to'rtta ma'lumotlar bazasini rasmiy qo'llab-quvvatlaydi:

| Ma'lumotlar bazasi | Haydovchi                                                                            |
| ------------------ | ------------------------------------------------------------------------------------ |
| PostgreSQL         | [github.com/goravel/postgres](https://github.com/goravel/postgres)   |
| MySQL              | [github.com/goravel/mysql](https://github.com/goravel/mysql)         |
| SQL Server         | [github.com/goravel/sqlserver](https://github.com/goravel/sqlserver) |
| SQLite             | [github.com/goravel/sqlite](https://github.com/goravel/sqlite)       |

## Konfiguratsiya

Ma'lumotlar bazasi konfiguratsiya fayli `config/database.go` faylidir. Siz ushbu faylda barcha ma'lumotlar bazasi ulanishlarini sozlashingiz va standart ma'lumotlar bazasi ulanishini belgilashingiz mumkin. Ushbu fayldagi konfiguratsiyaning aksariyati loyihaning muhit o'zgaruvchilari asosida qurilgan.

### Ulanish havzasi

Siz konfiguratsiya faylida ma'lumotlar bazasi ulanish havzasini sozlashingiz mumkin, bu esa ulanish havzasi parametrlarini to'g'ri sozlash orqali bir vaqtning o'zida ishlash samaradorligini oshirishga yordam beradi:

| Konfiguratsiya kaliti                                                            | Tavsif                            |
| -------------------------------------------------------------------------------- | --------------------------------- |
| pool.max_idle_conns    | Maksimal bo‘sh ulanishlar         |
| pool.max_open_conns    | Maksimal ulanishlar               |
| pool.conn_max_idletime | Ulanishning maksimal ishsiz vaqti |
| pool.conn_max_lifetime | Ulanishning maksimal umri         |

### O‘qish-yozishni ajratish

Ba'zan siz `SELECT` so'rovlarini bajarish uchun ma'lumotlar bazasi ulanishidan foydalanishingiz mumkin, shu bilan birga `INSERT`, `UPDATE` va `DELETE` so'rovlari boshqa ma'lumotlar bazasi ulanishi tomonidan bajarilishi mumkin. Goravelda o'qish-yozishni ajratishni amalga oshirish oson.

```go
import "github.com/goravel/framework/contracts/database"

// config/database.go
"connections": map[string]any{
  "mysql": map[string]any{
    "driver": "mysql",
    "read": []database.Config{
      {Host: "192.168.1.1", Port: 3306, Database: "forge", Username: "root", Password: "123123"},
    },
    "write": []database.Config{
      {Host: "192.168.1.2", Port: 3306, Database: "forge", Username: "root", Password: "123123"},
    },
    "host": config.Env("DB_HOST", "127.0.0.1"),
    "port":     config.Env("DB_PORT", 3306),
    "database": config.Env("DB_DATABASE", "forge"),
    "username": config.Env("DB_USERNAME", ""),
    "password": config.Env("DB_PASSWORD", ""),
    "charset":  "utf8mb4",
  },
}
```

Biz ma'lumotlar bazasi konfiguratsiyasida `read` va `write` nomli ikkita kalit qo'shdik. `192.168.1.1` "o'qish" ulanishi uchun xost sifatida ishlatiladi, `192.168.1.2` esa "yozish" ulanishi uchun xost sifatida ishlatiladi. Bu ikki ulanish "mysql" massividagi ma'lumotlar bazasi prefiksi va belgilar kodlash kabi konfiguratsiyalarni baham ko'radi. Agar `read` yoki `write` massivlarida bir nechta qiymatlar bo'lsa, Goravel har bir ulanish uchun ma'lumotlar bazasi xostini tasodifiy tanlaydi.

## Asl SQL so'rovlarini ishga tushirish

Ma'lumotlar bazasi ulanishini sozlashdan so'ng, so'rovlarni bajarish uchun `facades.DB()` dan foydalanishingiz mumkin. `facades.DB()` turli xil so'rovlarni bajarish uchun bir qancha usullarni taqdim etadi: `Select`, `Insert`, `Update`, `Delete` va `Statement`.

### Tanlash

Oddiy so'rovlarni bajarish uchun `facades.DB().Select()` usulidan foydalaning:

```go
// Get multiple records
var products []Product
err := facades.DB().Select(&products, "SELECT * FROM products")

// Get a single record
var product Product
err := facades.DB().Select(&product, "SELECT * FROM products WHERE id = ?", 1)
```

> Eslatma: Turli ma'lumotlar bazasi drayverlari turli joy egallovchilarni talab qiladi. Masalan, `?` belgisi MySQL uchun, `@` belgisi esa PostgreSQL uchun ishlatiladi.

### Kiritish

"facades.DB().Insert()" usulidan foydalanib, kiritish bayonotlarini bajarish uchun:

```go
result, err := facades.DB().Insert("insert into users (name, email) values (?, ?)", "Goravel", "goravel@example.com")
```

### Yangilash

Yangilash bayonotlarini bajarish uchun `facades.DB().Update()` usulidan foydalaning:

```go
result, err := facades.DB().Update("update users set name = ? where id = ?", "Goravel", 1)
```

### O‘chirish

O'chirish bayonotlarini bajarish uchun `facades.DB().Delete()` usulidan foydalaning:

```go
result, err := facades.DB().Delete("delete from users where id = ?", 1)
```

### Bayonot

Umumiy bayonotlarni bajarish uchun `facades.DB().Statement()` usulidan foydalaning:

```go
err := facades.DB().Statement("drop table users")
```

### Bir nechta ma'lumotlar bazasi ulanishlaridan foydalanish

Agar konfiguratsiya faylida bir nechta ma'lumotlar bazasi ulanishlarini belgilasangiz, `facades.DB().Connection()` usulini chaqirish orqali foydalaniladigan ulanishni ko'rsatishingiz mumkin:

```go
var user User
err := facades.DB().Connection("postgres").Select(&user, "select * from users where id = ?", 1)
```

## Ma'lumotlar bazasi tranzaksiyalari

Siz ma'lumotlar bazasi transaksiyasida bir qator operatsiyalarni bajarish uchun `facades.DB().Transaction()` usulidan foydalanishingiz mumkin. Agar tranzaksiya yopilishida istisno yuzaga kelsa, tranzaksiya avtomatik ravishda orqaga qaytariladi. Agar yopilish muvaffaqiyatli bajarilsa, tranzaksiya avtomatik ravishda tasdiqlanadi:

```go
mport "github.com/goravel/framework/contracts/database/db"

err := facades.DB().Transaction(func(tx db.Tx) error {
  _, err := tx.Table("products").Insert(Product{Name: "transaction product1"})

  return err
})
```

### Qo‘lda Tranzaksiyalardan Foydalanish

Agar siz tranzaksiyaning boshlanishi, tasdiqlanishi va bekor qilinishini qo'lda boshqarishni istasangiz, `Begin`, `Commit` va `Rollback` metodlaridan foydalanishingiz mumkin:

```go
tx, err := facades.DB().BeginTransaction()
if err != nil {
  return err
}

_, err = tx.Insert("insert into users (name) values (?)", "Goravel")
if err != nil {
  tx.Rollback()
  return err
}

err = tx.Commit()
if err != nil {
  return err
}
```

## Ma'lumotlar bazalarini tekshirish

### Ma'lumotlar bazasi haqida umumiy ma'lumot

Goravel ma'lumotlar bazasining tuzilishini tushunishga yordam beradigan bir nechta Artisan buyruqlarini taqdim etadi.

Siz ma'lumotlar bazasidagi barcha jadvallarni ko'rish uchun `db:show` buyrug'idan foydalanishingiz mumkin.

```bash
./artisan db:show
./artisan db:show --database=postgres
```

Shuningdek, siz ma'lum bir jadvalning tuzilishini ko'rish uchun `db:table` buyrug'idan foydalanishingiz mumkin.

```bash
./artisan db:table
./artisan db:table --database=postgres
```

### Jadvalga umumiy nazar

Agar ma'lumotlar bazasidagi bitta jadvalni umumiy ko'rinishini olishni istasangiz, `db:table` Artisan buyrug'ini bajarishingiz mumkin. Bu buyruq ma'lumotlar bazasi jadvalining umumiy ko'rinishini taqdim etadi, jumladan uning ustunlari, turlari, atributlari, kalitlari va indekslari:

```bash
./artisan db:table users
./artisan db:table users --database=postgres
```
