# 发送邮件

## 简介

Goravel 可以使用 `facades.Mail` 便捷的在本地发送邮件。

## 配置

在发送邮件前，需要先对 `config/mail.go` 配置文件进行配置。

## 发送邮件

```go
import "github.com/goravel/framework/contracts/mail"

err := facades.Mail.To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).
  Send()
```

## 以队列发送邮件

```go
err := facades.Mail.To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).
  Queue(nil)
```

也可以自定义队列

```go
import "github.com/goravel/framework/contracts/mail"

err := facades.Mail.To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).
  Queue(&mail.Queue{Connection: "high", Queue: "mail"})
```

## 发件人设置

默认框架会使用 `config/mail.go` 配置文件中的 `MAIL_FROM_ADDRESS` 与 `MAIL_FROM_NAME` 作为全局发件人，你也可以自定义发件人，但需要注意发送邮箱需要与配置的 STMP 保持一致：

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