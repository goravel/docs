# Matnllar

[[toc]]

## Kirish

Goravel sizga satrlarni osongina boshqarish imkonini beruvchi ravon satrlarni boshqarish kutubxonasini taqdim etadi. Ravon Strings sizga bir nechta satr operatsiyalarini usul zanjiri orqali birlashtirish imkonini beradi, bu yerda usullarning aksariyati qo'shimcha usullarni zanjirlash imkonini beruvchi `support/str.String` misolini qaytaradi. Zanjirli operatsiyalarni qo'llagandan so'ng, oxirgi satr qiymatini olish uchun siz asosiy "satr" qiymatini qaytaradigan "String" usulini chaqirishingiz mumkin.

```go
import "github.com/goravel/framework/support/str"

str.Of("  Goravel  ").Trim().Lower().UpperFirst().String() // "Goravel"
```

## Mavjud usullar

### `Of`

`Of` usuli berilgan satrdan yangi ravon satr namunasini yaratadi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel")
```

### `After`

`After` usuli satrdagi belgilangan qiymatdan keyingi qismini qaytaradi. Agar qiymat bo'sh satr bo'lsa yoki asl satr ichida mavjud bo'lmasa, to'liq satr qaytariladi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World!").After("Hello").String() // " World!"
```

### `AfterLast`

`AfterLast` usuli satrdagi belgilangan qiymatning oxirgi paydo bo'lishidan keyingi qismini qaytaradi. Agar qiymat bo'sh satr bo'lsa yoki asl satr ichida mavjud bo'lmasa, to'liq satr qaytariladi.

```go
import "github.com/goravel/framework/support/str"

str.Of("docs.goravel.dev").AfterLast(".").String() // "dev"
```

### `Append`

`Append` usuli belgilangan qiymatni satr oxiriga qo'shadi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Bowen").Append(" Han").String() // "Bowen Han"
```

### `Basename`

`Basename` usuli yo'lning oxirgi nom komponentini qaytaradi, ixtiyoriy ravishda asosiy nomdan belgilangan qo'shimchani olib tashlaydi.

```go
import "github.com/goravel/framework/support/str"

str.Of("framework/support/str").Basename().String() // "str"

str.Of("framework/support/str.go").Basename(".go").String() // "str"
```

### `Before`

`Before` usuli satrdagi belgilangan qiymatdan oldingi qismini qaytaradi. Agar qiymat bo'sh satr bo'lsa yoki asl satr ichida mavjud bo'lmasa, to'liq satr qaytariladi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World!").Before("World").String() // "Hello "
```

### `BeforeLast`

`BeforeLast` usuli satrdagi belgilangan qiymatning oxirgi paydo bo'lishidan oldingi qismini qaytaradi. Agar qiymat bo'sh satr bo'lsa yoki asl satr ichida mavjud bo'lmasa, to'liq satr qaytariladi.

```go
import "github.com/goravel/framework/support/str"

str.Of("docs.goravel.dev").BeforeLast(".").String() // "docs.goravel"
```

### `Between`

`Between` usuli satrning berilgan ikki qiymat orasidagi qismini qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("[Hello] World!").Between("[", "]").String() // "Hello"
```

### `BetweenFirst`

`BetweenFirst` usuli satrning berilgan ikki qiymatning birinchi paydo bo'lishi orasidagi qismini qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("[Hello] [World]!").BetweenFirst("[", "]").String() // "Hello"
```

### `Camel`

`Camel` usuli satrni `camelCase` ga o'zgartiradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("hello_world").Camel().String() // "helloWorld"
```

### `CharAt`

`CharAt` usuli berilgan indeksdagi belgini qaytaradi. Agar indeks chegaradan tashqarida bo'lsa, bo'sh satr qaytariladi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").CharAt(1) // "o"
```

### `ChopEnd`

`ChopEnd` usuli berilgan qiymat(lar)ni satr oxiridan olib tashlaydi.

```go
import "github.com/goravel/framework/support/str"

str.Of("https://goravel.com").ChopEnd(".dev", ".com").String() // https://goravel
```

### `ChopStart`

`ChopStart` usuli berilgan qiymat(lar)ni satr boshidan olib tashlaydi.

```go
import "github.com/goravel/framework/support/str"

str.Of("https://goravel.dev").ChopStart("http://", "https://").String() // goravel.dev
```

### `Contains`

