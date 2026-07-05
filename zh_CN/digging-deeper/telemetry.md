# 遥测

[[toc]]

## 简介

Goravel 提供了一个基于 [OpenTelemetry](https://opentelemetry.io) 的可观测性模块，可以使用 `facades.Telemetry()` 进行操作。 它允许您从应用程序中收集追踪、指标和日志，并将其导出到任何兼容 OTLP 的后端，例如 Jaeger、Prometheus、Grafana 或 Datadog。

该模块与应用程序生命周期集成：提供者在单个配置文件中配置，缓冲数据在应用程序关闭时自动刷新，并且内置了适用于 HTTP 服务器、HTTP 客户端、gRPC 和日志器的检测功能。

如果您刚开始接触 OpenTelemetry，该模块围绕三个信号：

- **追踪**记录请求在服务间传输的完整路径。 每个追踪是一个跨度树，跨度代表一个计时的操作，例如 HTTP 请求、数据库查询或函数调用。
- **指标**是随时间聚合的数值测量，例如请求计数、持续时间或内存使用量。
- **日志**是带有时间戳的事件记录，可以链接到产生它们的追踪。

## 安装

遥测模块是可选的，你可以使用 `package:install` 命令安装它：

```shell
./artisan package:install Telemetry
```

此命令执行以下操作：

- 创建 `config/telemetry.go` 配置文件；
- 创建 `facades/telemetry.go` 门面文件；
- 在 `bootstrap/providers.go` 中注册 `&telemetry.ServiceProvider{}`；
- 向 `config/logging.go` 添加 `otel` 通道用于日志导出。

## 配置

所有配置选项都在 `config/telemetry.go` 文件中。 `service` 部分定义了附加到每个追踪、度量和日志记录的标识，这是可观测性平台用来对数据进行分组的方式：

```go
"service": map[string]any{
    "name":        config.Env("APP_NAME", "goravel"),
    "version":     config.Env("APP_VERSION", ""),
    "environment": config.Env("APP_ENV", ""),
},
```

你可以使用 `resource` 部分将额外的静态元数据（例如 `k8s.pod.name`、`region`、`team`）附加到所有遥测数据。

### 启用信号

每个信号（追踪、度量和日志）默认是禁用的。 要启用信号，将其 `exporter` 选项指向 `exporters` 部分中的一个导出器定义。 最简单的方法是通过你的 `.env` 文件：

```ini
OTEL_TRACES_EXPORTER=otlptrace
OTEL_METRICS_EXPORTER=otlpmetric
OTEL_LOGS_EXPORTER=otlplog
```

将导出器设置为空字符串将完全禁用相应的信号。

:::tip
在本地开发期间，您可以将其中任何一个设置为 `console`，以便直接将遥测数据打印到 stdout，而不是发送到后端。
:::

### 导出器

`exporters` 部分定义了数据如何离开您的应用程序。 每个条目通过名称从信号部分引用，支持三种驱动程序：`otlp`、`console` 和 `custom`。

#### OTLP

`otlp` 驱动程序使用 `http/protobuf`（端口 4318）或 `grpc`（端口 4317）将数据发送到任何 OpenTelemetry 收集器或供应商端点：

```go
"otlptrace": map[string]any{
    "driver":   "otlp",
    "endpoint": config.Env("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT", "localhost:4318"),

    // 协议："http/protobuf" 或 "grpc"。
    "protocol": config.Env("OTEL_EXPORTER_OTLP_TRACES_PROTOCOL", "http/protobuf"),

    // 设置为 false 以要求 TLS/SSL。
    "insecure": config.Env("OTEL_EXPORTER_OTLP_TRACES_INSECURE", true),

    // 压缩："gzip" 或 ""（无）。
    "compression": config.Env("OTEL_EXPORTER_OTLP_TRACES_COMPRESSION", ""),

    // TLS 证书文件路径。留空以使用系统根证书。
    "tls": map[string]any{
        "ca":   config.Env("OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE", ""),
        "cert": config.Env("OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE", ""),
        "key":  config.Env("OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY", ""),
    },

    // 导出失败时以指数退避重试。
    "retry": map[string]any{
        "enabled":          true,
        "initial_interval": "5s",
        "max_interval":     "30s",
        "max_elapsed_time": "1m",
    },
},
```

`endpoint` 选项可以接受裸 `host:port` 对或完整 URL。 当提供带有协议的 URL 时（例如 `https://otlp.example.com/v1/traces`），方案和路径决定 TLS 设置和导出路径，`insecure` 选项将被忽略。

如果您的后端需要身份验证，例如供应商 API 密钥，您可以使用 `headers` 选项将标头附加到每个导出请求：

```go
"otlptrace": map[string]any{
    "driver":   "otlp",
    "endpoint": config.Env("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT", "localhost:4318"),
    "headers": map[string]string{
        "x-api-key": config.Env("OTEL_EXPORTER_API_KEY", ""),
    },
},
```

指标导出器还支持 `metric_temporality` 选项：`cumulative`（Prometheus）、`delta`（Datadog/StatsD）或 `lowmemory`。

:::tip
要在本地查看追踪信息，您可以使用一条命令运行 Jaeger，它接受默认端口上的 OTLP 且无需额外配置：

```shell
docker run --rm -p 16686:16686 -p 4317:4317 -p 4318:4318 jaegertracing/jaeger:latest
```

然后设置 `OTEL_TRACES_EXPORTER=otlptrace` 并打开 `http://localhost:16686`。
:::

#### 控制台

`console` 驱动程序将遥测数据打印到 stdout，这对于在本地调试您的检测很有用：

```go
"console": map[string]any{
    "driver":       "console",
    "pretty_print": true,
},
```

#### Custom

如果您需要将数据导出到默认不支持的存储目标，您可以使用 `custom` 驱动程序提供自己的导出程序。 `via` 键接受一个现成的实例或工厂函数，具体取决于导出程序用于哪个信号：

| 信号 | 实例                      | 工厂                                                     |
| -- | ----------------------- | ------------------------------------------------------ |
| 追踪 | `sdktrace.SpanExporter` | `func(context.Context) (sdktrace.SpanExporter, error)` |
| 指标 | `sdkmetric.Reader`      | `func(context.Context) (sdkmetric.Reader, error)`      |
| 日志 | `sdklog.Exporter`       | `func(context.Context) (sdklog.Exporter, error)`       |

例如，将 spans 写入文件而非 stdout：

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

### 采样

记录每个跟踪在高流量应用中可能代价高昂。 The `traces.sampler` section controls which traces are recorded:

```go
"sampler": map[string]any{
    // 如果为 true，则尊重上游服务的采样决策。
    "parent": config.Env("OTEL_TRACES_SAMPLER_PARENT", true),

    // "always_on"、"always_off" 或 "traceidratio"
    "type": config.Env("OTEL_TRACES_SAMPLER_TYPE", "always_on"),

    // "traceidratio" 采样的比率，例如 0.1 记录约 10% 的追踪。
    "ratio": config.Env("OTEL_TRACES_SAMPLER_RATIO", 0.05),
},
```

当 `parent` 启用时，你的服务会遵循调用服务已作出的采样决策，确保分布式追踪不会在中间中断。

### 处理器

追踪和日志通过处理器传递给其导出器。 默认的 `batch` 处理器会缓冲数据并按时间间隔推送，这是推荐的生产环境设置。 `simple` 处理器同步导出每条记录，仅应用于调试：

```go
"processor": map[string]any{
    "type":     config.Env("OTEL_TRACE_PROCESSOR_TYPE", "batch"),
    "interval": config.Env("OTEL_TRACE_EXPORT_INTERVAL", "5s"),
    "timeout":  config.Env("OTEL_TRACE_EXPORT_TIMEOUT", "30s"),
},
```

指标使用周期性读取器，由 `metrics.reader.interval` 配置（默认 `60s`）。

## 跟踪

### 创建跨度

要创建跨度，从 `Telemetry` 外观使用 `Tracer` 方法请求一个跟踪器，然后调用 `Start`。 第一个参数是一个 `context.Context`，如果上下文已经包含一个跨度（例如由 HTTP 中间件启动的），则新跨度自动作为其子跨度附加。

`Tracer` 参数（上面的 `"app"`）是 **检测范围名称**：它标识产生跨度的代码。 使用指向检测代码的稳定名称，按照惯例是包导入路径（例如 `github.com/you/app/services`），或者对于应用程序代码，使用应用程序或模块名称。 它在每个 span 上记录为 `otel.scope.name`，因此您的后端可以按发出它们的组件对 span 进行分组和过滤。 框架内置的 instrumentation 使用自己的 scope（例如 `github.com/goravel/framework/telemetry/instrumentation/http`），这使您的 span 与框架的 span 保持区分。

以下服务跟踪订单的处理步骤：`Process` 方法打开一个 span，记录其上发生的事件，并将返回的 context 向下传递，使得 `chargePayment` 成为同一 trace 中的子 span：

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
    // 此 span 自动成为 "order.process" 的子 span。
    _, span := facades.Telemetry().Tracer("app").Start(ctx, "order.charge_payment")
    defer span.End()

    // 处理支付...

    return nil
}
```

当从控制器调用服务时，传递 `ctx`。 如果注册了 [HTTP 服务器中间件](#http-server)，跨度将附加到请求的追踪中，因此您的后端会显示完整视图：HTTP 请求、订单处理和支付费用作为一棵树：

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

传递给 `Tracer`（以及 `Meter`）的名称标识了检测范围，通常是您的应用程序或包名，并且会与每个跨度一起显示在您的后端中。

### 跨度属性

您可以使用 `SetAttributes` 方法将键值属性附加到跨度。 `telemetry` 包重新导出了 OpenTelemetry 属性的辅助函数，因此您无需导入额外的包：

```go
import "github.com/goravel/framework/telemetry"

