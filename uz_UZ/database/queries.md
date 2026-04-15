# So'rov Quruvchi

[[toc]]

## Kirish

Ma'lumotlar bazasi so'rovlari quruvchisi ma'lumotlar bazasi so'rovlarini yaratish va bajarish uchun qulay interfeysni taqdim etadi. U ilovangizda ko'p ma'lumotlar bazasi operatsiyalarini bajarish uchun ishlatilishi mumkin va barcha qo'llab-quvvatlanadigan ma'lumotlar bazasi tizimlari bilan ishlaydi.

So'rov quruvchisi SQL in'ektsiyasidan himoya qilish uchun parametr bog'lashdan foydalanadi. So'rov quruvchisiga uzatilgan satrlarni tozalash yoki qochishga hojat yo'q.

## So'rovlarni bajarish

Framework turli xil so'rov usullarini taqdim etadi, siz ma'lumotlar bazasidan ma'lumotlarni so'rashingiz, yaratishingiz, yangilashingiz va o'chirishingiz mumkin. E'tibor bering, ma'lumotlarni `struct` yoki [model](../orm/getting-started.md#model-definition) ga bog'lamoqchi bo'lganingizda, maydonga `db` tegnini qo'shishingiz kerak:

```go
type User struct {
	ID   string `db:"id"`
	Name string `db:"name"`
}

type User struct {
	orm.BaseModel
	orm.NullableSoftDeletes
	Name string `db:"name"`
}
```

### Barcha qatorlarni olish

Siz so'rovni boshlash uchun `facades.DB()` tomonidan taqdim etilgan `table` usulidan foydalanishingiz mumkin. `table` usuli belgilangan jadval uchun zanjirli so'rov quruvchi namunasini qaytaradi, bu sizga qo'shimcha cheklovlarni zanjirlash va natijalarni olish uchun `Get` usulidan foydalanish imkonini beradi:

```go
var users []User
err := facades.DB().Table("users").Get(&users)
```

### Bitta qator yoki ustunni olish

Agar sizga ma'lumotlar bazasi jadvalidan faqat bitta qator ma'lumotlarni olish kerak bo'lsa, siz "First" usulidan foydalanishingiz mumkin.

```go
var user User
err := facades.DB().Table("users").Where("id", 1).First(&user)
```

Bitta ustunning qiymatini olish uchun `Value` usulidan foydalanishingiz mumkin:

```go
var name string
err := facades.DB().Table("users").Where("id", 1).Value("name", &name)
```

Siz `id` ni o'tkazish orqali ma'lumotlarning bitta qatorini olish uchun `Find` usulidan foydalanishingiz mumkin:

```go
var user User
err := facades.DB().Table("users").Find(&user, 1)

// Shuningdek, bir nechta ma'lumot qatorlarini olish uchun id to'plamini o'tkazishingiz mumkin
var users []User
err := facades.DB().Table("users").Find(&users, []int{1, 2, 3})

// Find jadvalning asosiy kalitini sukut bo'yicha id deb belgilaydi, agar jadvalning asosiy kaliti id bo'lmasa, id maydon nomini o'tkazishingiz mumkin
var user User
err := facades.DB().Table("users").Find(&users, "uuid", "1")
```

Agar yozuv topilmasa, `FindOrFail` yoki `FirstOrFail` usulidan foydalanishingiz mumkin, u `sql.ErrNoRows` xatosini chiqaradi:

```go
var user User
err := facades.DB().Table("users").FindOrFail(&user, 1)
```

Agar yozuv topilmasa, `FindOr` yoki `FirstOr` usulidan foydalanishingiz mumkin, u holda yopish funksiyasi bajariladi:

```go
var user *User
err = facades.DB().Table("users").Where("name", "John").FirstOr(&user, func() error {
  return errors.New("no rows")
})
```

### Bitta ustun qiymatini olish

Agar siz bitta ustun qiymatini o'z ichiga olgan yozuvlar ro'yxatini olishni istasangiz, `Pluck` usulidan foydalanishingiz mumkin:

```go
var emails []string
err := facades.DB().Table("users").Pluck("email", &emails)
```