`Contains` usuli berilgan satr berilgan qiymatni o'z ichiga olganligini aniqlaydi. Usul registrga sezgir. Agar bir nechta qiymat berilgan bo'lsa, satr qiymatlardan birortasini o'z ichiga olsa, `true` qaytariladi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Contains("Gor") // true

str.Of("Hello World").Contains("Gor", "Hello") // true
```

### `ContainsAll`

`ContainsAll` usuli berilgan satr berilgan barcha qiymatlarni o'z ichiga olganligini aniqlaydi. Usul registrga sezgir.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ContainsAll("Hello", "World") // true

str.Of("Hello World").ContainsAll("Hello", "Gor") // false
```

### `Dirname`

`Dirname` usuli yo'lning ota-ona qismini qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("framework/support/str").Dirname().String() // "framework/support"
```

Ixtiyoriy ravishda, yo'ldan kesib tashlash uchun kataloq darajasini ko'rsatishingiz mumkin.

```go
import "github.com/goravel/framework/support/str"

str.Of("framework/support/str").Dirname(2).String() // "framework"
```

### `EndsWith`

`EndsWith` usuli berilgan satr berilgan qiymat bilan tugaydiganligini aniqlaydi. Usul registrga sezgir.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").EndsWith("vel") // true
```

Satr qiymatlardan birortasi bilan tugashini aniqlash uchun usulga bir nechta qiymat o'tkazishingiz mumkin.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").EndsWith("vel", "lie") // true
```

### `Exactly`

`Exactly` usuli berilgan satr berilgan qiymatga ancha tengligini aniqlaydi. Usul registrga sezgir.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Exactly("Goravel") // true
```

### `Except`

`Except` usuli satrdan berilgan qiymatning birinchi paydo bo'lishiga mos keladigan parchani ajratib oladi.

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").
	Excerpt("beautiful", str.ExcerptOption{
        Radius: 5,
    }).String() // "...is a beautiful morn...
```

Bundan tashqari, parchoni ko'rsatish uchun ishlatiladigan satrni o'zgartirish uchun `Omission` opsiyasidan foydalanishingiz mumkin.

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").
    Excerpt("beautiful", str.ExcerptOption{
        Radius: 5,
        Omission: "(...)"
    }).String() // "(...)is a beautiful morn(...)"
```

### `Explode`

`Explode` usuli satrni berilgan ajratgich yordamida satrlar massiviga ajratadi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Explode(" ") // []string{"Hello", "World"}
```

### `Finish`

`Finish` usuli berilgan satr berilgan qiymat bilan tugashiga ishonch hosil qiladi. Agar satr allaqachon qiymat bilan tugasa, u qayta qo'shilmaydi.

```go
import "github.com/goravel/framework/support/str"

str.Of("framework").Finish("/").String() // "framework/"

str.Of("framework/").Finish("/").String() // "framework/"
```

### `Headline`

`Headline` usuli satrni sarlavhaga o'zgartiradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("bowen_han").Headline().String() // "Bowen Han"

str.Of("HelloWorld").Headline().String() // "Hello World"
```

### `Is`

`Is` usuli berilgan satr berilgan andozaga mos kelishini aniqlaydi. Usul katta-kichik harflarga sezgir.

```go
import "github.com/goravel/framework/support/str"

str.Of("foo123").Is("bar*", "baz*", "foo*") // true
```

### `IsEmpty`

`IsEmpty` usuli berilgan satr bo‘sh ekanligini aniqlaydi.

```go
import "github.com/goravel/framework/support/str"

str.Of("").IsEmpty() // true
```

### `IsNotEmpty`

`IsNotEmpty` usuli berilgan satr bo‘sh emasligini aniqlaydi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").IsNotEmpty() // true
```

### `IsAscii`

`IsAscii` usuli berilgan satr faqat ASCII belgilardan iborat ekanligini aniqlaydi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").IsAscii() // true

str.Of("你好").IsAscii() // false
```

### `IsSlice`

`IsSlice` usuli berilgan satr kesim (slice) ekanligini aniqlaydi.

```go
import "github.com/goravel/framework/support/str"

str.Of(`[{"name": "John"}, {"name": "Alice"}]`).IsSlice() // true

str.Of(`{"name": "John"}`).IsSlice() // false
```

### `IsMap`

`IsMap` usuli berilgan satr xarita (map) ekanligini aniqlaydi.

```go
import "github.com/goravel/framework/support/str"

str.Of(`{"name": "John"}`).IsMap() // true

str.Of(`[{"name": "John"}, {"name": "Alice"}]`).IsMap() // false
```