span.SetAttributes(
    telemetry.String("订单ID", "1234"),
    telemetry.Int("订单项", 3),
    telemetry.Bool("订单礼物", false),
)
```

也可以使用 `WithAttributes` 选项在创建时设置属性：

```go
ctx, span := tracer.Start(ctx, "处理订单", telemetry.WithAttributes(
    telemetry.String("订单ID", "1234"),
))
```

### Span 事件

事件标记跨度内的时间点，例如缓存未命中或重试尝试。 您可以使用 `AddEvent` 方法添加它们：

```go
span.AddEvent("缓存未命中", telemetry.WithAttributes(
    telemetry.String("缓存键", "user:42"),
))
```

### 记录错误

当操作失败时，两个调用协同工作：`RecordError` 将错误作为事件附加到跨度上，`SetStatus` 将整个跨度标记为失败，以便在后端进行过滤。 单独调用 `RecordError` 不会更改跨度状态：

```go
if err != nil {
    span.RecordError(err)
    span.SetStatus(telemetry.CodeError, "failed to process order")

    return err
}
```

### 跨度种类

默认情况下，跨度以 `internal` 类型创建。 当跨度表示边界，例如将消息发布到队列或消费消息时，您可以使用 `WithSpanKind` 选项声明其角色：

```go
ctx, span := tracer.Start(ctx, "orders.publish", telemetry.WithSpanKind(telemetry.SpanKindProducer))
```

可用的类型：`SpanKindInternal`、`SpanKindServer`、`SpanKindClient`、`SpanKindProducer`、`SpanKindConsumer`。

### 当前跨度

您并不总是需要创建新的跨度，通常您只想丰富已激活的跨度，例如 [HTTP 服务器中间件](#http-服务器) 启动的跨度。 您可以使用 `SpanFromContext` 函数从上下文中检索它：

```go
import "go.opentelemetry.io/otel/trace"

