# Artisan Konsoli

[[toc]]

## Kirish

Artisan - Goravel bilan birga keladigan, buyruq qatori bilan ishlash uchun CLI vositasidir. Siz uni `facades.Artisan()` yordamida ochishingiz mumkin. Ushbu vosita sizning ilovangizni rivojlantirishda yordam beradigan bir nechta foydali buyruqlarga ega. Barcha mavjud buyruqlarni ko'rish uchun quyidagi buyruqdan foydalaning.

```shell
./artisan ro'yxat

# yoki
go run . artisan ro'yxat
```

Har bir buyruq shuningdek, buyruq bilan bog'liq argumentlar va opsiyalarni ko'rsatadigan va tushuntiradigan "yordam" bayrog'iga ega:

```shell
./artisan migrate --yordam
```

`./artisan ...` buyrug'ini takrorlash o'rniga, quyidagi terminal buyrug'i bilan o'z shell konfiguratsiyangizga taxallus qo'shishingiz mumkin:

```shell
echo -e "\r\nalias artisan=\"go run . artisan\"" >>~/.zshrc
```

Keyin siz buyruqlaringizni shunchaki shunday ishga tushirishingiz mumkin:

```shell
artisan make:controller DemoController
```

You can also use the `artisan` shell script to run built-in commands.

### Buyruqlarni yaratish

Siz `make:command` buyrug'idan `app/console/commands` katalogida yangi buyruq yaratish uchun foydalanishingiz mumkin. Agar bu katalog sizning ilovangizda mavjud bo'lmasa, tashvishlanmang, u siz `make:command` buyrug'ini birinchi marta ishga tushirganingizda yaratiladi:

```shell
./artisan make:command SendEmails
./artisan make:command user/SendEmails
```

### Buyruqlarni ro'yxatdan o'tkazish

Barcha buyruqlar `bootstrap/app.go` faylidagi `WithCommands` funksiyasi orqali ro'yxatdan o'tkazilishi kerak:

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithCommands(Commands).
		WithConfig(config.Boot).
		Create()
}
```

`make:command` tomonidan yaratilgan yangi buyruq `bootstrap/commands.go::Commands()` funksiyasida avtomatik ro'yxatdan o'tkaziladi va funksiya `WithCommands` tomonidan chaqiriladi. Agar buyruq faylini o'zingiz yaratgan bo'lsangiz, buyruqni qo'lda ro'yxatdan o'tkazishingiz kerak.

### Filtering Commands

You may want to scope which built-in Artisan commands are registered in different environments — for example, hiding dev commands like `make:*`, `package:*`, and `vendor:publish` in production. The `WithCommandsFilter` method on `ApplicationBuilder` lets you return a positive list of command signatures to keep:

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithCommands(Commands).
		WithCommandsFilter(func() []string {
			if facades.Config().GetString("app.env") == "production" {
				return []string{
					"up", "down", "key:generate", "about",
					"schedule:*", // glob
					"queue:*",    // glob
				}
			}
			return nil // keep everything in other environments
		}).
		WithConfig(config.Boot).
		Create()
}
```

The callback runs once at build time and each entry is matched against `command.Signature()` in one of two ways:

- **Exact match** (no wildcard) — the signature must match the entry exactly.
- **Glob match** (entry contains `*`) — checked using `path.Match`. `*` matches any sequence of non-`/` characters.

The return value determines the filtering behavior:

- **Method not called** — all commands are kept (default).
- **Return `nil`** — all commands are kept (no filter applied).
- **Return `[]string{}`** — all commands are dropped.
- **Return entries** — only commands whose signature matches an entry are kept.

> Note: The filter applies to all commands including those added via `WithCommands`, so the user cannot bypass the filter by adding commands manually.

### Buyruq tuzilmasi

Buyruqni yaratgandan so'ng, structning signature va description xususiyatlariga mos qiymatlarni belgilang. Buyruq bajarilganda `Handle` usuli chaqiriladi. Siz ushbu metodda o'z mantiqingizni amalga oshirishingiz kerak.

```go
paket buyruqlari

import (
  "github.com/goravel/framework/contracts/console"
  "github.com/goravel/framework/contracts/console/command"
)

type SendEmails struct {
}

// Imzo Konsol buyrug'ining nomi va imzosi.
func (receiver *SendEmails) Signature() string {
  return "send:emails"
}

// Tavsif Konsol buyrug'ining tavsifi.
func (receiver *SendEmails) Description() string {
  return "Elektron pochta xabarlarini yuborish"
}

// Kengaytma Konsol buyrug'ining kengaytmasi.
func (receiver *SendEmails) Extend() command.Extend {
  return command.Extend{}
}

// Boshqarish Konsol buyrug'ini bajarish.
func (receiver *SendEmails) Handle(ctx console.Context) error {
  return nil
}
```

