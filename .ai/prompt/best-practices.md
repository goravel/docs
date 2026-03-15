# Goravel Best Practices

These are required patterns for correct, idiomatic Goravel code. Violations produce bugs, security holes, or poor performance.

---

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Model struct | PascalCase singular | `User`, `OrderItem` |
| Table name | snake_case plural (auto-derived) | `users`, `order_items` |
| Foreign key | `{model_name}_id` snake_case | `user_id`, `order_item_id` |
| Relationship field | PascalCase matching model | `Posts []*Post`, `Author *Author` |
| Controller | PascalCase + Controller suffix | `UserController`, `OrderController` |
| Middleware | PascalCase function returning `http.Middleware` | `func Auth() http.Middleware` |
| Event | PascalCase past-tense noun | `OrderShipped`, `UserRegistered` |
| Listener | PascalCase action verb phrase | `SendShipmentNotification` |
| Job | PascalCase noun | `ProcessPodcast`, `SendWelcomeEmail` |
| Command signature | `category:action` kebab | `send:emails`, `report:generate` |
| Config key | dot-separated snake_case | `app.name`, `database.default` |
| Route name | `resource.action` dot-separated | `users.index`, `posts.show` |

Model to table name rule: `UserOrder` -> `user_orders`. Goravel pluralizes automatically using the snake_case of the struct name.

---

## Use Contract Interfaces, Not Concrete Types

Goravel's `contracts/` package defines interfaces for every facade. Type against the interface so code is testable and decoupled from the implementation.

```go
import (
    contractsorm  "github.com/goravel/framework/contracts/database/orm"
    contractshttp "github.com/goravel/framework/contracts/http"
    contractslog  "github.com/goravel/framework/contracts/log"
)

// WRONG: depends on a concrete type, hard to mock
type UserService struct {
    db *gorm.DB
}

// CORRECT: depends on the Goravel ORM contract
type UserService struct {
    orm contractsorm.Orm
}

func NewUserService(orm contractsorm.Orm) *UserService {
    return &UserService{orm: orm}
}
```

When resolving from the service container, use the typed Make helpers:

```go
// In a service provider Boot or Register
orm    := app.MakeOrm()        // returns contracts/database/orm.Orm
config := app.MakeConfig()     // returns contracts/config.Config
route  := app.MakeRoute()      // returns contracts/route.Route
auth   := app.MakeAuth(ctx)    // returns contracts/auth.Auth
cache  := app.MakeCache()      // returns contracts/cache.Cache
```

Common contract import paths:

```go
contractsorm      "github.com/goravel/framework/contracts/database/orm"
contractshttp     "github.com/goravel/framework/contracts/http"
contractslog      "github.com/goravel/framework/contracts/log"
contractsconfig   "github.com/goravel/framework/contracts/config"
contractscache    "github.com/goravel/framework/contracts/cache"
contractsqueue    "github.com/goravel/framework/contracts/queue"
contractsevent    "github.com/goravel/framework/contracts/event"
contractsauth     "github.com/goravel/framework/contracts/auth"
contractsstorage  "github.com/goravel/framework/contracts/filesystem"
contractsschedule "github.com/goravel/framework/contracts/schedule"
```

---

## ORM / Database

### Always eager load to avoid N+1

```go
// WRONG: N+1 (1 query for books, 1 per book for author)
var books []models.Book
facades.Orm().Query().Find(&books)
for _, book := range books {
    facades.Orm().Query().Find(&author, book.AuthorID)
}

// CORRECT: 2 queries total
facades.Orm().Query().With("Author").Find(&books)

// Multiple relationships
facades.Orm().Query().With("Author").With("Publisher").Find(&books)

// Nested
facades.Orm().Query().With("Author.Contacts").Find(&books)

// Constrained eager load
facades.Orm().Query().With("Author", func(query orm.Query) orm.Query {
    return query.Where("active = ?", true)
}).Find(&books)
```

### Use FindOrFail when missing = error

```go
// WRONG: Find returns nil error even when record not found
var user models.User
err := facades.Orm().Query().Find(&user, 1)
// err is nil even if no record; user is zero-value struct

// CORRECT: FindOrFail errors when not found
err := facades.Orm().Query().FindOrFail(&user, 1)
if err != nil {
    return ctx.Response().Json(http.StatusNotFound, http.Json{"error": "not found"})
}
```

### Use map[string]any to update zero values

