# Telemetry

[[toc]]

## 简介

Goravel 提供了基于 [OpenTelemetry](https://opentelemetry.io) 构建的可观测性模块，可通过 `facades.Telemetry()` 操作。它允许你从应用程序中收集追踪、指标和日志，并将其导出到任何兼容 OTLP 的后端，如 Jaeger、Prometheus、Grafana 或 Datadog。

该模块与应用生命周期深度集成：所有提供者在一个配置文件中统一配置，应用关闭时缓冲区数据会自动刷新，并且 HTTP 服务器、HTTP 客户端、gRPC 和日志记录器均内置了自动埋点。

如果你还不熟悉 OpenTelemetry，该模块主要围绕三种信号：

- **追踪（Traces）**记录了请求在服务之间传播的完整路径。每条追踪由一组 Span 组成的树，每个 Span 代表一个定时操作，例如 HTTP 请求、数据库查询或函数调用。
- **指标（Metrics）**是随时间聚合的数值测量，例如请求计数、持续时间或内存使用量。
- **日志（Logs）**是带有时间戳的事件记录，可以关联到产生它们的追踪。

## 安装

可观测性模块是可选的，你可以使用 `package:install` 命令安装：

```shell
./artisan package:install Telemetry
```

该命令执行以下操作：

- 创建 `config/telemetry.go` 配置文件；
- 创建 `facades/telemetry.go` 门面文件；
- 在 `bootstrap/providers.go` 中注册 `&telemetry.ServiceProvider{}`；
- 向 `config/logging.go` 中添加 `otel` 通道用于日志导出。

## 配置

所有配置选项都位于 `config/telemetry.go` 文件中。`service` 部分定义了附加到每条追踪、指标和日志记录上的身份信息，这是可观测性平台用来分组数据的关键信息：

```go
"service": map[string]any{
    "name":        config.Env("APP_NAME", "goravel"),
    "version":     config.Env("APP_VERSION", ""),
    "environment": config.Env("APP_ENV", ""),
},
```

你可以使用 `resource` 部分将额外的静态元数据（例如 `k8s.pod.name`、`region`、`team`）附加到所有遥测数据上。

### 启用信号

每种信号（追踪、指标和日志）默认处于禁用状态。要启用某个信号，需要将其 `exporter` 选项指向 `exporters` 部分中定义的某个导出器。最简单的方法是通过 `.env` 文件配置：

```ini
OTEL_TRACES_EXPORTER=otlptrace
OTEL_METRICS_EXPORTER=otlpmetric
OTEL_LOGS_EXPORTER=otlplog
```

将导出器设置为空字符串则会完全禁用对应的信号。

::: tip
在本地开发时，你可以将其中任何一个设置为 `console`，直接将遥测数据打印到标准输出，而不是发送到后端。
:::

### 导出器

`exporters` 部分定义了数据如何离开你的应用程序。每个条目由信号部分按名称引用，支持三种驱动：`otlp`、`console` 和 `custom`。

#### OTLP

`otlp` 驱动将数据发送到任何 OpenTelemetry 收集器或供应商端点，使用 `http/protobuf`（端口 4318）或 `grpc`（端口 4317）：

```go
"otlptrace": map[string]any{
    "driver":   "otlp",
    "endpoint": config.Env("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT", "localhost:4318"),

    // 协议："http/protobuf" 或 "grpc"。
    "protocol": config.Env("OTEL_EXPORTER_OTLP_TRACES_PROTOCOL", "http/protobuf"),

    // 设置为 false 以要求 TLS/SSL。
    "insecure": config.Env("OTEL_EXPORTER_OTLP_TRACES_INSECURE", true),

    // 压缩："gzip" 或 ""（无压缩）。
    "compression": config.Env("OTEL_EXPORTER_OTLP_TRACES_COMPRESSION", ""),

    // TLS 证书文件路径。留空以使用系统根证书。
    "tls": map[string]any{
        "ca":   config.Env("OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE", ""),
        "cert": config.Env("OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE", ""),
        "key":  config.Env("OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY", ""),
    },

    // 导出失败时使用指数退避重试。
    "retry": map[string]any{
        "enabled":          true,
        "initial_interval": "5s",
        "max_interval":     "30s",
        "max_elapsed_time": "1m",
    },
},
```

`endpoint` 选项接受 bare `host:port` 对或完整 URL。当提供带有 scheme 的 URL（例如 `https://otlp.example.com/v1/traces`）时，scheme 和路径将决定 TLS 设置和导出路径，此时 `insecure` 选项将被忽略。

如果你的后端需要认证，例如供应商 API 密钥，你可以使用 `headers` 选项为每个导出请求附加请求头：

```go
"otlptrace": map[string]any{
    "driver":   "otlp",
    "endpoint": config.Env("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT", "localhost:4318"),
    "headers": map[string]string{
        "x-api-key": config.Env("OTEL_EXPORTER_API_KEY", ""),
    },
},
```

指标导出器还额外支持 `metric_temporality` 选项：`cumulative`（Prometheus）、`delta`（Datadog/StatsD）或 `lowmemory`。

::: tip
要在本地查看追踪数据，你可以通过一条命令运行 Jaeger，它默认在接受 OTLP 的端口上运行，无需额外配置：

```shell
docker run --rm -p 16686:16686 -p 4317:4317 -p 4318:4318 jaegertracing/jaeger:latest
```

然后设置 `OTEL_TRACES_EXPORTER=otlptrace`，打开 `http://localhost:16686`。
:::

#### Console

`console` 驱动将遥测数据打印到标准输出，这在本地调试埋点时非常有用：

```go
"console": map[string]any{
    "driver":       "console",
    "pretty_print": true,
},
```

#### Custom

如果你需要将数据导出到框架未直接支持的目标，可以使用 `custom` 驱动提供自己的导出器。`via` 键接受一个现成的实例或一个工厂函数，具体取决于该导出器用于哪种信号：

| 信号   | 实例                    | 工厂函数                                              |
| ------ | ----------------------- | ---------------------------------------------------- |
| 追踪   | `sdktrace.SpanExporter` | `func(context.Context) (sdktrace.SpanExporter, error)` |
| 指标   | `sdkmetric.Reader`      | `func(context.Context) (sdkmetric.Reader, error)`    |
| 日志   | `sdklog.Exporter`       | `func(context.Context) (sdklog.Exporter, error)`     |

例如，将 Span 写入文件而不是标准输出：

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

在高流量应用中，记录每条追踪可能代价高昂。`traces.sampler` 部分控制哪些追踪会被记录：

```go
"sampler": map[string]any{
    // 如果为 true，则遵循上游服务的采样决策。
    "parent": config.Env("OTEL_TRACES_SAMPLER_PARENT", true),

    // "always_on"、"always_off" 或 "traceidratio"
    "type": config.Env("OTEL_TRACES_SAMPLER_TYPE", "always_on"),

    // "traceidratio" 采样的比例，例如 0.1 记录约 10% 的追踪。
    "ratio": config.Env("OTEL_TRACES_SAMPLER_RATIO", 0.05),
},
```

当 `parent` 启用时，你的服务将遵循调用方服务已经做出的采样决策，确保分布式追踪不会在中间断裂。

### 处理器

追踪和日志在传递给导出器之前会经过处理器处理。默认的 `batch` 处理器将数据缓冲并按时间间隔推送，这是推荐的生产环境设置。`simple` 处理器则同步导出每条记录，仅用于调试：

```go
"processor": map[string]any{
    "type":     config.Env("OTEL_TRACE_PROCESSOR_TYPE", "batch"),
    "interval": config.Env("OTEL_TRACE_EXPORT_INTERVAL", "5s"),
    "timeout":  config.Env("OTEL_TRACE_EXPORT_TIMEOUT", "30s"),
},
```

指标使用定期读取器代替，通过 `metrics.reader.interval` 配置（默认 `60s`）。

## 追踪

### 创建 Span

要创建一个 Span，请通过 `Telemetry` 门面的 `Tracer` 方法请求一个 Tracer，然后调用 `Start`。第一个参数是 `context.Context`，如果上下文中已包含一个 Span（例如，由 HTTP 中间件启动的 Span），新的 Span 将自动作为其子 Span 附加。

`Tracer` 的参数（如上例中的 `"app"`）是**埋点作用域名称**：它用于标识产生该 Span 的代码。请使用一个稳定的名称来指向埋点代码，按照惯例，使用包的导入路径（例如 `github.com/you/app/services`），或者对于应用代码，使用应用或模块名称。它会在每个 Span 上记录为 `otel.scope.name`，因此你的后端可以按发出 Span 的组件对其进行分组和过滤。框架内置的埋点使用自己的作用域（例如 `github.com/goravel/framework/telemetry/instrumentation/http`），这样可以将你的 Span 与框架的 Span 区分开。

以下服务追踪一个订单的处理步骤：`Process` 方法打开一个 Span，记录发生的事件，并将返回的上下文向下传递，使 `chargePayment` 成为同一追踪中的子 Span：

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
    // 此 Span 自动成为 "order.process" 的子 Span。
    _, span := facades.Telemetry().Tracer("app").Start(ctx, "order.charge_payment")
    defer span.End()

    // 执行扣款...

    return nil
}
```

当服务从控制器调用时，传入 `ctx`。如果 [HTTP 服务器中间件](#http-服务器)已注册，这些 Span 将附加到请求的追踪中，因此你的后端可以展示完整视图：HTTP 请求、订单处理和支付扣款作为一个完整的调用树：

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

传递给 `Tracer`（和 `Meter`）的名称用于标识埋点作用域，通常是你的应用或包名称，并会在后端的每个 Span 旁边显示。

### Span 属性

你可以使用 `SetAttributes` 方法为 Span 附加键值属性。`telemetry` 包重新导出了 OpenTelemetry 属性辅助函数，因此你无需导入额外的包：

```go
import "github.com/goravel/framework/telemetry"

