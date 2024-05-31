# Session

[[toc]]

## Introduction

Sessions help you to store user information across multiple requests, giving you experience of stateful application with stateless HTTP protocol. User information is stored on the persistent server side. Goravel provides a unified Interface for interacting with different persistent storage mechanisms.

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

## Add Custom Session Drivers

### Implementing The Driver

To implement a custom session driver, you need to implement the `contracts/session/driver` interface. The interface requires you to implement several methods:

- `Close`: close method is typically used to close the connection to the session storage. It is mostly used for file-based sessions.
- `Destroy`: destroy method is used to delete the session data from the storage for the given session ID.
- `Gc`: gc method is used to delete all data that is older than the given session lifetime.
- `Open`: open method is typically used for file-based sessions. It is used to open the session storage.
- `Read`: read method is used to read the session data from the storage for the given session ID.
- `Write`: write method is used to write the session data to the storage for the given session ID.

### Registering The Driver

After implementing the driver, you need to register it in Goravel. You can do this using `Extend` method of the `facades.Session` facade. You should call the `Extend` method in the `boot` method of your service provider:

```go
import "github.com/goravel/framework/contracts/session"

facades.Session().Extend("custom", func() session.Driver {
	return &CustomDriver{}
})
```

Once the driver is registered, you can use it by setting the `driver` option in the session configuration file to `custom` or by setting the `SESSION_DRIVER` environment variable to `custom`.
