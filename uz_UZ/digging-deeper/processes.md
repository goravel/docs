# Jarayonlar

[[toc]]

## Kirish

Goravel Go'ning standart `os/exec` paketi atrofida ifodali va oqlangan API taqdim etadi, bu sizga ilovangizdan tashqi buyruqlarni muammosiz chaqirish imkonini beradi. Odatiy bo'lib, Go'ning jarayonlarni boshqarishi batafsil bo'lishi mumkin; Goravel'ning "Jarayon" jabhasi bu umumiy vazifani soddalashtiradi, buyruqlarni bajarish, chiqishlarni boshqarish va asinxron jarayonlarni boshqarish uchun ravon interfeysni taklif qiladi.

## Jarayonlarni chaqirish

### Ishlayotgan jarayonlar

Jarayonni ishga tushirish uchun siz "Run" yoki "Start" usullaridan foydalanishingiz mumkin. `Run` metodi buyruqni bajaradi va uning tugashini kutadi, `Start` metodi esa jarayonni asinxron ravishda ishga tushiradi va boshqaruvni darhol qaytaradi.

Bloklash buyrug'ini quyidagicha bajarishingiz mumkin:

```go
import (
    "fmt"

    "goravel/app/facades"
)

func main() {
    result := facades.Process().Run("echo", "Hello, World!")
    if result.Failed() {
        panic(result.Error())
    }

    fmt.Println(result.Output())
}
```

Agar siz satr buyrug'ini to'g'ridan-to'g'ri (argumentlarga ajratmasdan) ishga tushirmoqchi bo'lsangiz, uni `Run` ga bitta satr sifatida uzatishingiz mumkin, buning uchun `/bin/sh -c` (Linux/macOS) yoki `cmd/C` (Windows) ishlatiladi. E'tibor bering, mexanizm faqat satr buyrug'i bo'shliqlar yoki `&`, `|`, `-` belgilarini o'z ichiga olganda ishga tushirilishi mumkin.

```go
result := facades.Process().Run("echo Hello, World!")
// /bin/sh -c ""echo Hello, World!"" on Linux/macOS
// cmd /c "echo Hello, World!" on Windows
```

`Run` usuli `Result` interfeysini qaytaradi. "Result" interfeysi sizga buyruqning chiqishi va holatiga qulay kirish imkonini beradi:

```go
result := facades.Process().Run("ls", "-la")

result.Command()     // string: Asl buyruq
result.Error()       // error: Buyruq bajarilishi natijasida qaytarilgan xato
result.ErrorOutput() // string:Stderr dan chiqish
result.ExitCode()    // int: Chiqish kodi (masalan, 0, 1)
result.Failed()      // bool: Agar chiqish kodi 0 bo'lmasa, rost
result.Output()      // string: Stdout dan chiqish
```

### Jarayon parametrlari

Ko'pincha buyruq qanday ishlashini, masalan, qayerda ishlashini yoki qanday muhit o'zgaruvchilarini ko'rishini sozlashingiz kerak bo'ladi. "Process" jabhasi buning uchun ravon API taqdim etadi.

#### Path

Buyruq uchun ishchi katalogni ko'rsatish uchun `Path` usulidan foydalanishingiz mumkin. Agar buni o'rnatmasangiz, jarayon ilovangizning joriy ishchi katalogida bajariladi.

```go
result := facades.Process().Path("/var/www/html").Run("ls", "-la")
```

#### Timeout

Jarayonning cheksiz vaqt davomida to'xtab qolishining oldini olish uchun siz tanaffusni amalga oshirishingiz mumkin. Agar jarayon belgilangan vaqtdan uzoqroq davom etsa, u o'chiriladi.

```go
import "time"

result := facades.Process().Timeout(10 * time.Minute).Run("sleep", "20")
```

#### Atrof-muhit o'zgaruvchilari