span.SetAttributes(
    telemetry.String("order.id", "1234"),
    telemetry.Int("order.items", 3),
    telemetry.Bool("order.gift", false),
)
```

属性也可以在创建时使用 `WithAttributes` 选项设置：

```go
ctx, span := tracer.Start(ctx, "process-order", telemetry.WithAttributes(
    telemetry.String("order.id", "1234"),
))
```

### Span 事件

事件标记 Span 内的某个时间点，例如缓存未命中或重试尝试。你可以使用 `AddEvent` 方法添加事件：

```go
span.AddEvent("cache_miss", telemetry.WithAttributes(
    telemetry.String("cache.key", "user:42"),
))
```

### 记录错误

当操作失败时，需要配合使用两个调用：`RecordError` 将错误作为事件附加到 Span 上，`SetStatus` 将整个 Span 标记为失败，以便在后端中进行过滤。单独调用 `RecordError` 不会更改 Span 状态：

```go
if err != nil {
    span.RecordError(err)
    span.SetStatus(telemetry.CodeError, "failed to process order")

    return err
}
```

### Span 类型

默认情况下，Span 以 `internal` 类型创建。当 Span 表示一个边界操作时，例如向队列发布消息或消费消息，你可以使用 `WithSpanKind` 选项声明其角色：

```go
ctx, span := tracer.Start(ctx, "orders.publish", telemetry.WithSpanKind(telemetry.SpanKindProducer))
```

可用的类型：`SpanKindInternal`、`SpanKindServer`、`SpanKindClient`、`SpanKindProducer`、`SpanKindConsumer`。

### 当前 Span

你并不总是需要创建新的 Span，通常你只是想丰富当前已处于活跃状态的 Span，例如由 [HTTP 服务器中间件](#http-服务器)启动的 Span。你可以使用 `SpanFromContext` 函数从上下文中获取它：

```go
import "go.opentelemetry.io/otel/trace"

