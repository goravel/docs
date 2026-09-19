---
aside: false
---

# 与 Laravel 对比

Goravel 沿用了 Laravel 的结构，因此概念、门面以及大部分方法名都是相通的。 下表展示了同一件事在两个框架中的写法，如果其中一方没有该功能，会在表中注明。

| 功能 | <Brand laravel /> Laravel | <Brand goravel /> Goravel |
| --- | --- | --- |
| [Artisan 命令行](../digging-deeper/artisan-console.md) | `php artisan key:generate` | `./artisan key:generate` |
| [用户认证](../security/authentication.md) | `Auth::login($user)` | `facades.Auth(ctx).Login(&user)` |
| [用户授权](../security/authorization.md) | `Gate::allows('update-post', $post)` | `facades.Gate().Allows("update-post", map[string]any{"post": post})` |
| [缓存](../digging-deeper/cache.md) | `Cache::put('key', 'value', 60)` | `facades.Cache().Put("key", "value", time.Minute)` |
| [Carbon](../digging-deeper/helpers.md) | `Carbon::now()->addDays(1)` | `carbon.Now().AddDays(1)` |
| [自定义配置](../getting-started/configuration.md) | `config('app.name')` | `facades.Config().GetString("app.name")` |
| [Crypt](../security/encryption.md) | `Crypt::encryptString('text')` | `facades.Crypt().EncryptString("text")` |
| [数据库](../database/getting-started.md) | `DB::table('users')->get()` | `facades.DB().Table("users").Get(&users)` |
| [事件系统](../digging-deeper/event.md) | `OrderShipped::dispatch()` | `facades.Event().Job(&events.OrderShipped{}, []event.Arg{}).Dispatch()` |
| [数据工厂](../orm/factories.md) | `User::factory()->make()` | `facades.Orm().Factory().Make(&user)` |
| [文件存储](../digging-deeper/filesystem.md) | `Storage::put('file.txt', 'content')` | `facades.Storage().Put("file.txt", "content")` |
| [Hash](../security/hashing.md) | `Hash::make('password')` | `facades.Hash().Make("password")` |
| [HTTP 客户端](../digging-deeper/http-client.md) | `Http::get('https://example.com')` | `facades.Http().Get("https://example.com")` |
| [本地化](../digging-deeper/localization.md) | `__('messages.welcome')` | `facades.Lang(ctx).Get("messages.welcome")` |
| [日志](../the-basics/logging.md) | `Log::info('message')` | `facades.Log().Info("message")` |
| [邮件](../digging-deeper/mail.md) | `Mail::to('user@example.com')->send(new OrderShipped())` | `facades.Mail().To([]string{"user@example.com"}).Send()` |
| [数据库迁移](../database/migrations.md) | `php artisan migrate` | `./artisan migrate` |
| [Mock](../testing/mock.md) | `Cache::shouldReceive('get')` | `mock.Factory().Cache()` |
| [ORM](../orm/getting-started.md) | `User::find(1)` | `facades.Orm().Query().Find(&user, 1)` |
| [扩展包开发](../digging-deeper/package-development.md) | `$this->loadViewsFrom($path, 'courier')` | `facades.View().LoadViewsFrom("/path/to/package/views")` |
| [进程](../digging-deeper/processes.md) | `Process::run('ls -la')` | `facades.Process().Run("ls", "-la")` |
| [队列](../digging-deeper/queues.md) | `SendEmail::dispatch()` | `facades.Queue().Job(&jobs.SendEmail{}, []queue.Arg{}).Dispatch()` |
| [速率限制](../the-basics/routing.md#rate-limiting) | `RateLimiter::for('global', ...)` | `facades.RateLimiter().For("global", ...)` |
| [路由](../the-basics/routing.md) | `Route::get('/', [Controller::class, 'index'])` | `facades.Route().Get("/", controller.Index)` |
| [数据填充](../database/seeding.md) | `$this->call([UserSeeder::class])` | `facades.Seeder().Call([]seeder.Seeder{&UserSeeder{}})` |
| [Session](../the-basics/session.md) | `session(['key' => 'value'])` | `ctx.Request().Session().Put("key", "value")` |
| [任务调度](../digging-deeper/task-scheduling.md) | `Schedule::command('emails:send')->daily()` | `facades.Schedule().Command("emails:send").Daily()` |
| [测试](../testing/getting-started.md) | `$this->get('/tasks')` | `s.Http(s.T()).Get("/tasks")` |
| [表单验证](../the-basics/validation.md) | `$request->validate([...])` | `ctx.Request().ValidateRequest(&storePost)` |
| [视图](../the-basics/views.md) | `view('welcome')` | `ctx.Response().View().Make("welcome.tmpl")` |
| [Grpc](../the-basics/grpc.md) | <Brand laravel no /> 未内置 | `facades.Grpc().Connect("user")` |
| 通知 | `$user->notify(new InvoicePaid())` | <Brand goravel no /> 暂未支持 |
| 广播 | `broadcast(new OrderShipped($order))` | <Brand goravel no /> 暂未支持 |
| Livewire | `<livewire:counter />` | <Brand goravel no /> 暂未支持 |
