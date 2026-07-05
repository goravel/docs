# Mock

[[toc]]

## Tavsifi

Goravelning barcha funksiyalari `facades` yordamida amalga oshiriladi va barcha `facades` interfeyslardan tashkil topgan. Shunday qilib, [stretchr/testify](http://github.com/stretchr/testify) dan olingan mock funksiyasi bilan Goravel ajoyib sinov tajribasini taqdim eta oladi.

## Mock facades.AI

```go
import (
  "testing"

  "github.com/goravel/framework/testing/mock"
  mocksai "github.com/goravel/framework/mocks/ai"
  "github.com/stretchr/testify/assert"

  "goravel/app/facades"
)

func AI() (string, error) {
  conversation, err := facades.AI().Agent(myAgent)
  if err != nil {
    return "", err
  }

  resp, err := conversation.Prompt("Hello")
  if err != nil {
    return "", err
  }

  return resp.Content(), nil
}

func TestAI(t *testing.T) {
  mockFactory := mock.Factory()
  mockAI := mockFactory.AI()
  mockConversation := mocksai.NewConversation(t)
  mockResponse := mocksai.NewAgentResponse(t)
  mockAI.EXPECT().Agent(mock.Anything).Return(mockConversation, nil).Once()
  mockConversation.EXPECT().Prompt("Hello").Return(mockResponse, nil).Once()
  mockResponse.EXPECT().Content().Return("mock response").Once()

  content, err := AI()
  assert.Nil(t, err)
  assert.Equal(t, "mock response", content)
}
```

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

## Mock facades.DB

```go
import (
  "testing"

  "github.com/goravel/framework/contracts/database/db"
  "github.com/goravel/framework/testing/mock"
  mocksdb "github.com/goravel/framework/mocks/database/db"
  "github.com/stretchr/testify/assert"

  "goravel/app/facades"
)

func DB() error {
  _, err := facades.DB().Table("users").Insert(map[string]any{"name": "Goravel"})
  return err
}

func TestDB(t *testing.T) {
  mockFactory := mock.Factory()
  mockDB := mockFactory.DB()
  mockQuery := mocksdb.NewQuery(t)
  mockDB.EXPECT().Table("users").Return(mockQuery).Once()
  mockQuery.EXPECT().Insert(mock.Anything).Return(&db.Result{RowsAffected: 1}, nil).Once()

  assert.Nil(t, DB())
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

`facades.Log()` mock-ni amalga oshirmaydi, sinov paytida nosozliklarni tuzatish uchun haqiqiy log chiqishi o'rniga `fmt` dan foydalaning.

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

## Mock facades.Testing

```go
import (
  "testing"

  "github.com/goravel/framework/testing/mock"
  mockstesting "github.com/goravel/framework/mocks/testing"
  "github.com/stretchr/testify/assert"

  "goravel/app/facades"
)

func Testing() bool {
  return facades.Testing().Docker().Ready()
}

func TestTesting(t *testing.T) {
  mockFactory := mock.Factory()
  mockTesting := mockFactory.Testing()
  mockDocker := mockstesting.NewDocker(t)
  mockTesting.EXPECT().Docker().Return(mockDocker).Once()
  mockDocker.EXPECT().Ready().Return(true).Once()

  assert.True(t, Testing())
}
```

## Mock facades.Session

```go
import (
  "testing"

  "github.com/goravel/framework/testing/mock"
  mockssession "github.com/goravel/framework/mocks/session"
  "github.com/stretchr/testify/assert"

  "goravel/app/facades"
)

func Session() error {
  driver, err := facades.Session().Driver("redis")
  if err != nil {
    return err
  }

  _, err = facades.Session().BuildSession(driver)
  return err
}

func TestSession(t *testing.T) {
  mockFactory := mock.Factory()
  mockSession := mockFactory.Session()
  mockDriver := mockssession.NewDriver(t)
  mockSession.EXPECT().Driver("redis").Return(mockDriver, nil).Once()
  mockSession.EXPECT().BuildSession(mockDriver).Return(nil, nil).Once()

  assert.Nil(t, Session())
}
```

## Mock facades.Schema

```go
import (
  "testing"

  contractschema "github.com/goravel/framework/contracts/database/schema"
  "github.com/goravel/framework/testing/mock"
  "github.com/stretchr/testify/assert"

  "goravel/app/facades"
)

func Schema() error {
  return facades.Schema().Create("users", func(blueprint contractschema.Blueprint) {
    blueprint.ID()
    blueprint.String("name")
  })
}

func TestSchema(t *testing.T) {
  mockFactory := mock.Factory()
  mockSchema := mockFactory.Schema()
  mockSchema.EXPECT().Create("users", mock.Anything).Return(nil).Once()

  assert.Nil(t, Schema())
}
```

## Mock facades.Schedule

```go
import (
  "testing"

  "github.com/goravel/framework/testing/mock"
  mocksschedule "github.com/goravel/framework/mocks/schedule"
  "github.com/stretchr/testify/assert"

  "goravel/app/facades"
)

func Schedule() error {
  return facades.Schedule().Command("my-command").EveryMinute()
}

func TestSchedule(t *testing.T) {
  mockFactory := mock.Factory()
  mockSchedule := mockFactory.Schedule()
  mockEvent := mocksschedule.NewEvent(t)
  mockSchedule.EXPECT().Command("my-command").Return(mockEvent).Once()
  mockEvent.EXPECT().EveryMinute().Return(nil).Once()

  assert.Nil(t, Schedule())
}
```

## Facades.Route soxtasini yaratish

```go
import (
  "testing"

  "github.com/goravel/framework/http"
  "github.com/goravel/framework/testing/mock"
  "github.com/stretchr/testify/assert"

  "goravel/app/facades"
)

func Route() {
  facades.Route().Get("/api/users", func(ctx http.Context) http.Response {
    return ctx.Response().Success().Json(http.Json{
      "users": []string{"Goravel"},
    })
  })
}

func TestRoute(t *testing.T) {
  mockFactory := mock.Factory()
  mockRoute := mockFactory.Route()
  mockRoute.EXPECT().Get("/api/users", mock.Anything).Once()

  assert.NotPanics(t, func() {
    Route()
  })
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