```go
// WRONG: struct update skips zero-value fields (false, 0, "")
facades.Orm().Query().Save(&user) // won't clear fields set to zero

// CORRECT: use map to explicitly set zero values
facades.Orm().Query().Model(&user).Update(map[string]any{
    "active": false,
    "score":  0,
    "name":   "",
})
```

### Always use transactions for multiple writes

```go
// CORRECT: wrap related writes in a transaction
err := facades.Orm().Transaction(func(tx orm.Transaction) error {
    if err := tx.Create(&order); err != nil {
        return err // auto-rollback
    }
    if err := tx.Create(&orderItem); err != nil {
        return err // auto-rollback
    }
    return nil // auto-commit
})
```

### Use Chunk for large datasets: never load all rows

```go
// WRONG: loads entire table into memory
var users []models.User
facades.Orm().Query().Find(&users)

// CORRECT: process in batches
facades.Orm().Query().Chunk(100, func(users []models.User) bool {
    for _, user := range users {
        // process
    }
    return true // return false to stop
})
```

### Index foreign keys and frequently filtered columns

Every foreign key column must have a database index. Add in migration:

```go
table.Index("user_id")
table.Index("status", "created_at") // composite for common filter+sort
table.Unique("email")
```

### Use soft deletes for recoverable data

```go
type User struct {
    orm.Model
    Name string
    orm.SoftDeletes // adds deleted_at; Delete() sets it, doesn't remove row
}

// Query includes soft-deleted
facades.Orm().Query().WithTrashed().Find(&users)

// Hard delete
facades.Orm().Query().ForceDelete(&user)
```

### GlobalScopes must return map, not slice

```go
// WRONG
func (u *User) GlobalScopes() []func(orm.Query) orm.Query { ... }

// CORRECT
func (u *User) GlobalScopes() map[string]func(orm.Query) orm.Query {
    return map[string]func(orm.Query) orm.Query{
        "active": func(query orm.Query) orm.Query {
            return query.Where("active = ?", true)
        },
    }
}

// Disable specific scope
facades.Orm().Query().WithoutGlobalScope("active").Find(&users)

// Disable all scopes
facades.Orm().Query().WithoutGlobalScopes().Find(&users)
```

### Sum takes a destination pointer, not a return value

```go
// WRONG (old)
total, err := facades.Orm().Query().Sum("amount")

// CORRECT
var total float64
err := facades.Orm().Query().Sum("amount", &total)
```

---

## Controllers / HTTP

### Always return http.Response: never return nil

```go
// WRONG: missing return, compile error
func (r *UserController) Show(ctx http.Context) http.Response {
    // forgot return
}

// CORRECT
func (r *UserController) Show(ctx http.Context) http.Response {
    return ctx.Response().Json(http.StatusOK, http.Json{"id": 1})
}
```

### Validate all input before using it

```go
// CORRECT: validate first, use after
func (r *UserController) Store(ctx http.Context) http.Response {
    validator, err := ctx.Request().Validate(map[string]string{
        "name":  "required|max_len:100",
        "email": "required|email",
    })
    if err != nil {
        return ctx.Response().Json(http.StatusBadRequest, http.Json{"error": err.Error()})
    }
    if validator.Fails() {
        return ctx.Response().Json(http.StatusUnprocessableEntity, validator.Errors().All())
    }

    var user models.User
    if err := validator.Bind(&user); err != nil {
        return ctx.Response().Json(http.StatusBadRequest, http.Json{"error": err.Error()})
    }
    // use user safely
}
```

### Use response.Bind, not Request.Bind

```go
// WRONG
resp, _ := facades.Http().Get(url)
resp.Request.Bind(&dest) // compile error

// CORRECT
resp, err := facades.Http().Get(url)
if err != nil {
    return
}
if err := resp.Bind(&dest); err != nil {
    return
}
```

### Use typed input methods to avoid string parsing

```go
// WRONG: manual type conversion
id := ctx.Request().Input("id") // string
idInt, _ := strconv.Atoi(id)

// CORRECT: typed methods
id := ctx.Request().RouteInt("id")
page := ctx.Request().QueryInt("page", 1)
active := ctx.Request().InputBool("active")
```

### Do not leak internal errors to HTTP responses

