# To'plamlar

[[toc]]

## Kirish

Goravel `github.com/goravel/framework/support/collect` paketi orqali fluent to'plam API sini taqdim etadi. To'plamlar kesim ma'lumotlarini zanjirlanadigan metodlar bilan filtrlash, o'zgartirish, yig'ish va tekshirishni qulay qiladi.

Paket ikkita to'plam turini taqdim etadi:

- `Collection`: xotirada allaqachon yuklangan ma'lumotlar bilan ishlaydigan eager to'plam.
- `LazyCollection`: faqat terminal metod chaqirilganda quvurlarni baholaydigan lazy to'plam.

```go
import "github.com/goravel/framework/support/collect"
```

## To'plamlarni Yaratish

Variadik argumentlardan to'plam yaratish uchun `collect.New` dan foydalaning:

```go
numbers := collect.New(1, 2, 3, 4, 5)
```

Mavjud kesimdan to'plam yaratish uchun `collect.Of` dan foydalaning:

```go
items := []string{"apple", "banana", "cherry"}
fruits := collect.Of(items)
```

Barcha asosiy elementlarni `All` bilan olishingiz mumkin:

```go
fruits.All() // []string{"apple", "banana", "cherry"}
```

## Asosiy Operatsiyalar

To'plamlar elementlarni o'qish va o'zgartirish uchun umumiy metodlarni taqdim etadi:

```go
numbers := collect.New(1, 2, 3, 4, 5)

numbers.Count()      // 5
numbers.IsEmpty()    // false
numbers.IsNotEmpty() // true
*numbers.First()     // 1
*numbers.Last()      // 5
numbers.Contains(3)  // true
numbers.Search(4)    // 3
```

Ba'zi metodlar joriy to'plamni o'zgartiradi va zanjirlash uchun uni qaytaradi:

```go
numbers.Push(6).Prepend(0)
numbers.All() // []int{0, 1, 2, 3, 4, 5, 6}
```

O'zgartiruvchi metodlarga `Push`, `Prepend`, `Pop`, `Pull`, `Shift`, `Unshift`, `Forget`, `Put`, `Splice` va `Transform` kiradi. `Push`, `Prepend`, `Forget`, `Put` va `Transform` kabi metodlar joriy to'plamni qaytaradi, `Pop`, `Pull`, `Shift` va `Splice` kabi metodlar esa olib tashlangan element yoki elementlarni qaytaradi.

## Filtrlash va Xaritalash

Elementlarni callback orqali saqlash yoki olib tashlash uchun `Filter` va `Reject` dan foydalaning:

```go
numbers := collect.New(1, 2, 3, 4, 5, 6)

evens := numbers.Filter(func(n int, _ int) bool {
    return n%2 == 0
})

evens.All() // []int{2, 4, 6}
```

Har bir elementni o'zgartirish uchun `Map` dan foydalaning. `Map` metodi `*collect.Collection[any]` qaytaradi, chunki callback har qanday turni qaytarishi mumkin:

```go
labels := numbers.Map(func(n int, i int) any {
    return fmt.Sprintf("item_%d_%d", i, n)
})

labels.All() // []any{"item_0_1", "item_1_2", ...}
```

Boshqa o'zgartirish yordamchilariga `FlatMap`, `MapInto`, `MapSpread`, `MapToDictionary`, `MapToGroups` va `MapWithKeys` kiradi.

Takroriy qiymatlar bilan ishlash uchun `Unique`, `UniqueBy` va `Duplicates` dan foydalaning. `Duplicates` metodi har bir takroriy qiymatni bir marta qaytaradi:

```go
numbers := collect.New(1, 2, 2, 3, 3, 3)

numbers.Unique().All()     // []int{1, 2, 3}
numbers.Duplicates().All() // []int{2, 3}
```

## Structlar Bilan Ishlash

`Where` metodi callback filtrlash va Laravel uslubidagi maydon taqqoslashlarini qo'llab-quvvatlaydi.