### `IsUlid`

`IsUlid` usuli berilgan satr ULID ekanligini aniqlaydi.

```go
import "github.com/goravel/framework/support/str"

str.Of("01E5Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6").IsUlid() // true

str.Of("krishan").IsUlid() // false
```

### `IsUuid`

`IsUuid` usuli berilgan satr UUID ekanligini aniqlaydi.

```go
import "github.com/goravel/framework/support/str"

str.Of("550e8400-e29b-41d4-a716-446655440000").IsUuid() // true

str.Of("krishan").IsUuid() // false
```

### `Kebab`

`Kebab` usuli satrni `kebab-case` ga o‘zgartiradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("GoravelFramework").Kebab().String() // "goravel-framework"
```

### `LcFirst`

`LcFirst` usuli satrning birinchi belgisini kichik harfga o‘zgartiradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel Framework").LcFirst().String() // "goravel Framework"
```

### `Length`

`Length` usuli satr uzunligini qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Length() // 7
```

### `Limit`

`Limit` usuli satrni berilgan uzunlikka qisqartiradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").Limit(7).String() // "This is..."
```

Ixtiyoriy ravishda, siz qisqartirishni ko‘rsatish uchun ishlatiladigan satrni o‘zgartirish uchun ikkinchi argumentni taqdim etishingiz mumkin.

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a beautiful morning").Limit(7, " (****)").String() // "This is (****)"
```

### `Lower`

`Lower` usuli satrni kichik harflarga o‘zgartiradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("GORAVEL").Lower().String() // "goravel"
```

### `LTrim`

`LTrim` usuli satrning chap tomonini kesib tashlaydi.

```go
import "github.com/goravel/framework/support/str"

str.Of("  Goravel  ").LTrim().String() // "Goravel  "

str.Of("/framework/").LTrim("/").String() // "framework/"
```

### `Mask`

`Mask` usuli satrni berilgan maska belgisi bilan yashiradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("krishan@email.com").Mask("*", 3).String() // "kri**************"
```

Agar kerak bo‘lsa, siz maska usuliga manfiy sonni taqdim etishingiz mumkin, bu usulga satr oxiridan yashirishni boshlashni ko‘rsatadi.

```go
import "github.com/goravel/framework/support/str"

str.Of("krishan@email.com").Mask("*", -13, 3).String() // "kris***@email.com"

str.Of("krishan@email.com").Mask("*", -13).String() // "kris**************"
```

### `Match`

`Match` usuli berilgan satr berilgan oddiy ifodaga mos kelishini aniqlaydi.

```go
import "github.com/goravel/framework/support/str"

str.Of("This is a (test) string").Match(`\([^)]+\)`).String() // (test)
```

### `MatchAll`

`MatchAll` usuli berilgan satr berilgan barcha oddiy ifodalarga mos kelishini aniqlaydi.

```go
import "github.com/goravel/framework/support/str"

str.Of("abc123def456def").MatchAll(`\d+`) // []string{"123", "456"}
```

### `IsMatch`

`IsMatch` usuli berilgan satr (har qanday) berilgan oddiy ifodaga mos kelishini aniqlaydi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, Goravel!").IsMatch(`(?i)goravel`, `goravel!(.*)`) // true
```

### `NewLine`

`NewLine` usuli satrga yangi qator belgisini qo‘shadi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").NewLine(2).Append("Framework").String() // "Goravel\n\nFramework"
```

### `PadBoth`

`PadBoth` usuli satrning ikkala tomonini to‘ldiradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello").PadBoth(10, "_").String() // "__Hello___"
```

### `PadLeft`

`PadLeft` usuli satrning chap tomonini to‘ldiradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello").PadLeft(10, "_").String() // "_____Hello"
```

### `PadRight`

`PadRight` usuli satrning o‘ng tomonini to‘ldiradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello").PadRight(10, "_").String() // "Hello_____"
```

### `Pipe`

`Pipe` usuli satrni berilgan yopilish (closure) yordamida o‘zgartirishga imkon beradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Pipe(func(s string) string {
    return s + " Framework"
}).String() // "Goravel Framework"
```

### `Plural`

`Plural` usuli birlik shaklidagi satrni ko‘plik shakliga o‘zgartiradi. Bu funksiya [pluralizer](pluralization.md) tomonidan qo‘llab-quvvatlanadigan har qanday tilni qo‘llab-quvvatlaydi.

```go
import "github.com/goravel/framework/support/str"

