# 发送邮件

[[toc]]

## 简介

Goravel 可以使用 `facades.Mail()` 便捷的在本地发送邮件。

## 配置

在发送邮件前，需要先对 `config/mail.go` 配置文件进行配置。

## 发送邮件

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

## 以队列发送邮件

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

也可以自定义队列

```go
import "github.com/goravel/framework/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Html("<h1>Hello Goravel</h1>")).
  Headers(map[string]string{"X-Mailer": "Goravel"}).
  Subject("Subject").
  Queue(mail.Queue().Connection("redis").Queue("mail"))
```

## 设置发件人

默认框架会使用 `config/mail.go` 配置文件中的 `MAIL_FROM_ADDRESS` 与 `MAIL_FROM_NAME` 作为全局发件人。 你也可以自定义发件人，但需要注意发送邮箱需要与配置的 STMP 保持一致：

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

邮件的所有参数都可以在一个 `Mailable` struct 中设置。 这些 struct 存储在 `app/mails` 目录中。 可以通过 `make:mail` Artisan 命令快速创建一个 `Mailable`：

```bash
go run . artisan make:mail OrderShipped
```

生成的 `OrderShipped` struct 如下：

```go
import "github.com/goravel/framework/contracts/mail"

type OrderShipped struct {
}

func NewOrderShipped() *OrderShipped {
	return &OrderShipped{}
}

func (m *OrderShipped) Headers() map[string]string{
	return map[string]string{
		"X-Mailer": "Goravel",
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

然后可以就可以在 `Send` 与 `Queue` 方法中使用该 `Mailalbe`：

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

