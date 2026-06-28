# Telemetry

[[toc]]

## Introduction

Goravel provides an observability module built on top of [OpenTelemetry](https://opentelemetry.io) that can be operated using `facades.Telemetry()`. It allows you to collect traces, metrics, and logs from your application and export them to any OTLP-compatible backend, such as Jaeger, Prometheus, Grafana, or Datadog.

The module is integrated with the application lifecycle: providers are configured in a single configuration file, buffered data is flushed automatically when the application shuts down, and built-in instrumentation is available for the HTTP server, the HTTP client, gRPC, and the logger.

If you are new to OpenTelemetry, the module revolves around three signals:

- **Traces** record the full path of a request as it travels through your services. Each trace is a tree of spans, where a span represents a single timed operation, such as an HTTP request, a database query, or a function call.
- **Metrics** are numerical measurements aggregated over time, such as request counts, durations, or memory usage.
- **Logs** are timestamped records of events, which can be linked to the trace that produced them.

## Installation

The telemetry module is optional, you can install it using the `package:install` command:

```shell
./artisan package:install Telemetry
```

This command performs the following actions:

- Creates the `config/telemetry.go` configuration file;
- Creates the `facades/telemetry.go` facade file;
- Registers `&telemetry.ServiceProvider{}` in `bootstrap/providers.go`;
- Adds an `otel` channel to `config/logging.go` for log export.

## Configuration

All of the configuration options live in the `config/telemetry.go` file. The `service` section defines the identity attached to every trace, metric, and log record, this is what observability platforms use to group your data:

```go
"service": map[string]any{
    "name":        config.Env("APP_NAME", "goravel"),
    "version":     config.Env("APP_VERSION", ""),
    "environment": config.Env("APP_ENV", ""),
},
```

You can attach additional static metadata (e.g., `k8s.pod.name`, `region`, `team`) to all telemetry data using the `resource` section.

### Enabling Signals

Each signal (traces, metrics, and logs) is disabled by default. To enable a signal, point its `exporter` option to one of the exporter definitions in the `exporters` section. The easiest way is through your `.env` file:

```ini
OTEL_TRACES_EXPORTER=otlptrace
OTEL_METRICS_EXPORTER=otlpmetric
OTEL_LOGS_EXPORTER=otlplog
```

Setting an exporter to an empty string disables the corresponding signal entirely.

::: tip
During local development, you can set any of these to `console` to print telemetry data directly to stdout instead of sending it to a backend.
:::

### Exporters

The `exporters` section defines how the data leaves your application. Each entry is referenced by name from the signal sections, three drivers are supported: `otlp`, `console`, and `custom`.

#### OTLP

The `otlp` driver sends data to any OpenTelemetry collector or vendor endpoint, using either `http/protobuf` (port 4318) or `grpc` (port 4317):

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

The `endpoint` option accepts either a bare `host:port` pair or a full URL. When a URL with a scheme is provided (e.g., `https://otlp.example.com/v1/traces`), the scheme and path determine the TLS setting and export path, and the `insecure` option is ignored.

If your backend requires authentication, such as a vendor API key, you may attach headers to every export request using the `headers` option:

```go
"otlptrace": map[string]any{
    "driver":   "otlp",
    "endpoint": config.Env("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT", "localhost:4318"),
    "headers": map[string]string{
        "x-api-key": config.Env("OTEL_EXPORTER_API_KEY", ""),
    },
},
```

The metric exporter additionally supports the `metric_temporality` option: `cumulative` (Prometheus), `delta` (Datadog/StatsD), or `lowmemory`.

::: tip
To see your traces locally, you can run Jaeger with a single command, it accepts OTLP on the default ports and requires no extra configuration:

```shell
docker run --rm -p 16686:16686 -p 4317:4317 -p 4318:4318 jaegertracing/jaeger:latest
```

Then set `OTEL_TRACES_EXPORTER=otlptrace` and open `http://localhost:16686`.
:::

#### Console

The `console` driver prints telemetry data to stdout, which is useful for debugging your instrumentation locally:

```go
"console": map[string]any{
    "driver":       "console",
    "pretty_print": true,
},
```

#### Custom

If you need to export data to a destination that is not supported out of the box, you may provide your own exporter using the `custom` driver. The `via` key accepts either a ready-made instance or a factory function, depending on the signal the exporter is used for:

| Signal  | Instance                | Factory                                              |
| ------- | ----------------------- | ---------------------------------------------------- |
| Traces  | `sdktrace.SpanExporter` | `func(context.Context) (sdktrace.SpanExporter, error)` |
| Metrics | `sdkmetric.Reader`      | `func(context.Context) (sdkmetric.Reader, error)`    |
| Logs    | `sdklog.Exporter`       | `func(context.Context) (sdklog.Exporter, error)`     |

For example, to write spans to a file instead of stdout:

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

### Sampling

Recording every trace can be expensive in high-traffic applications. The `traces.sampler` section controls which traces are recorded:

```go
"sampler": map[string]any{
    // If true, respects the sampling decision of the upstream service.
    "parent": config.Env("OTEL_TRACES_SAMPLER_PARENT", true),

    // "always_on", "always_off" or "traceidratio"
    "type": config.Env("OTEL_TRACES_SAMPLER_TYPE", "always_on"),

    // The ratio for "traceidratio" sampling, e.g., 0.1 records ~10% of traces.
    "ratio": config.Env("OTEL_TRACES_SAMPLER_RATIO", 0.05),
},
```

When `parent` is enabled, your service follows the sampling decision already made by the calling service, ensuring distributed traces are never broken in the middle.

### Processors

Traces and logs are handed to their exporters through a processor. The default `batch` processor buffers data and pushes it on an interval, which is the recommended setting for production. The `simple` processor exports each record synchronously and should only be used for debugging:

```go
"processor": map[string]any{
    "type":     config.Env("OTEL_TRACE_PROCESSOR_TYPE", "batch"),
    "interval": config.Env("OTEL_TRACE_EXPORT_INTERVAL", "5s"),
    "timeout":  config.Env("OTEL_TRACE_EXPORT_TIMEOUT", "30s"),
},
```

Metrics use a periodic reader instead, configured by `metrics.reader.interval` (default `60s`).

## Tracing

### Creating Spans

To create a span, request a tracer from the `Telemetry` facade using the `Tracer` method, then call `Start`. The first argument is a `context.Context`, if the context already contains a span (for example, one started by the HTTP middleware), the new span is automatically attached as its child.

The `Tracer` argument (`"app"` above) is the **instrumentation scope name**: it identifies the code that produced the span. Use a stable name that points back to the instrumenting code, by convention the package import path (for example `github.com/you/app/services`) or, for application code, the application or module name. It is recorded on every span as `otel.scope.name`, so your backend can group and filter spans by the component that emitted them. The framework's built-in instrumentation uses its own scope (for example `github.com/goravel/framework/telemetry/instrumentation/http`), which keeps your spans distinct from the framework's.

The following service traces an order through its processing steps: the `Process` method opens a span, records what happened on it, and passes the returned context down so that `chargePayment` becomes a child span within the same trace:

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
    // This span automatically becomes a child of "order.process".
    _, span := facades.Telemetry().Tracer("app").Start(ctx, "order.charge_payment")
    defer span.End()

    // Charge the payment...

    return nil
}
```

When the service is called from a controller, pass `ctx.Context()`. If the [HTTP server middleware](#http-server) is registered, the spans are attached to the request's trace, so your backend shows the full picture: the HTTP request, the order processing, and the payment charge as one tree:

```go
// app/http/controllers/order_controller.go
func (r *OrderController) Store(ctx http.Context) http.Response {
    if err := r.orders.Process(ctx.Context(), ctx.Request().Input("order_id")); err != nil {
        return ctx.Response().Status(http.StatusInternalServerError).Json(http.Json{
            "error": "failed to process order",
        })
    }

    return ctx.Response().Success().Json(http.Json{
        "message": "order processed",
    })
}
```

The name passed to `Tracer` (and `Meter`) identifies the instrumentation scope, typically your application or package name, and is shown alongside each span in your backend.

### Span Attributes

You can attach key-value attributes to a span using the `SetAttributes` method. The `telemetry` package re-exports the OpenTelemetry attribute helpers so you don't need to import additional packages:

```go
import "github.com/goravel/framework/telemetry"