plural := str.Of("goose").Plural().String()
// "geese"
```

Satrning birlik yoki ko‘plik shaklini olish uchun funksiyaga butun son argumentini taqdim etishingiz mumkin:

```go
import "github.com/goravel/framework/support/str"

plural := str.Of("goose").Plural(2).String()
// "geese"

plural = str.Of("goose").Plural(1).String()
// "goose"
```

### `Prepend`

`Prepend` usuli berilgan qiymatni satrning boshiga qo‘shadi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Framework").Prepend("Goravel ").String() // "Goravel Framework"
```

### `Remove`

`Remove` usuli berilgan qiymat(lar)ni satrdan olib tashlaydi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Remove("World").String() // "Hello "

str.Of("Hello World").Remove("World", "Hello").String() // " "
```

### `Takrorlash`

`Takrorlash` metodi matnni berilgan son marta takrorlaydi.

```go
import "github.com/goravel/framework/support/str"

str.Of("a").Repeat(2).String() // "aa"
```

### `Almashtirish`

`Almashtirish` metodi matndagi berilgan qiymatni almashtiradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Replace("World", "Krishan").String() // "Hello Krishan"
```

Sukut boʻyicha, `Almashtirish` metodi katta-kichik harflarga sezgir. Agar metod katta-kichik harflarga sezgir boʻlmasligini xohlasangiz, uchinchi argument sifatida `false` ni oʻtkazishingiz mumkin.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Replace("world", "Krishan", false).String() // "Hello Krishan"
```

### `Oxirini almashtirish`

`Oxirini almashtirish` metodi matndagi berilgan qiymatning oxirgi takrorlanishini faqat matn oxirida boʻlsa almashtiradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ReplaceEnd("World", "Goravel").String() // "Hello Goravel"

str.Of("Hello World").ReplaceEnd("Hello", "Goravel").String() // "Hello World"
```

### `Birinchi takrorlanishni almashtirish`

`Birinchi takrorlanishni almashtirish` metodi matndagi berilgan qiymatning birinchi takrorlanishini almashtiradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ReplaceFirst("World", "Goravel").String() // "Hello Goravel"
```

### `Oxirgi takrorlanishni almashtirish`

`Oxirgi takrorlanishni almashtirish` metodi matndagi berilgan qiymatning oxirgi takrorlanishini almashtiradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ReplaceLast("World", "Goravel").String() // "Hello Goravel"
```

### `Moslamalarni almashtirish`

`Moslamalarni almashtirish` metodi matndagi berilgan oddiy ifoda moslamalarini almashtiradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, Goravel!").ReplaceMatches(`goravel!(.*)`, "Krishan") // "Hello, Krishan!"
```

### `Boshini almashtirish`

`Boshini almashtirish` metodi matndagi berilgan qiymatning birinchi takrorlanishini faqat matn boshida boʻlsa almashtiradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").ReplaceStart("Hello", "Goravel").String() // "Goravel World"

str.Of("Hello World").ReplaceStart("World", "Goravel").String() // "Hello World"
```

### `Oʻng tomondan kesish`

`Oʻng tomondan kesish` metodi matnning oʻng tomonini kesadi.

```go
import "github.com/goravel/framework/support/str"

str.Of("  Goravel  ").RTrim().String() // "  Goravel"

str.Of("/framework/").RTrim("/").String() // "/framework"
```

### `Singular`

`Singular` usuli satrni uning birlik shakliga o‘zgartiradi. Bu funksiya [pluralizer](pluralization.md) tomonidan qo‘llab-quvvatlanadigan har qanday tilni qo‘llab-quvvatlaydi.

```go
import "github.com/goravel/framework/support/str"

singular := str.Of("heroes").Singular().String()
// "hero"
```

### `Iloncha`

`Iloncha` metodi matnni `iloncha_kichik` formatiga oʻtkazadi.

```go
import "github.com/goravel/framework/support/str"

str.Of("GoravelFramework").Snake().String() // "goravel_framework"
```

### `Ajratish`

`Ajratish` metodi matnni berilgan ajratgich yordamida matnlar massiviga ajratadi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello World").Split(" ") // []string{"Hello", "World"}
```

### `Siquvchan`

`Siquvchan` metodi ketma-ket boʻsh joy belgilarini bitta boʻsh joy bilan almashtiradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello    World").Squish().String() // "Hello World"
```

### `Boshlash`

`Boshlash` metodi matn allaqachon berilgan qiymat bilan boshlanmasa, uning boshiga berilgan qiymatning bitta nusxasini qoʻshadi.

