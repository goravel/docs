# Rang

[[toc]]

## Kirish

`color` paketi [PTerm](https://github.com/pterm/pterm) kutubxonasi yordamida terminal chiqishini ranglash uchun funksiyalar to'plamini taqdim etadi.

## Maxsus Rang

Paket ma'lum ranglar uchun printerlar yaratish usullarini taqdim etadi. Ushbu usullar terminal chiqishini oson rang berish imkonini beradi.

- `color.Red()`
- `color.Green()`
- `color.Yellow()`
- `color.Blue()`
- `color.Magenta()`
- `color.Cyan()`
- `color.White()`
- `color.Black()`
- `color.Gray()`
- `color.Default()`

### Printer Usullari

`contracts/support.Printer` rangli matnni chop etish yoki formatlash uchun quyidagi usullarni taqdim etadi:

- `Print` - Matnni chop etish
- `Println` - Matnni yangi qator bilan chop etish
- `Printf` - Formatlangan matnni chop qilish
- `Sprint` - Rangli matnni qaytarish
- `Sprintln` - Yangi qator bilan rangli matn qaytaradi
- `Sprintf` - Formatlangan rangli matnni qaytarish

```go
import "github.com/goravel/framework/support/color"

color.Blue().Println("Salom, Goravel!")
color.Green().Printf("Salom, %s!", "Goravel")
```

## Maxsus Rang

### `color.New`

`color.New` funksiyasi yangi rang printerini yaratadi. Siz terminal chiqishini ranglash uchun ushbu ob'ektdan foydalanishingiz mumkin.

```go
import "github.com/goravel/framework/support/color"

color.New(color.FgRed).Println("Hello, Goravel!")
```
