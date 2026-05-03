# gRPC

`facades.Grpc()` exposes both server and client. Server registration is grpc-go-style: get `Server()`, register your generated `RegisterFooServiceServer(server, impl)`. Client connections are name-based, cached, with optional grouped credentials/interceptors per server name.

## Authoritative contracts

Relative paths — combine with the framework source URL declared in `AGENTS.md`:

- `contracts/grpc/grpc.go` — `Grpc`

## Imports

```go
import (
    "context"
    "net"

    "google.golang.org/grpc"
    "google.golang.org/grpc/credentials"
    "google.golang.org/grpc/stats"

    "yourmodule/app/facades"
)
```

## Methods

### `facades.Grpc()` returns `grpc.Grpc`

| Group | Methods (signature-only) |
|---|---|
| Server | `Server() *grpc.Server` (get the underlying server to register services on), `Run(host ...string) error` (start), `Listen(l net.Listener) error`, `Shutdown(force ...bool) error` |
| Server config | `ServerCredentials(credentials.TransportCredentials)` (TLS/mTLS; nil = no TLS), `UnaryServerInterceptors([]grpc.UnaryServerInterceptor)`, `ServerStatsHandlers([]stats.Handler)` |
| Client | `Connect(server string) (*grpc.ClientConn, error)` (cached) |
| Client config | `ClientCredentials(map[string]credentials.TransportCredentials)` (per-server-name), `UnaryClientInterceptorGroups(map[string][]grpc.UnaryClientInterceptor)`, `ClientStatsHandlerGroups(map[string][]stats.Handler)` |
| Deprecated | `Client(ctx context.Context, name string) (*grpc.ClientConn, error)` — use `Connect` instead, removed in v1.18 |

## Config

User-owned: `config/grpc.go`. Read directly for current server / client definitions.

Keys this facade reads:

- `grpc.host` (string) — server bind address
- `grpc.port` (string) — server port
- `grpc.servers.<name>.host` (string) — client target host
- `grpc.servers.<name>.port` (string) — client target port
- `grpc.servers.<name>.creds` (string) — credential group name (matches a key in `WithGrpcClientCredentials` map)
- `grpc.servers.<name>.interceptors` ([]string) — interceptor group names
- `grpc.servers.<name>.stats_handlers` ([]string) — stats handler group names

Greenfield default: `config/grpc.go` from goravel-scaffold URL declared in `AGENTS.md`.

## Patterns & gotchas

