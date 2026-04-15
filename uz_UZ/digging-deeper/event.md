# Tadbirlar

[[toc]]

## Kirish

Goravel hodisalari oddiy kuzatuvchi naqshini amalga oshiradi, ilovangiz ichida sodir bo'ladigan turli xil hodisalarga obuna bo'lish va tinglash imkonini beradi. Tadbir sinflari odatda `app/events` katalogida saqlanadi, ularning tinglovchilari esa `app/listeners` katalogida saqlanadi. Agar ilovangizda bu kataloglarni ko'rmasangiz, xavotirlanmang, chunki ular siz Artisan konsol buyruqlari yordamida hodisalar va tinglovchilarni yaratayotganda siz uchun yaratiladi.

Tadbirlar ilovangizning turli jihatlarini ajratish uchun ajoyib usul bo'lib xizmat qiladi, chunki bitta tadbir bir-biriga bog'liq bo'lmagan bir nechta tinglovchilarga ega bo'lishi mumkin. Masalan, har safar buyurtma jo'natilganda foydalanuvchingizga Slack bildirishnomasini yuborishni xohlashingiz mumkin. Buyurtmani qayta ishlash kodini Slack bildirishnomalari kodingiz bilan bog'lamasdan, siz `app/events/OrderShipped` hodisasini yaratishingiz mumkin, bu esa tinglovchi tomonidan qabul qilinib, Slack bildirishnomasini yuborish uchun ishlatilishi mumkin.

## Tadbirlar va tinglovchilarni ro'yxatdan o'tkazish

Barcha hodisalar va tinglovchilar `bootstrap/app.go` faylidagi `WithEvents` funksiyasi orqali ro'yxatdan o'tkazilishi kerak:

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithEvents(func() map[event.Event][]event.Listener {
			return map[event.Event][]event.Listener{
				events.NewOrderShipped(): {
					listeners.NewSendShipmentNotification(),
				},
			}
		}).
		WithConfig(config.Boot).
		Create()
}
```

### Voqealarni va Tinglovchilarni Yaratish

Siz `make:event` va `make:listener` Artisan buyruqlaridan foydalanib, alohida hodisalar va tinglovchilarni yaratishingiz mumkin:

```go
./artisan make:event PodcastProcessed
./artisan make:event user/PodcastProcessed

./artisan make:listener SendPodcastNotification
./artisan make:listener user/SendPodcastNotification
```

## Tadbirlarni aniqlash

Tadbir sinfi asosan tadbir bilan bog'liq ma'lumotlarni o'z ichiga olgan ma'lumotlar konteyneridir, `event` ning `Handle` usuli `[]event.Arg` tuzilmasini kiritadi va qaytaradi, bu ma'lumotlarni qayta ishlash uchun ishlatilishi mumkin. Qayta ishlangan ma'lumotlar keyin barcha bog'langan `listener`larga o'tkaziladi. Masalan, `app\events\OrderShipped` hodisasini faraz qilaylik:

```go
package events

import "github.com/goravel/framework/contracts/event"

type OrderShipped struct {}

func (receiver *OrderShipped) Handle(args []event.Arg) ([]event.Arg, error) {
  return args, nil
}
```

## Tinglovchilarni belgilash

Keyingi, keling, bizning misol hodisasi uchun tinglovchini ko'rib chiqaylik. Tadbir tinglovchilari `Handle` usulining qaytaradigan `[]event.Arg` tadbirini oladi. `Handle` usulida siz hodisaga javob berish uchun zarur bo'lgan har qanday harakatlarni bajara olasiz:

```go
package listeners

import (
  "github.com/goravel/framework/contracts/event"
)

type SendShipmentNotification struct {}

func (receiver *SendShipmentNotification) Signature() string {
  return "send_shipment_notification"
}

func (receiver *SendShipmentNotification) Queue(args ...any) event.Queue {
  return event.Queue{
    Enable:     false,
    Connection: "",
    Queue:      "",
  }
}

func (receiver *SendShipmentNotification) Handle(args ...any) error {
  return nil
}
```

### Tadbirning tarqalishini to'xtatish

Ba'zan, siz hodisaning boshqa tinglovchilarga tarqalishini to'xtatmoqchi bo'lishingiz mumkin. Buning uchun siz tinglovchingizning `Handle` usulidan xatoni qaytarishingiz mumkin.

## Navbatga qo‘yilgan hodisa tinglovchilari

Eshitingiz sekin vazifani bajaradigan bo'lsa, masalan, elektron pochta yuborish yoki HTTP so'rovini amalga oshirish kabi, navbatdagi tinglovchilar foydali bo'lishi mumkin. Navbatga qo‘yilgan tinglovchilardan foydalanishdan oldin, serveringizda yoki mahalliy ishlab chiqish muhitingizda [navbatni sozlang](queues.md) va navbat ishchisini ishga tushiring.

```go
package listeners

...

func (receiver *SendShipmentNotification) Queue(args ...any) event.Queue {
  return event.Queue{
    Enable:     false,
    Connection: "",
    Queue:      "",
  }
}

func (receiver *SendShipmentNotification) Handle(args ...any) error {
  name := args[0]

  return nil
}
```

### Navbatga qo‘yilgan hodisa tinglovchilari va maʼlumotlar bazasi tranzaksiyalari

Navbatga qo‘yilgan tinglovchilar ma’lumotlar bazasi tranzaksiyalari ichida jo‘natilganda, navbat ularni ma’lumotlar bazasi tranzaksiyasi tasdiqlanmaganidan oldin qayta ishlashi mumkin. Bunday bo'lganda, ma'lumotlar bazasi tranzaksiyasi davomida modellar yoki ma'lumotlar bazasi yozuvlariga kiritgan yangilanishlaringiz ma'lumotlar bazasida hali aks ettirilmagan bo'lishi mumkin. Bundan tashqari, tranzaksiya ichida yaratilgan har qanday modellar yoki ma'lumotlar bazasi yozuvlari ma'lumotlar bazasida mavjud bo'lmasligi mumkin. Agar tinglovchingiz ushbu modellarga bog'liq bo'lsa, navbatdagi tinglovchini jo'natadigan ish qayta ishlanganda kutilmagan xatolar yuzaga kelishi mumkin. Bu vaqtda, tadbir ma'lumotlar bazasi tranzaksiyalaridan tashqarida joylashtirilishi kerak.

## Vaqtinchalik hodisalar

Biz hodisalarni `facades.Event().Job().Dispatch()` usuli orqali jo‘nata olamiz.

```go
package controllers

import (
  "github.com/goravel/framework/contracts/event"
  "github.com/goravel/framework/contracts/http"

  "goravel/app/events"
  "goravel/app/facades"
)

type UserController struct {
}

func (r UserController) Show(ctx http.Context) {
  err := facades.Event().Job(&events.OrderShipped{}, []event.Arg{
    {Type: "string", Value: "Goravel"},
    {Type: "int", Value: 1},
  }).Dispatch()
}
```

## `event.Arg.Type` qo‘llab-quvvatlanadigan turlar

```go
bool
int
int8
int16
int32
int64
uint
uint8
uint16
uint32
uint64
float32
float64
string
[]bool
[]int
[]int8
[]int16
[]int32
[]int64
[]uint
[]uint8
[]uint16
[]uint32
[]uint64
[]float32
[]float64
[]string
```
