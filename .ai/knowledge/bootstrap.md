# Bootstrap & Service Container

`bootstrap/app.go` is the application entry point. `ApplicationBuilder` chains `With*` calls to register everything (commands, jobs, middleware, providers, routing, etc.). Service providers register bindings via the IoC container; `Boot` runs after all providers register. `WithCallback` is the only safe place to call facades during startup.

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/foundation/application.go` — `Application` (the IoC container + Make* accessors)
- `contracts/foundation/application_builder.go` — `ApplicationBuilder` (the With* registration API)
- `contracts/foundation/service_provider.go` — `ServiceProvider`, `ServiceProviderWithRelations`, `ServiceProviderWithRunners`
- `contracts/binding/binding.go` — binding key constants (`binding.Auth`, `binding.Cache`, …) + `Relationship`

## Imports

```go
import (
    "github.com/goravel/framework/contracts/binding"
    "github.com/goravel/framework/contracts/foundation"

    "yourmodule/app/facades"
    "yourmodule/app/providers"
)
```

## Methods

### `ApplicationBuilder` (chainable; terminated by `Create()`)

| Group | Methods (signature-only) |
|---|---|
| Build | `Create() Application` |
| App-wide hooks | `WithCallback(func()) ApplicationBuilder` (called once after boot — safe place for facade-using setup), `WithConfig(func()) ApplicationBuilder`, `WithProviders(func() []ServiceProvider) ApplicationBuilder`, `WithPaths(func(configuration.Paths)) ApplicationBuilder` |
| HTTP / routing | `WithRouting(func()) ApplicationBuilder`, `WithMiddleware(func(handler configuration.Middleware)) ApplicationBuilder` |
| Console | `WithCommands(func() []console.Command) ApplicationBuilder` |
| Jobs / queue | `WithJobs(func() []queue.Job) ApplicationBuilder` |
| Events | `WithEvents(func() map[event.Event][]event.Listener) ApplicationBuilder` |
| Schedule | `WithSchedule(func() []schedule.Event) ApplicationBuilder` |
| Database | `WithMigrations(func() []schema.Migration) ApplicationBuilder`, `WithSeeders(func() []seeder.Seeder) ApplicationBuilder` |
| Validation | `WithRules(func() []validation.Rule) ApplicationBuilder`, `WithFilters(func() []validation.Filter) ApplicationBuilder` |
| gRPC | `WithGrpcServerCredentials`, `WithGrpcServerInterceptors`, `WithGrpcServerStatsHandlers`, `WithGrpcClientCredentials`, `WithGrpcClientInterceptors`, `WithGrpcClientStatsHandlers` |
| Lifecycle | `WithRunners(func() []Runner) ApplicationBuilder` (long-lived workers) |

### `Application` (IoC container — once built, used at runtime)

| Group | Methods (signature-only) |
|---|---|
| Container | `Bind(key any, callback func(app Application) (any, error))`, `Singleton(key any, callback)`, `BindWith(key any, callback func(app, params map[string]any) (any, error))`, `Instance(key, instance any)`, `Make(key any) (any, error)`, `MakeWith(key any, params map[string]any) (any, error)`, `Bindings() []any`, `Fresh(bindings ...any)` |
| Facade resolvers | `MakeAuth(ctx ...http.Context)`, `MakeCache()`, `MakeOrm()`, `MakeRoute()`, `MakeQueue()`, `MakeEvent()`, `MakeSchedule()`, `MakeSchema()`, `MakeStorage()`, `MakeMail()`, `MakeLog()`, `MakeHttp()`, `MakeHash()`, `MakeCrypt()`, `MakeValidation()`, `MakeView()`, `MakeArtisan()`, `MakeConfig()`, `MakeSession()`, `MakeProcess()`, `MakeRateLimiter()`, `MakeGate()`, `MakeGrpc()`, `MakeLang(ctx)`, `MakeDB()`, `MakeAI()`, `MakeTelemetry()`, `MakeSeeder()`, `MakeTesting()` |
| Lifecycle | `Boot()`, `Build() Application`, `Start()`, `Shutdown() error`, `Restart() error`, `Refresh()`, `Context() context.Context`, `Version() string`, `About(section string, items []AboutItem)`, `Publishes(packageName string, paths map[string]string, groups ...string)` |
| Locale | `IsLocale(ctx context.Context, locale string) bool`, `CurrentLocale(ctx) string`, `SetLocale(ctx, locale string) context.Context` |
| Paths | `BasePath`, `BootstrapPath`, `ConfigPath`, `DatabasePath`, `FacadesPath`, `LangPath`, `ModelPath`, `Path` (app dir), `PublicPath`, `ResourcePath`, `StoragePath` — all `(path ...string) string` |

### `ServiceProvider` (the contract you implement)

```go
type ServiceProvider interface {
    Register(app Application)   // bind services into the container — DO NOT call other facades here
    Boot(app Application)       // post-register setup — facades are safe here
}

