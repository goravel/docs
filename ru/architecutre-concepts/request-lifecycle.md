# Жизненный цикл запроса

[[toc]]

## Введение

Все запросы входа в приложение Goravel начинаются с файла `main.go`, который использует `bootstrap.Boot()` для запуска загрузки фреймворка.

Затем создается экземпляр Goravel с помощью `app := foundation.Application{}` в скрипте `bootstrap/app.go`.

Используйте `app.Boot()` для загрузки зарегистрированных [поставщиков служб](service-providers.md), а также используйте `config.Boot()` для загрузки файлов конфигурации из каталога `config`.

Наконец, в файле `main.go` используйте `facades.Route().Run(facades.Config().GetString("app.host"))` для запуска HTTP-сервера.

<CommentService/>