---
aside: false
---

# Compare With Laravel

Goravel follows the structure of Laravel, so the concepts, the facades and most method names carry over. The table below shows the same task in both frameworks. Where one of them does not have a feature, it says so.

| Feature | <Brand laravel /> Laravel | <Brand goravel /> Goravel |
| --- | --- | --- |
| [Artisan Console](../digging-deeper/artisan-console.md) | `php artisan key:generate` | `./artisan key:generate` |
| [Authentication](../security/authentication.md) | `Auth::login($user)` | `facades.Auth(ctx).Login(&user)` |
| [Authorization](../security/authorization.md) | `Gate::allows('update-post', $post)` | `facades.Gate().Allows("update-post", map[string]any{"post": post})` |
| [Cache](../digging-deeper/cache.md) | `Cache::put('key', 'value', 60)` | `facades.Cache().Put("key", "value", time.Minute)` |
| [Carbon](../digging-deeper/helpers.md) | `Carbon::now()->addDays(1)` | `carbon.Now().AddDays(1)` |
| [Config](../getting-started/configuration.md) | `config('app.name')` | `facades.Config().GetString("app.name")` |
| [Crypt](../security/encryption.md) | `Crypt::encryptString('text')` | `facades.Crypt().EncryptString("text")` |
| [DB](../database/getting-started.md) | `DB::table('users')->get()` | `facades.DB().Table("users").Get(&users)` |
| [Event](../digging-deeper/event.md) | `OrderShipped::dispatch()` | `facades.Event().Job(&events.OrderShipped{}, []event.Arg{}).Dispatch()` |
| [Factory](../orm/factories.md) | `User::factory()->make()` | `facades.Orm().Factory().Make(&user)` |
| [File Storage](../digging-deeper/filesystem.md) | `Storage::put('file.txt', 'content')` | `facades.Storage().Put("file.txt", "content")` |
| [Hash](../security/hashing.md) | `Hash::make('password')` | `facades.Hash().Make("password")` |
| [HTTP Client](../digging-deeper/http-client.md) | `Http::get('https://example.com')` | `facades.Http().Get("https://example.com")` |
| [Localization](../digging-deeper/localization.md) | `__('messages.welcome')` | `facades.Lang(ctx).Get("messages.welcome")` |
| [Logging](../the-basics/logging.md) | `Log::info('message')` | `facades.Log().Info("message")` |
| [Mail](../digging-deeper/mail.md) | `Mail::to('user@example.com')->send(new OrderShipped())` | `facades.Mail().To([]string{"user@example.com"}).Send()` |
| [Migrations](../database/migrations.md) | `php artisan migrate` | `./artisan migrate` |
| [Mock](../testing/mock.md) | `Cache::shouldReceive('get')` | `mock.Factory().Cache()` |
| [ORM](../orm/getting-started.md) | `User::find(1)` | `facades.Orm().Query().Find(&user, 1)` |
| [Package Development](../digging-deeper/package-development.md) | `$this->loadViewsFrom($path, 'courier')` | `facades.View().LoadViewsFrom("/path/to/package/views")` |
| [Process](../digging-deeper/processes.md) | `Process::run('ls -la')` | `facades.Process().Run("ls", "-la")` |
| [Queue](../digging-deeper/queues.md) | `SendEmail::dispatch()` | `facades.Queue().Job(&jobs.SendEmail{}, []queue.Arg{}).Dispatch()` |
| [Rate Limiting](../the-basics/routing.md#rate-limiting) | `RateLimiter::for('global', ...)` | `facades.RateLimiter().For("global", ...)` |
| [Routing](../the-basics/routing.md) | `Route::get('/', [Controller::class, 'index'])` | `facades.Route().Get("/", controller.Index)` |
| [Seeder](../database/seeding.md) | `$this->call([UserSeeder::class])` | `facades.Seeder().Call([]seeder.Seeder{&UserSeeder{}})` |
| [Session](../the-basics/session.md) | `session(['key' => 'value'])` | `ctx.Request().Session().Put("key", "value")` |
| [Task Scheduling](../digging-deeper/task-scheduling.md) | `Schedule::command('emails:send')->daily()` | `facades.Schedule().Command("emails:send").Daily()` |
| [Testing](../testing/getting-started.md) | `$this->get('/tasks')` | `s.Http(s.T()).Get("/tasks")` |
| [Validation](../the-basics/validation.md) | `$request->validate([...])` | `ctx.Request().ValidateRequest(&storePost)` |
| [View](../the-basics/views.md) | `view('welcome')` | `ctx.Response().View().Make("welcome.tmpl")` |
| [Grpc](../the-basics/grpc.md) | <Brand laravel no /> Not built in | `facades.Grpc().Connect("user")` |
| [Telemetry](../digging-deeper/telemetry.md) | <Brand laravel no /> Not built in | `facades.Telemetry().Tracer("app").Start(ctx, "order.process")` |
| Notifications | `$user->notify(new InvoicePaid())` | <Brand goravel no /> Not yet |
| Broadcasting | `broadcast(new OrderShipped($order))` | <Brand goravel no /> Not yet |
| Livewire | `<livewire:counter />` | <Brand goravel no /> Not yet |
