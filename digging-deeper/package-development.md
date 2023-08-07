# Package Development

[[toc]]

## Introduction

Packages are the primary way of adding functionality to Goravel, these packages may have routes, controllers, and configuration specifically intended to enhance a Goravel application. This guide primarily covers the development of those packages that are Goravel specific. There is an example for building a third package: [goravel/example-package](https://github.com/goravel/example-package)

## Creating A Package

You can use easily create a package template using the Artisan command:

```
go run . artisan make:package sms
```

The created files are saved by default in the root `packages` folder, you can use `--root` option to customize:

```
go run . artisan make:package sms --root=pkg
```

## Service Providers

[Service providers](../architecutre-concepts/service-providers.md) are the connection point between your package and Goravel, it usually located in the root of the package: `service_provider.go`. A service provider is responsible for binding things into Goravel's service container and informing Goravel where to load package resources.

## Using

Register the `ServiceProvider` in the package to `config/app.go::providers`, then export `facades` to the application, detailed steps can refer to [goravel/example-package](https://github.com/goravel/example-package).

## Resources

### Configuration

Typically, you will need to publish your package's configuration file to the application's `config` directory. This will allow users of your package to easily override your default configuration options. To allow your configuration files to be published, call the `Publishes` method from the `Boot` method of your service provider, the first parameter of this method is the package name, and the second parameter is the mapping between the current package file path and the project path:

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "config/sms.go": app.ConfigPath("sms.go"),
  })
}
```

### Routes

If there are [routes](../the-basics/routing.md) in your package, you can use `app.MakeRoute()` to resolve `facades.Route()`, then add the routes to project:

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
	route := app.MakeRoute()
	route.Get("sms", ***)
}
```

### Migrations

If there are [migrations](../orm/migrations.md) in your package, you can publish them by the `Publishes` method:

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "migrations": app.DatabasePath("migrations"),
  })
}
```

## Commands

You can register `Artisan` command by the `Commands` method, you can run the commands using [Artisan CLI](../digging-deeper/artisan-console.md) after registering them.

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
	app.Commands([]console.Command{
		commands.NewSmsCommand(),
	})
}
```

## Public Assets

Your package may have assets such as JavaScript, CSS, and images. To publish these assets to the application's `public` directory, use the service provider's `Publishes` method:

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "public": app.PublicPath("vendor"),
  })
}
```

## Publishing File Groups

You may want to publish groups of package assets and resources separately. For instance, you might want to allow your users to publish your package's configuration files without being forced to publish your package's assets. You may do this by "tagging" them when calling the `Publishes` method from a package's service provider. For example, let's use tags to define two publish groups for the `sms` package (`sms-config` and `sms-migrations`) in the boot method of the package's service provider:

```go
func (receiver *ServiceProvider) Boot(app foundation.Application) {
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "config/sms.go": app.ConfigPath("sms.go"),
  }, "sms-config")
  app.Publishes("github.com/goravel/example-package", map[string]string{
    "migrations": app.DatabasePath("migrations"),
  }, "sms-migrations")
}
```

## Publish Resources

In the project, You can publish the resources registered in a package using `vendor:publish` Artisan command:

```
go run . artisan vendor:publish --package={You package name}
```

The command can use the following options:

| Option Name  | Alias  | Action           |
| -----------  | ------ | -------------- |
| --package    | -p     | Package name, can be a remote package: `github.com/goravel/example-package`, can also be a local package: `./packages/example-package`, note that when using a local package name, it needs to start with `./`.     |
| --tag        | -t     | Resource group     |
| --force      | -f     | Overwrite any existing files     |
| --existing   | -e     | Publish and overwrite only the files that have already been published     |
