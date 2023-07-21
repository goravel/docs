# Начало работы

[[toc]]

 ## Введение
Goravel предоставляет очень простой способ взаимодействия с базами данных. Разработчики могут использовать  `facades.Orm()`  для работы. В настоящее время Goravel официально поддерживает следующие четыре базы данных:

- MySQL 5.7+
- PostgreSQL 9.6+
- SQLite 3.8.8+
- SQL Server 2017+

Перед началом работы, пожалуйста, настройте базу данных в файле `.env` и проверьте конфигурацию по умолчанию в файле `config/database.go`.

# Конфигурация

Настройки баз данных находятся в файле `config/database.go`. Вы можете настроить все подключения к базам данных в этом файле и указать базовое подключение к базе данных. Большая часть конфигурации в этом файле основана на переменных окружения проекта и предоставляет примеры конфигураций баз данных, поддерживаемых Goravel.

### Соединения чтения и записи

Иногда вам может понадобиться использовать одно подключение к базе данных для операторов `SELECT`, а другое - для операторов `INSERT`, `UPDATE` и `DELETE`. Goravel упрощает эту задачу.

Чтобы увидеть, как должны быть настроены соединения чтения и записи, давайте рассмотрим следующий пример:

```
import "github.com/goravel/framework/contracts/database"

// config/database.go
"connections": map[string]any{
  "mysql": map[string]any{
    "driver": "mysql",
    "read": []database.Config{
      {Host: "192.168.1.1", Port: 3306, Database: "forge", Username: "root", Password: "123123"},
    },
    "write": []database.Config{
      {Host: "192.168.1.2", Port: 3306, Database: "forge", Username: "root", Password: "123123"},
    },
    "host": config.Env("DB_HOST", "127.0.0.1"),
    "port":     config.Env("DB_PORT", 3306),
    "database": config.Env("DB_DATABASE", "forge"),
    "username": config.Env("DB_USERNAME", ""),
    "password": config.Env("DB_PASSWORD", ""),
    "charset":  "utf8mb4",
    "loc":      "Local",
  },
}
```

Конфигурации массива были добавлены два ключа: `read` и `write`. В качестве хоста для соединения "read" будет использован `192.168.1.1`, а для соединения "write" - `192.168.1.2`. Префикс базы данных, кодировка символов и все другие опции в массиве `mysql` будут использованы в обоих соединениях. Когда в массиве конфигурации `host` существует несколько значений, хост базы данных будет выбран случайным образом для каждого запроса.

### Пул подключений

Вы можете настроить пул подключений в файле конфигурации, разумная настройка параметров пула подключений может существенно улучшить производительность параллелизма:

| Ключ        | Действие           |
| -----------  | -------------- |
| pool.max_idle_conns         | Максимальное количество простаивающих соединений    |
| pool.max_open_conns     | Максимальное количество открытых соединений |
| pool.conn_max_idletime     | Максимальное время простоя соединений |
| pool.conn_max_lifetime     | Максимальное время жизни соединений  |

## Определение модели

Вы можете создать пользовательскую модель на основе файла модели `app/models/user.go`, который идет в комплекте с фреймворком. В файле `app/models/user.go` `struct` имеет вложенные два фреймворка, `orm.Model` и `orm.SoftDeletes`, они определяют соответственно `id, created_at, updated_at` и `deleted_at`, `orm.SoftDeletes` означает, что мягкое удаление включено для модели.

### Конвенция модели

1. Название модели имеет большую горбину;
2. Используйте множественное число "змеиного наименования" модели в качестве имени таблицы;

Например, имя модели `UserOrder`, имя таблицы - `user_orders`.

### Создание модели

```
go run . artisan make:model User
go run . artisan make:model user/User
```

### Указание имени таблицы

```go
package models

import (
  "github.com/goravel/framework/database/orm"
)

type User struct {
  orm.Model
  Name   string
  Avatar string
  orm.SoftDeletes
}

func (r *User) TableName() string {
  return "goravel_user"
}
```

## Доступные функции facades.Orm

