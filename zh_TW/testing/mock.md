# 模擬

[[toc]]

## 描述

Goravel 的所有功能都是通過 `facades` 實現的，所有的 `facades` 都由接口組成。 因此使用來自 [stretchr/testify](http://github.com/stretchr/testify) 的模擬功能，Goravel 能提供卓越的測試體驗。

## 模擬 facades.App

```go
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

## 模擬 facades.Artisan

```go
import "github.com/goravel/framework/testing/mock"

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

## 模擬 facades.Auth

```go
import (
  "testing"

  "github.com/goravel/framework/http"
  "github.com/goravel/framework/testing/mock"
  "github.com/stretchr/testify/assert"
  "github.com/goravel/framework/facades"
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

## 模擬 facades.Cache

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

## 模擬 facades.Config

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

## 模擬 facades.Crypt

```go
import (
  "testing"

  "github.com/goravel/framework/facades"
  "github.com/goravel/framework/testing/mock"
  "github.com/stretchr/testify/assert"
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

## 模擬 facades.Event

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

## 模擬 facades.Gate

```go
import (
  "testing"

  "github.com/goravel/framework/facades"
  "github.com/goravel/framework/testing/mock"
  "github.com/stretchr/testify/assert"
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

## 模擬 facades.Grpc

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

## 模擬 facades.Hash

```go
import (
  "errors"
  "testing"

  "github.com/goravel/framework/testing/mock"
  "github.com/stretchr/testify/assert"
  "google.golang.org/grpc"
  "github.com/goravel/framework/facades"
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

## 模擬 facades.Lang

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

## 模擬 facades.Log

`facades.Log()` 沒有實現模擬，而是使用 `fmt` 代替了實際的日誌輸出，便於測試過程中調試。

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

## 模擬 facades.Mail

```go
import "github.com/goravel/framework/testing/mock"

func Mail() error {
  return facades.Mail().From(mail.From{Address: "example@example.com", Name: "example"}).
    To([]string{"example@example.com"}).
    Content(mail.Content{Subject: "主旨", Html: "<h1>你好 Goravel</h1>"}).
    Send()
}

func TestMail(t *testing.T) {
  mockFactory := mock.Factory()
  mockMail := mockFactory.Mail()
  mockMail.On("From", mail.From{Address: "example@example.com", Name: "example"}).Return(mockMail)
  mockMail.On("To", []string{"example@example.com"}).Return(mockMail)
  mockMail.On("Content", mail.Content{Subject: "主旨", Html: "<h1>你好 Goravel</h1>"}).Return(mockMail)
  mockMail.On("Send").Return(nil)

  assert.Nil(t, Mail())

  mockMail.AssertExpectations(t)
}
```

## 模擬 facades.Orm

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

## 模擬 facades.Queue

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

## 模擬 facades.Storage

```go
import (
  "context"
  "testing"

  "github.com/goravel/framework/filesystem"
  "github.com/goravel/framework/testing/mock"
  "github.com/goravel/framework/facades"
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

## 模擬 facades.Validation

```go
import (
  "testing"

  "github.com/goravel/framework/testing/mock"
  "github.com/stretchr/testify/assert"
  "github.com/goravel/framework/facades"
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

## 模擬 facades.View

```go
import (
  "testing"

  "github.com/goravel/framework/testing/mock"
  "github.com/stretchr/testify/assert"
  "github.com/goravel/framework/facades"
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
