# Boshlash

[[toc]]

## Kirish

Goravel juda oddiy va oson ishlatiladigan ma'lumotlar bazasi o'zaro ta'sirini taqdim etadi, dasturchilar `facades.Orm()` yordamida amallarni bajarishlari mumkin. Boshlashdan oldin [Ma'lumotlar bazasini sozlash](../database/getting-started) bo'limiga murojaat qiling.

## Model ta'rifi

Maxsus model yaratish uchun, freymvorkda keltirilgan `app/models/user.go` model fayliga murojaat qiling. `app/models/user.go` faylidagi `struct` ikkita o'rnatilgan freymvorkni o'z ichiga oladi: `orm.Model` va `orm.SoftDeletes`. Ushbu freymvorklar mos ravishda `id`, `created_at`, `updated_at` va `deleted_at` xususiyatlarini aniqlaydi. `orm.SoftDeletes` yordamida model uchun yumshoq o'chirishni yoqishingiz mumkin.

### Model konventsiyasi

1. Model katta orqa qopqoq (PascalCase) bilan nomlanadi;
2. Modelning ko'plik shakli "iloncha nomlash" (snake_case) jadval nomi sifatida ishlatiladi;

Misol uchun, model nomi `UserOrder` bo'lsa, jadval nomi `user_orders` bo'ladi.

### Model yaratish

Model yaratish uchun `make:model` buyrug'idan foydalaning:

```shell
./artisan make:model User
./artisan make:model user/User
```

Yaratilgan model fayli `app/models/user.go` faylida joylashgan bo'lib, uning tarkibi quyidagicha:

```go
package models

import (
  "github.com/goravel/framework/database/orm"
)

type User struct {
  orm.Model
  Name   string
  Avatar string
  orm.SoftDeletes
}
```

Agar model maydonini `any` turiga o'rnatmoqchi bo'lsangiz, qo'shimcha Tag qo'shishingiz kerak: `gorm:"type:text"`:

```go
type User struct {
  orm.Model
  Name   string
  Avatar string
  Detail any `gorm:"type:text"`
  orm.SoftDeletes
}
```

Tag'lardan foydalanishning batafsil ma'lumotlari quyidagi manzilda topiladi: https://gorm.io/docs/models.html.

#### Json maydoni

Agar JSON maydonidan foydalanmoqchi bo'lsangiz, maydon turini `datatypes.JSONMap` yoki maxsus struktura sifatida belgilashingiz va `gorm:"type:json"` tegni qo'shishingiz mumkin:

```go
package models

import (
	"database/sql/driver"
	"encoding/json"
	"github.com/goravel/framework/database/orm"
	"gorm.io/datatypes"
)

type User struct {
	orm.Model
	Json1 datatypes.JSONMap `gorm:"type:json" json:"json1"`
	Json2 *UserData `gorm:"type:json;serializer:json" json:"json2"`
}

type UserData struct {
	Name string `json:"name"`
	Age  int    `json:"age"`
}

func (r *UserData) Value() (driver.Value, error) {
	return json.Marshal(r)
}

func (r *UserData) Scan(value any) (err error) {
	if data, ok := value.([]byte); ok && len(data) > 0 {
		err = json.Unmarshal(data, &r)
	}
	return
}
```

#### Ma'lumotlar bazasi jadvali asosida model yaratish

```shell
./artisan make:model --table=users User

// Agar Model allaqachon mavjud bo'lsa, -f opsiyasidan foydalanib majburiy ustidan yozishingiz mumkin
./artisan make:model --table=users -f User
```

Agar ma'lumotlar jadvalidada freymvork tanimaydigan maydon turi bo'lsa, `bootstrap/app.go::WithCallback` funksiyasida `facades.Schema().Extend()` metodini chaqirib, maydon turini kengaytirishingiz mumkin:

```go
import "github.com/goravel/framework/contracts/schema"

func Boot() contractsfoundation.Application {
  return foundation.Setup().
    WithConfig(config.Boot).
    WithCallback(func() {
      facades.Schema().Extend(&schema.Extension{
        GoTypes: []schema.GoType{
          {
              Pattern: "uuid",
              Type: "uuid.UUID",
              NullType: "uuid.NullUUID",
              Imports: []string{"github.com/google/uuid"},
          },
          {
              Pattern: "point",
              Type: "geom.Point",
              NullType: "*geom.Point",
              Imports: []string{"github.com/twpayne/go-geom"},
          },
        },
      })
    }).
    Create()
}
```

### Jadval nomini ko'rsatish

```go
package models

import (
  "github.com/goravel/framework/database/orm"
)

type User struct {
  orm.Model
  Name   string
  Avatar string
  orm.SoftDeletes
}

func (r *User) TableName() string {
  return "goravel_user"
}
```

### Ma'lumotlar bazasi ulanishlari

Sukut bo'yicha, barcha modellar ilovangiz uchun sozlangan sukut bo'yicha ma'lumotlar bazasi ulanishidan foydalanadi. Agar ma'lum bir model bilan ishlashda farqli ulanishni ko'rsatmoqchi bo'lsangiz, modelda `Connection` metodini aniqlashingiz kerak.

```go
package models

import (
  "github.com/goravel/framework/database/orm"
)

type User struct {
  orm.Model
  Name   string
  Avatar string
  orm.SoftDeletes
}

func (r *User) Connection() string {
  return "postgres"
}
```

### Global doirami sozlash

Model so'rov, yangilash va o'chirish amallari doirasini cheklaydigan `GlobalScopes` metodini sozlashni qo'llab-quvvatlaydi:

```go
import (
	contractsorm "github.com/goravel/framework/contracts/database/orm"
	"github.com/goravel/framework/database/orm"
)

type User struct {
  orm.Model
  Name string
}

func (r *User) GlobalScopes() map[string]func(contractsorm.Query) contractsorm.Query {
  return map[string]func(contractsorm.Query) contractsorm.Query{
    "name": func(query contractsorm.Query) contractsorm.Query {
      return query.Where("name", "goravel")
    },
  }
}
```

Agar so'rovda global skoplarni olib tashlamoqchi bo'lsangiz, `WithoutGlobalScopes` funksiyasidan foydalanishingiz mumkin:

```go
// Barcha global skoplarni olib tashlash
facades.Orm().Query().WithoutGlobalScopes().Get(&users)

// Belgilangan global skopni olib tashlash
facades.Orm().Query().WithoutGlobalScopes("name").Get(&users)
```

## facades.Orm() mavjud funksiyalari

| Nomi        | Harakat                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Connection  | [Ma'lumotlar bazasi ulanishini ko'rsatish](#specify-database-connection)                          |
| DB          | [Umumiy ma'lumotlar bazasi interfeysi sql.DB](#generic-database-interface-sql-db) |
| Query       | [Ma'lumotlar bazasi instansiyasini olish](#get-database-instance)                                 |
| Transaction | [Tranzaksiya](#transaction)                                                                       |
| WithContext | [Kontekstni kiritish](#inject-context)                                                            |

## facades.Orm().Query() mavjud funksiyalari

| Funksiyalar                 | Harakat                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------- |
| Avg                         | [Avg](#Avarage)                                                                       |
| BeginTransaction            | [Tranzaksiyani boshlash](#transaction)                                                |
| Commit                      | [Tranzaksiyani tasdiqlash](#transaction)                                              |
| Count                       | [Hisoblash](#count)                                                                   |
| Create                      | [Yaratish](#create)                                                                   |
| Cursor                      | [Kursor](#cursor)                                                                     |
| Delete                      | [O‘chirish](#delete)                                                                  |
| Distinct                    | [Takrorlanishni filtrlash](#filter-repetition)                                        |
| Driver                      | [Haydovchini olish](#get-driver)                                                      |
| Exec                        | [Mahalliy yangilash SQL-ni bajarish](#execute-native-update-sql)                      |
| Exists                      | [Mavjudligi](#exists)                                                                 |
| Find                        | [ID bo'yicha bir yoki bir nechta qatorni so'rash](#query-one-or-multiple-lines-by-id) |
| FindOrFail                  | [Topilmasa xatoni qaytarish](#not-found-return-error)                                 |
| First                       | [Bir qatorni so'rash](#query-one-line)                                                |
| FirstOr                     | [So'rash yoki callback orqali ma'lumot qaytarish](#query-one-line)                    |
| FirstOrCreate               | [Modellarni olish yoki yaratish](#retrieving-or-creating-models)                      |
| FirstOrNew                  | [Modellarni olish yoki yangisini yaratish](#retrieving-or-creating-models)            |
| FirstOrFail                 | [Topilmagan xatosi](#not-found-error)                                                 |
| ForceDelete                 | [Majburiy o'chirish](#delete)                                                         |
| Get                         | [Bir nechta qatorni so'rash](#query-multiple-lines)                                   |
| Group                       | [Guruhlash](#group-by--having)                                                        |
| Having                      | [Having](#group-by-having)                                                            |
| Qo'shiladi                  | [Join](#join)                                                                         |
| Limit                       | [Limit](#limit)                                                                       |
| LockForUpdate               | [Pessimistic Locking](#pessimistic-locking)                                           |
| Max                         | [Max](#Avarage)                                                                       |
| Min                         | [Min](#Avarage)                                                                       |
| Model                       | [Jadvalni aniqlash](#specify-table-query)                                             |
| Offset                      | [Offset](#offset)                                                                     |
| Tartiblash                  | [Order](#order)                                                                       |
| OrderBy                     | [Order](#order)                                                                       |
| OrderByDesc                 | [Order](#order)                                                                       |
| InRandomOrder               | [Order](#order)                                                                       |
| OrWhere                     | [OrWhere](#where)                                                                     |
| OrWhereNotIn                | [OrWhereNotIn](#where)                                                                |
| OrWhereNull                 | [OrWhereNull](#where)                                                                 |
| OrWhereIn                   | [OrWhereIn](#where)                                                                   |
| OrWhereJsonContains         | [OrWhereJsonContains](#where)                                                         |
| OrWhereJsonContainsKey      | [OrWhereJsonContainsKey](#where)                                                      |
| OrWhereJsonDoesntContain    | [OrWhereJsonDoesntContain](#where)                                                    |
| OrWhereJsonDoesntContainKey | [OrWhereJsonDoesntContainKey](#where)                                                 |
| OrWhereJsonLength           | [OrWhereJsonLength](#where)                                                           |
| Sahifalash                  | [Paginate](#paginate)                                                                 |
| Pluck                       | [Yagona ustunni so'rov qilish](#query-single-column)                                  |
| Raw                         | [Asl SQL-ni bajarish](#execute-native-sql)                                            |
| Restore                     | [Restore](#restore)                                                                   |
| Rollback                    | [Tranzaksiyani bekor qilish](#transaction)                                            |
| Save                        | [Mavjud modelni yangilash](#update-a-existing-model)                                  |
| SaveQuietly                 | [Yagona modelni hodisasiz saqlash](#saving-a-single-model-without-events)             |
| Scan                        | [Scan struct](#execute-native-sql)                                                    |
| Scopes                      | [Scopes](#scopes)                                                                     |
| Tanlash                     | [Maydonlarni aniqlash](#specify-fields)                                               |
| SharedLock                  | [Pessimistic Locking](#pessimistic-locking)                                           |
| Sum                         | [Sum](#Avarage)                                                                       |
| Jadval                      | [Jadvalni aniqlash](#specify-table-query)                                             |
| ToSql                       | [SQL olish](#get-sql)                                                                 |
| ToRawSql                    | [SQL olish](#get-sql)                                                                 |
| Yangilash                   | [Yagona ustunni yangilash](#update-a-single-column)                                   |
| UpdateOrCreate              | [Yangilash yoki yaratish](#update-or-create)                                          |
| Where                       | [Where](#where)                                                                       |
| WhereAll                    | [WhereAll](#where)                                                                    |
| WhereAny                    | [WhereAny](#where)                                                                    |
| WhereBetween                | [WhereBetween](#where)                                                                |
| WhereNone                   | [WhereNone](#where)                                                                   |
| WhereNotBetween             | [WhereNotBetween](#where)                                                             |
| WhereNotIn                  | [WhereNotIn](#where)                                                                  |
| WhereNull                   | [WhereNull](#where)                                                                   |
| WhereIn                     | [WhereIn](#where)                                                                     |
| WhereJsonContains           | [WhereJsonContains](#where)                                                           |
| WhereJsonContainsKey        | [WhereJsonContainsKey](#where)                                                        |
| WhereJsonDoesntContain      | [WhereJsonDoesntContain](#where)                                                      |
| WhereJsonDoesntContainKey   | [WhereJsonDoesntContainKey](#where)                                                   |
| WhereJsonLength             | [WhereJsonLength](#where)                                                             |
| WithoutEvents               | [Hodisalarni o'chirish](#muting-events)                                               |
| WithTrashed                 | [Yumshoq o'chirilgan ma'lumotlarni so'rov qilish](#query-soft-delete-data)            |

## So'rov Quruvchi

### Kontekstni kiritish

```go
facades.Orm().WithContext(ctx)
```

### Ma'lumotlar bazasi ulanishini aniqlash

Agar `config/database.go` faylida bir nechta ma'lumotlar bazasi ulanishlari aniqlangan bo'lsa, ularni `facades.Orm()` ning `Connection` funksiyasi orqali ishlatishingiz mumkin. `Connection` ga uzatilgan ulanish nomi `config/database.go` faylida sozlangan ulanishlardan biri boʻlishi kerak:

```go
facades.Orm().Connection("mysql")
```

### Umumiy Maʼlumotlar Bazasi Interfeysi sql.DB

Umumiy maʼlumotlar bazasi interfeysi sql.DB, soʻngra u taqdim etgan funksionallikdan foydalaning:

```go
db, err := facades.Orm().DB()
db, err := facades.Orm().Connection("mysql").DB()

// Ping
db.Ping()

// Close
db.Close()

// Maʼlumotlar bazasi statistikasini qaytaradi
db.Stats()

// SetMaxIdleConns boʻsh ulanishlar hovuzidagi maksimal ulanishlar sonini belgilaydi
db.SetMaxIdleConns(10)

// SetMaxOpenConns maʼlumotlar bazasiga ochiq ulanishlarning maksimal sonini belgilaydi
db.SetMaxOpenConns(100)

// SetConnMaxLifetime ulanish qayta ishlatilishi mumkin boʻlgan maksimal vaqtni belgilaydi
db.SetConnMaxLifetime(time.Hour)
```

### Maʼlumotlar Bazasi Instansini Olish

Har bir aniq maʼlumotlar bazasi operatsiyasidan oldin, maʼlumotlar bazasi instansini olish kerak.

```go
facades.Orm().Query()
facades.Orm().Connection("mysql").Query()
facades.Orm().WithContext(ctx).Query()
```

### Tanlash

#### Bitta qatorni soʻrov qilish

```go
var user models.User
facades.Orm().Query().First(&user)
// SELECT * FROM `users` ORDER BY `users`.`id` LIMIT 1;
```

Baʼzida natijalar topilmasa, boshqa harakatni amalga oshirishni xohlashingiz mumkin. `FirstOr` metodi bitta model instansini qaytaradi yoki natijalar topilmasa, berilgan yopilishni (closure) bajaradi. Yopilishda modelga qiymatlarni belgilashingiz mumkin:

```go
facades.Orm().Query().Where("name", "first_user").FirstOr(&user, func() error {
  user.Name = "goravel"

  return nil
})
```

#### ID boʻyicha bitta yoki bir nechta qatorni soʻrov qilish

```go
var user models.User
facades.Orm().Query().Find(&user, 1)
// SELECT * FROM `users` WHERE `users`.`id` = 1;

var users []models.User
facades.Orm().Query().Find(&users, []int{1,2,3})
// SELECT * FROM `users` WHERE `users`.`id` IN (1,2,3);
```

#### Topilmasa xatoni qaytaradi

```go
var user models.User
err := facades.Orm().Query().FindOrFail(&user, 1)
```

#### Foydalanuvchi jadvalining asosiy kaliti `string` turida boʻlsa, `Find` metodini chaqirishda asosiy kalitni koʻrsatishingiz kerak

```go
var user models.User
facades.Orm().Query().Find(&user, "uuid=?" ,"a")
// SELECT * FROM `users` WHERE `users`.`uuid` = "a";
```

#### Bir nechta qatorni soʻrov qilish

```go
var users []models.User
facades.Orm().Query().Where("id in ?", []int{1,2,3}).Get(&users)
// SELECT * FROM `users` WHERE id in (1,2,3);
```

#### Modellarni Topish yoki Yaratish

`FirstOrCreate` metodi belgilangan ustun/qiymat juftliklari yordamida maʼlumotlar bazasi yozuvini qidiradi. Agar model maʼlumotlar bazasida topilmasa, u birinchi argumentni ixtiyoriy ikkinchi argument bilan birlashtirish orqali olingan atributlar bilan yangi yozuv yaratadi.

Shunga oʻxshash, `FirstOrNew` metodi ham berilgan atributlarga asoslanib maʼlumotlar bazasida yozuvni topishga harakat qiladi. Biroq, agar topilmasa, modelning yangi instansi qaytariladi. Diqqat qilish kerakki, bu yangi model maʼlumotlar bazasiga saqlanmagan va buni amalga oshirish uchun `Save` metodini qoʻlda chaqirishingiz kerak.

```go
var user models.User
facades.Orm().Query().Where("gender", 1).FirstOrCreate(&user, models.User{Name: "tom"})
// SELECT * FROM `users` WHERE `gender` = 1 AND `users`.`name` = 'tom' ORDER BY `users`.`id` LIMIT 1;
// INSERT INTO `users` (`created_at`,`updated_at`,`name`) VALUES ('2023-09-18 12:51:32.556','2023-09-18 12:51:32.556','tom');

facades.Orm().Query().Where("gender", 1).FirstOrCreate(&user, models.User{Name: "tom"}, models.User{Avatar: "avatar"})
// SELECT * FROM `users` WHERE `gender` = 1 AND `users`.`name` = 'tom' ORDER BY `users`.`id` LIMIT 1;
// INSERT INTO `users` (`created_at`,`updated_at`,`name`,`avatar`) VALUES ('2023-09-18 12:52:59.913','2023-09-18 12:52:59.913','tom','avatar');

var user models.User
facades.Orm().Query().Where("gender", 1).FirstOrNew(&user, models.User{Name: "tom"})
// SELECT * FROM `users` WHERE `gender` = 1 AND `users`.`name` = 'tom' ORDER BY `users`.`id` LIMIT 1;

facades.Orm().Query().Where("gender", 1).FirstOrNew(&user, models.User{Name: "tom"}, models.User{Avatar: "avatar"})
// SELECT * FROM `users` WHERE `gender` = 1 AND `users`.`name` = 'tom' ORDER BY `users`.`id` LIMIT 1;
```

#### Topilmagan Xatosi

Soʻralgan element topilmasa, `First` metodi xatolik keltirib chiqarmaydi. Xatolik keltirib chiqarish uchun `FirstOrFail` metodidan foydalaning:

```go
var user models.User
err := facades.Orm().Query().FirstOrFail(&user)

// import "github.com/goravel/framework/errors"
// if errors.Is(err, errors.OrmRecordNotFound) {}
```

### Qayerda

```go
facades.Orm().Query().Where("name", "tom")
facades.Orm().Query().Where("name = 'tom'")
facades.Orm().Query().Where("name = ?", "tom")
facades.Orm().Query().Where("name", "tom").Where(func(query orm.Query) orm.Query {
  return query.Where("height", 180).Where("age", 18)
})

facades.Orm().Query().WhereBetween("age", 1, 10)
facades.Orm().Query().WhereNotBetween("age", 1, 10)
facades.Orm().Query().WhereNotIn("name", []any{"a"})
facades.Orm().Query().WhereNull("name")
facades.Orm().Query().WhereIn("name", []any{"a"})

facades.Orm().Query().OrWhere("name", "tom")
facades.Orm().Query().OrWhereNotIn("name", []any{"a"})
facades.Orm().Query().OrWhereNull("name")
facades.Orm().Query().OrWhereIn("name", []any{"a"})

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

JSON ustunlarini soʻrov qilish

```go
facades.Orm().Query().Where("preferences->dining->meal", "salad").First(&user)
facades.Orm().Query().Where("options->languages[0]", "en").First(&user)
facades.Orm().Query().WhereJsonContainsKey("contacts->personal->email").First(&user)
facades.Orm().Query().WhereJsonDoesntContainKey("contacts->personal->email").First(&user)
facades.Orm().Query().WhereJsonContains("options->languages", "en").First(&user)
facades.Orm().Query().WhereJsonContains("options->languages", []string{"en", "de"}).First(&user)
facades.Orm().Query().WhereJsonDoesntContain("options->languages", "en").First(&user)
facades.Orm().Query().WhereJsonDoesntContain("options->languages", []string{"en", "de"}).First(&user)
facades.Orm().Query().WhereJsonLength('options->languages', 1).First(&user)
facades.Orm().Query().WhereJsonLength('options->languages > ?', 1).First(&user)

facades.Orm().Query().OrWhere("preferences->dining->meal", "salad").First(&user)
facades.Orm().Query().OrWhere("options->languages[0]", "en").First(&user)
facades.Orm().Query().OrWhereJsonContainsKey("contacts->personal->email").First(&user)
facades.Orm().Query().OrWhereJsonDoesntContainKey("contacts->personal->email").First(&user)
facades.Orm().Query().OrWhereJsonContains("options->languages", "en").First(&user)
facades.Orm().Query().OrWhereJsonContains("options->languages", []string{"en", "de"}).First(&user)
facades.Orm().Query().OrWhereJsonDoesntContain("options->languages", "en").First(&user)
facades.Orm().Query().OrWhereJsonDoesntContain("options->languages", []string{"en", "de"}).First(&user)
facades.Orm().Query().OrWhereJsonLength('options->languages', 1).First(&user)
facades.Orm().Query().OrWhereJsonLength('options->languages > ?', 1).First(&user)
```

### Limit

```go
var users []models.User
facades.Orm().Query().Where("name", "tom").Limit(3).Get(&users)
// SELECT * FROM `users` WHERE name = 'tom' LIMIT 3;
```

### Ofset

```go
var users []models.User
facades.Orm().Query().Where("name", "tom").Offset(5).Limit(3).Get(&users)
// SELECT * FROM `users` WHERE name = 'tom' LIMIT 3 OFFSET 5;
```

### Tartiblash

```go
var users []models.User
facades.Orm().Query().Where("name", "tom").Order("sort asc").Order("id desc").Get(&users)
// SELECT * FROM `users` WHERE name = 'tom' ORDER BY sort asc,id desc;

facades.Orm().Query().Where("name", "tom").OrderBy("sort").Get(&users)
// SELECT * FROM `users` WHERE name = 'tom' ORDER BY sort asc;

facades.Orm().Query().Where("name", "tom").OrderByDesc("sort").Get(&users)
// SELECT * FROM `users` WHERE name = 'tom' ORDER BY sort desc;

facades.Orm().Query().Where("name", "tom").InRandomOrder().Get(&users)
// SELECT * FROM `users` WHERE name = 'tom' ORDER BY RAND();
```

### Sahifalash

```go
var users []models.User
var total int64
facades.Orm().Query().Paginate(1, 10, &users, &total)
// SELECT count(*) FROM `users`;
// SELECT * FROM `users` LIMIT 10;
```

### Bitta Ustunni Soʻrov Qilish

```go
var ages []int64
facades.Orm().Query().Model(&models.User{}).Pluck("age", &ages)
// SELECT `age` FROM `users`;
```

### Jadvalni Belgilash Orqali Soʻrov Qilish

Agar baʼzi agregat maʼlumotlarni soʻrov qilmoqchi boʻlsangiz, aniq bir jadvalni belgilashingiz kerak.

Modelni belgilash

```go
count, err := facades.Orm().Query().Model(&models.User{}).Count()
// SELECT count(*) FROM `users` WHERE deleted_at IS NULL;
```

Jadvalni belgilash

```go
count, err := facades.Orm().Query().Table("users").Count()
// SELECT count(*) FROM `users`; // oʻchirilgan yoki oʻchirilmagan barcha yozuvlarni olish
```

### SQL ni Olish

Belgilovchi bilan SQL ni olish:

```go
facades.Orm().Query().ToSql().Get(models.User{})
// SELECT * FROM "users" WHERE "id" = $1 AND "users"."deleted_at" IS NULL
```

Qiymat bilan SQL ni olish:

```go
facades.Orm().Query().ToRawSql().Get(models.User{})
// SELECT * FROM "users" WHERE "id" = 1 AND "users"."deleted_at" IS NULL
```

`ToSql` va `ToRawSql` dan keyin chaqirilishi mumkin bo'lgan metodlar: `Count`, `Create`, `Delete`, `Find`, `First`, `Get`, `Pluck`, `Save`, `Sum`, `Update`.

### Count

```go
count, err := facades.Orm().Query().Table("users").Count()
// SELECT count(*) FROM `users` WHERE name = 'tom';
```

### Maydonlarni belgilash

`Select` ma'lumotlar bazasidan qaysi maydonlarni olishni belgilash imkonini beradi, sukut bo'yicha ORM barcha maydonlarni oladi.

```go
facades.Orm().Query().Select("name", "age").Get(&users)
// SELECT `name`,`age` FROM `users`;
```

### Guruhlash & Having

```go
type Result struct {
  Name  string
  Total int
}

var result Result
facades.Orm().Query().Model(&models.User{}).Select("name", "sum(age) as total").Group("name").Having("name = ?", "tom").Get(&result)
// SELECT name, sum(age) as total FROM `users` GROUP BY `name` HAVING name = "tom";
```

### Qo'shiladi

```go
type Result struct {
  Name  string
  Email string
}

var result Result
facades.Orm().Query().Model(&models.User{}).Select("users.name", "emails.email").Join("left join emails on emails.user_id = users.id").Scan(&result)
// SELECT users.name, emails.email FROM `users` LEFT JOIN emails ON emails.user_id = users.id;
```

### Create

```go
user := models.User{Name: "tom", Age: 18}
err := facades.Orm().Query().Create(&user)
// INSERT INTO users (name, age, created_at, updated_at) VALUES ("tom", 18, "2022-09-27 22:00:00", "2022-09-27 22:00:00");

// Model hodisalarini ishga tushirmaydi
err := facades.Orm().Query().Table("users").Create(map[string]any{
  "name": "Goravel",
})

// Model hodisalarini ishga tushiradi
err := facades.Orm().Query().Model(&models.User{}).Create(map[string]any{
  "name": "Goravel",
})
```

### Ko'p yaratish

```go
users := []models.User{{Name: "tom", Age: 18}, {Name: "tim", Age: 19}}
err := facades.Orm().Query().Create(&users)

err := facades.Orm().Query().Table("users").Create(&[]map[string]any{
  {"name": "Goravel"},
  {"name": "Framework"},
})

err := facades.Orm().Query().Model(&models.User{}).Create(&[]map[string]any{
  {"name": "Goravel"},
  {"name": "Framework"},
})
```

> `created_at` va `updated_at` avtomatik ravishda to'ldiriladi.

### Kursor

O'n minglab Eloquent model yozuvlari orqali takrorlashda ilovangizning xotira sarfini sezilarli darajada kamaytirish uchun ishlatilishi mumkin. E'tibor bering, `Cursor` metodi `With` bilan bir vaqtda ishlatilishi mumkin, iltimos, `for` mantiqida bog'lanishni yuklash uchun [Lazy Eager Loading](./relationships.md#lazy-eager-loading) dan foydalaning.

```go
cursor, err := facades.Orm().Query().Model(models.User{}).Cursor()
if err != nil {
  return err
}
for row := range cursor {
  var user models.User
  if err := row.Scan(&user); err != nil {
    return err
  }
  fmt.Println(user)
}
```

### Modelni saqlash

#### Mavjud modelni yangilash

```go
var user models.User
facades.Orm().Query().First(&user)

user.Name = "tom"
user.Age = 100
facades.Orm().Query().Save(&user)
// UPDATE `users` SET `created_at`='2023-09-14 16:03:29.454',`updated_at`='2023-09-18 21:05:59.896',`name`='tom',`age`=100,`avatar`='' WHERE `id` = 1;
```

#### Ustunlarni yangilash

```go
facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Update("name", "hello")
// UPDATE `users` SET `name`='hello',`updated_at`='2023-09-18 21:06:30.373' WHERE `name` = 'tom';

facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Update(models.User{Name: "hello", Age: 18})
facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Update(map[string]any{"name": "hello", "age": 18})
// UPDATE `users` SET `updated_at`='2023-09-18 21:07:06.489',`name`='hello',`age`=18 WHERE `name` = 'tom';
```

> `struct` bilan yangilashda, Orm faqat nolga teng bo'lmagan maydonlarni yangilaydi. Siz atributlarni yangilash uchun `map` dan foydalanishingiz yoki yangilash uchun maydonlarni belgilash uchun `Select` dan foydalanishingiz mumkin. E'tibor bering, `struct` faqat `Model` bo'lishi mumkin, agar siz `Model` bo'lmagan narsa bilan yangilamoqchi bo'lsangiz, `.Table("users")` dan foydalanishingiz kerak, ammo bu vaqtda `updated_at` maydoni avtomatik ravishda yangilanmaydi.

#### JSON maydonlarini yangilang

```go
facades.Orm().Query().Model(&models.User{}).Where("id", 1).Update("options->enabled", true)
facades.Orm().Query().Model(&models.User{}).Where("id", 1).Update("options->languages[0]", "en")
facades.Orm().Query().Model(&models.User{}).Where("id", 1).Update("options->languages", []string{"en", "de"})
facades.Orm().Query().Model(&models.User{}).Where("id", 1).Update(map[string]any{
    "preferences->dining->meal": "salad",
    "options->languages[0]":     "en",
    "options->enabled":          true,
})
```

#### Yangilash yoki yaratish

`name` bo'yicha so'rov bering, agar mavjud bo'lmasa, `name`, `avatar` bo'yicha yarating, agar mavjud bo'lsa, `name` asosida `avatar` ni yangilang:

```go
facades.Orm().Query().UpdateOrCreate(&user, models.User{Name: "name"}, models.User{Avatar: "avatar"})
// SELECT * FROM `users` WHERE `users`.`name` = 'name' AND `users`.`deleted_at` IS NULL ORDER BY `users`.`id` LIMIT 1;
// INSERT INTO `users` (`created_at`,`updated_at`,`deleted_at`,`name`,`avatar`) VALUES ('2023-03-11 10:11:08.869','2023-03-11 10:11:08.869',NULL,'name','avatar');
// UPDATE `users` SET `name`='name',avatar`='avatar',`updated_at`='2023-03-11 10:11:08.881' WHERE users`.`deleted_at` IS NULL AND `id` = 1;
```

### O‘chirish

Model bo'yicha o'chirish, bayonot ta'sir qilgan qatorlar soni usul tomonidan qaytariladi:

```go
var user models.User
facades.Orm().Query().Find(&user, 1)
res, err := facades.Orm().Query().Delete(&user)
res, err := facades.Orm().Query().Model(&models.User{}).Where("id", 1).Delete()
res, err := facades.Orm().Query().Table("users").Where("id", 1).Delete()
// DELETE FROM `users` WHERE `users`.`id` = 1;

num := res.RowsAffected
```

Ko'p o'chirish

```go
facades.Orm().Query().Where("name", "tom").Delete(&models.User{})
// DELETE FROM `users` WHERE name = 'tom';
```

Yumshoq o'chirilgan ma'lumotni majburan o'chirishni xohlaysiz.

```go
facades.Orm().Query().Where("name", "tom").ForceDelete(&models.User{})
facades.Orm().Query().Model(&models.User{}).Where("name", "tom").ForceDelete()
facades.Orm().Query().Table("users").Where("name", "tom").ForceDelete()
```

Model bog'lanishlari bilan yozuvlarni `Select` orqali o'chirishingiz mumkin:

```go
// Foydalanuvchini o'chirishda uning Account'ini o'chirish
facades.Orm().Query().Select("Account").Delete(&user)

// Foydalanuvchini o'chirishda uning Orders va CreditCards'larini o'chirish
facades.Orm().Query().Select("Orders", "CreditCards").Delete(&user)

// Foydalanuvchini o'chirishda uning barcha farzand bog'lanishlarini o'chirish
facades.Orm().Query().Select(orm.Associations).Delete(&user)

// Foydalanuvchilarni o'chirishda ularning barcha Account'larini o'chirish
facades.Orm().Query().Select("Account").Delete(&users)
```

Eslatma: Bog'lanishlar faqat yozuvning birlamchi kaliti bo'sh bo'lmaganda o'chiriladi va Orm bog'langan yozuvlarni o'chirish shartlari sifatida ushbu birlamchi kalitlardan foydalanadi:

```go
// name='goravel' bo'lgan foydalanuvchini o'chirish, lekin foydalanuvchining hisobini o'chirmaslik
facades.Orm().Query().Select("Account").Where("name", "goravel").Delete(&models.User{})

// name='goravel' va id = 1 bo'lgan foydalanuvchini o'chirish va foydalanuvchining hisobini o'chirish
facades.Orm().Query().Select("Account").Where("name", "goravel").Delete(&models.User{ID: 1})

// id = 1 bo'lgan foydalanuvchini o'chirish va uning hisobini o'chirish
facades.Orm().Query().Select("Account").Delete(&models.User{ID: 1})
```

Agar hech qanday shartlarsiz to'plam o'chirish amalga oshirilsa, ORM buni qilmaydi va xatoni qaytaradi. Shuning uchun siz ba'zi shartlarni qo'shishingiz yoki mahalliy SQL dan foydalanishingiz kerak.

### Yumshoq o'chirilgan ma'lumotlarni so'rov bering

```go
var user models.User
facades.Orm().Query().WithTrashed().First(&user)
```

### Takrorlanishni filtrlash

```go
var users []models.User
facades.Orm().Query().Distinct("name").Find(&users)
```

### Haydovchini olish

```go
driver := facades.Orm().Query().Driver()

// Haydovchini aniqlash
if driver == orm.DriverMysql {}
```

### Mahalliy SQL ni bajarish

```go
type Result struct {
  ID   int
  Name string
  Age  int
}

var result Result
facades.Orm().Query().Raw("SELECT id, name, age FROM users WHERE name = ?", "tom").Scan(&result)
```

### Mahalliy Update SQL ni bajarish

Bayanot ta'sir qilgan qatorlar soni usul tomonidan qaytariladi:

```go
res, err := facades.Orm().Query().Exec("DROP TABLE users")
// DROP TABLE `users`;

num := res.RowsAffected
```

### Mavjud

```go
exists, err := facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Exists()
```

### Tiklash

```go
facades.Orm().Query().WithTrashed().Restore(&models.User{ID: 1})
facades.Orm().Query().Model(&models.User{ID: 1}).WithTrashed().Restore()
// UPDATE `users` SET `deleted_at`=NULL WHERE `id` = 1;
```

### Tranzaksiya

Siz `Transaction` funksiyasi orqali tranzaksiyani bajarishingiz mumkin.

```go
import (
  "github.com/goravel/framework/contracts/database/orm"

  "goravel/app/facades"
  "goravel/app/models"
)

...

return facades.Orm().Transaction(func(tx orm.Query) error {
  var user models.User

  return tx.Find(&user, user.ID)
})
```

Shuningdek, siz transaksiya oqimini o'zingiz qo'lda boshqarishingiz mumkin:

```go
tx, err := facades.Orm().Query().BeginTransaction()
user := models.User{Name: "Goravel"}
if err := tx.Create(&user); err != nil {
  err := tx.Rollback()
} else {
  err := tx.Commit()
}
```

### Skoplar

Metodlar chaqirilganda murojaat qilish mumkin bo'lgan tez-tez ishlatiladigan so'rovlarni belgilash imkonini beradi.

```go
func Paginator(page string, limit string) func(methods orm.Query) orm.Query {
  return func(query orm.Query) orm.Query {
    page, _ := strconv.Atoi(page)
    limit, _ := strconv.Atoi(limit)
    offset := (page - 1) * limit

    return query.Offset(offset).Limit(limit)
  }
}

// scopes.Paginator - maxsus funksiya: func(ormcontract.Query) ormcontract.Query
facades.Orm().Query().Scopes(scopes.Paginator(page, limit)).Find(&entries)
```

### Xom ifodalar

Maydonlarni yangilash uchun `db.Raw` usulidan foydalanishingiz mumkin:

```go
import "github.com/goravel/framework/database/db"

facades.Orm().Query().Model(&user).Update("age", db.Raw("age - ?", 1))
// UPDATE `users` SET `age`=age - 1,`updated_at`='2023-09-14 14:03:20.899' WHERE `users`.`deleted_at` IS NULL AND `id` = 1;
```

### Pessimistik blokirovka

So'rov quruvchisi, shuningdek, sizning `select` bayonotlaringizni bajarishda "pessimistik blokirovka"ga erishishga yordam beradigan bir nechta funksiyalarni o'z ichiga oladi.

"Umumiy qulf" bilan bayonotni bajarish uchun siz `SharedLock` usulini chaqirishingiz mumkin. "Umumiy qulf" tanlangan qatorlar transaksiya tasdiqlanmaguncha o'zgartirilishiga yo'l qo'ymaydi:

```go
var users []models.User
facades.Orm().Query().Where("ovozlar > ?", 100).SharedLock().Get(&users)
```

Shuningdek, siz `LockForUpdate` usulidan foydalanishingiz mumkin. "Yangilash uchun qulf" tanlangan yozuvlarni o'zgartirish yoki boshqa umumiy qulf bilan tanlashdan himoya qiladi:

```go
var users []models.User
facades.Orm().Query().Where("ovozlar > ?", 100).LockForUpdate().Get(&users)
```

### Oʻrtacha

```go
var sum int
err := facades.Orm().Query().Model(models.User{}).Sum("id", &sum)

var avg float64
err := facades.Orm().Query().Model(models.User{}).Average("age", &avg)

var max int
err := facades.Orm().Query().Model(models.User{}).Max("age", &max)

var min int
err := facades.Orm().Query().Model(models.User{}).Min("age", &min)
```

## Tadbirlar

Orm modellari bir nechta tadbirlarni ishga tushiradi, bu sizga model hayot tsiklining quyidagi momentlariga ulanish imkonini beradi: `Retrieved`, `Creating`, `Created`, `Updating`, `Updated`, `Saving`, `Saved`, `Deleting`, `Deleted`, `ForceDeleting`, `ForceDeleted`, `Restored`, `Restoring`.

`Retrieved` tadbiri mavjud model ma'lumotlar bazasidan olinganda ishga tushadi. Yangi model birinchi marta saqlanganda, `Creating` va `Created` tadbirlari ishga tushadi. Mavjud model o'zgartirilganda va `Save` usuli chaqirilganda `Updating` / `Updated` tadbirlari ishga tushadi. Model yaratilganda yoki yangilanganda - hatto model atributlari o'zgartirilmagan bo'lsa ham, `Saving` / `Saved` tadbirlari ishga tushadi. `-ing` bilan tugaydigan tadbir nomlari modelga o'zgartirishlar kiritilishidan oldin, `-ed` bilan tugaydigan tadbirlar esa modelga o'zgartirishlar kiritilgandan keyin ishga tushadi.

Eslatma: Barcha tadbirlar faqat model ustida amal bajarilganda ishga tushadi. Masalan, `Update` usulini chaqirganda `Updating` va `Updated` tadbirlarini ishga tushirishni xohlasangiz, mavjud modelni `Model` usuliga uzatishingiz kerak: `facades.Orm().Query().Model(&user).Update("name", "Goravel")`.

Model tadbirlarini tinglashni boshlash uchun o'z modelingizda `DispatchesEvents` usulini aniqlang. Bu xususiyat model hayot tsiklining turli nuqtalarini o'z tadbir klasslaringizga bog'laydi.

```go
import (
  contractsorm "github.com/goravel/framework/contracts/database/orm"
	"github.com/goravel/framework/database/orm"
)

type User struct {
	orm.Model
	Name    string
}

func (u *User) DispatchesEvents() map[contractsorm.EventType]func(contractsorm.Event) error {
	return map[contractsorm.EventType]func(contractsorm.Event) error{
		contractsorm.EventCreating: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventCreated: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventSaving: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventSaved: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventUpdating: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventUpdated: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventDeleting: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventDeleted: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventForceDeleting: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventForceDeleted: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventRetrieved: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventRestored: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventRestoring: func(event contractsorm.Event) error {
			return nil
		},
	}
}
```

> Eslatma: Faqat sizga kerak bo'lgan tadbirlarni ro'yxatdan o'tkazing. Orm orqali partiyali operatsiyalar bajarilayotganda model tadbirlari ishga tushirilmaydi.

### Kuzatuvchilar

#### Kuzatuvchilarni aniqlash

Agar siz berilgan modelda ko'plab tadbirlarni tinglamoqchi bo'lsangiz, barcha tinglovchilaringizni bitta klassga guruhlash uchun kuzatuvchilardan foydalanishingiz mumkin. Kuzatuvchi klasslarida tinglamoqchi bo'lgan Eloquent tadbirlarini aks ettiruvchi usul nomlari mavjud. Bu usullarning har biri ta'sirlangan modelni yagona argument sifatida qabul qiladi. Yangi kuzatuvchi klassini yaratishning eng oson yo'li `make:observer` Artisan buyrug'idir:

```shell
./artisan make:observer UserObserver
./artisan make:observer user/UserObserver
```

Bu buyruq yangi kuzatuvchini sizning `app/observers` katalogingizga joylashtiradi. Agar bu katalog mavjud bo'lmasa, Artisan uni siz uchun yaratadi. Yangi kuzatuvchingiz quyidagicha ko'rinadi:

```go
package observers

import (
	"fmt"

	"github.com/goravel/framework/contracts/database/orm"
)

type UserObserver struct{}

func (u *UserObserver) Created(event orm.Event) error {
	return nil
}

func (u *UserObserver) Updated(event orm.Event) error {
	return nil
}

func (u *UserObserver) Deleted(event orm.Event) error {
	return nil
}

func (u *UserObserver) ForceDeleted(event orm.Event) error {
	return nil
}
```

Namuna kuzatuvchi faqat ba'zi tadbirlarni o'z ichiga oladi, siz ehtiyojlaringizga qarab boshqa tadbirlarni qo'shishingiz mumkin.

Kuzatuvchini ro'yxatdan o'tkazish uchun kuzatmoqchi bo'lgan modelingizda `Observe` usulini chaqirishingiz kerak. Siz kuzatuvchilarni `bootstrap/app.go::WithCallback` funksiyasida ro'yxatdan o'tkazishingiz mumkin:

```go
func Boot() contractsfoundation.Application {
  return foundation.Setup().
    WithConfig(config.Boot).
    WithCallback(func() {
      facades.Orm().Observe(models.User{}, &observers.UserObserver{})
    }).
    Create()
}
```

> Eslatma: Agar siz `DispatchesEvents` va `Observer` ni bir vaqtning o'zida o'rnatsangiz, faqat `DispatchesEvents` qo'llaniladi.

#### Kuzatuvchidagi parametr

`event` parametri barcha kuzatuvchilarga uzatiladi:

| Usul         | Harakat                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| Kontekst     | `facades.Orm().WithContext()` orqali uzatilgan kontekstni olish                                                          |
| GetAttribute | O'zgartirilgan qiymatni olish, agar o'zgartirilmagan bo'lsa, asl qiymatni olish, agar asl qiymat bo'lmasa, nil qaytarish |
| GetOriginal  | Asl qiymatni olish, agar asl qiymat bo'lmasa, nil qaytarish                                                              |
| IsDirty      | Maydon o'zgartirilganligini aniqlash                                                                                     |
| IsClean      | IsDirty ning teskarisi                                                                                                   |
| Query        | Transaksiya bilan ishlatish mumkin bo'lgan yangi Query olish                                                             |
| SetAttribute | Maydon uchun yangi qiymat o'rnatish                                                                                      |

### Tadbirlarni o'chirish

Ba'zan siz model tomonidan ishga tushirilgan barcha tadbirlarni vaqtincha "o'chirish" kerak bo'lishi mumkin. Buni `WithoutEvents` usuli yordamida amalga oshirishingiz mumkin:

```go
var user models.User
facades.Orm().Query().WithoutEvents().Find(&user, 1)
```

#### Tadbirlarsiz bitta modelni saqlash

Ba'zan siz berilgan modelni hech qanday tadbirlarni ishga tushirmasdan "saqlash"ni xohlashingiz mumkin. Buni `SaveQuietly` usuli bilan amalga oshirishingiz mumkin:

```go
var user models.User
err := facades.Orm().Query().FindOrFail(&user, 1)
user.Name = "Goravel"
err := facades.Orm().Query().SaveQuietly(&user)
```
