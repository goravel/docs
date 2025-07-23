# 邮件

[[toc]]

## 简介

Goravel 可以使用 `facades.Mail()` 轻松地在本地发送邮件。

## 配置

在发送邮件之前，您需要配置 `config/mail.go` 配置文件。

## 通过队列发送邮件

```go
import "github.com/goravel/framework/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Html("<h1>你好 Goravel</h1>")).
  Subject("主题").
  Queue()
```

## 发送邮件

```go
import "github.com/goravel/framework/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Html("<h1>你好 Goravel</h1>")).
  Subject("主题").
  Queue(mail.Queue().Connection("redis").Queue("mail"))
```

您也可以自定义队列：

```go
import "github.com/goravel/framework/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Html("<h1>你好 Goravel</h1>")).
  Subject("主题").
  Send()
```

## 设置发件人

框架使用 `config/mail.go` 配置文件中的 `MAIL_FROM_ ADDRESS` 和 `MAIL_FROM_ NAME` 作为全局发件人。
你也可以自定义发件人，但需要注意邮件地址需要与配置的 SMTP 一致： You can also customize the sender, but you need to note that the mail address needs to be consistent with the configured STMP:

```go
import "github.com/goravel/framework/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  From(mail.Address(testFromAddress, testFromName)).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Html("<h1>你好 Goravel</h1>")).
  Subject("主题").
  Queue(mail.Queue().Connection("redis").Queue("mail"))
```

## 使用 Mailable

邮件的所有参数都可以在一个 `Mailable` struct 中设置。这些 struct 存储在 `app/mails` 目录中。可以通过 `make:mail` Artisan 命令快速创建一个 `Mailable`： These structs are stored in the `app/mails` directory. 邮件的参数可以在 `Mailable` 结构体中设置。 这些结构体存储在 `app/mails` 目录中。
你可以使用 `make:mail` Artisan 命令快速创建一个 `Mailable`：

```bash
go run . artisan make:mail OrderShipped
```

生成的 `OrderShipped` 结构体如下：

```go
import "github.com/goravel/framework/contracts/mail"

type OrderShipped struct {
}

func NewOrderShipped() *OrderShipped {
 return &OrderShipped{}
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

然后你可以在 `Send` 和 `Queue` 方法中使用 `Mailalbe`：

```go
err := facades.Mail().Send(mails.NewOrderShipped())
err := facades.Mail().Queue(mails.NewOrderShipped())
```
