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
  Subject("Subject").
  Headers(map[string]string{"X-foo": "Bar"}).
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
  Subject("Subject").
  Headers(map[string]string{"X-Foo": "Bar"}).
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
  Headers(map[string]string{"X-Foo": "Bar"}).
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
  Subject("Subject").
  Headers(map[string]string{"X-Foo": "bar"}).
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
		"X-Foo": "Bar",
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

<CommentService/>
