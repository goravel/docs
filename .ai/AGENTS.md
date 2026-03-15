# Goravel v1.17 — Agent Reference

<!-- BREAKING v1.17: see Breaking Changes section below -->

## Hard Rules (break code if violated)

1. Import facades from `{module}/app/facades` where `{module}` is the Go module name from `go.mod`. Never use `github.com/goravel/framework/facades` — it does not exist.
2. Never hardcode directory paths (`app/`, `config/`, `routes/`, etc.) as fixed. All paths are configurable via `WithPaths` in `bootstrap/app.go`.
3. Every controller/route handler must have signature `func(ctx http.Context) http.Response`. Missing the return type is a compile error.
4. Do not call `facades.Grpc().Client()` — it is deprecated. Use `facades.Grpc().Connect("name")`.
5. `GlobalScopes()` on a model must return `map[string]func(orm.Query) orm.Query`, NOT `[]func(...)`.
6. `Sum(column string, dest any) error` — Sum no longer returns `(int64, error)`.
7. `facades.Validation().Make()` requires `ctx` as first argument: `Make(ctx, input, rules)`.
8. Custom Rule `Passes(ctx context.Context, data Data, val any, opts ...any) bool` and `Message(ctx context.Context) string`.
9. Custom Filter `Handle(ctx context.Context) any`.
10. Custom log driver `Handle(channel string) (Handler, error)` — NOT `(Hook, error)`. Use `log.HookToHandler(hook)` adapter for old hooks.
11. `grpc.clients` config key renamed to `grpc.servers`.
12. `Http.Request.Bind` is removed — use `response.Bind(&dest)` on the response object.
13. Machinery queue driver is removed. Migrate to `redis`, `database`, or `sync`.
14. Golang >= 1.24 required for v1.17.
15. Register new service providers `&process.ServiceProvider{}` and `&view.ServiceProvider{}`.
16. Middleware is a function returning `http.Middleware`, not a struct.
17. Service providers: only bind things in `Register`. Never register routes/events in `Register` — use `Boot` or `WithCallback`.
18. `Find(&model, id)` returns nil error even when record is not found. Use `FindOrFail` to error on missing.
19. Struct updates skip zero-value fields. Use `map[string]any` to set zero values.
20. `facades.Auth(ctx).User()` / `ID()` requires `Parse(token)` to be called first.

---

## Laravel → Goravel Cheatsheet

| Laravel | Goravel |
|---------|---------|
| `Route::get('/', [C::class, 'm'])` | `facades.Route().Get("/", controller.Method)` |
| `Route::group(['prefix'=>'api'], fn)` | `facades.Route().Prefix("api").Group(func(r route.Router){...})` |
| `Route::middleware(['auth'])` | `facades.Route().Middleware(middleware.Auth()).Get(...)` |
| `$request->input('name')` | `ctx.Request().Input("name")` |
| `$request->validate([...])` | `ctx.Request().Validate(map[string]string{...})` |
| `return response()->json([...])` | `return ctx.Response().Json(http.StatusOK, http.Json{...})` |
| `Auth::login($user)` | `facades.Auth(ctx).Login(&user)` |
| `Auth::user()` | `facades.Auth(ctx).User(&user)` |
| `Hash::make('password')` | `facades.Hash().Make(password)` |
| `Hash::check('plain', $hash)` | `facades.Hash().Check("plain", hash)` |
| `Crypt::encryptString($v)` | `facades.Crypt().EncryptString(v)` |
| `Gate::define('action', fn)` | `facades.Gate().Define("action", fn)` |
| `Gate::allows('action', $args)` | `facades.Gate().Allows("action", map[string]any{...})` |
| `User::find(1)` | `facades.Orm().Query().Find(&user, 1)` |
| `User::findOrFail(1)` | `facades.Orm().Query().FindOrFail(&user, 1)` |
| `User::where('name','tom')->first()` | `facades.Orm().Query().Where("name","tom").First(&user)` |
| `User::create([...])` | `facades.Orm().Query().Create(&user)` |
| `$user->save()` | `facades.Orm().Query().Save(&user)` |
| `$user->delete()` | `facades.Orm().Query().Delete(&user)` |
| `User::withTrashed()->find(1)` | `facades.Orm().Query().WithTrashed().Find(&user,1)` |
| `User::with('posts')->get()` | `facades.Orm().Query().With("Posts").Get(&users)` |
| `dispatch(new Job($args))` | `facades.Queue().Job(&jobs.MyJob{}, args).Dispatch()` |
| `event(new Foo($args))` | `facades.Event().Job(&events.Foo{}, args).Dispatch()` |
| `Schema::create('users', fn)` | `facades.Schema().Create("users", func(t schema.Blueprint){...})` |
| `Cache::put('k', $v, 60)` | `facades.Cache().Put("k", v, 60*time.Second)` |
| `Cache::remember('k', 60, fn)` | `facades.Cache().Remember("k", 60*time.Second, fn)` |
| `Storage::put('f', $c)` | `facades.Storage().Put("f", contents)` |
| `Mail::to([])->send(new M())` | `facades.Mail().To([...]).Content(...).Send()` |
| `Http::get(url)` | `facades.Http().Get(url)` |
| `Log::info('msg')` | `facades.Log().Info("msg")` |
| `__('key')` | `facades.Lang(ctx).Get("key")` |
| `php artisan make:model User` | `./artisan make:model User` |
| `php artisan migrate` | `./artisan migrate` |

