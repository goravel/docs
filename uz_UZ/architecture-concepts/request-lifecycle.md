# So‘rovning ishlash jarayoni

[[toc]]

## Kirish

Har qanday vositadan real hayotda foydalanish, uning qanday ishlashini bilganingizda yanada intuitiv va tushunarli bo‘ladi. Ushbu hujjat sizga Goravel qanday ishlashini aniq va umumiy darajada tushuntirib berishni maqsad qiladi. Agar har bir atamani darhol to'g'ri tushunmasangiz, tashvishlanmang - faqat narsalar qanday ishlashini asosiy ma'noda tushunishga harakat qiling, va siz qo'llanmaning qolgan qismini o'rganayotganda bilimingiz o'sib boradi.

## Ishlash jarayonining umumiy tavsifi

1. `main.go` ilova kirish nuqtasi hisoblanadi, u `bootstrap.Boot()` funksiyasini chaqirib freymvorkni ishga tushiradi va `app.Wait()` yordamida ilovani ishlashda saqlaydi.

2. `bootstrap.Boot()` funksiyasi `foundation.Setup()`ni chaqirib, yangi Goravel ilova namunasini ishga tushiradi, siz bu yerda `With*` funksiyalari orqali xizmat provayderlari, marshrutlar va migratsiyalar, jadvallar kabi boshqa sozlamalarni o‘rnatishingiz mumkin. Oxirida, ilovani ishga tushirish uchun Create() metodini chaqiring.

3. `Create()` usulida, avval konfiguratsiya yuklanadi, so'ngra barcha xizmat provayderlari va boshqa sozlamalar ro'yxatdan o'tkaziladi. Oxirida, barcha service providerlarni ishga tushirib, ilova vorisini qaytaring.

4. Ilova yaratilgandan so'ng, siz ushbu bosqichda barcha fasadlarni odatdagidek ishlatishingiz mumkin, lekin esda tutingki, sizning moslashtirilgan kodingiz `main.go` faylida `app.Start()` dan oldin joylashtirilishi kerak. Yoki ilova yaratilgandan keyin kodingiz bajarilishini ta'minlash uchun `bootstrap/app.go` faylidagi `WithCallback` funksiyasiga kodingizni qo'shishingiz mumkin. app.Start() ishga tushirilganda, agar siz ularni sozlagan bo‘lsangiz, HTTP yoki gRPC server avtomatik tarzda ishga tushadi.

```go
func Boot() contractsfoundation.Application {
  return foundation.Setup().
    WithConfig(config.Boot).
    WithCallback(func() {
      // Bu yerda sizning maxsus kodingiz, barcha fasadlar bu yerda mavjud.
    }).
    Create()
}
```
