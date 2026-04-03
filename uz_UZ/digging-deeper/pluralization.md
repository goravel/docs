# Ko'pliklashtirish

[[toc]]

## Kirish

Satrlar har qanday veb-ilova uchun muhimdir. Goravel so'zlarni birlik va ko'plik shakllariga aylantirish uchun oddiy yordamchi dasturlarni taqdim etadi. Sukut bo'yicha **inglizcha** ni qo'llab-quvvatlaydi, lekin siz boshqa tillarni yoki maxsus qoidalarni osongina qo'shishingiz mumkin.

## Asosiy foydalanish

Siz `pluralizer` paketidagi `Ko'plik` va `Yakkalik` usullaridan foydalanishingiz mumkin. Bular ko'pgina inglizcha so'zlarni avtomatik ravishda qayta ishlaydi.

```go
import "github.com/goravel/framework/support/pluralizer"

// So'zlarni ko'p sonli qilish
pluralizer.Plural("goose") // "geese"
pluralizer.Plural("car")   // "cars"

// So'zlarni birlashtirish
pluralizer.Singular("geese") // "goose"
pluralizer.Singular("cars")  // "car"
```

## Maxsus qoidalar

Ba'zan standart qoidalar ma'lum so'zlar uchun yetarli emas. Goravel lets you add your own rules to handle these cases.

:::warning
Qoidalarni qo'shish plyuralizatsiyaning global miqyosda qanday ishlashini o'zgartiradi. Buni ilova ishga tushganda qilishingiz kerak, masalan, xizmat ko'rsatuvchi provayderning "Yuklash" usulida.
:::

### Ingliz tilidagi noto'g'ri fellar

Agar so'z noyob ko'plik shakliga ega bo'lsa, uni "tartibsiz" so'z sifatida ro'yxatdan o'tkazishingiz mumkin. Bu ikkala yo'nalishdagi o'zgarishlarni ham boshqaradi.

```go
import (
	"github.com/goravel/framework/support/pluralizer"
    "github.com/goravel/framework/support/pluralizer/rules"
)

// Register that "mouse" becomes "mice"
pluralizer.RegisterIrregular("english", rules.NewSubstitution("mouse", "mice"))
```

### O'zgartirilmagan so'zlar

"Baliq" yoki "media" kabi ba'zi so'zlar shaklini o'zgartirmaydi yoki har doim ko'plikda bo'ladi. Siz ularni "o'zgartirilmagan" deb belgilashingiz mumkin, shuning uchun pluralizer ularni o'tkazib yuboradi.

```go
// "sheep" birlik va ko'plikda "sheep" bo'lib qoladi
pluralizer.RegisterUninflected("english", "sheep")

// "media" har doim ko'plik sifatida qabul qilinadi
pluralizer.RegisterPluralUninflected("english", "media")

// "data" har doim birlik sifatida qabul qilinadi
pluralizer.RegisterSingularUninflected("english", "data")
```

## Til Yordami

Goravel sukut bo'yicha "inglizcha" dan foydalanadi, lekin agar kerak bo'lsa, tillarni almashtirishingiz yoki yangilarini qo'shishingiz mumkin.

### Tillarni almashtirish

Agar sizda boshqa tillar ro'yxatdan o'tgan bo'lsa, faol tilni "UseLanguage" yordamida almashtirishingiz mumkin.

```go
if err := pluralizer.UseLanguage("spanish"); err != nil {
    panic(err)
}

// Joriy til nomini oling
name := pluralizer.GetLanguage().Name()
```

### Yangi tillar qo'shish

Til qo'shish uchun siz "Til" interfeysini amalga oshirishingiz kerak. Bu so'zlarning o'sha tilda qanday o'zgarishini belgilaydi.

```go
import "github.com/goravel/framework/contracts/support/pluralizer"

type Language interface {
    Name() string
    SingularRuleset() pluralizer.Ruleset
    PluralRuleset() pluralizer.Ruleset
}
```

Til tuzilmangizni amalga oshirgandan so'ng, uni ro'yxatdan o'tkazing va faol deb o'rnating.

```go
import "github.com/goravel/framework/support/pluralizer"

func init() {
    // Yangi tilni ro'yxatdan o'tkazing
    if err := pluralizer.RegisterLanguage(&MyCustomLanguage{}); err != nil {
       panic(err)
    }
    
    // Uni faol sifatida o'rnating
    _ = pluralizer.UseLanguage("my_custom_language")
}
```

## Qo'llab-quvvatlanadigan tillar

Hozirda pluralizer quyidagi tillarni darhol qo'llab-quvvatlaydi:

| Til       | Kod         | Manba                                                                                          |
| :-------- | :---------- | :--------------------------------------------------------------------------------------------- |
| Inglizcha | `inglizcha` | [Manbani ko'rish](https://github.com/goravel/framework/tree/master/support/pluralizer/english) |

_Kelajakdagi nashrlarda ko'proq tillar qo'shiladi. Pull Request orqali yangi tillarga hissa qo'shishingiz mumkin._