---

## Bootstrap Lifecycle — `bootstrap/app.go`

```go
// bootstrap/app.go
package bootstrap

import (
    "github.com/goravel/framework/foundation"
    contractsfoundation "github.com/goravel/framework/contracts/foundation"
    // ... other imports
)

func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithProviders(Providers).          // bootstrap/providers.go
        WithConfig(config.Boot).           // registers config files
        WithRouting(func() {               // registers HTTP/gRPC routes
            routes.Web()
            routes.Grpc()
        }).
        WithMiddleware(func(handler configuration.Middleware) {
            handler.Append(middleware.Custom())
        }).
        WithCommands(Commands).            // bootstrap/commands.go
        WithEvents(func() map[event.Event][]event.Listener {
            return map[event.Event][]event.Listener{
                events.NewOrderShipped(): {listeners.NewSendShipmentNotification()},
            }
        }).
        WithJobs(Jobs).                    // bootstrap/jobs.go
        WithMigrations(Migrations).        // bootstrap/migrations.go
        WithSeeders(Seeders).              // bootstrap/seeders.go
        WithSchedule(func() []schedule.Event {
            return []schedule.Event{
                facades.Schedule().Call(func() { ... }).Daily(),
            }
        }).
        WithRules(Rules).                  // bootstrap/rules.go
        WithFilters(Filters).              // bootstrap/filters.go
        WithRunners(func() []foundation.Runner {
            return []foundation.Runner{NewCustomRunner()}
        }).
        WithPaths(func(paths configuration.Paths) {
            paths.App("src")               // optional: customize directories
        }).
        WithCallback(func() {
            // runs after all providers Boot(); all facades available here
            facades.Gate().Define(...)
            facades.RateLimiter().For(...)
            facades.Orm().Observe(...)
        }).
        Create()
}
```

**Boot order inside `Create()`:**
1. Load configuration (`WithConfig`)
2. Register all service providers (calls `Register` on each)
3. Boot all service providers (calls `Boot` on each)
4. Run `WithCallback`
5. Runners start (HTTP server, Queue worker, Schedule, gRPC, etc.)

---

## Facade Import Pattern

Facades live in `app/facades/` of your project. Import path depends on `go.mod` module name:

```go
// go.mod:  module github.com/mycompany/myapp

import "github.com/mycompany/myapp/app/facades"

facades.Route().Get("/", handler)
facades.Orm().Query().Find(&user, 1)
facades.Auth(ctx).Login(&user)
```

Available facades: `App`, `Artisan`, `Auth`, `Cache`, `Config`, `Crypt`, `DB`, `Event`, `Gate`, `Grpc`, `Hash`, `Http`, `Lang`, `Log`, `Mail`, `Orm`, `Process`, `Queue`, `RateLimiter`, `Route`, `Schedule`, `Schema`, `Seeder`, `Session`, `Storage`, `Validation`, `View`.

---

## Directory Paths Are Configurable

```go
WithPaths(func(paths configuration.Paths) {
    paths.App("src")
    paths.Config("configuration")
    paths.Database("db")
    paths.Routes("api/routes")
    paths.Storage("data")
    paths.Resources("views-root")
})
```

Never assume `app/`, `config/`, etc. are fixed.

---

## Artisan Commands

