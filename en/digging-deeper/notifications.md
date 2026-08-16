# Notifications

[[toc]]

## Introduction

Goravel's notification system lets you inform users about what's happening in your application — an order shipped, a payment received, a new message waiting. Instead of wiring each of these to a specific delivery mechanism, you write one notification class per message and let Goravel route it through the channels you pick: `mail`, `database`, or a custom channel of your own.

A notification describes the message itself. The notifiable (usually one of your models) tells Goravel *where* to deliver it. `facades.Notification()` is the entry point for sending.

## Installation

The notification facade is not installed by default. Install it with the `package:install` command:

```shell
go run . artisan package:install Notification
```

### Database Table

Before using the `database` channel, you need a `notifications` table to store the notifications. Generate its migration with the `notifications:table` command:

```shell
go run . artisan notifications:table
```

This creates a `<timestamp>_create_notifications_table.go` migration in `database/migrations` and auto-registers it in `bootstrap/migrations.go`. Then run the migration:

```shell
go run . artisan migrate
```

## Generating Notifications

By default, all notifications are stored in the `app/notifications` directory. If that directory doesn't exist, it will be created when you run the `make:notification` Artisan command:

```shell
go run . artisan make:notification OrderShipped
go run . artisan make:notification user/OrderShipped
```

The command scaffolds a mail-channel notification with a `Via` method and a `ToMail` method:

```go
package notifications

import (
  "github.com/goravel/framework/contracts/notification"
  "github.com/goravel/framework/notification/mail"
)

type OrderShipped struct {
  OrderID string
}

func NewOrderShipped(orderID string) *OrderShipped {
  return &OrderShipped{OrderID: orderID}
}

func (r *OrderShipped) Via(notifiable notification.Notifiable) []string {
  return []string{"mail"}
}

func (r *OrderShipped) ToMail(notifiable notification.Notifiable) notification.MailMessage {
  return mail.NewMessage().
    Subject("Order " + r.OrderID + " has shipped").
    Html("<p>Order " + r.OrderID + " has shipped.</p>").
    Build()
}
```

To scaffold a database-channel notification instead, pass the `--database` flag:

```shell
go run . artisan make:notification OrderProcessed --database
```

## Notification Structure

A notification is a struct that carries the data needed to build the message. The only required method is `Via`, which returns the list of channels the notification should be delivered through:

```go
func (r *OrderShipped) Via(notifiable notification.Notifiable) []string {
  return []string{"mail", "database"}
}
```

Depending on the channels returned, the notification must implement the corresponding payload methods:

| Channel    | Contract                | Method                                                                                              |
| ---------- | ----------------------- | --------------------------------------------------------------------------------------------------- |
| `mail`     | `MailableNotification`  | `ToMail(notifiable notification.Notifiable) notification.MailMessage`                               |
| `database` | `DatabaseNotification`  | `ToDatabase(notifiable notification.Notifiable) map[string]any`                                     |
| custom     | —                       | Defined by your [custom channel](#custom-channels) implementation                                   |

### Optional Contracts

Implement these optional contracts to customize how notifications are sent:

| Contract                    | Method                                                      | Purpose                                                                             |
| --------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `NotificationWithID`        | `ID() string`                                               | A custom ID for the notification (used by the database channel); defaults to a UUID |
| `NotificationWithShouldSend`| `ShouldSend(notifiable notification.Notifiable, channel string) bool` | Skip delivery for a given channel when returning `false`            |
| `NotificationWithAfterSending` | `AfterSending(notifiable notification.Notifiable, channel string) error` | Run a hook after a successful channel delivery                      |
| `DatabaseRoutable`          | `DatabaseConnection() string`                               | The database connection the notification row should be stored on; `""` for the default |
| `ShouldQueue`               | `OnQueue() string`, `OnConnection() string`                 | Queue the notification instead of sending it synchronously                            |

```go
// A custom ID used as the notifications table primary key.
func (r *Welcome) ID() string {
  return "welcome-notification"
}

// Skip delivery for the given channel when returning false.
func (r *OrderShipped) ShouldSend(notifiable notification.Notifiable, channel string) bool {
  return r.OrderID != ""
}

// Run a hook after a successful channel delivery.
func (r *OrderShipped) AfterSending(notifiable notification.Notifiable, channel string) error {
  return nil
}

// Store the notification on a non-default connection.
func (r *OrderProcessed) DatabaseConnection() string {
  return "reporting"
}
```

## Sending Notifications

### Using The Notifiable Contract

Every notification is addressed to a *notifiable* — typically one of your models. To make a model notifiable, implement the `Notifiable` contract and add a `RouteNotificationFor` method that resolves the delivery address for each channel:

```go
package models

type User struct {
  ID   uint
  Mail string
}

// RouteNotificationFor resolves the delivery address per channel.
func (r *User) RouteNotificationFor(channel string) any {
  switch channel {
  case "mail":
    return r.Mail
  case "database":
    return r.ID
  default:
    return nil
  }
}
```

The address type is channel-specific:

| Channel    | Accepted types                                                       |
| ---------- | -------------------------------------------------------------------- |
| `mail`     | `string` (single address), `[]string` (multiple addresses), `map[string]string` (address → name) |
| `database` | `string` (model primary key; numeric IDs are auto-converted)         |
| custom     | Any type your [custom channel](#custom-channels) understands         |

Then send the notification with `facades.Notification().Send()`:

```go
package controllers

import (
  "github.com/goravel/framework/contracts/http"

  "goravel/app/facades"
  "goravel/app/models"
  "goravel/app/notifications"
)

func (c *OrderController) Ship(ctx http.Context) http.Response {
  var user models.User

  if err := facades.Orm().Query().Find(&user, 1); err != nil {
    return ctx.Response().String(http.StatusInternalServerError, err.Error())
  }

  if err := facades.Notification().Send(user, notifications.NewOrderShipped("12345")); err != nil {
    return ctx.Response().String(http.StatusInternalServerError, err.Error())
  }

  return ctx.Response().Success().Json(http.Json{"message": "shipped"})
}
```

### Using The Route Method

When the recipient isn't one of your models — a bare email address or an ID is all you have — skip the notifiable and pass the delivery address inline with `Route`. It returns an on-demand notifiable you can chain additional routes onto, then send with `Notify`:

```go
err := facades.Notification().Route("mail", "example@example.com").Notify(notifications.NewWelcome("Bowen"))

// Chain routes for multiple channels.
err := facades.Notification().
  Route("database", "123").
  Route("mail", "example@example.com").
  Notify(notifications.NewWelcome("Bowen"))
```

### Send vs. SendNow

`Send` delivers through the channels returned by `Via`. If the notification implements `ShouldQueue`, the delivery is dispatched as a queued job instead of running inline; otherwise it runs synchronously in the current request. `SendNow` always delivers synchronously, bypassing the queue even for `ShouldQueue` notifications:

```go
// Runs inline (or via the queue if OrderProcessed implements ShouldQueue).
err := facades.Notification().Send(user, notifications.NewOrderProcessed("12345"))

// Always delivers synchronously, never queued.
err := facades.Notification().SendNow(user, notifications.NewOrderProcessed("12345"))

// On-demand equivalents.
err := facades.Notification().Route("database", "123").NotifyNow(notifications.NewWelcome("Bowen"))
```

## Mail Notifications

When a notification's `Via` returns `mail`, implement `MailableNotification` and provide a `ToMail` method that builds the outgoing email as a `notification.MailMessage`. Use the fluent `mail.NewMessage()` builder from the `github.com/goravel/framework/notification/mail` package:

```go
package notifications

import (
  "github.com/goravel/framework/contracts/notification"
  "github.com/goravel/framework/notification/mail"
)

func (r *OrderShipped) ToMail(notifiable notification.Notifiable) notification.MailMessage {
  return mail.NewMessage().
    Subject("Order " + r.OrderID + " has shipped").
    Html("<p>Order " + r.OrderID + " has shipped.</p>").
    Text("Order " + r.OrderID + " has shipped.").
    Build()
}
```

The builder supports the following methods:

| Method                         | Description                                             |
| ------------------------------ | ------------------------------------------------------- |
| `Subject(subject string)`      | The email subject; defaults to the notification type name |
| `To(addresses ...string)`      | Override the recipient(s); empty uses `RouteNotificationFor("mail")` |
| `From(address string)`         | Override the sender; empty uses the global `mail.from` config |
| `ReplyTo(address string)`      | Sets the `Reply-To` header                              |
| `Html(html string)`            | Sets the HTML body                                      |
| `Text(text string)`            | Sets the plain-text body                                |
| `HtmlView(view string, with map[string]any)` | Renders the HTML body from a [template](mail.md#using-template) |
| `TextView(view string, with map[string]any)`  | Renders the plain-text body from a [template](mail.md#using-template) |
| `Attach(paths ...string)`      | Attaches files by absolute path                         |
| `Header(key, value string)`    | Adds an arbitrary email header                          |
| `Build()`                      | Returns the finished `MailMessage`                      |

### Routing Mail Notifications

The mail channel resolves recipients from `RouteNotificationFor("mail")`, which accepts a single `string` address, multiple `[]string` addresses, or a `map[string]string` of address → name pairs:

```go
func (r *User) RouteNotificationFor(channel string) any {
  if channel == "mail" {
    return map[string]string{"example@example.com": "Bowen"}
  }

  return nil
}
```

For per-notification recipient control, implement the `MailRoutable` contract on the notifiable. Its `RouteNotificationForMail` takes precedence over `RouteNotificationFor("mail")`:

```go
func (r *User) RouteNotificationForMail(notification notification.Notification) map[string]string {
  if _, ok := notification.(*notifications.OrderShipped); ok {
    return map[string]string{"shipments@example.com": "Shipments"}
  }

  return map[string]string{r.Mail: r.Name}
}
```

## Database Notifications

For the `database` channel, implement `DatabaseNotification` and return the data to persist from `ToDatabase`. Goravel JSON-encodes the returned map and stores it in the `data` column of the `notifications` table:

```go
func (r *OrderProcessed) ToDatabase(notifiable notification.Notifiable) map[string]any {
  return map[string]any{
    "order_id": r.OrderID,
  }
}
```

The `notifications` table has the following columns:

| Column            | Type        | Description                                         |
| ----------------- | ----------- | --------------------------------------------------- |
| `id`              | `string(36)`| Primary key; a UUID by default, or `ID()` when implemented |
| `type`            | `string`    | The notification's type name                        |
| `notifiable_type` | `string`    | The notifiable's type name                          |
| `notifiable_id`   | `string`    | The delivery address returned by `RouteNotificationFor("database")` |
| `data`            | `text`      | The JSON-encoded data returned by `ToDatabase`      |
| `read_at`         | `timestamp` | Nullable; marks the notification as read            |
| `created_at` / `updated_at` | `timestamp` | Timestamps                                  |

### Retrieving Notifications

Query the `notifications` table directly with the [Query Builder](../database/queries.md) to retrieve a user's notifications:

```go
package models

import (
  "time"
)

type Notification struct {
  ID        string     `gorm:"primaryKey;column:id"`
  Type      string     `gorm:"column:type"`
  Data      string     `gorm:"column:data"`
  ReadAt    *time.Time `gorm:"column:read_at"`
  CreatedAt time.Time  `gorm:"column:created_at"`
}

func (Notification) TableName() string { return "notifications" }
```

```go
package controllers

import (
  "github.com/goravel/framework/contracts/http"

  "goravel/app/facades"
  "goravel/app/models"
)

func (c *UserController) Notifications(ctx http.Context) http.Response {
  var notifications []models.Notification

  if err := facades.Orm().Query().Where("notifiable_id", userID).Find(&notifications); err != nil {
    return ctx.Response().String(http.StatusInternalServerError, err.Error())
  }

  return ctx.Response().Success().Json(http.Json{"notifications": notifications})
}
```

## Queued Notifications

`Send` runs the delivery inline in the current request unless the notification opts into the queue. To make a notification queued, implement the `ShouldQueue` contract on it with `OnQueue` and `OnConnection` methods. Returning `""` for either falls back to the default queue and connection:

```go
type OrderProcessed struct {
  OrderID string
}

// Via returns the channels this notification should be sent through.
func (r *OrderProcessed) Via(notifiable notification.Notifiable) []string {
  return []string{"database"}
}

func (r *OrderProcessed) ToDatabase(notifiable notification.Notifiable) map[string]any {
  return map[string]any{"order_id": r.OrderID}
}

// ShouldQueue marks this notification for queued dispatch.
func (r *OrderProcessed) OnQueue() string      { return "notifications" }
func (r *OrderProcessed) OnConnection() string { return "database" }
```

When you send a queued notification with `Send` (or `Notify`), it is enqueued as a job instead of being delivered immediately, and a queue worker must be running to deliver it. `SendNow` (or `NotifyNow`) always bypasses the queue and delivers synchronously.

```go
// Queued: delivered by a queue worker.
err := facades.Notification().Send(user, notifications.NewOrderProcessed("12345"))

// Synchronous: delivered immediately, even for ShouldQueue notifications.
err := facades.Notification().SendNow(user, notifications.NewOrderProcessed("12345"))
```

## Custom Channels

When the built-in `mail` and `database` channels don't fit your use case — Slack, SMS, push, etc. — implement the `Channel` contract yourself and register it with `Extend`:

```go
package channels

import (
  "github.com/goravel/framework/contracts/notification"
)

type SmsChannel struct{}

func (r *SmsChannel) Name() string { return "sms" }

func (r *SmsChannel) Send(notifiable notification.Notifiable, n notification.Notification) error {
  phone := notifiable.RouteNotificationFor("sms")
  // send the SMS...

  return nil
}
```

Register the channel on the manager, usually in a [service provider](../architecture-concepts/service-providers.md) `Register` method or at bootstrap:

```go
facades.Notification().Extend(&channels.SmsChannel{})
```

Then return the channel name from a notification's `Via` method:

```go
func (r *OrderShipped) Via(notifiable notification.Notifiable) []string {
  return []string{"sms"}
}
```

### Queueable Custom Channels

To make a custom channel work with [queued notifications](#queued-notifications), implement the `ResolvableChannel` contract. It splits delivery into `Resolve` — which captures the recipient route and the channel's message payload as plain JSON data while the live values are still in scope — and `Deliver`, which sends using only that plain data. This keeps the queued dispatch job fully serializable across persisting queue drivers like `database` and `redis`:

```go
package channels

import (
  "encoding/json"

  "github.com/spf13/cast"

  "github.com/goravel/framework/contracts/notification"
)

type SmsChannel struct{}

func (r *SmsChannel) Name() string { return "sms" }

func (r *SmsChannel) Send(notifiable notification.Notifiable, n notification.Notification) error {
  route, payload, err := r.Resolve(notifiable, n)
  if err != nil {
    return err
  }

  return r.Deliver(route, payload)
}

func (r *SmsChannel) Resolve(notifiable notification.Notifiable, n notification.Notification) (route string, payload []byte, err error) {
  route = cast.ToString(notifiable.RouteNotificationFor("sms"))
  payload, err = json.Marshal(map[string]any{"message": "your order has shipped"})

  return route, payload, err
}

func (r *SmsChannel) Deliver(route string, payload []byte) error {
  // send the SMS using only the plain data...
  return nil
}
```

Sending to an unregistered channel name returns a `NotificationChannelNotFound` error, and queuing a channel that doesn't implement `ResolvableChannel` returns a `NotificationChannelNotQueueable` error.