span.SetAttributes(
    telemetry.String("order.id", "1234"),
    telemetry.Int("order.items", 3),
    telemetry.Bool("order.gift", false),
)
```

Attributes can also be set at creation time using the `WithAttributes` option:

```go
ctx, span := tracer.Start(ctx, "process-order", telemetry.WithAttributes(
    telemetry.String("order.id", "1234"),
))
```

### Span Events

Events mark a point in time within a span, such as a cache miss or a retry attempt. You can add them using the `AddEvent` method:

```go
span.AddEvent("cache_miss", telemetry.WithAttributes(
    telemetry.String("cache.key", "user:42"),
))
```

### Recording Errors

When an operation fails, two calls work together: `RecordError` attaches the error to the span as an event, and `SetStatus` marks the whole span as failed so it can be filtered in your backend. Calling `RecordError` alone does not change the span status:

```go
if err != nil {
    span.RecordError(err)
    span.SetStatus(telemetry.CodeError, "failed to process order")

    return err
}
```

### Span Kinds

By default, spans are created with the `internal` kind. When a span represents a boundary like publishing a message to a queue or consuming one, you can declare its role using the `WithSpanKind` option:

```go
ctx, span := tracer.Start(ctx, "orders.publish", telemetry.WithSpanKind(telemetry.SpanKindProducer))
```

Available kinds: `SpanKindInternal`, `SpanKindServer`, `SpanKindClient`, `SpanKindProducer`, `SpanKindConsumer`.

### The Current Span

You don't always need to create a new span, often you just want to enrich the one that is already active, such as the span started by the [HTTP server middleware](#http-server). You can retrieve it from the context using the `SpanFromContext` function:

```go
import "go.opentelemetry.io/otel/trace"

