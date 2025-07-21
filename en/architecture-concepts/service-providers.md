# Service Providers

[[toc]]

## Introduction

The most important thing in the kernel boot operation is to load the `ServiceProvider`. All `ServiceProvider` under the application are configured in the `providers` array in  `config/app.go`.

First, the kernel will call the `Register` method of all service providers. After all service providers have been registered, the kernel will call the `Boot` method of all `ServiceProvider` again.

The `ServiceProvider` is the key to the life cycle of Goravel. They enable the framework to contain various components, such as routing, database, queue, cache, etc.

You can also customize your own provider, it can be stored under `app/providers` and registered in the `providers` array in `config/app.go`.

The framework comes with a blank service provider `app/providers/app_service_provider.go` where you can implement simple boot logic. In bigger projects, you have the option to create new service providers for more precise control.

ServiceProvider provides an optional method `Relationship() binding.Relationship`, used to declare the dependency relationship of the current ServicerProvider, the ServiceProvider that sets this method will not depend on the registration order, and the ServiceProvider that does not set it will be registered last, for example:

```go
type ServiceProvider struct {
}

func (r *ServiceProvider) Relationship() binding.Relationship {
	return binding.Relationship{
		Bindings: []string{
			BindingSession,
		},
		Dependencies: []string{
			binding.Config,
		},
		ProvideFor: []string{
			binding.Cache,
		},
	}
}

func (r *ServiceProvider) Register(app foundation.Application) {}

func (r *ServiceProvider) Boot(app foundation.Application) {}
```