- **`Connect("name")` is the canonical client API** — `Client(ctx, name)` is deprecated and removed in v1.18. `Connect` looks up `grpc.servers.<name>` config, applies any matching credential/interceptor/stats groups, returns a cached `*grpc.ClientConn`.
- **Server registration**: get `Server()` (returns `*grpc.Server`), then call your generated `RegisterFooServiceServer(server, impl)` from the proto stub. Do this in a service provider's `Boot` or in `WithCallback`.
- **Server start**: `Run()` blocks. Wire as a Runner in `bootstrap/app.go` `WithRunners` so the framework manages it.
- **TLS / mTLS**: `ServerCredentials(creds)` for the server; `ClientCredentials(map[string]creds)` for clients (keyed by name; client config's `creds` field selects the group). Default is insecure.
- **Interceptors and stats handlers are GROUPED for clients**: declare maps via `WithGrpcClientInterceptors(func() map[string][]grpc.UnaryClientInterceptor { ... })` in `bootstrap/app.go`; the per-server-name lookup in config picks groups.
- **Server interceptors are flat**: `UnaryServerInterceptors([]grpc.UnaryServerInterceptor{...})` — applied to ALL server methods.
- **Connection caching**: `Connect("foo")` returns the same `*grpc.ClientConn` on repeated calls. Don't `Close()` it manually unless you mean to drop the cached entry.
- **Context propagation**: pass `ctx` directly to client method calls — `http.Context` embeds `context.Context`, so it works through unary RPCs naturally.
- **Stats handlers** (OpenTelemetry, custom metrics) attach via `ServerStatsHandlers` / `ClientStatsHandlerGroups`. Otel exporter typically goes here.
- **Streaming RPCs**: the `UnaryServerInterceptors` API is for unary only. For streaming interceptors, use `Server()` to get the `*grpc.Server` and apply via stdlib options BEFORE `Run`.

## Wrong → Right

| Wrong | Right | Why |
|---|---|---|
| `facades.Grpc().Client(ctx, "user_service")` | `facades.Grpc().Connect("user_service")` | Client is deprecated; Connect is the active API. |
| `conn, _ := facades.Grpc().Connect("svc"); defer conn.Close()` | `conn, _ := facades.Grpc().Connect("svc")` (no Close) | Connection is cached; closing drops the shared instance. |
| Register service in `Register(app)` of provider | Register in `Boot(app)` or `WithCallback` | Service registration needs `Server()` ready. |
| Pass `ctx.Context()` to grpc client call | Pass `ctx` directly | `http.Context` satisfies `context.Context`. |
| Build connection from scratch via `grpc.NewClient(...)` | Use `Connect("name")` | You bypass interceptors/credentials/stats configured for that server. |
| `UnaryServerInterceptors(stream)` | Use `Server()` + stdlib options for streaming interceptors | Method is unary-only. |

## Worked example: server registration + client call

```go
// app/grpc/controllers/user_controller.go (server impl)
package controllers

import (
    "context"

    pb "yourmodule/proto"
)

type UserController struct {
    pb.UnimplementedUserServiceServer
}

func (c *UserController) GetUser(ctx context.Context, req *pb.UserRequest) (*pb.UserResponse, error) {
    // ... look up user ...
    return &pb.UserResponse{Id: req.Id, Name: "Alice"}, nil
}

// app/providers/grpc_service_provider.go
package providers

import (
    "github.com/goravel/framework/contracts/foundation"

    pb "yourmodule/proto"
    "yourmodule/app/facades"
    "yourmodule/app/grpc/controllers"
)

type GrpcServiceProvider struct{}

func (p *GrpcServiceProvider) Register(app foundation.Application) {}

func (p *GrpcServiceProvider) Boot(app foundation.Application) {
    server := facades.Grpc().Server()
    pb.RegisterUserServiceServer(server, &controllers.UserController{})
}

// bootstrap/app.go (excerpt) — wire as Runner so framework manages start/stop
// app.WithRunners(func() []foundation.Runner {
//     return []foundation.Runner{ ... grpc runner ... }
// })

// Calling another service from a controller (client side)
package controllers

import (
    "github.com/goravel/framework/contracts/http"

    pb "yourmodule/proto"
    "yourmodule/app/facades"
)

func (c *Handler) FetchUser(ctx http.Context) http.Response {
    conn, err := facades.Grpc().Connect("user_service")  // resolves grpc.servers.user_service config
    if err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }
    client := pb.NewUserServiceClient(conn)
    resp, err := client.GetUser(ctx, &pb.UserRequest{Id: ctx.Request().RouteInt("id")})
    if err != nil {
        return ctx.Response().Json(http.StatusInternalServerError, http.Json{"error": err.Error()})
    }
    return ctx.Response().Json(http.StatusOK, http.Json{"id": resp.Id, "name": resp.Name})
}
```

## Rules

- Use `Connect("name")` for clients; `Client(ctx, name)` is deprecated and removed in v1.18.
- Don't `Close()` connections returned by `Connect` — they're cached.
- Pass `ctx` (http.Context) directly to RPC calls; it satisfies `context.Context`.
- Register services in `Boot` (or `WithCallback`), never `Register` — `Server()` needs to exist.
- Server credentials: `ServerCredentials(creds)`; nil = no TLS.
- Client credentials/interceptors/stats handlers are GROUPED — declare maps via `WithGrpcClient*` builders, select per-server in `config/grpc.go`.
- Server start blocks — wire via `WithRunners` so framework manages lifecycle.
- For streaming interceptors, use `Server()` directly with stdlib options before `Run`.