func (r *OrderController) Store(ctx http.Context) http.Response {
    span := trace.SpanFromContext(ctx)
    span.SetAttributes(telemetry.String("order.id", "1234"))

    // ...
}
```

如果上下文中没有活动 span，则返回一个无操作 span，因此始终可以安全调用。

## 指标

要记录指标，请使用 `Meter` 方法从 `Telemetry` 外观请求一个 meter，然后从中创建仪器。 仪器可安全并发使用，应创建一次并重复使用，常见模式是在服务构造时创建它们，并在其方法中记录值。

与 `Tracer` 类似，`Meter` 参数是 **instrumentation scope name**，用于标识产生指标的代码（请参阅[创建 Spans](#创建-spans)）。 它在导出的指标中记录为 `otel.scope.name`。

以下服务使用**计数器**（仅增加的值，适合计算已处理的付款或已发送的电子邮件）和**直方图**（值的分布，例如持续时间或负载大小）：

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
        metric.WithDescription("已处理支付数量"),
    )
    if err != nil {
        return nil, err
    }

    duration, err := meter.Float64Histogram("payments.duration",
        metric.WithUnit("s"),
        metric.WithDescription("支付处理持续时间"),
    )
    if err != nil {
        return nil, err
    }

    return &PaymentService{processed: processed, duration: duration}, nil
}

func (r *PaymentService) Charge(ctx context.Context, method string) error {
    start := time.Now()

    // 处理支付...

    r.processed.Add(ctx, 1, metric.WithAttributes(
        telemetry.String("payment.method", method),
    ))
    r.duration.Record(ctx, time.Since(start).Seconds())

    return nil
}
```

