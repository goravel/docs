# Goravel Mail

## Configuration

Configure in `config/mail.go`. Set `MAIL_FROM_ADDRESS` and `MAIL_FROM_NAME` as global sender defaults.

---

## Send Mail (Fluent)

```go
import "github.com/goravel/framework/mail"

err := facades.Mail().
    To([]string{"example@example.com"}).
    Cc([]string{"cc@example.com"}).
    Bcc([]string{"bcc@example.com"}).
    From(mail.Address("from@example.com", "Sender Name")).
    Attach([]string{"file.png"}).
    Content(mail.Html("<h1>Hello Goravel</h1>")).
    Headers(map[string]string{"X-Mailer": "Goravel"}).
    Subject("Subject").
    Send()
```

---

## Send via Queue

```go
import "github.com/goravel/framework/mail"

// Default queue
err := facades.Mail().
    To([]string{"example@example.com"}).
    Content(mail.Html("<h1>Hello Goravel</h1>")).
    Subject("Subject").
    Queue()

// Custom queue
err = facades.Mail().
    To([]string{"example@example.com"}).
    Content(mail.Html("<h1>Hello Goravel</h1>")).
    Subject("Subject").
    Queue(mail.Queue().Connection("redis").Queue("mail"))
```

---

## Mailable Struct

Generate:

```shell
./artisan make:mail OrderShipped
```

```go
package mails

import "github.com/goravel/framework/contracts/mail"

type OrderShipped struct{}

func NewOrderShipped() *OrderShipped {
    return &OrderShipped{}
}

func (m *OrderShipped) Headers() map[string]string {
    return map[string]string{"X-Mailer": "goravel"}
}

func (m *OrderShipped) Attachments() []string {
    return []string{"./logo.png"}
}

func (m *OrderShipped) Content() *mail.Content {
    return &mail.Content{Html: "<h1>Hello Goravel</h1>"}
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

// Optional: configure queue behavior
func (m *OrderShipped) Queue() *mail.Queue {
    return &mail.Queue{
        Connection: "redis",
        Queue:      "mail",
    }
}
```

Use Mailable:

```go
err := facades.Mail().Send(mails.NewOrderShipped())
err = facades.Mail().Queue(mails.NewOrderShipped())
```

---

## Template Support (v1.17)

Configure template engine in `config/mail.go`:

```go
"template": map[string]any{
    "default": config.Env("MAIL_TEMPLATE_ENGINE", "html"),
    "engines": map[string]any{
        "html": map[string]any{
            "driver": "html",
            "path":   config.Env("MAIL_VIEWS_PATH", "resources/views/mail"),
        },
    },
},
```

Create template file (e.g., `resources/views/mail/welcome.html`):

```html
<h1>Welcome {{.Name}}!</h1>
<p>Thank you for joining {{.AppName}}.</p>
```

Send with template:

```go
facades.Mail().
    To([]string{"user@example.com"}).
    Subject("Welcome").
    Content(mail.Content{
        View: "welcome.tmpl",
        With: map[string]any{
            "Name":    "John",
            "AppName": "Goravel",
        },
    }).
    Send()
```

### Custom Template Engine

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
},
```
