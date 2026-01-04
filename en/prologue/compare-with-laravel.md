# Compare With Laravel

Goravel is heavily inspired by the Laravel framework, aiming to bring similar elegance and simplicity to Go developers. Here are some key comparisons between Goravel and Laravel to help you understand how Goravel aligns with Laravel's features:

| Feature                | Goravel                          | Laravel                          |
|------------------------|----------------------------------|----------------------------------|
| [Artisan Console](https://www.goravel.dev/digging-deeper/artisan-console.html) | ✅ `go run artisan key:generate` | ✅ `./artisan key:generate` |
| [Authentication](https://www.goravel.dev/security/authentication.html) | ✅ `facades.Auth(ctx).Login(&user)` | ✅ `Auth::login($user)` |
| [Authorization](https://www.goravel.dev/security/authorization.html) | ✅ `facades.Gate().Allows("update", user)` | ✅ `Gate::allows('update', $user)` |
| [Cache](https://www.goravel.dev/digging-deeper/cache.html) | ✅ `facades.Cache().Put("key", "value", time.Minute)` | ✅ `Cache::put('key', 'value', 60)` |
| [Carbon](https://www.goravel.dev/digging-deeper/helpers.html) | ✅ `carbon.Now().AddDays(1)` | ✅ `Carbon::now()->addDays(1)` |
| [Config](https://www.goravel.dev/getting-started/configuration.html) | ✅ `facades.Config().GetString("app.name")` | ✅ `config('app.name')` |
| [Crypt](https://www.goravel.dev/security/encryption.html) | ✅ `facades.Crypt().EncryptString("text")` | ✅ `Crypt::encryptString('text')` |
| [DB](https://www.goravel.dev/database/getting-started.html) | ✅ `facades.DB().Table("users").Get(&users)` | ✅ `DB::table('users')->get()` |
| [Event](https://www.goravel.dev/digging-deeper/event.html) | ✅ `facades.Event().Job(&events.OrderShipped{}).Dispatch()` | ✅ `OrderShipped::dispatch()` |
| [Factory](https://www.goravel.dev/orm/factories.html) | ✅ `facades.Orm().Factory().Make(&user)` | ✅ `User::factory()->make()` |
| [FileStorage](https://www.goravel.dev/digging-deeper/filesystem.html) | ✅ `facades.Storage().Put("file.txt", "content")` | ✅ `Storage::put('file.txt', 'content')` |
| [Hash](https://www.goravel.dev/security/hashing.html) | ✅ `facades.Hash().Make("password")` | ✅ `Hash::make('password')` |
| [Http](https://www.goravel.dev/the-basics/routing.html) | ✅ `facades.Route().Get("/", controller.Index)` | ✅ `Route::get('/', [Controller::class, 'index'])` |
| [Http Client](https://www.goravel.dev/digging-deeper/http-client.html) | ✅ `facades.Http().Get("https://api.com")` | ✅ `Http::get('https://api.com')` |
| [Localization](https://www.goravel.dev/digging-deeper/localization.html) | ✅ `facades.Lang(ctx).Get("messages.welcome")` | ✅ `__('messages.welcome')` |
| [Logger](https://www.goravel.dev/the-basics/logging.html) | ✅ `facades.Log().Info("message")` | ✅ `Log::info('message')` |
| [Mail](https://www.goravel.dev/digging-deeper/mail.html) | ✅ `facades.Mail().To("user@example.com").Send()` | ✅ `Mail::to('user@example.com')->send(new OrderShipped())` |
| [Mock](https://www.goravel.dev/testing/mock.html) | ✅ | ✅ |
| [Migrate](https://www.goravel.dev/database/migrations.html) | ✅ `./artisan migrate` | ✅ `php artisan migrate` |
| [Orm](https://www.goravel.dev/orm/getting-started.html) | ✅ `facades.Orm().Query().Find(&user, 1)` | ✅ `User::find(1)` |
| [Package Development](https://www.goravel.dev/digging-deeper/package-development.html) | ✅ | ✅ |
| [Queue](https://www.goravel.dev/digging-deeper/queues.html) | ✅ `facades.Queue().Job(&jobs.ProcessPodcast{}).Dispatch()` | ✅ `ProcessPodcast::dispatch()` |
| [Seeder](https://www.goravel.dev/database/seeding.html) | ✅ `facades.Seeder().Call([]seeder.Seeder{&UserSeeder{}})` | ✅ `$this->call([UserSeeder::class])` |
| [Session](https://www.goravel.dev/the-basics/session.html) | ✅ `ctx.Request().Session().Put("key", "value")` | ✅ `session(['key' => 'value'])` |
| [Task Scheduling](https://www.goravel.dev/digging-deeper/task-scheduling.html) | ✅ `facades.Schedule().Command("emails:send").Daily()` | ✅ `Schedule::command('emails:send')->daily()` |
| [Testing](https://www.goravel.dev/testing/getting-started.html) | ✅ | ✅ |
| [Validation](https://www.goravel.dev/the-basics/validation.html) | ✅ `ctx.Request().Validate(map[string]string{"name": "required"})` | ✅ `$request->validate(['name' => 'required'])` |
| [View](https://www.goravel.dev/the-basics/views.html) | ✅ `ctx.Response().View().Make("welcome.tmpl")` | ✅ `view('welcome')` |
| [Grpc](https://www.goravel.dev/the-basics/grpc.html) | ✅ `facades.Grpc().Run()` | 🚧 Not available natively |
| [TODO Process](https://www.goravel.dev/digging-deeper/process.html) | ✅ Long-running command-line process management | ✅ `Process::run('ls -la')` |
| [TODO Rate Limiting](https://www.goravel.dev/digging-deeper/process.html) | ✅ `facades.RateLimiter().TooManyAttempts("key", 5)` | ✅ `RateLimiter::tooManyAttempts('key', 5)` |
| [TODO Telemetry](https://www.goravel.dev/digging-deeper/process.html) | ✅ Application monitoring and telemetry | 🚧 Not available natively |
| Broadcasting | 🚧 Not available natively | ✅ `broadcast(new OrderShipped($order))` |
| Livewire / Inertia | 🚧 Not available natively | ✅ Full-stack framework for Laravel |
| Notifications | 🚧 Not available natively | ✅ `$user->notify(new InvoicePaid($invoice))` |