```shell
# Code generation
./artisan make:controller UserController
./artisan make:controller --resource PhotoController
./artisan make:controller user/UserController
./artisan make:model User
./artisan make:model --table=users User
./artisan make:migration create_users_table
./artisan make:migration create_users_table -m User   # v1.17: from model
./artisan make:seeder UserSeeder
./artisan make:factory UserFactory
./artisan make:command SendEmails
./artisan make:middleware Auth
./artisan make:middleware user/Auth
./artisan make:job ProcessPodcast
./artisan make:event OrderShipped
./artisan make:listener SendShipmentNotification
./artisan make:observer UserObserver
./artisan make:policy PostPolicy
./artisan make:request StorePostRequest
./artisan make:rule Uppercase
./artisan make:filter ToInt
./artisan make:mail OrderShipped
./artisan make:provider YourServiceProvider   # v1.17 new
./artisan make:view welcome                   # v1.17 new

# Database
./artisan migrate
./artisan migrate:status
./artisan migrate:rollback                    # v1.17: rolls back all of last batch
./artisan migrate:rollback --batch=2
./artisan migrate:rollback --step=5
./artisan migrate:reset
./artisan migrate:refresh
./artisan migrate:fresh
./artisan migrate:fresh --seed
./artisan db:seed
./artisan db:seed --seeder=UserSeeder
./artisan db:show
./artisan db:table users

# Application
./artisan key:generate
./artisan jwt:secret
./artisan env:encrypt
./artisan env:decrypt
./artisan about
./artisan list
./artisan route:list
./artisan schedule:run
./artisan schedule:list
./artisan queue:failed
./artisan queue:retry {uuid}
./artisan queue:retry all

# Build (v1.17: new flags)
./artisan build
./artisan build --arch=amd64
./artisan build --static

# Packages (Goravel Lite)
./artisan package:install Route
./artisan package:install --all
./artisan package:uninstall Route
```

---

## v1.17 Breaking Changes Summary

| Area | Change |
|------|--------|
| Queue | Machinery driver completely removed |
| gRPC config | `grpc.clients` → `grpc.servers`; `Client()` deprecated, use `Connect()` |
| Log driver | `Handle(channel) (Handler, error)` replaces `(Hook, error)`; adapter: `log.HookToHandler(hook)` |
| migrate:rollback | Rolls back entire last batch by default (was 1 migration); use `--step` for old behavior |
| Http client | `Request.Bind()` removed; use `response.Bind(&dest)` |
| Validation | `Make(ctx, input, rules)` — ctx now required; Rule/Filter interfaces have `ctx context.Context` |
| ORM GlobalScopes | Return type changed: `map[string]func(orm.Query) orm.Query` (was `[]func(...)`) |
| ORM Sum | Signature: `Sum(column string, dest any) error` (was `(int64, error)`) |
| Package setup | `match.Providers()` → `match.ProvidersInConfig()` for old code structure |
| Golang | Minimum version: 1.24 (was 1.23) |

---

## Prompt File Index

- [prompt/bootstrap.md](prompt/bootstrap.md) — Service container, providers, runners, lifecycle
- [prompt/route.md](prompt/route.md) — Routing, rate limiting, CORS, static files
- [prompt/middleware.md](prompt/middleware.md) — Middleware definition, global/route, abort, CSRF
- [prompt/controller.md](prompt/controller.md) — Controllers, request input, responses
- [prompt/view.md](prompt/view.md) — View templates, CSRF, facades.View
- [prompt/session.md](prompt/session.md) — Session operations
- [prompt/validation.md](prompt/validation.md) — Validation rules, custom rules/filters
- [prompt/log.md](prompt/log.md) — Logging, channels, custom drivers
- [prompt/grpc.md](prompt/grpc.md) — gRPC server/client, interceptors
- [prompt/orm.md](prompt/orm.md) — ORM models, queries, relations, migrations, seeders, factories
- [prompt/auth.md](prompt/auth.md) — Auth (JWT/session), gates, hashing, encryption
- [prompt/artisan.md](prompt/artisan.md) — Console commands, scheduling
- [prompt/cache.md](prompt/cache.md) — Cache operations, atomic locks
- [prompt/event.md](prompt/event.md) — Events and listeners
- [prompt/queue.md](prompt/queue.md) — Queue jobs, dispatching, chaining
- [prompt/storage.md](prompt/storage.md) — Filesystem/storage operations
- [prompt/mail.md](prompt/mail.md) — Mail sending, templates, Mailable
- [prompt/http.md](prompt/http.md) — HTTP client facade
- [prompt/process.md](prompt/process.md) — Process facade (new in v1.17)
- [prompt/localization.md](prompt/localization.md) — Lang/translation
- [prompt/migration.md](prompt/migration.md) — Migration commands, auto-generation from model, all column types/modifiers/indexes
- [prompt/testing.md](prompt/testing.md) — HTTP tests, mocks, Docker testing, all assertions
- [prompt/helpers.md](prompt/helpers.md) — Path/carbon/debug/maps/convert/collect helpers, fluent str, color
- [prompt/best-practices.md](prompt/best-practices.md) — Naming conventions, ORM patterns, security, middleware, jobs, cache, performance