Siz maxsus muhit o'zgaruvchilarini jarayonga `Env` usuli yordamida o'tkazishingiz mumkin. Jarayon shuningdek, tizimning muhit o'zgaruvchilarini meros qilib oladi.

```go
// FOO=BAR ni mavjud tizim envslari bilan birga o'tkazadi.
result := facades.Process().Env(map[string]string{
    "FOO": "BAR",
    "API_KEY": "secret",
}).Run("printenv")
```

#### Kirish (Stdin)

Agar sizning buyrug'ingiz standart inputdan (stdin) kirishni kutsa, uni "Input" usuli yordamida taqdim etishingiz mumkin. Bu "io.Reader" ni qabul qiladi.

```go
import "strings"

// Cat buyrug'iga "Salom Goravel" deb javob beradi
result := facades.Process().
    Input(strings.NewReader("Hello Goravel")).
    Run("cat")
```

### Jarayon chiqishi

Jarayon natijasiga natija obyektidagi `Output` (standart chiqish) va `ErrorOutput` (standart xato) usullari yordamida bajarilgandan so'ng kirishingiz mumkin.

```go
result := facades.Process().Run("ls", "-la")

fmt.Println(result.Output())
fmt.Println(result.ErrorOutput())
```

Agar siz chiqishni real vaqt rejimida (oqimli) qayta ishlashingiz kerak bo'lsa, "OnOutput" usuli yordamida qayta qo'ng'iroqni ro'yxatdan o'tkazishingiz mumkin. Qayta qo'ng'iroq ikkita argumentni oladi: chiqish turi (stdout yoki stderr) va chiqish ma'lumotlarini o'z ichiga olgan bayt bo'lagi.

```go
import (
    "fmt"
    "github.com/goravel/framework/contracts/process"
)

result := facades.Process().OnOutput(func(typ process.OutputType, b []byte) {
    // Bu yerda real vaqt rejimida translyatsiyani boshqaring
    fmt.Print(string(b))
}).Run("ls", "-la")
```

Agar siz faqat bajarilgandan keyin chiqishda ma'lum bir satr borligini tekshirishingiz kerak bo'lsa, siz `SeeInOutput` yoki `SeeInErrorOutput` yordamchi usullaridan foydalanishingiz mumkin.

```go
result := facades.Process().Run("ls", "-la")

if result.SeeInOutput("go.mod") {
    // The file exists
}
```

#### Jarayon chiqishini o'chirib qo'yish

Agar jarayoningiz katta hajmdagi ma'lumotlarni yozsa, uni qanday saqlashni boshqarishingiz mumkin.

`Quietly` dan foydalanish chiqish ma'lumotlarining konsolga yoki bajarilish vaqtida jurnallarga pufakchalar bilan chiqishining oldini oladi, ammo ma'lumotlar hali ham to'planadi va `result.Output()` orqali mavjud bo'ladi.

Agar siz yakuniy natijaga umuman kirishingiz shart bo'lmasa va xotirani tejashni istasangiz, "DisableBuffering" dan foydalanishingiz mumkin. Bu natija natija obyektida saqlanishiga to'sqinlik qiladi, garchi siz hali ham oqimni real vaqt rejimida "OnOutput" yordamida tekshirishingiz mumkin.

```go
// Chiqishni yozib oladi, lekin bajarish paytida chop etmaydi
facades.Process().Quietly().Run("...")

// Chiqishni yozib olmaydi (xotirani tejaydi), lekin oqimli uzatishga imkon beradi
facades.Process().DisableBuffering().OnOutput(func(typ process.OutputType, b []byte) {
    // ...
}).Run("...")
```

### Quvurlar

Ba'zan siz bir jarayonning chiqishini boshqa jarayonning kirishiga o'tkazishingiz kerak bo'ladi. `Process` fasadi buni `Pipe` usuli yordamida osonlashtiradi, bu sizga bir nechta buyruqlarni sinxron ravishda birlashtirish imkonini beradi.