## Buyruq kirish/chiqish

### Kirishni olish

Konsol buyruqlarini yozishda, odatda foydalanuvchi kiritimini `argumentlar` yoki `opsiyalar` orqali yigʻish mumkin. Goravel bilan foydalanuvchi taqdim etgan argumentlar va opsiyalarni olish juda oson.

#### Argumentlar

Buyruqdan keyingi argumentlarni kuzating:

```shell
./artisan send:emails SUBJECT EMAIL_1 EMAIL_2
```

Ta'rif：

```go
// send:emails <0> <1>
func (receiver *SendEmails) Extend() command.Extend {
	return command.Extend{
		Arguments: []command.Argument{
			&command.ArgumentString{
				Name:     "subject",
				Usage:    "elektron pochta mavzusi",
				Required: true,
			},
			&command.ArgumentStringSlice{
				Name:  "emails",
				Usage: "maqsadli elektron pochta manzillari",
				Min:   1,
				Max:   -1,
			},
		},
	}
```

Qo'llab-quvvatlanadigan argument turlari: `ArgumentFloat32`, `ArgumentFloat64`, `ArgumentInt`, `ArgumentInt8`, `ArgumentInt16`, `ArgumentInt32`, `ArgumentInt64`, `ArgumentString`, `ArgumentUint`, `ArgumentUint8`, `ArgumentUint16`, `ArgumentUint32`, `ArgumentUint64`, `ArgumentTimestamp`, `ArgumentFloat32Slice`, `ArgumentFloat64Slice`, `ArgumentIntSlice`, `ArgumentInt8Slice`, `ArgumentInt16Slice`, `ArgumentInt32Slice`, `ArgumentInt64Slice`, `ArgumentStringSlice`, `ArgumentUintSlice`, `ArgumentUint8Slice`, `ArgumentUint16Slice`, `ArgumentUint32Slice`, `ArgumentUint64Slice`, `ArgumentTimestampSlice`

Bitta qiymatni qo‘llab-quvvatlovchi argument turlari quyidagi maydonlarni qo‘llab-quvvatlaydi:

```go
	Ism     string // bu argumentning nomi
	Qiymat    T      // bu argumentning standart qiymati
	Foydalanish    string // ko'rsatish uchun foydalanish matni
	Majburiy bool   // agar bu argument majburiy bo'lsa
```

"Slice" argument turlari maydonlari:

```go
	Ism  string // bu argumentning nomi
	Qiymat T      // bu argumentning standart qiymati
	Foydalanish string // ko'rsatiladigan foydalanish matni
	Min   int    // bu argumentning minimal takrorlanish soni
	Max   int    // bu argumentning maksimal takrorlanish soni, cheksiz uchun -1 ga o'rnating
```

Timestamp argumentlari qo'shimcha ravishda `Layouts []string` maydonini qo'llab-quvvatlaydi, bu [qo'llab-quvvatlanadigan layoutlar](https://pkg.go.dev/time#pkg-constants) bilan to'ldirilishi kerak

Argumentlarni oling:

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
  subject := ctx.ArgumentString("subject")
  emails := ctx.ArgumentStringSlice("emails")

  return nil
}
```

Boshqa yo'l sifatida, argumentlarga to'g'ridan-to'g'ri kirish mumkin:

```go
func (qabul qiluvchi *EmailYuborish) Boshqarish(ctx console.Context) xato {
  ism := ctx.Argument(0)
  email := ctx.Argument(1)
  hammasi := ctx.Arguments()

  return nil
}
```

#### Parametrlar

Opsiyalar, argumentlar singari, foydalanuvchi kiritishining yana bir shaklidir. Parametrlar buyruq qatori orqali taqdim etilganda, ikkita tire (--) bilan boshlanadi.

Ta'rif：

```go
func (receiver *ListCommand) Extend() command.Extend {
  return command.Extend{
    Flags: []command.Flag{
      &command.StringFlag{
        Name:    "lang",
        Value:   "default",
        Aliases: []string{"l"},
        Usage:   "salomlashish uchun til",
      },
    },
  }
}
```

Oling：

```go
func (qabul qiluvchi *ListCommand) Handle(ctx console.Context) xato {
  til := ctx.Option("til")

  return nil
}
```

Foydalanish：

```shell
./artisan emails --lang Xitoy
./artisan emails -l Xitoy
```

`command.StringFlag` dan tashqari, biz boshqa turdagi `Flag` va `Option*` lardan ham foydalanishimiz mumkin: `StringSliceFlag`, `BoolFlag`, `Float64Flag`, `Float64SliceFlag`, `IntFlag`, `IntSliceFlag`, `Int64Flag`, `Int64SliceFlag`.

### Kirishni So'rash

#### Savollar berish

Argumentlar va opsiyalardan tashqari, siz buyruq bajarilayotganda foydalanuvchidan kirish so'rashingiz mumkin. `Ask` usuli foydalanuvchiga berilgan savolni ko'rsatadi va ularning javobini qaytaradi:

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
  email, err := ctx.Ask("Elektron pochta manzilingiz nima?")

  return err
}
```

