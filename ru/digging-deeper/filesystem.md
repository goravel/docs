# Файловое хранилище (File Storage)

[[toc]]

## Введение

Goravel предоставляет простые драйверы для работы с локальными файловыми системами, Amazon S3, Aliyun OSS и Tencent COS. И, что еще лучше, переключение между этими опциями хранения между локальной разработочной машиной и сервером продакшена невероятно просто, так как API остается одинаковым для каждой системы. Goravel поставляется с драйвером `local`, для других драйверов можно проверить соответствующие независимые пакеты расширений:

| Драйвер       | Ссылка           |
| -----------  | -------------- |
| S3           | https://github.com/goravel/s3     |
| OSS          | https://github.com/goravel/oss     |
| COS          | https://github.com/goravel/cos     |
| Minio        | https://github.com/goravel/minio     |

## Настройка

Файл конфигурации файловой системы Goravel находится в файле `config/filesystems.go`. В этом файле вы можете настроить все ваши "диски" файловой системы, каждый диск представляет собой определенный драйвер хранения и расположение хранения.

> Вы можете настроить столько дисков, сколько вам нужно, и даже можете иметь несколько дисков, использующих один и тот же драйвер.

## Получение экземпляров дисков

Оболочка `Storage` может использоваться для взаимодействия с любыми настроенными дисками. Например, вы можете использовать метод `Put` в оболочке для сохранения аватара на диск по умолчанию. Если вы вызываете методы в оболочке `Storage`, не вызывая сначала метод `Disk`, метод будет автоматически передан диску по умолчанию:

```go
facades.Storage().Put("avatars/1.png", "Содержимое")
```

Если ваше приложение взаимодействует с несколькими дисками, вы можете использовать метод `Disk` в оболочке `Storage` для работы с файлами на определенном диске:

```go
facades.Storage().Disk("s3").Put("avatars/1.png", "Содержимое")
```

## Внедрение контекста

```go
facades.Storage().WithContext(ctx).Put("avatars/1.png", "Содержимое")
```

## Получение файлов

Метод `Get` может использоваться для получения содержимого файла. Метод вернет сырое строковое содержимое файла. Помните, что все пути к файлам должны быть указаны относительно расположения "корневого" диска:

```go
contents := facades.Storage().Get("file.jpg")
```

Метод `Exists` может использоваться для определения, существует ли файл на диске:

```go
if (facades.Storage().Disk("s3").Exists("file.jpg")) {
    // ...
}
```

Метод `Missing` может использоваться для определения, отсутствует ли файл на диске:

```go
if (facades.Storage().Disk("s3").Missing("file.jpg")) {
    // ...
}
```

### URL файла

Метод `Url` может использоваться для получения URL-адреса для данного файла. Если вы используете драйвер `local`, это обычно просто добавит `/storage` к заданному пути и вернет относительный URL-адрес файла. Если вы используете драйвер `s3`, будет возвращен полностью определенный удаленный URL:

```go
url := facades.Storage().Url("file.jpg")
```

> При использовании драйвера `local` возвращаемое значение `Url` не кодируется как URL. По этой причине рекомендуем всегда сохранять ваши файлы с использованием имен, которые будут создавать допустимые URL-адреса.

#### Временные URL

С помощью метода `TemporaryUrl` вы можете создавать временные URL для файлов, сохраненных с использованием драйвера Non-local. Этот метод принимает

 путь и экземпляр `Time`, указывающий, когда URL должен истекать:

```go
url, err := facades.Storage().TemporaryUrl(
    "file.jpg", time.Now().Add(5*time.Minute)
)
```

### Метаданные файла

Помимо чтения и записи файлов, Goravel также может предоставить информацию о самих файлах:

```go
size := facades.Storage().Size("file.jpg")
```

Метод `LastModified` возвращает время последнего изменения файла:

```go
time, err := facades.Storage().LastModified("file.jpg")
```

Тип MIME данного файла можно получить с помощью метода `MimeType`:

```go
mime, err := facades.Storage().MimeType("file.jpg")
```

Также можно использовать метод `NewFile`:

```go
import "github.com/goravel/framework/filesystem"

file, err := filesystem.NewFile("./logo.png")
size, err := file.Size()
lastModified, err := file.LastModified()
mime, err := file.MimeType()
```

### Пути файлов

Вы можете использовать метод `Path` для получения пути для данного файла. Если вы используете драйвер `local`, это вернет абсолютный путь к файлу. Если вы используете, например, драйвер `s3`, этот метод вернет относительный путь к файлу в корзине:

```go
path := facades.Storage().Path("file.jpg")
```

## Сохранение файлов

Метод `Put` может использоваться для сохранения содержимого файла на диске. Помните, что все пути к файлам должны быть указаны относительно "корневого" расположения, настроенного для диска:

```go
err := facades.Storage().Put("file.jpg", contents)
```

Вы также можете использовать `PutFile` и `PutFileAs` для сохранения файлов непосредственно на диске:

```go
import "github.com/goravel/framework/filesystem"

// Автоматически генерируется уникальный идентификатор для имени файла...
file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFile("photos", file)

// Вручную указать имя файла...
file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFileAs("photos", file, "photo.jpg")
```

Есть несколько важных моментов, которые стоит отметить в методе `PutFile`. Обратите внимание, что мы указали только имя каталога, а не имя файла. По умолчанию метод `PutFile` будет генерировать уникальный идентификатор в качестве имени файла. Расширение файла будет определено путем проверки типа MIME файла. Путь к файлу будет возвращен методом `PutFile`, так что вы можете сохранить путь, включая сгенерированное имя файла, в вашей базе данных.

### Копирование и перемещение файлов

Метод `Copy` может использоваться для копирования существующего файла в новое место на диске, в то время как метод `Move` может использоваться для переименования или перемещения существующего файла в новое место:

```go
err := facades.Storage().Copy("old/file.jpg", "new/file.jpg")

err := facades.Storage().Move("old/file.jpg", "new/file.jpg")
```

### Загрузка файлов

В веб-приложениях одним из самых распространенных случаев использования для хранения файлов является хранение загруженных пользователем файлов, таких как фотографии и документы. Goravel делает очень простым сохранение загруженных файлов с использованием метода `Store` на экземпляре загруженного файла. Вызовите метод `Store` с путем, в котором вы хотите сохранить загруженный файл:

```go
func (r *UserController) Show(ctx http.Context) {
  file, err := ctx.Request().File("avatar")
  path, err := file.Store("avatars")
}
```

В этом примере есть несколько важных моментов. Обратите внимание, что мы указали только имя каталога, а не имя файла. По умолчанию метод `Store` будет генерировать уникальный идентификатор

 в качестве имени файла. Расширение файла будет определено путем проверки типа MIME файла. Путь к файлу будет возвращен методом `Store`, так что вы можете сохранить путь, включая сгенерированное имя файла, в вашей базе данных.

Вы также можете вызвать метод `PutFile` в оболочке `Storage` для выполнения той же операции сохранения файла, что и в приведенном выше примере:

```go
import "github.com/goravel/framework/filesystem"

file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFile("photos", file)
```

### Указание имени файла

Если вы не хотите, чтобы имя файла автоматически присваивалось вашему сохраненному файлу, вы можете использовать метод `StoreAs`, который принимает путь, имя файла и (опционально) диск в качестве аргументов:

```go
file, err := ctx.Request().File("avatar")
path, err := file.StoreAs("avatars", "имя")
```

Вы также можете использовать методы `PutFileAs` в оболочке `Storage`, которые будут выполнять ту же операцию сохранения файла, что и в приведенном выше примере:

```go
import "github.com/goravel/framework/filesystem"

file, err := filesystem.NewFile("./logo.png")
path := facades.Storage().PutFileAs("photos", file, "имя")
```

> Если имя файла, указанное в `StoreAs` и `PutFileAs`, не имеет суффикса, суффикс автоматически добавляется на основе MIME файла; в противном случае используется указанное имя файла.

### Указание диска

