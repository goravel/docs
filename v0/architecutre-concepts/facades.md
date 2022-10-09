# Facades

[[toc]]

## Introduction

`facades` provide a "static" interface for the core functionality of the application. Goravel comes with a lot of `facades`, you can use more of the functions, and can provide a more flexible, more elegant, and easy-to-test syntax when using it.

All `facades` of Goravel are defined under `github.com/goravel/framework/support/facades`. We can easily use `facades`:

```
import "github.com/goravel/framework/support/facades"

facades.Route.Run(facades.Config.GetString("app.host"))
```

## How Facades Work

`facades` are generally instantiated in the `Register` or `Boot` stage of `ServerProvider`, or they can be assigned directly, which can be flexibly distinguished according to different usage scenarios.

For example, if you just want to use `facades` to instantiate an object, you can assign it directly.

```
var Artisan = &console.Application{}
```

If the `facades` use other `facades`, then instantiate them in the `Boot` phase of the `ServerProvider`:

```
func (database *ServiceProvider) Register() {
  app := Application{}
  facades.DB = app.Init()
}
```

In other cases, it can be instantiated in the `Register` phase of `ServerProvider`:

```
func (config *ServiceProvider) Register() {
  app := Application{}
  facades.Config = app.Init()
}
```

## Facade Class Reference

| Facade  | Action                                                  |
| ------- | ------------------------------------------------------- |
| Artisan | [Artisan Console](../digging-deeper/artisan-console.md) |
| Config  | [Configuration](../getting-started/configuration.md)    |
| DB      | [ORM](../ORM/getting-started.md)                        |
| Route   | [Roueting](../the-basics/routing.md)                    |