// Optional: declare dependency order (recommended for any provider that depends on other bindings)
type ServiceProviderWithRelations interface {
    ServiceProvider
    Relationship() binding.Relationship   // {Bindings, Dependencies, ProvideFor}
}

// Optional: register long-lived workers
type ServiceProviderWithRunners interface {
    ServiceProvider
    Runners(app Application) []Runner
}
```

### `binding` constants (use as binding keys)

`binding.AI`, `Artisan`, `Auth`, `Cache`, `Config`, `Crypt`, `DB`, `Event`, `Gate`, `Grpc`, `Hash`, `Http`, `Lang`, `Log`, `Mail`, `Orm`, `Process`, `Queue`, `RateLimiter`, `Route`, `Schedule`, `Schema`, `Seeder`, `Session`, `Storage`, `Telemetry`, `Testing`, `Validation`, `View`.

### `binding.Relationship`

```go
type Relationship struct {
    Bindings     []string  // what this provider binds
    Dependencies []string  // what must be registered first
    ProvideFor   []string  // what other bindings this can satisfy
}
```

## Config

User-owned: `bootstrap/app.go` is itself the configuration entry point — no separate config file. Per-facade config lives under `config/` and is read at boot via `app.MakeConfig()`.

## Patterns & gotchas

- **`Register` vs `Boot`**: `Register` only binds into the container (`app.Singleton(key, factory)`). It MUST NOT call other facades, because they may not be registered yet. `Boot` runs after every provider has registered — safe to use facades here.
- **`WithCallback` is the THIRD phase**, after Register and Boot. This is where you run code that needs ALL facades fully wired (rate-limiter registration, gate definitions, custom validation rules registered against the validator, observers attached to ORM models). Boot order: **Config** → **Register** → **Boot** → **WithCallback** → **Runners**.
- **Binding keys**: use the constants from `contracts/binding`, not raw strings. `app.Singleton(binding.Auth, factory)`, NOT `app.Singleton("goravel.auth", factory)`.
- **Singleton vs Bind**: `Singleton(key, factory)` runs the factory ONCE per app lifetime; `Bind(key, factory)` runs the factory on every `Make`. For most facades, Singleton.
- **`ServiceProviderWithRelations`** lets the container compute provider order from declared dependencies. If your provider depends on `binding.Cache`, declare it — the container will register Cache's provider before yours.
- **`Make` returns `(any, error)`** — type-assert at the call site: `inst, err := app.Make(binding.Cache); cache := inst.(cache.Cache)`. For typed convenience use the `Make<Facade>()` helpers (no type assertion needed).
- **Driver registration**: external driver packages (`goravel/postgres`, `goravel/redis`, `goravel/gin`, etc.) ship their own `ServiceProvider`. Add them to `WithProviders` to wire them in.
- **Custom service providers**: live under `app/providers/` by convention. Implement `Register` + `Boot`; add to `WithProviders` in `bootstrap/app.go`.
- **`Publishes`** registers package assets that `vendor:publish` can copy into the app — for package authors only.
- **`Refresh()` re-runs facade construction** for changed bindings — useful in test setup. `Restart()` reboots the whole app.
- **Path helpers** vs hardcoded paths: always use `facades.App().BasePath("...")` etc. — they respect any `WithPaths` overrides.
- **`Runners`**: long-lived processes (queue worker, scheduler, gRPC server). The framework starts/stops them with the app lifecycle. Register via `WithRunners` or `ServiceProviderWithRunners`.
- **The `contracts/binding` package path**: it's `contracts/binding`, NOT `contracts/foundation/binding`. Common mistake — easy to write `foundation/binding` and have the import fail.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `import "github.com/goravel/framework/contracts/foundation/binding"` | `import "github.com/goravel/framework/contracts/binding"` | Binding constants live at `contracts/binding`, not nested under foundation. |
| Call `facades.X()` from `Register(app)` | Call them from `Boot(app)` or `WithCallback(...)` | Other facades may not be registered yet during Register. |
| `app.Singleton("custom-thing", factory)` | `app.Singleton(myConst, factory)` (define a `const myConst = "myapp.custom_thing"`) | Use typed/constant keys, not floating strings — easier to refactor. |
| Register validation rules / event listeners / rate limiters in `Register`/`Boot` directly | Register them inside `WithCallback` in `bootstrap/app.go` | These need facades fully booted. |
| Pass `&MyServiceProvider{}` only | Use `WithProviders(func() []ServiceProvider { return []foundation.ServiceProvider{&MyServiceProvider{}} })` | Builder takes a closure returning a slice. |
| Skip `Relationship()` on a provider that depends on Cache | Implement `ServiceProviderWithRelations` + return `binding.Relationship{Dependencies: []string{binding.Cache}}` | Without it, providers may register out of order. |
| `app.Make(binding.Cache).(cache.Cache)` (no error check) | `inst, err := app.Make(binding.Cache); if err != nil ...; cache := inst.(cache.Cache)` OR `app.MakeCache()` | Make returns `(any, error)`; the typed helpers avoid the assertion. |

## Worked example: custom provider + bootstrap wiring

```go
// app/providers/analytics_service_provider.go
package providers