```go
import "github.com/goravel/framework/contracts/process"

result := facades.Process().Pipe(func(pipe process.Pipe) {
    pipe.Command("echo", "Hello, World!")
    pipe.Command("grep World") // string command: /bin/sh -c "grep World"
    pipe.Command("tr", "a-z", "A-Z") 
}).Run()
```

:::warning
`Timeout`, `Env` yoki `Input` kabi jarayon parametrlari `Pipe` usuli chaqirilgandan **keyin** sozlanishi kerak.
`Pipe` chaqiruvidan oldin qo'llanilgan har qanday konfiguratsiya e'tiborga olinmaydi.

```go
// To'g'ri: Quvurdan keyin konfiguratsiya qo'llanildi
facades.Process().Pipe(...).Timeout(10 * time.Second).Run()

// Noto'g'ri: Vaqt tugashi e'tiborga olinmaydi
facades.Process().Timeout(10 * time.Second).Pipe(...).Run()
```

:::

#### Quvur liniyasi chiqishi va kalitlari

Siz quvur liniyasining chiqishini real vaqt rejimida "OnOutput" usuli yordamida tekshirishingiz mumkin. Quvur bilan ishlatilganda, qayta chaqiruv imzosi `kalit` (satr) ni o'z ichiga oladi, bu sizga qaysi buyruq natijani berganini aniqlash imkonini beradi.

Odatiy bo'lib, `key` buyruqning raqamli indeksidir. Biroq, murakkab quvurlarni nosozliklarni tuzatish uchun juda foydali bo'lgan `As` usuli yordamida har bir buyruqqa o'qiladigan yorliq tayinlashingiz mumkin.

```go
facades.Process().Pipe(func(pipe process.Pipe) {
    pipe.Command("cat", "access.log").As("source")
    pipe.Command("grep", "error").As("filter")
}).OnOutput(func(typ process.OutputType, line []byte, key string) {
    // 'key' will be "source" or "filter"
}).Run()
```

## Asinxron jarayonlar

`Run` usuli jarayon tugashini kutayotgan bir paytda, `Start` usuli jarayonni asinxron ravishda ishga tushirish uchun ishlatilishi mumkin.
Bu sizning ilovangiz boshqa vazifalarni bajarishda davom etayotgan paytda jarayonning fonda ishlashiga imkon beradi. `Start` usuli `Running` interfeysini qaytaradi.

```go
import "time"

running, err := facades.Process().Timeout(10 * time.Second).Start("sleep", "5")

// Boshqa ishlarni davom ettiring...

result := running.Wait()
```

Jarayon bloklanmasdan tugaganligini tekshirish uchun siz `Done` usulidan foydalanishingiz mumkin. Bu jarayon tugaganda yopiladigan standart Go kanalini qaytaradi, bu esa uni `select` operatorlarida foydalanish uchun ideal qiladi.

```go
running, err := facades.Process().Start("sleep", "5")

select {
case <-running.Done():
    // Jarayon muvaffaqiyatli yakunlandi
case <-time.After(1 * time.Second):
    // Agar juda ko'p vaqt talab etilsa, maxsus mantiq
}

result := running.Wait()
```

:::warning
Bajarilganlikni aniqlash uchun `Done` kanalidan foydalansangiz ham, keyinroq `Wait()` funksiyasini chaqirishingiz **kerak**.
Bu jarayonning operatsion tizim tomonidan to'g'ri "reaped" va asosiy resurslarni tozalashini ta'minlaydi.
:::

### Jarayon identifikatorlari va signallari

Siz `PID` usuli yordamida ishlayotgan jarayon uchun operatsion tizimning jarayon identifikatorini (PID) olishingiz mumkin.

```go
running, err := facades.Process().Start("ls", "-la")

println(running.PID())
```

#### Signallarni yuborish

