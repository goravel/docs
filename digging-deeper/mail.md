# Mail

## Introduction

Goravel can use `facades.Mail` to easily send mail locally.

## Configuration

Before sending an email, you need to configure the `config/mail.go` configuration file.

## Send Mail

```go
err := facades.Mail.To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).
  Send()
```

## Send Mail By Queue

```go
err := facades.Mail.To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).
  Queue()
```

You can also customize the queue:

```go
err := facades.Mail.To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).
  Queue(&mail.Queue{Connection: "high", Queue: "mail"})
```
