# Mail

[[toc]]

## Introduction

Goravel can use `facades.Mail()` to easily send mail locally.

## Configuration

Before sending an email, you need to configure the `config/mail.go` configuration file.

## Send Mail

```go
import "github.com/goravel/framework/contracts/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Html("<h1>Hello Goravel</h1>")).
  Subject("Subject").
  Send()
```

## Send Mail By Queue

```go
import "github.com/goravel/framework/contracts/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Html("<h1>Hello Goravel</h1>")).
  Subject("Subject").
  Queue()
```

You can also customize the queue:

```go
import "github.com/goravel/framework/contracts/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Html("<h1>Hello Goravel</h1>")).
  Subject("Subject").
  Queue(mail.Queue().Connection("high").Queue("mail"))
```

## Setting Sender

Framework uses `MAIL_FROM_ ADDRESS` and `MAIL_FROM_ NAME` in the `config/mail.go` configuration file as global senders. You can also customize the sender, but you need to note that the mail address needs to be consistent with the configured STMP:

```go
import "github.com/goravel/framework/contracts/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  From(mail.Address(testFromAddress, testFromName)).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Html("<h1>Hello Goravel</h1>")).
  Subject("Subject").
  Queue(mail.Queue().Connection("high").Queue("mail"))
```

<CommentService/>