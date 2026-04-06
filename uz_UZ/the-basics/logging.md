# Loglash

[[toc]]

## Kirish

Ilovaning ishlash holatini tushunish uchun Goravel kuchli log xizmatini taqdim etadi, u log xabarlari va tizim xatolarini `facades.Log()` orqali fayl yoki boshqa kanallarga yozishi mumkin.

## Konfiguratsiya

Turli log kanallarini sozlash uchun `config/logging.go` faylida maxsus konfiguratsiyalar amalga oshirilishi mumkin.

`Goravel` sukut bo'yicha loglarni yozish uchun `stack` kanalidan foydalanadi, `stack` loglarni bir nechta kanallarga yo'naltirish imkonini beradi.

`single` va `daily` haydovchilaridagi `print` konfiguratsiyasi log chiqishini konsolga boshqarishi mumkin.

## Mavjud kanal haydovchilari

| Nomi     | Tavsifi                             |
| -------- | ----------------------------------- |
| `stack`  | Bir nechta kanallarga ruxsat berish |
| `single` | Yagona log fayli                    |
| `daily`  | Kuniga bitta log fayli              |
| `custom` | Maxsus haydovchi                    |

### Kontekstni kiritish

```go
facades.Log().WithContext(ctx)
```

## Log xabarlarini yozish

```go
facades.Log().Debug(message)
facades.Log().Debugf(message, args)
facades.Log().Info(message)
facades.Log().Infof(message, args)
facades.Log().Warning(message)
facades.Log().Warningf(message, args)
facades.Log().Error(message)
facades.Log().Errorf(message, args)
facades.Log().Fatal(message)
facades.Log().Fatalf(message, args)
facades.Log().Panic(message)
facades.Log().Panicf(message, args)
```

### Muayyan kanalga yozish

Ba'zan, siz xabarlarni ilovaning sukut bo'yicha kanalidan boshqa kanalga yozishni xohlashingiz mumkin:

```go
facades.Log().Channel("single").Info(message)
```

Agar siz bir vaqtning o'zida bir nechta kanallarga yozishni istasangiz, `Stack` usulidan foydalanishingiz mumkin:

```go
facades.Log().Stack([]string{"single", "slack"}).Info(message)
```

## Zanjir usullari

Goravel qulay zanjir usullarini taqdim etadi, ular logga foydali ma'lumotlarni qo'shishni osonlashtiradi:

```go
facades.Log().User("John").Debug(message)
```

| Usul          | Harakat                                                                                   |
| ------------- | ----------------------------------------------------------------------------------------- |
| Kod           | Logni tavsiflovchi kod yoki slug'ni o'rnating.                            |
| Maslahat      | Tezroq tuzatish uchun maslahat o'rnating.                                 |
| Ichida        | Log yozuvining tegishli bo'lgan funksiya toifasi yoki domenini o'rnating. |
| Egasi         | Ogohlantirish maqsadlari uchun foydali.                                   |
| Request       | Http.Request'ni ta'minlaydi.                              |
| Response      | Http.Response'ni ta'minlaydi.                             |
| Teglar        | Xatoni qaytaradigan funksiyani tavsiflovchi bir nechta teglarni qo'shing. |
| Foydalanuvchi | Log yozuvi bilan bog'liq foydalanuvchini o'rnating.                       |
| Bilan         | Log yozuvi kontekstiga kalit-qiymat juftliklarini qo'shing.               |
| WithTrace     | Log yozuviga stack ma'lumotlarini qo'shing.                               |

## Maxsus kanal yaratish

Agar siz to'liq maxsus kanal aniqlashni istasangiz, `config/logging.go` konfiguratsiya faylida `custom` haydovchi turini ko'rsatishingiz mumkin.
Keyin `framework\contracts\log\Logger` strukturini amalga oshirish uchun `via` opsiyasini qo'shing:

```go
// config/logging.go
"custom": map[string]interface{}{
    "driver": "custom",
    "via":    &CustomLogger{},
},
```

### Haydovchini amalga oshirish

`framework\contracts\log\Logger` interfeysini amalga oshiring.

```go
// framework/contracts/log/Logger
package log

type Logger interface {
  // Handle pass channel config path here
  Handle(channel string) (Handler, error)
}
```

Siz ma'lumot uchun daily va single log haydovchilarini tekshirishingiz mumkin:

- [Kunlik](https://github.com/goravel/framework/blob/master/log/logger/daily.go)
- [Yagona](https://github.com/goravel/framework/blob/master/log/logger/single.go)