### Natijalarni o'tish

Siz `Each` metodidan barcha natijalarni aylanib o'tish uchun foydalanishingiz mumkin:

```go
var products []Product
err := facades.DB().Table("products").Each(func(rows []db.Row) error {
  for _, row := range rows {
    var product Product
    if err := row.Scan(&product); err != nil {
      return err
    }

    products = append(products, product)
  }

  return nil
})
```

### Chunking natijalari

Agar siz minglab ma'lumotlar bazasi yozuvlarini qayta ishlashingiz kerak bo'lsa, `Chunk` usulidan foydalanishni ko'rib chiqing. Bu usul natijalarni bir vaqtning o'zida kichik qismlarga ajratadi va har bir qismni qayta ishlash uchun yopilish funksiyasiga uzatadi:

```go
var products []Product
err := facades.DB().Table("products").Chunk(2, func(rows []db.Row) error {
  for _, row := range rows {
    var product Product
    if err := row.Scan(&product); err != nil {
      return err
    }

    products = append(products, product)
  }

  return nil
})
```

> Eslatma: Chunk chaqiruvida yozuvlarni o'zgartirish, yozuvlarning chunk natijalariga kiritilmasligiga olib kelishi mumkin.

### Kursor

Kursor barcha ma'lumotlarni bir vaqtning o'zida xotiraga yuklamasdan, katta hajmdagi ma'lumotlarni qayta ishlash uchun ishlatilishi mumkin. U barcha ma'lumotlarni bir vaqtning o'zida yuklash o'rniga, ma'lumotlarni birma-bir qayta ishlaydi.

```go
rows, err := facades.DB().Table("products").Cursor()

var products []Product
for row := range rows {
    var product Product
    if err := row.Scan(&product); err != nil {
      return err
    }

    products = append(products, product)
}
```

### Agregatlar

So'rov quruvchisi quyidagi yig'ish usullarini taqdim etadi: `Count`, `Sum`, `Avg`, `Min`, `Max`.

```go
count, err := facades.DB().Table("users").Count()

var sum int
err := facades.DB().Table("users").Sum("age", &sum)

var avg float64
err := facades.DB().Table("users").Avg("age", &avg)

var min int
err := facades.DB().Table("users").Min("age", &min)

var max int
err := facades.DB().Table("users").Max("age", &max)
```

### Yozuv mavjudligini tekshirish

Siz so'rov shartining natijasi mavjudligini aniqlash uchun `Exists` va `DoesntExist` metodlaridan foydalanishingiz mumkin:

```go
exists, err := facades.DB().Table("users").Where("votes > ?", 100).Exists()

exists, err := facades.DB().Table("users").Where("votes > ?", 100).DoesntExist()
```

### Sahifalash

So'rov natijalarini sahifalash uchun `Paginate` metodidan foydalanishingiz mumkin:

```go
var (
  users []User
  total int64
)

err := facades.DB().Table("users").Where("name", "John").Paginate(1, 10, &users, &total)
```

## Tanlash

Siz har doim ma'lumotlar bazasi jadvalidan barcha ustunlarni olishni xohlamasligingiz mumkin. "Select" so'rov bayonini sozlash uchun `Select` usulidan foydalaning va belgilangan maydonlarni so'rang:

```go
var users []User
err := facades.DB().Table("users").Select("name", "email as user_email").Get(&users)
```

`Distinct` usuli so'rovning noyob natijalarni qaytarishini majbur qiladi:

```go
var users []User
err := facades.DB().Table("users").Distinct().Select("name").Get(&users)
```

## Xom ifodalar

Ba'zan so'rovlaringizda to'g'ridan-to'g'ri ifodalardan foydalanish kerak bo'lishi mumkin. Siz `db.Raw` usulidan foydalanib, xom ifoda yaratishingiz mumkin:

```go
mport "github.com/goravel/framework/database/db"

res, err := facades.DB().Model(&user).Update("age", db.Raw("age - ?", 1))
```

## Tanlash

### Select bandini belgilash

Albatta, siz har doim ma'lumotlar bazasi jadvalidan barcha ustunlarni olishni xohlamasligingiz mumkin. So'rovingiz uchun maxsus tanlash bandini belgilash uchun `Select` usulidan foydalaning:

