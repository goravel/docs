# Mock

[[toc]]

## 简介

Goravel 所有功能都使用 `facades` 实现，而所有的 `facades` 均由接口构成。 因此配合 [stretchr/testify](http://github.com/stretchr/testify) 的 mock 功能，Goravel 可以提供优秀的测试体验。

## Mock facades.App

```go
import "github.com/goravel/framework/testing/mock"

func CurrentLocale() string {
  return facades.App().CurrentLocale(context.Background())
}

func TestCurrentLocale(t *testing.T) {
  mockFactory := mock.Factory()
  mockApp := mockFactory.App()
  mockApp.On("CurrentLocale", context.Background()).Return("en").Once()

  assert.Equal(t, "en", CurrentLocale())
  mockApp.AssertExpectations(t)
}
```

## Mock facades.Artisan

```go
func ArtisanCall() {
  facades.Artisan().Call("list")
}

func TestArtisan(t *testing.T) {
  mockFactory := mock.Factory()
  mockArticle := mockFactory.Artisan()
  mockArticle.On("Call", "list").Once()

  assert.NotPanics(t, func() {
    ArtisanCall()
  })

  mockArticle.AssertExpectations(t)
}
```

## Mock facades.Auth

```go
import (
  "testing"

  "github.com/goravel/framework/http"
  "github.com/goravel/framework/testing/mock"
  "github.com/stretchr/testify/assert"

  "goravel/app/facades"
)

func Auth() error {
  return facades.Auth().Logout(http.Background())
}

func TestAuth(t *testing.T) {
  mockFactory := mock.Factory()
  mockAuth := mockFactory.Auth()
  mockAuth.On("Logout", http.Background()).Return(nil).Once()
  err := Auth()

  assert.Nil(t, err)

  mockAuth.AssertExpectations(t)
}
```

## Mock facades.Cache

```go
import "github.com/goravel/framework/testing/mock"

func Cache() string {
  if err := facades.Cache().Put("name", "goravel", 1*time.Minute); err != nil {
    fmt.Println("cache.put.error", err)
  }

  return facades.Cache().Get("name", "test").(string)
}

func TestCache(t *testing.T) {
  mockFactory := mock.Factory()
  mockCache := mockFactory.Cache()

  mockCache.On("Put", "name", "goravel", mock.Anything).Return(nil).Once()
  mockCache.On("Get", "name", "test").Return("Goravel").Once()

  res := Cache()
  assert.Equal(t, res, "Goravel")

  mockCache.AssertExpectations(t)
}
```

## Mock facades.Config

```go
import "github.com/goravel/framework/testing/mock"

func Config() string {
  return facades.Config().GetString("app.name", "test")
}

func TestConfig(t *testing.T) {
  mockFactory := mock.Factory()
  mockConfig := mockFactory.Config()
  mockConfig.On("GetString", "app.name", "test").Return("Goravel").Once()

  res := Config()
  assert.Equal(t, res, "Goravel")

  mockConfig.AssertExpectations(t)
}
```

## Mock facades.Crypt

```go
import (
  "testing"

  "github.com/goravel/framework/testing/mock"
  "github.com/stretchr/testify/assert"
  
  "goravel/app/facades"
)

func Crypt(str string) (string, error) {
	res, err := facades.Crypt().EncryptString(str)
	if err != nil {
		return "", err
	}

	return facades.Crypt().DecryptString(res)
}

func TestCrypt(t *testing.T) {
  mockFactory := mock.Factory()
	mockCrypt := mockFactory.Crypt()
	mockCrypt.On("EncryptString", "Goravel").Return("test", nil).Once()
	mockCrypt.On("DecryptString", "test").Return("Goravel", nil).Once()

	res, err := Crypt("Goravel")
	assert.Equal(t, "Goravel", res)
	assert.Nil(t, err)

	mockCrypt.AssertExpectations(t)
}
```

## Mock facades.Event

```go
import "github.com/goravel/framework/testing/mock"

func Event() error {
  return facades.Event().Job(&events.TestEvent{}, []contractevent.Arg{
    {Type: "string", Value: "abcc"},
    {Type: "int", Value: 1234},
  }).Dispatch()
}

func TestEvent(t *testing.T) {
  mockFactory := mock.Factory()
  mockEvent := mockFactory.Event()
  mockTask := mockFactory.EventTask()
  mockEvent.On("Job", mock.Anything, mock.Anything).Return(mockTask).Once()
  mockTask.On("Dispatch").Return(nil).Once()

  assert.Nil(t, Event())

  mockEvent.AssertExpectations(t)
  mockTask.AssertExpectations(t)
}
```

## Mock facades.Gate

```go
import (
  "testing"

  "github.com/goravel/framework/testing/mock"
  "github.com/stretchr/testify/assert"
  
  "goravel/app/facades"
)

func Gate() bool {
	return facades.Gate().Allows("update-post", map[string]any{
		"post": "test",
	})
}

func TestGate(t *testing.T) {
  mockFactory := mock.Factory()
	mockGate := mockFactory.Gate()
	mockGate.On("Allows", "update-post", map[string]any{
		"post": "test",
	}).Return(true).Once()

	assert.True(t, Gate())

	mockGate.AssertExpectations(t)
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

  "goravel/app/facades"
)

func Grpc() (*grpc.ClientConn, error) {
  return facades.Grpc().Client(context.Background(), "user")
}

func TestGrpc(t *testing.T) {
  mockFactory := mock.Factory()
  mockGrpc := mockFactory.Grpc()
  mockGrpc.On("Client", context.Background(), "user").Return(nil, errors.New("error")).Once()
  conn, err := Grpc()

  assert.Nil(t, conn)
  assert.EqualError(t, err, "error")

  mockGrpc.AssertExpectations(t)
}
```

## Mock facades.Hash

```go
import (
  "errors"
  "testing"

  "github.com/goravel/framework/testing/mock"
  "github.com/stretchr/testify/assert"
  "google.golang.org/grpc"

  "goravel/app/facades"
)

func Hash() (string, error) {
	return facades.Hash().Make("Goravel")
}

func TestHash(t *testing.T) {
  mockFactory := mock.Factory()
  mockHash := mockFactory.Hash()
	mockHash.On("Make", "Goravel").Return("test", nil).Once()

	res, err := Hash()
	assert.Equal(t, "test", res)
	assert.Nil(t, err)

	mockHash.AssertExpectations(t)
}
```

## Mock facades.Lang

```go
func Lang() string {
  return facades.Lang(context.Background()).Get("name")
}

func TestLang(t *testing.T) {
  mockFactory := mock.Factory()
  mockLang := mockFactory.Lang()
  mockLang.On("Get", "name").Return("Goravel").Once()

  assert.Equal(t, "Goravel", Lang())
  mockLang.AssertExpectations(t)
}
```

## Mock facades.Log

`facades.Log()` 没有实现 mock，而是使用 `fmt` 代替了实际的日志输出，便于测试过程中调试。

```go
import "github.com/goravel/framework/testing/mock"

func Log() {
  facades.Log().Debug("test")
}

func TestLog(t *testing.T) {
  mockFactory := mock.Factory()
  mockFactory.Log()

  Log()
}
```

## Mock facades.Mail

```go
import "github.com/goravel/framework/testing/mock"

func Mail() error {
  return facades.Mail().From(mail.From{Address: "example@example.com", Name: "example"}).
    To([]string{"example@example.com"}).
    Content(mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).
    Send()
}

func TestMail(t *testing.T) {
  mockFactory := mock.Factory()
  mockMail := mockFactory.Mail()
  mockMail.On("From", mail.From{Address: "example@example.com", Name: "example"}).Return(mockMail)
  mockMail.On("To", []string{"example@example.com"}).Return(mockMail)
  mockMail.On("Content", mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).Return(mockMail)
  mockMail.On("Send").Return(nil)

  assert.Nil(t, Mail())

  mockMail.AssertExpectations(t)
}
```

## Mock facades.Orm

```go
import "github.com/goravel/framework/testing/mock"

func Orm() error {
  if err := facades.Orm().Query().Create(&Test{}); err != nil {
    return err
  }

  var test Test
  return facades.Orm().Query().Where("id = ?", 1).Find(&test)
}

func TestOrm(t *testing.T) {
  mockFactory := mock.Factory()
  mockOrm := mockFactory.Orm()
  mockOrmQuery := mockFactory.OrmQuery()
  mockOrm.On("Query").Return(mockOrmQuery)

  mockOrmQuery.On("Create", mock.Anything).Return(nil).Once()
  mockOrmQuery.On("Where", "id = ?", 1).Return(mockOrmDB).Once()
  mockOrmQuery.On("Find", mock.Anything).Return(nil).Once()

  assert.Nil(t, Orm())

  mockOrm.AssertExpectations(t)
  mockOrmQuery.AssertExpectations(t)
}

func Transaction() error {
  return facades.Orm().Transaction(func(tx contractorm.Transaction) error {
    var test Test
    if err := tx.Create(&test); err != nil {
      return err
    }

    var test1 Test
    return tx.Where("id = ?", test.ID).Find(&test1)
  })
}

func TestTransaction(t *testing.T) {
  mockFactory := mock.Factory()
  mockOrm := mockFactory.Orm()
  mockOrmTransaction := mockFactory.OrmTransaction()
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

  mockOrm.AssertExpectations(t)
  mockOrmTransaction.AssertExpectations(t)
}

func Begin() error {
  tx, _ := facades.Orm().Query().Begin()
  user := models.User{Name: "Goravel"}
  if err := tx.Create(&user); err != nil {
    return tx.Rollback()
  } else {
    return tx.Commit()
  }
}
```

## Mock facades.Queue

```go
import "github.com/goravel/framework/testing/mock"

func Queue() error {
  return facades.Queue().Job(&jobs.TestSyncJob{}, []queue.Arg{}).Dispatch()
}

func TestQueue(t *testing.T) {
  mockFactory := mock.Factory()
  mockQueue := mockFactory.Queue()
  mockTask := mockFactory.QueueTask()
  mockQueue.On("Job", mock.Anything, mock.Anything).Return(mockTask).Once()
  mockTask.On("Dispatch").Return(nil).Once()

  assert.Nil(t, Queue())

  mockQueue.AssertExpectations(t)
  mockTask.AssertExpectations(t)
}
```

## Mock facades.Storage

```go
import (
  "context"
  "testing"

  "github.com/goravel/framework/filesystem"
  "github.com/goravel/framework/testing/mock"

  "goravel/app/facades"
)

func Storage() (string, error) {
  file, _ := filesystem.NewFile("1.txt")

  return facades.Storage().WithContext(context.Background()).PutFile("file", file)
}

func TestStorage(t *testing.T) {
  mockFactory := mock.Factory()
  mockStorage := mockFactory.Storage()
  mockDriver := mockFactory.StorageDriver()
  mockStorage.On("WithContext", context.Background()).Return(mockDriver).Once()
  file, _ := filesystem.NewFile("1.txt")
  mockDriver.On("PutFile", "file", file).Return("", nil).Once()
  path, err := Storage()

  assert.Equal(t, "", path)
  assert.Nil(t, err)

  mockStorage.AssertExpectations(t)
  mockDriver.AssertExpectations(t)
}

```

## Mock facades.Validation

```go
import (
  "testing"

  "github.com/goravel/framework/testing/mock"
  "github.com/stretchr/testify/assert"

  "goravel/app/facades"
)

func Validation() string {
  validator, _ := facades.Validation().Make(map[string]string{
    "a": "b",
  }, map[string]string{
    "a": "required",
  })
  errors := validator.Errors()

  return errors.One("a")
}

func TestValidation(t *testing.T) {
  mockFactory := mock.Factory()
  mockValidation := mockFactory.Validation()
  mockValidator := mockFactory.ValidationValidator()
  mockErrors := mockFactory.ValidationErrors()
  mockValidation.On("Make", map[string]string{
    "a": "b",
  }, map[string]string{
    "a": "required",
  }).Return(mockValidator, nil).Once()
  mockValidator.On("Errors").Return(mockErrors).Once()
  mockErrors.On("One", "a").Return("error").Once()
  err := Validation()

  assert.Equal(t, "error", err)

  mockValidation.AssertExpectations(t)
  mockValidator.AssertExpectations(t)
  mockErrors.AssertExpectations(t)
}
```

## Mock facades.View

```go
import (
  "testing"

  "github.com/goravel/framework/testing/mock"
  "github.com/stretchr/testify/assert"
  
  "goravel/app/facades"
)

func View() bool {
  return facades.View().Exists("welcome.tmpl")
}

func TestView(t *testing.T) {
  mockFactory := mock.Factory()
  mockView := mockFactory.View()
	mockView.On("Exists", "welcome.tmpl").Return(true).Once()

	assert.True(t, View())

	mockView.AssertExpectations(t)
}
```
