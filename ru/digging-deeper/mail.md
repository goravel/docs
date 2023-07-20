# Почта (Mail)

[[toc]]

## Введение

Goravel позволяет легко отправлять почту локально с помощью `facades.Mail()`.

## Конфигурация

Перед отправкой электронной почты необходимо настроить файл конфигурации `config/mail.go`.

## Отправка письма

```go
import "github.com/goravel/framework/contracts/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).
  Send()
```

## Отправка письма через очередь

```go
import "github.com/goravel/framework/contracts/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).
  Queue(nil)
```

Вы также можете настроить очередь:

```go
import "github.com/goravel/framework/contracts/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).
  Queue(&mail.Queue{Connection: "high", Queue: "mail"})
```

## Настройка отправителя

Фреймворк использует `MAIL_FROM_ ADDRESS` и `MAIL_FROM_ NAME` в файле конфигурации `config/mail.go` в качестве глобальных отправителей. Вы также можете настроить отправителя, но обратите внимание, что адрес электронной почты должен соответствовать настроенному SMTP:

```go
import "github.com/goravel/framework/contracts/mail"

err := facades.Mail().To([]string{"example@example.com"}).
  From(mail.From{Address: "example@example.com", Name: "example"}).
  Cc([]string{"example@example.com"}).
  Bcc([]string{"example@example.com"}).
  Attach([]string{"file.png"}).
  Content(mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).
  Queue(&mail.Queue{Connection: "high", Queue: "mail"})
```

<CommentService/>