```go
// Belgilangan maydonlarni tanlash
err := facades.DB().Select("name", "age").Get(&users)

// Subquery-dan foydalanish
err := facades.DB().Select("name", db.Raw("(SELECT COUNT(*) FROM posts WHERE users.id = posts.user_id) as post_count")).Get(&users)
```

### Farqli

`Distinct` usuli so'rovga noyob natijalarni qaytarishni majbur qiladi:

```go
var users []models.User
err := facades.DB().Distinct("name").Find(&users)
```

## Xom usullar

### WhereRaw / OrWhereRaw

`WhereRaw` va `OrWhereRaw` metodlari so'rovga "where" bandlarini bevosita kiritish uchun ishlatilishi mumkin. Ushbu usullar ikkinchi parametr sifatida ixtiyoriy bog'lash massivini qabul qiladi:

```go
var users []User

err := facades.DB().WhereRaw("age = ? or age = ?", []any{25, 30}).Get(&users)

err := facades.DB().OrWhereRaw("age = ? or age = ?", []any{25, 30}).Get(&users)
```

### OrderByRaw

`OrderByRaw` usuli "order by" bandining qiymati sifatida xom satrni o'rnatish uchun ishlatilishi mumkin:

```go
var users []User

err := facades.DB().OrderByRaw("age DESC, id ASC").Get(&users)
```

## Qo'shiladi

### Ichki qo'shilish

So'rov qurilgichini birlashtirish bayonotlarini yozish uchun ishlatish mumkin. "Ichki join" SQL so‘rovini bajarish uchun so‘rov quruvchi namunasidagi `Join` metodidan foydalanishingiz mumkin:

```go
var users []User

err := facades.DB().Table("users").Join("posts as p ON users.id = p.user_id AND p.id = ?", 1).Where("age", 25).Get(&users)
```

### Chap Join / O'ng Join

Agar siz "chap qo'shilish" yoki "o'ng qo'shilish"ni bajarishni istasangiz, `LeftJoin` yoki `RightJoin` usullaridan foydalanishingiz mumkin:

```go
var users []User

err := facades.DB().Table("users").LeftJoin("posts as p ON users.id = p.user_id AND p.id = ?", 1).Where("age", 25).Get(&users)

err = facades.DB().Table("users").RightJoin("posts as p ON users.id = p.user_id AND p.id = ?", 1).Where("age", 25).Get(&users)
```

### Cross Join

`CrossJoin` usuli "cross join"ni bajarish uchun ishlatilishi mumkin:

```go
var users []User

err := facades.DB().Table("users").CrossJoin("posts as p ON users.id = p.user_id AND p.id = ?", 1).Where("age", 25).Get(&users)
```

## Asosiy Where Shartlari

### Qayerda / Yoki Qayerda

Siz so'rov quruvchi namunasi ustida `Where` usulidan foydalanib, so'rovga where bandlarini qo'shishingiz mumkin.

```go
import "github.com/goravel/framework/contracts/database/db"

var users []User

err := facades.DB().Where("votes", 100).Get(&users)

err := facades.DB().Where("votes >= ?", 100).Get(&users)

err := facades.DB().Where("votes LIKE ?", "%goravel%").Get(&users)

err := facades.DB().Where("votes", []int{1, 2, 3}).Get(&users)

err := facades.DB().Where(func(query db.Query) db.Query {
  return query.Where("age", []int{25, 30}).Where("name", "Tom")
}).OrWhere("name", "John").Get(&users)
```

### WhereNot / OrWhereNot

`WhereNot` va `OrWhereNot` metodlari berilgan so'rov shartlar to'plamini inkor qilish uchun ishlatilishi mumkin.

```go
import "github.com/goravel/framework/contracts/database/db"

var users []User

err := facades.DB().WhereNot("votes", 100).Get(&users)

err := facades.DB().WhereNot("votes >= ?", 100).Get(&users)

err := facades.DB().WhereNot("votes LIKE ?", "%goravel%").Get(&users)

err := facades.DB().WhereNot("votes", []int{1, 2, 3}).Get(&users)

err := facades.DB().WhereNot(func(query db.Query) db.Query {
  return query.Where("age", []int{25, 30}).Where("name", "Tom")
}).OrWhereNot("name", "John").Get(&users)
```

