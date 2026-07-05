# Telemetriya

[[toc]]

## Kirish

Goravel [OpenTelemetry](https://opentelemetry.io) asosida qurilgan kuzatuvchanlik modulini taqdim etadi, undan `facades.Telemetry()` orqali foydalanish mumkin. Bu sizning ilovangizdan treyslar, metrikalar va loglarni yig'ish va ularni Jaeger, Prometheus, Grafana yoki Datadog kabi har qanday OTLP-mos backendga eksport qilish imkonini beradi.

Modul ilova hayot sikli bilan integratsiyalangan: provayderlar bitta konfiguratsiya faylida sozlanadi, buferlangan ma'lumotlar ilova to'xtatilganda avtomatik ravishda tozalanadi va HTTP server, HTTP klient, gRPC hamda logger uchun o'rnatilgan instrumentatsiya mavjud.

Agar siz OpenTelemetry-dan yangi bo'lsangiz, modul uchta signal atrofida aylanadi:

- **Treyslar** so'rovning xizmatlaringiz bo'ylab harakatlanish yo'lini to'liq qayd etadi. Har bir treys bu spanlar daraxtidir, bunda span HTTP so'rovi, ma'lumotlar bazasi so'rovi yoki funksiya chaqiruvi kabi bitta vaqtlangan operatsiyani ifodalaydi.
- **Metrikalar** vaqt o'tishi bilan yig'ilgan sonli o'lchovlardir, masalan, so'rovlar soni, davomiyliklar yoki xotira ishlatilishi.
- **Loglar** voqealarning vaqt tamg'asi qo'yilgan yozuvlari bo'lib, ularni ishlab chiqargan treys bilan bog'lash mumkin.

## O'rnatish

Telemetriya moduli ixtiyoriy, uni `package:install` buyrug'i yordamida o'rnatishingiz mumkin:

```shell
./artisan package:install Telemetry
```

Bu buyruq quyidagi amallarni bajaradi:

- `config/telemetry.go` konfiguratsiya faylini yaratadi;
- `facades/telemetry.go` fasad faylini yaratadi;
- `bootstrap/providers.go` da `&telemetry.ServiceProvider{}` ni ro'yxatdan o'tkazadi;
- Log eksporti uchun `config/logging.go` ga `otel` kanalini qo'shadi.

## Konfiguratsiya

Barcha konfiguratsiya opsiyalari `config/telemetry.go` faylida joylashgan. `service` bo'limi har bir treys, metrika va log yozuviga biriktirilgan identifikatsiyani belgilaydi, kuzatuvchanlik platformalari ma'lumotlaringizni guruhlash uchun aynan shundan foydalanadi:

```go
"service": map[string]any{
    "name":        config.Env("APP_NAME", "goravel"),
    "version":     config.Env("APP_VERSION", ""),
    "environment": config.Env("APP_ENV", ""),
},
```

Siz `resource` bo'limi orqali barcha telemetriya ma'lumotlariga qo'shimcha statik metama'lumotlarni (masalan, `k8s.pod.name`, `region`, `team`) biriktirishingiz mumkin.

### Signallarni Yoqish

Har bir signal (treyslar, metrikalar va loglar) sukut bo'yicha o'chirilgan. Signalni yoqish uchun uning `exporter` opsiyasini `exporters` bo'limidagi eksportyor ta'riflaridan biriga yo'naltiring. Eng oson yo'li `.env` faylingiz orqali:

```ini
OTEL_TRACES_EXPORTER=otlptrace
OTEL_METRICS_EXPORTER=otlpmetric
OTEL_LOGS_EXPORTER=otlplog
```

Eksportyorni bo'sh satrga o'rnatish mos keluvchi signalni butunlay o'chiradi.

::: tip
Mahalliy ishlab chiqish vaqtida, ma'lumotlarni backendga yuborish o'rniga to'g'ridan-to'g'ri stdout-ga chiqarish uchun ulardan istalganini `console` ga o'rnatishingiz mumkin.
:::

### Eksportyorlar

`exporters` bo'limi ma'lumotlarning ilovangizdan qanday chiqishini belgilaydi. Har bir yozuv signal bo'limlaridan nom orqali havola qilinadi, uchta drayver qo'llab-quvvatlanadi: `otlp`, `console` va `custom`.

#### OTLP

`otlp` drayveri `http/protobuf` (port 4318) yoki `grpc` (port 4317) yordamida istalgan OpenTelemetry kollektori yoki sotuvchi endpointiga ma'lumot yuboradi:

```go
"otlptrace": map[string]any{
    "driver":   "otlp",
    "endpoint": config.Env("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT", "localhost:4318"),

    // Protocol: "http/protobuf" yoki "grpc".
    "protocol": config.Env("OTEL_EXPORTER_OTLP_TRACES_PROTOCOL", "http/protobuf"),

    // TLS/SSL talab qilish uchun false ga o'rnating.
    "insecure": config.Env("OTEL_EXPORTER_OTLP_TRACES_INSECURE", true),

    // Siqish: "gzip" yoki "" (yo'q).
    "compression": config.Env("OTEL_EXPORTER_OTLP_TRACES_COMPRESSION", ""),

    // TLS sertifikat fayl yo'llari. Tizim ildizlarini ishlatish uchun bo'sh qoldiring.
    "tls": map[string]any{
        "ca":   config.Env("OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE", ""),
        "cert": config.Env("OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE", ""),
        "key":  config.Env("OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY", ""),
    },

    // Eksport xatoligida eksponensial orqaga qaytish bilan qayta urinish.
    "retry": map[string]any{
        "enabled":          true,
        "initial_interval": "5s",
        "max_interval":     "30s",
        "max_elapsed_time": "1m",
    },
},
```

`endpoint` opsiyasi faqat `host:port` juftligini yoki to'liq URL ni qabul qiladi. Sxemali URL ko'rsatilganda (masalan, `https://otlp.example.com/v1/traces`), sxema va yo'l TLS sozlamasi va eksport yo'lini belgilaydi va `insecure` opsiyasi e'tiborga olinmaydi.

Agar sizning backend autentifikatsiyani talab qilsa, masalan, sotuvchi API kaliti, siz `headers` opsiyasi orqali har bir eksport so'roviga sarlavhalar biriktirishingiz mumkin:

```go
"otlptrace": map[string]any{
    "driver":   "otlp",
    "endpoint": config.Env("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT", "localhost:4318"),
    "headers": map[string]string{
        "x-api-key": config.Env("OTEL_EXPORTER_API_KEY", ""),
    },
},
```

Metrika eksportyori qo'shimcha ravishda `metric_temporality` opsiyasini qo'llab-quvvatlaydi: `cumulative` (Prometheus), `delta` (Datadog/StatsD) yoki `lowmemory`.

::: tip
Treyslaringizni mahalliy ko'rish uchun Jaeger-ni bitta buyruq bilan ishga tushirishingiz mumkin, u sukut bo'yicha portlarda OTLP qabul qiladi va qo'shimcha konfiguratsiya talab qilmaydi:

```shell
docker run --rm -p 16686:16686 -p 4317:4317 -p 4318:4318 jaegertracing/jaeger:latest
```

So'ng `OTEL_TRACES_EXPORTER=otlptrace` ni o'rnating va `http://localhost:16686` ni oching.
:::

#### Console

`console` drayveri telemetriya ma'lumotlarini stdout-ga chiqaradi, bu mahalliy instrumentatsiyangizni disk raskadrovka qilish uchun foydalidir:

```go
"console": map[string]any{
    "driver":       "console",
    "pretty_print": true,
},
```

#### Custom

Agar ma'lumotlarni quti ichida qo'llab-quvvatlanmaydigan manzilga eksport qilishingiz kerak bo'lsa, `custom` drayveri yordamida o'z eksportyoringizni taqdim etishingiz mumkin. `via` kaliti tayyor namunani yoki fabrika funksiyasini qabul qiladi, bu eksportyor ishlatiladigan signalga bog'liq:

| Signal   | Namuna                  | Fabrika                                               |
| -------- | ----------------------- | ----------------------------------------------------- |
| Treyslar | `sdktrace.SpanExporter` | `func(context.Context) (sdktrace.SpanExporter, error)` |
| Metrikalar | `sdkmetric.Reader`    | `func(context.Context) (sdkmetric.Reader, error)`     |
| Loglar   | `sdklog.Exporter`       | `func(context.Context) (sdklog.Exporter, error)`      |

Masalan, spanlarni stdout o'rniga faylga yozish uchun:

```go
import (
    "context"
    "os"

    "go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
    sdktrace "go.opentelemetry.io/otel/sdk/trace"
)

"custom": map[string]any{
    "driver": "custom",
    "via": func(ctx context.Context) (sdktrace.SpanExporter, error) {
        file, err := os.Create("storage/logs/traces.json")
        if err != nil {
            return nil, err
        }

        return stdouttrace.New(stdouttrace.WithWriter(file))
    },
},
```

### Semplash

Yuqori trafikli ilovalarda har bir treysni yozib olish qimmatga tushishi mumkin. `traces.sampler` bo'limi qaysi treyslar yozib olinishini boshqaradi:

```go
"sampler": map[string]any{
    // Agar true bo'lsa, yuqori oqim xizmatining semplash qarorini hurmat qiladi.
    "parent": config.Env("OTEL_TRACES_SAMPLER_PARENT", true),

    // "always_on", "always_off" yoki "traceidratio"
    "type": config.Env("OTEL_TRACES_SAMPLER_TYPE", "always_on"),

    // "traceidratio" semplash uchun nisbat, masalan, 0.1 treyslarning ~10% ini yozib oladi.
    "ratio": config.Env("OTEL_TRACES_SAMPLER_RATIO", 0.05),
},
```

`parent` yoqilgan bo'lsa, xizmatingiz chaqiruvchi xizmat tomonidan allaqachon qabul qilingan semplash qaroriga amal qiladi, bu esa tarqalgan treyslar o'rtada hech qachon buzilmasligini ta'minlaydi.

### Protsessorlar

Treyslar va loglar eksportyorlarga protsessor orqali uzatiladi. Sukut bo'yicha `batch` protsessori ma'lumotlarni buferlaydi va interval bilan yuboradi, bu ishlab chiqarish uchun tavsiya etilgan sozlamadir. `simple` protsessori har bir yozuvni sinxron eksport qiladi va faqat disk raskadrovka uchun ishlatilishi kerak:

```go
"processor": map[string]any{
    "type":     config.Env("OTEL_TRACE_PROCESSOR_TYPE", "batch"),
    "interval": config.Env("OTEL_TRACE_EXPORT_INTERVAL", "5s"),
    "timeout":  config.Env("OTEL_TRACE_EXPORT_TIMEOUT", "30s"),
},
```

Metrikalar o'rniga davriy o'quvchi (`periodic reader`) ishlatadi, `metrics.reader.interval` orqali sozlanadi (sukut `60s`).

## Treyslash

### Spanlarni Yaratish

Span yaratish uchun `Telemetry` fasadidan `Tracer` metodi yordamida treyserni so'rang, so'ng `Start` ni chaqiring. Birinchi argument `context.Context` bo'lib, agar kontekst allaqachon span o'z ichiga olsa (masalan, HTTP middleware tomonidan boshlangan), yangi span avtomatik ravishda uning farzandi sifatida biriktiriladi.

Yuqoridagi `Tracer` argumenti (`"app"`) bu **instrumentatsiya skop nomi**: u spanni ishlab chiqargan kodni identifikatsiya qiladi. Instrumentatsiya qiluvchi kodga ishora qiluvchi barqaror nomdan foydalaning, konvensiya bo'yicha paket import yo'li (masalan `github.com/you/app/services`) yoki, ilova kodi uchun, ilova yoki modul nomi. U har bir spanda `otel.scope.name` sifatida qayd etiladi, shuning uchun sizning backend spanni uni yaratgan komponent bo'yicha guruhlashi va filtrlashi mumkin. Freymvorkning o'rnatilgan instrumentatsiyasi o'z skopidan foydalanadi (masalan `github.com/goravel/framework/telemetry/instrumentation/http`), bu sizning spanlaringizni freymvorknikidan ajratib turadi.

Quyidagi xizmat buyurtmani qayta ishlash qadamlari orqali kuzatadi: `Process` metodi span ochadi, unda nima sodir bo'lganini qayd etadi va qaytarilgan kontekstni pastga uzatadi, shunda `chargePayment` bir xil treys ichida farzand span bo'ladi:

```go
// app/services/order_service.go
package services

import (
    "context"

    "github.com/goravel/framework/telemetry"

    "goravel/app/facades"
)

type OrderService struct {
}

func (r *OrderService) Process(ctx context.Context, orderID string) error {
    ctx, span := facades.Telemetry().Tracer("app").Start(ctx, "order.process")
    defer span.End()

    span.SetAttributes(telemetry.String("order.id", orderID))

    if err := r.chargePayment(ctx, orderID); err != nil {
        span.RecordError(err)
        span.SetStatus(telemetry.CodeError, "failed to charge payment")

        return err
    }

    span.AddEvent("payment_charged")

    return nil
}

func (r *OrderService) chargePayment(ctx context.Context, orderID string) error {
    // Bu span avtomatik ravishda "order.process" ning farzandi bo'ladi.
    _, span := facades.Telemetry().Tracer("app").Start(ctx, "order.charge_payment")
    defer span.End()

    // To'lovni amalga oshirish...

    return nil
}
```

Xizmat kontrollerdan chaqirilganda, `ctx` ni uzating. Agar [HTTP server middleware](#http-server) ro'yxatdan o'tkazilgan bo'lsa, spanlar so'rov treysiga biriktiriladi, shuning uchun sizning backend to'liq rasmni ko'rsatadi: HTTP so'rovi, buyurtmani qayta ishlash va to'lov bitta daraxt sifatida:

```go
// app/http/controllers/order_controller.go
func (r *OrderController) Store(ctx http.Context) http.Response {
    if err := r.orders.Process(ctx, ctx.Request().Input("order_id")); err != nil {
        return ctx.Response().Status(http.StatusInternalServerError).Json(http.Json{
            "error": "failed to process order",
        })
    }

    return ctx.Response().Success().Json(http.Json{
        "message": "order processed",
    })
}
```

`Tracer` (va `Meter`) ga uzatiladigan nom instrumentatsiya skopini identifikatsiya qiladi, odatda sizning ilova yoki paket nomingiz, va har bir span yonida sizning backendingizda ko'rsatiladi.

### Span Atributlari

Siz `SetAttributes` metodi yordamida spanga kalit-qiymat atributlarini biriktirishingiz mumkin. `telemetry` paketi OpenTelemetry atribut yordamchilarini qayta eksport qiladi, shuning uchun qo'shimcha paketlarni import qilishingiz shart emas:

```go
import "github.com/goravel/framework/telemetry"

span.SetAttributes(
    telemetry.String("order.id", "1234"),
    telemetry.Int("order.items", 3),
    telemetry.Bool("order.gift", false),
)
```

Atributlar `WithAttributes` opsiyasi yordamida yaratish vaqtida ham o'rnatilishi mumkin:

```go
ctx, span := tracer.Start(ctx, "process-order", telemetry.WithAttributes(
    telemetry.String("order.id", "1234"),
))
```

### Span Voqealari

Voqealar (`Events`) span ichida vaqt nuqtasini belgilaydi, masalan, kesh xatosi yoki qayta urinish. Siz ularni `AddEvent` metodi yordamida qo'shishingiz mumkin:

```go
span.AddEvent("cache_miss", telemetry.WithAttributes(
    telemetry.String("cache.key", "user:42"),
))
```

### Xatolarni Qayd Etish

Operatsiya muvaffaqiyatsiz tugaganda, ikkita chaqiruv birgalikda ishlaydi: `RecordError` xatoni span-ga voqea sifatida biriktiradi, va `SetStatus` butun spanni muvaffaqiyatsiz deb belgilaydi, shunda uni backendingizda filtrlash mumkin bo'ladi. Faqat `RecordError` ni chaqirish span holatini o'zgartirmaydi:

```go
if err != nil {
    span.RecordError(err)
    span.SetStatus(telemetry.CodeError, "failed to process order")

    return err
}
```

### Span Turlari

Sukut bo'yicha, spanlar `internal` turi bilan yaratiladi. Agar span navbatga xabar nashr qilish yoki undan iste'mol qilish kabi chegarani ifodalasa, siz uning rolini `WithSpanKind` opsiyasi yordamida e'lon qilishingiz mumkin:

```go
ctx, span := tracer.Start(ctx, "orders.publish", telemetry.WithSpanKind(telemetry.SpanKindProducer))
```

Mavjud turlar: `SpanKindInternal`, `SpanKindServer`, `SpanKindClient`, `SpanKindProducer`, `SpanKindConsumer`.

### Joriy Span

Har doim ham yangi span yaratish shart emas, ko'pincha siz faqat allaqachon faol bo'lgan spanni boyitishni xohlaysiz, masalan, [HTTP server middleware](#http-server) tomonidan boshlangan span. Siz uni `SpanFromContext` funksiyasi yordamida kontekstdan olishingiz mumkin:

```go
import "go.opentelemetry.io/otel/trace"

func (r *OrderController) Store(ctx http.Context) http.Response {
    span := trace.SpanFromContext(ctx)
    span.SetAttributes(telemetry.String("order.id", "1234"))

    // ...
}
```

Agar kontekstda faol span bo'lmasa, no-op span qaytariladi, shuning uchun uni chaqirish har doim xavfsizdir.

## Metrikalar

Metrikalarni yozib olish uchun `Telemetry` fasadidan `Meter` metodi yordamida hisoblagichni so'rang, so'ng undan asboblarni yarating. Asboblar parallel foydalanish uchun xavfsiz va bir marta yaratilib qayta ishlatilishi kerak, keng tarqalgan namuna ularni xizmat yaratilganda yaratish va uning metodlarida qiymatlarni yozib olishdir.

`Tracer` kabi, `Meter` argumenti metrikalarni ishlab chiqaruvchi kodni identifikatsiya qiluvchi **instrumentatsiya skop nomi** dir (qarang: [Spanlarni Yaratish](#spanlarni-yaratish)). U eksport qilingan metrikalarda `otel.scope.name` sifatida qayd etiladi.

Quyidagi xizmat **hisoblagich** (faqat ko'tariladigan qiymat, qayta ishlangan to'lovlar yoki yuborilgan xatlarni hisoblash uchun ideal) va **gistogramma** (qiymatlar taqsimoti, masalan, davomiyliklar yoki foydali yuk o'lchamlari) dan foydalanadi:

```go
// app/services/payment_service.go
package services

import (
    "context"
    "time"

    "go.opentelemetry.io/otel/metric"

    "github.com/goravel/framework/telemetry"

    "goravel/app/facades"
)

type PaymentService struct {
    processed metric.Int64Counter
    duration  metric.Float64Histogram
}

func NewPaymentService() (*PaymentService, error) {
    meter := facades.Telemetry().Meter("app")

    processed, err := meter.Int64Counter("payments.processed",
        metric.WithDescription("Number of processed payments"),
    )
    if err != nil {
        return nil, err
    }

    duration, err := meter.Float64Histogram("payments.duration",
        metric.WithUnit("s"),
        metric.WithDescription("Duration of payment processing"),
    )
    if err != nil {
        return nil, err
    }

    return &PaymentService{processed: processed, duration: duration}, nil
}

func (r *PaymentService) Charge(ctx context.Context, method string) error {
    start := time.Now()

    // To'lovni amalga oshirish...

    r.processed.Add(ctx, 1, metric.WithAttributes(
        telemetry.String("payment.method", method),
    ))
    r.duration.Record(ctx, time.Since(start).Seconds())

    return nil
}
```

**Yuqoriga-pastga hisoblagich** (`up-down counter`) ham kamayishi mumkin, bu jarayondagi qiymatlarni kuzatish uchun foydalidir:

```go
inFlight, err := meter.Int64UpDownCounter("jobs.in_flight")

inFlight.Add(ctx, 1)
defer inFlight.Add(ctx, -1)
```

**Kuzatiladigan o'lchagich** (`observable gauge`) yozib olinadigan emas, balki tanlanadigan (sampled) qiymatni xabar beradi, masalan, navbat chuqurligi yoki ochiq ulanishlar soni. Uni o'zingiz chaqirish o'rniga, har bir yig'ish siklida chaqiriladigan qayta chaqiruv funksiyasini ro'yxatdan o'tkazasiz:

```go
_, err := meter.Int64ObservableGauge("queue.depth",
    metric.WithInt64Callback(func(ctx context.Context, observer metric.Int64Observer) error {
        observer.Observe(int64(queue.Len()))

        return nil
    }),
)
```

Metrikalar `metrics.reader.interval` konfiguratsiyasi asosida davriy ravishda yig'iladi va eksportyorga yuboriladi.

## Loglar

O'rnatish vaqtida `config/logging.go` faylingizga `otel` kanali qo'shiladi:

```go
"otel": map[string]any{
    "driver":          "otel",
    "instrument_name": config.GetString("APP_NAME", "goravel/log"),
},
```

Kanalni logging stekingizga qo'shing va `facades.Log()` orqali yozilgan har bir yozuv OpenTelemetry log yozuvi sifatida ham eksport qilinadi, darajalar, tuzilgan maydonlar va stek treyslar avtomatik ravishda moslashtiriladi:

```go
"stack": map[string]any{
    "driver":   "stack",
    "channels": []string{"daily", "otel"},
},
```

Loglarni faol treys bilan bog'lash uchun ularni `WithContext` yordamida yozing, treys va span ID lari yozuvga biriktiriladi, shunda sizning backend loglarni ularni ishlab chiqargan aniq so'rov bilan bog'lashi mumkin:

```go
func (r *OrderController) Store(ctx http.Context) http.Response {
    facades.Log().WithContext(ctx).
        With(map[string]any{
            "order_id": ctx.Request().Input("order_id"),
        }).
        Info("order received")

    // ...
}
```

Shuningdek, `telemetry.instrumentation.log.enabled` ni `false` ga o'rnatib, logging konfiguratsiyangizga tegmasdan vaqtinchalik log eksportini to'xtatishingiz mumkin. Agar sizga chiqarilgan yozuvlar ustidan to'liq nazorat kerak bo'lsa, logging fasadini chetlab o'tib, `facades.Telemetry().Logger("app")` yordamida to'g'ridan-to'g'ri OpenTelemetry log yozuvlarini chiqarishingiz mumkin.

## Avtomatik Instrumentatsiya

Goravel eng ko'p uchraydigan komponentlar uchun o'rnatilgan instrumentatsiya bilan birga keladi. Ularning har biri `config/telemetry.go` ning `instrumentation` bo'limida yoqilishi/o'chirilishi mumkin.

### HTTP Server

HTTP server middleware kiruvchi treys kontekstini ajratib oladi, har bir so'rov uchun server spanini boshlaydi va standart metrikalarni (`http.server.request.duration`, `http.server.request.body.size`, `http.server.response.body.size`) qayd etadi. Uni `bootstrap/app.go` faylida ro'yxatdan o'tkazing:

```go
import (
    telemetryhttp "github.com/goravel/framework/telemetry/instrumentation/http"
)

func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithMiddleware(func(handler configuration.Middleware) {
            handler.Append(telemetryhttp.Telemetry())
        }).
        Create()
}
```

Siz `excluded_paths` va `excluded_methods` konfiguratsiya opsiyalari yordamida shovqinli endpointlarni o'tkazib yuborishingiz mumkin:

```go
"http_server": map[string]any{
    "enabled":          config.Env("OTEL_HTTP_SERVER_ENABLED", true),
    "excluded_paths":   []string{"/health"},
    "excluded_methods": []string{"OPTIONS"},
},
```

Yanada rivojlangan nazorat uchun middleware opsiyalarni qabul qiladi: so'rovlarni dasturiy ravishda o'tkazib yuborish uchun `WithFilter`, span nomlarini moslashtirish uchun `WithSpanNameFormatter` va qayd etilgan metrikalarga qo'shimcha atributlar biriktirish uchun `WithMetricAttributes`.

```go
handler.Append(telemetryhttp.Telemetry(
    telemetryhttp.WithFilter(func(ctx http.Context) bool {
        return ctx.Request().Path() != "/internal"
    }),
))
```

### HTTP Klient

[HTTP Klient](./http-client.md) orqali amalga oshirilgan chiquvchi so'rovlar avtomatik ravishda instrumentatsiya qilinadi, hech qanday sozlash talab qilinmaydi. Faol treys konteksti chiquvchi sarlavhalarga kiritiladi, shuning uchun quyi oqimdagi Goravel xizmatlari bir xil treysni davom ettiradi.

Siz uni global miqyosda `telemetry.instrumentation.http_client.enabled` orqali yoki har bir klient uchun `config/http.go` dagi mos keluvchi klient konfiguratsiyasida `enable_telemetry` ni `false` ga o'rnatish orqali o'chirib qo'yishingiz mumkin.

### gRPC

gRPC instrumentatsiyasi stats handlerlar orqali taqdim etiladi. Ularni `WithGrpcServerStatsHandlers` va `WithGrpcClientStatsHandlers` funksiyalari yordamida `bootstrap/app.go` faylida ro'yxatdan o'tkazing:

```go
import (
    "google.golang.org/grpc/stats"

    telemetrygrpc "github.com/goravel/framework/telemetry/instrumentation/grpc"
)

func Boot() contractsfoundation.Application {
    return foundation.Setup().
        WithGrpcServerStatsHandlers(func() []stats.Handler {
            return []stats.Handler{telemetrygrpc.NewServerStatsHandler()}
        }).
        WithGrpcClientStatsHandlers(func() map[string][]stats.Handler {
            return map[string][]stats.Handler{
                "default": {telemetrygrpc.NewClientStatsHandler()},
            }
        }).
        Create()
}
```

Ikkala handler ham `WithFilter`, `WithSpanAttributes` va `WithMetricAttributes` kabi opsiyalarni qabul qiladi va `grpc_server.enabled` hamda `grpc_client.enabled` konfiguratsiya opsiyalari orqali yoqilishi/o'chirilishi mumkin.

### Ma'lumotlar Bazasi

[ORM](../orm/getting-started.md) (`facades.Orm()`) va [So'rov Quruvchi](../database/queries.md) (`facades.DB()`) orqali bajarilgan so'rovlar avtomatik ravishda instrumentatsiya qilinadi, hech qanday sozlash talab qilinmaydi. Har bir so'rov `db.client.operation.duration` metrikasi bilan birga klient spanini qayd etadi va har bir ulanish hovuzi `db.client.connection.count` va `db.client.connection.max` haqida xabar beradi, shuning uchun siz hovuz ishlatilishi va to'yinganligini kuzatishingiz mumkin.

Siz uni `telemetry.instrumentation.database.enabled` konfiguratsiya opsiyasi (`OTEL_DATABASE_ENABLED` muhit o'zgaruvchisi) orqali o'chirib qo'yishingiz mumkin.

Tuzilgan so'rovlar uchun jadval quruvchidan olinadi, shuning uchun span operatsiya va jadval nomi bilan ataladi va `db.collection.name` atributini o'z ichiga oladi. Qo'shimcha hech narsa talab qilinmaydi:

```go
facades.DB().Table("users").Where("id", 1).Get(&users) // span: SELECT users
```

`Select` yoki `Statement` orqali bajarilgan xom so'rovlar freymvork tahlil qilmaydigan shaffof SQL satrini uzatadi, shuning uchun span faqat operatsiya nomi bilan ataladi. To'liq nom va `db.collection.name` atributini tiklash uchun jadvalni so'rov kontekstiga belgilash uchun `ContextWithTable` dan foydalaning:

```go
import (
    instrumentationdatabase "github.com/goravel/framework/telemetry/instrumentation/database"
)

queryCtx := instrumentationdatabase.ContextWithTable(ctx, "users")
facades.DB().WithContext(queryCtx).Select(&users, "SELECT * FROM users WHERE id = ?", 1) // span: SELECT users
```

## Kontekstni Tarqatish

`propagators` konfiguratsiya opsiyasi treys konteksti jarayon chegaralarini qanday kesib o'tishini belgilaydi. Sukut bo'yicha W3C `tracecontext` standarti; `baggage`, `b3` va `b3multi` (Zipkin) ham qo'llab-quvvatlanadi va vergul bilan ajratilgan ro'yxat sifatida birlashtirilishi mumkin.

O'rnatilgan HTTP va gRPC instrumentatsiyasi kontekstni avtomatik ravishda tarqatadi. Agar siz xabar navbati kabi maxsus transport orqali muloqot qilsangiz, `Propagator` metodi yordamida treysni chegaradan o'zingiz o'tkazishingiz mumkin: ishlab chiqaruvchi faol kontekstni xabar sarlavhalariga kiritadi, va iste'molchi uni ajratib oladi va bir xil treysni davom ettiradi:

```go
import (
    "context"

    "github.com/goravel/framework/telemetry"

    "goravel/app/facades"
)

type Message struct {
    Headers map[string]string
    Body    []byte
}

func (r *OrderPublisher) Publish(ctx context.Context, message *Message) error {
    // Faol treys kontekstini xabarga biriktirish
    facades.Telemetry().Propagator().Inject(ctx, telemetry.PropagationMapCarrier(message.Headers))

    // Xabarni brokerga yuborish...

    return nil
}

func (r *OrderConsumer) Consume(message *Message) error {
    // Ishlab chiqaruvchi boshlagan treysni davom ettirish
    ctx := facades.Telemetry().Propagator().Extract(context.Background(), telemetry.PropagationMapCarrier(message.Headers))

    ctx, span := facades.Telemetry().Tracer("app").Start(ctx, "orders.consume",
        telemetry.WithSpanKind(telemetry.SpanKindConsumer),
    )
    defer span.End()

    return r.process(ctx, message)
}
```

Agar joriy treys identifikatorlari kerak bo'lsa, masalan, ularni xato javobida qaytarish uchun, ularni kontekstdan o'qishingiz mumkin:

```go
import "go.opentelemetry.io/otel/trace"

spanCtx := trace.SpanContextFromContext(ctx)

traceID := spanCtx.TraceID().String()
spanID := spanCtx.SpanID().String()
```

## Flush va O'chirish

Telemetriya hayot siklini o'zingiz boshqarishingiz shart emas: ilova to'xtaganda, Goravel avtomatik ravishda barcha buferlangan ma'lumotlarni tozalaydi va provayderlarni o'chiradi, ko'pi bilan `shutdown_timeout` (sukut `15s`) kutadi.

Agar provayderlarni to'xtatmasdan buferlangan ma'lumotlarni darhol yuborishingiz kerak bo'lsa, masalan, serverless funksiya muzlatilishidan oldin, `ForceFlush` metodidan foydalanishingiz mumkin:

```go
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

if err := facades.Telemetry().ForceFlush(ctx); err != nil {
    facades.Log().Error(err)
}
```