Bundan tashqari, `Ask` metodiga opsiyalarni ixtiyoriy ikkinchi argument sifatida o‘tkazishingiz mumkin:

```go
func (qabul qiluvchi *SendEmails) Handle(ctx console.Context) xato {
    ism, xato := ctx.Ask("Ismingiz nima?", console.AskOption{
        Default: "Krishan",
    })

    return xato
}

// Mavjud opsiyalar
type AskOption struct {
    // Default - kiritish uchun standart qiymat.
    Default string
    // Description - kiritish tavsifi.
    Description string
    // Lines - kiritish uchun qatorlar soni.(ko'p qatorli matn uchun ishlatiladi)
    Lines int
    // Limit - kiritish uchun belgilar chegarasi.
    Limit int
    // Multiple - kiritish bitta qator yoki ko'p qatorli matn ekanligini aniqlaydi
    Multiple bool
    // Placeholder - kiritish uchun joy egallovchi.
    Placeholder string
    // Prompt - so'rov xabari.(bitta qatorli kiritish uchun ishlatiladi)
    Prompt string
    // Validate - kiritishni tekshirish funksiyasi.
    Validate func(string) xato
}
```

Ba'zan foydalanuvchi kiritishini yashirish kerak bo'lishi mumkin, masalan, parol so'rashda. Siz foydalanuvchi kiritishini yashirish uchun `Secret` usulidan foydalanishingiz mumkin:

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
    password, err := ctx.Secret("Parol nima?", console.SecretOption{
        Validate: func (s string) error {
            if len(s) < 8 {
                return errors.New("parol uzunligi kamida 8 bo'lishi kerak")
            }
            return nil
        },
    })

    return err
}

// Mavjud variantlar
type SecretOption struct {
    // Default - kiritish uchun standart qiymat.
    Default string
    // Description - kiritish tavsifi.
    Description string
    // Limit - kiritish uchun belgilar chegarasi.
    Limit int
    // Placeholder - kiritish uchun belgilovchi.
    Placeholder string
    // Validate - kiritishni tekshirish funksiyasi.
    Validate func(string) error
}
```

#### Amallarni tasdiqlash

Agar foydalanuvchidan harakatni davom ettirishdan oldin tasdiqlashni so'rashingiz kerak bo'lsa, `Confirm` usulidan foydalanishingiz mumkin. Standart holatda, ushbu metod foydalanuvchi ijobiy variantni tanlamaguncha `false` qiymatini qaytaradi.

```go
agar ctx.Confirm("Davom etishni xohlaysizmi?") {
    // ...
}
```

Shuningdek, siz `Confirm` usuliga ikkinchi argument berib, standart qiymatni, ijobiy va salbiy tugmalarning yorlig'ini sozlashingiz mumkin:

```go
if ctx.Confirm("Do you wish to continue?", console.ConfirmOption{
	Default : true,
	Affirmative : "Yes",
	Negative : "No",
}) {
    // ...
}

// Available options
type ConfirmOption struct {
    // Affirmative label for the affirmative button.
    Affirmative string
    // Default the default value for the input.
    Default bool
    // Description the input description.
    Description string
    // Negative label for the negative button.
    Negative string
}
```

#### Bitta tanlovli savollar

Agar foydalanuvchidan ro'yxatdan variant tanlashni so'rashingiz kerak bo'lsa, `Choice` usulidan foydalanishingiz mumkin. `Choice` usuli tanlangan variantning qiymatini qaytaradi:

```go
question := "What is your favorite programming language?"
options := []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP"},
    {Key: "python", Value: "Python"},
    {Key: "cpp", Value: "C++", Selected: true},
}
color, err := ctx.Choice(question, options)
```

Shuningdek, siz `Choice` usuliga ixtiyoriy ikkinchi argument sifatida opsiyalarni o‘tkazishingiz mumkin:

```go
question := "What is your favorite programming language?"
options := []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP"},
    {Key: "python", Value: "Python"},
    {Key: "cpp", Value: "C++", Selected: true},
}