import (
    "github.com/goravel/framework/contracts/binding"
    "github.com/goravel/framework/contracts/foundation"

    "yourmodule/app/contracts"
    "yourmodule/app/services"
)

type AnalyticsServiceProvider struct{}

// Register only binds — DO NOT call other facades here.
func (p *AnalyticsServiceProvider) Register(app foundation.Application) {
    app.Singleton(contracts.AnalyticsBinding, func(app foundation.Application) (any, error) {
        cfg := app.MakeConfig()
        return services.NewAnalytics(cfg.GetString("analytics.endpoint")), nil
    })
}

// Boot runs after Register — facades are safe to call.
func (p *AnalyticsServiceProvider) Boot(app foundation.Application) {
    // e.g. wire ORM observers, register CLI commands via app.Commands(...), etc.
}

// Optional — declare dependencies so the container orders providers correctly.
func (p *AnalyticsServiceProvider) Relationship() binding.Relationship {
    return binding.Relationship{
        Bindings:     []string{contracts.AnalyticsBinding},
        Dependencies: []string{binding.Config, binding.Log},
    }
}

// app/contracts/bindings.go
package contracts

const AnalyticsBinding = "myapp.analytics"

// bootstrap/app.go
package bootstrap

import (
    "github.com/goravel/framework/contracts/foundation"
    "github.com/goravel/framework/contracts/http"
    foundationapp "github.com/goravel/framework/foundation"
    "github.com/goravel/framework/contracts/binding"

    "yourmodule/app/providers"
    "yourmodule/app/facades"
    "yourmodule/routes"
)

func Boot() foundation.Application {
    return foundationapp.NewApplication().
        WithProviders(func() []foundation.ServiceProvider {
            return []foundation.ServiceProvider{
                &providers.AnalyticsServiceProvider{},
                &providers.AppServiceProvider{},
            }
        }).
        WithMiddleware(routes.RegisterMiddleware).
        WithRouting(routes.Web).
        WithCallback(func() {
            // Facades are FULLY ready here — wire rate limiters, gates, observers.
            facades.RateLimiter().For("api", func(ctx http.Context) http.Limit {
                // ... see route.md
                return nil
            })
        }).
        Create()
}
```

## Rules

- `binding` constants live at `github.com/goravel/framework/contracts/binding` — NOT `foundation/binding`.
- `Register` only binds (`app.Singleton`/`Bind`/`Instance`). Never call other facades from Register.
- `Boot` runs after all Register calls — safe to use facades. Use it for binding-side setup that needs facades.
- `WithCallback` is for cross-facade wiring (rate limiters, gates, observers, custom rules) — runs after every provider has booted.
- Use binding constants as keys, not raw strings.
- Implement `ServiceProviderWithRelations` to declare dependency order.
- For long-lived processes (queue, scheduler), implement `ServiceProviderWithRunners` or use `WithRunners` on the builder.
- Use `MakeX()` helpers (typed) over `Make(binding.X)` (returns `any`).
- All path helpers (`BasePath`, `ConfigPath`, etc.) accept variadic suffixes and respect `WithPaths` overrides.