```go
// WRONG: exposes internal detail
if err := facades.Orm().Query().Find(&user, id); err != nil {
    return ctx.Response().Json(500, http.Json{"error": err.Error()})
}

// CORRECT: log internally, return generic message
if err := facades.Orm().Query().FindOrFail(&user, id); err != nil {
    facades.Log().WithContext(ctx.Context()).Error(err)
    return ctx.Response().Json(http.StatusNotFound, http.Json{"error": "resource not found"})
}
```

### Set custom panic recovery

```go
// bootstrap/app.go
WithMiddleware(func(handler configuration.Middleware) {
    handler.Append(
        middleware.StartSession(),
    ).Recover(func(ctx http.Context, err any) {
        facades.Log().Error(err)
        _ = ctx.Response().String(http.StatusInternalServerError, "internal server error").Abort()
    })
})
```

---

## Security

### Never store raw passwords

```go
// WRONG
user.Password = req.Password

// CORRECT
hashed, err := facades.Hash().Make(req.Password)
if err != nil {
    return err
}
user.Password = hashed

// Verify
valid := facades.Hash().Check(req.Password, user.Password)
```

### Call Parse before accessing Auth user

```go
// WRONG: User/ID return empty if Parse not called
userID, _ := facades.Auth(ctx).ID()

// CORRECT
token := ctx.Request().Header("Authorization")
payload, err := facades.Auth(ctx).Parse(token)
if err != nil {
    return ctx.Response().Json(http.StatusUnauthorized, http.Json{"error": "invalid token"})
}
userID, _ := facades.Auth(ctx).ID()
```

### Regenerate session ID after login (prevent session fixation)

```go
func (r *AuthController) Login(ctx http.Context) http.Response {
    // ... authenticate user ...

    facades.Auth(ctx).Login(&user)

    // Must regenerate session ID after login
    ctx.Request().Session().Regenerate()

    return ctx.Response().Json(http.StatusOK, http.Json{"message": "logged in"})
}
```

### Use rate limiting on auth endpoints

```go
// bootstrap/app.go
WithCallback(func() {
    facades.RateLimiter().For("login", func(ctx http.Context) http.Limit {
        return limit.PerMinute(5).By(ctx.Request().Ip())
    })
})

// routes
facades.Route().Middleware(middleware.Throttle("login")).Post("/login", authController.Login)
```

### Use CSRF for web (non-API) routes

```go
import "github.com/goravel/framework/http/middleware"

// Global for all web routes
handler.Append(middleware.VerifyCsrfToken([]string{
    "api/*",     // except API routes
    "webhook/*", // except webhooks
}))
```

### Never put secrets in config values directly: use .env

```go
// WRONG
"api_key": "sk-abc123...",

// CORRECT
"api_key": config.Env("STRIPE_API_KEY", ""),
```

---

## Service Container / Providers

### Only bind in Register: never use facades in Register

```go
// WRONG: facades not yet booted during Register
func (r *ServiceProvider) Register(app foundation.Application) {
    facades.Log().Info("registering") // PANIC: Log not ready
    app.Singleton("myservice", func(app foundation.Application) (any, error) {
        return NewMyService(), nil
    })
}

// CORRECT
func (r *ServiceProvider) Register(app foundation.Application) {
    app.Singleton("myservice", func(app foundation.Application) (any, error) {
        return NewMyService(app.MakeConfig()), nil // use app.Make*, not facades
    })
}

func (r *ServiceProvider) Boot(app foundation.Application) {
    facades.Log().Info("provider booted") // safe here
    route := app.MakeRoute()
    route.Get("/health", healthController.Check)
}
```

### Use Singleton for stateless, Bind for stateful

```go
// Stateless service (DB connection, config reader) -> Singleton
app.Singleton("db", func(app foundation.Application) (any, error) {
    return NewDB(app.MakeConfig()), nil
})

// Stateful / per-request -> Bind (new instance each call)
app.Bind("request.context", func(app foundation.Application) (any, error) {
    return NewRequestContext(), nil
})
```

### Use WithCallback for post-boot setup

```go
// Gates, rate limiters, observers: all require facades to be ready
WithCallback(func() {
    facades.Gate().Define("edit-post", func(ctx context.Context, args map[string]any) access.Response {
        user := ctx.Value("user").(models.User)
        post := args["post"].(models.Post)
        if user.ID == post.UserID {
            return access.NewAllowResponse()
        }
        return access.NewDenyResponse("forbidden")
    })

    facades.Orm().Observe(&models.User{}, &observers.UserObserver{})
    facades.RateLimiter().For("api", func(ctx http.Context) http.Limit {
        return limit.PerMinute(60).By(ctx.Request().Ip())
    })
})
```

