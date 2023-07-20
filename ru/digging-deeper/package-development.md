# Разработка пакетов

[[toc]]

## Введение

Пакеты - это основной способ добавления функциональности в Goravel. Эти пакеты могут содержать маршруты, контроллеры и конфигурацию, специально предназначенные для расширения приложения Goravel. Это руководство в первую очередь охватывает разработку пакетов, специфичных для Goravel. Есть пример создания третьего пакета: [goravel/example-package](https://github.com/goravel/example-package).

## Создание пакета

Вы можете легко создать шаблон пакета с помощью команды Artisan:

```
go run . artisan make:package sms
```

Созданные файлы по умолчанию сохраняются в корневом каталоге `packages`, вы можете использовать опцию `--root` для настройки пути:

```
go run . artisan make:package sms --root=pkg
```

## Провайдеры служб

[Провайдеры служб](../architecture-concepts/service-providers.md) являются точками подключения между вашим пакетом и Goravel. Обычно они находятся в корневом каталоге пакета: `service_provider.go`. Провайдер служб отвечает за привязку компонентов в контейнер служб Goravel и за информирование Goravel о том, где загружать ресурсы пакета.

## Ресурсы

### Конфигурация

Обычно вам нужно опубликовать файл конфигурации пакета в каталоге `config` приложения. Это позволит пользователям вашего пакета легко изменять настройки по умолчанию. Чтобы разрешить публикацию файлов конфигурации, вызовите метод `Publishes` из метода `Boot` вашего провайдера службы, первый параметр этого метода - имя пакета, второй параметр - это сопоставление между текущим путем к файлу пакета и путем к файлу проекта:

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "config/sms.go": app.ConfigPath("sms.go"),
  })
}
```

### Маршруты

Если в вашем пакете есть [маршруты](../the-basics/routing.md), вы можете использовать `app.MakeRoute()` для получения экземпляра `facades.Route()`, а затем добавить маршруты в проект:

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
	route := app.MakeRoute()
	route.Get("sms", ***)
}
```

### Миграции

Если в вашем пакете есть [миграции](../orm/migrations.md), вы можете опубликовать их с помощью метода `Publishes`:

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "migrations": app.DatabasePath("migrations"),
  })
}
```

## Команды

Вы можете зарегистрировать команды `Artisan` с помощью метода `Commands`, после регистрации вы можете выполнять команды с помощью [CLI Artisan](../digging-deeper/artisan-console.md).

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
	app.Commands([]console.Command{
		commands.NewSmsCommand(),
	})
}
```

## Общедоступные ресурсы

В вашем пакете может быть ресурсы, такие как JavaScript, CSS и изображения. Чтобы опубликовать эти ресурсы в каталоге `public` приложения, используйте метод `Publishes` провайдера службы:

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "public": app.PublicPath("vendor"),
  })
}
```

## Публикация групп файлов

Вы можете публиковать группы ресурсов пакета отдельно. Например, вы можете позволить пользователям вашего пакета публиковать файлы конфигурации без публикации ресурсов пакета.

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "config/sms.go": app.ConfigPath("sms.go"),
  }, "sms-config")
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "migrations": app.DatabasePath("migrations"),
  }, "sms-migrations")
}
```

## Публикация ресурсов

В вашем проекте вы можете публиковать ресурсы, зарегистрированные в пакете, с помощью команды Artisan `vendor:publish`:

```
go run . artisan vendor:publish --package={имя вашего пакета}
```

Команда поддерживает следующие опции:

| Имя опции   | Алиас  | Описание           |
| -----------  | ------ | -------------- |
| --package    | -p     | Имя пакета, может быть удаленным пакетом: `github.com/goravel/example-package`, а также локальным пакетом: `./packages/example-package`, обратите внимание, что при использовании имени локального пакета оно должно начинаться с `./`.     |
| --tag        | -t     | Группа ресурсов     |
| --force      | -f     | Перезаписать существующие файлы     |
| --existing   | -e     | Публикация и перезапись только файлов, которые уже были опубликованы 

<CommentService/>