Goravel jarayonning hayot aylanishi bilan o'zaro ta'sir qilish usullarini taqdim etadi. Siz `Signal` usuli yordamida ma'lum bir OS signalini yuborishingiz yoki `Stop` yordamchisidan foydalanib, nafis o'chirishga harakat qilishingiz mumkin.

`Stop` usuli ayniqsa foydalidir: u avval tugatish signalini yuboradi (standart holatda `SIGTERM` ga o‘rnatiladi).
Agar jarayon belgilangan vaqt ichida tugamasa, u majburan o'chiriladi (`SIGKILL`).

```go
import (
    "os"
    "time"
)

running, err := facades.Process().Start("sleep", "60")

// Signalni qo'lda yuborish
running.Signal(os.Interrupt)

// Nafislik bilan to'xtashga harakat qiling, 5 soniya kuting, keyin majburan o'ldiring
running.Stop(5 * time.Second)
```

### Jarayon holatini tekshirish

Jarayonning joriy holatini `Running` usuli yordamida tekshirishingiz mumkin. Bu, birinchi navbatda, nosozliklarni tuzatish yoki sog'liqni tekshirish uchun foydalidir, chunki u jarayon hozirda faol yoki yo'qligini ko'rsatadi.

```go
// Snapshot tekshiruvi (jurnallar yoki ko'rsatkichlar uchun foydali)
agar running.Running() {
fmt.Println("Jarayon hali ham faol...")
}
```

:::tip
Agar jarayon tugashi bilan kodni **ijro etish** kerak bo'lsa, `Running()` funksiyasini so'ramang. Buning o'rniga, holatni qayta-qayta tekshirishdan ko'ra ancha samaraliroq bo'lgan `Done()` kanali yoki `Wait()` usulidan foydalaning.
:::

## Bir vaqtning o'zida sodir bo'ladigan jarayonlar

Goravel bir vaqtning o'zida bir nechta buyruqlarni bajarish imkonini beruvchi bir vaqtning o'zida bir nechta jarayonlarni boshqarishni osonlashtiradi.
Bu, ayniqsa, ommaviy ishlov berish yoki mustaqil vazifalarni parallel ravishda bajarish uchun foydalidir.

### Hovuzlarni bajarish

Jarayonlar pulini ishga tushirish uchun siz `Pool` usulidan foydalanishingiz mumkin. Bu siz bajarmoqchi bo'lgan buyruqlarni belgilaydigan yopilishni qabul qiladi.

Odatiy bo'lib, `Pool` usuli barcha jarayonlarning tugashini kutadi va jarayon nomi (yoki indeksi) bilan belgilangan natijalar xaritasini qaytaradi.

```go
results, err := facades.Process().Pool(func(pool process.Pool) {
    pool.Command("sleep", "1").As("first")
    pool.Command("sleep 2").As("second") // string command: /bin/sh -c "sleep 2"
}).Run()

if err != nil {
    panic(err)
}

// Natijalarga tayinlangan kalit orqali kirish
println(results["first"].Output())
println(results["second"].Output())
```

### Nomlash jarayonlari

Odatiy bo'lib, hovuzdagi jarayonlar ularning raqamli indekslari (masalan, "0", "1") bilan belgilanadi. Biroq, natijalarga aniqlik kiritish va osonroq kirish uchun har bir jarayonga `As` usuli yordamida noyob nom berishingiz kerak:

```go
pool.Command("cat", "system.log").As("system")
```

### Pool imkoniyatlari

`Pool` quruvchisi butun partiyaning bajarilish xatti-harakatlarini boshqarish uchun bir nechta usullarni taqdim etadi.

#### Concurrency

Siz `Concurrency` usuli yordamida bir vaqtning o'zida ishlaydigan jarayonlarning maksimal sonini boshqarishingiz mumkin.

```go
facades.Process().Pool(func(pool process.Pool) {
    // 10 ta buyruqni aniqlang...
}).Concurrency(2).Run()
```

