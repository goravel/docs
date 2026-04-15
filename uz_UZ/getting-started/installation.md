# O'rnatish

[[toc]]

## Server Talablari

- Golang >= 1.23

## O'rnatish

### Goravel O'rnatuvchisidan Foydalanish

O'rnatuvchini [hujjat](https://github.com/goravel/installer) bo'yicha ishga tushiring va keyin quyidagi buyruq yordamida yangi Goravel loyihasini ishga tushiring:

```shell
// Goravel o'rnatuvchisining eng so'nggi versiyasini o'rnating
go install github.com/goravel/installer/goravel@latest

// Loyihani o'rnatmoqchi bo'lgan papkaga kiring
goravel new blog
```

### Qo'lda O'rnatish

#### goravel/goravel

To'liq xususiyatlarga ega bo'lgan freymvork.

```shell
// Freymvorkni yuklab olish
git clone --depth=1 https://github.com/goravel/goravel.git && rm -rf goravel/.git*

// Bog'liqliklarni o'rnatish
cd goravel && go mod tidy

// .env muhit konfiguratsiya faylini yaratish
cp .env.example .env

// Ilova kalitini yaratish
./artisan key:generate
```

#### goravel/goravel-lite

Faqat asosiy xususiyatlarga ega bo'lgan yengil freymvork, mikroxizmatlar yoki kichik ilovalar yaratish uchun mos. Siz zarurat bo'yicha qo'shimcha fasadlarni o'rnatishingiz mumkin.

```shell
// Freymvorkni yuklab olish
git clone --depth=1 https://github.com/goravel/goravel-lite.git && rm -rf goravel-lite/.git*
s
// Bog'liqliklarni o'rnatish
cd goravel-lite && go mod tidy

// .env muhit konfiguratsiya faylini yaratish
cp .env.example .env

// Ilova kalitini yaratish
./artisan key:generate

// Zarurat bo'yicha qo'shimcha fasadlarni o'rnatish, masalan:
./artisan package:install Cache
```

> Agar bog'liqliklarni yuklash sekin bo'lsa, iltimos, tarmoq ulanishingizni tekshiring.

## Xizmatlarni Ishga Tushirish

### Ildiz Papkasidagi .env Fayliga Ko'ra Xizmatlarni Ishga Tushirish

```shell
go run .
```

### Xizmatlarni Ishga Tushirish Uchun .env Faylini Belgilash

```shell
go run . --env=./.env
```

### Muhit O'zgaruvchilaridan Foydalanib Xizmatlarni Ishga Tushirish

```shell
APP_ENV=production APP_DEBUG=true go run .
```

### Jonli qayta yuklash

[air-verse/air](https://github.com/air-verse/air) ni o'rnating, Goravel to'g'ridan-to'g'ri ishlatilishi mumkin bo'lgan o'rnatilgan konfiguratsiya fayliga ega:

```
air
```

#### 🧰 Air O'rnatilgandan So'ng

Air muvaffaqiyatli o'rnatilgandan so'ng, u muhitingizda to'g'ri bajarilishiga ishonch hosil qilishingiz kerak.  
Sozlashingizga qarab, Air avtomatik ravishda buyruq sifatida mavjud bo'lmasligi mumkin.  
Uning to'g'ri ishlashini ta'minlashning ikkita oddiy usuli:

---

#### 🪄 Variant 1: Yordamchi Skriptdan (`air.sh`) Foydalanish

Agar Air o'rnatilgan bo'lsa, lekin terminal buyrug'i sifatida tan olinmasa, uni avtomatik ravishda topadigan va ishga tushiradigan kichik yordamchi skript yaratishingiz mumkin.

1. Loyiha ildizida yangi fayl yarating:

```bash
touch air.sh
chmod +x air.sh
```

2. air.sh ichiga quyidagi mazmunni qo'shing:

```bash
#!/bin/bash
GO_PATH=$(go env GOPATH)
GO_BIN=$GO_PATH/bin/air

if [ ! -f $GO_BIN ]; then
    echo "❌ Air topilmadi. Iltimos, avval uni o'rnating:"
    echo "   go install github.com/air-verse/air@latest"
    exit 1
fi

echo "🚀 Air ishga tushmoqda..."
$GO_BIN
```

3. Loyihangizni ishga tushirish uchun quyidagidan foydalaning:

```bash
./air.sh
```

Bu, `$PATH` Go binary fayllarini o'z ichiga olmasa ham, Air ishlashini ta'minlaydi.

#### 💡 Variant 2: Go Bin Papkasini PATH ga Qo'shish (Mac/Linux)

Agar siz skriptsiz Air-ni to'g'ridan-to'g'ri ishga tushirishni afzal ko'rsangiz, Go bin papkasini PATH ga qo'shishingiz mumkin.

Zsh foydalanuvchilari uchun:

```bash
echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.zshrc
source ~/.zshrc
```

Ushbu sozlashdan so'ng, loyihangizni shunchaki ishga tushirish orqali boshlashingiz mumkin:

```bash
air
```

#### ✅ Maslahat

Air o'rnatilganligi va kirish mumkinligini tekshirish uchun ishga tushiring:

```bash
which air
```

Agar u to'g'ri yo'lni qaytarmasa (masalan, `/Users/yourname/go/bin/air`), bu yordamchi skript yoki yo'l hali sozlanmaganligini anglatadi.

## Konfiguratsiya

### Konfiguratsiya fayllari

Goravel freymvorkining barcha konfiguratsiya fayllari `config` papkasida joylashgan. Barcha konfiguratsiya bandlari izohlangan, siz ularni o'z ehtiyojlaringizga mos ravishda sozlashingiz mumkin.

### Ilova kalitini yaratish

Goravel mahalliy o'rnatilgandan so'ng ilova kalitini yaratishingiz kerak. Quyidagi buyruqni ishga tushirganda, `.env` faylidagi `APP_KEY` kalitida 32-bitli satr yaratiladi. Bu kalit asosan ma'lumotlarni shifrlash va shifrdan ochish uchun ishlatiladi.

```shell
./artisan key:generate
```

### JWT Token yaratish

Agar siz [Autentifikatsiya](../security/authentication.md) dan foydalansangiz, JWT Token yaratishingiz kerak.

```shell
./artisan jwt:secret
```

### Env faylini shifrlash va shifrdan ochish

Ishlab chiqarish muhiti env faylini versiyalarni boshqarishga qo'shmoqchi bo'lishingiz mumkin, lekin sezuvchi ma'lumotlarni oshkor qilishni istamasangiz, env faylini shifrlash uchun `env:encrypt` buyrug'idan foydalanishingiz mumkin:

```shell
./artisan env:encrypt

// Fayl nomi va kalitni belgilash
./artisan env:encrypt --name .env.safe --key BgcELROHL8sAV568T7Fiki7krjLHOkUc
```

Keyin ishlab chiqarish muhitida env faylini shifrdan ochish uchun `env:decrypt` buyrug'idan foydalaning:

```shell
GORAVEL_ENV_ENCRYPTION_KEY=BgcELROHL8sAV568T7Fiki7krjLHOkUc ./artisan env:decrypt

// yoki
./artisan env:decrypt --name .env.safe --key BgcELROHL8sAV568T7Fiki7krjLHOkUc
```
