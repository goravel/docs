# Bog'lanishlar

[[toc]]

## Kirish

Ma'lumotlar bazasi jadvallari o'zaro bog'langan bo'lishi odatiy holdir. Masalan, blog postida ko'p sharhlar bo'lishi mumkin yoki buyurtma uni joylagan foydalanuvchiga bog'langan bo'lishi mumkin. `Orm` bunday bog'lanishlarni boshqarish va ular bilan ishlashni osonlashtiradi va u turli keng tarqalgan bog'lanish turlarini qo'llab-quvvatlaydi:

- [Bitta-birga](#bitta-birga)
- [Bitta-ko'pga](#bitta-ko-pga)
- [Ko'p-ko'pga](#bitta-birga)
- [Polimorfik](#polimorfik)

## Bog'lanishlarni aniqlash

### Bitta-birga

Bitta-birga bog'lanish ma'lumotlar bazasi munosabatlarining juda asosiy turidir. Masalan, `User` modeli bitta `Phone` modeli bilan bog'langan bo'lishi mumkin.

```go
type User struct {
  orm.Model
  Name  string
  Phone   *Phone
}

type Phone struct {
  orm.Model
  UserID   uint
  Name   string
}
```

`Orm` dan foydalanganda, u chet kalitni ota model nomiga asoslanib bog'lanishga avtomatik tayinlaydi. Masalan, `Phone` modeli sukut bo'yicha `UserID` chet kalitiga ega deb hisoblanadi. Biroq, agar siz ushbu konventsiyani o'zgartirmoqchi bo'lsangiz, `User` modelidagi `Phone` maydoniga `foreignKey` tegnini qo'shishingiz mumkin. (Bu boshqa bog'lanishlarga ham tegishli.)

```go
type User struct {
  orm.Model
  Name  string
  Phone   *Phone `gorm:"foreignKey:UserName"`
}

type Phone struct {
  orm.Model
  UserName string
  Name   string
}
```

Bundan tashqari, `Orm` dan foydalanganda, chet kalit ota modelning asosiy kalit ustuniga mos kelishi kerak deb hisoblanadi. Bu shuni anglatadiki, `Orm` foydalanuvchining `ID` ustun qiymatini `Phone` yozuvidagi `UserId` ustunida qidiradi. Agar siz `ID` dan boshqa asosiy kalit qiymatidan foydalanmoqchi bo'lsangiz, `User` modelidagi `Phone` maydoniga "Tag" havolasini qo'shishingiz mumkin. Buning uchun `hasOne` metodiga uchinchi argumentni o'tkazishingiz kifoya. (Boshqa bog'lanish sozlamalari ham o'xshash.)

```go
type User struct {
  orm.Model
  Name  string
  Phone   *Phone `gorm:"foreignKey:UserName;references:name"`
}

type Phone struct {
  orm.Model
  UserName string
  Name   string
}
```

#### Bog'lanishning teskari tomonini aniqlash

Biz `User` modelimizdan `Phone` modeliga kirishimiz mumkin. Endi, bizga telefoning egasiga kirish imkonini beruvchi `Phone` modelida bog'lanish o'rnatish kerak. Buning uchun `Phone` modelida `User` maydonini aniqlashimiz mumkin.

```go
type User struct {
  orm.Model
  Name  string
}

type Phone struct {
  orm.Model
  UserID   uint
  Name   string
  User   *User
}
```

### Bitta-ko'pga

Bitta-ko'pga bog'lanish bitta model bir yoki bir nechta bola modellar uchun ota bo'lgan munosabatlarni aniqlash uchun ishlatiladi. Masalan, blog postida cheksiz sonli sharhlar bo'lishi mumkin. Boshqa barcha `Orm` bog'lanishlari singari, bitta-ko'pga bog'lanishlar ham `Orm` modelingizda maydon aniqlash orqali belgilanadi:

```go
type Post struct {
  orm.Model
  Name   string
  Comments []*Comment
}

type Comment struct {
  orm.Model
  PostID   uint
  Name   string
}
```

Esda tuting, `Orm` `Comment` modeli uchun tegishli chet kalit ustunini avtomatik aniqlaydi. Konventsiyaga ko'ra, Orm ota modelning "tuya yurishi" nomini oladi va unga `ID` qo'shimchasini qo'shadi. Shunday qilib, bu misolda Orm `Comment` modelidagi chet kalit ustuni `PostID` ekanligini taxmin qiladi.

### Bitta-ko'pga (Teskari) / Tegishli

Endi biz postning barcha sharhlariga kirishimiz mumkin bo'lgani uchun, sharhga o'zining ota postiga kirish imkonini beruvchi bog'lanishni aniqlaymiz. `Bitta-ko'pga` bog'lanishning teskari tomonini aniqlash uchun, bola modelda `belongsTo` metodini chaqiradigan bog'lanish metodini aniqlang:

```go
type Post struct {
  orm.Model
  Name   string
  Comments []*Comment
}

type Comment struct {
  orm.Model
  PostID   uint
  Name   string
  Post   *Post
}
```

## Ko'p-ko'pga bog'lanishlar

Ko'p-ko'pga munosabatlar `Bitta-birga` va `Bitta-ko'pga` bog'lanishlarga qaraganda biroz murakkabroq. Ko'p-ko'pga bog'lanishga misol sifatida ko'p rollarga ega bo'lgan foydalanuvchi va bu rollar ilovadagi boshqa foydalanuvchilar tomonidan ham ulashilishi mumkin. Masalan, foydalanuvchiga "Muallif" va "Tahrirchi" roli tayinlanishi mumkin; biroq, bu rollar boshqa foydalanuvchilarga ham tayinlanishi mumkin. Shunday qilib, foydalanuvchida ko'p rollar bor va rolda ko'p foydalanuvchilar bor.

### Jadval tuzilmasi

Ushbu bog'lanishni aniqlash uchun uchta ma'lumotlar bazasi jadvali kerak: `users`, `roles` va `role_user`. `role_user` jadvalining nomi sozlanishi mumkin va u `user_id` va `role_id` ustunlarini o'z ichiga oladi. Ushbu jadval foydalanuvchilar va rollarni bog'laydigan oraliq jadval sifatida ishlatiladi.

Esda tuting, rol ko'p foydalanuvchilarga tegishli bo'lishi mumkinligi sababli, biz oddiygina `roles` jadvaliga `user_id` ustunini joylashtira olmaymiz. Bu rol faqat bitta foydalanuvchiga tegishli bo'lishi mumkinligini anglatardi. Rollarning bir nechta foydalanuvchilarga tayinlanishini qo'llab-quvvatlash uchun `role_user` jadvali kerak. Biz bog'lanishning jadval tuzilishini quyidagicha umumlashtirishimiz mumkin:

```
users
  id - integer
  name - string

roles
  id - integer
  name - string

role_user
  user_id - integer
  role_id - integer
```

### Model tuzilmasi

Biz `User` modelida `Roles` maydonini aniqlashimiz mumkin:

```go
type User struct {
  orm.Model
  Name  string
  Roles   []*Role `gorm:"many2many:role_user"`
}

type Role struct {
  orm.Model
  Name   string
}
```

### Bog'lanishning teskari tomonini aniqlash

Bog'lanishning teskari tomonini aniqlash uchun, shunchaki `Role` modelida `Users` maydonini aniqlang va Teg qo'shing.

```go
type User struct {
  orm.Model
  Name  string
  Roles   []*Role `gorm:"many2many:role_user"`
}

type Role struct {
  orm.Model
  Name   string
  Users  []*User `gorm:"many2many:role_user"`
}
```

### Maxsus oraliq jadval

Umuman olganda, oraliq jadval chet kaliti ota model nomining "ilon yurishi" bilan nomlanadi, siz ularni `joinForeignKey`, `joinReferences` orqali bekor qilishingiz mumkin:

```go
type User struct {
  orm.Model
  Name  string
  Roles   []*Role `gorm:"many2many:role_user;joinForeignKey:UserName;joinReferences:RoleName"`
}

type Role struct {
  orm.Model
  Name   string
}
```

Jadval tuzilmasi:

```
users
  id - integer
  name - string

roles
  id - integer
  name - string

role_user
  user_name - integer
  role_name - integer
```

## Polimorfik

Polimorfik bog'lanish bola modelga bitta bog'lanish yordamida bir nechta turdagi modellarga tegishli bo'lish imkonini beradi. Masalan, foydalanuvchilarga blog postlari va videolarni ulashishga imkon beruvchi ilova yaratayotganingizni tasavvur qiling. Bunday ilovada `Comment` modeli ham `Post`, ham `Video` modellariga tegishli bo'lishi mumkin.

### Jadval tuzilmasi

Polimorfik munosabat oddiy munosabatga o'xshaydi; biroq, bola model bitta bog'lanish yordamida bir nechta turdagi modellarga tegishli bo'lishi mumkin. Masalan, blog `Post` va `User` `Image` modeliga polimorfik munosabatda bo'lishi mumkin. Polimorfik munosabatdan foydalanish sizga postlar va foydalanuvchilar bilan bog'lanishi mumkin bo'lgan noyob rasmlarning bitta jadvaliga ega bo'lish imkonini beradi. Birinchidan, jadval tuzilishini ko'rib chiqamiz:

```
posts
  id - integer
  name - string

videos
  id - integer
  name - string

images
  id - integer
  url - string
  imageable_id - integer
  imageable_type - string

comments
  id - integer
  body - text
  commentable_id - integer
  commentable_type - string
```

`images` jadvalidagi `imageable_id` va `imageable_type` ustunlariga e'tibor bering. `imageable_id` ustuni post yoki foydalanuvchining ID qiymatini o'z ichiga oladi, `imageable_type` ustuni esa ota modelning sinf nomini o'z ichiga oladi. `imageable_type` ustuni Orm tomonidan `imageable` bog'lanishiga murojaat qilganda qaytariladigan ota modelning "turi"ni aniqlash uchun ishlatiladi. `comments` jadvali ham shunga o'xshash.

### Model tuzilmasi

Keyin, bu bog'lanishni qurish uchun zarur bo'lgan model ta'riflarini ko'rib chiqamiz:

```go
type Post struct {
  orm.Model
  Name     string
  Image    *Image `gorm:"polymorphic:Imageable"`
  Comments []*Comment `gorm:"polymorphic:Commentable"`
}

type Video struct {
  orm.Model
  Name     string
  Image    *Image `gorm:"polymorphic:Imageable"`
  Comments []*Comment `gorm:"polymorphic:Commentable"`
}

type Image struct {
  orm.Model
  Name          string
  ImageableID   uint
  ImageableType string
}

type Comment struct {
  orm.Model
  Name            string
  CommentableID   uint
  CommentableType string
}
```

Polimorfik qiymatni `polymorphicValue` tegi orqali o'zgartirishingiz mumkin, masalan:

```go
type Post struct {
  orm.Model
  Name  string
  Image   *Image `gorm:"polymorphic:Imageable;polymorphicValue:master"`
}
```

## Bog'lanishlarni so'rov qilish

Misol uchun, `User` modeli ko'plab bog'langan `Post` modellariga ega bo'lgan blog ilovasi tasavvur qiling:

```go
type User struct {
  orm.Model
  Name   string
  Posts  []*Post
}

type Post struct {
  orm.Model
  UserID   uint
  Name     string
}
```

### Bog'lanishlarni yaratish yoki yangilash

Bog'lanishlarni yaratish va yangilashni boshqarish uchun `Select`, `Omit` metodlaridan foydalanishingiz mumkin. Bu ikki metodni bir vaqtning o'zida ishlatib bo'lmaydi va bog'lanishni boshqarish funksiyalari faqat `Create`, `Update`, `Save` uchun qo'llaniladi:

```go
user := models.User{Name: "user", Posts: []*models.Post{{Name: "post"}}}

// User yaratish bilan birga barcha farzand bog'lanishlarini yaratish
facades.Orm().Query().Select(orm.Associations).Create(&user)

// User yaratishda faqat Post yaratish. Eslatma: Agar `orm.Associations` dan foydalanmasangiz, balki maxsus farzand bog'lanishlarini alohida sozlashingiz kerak bo'lsa, ota modeldagi barcha maydonlar ham ushbu vaqtda ro'yxatga olinishi kerak.
facades.Orm().Query().Select("Name", "Posts").Create(&user)

// User yaratishda Postni e'tiborsiz qoldirish, lekin boshqa barcha farzand bog'lanishlarini yaratish
facades.Orm().Query().Omit("Posts").Create(&user)

// User yaratishda Name maydonini e'tiborsiz qoldirish, lekin barcha farzand bog'lanishlarini yaratish
facades.Orm().Query().Omit("Name").Create(&user)

// User yaratishda Name maydoni va barcha farzand bog'lanishlarini e'tiborsiz qoldirish
facades.Orm().Query().Omit("Name", orm.Associations).Create(&user)
```

### Bog'lanishlarni topish

```go
// Barcha mos keladigan bog'langan yozuvlarni topish
var posts []models.Post
facades.Orm().Query().Model(&user).Association("Posts").Find(&posts)

// Shartlar bilan bog'lanishlarni topish
facades.Orm().Query().Model(&user).Where("name = ?", "goravel").Order("id desc").Association("Posts").Find(&posts)
```

### Bog'lanishlarni qo'shish

`Many To Many`, `One To Many` uchun yangi bog'lanishlarni qo'shing, `One To One`, `One To One(revers)` uchun joriy bog'lanishni almashtiring:

```go
facades.Orm().Query().Model(&user).Association("Posts").Append([]*models.Post{Post1, Post2})

facades.Orm().Query().Model(&user).Association("Posts").Append(&models.Post{Name: "goravel"})
```

### Bog'lanishlarni almashtirish

Joriy bog'lanishlarni yangilari bilan almashtirish:

```go
facades.Orm().Query().Model(&user).Association("Posts").Replace([]*models.Post{Post1, Post2})

facades.Orm().Query().Model(&user).Association("Posts").Replace(models.Post{Name: "goravel"}, Post2)
```

### Bog'lanishlarni o'chirish

Agar mavjud bo'lsa, manba va argumentlar o'rtasidagi bog'lanishni olib tashlang, faqat havolani o'chiring, ob'ektlarni DB dan o'chirmaydi, chet kalit NULL bo'lishi kerak:

```go
facades.Orm().Query().Model(&user).Association("Posts").Delete([]*models.Post{Post1, Post2})

facades.Orm().Query().Model(&user).Association("Posts").Delete(Post1, Post2)
```

### Bog'lanishlarni tozalash

Manba va bog'lanish o'rtasidagi barcha havolalarni olib tashlang, bog'lanishlarni o'chirmaydi:

```go
facades.Orm().Query().Model(&user).Association("Posts").Clear()
```

### Bog'lanishlarni sanash

Joriy bog'lanishlar sonini qaytarish:

```go
facades.Orm().Query().Model(&user).Association("Posts").Count()

// Shartlar bilan sanash
facades.Orm().Query().Model(&user).Where("name = ?", "goravel").Association("Posts").Count()
```

### Paket ma'lumotlar

```go
// Barcha foydalanuvchilar uchun barcha rollarni topish
facades.Orm().Query().Model(&users).Association("Posts").Find(&posts)

// Barcha foydalanuvchilarning Postlaridan User A ni o'chirish
facades.Orm().Query().Model(&users).Association("Posts").Delete(&userA)

// Barcha foydalanuvchilarning Postlarining noyob sonini olish
facades.Orm().Query().Model(&users).Association("Posts").Count()

// `Append`, `Replace` uchun paket ma'lumotlari bilan, argumentlar uzunligi ma'lumotlar uzunligiga teng bo'lishi kerak, aks holda xatolik qaytariladi
var users = []models.User{user1, user2, user3}

// Bizda 3 ta foydalanuvchi bor, user1 jamoasiga userA ni qo'shing, user2 jamoasiga userB ni qo'shing, user3 jamoasiga userA, userB va userC ni qo'shing
facades.Orm().Query().Model(&users).Association("Team").Append(&userA, &userB, &[]models.User{userA, userB, userC})

// user1 jamoasini userA ga, user2 jamoasini userB ga, user3 jamoasini userA, userB va userC ga qayta o'rnating
facades.Orm().Query().Model(&users).Association("Team").Replace(&userA, &userB, &[]models.User{userA, userB, userC})
```

## Oldindan yuklash

Oldindan yuklash bir nechta modellarni so'rov qilish uchun qulaylik yaratadi va "N + 1" so'rov muammosini yengillashtiradi. N + 1 so'rov muammosini tasvirlash uchun, `Author` modeliga "tegishli" bo'lgan `Book` modelini ko'rib chiqing:

```go
type Author struct {
  orm.Model
  Name  string
}

type Book struct {
  orm.Model
  AuthorID   uint
  Name       string
  Author     *Author
}
```

Endi, barcha kitoblarni va ularning mualliflarini olishimiz kerak:

```go
var books []models.Book
facades.Orm().Query().Find(&books)

for _, book := range books {
  var author models.Author
  facades.Orm().Query().Find(&author, book.AuthorID)
}
```

Ma'lumotlar bazasi jadvalidagi barcha kitoblarni ularning mualliflari bilan birga olish uchun, tsikl kodi har bir kitob uchun so'rovni bajaradi. Bu 25 ta kitob to'plami uchun tsikl 26 ta so'rovni ishlatishini anglatadi - bittasi kitoblar to'plami uchun va yana 25 tasi har bir kitobning muallifini olish uchun.

Biroq, biz bu jarayonni oldindan yuklash yordamida soddalashtirishimiz mumkin. `With` metodidan foydalanib, qaysi bog'lanishlar oldindan yuklanishi kerakligini belgilashimiz va so'rovlar sonini faqat ikkitaga qisqartirishimiz mumkin.

```go
var books []models.Book
facades.Orm().Query().With("Muallif").Find(&books)

for _, book := range books {
  fmt.Println(book.Author)
}
```

Ushbu amal uchun faqat ikkita so'rov bajariladi - barcha kitoblarni olish uchun bitta so'rov va barcha kitoblar uchun mualliflarni olish uchun bitta so'rov:

```sql
select * from `books`;

select * from `authors` where `id` in (1, 2, 3, 4, 5, ...);
```

### Bir nechta bog'lanishlarni oldindan yuklash

Ba'zida siz bir nechta turli bog'lanishlarni oldindan yuklashingiz kerak bo'lishi mumkin. Buning uchun, `With` metodini bir necha marta chaqiring:

```go
var book models.Book
facades.Orm().Query().With("Author").With("Publisher").Find(&book)
```

### Ichki oldindan yuklash

Bog'lanishning bog'lanishlarini oldindan yuklash uchun "nuqta" sintaksisidan foydalanishingiz mumkin. Misol uchun, kitobning barcha mualliflarini va muallifning barcha shaxsiy kontaktlarini oldindan yuklaymiz:

```go
var book models.Book
facades.Orm().Query().With("Author.Contacts").Find(&book)
```

### Oldindan yuklashni cheklash

Ba'zida siz bog'lanishni oldindan yuklamoqchi bo'lishingiz mumkin, lekin shu bilan birga oldindan yuklash so'rovi uchun qo'shimcha so'rov shartlarini belgilashingiz kerak bo'ladi. Buni quyidagicha amalga oshirishingiz mumkin:

```go
import "github.com/goravel/framework/contracts/database/orm"

var book models.Book
facades.Orm().Query().With("Author", "name = ?", "author").Find(&book)

facades.Orm().Query().With("Author", func(query orm.Query) orm.Query {
  return query.Where("name = ?", "author")
}).Find(&book)
```

Ushbu misolda, Orm faqat postning `name` ustuni `author` so'ziga teng bo'lgan postlarni oldindan yuklaydi.

### Kechiktirilgan oldindan yuklash

Ba'zida siz ota model allaqachon olingandan keyin bog'lanishni oldindan yuklashingiz kerak bo'lishi mumkin. Misol uchun, agar siz bog'langan modellarni yuklashni dinamik ravishda qaror qilishingiz kerak bo'lsa, bu foydali bo'lishi mumkin:

```go
var books []models.Book
facades.Orm().Query().Find(&books)

for _, book := range books {
  if someCondition {
    err := facades.Orm().Query().Load(&book, "Muallif")
  }
}
```

Agar siz oldindan yuklash so'roviga qo'shimcha so'rov cheklovlarini o'rnatishingiz kerak bo'lsa, quyidagi kodni ishlatishingiz mumkin:

```go
import "github.com/goravel/framework/contracts/database/orm"

var book models.Book
facades.Orm().Query().Load(&book, "Author", "name = ?", "author").Find(&book)

facades.Orm().Query().Load(&book, "Author", func(query orm.Query) orm.Query {
  return query.Where("name = ?", "author")
}).Find(&book)
```

Bog'lanish faqat u allaqachon yuklanmagan bo'lsa yuklash uchun `LoadMissing` metodidan foydalaning:

```go
facades.Orm().Query().LoadMissing(&book, "Muallif")
```