color, err := ctx.Choice(question, options, console.ChoiceOption{
    Default: "go",
})

// Available options
type ChoiceOption struct {
    // Default the default value for the input.
    Default string
    // Description the input description.
    Description string
    // Validate the input validation function.
    Validate func(string) error
}
```

#### Ko'p tanlovli savollar

Agar foydalanuvchidan ro'yxatdan bir nechta variantlarni tanlashni so'rashingiz kerak bo'lsa, `MultiSelect` usulidan foydalanishingiz mumkin. `MultiSelect` usuli tanlangan variantlarning qiymatlarini qaytaradi:

```go
question := "What are your favorite programming languages?"
options := []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP"},
    {Key: "python", Value: "Python"},
    {Key: "cpp", Value: "C++", Selected: true},
}
colors, err := ctx.MultiSelect(question, options)
```

Bundan tashqari, siz `MultiSelect` usuliga ixtiyoriy ikkinchi argument sifatida variantlarni o‘tkazishingiz mumkin:

```go
question := "What are your favorite programming languages?"
options := []console.Choice{
    {Key: "go", Value: "Go"},
    {Key: "php", Value: "PHP"},
    {Key: "python", Value: "Python"},
    {Key: "cpp", Value: "C++", Selected: true},
}

colors, err := ctx.MultiSelect(question, options, console.MultiSelectOption{
    Default: []string{"go", "php"},
})

// Available options
type MultiSelectOption struct {
    // Default the default value for the input.
    Default []string
    // Description the input description.
    Description string
    // Filterable determines if the choices can be filtered, type `/` to starting filter.
    Filterable bool
    // Limit the number of choices that can be selected.
    Limit int
    // Validate the input validation function.
    Validate func([]string) error
}
```

### Chiqish yozish

Ba'zan siz konsolga chiqish yozishingiz kerak bo'lishi mumkin. Goravel sizga konsolga chiqish yozishda yordam beradigan bir nechta usullarni taqdim etadi. Har bir metod o'ziga xos rangli chiqishga ega. Masalan, `Error` matnni qizil rangda ko'rsatadi.

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
  ctx.Comment("Bu izoh xabari")
  ctx.Info("Bu ma'lumot xabari")
  ctx.Error("Bu xato xabari")
  ctx.Line("Bu qator xabari")
  ctx.Warning("Bu ogohlantirish xabari")
  return nil
}
```

Mos rangga mos yozish uchun bir nechta yordamchilar mavjud:

```go
ctx.Green("Bu yashil xabar")
ctx.Greenln("Bu yashil chiziqli xabar")
ctx.Red("Bu qizil xabar")
ctx.Redln("Bu qizil chiziqli xabar")
ctx.Yellow("Bu sariq xabar")
ctx.Yellowln("Bu sariq chiziqli xabar")
ctx.Black("Bu qora xabar")
ctx.Blackln("Bu qora chiziqli xabar")
```

Siz `NewLine` usulidan foydalanib konsolga yangi qator yozishingiz mumkin:

```go
// bitta bo'sh qator yozish
ctx.NewLine()

// bir nechta bo'sh qatorlar yozish
ctx.NewLine(2)
```

#### Tables

You may use the `Table` method to render structured data in a tabular format. The method accepts headers and rows, and writes the rendered table directly to the console:

```go
func (receiver *SendEmails) Handle(ctx console.Context) error {
    headers := []string{"ID", "Email", "Status"}
    rows := [][]string{
        {"1", "a@example.com", "Queued"},
        {"2", "b@example.com", "Sent"},
    }

    ctx.Table(headers, rows)

    return nil
}
```

You can pass a `console.TableOption` as the third argument to customize borders, dimensions, and styles.

```go
ctx.Table(headers, rows, console.TableOption{
    Width: 80,
})
```

#### Progress Bars

Uzoq davom etadigan vazifalar uchun, foydalanuvchiga vazifa qancha vaqt oladi haqida ma'lumot berish foydali bo'ladi. Siz taraqqiyot panelini ko'rsatish uchun `WithProgressBar` usulidan foydalanishingiz mumkin.

```go
items := []any{"item1", "item2", "item3"}
_, err := ctx.WithProgressBar(items, func(item any) error {
    // performTask(item)
    return nil
})
```

