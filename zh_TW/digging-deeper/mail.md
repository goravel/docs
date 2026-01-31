# 郵件

[[toc]]

## 概述

Goravel 可以使用 `facades.Mail()` 便捷的在本地發送郵件。

## 配置

在發送郵件前，需要先對 `config/mail.go` 設定檔進行配置。

## 發送郵件

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

## 透過佇列發送郵件

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

你也可以自定義佇列：

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

## 設定發件人

框架在 `config/mail.go` 配置檔使用 `MAIL_FROM_ADDRESS` 和 `MAIL_FROM_NAME` 作為全局發件人。 你也可以自定義發件人，但需要注意發送郵件的地址需要與配置的 STMP 一致：

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

## 使用 Mailable

郵件的所有參數都可以在一個 `Mailable` 結構中設定。這些結構存儲在 `app/mails` 目錄中。可以透過 `make:mail` Artisan 命令快速創建一個 `Mailable`： 這些結構儲存在 `app/mails` 目錄中。 你可以透過 `make:mail` Artisan 命令快速創建一個 `Mailable`：

```bash
go run . artisan make:mail OrderShipped
```

生成的 `OrderShipped` 結構如下：

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

然後可以在 `Send` 和 `Queue` 方法中使用該 `Mailalbe`：

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