```go
import "github.com/goravel/framework/support/str"

str.Of("framework").Start("/").String() // "/framework"

str.Of("/framework").Start("/").String() // "/framework"
```

### `Bilan boshlanadi`

`Bilan boshlanadi` metodi berilgan matn (har qanday) berilgan qiymat(lar) bilan boshlanadimi yoki yoʻqligini aniqlaydi. Metod katta-kichik harflarga sezgir.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").StartsWith("Gor") // true

str.Of("Hello World").StartsWith("Gor", "Hello") // true
```

### `Matn`

`Matn` metodi matnni qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").String() // "Goravel"
```

### `Studli`

`Studli` metodi matnni `StudliKatta` formatiga oʻtkazadi.

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel_framework").Studly().String() // "GoravelFramework"
```

### `Kesma`

`Kesma` metodi matnning berilgan indeksdan boshlab berilgan uzunlikdagi qismini qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Substr(1, 3) // "ora"
```

### `Almashtir`

`Almashtir` metodi matndagi bir nechta qiymatlarni almashtiradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Golang is awesome").Swap(map[string]string{
		"Golang":  "Go",
		"awesome": "excellent",
	}).String() // "Go is excellent"
```

### `Tepish`

`Tepish` metodi matnni berilgan yopiq funksiyaga oʻtkazadi va matnni qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Tap(func(s string) {
    fmt.Println(s)
}).String() // "Goravel"
```

### `Test`

`Test` metodi berilgan matn berilgan oddiy ifodaga mos keladimi yoki yoʻqligini aniqlaydi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, Goravel!").Test(`goravel!(.*)`) // true
```

### `Sarlavha`

`Sarlavha` metodi matnni `Sarlavha Katta` formatiga oʻtkazadi.

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel framework").Title().String() // "Goravel Framework"
```

### `Kesish`

`Kesish` metodi matnni kesadi.

```go
import "github.com/goravel/framework/support/str"

str.Of("  Goravel  ").Trim().String() // "Goravel"

str.Of("/framework/").Trim("/").String() // "framework"
```

### `Birinchi harfni katta`

`Birinchi harfni katta` metodi matnning birinchi belgisini katta harfga oʻtkazadi.

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel framework").UcFirst().String() // "Goravel framework"
```

### `Katta harflar bilan ajratish`

`Katta harflar bilan ajratish` metodi matnni katta harflar yordamida matnlar massiviga ajratadi.

```go
import "github.com/goravel/framework/support/str"

str.Of("GoravelFramework").UcSplit() // []string{"Goravel", "Framework"}
```

### `Agar boʻlmasa`

`Agar boʻlmasa` metodi matnni berilgan yopiq funksiyaga oʻtkazadi va agar berilgan shart `false` boʻlsa, matnni qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").Unless(func(s *String) bool {
        return false
    }, func(s *String) *String {
        return Of("Fallback Applied")
    }).String() // "Fallback Applied"
```

### `Katta`

`Katta` metodi matnni katta harflarga oʻtkazadi.

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel").Upper().String() // "GORAVEL"
```

### `Qachonki`

`When` usuli satrni berilgan yopilishga uzatadi va agar berilgan shart `true` bo‘lsa, satrni qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Bowen").When(true, func(s *str.String) *str.String {
    return s.Append(" Han")
}).String() // "Bowen Han"
```

Agar kerak bo‘lsa, `When` usuliga uchinchi argument sifatida yopilishni taqdim etishingiz mumkin, u shart `false` bo‘lganda bajariladi.

### `WhenContains`

`WhenContains` usuli satrni berilgan yopilishga uzatadi va agar berilgan satr berilgan qiymatni o‘z ichiga olsa, satrni qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello Bowen").WhenContains("Hello", func(s *str.String) *str.String {
    return s.Append(" Han")
}).String() // "Hello Bowen Han"
```

Agar kerak bo‘lsa, `WhenContains` usuliga uchinchi argument sifatida yopilishni taqdim etishingiz mumkin, u satr berilgan qiymatni o‘z ichiga olmaganda bajariladi.

### `WhenContainsAll`

`WhenContainsAll` usuli satrni berilgan yopilishga uzatadi va agar berilgan satr berilgan barcha qiymatlarni o‘z ichiga olsa, satrni qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello Bowen").WhenContainsAll([]string{"Hello", "Bowen"}, func(s *str.String) *str.String {
    return s.Append(" Han")
}).String() // "Hello Bowen Han"
```