---

## Middleware

### Middleware is a function type, not a struct

```go
// WRONG
type AuthMiddleware struct{}
func (m *AuthMiddleware) Handle(ctx http.Context, next http.HandlerFunc) http.Response { ... }

// CORRECT
func Auth() http.Middleware {
    return func(ctx http.Context) {
        token := ctx.Request().Header("Authorization", "")
        if token == "" {
            ctx.Request().AbortWithStatus(http.StatusUnauthorized)
            return
        }
        // validate...
    }
}
```

### Always call next or Abort: never skip both

```go
func MyMiddleware() http.Middleware {
    return func(ctx http.Context) {
        if !valid(ctx) {
            ctx.Request().AbortWithStatus(http.StatusForbidden)
            return // stop here
        }
        // returning without AbortWithStatus lets the framework continue to the next handler
    }
}
```

### Register global middleware for app-wide concerns

```go
// bootstrap/app.go
WithMiddleware(func(handler configuration.Middleware) {
    handler.Append(
        middleware.Cors(),
        sessionmiddleware.StartSession(),
        middleware.VerifyCsrfToken([]string{"api/*"}),
    )
})
```

---

## Queue / Jobs

### Make jobs idempotent: safe to run multiple times

```go
// CORRECT: check before acting
func (r *ProcessOrderJob) Handle(args ...any) error {
    order := r.order
    if order.Status == "processed" {
        return nil // already done, skip
    }
    // ... process ...
    order.Status = "processed"
    return facades.Orm().Query().Save(&order)
}
```

### Use ShouldRetry to control retry behavior

```go
func (r *SendEmailJob) ShouldRetry(attempts uint, err error) bool {
    // Retry transient errors, not permanent failures
    if errors.Is(err, ErrRateLimit) {
        return true
    }
    return attempts < 3
}
```

### Keep jobs focused: one responsibility per job

```go
// WRONG: job doing too much
func (r *UserRegistrationJob) Handle(args ...any) error {
    // send welcome email + create subscription + notify admin + update analytics
}

// CORRECT: chain focused jobs
facades.Queue().Job(&jobs.SendWelcomeEmail{}, args).
    Chain([]queue.Jobs{
        {Job: &jobs.CreateSubscription{}, Args: args},
        {Job: &jobs.NotifyAdmin{}, Args: args},
    }).Dispatch()
```

### Don't dispatch events inside open transactions

```go
// WRONG: if transaction rolls back, event was already dispatched
facades.Orm().Transaction(func(tx orm.Transaction) error {
    tx.Create(&order)
    facades.Event().Job(&events.OrderCreated{}, args).Dispatch() // too early
    return nil
})

// CORRECT: dispatch after commit
err := facades.Orm().Transaction(func(tx orm.Transaction) error {
    return tx.Create(&order)
})
if err == nil {
    facades.Event().Job(&events.OrderCreated{}, args).Dispatch()
}
```

---

## Cache

### Use Remember instead of manual Get + Put

```go
// WRONG: race condition between Get and Put
val := facades.Cache().Get("key", nil)
if val == nil {
    val = expensiveComputation()
    facades.Cache().Put("key", val, 5*time.Minute)
}

// CORRECT: atomic
val, err := facades.Cache().Remember("key", 5*time.Minute, func() (any, error) {
    return expensiveComputation(), nil
})
```

### Use atomic locks for distributed mutual exclusion

```go
lock := facades.Cache().Lock("process:order:"+orderID, 30*time.Second)
if lock.Get() {
    defer lock.Release()
    // only one server runs this at a time
    processOrder(orderID)
} else {
    // already being processed elsewhere
}

// Block and wait (up to 5 seconds)
if lock.Block(5 * time.Second) {
    defer lock.Release()
    processOrder(orderID)
}
```

### Use Store() to be explicit about which store

```go
// When using multiple cache stores, be explicit
facades.Cache().Store("redis").Put("session:data", data, 1*time.Hour)
facades.Cache().Store("memory").Put("rate:limit:123", count, 1*time.Minute)
```

---

## Events

### Keep event Args serializable

```go
// CORRECT: use typed Args with Type and Value; must survive serialization for queued listeners
facades.Event().Job(&events.OrderShipped{}, []event.Arg{
    {Type: "int", Value: order.ID},
    {Type: "string", Value: order.Status},
}).Dispatch()

// WRONG for queued listeners: passing non-serializable objects (functions, channels, etc.)
```