```go
type User struct {
    ID        int
    Name      string
    Age       int
    Country   string
    Balance   float64
    DeletedAt *time.Time
}

users := collect.Of([]User{
    {ID: 1, Name: "Alice", Age: 25, Country: "FR", Balance: 150},
    {ID: 2, Name: "Bob", Age: 30, Country: "US", Balance: 80},
    {ID: 3, Name: "Charlie", Age: 25, Country: "FR", Balance: 200},
})

frenchUsers := users.Where("Country", "FR")
youngUsers := users.Where("Age", "=", 25)
numericAgeUsers := users.Where("Age", "=", "25")
richUsers := users.Where("Balance", ">", 100)
adultUsers := users.Where(func(user User) bool {
    return user.Age >= 18
})
```

Qo'llab-quvvatlanadigan taqqoslash operatorlari: `=`, `==`, `!=`, `>`, `>=`, `<`, `<=`, `like` va `not like`. Tenglik taqqoslashlari oddiy aralash sonli qiymatlarni qo'llab-quvvatlaydi, shuning uchun butun sonli maydon `"25"` kabi sonli matnga mos kelishi mumkin.

Shuningdek, maydonga xos yordamchilardan foydalanishingiz mumkin:

```go
activeUsers := users.WhereNull("DeletedAt")
deletedUsers := users.WhereNotNull("DeletedAt")
selectedUsers := users.WhereIn("Country", []any{"FR", "US"})
otherUsers := users.WhereNotIn("Country", []any{"FR"})
names := users.Pluck("Name")
```

## Agregatlar

To'plam agregat yordamchilari elementlardan qiymatlarni hisoblaydi:

```go
numbers := collect.New(1, 2, 3, 4, 5)

numbers.Sum(func(n int) float64 { return float64(n) }) // 15
numbers.Avg(func(n int) float64 { return float64(n) }) // 3
numbers.Min(func(n int) float64 { return float64(n) }) // 1
numbers.Max(func(n int) float64 { return float64(n) }) // 5
```

To'plamdan bitta qiymat yaratish kerak bo'lganda `Reduce` dan foydalaning:

```go
total := numbers.Reduce(func(acc any, n int, _ int) any {
    return acc.(int) + n
}, 0)
```

## Saralash va Kesish

To'plamlar ma'lumotlarni tartiblash va kesish uchun yordamchilarni o'z ichiga oladi:

```go
numbers := collect.New(5, 1, 4, 2, 3)

numbers.Sort(func(a, b int) bool { return a < b }).All() // []int{1, 2, 3, 4, 5}
numbers.Reverse().All()                                  // []int{3, 2, 4, 1, 5}
numbers.Take(3).All()                                    // []int{5, 1, 4}
numbers.Skip(2).All()                                    // []int{4, 2, 3}
numbers.Slice(2).All()                                   // []int{4, 2, 3}
numbers.Chunk(2)                                         // [][]int{{5, 1}, {4, 2}, {3}}
```

Elementlarni joyida olib tashlash yoki qo'shish kerak bo'lganda `Splice` dan foydalaning. U joriy to'plamni o'zgartiradi va olib tashlangan elementlarni qaytaradi. Manfiy `deleteCount` `0` sifatida qabul qilinadi, shuning uchun u mavjud elementlarni olib tashlamasdan qo'shadi:

```go
letters := collect.New("a", "b", "c", "d")

removed := letters.Splice(1, 2, "x")
removed.All() // []string{"b", "c"}
letters.All() // []string{"a", "x", "d"}

inserted := letters.Splice(1, -1, "y")
inserted.All() // []string{}
letters.All()  // []string{"a", "y", "x", "d"}
```

Structlar uchun kalit funksiyasi bilan `SortBy` yoki `SortByDesc` dan foydalaning:

```go
sortedUsers := users.SortBy(func(user User) string {
    return user.Name
})
```

## Shartli Operatsiyalar

Fluent zanjirni saqlagan holda shartli o'zgartirishlarni qo'llash uchun `When` va `Unless` dan foydalaning:

```go
result := collect.New(1, 2, 3, 4, 5).
    When(true, func(c *collect.Collection[int]) *collect.Collection[int] {
        return c.Filter(func(n int, _ int) bool { return n > 2 })
    }).
    Unless(false, func(c *collect.Collection[int]) *collect.Collection[int] {
        return c.Take(2)
    })

result.All() // []int{3, 4}
```

Zanjirni buzmasdan yon effektlarni ishga tushirish uchun `Tap` dan foydalaning:

