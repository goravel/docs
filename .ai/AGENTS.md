# Goravel Agent Reference

Go-first framework. Not Laravel. Do not port PHP patterns directly.

---

## Setup

Knowledge files are installed per-facade via the framework CLI:

```bash
# Install knowledge for specific facades you are using
./artisan agents:install --facade=Orm,Route,Auth

# Install all knowledge files
./artisan agents:install --all

# Update already-installed files to latest
./artisan agents:install --update
```

Files are downloaded from the docs repo and placed in `.ai/knowledge/`.
The manifest at `.ai/agents.json` maps facade names to file URLs.

---

## Facade Import

```go
// WRONG: import "github.com/goravel/framework/facades" (does not exist)
// RIGHT: import path from go.mod module name
import "yourmodule/app/facades"
```

Your installed facades are in `app/facades/`. Check which ones exist before using them.
Not all facades are installed in every project.

---

## Wrong vs Right Patterns

| Pattern               | Wrong                         | Right                                                               |
| --------------------- | ----------------------------- | ------------------------------------------------------------------- |
| Handler return        | `func(ctx http.Context)`      | `func(ctx http.Context) http.Response`                              |
| Find missing record   | check `err != nil`            | `FindOrFail` -- `Find` returns nil on miss                          |
| Struct zero update    | `Update(User{Age: 0})`        | `Update(map[string]any{"age": 0})`                                  |
| GlobalScopes return   | `[]func(Query) Query`         | `map[string]func(Query) Query`                                      |
| Sum/Avg/Max/Min       | `sum, err := .Sum("col")`     | `err := .Sum("col", &dest)`                                         |
| Validation Make       | `Make(input, rules)`          | `Make(ctx, input, rules)`                                           |
| Custom Rule Passes    | `Passes(data, val)`           | `Passes(ctx context.Context, data Data, val any, opts ...any) bool` |
| Custom Rule Message   | `Message() string`            | `Message(ctx context.Context) string`                               |
| Custom Filter Handle  | `Handle() any`                | `Handle(ctx context.Context) any`                                   |
| Log driver Handle     | `Handle(ch) (Hook, error)`    | `Handle(ch string) (Handler, error)`                                |
| Log With              | `With("key", val)`            | `With(map[string]any{"key": val})`                                  |
| Log Request           | `Request(*http.Request)`      | `Request(http.ContextRequest)`                                      |
| Auth User/ID          | call any time                 | call `Parse(token)` first on same ctx                               |
| gRPC client           | `Grpc().Client()`             | `Grpc().Connect("name")`                                            |
| Http client Bind      | `request.Bind(&dest)`         | `response.Bind(&dest)`                                              |
| Http client body      | `Post(uri, string)`           | `Post(uri, io.Reader)`                                              |
| Middleware type       | struct with Handle            | `func() http.Middleware` returning closure                          |
| Middleware abort      | bare `return`                 | `.Abort(); return`                                                  |
| Session chain         | methods return void           | all mutating methods return `Session`                               |
| Session Regenerate    | returns `bool`                | returns `error`                                                     |
| Cache Increment       | returns `(int, error)`        | returns `(int64, error)`                                            |
| Validation Errors.Get | returns `[]string`            | returns `map[string]string`                                         |
| Validation Errors.All | returns `map[string][]string` | returns `map[string]map[string]string`                              |
| UserProvider typo     | `RetrieveByID`                | `RetriveByID` (matches contract exactly)                            |
| Queue Jobs alias      | `Jobs{}`                      | `ChainJob{}` (Jobs is deprecated)                                   |
| Queue Machinery       | use Machinery driver          | removed; use `sync`/`database`/`redis`                              |
| ORM Delete args       | `Delete(value, conds...)`     | `Delete(value ...any)`                                              |
| ORM Update return     | `error`                       | `(*db.Result, error)`                                               |

---

## Available Facades

