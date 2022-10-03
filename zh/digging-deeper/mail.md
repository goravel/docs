# 发送邮件

## 简介

Goravel 可以使用 `facades.Mail` 便捷的在本地发送邮件。

## 配置

在发送邮件前，需要先对 `config/mail.go` 配置文件进行配置。

## 发送邮件

```go
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
  Queue()
```

也可以自定义队列

```go
err := facades.Mail.To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).
  Queue(&mail.Queue{Connection: "high", Queue: "mail"})
```