```go
numbers.Tap(func(c *collect.Collection[int]) {
    fmt.Println("Processing", c.Count(), "items")
})
```

## Lazy To'plamlar

Lazy to'plamlar katta ma'lumotlar to'plamlari yoki generatsiya qilingan qiymatlar uchun foydalidir, chunki oraliq operatsiyalar `All`, `Count`, `First`, `Collect`, `Sum` yoki `LazyReduce` kabi terminal metod yoki yordamchi chaqirilmaguncha bajarilmaydi.

Kesimlardan, diapazonlardan, generatorlardan, funksiyalardan, takroriy qiymatlardan yoki kanallardan lazy to'plamlar yarating:

```go
lazy := collect.LazyOf([]int{1, 2, 3, 4, 5})
lazy = collect.LazyNew(1, 2, 3, 4, 5)

rangeItems := collect.LazyRange(1, 1000000)
generated := collect.LazyGenerate(func(i int) int {
    return i * 2
}, 100)
repeated := collect.LazyRepeat("Goravel", 3)
```

Lazy operatsiyalarni zanjirlang va faqat kerakli elementlarni iste'mol qiling:

```go
result := collect.LazyRange(1, 1000000).
    Filter(func(n int, _ int) bool { return n%100 == 0 }).
    Take(5).
    All()

result // []int{100, 200, 300, 400, 500}
```

Lazy to'plamlar cheklangan kanal ishlab chiqaruvchilari uchun erta chiqish operatsiyalarini xavfsiz boshqaradi. `First`, `FirstWhere`, `Contains`, `Every`, `IsEmpty`, `Take` va `TakeWhile` kabi metodlar erta to'xtaganda qolgan kiritishni to'kadi.

Lazy to'plamni eager to'plamga aylantirish uchun `Collect` dan foydalaning:

```go
eager := collect.LazyRange(1, 10).Collect()
```

Lazy to'plamni boshqa konkret turga xaritalashda `LazyMap` yordamchisidan foydalaning:

```go
numbers := collect.LazyOf([]string{"1", "2", "3"})

ints := collect.LazyMap(numbers, func(value string, _ int) int {
    n, _ := strconv.Atoi(value)
    return n
})

ints.All() // []int{1, 2, 3}
```

## Metodlar Ko'rinishi

Umumiy eager to'plam metodlari:

| Kategoriya | Metodlar |
| --- | --- |
| Yaratish | `New`, `Of` |
| O'qish | `All`, `Count`, `First`, `Last`, `Get`, `Has`, `Contains`, `ContainsStrict`, `DoesntContain`, `Search`, `SearchBy`, `Random` |
| O'zgartirish | `Map`, `FlatMap`, `MapInto`, `MapSpread`, `Transform`, `Reverse`, `Shuffle`, `Concat`, `Collapse`, `Unique`, `UniqueBy`, `Duplicates` |
| Filtrlash | `Filter`, `Reject`, `Where`, `WhereIn`, `WhereNotIn`, `WhereNull`, `WhereNotNull` |
| Agregat | `Sum`, `Avg`, `Min`, `Max`, `Median`, `Mode`, `Reduce`, `CountBy` |
| Kesish | `Chunk`, `Slice`, `Take`, `Skip`, `Split`, `ForPage`, `Splice` |
| Utilit | `Clone`, `Tap`, `Pipe`, `ToJson`, `Join`, `KeyBy`, `Pluck`, `Zip` |

Umumiy lazy to'plam metodlari:

| Kategoriya | Metodlar |
| --- | --- |
| Yaratish | `LazyNew`, `LazyOf`, `LazyRange`, `LazyGenerate`, `LazyFromFunc`, `LazyFromChannel`, `LazyRepeat` |
| Quvur | `Filter`, `Reject`, `Map`, `FlatMap`, `Where`, `WhereIn`, `WhereNotIn`, `Take`, `Skip`, `TakeWhile`, `SkipWhile`, `Unique`, `UniqueBy`, `Sort` |
| Terminal | `All`, `Count`, `First`, `FirstWhere`, `Last`, `Contains`, `Every`, `IsEmpty`, `IsNotEmpty`, `Collect`, `Sum`, `Avg`, `Min`, `Max`, `ToJson`, `Iterator` |
| Umumiy | `LazyMap`, `LazyReduce` |
