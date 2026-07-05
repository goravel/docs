# Telemetriya

[[toc]]

## Kirish

Goravel [OpenTelemetry](https://opentelemetry.io) asosida qurilgan kuzatuv modulini taqdim etadi, uni `facades.Telemetry()` yordamida boshqarish mumkin. Bu sizga ilovangizdan tracelar, metrikalar va loglarni to‘plash va ularni Jaeger, Prometheus, Grafana yoki Datadog kabi har qanday OTLP-mos keladigan backendga eksport qilish imkonini beradi.

Modul dastur hayotiy sikli bilan integratsiyalangan: provayderlar bitta konfiguratsiya faylida sozlanadi, buferlangan ma'lumotlar dastur yopilganda avtomatik ravishda tozalanadi va HTTP server, HTTP mijoz, gRPC va logger uchun o‘rnatilgan instrumentatsiya mavjud.

Agar siz OpenTelemetry bilan tanish bo‘lmasangiz, modul uchta signal atrofida aylanadi:

- **Tracelar** so‘rovning xizmatlaringiz bo‘ylab o‘tishdagi to‘liq yo‘lini qayd etadi. Har bir trace spanlar daraxtidir, bunda span HTTP so‘rov, ma'lumotlar bazasi so‘rovi yoki funksiya chaqiruvi kabi bitta vaqtli operatsiyani ifodalaydi.
- **Metrikalar** vaqt davomida agregatsiyalangan raqamli o'lchovlardir, masalan, so'rovlar soni, davomiylik yoki xotira ishlatilishi.
- **Jurnallar** vaqt tamg'asi bilan belgilangan hodisalar yozuvlari bo'lib, ularni ishlab chiqargan treyega ulanish mumkin.

## O'rnatish

Telemetriya moduli ixtiyoriy, uni `package:install` buyrug'i yordamida o'rnatishingiz mumkin:

```shell
./artisan package:install Telemetriya
```

Bu buyruq quyidagi amallarni bajaradi:

- `config/telemetry.go` konfiguratsiya faylini yaratadi;
- `facades/telemetry.go` fasad faylini yaratadi;
- `bootstrap/providers.go` faylida `&telemetry.ServiceProvider{}` ni ro'yxatdan o'tkazadi;
- Jurnal eksporti uchun `config/logging.go` ga `otel` kanalini qo'shadi.

## Konfiguratsiya

Barcha konfiguratsiya variantlari `config/telemetry.go` faylida joylashgan. `service` bo'limi har bir trace, metric va log yozuviga biriktirilgan identifikatorni belgilaydi, kuzatuv platformalari ma'lumotlaringizni guruhlash uchun undan foydalanadi.

```go
"service": map[string]any{
    "name":        config.Env("APP_NAME", "goravel"),
    "version":     config.Env("APP_VERSION", ""),
    "environment": config.Env("APP_ENV", ""),
},
```

`resource` bo'limi yordamida barcha telemetriya ma'lumotlariga qo'shimcha statik metama'lumotlarni (masalan, `k8s.pod.name`, `region`, `team`) biriktirishingiz mumkin.

### Signallarni yoqish

Har bir signal (traces, metrics va logs) sukut bo'yicha o'chirilgan. Signalni yoqish uchun uning `exporter` optsionini `exporters` bo'limidagi eksportir ta'riflaridan biriga yo'naltiring. Eng oson yo'l - bu `.env` faylingiz orqali:

```ini
OTEL_TRACES_EXPORTER=otlptrace
OTEL_METRICS_EXPORTER=otlpmetric
OTEL_LOGS_EXPORTER=otlplog
```

Eksportchini bo'sh stringga o'rnatish tegishli signalni butunlay o'chiradi.

:::tip
Mahalliy ishlab chiqishda, siz ulardan birini `console` ga o'rnatishingiz mumkin, bu esa telemetriya ma'lumotlarini backendga yuborish o'rniga to'g'ridan-to'g'ri stdoutga chop etadi.
:::

### Eksportchilar

`exporters` bo'limi ma'lumotlarni ilovangizdan qanday chiqishini belgilaydi. Har bir yozuv signal bo'limlaridan nom bilan havola qilinadi, uchta drayver qo'llab-quvvatlanadi: `otlp`, `console` va `custom`.

#### OTLP

`otlp` drayveri ma'lumotlarni `http/protobuf` (port 4318) yoki `grpc` (port 4317) yordamida istalgan OpenTelemetry kollektori yoki sotuvchi so'nggi nuqtasiga yuboradi:

```go
"otlptrace": map[string]any{
    "driver":   "otlp",
    "endpoint": config.Env("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT", "localhost:4318"),

    // Protocol: "http/protobuf" or "grpc".
    "protocol": config.Env("OTEL_EXPORTER_OTLP_TRACES_PROTOCOL", "http/protobuf"),

    // Set to false to require TLS/SSL.
    "insecure": config.Env("OTEL_EXPORTER_OTLP_TRACES_INSECURE", true),

    // Compression: "gzip" or "" (none).
    "compression": config.Env("OTEL_EXPORTER_OTLP_TRACES_COMPRESSION", ""),

    // TLS certificate file paths. Leave empty to use system roots.
    "tls": map[string]any{
        "ca":   config.Env("OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE", ""),
        "cert": config.Env("OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE", ""),
        "key":  config.Env("OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY", ""),
    },

    // Retry with exponential backoff on export failure.
    "retry": map[string]any{
        "enabled":          true,
        "initial_interval": "5s",
        "max_interval":     "30s",
        "max_elapsed_time": "1m",
    },
},
```

`endpoint` opsiyasi yalang'och `host:port` juftligi yoki to'liq URLni qabul qiladi. Agar URL sxema bilan ta'minlangan bo'lsa (masalan, `https://otlp.example.com/v1/traces`), sxema va yo'l TLS sozlamasi va eksport yo'lini aniqlaydi va `insecure` opsiyasi e'tiborga olinmaydi.

Agar backend autentifikatsiyani talab qilsa, masalan, vendor API kaliti, siz `headers` opsiyasidan foydalanib, har bir eksport so'roviga headerlarni biriktirishingiz mumkin:

```go
"otlptrace": map[string]any{
    "driver":   "otlp",
    "endpoint": config.Env("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT", "localhost:4318"),
    "headers": map[string]string{
        "x-api-key": config.Env("OTEL_EXPORTER_API_KEY", ""),
    },
},
```

Metrik eksportyor qo'shimcha ravishda `metric_temporality` opsiyasini qo'llab-quvvatlaydi: `cumulative` (Prometheus), `delta` (Datadog/StatsD) yoki `lowmemory`.

:::tip
Traceslarni mahalliy ko'rish uchun siz Jaeger-ni bitta buyruq bilan ishga tushirishingiz mumkin, u standart portlarda OTLPni qabul qiladi va qo'shimcha konfiguratsiyani talab qilmaydi:

```shell
docker run --rm -p 16686:16686 -p 4317:4317 -p 4318:4318 jaegertracing/jaeger:latest
```

Keyin `OTEL_TRACES_EXPORTER=otlptrace` ni o'rnating va `http://localhost:16686` ni oching.
:::

#### Konsol

`console` drayveri telemetriya ma'lumotlarini stdout ga chiqaradi, bu sizning instrumentatsiyangizni mahalliy darajada disk raskadrovka qilish uchun foydalidir:

```go
"console": map[string]any{
    "driver":       "console",
    "pretty_print": true,
},
```

#### Maxsus

Agar siz ma'lumotlarni o'rnatilgan qo'llab-quvvatlanmaydigan manzilga eksport qilishingiz kerak bo'lsa, `custom` drayveridan foydalanib o'zingizning eksport qiluvchingizni taqdim etishingiz mumkin. `via` kaliti tayyor instansiya yoki zavod funksiyasini qabul qiladi, eksport qiluvchi qaysi signal uchun ishlatilishiga qarab:

| Signal     | Instansiya              | Zavod                                                  |
| ---------- | ----------------------- | ------------------------------------------------------ |
| Kuzatuvlar | `sdktrace.SpanExporter` | `func(context.Context) (sdktrace.SpanExporter, error)` |
| Metriklar  | `sdkmetric.Reader`      | `func(context.Context) (sdkmetric.Reader, error)`      |
| Loglar     | `sdklog.Exporter`       | `func(context.Context) (sdklog.Exporter, error)`       |

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

### Namuna olish

Har bir izni yozib olish yuqori trafikli ilovalarda qimmatga tushishi mumkin. `traces.sampler` bo'limi qaysi treyslar yozilishini boshqaradi:

```go
"sampler": map[string]any{
    // Agar rost bo'lsa, yuqori oqim xizmatining tanlab olish qarorini hurmat qiladi.
    "parent": config.Env("OTEL_TRACES_SAMPLER_PARENT", true),

    // "always_on", "always_off" yoki "traceidratio"
    "type": config.Env("OTEL_TRACES_SAMPLER_TYPE", "always_on"),

    // "traceidratio" tanlash uchun nisbat, masalan, 0.1 treyslarning ~10% ini qayd etadi.
    "ratio": config.Env("OTEL_TRACES_SAMPLER_RATIO", 0.05),
},
```

`parent` yoqilganida, xizmatiz chaqiruvchi xizmat tomonidan qabul qilingan tanlash qaroriga amal qiladi va taqsimlangan treyslar hech qachon o'rtada uzilmasligini kafolatlaydi.

### Protsessorlar

Treyslar va jurnallar protsessor orqali eksport qiluvchilarga topshiriladi. Odatiy `batch` protsessori ma'lumotlarni buferlaydi va interval bo'yicha yuboradi, bu ishlab chiqarish uchun tavsiya etilgan sozlama. `simple` protsessori har bir yozuvni sinxron ravishda eksport qiladi va faqat disk raskadrovka uchun ishlatilishi kerak:

```go
"processor": map[string]any{
    "type":     config.Env("OTEL_TRACE_PROCESSOR_TYPE", "batch"),
    "interval": config.Env("OTEL_TRACE_EXPORT_INTERVAL", "5s"),
    "timeout":  config.Env("OTEL_TRACE_EXPORT_TIMEOUT", "30s"),
},
```

Metrikalar o'rniga davriy o'quvchidan foydalanadi, `metrics.reader.interval` (sukut bo'yicha `60s`) bilan sozlanadi.

## Kuzatish

### Spanlarni Yaratish

Span yaratish uchun `Telemetry` fasadidan `Tracer` metodi yordamida treyser so'rang, so'ngra `Start` ni chaqiring. Birinchi argument `context.Context` dir, agar kontekst allaqachon spanni o'z ichiga olgan bo'lsa (masalan, HTTP middleware tomonidan boshlangan), yangi span avtomatik ravishda uning bolasi sifatida biriktiriladi.

`Tracer` argumenti (yuqoridagi `"app"`) **instrumentatsiya doira nomi** dir: u spanni yaratgan kodni aniqlaydi. Instrumentatsiya kodiga ishora qiluvchi barqaror nomdan foydalaning, an'anaga ko'ra paket import yo'li (masalan `github.com/you/app/services`) yoki dastur kodi uchun dastur yoki modul nomi. Bu har bir spanga `otel.scope.name` sifatida yoziladi, shuning uchun backend'ingiz spanlarni chiqargan komponent bo'yicha guruhlashi va filtrlashi mumkin. Framework'ning o'rnatilgan instrumentatsiyasi o'zining qamrovidan (masalan `github.com/goravel/framework/telemetry/instrumentation/http`) foydalanadi, bu sizning spanlaringizni framework'nikidan ajratib turadi.

Quyidagi xizmat buyurtmani qayta ishlash bosqichlari orqali kuzatadi: `Process` metodi spanni ochadi, unda sodir bo'lganlarni yozib oladi va qaytarilgan kontekstni uzatadi, shunda `chargePayment` bir xil izdagi bolak spanga aylanadi:

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
    // Bu span avtomatik ravishda "order.process" ning bolak spanga aylanadi.
    _, span := facades.Telemetry().Tracer("app").Start(ctx, "order.charge_payment")
    defer span.End()

    // To'lovni amalga oshirish...

    return nil
}
```

Xizmat nazoratchi (controller) dan chaqirilganda, `ctx` ni o'tkazing. Agar [HTTP server vositasi](#http-server) ro'yxatdan o'tkazilgan bo'lsa, spannlar so'rovning traasiga biriktiriladi, shuning uchun sizning backend to'liq rasmni ko'rsatadi: HTTP so'rov, buyurtmani qayta ishlash va to'lovni bitta daraxt sifatida:

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

`Tracer` (va `Meter`) ga uzatilgan nom instrumentatsiya doirasini aniqlaydi, odatda sizning dasturingiz yoki paket nomi, va har bir spann yonida sizning backend ko'rsatiladi.

### Span Atributlari

Siz `SetAttributes` usuli yordamida spanga kalit-qiymat atributlarini biriktirishingiz mumkin. `telemetry` paketi OpenTelemetry atribut yordamchilarini qayta eksport qiladi, shuning uchun qo'shimcha paketlarni import qilishingiz shart emas:

```go
import "github.com/goravel/framework/telemetry"

span.SetAttributes(
    telemetry.String("order.id", "1234"),
    telemetry.Int("order.items", 3),
    telemetry.Bool("order.gift", false),
)
```

Attributlarni yaratish vaqtida `WithAttributes` opsiyasi yordamida ham o'rnatish mumkin:

```go
ctx, span := tracer.Start(ctx, "process-order", telemetry.WithAttributes(
    telemetry.String("order.id", "1234"),
))
```

### Span tadbirlari

Tadbirlar (Events) span ichidagi vaqt nuqtasini belgilaydi, masalan kesh xatosi yoki qayta urinish. Ularni `AddEvent` usuli yordamida qo'shishingiz mumkin:

```go
span.AddEvent("cache_miss", telemetry.WithAttributes(
    telemetry.String("cache.key", "user:42"),
))
```

### Xatolarni yozib olish

Operatsiya muvaffaqiyatsiz bo'lganda, ikkita chaqiruv birgalikda ishlaydi: `RecordError` xatolikni span'ga hodisa sifatida biriktiradi va `SetStatus` butun spanni muvaffaqiyatsiz deb belgilaydi, shuning uchun uni backend'ingizda filtrlash mumkin. `RecordError` ni yolg'iz chaqirish span holatini o'zgartirmaydi:

```go
if err != nil {
    span.RecordError(err)
    span.SetStatus(telemetry.CodeError, "failed to process order")

    return err
}
```

### Span turlari

Odatiy bo'lib, spanlar `internal` turi bilan yaratiladi. Agar span navbatga xabar yuborish yoki uni iste'mol qilish kabi chegarani ifodalasa, uning rolini `WithSpanKind` opsiyasi yordamida e'lon qilishingiz mumkin:

```go
ctx, span := tracer.Start(ctx, "orders.publish", telemetry.WithSpanKind(telemetry.SpanKindProducer))
```

Mavjud turlar: `SpanKindInternal`, `SpanKindServer`, `SpanKindClient`, `SpanKindProducer`, `SpanKindConsumer`.

### Joriy Span

Har doim yangi span yaratish shart emas, ko'pincha siz allaqachon faol bo'lgan spanni boyitmoqchi bo'lasiz, masalan, [HTTP server o'rta dasturi](#http-server) tomonidan boshlangan span. Uni kontekstdan `SpanFromContext` funksiyasi yordamida olishingiz mumkin:

```go
import "go.opentelemetry.io/otel/trace"

func (r *OrderController) Store(ctx http.Context) http.Response {
    span := trace.SpanFromContext(ctx)
    span.SetAttributes(telemetry.String("order.id", "1234"))

    // ...
}
```

Agar kontekstda faol span bo'lmasa, no-op spani qaytariladi, shuning uchun uni chaqirish har doim xavfsiz.

## Metrikalar

Metrikalarni yozib olish uchun `Telemetry` fasadidan `Meter` metodi yordamida metr so'rang, so'ngra undan asboblar yarating. Asboblar bir vaqtning o'zida foydalanish uchun xavfsiz va bir marta yaratilib, qayta ishlatilishi kerak. Umumiy usul - ularni xizmat yaratilganda yaratish va uning usullarida qiymatlarni qayd etish.

`Tracer` kabi, `Meter` argumenti metrikalarni ishlab chiqaruvchi kodni aniqlaydigan **instrumentatsiya doirasi nomi** (qarang: [Spanlar yaratish](#creating-spans)). U eksport qilingan metrikalarda `otel.scope.name` sifatida qayd etiladi.

Quyidagi xizmat **counter** (faqat oshib boradigan qiymat, to'langan to'lovlar yoki yuborilgan elektron xatlarni hisoblash uchun ideal) va **histogram** (qiymatlarning taqsimoti, masalan, davomiylik yoki yuk hajmi) dan foydalanadi:

```go
// app/services/payment_service.go\npackage services\n\nimport (\n    \"context\"\n    \"time\"\n\n    \"go.opentelemetry.io/otel/metric\"\n\n    \"github.com/goravel/framework/telemetry\"\n\n    \"goravel/app/facades\"\n)\n\ntype PaymentService struct {\n    processed metric.Int64Counter\n    duration  metric.Float64Histogram\n}\n\nfunc NewPaymentService() (*PaymentService, error) {\n    meter := facades.Telemetry().Meter(\"app\")\n\n    processed, err := meter.Int64Counter(\"payments.processed\",\n        metric.WithDescription(\"Number of processed payments\"),\n    )\n    if err != nil {\n        return nil, err\n    }\n\n    duration, err := meter.Float64Histogram(\"payments.duration\",\n        metric.WithUnit(\"s\"),\n        metric.WithDescription(\"Duration of payment processing\"),\n    )\n    if err != nil {\n        return nil, err\n    }\n\n    return &PaymentService{processed: processed, duration: duration}, nil\n}\n\nfunc (r *PaymentService) Charge(ctx context.Context, method string) error {\n    start := time.Now()\n\n    // To'lovni qayta ishlash...\n\n    r.processed.Add(ctx, 1, metric.WithAttributes(\n        telemetry.String(\"payment.method\", method),\n    ))\n    r.duration.Record(ctx, time.Since(start).Seconds())\n\n    return nil\n}
```

**Yuqori-past hisoblagich** ham kamayishi mumkin, bajarilayotgan qiymatlarni kuzatish uchun foydalidir:

```go
inFlight, err := meter.Int64UpDownCounter(\"jobs.in_flight\")\n\ninFlight.Add(ctx, 1)\ndefer inFlight.Add(ctx, -1)
```

**Kuzatiladigan o‘lchagich** yozib olinmagan, namunaviy qiymatni bildiradi, masalan, navbat chuqurligi yoki ochiq ulanishlar soni. Uni o‘zingiz chaqirish o‘rniga, har bir yig‘ish tsiklida chaqiriladigan callback funksiyasini ro‘yxatdan o‘tkazasiz:

```go
_, err := meter.Int64ObservableGauge("queue.depth",
    metric.WithInt64Callback(func(ctx context.Context, observer metric.Int64Observer) error {
        observer.Observe(int64(queue.Len()))

        return nil
    }),
)
```

Metrikalar `metrics.reader.interval` konfiguratsiyasiga asoslangan holda davriy ravishda yig‘iladi va eksport qiluvchiga jo‘natiladi.

## Loglar

O‘rnatish jarayonida sizning `config/logging.go` faylingizga `otel` kanali qo‘shiladi:

```go
"otel": map[string]any{
    "driver":          "otel",
    "instrument_name": config.GetString("APP_NAME", "goravel/log"),
},
```

Kanalni logging stack-ga qo‘shing va `facades.Log()` orqali yozilgan har bir yozuv ham avtomatik ravishda darajalar, strukturali maydonlar va stack trace‘lar bilan OpenTelemetry log yozuvi sifatida eksport qilinadi.

```go
"stack": map[string]any{
    "driver":   "stack",
    "channels": []string{"daily", "otel"},
},
```

Faol trace bilan loglarni bog'lash uchun ularni `WithContext` yordamida yozing, trace va span IDlari yozuvga biriktiriladi, shuning uchun backend loglarni ularni yaratgan aniq so'rov bilan bog'lashi mumkin.

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

Shuningdek, logging konfiguratsiyasiga tegmasdan, `telemetry.instrumentation.log.enabled` ni `false` ga o'rnatish orqali loglarni eksport qilishni vaqtincha to'xtatishingiz mumkin. Agar siz chiqarilgan yozuvlar ustidan to'liq nazoratga ega bo'lishni istasangiz, logging fasadini chetlab o'tib, `facades.Telemetry().Logger("app")` yordamida to'g'ridan-to'g'ri OpenTelemetry log yozuvlarini chiqarishingiz mumkin.

## Avtomatik Instrumentatsiya

Goravel eng keng tarqalgan komponentlar uchun o'rnatilgan instrumentatsiya bilan birga keladi. Har biri `config/telemetry.go` faylining `instrumentation` bo'limida yoqilishi/o'chirilishi mumkin.

### HTTP Server

HTTP server middleware kiruvchi trace kontekstini chiqaradi, har bir so'rov uchun server spanni boshlaydi va standart metrikalarni (`http.server.request.duration`, `http.server.request.body.size`, `http.server.response.body.size`) yozib oladi. Uni `bootstrap/app.go` faylida ro'yxatdan o'tkazing:

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

Shovqinli nuqtalarni `excluded_paths` va `excluded_methods` sozlama opsiyalari yordamida o'tkazib yuborishingiz mumkin:

```go
"http_server": map[string]any{
    "enabled":          config.Env("OTEL_HTTP_SERVER_ENABLED", true),
    "excluded_paths":   []string{"/health"},
    "excluded_methods": []string{"OPTIONS"},
},
```

Yanada ilg'or nazorat uchun middleware quyidagi opsiyalarni qabul qiladi: `WithFilter` so'rovlarni dasturiy ravishda o'tkazib yuborish uchun, `WithSpanNameFormatter` span nomlarini moslashtirish uchun va `WithMetricAttributes` yozib olingan metrikalarga qo'shimcha atributlarni biriktirish uchun.

```go
handler.Append(telemetryhttp.Telemetry(
    telemetryhttp.WithFilter(func(ctx http.Context) bool {
        return ctx.Request().Path() != "/internal"
    }),
))
```

### HTTP mijozi

[HTTP mijozi](./http-client.md) orqali amalga oshirilgan chiquvchi so'rovlar avtomatik ravishda instrumentatsiya qilinadi, hech qanday sozlash talab qilinmaydi. Faol iz konteksti chiquvchi sarlavhalarga joylanadi, shuning uchun quyi Goravel xizmatlari bir xil izni davom ettiradi.

Siz uni global darajada `telemetry.instrumentation.http_client.enabled` orqali o'chirib qo'yishingiz mumkin, yoki har bir mijoz uchun `config/http.go` dagi tegishli mijoz konfiguratsiyasida `enable_telemetry` ni `false` ga o'rnatish orqali.

### gRPC

gRPC instrumentatsiyasi stats handlerlar orqali taqdim etiladi. Ularni `bootstrap/app.go` faylida `WithGrpcServerStatsHandlers` va `WithGrpcClientStatsHandlers` funksiyalari yordamida ro'yxatdan o'tkazing:

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

Ikkala handler ham `WithFilter`, `WithSpanAttributes` va `WithMetricAttributes` kabi opsiyalarni qabul qiladi va `grpc_server.enabled` va `grpc_client.enabled` konfiguratsiya opsiyalari orqali yoqilishi/ochirilishi mumkin.

### Ma'lumotlar bazasi

ORM (`facades.Orm()`) va [So'rovlar quruvchi](../database/queries.md) (`facades.DB()`) orqali bajarilgan so'rovlar avtomatik ravishda asboblanadi, sozlash talab qilinmaydi. Har bir so'rov `db.client.operation.duration` metriyasi bilan birga mijoz spanini qayd qiladi, va har bir ulanish havuzi `db.client.connection.count` va `db.client.connection.max` hisobotini beradi, shuning uchun siz havuz foydalanishi va to'yinganligini kuzatishingiz mumkin.

Siz uni `telemetry.instrumentation.database.enabled` konfiguratsiya opsiyasi (`OTEL_DATABASE_ENABLED` muhit o'zgaruvchisi) orqali o'chirib qo'yishingiz mumkin.

Strukturli so'rovlar uchun jadval quruvchidan keladi, shuning uchun span operatsiya va jadval nomi bilan ataladi va `db.collection.name` atributini olib yuradi. Qo'shimcha hech narsa talab qilinmaydi:

```go
facades.DB().Table("users").Where("id", 1).Get(&users) // span: SELECT users
```

Xom so'rovlar `Select` yoki `Statement` orqali bajariladi, framework tahlil qilmaydigan shaffof bo'lmagan SQL qatorini uzatadi, shuning uchun span faqat operatsiya nomi bilan ataladi. To'liq nom va `db.collection.name` atributini tiklash uchun so'rov kontekstiga jadvalni belgilash uchun `ContextWithTable` dan foydalaning:

```go
import (
    instrumentationdatabase "github.com/goravel/framework/telemetry/instrumentation/database"
)

queryCtx := instrumentationdatabase.ContextWithTable(ctx, "users")
facades.DB().WithContext(queryCtx).Select(&users, "SELECT * FROM users WHERE id = ?", 1) // span: SELECT users
```

## Kontekst tarqalishi

`propagators` konfiguratsiya opsiyasi trace kontekstining jarayon chegaralaridan qanday o'tishini belgilaydi. Standart W3C `tracecontext` standartidir; `baggage`, `b3` va `b3multi` (Zipkin) ham qo'llab-quvvatlanadi va ular vergul bilan ajratilgan ro'yxat sifatida birlashtirilishi mumkin.

O'rnatilgan HTTP va gRPC instrumentatsiyasi kontekstni avtomatik tarqatadi. Agar siz maxsus transport (masalan, xabarlar navbati) orqali aloqa qilsangiz, `Propagator` metodidan foydalanib, tracening o'zingizni chegaradan o'tkazishingiz mumkin: ishlab chiqaruvchi faol kontekstni xabar sarlavhalariga kiritadi, iste'molchi esa uni chiqaradi va xuddi shu traceni davom ettiradi:

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
    // Attach the active trace context to the message
    facades.Telemetry().Propagator().Inject(ctx, telemetry.PropagationMapCarrier(message.Headers))

    // Send the message to the broker...

    return nil
}

func (r *OrderConsumer) Consume(message *Message) error {
    // Continue the trace started by the producer
    ctx := facades.Telemetry().Propagator().Extract(context.Background(), telemetry.PropagationMapCarrier(message.Headers))

    ctx, span := facades.Telemetry().Tracer("app").Start(ctx, "orders.consume",
        telemetry.WithSpanKind(telemetry.SpanKindConsumer),
    )
    defer span.End()

    return r.process(ctx, message)
}
```

Agar joriy iz identifikatorlari kerak bo'lsa, masalan, ularni xato javobida qaytarish uchun, ularni kontekstdan o'qishingiz mumkin:

```go
import "go.opentelemetry.io/otel/trace"

spanCtx := trace.SpanContextFromContext(ctx)

traceID := spanCtx.TraceID().String()
spanID := spanCtx.SpanID().String()
```

## Tozalash va o'chirish

Telemetriya hayotiy siklini o'zingiz boshqarishingiz shart emas: ilova to'xtaganda, Goravel avtomatik ravishda barcha buferlangan ma'lumotlarni tozalaydi va provayderlarni o'chiradi, eng ko'pi bilan `shutdown_timeout` (odatda `15s`) kutadi.

Agar provayderlarni to'xtatmasdan buferlangan ma'lumotlarni darhol surish kerak bo'lsa, masalan, serverless funksiya muzlashidan oldin, `ForceFlush` metodidan foydalanishingiz mumkin:

```go
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

if err := facades.Telemetry().ForceFlush(ctx); err != nil {
    facades.Log().Error(err)
}
```