func (r *OrderController) Store(ctx http.Context) http.Response {
    span := trace.SpanFromContext(ctx.Context())
    span.SetAttributes(telemetry.String("order.id", "1234"))

    // ...
}
```

If there is no active span in the context, a no-op span is returned, so it is always safe to call.

## Metrics

To record metrics, request a meter from the `Telemetry` facade using the `Meter` method, then create instruments from it. Instruments are safe for concurrent use and should be created once and reused, a common pattern is to create them when the service is constructed and record values in its methods.

Like `Tracer`, the `Meter` argument is the **instrumentation scope name** that identifies the code producing the metrics (see [Creating Spans](#creating-spans)). It is recorded as `otel.scope.name` on the exported metrics.

The following service uses a **counter** (a value that only goes up, ideal for counting processed payments or sent emails) and a **histogram** (a distribution of values, such as durations or payload sizes):

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

    // Charge the payment...

    r.processed.Add(ctx, 1, metric.WithAttributes(
        telemetry.String("payment.method", method),
    ))
    r.duration.Record(ctx, time.Since(start).Seconds())

    return nil
}
```

An **up-down counter** can also decrease, useful for tracking in-flight values:

```go
inFlight, err := meter.Int64UpDownCounter("jobs.in_flight")

inFlight.Add(ctx, 1)
defer inFlight.Add(ctx, -1)
```

An **observable gauge** reports a value that is sampled rather than recorded, such as a queue depth or the number of open connections. Instead of calling it yourself, you register a callback that is invoked on every collection cycle:

```go
_, err := meter.Int64ObservableGauge("queue.depth",
    metric.WithInt64Callback(func(ctx context.Context, observer metric.Int64Observer) error {
        observer.Observe(int64(queue.Len()))

        return nil
    }),
)
```

Metrics are collected and pushed to the exporter periodically based on the `metrics.reader.interval` configuration.

## Logs

During installation, an `otel` channel is added to your `config/logging.go` file:

```go
"otel": map[string]any{
    "driver":          "otel",
    "instrument_name": config.GetString("APP_NAME", "goravel/log"),
},
```

Add the channel to your logging stack and every entry written through `facades.Log()` will also be exported as an OpenTelemetry log record, with levels, structured fields, and stack traces mapped automatically:

```go
"stack": map[string]any{
    "driver":   "stack",
    "channels": []string{"daily", "otel"},
},
```

To correlate logs with the active trace, write them using `WithContext`, the trace and span IDs are attached to the record so your backend can link logs to the exact request that produced them:

```go
func (r *OrderController) Store(ctx http.Context) http.Response {
    facades.Log().WithContext(ctx.Context()).
        With(map[string]any{
            "order_id": ctx.Request().Input("order_id"),
        }).
        Info("order received")

    // ...
}
```

You can also temporarily stop exporting logs without touching your logging configuration by setting `telemetry.instrumentation.log.enabled` to `false`. If you need full control over the emitted records, you may bypass the logging facade and emit OpenTelemetry log records directly using `facades.Telemetry().Logger("app")`.

## Automatic Instrumentation

