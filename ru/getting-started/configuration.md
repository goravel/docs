# Конфигурация

[[toc]]

## Введение

Все файлы конфигурации фреймворка Goravel хранятся в директории `config`. Вы можете просматривать специфичные инструкции и гибко настраивать их в соответствии с потребностями проекта.

## Конфигурация окружения

Запуск приложений в разных окружениях обычно требует различных конфигураций. Например, вы можете хотеть включить режим отладки локально, но вам не понадобится это в производственной среде.

Поэтому фреймворк предоставляет файл `.env.example` в корневой директории. Вы должны скопировать этот файл и переименовать его в `.env` перед началом разработки и изменить элементы конфигурации в файле `.env` в соответствии с потребностями вашего проекта.

Обратите внимание, что файл `.env` не следует добавлять в систему контроля версий, потому что при совместной работе нескольких человек разные разработчики могут использовать разные конфигурации, а также разные конфигурации для развертывания.

Кроме того, если злоумышленник получит доступ к вашему репозиторию кода, будет риск выставления наружу чувствительной конфигурации. Если вы хотите добавить новый элемент конфигурации, вы можете добавить его в файл `.env.example`, чтобы синхронизировать конфигурацию всех разработчиков.

## Получение конфигурации окружения

Используйте следующий метод для получения элементов конфигурации в файле `.env`:

```
// Первый параметр - ключ конфигурации, второй параметр - значение по умолчанию
facades.Config().Env("APP_NAME", "goravel")
```

## Доступ к значениям конфигурации

Вы можете легко использовать глобальную функцию `facades.Config()` в любом месте приложения для доступа к значениям конфигурации в директории `config`. Для доступа к значению конфигурации можно использовать синтаксис с точкой. Вы также можете указать значение по умолчанию, если опция конфигурации не существует, будет возвращено значение по умолчанию:

```
// Получить конфигурацию типа строка
facades.Config().GetString("app.name", "goravel")

// Получить конфигурацию типа int
facades.Config().GetInt("app.int", 1)

// Получить конфигурацию типа bool
facades.Config().GetBool("app.debug", true)
```

## Установка конфигурации

```go
facades.Config().Add("path", "value1")
facades.Config().Add("path.with.dot.case1", "value1")
facades.Config().Add("path.with.dot", map[string]any{"case3": "value3"})
```

<CommentService/>