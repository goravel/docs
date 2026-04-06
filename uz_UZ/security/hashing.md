# Xeshlash

[[toc]]

## Kirish

Goravel `facades.Hash()` foydalanuvchi parollarini saqlash uchun xavfsiz Argon2id va Bcrypt xeshlashni taqdim etadi. Agar siz Goravel ilova boshlangʻich toʻplamlaridan birini ishlatayotgan boʻlsangiz, sukut boʻyicha roʻyxatdan oʻtish va autentifikatsiya uchun Argon2id ishlatiladi.

## Konfiguratsiya

Ilovangiz uchun sukut boʻyicha xeshlash haydovchisi ilovangizning `config/hashing.go` konfiguratsiya faylida sozlanadi. Hozirda bir nechta qoʻllab-quvvatlanadigan haydovchilar mavjud: Argon2id va Bcrypt.

## Asosiy foydalanish

### Parollarni xeshlash

Siz `facades.Hash()` da `Make` metodini chaqirib parolni xeshlashingiz mumkin:

```go
password, err := facades.Hash().Make(password)
```

### Parol Xeshga Mos Kelishini Tekshirish

Hash fasad tomonidan taqdim etilgan `Check` metodi berilgan oddiy matnli satr berilgan xeshga mos kelishini tekshirish imkonini beradi:

```go
if facades.Hash().Check('plain-text', hashedPassword) {
    // Parollar mos keladi...
}
```

### Parolni Qayta Xeshlash Kerakligini Aniqlash

Hash fasad tomonidan taqdim etilgan `NeedsRehash` metodi parol xeshlanganidan beri xesher tomonidan ishlatilgan ish omili oʻzgarganligini aniqlash imkonini beradi. Baʼzi ilovalar ushbu tekshiruvni ilovaning autentifikatsiya jarayoni davomida bajarishni tanlaydi:

```go
if facades.Hash().NeedsRehash(hashed) {
     hashed = facades.Hash().Make('plain-text');
}
```