**上下计数器** 也可以递减，用于跟踪运行中的值：

```go
inFlight, err := meter.Int64UpDownCounter("jobs.in_flight")

inFlight.Add(ctx, 1)
defer inFlight.Add(ctx, -1)
```

**可观测计量器**报告的是采样而非记录的值，例如队列深度或打开的连接数。 无需自行调用，而是注册一个在每个采集周期中被调用的回调：

```go
_, err := meter.Int64ObservableGauge("queue.depth",
    metric.WithInt64Callback(func(ctx context.Context, observer metric.Int64Observer) error {
        observer.Observe(int64(queue.Len()))

        return nil
    }),
)
```

指标将根据 `metrics.reader.interval` 配置定期采集并推送到导出器。

## 日志

在安装过程中，会向 `config/logging.go` 文件添加一个 `otel` 通道：

```go
"otel": map[string]any{
    "driver":          "otel",
    "instrument_name": config.GetString("APP_NAME", "goravel/log"),
},
```

将该通道添加到您的日志堆栈中，通过 `facades.Log()` 写入的每条记录也将作为 OpenTelemetry 日志记录导出，其级别、结构化字段和堆栈跟踪会自动映射：

```go
"stack": map[string]any{
    "driver":   "stack",
    "channels": []string{"daily", "otel"},
},
```

为了将日志与活动跟踪关联起来，请使用 `WithContext` 编写日志，跟踪和跨度 ID 会附加到记录中，以便您的后端可以将日志链接到产生它们的精确请求：

```go
func (r *OrderController) Store(ctx http.Context) http.Response {
    facades.Log().WithContext(ctx).
        With(map[string]any{
            "order_id": ctx.Request().Input("order_id"),
        }).
        Info("收到订单")

    // ...
}
```

您还可以通过将 `telemetry.instrumentation.log.enabled` 设置为 `false` 来临时停止导出日志，而无需修改日志配置。 如果您需要完全控制发出的记录，可以绕过日志门面，直接使用 `facades.Telemetry().Logger("app")` 发出 OpenTelemetry 日志记录。

## 自动检测

Goravel 为最常见的组件提供了内置检测。 每个都可以在 `config/telemetry.go` 的 `instrumentation` 部分中切换。

### HTTP 服务器

HTTP 服务器中间件提取传入的跟踪上下文，为每个请求启动一个服务器跨度，并记录标准度量（`http.server.request.duration`、`http.server.request.body.size`、`http.server.response.body.size`）。 在 `bootstrap/app.go` 文件中注册它：

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

您可以使用 `excluded_paths` 和 `excluded_methods` 配置选项跳过嘈杂的端点：

```go
"http_server": map[string]any{
    "enabled":          config.Env("OTEL_HTTP_SERVER_ENABLED", true),
    "excluded_paths":   []string{"/health"},
    "excluded_methods": []string{"OPTIONS"},
},
```

为了更高级的控制，中间件接受选项：`WithFilter` 以编程方式跳过请求，`WithSpanNameFormatter` 自定义跨度名称，以及 `WithMetricAttributes` 为记录的指标附加额外属性。

```go
handler.Append(telemetryhttp.Telemetry(
    telemetryhttp.WithFilter(func(ctx http.Context) bool {
        return ctx.Request().Path() != "/internal"
    }),
))
```

### HTTP 客户端

通过 [HTTP 客户端](./http-client.md) 发出的请求会自动进行检测，无需额外设置。 活跃的追踪上下文被注入到传出头中，因此下游的 Goravel 服务继续同一追踪。