### Mavjud bo‘lgan joy / Mavjud bo‘lmagan joy

`WhereExists` usuli sizga mavjud SQL bandlarini yozish imkonini beradi:

```go
var users []User

err := facades.DB().Table("users").Where("name", "John").WhereExists(func() db.Query {
  return facades.DB().Table("posts").WhereColumn("posts.user_id", "users.id")
}).Get(&users)
```

### WhereAll / WhereAny / WhereNone

```go
var products []Product
facades.DB().Table("products").WhereAll([]string{"weight", "height"}, "=", 200).Find(&products)
// SQL: SELECT * FROM products WHERE weight = ? AND height = ?

var users []User
facades.DB().Table("users").WhereAny([]string{"name", "email"}, "=", "John").Find(&users)
// SQL: SELECT * FROM users WHERE (name = ? OR email = ?)

var products []Product
facades.DB().Table("products").WhereNone([]string{"age", "score"}, ">", 18).Find(&products)
// SQL: SELECT * FROM products WHERE NOT (age > ?) AND NOT (score > ?)
```

### Boshqa Where bandlari

**WhereBetween / OrWhereBetween**

`WhereBetween` usuli maydon qiymati berilgan ikki qiymat orasida ekanligini tekshiradi:

```go
facades.DB().Table("users").WhereBetween("votes", 1, 100)
```

**WhereNotBetween / OrWhereNotBetween**

`WhereNotBetween` usuli maydon qiymati berilgan ikki qiymat oralig'ida emasligini tekshiradi:

```go
facades.DB().Table("users").WhereNotBetween("votes", 1, 100)
```

**WhereIn / WhereNotIn / OrWhereIn / OrWhereNotIn**

`WhereIn` usuli maydon qiymati belgilangan massivda mavjud bo'lishi kerakligini tekshiradi:

```go
facades.DB().Table("users").WhereIn("id", []any{1, 2, 3})
```

**WhereNull / WhereNotNull / OrWhereNull / OrWhereNotNull**

`WhereNull` usuli belgilangan maydon `NULL` bo'lishi kerakligini tekshiradi:

```go
facades.DB().Table("users").WhereNull("updated_at")
```

**WhereLike / WhereNotLike / OrWhereLike / OrWhereNotLike**

`WhereLike` usuli maydon qiymati berilgan qiymatni o'z ichiga olishini tekshiradi:

```go
facades.DB().Table("users").WhereLike("name", "%goravel%")
```

**WhereColumn / OrWhereColumn**

`WhereColumn` usuli ikki maydonning tengligini tekshiradi:

```go
facades.DB().Table("users").WhereColumn("first_name", "last_name")
```

### Mantiqiy guruhlash

Ba'zan so'rovingiz uchun zarur bo'lgan mantiqiy guruhlashni amalga oshirish uchun bir nechta "where" bandlarini qavs ichida guruhlashingiz kerak bo'lishi mumkin.

```go
facades.DB().Table("users").Where("age", 25).Where(func(query db.Query) db.Query {
  return query.Where("votes", 100).OrWhere("votes", 200)
})
```

## Buyurtma berish, Guruhlash, Cheklash va O‘tkazib yuborish

### Tartiblash

**OrderBy / OrderByDesc**

```go
facades.DB().OrderBy("name")

facades.DB().OrderByDesc("name")
```

**Oxirgi**

`Latest` usuli natijalarni sana bo'yicha tartiblashni osonlashtiradi. Standart bo‘yicha, natijalar `created_at` ustuni bo‘yicha tartiblanadi:

```go
err := facades.DB().Table("users").Latest().First(&user)

err := facades.DB().Table("users").Latest("updated_at").First(&user)
```

**InRandomOrder**

`InRandomOrder` usuli natijalarni tasodifiy tartiblash uchun ishlatiladi:

```go
err := facades.DB().Table("users").InRandomOrder().First(&user)
```

### Guruhlash