Agar kerak bo‘lsa, `WhenContainsAll` usuliga uchinchi argument sifatida yopilishni taqdim etishingiz mumkin, u satr berilgan barcha qiymatlarni o‘z ichiga olmaganda bajariladi.

### `WhenEmpty`

`WhenEmpty` usuli satrni berilgan yopilishga uzatadi va agar berilgan satr bo‘sh bo‘lsa, satrni qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("").WhenEmpty(func(s *str.String) *str.String {
    return s.Append("Goravel")
}).String() // "Goravel"
```

### `WhenIsAscii`

`WhenIsAscii` usuli satrni berilgan yopilishga uzatadi va agar berilgan satr faqat ASCII belgilardan iborat bo‘lsa, satrni qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").WhenIsAscii(func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String() // "Goravel Framework"

str.Of("你好").WhenIsAscii(func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String() // "你好"
```

### `WhenNotEmpty`

`WhenNotEmpty` usuli satrni berilgan yopilishga uzatadi va agar berilgan satr bo‘sh bo‘lmasa, satrni qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").WhenNotEmpty(func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String() // "Goravel Framework"
```

### `WhenStartsWith`

`WhenStartsWith` usuli satrni berilgan yopilishga uzatadi va agar berilgan satr berilgan qiymat bilan boshlansa, satrni qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("hello world").WhenStartsWith("hello", func(s *str.String) *str.String {
    return s.Title()
}).String() // "Hello World"
```

### `WhenEndsWith`

`WhenEndsWith` usuli satrni berilgan yopilishga uzatadi va agar berilgan satr berilgan qiymat bilan tugasa, satrni qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("hello world").WhenEndsWith("world", func(s *str.String) *str.String {
    return s.Title()
}).String() // "Hello World"
```

### `WhenExactly`

`WhenExactly` usuli satrni berilgan yopilishga uzatadi va agar berilgan satr berilgan qiymatga aniq teng bo‘lsa, satrni qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").WhenExactly("Goravel", func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String() // "Goravel Framework"
```

### `WhenNotExactly`

`WhenNotExactly` usuli satrni berilgan yopilishga uzatadi va agar berilgan satr berilgan qiymatga aniq teng bo‘lmasa, satrni qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Goravel").WhenNotExactly("Goravel", func(s *str.String) *str.String {
    return s.Append(" Framework")
}).String() // "Goravel"
```

### `WhenIs`

`WhenIs` usuli satrni berilgan yopilishga uzatadi va agar berilgan satr berilgan andozaga mos kelsa, satrni qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("foo/bar").WhenIs("foo/*", func(s *str.String) *str.String {
    return s.Append("/baz")
}).String() // "foo/bar/baz"
```

### `WhenIsUlid`

`WhenIsUlid` usuli satrni berilgan yopilishga uzatadi va agar berilgan satr ULID bo‘lsa, satrni qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("01E5Z6Z1Z6Z1Z6Z1Z6Z1Z6Z1Z6").WhenIsUlid(func(s *str.String) *str.String {
    return s.Substr(0, 10)
}).String() // "01E5Z6Z1Z6"
```

### `WhenIsUuid`

`WhenIsUuid` usuli satrni berilgan yopilishga uzatadi va agar berilgan satr UUID bo‘lsa, satrni qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("550e8400-e29b-41d4-a716-446655440000").WhenIsUuid(func(s *str.String) *str.String {
    return s.Substr(0, 8)
}).String() // "550e8400"
```

### `WhenTest`

`WhenTest` usuli satrni berilgan yopilishga uzatadi va agar berilgan satr berilgan muntazam ifodaga mos kelsa, satrni qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("goravel framework").WhenTest(`goravel(.*)`, func(s *str.String) *str.String {
    return s.Append(" is awesome")
}).String() // "goravel framework is awesome"
```

### `WordCount`

`WordCount` usuli satrdagi so‘zlar sonini qaytaradi.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, World!").WordCount() // 2
```

### `Words`

`Words` usuli satrdagi so‘zlar sonini cheklaydi. Agar kerak bo‘lsa, ikkinchi argument sifatida qisqartirishni ko‘rsatish uchun ishlatiladigan satrni o‘zgartirish mumkin.

```go
import "github.com/goravel/framework/support/str"

str.Of("Hello, World!").Words(1) // "Hello..."

str.Of("Hello, World!").Words(1, " (****)") // "Hello (****)"
```
