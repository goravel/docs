# Mail

[[toc]]

## Introduction

Goravel can use `facades.Mail()` to easily send mail locally.

## Configuration

Before sending an email, you need to configure the `config/mail.go` configuration file.

## Send Mail

```go
import "github.com/goravel/framework/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Html("<h1>Hello Goravel</h1>")).
  Headers(map[string]string{"X-Mailer": "Goravel"}).
  Subject("Subject").
  Send()
```

## Send Mail By Queue

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

You can also customize the queue:

```go
import "github.com/goravel/framework/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Html("<h1>Hello Goravel</h1>")).
  Subject("Subject").
  Headers(map[string]string{"X-Mailer": "Goravel"}).
  Queue(mail.Queue().Connection("redis").Queue("mail"))
```

## Setting Sender

Framework uses `MAIL_FROM_ ADDRESS` and `MAIL_FROM_ NAME` in the `config/mail.go` configuration file as global senders. You can also customize the sender, but you need to note that the mail address needs to be consistent with the configured STMP:

```go
import "github.com/goravel/framework/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  From(mail.Address(testFromAddress, testFromName)).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Html("<h1>Hello Goravel</h1>")).
  Headers(map[string]string{"X-Mailer": "Goravel"}).
  Subject("Subject").
  Queue(mail.Queue().Connection("redis").Queue("mail"))
```

## Using Mailable

The parameters of the email can be set in a `Mailable` struct. These structs are stored in the `app/mails` directory. You can quickly create a `Mailable` using the `make:mail` Artisan command:

```bash
go run . artisan make:mail OrderShipped
```

The generated `OrderShipped` struct is as follows:

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

func (m *OrderShipped) Queue() *mail.Queue {
  return &mail.Queue{
    Connection: "redis",
    Queue:      "mail",
  }
}
```

Then you can use the `Mailalbe` in the `Send` and `Queue` methods:

```go
err := facades.Mail().Send(mails.NewOrderShipped())
err := facades.Mail().Queue(mails.NewOrderShipped())
```

## Using Template

The mail module now supports using templates directly with the `html/template` engine. This allows you to render email templates with dynamic data.

### Configuration

To enable template support, configure the `config/mail.go` file:

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

### Creating Templates

Create your email templates in the specified views directory. For example:

```html
<!-- resources/views/mail/welcome.html -->
<h1>Welcome {{.Name}}!</h1>
<p>Thank you for joining {{.AppName}}.</p>
```

### Sending Emails with Templates

You can use the `Content` method to specify the template and pass dynamic data:

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

### Custom Template Engines

You can also register custom template engines in the configuration:

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