func (r *OrderController) Store(ctx http.Context) http.Response {
    span := trace.SpanFromContext(ctx)
    span.SetAttributes(telemetry.String("order.id", "1234"))

    // ...
}
```

如果上下文中没有活跃的 Span，会返回一个无操作的 Span，因此调用始终是安全的。

## 指标

要记录指标，请通过 `Telemetry` 门面的 `Meter` 方法请求一个 Meter，然后从中创建仪器。仪器是并发安全的，应该创建一次并重复使用，通常的模式是在构造服务时创建它们，并在其方法中记录值。

与 `Tracer` 类似，`Meter` 的参数是**埋点作用域名称**，用于标识产生指标的代码（参见[创建 Span](#创建-span)）。它会在导出的指标上记录为 `otel.scope.name`。

以下服务使用**计数器**（一个只增不减的值，适用于统计已处理的支付或已发送的邮件）和**直方图**（一个值的分布，例如持续时间或有效载荷大小）：

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

    // 执行支付扣款...

    r.processed.Add(ctx, 1, metric.WithAttributes(
        telemetry.String("payment.method", method),
    ))
    r.duration.Record(ctx, time.Since(start).Seconds())

    return nil
}
```

**上下计数器**可以增也可以减，适用于跟踪正在处理的值：

```go
inFlight, err := meter.Int64UpDownCounter("jobs.in_flight")

inFlight.Add(ctx, 1)
defer inFlight.Add(ctx, -1)
```