#### Umumiy vaqt tugashi (Total Timeout)

Siz `Timeout` usuli yordamida butun hovuz bajarilishi uchun global vaqtni belgilashingiz mumkin. Agar hovuz bu vaqtdan ko'proq vaqt talab qilsa, barcha ishlayotgan jarayonlar to'xtatiladi.

```go
facades.Process().Pool(...).Timeout(1 * time.Minute).Run()
```

### Asinxron hovuzlar

Agar ilovangiz boshqa vazifalarni bajarayotgan paytda hovuzni fonda ishga tushirishingiz kerak bo'lsa, `Run` o'rniga "Ishga `Start` usulidan foydalanishingiz mumkin. Bu `RunningPool` deskriptorini qaytaradi.

```go
runningPool, err := facades.Process().Pool(func(pool process.Pool) {
    pool.Command("sleep", "5").As("long_task")
}).Start()

// Hovuz hali ham ishlayotganini tekshiring
if runningPool.Running() {
    fmt.Println("Pool is active...")
}

// Barcha jarayonlar tugashini kuting va natijalarni to'plang
results := runningPool.Wait()
```

#### Running Pools bilan o'zaro aloqa

`RunningPool` interfeysi faol hovuzni boshqarishning bir nechta usullarini taqdim etadi:

- **`PIDs()`**: Buyruq nomi bilan belgilangan jarayon identifikatorlari xaritasini qaytaradi.
- **`Signal(os.Signal)`**: Hovuzdagi barcha ishlayotgan jarayonlarga signal yuboradi.
- **`Stop(timeout, signal)`**: Barcha jarayonlarni nafislik bilan to'xtatadi.
- **`Done()`**: Hovuz tugagach yopiladigan kanalni qaytaradi, bu `select` operatorlari uchun foydali.

```go
select {
case <-runningPool.Done():
    // Barcha jarayonlar tugadi
case <-time.After(10 * time.Second):
    // Agar barcha jarayonlar juda uzoq davom etsa, ularni majburan to'xtatish
    runningPool.Stop(1 * time.Second)
}
```

### Pool Output

Siz `OnOutput` usuli yordamida real vaqt rejimida hovuzning chiqishini tekshirishingiz mumkin.

:::warning
`OnOutput` qayta chaqiruvi bir vaqtning o'zida bir nechta goroutinlardan chaqirilishi mumkin. Qayta qo'ng'iroq qilish mantig'ingiz ish zarrachalaridan himoyalanganligiga ishonch hosil qiling.
:::

```go
facades.Process().Pool(func(pool process.Pool) {
    pool.Command("ping", "google.com").As("ping")
}).OnOutput(func(typ process.OutputType, line []byte, key string) {
    // kalit "ping" bo'ladi
    fmt.Printf("[%s] %s", key, string(line))
}).Run()
```

### Jarayon bo'yicha konfiguratsiya

Hovuz ta'rifi ichida har bir buyruq yakka jarayonlarga o'xshash individual konfiguratsiya usullarini qo'llab-quvvatlaydi:

- **`Path(string)`**: Ishchi katalogni o'rnatadi.
- **`Env(map[string]string)`**: Muhit o'zgaruvchilarini o'rnatadi.
- **`Input(io.Reader)`**: Standart kiritishni o'rnatadi.
- **`Timeout(time.Duration)`**: Muayyan buyruq uchun vaqtni belgilaydi.
- **`Quietly()`**: Ushbu maxsus buyruq uchun chiqish yozib olishni o'chiradi.
- **`DisableBuffering()`**: Xotira buferlashni o'chiradi (yuqori hajmli chiqish uchun foydali).

```go
facades.Process().Pool(func(pool process.Pool) {
    pool.Command("find", "/", "-name", "*.log").
        As("search").
        Path("/var/www").
        Timeout(10 * time.Second).
        DisableBuffering()
}).Run()
```
