# Goravel Agent Reference

> **Start here**: for any task that touches a Goravel facade, the matching file in `.ai/knowledge/` is the fastest path to the right answer — pre-distilled API tables, gotchas, and worked examples. The Knowledge Files table at the bottom maps each task to its file. **Read the relevant knowledge file before starting.**
>
> Source is always authoritative. If a knowledge file looks stale, contradicts what you observe, or is missing the API surface you need, fall back to the framework's `contracts/**/*.go` (or its replace-target / module-cache equivalent). The contract Go files are the ground truth — knowledge files are an optimisation over them.
>
> When source and knowledge disagree, source wins. Note the discrepancy in your output so the knowledge file can be corrected.

Go-first framework. Not Laravel. Do not port PHP patterns directly.

---

## Framework version

This documentation matches Goravel framework branch **`master`**.

Knowledge files reference contracts by **relative path** (e.g. `contracts/auth/auth.go`). Resolve them against:

- Framework source: `https://raw.githubusercontent.com/goravel/framework/refs/heads/master/`
- Goravel scaffold (for greenfield config defaults): `https://raw.githubusercontent.com/goravel/goravel/refs/heads/master/`

Each docs branch has its own `AGENTS.md` with the matching version. The `v1.17.x` branch substitutes `master` → `v1.17.x` in this section; knowledge files stay version-agnostic so this single declaration controls all URL pinning. Branch naming convention across `goravel/framework`, `goravel/goravel`, and `goravel/docs` is `vMAJOR.MINOR.x`.

---

## Setup

Knowledge is installed and updated via the framework CLI:

```bash
./artisan agents:install            # install all knowledge files
./artisan agents:install --force    # overwrite without prompting
./artisan agents:update             # sync to latest, preserving local edits via .ai/.version checksums
./artisan agents:update --force     # overwrite even on local edits
```

Files land in `.ai/knowledge/`. Drift is tracked via SHA256 in `.ai/.version` so updates do not silently overwrite your customisations.

---

## Facade import

```go
// WRONG: import "github.com/goravel/framework/facades" (only used by framework internals)
// RIGHT: import path matches your go.mod module name
import "yourmodule/app/facades"
```

Your installed facades are in `app/facades/`. Check which ones exist before using them. Not all facades are installed in every project.

---

## Wrong → Right patterns (cross-facade)

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

## Available facades

```
App  Artisan  Auth(ctx)  Cache  Config  Crypt  DB  Event  Gate  Grpc
Hash  Http  Lang(ctx)  Log  Mail  Orm  Process  Queue  RateLimiter
Route  Schedule  Schema  Seeder  Session  Storage  Validation  View
```

`Auth(ctx)` and `Lang(ctx)` take `http.Context`. All others: `facades.Name()`.

`http.Context` embeds `context.Context`, so any function taking `context.Context` accepts `ctx` directly — no need to call `ctx.Context()`. Use `ctx.Context()` only when you need the underlying request-scoped context explicitly (e.g. handing to a long-running goroutine that should outlive the response builder but still observe request cancellation).

---

## Bootstrap entry point

The application entry is `bootstrap/app.go`. See `bootstrap.md` knowledge file, or fetch the contract directly: `contracts/foundation/application_builder.go` (resolve via the framework source URL above).

Boot order: **Config** → **Register providers** → **Boot providers** → **WithCallback** → **Runners**

`WithCallback` is the only safe place to call facades during startup (gates, observers, rate limiters).

---

## Knowledge file structure

Every file follows this shape. Load only what your sub-task needs:

| Section | Contains | Load when |
|---|---|---|
| `## Authoritative contracts` | Relative URL paths to contract Go files | Need exact type/interface — fetch via the source URL above |
| `## Imports` | Canonical import block | Writing imports |
| `## Methods` | Signature-only method/function table | Looking up an API surface |
| `## Config` (when present) | User-owned config files + keys this facade reads | Configuring the facade |
| `## Patterns & gotchas` | Edge-case rules the contract doesn't show | Writing implementation |
| `## Wrong → Right` (when present) | Footguns specific to this facade | Debugging or reviewing code |
| `## Worked example` | One complete minimal example | Starting from scratch |
| `## Rules` | Hard constraints | Final review |

Knowledge files do NOT duplicate the full type definitions in the contracts. Fetch the contract URL when you need exact signatures or method bodies.

---

## Knowledge files

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
