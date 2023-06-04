# Mail

[[toc]]

## Introduction

Goravel can use `facades.Mail` to easily send mail locally.

## Configuration

Before sending an email, you need to configure the `config/mail.go` configuration file.

## Send Mail

```go
import "github.com/goravel/framework/contracts/mail"

err := facades.Mail.To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).
  Send()
```

## Send Mail By Queue

```go
import "github.com/goravel/framework/contracts/mail"

err := facades.Mail.To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).
  Queue(nil)
```

You can also customize the queue:

```go
import "github.com/goravel/framework/contracts/mail"

err := facades.Mail.To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).
  Queue(&mail.Queue{Connection: "high", Queue: "mail"})
```

## Setting Sender

Framework uses `MAIL_FROM_ ADDRESS` and `MAIL_FROM_ NAME` in the `config/mail.go` configuration file as global senders. You can also customize the sender, but you need to note that the mail address needs to be consistent with the configured STMP:

```go
import "github.com/goravel/framework/contracts/mail"

err := facades.Mail.To([]string{"example@example.com"}).
  From(mail.From{Address: "example@example.com", Name: "example"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).
  Queue(&mail.Queue{Connection: "high", Queue: "mail"})
```

<CommentService/>