### Queue non-critical listeners

```go
// Sending email on order shipped; should not block the HTTP response
func (r *SendShipmentNotification) Queue(args ...any) event.Queue {
    return event.Queue{
        Enable:     true,
        Connection: "redis",
        Queue:      "notifications",
    }
}
```

---

## Error Handling

### Return errors: never suppress them

```go
// WRONG: swallowing errors hides bugs
result, _ := facades.Cache().Remember("key", ttl, fn)
facades.Orm().Query().Create(&user) // ignoring returned error

// CORRECT
result, err := facades.Cache().Remember("key", ttl, fn)
if err != nil {
    return err
}
if err := facades.Orm().Query().Create(&user); err != nil {
    return err
}
```

### Log at the boundary: not deep in service layers

```go
// WRONG: logging at every layer creates duplicate noise
func (s *UserService) Create(data UserData) error {
    err := facades.Orm().Query().Create(&user)
    facades.Log().Error(err) // logged here...
    return err
}

func (r *UserController) Store(ctx http.Context) http.Response {
    err := s.Create(data)
    facades.Log().Error(err) // ...and again here
}

// CORRECT: log once at the outermost boundary (controller/command)
func (r *UserController) Store(ctx http.Context) http.Response {
    if err := s.Create(data); err != nil {
        facades.Log().WithContext(ctx.Context()).
            With(log.Fields{"user": data}).
            Error(err)
        return ctx.Response().Json(http.StatusInternalServerError, ...)
    }
}
```

---

## Session

### Use Redis session driver for multi-server deployments

File sessions are stored locally and won't work across multiple server instances. Use Redis:

```go
// config/session.go
"default": "redis",
"drivers": map[string]any{
    "redis": map[string]any{
        "driver":     "custom",
        "connection": "default",
        "via": func() (session.Driver, error) {
            return redisfacades.Session("redis"), nil
        },
    },
},
```

### Never store sensitive data in sessions

```go
// WRONG: storing raw credentials or tokens in session
ctx.Request().Session().Put("password", password)
ctx.Request().Session().Put("api_secret", secret)

// CORRECT: store only the user ID, look up sensitive data from DB/cache on each request
ctx.Request().Session().Put("user_id", user.ID)
```

---

## Configuration

### Always use .env for environment-specific values

```go
// config/app.go
"debug": config.Env("APP_DEBUG", false),
"key":   config.Env("APP_KEY", ""),

// Access in code
debug := facades.Config().GetBool("app.debug", false)
key   := facades.Config().GetString("app.key", "")
```

### Never hardcode paths: use WithPaths or path helpers

```go
// WRONG
file, err := os.Open("storage/uploads/photo.jpg")

// CORRECT
import "github.com/goravel/framework/support/path"
file, err := os.Open(path.Storage("uploads/photo.jpg"))
```

### Use facades.Config().Add() to set runtime config

```go
// Useful in tests or dynamic configuration
facades.Config().Add("service.api_url", "https://staging.api.example.com")
facades.Config().Add("feature.flags", map[string]any{"new_ui": true})
```

---

## Testing

### Use RefreshDatabase in SetupTest for clean state

```go
func (s *UserTestSuite) SetupTest() {
    s.RefreshDatabase() // wipe and re-migrate before each test
}
```

### Use Docker for parallel package tests

```go
// tests/feature/main_test.go
func TestMain(m *testing.M) {
    database, _ := facades.Testing().Docker().Database()
    database.Build()
    database.Ready()
    database.Migrate()
    facades.App().Restart()
    exit := m.Run()
    database.Shutdown()
    os.Exit(exit)
}
```

### Use mock.Factory() in unit tests: never real facades

```go
// CORRECT: no real DB/cache/mail calls in unit tests
func TestCreateUser(t *testing.T) {
    mockFactory := mock.Factory()
    mockOrm := mockFactory.Orm()
    mockOrmQuery := mockFactory.OrmQuery()
    mockOrm.On("Query").Return(mockOrmQuery)
    mockOrmQuery.On("Create", mock.Anything).Return(nil).Once()

    err := userService.Create(UserData{Name: "test"})
    assert.Nil(t, err)
    mockOrmQuery.AssertExpectations(t)
}
```

