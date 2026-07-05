# Konfiguratsiya

[[toc]]

## Kirish

Goravel freymvorkining barcha konfiguratsiya fayllari `config` papkasida saqlanadi. Siz aniq ko'rsatmalarni ko'rib chiqishingiz va loyiha ehtiyojlariga mos ravishda ularni moslashuvchan sozlashingiz mumkin.

## Muhit konfiguratsiyasi

Ilovalarni turli muhitlarda ishga tushirish odatda turli konfiguratsiyalarni talab qiladi. Misol uchun, siz mahalliy ravishda Debug rejimini yoqishni xohlashingiz mumkin, lekin ishlab chiqarish muhitida bunga ehtiyoj yo'q.

Shuning uchun, freymvork ildiz papkasida `.env.example` faylini taqdim etadi. Siz ishlab chiqishni boshlashdan oldin ushbu faylni nusxalashingiz, uni `.env` deb nomini o'zgartirishingiz va `.env` faylidagi konfiguratsiya bandlarini loyiha ehtiyojlariga mos ravishda o'zgartirishingiz kerak.

Diqqat qiling, `.env` fayli versiyalarni nazorat qilishga qo'shilmasligi kerak, chunki bir nechta odamlar hamkorlik qilganda, turli dasturchilar turli konfiguratsiyalardan foydalanishlari mumkin va turli joylashtirish muhitlari konfiguratsiyalari har xil bo'ladi.

Bundan tashqari, agar tashqi shaxs sizning kod omboringizga kirish huquqini olgan bo'lsa, sezuvchi konfiguratsiyani oshkor qilish xavfi mavjud bo'ladi. Agar siz yangi konfiguratsiya bandini qo'shmoqchi bo'lsangiz, uni `.env.example` fayliga qo'shishingiz mumkin, shunda barcha dasturchilarning konfiguratsiyasi sinxronlanadi.

### Konfiguratsiyani ro'yxatdan o'tkazish

Barcha konfiguratsiya fayllari `bootstrap/app.go` faylidagi `WithConfig` funksiyasi orqali ro'yxatdan o'tkaziladi. Konfiguratsiya faylidagi `init` funksiyasi ekanligini hisobga olgan holda, siz har bir konfiguratsiya faylini birma-bir ro'yxatdan o'tkazishingiz shart emas. Shunchaki `WithConfig` funksiyasini quyidagicha chaqiring:

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithConfig(config.Boot).
		Create()
}
```

## Muhit konfiguratsiyasini olish

`.env` faylidagi konfiguratsiya bandlarini olish uchun quyidagi usuldan foydalaning:

```go
// Birinchi parametr konfiguratsiya kaliti, ikkinchi parametr standart qiymat
facades.Config().Env("APP_NAME", "goravel")
```

## Konfiguratsiya qiymatlariga kirish

Siz ilovaning istalgan joyidan `config` papkasidagi konfiguratsiya qiymatlariga kirish uchun global `facades.Config()` funksiyasidan osongina foydalanishingiz mumkin. Konfiguratsiya qiymatiga kirish "." sintaksisidan foydalanishi mumkin. Shuningdek, siz standart qiymatni belgilashingiz mumkin, agar konfiguratsiya opsiyasi mavjud bo'lmasa, standart qiymat qaytariladi:

```go
// Tasdiq orqali konfiguratsiyani olish
facades.Config().Get("app.name", "goravel")

// String turidagi konfiguratsiyani olish
facades.Config().GetString("app.name", "goravel")

// Int turidagi konfiguratsiyani olish
facades.Config().GetInt("app.int", 1)