| Название        | Действие                                                      |
| ----------- | ----------------------------------------------------------- |
| Connection  | [Указать подключение к базе данных](#указать-подключение-к-базе-данных) |
| DB          | [Общий интерфейс базы данных sql.DB](#общий-интерфейс-базы-данных-sqldb) |
| Query       | [Получить экземпляр базы данных](#получить-экземпляр-базы-данных)             |
| Transaction |

 [Транзакция](#транзакция)                                 |
| WithContext | [Внедрение контекста](#внедрение-контекста)                           |

## Доступные функции facades.Orm().Query и facades.Orm().Transaction

| Функции     | Действие                                                  |
| ------------- | ------------------------------------------------------- |
| Begin         | [Начать транзакцию](#транзакция)                       |
| Commit        | [Зафиксировать транзакцию](#транзакция)                      |
| Count         | [Количество](#количество)                                         |
| Create        | [Создать](#создать)                                       |
| Delete        | [Удалить](#удалить)                                       |
| Distinct      | [Фильтр повторений](#фильтр-повторений)                 |
| Driver        | [Получить драйвер](#получить-драйвер)                               |
| Exec          | [Выполнить собственный SQL для обновления](#выполнить-собственный-sql-для-обновления) |
| Find          | [Запросить одну или несколько строк по ID](#запросить-одну-или-несколько-строк-по-id)            |
| FindOrFail    | [Вернуть ошибку, если не найдено](#вернуть-ошибку-если-не-найдено)            |
| First         | [Запросить одну строку](#запросить-одну-строку)                       |
| FirstOr | [Запросить или вернуть данные через колбэк](#запросить-одну-строку)                     |
| FirstOrCreate | [Получение или создание моделей](#получение-или-создание-моделей)                     |
| FirstOrNew | [Получение или создание моделей](#получение-или-создание-моделей)                     |
| FirstOrFail | [Ошибка при отсутствии](#ошибка-при-отсутствии)                     |
| ForceDelete   | [Форсированное удаление](#удалить)                                 |
| Get           | [Запросить несколько строк](#запросить-несколько-строк)           |
| Group         | [Группировка](#группировка-и-агрегаты)                             |
| Having        | [Условие группировки](#группировка-и-агрегаты)                            |
| Join          | [Присоединение](#присоединение)                                           |
| Limit         | [Ограничение](#ограничение)                                         |
| LockForUpdate | [Ограничение пессимистической блокировки](#ограничение-пессимистической-блокировки)           |
| Model         | [Указать модель](#указать-таблицу-запроса)                 |
| Offset        | [Смещение](#смещение)                                       |
| Order         | [Сортировка](#сортировка)                                         |
| OrWhere       | [Или условие](#условие)                                       |
| Paginate      | [Постраничный вывод](#постраничный-вывод)             |
| Pluck         | [Запрос одного столбца](#запрос-одного-столбца)             |
| Raw           | [Выполнить собственный SQL](#выполнить-собственный-sql)               |
| Rollback      | [Откат транзакции](#транзакция)                    |
| Save          | [Обновить существующую модель](#обновить-существующую-модель)                  |
| SaveQuietly          | [Сохранение одной модели без событий](#сохранение-одной-модели-без-событий)                  |
| Scan          | [Отобразить структуру](#выполнить-собственный-sql)                      |
| Scopes        | [Области видимости](#выполнить-собственный-sql)                           |
| Select        | [Указать поля](#указать-поля)                       |
| SharedLock | [Ограничение пессимистической блокировки](#ограничение-пессимистической-блокировки)           |
| Table         | [Указать таблицу](#указать-таблицу-запроса)                 |
| Update        | [Обновить один столбец](#обновить-один-столбец)                   |
| UpdateOrCreate       | [Обновить или создать](#обновить-или-создать)                  |
| Where         | [Условие](#условие)                                         |
| WithoutEvents | [Отключение событий](#отключение-событий)               |
| WithTrashed   | [Запрос данных мягкого удаления](#запрос-данных-мягкого-удаления)       |

## Строитель запросов

### Внедрение контекста

```go
facades.Orm().WithContext(ctx)
```

### Указать подключение к базе данных

Если вы определили несколько подключений к базе данных в файле `config/database.go`, вы можете использовать их через функцию `Connection` объекта `facades.Orm()`. Имя подключения, переданное в `Connection`, должно быть одним из подключений, настроенных в `config/database.go`:

```go
facades.Orm().Connection("mysql")
```

### Общий интерфейс базы данных sql.DB

Общий интерфейс базы данных sql.DB позволяет использовать функциональность, которую он предоставляет:

```go
db, err := facades.Orm().DB()
db, err := facades.Orm().Connection("mysql").DB()

// Ping
db.Ping()

// Close
db.Close()

// Возвращает статистику базы данных
db.Stats()

// SetMaxIdleConns устанавливает максимальное количество простаивающих соединений в пуле
db.SetMaxIdleConns(10)

// SetMaxOpenConns устанавливает максимальное количество открытых соединений с базой данных
db.SetMaxOpenConns(100)

// SetConnMaxLifetime устанавливает максимальное время, в течение которого соединение может быть использовано повторно
db.SetConnMaxLifetime(time.Hour)
```

### Получить экземпляр базы данных

Перед каждой конкретной операцией с базой данных необходимо получить экземпляр базы данных.

```go
facades.Orm().Query()
facades.Orm().Connection("mysql").Query()
facades.Orm().WithContext(ctx).Query()
```

### Выбрать

#### Запросить одну строку

```go
var user models.User
facades.Orm().Query().First(&user)
// SELECT * FROM users WHERE id = 10;
```

Иногда вы можете захотеть выполнить другое действие, если результаты не найдены. Методы findOr и firstOr вернут один экземпляр модели или, если результаты не найдены, выполнит указанное замыкание. Вы можете установить значения для модели внутри замыкания:

```go
facades.Orm().Query().Where("name", "first_user").FirstOr(&user, func() error {
  user.Name = "goravel"

  return nil
})
```

#### Запрос одной или нескольких строк по ID

```go
var user models.User
facades.Orm().Query().Find(&user, 1)
// SELECT * FROM users WHERE id = 1;

var users []models.User
facades.Orm().Query().Find(&users, []int{1,2,3})
// SELECT * FROM users WHERE id IN (1,2,3);
```

#### Возврат ошибки, если не найдено

```go
var user models.User
err := facades.Orm().Query().FindOrFail(&user, 1)
```

#### Когда первичный ключ таблицы пользователей имеет тип `string`, необходимо указать первичный ключ при вызове метода `Find`

```go
var user models.User
facades.Orm().Query().Find(&user, "uuid=?", "a")
// SELECT * FROM users WHERE uuid = "a";
```

#### Запрос нескольких строк

```go
var users []models.User
facades.Orm().Query().Where("id in ?", []int{1,2,3}).Get(&users)
// SELECT * FROM users WHERE id IN (1,2,3);
```

#### Получение или создание моделей

Метод `FirstOrCreate` попытается найти запись в базе данных с использованием указанных пары столбец / значение. Если модель не будет найдена в базе данных, будет вставлена запись с атрибутами, полученными путем объединения первого аргумента с необязательным вторым аргументом:

Метод `FirstOrNew`, как и `FirstOrCreate`, попытается найти запись в базе данных, соответствующую заданным атрибутам. Однако, если модель не будет найдена, будет возвращен новый экземпляр модели. Обратите внимание, что модель, возвращаемая `FirstOrNew`, еще не была сохранена в базе данных. Вам нужно вручную вызвать метод `Save`, чтобы сохранить ее:

```go
var user models.User
facades.Orm().Query().Where("sex", 1).FirstOrCreate(&user, models.User{Name: "tom"})
// SELECT * FROM users where name="tom" and sex=1;
// INSERT INTO users (name) VALUES ("tom");

facades.Orm().Query().Where("sex", 1).FirstOrCreate(&user, models.User{Name: "tom"}, models.User{Avatar: "avatar"})
// SELECT * FROM users where name="tom" and sex=1;
// INSERT INTO users (name,avatar) VALUES ("tom", "avatar");

var user models.User
facades.Orm().Query().Where("sex", 1).FirstOrNew(&user, models.User{Name: "tom"})
// SELECT * FROM users where name="tom" and sex=1;

facades.Orm().Query().Where("sex", 1).FirstOrNew(&user, models.User{Name: "tom"}, models.User{Avatar: "avatar"})
// SELECT * FROM users where name="tom" and sex=1;
```

#### Ошибка при отсутствии

Когда модель не найдена, `First` не возвращает ошибку. Если вы хотите вернуть ошибку, вы можете использовать `FirstOrFail`:

```go
var user models.User
err := facades.Orm().Query().FirstOrFail(&user)
// err == orm.ErrRecordNotFound
```

### Условие

```go
facades.Orm().Query().Where("name", "tom")
facades.Orm().Query().Where("name = 'tom'")
facades.Orm().Query().Where("name = ?", "tom")

facades.Orm().Query().OrWhere("name = ?", "tom")
```

### Ограничение

```go
var users []models.User
facades.Orm().Query().Where("name = ?", "tom").Limit(3).Get(&users)
// SELECT * FROM users WHERE name = "tom" LIMIT 3;
```

### Смещение

```go
var users []models.User
facades.Orm().Query().Where("name = ?", "tom").Offset(5).Limit(3).Get(&users)
// SELECT * FROM users WHERE name = "tom" OFFSET 5 LIMIT 3;
```

### Сортировка

```go
var users []models.User
facades.Orm().Query().Where("name = ?", "tom").Order("sort asc").Order("id desc").Get(&users)
// SELECT * FROM users WHERE name = "tom" order sort asc, id desc;
```

### Постраничный вывод

```go
var users []models.User
var total int64
facades.Orm().Query().Paginate(1, 10, &users, &total)
// SELECT count(*) FROM `users`;
// SELECT * FROM `users` LIMIT 10;
```

### Запрос одного столбца

```go
var ages []int64
facades.Orm().Query().Model(&models.User{}).Pluck("age", &ages)
// SELECT `name` FROM `users`;
```

### Указать таблицу запроса

Если вы хотите запросить некоторые агрегированные данные, вам необходимо указать конкретную таблицу.

Указать модель

```go
var count int64
facades.Orm().Query().Model(&models.User{}).Count(&count)
// SELECT count(1) where users
```

Указать таблицу

```go
var count int
facades.Orm().Query().Table("users").Count(&count)
// SELECT count(1) where users
```

### Количество

```go
var count int64
facades.Orm().Query().Where("name = ?", "tom").Count(&count)
// SELECT count(1) FROM users WHERE name = 'tom'
```

### Указать поля

`Select` позволяет указать, какие поля получить из базы данных. По умолчанию ORM извлекает все поля.

```go
facades.Orm().Query().Select("name", "age").Get(&users)
// SELECT name, age FROM users;

facades.Orm().Query().Select([]string{"name", "age"}).Get(&users)
// SELECT name, age FROM users;
```

### Группировка и условие группировки

```go
type Result struct {
  Name  string
  Total int
}

var result Result
facades.Orm().Query().Model(&models.User{}).Select("name, sum(age) as total").Group("name").Having("name = ?", "tom").Get(&result)
// SELECT name, sum(age) as

 total FROM `users` GROUP BY `name` HAVING name = "tom"
```

### Join

```go
type Result struct {
  Name  string
  Email string
}

var result Result
facades.Orm().Query().Model(&models.User{}).Select("users.name, emails.email").Joins("left join emails on emails.user_id = users.id").Scan(&result)
// SELECT users.name, emails.email FROM `users` left join emails on emails.user_id = users.id
```

### Создание записи

```go
user := User{Name: "tom", Age: 18}
result := facades.Orm().Query().Create(&user)
// INSERT INTO users (name, age, created_at, updated_at) VALUES ("tom", 18, "2022-09-27 22:00:00", "2022-09-27 22:00:00");
```

Множественное создание

```go
users := []User{{Name: "tom", Age: 18}, {Name: "tim", Age: 19}}
result := facades.Orm().Query().Create(&users)
```

> Поля `created_at` и `updated_at` будут заполнены автоматически.

### Сохранение модели

#### Обновление существующей модели

```go
var user models.User
facades.Orm().Query().First(&user)

user.Name = "tom"
user.Age = 100
facades.Orm().Query().Save(&user)
// UPDATE users SET name='tom', age=100, updated_at = '2022-09-28 16:28:22' WHERE id=1;
```

#### Обновление одного столбца

```go
facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Update("name", "hello")
// UPDATE users SET name='tom', updated_at='2022-09-28 16:29:39' WHERE name="tom";

facades.Orm().Query().Model(&models.User{}).Where("name", "tom").Update(User{Name: "hello", Age: 18})
// UPDATE users SET name="hello", age=18, updated_at = '2022-09-28 16:30:12' WHERE name = "tom";
```

> При обновлении с использованием `struct`, Orm будет обновлять только те поля, которые имеют ненулевые значения. Вы можете использовать `map` для обновления атрибутов или использовать `Select`, чтобы указать поля для обновления. Обратите внимание, что `struct` может быть только `Model`, если вы хотите обновить с помощью не `Model`, вам нужно использовать `.Table("users")`, однако поле `updated_at` в настоящее время не может быть обновлено автоматически.

#### Обновление или создание

Запрос по имени `name`, если не существует, создание по `name`, `avatar`, если существует, обновление `avatar` на основе `name`:

```go
facades.Orm().Query().UpdateOrCreate(&user, User{Name: "name"}, User{Avatar: "avatar"})
// SELECT * FROM `users` WHERE `users`.`name` = 'name' AND `users`.`deleted_at` IS NULL ORDER BY `users`.`id` LIMIT 1
// INSERT INTO `users` (`created_at`,`updated_at`,`deleted_at`,`name`,`avatar`) VALUES ('2023-03-11 10:11:08.869','2023-03-11 10:11:08.869',NULL,'name','avatar')
// UPDATE `users` SET `avatar`='avatar',`updated_at`='2023-03-11 10:11:08.881' WHERE `name` = 'name' AND `users`.`deleted_at` IS NULL AND `id` = 1
```

### Удаление

Удаление по модели, метод возвращает количество затронутых строк:

```go
var user models.User
facades.Orm().Query().Find(&user, 1)
res, err := facades.Orm().Query().Delete(&user)
// DELETE FROM users where id = 1;

num := res.RowsAffected
```

Удаление по ID

```go
facades.Orm().Query().Delete(&models.User{}, 10)
// DELETE FROM users WHERE id = 10;

facades.Orm().Query().Delete(&models.User{}, []int{1, 2, 3})
// DELETE FROM users WHERE id in (1, 2, 3);
```

Множественное удаление

```go
facades.Orm().Query().Where("name = ?", "tom").Delete(&models.User{})
// DELETE FROM users where name = "tom";
```

Хотите принудительно удалить записи с мягким удалением.

```go
facades.Orm().Query().Where("name = ?", "tom").ForceDelete(&models.User{})
```

Вы можете удалить записи с ассоциациями модели через `Select`:

```go
// Удалить аккаунт пользователя при удалении пользователя
facades.Orm().Query().Select("Account").Delete(&user)

// Удалить заказы и кредитные карты пользователя при удалении пользователя
facades.Orm().Query().Select("Orders", "CreditCards").Delete(&user)

// Удалить все дочерние ассоциации пользователя при удалении пользователя
facades.Orm().Query().Select(orm.Associations).Delete(&user)

// Удалить все аккаунты пользователей при удалении пользователей
facades.Orm().Query().Select("Account").Delete(&users)
```

Примечание: ассоциации будут удалены только в том случае, если первичный ключ записи не пустой, и Orm использует эти первичные ключи как условия для удаления связанных записей:

```go
// Удалить пользователя с именем `jinzhu`, но не удалять аккаунт пользователя
facades.Orm().Query().Select("Account").Where("name = ?", "jinzhu").Delete(&User{})

// Удалить пользователя с именем `jinzhu` и id = `1`, и удалить аккаунт пользователя
facades.Orm().Query().Select("Account").Where("name = ?", "jinzhu").Delete(&User{ID: 1})

// Удалить пользователя с id = `1` и удал

ить аккаунт пользователя
facades.Orm().Query().Select("Account").Delete(&User{ID: 1})
```

Если выполнить пакетное удаление без каких-либо условий, ORM этого не делает и возвращает ошибку. Поэтому вам нужно добавить некоторые условия или использовать нативный SQL.

### Запрос данных мягкого удаления

```go
var user models.User
facades.Orm().Query().WithTrashed().First(&user)
```

### Фильтрация повторов

```go
var users []models.User
facades.Orm().Query().Distinct("name").Find(&users)
```

### Получение драйвера

```go
driver := facades.Orm().Query().Driver()

// Проверка драйвера
if driver == orm.DriverMysql {}
```

### Выполнение SQL-запросов

```go
type Result struct {
  ID   int
  Name string
  Age  int
}

var result Result
facades.Orm().Query().Raw("SELECT id, name, age FROM users WHERE name = ?", "tom").Scan(&result)
```

### Выполнение обновления SQL-запросов

Метод возвращает количество затронутых строк:

```go
res, err := facades.Orm().Query().Exec("DROP TABLE users")
// DROP TABLE users;

num := res.RowsAffected
```

### Транзакция

Вы можете выполнить транзакцию с помощью функции `Transaction`.

```go
import (
  "github.com/goravel/framework/contracts/database/orm"
  "github.com/goravel/framework/facades"

  "goravel/app/models"
)

...

return facades.Orm().Transaction(func(tx orm.Transaction) error {
  var user models.User

  return tx.Find(&user, user.ID)
})
```

Вы также можете контролировать поток транзакции вручную:

```go
tx, err := facades.Orm().Query().Begin()
user := models.User{Name: "Goravel"}
if err := tx.Create(&user); err != nil {
  err := tx.Rollback()
} else {
  err := tx.Commit()
}
```

### Scopes

Позволяет задать часто используемые запросы, на которые можно ссылаться при вызове методов.

```go
func Paginator(page string, limit string) func(methods orm.Query) orm.Query {
  return func(query orm.Query) orm.Query {
    page, _ := strconv.Atoi(page)
    limit, _ := strconv.Atoi(limit)
    offset := (page - 1) * limit

    return query.Offset(offset).Limit(limit)
  }
}

facades.Orm().Query().Scopes(scopes.Paginator(page, limit)).Find(&entries)
```

### Raw-выражения

Вы можете использовать метод `db.Raw` для обновления полей:

```go
import "github.com/goravel/framework/database/db"

facades.Orm().Query().Model(&user).Update("age", db.Raw("age - ?", 1))
```

### Оптимистичная блокировка

Конструктор запросов также включает несколько функций, которые помогут вам осуществить "оптимистичную блокировку" при выполнении ваших `select`-запросов.

Чтобы выполнить оператор с "общей блокировкой", вы можете вызвать метод `SharedLock`. Общая блокировка предотвращает изменение выбранных строк до тех пор, пока ваша транзакция не будет подтверждена:

```go
var users []models.User
facades.Orm().Query().where("votes", ">", 100).SharedLock().Get(&users)
```

Также вы можете использовать метод `LockForUpdate`. Блокировка "для обновления" предотвращает изменение выбранных записей или их выбор с другой общей блокировкой:

```go
var users []models.User
facades.Orm().Query().where("votes", ">", 100).LockForUpdate().Get(&users)
```

## События

Модели Orm отправляют несколько событий, позволяющих подключаться к следующим моментам жизненного цикла модели: `Retrieved`, `Creating`, `Created`, `Updating`, `Updated`, `Saving`, `Saved`, `Deleting`, `Deleted`, `ForceDeleting`, `ForceDeleted`.

Событие `Retrieved` будет отправлено, когда существующая модель извлекается из базы данных. При первом сохранении новой модели будут отправлены события `Creating` и `Created`. События `Updating` / `Updated` будут отправлены, когда существующая модель изменяется и вызывается метод `Save`. События `Saving` / `Saved` будут отправлены, когда модель создается или обновляется - даже если атрибуты модели не были изменены. События с именами, заканчивающимися на `-ing`, отправляются до сохранения изменений модели, тогда как события, заканчивающиеся на `-ed`, отправляются после сохранения изменений модели.

Чтобы начать слушать события модели, определите метод `DispatchesEvents` в вашей модели. Это свойство отображает различные точки жизненного цикла модели на ваши собственные классы событий.

```go
import (
  contractsorm "github.com/goravel/framework/contracts/database/orm"
	"github.com/goravel/framework/database/orm"
)

type User struct {
	orm.Model
	Name    string
}

func (u *User) DispatchesEvents() map[contractsorm.EventType]func(contractsorm.Event) error {
	return map[contractsorm.EventType]func(contractsorm.Event) error{
		contractsorm.EventCreating: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventCreated: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventSaving: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventSaved: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventUpdating: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventUpdated: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventDeleting: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventDeleted: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventForceDeleting: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventForceDeleted: func(event contractsorm.Event) error {
			return nil
		},
		contractsorm.EventRetrieved: func(event contractsorm.Event) error {
			return nil
		},
	}
}
```

> Примечание: просто зарегистрируйте те события, которые вам нужны. События модели не отправляются при выполнении пакетных операций через Orm.

### Наблюдатели

#### Определение наблюдателей

Если вы слушаете много событий на данной модели, вы можете использовать наблюдателей для группировки всех своих слушателей в один класс. Классы наблюдателей имеют имена методов, которые отражают события Eloquent, которые вы хотите прослушать. Каждый из этих методов получает заданную модель в качестве своего единственного аргумента. Команда `make:observer` является наиболее простым способом создать новый класс наблюдателя:

```
go run . artisan make:observer UserObserver
go run . artisan make:observer user/UserObserver
```

Эта команда поместит нового наблюдателя в ваш каталог `app/observers`. Если этого каталога нет, Artisan создаст его за вас. Ваш новый наблюдатель будет выглядеть следующим образом:

```go
package observers

import (
	"fmt"

	"github.com/goravel/framework/contracts/database/orm"
)

type UserObserver struct{}

func (u *UserObserver) Retrieved(event orm.Event) error {
	return nil
}

func

 (u *UserObserver) Creating(event orm.Event) error {
	return nil
}

func (u *UserObserver) Created(event orm.Event) error {
	return nil
}

func (u *UserObserver) Updating(event orm.Event) error {
	return nil
}

func (u *UserObserver) Updated(event orm.Event) error {
	return nil
}

func (u *UserObserver) Saving(event orm.Event) error {
	return nil
}

func (u *UserObserver) Saved(event orm.Event) error {
	return nil
}

func (u *UserObserver) Deleting(event orm.Event) error {
	return nil
}

func (u *UserObserver) Deleted(event orm.Event) error {
	return nil
}

func (u *UserObserver) ForceDeleting(event orm.Event) error {
	return nil
}

func (u *UserObserver) ForceDeleted(event orm.Event) error {
	return nil
}
```

Чтобы зарегистрировать наблюдателя, вам нужно вызвать метод `Observe` на модели, которую вы хотите наблюдать. Вы можете зарегистрировать наблюдателей в методе `Boot` в провайдере сервисов вашего приложения `app/providers/event_service_provider.go::Boot`:

```go
package providers

import (
	"github.com/goravel/framework/facades"

	"goravel/app/models"
	"goravel/app/observers"
)

type EventServiceProvider struct {
}

func (receiver *EventServiceProvider) Register() {
	facades.Event().Register(receiver.listen())
}

func (receiver *EventServiceProvider) Boot() {
	facades.Orm().Observe(models.User{}, &observers.UserObserver{})
}

func (receiver *EventServiceProvider) listen() map[event.Event][]event.Listener {
	return map[event.Event][]event.Listener{}
}
```

> Примечание: Если вы установили одновременно `DispatchesEvents` и `Observer`, применится только `DispatchesEvents`.

#### Параметр в наблюдателе

Параметр `event` будет передан всем наблюдателям:

| Метод   | Действие                                                |
| -------- | ------------------------------------------------------- |
| Context  | Получить контекст, переданный через `facades.Orm().WithContext()` |
| GetAttribute  | Получить измененное значение, если не изменено, получить исходное значение, если исходного значения нет, вернуть nil |
| GetOriginal  | Получить исходное значение, если исходного значения нет, вернуть nil |
| IsDirty  | Определить, было ли поле изменено |
| IsClean  | IsDirty в обратном направлении   |
| Query  | Получить новый запрос, можно использовать с транзакцией   |
| SetAttribute  | Установить новое значение для поля |

### Отключение событий

Иногда вам может понадобиться временно "отключить" все события, срабатывающие моделью. Вы можете сделать это, используя метод `WithoutEvents`:

```go
var user models.User
facades.Orm().Query().WithoutEvents().Find(&user, 1)
```

#### Сохранение отдельной модели без событий

Иногда вы можете захотеть "сохранить" данную модель, не запуская события. Это можно сделать с помощью метода `SaveQuietly`:

```go
var user models.User
err := facades.Orm().Query().FindOrFail(&user, 1)
user.Name = "Goravel"
err := facades.Orm().Query().SaveQuietly(&user)
```

<CommentService/>