`GroupBy` va `Having` usullari natijalarni guruhlash uchun ishlatilishi mumkin:

```go
err := facades.DB().Table("users").Where("age", 25).GroupBy("name").Having("name = ?", "John").OrderBy("name").Get(&users)
```

### Cheklash va O‘tkazib yuborish

Natijalar sonini cheklash yoki so'rovda belgilangan natijalar sonini o'tkazib yuborish uchun `Limit` va `Offset` metodlaridan foydalanishingiz mumkin:

```go
err := facades.DB().Table("users").Offset(10).Limit(5).Get(&users)
```

## Shartli bandlar

Ba'zan siz berilgan shart to'g'ri bo'lganda faqat bir band bajarilishini xohlashingiz mumkin. Masalan, siz faqat so'rovda berilgan qiymat mavjud bo'lganda "where" bandini qo'llashni xohlashingiz mumkin. Buni `When` usuli yordamida amalga oshirishingiz mumkin:

```go
import "github.com/goravel/framework/contracts/database/db"

err := facades.DB().Table("users").When(1 == 1, func(query db.Query) db.Query {
  return query.Where("age", 25)
}).First(&user)
```

Shuningdek, siz `When` metodining uchinchi parametri sifatida boshqa yopilishni ham o'tkazishingiz mumkin. Agar birinchi parametr yolg‘on bo‘lsa, bu yopilish bajariladi:

```go
err := facades.DB().Table("users").When(1 != 1, func(query db.Query) db.Query {
  return query.OrderBy("name")
}, func(query db.Query) db.Query {
  return query.OrderBy("id")
}).First(&user)
```

## Kiritish

So'rov quruvchisi ma'lumotlar bazasiga yozuvlarni kiritish uchun `Insert` usulini taqdim etadi:

```go
// Struktura orqali kiritish
result, err := facades.DB().Table("products").Insert(Product{
  Name: "goravel",
})

// Strukturalar qatori orqali kiritish
result, err := facades.DB().Table("products").Insert([]Product{
  {
    Name: "goravel",
  },
  {
    Name: "go",
  },
})

// Xarita orqali kiritish
result, err := facades.DB().Table("products").Insert(map[string]any{
  "name": "goravel",
  "created_at": time.Now(),
  "updated_at": time.Now(),
})

// Xaritalar qatori orqali kiritish
result, err := facades.DB().Table("products").Insert([]map[string]any{
  {
    "name": "goravel",
    "created_at": time.Now(),
    "updated_at": time.Now(),
  },
  {
    "name": "go",
    "created_at": time.Now(),
    "updated_at": time.Now(),
  },
})
```

### Avtomatik oshiruvchi ID

Agar jadvalning asosiy kaliti avtomatik oshiriladigan bo'lsa, avtomatik oshirilgan IDni olish uchun `LastInsertID` usulidan foydalanishingiz mumkin, bu faqat `mysql` va `sqlite` ma'lumotlar bazalari uchun qo'llab-quvvatlanadi:

```go
id, err := facades.DB().Table("products").InsertGetID(Product{
  Name: "goravel",
})
```

## Yangilash

So'rov quruvchisi ma'lumotlar bazasidagi mavjud yozuvlarni yangilash uchun `Update` usulini taqdim etadi:

```go
// Maydon nomi bo'yicha yangilash
result, err := facades.DB().Table("products").Where("id", 1).Update("phone", "1234567890")

// Struktura bo'yicha yangilash
result, err := facades.DB().Table("products").Where("id", 1).Update(Product{
  Name: "goravel",
})

// Xarita bo'yicha yangilash
result, err := facades.DB().Table("products").Where("id", 1).Update(map[string]any{
  "name": "goravel",
  "created_at": time.Now(),
  "updated_at": time.Now(),
})
```

### JSON maydonlarini yangilang

```go
result, err := facades.DB().Table("users").Where("id", 1).Update("options->enabled", true)
result, err := facades.DB().Table("users").Where("id", 1).Update("options->languages[0]", "en")
result, err := facades.DB().Table("users").Where("id", 1).Update("options->languages", []string{"en", "de"})
result, err := facades.DB().Table("users").Where("id", 1).Update(map[string]any{
    "preferences->dining->meal": "salad",
    "options->languages[0]":     "en",
    "options->enabled":          true,
})
```

