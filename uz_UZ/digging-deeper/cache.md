# Kesh

[[toc]]

## Kirish

Goravel kengaytiriladigan keshlash modulini taqdim etadi, uni `facades.Cache()` yordamida boshqarish mumkin. Goravel "memory" haydovchisi bilan birga keladi, boshqa haydovchilar uchun mos keladigan mustaqil kengaytma paketlarini tekshiring:

| Haydovchi | Havola                                                                                               |
| --------- | ---------------------------------------------------------------------------------------------------- |
| Redis     | [https://github.com/goravel/redis](https://github.com/goravel/redis) |

## Konfiguratsiya

Barcha maxsus konfiguratsiyalarni `config/cache.go` faylida bajarishingiz kerak.

## Keshdan foydalanish

### Kontekstni kiritish

```go
facades.Cache().WithContext(ctx)
```

### Bir nechta keshlash do'konlariga kirish

Siz `Store` usuli orqali turli xil keshe do'konlariga kirishingiz mumkin. `Store` usuliga o‘tkazilgan kalit sizning keshlash konfiguratsiya faylingizdagi "stores" konfiguratsiya massivida ko‘rsatilgan do‘konlardan biriga mos kelishi kerak:

```go
value := facades.Cache().Store("redis").Get("foo")
```

### Keshdan elementlarni olish

```go
value := facades.Cache().Get("goravel", "default")
value := facades.Cache().GetBool("goravel", true)
value := facades.Cache().GetInt("goravel", 1)
value := facades.Cache().GetString("goravel", "default")
```

Siz standart qiymat sifatida `func` ni o'tkazishingiz mumkin. Agar ko'rsatilgan ma'lumotlar keshdagi mavjud bo'lmasa, `func` natijasi qaytariladi. Tranzitiv yopish usuli sizga ma'lumotlar bazasidan yoki boshqa tashqi xizmatlardan standart qiymatlarni olish imkonini beradi. `func() any` yopish tuzilishini esda tuting.

```go
value := facades.Cache().Get("goravel", func() any {
    return "default"
})
```

### Element Mavjudligini Tekshirish

```go
bool := facades.Cache().Has("goravel")
```

### Qiymatlarni oshirish / kamaytirish

`Increment` va `Decrement` metodlari keshdagi butun sonli elementlarning qiymatini sozlash uchun ishlatilishi mumkin. Ikkala usul ham elementning qiymatini oshirish yoki kamaytirish miqdorini ko'rsatuvchi ixtiyoriy ikkinchi argumentni qabul qiladi:

```go
facades.Cache().Increment("key")
facades.Cache().Increment("key", amount)
facades.Cache().Decrement("key")
facades.Cache().Decrement("key", amount)
```

### Olish va Saqlash

Ba'zan siz keshdan ma'lumot olishni xohlashingiz mumkin va so'ralgan kesh elementi mavjud bo'lmaganda, dastur siz uchun standart qiymatni saqlashi mumkin.

```go
value, err := facades.Cache().Remember("goravel", 5*time.Second, func() (any, error) {
    return "goravel", nil
})
```

Agar siz izlayotgan ma'lumot keshda mavjud bo'lmasa, `Remember` metodiga o'tkazilgan yopilish funktsiyasi bajariladi, so'ngra natija qaytariladi va keshga joylanadi.

Siz ma'lumotlarni keshdan olish yoki uni doimiy saqlash uchun `RememberForever` usulidan foydalanishingiz mumkin:

```go
value, err := facades.Cache().RememberForever("goravel", func() (any, error) {
    return "default", nil
})
```

### Olish va o‘chirish

```go
qiymat := facades.Cache().Pull("goravel", "default")
```

### Elementlarni keshdagi saqlash

```go
err := facades.Cache().Put("goravel", "value", 5*time.Second)
```

Agar keshing amal qilish muddati `0` ga o'rnatilgan bo'lsa, kesh abadiy amal qiladi:

```go
err := facades.Cache().Put("goravel", "value", 0)
```

### Agar mavjud bo‘lmasa, saqlash

`Add` usuli ma'lumotni faqat keshda bo'lmaganda saqlaydi. Agar saqlash muvaffaqiyatli bo'lsa, `true` qaytaradi, aks holda `false` qaytaradi.

```go
bool := facades.Cache().Add("goravel", "qiymat", 5*time.Second)
```

### Elementlarni Abadiy Saqlash

`Forever` usuli ma'lumotlarni keshda doimiy saqlash uchun ishlatilishi mumkin. Bu ma'lumotlar muddati tugamaydiganligi sababli, ular keshdan `Forget` metodi orqali qo'lda o'chirilishi kerak:

```go
bool := facades.Cache().Forever("goravel", "qiymat")
```

### Keshdan elementlarni olib tashlash

```go
bool := facades.Cache().Forget("goravel")
```

Siz barcha keshlarni tozalash uchun `Flush` usulidan foydalanishingiz mumkin:

```go
bool := facades.Cache().Flush()
```

## Atomik qulf

### Qulf boshqarish

Atomik qulfar raqobat sharoitlaridan xavotir olmasdan tarqatilgan qulfarni boshqarish imkonini beradi. Siz `Lock` usuli yordamida qulf yaratishingiz va boshqarishingiz mumkin:

```go
lock := facades.Cache().Lock("foo", 10*time.Second)

agar (lock.Get()) {
    // 10 soniya uchun qulf olindi...

    lock.Release()
}
```

`Get` usuli shuningdek, yopilishni qabul qiladi. Yopilish bajarilgandan so'ng, Goravel avtomatik ravishda qulfni bo'shatadi:

```go
facades.Cache().Lock("foo").Get(func () {
    // Qulf 10 soniya davomida olingan va avtomatik ravishda ozod qilingan...
});
```

Agar siz so‘ragan vaqtda qulf mavjud bo‘lmasa, Goravelga ma’lum sonli soniya kutishni buyurishingiz mumkin. Agar belgilangan vaqt oralig'ida qulfni olish mumkin bo'lmasa, `false` qaytariladi:

```go
lock := facades.Cache().Lock("foo", 10*time.Second)
// 5 soniya maksimal kutishdan so'ng qulf olingan...
if (lock.Block(5*time.Second)) {
    lock.Release()
}
```

Yuqoridagi misol `Block` metodiga yopilishni uzatish orqali soddalashtirilishi mumkin. Ushbu usulga yopilish berilganda, Goravel belgilangan soniyalar davomida qulfni olishga harakat qiladi va yopilish bajarilgandan so'ng qulfni avtomatik ravishda bo'shatadi:

```go
facades.Cache().Lock("foo", 10*time.Second).Block(5*time.Second, func () {
    // 5 soniya maksimal kutishdan so'ng qulf olindi...
})
```

Agar siz qulfni uning hozirgi egasiga hurmat qilmasdan bo'shatmoqchi bo'lsangiz, `ForceRelease` usulidan foydalanishingiz mumkin:

```go
facades.Cache().Lock("processing").ForceRelease();
```

## Maxsus keshlash haydovchilarini qo'shish

### Konfiguratsiya

Agar siz to'liq maxsus haydovchi aniqlashni istasangiz, `config/cache.go` konfiguratsiya faylida `custom` haydovchi turini ko'rsatishingiz mumkin.
Keyin `framework/contracts/cache/Driver` interfeysini amalga oshirish uchun `via` opsiyasini qo'shing:

```go
//config/cache.go
"stores": map[string]interface{}{
    "memory": map[string]any{
        "driver": "memory",
    },
    "custom": map[string]interface{}{
        "driver": "custom",
        "via":    &Logger{},
    },
},
```

### Maxsus haydovchini amalga oshirish

`framework/contracts/cache/Driver` interfeysini amalga oshiring, fayllar `app/extensions` papkasida saqlanishi mumkin (o'zgartirish mumkin).

```go
// framework/contracts/cache/Driver
package cache

import "time"

type Driver interface {
    // Add Driver an item in the cache if the key does not exist.
    Add(key string, value any, t time.Duration) bool
    Decrement(key string, value ...int) (int, error)
    // Forever Driver an item in the cache indefinitely.
    Forever(key string, value any) bool
    // Forget Remove an item from the cache.
    Forget(key string) bool
    // Flush Remove all items from the cache.
    Flush() bool
    // Get Retrieve an item from the cache by key.
    Get(key string, def ...any) any
    GetBool(key string, def ...bool) bool
    GetInt(key string, def ...int) int
    GetInt64(key string, def ...int64) int64
    GetString(key string, def ...string) string
    // Has Check an item exists in the cache.
    Has(key string) bool
    Increment(key string, value ...int) (int, error)
    Lock(key string, t ...time.Duration) Lock
    // Put Driver an item in the cache for a given time.
    Put(key string, value any, t time.Duration) error
    // Pull Retrieve an item from the cache and delete it.
    Pull(key string, def ...any) any
    // Remember Get an item from the cache, or execute the given Closure and store the result.
    Remember(key string, ttl time.Duration, callback func() (any, error)) (any, error)
    // RememberForever Get an item from the cache, or execute the given Closure and store the result forever.
    RememberForever(key string, callback func() (any, error)) (any, error)
    WithContext(ctx context.Context) Driver
}
```