По умолчанию метод `Store` этого загруженного файла будет использовать ваш диск по умолчанию. Если вы хотите указать другой диск, пожалуйста, используйте метод `Disk`:

```go
func (r *UserController) Show(ctx http.Context) {
  file, err := ctx.Request().File("avatar")
  path, err := file.Disk("s3").Store("avatars")
}
```

### Другая информация о загруженных файлах

Если вы хотите получить исходное имя и расширение загруженного файла, вы можете сделать это, используя методы `GetClientOriginalName` и `GetClientOriginalExtension`:

```go
file, err := ctx.Request().File("avatar")

name := file.GetClientOriginalName()
extension := file.GetClientOriginalExtension()
```

Однако имейте в виду, что методы `GetClientOriginalName` и `GetClientOriginalExtension` считаются небезопасными, так как имя файла и его расширение могут быть подделаны злонамеренным пользователем. По этой причине обычно лучше использовать методы `HashName` и `Extension`, чтобы получить имя и расширение для данной загрузки файла:

```go
file, err := ctx.Request().File("avatar")

name := file.HashName()// Генерирует уникальное, случайное имя...
extension, err := file.Extension()// Определяет расширение файла на основе типа MIME файла...
```

## Удаление файлов

Метод `Delete` принимает одно имя файла или массив файлов для удаления:

```go
err := facades.Storage().Delete("file.jpg")
err := facades.Storage().Delete("file.jpg", "file2.jpg")
```

При необходимости вы можете указать диск, из которого следует удалить файл:

```go
err := facades.Storage().Disk("s3").Delete("file.jpg")
```

## Каталоги

### Получение всех файлов в каталоге

Метод `Files` возвращает слайс всех файлов в заданном каталоге. Если вы хотите получить список всех файлов в заданном каталоге, включая все подкаталоги, вы можете использовать метод `AllFiles`:

```go
files, err := facades.Storage().Disk("s3").Files("directory")
files, err := facades.Storage().Disk("s3").AllFiles("directory")
```

### Получение всех каталогов в каталоге

Метод `Directories` возвращает слайс всех каталогов в заданном каталоге. Кроме того, вы можете использовать метод `AllDirectories` для получения списка всех каталогов в заданном каталоге и всех его подкаталогах:

```go
directories, err := facades.Storage().Disk("s3").Directories("directory")
directories, err := facades.Storage().Disk("s3").AllDirectories("directory")
```

### Создание каталога

Метод `MakeDirectory` создаст заданный каталог, включая все необходимые подкаталоги:

```go
err := facades.Storage().MakeDirectory(directory)
```

### Удаление каталога

Наконец, метод `DeleteDirectory` может использоваться для удаления каталога и всех его файлов:

```go 
err := facades.Storage().DeleteDirectory(directory

)
```

## Пользовательские файловые системы

Вы можете установить драйвер `custom` в файле `config/filesystems.go`.

```go
"custom": map[string]any{
  "driver": "custom",
  "via":    filesystems.NewLocal(),
},
```

Вам необходимо реализовать интерфейс `github.com/goravel/framework/contracts/filesystem/Driver` в элементе конфигурации `via`.

```go
type Driver interface {
  AllDirectories(path string) ([]string, error)
  AllFiles(path string) ([]string, error)
  Copy(oldFile, newFile string) error
  Delete(file ...string) error
  DeleteDirectory(directory string) error
  Directories(path string) ([]string, error)
  Exists(file string) bool
  Files(path string) ([]string, error)
  Get(file string) (string, error)
  MakeDirectory(directory string) error
  Missing(file string) bool
  Move(oldFile, newFile string) error
  Path(file string) string
  Put(file, content string) error
  PutFile(path string, source File) (string, error)
  PutFileAs(path string, source File, name string) (string, error)
  Size(file string) (int64, error)
  TemporaryUrl(file string, time time.Time) (string, error)
  WithContext(ctx context.Context) Driver
  Url(file string) string
}
```

> Примечание: поскольку конфигурация не загружена, когда регистрируется пользовательский драйвер, используйте `facades.Config().Env`, чтобы получить конфигурацию в пользовательском драйвере.

<CommentService/>