### Use s.Http() for full integration HTTP tests

```go
func (s *UserTestSuite) TestStore() {
    builder := http.NewBody().SetField("name", "goravel").SetField("email", "test@example.com")
    body, _ := builder.Build()

    response, err := s.Http(s.T()).
        WithHeader("Content-Type", body.ContentType()).
        WithHeader("Accept", "application/json").
        Post("/users", body)

    s.Nil(err)
    response.AssertCreated().AssertJson(map[string]any{"name": "goravel"})
}
```

---

## Performance

### Queue slow operations: never block the HTTP response

```go
// WRONG: sending email synchronously blocks response for 2-5 seconds
func (r *OrderController) Store(ctx http.Context) http.Response {
    facades.Mail().To([]string{user.Email}).Content(...).Send() // SLOW
    return ctx.Response().Json(http.StatusCreated, order)
}

// CORRECT: queue it
func (r *OrderController) Store(ctx http.Context) http.Response {
    facades.Queue().Job(&jobs.SendOrderConfirmation{}, args).Dispatch()
    return ctx.Response().Json(http.StatusCreated, order)
}
```

### Tune database connection pool

```go
// config/database.go
"pool": map[string]any{
    "max_idle_conns":    10,    // keep warm connections
    "max_open_conns":    100,   // cap total connections
    "conn_max_idletime": 3600,  // close idle after 1h
    "conn_max_lifetime": 3600,  // recycle connections after 1h
},
"slow_threshold": 200, // log queries slower than 200ms
```

### Cache computed/aggregated data

```go
// CORRECT: expensive aggregation behind cache
stats, err := facades.Cache().Remember("dashboard:stats", 5*time.Minute, func() (any, error) {
    var result DashboardStats
    facades.Orm().Query().
        Model(&models.Order{}).
        Select("COUNT(*) as count, SUM(total) as revenue").
        Where("created_at > ?", time.Now().AddDate(0, -1, 0)).
        First(&result)
    return result, nil
})
```

### Use pagination: never return all records in APIs

```go
// WRONG
var users []models.User
facades.Orm().Query().Find(&users)
return ctx.Response().Json(200, users) // could be millions of rows

// CORRECT
page := ctx.Request().QueryInt("page", 1)
perPage := ctx.Request().QueryInt("per_page", 20)
var users []models.User
var total int64
facades.Orm().Query().Paginate(page, perPage, &users, &total)
return ctx.Response().Json(200, http.Json{
    "data":  users,
    "total": total,
    "page":  page,
})
```

---

## Package Installation

### Use artisan to install official packages

```shell
# Installs package, registers service provider, updates config automatically
./artisan package:install github.com/goravel/redis
./artisan package:install github.com/goravel/gin
./artisan package:install github.com/goravel/fiber
./artisan package:install github.com/goravel/postgres
./artisan package:install github.com/goravel/mysql
./artisan package:install github.com/goravel/s3
./artisan package:install github.com/goravel/minio

# Publish package resources manually if needed
./artisan vendor:publish --package=github.com/goravel/example-package
./artisan vendor:publish --package=github.com/goravel/example-package --tag=config
./artisan vendor:publish --package=./packages/local-package --force
```

### Register process and view service providers

```go
// bootstrap/providers.go
&process.ServiceProvider{},  // facades.Process()
&view.ServiceProvider{},     // facades.View()
```

---

## Compile / Deployment

### Timezone data for non-UTC timezones

Alpine-based Docker images and scratch containers have no timezone database. If your app uses any non-UTC timezone, provide timezone data using one of these methods:

```dockerfile
# Option 1: install tzdata in the container image (works with time.LoadLocation)
RUN apk add --no-cache tzdata
```

```go
// Option 2: embed timezone data into the binary at compile time
import _ "time/tzdata"
```

```shell
# Option 3: equivalent to Option 2 using a build tag instead of an import
go build -tags timetzdata .
```

Options 2 and 3 do the same thing. Option 1 keeps the binary smaller but requires the OS package. Option 2/3 makes the binary self-contained.

### Static compilation for containerless deployment

```shell
go build --ldflags "-extldflags -static" -o main .

# Or via artisan
./artisan build --static --os=linux
```

### Files required on deployment server

```
.env
./main          # compiled binary
./public/       # if exists
./resources/    # if exists
```

Do not ship `database/migrations/`. Migrations run at startup via `./artisan migrate` or auto-run if configured.
