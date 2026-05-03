# Mail

Send transactional email via SMTP (or driver). Two patterns: builder-style (`facades.Mail().To(...).Subject(...).Send()`) for one-offs, or `Mailable` struct for reusable templates. `Queue` variant pushes the send to the queue facade.

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/mail/mail.go` — `Mail`, `Mailable`, `Content`, `Address`, `Envelope`, `Queue`
- `contracts/mail/template.go` — template helpers

## Imports

```go
import (
    "github.com/goravel/framework/contracts/mail"

    "yourmodule/app/facades"
)
```

## Methods

### `facades.Mail()` returns `mail.Mail` (chainable builder)

| Group | Methods (signature-only) |
|---|---|
| Recipients | `To(addresses []string) Mail`, `Cc(addresses []string) Mail`, `Bcc(addresses []string) Mail` |
| Sender | `From(address Address) Mail` |
| Body/subject | `Subject(subject string) Mail`, `Content(content Content) Mail` |
| Headers/attachments | `Headers(headers map[string]string) Mail`, `Attach(files []string) Mail` (file paths on storage) |
| Send | `Send(mailable ...Mailable) error`, `Queue(mailable ...Mailable) error` |

### Value types

```go
type Address struct {
    Address string
    Name    string
}

type Content struct {
    Html string                  // HTML body (use OR with Text)
    Text string                  // plain-text body (recommended for deliverability)
    View string                  // template name (alternative to Html/Text)
    With map[string]any          // template data
}

type Envelope struct {
    Bcc     []string
    Cc      []string
    From    Address
    Subject string
    To      []string
}

type Queue struct {
    Connection string
    Queue      string
}
```

### `mail.Mailable` (reusable template contract)

```go
type Mailable interface {
    Attachments() []string
    Content() *Content
    Envelope() *Envelope
    Headers() map[string]string
    Queue() *Queue                  // nil = send sync; non-nil = push to queue
}
```

## Config

User-owned: `config/mail.go`. Read directly for current SMTP settings.

Keys this facade reads:

- `mail.host` (string, env `MAIL_HOST`) — SMTP host
- `mail.port` (int, env `MAIL_PORT`) — SMTP port
- `mail.username`, `mail.password` (strings, env-backed) — SMTP auth
- `mail.encryption` (string) — `"tls"`, `"ssl"`, `""`
- `mail.from.address`, `mail.from.name` — default From
- `mail.markdown.theme` (string) — for markdown templates

Greenfield default: `config/mail.go` from goravel-scaffold URL declared in `AGENTS.md`.

## Patterns & gotchas

- **Builder vs Mailable**: builder is fine for one-offs (`facades.Mail().To(...).Subject(...).Content(...).Send()`). For reusable templates (welcome email, receipt), implement `Mailable` and pass to `Send(&MyMail{})` — keeps subject/template/data in one struct.
- **`To`/`Cc`/`Bcc` take `[]string`**: pass `[]string{"a@x.com", "b@x.com"}` even for a single recipient.
- **`Content` shape**: pick ONE of `Html`, `Text`, or `View`. `View` references a template file under `resources/views/` and renders with `With` data. Set `Text` alongside `Html` for plain-text fallback (deliverability).
- **`Queue(mailable...)` pushes the send to the queue facade** — non-blocking. The mailable's `Queue() *Queue` controls connection/queue; nil falls back to default queue.
- **Builder `Queue(mailable)` vs Mailable's `Queue() *Queue`**: the builder method is a verb (push to queue); the Mailable method is a getter (which queue to use).
- **`Attach([]string)` takes paths on storage** (not raw bytes). Resolve via `facades.Storage().Path("...")` first if needed. For dynamic content, write to a temp file then attach.
- **Headers `map[string]string`**: useful for X-Mailer, List-Unsubscribe, etc. Don't set Subject/From/To here — use the dedicated builder methods.
- **From override per-mail**: builder's `.From(mail.Address{...})` overrides `config/mail.go` default for that send only.
- **Mailable with nil `*Envelope`**: builder methods on `facades.Mail()` still apply. Don't double-set To/From/Subject in both Mailable.Envelope and builder; pick one source of truth.
- **Sync `Send` blocks** until SMTP responds. Use `Queue` in request handlers to avoid latency on the response.
- **Markdown templates**: `resources/views/mail/<name>.md` — render with `Content{View: "mail.welcome", With: map[string]any{...}}`.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `facades.Mail().To("a@x.com")` | `facades.Mail().To([]string{"a@x.com"})` | Takes `[]string`, not single string. |
| `facades.Mail().Attach(rawBytes)` | Write to file, then `Attach([]string{path})` | Attach takes paths, not bytes. |
| `Content{Html: "<b>hi</b>"}` only | `Content{Html: "<b>hi</b>", Text: "hi"}` | Provide text fallback for deliverability/spam scoring. |
| Set Subject in both `Envelope` and builder `.Subject()` | Pick one source of truth | Last one wins; prefer Mailable's Envelope when using Mailables. |
| Send in request handler with sync `Send` | `Queue(&mailable)` to push to queue | Keeps response latency low. |
| Mailable not implementing all 5 methods | Implement all 5 (use no-op returns where unneeded) | Interface requires complete impl. |

## Worked example: builder one-off + Mailable template

```go
// One-off send (e.g. password reset)
package services

import (
    "github.com/goravel/framework/contracts/mail"

    "yourmodule/app/facades"
)

func SendPasswordReset(toEmail, resetUrl string) error {
    return facades.Mail().
        To([]string{toEmail}).
        Subject("Reset your password").
        Content(mail.Content{
            View: "mail.password_reset",
            With: map[string]any{"url": resetUrl},
        }).
        Queue()  // push to queue, non-blocking
}

// Reusable Mailable
package mailables

import "github.com/goravel/framework/contracts/mail"

type WelcomeMail struct {
    UserName string
    LoginUrl string
}

func (m *WelcomeMail) Envelope() *mail.Envelope {
    return &mail.Envelope{
        Subject: "Welcome to Goravel, " + m.UserName,
        To:      []string{m.UserName + "@example.com"},  // typically passed in / looked up
    }
}

func (m *WelcomeMail) Content() *mail.Content {
    return &mail.Content{
        View: "mail.welcome",
        With: map[string]any{"name": m.UserName, "url": m.LoginUrl},
    }
}

func (m *WelcomeMail) Attachments() []string         { return nil }
func (m *WelcomeMail) Headers() map[string]string    { return nil }
func (m *WelcomeMail) Queue() *mail.Queue {
    return &mail.Queue{Queue: "emails"}  // route to "emails" queue; non-nil = queued
}

// Use the Mailable
func SendWelcome(userName, loginUrl string) error {
    return facades.Mail().Send(&mailables.WelcomeMail{
        UserName: userName,
        LoginUrl: loginUrl,
    })
    // (Send still respects the Mailable's Queue() — if non-nil, it queues.)
}
```

## Rules

- `To`/`Cc`/`Bcc` take `[]string`.
- `Content` body: pick one of `Html`, `Text`, `View`. Provide `Text` alongside `Html` for deliverability.
- `Attach([]string)` takes file paths on storage, not bytes.
- For non-blocking sends in request handlers, use `Queue()` (or set `Queue() *Queue` non-nil on the Mailable).
- Mailable interface requires all 5 methods (`Attachments`, `Content`, `Envelope`, `Headers`, `Queue`) — return nil from the ones you don't use.
- Templates live under `resources/views/mail/<name>.tmpl` (or `.md` for markdown); reference via `Content.View`.
- Don't double-set Subject/From/To in both Envelope and builder — pick one source.
