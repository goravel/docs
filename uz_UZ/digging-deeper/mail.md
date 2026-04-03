# Pochta

[[toc]]

## Kirish

Goravel pochtani mahalliy ravishda osongina yuborish uchun `facades.Mail()` dan foydalanishi mumkin.

## Konfiguratsiya

Elektron pochta xabarini yuborishdan oldin, siz `config/mail.go` konfiguratsiya faylini sozlashingiz kerak.

## Pochta yuborish

```go
import "github.com/goravel/framework/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Html("<0>Hello Goravel</0>")).
  Headers(map[string]string{"X-Mailer": "Goravel"}).
  Subject("Subject").
  Send()
```

## Navbat bo'yicha xat yuborish

```go
import "github.com/goravel/framework/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Html("<h1>Hello Goravel</h1>")).
  Headers(map[string]string{"X-Mailer": "Goravel"}).
  Subject("Subject").
  Queue()
```

Siz shuningdek, navbatni sozlashingiz mumkin:

```go
import "github.com/goravel/framework/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Html("<0>Hello Goravel</0>")).
  Subject("Subject").
  Headers(map[string]string{"X-Mailer": "Goravel"}).
  Queue(mail.Queue().Connection("redis").Queue("mail"))
```

## Yuboruvchini sozlash

Framework global jo'natuvchilar sifatida `config/mail.go` konfiguratsiya faylida `MAIL_FROM_ ADDRESS` va `MAIL_FROM_ NAME` dan foydalanadi. Siz shuningdek, jo'natuvchini sozlashingiz mumkin, ammo pochta manzili sozlangan STMP bilan mos kelishi kerakligini yodda tutishingiz kerak:

```go
import "github.com/goravel/framework/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  From(mail.Address(testFromAddress, testFromName)).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Html("<0>Hello Goravel</0>")).
  Headers(map[string]string{"X-Mailer": "Goravel"}).
  Subject("Subject").
  Queue(mail.Queue().Connection("redis").Queue("mail"))
```

## Mailable’dan foydalanish

Elektron pochta parametrlarini "Mailable" tuzilmasida o'rnatish mumkin. Ushbu tuzilmalar `app/mails` katalogida saqlanadi. Siz "make:mail" Artisan buyrug'i yordamida tezda "Mailable" yaratishingiz mumkin:

```bash
yugurishga boring. hunarmand yasash: pochta orqali buyurtma yuborildi
```

Yaratilgan `OrderShipped` tuzilmasi quyidagicha:

```go
import "github.com/goravel/framework/contracts/mail"

type OrderShipped struct {
}

func NewOrderShipped() *OrderShipped {
	return &OrderShipped{}
}

func (m *OrderShipped) Headers() map[string]string {
	return map[string]string{
		"X-Mailer": "goravel",
	}
}

func (m *OrderShipped) Attachments() []string {
	return []string{"../logo.png"}
}

func (m *OrderShipped) Content() *mail.Content {
	return &mail.Content{Html: "<0>Hello Goravel</0>"}
}

func (m *OrderShipped) Envelope() *mail.Envelope {
	return &mail.Envelope{
		Bcc:     []string{"bcc@goravel.dev"},
		Cc:      []string{"cc@goravel.dev"},
		From:    mail.From{Address: "from@goravel.dev", Name: "from"},
		Subject: "Goravel",
		To:      []string{"to@goravel.dev"},
	}
}

func (m *OrderShipped) Queue() *mail.Queue {
  return &mail.Queue{
    Connection: "redis",
    Queue:      "mail",
  }
}
```

Keyin siz "Send" va "Queue" usullarida "Mailalbe" dan foydalanishingiz mumkin:

```go
err := facades.Mail().Send(mails.NewOrderShipped())
err := facades.Mail().Queue(mails.NewOrderShipped())
```

## Shablondan foydalanish

Pochta moduli endi shablonlardan to'g'ridan-to'g'ri `html/template` dvigateli yordamida foydalanishni qo'llab-quvvatlaydi. Bu sizga elektron pochta shablonlarini dinamik ma'lumotlar bilan ko'rsatish imkonini beradi.

### Konfiguratsiya

Andoza qo'llab-quvvatlashini yoqish uchun `config/mail.go` faylini sozlang:

```go
"template": map[string]any{
    "default": config.Env("MAIL_TEMPLATE_ENGINE", "html"),
    "engines": map[string]any{
        "html": map[string]any{
            "driver": "html",
            "path":   config.Env("MAIL_VIEWS_PATH", "resources/views/mail"),
        },
    },
}
```

### Shablonlar yaratish

Belgilangan ko'rinishlar katalogida elektron pochta shablonlaringizni yarating. Masalan:

```html
<!-- resources/views/mail/welcome.html -->
<h1>Welcome {{.Name}}!</h1>
<p>Thank you for joining {{.AppName}}.</p>
```

### Shablonlar yordamida elektron pochta xabarlarini yuborish

Shablonni belgilash va dinamik ma'lumotlarni uzatish uchun siz "Content" usulidan foydalanishingiz mumkin:

```go
facades.Mail().
    To([]string{"user@example.com"}).
    Subject("Welcome").
    Content(mail.Content{
        View: "welcome.tmpl",
        With: map[string]any{
            "Name": "John",
            "AppName": "Goravel",
        },
    }).
    Send()
```

### Maxsus shablon dvigatellari

Siz shuningdek, konfiguratsiyada maxsus shablon dvigatellarini ro'yxatdan o'tkazishingiz mumkin:

```go
"template": map[string]any{
    "default": "blade",
    "engines": map[string]any{
        "blade": map[string]any{
            "driver": "custom",
            "via": func() (mail.Template, error) {
                return NewBladeTemplateEngine(), nil
            },
        },
    },
}
```

