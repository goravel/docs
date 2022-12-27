# Mock

## 简介

Goravel 所有功能都使用 `facades` 实现，而所有的 `facades` 均由接口构成。因此配合 [stretchr/testify](http://github.com/stretchr/testify) 的 mock 功能，Goravel 可以提供优秀的测试体验。

## Mock facades.Cache

```go
import "github.com/goravel/framework/testing/mock"

func Cache() string {
  if err := facades.Cache.Put("name", "goravel", 1*time.Minute); err != nil {
    fmt.Println("cache.put.error", err)
  }

  return facades.Cache.Get("name", "test").(string)
}

func TestCache(t *testing.T) {
  mockCache := mock.Cache()
  mockCache.On("Put", "name", "goravel", mock.Anything).Return(nil).Once()
  mockCache.On("Get", "name", "test").Return("Goravel").Once()

  res := Cache()
  assert.Equal(t, res, "Goravel")
}
```

## Mock facades.Config

```go
import "github.com/goravel/framework/testing/mock"

func Config() string {
  return facades.Config.GetString("app.name", "test")
}

func TestConfig(t *testing.T) {
  mockConfig := mock.Config()
  mockConfig.On("GetString", "app.name", "test").Return("Goravel").Once()

  res := Config()
  assert.Equal(t, res, "Goravel")
}
```

## Mock facades.Artisan

```go
import "github.com/goravel/framework/testing/mock"

func ArtisanCall() {
  facades.Artisan.Call("list")
}

func TestArtisan(t *testing.T) {
  mockArticle := mock.Artisan()
  mockArticle.On("Call", "list").Once()

  assert.NotPanics(t, func() {
    ArtisanCall()
  })
}
```

## Mock facades.Orm

```go
import "github.com/goravel/framework/testing/mock"

func Orm() error {
  if err := facades.Orm.Query().Create(&Test{}); err != nil {
    return err
  }

  var test Test
  return facades.Orm.Query().Where("id = ?", 1).Find(&test)
}

func TestOrm(t *testing.T) {
  mockOrm, mockOrmDB, _ := mock.Orm()
  mockOrm.On("Query").Return(mockOrmDB)

  mockOrmDB.On("Create", mock.Anything).Return(nil).Once()
  mockOrmDB.On("Where", "id = ?", 1).Return(mockOrmDB).Once()
  mockOrmDB.On("Find", mock.Anything).Return(nil).Once()

  assert.Nil(t, Orm())
}

func Transaction() error {
  return facades.Orm.Transaction(func(tx contractorm.Transaction) error {
    var test Test
    if err := tx.Create(&test); err != nil {
      return err
    }

    var test1 Test
    return tx.Where("id = ?", test.ID).Find(&test1)
  })
}

func TestTransaction(t *testing.T) {
  mockOrm, _, mockOrmTransaction := mock.Orm()
  mockOrm.On("Transaction", mock.Anything).Return(func(txFunc func(tx orm.Transaction) error) error {
    return txFunc(mockOrmTransaction)
  })

  var test Test
  mockOrmTransaction.On("Create", &test).Return(func(test2 interface{}) error {
    test2.(*Test).ID = 1

    return nil
  }).Once()
  mockOrmTransaction.On("Where", "id = ?", uint(1)).Return(mockOrmTransaction).Once()
  mockOrmTransaction.On("Find", mock.Anything).Return(nil).Once()

  assert.Nil(t, Transaction())
}

func Begin() error {
  tx, _ := facades.Orm.Query().Begin()
  user := models.User{Name: "Goravel"}
  if err := tx.Create(&user); err != nil {
    return tx.Rollback()
  } else {
    return tx.Commit()
  }
}
```

## Mock facades.Event

```go
import "github.com/goravel/framework/testing/mock"

func Event() error {
  return facades.Event.Job(&events.TestEvent{}, []contractevent.Arg{
    {Type: "string", Value: "abcc"},
    {Type: "int", Value: 1234},
  }).Dispatch()
}

func TestEvent(t *testing.T) {
  mockEvent, mockTask := mock.Event()
  mockEvent.On("Job", mock.Anything, mock.Anything).Return(mockTask).Once()
  mockTask.On("Dispatch").Return(nil).Once()

  assert.Nil(t, Event())
}
```

## Mock facades.Log

`facades.Log` 没有实现 mock，而是使用 `fmt` 代替了实际的日志输出，便于测试过程中调试。

```go
import "github.com/goravel/framework/testing/mock"

func Log() {
  facades.Log.Debug("test")
}

func TestLog(t *testing.T) {
  mock.Log()

  Log()
}
```

## Mock facades.Mail

```go
import "github.com/goravel/framework/testing/mock"

func Mail() error {
  return facades.Mail.From(mail.From{Address: "example@example.com", Name: "example"}).
    To([]string{"example@example.com"}).
    Content(mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).
    Send()
}

func TestMail(t *testing.T) {
  mockMail := mock.Mail()
  mockMail.On("From", mail.From{Address: "example@example.com", Name: "example"}).Return(mockMail)
  mockMail.On("To", []string{"example@example.com"}).Return(mockMail)
  mockMail.On("Content", mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).Return(mockMail)
  mockMail.On("Send").Return(nil)

  assert.Nil(t, Mail())
}
```

## Mock facades.Queue

```go
import "github.com/goravel/framework/testing/mock"

func Queue() error {
  return facades.Queue.Job(&jobs.TestSyncJob{}, []queue.Arg{}).Dispatch()
}

func TestQueue(t *testing.T) {
  mockQueue, mockTask := mock.Queue()
  mockQueue.On("Job", mock.Anything, mock.Anything).Return(mockTask).Once()
  mockTask.On("Dispatch").Return(nil).Once()

  assert.Nil(t, Queue())
}
```

## Mock facades.Storage

import (
  "testing"

  "github.com/goravel/framework/filesystem"
  "github.com/goravel/framework/testing/mock"
  "github.com/goravel/framework/facades"
)

```go
func Storage() (string, error) {
  file, _ := filesystem.NewFile("1.txt")

  return facades.Storage.WithContext(context.Background()).PutFile("file", file)
}

func TestStorage(t *testing.T) {
  mockStorage, mockDriver, _ := mock.Storage()
  mockStorage.On("WithContext", context.Background()).Return(mockDriver).Once()
  file, _ := filesystem.NewFile("1.txt")
  mockDriver.On("PutFile", "file", file).Return("", nil).Once()
  path, err := Storage()

  assert.Equal(t, "", path)
  assert.Nil(t, err)
}

```

## Mock facades.Validation

```go

import (
  "testing"

  "github.com/goravel/framework/testing/mock"
  "github.com/stretchr/testify/assert"
  "github.com/goravel/framework/facades"
)

func Validation() string {
  validator, _ := facades.Validation.Make(map[string]string{
    "a": "b",
  }, map[string]string{
    "a": "required",
  })
  errors := validator.Errors()

  return errors.One("a")
}

func TestValidation(t *testing.T) {
  mockValidation, mockValidator, mockErrors := mock.Validator()
  mockValidation.On("Make", map[string]string{
    "a": "b",
  }, map[string]string{
    "a": "required",
  }).Return(mockValidator, nil).Once()
  mockValidator.On("Errors").Return(mockErrors).Once()
  mockErrors.On("One", "a").Return("error").Once()
  err := Validation()

  assert.Equal(t, "error", err)
}
```

## Mock facades.Auth

```go
import (
  "testing"

  "github.com/goravel/framework/http"
  "github.com/goravel/framework/testing/mock"
  "github.com/stretchr/testify/assert"
  "github.com/goravel/framework/facades"
)

func Auth() error {
  return facades.Auth.Logout(http.Background())
}

func TestAuth(t *testing.T) {
  mockAuth := mock.Auth()
  mockAuth.On("Logout", http.Background()).Return(nil).Once()
  err := Auth()

  assert.Nil(t, err)
}
```

## Mock facades.Gate

```go

import (
  "testing"

  "github.com/goravel/framework/testing/mock"
  "github.com/stretchr/testify/assert"
  "github.com/goravel/framework/facades"
)

func Gate() bool {
  return facades.Gate.Allows("create", map[string]any{
    "a": "b",
  })
}

func TestGate(t *testing.T) {
  mockGate := mock.Gate()
  mockGate.On("Allows", "create", map[string]any{
    "a": "b",
  }).Return(true).Once()
  res := Gate()

  assert.True(t, res)
}
```

## Mock facades.Grpc

```go

import (
  "context"
  "errors"
  "testing"

  "github.com/goravel/framework/testing/mock"
  "github.com/stretchr/testify/assert"
  "google.golang.org/grpc"
  "github.com/goravel/framework/facades"
)

func Grpc() (*grpc.ClientConn, error) {
  return facades.Grpc.Client(context.Background(), "user")
}

func TestGrpc(t *testing.T) {
  mockGrpc := mock.Grpc()
  mockGrpc.On("Client", context.Background(), "user").Return(nil, errors.New("error")).Once()
  conn, err := Grpc()

  assert.Nil(t, conn)
  assert.EqualError(t, err, "error")
}
```