# Xizmat ko'rsatuvchilar

[[toc]]

## Kirish

The most important thing in the kernel boot operation is to load the `ServiceProvider`. Ilovaning barcha `ServiceProvider`lari `bootstrap/providers.go` faylida sozlanadi.

Avvalo, yadro barcha xizmat ko'rsatuvchilarning `Register` metodini chaqiradi. Barcha xizmat ko'rsatuvchilar ro'yxatdan o'tkazilgandan so'ng, yadro barcha `ServiceProvider`larning `Boot` metodini yana chaqiradi.

`ServiceProvider` Goravel hayot tsiklining kalitidir. Ular freymvorkga turli komponentlarni, masalan, marshrutlash, ma'lumotlar bazasi, navbat, keshlash va hokazolarni o'z ichiga olish imkonini beradi.

## Xizmat ko'rsatuvchini yaratish

Xizmat ko'rsatuvchilar `Register` va `Boot` usullarini o'z ichiga oladi. `Register` usulida siz faqat [xizmat konteyneriga](./service-container.md) narsalarni bog'lashingiz kerak. Siz hech qachon `Register` usulida hech qanday hodisa tinglovchilarini, marshrutlarni yoki boshqa funksionallikni ro'yxatdan o'tkazishga urinmang, buning uchun `Boot` usulidan foydalaning.

```bash
./artisan make:provider SizningXizmatKo‘rsatuvchiProvayderingizNomi
```

Artisan CLI `make:provider` buyrug'i orqali yangi provayder yaratish mumkin. Yangi xizmat ko'rsatuvchi provayder `bootstrap/providers.go::Providers()` funksiyasida avtomatik ravishda ro'yxatdan o'tkaziladi va funksiya `WithProviders` tomonidan chaqiriladi.

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithProvders(Providers).
		WithConfig(config.Boot).
		Create()
}
```

## Qaramlik munosabati

`ServiceProvider` `Relationship()` ixtiyoriy usulini taqdim etadi `binding.Relationship`, bog'liqlik munosabatini e'lon qilish uchun ishlatiladi, ushbu usulni o'rnatgan `ServiceProvider` ro'yxatga olish tartibiga bog'liq bo'lmaydi, va uni o'rnatmagan `ServiceProvider` oxirgi ro'yxatga olinadi, masalan:

```go
type ServiceProvider struct {}

func (r *ServiceProvider) Relationship() binding.Relationship {
	return binding.Relationship{
		Bindings: []string{
			"custom",
		},
		Dependencies: []string{
			binding.Config,
		},
		ProvideFor: []string{
			binding.Cache,
		},
	}
}

func (r *ServiceProvider) Register(app foundation.Application) {
	app.Singleton("custom", func(app foundation.Application) (any, error) {
		return New()
	})
}

func (r *ServiceProvider) Boot(app foundation.Application) {}
```

## Ishlovchilar

`ServiceProvider` ilovani ishga tushirishda ba'zi kodlarni ishga tushirish uchun `Runners` interfeysini ham amalga oshirishi mumkin. Bu odatda `ServiceProvider` da aniqlangan xizmatni ishga tushirish yoki o'chirish uchun ishlatiladi. Masalan: `Route`, `Schedule`, `Queue`, va boshqalar. Endi siz bu xizmatlarni `main.go` faylidagi `Runners` bilan ishga tushirish/to‘xtatish shart emas, Goravel buning o‘zini qiladi.

`Runner` uchta usulni o'z ichiga oladi: `ShouldRun()`, `Run()`, va `Shutdown()`.

```go
type Runner interface {
	// ShouldRun determines whether the runner should be executed.
	ShouldRun() bool
	// Run starts the runner.
	Run() error
	// Shutdown gracefully stops the runner.
	Shutdown() error
}
```

`ServiceProvider` ichida `Route` xizmatini ishga tushirish va o‘chirish uchun aniqlangan `RouteRunner` misoli mavjud.

```go
type ServiceProvider struct {}

func (r *ServiceProvider) Register(app foundation.Application) {}

func (r *ServiceProvider) Boot(app foundation.Application) {}

func (r *ServiceProvider) Runners(app foundation.Application) []foundation.Runner {
	return []foundation.Runner{NewRouteRunner(app.MakeConfig(), app.MakeRoute())}
}
```

```go
package route

import (
	"github.com/goravel/framework/contracts/config"
	"github.com/goravel/framework/contracts/route"
)

type RouteRunner struct {
	config config.Config
	route  route.Route
}

func NewRouteRunner(config config.Config, route route.Route) *RouteRunner {
	return &RouteRunner{
		config: config,
		route:  route,
	}
}

func (r *RouteRunner) ShouldRun() bool {
	return r.route != nil && r.config.GetString("http.default") != ""
}

func (r *RouteRunner) Run() error {
	return r.route.Run()
}

func (r *RouteRunner) Shutdown() error {
	return r.route.Shutdown()
}
```

Ilovani ishga tushirishda ba'zi kodni ishga tushirish uchun `bootstrap/app.go::WithRunners` funksiyasida o'zingizning `Runner`ingizni ro'yxatdan o'tkazishingiz mumkin.

```go
func Boot() contractsfoundation.Application {
	return foundation.Setup().
		WithConfig(config.Boot).
		WithRunners(func() []foundation.Runner{
			return []foundation.Runner{
				NewYourCustomRunner(),
			}
		}).
		Create()
}
```