### Yangilash yoki qo'shish

Ba'zan siz ma'lumotlar bazasidagi yozuvni yangilamoqchi bo'lishingiz mumkin, lekin agar ko'rsatilgan yozuv mavjud bo'lmasa, uni yarating. Bu `UpdateOrInsert` usuli yordamida amalga oshirilishi mumkin. `UpdateOrInsert` usuli ikki parametrni qabul qiladi: yozuvni topish uchun shart va yozuvni yangilash uchun qiymatlarni o'z ichiga olgan kalit-qiymat juftligi.

`UpdateOrInsert` usuli birinchi parametrdagi ustun nomlari va qiymatlari yordamida mos keladigan ma'lumotlar bazasi yozuvini topishga harakat qiladi. Agar yozuv mavjud bo'lsa, uning qiymatlari ikkinchi parametr yordamida yangilanadi. Agar mos yozuv topilmasa, yozuv yaratiladi va uning qiymatlari ikki parametrdan birlashtiriladi:

```go
// struct-dan foydalanish
result, err := facades.DB().Table("users").Where("id", 1).UpdateOrInsert(TestUser{
  Email: "john@example.com",
}, TestUser{
  Phone: "1234567890",
})

// map-dan foydalanish
result, err := facades.DB().Table("users").Where("id", 1).UpdateOrInsert(map[string]any{
  "email": "john@example.com",
}, map[string]any{
  "phone": "1234567890",
})
```

### Oshirish va Kamaytirish

`Increment` va `Decrement` metodlari belgilangan maydon qiymatini oshirish yoki kamaytirish uchun ishlatilishi mumkin:

```go
err := facades.DB().Table("users").Where("id", 1).Increment("votes")

err := facades.DB().Table("users").Where("id", 1).Increment("votes", 2)

err := facades.DB().Table("users").Where("id", 1).Decrement("votes")

err := facades.DB().Table("users").Where("id", 1).Decrement("votes", 2)
```

## O‘chirish

So'rov quruvchisi shuningdek, sizning `select` gaplaringizda "pessimistik qulflash"ni amalga oshirishingizga yordam beradigan ba'zi funksiyalarni o'z ichiga oladi:

```go
natija, xato := facades.DB().Table("users").Where("id", 1).Delete()
```

## Pessimistik blokirovka

So'rov quruvchisi, shuningdek, sizning `select` bayonotlaringizda "pessimistik qulflash"ni amalga oshirishga yordam beradigan ba'zi funksiyalarni o'z ichiga oladi:

"Umumiy qulflash"dan foydalanish uchun siz `SharedLock` usulidan foydalanishingiz mumkin. "Umumiy qulf" tanlangan qatorlar transaksiya tasdiqlanmaguncha o'zgartirilishiga yo'l qo'ymaydi:

```go
err := facades.DB().Table("users").Where("ovozlar > ?", 100).SharedLock().Get(&users)
```

Shuningdek, siz `LockForUpdate` usulidan foydalanishingiz mumkin. "Yangilash" qulfidan foydalanish qatorlarni boshqa umumiy qulf tomonidan o'zgartirilishiga yoki tanlanishiga to'sqinlik qilishi mumkin:

```go
err := facades.DB().Table("users").Where("votes > ?", 100).LockForUpdate().Get(&users)
```

## Debuglash

Joriy so'rovni bog'lash va SQLni olish uchun `ToSQL` va `ToRawSql` usullaridan foydalanishingiz mumkin.

SQL joylashtirgich bilan:

```go
err := facades.DB().Table("users").Where("id", 1).ToSql().Get(models.User{})
```

SQL bilan bog'langan qiymatlar:

```go
err := facades.DB().Table("users").Where("id", 1).ToRawSql().Get(models.User{})
```

`ToSql` va `ToRawSql` dan keyin chaqirilishi mumkin bo'lgan metodlar: `Count`, `Insert`, `Delete`, `First`, `Get`, `Pluck`, `Update`.
