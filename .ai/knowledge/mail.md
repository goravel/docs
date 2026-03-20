# Mail Facade

## Core Imports

```go
import (
    "github.com/goravel/framework/mail"
    contractsmail "github.com/goravel/framework/contracts/mail"

    "yourmodule/app/facades"
)
```

## Contracts

Fetch these files for exact, always-current type definitions:

- `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/mail/mail.go`

## Available Methods

**Fluent builder (facades.Mail()):**

- `To([]string)` Mail - set recipients
- `Cc([]string)` Mail - set CC recipients
- `Bcc([]string)` Mail - set BCC recipients
- `From(mail.Address(addr, name))` Mail - override sender
- `Subject(string)` Mail - set subject
- `Content(mail.Content{...})` Mail - set HTML body or template
- `Attach([]string)` Mail - attach files by path
- `Headers(map[string]string)` Mail - set custom headers
- `Send()` error - send immediately
- `Queue(queueConfig?)` error - push to queue (optional `mail.Queue()` config)

**Mailable pattern:**

- `facades.Mail().Send(mailable)` error - send from Mailable struct
- `facades.Mail().Queue(mailable)` error - queue from Mailable struct

**mail helpers:**

- `mail.Html(htmlString)` Content - shorthand for raw HTML content
- `mail.Address(address, name)` From - construct From struct
- `mail.Queue()` Queue builder - `.Connection(name).Queue(name)` for custom queue

## Implementation Example

```go
// Direct fluent send
package controllers

import (
    "github.com/goravel/framework/contracts/http"
    "github.com/goravel/framework/mail"
    "yourmodule/app/facades"
)

type OrderController struct{}

func (r *OrderController) SendConfirmation(ctx http.Context) http.Response {
    err := facades.Mail().
        To([]string{"customer@example.com"}).
        Cc([]string{"support@example.com"}).
        Subject("Order Confirmed").
        Content(mail.Html("<h1>Your order #123 is confirmed!</h1>")).
        Attach([]string{"./storage/invoices/123.pdf"}).
        Headers(map[string]string{"X-Order-ID": "123"}).
        Send()

    if err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }
    return ctx.Response().Json(http.StatusOK, http.Json{"sent": true})
}

// Mailable struct pattern
// app/mails/order_shipped.go
package mails

import "github.com/goravel/framework/contracts/mail"

type OrderShipped struct {
    OrderID int
}

func NewOrderShipped(id int) *OrderShipped { return &OrderShipped{OrderID: id} }

func (m *OrderShipped) Attachments() []string { return []string{} }

func (m *OrderShipped) Content() *mail.Content {
    return &mail.Content{
        View: "order_shipped.tmpl",
        With: map[string]any{"OrderID": m.OrderID},
    }
}

func (m *OrderShipped) Envelope() *mail.Envelope {
    return &mail.Envelope{
        To:      []string{"customer@example.com"},
        Subject: fmt.Sprintf("Order #%d Shipped", m.OrderID),
    }
}

func (m *OrderShipped) Headers() map[string]string {
    return map[string]string{"X-Mailer": "Goravel"}
}

func (m *OrderShipped) Queue() *mail.Queue {
    return &mail.Queue{Connection: "redis", Queue: "mail"}
}

// Usage:
// facades.Mail().Send(mails.NewOrderShipped(123))
// facades.Mail().Queue(mails.NewOrderShipped(123))
```

## Rules

- Configure SMTP in `config/mail.go`; global sender from `MAIL_FROM_ADDRESS` / `MAIL_FROM_NAME`.
- Custom `From` address must be authorized by the configured SMTP server.
- `Content(mail.Html(str))` sends raw HTML; `Content(mail.Content{View: "file.tmpl", With: data})` uses template engine.
- Templates are loaded from the path configured in `config/mail.go` under `template.engines.html.path`.
- `Queue()` with no argument uses the default queue; pass `mail.Queue().Connection("c").Queue("q")` for custom.
- `Mailable.Queue()` returning `nil` causes `facades.Mail().Queue(mailable)` to send synchronously.
- `make:mail OrderShipped` generates scaffold in `app/mails/` directory.
- Attach paths are relative to the application working directory.
- Template engine defaults to `html/template`; custom engines implement `contracts/mail.Template`.
