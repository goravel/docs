# Отношения

[[toc]]

## Введение

Таблицы баз данных часто имеют отношения друг с другом. Например, у блог-поста может быть много комментариев, или заказ может быть связан с пользователем, который его разместил. ORM упрощает управление и работу с этими отношениями и поддерживает различные типы отношений:

- [Один к Одному](#Один-к-Одному)
- [Один ко Многим](#Один-ко-Многим)
- [Многие ко Многим](#Многие-ко-Многим)
- [Полиморфное](#Полиморфное)

## Определение отношений

### Один к Одному

Отношение один к одному представляет собой очень простой тип отношений в базе данных. Например, модель `User` может быть связана с одной моделью `Phone`.

```go
type User struct {
  orm.Model
  Name  string
  Phone   *Phone
}

type Phone struct {
  orm.Model
  UserID   uint
  Name   string
}
```

ORM определяет внешний ключ отношения на основе имени родительской модели. В этом случае модель `Phone` автоматически считается имеющей внешний ключ `UserID`. Если вы хотите переопределить это соглашение, вы можете добавить тег `foreignKey` в поле `Phone` в модели `User` (аналогично для других отношений):

```go
type User struct {
  orm.Model
  Name  string
  Phone   *Phone `gorm:"foreignKey:UserName"`
}

type Phone struct {
  orm.Model
  UserName string
  Name   string
}
```

Кроме того, ORM предполагает, что внешний ключ должен иметь значение, соответствующее колонке первичного ключа родителя. Другими словами, ORM будет искать значение колонки `id` пользователя в колонке `UserId` записи `Phone`. Если вы хотите, чтобы отношение использовало значение первичного ключа, отличное от `id`, вы можете добавить тег `references` в поле `Phone` в модели `User` и передать третий аргумент в метод `hasOne` (аналогично для других отношений):

```go
type User struct {
  orm.Model
  Name  string
  Phone   *Phone `gorm:"foreignKey:UserName;references:name"`
}

type Phone struct {
  orm.Model
  UserName string
  Name   string
}
```

#### Определение обратного отношения

Таким образом, мы можем получить доступ к модели `Phone` из нашей модели `User`. Теперь давайте определим отношение в модели `Phone`, которое позволит нам получить доступ к пользователю, которому принадлежит телефон. Мы можем определить поле `User` в модели `Phone`:

```go
type User struct {
  orm.Model
  Name  string
}

type Phone struct {
  orm.Model
  UserID   uint
  Name   string
  User   *User
}
```

### Один ко Многим

Отношение один ко многим используется для определения связи, когда одна модель является родительской для одной или нескольких дочерних моделей. Например, у блог-поста может быть бесконечное количество комментариев. Как и в случае с другими отношениями ORM, отношение один ко многим определяется путем определения поля в модели ORM:

```go
type Post struct {
  orm.Model
  Name   string
  Comments []*Comments
}

type Comment struct {
  orm.Model
  PostID   uint
  Name   string
}
```

Помните, что ORM автоматически определит правильное имя внешнего ключа для модели `Comment`. По соглашению ORM возьмет имя родительской модели в формате "hump case" и добавит суффикс `ID`. Таким образом, в этом примере ORM предположит, что внешний ключ для модели `Comment` имеет имя `PostID`.

### Один ко Многим (Обратное отношение) / Принадлежит

Теперь, когда мы можем получить доступ ко всем комментариям поста, давайте определим отношение, которое позволит комментарию получить доступ к родительскому посту. Чтобы определить обратное отношение один ко многим, определите метод отношения в дочерней модели, который вызывает метод `belongsTo`:

```go
type Post struct {
  orm.Model
  Name   string
  Comments []*Comments
}

type Comment struct {
  orm.Model
  PostID   uint
  Name   string
  Post   *Post
}
```

## Отношения Многие ко Многим

Отношения многие ко многим немного сложнее, чем отношения "Один к Одному" и "Один ко Многим". Примером многие ко многим является отношение, когда пользователь имеет много ролей, и эти роли также используются другими пользователями в приложении. Например, пользователь может быть назначен на роль "Автор" и "Редактор", и эти роли также могут быть назначены другим пользователям. Таким образом, у пользователя много ролей, и у роли много пользователей.

### Структура таблицы

Для определения эт

ого отношения требуются три таблицы базы данных: `users`, `roles` и `role_user`. Название таблицы `role_user` можно настроить, и она содержит столбцы `user_id` и `role_id`. Эта таблица используется в качестве промежуточной таблицы, связывающей пользователей и роли.

Помните, что поскольку роль может принадлежать множеству пользователей, мы не можем просто добавить столбец `user_id` в таблицу `roles`. Это означало бы, что роль могла бы принадлежать только одному пользователю. Чтобы обеспечить поддержку присвоения ролей нескольким пользователям, нужна таблица `role_user`. Мы можем суммировать структуру таблицы для этого отношения следующим образом:

```
users
  id - integer
  name - string

roles
  id - integer
  name - string

role_user
  user_id - integer
  role_id - integer
```

### Структура модели

Мы можем определить поле `Roles` в модели `User`:

```go
type User struct {
  orm.Model
  Name  string
  Roles   []*Role `gorm:"many2many:role_user"`
}

type Role struct {
  orm.Model
  Name   string
}
```

### Определение обратного отношения

Для определения обратного отношения просто определите поле `Users` в модели `Role` и добавьте тег:

```go
type User struct {
  orm.Model
  Name  string
  Roles   []*Role `gorm:"many2many:role_user"`
}

type Role struct {
  orm.Model
  Name   string
  Users  []*User `gorm:"many2many:role_user"`
}
```

### Пользовательская промежуточная таблица

Обычно внешние ключи промежуточных таблиц именуются с помощью "snake case" имени родительской модели, вы можете переопределить их с помощью `joinForeignKey` и `joinReferences`:

```go
type User struct {
  orm.Model
  Name  string
  Roles   []*Role `gorm:"many2many:role_user;joinForeignKey:UserName;joinReferences:RoleName"`
}

type Role struct {
  orm.Model
  Name   string
}
```

Структура таблицы:

```
users
  id - integer
  name - string

roles
  id - integer
  name - string

role_user
  user_name - integer
  role_name - integer
```

## Полиморфное

Полиморфное отношение позволяет дочерней модели принадлежать более чем одному типу модели, используя единственное ассоциативное поле. Например, представьте, что вы создаете приложение, которое позволяет пользователям делиться как блог-постами, так и видео. В таком приложении модель `Comment` может принадлежать как модели `Post`, так и модели `Video`.

### Структура таблицы

Полиморфное отношение похоже на обычное отношение, но дочерняя модель может принадлежать более чем одному типу модели, используя единственное ассоциативное поле. Например, блог `Post` и `User` могут иметь полиморфное отношение с моделью `Image`. Использование полиморфного отношения позволяет иметь единственную таблицу уникальных изображений, которые могут быть связаны с постами и пользователями. Давайте сначала рассмотрим структуру таблицы:

```
posts
  id - integer
  name - string

videos
  id - integer
  name - string

images
  id - integer
  url - string
  imageable_id - integer
  imageable_type - string

comments
  id - integer
  body - text
  commentable_id - integer
  commentable_type - string
```

Обратите внимание на столбцы `imageable_id` и `imageable_type` в таблице `images`. Столбец `imageable_id` будет содержать значение ID поста или пользователя, в то время как столбец `imageable_type` будет содержать имя класса родительской модели. Столбец `imageable_type` используется ORM для определения, какой "тип" родительской модели возвращать при доступе к отношению `imageable`. Таблица `comments` имеет аналогичную структуру.

### Структура модели

Далее рассмотрим определения моделей, необходимых для построения этого отношения:

```go
type Post struct {
  orm.Model
  Name     string
  Image    *Image `gorm:"polymorphic:Imageable"`
  Comments []*Comment `gorm:"polymorphic:Commentable"`
}

type Video struct {
  orm.Model
  Name     string
  Image    *Image `gorm:"polymorphic:Imageable"`
  Comments []*Comment `gorm:"polymorphic:Commentable"`
}

type Image struct {
  orm.Model
  Name          string
  ImageableID   uint
  ImageableType string
}

type Comment struct {
  orm.Model
  Name            string
  CommentableID   uint
  CommentableType string
}
```

Вы можете изменить значение полиморфного атрибута с помощью тега `polymorphicValue`, например:

```go
type Post struct {
  orm.Model
  Name  string
  Image   *Image `gorm:"polymorphic:Imageable;polymorphicValue:master"`
}
```

## Запросы к ассоциациям

Допустим, у нас есть приложение блога, в котором модель `User` имеет много связанных моделей `Post`:

```go
type User struct {
  orm.Model
  Name   string
  Posts  []*Post
}

type Post struct {
  orm.Model
  UserID   uint
  Name     string
}
```

### Создание или обновление ассоциаций

Вы можете использовать методы `Select`, `Omit` для управления созданием и обновлением ассоциаций. Эти два метода не могут использоваться одновременно, и функции управления связями применимы только к методам `Create`, `Update`, `Save`:

```go
user := User{Name: "user", Post: &Post{Name: "post"}}

// Создать все дочерние ассоциации при создании User
facades.Orm().Query().Select(orm.Associations).Create(&user)

// Создать только ассоциацию Post при создании User. Примечание: Если вы не используете `orm.Associations`, но настраиваете отдельно конкретные дочерние ассоциации, все поля в родительской модели также должны быть указаны на этом этапе.
facades.Orm().Query().Select("Name", "Post").Create(&user)

// При создании пользователя игнорировать ассоциацию Post, но создать все остальные дочерние ассоциации
facades.Orm().Query().Omit("Post").Create(&user)

// При создании пользователя игнорировать поле Name, но создать все дочерние ассоциации
facades.Orm().Query().Omit("Name").Create(&user)

// При создании пользователя игнорировать поле Name и все дочерние ассоциации
facades.Orm().Query().Omit("Name", orm.Associations).Create(&user)
```

### Поиск ассоциаций

```go
// Найти все соответствующие связанные записи
var posts []models.Post
facades.Orm().Query().Model(&user).Association("Posts").Find(&posts)

// Найти ассоциации с условиями
facades.Orm().Query().Model(&user).Where("name = ?", "goravel").Order("id desc").Association("Posts").Find(&posts)
```

### Добавление ассоциаций

Добавление новых ассоциаций для `One To Many`, `Many To Many`, замена текущей ассоциации для `One To One`, `One To One(обратное отношение)`:

```go
facades.Orm().Query().Model(&user).Association("Posts").Append([]*Post{Post1, Post2})

facades.Orm().Query().Model(&user).Association("Posts").Append(&Post{Name: "goravel"})
```

### Замена ассоциаций

Замена текущих ассоциаций новыми:

```go
facades.Orm().Query().Model(&user).Association("Posts").Replace([]*Post{Post1, Post2})

facades.Orm().Query().Model(&user).Association("Posts").Replace(Post{Name: "goravel"}, Post2)
```

### Удаление ассоциаций

Удаление связи между исходным объектом и аргументами, если таковая существует; удаление ссылки, не удаляет объекты из БД, внешний ключ должен быть NULL:

```go
facades.Orm().Query().Model(&user).Association("Posts").Delete([]*Post{Post1, Post2})

facades.Orm().Query().Model(&user).Association("Posts").Delete(Post1, Post2)
```

### Очистка ассоциаций

Удаление всех ссылок между исходным объектом и ассоциацией, не удаляет ассоциации:

```go
facades.Orm().Query().Model(&user).Association("Posts").Clear()
```

### Подсчет ассоциаций

Возвращает количество текущих ассоциаций:

```go
facades.Orm().Query().Model(&user).Association("Posts").Count()

// Подсчет с условиями
facades.Orm().Query().Model(&user).Where("name = ?", "goravel").Association("Posts").Count()
```

### Пакетные данные

```go
// Найти все роли для всех пользователей
facades.Orm().Query().Model(&users).Association("Posts").Find(&posts)

// Удалить пользователя A из всех сообщений всех пользователей
facades.Orm().Query().Model(&users).Association("Posts").Delete(&userA)

// Получить уникальное количество сообщений всех пользователей
facades.Orm().Query().Model(&users).Association("Posts").Count()

// Для `Append`, `Replace` с пакетными данными, длина аргументов должна быть равна длине данных, в противном случае будет возвращена ошибка
var users = []User{user1, user2, user3}

// У нас есть 3 пользователя, добавить userA к команде user1, добавить userB к команде user2, добавить userA, userB и userC к команде user3
facades.Orm().Query().Model(&users).Association("Team").Append(&userA, &userB, &[]User{userA, userB, userC})

// Сбросить команду user1 на userA，сбросить команду user2 на userB, сбросить команду user3 на userA, userB и userC
facades.Orm().Query().Model(&users).Association("Team").Replace(&userA, &userB, &[]User{userA, userB, userC})
```

## Жадная загрузка

Жадная загрузка удобства для запроса нескольких моделей и устраняет проблему "N + 1". Чтобы проиллюстрировать проблему "N + 1", рассмотрим модель `Book`,

 которая "принадлежит" модели `Author`:

```go
type Author struct {
  orm.Model
  Name  string
}

type Book struct {
  orm.Model
  AuthorID   uint
  Name       string
  Author     *Author
}
```

Теперь давайте получим все книги и их авторов:

```go
var books models.Book
facades.Orm().Query().Find(&books)

for _, book := range books {
  var author models.Author
  facades.Orm().Query().Find(&author, book.AuthorID)
}
```

Этот цикл выполнит один запрос для получения всех книг из таблицы базы данных, а затем еще один запрос для каждой книги, чтобы получить автора книги. Таким образом, если у нас есть 25 книг, приведенный выше код выполнит 26 запросов: один для исходной книги и 25 дополнительных запросов для получения автора каждой книги.

К счастью, мы можем использовать жадную загрузку, чтобы уменьшить это до всего двух запросов. При создании запроса вы можете указать, какие связи должны быть загружены жадно, используя метод `With`:

```go
var books models.Book
facades.Orm().Query().With("Author").Find(&books)

for _, book := range books {
  fmt.Println(book.Author)
}
```

В этой операции будут выполнены только два запроса - один запрос для получения всех книг и еще один запрос для получения всех авторов для всех книг:

```sql
select * from books

select * from authors where id in (1, 2, 3, 4, 5, ...)
```

### Жадная загрузка нескольких отношений

Иногда вам может понадобиться загрузить несколько различных связей одновременно. Для этого просто вызовите метод `With` несколько раз:

```go
var book models.Book
facades.Orm().Query().With("Author").With("Publisher").Find(&book)
```

### Вложенная жадная загрузка

Для загрузки связей связей вы можете использовать "точечный" синтаксис. Например, давайте загрузим всех авторов книг и все контакты авторов:

```go
var book models.Book
facades.Orm().Query().With("Author.Contacts").Find(&book)
```

### Ограничение жадной загрузки

Иногда вам может понадобиться загрузить связь жадно, но также указать дополнительные условия запроса для запроса жадной загрузки. Вы можете сделать это следующим образом:

```go
import "github.com/goravel/framework/contracts/database/orm"

var book models.Book
facades.Orm().Query().With("Author", "name = ?", "author").Find(&book)

facades.Orm().Query().With("Author", func(query orm.Query) orm.Query {
  return query.Where("name = ?", "author")
}).Find(&book)
```

В этом примере Orm загрузит только посты, где значение столбца `name` равно слову `author`. 

### Ленивая жадная загрузка

Иногда вам может понадобиться загрузить связь жадно после того, как родительская модель уже была получена. Например, это может быть полезно, если вы должны динамически решить, следует ли загружать связанные модели:

```go
var books models.Book
facades.Orm().Query().Find(&books)

for _, book := range books {
  if someCondition {
    err := facades.Orm().Query().Load(&book, "Author")
  }
}
```

Если вам необходимо задать дополнительные условия запроса для жадной загрузки, вы можете использовать следующий код:

```go
import "github.com/goravel/framework/contracts/database/orm"

var book models.Book
facades.Orm().Query().Load(&book, "Author", "name = ?", "author").Find(&book)

facades.Orm().Query().Load(&book, "Author", func(query orm.Query) orm.Query {
  return query.Where("name = ?", "author")
}).Find(&book)
```

Чтобы загрузить связь только тогда, когда она еще не была загружена, используйте метод `LoadMissing`:

```go
facades.Orm().Query().LoadMissing(&book, "Author")
```

<CommentService/>