您可以通过 `telemetry.instrumentation.http_client.enabled` 全局禁用它，或者通过在 `config/http.go` 中的相应客户端配置中将 `enable_telemetry` 设置为 `false` 来按客户端禁用。

### gRPC

gRPC 仪表化通过 stats handlers 提供。 在 `bootstrap/app.go` 文件中使用 `WithGrpcServerStatsHandlers` 和 `WithGrpcClientStatsHandlers` 函数注册它们：

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

两个处理器都接受诸如 `WithFilter`、`WithSpanAttributes` 和 `WithMetricAttributes` 之类的选项，并可以通过 `grpc_server.enabled` 和 `grpc_client.enabled` 配置选项进行切换。

### 数据库

通过 [ORM](../orm/getting-started.md)（`facades.Orm()`）和 [查询构建器](../database/queries.md)（`facades.DB()`）执行的查询会自动进行检测，无需任何设置。 每个查询记录一个客户端 span 以及 `db.client.operation.duration` 指标，每个连接池报告 `db.client.connection.count` 和 `db.client.connection.max`，因此您可以监控池的使用情况和饱和度。

您可以通过 `telemetry.instrumentation.database.enabled` 配置选项（`OTEL_DATABASE_ENABLED` 环境变量）禁用它。

对于结构化查询，表来自构建器，因此 span 以操作和表命名，并携带 `db.collection.name` 属性。 无需额外操作：

```go
facades.DB().Table("users").Where("id", 1).Get(&users) // span: SELECT users
```

通过 `Select` 或 `Statement` 运行的原始查询传递一个不透明的 SQL 字符串，框架不会解析它，因此 span 仅以操作命名。 使用 `ContextWithTable` 将表标记到请求上下文中，以恢复完整名称和 `db.collection.name` 属性：

```go
import (
    instrumentationdatabase "github.com/goravel/framework/telemetry/instrumentation/database"
)

queryCtx := instrumentationdatabase.ContextWithTable(ctx, "users")
facades.DB().WithContext(queryCtx).Select(&users, "SELECT * FROM users WHERE id = ?", 1) // 跨度：SELECT users
```

## 上下文传播

`propagators` 配置选项定义了跟踪上下文如何跨越进程边界。 默认是 W3C `tracecontext` 标准；也支持 `baggage`、`b3` 和 `b3multi`（Zipkin），并且可以组合为逗号分隔的列表。

内置的 HTTP 和 gRPC 检测会自动传播上下文。 如果您通过自定义传输（例如消息队列）进行通信，您可以使用 `Propagator` 方法自行跨越边界传递跟踪：生产者将活动上下文注入消息头，消费者提取它并继续相同的跟踪：

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
    // 将活跃追踪上下文附加到消息
    facades.Telemetry().Propagator().Inject(ctx, telemetry.PropagationMapCarrier(message.Headers))

    // 发送消息到代理...

    return nil
}

func (r *OrderConsumer) Consume(message *Message) error {
    // 继续由生产者开始的追踪
    ctx := facades.Telemetry().Propagator().Extract(context.Background(), telemetry.PropagationMapCarrier(message.Headers))

    ctx, span := facades.Telemetry().Tracer("app").Start(ctx, "orders.consume",
        telemetry.WithSpanKind(telemetry.SpanKindConsumer),
    )
    defer span.End()

    return r.process(ctx, message)
}
```

如果你需要当前追踪的标识符，例如在错误响应中返回它们，你可以从上下文中读取：

```go
import "go.opentelemetry.io/otel/trace"

spanCtx := trace.SpanContextFromContext(ctx)

traceID := spanCtx.TraceID().String()
spanID := spanCtx.SpanID().String()
```

## 刷新与关闭

你无需自行管理遥测生命周期：当应用停止时，Goravel 会自动刷新所有缓冲数据并关闭提供者，最多等待 `shutdown_timeout`（默认 `15s`）。

如果您需要在不停止提供者的情况下立即推送缓冲的数据，例如在无服务器函数冻结之前，您可以使用 `ForceFlush` 方法：

```go
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

if err := facades.Telemetry().ForceFlush(ctx); err != nil {
    facades.Log().Error(err)
}
```
