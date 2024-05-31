# Session

[[toc]]

## Introduction

Sessions enable you to store user information across multiple requests, providing a stateful experience within the inherently stateless HTTP protocol. This user information is stored persistently on the server side. Goravel offers a unified interface for interacting with various persistent storage mechanisms.

## Register Middleware

By default, Goravel does not start a session automatically. However, it provides middleware to start a session. You can register the session middleware in the `app/http/kernel.go` file to apply it to all routes, or you can add it to specific routes:

```go
import (
	"github.com/goravel/framework/contracts/http"
	"github.com/goravel/framework/session/middleware"
)

...

func (kernel Kernel) Middleware() []http.Middleware {
	return []http.Middleware{
		middleware.StartSession(),
	}
}
```

## Configuration

The session configuration file is located at `config/session.go`. Be sure to review the options available to you in this file.

The driver option specifies the session storage mechanism. Goravel supports the following session drivers:

- `file`: sessions are stored in `storage/framework/sessions` directory.

## Interacting With The Session

### Retrieving Data

You can access session instance via the `Request` instance. You can use the `Get` method of the session instance to retrieve data from the session. If the value does not exist, `nil` will be returned.

```go
value := ctx.Request().Session().Get("key")
```

You may also pass a default value as the second argument to the `Get` method. This value will be returned if the specified key does not exist in the session:

```go
value := ctx.Request().Session().Get("key", "default")
```

### Retrieving All Data

If you would like to retrieve all data from the session, you may use the `All` method:

```go
data := ctx.Request().Session().All()
```

### Retrieving a Subset of Data

If you would like to retrieve a subset of the session data, you may use the `Only` method:

```go
data := ctx.Request().Session().Only("username", "email")
```

### Determining If An Item Exists In The Session

To determine if an item is present in the session, you may use the `Has` method. The `Has` method returns `true` if the item is present and is not `nil`:

```go
if ctx.Request().Session().Has("user") {
    //
}
```

To determine if an item is present and even if it is `nil`, you may use the `Exists` method:

```go
if ctx.Request().Session().Exists("user") {
    //
}
```

To determine if an item is not present in the session, you may use the `Missing` method:

```go
if ctx.Request().Session().Missing("user") {
    //
}
```

### Storing Data

You may use the `Put` method to store data in the session. You may pass a key and a value to the `Put` method:

```go
ctx.Request().Session().Put("key", "value")
```

### Retrieving & Deleting Data

If you would like to retrieve an item from the session and then delete it, you may use the `Pull` method:

```go
value := ctx.Request().Session().Pull("key")
```

### Deleting Data

The `Forget` method can be used to remove a piece of data from the session. If you would like to remove all data from the session, you may use the `Flush` method:

```go
ctx.Request().Session().Forget("username", "email")

ctx.Request().Session().Flush()
```

### Regenerating The Session ID

Regenerating the session ID is often done in order to prevent malicious users from exploiting a session fixation attack on your application. You may regenerate the session ID using the `Regenerate` method:

```go
ctx.Request().Session().Regenerate()
```

If you would like to regenerate the session ID and forget all data that was in the session, you may use the `Invalidate` method:

```go
ctx.Request().Session().Invalidate()
```

### Flash Data

Flash data is session data that will only be available during the subsequent HTTP request, and then will be deleted. Flash data is useful for storing temporary messages such as status messages. You may use the `Flash` method to store flash data in the session:

```go
ctx.Request().Session().Flash("status", "Task was successful!")
```

### Reflash Data

If you would like to keep your flash data around for an additional request, you may use the `Reflash` method:

```go
ctx.Request().Session().Reflash()
```

### Keep specific flash data

If you would like to keep specific flash data around for an additional request, you may use the `Keep` method:

```go
ctx.Request().Session().Keep("status", "username")
```

### Keep data for immediate use

If you would like to keep specific data around for immediate use, you may use the `Now` method:

```go
ctx.Request().Session().Now("status", "Task was successful!")
```

## Interacting With Session Manager

### Building A Custom Session

To build a custom session, use the `Session` facade. The `Session` facade provides the `BuildSession` method, which takes a driver instance and an optional session ID if you want to specify a custom session ID:

```go
import "github.com/goravel/framework/facades"

session := facades.Session().BuildSession(driver, "sessionID")
```

### Retrieving driver instance

To retrieve the driver instance from the session manager, use the `Driver` method. It accepts an optional driver name; if not provided, it returns the default driver instance:

```go
driver, err := facades.Session().Driver("file")
```

### Starting A New Session

To start a new session, use the `Start` method:

```go
session := facades.Session().BuildSession(driver)
session.Start()
```

### Saving The Session Data

To save the session data, use the `Save` method:

```go
session := facades.Session().BuildSession(driver)
session.Start()
session.Save()
```

### Attaching the Session to the Request

To attach the session to the request, use the `SetSession` method:

```go
session := facades.Session().BuildSession(driver)
session.Start()
ctx.Request().SetSession(session)
```

### Checking if request has session

To check if the request has a session, use the `HasSession` method:

```go
if ctx.Request().HasSession() {
    //
}
```

## Add Custom Session Drivers

### Implementing The Driver

To implement a custom session driver, driver must implement the `contracts/session/driver` interface.

```go
// Driver is the interface for Session handlers.
type Driver interface {
	// Close closes the session handler.
	Close() error
	// Destroy destroys the session with the given ID.
	Destroy(id string) error
	// Gc performs garbage collection on the session handler with the given maximum lifetime.
	Gc(maxLifetime int) error
	// Open opens a session with the given path and name.
	Open(path string, name string) error
	// Read reads the session data associated with the given ID.
	Read(id string) (string, error)
	// Write writes the session data associated with the given ID.
	Write(id string, data string) error
}
```

### Registering The Driver

After implementing the driver, you need to register it in Goravel. You can do this using `Extend` method of the `facades.Session` facade. You should call the `Extend` method in the `boot` method of your service provider:

```go
import "github.com/goravel/framework/contracts/session"

facades.Session().Extend("custom", func() session.Driver {
	return &CustomDriver{}
})
```

Once the driver is registered, you can use it by setting the `driver` option in the session configuration file to `custom` or by setting the `SESSION_DRIVER` environment variable to `custom`.
