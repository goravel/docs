# Shifrlash

[[toc]]

## Kirish

Goravelning shifrlash xizmatlari OpenSSL yordamida AES-256 shifrlash orqali matnni shifrlash va ochish uchun oddiy, qulay interfeysni taqdim etadi. Goravelning barcha shifrlangan qiymatlari xabar autentifikatsiya kodi (GMAC) yordamida imzolangan, shuning uchun ularning asosiy qiymati shifrlanganidan keyin o‘zgartirilishi yoki buzilishi mumkin emas.

## Konfiguratsiya

Goravel shifrlovchisidan foydalanishdan oldin, `config/app.go` konfiguratsiya faylida `key` konfiguratsiya parametrini o‘rnatishingiz kerak. Bu parametr `APP_KEY` muhit o‘zgaruvchisi tomonidan boshqariladi. Ushbu o‘zgaruvchining qiymatini yaratish uchun `./artisan key:generate` buyrug‘idan foydalaning, chunki `key:generate` buyrug‘i ilovangiz uchun xavfsiz kriptografik kalit yaratishda Golangning xavfsiz tasodifiy baytlar generatoridan foydalanadi.

## Shifrlovchidan Foydalanish

### Qiymatni Shifrlash

Qiymatni shifrlash uchun `facades.Crypt()` dagi `EncryptString` usulidan foydalanishingiz mumkin. Bu usul qiymatlarni OpenSSL va AES-256-GCM shifri yordamida shifrlaydi. Bundan tashqari, barcha shifrlangan qiymatlar ma'lumotlarni buzishga urinayotgan zararli foydalanuvchilar tomonidan ochilishining oldini olish uchun xabar autentifikatsiya kodi (GMAC) bilan imzolanadi.

```go
secret, err := facades.Crypt().EncryptString("goravel")
```

### Qiymatni Ochish

Qiymatlarni ochish uchun `facades.Crypt()` dan `DecryptString` usulidan foydalanishingiz mumkin. Agar qiymat to‘g‘ri ochilmasa, masalan, xabar autentifikatsiya kodi noto‘g‘ri bo‘lsa, xato qaytariladi.

```go
str, err := facades.Crypt().DecryptString(secret)
```