Ba'zan siz progress bar-ni qo'lda yangilashingiz kerak bo'lishi mumkin. Siz progress bar-ni yangilash uchun `CreateProgressBar` usulidan foydalanishingiz mumkin:

```go
users := []string{"user1", "user2", "user3"}
bar := ctx.CreateProgressBar(len(users))

err := bar.Start()

for _, user := range users {
    // process user
    bar.Advance()

	// sleep for a while to simulate processing
    time.Sleep(time.Millisecond * 50)
}

err = bar.Finish()
```

#### Aylana

Agar vazifa bajarilayotganda spinner ko'rsatish kerak bo'lsa, `Spinner` metodidan foydalanishingiz mumkin.

```go
err := ctx.Spinner("Yuklanmoqda...", console.SpinnerOption{
    Action: func() error {
        // spinner qachon to'xtatilishi kerak
        time.Sleep(2 * time.Second)
        return nil
    },
})
```

### Ajratgich

Terminal kengligidagi ajratuvchini ko'rsatish uchun `Divider` metodidan foydalanishingiz mumkin.

```go
ctx.Divider()     // ----------
ctx.Divider("=>") // =>=>=>=>=>
```

## Graceful Shutdown

By default, pressing `Ctrl+C` (or sending `SIGTERM`) cancels the `console.Context` passed to `Handle`. The framework runs `Handle` in a goroutine, so it returns `context.Canceled` as soon as the signal fires and the process exits. Commands that need to release resources — closing network listeners, draining queues, flushing buffers — can opt into a cleanup callback by implementing the optional `console.Shutdownable` interface.

```go
type Shutdownable interface {
  Shutdown(ctx Context) error
}
```

When a command implements `Shutdownable`, the framework races `Handle` against the signal context. If `Handle` returns first, the framework then calls `Shutdown` with a fresh `console.Context` (the original is already cancelled) and a 30s budget so the command can finish any cleanup. If the signal fires first, the framework calls `Shutdown` with the same fresh context and 30s budget, then returns; `Handle` is left to run on its own in the goroutine and the process exits.

`console.Context` now embeds `context.Context`, so commands can use `<-ctx.Done()` directly, pass `ctx` to functions that expect a `context.Context`, and call `ctx.Deadline()` / `ctx.Err()` / `ctx.Value(key)` without an accessor.

```go
package commands

import (
  "errors"
  "net/http"

  "github.com/goravel/framework/contracts/console"
  "github.com/goravel/framework/contracts/console/command"
)

type Serve struct {
  server *http.Server
}

func (r *Serve) Signature() string   { return "serve" }
func (r *Serve) Description() string { return "Start the HTTP server" }
func (r *Serve) Extend() command.Extend {
  return command.Extend{Category: "server"}
}

func (r *Serve) Handle(ctx console.Context) error {
  if err := r.server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
    return err
  }
  return nil
}

func (r *Serve) Shutdown(ctx console.Context) error {
  ctx.Info("received signal, shutting down gracefully...")
  return r.server.Shutdown(ctx)
}
```

The built-in `schedule:run` command is a real example. Its `Handle` blocks on `schedule.Run()`, and on signal the framework calls `Shutdown`, which delegates to `schedule.Shutdown(ctx)` so scheduled tasks get a chance to finish their work.

Commands that do not implement `Shutdownable` keep the original behavior — the process exits as soon as the signal is received.

## Kategoriya

Siz bir qator buyruqlarni bir xil kategoriyaga o'rnatishingiz mumkin, bu `./artisan list` da qulay:

```go
// Konsol buyrug'ini kengaytirish.
func (receiver *ConsoleMakeCommand) Extend() command.Extend {
  return command.Extend{
    Category: "make",
  }
}
```

## Dasturiy tarzda buyruqlarni bajarish

Ba'zan siz Artisan buyrug'ini CLI tashqarisida bajarishingiz mumkin, buning uchun `facades.Artisan()` da `Call` metodidan foydalanishingiz mumkin.

```go
facades.Route().Get("/", func(c *gin.Context) {
  facades.Artisan().Call("emails")
  facades.Artisan().Call("emails --lang Chinese name") // With arguments and options
})
```

## Chop etish ranglarini o‘chirish

Ba'zi buyruqlar standart ravishda ranglarni chiqaradi, masalan, `list` buyrug'i. Biroq, ba'zi terminal yoki jurnallarda rang qiymatlari noto'g'ri ko'rsatilishi mumkin. Siz chop ranglarini o'chirish uchun `--no-ansi` opsiyasidan foydalanishingiz mumkin:

```shell
./artisan ro'yxat --no-ansi
```