```
App  Artisan  Auth(ctx)  Cache  Config  Crypt  DB  Event  Gate  Grpc
Hash  Http  Lang(ctx)  Log  Mail  Orm  Process  Queue  RateLimiter
Route  Schedule  Schema  Seeder  Session  Storage  Validation  View
```

`Auth(ctx)` and `Lang(ctx)` take `http.Context`. All others: `facades.Name()`.

For the latest interface of any facade, the authoritative source is the framework contracts:
`https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/`

---

## Bootstrap Entry Point

The application entry is `bootstrap/app.go`. For the full `ApplicationBuilder` interface:
`https://raw.githubusercontent.com/goravel/framework/refs/heads/master/contracts/foundation/application_builder.go`

Boot order: **Config** -> **Register providers** -> **Boot providers** -> **WithCallback** -> **Runners**

`WithCallback` is the only safe place to call facades during startup (gates, observers, rate limiters).

---

## Section-Based Loading

Every knowledge file has this structure. Load only what the sub-task requires.

| Section                     | Contains                                    | Load when                                                |
| --------------------------- | ------------------------------------------- | -------------------------------------------------------- |
| `## Core Imports`           | Exact import paths                          | Writing import blocks                                    |
| `## Contracts`              | Raw GitHub URLs to framework contract files | Need exact type/interface definition; fetch the URL live |
| `## Available Methods`      | Concise method list with return types       | Looking up a method name or return type                  |
| `## Implementation Example` | One complete working code block             | Starting an implementation from scratch                  |
| `## Rules`                  | Constraints, gotchas, deprecated notices    | Debugging; something is not working                      |

**Interface and struct definitions are not duplicated in these files.**
Fetch the contract URL(s) from `## Contracts` when you need exact signatures.
The framework contracts are always current and authoritative.

- Skip `## Implementation Example` when you only need a method signature.
- Skip `## Core Imports` when imports are already established in the file being edited.
- Read `## Rules` last -- only needed when the straightforward approach is failing.

---

## Knowledge Files

Install and load the relevant file for your task. Check `.ai/agents.json` for the full facade-to-file map.

| When task involves...                                         | File                  |
| ------------------------------------------------------------- | --------------------- |
| Service container, providers, `Bind`/`Singleton`, runners     | `bootstrap.md`        |
| Defining routes, middleware, rate limiting                    | `route.md`            |
| Request input, HTTP responses, cookies, streams               | `request-response.md` |
| Database queries, models, relations, transactions, ORM events | `orm.md`              |
| Database table creation, column types, indexes                | `migration.md`        |
| Caching, atomic locks                                         | `cache.md`            |
| JWT auth, login/logout, guards, gates, policies               | `auth.md`             |
| Background jobs, dispatch, chaining                           | `queue.md`            |
| Events, listeners                                             | `event.md`            |
| Sending email, Mailable structs                               | `mail.md`             |
| File upload, disk read/write, cloud storage                   | `storage.md`          |
| Log entries, channels, custom drivers                         | `log.md`              |
| Input validation, form requests, custom rules                 | `validation.md`       |
| Artisan commands, arguments, flags, prompts                   | `artisan.md`          |
| Scheduled tasks, cron                                         | `schedule.md`         |
| HTTP requests to external APIs, test faking                   | `http-client.md`      |
| Password hashing, string encryption                           | `hash-crypt.md`       |
| Session read/write, flash data                                | `session.md`          |
| gRPC server/client, interceptors                              | `grpc.md`             |
| External shell commands, pipelines, pools                     | `process.md`          |
| Translations, pluralization, locale                           | `localization.md`     |
| View templates, CSRF                                          | `view.md`             |
| HTTP tests, mock facades, Docker DB                           | `testing.md`          |
| `str.Of(...)` fluent string methods                           | `str.md`              |
| Date/time, `carbon.Parse`, arithmetic                         | `carbon.md`           |
| Path helpers, maps, slices, debug, color                      | `helpers.md`          |
