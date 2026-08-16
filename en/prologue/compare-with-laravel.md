# Compare With Laravel

Goravel is heavily inspired by the Laravel framework, aiming to bring similar elegance and simplicity to Go developers. Here are some key comparisons between Goravel and Laravel to help you understand how Goravel aligns with Laravel's features:

| Feature                | Goravel                          | Laravel                          | Code Example                     |
|------------------------|----------------------------------|----------------------------------|----------------------------------|
| [Artisan Console](https://www.goravel.dev/digging-deeper/artisan-console.html) | ✅ | ✅ | ./artisan key:generate <br> php artisan key:generate |
| [Authentication](https://www.goravel.dev/security/authentication.html) | ✅ | ✅ | facades.Auth(ctx).Login(&user) <br> Auth::login($user) |
| [Authorization](https://www.goravel.dev/security/authorization.html) | ✅ | ✅ | facades.Gate().Allows("update", user) <br> Gate::allows('update', $user) |
| [Cache](https://www.goravel.dev/digging-deeper/cache.html) | ✅ | ✅ | facades.Cache().Put("key", "value", time.Minute) <br> Cache::put('key', 'value', 60) |
| [Carbon](https://www.goravel.dev/digging-deeper/helpers.html) | ✅ | ✅ | carbon.Now().AddDays(1) <br> Carbon::now()->addDays(1) |
| [Config](https://www.goravel.dev/getting-started/configuration.html) | ✅ | ✅ | facades.Config().GetString("app.name") <br> config('app.name') |
| [Crypt](https://www.goravel.dev/security/encryption.html) | ✅ | ✅ | facades.Crypt().EncryptString("text") <br> Crypt::encryptString('text') |
| [DB](https://www.goravel.dev/database/getting-started.html) | ✅ | ✅ | facades.DB().Table("users").Get(&users) <br> DB::table('users')->get() |
| [Event](https://www.goravel.dev/digging-deeper/event.html) | ✅ | ✅ | facades.Event().Job(&events.Order{}).Dispatch() <br> Order::dispatch() |
| [Factory](https://www.goravel.dev/orm/factories.html) | ✅ | ✅ | facades.Orm().Factory().Make(&user) <br> User::factory()->make() |
| [FileStorage](https://www.goravel.dev/digging-deeper/filesystem.html) | ✅ | ✅ | facades.Storage().Put("file.txt", "content") <br> Storage::put('file.txt', 'content') |
| [Hash](https://www.goravel.dev/security/hashing.html) | ✅ | ✅ | facades.Hash().Make("password") <br> Hash::make('password') |
| [Http](https://www.goravel.dev/the-basics/routing.html) | ✅ | ✅ | facades.Route().Get("/", controller.Index) <br> Route::get('/', [Controller::class, 'index']) |
| [Http Client](https://www.goravel.dev/digging-deeper/http-client.html) | ✅ | ✅ | facades.Http().Get("https://api.com") <br> Http::get('https://api.com') |
| [Localization](https://www.goravel.dev/digging-deeper/localization.html) | ✅ | ✅ | facades.Lang(ctx).Get("messages.welcome") <br> __('messages.welcome') |
| [Logger](https://www.goravel.dev/the-basics/logging.html) | ✅ | ✅ | facades.Log().Info("message") <br> Log::info('message') |
| [Mail](https://www.goravel.dev/digging-deeper/mail.html) | ✅ | ✅ | facades.Mail().To("user@example.com").Send() <br> Mail::to('user@example.com')->send(new Order()) |
| [Mock](https://www.goravel.dev/testing/mock.html) | ✅ | ✅ | |
| [Migrate](https://www.goravel.dev/database/migrations.html) | ✅ | ✅ | ./artisan migrate <br> php artisan migrate |
| [Orm](https://www.goravel.dev/orm/getting-started.html) | ✅ | ✅ | facades.Orm().Query().Find(&user, 1) <br> User::find(1) |
| [Package Development](https://www.goravel.dev/digging-deeper/package-development.html) | ✅ | ✅ | |
| [Process](https://www.goravel.dev/digging-deeper/process.html) | ✅ | ✅ | facades.Process().Run("ls", "-la") <br> `Process::run('ls -la') |
| [Queue](https://www.goravel.dev/digging-deeper/queues.html) | ✅ | ✅ | facades.Queue().Job(&jobs.Process{}).Dispatch() <br> Process::dispatch() |
| [Rate Limiting](https://www.goravel.dev/digging-deeper/process.html) | ✅ | ✅ | facades.RateLimiter().For("global", ...) <br> RateLimiter::for('global', ...) |
| [Seeder](https://www.goravel.dev/database/seeding.html) | ✅ | ✅ | facades.Seeder().Call([]seeder.Seeder{&User{}}) <br> $this->call([User::class]) |
| [Session](https://www.goravel.dev/the-basics/session.html) | ✅ | ✅ | ctx.Request().Session().Put("key", "value") <br> session(['key' => 'value']) |
| [Task Scheduling](https://www.goravel.dev/digging-deeper/task-scheduling.html) | ✅ | ✅ | facades.Schedule().Command("emails:send").Daily() <br> Schedule::command('emails:send')->daily() |
| [Testing](https://www.goravel.dev/testing/getting-started.html) | ✅ | ✅ | |
| [Validation](https://www.goravel.dev/the-basics/validation.html) | ✅ | ✅ | ctx.Request().ValidateRequest() <br> $request->validate() |
| [View](https://www.goravel.dev/the-basics/views.html) | ✅ | ✅ | ctx.Response().View().Make("welcome.tmpl") <br> view('welcome') |
| [Notifications](https://www.goravel.dev/digging-deeper/notifications.html) | ✅ | ✅ | facades.Notification().Send(user, &notifications.OrderShipped{}) <br> Notification::send($user, new OrderShipped()) |
| [Broadcasting](https://www.goravel.dev/digging-deeper/broadcasting.html) | ✅ | ✅ | facades.Broadcast().Channel("channel", ...) <br> Broadcast::channel('channel', ...) |
| Inertia | ✅ | ✅ | |
| [Grpc](https://www.goravel.dev/the-basics/grpc.html) | ✅ | 🚧 | |
