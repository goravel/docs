# Mock

## Description

All functions of Goravel are implemented using `facades`, and all `facades` are made up of interfaces. So with the mock fucntion of [stretchr/testify](http://github.com/stretchr/testify), Goravel can provide an excellent testing experience.

## Mock facades.Cache

```go
func Cache() string {
	if err := facades.Cache.Put("name", "goravel", 1*time.Minute); err != nil {
		fmt.Println("cache.put.error", err)
	}

	return facades.Cache.Get("name", "test").(string)
}

func TestCache(t *testing.T) {
	mockCache := goravelmock.Cache()
	mockCache.On("Put", "name", "goravel", mock.Anything).Return(nil).Once()
	mockCache.On("Get", "name", "test").Return("hwb").Once()

	res := Cache()
	assert.Equal(t, res, "hwb")
}
```

## Mock facades.Config

```go
func Config() string {
	return facades.Config.GetString("app.name", "test")
}

func TestConfig(t *testing.T) {
	mockConfig := goravelmock.Config()
	mockConfig.On("GetString", "app.name", "test").Return("hwb").Once()

	res := Config()
	assert.Equal(t, res, "hwb")
}
```

## Mock facades.Artisan

```go
func ArtisanCall() {
	facades.Artisan.Call("list")
}

func TestArtisan(t *testing.T) {
	mockArticle := goravelmock.Artisan()
	mockArticle.On("Call", "list").Once()

	assert.NotPanics(t, func() {
		ArtisanCall()
	})
}
```

## Mock facades.Orm

```go
func Orm() error {
	if err := facades.Orm.Query().Create(&Test{}); err != nil {
		return err
	}

	var test Test
	return facades.Orm.Query().Where("id = ?", 1).Find(&test)
}

func TestOrm(t *testing.T) {
	mockOrm, mockOrmDB, _ := goravelmock.Orm()
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
	mockOrm, _, mockOrmTransaction := goravelmock.Orm()
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
func Event() error {
	return facades.Event.Job(&events.TestEvent{}, []contractevent.Arg{
		{Type: "string", Value: "abcc"},
		{Type: "int", Value: 1234},
	}).Dispatch()
}

func TestEvent(t *testing.T) {
	mockEvent, mockTask := goravelmock.Event()
	mockEvent.On("Job", mock.Anything, mock.Anything).Return(mockTask).Once()
	mockTask.On("Dispatch").Return(nil).Once()

	assert.Nil(t, Event())
}
```

## Mock facades.Log

`facades.Log` doesn't implement mock, use `fmt` instead of the actual log output, easy to debug during testing.

```go
func Log() {
	facades.Log.Debug("test")
}

func TestLog(t *testing.T) {
	goravelmock.Log()

	Log()
}
```

## Mock facades.Mail

```go
func Mail() error {
	return facades.Mail.From(mail.From{Address: "example@example.com", Name: "example"}).
		To([]string{"example@example.com"}).
		Content(mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).
		Send()
}

func TestMail(t *testing.T) {
	mockMail := goravelmock.Mail()
	mockMail.On("From", mail.From{Address: "example@example.com", Name: "example"}).Return(mockMail)
	mockMail.On("To", []string{"example@example.com"}).Return(mockMail)
	mockMail.On("Content", mail.Content{Subject: "Subject", Html: "<h1>Hello Goravel</h1>"}).Return(mockMail)
	mockMail.On("Send").Return(nil)

	assert.Nil(t, Mail())
}
```

## Mock facades.Queue

```go
func Queue() error {
	return facades.Queue.Job(&jobs.TestSyncJob{}, []queue.Arg{}).Dispatch()
}

func TestQueue(t *testing.T) {
	mockQueue, mockTask := goravelmock.Queue()
	mockQueue.On("Job", mock.Anything, mock.Anything).Return(mockTask).Once()
	mockTask.On("Dispatch").Return(nil).Once()

	assert.Nil(t, Queue())
}
```
