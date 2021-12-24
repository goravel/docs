## Introduction

Goravel provides an expandable cache module. This module can be operated using `facades.Cache`.

## Configuration

Make all custom configurations in `config/cache.php`. Different cache drivers are allowed to be configured. By default, `redis` is used. You can also customize the driver by entering the configuration file to view it.

## Available Cache Drivers

Name      |  Description
-------- | -------------
`redis`  |  Redis drive
`custom` |  Custom drive

## Cache Usage

### Retrieving Items From The Cache

```
value := facades.Cache.Get("goravel", func() interface{} {
    return "default"
})
```

You can pass a `func` as the default value. If the specified data does not exist in the cache, the result of `func` will be returned. The transitive closure method allows you to obtain default values from the database or other external services. Note the closure structure `func() interface()`.

```
value := facades.Cache.Get("goravel", func() interface{} {
    return "default"
})
```

### Checking For Item Existence

```
value := facades.Cache.Has("goravel")
```

### Retrieve & Store

Sometimes you may want to get a piece of data from the cache, and when the requested cache item does not exist, the program can store a default value for you.

```
value, err := facades.Cache.Remember("goravel", 5 * time.Second, func() interface{} {
    return "goravel"
})
```

If the data you want does not exist in the cache, the closure passed to the `Remember` method will be executed, and then the result will be returned and placed in the cache.

You can use the `RememberForever` method to retrieve data from the cache or store it permanently:

```
value, err := facades.Cache.RememberForever("goravel", func() interface{} {
    return "default"
})
```

### Retrieve & Delete

```
value := facades.Cache.Pull("goravel", "default")
```

### Storing Items In The Cache

```
err := facades.Cache.Put("goravel", "value", 5 * time.Second)
```

If the expiration time of the cache is set to `0`, the cache will be valid forever:

```
err := facades.Cache.Put("goravel", "value", 0)
```

### Store If Not Present

The `Add` method will only store data that does not exist in the cache. If the storage is successful, it will return `true`, otherwise it will return `false`:

```
res := facades.Cache.Add("goravel", "value", 5 * time.Second)
```

### Storing Items Forever

The `Forever` method can be used to store data persistently in the cache. Because these data will not expire, they must be manually deleted from the cache through the `Forget` method:

```
res := facades.Cache.Forever("goravel", "value")
```

### Removing Items From The Cache

```
res := facades.Cache.Forget("goravel")
```

You can use the `Flush` method to clear all caches:

```
res := facades.Cache.Flush()
```

## Adding Custom Cache Drivers

### Configuration

If you want to define a completely custom driver, you can specify the `custom` driver type in the `config/cache.php` configuration file.
Then include a `via` option to implement a `framework\contracts\cache\Store` structure:

```
//config/cache.php
"stores": map[string]interface{}{
    "redis": map[string]interface{}{
        "driver":     "redis",
        "connection": "default",
    },
    "custom": map[string]interface{}{
        "driver": "custom",
        "via":    Logger{},//自定义驱动
    },
},
```

### Write Driver

Implement the `framework\contracts\cache\Store` interface and configure it to `config/cache.go`. Files can be stored in the `app/extensions` folder (modifiable).

```
//framework\contracts\cache\Store
package cache

import "time"

type Store interface {
    //Get Retrieve an item from the cache by key.
    Get(key string, defaults interface{}) interface{}
	
    //Has Determine if an item exists in the cache.
    Has(key string) bool
	
    //Put Store an item in the cache for a given number of seconds.
    Put(key string, value interface{}, seconds time.Duration) error
	
    //Pull Retrieve an item from the cache and delete it.
    Pull(key string, defaults interface{}) interface{}
	
    //Add Store an item in the cache if the key does not exist.
    Add(key string, value interface{}, seconds time.Duration) bool
	
    //Remember Get an item from the cache, or execute the given Closure and store the result.
    Remember(key string, ttl time.Duration, callback func() interface{}) (interface{}, error)
	
    //RememberForever Get an item from the cache, or execute the given Closure and store the result forever.
    RememberForever(key string, callback func() interface{}) (interface{}, error)
	
    //Forever Store an item in the cache indefinitely.
    Forever(key string, value interface{}) bool
	
    //Forget Remove an item from the cache.
    Forget(key string) bool
	
    //Flush Remove all items from the cache.
    Flush() bool
}
```