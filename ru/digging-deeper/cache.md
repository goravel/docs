# Кэш (Cache)

[[toc]]

## Введение

Goravel предоставляет расширяемый модуль кэширования, который может быть использован с помощью `facades.Cache()`. В состав Goravel входит драйвер `memory` для кэширования, а для других драйверов можно проверить соответствующие независимые пакеты расширений:

| Драйвер       | Ссылка           |
| -----------  | -------------- |
| Redis        | https://github.com/goravel/redis     |

## Настройка

Вы можете выполнять все пользовательские настройки в файле `config/cache.go`.

## Использование кэша

### Внедрение контекста

```go
facades.Cache().WithContext(ctx)
```

### Доступ к нескольким хранилищам кэша

Вы можете получить доступ к различным хранилищам кэша через метод `Store`. Ключ, переданный методу `Store`, должен соответствовать одному из хранилищ, перечисленных в массиве конфигурации `stores` в файле конфигурации кэша:

```go
value := facades.Cache().Store("redis").Get("foo")
```

### Получение элементов из кэша

```go
value := facades.Cache().Get("goravel", "default")
value := facades.Cache().GetBool("goravel", true)
value := facades.Cache().GetInt("goravel", 1)
value := facades.Cache().GetString("goravel", "default")
```

Вы можете передать `func` в качестве значения по умолчанию. Если указанных данных нет в кэше, будет возвращен результат `func`. Метод транзитивного замыкания позволяет получить значения по умолчанию из базы данных или других внешних служб. Обратите внимание на структуру замыкания `func() interface{}`.

```go
value := facades.Cache().Get("goravel", func() interface{} {
    return "default"
})
```

### Проверка наличия элемента

```go
bool := facades.Cache().Has("goravel")
```

### Увеличение / уменьшение значений

Методы `Increment` и `Decrement` могут использоваться для изменения значения целочисленных элементов в кэше. Оба этих метода принимают необязательный второй аргумент, указывающий величину, на которую нужно увеличить или уменьшить значение элемента:

```go
facades.Cache().Increment("key")
facades.Cache().Increment("key", amount)
facades.Cache().Decrement("key")
facades.Cache().Decrement("key", amount)
```

### Получение и сохранение

Иногда вам может понадобиться получить данные из кэша, и когда запрашиваемого элемента кэша нет, программа может автоматически сохранить значение по умолчанию для вас.

```go
value, err := facades.Cache().Remember("goravel", 5 * time.Second, func() interface{} {
    return "goravel"
})
```

Если запрашиваемых данных нет в кэше, будет выполнено замыкание, переданное методу `Remember`, и затем результат будет возвращен и помещен в кэш.

Вы можете использовать метод `RememberForever` для получения данных из кэша или их постоянного сохранения:

```go
value, err := facades.Cache().RememberForever("goravel", func() interface{} {
    return "default"
})
```

### Получение и удаление

```go
value := facades.Cache().Pull("goravel", "default")
```

### Сохранение элементов в кэше

```go
err := facades.Cache().Put("goravel", "value", 5 * time.Second)
```

Если время истечения кэша установлено в `0`, кэш будет действителен вечно:

```go
err := facades.Cache().Put("goravel", "value", 0)
```

### Сохранить, если не присутствует

Метод `Add` будет сохранять только те данные, которых нет в кэше. Если сохранение успешно, он вернет `true`, в противном случае - `false`:

```go
bool := facades.Cache().Add("goravel", "value", 5 * time.Second)
``

`

### Сохранение элементов навсегда

Метод `Forever` может использоваться для постоянного сохранения данных в кэше. Поскольку эти данные не истекают, их необходимо удалить вручную из кэша с помощью метода `Forget`:

```go
bool := facades.Cache().Forever("goravel", "value")
```

### Удаление элементов из кэша

```go
bool := facades.Cache().Forget("goravel")
```

Вы можете использовать метод `Flush` для очистки всех кэшей:

```go
bool := facades.Cache().Flush()
```

## Атомарные блокировки

### Управление блокировками

Атомарные блокировки позволяют манипулировать распределенными блокировками, не беспокоясь о гонках. Вы можете создавать и управлять блокировками с помощью метода `Lock`:

```go
lock := facades.Cache().Lock("foo", 10*time.Second)

if (lock.Get()) {
    // Блокировка захвачена на 10 секунд...

    lock.Release()
}
```

Метод `Get` также принимает замыкание. После выполнения замыкания Goravel автоматически освободит блокировку:

```go
facades.Cache().Lock("foo").Get(func () {
    // Блокировка захвачена на 10 секунд и автоматически освобождена...
});
```

Если блокировка в данный момент недоступна, вы можете указать Goravel ожидать в течение определенного количества секунд. Если блокировка не может быть получена в течение указанного времени, будет возвращено `false`:

```go
lock := facades.Cache().Lock("foo", 10*time.Second)
// Блокировка захвачена после ожидания в течение 5 секунд...
if (lock.Block(5*time.Second)) {
    lock.Release()
}
```

Приведенный выше пример может быть упрощен, передав замыкание методу `Block`. Когда замыкание передается этому методу, Goravel будет пытаться получить блокировку в течение указанного количества секунд и автоматически освободит блокировку после выполнения замыкания:

```go
facades.Cache().Lock("foo", 10*time.Second).Block(5*time.Second, func () {
    // Блокировка захвачена после ожидания в течение 5 секунд...
})
```

Если вы хотите освободить блокировку, не учитывая ее текущего владельца, вы можете использовать метод `ForceRelease`:

```go
facades.Cache().Lock("processing").ForceRelease()
```

## Добавление пользовательских драйверов кэша

### Настройка

Если вы хотите определить полностью пользовательский драйвер, вы можете указать тип драйвера `custom` в файле конфигурации `config/cache.go`.
Затем включите опцию `via` для реализации интерфейса `framework\contracts\cache\Store`:

```go
//config/cache.go
"stores": map[string]interface{}{
    "redis": map[string]interface{}{
        "driver":     "redis",
        "connection": "default",
    },
    "custom": map[string]interface{}{
        "driver": "custom",
        "via":    &Logger{},
    },
},
```

### Реализация пользовательского драйвера

Реализуйте интерфейс `framework\contracts\cache\Store`. Файлы могут быть сохранены в папке `app/extensions` (можно изменять).

```go
//framework\contracts\cache\Store
package cache

import "time"

type Store interface {
    WithContext(ctx context.Context) Store
    //Get Retrieve an item from the cache by key.
    Get(key string, defaults interface{}) interface{}
    GetBool(key string, defaults bool) bool
    GetInt(key string, defaults interface{}) int
    GetString(key string, defaults interface{}) string
    //Has Determine if an item exists in the cache.
    Has(key string) bool
    //Put Store an item in the cache for a given number of seconds.
    Put(key string, value interface{}, seconds time.Duration) error
    //Pull Retrieve an item from the cache and delete it.
    Pull(key string, defaults interface{}) interface{}
    //Add Store an item in the cache if the key does not exist.
    Add(key string, value interface{}, seconds time.Duration) bool
    //Remember Get an item from the cache, or execute the given Closure and store the result.
    Remember(key string, ttl time.Duration, callback func() interface{}) (interface{}, error)
    //RememberForever Get an item from the cache, or execute the given Closure and store the result forever.
    RememberForever(key string, callback func() interface{}) (interface{}, error)
    //Forever Store an item in the cache indefinitely.
    Forever(key string, value interface{}) bool
    //Forget Remove an item from the cache.
    Forget(key string) bool
    //Flush Remove all items from the cache.
    Flush() bool
}
```

<CommentService/>