// Bool turidagi konfiguratsiyani olish
facades.Config().GetBool("app.debug", true)
```

## Konfiguratsiyani sozlash

```go
facades.Config().Add("path", "value1")
facades.Config().Add("path.with.dot.case1", "value1")
facades.Config().Add("path.with.dot", map[string]any{"case3": "value3"})
```

## Loyiha ma'lumotlarini olish

Siz freymvork versiyasi, konfiguratsiyasi va boshqalarni ko'rish uchun `artisan about` buyrug'idan foydalanishingiz mumkin.

```bash
./artisan about
```

### Maintenance Mode

If you installed the Route facade, you can use the `down` command to put your application into maintenance mode. By default, Goravel uses the `file` maintenance driver and stores maintenance metadata at the `framework/maintenance.json` storage path:

```shell
./artisan down
```

You may provide a custom reason and HTTP status code for the maintenance response:

```shell
./artisan down --reason="Upgrading database" --status=503
```

The `down` command also supports redirecting users to a path or rendering a view while the application is in maintenance mode:

```shell
./artisan down --redirect=/maintenance
./artisan down --render=errors/503
```

When using `--render`, the view must already exist. If `--redirect` or `--render` is provided, the `--reason` response body is not used.

You may allow temporary access to the application by setting a secret. Users can bypass maintenance mode by visiting the application with the matching `secret` query parameter:

```shell
./artisan down --secret=let-me-in
```

```text
https://example.com?secret=let-me-in
```

You can also let Goravel generate a random secret for you:

```shell
./artisan down --with-secret
```

The maintenance driver and cache store are configured in `config/app.go`. The default configuration reads from the `APP_MAINTENANCE_DRIVER` and `APP_MAINTENANCE_STORE` environment variables:

```go
"maintenance": map[string]any{
    "driver": config.Env("APP_MAINTENANCE_DRIVER", "file"),
    "store":  config.Env("APP_MAINTENANCE_STORE", ""),
},
```

If your application runs on multiple servers, you may use the `cache` maintenance driver so all servers share the same maintenance state. Configure the driver and, optionally, the cache store name in your `.env` file:

```ini
APP_MAINTENANCE_DRIVER=cache
APP_MAINTENANCE_STORE=redis
```

If `APP_MAINTENANCE_STORE` is not set, Goravel uses the default cache store. Running `down` or `up` on one server updates the maintenance state for every server using the same cache store.

To bring the application out of maintenance mode, run the `up` command:

```shell
./artisan up
```

### Disabled Runners

When the application starts via `app.Start()`, Goravel automatically runs the auto-run [runners](../architecture-concepts/service-providers.md#runners) registered by service providers, such as the HTTP server, gRPC server, queue worker, scheduler, and telemetry. You can selectively skip specific runners in the main process by setting the `app.disabled_runners` option in `config/app.go`. The framework evaluates this list centrally, so the same option works for any current or future runner.

```go
// config/app.go
"app": map[string]any{
    "env":   config.Env("APP_ENV", "production"),
    "debug": config.Env("APP_DEBUG", false),
    "disabled_runners": []string{"goravel:schedule"},
},
```

The value is a slice of glob patterns matched against each runner's signature. The framework uses Go's [`path.Match`](https://pkg.go.dev/path#Match) for matching, so `*` is the only wildcard. The framework runner signatures are:

| Signature           | Runner                                          | Started by                   |
| ------------------- | ----------------------------------------------- | ---------------------------- |
| `goravel:http`      | `HTTPRunner` (HTTP server)   | `http` service provider      |
| `goravel:grpc`      | `GrpcRunner` (gRPC server)   | `grpc` service provider      |
| `goravel:queue`     | `QueueRunner` (queue worker) | `queue` service provider     |
| `goravel:schedule`  | `ScheduleRunner` (scheduler) | `schedule` service provider  |
| `goravel:telemetry` | `TelemetryRunner`                               | `telemetry` service provider |

Common patterns:

```go
// Web container — only skip the scheduler so it runs on a dedicated container
"disabled_runners": []string{"goravel:schedule"},

// Scheduler-only container — disable http, queue, grpc
"disabled_runners": []string{"goravel:http", "goravel:queue", "goravel:grpc"},

// Disable every framework runner
"disabled_runners": []string{"goravel:*"},

// Kill switch: run no auto-run runners in the main process
"disabled_runners": []string{"*"},
```

Patterns are evaluated in order and the first match wins. Invalid patterns (for example, an unmatched bracket) are logged as warnings and the runner is left running, so a typo in the config never crashes the boot.

User-defined runners that you register with `WithRunners` are not affected by the `goravel:*` namespace. Use the runner's own signature to disable it.