**可观测量表**报告的是采样值而非记录值，例如队列深度或打开的连接数。你无需亲自调用它，而是注册一个回调函数，该回调在每个收集周期被调用：

```go
_, err := meter.Int64ObservableGauge("queue.depth",
    metric.WithInt64Callback(func(ctx context.Context, observer metric.Int64Observer) error {
        observer.Observe(int64(queue.Len()))

        return nil
    }),
)
```

指标根据 `metrics.reader.interval` 配置定期收集并推送至导出器。

## 日志

安装过程中，`config/logging.go` 文件中会添加一个 `otel` 通道：

```go
"otel": map[string]any{
    "driver":          "otel",
    "instrument_name": config.GetString("APP_NAME", "goravel/log"),
},
```

将该通道添加到你的日志栈中，所有通过 `facades.Log()` 写入的日志条目也将作为 OpenTelemetry 日志记录导出，级别、结构化字段和堆栈跟踪会自动映射：

```go
"stack": map[string]any{
    "driver":   "stack",
    "channels": []string{"daily", "otel"},
},
```

要将日志与活跃的追踪关联起来，使用 `WithContext` 写入日志，追踪和 Span ID 将附加到记录中，这样后端就能将日志链接到产生它们的精确请求：

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

你也可以通过将 `telemetry.instrumentation.log.enabled` 设置为 `false`，在不修改日志配置的情况下临时停止导出日志。如果你需要对发出的记录进行完全控制，可以绕过日志门面，直接使用 `facades.Telemetry().Logger("app")` 发出 OpenTelemetry 日志记录。

## 自动埋点

Goravel 为最常见的组件内置了埋点。每个组件都可以在 `config/telemetry.go` 的 `instrumentation` 部分中单独开关。

### HTTP 服务器

HTTP 服务器中间件提取传入的追踪上下文，为每个请求创建一个服务器 Span，并记录标准指标（`http.server.request.duration`、`http.server.request.body.size`、`http.server.response.body.size`）。在 `bootstrap/app.go` 文件中注册它：

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

你可以使用 `excluded_paths` 和 `excluded_methods` 配置选项跳过无需监控的端点：

```go
"http_server": map[string]any{
    "enabled":          config.Env("OTEL_HTTP_SERVER_ENABLED", true),
    "excluded_paths":   []string{"/health"},
    "excluded_methods": []string{"OPTIONS"},
},
```

如需更高级的控制，中间件接受以下选项：`WithFilter` 用于编程方式跳过请求，`WithSpanNameFormatter` 用于自定义 Span 名称，`WithMetricAttributes` 用于为记录的指标附加额外属性。

```go
handler.Append(telemetryhttp.Telemetry(
    telemetryhttp.WithFilter(func(ctx http.Context) bool {
        return ctx.Request().Path() != "/internal"
    }),
))
```

### HTTP 客户端

通过 [HTTP 客户端](./http-client.md)发出的外部请求会自动埋点，无需额外配置。活跃的追踪上下文会被注入到外部请求头中，使下游的 Goravel 服务能够继续同一条追踪。

