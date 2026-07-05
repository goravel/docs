# Papka tuzilishi

[[toc]]

## Kirish

Standart fayl tuzilmasi loyihaning rivojlanishini yaxshiroq boshlashingizga yordam beradi, shuningdek, siz yangi papkalarni bemalol qo‘shishingiz mumkin, lekin standart papkalarni o‘zgartirmang.

## Papka daraxti

```
goravel/
├── app/                        # Core application logic
│   ├── ai/                     # AI agents and tools
│   │   ├── agents/             # AI agent classes
│   │   └── tools/              # AI tool classes
│   ├── console/                # Artisan console commands
│   ├── grpc/                   # gRPC controllers and middleware
│   ├── http/                   # HTTP controllers and middleware
│   │   ├── controllers/        # HTTP request handlers
│   │   ├── middleware/         # HTTP middleware (auth, cors, etc.)
│   ├── models/                 # ORM models
│   └── providers/              # Service providers
├── bootstrap/                  # Application bootstrapping
│   └── app.go                  # Framework initialization
├── config/                     # Application configuration files
├── database/                   # Database related files
│   ├── migrations/             # Database migration files
│   ├── seeders/                # Database seeders
├── resources/                  # Raw, uncompiled assets
│   └── views/                  # View templates
├── routes/                     # Application route definitions
├── storage/                    # Application storage
├── tests/                      # Automated tests
├── .air.toml                   # Air hot reload configuration
├── .env.example                # Environment variables template
├── artisan                     # Artisan console entry script
├── go.mod                      # Go module dependencies
├── go.sum                      # Go module checksums
├── main.go                     # Application entry point
```

## Papka tuzilishini sozlash

You can customize the directory structure by calling the `WithPaths()` function in the `bootstrap/app.go` file. Masalan, agar siz standart `app` papkasini `src` ga o‘zgartirmoqchi bo‘lsangiz, `bootstrap/app.go` faylini quyidagicha o‘zgartirishingiz mumkin:

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithPaths(func(paths configuration.Paths) {
			paths.App("src")
		}).
		WithConfig(config.Boot).
		Create()
}
```

Siz sozlashingiz mumkin bo‘lgan boshqa ko‘plab yo‘llar mavjud, masalan, `Config`, `Database`, `Routes`, `Storage` va `Resources`. AI generator paths can also be customized with `Agents` and `Tools`:

```go
func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithPaths(func(paths configuration.Paths) {
            paths.Agents("internal/ai/agents")
            paths.Tools("internal/ai/tools")
        }).
        WithConfig(config.Boot).
        Create()
}
```
