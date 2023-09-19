# Service Providers

[[toc]]

## Introduction

The most important thing in the kernel boot operation is to load the `Service Providers`. All `Service Providers` under the application are configured in the `providers` array in  `config/app.go`.

First, the kernel will call the `Register` method of all service providers. After all service providers have been registered, the kernel will call the `Boot` method of all `Service Providers` again.

The `Service Providers` are the key in the life cycle of Goravel. They enable the framework to contain various components, such as routing, database, queue, cache, etc.

You can also customize your own provider, it can be stored under `app/providers` and registered in the `providers` array in `config/app.go`.

The framework comes with a blank service provider `app/providers/app_service_provider.go` where you can implement simple boot logic. In bigger projects, you have the option to create new service providers for more precise control.

<CommentService/>