Goravel ships with built-in instrumentation for the most common components. Each one can be toggled in the `instrumentation` section of `config/telemetry.go`.

### HTTP Server

The HTTP server middleware extracts the incoming trace context, starts a server span for every request, and records standard metrics (`http.server.request.duration`, `http.server.request.body.size`, `http.server.response.body.size`). Register it in the `bootstrap/app.go` file:

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

You can skip noisy endpoints using the `excluded_paths` and `excluded_methods` configuration options:

```go
"http_server": map[string]any{
    "enabled":          config.Env("OTEL_HTTP_SERVER_ENABLED", true),
    "excluded_paths":   []string{"/health"},
    "excluded_methods": []string{"OPTIONS"},
},
```

For more advanced control, the middleware accepts options: `WithFilter` to skip requests programmatically, `WithSpanNameFormatter` to customize span names, and `WithMetricAttributes` to attach extra attributes to recorded metrics.

```go
handler.Append(telemetryhttp.Telemetry(
    telemetryhttp.WithFilter(func(ctx http.Context) bool {
        return ctx.Request().Path() != "/internal"
    }),
))
```

### HTTP Client

Outgoing requests made through the [HTTP Client](./http-client.md) are instrumented automatically, no setup required. The active trace context is injected into outgoing headers, so downstream Goravel services continue the same trace.

You can disable it globally via `telemetry.instrumentation.http_client.enabled`, or per client by setting `enable_telemetry` to `false` in the corresponding client configuration in `config/http.go`.

### gRPC

gRPC instrumentation is provided through stats handlers. Register them in the `bootstrap/app.go` file using the `WithGrpcServerStatsHandlers` and `WithGrpcClientStatsHandlers` functions:

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

Both handlers accept options such as `WithFilter`, `WithSpanAttributes`, and `WithMetricAttributes`, and can be toggled via the `grpc_server.enabled` and `grpc_client.enabled` configuration options.

### Database

Queries executed through the [ORM](../orm/getting-started.md) (`facades.Orm()`) and the [Query Builder](../database/queries.md) (`facades.DB()`) are instrumented automatically, no setup required. Each query records a client span along with the `db.client.operation.duration` metric, and every connection pool reports `db.client.connection.count` and `db.client.connection.max`, so you can watch pool usage and saturation.

You can disable it via the `telemetry.instrumentation.database.enabled` configuration option (the `OTEL_DATABASE_ENABLED` environment variable).

For structured queries, the table comes from the builder, so the span is named after the operation and table and carries the `db.collection.name` attribute. Nothing extra is required:

```go
facades.DB().Table("users").Where("id", 1).Get(&users) // span: SELECT users
```

Raw queries run through `Select` or `Statement` pass an opaque SQL string that the framework does not parse, so the span is named after the operation alone. Tag the context with the table to restore the full name and the `db.collection.name` attribute:

```go
import (
    instrumentationdatabase "github.com/goravel/framework/telemetry/instrumentation/database"
)

queryCtx := instrumentationdatabase.ContextWithTable(ctx.Context(), "users")
facades.DB().WithContext(queryCtx).Select(&users, "SELECT * FROM users WHERE id = ?", 1) // span: SELECT users
```

## Context Propagation

The `propagators` configuration option defines how trace context crosses process boundaries. The default is the W3C `tracecontext` standard; `baggage`, `b3`, and `b3multi` (Zipkin) are also supported and can be combined as a comma-separated list.

The built-in HTTP and gRPC instrumentation propagate context automatically. If you communicate over a custom transport, such as a message queue, you can carry the trace across the boundary yourself using the `Propagator` method: the producer injects the active context into the message headers, and the consumer extracts it and continues the same trace:

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

If you need the identifiers of the current trace, for example, to return them in an error response, you can read them from the context:

```go
import "go.opentelemetry.io/otel/trace"

spanCtx := trace.SpanContextFromContext(ctx)

traceID := spanCtx.TraceID().String()
spanID := spanCtx.SpanID().String()
```

## Flushing & Shutdown

You don't need to manage the telemetry lifecycle yourself: when the application stops, Goravel automatically flushes all buffered data and shuts the providers down, waiting at most `shutdown_timeout` (default `15s`).

If you need to push buffered data immediately without stopping the providers, for example, before a serverless function freezes, you can use the `ForceFlush` method:

```go
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

if err := facades.Telemetry().ForceFlush(ctx); err != nil {
    facades.Log().Error(err)
}
```