你可以通过 `telemetry.instrumentation.http_client.enabled` 全局禁用它，或者通过将 `config/http.go` 中对应客户端配置的 `enable_telemetry` 设置为 `false` 来按客户端禁用。

### gRPC

gRPC 埋点通过 stats handler 提供。使用 `WithGrpcServerStatsHandlers` 和 `WithGrpcClientStatsHandlers` 函数在 `bootstrap/app.go` 文件中注册它们：

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

两个 handler 都接受 `WithFilter`、`WithSpanAttributes` 和 `WithMetricAttributes` 等选项，并可通过 `grpc_server.enabled` 和 `grpc_client.enabled` 配置选项控制开关。

### 数据库

通过 [ORM](../orm/getting-started.md)（`facades.Orm()`）和[查询构建器](../database/queries.md)（`facades.DB()`）执行的查询会自动埋点，无需额外配置。每条查询会记录一个客户端 Span 以及 `db.client.operation.duration` 指标，每个连接池也会报告 `db.client.connection.count` 和 `db.client.connection.max`，帮助你监控连接池的使用情况和饱和度。

你可以通过 `telemetry.instrumentation.database.enabled` 配置选项（`OTEL_DATABASE_ENABLED` 环境变量）禁用它。

对于结构化查询，表名来自构建器，因此 Span 会以操作和表名命名，并携带 `db.collection.name` 属性。无需任何额外操作：

```go
facades.DB().Table("users").Where("id", 1).Get(&users) // Span: SELECT users
```

通过 `Select` 或 `Statement` 执行的原始查询传递不透明的 SQL 字符串，框架不会解析它，因此 Span 仅以操作命名。使用 `ContextWithTable` 将表名标记到请求上下文中，以恢复完整的 Span 名称和 `db.collection.name` 属性：

```go
import (
    instrumentationdatabase "github.com/goravel/framework/telemetry/instrumentation/database"
)

queryCtx := instrumentationdatabase.ContextWithTable(ctx, "users")
facades.DB().WithContext(queryCtx).Select(&users, "SELECT * FROM users WHERE id = ?", 1) // Span: SELECT users
```

## 上下文传播

`propagators` 配置选项定义了追踪上下文如何跨越进程边界。默认使用的是 W3C `tracecontext` 标准；还支持 `baggage`、`b3` 和 `b3multi`（Zipkin），可以通过逗号分隔的列表组合使用。

内置的 HTTP 和 gRPC 埋点会自动传播上下文。如果你通过自定义传输方式（例如消息队列）通信，你可以使用 `Propagator` 方法自行在跨边界时携带追踪信息：生产者将活跃上下文注入消息头，消费者提取它并继续同一条追踪：

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
    // 将活跃的追踪上下文附加到消息中
    facades.Telemetry().Propagator().Inject(ctx, telemetry.PropagationMapCarrier(message.Headers))

    // 将消息发送到消息代理...

    return nil
}

func (r *OrderConsumer) Consume(message *Message) error {
    // 继续生产者发起的追踪
    ctx := facades.Telemetry().Propagator().Extract(context.Background(), telemetry.PropagationMapCarrier(message.Headers))

    ctx, span := facades.Telemetry().Tracer("app").Start(ctx, "orders.consume",
        telemetry.WithSpanKind(telemetry.SpanKindConsumer),
    )
    defer span.End()

    return r.process(ctx, message)
}
```

如果你需要获取当前追踪的标识符，例如在错误响应中返回它们，可以从上下文中读取：

```go
import "go.opentelemetry.io/otel/trace"

spanCtx := trace.SpanContextFromContext(ctx)

traceID := spanCtx.TraceID().String()
spanID := spanCtx.SpanID().String()
```

## 刷新与关闭

你无需手动管理遥测的生命周期：当应用停止时，Goravel 会自动刷新所有缓冲数据并关闭提供者，最多等待 `shutdown_timeout`（默认 `15s`）。

如果你需要在不停止提供者的情况下立即推送缓冲数据，例如在无服务器函数冻结之前，你可以使用 `ForceFlush` 方法：

```go
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()

if err := facades.Telemetry().ForceFlush(ctx); err != nil {
    facades.Log().Error(err)
}
```
